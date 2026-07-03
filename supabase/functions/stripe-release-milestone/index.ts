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

// Direct fetch to send-email Edge Function — more reliable than supabase.functions.invoke()
// when calling one Edge Function from another in the same project.
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const supabaseUrl     = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const url             = `${supabaseUrl}/functions/v1/send-email`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ to, subject, html }),
    })
    if (!res.ok) {
      console.error('[stripe-release-milestone] send-email returned', res.status, await res.text())
    }
  } catch (err) {
    console.error('[stripe-release-milestone] send-email fetch failed:', err)
  }
}

function fmtCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

function emailHeader(): string {
  return `
    <tr>
      <td style="background-color:#0f2d5e;border-radius:12px 12px 0 0;padding:28px 32px;">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
          Vetted TA
        </p>
      </td>
    </tr>`
}

function emailFooter(): string {
  return `
    <tr>
      <td style="background-color:#f9fafb;border-radius:0 0 12px 12px;padding:20px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151;">Vetted TA</p>
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          The retained recruitment platform. This is an automated message — please do not reply directly to this email.
        </p>
      </td>
    </tr>`
}

function emailWrap(bodyRows: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        ${emailHeader()}
        ${bodyRows}
        ${emailFooter()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const MILESTONE_NAMES: Record<number, string> = {
  1: 'CV Submission',
  2: 'Interview Stage',
  3: 'Offer Accepted',
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

    // Get assignment (recruiter_id + job_id for notification)
    const { data: assignment } = await supabase
      .from('job_recruiter_assignments')
      .select('recruiter_id, job_id')
      .eq('id', resolvedAssignmentId)
      .single()

    // Get recruiter profile (stripe account + name + user_id for email lookup)
    const { data: recruiterProfile } = await supabase
      .from('recruiter_profiles')
      .select('stripe_account_id, first_name, user_id')
      .eq('id', assignment?.recruiter_id)
      .single()

    // Get recruiter email — service_role bypasses RLS on users table
    const { data: recruiterUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', recruiterProfile?.user_id)
      .single()

    // Get job title for notification
    const { data: job } = await supabase
      .from('jobs')
      .select('title')
      .eq('id', assignment?.job_id)
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

    // Fire-and-forget notification — does not block the response
    const recruiterEmail = recruiterUser?.email
    if (recruiterEmail) {
      const milestoneName  = MILESTONE_NAMES[milestone_number as number] ?? `Milestone ${milestone_number}`
      const jobTitle       = job?.title ?? 'your role'
      const firstName      = recruiterProfile?.first_name ?? 'there'
      const appUrl         = Deno.env.get('PUBLIC_APP_URL') ?? 'https://vettedta.com'
      const dashboardUrl   = `${appUrl}/recruiter/dashboard`
      const currency       = milestone.currency ?? 'EUR'

      let subject: string
      let html: string

      if (transferId) {
        // Transfer succeeded — green payment card
        const amountFormatted = fmtCurrency(milestone.transfer_amount, currency)
        subject = `Payment released — ${milestoneName} · ${jobTitle}`
        html = emailWrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          Milestone payment released
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          Hi ${firstName}, a payment has been released for your assignment.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;
                      text-transform:uppercase;letter-spacing:1px;">Role</p>
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">${jobTitle}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">
              Milestone ${milestone_number} — ${milestoneName}
            </p>
            <p style="margin:0;font-size:26px;font-weight:700;color:#16a34a;">${amountFormatted}</p>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;">
          Log in to Vetted TA to view your payment history and assignment status.
        </p>
        <a href="${dashboardUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;">
          View Dashboard
        </a>
      </td>
    </tr>`)
      } else {
        // No Stripe account — payment held, prompt recruiter to connect
        subject = `Payment held — connect Stripe to receive your funds`
        html = emailWrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          Payment ready — action required
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          Hi ${firstName}, a milestone payment has been approved for your assignment on
          <strong>${jobTitle}</strong>, but we cannot transfer it yet.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#fffbeb;border-radius:8px;border:1px solid #fde68a;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#92400e;">
              Your Stripe account is not connected
            </p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              Milestone ${milestone_number} — ${milestoneName} — has been approved and your payment is being held.
              Connect your Stripe account to receive the funds immediately.
            </p>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;">
          Log in to Vetted TA and go to your profile settings to connect Stripe.
        </p>
        <a href="${dashboardUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;">
          Connect Stripe
        </a>
      </td>
    </tr>`)
      }

      // Fire-and-forget — errors are logged but do not affect the milestone release response
      sendEmail(recruiterEmail, subject, html)
        .catch((err: unknown) => console.error('[stripe-release-milestone] notification failed:', err))
    }

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
