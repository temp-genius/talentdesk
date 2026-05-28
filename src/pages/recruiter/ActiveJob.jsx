import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sendOfferEmail, sendShortlistSubmittedNotification } from '../../lib/emailService'

const MS_STATUS_STYLES = {
  pending:       'bg-gray-100 text-gray-600',
  review_window: 'bg-yellow-100 text-yellow-800',
  approved:      'bg-blue-100 text-blue-800',
  released:      'bg-green-100 text-green-800',
  disputed:      'bg-red-100 text-red-800',
}

const INTERVIEW_STATUS_LABELS = {
  none:       'Logged',
  selected:   'Selected',
  scheduled:  'Interview Scheduled',
  completed:  'Interviewed',
  offer_made: 'Offer Made',
  accepted:   'Offer Accepted',
  declined:   'Declined',
}

const INTERVIEW_BADGE_STYLES = {
  none:       'bg-gray-100 text-gray-600',
  selected:   'bg-blue-100 text-blue-800',
  scheduled:  'bg-yellow-100 text-yellow-800',
  completed:  'bg-purple-100 text-purple-800',
  offer_made: 'bg-orange-100 text-orange-800',
  accepted:   'bg-green-100 text-green-800',
  declined:   'bg-red-100 text-red-800',
}

const OFFER_STATUS_STYLES = {
  pending:  'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
}

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

const EMPTY_FORM = {
  candidate_first_name: '',
  candidate_last_name:  '',
  candidate_email:      '',
  current_job_title:    '',
  recruiter_notes:      '',
}

