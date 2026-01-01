// =====================================================
// SECURE CAMP APPROVAL - Supabase Edge Function
// =====================================================
// Handles approval/rejection of camp requests
// 
// SECURITY:
// 1. Verifies JWT token
// 2. Checks admin_users table
// 3. Updates camp_request status
// 4. Creates audit log
// 5. Optionally creates camp record
// =====================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ApprovalRequest {
  requestId: string
  action: 'approve' | 'reject'
  rejectionReason?: string
  campData?: any // For approve action, includes camp details
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

    const body: ApprovalRequest = await req.json()
    const { requestId, action, rejectionReason, campData } = body

    if (!requestId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: requestId, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "approve" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the camp request
    const { data: campRequest, error: fetchError } = await supabaseAdmin
      .from('camp_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !campRequest) {
      return new Response(
        JSON.stringify({ error: 'Camp request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (campRequest.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Request already ${campRequest.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: any = null

    if (action === 'approve') {
      // Create camp and update request
      if (!campData) {
        return new Response(
          JSON.stringify({ error: 'Camp data required for approval' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create the camp
      const { data: newCamp, error: campError } = await supabaseAdmin
        .from('camps')
        .insert([campData])
        .select()
        .single()

      if (campError) {
        return new Response(
          JSON.stringify({ error: `Failed to create camp: ${campError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update request status
      const { error: updateError } = await supabaseAdmin
        .from('camp_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', requestId)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to update request: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      result = { camp: newCamp, action: 'approved' }

    } else {
      // Reject
      if (!rejectionReason || !rejectionReason.trim()) {
        return new Response(
          JSON.stringify({ error: 'Rejection reason is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: rejectError } = await supabaseAdmin
        .from('camp_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          rejection_reason: rejectionReason
        })
        .eq('id', requestId)

      if (rejectError) {
        return new Response(
          JSON.stringify({ error: `Failed to reject request: ${rejectError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      result = { action: 'rejected' }
    }

    // Create audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        admin_email: user.email,
        action: action === 'approve' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
        table_name: 'camp_requests',
        record_id: requestId,
        record_snapshot: campRequest,
        reason: rejectionReason || `Approved and created camp`,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    console.log(`[AUDIT] Admin ${user.email} ${action}d camp request ${requestId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Camp request ${action}d successfully`,
        result
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
