import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const url            = `${supabaseUrl}/functions/v1/send-email`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ to, subject, html }),
  })
  if (!res.ok) {
    console.error('[notify-recruiters-for-job] send-email returned', res.status, await res.text())
    return false
  }
  return true
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

function roleCard(jobTitle: string, sector: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;
                  text-transform:uppercase;letter-spacing:1px;">Role</p>
        <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">${jobTitle}</p>
        <p style="margin:0;font-size:13px;color:#6b7280;">${sector}</p>
      </td></tr>
    </table>`
}

function viewRoleButton(jobUrl: string): string {
  return `
    <a href="${jobUrl}"
       style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
              font-size:14px;font-weight:600;padding:12px 24px;
              border-radius:8px;text-decoration:none;margin-bottom:24px;">
      View Role
    </a>`
}

// ── "New role published" email ────────────────────────────────────────
function buildMatchEmail(firstName: string, jobTitle: string, sector: string, jobUrl: string): string {
  return emailWrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          New ${sector} role on Vetted TA
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          Hi ${firstName}, a new role has just been published that matches your specialisms.
        </p>
        ${roleCard(jobTitle, sector)}
        ${viewRoleButton(jobUrl)}
        <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">
          You are receiving this because your profile includes specialisms in ${sector}.
          Log in to submit a proposal before the role fills.
        </p>
      </td>
    </tr>`)
}

// ── "Reminder — role still open" email ───────────────────────────────
function buildNudgeEmail(firstName: string, jobTitle: string, sector: string, jobUrl: string): string {
  return emailWrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          This role is still open
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          Hi ${firstName}, this role is still accepting proposals and your specialisms
          are a strong match. Don't miss out.
        </p>
        ${roleCard(jobTitle, sector)}
        ${viewRoleButton(jobUrl)}
        <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">
          Submit your proposal before this role fills.
          Log in to Vetted TA to apply.
        </p>
      </td>
    </tr>`)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { job_id, sector, job_title, nudge } = await req.json()
    const isNudge = nudge === true

    if (!job_id || !sector || !job_title) {
      return new Response(
        JSON.stringify({ error: 'job_id, sector, and job_title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Step 1: resolve specialism_category IDs for this sector
    const { data: categories } = await supabase
      .from('specialism_categories')
      .select('id')
      .eq('sector', sector)

    const categoryIds = (categories ?? []).map((c: { id: string }) => c.id)
    if (!categoryIds.length) {
      return new Response(
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: get distinct recruiter_profile_ids that have a specialism in those categories
    const { data: specialisms } = await supabase
      .from('recruiter_specialisms')
      .select('recruiter_profile_id')
      .in('specialism_category_id', categoryIds)

    const profileIds = [
      ...new Set((specialisms ?? []).map((s: { recruiter_profile_id: string }) => s.recruiter_profile_id))
    ]
    if (!profileIds.length) {
      return new Response(
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: fetch approved recruiter profiles — service_role bypasses RLS
    const { data: profiles } = await supabase
      .from('recruiter_profiles')
      .select('first_name, user_id')
      .in('id', profileIds)
      .eq('status', 'approved')

    const userIds = (profiles ?? []).map((p: { first_name: string; user_id: string }) => p.user_id)
    if (!userIds.length) {
      return new Response(
        JSON.stringify({ success: true, notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: fetch emails — service_role bypasses RLS on users table
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds)

    const emailMap: Record<string, string> = Object.fromEntries(
      (users ?? []).map((u: { id: string; email: string }) => [u.id, u.email])
    )

    const appUrl = Deno.env.get('PUBLIC_APP_URL') ?? 'https://vettedta.com'
    const jobUrl = `${appUrl}/jobs/${job_id}`
    const subject = isNudge
      ? `Reminder — proposals still open: ${job_title}`
      : `New ${sector} role on Vetted TA — ${job_title}`

    // Send sequentially with a small delay to avoid rate-limiting send-email
    const recipients = (profiles ?? []).filter(
      (p: { first_name: string; user_id: string }) => emailMap[p.user_id]
    )
    let notified = 0
    for (let i = 0; i < recipients.length; i++) {
      const p = recipients[i]
      const html = isNudge
        ? buildNudgeEmail(p.first_name ?? 'there', job_title, sector, jobUrl)
        : buildMatchEmail(p.first_name ?? 'there', job_title, sector, jobUrl)
      const ok = await sendEmail(emailMap[p.user_id], subject, html)
      if (ok) notified++
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    console.log(`[notify-recruiters-for-job] notified ${notified}/${recipients.length} recruiters for job ${job_id} (nudge=${isNudge})`)

    return new Response(
      JSON.stringify({ success: true, notified }),
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
