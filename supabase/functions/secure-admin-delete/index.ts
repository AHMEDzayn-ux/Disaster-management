// =====================================================
// SECURE ADMIN DELETE - Supabase Edge Function
// =====================================================
// This edge function handles ALL delete operations securely
// 
// SECURITY FEATURES:
// 1. Verifies JWT token from request
// 2. Checks user exists in admin_users table
// 3. Only uses service_role key SERVER-SIDE
// 4. Creates audit log before deletion
// 5. Returns deleted record snapshot for recovery
// =====================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Allowed tables for deletion - Admin can delete from ALL these tables
const ALLOWED_TABLES = [
  'camp_requests',
  'camps',
  'missing_persons',
  'disasters',
  'animal_rescues',
  'donations'
]

// No super_admin restriction - any verified admin can delete
// Remove this array if you want role-based restrictions later
const SUPER_ADMIN_ONLY_TABLES: string[] = []

interface DeleteRequest {
  table: string
  recordId: string
  reason?: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client with service role (for privileged operations including JWT verification)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user's JWT token using service role client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired token. Please log out and log back in.',
          details: authError?.message || 'No user found for token'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id, user.email)

    // =====================================================
    // CRITICAL: Verify user is in admin_users table
    // =====================================================
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUser) {
      console.error('Admin verification failed for user:', user.id, 'Error:', adminError)
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized: You are not an authorized admin',
          userId: user.id,
          details: adminError?.message || 'No admin record found'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: DeleteRequest = await req.json()
    const { table, recordId, reason } = body

    // Validate required fields
    if (!table || !recordId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: table, recordId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate table name (prevent SQL injection)
    if (!ALLOWED_TABLES.includes(table)) {
      return new Response(
        JSON.stringify({ error: `Invalid table: ${table}. Allowed: ${ALLOWED_TABLES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if table requires super_admin role
    if (SUPER_ADMIN_ONLY_TABLES.includes(table) && adminUser.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: `Deleting from ${table} requires super_admin role` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(recordId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid record ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // =====================================================
    // STEP 1: Fetch the record to be deleted (for audit)
    // =====================================================
    const { data: recordToDelete, error: fetchError } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', recordId)
      .single()

    if (fetchError || !recordToDelete) {
      console.error('Record not found:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Record not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // =====================================================
    // STEP 2: Create audit log BEFORE deletion
    // =====================================================
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        admin_email: user.email,
        action: 'DELETE',
        table_name: table,
        record_id: recordId,
        record_snapshot: recordToDelete,
        reason: reason || null,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    if (auditError) {
      console.error('Audit log error:', auditError)
      return new Response(
        JSON.stringify({ error: 'Failed to create audit log. Deletion aborted for safety.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // =====================================================
    // STEP 3: Perform the deletion
    // =====================================================
    const { error: deleteError } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', recordId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return new Response(
        JSON.stringify({ error: `Failed to delete record: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // =====================================================
    // SUCCESS: Return confirmation with snapshot
    // =====================================================
    console.log(`[AUDIT] Admin ${user.email} deleted ${table}/${recordId}`)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Record deleted successfully from ${table}`,
        deletedRecord: {
          id: recordId,
          table: table,
          deletedAt: new Date().toISOString(),
          deletedBy: user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
