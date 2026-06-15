import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import AdminNav from '../../components/admin/AdminNav'

// ── Constants ─────────────────────────────────────────────────────────────────

const REJECT_REASONS = [
  'Does not meet experience requirements',
  'LinkedIn profile does not match claimed experience',
  'Insufficient market coverage',
  'Duplicate application',
  'Other',
]

const STATUS_DOT = {
  pending:        'bg-amber-400',
  approved:       'bg-green-500',
  rejected:       'bg-red-500',
  info_requested: 'bg-blue-500',
}

const CAPACITY_LABELS = {
  open_to_new: 'Open to new roles',
  nearly_full: 'Nearly at capacity',
  full:        'At full capacity',
}

const CAREER_DNA_LABELS = {
  agency:  'Agency Recruiter',
  inhouse: 'In-House TA',
  hybrid:  'Both — Agency and In-House',
}

const CLIENT_TYPE_LABELS = {
  startup: 'Startups', scaleup: 'Scale-ups', enterprise: 'Enterprise',
  sme: 'SME', public_sector: 'Public Sector',
}

const DEFAULT_INFO_MESSAGE =
  'Thank you for applying to Vetted TA. Before we can complete our review we need a little more information. Please update your profile with the following and resubmit for review:'

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(dateStr) {
  if (!dateStr) return '—'
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

function feeDisplay(val) {
  if (val == null) return '—'
  const nums = val.toString().split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n)).sort((a, b) => a - b)
  if (nums.length === 0) return '—'
  if (nums.length === 1) return `${nums[0]}%`
  return `${nums[0]}–${nums[nums.length - 1]}%`
}

// ── Modal components ──────────────────────────────────────────────────────────

