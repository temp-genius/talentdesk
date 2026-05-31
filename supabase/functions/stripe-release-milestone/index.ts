import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function stripePost(path: string, params: Record<string, string | number>): Promise<Record<string, unknown>> {
  const body = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    body.append(key, String(value))
  }
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error((data as { error?: { message?: string } }).error?.message ?? `Stripe error ${res.status}`)
  return data as Record<string, unknown>
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { assignment_id, offer_id, milestone_number } = await req.json()

    if (!milestone_number) {
      return new Response(
        JSON.stringify({ error: 'milestone_number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Resolve assignment_id from offer_id if needed
    let resolvedAssignmentId: string = assignment_id
    if (!resolvedAssignmentId && offer_id) {
      const { data: offer } = await supabase
        .from('offers')
        .select('job_recruiter_assignment_id')
        .eq('id', offer_id)
        .single()
      resolvedAssignmentId = offer?.job_recruiter_assignment_id
    }

    if (!resolvedAssignmentId) {
      return new Response(
        JSON.stringify({ error: 'assignment_id or offer_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch milestone
    const { data: milestone, error: msErr } = await supabase
      .from('milestones')
      .select('id, transfer_amount, currency')
      .eq('job_recruiter_assignment_id', resolvedAssignmentId)
      .eq('milestone_number', milestone_number)
      .single()

    if (msErr || !milestone) {
      return new Response(
        JSON.stringify({ error: 'Milestone not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get recruiter Stripe Connect account
    const { data: assignment } = await supabase
      .from('job_recruiter_assignments')
      .select('recruiter_id')
      .eq('id', resolvedAssignmentId)
      .single()

    const { data: recruiterProfile } = await supabase
      .from('recruiter_profiles')
      .select('stripe_account_id')
      .eq('id', assignment?.recruiter_id)
      .single()

    const stripeAccountId: string | null = recruiterProfile?.stripe_account_id ?? null

    let transferId: string | null = null

    if (stripeAccountId && milestone.transfer_amount && milestone.transfer_amount > 0) {
      const currency = (milestone.currency ?? 'EUR').toLowerCase()
      const transferAmountCents = Math.round(milestone.transfer_amount * 100)

      const transfer = await stripePost('transfers', {
        amount: transferAmountCents,
        currency,
        destination: stripeAccountId,
        'metadata[assignment_id]': resolvedAssignmentId,
        'metadata[milestone_number]': milestone_number,
      })
      transferId = transfer.id as string
    }

    // Mark milestone as released
    await supabase.from('milestones')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
        ...(transferId ? { stripe_transfer_id: transferId } : {}),
      })
      .eq('id', milestone.id)

    return new Response(
      JSON.stringify({ success: true, transferId, held: !stripeAccountId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