export default function RecruiterActiveJob() {
  const { assignmentId } = useParams()
  const { user }         = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [submitting, setSubmit] = useState(false)
  const [formErr, setFormErr]   = useState('')

  // Offer modal state
  const [offerModal,      setOfferModal]      = useState(null)
  const [offerSalary,     setOfferSalary]     = useState('')
  const [offerStartDate,  setOfferStartDate]  = useState('')
  const [offerEmail,      setOfferEmail]      = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerFormErr,    setOfferFormErr]    = useState('')
  const [offerSuccessMsg, setOfferSuccessMsg] = useState('')

  const load = useCallback(async () => {
    const { data: row, error: err } = await supabase
      .from('job_recruiter_assignments')
      .select(`
        id, status, assigned_at,
        jobs(
          id, title, sector, location_country, location_type,
          salary_min, salary_max, currency, seniority_level,
          agreed_shortlist_size, description, status
        ),
        milestones(
          id, milestone_number, milestone_name, amount, currency,
          status, triggered_at, review_window_expires_at, released_at
        ),
        recruiter_profiles(first_name, last_name),
        candidate_profiles(
          id, candidate_first_name, candidate_last_name,
          candidate_email, current_job_title, recruiter_notes,
          interview_status, logged_at, created_at
        ),
        offers(
          id, candidate_profile_id, agreed_salary, currency,
          start_date, acceptance_status, offer_logged_at
        )
      `)
      .eq('id', assignmentId)
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    setData(row)
    setLoading(false)
  }, [assignmentId])

  useEffect(() => { if (user) load() }, [user, load])

  const job        = data?.jobs
  const milestones = [...(data?.milestones ?? [])].sort((a, b) => a.milestone_number - b.milestone_number)
  const candidates = [...(data?.candidate_profiles ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const m1              = milestones.find(m => m.milestone_number === 1)
  const m2              = milestones.find(m => m.milestone_number === 2)
  const offers          = data?.offers ?? []
  const shortlistTarget = job?.agreed_shortlist_size ?? 5
  const showOfferSection = m2?.status === 'released' || candidates.some(c => c.interview_status === 'completed')

  function offerForCandidate(candidateId) {
    return offers.find(o => o.candidate_profile_id === candidateId)
  }

  async function logCandidate(e) {
    e.preventDefault()
    setFormErr('')
    if (!form.candidate_first_name.trim() || !form.candidate_last_name.trim()) {
      setFormErr('First name and last name are required.')
      return
    }
    setSaving(true)
    const { error: err } = await supabase.from('candidate_profiles').insert({
      job_recruiter_assignment_id: assignmentId,
      candidate_first_name: form.candidate_first_name.trim(),
      candidate_last_name:  form.candidate_last_name.trim(),
      candidate_email:      form.candidate_email.trim()    || null,
      current_job_title:    form.current_job_title.trim()  || null,
      recruiter_notes:      form.recruiter_notes.trim()    || null,
      logged_at:            new Date().toISOString(),
    })
    setSaving(false)
    if (err) { setFormErr(err.message); return }
    setForm(EMPTY_FORM)
    load()
  }

  async function submitShortlist() {
    if (!m1 || m1.status !== 'pending') return
    setSubmit(true)
    const { error: err } = await supabase
      .from('milestones')
      .update({ status: 'review_window', triggered_at: new Date().toISOString() })
      .eq('id', m1.id)
    setSubmit(false)
    if (err) { alert(err.message); return }

    // Notify hiring manager — fire-and-forget
    const rp = data?.recruiter_profiles
    const recruiterName = [rp?.first_name, rp?.last_name].filter(Boolean).join(' ')
    supabase.rpc('get_hm_email_for_assignment', { p_assignment_id: assignmentId })
      .then(({ data: hmEmail }) => {
        if (hmEmail) {
          sendShortlistSubmittedNotification(hmEmail, recruiterName, job?.title ?? '', candidates.length)
        }
      })
      .catch(console.error)

    load()
  }

  function openOfferModal(candidate) {
    setOfferModal(candidate)
    setOfferSalary('')
    setOfferStartDate('')
    setOfferEmail(candidate.candidate_email ?? '')
    setOfferFormErr('')
  }

  async function submitOffer(e) {
    e.preventDefault()
    setOfferFormErr('')
    if (!offerSalary || parseFloat(offerSalary) <= 0) {
      setOfferFormErr('Please enter the agreed salary.')
      return
    }
    if (!offerEmail) {
      setOfferFormErr('Please enter the candidate email address.')
      return
    }
    setOfferSubmitting(true)
    const { data: newOffer, error: insertErr } = await supabase.from('offers').insert({
      job_recruiter_assignment_id: assignmentId,
      candidate_profile_id:        offerModal.id,
      agreed_salary:               parseFloat(offerSalary),
      currency:                    job?.currency ?? 'EUR',
      start_date:                  offerStartDate || null,
      candidate_email:             offerEmail,
      offer_logged_at:             new Date().toISOString(),
      offer_email_delay_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      acceptance_status:           'pending',
    }).select('acceptance_token').single()
    if (insertErr) { setOfferFormErr(insertErr.message); setOfferSubmitting(false); return }
    const { error: updateErr } = await supabase
      .from('candidate_profiles')
      .update({ interview_status: 'offer_made' })
      .eq('id', offerModal.id)
    setOfferSubmitting(false)
    if (updateErr) { setOfferFormErr(updateErr.message); return }

    // Send offer acceptance email — fire-and-forget
    if (newOffer?.acceptance_token) {
      sendOfferEmail(offerEmail, {
        jobTitle:         job?.title ?? '',
        agreedSalary:     parseFloat(offerSalary),
        currency:         job?.currency ?? 'EUR',
        startDate:        offerStartDate || null,
        acceptanceToken:  newOffer.acceptance_token,
      })
    }

    setOfferSuccessMsg(`Offer logged for ${offerModal.candidate_first_name}.`)
    setOfferModal(null)
    load()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-red-600 font-medium mb-2">Failed to load assignment</p>
        <p className="text-sm text-gray-500">{error}</p>
        <Link to="/recruiter/dashboard" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/recruiter/dashboard" className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0">
              ← Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900 truncate">{job?.title}</span>
          </div>
          <Link to="/recruiter/messages" className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0 ml-4">
            Messages
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Job summary */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Assignment</h2>
          <h3 className="text-lg font-bold text-gray-900">{job?.title}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
            {job?.sector && <span>{job.sector}</span>}
            {job?.location_country && <span>{job.location_country}</span>}
            {job?.location_type && <span className="capitalize">{job.location_type}</span>}
            {job?.seniority_level && <span className="capitalize">{job.seniority_level.replace('_', ' ')}</span>}
            {(job?.salary_min || job?.salary_max) && (
              <span>
                {job.salary_min && job.salary_max
                  ? `${fmtCurrency(job.salary_min, job.currency)} – ${fmtCurrency(job.salary_max, job.currency)}`
                  : fmtCurrency(job.salary_min ?? job.salary_max, job.currency)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Shortlist size: <span className="font-medium text-gray-900">{shortlistTarget} candidates</span>
          </p>
        </div>

        {/* Milestone tracker */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Milestones</h2>
          <div className="space-y-3">
            {milestones.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${m.status === 'released'      ? 'bg-green-500 text-white' :
                    m.status === 'approved'      ? 'bg-blue-500 text-white' :
                    m.status === 'review_window' ? 'bg-yellow-400 text-white' :
                                                   'bg-gray-200 text-gray-500'}`}>
                  {m.milestone_number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{m.milestone_name}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MS_STATUS_STYLES[m.status]}`}>
                      {m.status === 'review_window' ? 'In Review' : m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{fmtCurrency(m.amount, m.currency)}</p>
                </div>
              </div>
            ))}
            {milestones.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2">No milestones defined yet.</p>
            )}
          </div>
        </div>

        {/* M1 pending: log candidates */}
        {m1?.status === 'pending' && (
          <>
            <div className="card">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Log a Candidate</h2>
              <form onSubmit={logCandidate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name *</label>
                    <input
                      className="input"
                      value={form.candidate_first_name}
                      onChange={e => setForm(f => ({ ...f, candidate_first_name: e.target.value }))}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name *</label>
                    <input
                      className="input"
                      value={form.candidate_last_name}
                      onChange={e => setForm(f => ({ ...f, candidate_last_name: e.target.value }))}
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={form.candidate_email}
                    onChange={e => setForm(f => ({ ...f, candidate_email: e.target.value }))}
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current role</label>
                  <input
                    className="input"
                    value={form.current_job_title}
                    onChange={e => setForm(f => ({ ...f, current_job_title: e.target.value }))}
                    placeholder="Senior Engineer at ACME Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes for the hiring manager</label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    value={form.recruiter_notes}
                    onChange={e => setForm(f => ({ ...f, recruiter_notes: e.target.value }))}
                    placeholder="Why this candidate is a strong fit…"
                  />
                </div>
                {formErr && <p className="text-sm text-red-600">{formErr}</p>}
                <button type="submit" className="btn-primary text-sm" disabled={saving}>
                  {saving ? 'Saving…' : 'Add to Shortlist'}
                </button>
              </form>
            </div>

            {candidates.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Shortlist ({candidates.length} / {shortlistTarget})
                  </h2>
                  <button
                    onClick={submitShortlist}
                    disabled={submitting || candidates.length < shortlistTarget}
                    className="btn-primary text-sm"
                    title={candidates.length < shortlistTarget
                      ? `Need ${shortlistTarget - candidates.length} more candidate${shortlistTarget - candidates.length !== 1 ? 's' : ''}`
                      : 'Submit shortlist to hiring manager'}
                  >
                    {submitting ? 'Submitting…' : 'Submit Shortlist'}
                  </button>
                </div>
                {candidates.length < shortlistTarget && (
                  <p className="text-xs text-gray-400 mb-3">
                    Add {shortlistTarget - candidates.length} more candidate{shortlistTarget - candidates.length !== 1 ? 's' : ''} before submitting.
                  </p>
                )}
                <div className="space-y-2">
                  {candidates.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {c.candidate_first_name} {c.candidate_last_name}
                        </p>
                        {c.current_job_title && (
                          <p className="text-xs text-gray-500">{c.current_job_title}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* M1 in review: waiting state */}
        {m1?.status === 'review_window' && (
          <div className="card">
            <div className="flex flex-col items-center text-center py-6 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Shortlist Under Review</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                The hiring manager is reviewing your shortlist. You'll be notified once it's approved.
              </p>
            </div>
            <div className="space-y-2">
              {candidates.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">
                    {c.candidate_first_name} {c.candidate_last_name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MS_STATUS_STYLES['review_window']}`}>
                    Submitted
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* M1 approved or released: interview tracking (read-only) */}
        {(m1?.status === 'approved' || m1?.status === 'released') && (
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Candidates — Interview Tracking
            </h2>
            {candidates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No candidates logged.</p>
            ) : (
              <div className="space-y-3">
                {candidates.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {c.candidate_first_name} {c.candidate_last_name}
                      </p>
                      {c.current_job_title && (
                        <p className="text-xs text-gray-500">{c.current_job_title}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${INTERVIEW_BADGE_STYLES[c.interview_status]}`}>
                      {INTERVIEW_STATUS_LABELS[c.interview_status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Offer Stage */}
        {showOfferSection && (
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Offer Stage</h2>
            {offerSuccessMsg && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 font-medium mb-4">
                {offerSuccessMsg}
              </div>
            )}
            <div className="space-y-3">
              {candidates
                .filter(c => c.interview_status === 'completed' || c.interview_status === 'offer_made' ||
                             c.interview_status === 'accepted'  || c.interview_status === 'declined' ||
                             offerForCandidate(c.id))
                .map(c => {
                  const offer = offerForCandidate(c.id)
                  return (
                    <div key={c.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {c.candidate_first_name} {c.candidate_last_name}
                        </p>
                        {offer && (
                          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                            <p>Salary: <span className="font-medium text-gray-900">{fmtCurrency(offer.agreed_salary, offer.currency)}</span></p>
                            {offer.start_date && (
                              <p>Start: <span className="font-medium text-gray-900">{new Date(offer.start_date).toLocaleDateString()}</span></p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {!offer && c.interview_status === 'completed' && (
                          <button onClick={() => openOfferModal(c)} className="btn-primary text-sm">
                            Log Offer
                          </button>
                        )}
                        {offer && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${OFFER_STATUS_STYLES[offer.acceptance_status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {offer.acceptance_status === 'pending'
                              ? 'Pending acceptance'
                              : offer.acceptance_status.charAt(0).toUpperCase() + offer.acceptance_status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              {candidates.filter(c =>
                c.interview_status === 'completed' || c.interview_status === 'offer_made' ||
                c.interview_status === 'accepted'  || c.interview_status === 'declined' ||
                offerForCandidate(c.id)
              ).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Candidates appear here once their interview is marked as completed.
                </p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Log Offer Modal */}
      {offerModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Log Offer</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {offerModal.candidate_first_name} {offerModal.candidate_last_name}
              </p>
            </div>
            <form onSubmit={submitOffer} className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
                You relay this offer to the candidate on behalf of the hiring company. Log it here once the candidate verbally accepts — they will then receive a formal offer email.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agreed salary ({job?.currency ?? 'EUR'}) *
                </label>
                <input
                  type="number"
                  className="input"
                  value={offerSalary}
                  onChange={e => setOfferSalary(e.target.value)}
                  placeholder="75000"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                <input
                  type="date"
                  className="input"
                  value={offerStartDate}
                  onChange={e => setOfferStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Candidate email *</label>
                <input
                  type="email"
                  className="input"
                  value={offerEmail}
                  onChange={e => setOfferEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The candidate will receive a formal offer email at this address.
                </p>
              </div>
              {offerFormErr && <p className="text-sm text-red-600">{offerFormErr}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={offerSubmitting} className="btn-primary flex-1">
                  {offerSubmitting ? 'Logging…' : 'Log Offer'}
                </button>
                <button type="button" onClick={() => setOfferModal(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
