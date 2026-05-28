import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

const OFFER_STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100 text-green-800',
  declined:  'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-600',
  hm_confirmed: 'bg-blue-100 text-blue-800',
}

const INTERVIEW_STATUS_BADGE = {
  none:       'bg-gray-100 text-gray-600',
  selected:   'bg-blue-100 text-blue-800',
  scheduled:  'bg-yellow-100 text-yellow-800',
  completed:  'bg-purple-100 text-purple-800',
  offer_made: 'bg-orange-100 text-orange-800',
  accepted:   'bg-green-100 text-green-800',
  declined:   'bg-red-100 text-red-800',
}

const INTERVIEW_LABELS = {
  none:       'Logged',
  selected:   'Selected',
  scheduled:  'Interview Scheduled',
  completed:  'Interviewed',
  offer_made: 'Offer Made',
  accepted:   'Offer Accepted',
  declined:   'Declined',
}

export default function OfferFlow() {
  const { assignmentId } = useParams()
  const { user }         = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Modal state
  const [modal,       setModal]       = useState(null)  // candidate object or null
  const [salary,      setSalary]      = useState('')
  const [startDate,   setStartDate]   = useState('')
  const [confirmed,   setConfirmed]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [formErr,     setFormErr]     = useState('')
  const [successMsg,  setSuccessMsg]  = useState('')

  const load = useCallback(async () => {
    const { data: row, error: err } = await supabase
      .from('job_recruiter_assignments')
      .select(`
        id,
        jobs(id, title, currency),
        candidate_profiles(
          id, candidate_first_name, candidate_last_name,
          current_job_title, interview_status, created_at
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

  function openModal(candidate) {
    setModal(candidate)
    setSalary('')
    setStartDate('')
    setConfirmed(false)
    setFormErr('')
    setSuccessMsg('')
  }

  async function submitOffer(e) {
    e.preventDefault()
    setFormErr('')
    if (!salary || parseFloat(salary) <= 0) {
      setFormErr('Please enter the agreed salary.')
      return
    }
    if (!confirmed) {
      setFormErr('Please confirm the candidate has verbally accepted.')
      return
    }

    setSubmitting(true)

    const { error: insertErr } = await supabase.from('offers').insert({
      job_recruiter_assignment_id: assignmentId,
      candidate_profile_id:        modal.id,
      agreed_salary:               parseFloat(salary),
      currency:                    data.jobs?.currency ?? 'EUR',
      start_date:                  startDate || null,
      offer_logged_at:             new Date().toISOString(),
      offer_email_delay_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      acceptance_status:           'pending',
    })

    if (insertErr) { setFormErr(insertErr.message); setSubmitting(false); return }

    const { error: updateErr } = await supabase
      .from('candidate_profiles')
      .update({ interview_status: 'offer_made' })
      .eq('id', modal.id)

    setSubmitting(false)
    if (updateErr) { setFormErr(updateErr.message); return }

    setSuccessMsg(`Offer logged for ${modal.candidate_first_name}. The candidate will receive a confirmation email within 24 hours.`)
    setModal(null)
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
        <p className="text-red-600 font-medium">{error}</p>
        <Link to="/jobs" className="mt-4 inline-block text-sm text-primary-600 hover:underline">← My Jobs</Link>
      </div>
    </div>
  )

  const job        = data?.jobs
  const candidates = [...(data?.candidate_profiles ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const offers     = data?.offers ?? []

  function offerForCandidate(candidateId) {
    return offers.find(o => o.candidate_profile_id === candidateId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/job/${assignmentId}`} className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0">
              ← Job Overview
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900 truncate">Offer Stage</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Offers</h1>
          <p className="text-sm text-gray-500 mt-1">{job?.title}</p>
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 font-medium">
            {successMsg}
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-500 text-sm">No candidates on this assignment yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map(c => {
              const offer = offerForCandidate(c.id)
              return (
                <div key={c.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">
                        {c.candidate_first_name} {c.candidate_last_name}
                      </p>
                      {c.current_job_title && (
                        <p className="text-sm text-gray-500 mt-0.5">{c.current_job_title}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_STATUS_BADGE[c.interview_status]}`}>
                          {INTERVIEW_LABELS[c.interview_status]}
                        </span>
                        {offer && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${OFFER_STATUS_STYLES[offer.acceptance_status] ?? 'bg-gray-100 text-gray-600'}`}>
                            Offer: {offer.acceptance_status}
                          </span>
                        )}
                      </div>
                      {offer && (
                        <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                          <p>Agreed salary: <span className="font-medium">{fmtCurrency(offer.agreed_salary, offer.currency)}</span></p>
                          {offer.start_date && (
                            <p>Start date: <span className="font-medium">{new Date(offer.start_date).toLocaleDateString()}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {c.interview_status === 'completed' && !offer && (
                        <button onClick={() => openModal(c)} className="btn-primary text-sm">
                          Make Offer
                        </button>
                      )}
                      {c.interview_status === 'offer_made' && offer && (
                        <span className="text-xs text-gray-400">Awaiting response</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Make Offer Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Make Offer</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {modal.candidate_first_name} {modal.candidate_last_name}
              </p>
            </div>
            <form onSubmit={submitOffer} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agreed salary ({job?.currency ?? 'EUR'}) *
                </label>
                <input
                  type="number"
                  className="input"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
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
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I confirm the candidate has verbally accepted this offer.
                </span>
              </label>
              {formErr && <p className="text-sm text-red-600">{formErr}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Logging offer…' : 'Log Offer'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">
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
