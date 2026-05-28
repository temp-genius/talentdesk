import { supabase } from './supabase'

function fmt(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

// All emails are fire-and-forget from the client — errors are logged, never rethrown.
async function sendEmail({ to, subject, html, replyTo }) {
  console.log('[email] SENDING EMAIL', {
    to,
    subject,
    htmlPreview: html?.slice(0, 200) + (html?.length > 200 ? '…' : ''),
  })
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, replyTo },
    })
    console.log('[email] EMAIL RESULT', { data, error })
    if (error || data?.error) {
      console.error('[email] EMAIL ERROR', {
        error,
        dataError: data?.error,
        message: error?.message ?? data?.error,
      })
    }
  } catch (err) {
    console.error('[email] EMAIL ERROR (exception)', {
      message: err?.message,
      err,
    })
  }
}

// ─── Shared layout helpers ────────────────────────────────────────────────────

function header() {
  return `
    <tr>
      <td style="background-color:#0f2d5e;border-radius:12px 12px 0 0;padding:28px 32px;">
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
          Talent<span style="color:#93c5fd;">Desk</span>
        </p>
      </td>
    </tr>`
}

function footer() {
  return `
    <tr>
      <td style="background-color:#f9fafb;border-radius:0 0 12px 12px;padding:20px 32px;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151;">TalentDesk</p>
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          The retained recruitment platform. This is an automated message — please do not reply directly to this email.
        </p>
      </td>
    </tr>`
}

function wrap(bodyRows) {
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
        ${header()}
        ${bodyRows}
        ${footer()}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ─── Offer acceptance email ───────────────────────────────────────────────────

export function sendOfferEmail(candidateEmail, {
  jobTitle,
  agreedSalary,
  currency = 'EUR',
  startDate,
  acceptanceToken,
}) {
  console.log('[email] OFFER EMAIL TRIGGERED', { candidateEmail, acceptanceToken })
  const origin     = window.location.origin
  const acceptUrl  = `${origin}/offer/${acceptanceToken}`
  const declineUrl = `${origin}/offer/${acceptanceToken}?action=decline`

  const startLine = startDate
    ? `<tr>
         <td style="font-size:14px;color:#6b7280;padding-top:8px;">Start date</td>
         <td align="right" style="font-size:14px;font-weight:600;color:#111827;padding-top:8px;">
           ${new Date(startDate).toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' })}
         </td>
       </tr>`
    : ''

  const html = wrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;">
          You've received a job offer
        </h1>
        <p style="margin:0 0 28px;font-size:15px;color:#6b7280;">
          Congratulations! Please review the details below and let us know your decision.
        </p>

        <!-- Role card -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#f9fafb;border-radius:8px;margin-bottom:28px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;
                      text-transform:uppercase;letter-spacing:1px;">Role</p>
            <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">${jobTitle}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:14px;color:#6b7280;">Agreed salary</td>
                <td align="right" style="font-size:20px;font-weight:700;color:#111827;">
                  ${fmt(agreedSalary, currency)}
                </td>
              </tr>
              ${startLine}
            </table>
          </td></tr>
        </table>

        <!-- Accept button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr><td>
            <a href="${acceptUrl}"
               style="display:block;background-color:#0f2d5e;color:#ffffff;text-align:center;
                      font-size:17px;font-weight:700;padding:18px 24px;border-radius:8px;
                      text-decoration:none;letter-spacing:0.2px;">
              Accept Offer
            </a>
          </td></tr>
        </table>

        <!-- Decline button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td>
            <a href="${declineUrl}"
               style="display:block;background-color:#ffffff;color:#6b7280;text-align:center;
                      font-size:17px;font-weight:600;padding:17px 24px;border-radius:8px;
                      text-decoration:none;border:2px solid #e5e7eb;">
              Decline Offer
            </a>
          </td></tr>
        </table>

        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
          By clicking Accept Offer you confirm your agreement to the terms above.
          If the buttons don't work, paste this link into your browser:<br>
          <a href="${acceptUrl}" style="color:#0f2d5e;word-break:break-all;">${acceptUrl}</a>
        </p>
      </td>
    </tr>`)

  return sendEmail({
    to:      candidateEmail,
    subject: `Your job offer — ${jobTitle}`,
    html,
  })
}

// ─── Milestone payment released ───────────────────────────────────────────────

export function sendMilestoneNotification(recruiterEmail, milestoneNumber, jobTitle, amount, currency = 'EUR') {
  const names = { 1: 'CV Submission', 2: 'Interviews Stage', 3: 'Offer Accepted' }
  const name  = names[milestoneNumber] ?? `Milestone ${milestoneNumber}`

  const html = wrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          Milestone payment released
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          A milestone payment has been released for your assignment.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Role</p>
            <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">${jobTitle}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">
              Milestone ${milestoneNumber} — ${name}
            </p>
            <p style="margin:0;font-size:26px;font-weight:700;color:#16a34a;">${fmt(amount, currency)}</p>
          </td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:#6b7280;">
          Log in to TalentDesk to view your payment history and assignment status.
        </p>
      </td>
    </tr>`)

  return sendEmail({
    to:      recruiterEmail,
    subject: `Milestone ${milestoneNumber} payment released — ${jobTitle}`,
    html,
  })
}

