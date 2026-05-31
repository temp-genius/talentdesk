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
    const { assignment_id, milestone_number } = await req.json()

    if (!assignment_id || !milestone_number) {
      return new Response(
        JSON.stringify({ error: 'assignment_id and milestone_number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the milestone
    const { data: milestone, error: msErr } = await supabase
      .from('milestones')
      .select('id, charge_amount, currency')
      .eq('job_recruiter_assignment_id', assignment_id)
      .eq('milestone_number', milestone_number)
      .single()

    if (msErr || !milestone) {
      return new Response(
        JSON.stringify({ error: 'Milestone not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const chargeAmount = milestone.charge_amount
    if (!chargeAmount || chargeAmount <= 0) {
      // Nothing to charge — mark as charged and return
      await supabase.from('milestones')
        .update({ charge_status: 'charged', charge_triggered_at: new Date().toISOString() })
        .eq('id', milestone.id)
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the job's hiring manager user_id via the assignment
    const { data: assignment } = await supabase
      .from('job_recruiter_assignments')
      .select('job_id')
      .eq('id', assignment_id)
      .single()

    const { data: job } = await supabase
      .from('jobs')
      .select('user_id, currency')
      .eq('id', assignment?.job_id)
      .single()

    // Get HM Stripe details
    const { data: hmProfile } = await supabase
      .from('hiring_company_profiles')
      .select('stripe_customer_id, stripe_payment_method_id')
      .eq('user_id', job?.user_id)
      .single()

    if (!hmProfile?.stripe_customer_id || !hmProfile?.stripe_payment_method_id) {
      return new Response(
        JSON.stringify({ error: 'Hiring manager has no saved payment method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currency = (milestone.currency ?? job?.currency ?? 'EUR').toLowerCase()
    const amountCents = Math.round(chargeAmount * 100)

    // Create off-session PaymentIntent
    const paymentIntent = await stripePost('payment_intents', {
      amount: amountCents,
      currency,
      customer: hmProfile.stripe_customer_id,
      payment_method: hmProfile.stripe_payment_method_id,
      confirm: 'true',
      off_session: 'true',
      'metadata[assignment_id]': assignment_id,
      'metadata[milestone_number]': milestone_number,
    })

    // Update milestone
    await supabase.from('milestones')
      .update({
        charge_status: 'charged',
        stripe_payment_intent_id: paymentIntent.id as string,
        charge_triggered_at: new Date().toISOString(),
      })
      .eq('id', milestone.id)

    return new Response(
      JSON.stringify({ success: true, paymentIntentId: paymentIntent.id }),
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
