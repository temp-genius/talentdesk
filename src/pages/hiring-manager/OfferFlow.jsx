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
}

const OFFER_STATUS_LABELS = {
  pending:  'Pending acceptance',
  accepted: 'Accepted',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
}

export default function OfferFlow() {
  const { assignmentId } = useParams()
  const { user }         = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

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
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3 min-w-0">
          <Link to={`/job/${assignmentId}`} className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0">
            ← Job Overview
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900 truncate">Offer Status</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Offer Status</h1>
          <p className="text-sm text-gray-500 mt-1">{job?.title}</p>
        </div>

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
                      {offer && (
                        <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                          <p>Agreed salary: <span className="font-medium text-gray-900">{fmtCurrency(offer.agreed_salary, offer.currency)}</span></p>
                          {offer.start_date && (
                            <p>Start date: <span className="font-medium text-gray-900">
                              {new Date(offer.start_date).toLocaleDateString('en-IE', {
                                day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </span></p>
                          )}
                          {offer.offer_logged_at && (
                            <p>Logged: <span className="font-medium text-gray-900">
                              {new Date(offer.offer_logged_at).toLocaleDateString()}
                            </span></p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {!offer ? (
                        <span className="text-xs text-gray-400">No offer yet</span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${OFFER_STATUS_STYLES[offer.acceptance_status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {OFFER_STATUS_LABELS[offer.acceptance_status] ?? offer.acceptance_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
