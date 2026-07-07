const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RECIPIENTS = [
  { firstName: 'James',    email: 'james@igaintalent.com'                  },
  { firstName: 'Asia',     email: 'asia.dossi@outlook.com'                 },
  { firstName: 'Eddie',    email: 'edward.jwkiely@gmail.com'               },
  { firstName: 'Jonathan', email: 'jonathanhazlett1@gmail.com'             },
  { firstName: 'Rose',     email: 'rosecho19950513@outlook.com'            },
  { firstName: 'Priya',    email: 'prmehta628@gmail.com'                   },
  { firstName: 'Colin',    email: 'cbyrne7229@outlook.com'                 },
  { firstName: 'Sosuke',   email: 'sinoue7575@gmail.com'                   },
  { firstName: 'Garima',   email: 'sethgarima2203@gmail.com'               },
  { firstName: 'Dan',      email: 'recruitment@dgrecruitment.services'     },
  { firstName: 'Lec',      email: 'lec.tsang@gmail.com'                    },
  { firstName: 'Michaela', email: 'michaelasvbdv@gmail.com'                },
  { firstName: 'Keith',    email: 'keitholoughlin1@gmail.com'              },
]

const JOB_ID    = '55b30363-7a31-43ce-8f1b-37ff55c5d68f'
const JOB_TITLE = 'Senior Software Engineer (FullStack)'
const SECTOR    = 'Technology'
const JOB_URL   = `https://www.vettedta.com/jobs/${JOB_ID}`

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
    console.error('[notify-specific-recruiters] send-email returned', res.status, await res.text())
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
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;
                      text-transform:uppercase;letter-spacing:1px;">Role</p>
            <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">${jobTitle}</p>
            <p style="margin:0;font-size:13px;color:#6b7280;">${sector}</p>
          </td></tr>
        </table>
        <a href="${jobUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;margin-bottom:24px;">
          View Role
        </a>
        <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.5;">
          You are receiving this because your profile includes specialisms in ${sector}.
          Log in to submit a proposal before the role fills.
        </p>
      </td>
    </tr>`)
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const subject = `New ${SECTOR} role on Vetted TA — ${JOB_TITLE}`

    let notified = 0
    for (let i = 0; i < RECIPIENTS.length; i++) {
      const { firstName, email } = RECIPIENTS[i]
      const html = buildMatchEmail(firstName, JOB_TITLE, SECTOR, JOB_URL)
      const ok = await sendEmail(email, subject, html)
      if (ok) notified++
      if (i < RECIPIENTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`[notify-specific-recruiters] notified ${notified}/${RECIPIENTS.length}`)

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
