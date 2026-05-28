import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId, recruiterId } = await req.json()

    if (!jobId || !recruiterId) {
      return new Response(
        JSON.stringify({ error: 'jobId and recruiterId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-04-10',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const [{ data: job }, { data: recruiter }] = await Promise.all([
      supabase.from('jobs').select('salary_min, salary_max, currency').eq('id', jobId).single(),
      supabase.from('recruiter_profiles').select('preferred_fee_percentage').eq('id', recruiterId).single(),
    ])

    if (!job || !recruiter) {
      return new Response(
        JSON.stringify({ error: 'Job or recruiter not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const maxSal = (job.salary_max ?? job.salary_min ?? 0) as number
    const feeRate = (recruiter.preferred_fee_percentage ?? 0) as number
    const totalFee = Math.round(maxSal * (feeRate / 100))
    // Stripe requires amounts in smallest currency unit (e.g. cents)
    const amountInSmallestUnit = Math.round(totalFee * 100)

    if (amountInSmallestUnit < 50) {
      return new Response(
        JSON.stringify({ error: 'Amount too small for Stripe processing (minimum 50 cents)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: (job.currency ?? 'EUR').toLowerCase(),
      metadata: { jobId, recruiterId },
      automatic_payment_methods: { enabled: true },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
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
