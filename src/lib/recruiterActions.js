import { supabase } from './supabase'

async function sendApprovalEmail(email, firstName, feeFloor, feeCeiling) {
  const tierSentence = feeFloor != null && feeCeiling != null
    ? feeFloor === feeCeiling
      ? `<p style="font-size:15px;line-height:1.7;margin-bottom:16px">Based on your experience, you've been approved at our <strong>${feeFloor}%</strong> tier.</p>`
      : `<p style="font-size:15px;line-height:1.7;margin-bottom:16px">Based on your experience, you've been approved with a fee range of <strong>${feeFloor}–${feeCeiling}%</strong>, giving you flexibility to price competitively while reflecting your seniority.</p>`
    : ''

  const subject = `You're in — Welcome to Vetted TA, ${firstName} 🎉`
  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
      <h1 style="font-size:22px;font-weight:700;margin-bottom:16px">You're in, ${firstName}! 🎉</h1>
      <p style="font-size:15px;line-height:1.7;margin-bottom:16px">
        Congratulations — you are now live on the Vetted TA platform as a <strong>Founding Member</strong>.
      </p>
      ${tierSentence}
      <p style="font-size:15px;line-height:1.7;margin-bottom:28px">
        As a Founding Member, we want to make your first placement on Vetted TA as rewarding as possible. Announce your membership on LinkedIn this week, tag @VettedTA, and reply to this email with the link — and we'll give you <strong>50% off your platform fee on your first placement</strong>. That's our way of saying thank you for being one of the first.
      </p>
      <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin-bottom:28px">
        <p style="font-size:12px;font-weight:600;color:#6b7280;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em">Copy &amp; paste for LinkedIn</p>
        <p style="font-size:14px;line-height:1.7;color:#111827;margin:0;white-space:pre-line">I've just been accepted as a Founding Member on @VettedTA.

If you're hiring and need an experienced recruiter, my services are now available through the platform.

What that actually means for you: the role is exclusive to me (no competing agencies racing the same brief), payment sits in escrow and releases in milestones, and fees are capped at 8-12%, not the usual 20%+.

If you're a hiring manager, founder, or know someone who is, take a look:
www.vettedta.com</p>
      </div>
      <a href="https://www.vettedta.com/recruiter/dashboard"
         style="display:inline-block;background:#4f46e5;color:#ffffff;padding:13px 26px;
                border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
        Go to your Dashboard →
      </a>
      <p style="margin-top:40px;font-size:13px;color:#6b7280">The Vetted TA Team</p>
    </div>`
  try {
    const { error } = await supabase.functions.invoke('send-email', { body: { to: email, subject, html } })
    if (error) { console.error('send-email error:', error); return false }
    return true
  } catch (e) {
    console.error('send-email exception:', e)
    return false
  }
}

/**
 * Approves a recruiter, stores fee tier, sends the founding-member email, and logs the action.
 *
 * @param {object} profile      - recruiter_profiles row (must include id, user_id, first_name, last_name)
 * @param {string} adminUserId  - auth.uid() of the admin performing the action
 * @param {number} feeFloor     - assigned floor (8, 10, or 12)
 * @param {number} feeCeiling   - assigned ceiling (8, 10, or 12; must be >= feeFloor)
 * @returns {{ success: boolean, emailSent?: boolean, warning?: string, error?: string }}
 */
export async function approveRecruiter(profile, adminUserId, feeFloor, feeCeiling) {
  const { error: updateError } = await supabase
    .from('recruiter_profiles')
    .update({ status: 'approved', fee_floor: feeFloor ?? null, fee_ceiling: feeCeiling ?? null })
    .eq('id', profile.id)

  if (updateError) return { success: false, error: updateError.message }

  // Resolve email — accept direct .email, PostgREST join result, or fetch if missing
  let email = profile.email ?? profile.users?.email ?? null
  if (!email && profile.user_id) {
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('email')
      .eq('id', profile.user_id)
      .maybeSingle()
    if (userErr) console.error('Failed to fetch recruiter email from users table:', userErr)
    email = userRow?.email ?? null
  }

  const firstName = profile.first_name ?? 'Recruiter'
  const fullName  = [profile.first_name, profile.last_name].filter(Boolean).join(' ')

  let emailSent = false
  let warning   = null

  if (!email) {
    console.error('Approval email not sent — email missing for profile id:', profile.id)
    warning = `Recruiter approved but notification email could not be sent — email address missing for ${fullName}.`
  } else {
    emailSent = await sendApprovalEmail(email, firstName, feeFloor, feeCeiling)
    if (!emailSent) {
      warning = `Recruiter approved successfully but the notification email failed to send. Please notify them manually at ${email}.`
    }
  }

  if (adminUserId) {
    try {
      await supabase.from('admin_actions_log').insert({
        admin_user_id:        adminUserId,
        recruiter_profile_id: profile.id,
        action:               'approve',
        note:                 `Approved ${fullName}`,
      })
    } catch (e) {
      console.warn('admin_actions_log insert failed:', e)
    }
  }

  return warning
    ? { success: true, emailSent, warning }
    : { success: true, emailSent: true }
}
