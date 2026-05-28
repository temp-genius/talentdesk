import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const OFFER_STATUS_STYLES = {
  pending:      'bg-yellow-100 text-yellow-800',
  accepted:     'bg-green-100 text-green-800',
  declined:     'bg-red-100 text-red-800',
  withdrawn:    'bg-gray-100 text-gray-600',
  hm_confirmed: 'bg-blue-100 text-blue-800',
}

const MS_STATUS_STYLES = {
  pending:       'bg-gray-100 text-gray-600',
  review_window: 'bg-yellow-100 text-yellow-800',
  approved:      'bg-blue-100 text-blue-800',
  released:      'bg-green-100 text-green-800',
  disputed:      'bg-red-100 text-red-800',
}

const INTERVIEW_STATUS_OPTIONS = [
  { value: 'none',       label: 'Logged' },
  { value: 'selected',   label: 'Selected' },
  { value: 'scheduled',  label: 'Interview Scheduled' },
  { value: 'completed',  label: 'Interviewed' },
  { value: 'offer_made', label: 'Offer Made' },
  { value: 'accepted',   label: 'Offer Accepted' },
  { value: 'declined',   label: 'Declined' },
]

const INTERVIEW_BADGE_STYLES = {
  none:       'bg-gray-100 text-gray-600',
  selected:   'bg-blue-100 text-blue-800',
  scheduled:  'bg-yellow-100 text-yellow-800',
  completed:  'bg-purple-100 text-purple-800',
  offer_made: 'bg-orange-100 text-orange-800',
  accepted:   'bg-green-100 text-green-800',
  declined:   'bg-red-100 text-red-800',
}

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

