// =====================================================
// SECURE CAMP REGISTRATION - Supabase Edge Function
// =====================================================
// Handles direct registration of official relief camps
// 
// SECURITY:
// 1. Verifies JWT token
// 2. Checks admin_users table
// 3. Creates camp record with validation
// 4. Creates audit log
// =====================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CampRegistrationRequest {
  campData: {
    camp_name: string
    district: string
    address: string
    latitude?: number
    longitude?: number
    total_capacity: number
    current_occupancy?: number
    contact_number: string
    facilities?: string[]
    status: string
    managed_by?: string
    description?: string
  }
  reason?: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user JWT using service role client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify admin
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: You are not an authorized admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: CampRegistrationRequest = await req.json()
    const { campData, reason } = body

    if (!campData) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: campData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate required fields
    const required = ['camp_name', 'district', 'address', 'total_capacity', 'contact_number', 'status']
    const missing = required.filter(field => !campData[field as keyof typeof campData])
    
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Add metadata
    const campWithMetadata = {
      ...campData,
      created_by: user.id,
      current_occupancy: campData.current_occupancy || 0
    }

    // Create the camp
    const { data: newCamp, error: campError } = await supabaseAdmin
      .from('camps')
      .insert([campWithMetadata])
      .select()
      .single()

    if (campError) {
      console.error('Camp creation error:', campError)
      return new Response(
        JSON.stringify({ error: `Failed to create camp: ${campError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        admin_email: user.email,
        action: 'REGISTER_CAMP',
        table_name: 'camps',
        record_id: newCamp.id,
        record_snapshot: newCamp,
        reason: reason || 'Direct camp registration by admin',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    console.log(`[AUDIT] Admin ${user.email} registered new camp: ${newCamp.camp_name}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Camp registered successfully',
        camp: newCamp
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
