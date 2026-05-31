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
    const { user_id, return_url, refresh_url } = await req.json()

    if (!user_id || !return_url || !refresh_url) {
      return new Response(
        JSON.stringify({ error: 'user_id, return_url, and refresh_url are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if recruiter already has a Stripe Connect account
    const { data: recruiterProfile } = await supabase
      .from('recruiter_profiles')
      .select('stripe_account_id')
      .eq('user_id', user_id)
      .single()

    let accountId: string = recruiterProfile?.stripe_account_id ?? ''

    if (!accountId) {
      // Create a new Stripe Express account
      const account = await stripePost('accounts', {
        type: 'express',
        'capabilities[transfers][requested]': 'true',
        'metadata[user_id]': user_id,
      })
      accountId = account.id as string

      // Store the account ID immediately
      await supabase
        .from('recruiter_profiles')
        .update({ stripe_account_id: accountId })
        .eq('user_id', user_id)
    }

    // Create an account link for onboarding
    const accountLink = await stripePost('account_links', {
      account: accountId,
      refresh_url,
      return_url,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({ url: accountLink.url }),
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