function ModalShell({ onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function ApproveModal({ onConfirm, onCancel, loading }) {
  return (
    <ModalShell onClose={onCancel}>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Approve this recruiter?</h3>
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to approve this recruiter? They will receive an email and gain full platform access.
      </p>
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className="bg-green-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Approving…' : 'Approve'}
        </button>
      </div>
    </ModalShell>
  )
}

function RejectModal({ onConfirm, onCancel, loading, error }) {
  const [reason, setReason] = useState('')
  const [notes,  setNotes]  = useState('')
  return (
    <ModalShell onClose={onCancel}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Application</h3>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <select className="input" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Select a reason…</option>
            {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any additional context…"
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className="bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          onClick={() => reason && onConfirm(reason, notes)}
          disabled={loading || !reason}
        >
          {loading ? 'Rejecting…' : 'Reject Application'}
        </button>
      </div>
    </ModalShell>
  )
}

function RequestInfoModal({ onConfirm, onCancel, loading, error }) {
  const [message, setMessage] = useState(DEFAULT_INFO_MESSAGE)
  return (
    <ModalShell onClose={onCancel}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Request More Information</h3>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message to recruiter</label>
        <textarea
          className="input resize-none"
          rows={6}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button
          className="bg-amber-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 transition-colors"
          onClick={() => message.trim() && onConfirm(message)}
          disabled={loading || !message.trim()}
        >
          {loading ? 'Sending…' : 'Send Request'}
        </button>
      </div>
    </ModalShell>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VettingPanel() {
  const { user } = useAuth()

  const [queue,        setQueue]        = useState([])
  const [counts,       setCounts]       = useState({ pending: 0, approvedToday: 0, rejectedThisWeek: 0 })
  const [loadingQueue, setLoadingQueue] = useState(true)

  const [selectedId,     setSelectedId]     = useState(null)
  const [detail,         setDetail]         = useState(null)
  const [loadingDetail,  setLoadingDetail]  = useState(false)

  const [modal,        setModal]        = useState(null) // 'approve' | 'reject' | 'info'
  const [actioning,    setActioning]    = useState(false)
  const [actionError,  setActionError]  = useState('')
  const [emailWarning, setEmailWarning] = useState('')
  const [testingEmail,  setTestingEmail]  = useState(false)
  const [testEmailMsg,  setTestEmailMsg]  = useState('')
  const [testEmailAddr, setTestEmailAddr] = useState('')

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadQueue = useCallback(async () => {
    setLoadingQueue(true)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    const [
      { data: pendingRows },
      { count: pendingCount },
      { count: approvedToday },
      { count: rejectedWeek },
    ] = await Promise.all([
      supabase
        .from('recruiter_profiles')
        .select('id, first_name, last_name, created_at, status')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase
        .from('recruiter_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('admin_actions_log')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'approve')
        .gte('created_at', todayStart.toISOString()),
      supabase
        .from('admin_actions_log')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'reject')
        .gte('created_at', weekAgo),
    ])

    const rows = pendingRows ?? []
    setQueue(rows)
    setCounts({
      pending:          pendingCount    ?? 0,
      approvedToday:    approvedToday   ?? 0,
      rejectedThisWeek: rejectedWeek    ?? 0,
    })
    setLoadingQueue(false)
    return rows
  }, [])

  useEffect(() => { loadQueue() }, [loadQueue])
  useEffect(() => { if (user?.email && !testEmailAddr) setTestEmailAddr(user.email) }, [user])

  async function loadDetail(id) {
    setSelectedId(id)
    setLoadingDetail(true)
    setDetail(null)
    setActionError('')

    const { data } = await supabase
      .from('recruiter_profiles')
      .select(`
        id, user_id, first_name, last_name, bio, linkedin_url, years_experience,
        availability_status, preferred_fee_percentage, career_dna, capacity_status,
        previous_employers, previous_client_types, created_at, status,
        recruiter_specialisms!left(
          specialism_category_id,
          specialism_categories(sector, specialism_name)
        ),
        recruiter_locations!left(country)
      `)
      .eq('id', id)
      .single()

    if (data?.user_id) {
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('email')
        .eq('id', data.user_id)
        .maybeSingle()
      data.email = userRow?.email ?? null
    }

    setDetail(data ?? null)
    setLoadingDetail(false)
  }

  // ── Action helpers ────────────────────────────────────────────────────────

  async function advanceQueue(doneId) {
    const newQueue = await loadQueue()
    const next = newQueue.find(r => r.id !== doneId) ?? newQueue[0] ?? null
    if (next) loadDetail(next.id)
    else { setSelectedId(null); setDetail(null) }
  }

  async function sendEmail(to, subject, html) {
    try {
      const { error } = await supabase.functions.invoke('send-email', { body: { to, subject, html } })
      if (error) {
        console.error('send-email error:', error)
        return false
      }
      return true
    } catch (e) {
      console.error('send-email exception:', e)
      return false
    }
  }

  async function handleTestEmail() {
    if (!testEmailAddr.trim()) return
    setTestingEmail(true)
    setTestEmailMsg('')
    const ok = await sendEmail(
      testEmailAddr.trim(),
      'Vetted TA — Email system test',
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
        <p style="font-size:15px;line-height:1.7">If you received this email, the Vetted TA email system is working correctly.</p>
        <p style="margin-top:24px;font-size:13px;color:#6b7280">The Vetted TA Team</p>
      </div>`
    )
    setTestEmailMsg(ok ? `Test email sent to ${testEmailAddr.trim()}` : 'Test email failed — check Edge Function logs')
    setTestingEmail(false)
  }

  async function logAction(action, note) {
    try {
      await supabase.from('admin_actions_log').insert({
        admin_user_id:        user.id,
        recruiter_profile_id: detail.id,
        action,
        note,
      })
    } catch (e) {
      console.warn('admin_actions_log insert failed:', e)
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function handleApprove() {
    if (!detail) return
    setActioning(true)
    setActionError('')
    setEmailWarning('')

    const { error } = await supabase
      .from('recruiter_profiles')
      .update({ status: 'approved' })
      .eq('id', detail.id)

    if (error) { setActionError(error.message); setActioning(false); return }

    const email     = detail.email
    const firstName = detail.first_name ?? 'Recruiter'
    const fullName  = [detail.first_name, detail.last_name].filter(Boolean).join(' ')

    const approvalSubject = `You're in — Welcome to Vetted TA, ${firstName} 🎉`
    const approvalHtml = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
        <h1 style="font-size:22px;font-weight:700;margin-bottom:16px">You're in, ${firstName}! 🎉</h1>
        <p style="font-size:15px;line-height:1.7;margin-bottom:16px">
          Congratulations — you are now live on the Vetted TA platform as a <strong>Founding Member</strong>.
        </p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:28px">
          As a Founding Member, we want to make your first placement on Vetted TA as rewarding as possible. Announce your membership on LinkedIn this week, tag @VettedTA, and reply to this email with the link — and we'll give you <strong>50% off your platform fee on your first placement</strong>. That's our way of saying thank you for being one of the first.
        </p>
        <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin-bottom:28px">
          <p style="font-size:12px;font-weight:600;color:#6b7280;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em">Copy &amp; paste for LinkedIn</p>
          <p style="font-size:14px;line-height:1.7;color:#111827;margin:0;white-space:pre-line">I've just joined @VettedTA as a Founding Member.

VettedTA is a retained recruitment marketplace. Hiring managers get access to top level recruiters, every role is exclusive, payment is held in escrow and releases in milestones.

If you're a hiring manager or business owner who needs experienced recruitment support, go have a look.

👉 www.vettedta.com</p>
        </div>
        <a href="https://www.vettedta.com/recruiter/dashboard"
           style="display:inline-block;background:#4f46e5;color:#ffffff;padding:13px 26px;
                  border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Go to your Dashboard →
        </a>
        <p style="margin-top:40px;font-size:13px;color:#6b7280">The Vetted TA Team</p>
      </div>`
    const emailOk = await sendEmail(email, approvalSubject, approvalHtml)

    if (!emailOk) {
      setEmailWarning(`Recruiter approved successfully but the notification email failed to send. Please notify them manually at ${email}.`)
    }

    await logAction('approve', `Approved ${fullName}`)

    const doneId = detail.id
    setModal(null)
    setActioning(false)
    advanceQueue(doneId)
  }

  async function handleReject(reason, notes) {
    if (!detail) return
    setActioning(true)
    setActionError('')
    setEmailWarning('')

    const { error } = await supabase
      .from('recruiter_profiles')
      .update({ status: 'rejected' })
      .eq('id', detail.id)

    if (error) { setActionError(error.message); setActioning(false); return }

    const email     = detail.email
    const firstName = detail.first_name ?? 'Recruiter'

    const emailOk = await sendEmail(
      email,
      'Your Vetted TA application was not successful',
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
        <h1 style="font-size:22px;font-weight:700;margin-bottom:16px">Thank you for applying, ${firstName}</h1>
        <p style="font-size:15px;line-height:1.7;margin-bottom:16px">
          Thank you for applying to join Vetted TA. After reviewing your application, we are unable
          to approve your account at this time.
        </p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:8px">
          <strong>Reason:</strong> ${reason}
        </p>
        ${notes ? `<p style="font-size:14px;color:#6b7280;line-height:1.6;margin-bottom:16px">${notes}</p>` : ''}
        <p style="font-size:15px;line-height:1.7;margin-bottom:40px">
          You are welcome to reapply in 6 months if your circumstances change.
        </p>
        <p style="font-size:13px;color:#6b7280">The Vetted TA Team</p>
      </div>`
    )

    if (!emailOk) {
      setEmailWarning(`Recruiter rejected successfully but the notification email failed to send. Please notify them manually at ${email}.`)
    }

    await logAction('reject', `Rejected — ${reason}${notes ? `: ${notes}` : ''}`)

    const doneId = detail.id
    setModal(null)
    setActioning(false)
    advanceQueue(doneId)
  }

  async function handleRequestInfo(message) {
    if (!detail) return
    setActioning(true)
    setActionError('')
    setEmailWarning('')

    const { error } = await supabase
      .from('recruiter_profiles')
      .update({ status: 'info_requested' })
      .eq('id', detail.id)

    if (error) { setActionError(error.message); setActioning(false); return }

    const email     = detail.email
    const firstName = detail.first_name ?? 'Recruiter'

    const emailOk = await sendEmail(
      email,
      'Vetted TA — Additional information needed for your application',
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111827">
        <h1 style="font-size:22px;font-weight:700;margin-bottom:16px">We need a little more information</h1>
        <p style="font-size:15px;line-height:1.7;margin-bottom:16px">Dear ${firstName},</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:28px;white-space:pre-line">${message}</p>
        <a href="https://www.vettedta.com/recruiter/profile/edit"
           style="display:inline-block;background:#4f46e5;color:#ffffff;padding:13px 26px;
                  border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">
          Update your profile →
        </a>
        <p style="margin-top:40px;font-size:13px;color:#6b7280">The Vetted TA Team</p>
      </div>`
    )

    if (!emailOk) {
      setEmailWarning(`Info request sent successfully but the notification email failed to send. Please notify them manually at ${email}.`)
    }

    await logAction('request_info', message)

    const doneId = detail.id
    setModal(null)
    setActioning(false)
    advanceQueue(doneId)
  }

  // ── Derived detail data ───────────────────────────────────────────────────

  const specialismsBySector = (detail?.recruiter_specialisms ?? []).reduce((acc, rs) => {
    const cat = rs.specialism_categories
    if (!cat) return acc
    if (!acc[cat.sector]) acc[cat.sector] = []
    acc[cat.sector].push(cat.specialism_name)
    return acc
  }, {})

  const markets    = (detail?.recruiter_locations ?? []).map(l => l.country)
  const employers  = (detail?.previous_employers ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const clientTypes = detail?.previous_client_types ?? []
  const bioTooShort = detail?.bio != null && detail.bio.trim().length > 0 && detail.bio.trim().length < 100

  // ── Action button group — reused in top bar and bottom ───────────────────

  function ActionButtons({ size = 'sm' }) {
    const base = size === 'lg' ? 'px-5 py-2.5 text-sm rounded-lg' : 'px-4 py-2 text-sm rounded-md'
    return (
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={() => { setActionError(''); setModal('info') }}
          className={`border border-amber-400 text-amber-700 font-medium hover:bg-amber-50 transition-colors ${base}`}
        >
          Request Info
        </button>
        <button
          onClick={() => { setActionError(''); setModal('reject') }}
          className={`border border-red-400 text-red-600 font-medium hover:bg-red-50 transition-colors ${base}`}
        >
          Reject
        </button>
        <button
          onClick={() => { setActionError(''); setModal('approve') }}
          className={`bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors ${base}`}
        >
          Approve
        </button>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNav />

      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* ── Left: Application Queue ── */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden">
          {/* Counts */}
          <div className="p-4 border-b border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pending review</span>
              <span className="font-bold text-amber-600">{counts.pending}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Approved today</span>
              <span className="font-bold text-green-600">{counts.approvedToday}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Rejected this week</span>
              <span className="font-bold text-red-600">{counts.rejectedThisWeek}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-1.5">
              <div className="flex gap-1">
                <input
                  type="email"
                  value={testEmailAddr}
                  onChange={e => { setTestEmailAddr(e.target.value); setTestEmailMsg('') }}
                  placeholder="email@example.com"
                  className="flex-1 min-w-0 text-xs border border-gray-200 rounded px-2 py-1.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail || !testEmailAddr.trim()}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1.5 transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {testingEmail ? '…' : 'Send'}
                </button>
              </div>
              {testEmailMsg && (
                <p className={`text-xs text-center ${testEmailMsg.includes('failed') ? 'text-red-500' : 'text-green-600'}`}>
                  {testEmailMsg}
                </p>
              )}
            </div>
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto">
            {loadingQueue ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
              </div>
            ) : queue.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400">No pending applications</p>
              </div>
            ) : (
              queue.map(r => (
                <button
                  key={r.id}
                  onClick={() => loadDetail(r.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 transition-colors
                    hover:bg-gray-50
                    ${selectedId === r.id
                      ? 'bg-primary-50 border-l-[3px] border-l-primary-500 pl-[13px]'
                      : 'border-l-[3px] border-l-transparent'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[r.status] ?? 'bg-gray-300'}`} />
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {r.first_name ?? '(no name)'} {r.last_name ?? ''}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 pl-[18px]">{daysAgo(r.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Right: Detail panel ── */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {!selectedId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Select an application from the queue to review</p>
              </div>
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : !detail ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">Could not load this profile.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-8 py-8 space-y-5">

              {/* Top bar: name + actions */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {detail.first_name} {detail.last_name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Applied {daysAgo(detail.created_at)}
                    {detail.email && ` · ${detail.email}`}
                  </p>
                </div>
                <ActionButtons />
              </div>

              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              {emailWarning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{emailWarning}</span>
                </div>
              )}

              {/* LinkedIn — most critical step */}
              <Section title="LinkedIn Profile — Verification Step">
                {detail.linkedin_url ? (
                  <>
                    <a
                      href={detail.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 bg-[#0077b5] text-white px-5 py-3 rounded-lg
                                 font-semibold text-sm hover:bg-[#006097] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      View LinkedIn Profile ↗
                    </a>
                    <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Verify this person is a real recruiter with genuine experience before approving.</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    No LinkedIn URL provided — cannot approve without verification.
                  </div>
                )}
              </Section>

              {/* Profile */}
              <Section title="Profile">
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">Full name</dt>
                    <dd className="font-medium text-gray-900">{detail.first_name} {detail.last_name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">Email</dt>
                    <dd className="font-medium text-gray-900">{detail.email ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">Date applied</dt>
                    <dd className="font-medium text-gray-900">{new Date(detail.created_at).toLocaleDateString('en-IE')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">Years experience</dt>
                    <dd className="font-medium text-gray-900">{detail.years_experience ?? '—'}</dd>
                  </div>
                </dl>
              </Section>

              {/* Career Background */}
              <Section title="Career Background">
                <div className="space-y-4 text-sm">
                  {detail.career_dna ? (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Career DNA</p>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {CAREER_DNA_LABELS[detail.career_dna] ?? detail.career_dna}
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-xs">No Career DNA selected</p>
                  )}
                  {employers.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Previous employers</p>
                      <div className="flex flex-wrap gap-1.5">
                        {employers.map(emp => (
                          <span key={emp} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">{emp}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {clientTypes.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Client types</p>
                      <div className="flex flex-wrap gap-1.5">
                        {clientTypes.map(ct => (
                          <span key={ct} className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                            {CLIENT_TYPE_LABELS[ct] ?? ct}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>

              {/* Specialisms */}
              <Section title="Specialisms">
                {Object.keys(specialismsBySector).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No specialisms selected</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(specialismsBySector).map(([sector, specs]) => (
                      <div key={sector}>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">{sector}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {specs.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Markets */}
              <Section title="Markets">
                {markets.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No markets selected</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {markets.map(m => (
                      <span key={m} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-sm font-medium">{m}</span>
                    ))}
                  </div>
                )}
              </Section>

              {/* Bio */}
              <Section title="Bio">
                {detail.bio ? (
                  <>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{detail.bio}</p>
                    {bioTooShort && (
                      <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Bio is very short. Consider requesting more detail.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No bio provided</p>
                )}
              </Section>

              {/* Capacity and Rates */}
              <Section title="Capacity and Rates">
                <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Capacity status</dt>
                    <dd className="font-medium text-gray-900">
                      {CAPACITY_LABELS[detail.capacity_status] ?? detail.capacity_status ?? '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Standard rate</dt>
                    <dd className="font-medium text-gray-900">{feeDisplay(detail.preferred_fee_percentage)}</dd>
                  </div>
                </dl>
              </Section>

              {/* Bottom action buttons */}
              <div className="flex gap-3 pb-10">
                <button
                  onClick={() => { setActionError(''); setModal('info') }}
                  className="border border-amber-400 text-amber-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
                >
                  Request More Info
                </button>
                <button
                  onClick={() => { setActionError(''); setModal('reject') }}
                  className="border border-red-400 text-red-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => { setActionError(''); setModal('approve') }}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                >
                  Approve Application
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Modals ── */}
      {modal === 'approve' && (
        <ApproveModal
          onConfirm={handleApprove}
          onCancel={() => setModal(null)}
          loading={actioning}
        />
      )}
      {modal === 'reject' && (
        <RejectModal
          onConfirm={handleReject}
          onCancel={() => setModal(null)}
          loading={actioning}
          error={actionError}
        />
      )}
      {modal === 'info' && (
        <RequestInfoModal
          onConfirm={handleRequestInfo}
          onCancel={() => setModal(null)}
          loading={actioning}
          error={actionError}
        />
      )}
    </div>
  )
}
