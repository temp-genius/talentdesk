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
    const { user_id, email } = await req.json()

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: 'user_id and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if HM already has a Stripe customer
    const { data: hcp } = await supabase
      .from('hiring_company_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single()

    let customerId: string = hcp?.stripe_customer_id ?? ''

    if (!customerId) {
      const customer = await stripePost('customers', {
        email,
        'metadata[user_id]': user_id,
      })
      customerId = customer.id as string
    }

    // Create a SetupIntent for saving the card off-session
    const setupIntent = await stripePost('setup_intents', {
      customer: customerId,
      usage: 'off_session',
      'payment_method_types[]': 'card',
    })

    return new Response(
      JSON.stringify({
        customerId,
        setupIntentClientSecret: setupIntent.client_secret,
      }),
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