// ─── New message notification ─────────────────────────────────────────────────

export function sendNewMessageNotification(recipientEmail, senderName, messagePreview, jobTitle) {
  const origin      = window.location.origin
  const messagesUrl = `${origin}/messages`
  const preview     = messagePreview.length > 120
    ? messagePreview.slice(0, 120) + '…'
    : messagePreview

  const html = wrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          New message from ${senderName}
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          You have a new message regarding <strong>${jobTitle}</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#f9fafb;border-radius:8px;
                      border-left:4px solid #0f2d5e;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0;font-size:14px;color:#374151;font-style:italic;line-height:1.6;">
              "${preview}"
            </p>
          </td></tr>
        </table>
        <a href="${messagesUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;">
          View Message
        </a>
      </td>
    </tr>`)

  return sendEmail({
    to:      recipientEmail,
    subject: `New message from ${senderName} — ${jobTitle}`,
    html,
  })
}

// ─── Job started (recruiter notification) ─────────────────────────────────────

export function sendJobStartedNotification(recruiterEmail, jobTitle, companyName, shortlistSize) {
  const origin      = window.location.origin
  const dashboardUrl = `${origin}/recruiter/dashboard`

  const companyLine = companyName
    ? `<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">
         Hiring company: <strong style="color:#111827;">${companyName}</strong>
       </p>`
    : ''

  const html = wrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          New job assignment
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          A hiring company has started a new retained engagement with you on TalentDesk.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#eff6ff;border-radius:8px;
                      border:1px solid #bfdbfe;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;
                      text-transform:uppercase;letter-spacing:1px;">Role</p>
            <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">${jobTitle}</p>
            ${companyLine}
            <p style="margin:0;font-size:14px;color:#6b7280;">
              Shortlist required: <strong style="color:#111827;">${shortlistSize} candidates</strong>
            </p>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;">
          Log in to TalentDesk to view your assignment and start adding candidates to the shortlist.
        </p>
        <a href="${dashboardUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;">
          View Assignment
        </a>
      </td>
    </tr>`)

  return sendEmail({
    to:      recruiterEmail,
    subject: `New assignment: ${jobTitle}`,
    html,
  })
}

// ─── Shortlist approved (recruiter notification) ──────────────────────────────

export function sendShortlistApprovedNotification(recruiterEmail, jobTitle) {
  const origin      = window.location.origin
  const dashboardUrl = `${origin}/recruiter/dashboard`

  const html = wrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          Shortlist approved!
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          Great news — the hiring manager has approved your shortlist for
          <strong>${jobTitle}</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#f0fdf4;border-radius:8px;
                      border:1px solid #bbf7d0;margin-bottom:24px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">
              Milestone 1 — CV Submission
            </p>
            <p style="margin:0;font-size:15px;font-weight:600;color:#16a34a;">
              Payment is now releasing
            </p>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;">
          The interview stage is now underway. Log in to TalentDesk to track candidate progress.
        </p>
        <a href="${dashboardUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;">
          View Assignment
        </a>
      </td>
    </tr>`)

  return sendEmail({
    to:      recruiterEmail,
    subject: `Shortlist approved — ${jobTitle}`,
    html,
  })
}

// ─── Shortlist submitted (hiring manager notification) ────────────────────────

export function sendShortlistSubmittedNotification(hmEmail, recruiterName, jobTitle, candidateCount) {
  const origin     = window.location.origin
  const reviewUrl  = `${origin}/jobs`
  const plural     = candidateCount !== 1 ? 's' : ''

  const html = wrap(`
    <tr>
      <td style="background-color:#ffffff;padding:32px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
          Shortlist ready for review
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#6b7280;">
          <strong>${recruiterName}</strong> has submitted a shortlist of
          ${candidateCount} candidate${plural} for <strong>${jobTitle}</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#eff6ff;border-radius:8px;
                      border:1px solid #bfdbfe;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Role</p>
            <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;">${jobTitle}</p>
            <p style="margin:0;font-size:14px;color:#374151;">
              ${candidateCount} candidate${plural} submitted by ${recruiterName}
            </p>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;color:#374151;">
          Please log in to TalentDesk to review the candidates and approve the shortlist
          to release Milestone 1 payment.
        </p>
        <a href="${reviewUrl}"
           style="display:inline-block;background-color:#0f2d5e;color:#ffffff;
                  font-size:14px;font-weight:600;padding:12px 24px;
                  border-radius:8px;text-decoration:none;">
          Review Shortlist
        </a>
      </td>
    </tr>`)

  return sendEmail({
    to:      hmEmail,
    subject: `Shortlist submitted for review — ${jobTitle}`,
    html,
  })
}