export default function HMActiveJob() {
  const { assignmentId } = useParams()
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    const { data: row, error: err } = await supabase
      .from('job_recruiter_assignments')
      .select(`
        id, status, assigned_at,
        jobs(
          id, title, sector, location_country, location_city, location_type,
          salary_min, salary_max, currency, seniority_level, role_type,
          agreed_shortlist_size, description, status
        ),
        recruiter_profiles(
          id, first_name, last_name, bio, years_experience,
          linkedin_url, preferred_fee_percentage
        ),
        milestones(
          id, milestone_number, milestone_name, amount, currency,
          status, triggered_at, review_window_expires_at, released_at
        ),
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

  async function approveM1() {
    const m1 = milestones.find(m => m.milestone_number === 1)
    if (!m1 || m1.status !== 'review_window') return
    const { error: err } = await supabase
      .from('milestones')
      .update({ status: 'approved' })
      .eq('id', m1.id)
    if (err) { alert(err.message); return }
    load()
  }

  async function updateInterviewStatus(candidateId, newStatus) {
    const { error: err } = await supabase
      .from('candidate_profiles')
      .update({ interview_status: newStatus })
      .eq('id', candidateId)
    if (err) { alert(err.message); return }
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
        <p className="text-red-600 font-medium mb-2">Failed to load job</p>
        <p className="text-sm text-gray-500">{error}</p>
        <Link to="/jobs" className="mt-4 inline-block text-sm text-primary-600 hover:underline">← Back to My Jobs</Link>
      </div>
    </div>
  )

  const job = data?.jobs
  const recruiter = data?.recruiter_profiles
  const milestones = [...(data?.milestones ?? [])].sort((a, b) => a.milestone_number - b.milestone_number)
  const candidates = [...(data?.candidate_profiles ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const offers     = data?.offers ?? []
  const m1  = milestones.find(m => m.milestone_number === 1)
  const m2  = milestones.find(m => m.milestone_number === 2)

  const showOfferSection =
    m2?.status === 'released' ||
    candidates.some(c => c.interview_status === 'completed')

  function offerForCandidate(candidateId) {
    return offers.find(o => o.candidate_profile_id === candidateId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0">← My Jobs</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900 truncate">{job?.title}</span>
          </div>
          <Link to="/messages" className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0 ml-4">Messages</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Section 1: Job + Recruiter Summary */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Role Details</h2>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{job?.title}</h3>
            <dl className="space-y-2 text-sm">
              {job?.sector && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Sector</dt>
                  <dd className="font-medium text-gray-900">{job.sector}</dd>
                </div>
              )}
              {(job?.location_city || job?.location_country) && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900">
                    {[job.location_city, job.location_country].filter(Boolean).join(', ')}
                    {job.location_type && (
                      <span className="ml-1 text-gray-400 capitalize">({job.location_type})</span>
                    )}
                  </dd>
                </div>
              )}
              {(job?.salary_min || job?.salary_max) && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Salary</dt>
                  <dd className="font-medium text-gray-900">
                    {job.salary_min && job.salary_max
                      ? `${fmtCurrency(job.salary_min, job.currency)} – ${fmtCurrency(job.salary_max, job.currency)}`
                      : fmtCurrency(job.salary_min ?? job.salary_max, job.currency)}
                  </dd>
                </div>
              )}
              {job?.seniority_level && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Seniority</dt>
                  <dd className="font-medium text-gray-900 capitalize">{job.seniority_level.replace('_', ' ')}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Shortlist size</dt>
                <dd className="font-medium text-gray-900">{job?.agreed_shortlist_size ?? 5} candidates</dd>
              </div>
            </dl>
          </div>

          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Your Recruiter</h2>
            {recruiter ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                    {(recruiter.first_name?.[0] ?? '') + (recruiter.last_name?.[0] ?? '')}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {recruiter.first_name} {recruiter.last_name}
                    </p>
                    {recruiter.years_experience && (
                      <p className="text-sm text-gray-500">{recruiter.years_experience} years experience</p>
                    )}
                  </div>
                </div>
                {recruiter.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{recruiter.bio}</p>
                )}
                {recruiter.preferred_fee_percentage && (
                  <p className="text-sm text-gray-500">
                    Fee rate: <span className="font-medium text-gray-900">{recruiter.preferred_fee_percentage}%</span>
                  </p>
                )}
                <Link to="/messages" className="mt-3 block text-center btn-secondary text-sm">
                  Message Recruiter
                </Link>
              </>
            ) : (
              <p className="text-sm text-gray-400">Recruiter info unavailable.</p>
            )}
          </div>
        </div>

        {/* Section 2: Milestone Progress Tracker */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Milestone Progress</h2>
          {milestones.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No milestones defined yet.</p>
          ) : (
            <div className="space-y-5">
              {milestones.map(m => (
                <div key={m.id} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold
                    ${m.status === 'released'      ? 'bg-green-500 text-white' :
                      m.status === 'approved'      ? 'bg-blue-500 text-white' :
                      m.status === 'review_window' ? 'bg-yellow-400 text-white' :
                                                     'bg-gray-200 text-gray-500'}`}>
                    {m.milestone_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 text-sm">{m.milestone_name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MS_STATUS_STYLES[m.status]}`}>
                        {m.status === 'review_window' ? 'In Review' : m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{fmtCurrency(m.amount, m.currency)}</p>
                    {m.status === 'review_window' && m.review_window_expires_at && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Review window expires: {new Date(m.review_window_expires_at).toLocaleDateString()}
                      </p>
                    )}
                    {m.status === 'review_window' && m.milestone_number === 1 && (
                      <button onClick={approveM1} className="mt-2 btn-primary text-xs px-3 py-1.5">
                        Approve Shortlist
                      </button>
                    )}
                    {m.status === 'released' && m.released_at && (
                      <p className="text-xs text-green-700 mt-1">
                        Released: {new Date(m.released_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Candidates */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Candidates ({candidates.length}
              {job?.agreed_shortlist_size ? ` / ${job.agreed_shortlist_size}` : ''})
            </h2>
          </div>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-gray-500">
                {m1?.status === 'pending'
                  ? 'The recruiter is preparing your shortlist.'
                  : 'No candidates logged yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.map(c => (
                <div key={c.id} className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gray-50">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {c.candidate_first_name} {c.candidate_last_name}
                    </p>
                    {c.current_job_title && (
                      <p className="text-xs text-gray-500 mt-0.5">{c.current_job_title}</p>
                    )}
                    {c.recruiter_notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">"{c.recruiter_notes}"</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <select
                      value={c.interview_status}
                      onChange={e => updateInterviewStatus(c.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700
                                 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                    >
                      {INTERVIEW_STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Offer Status (read-only) */}
        {showOfferSection && (
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Offer Status</h2>
            {candidates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No candidates yet.</p>
            ) : (
              <div className="space-y-2">
                {candidates.map(c => {
                  const offer = offerForCandidate(c.id)
                  return (
                    <div key={c.id} className="flex items-start justify-between gap-4 px-3 py-2.5 rounded-lg bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {c.candidate_first_name} {c.candidate_last_name}
                        </p>
                        {offer && (
                          <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                            <p>Salary: <span className="font-medium text-gray-900">{fmtCurrency(offer.agreed_salary, offer.currency)}</span></p>
                            {offer.start_date && (
                              <p>Start: <span className="font-medium text-gray-900">{new Date(offer.start_date).toLocaleDateString()}</span></p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {!offer ? (
                          <span className="text-xs text-gray-400">No offer yet</span>
                        ) : offer.acceptance_status === 'pending' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800">
                            Pending acceptance
                          </span>
                        ) : offer.acceptance_status === 'accepted' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
                            Accepted
                          </span>
                        ) : offer.acceptance_status === 'declined' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                            Declined
                          </span>
                        ) : (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${OFFER_STATUS_STYLES[offer.acceptance_status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {offer.acceptance_status}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Section 5: Activity Feed */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Activity</h2>
          <div className="space-y-3 text-sm text-gray-500">
            {candidates.filter(c => c.interview_status !== 'none').map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_BADGE_STYLES[c.interview_status]}`}>
                  {INTERVIEW_STATUS_OPTIONS.find(o => o.value === c.interview_status)?.label}
                </span>
                <span>{c.candidate_first_name} {c.candidate_last_name}</span>
              </div>
            ))}
            <p className="text-gray-400 text-xs">
              Assignment started {data?.assigned_at ? new Date(data.assigned_at).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
