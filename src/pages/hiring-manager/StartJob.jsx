import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const TERMS = [
  'This is a retained engagement — fees are paid at each milestone stage, not outcome-only.',
  'All CVs will be submitted exclusively through TalentDesk.',
  'This role is exclusive: one recruiter only, for the duration of the assignment.',
  'If the role is cancelled, the recruiter keeps all payments earned to that point.',
]

const MILESTONES_DEF = [
  { number: 1, name: 'CV Submission',    pct: 0.30 },
  { number: 2, name: 'Interviews Stage', pct: 0.30 },
  { number: 3, name: 'Offer Accepted',   pct: 0.40 },
]

function fmtCurrency(amount, currency) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function StartJob() {
  const { user, logout, loading: authLoading } = useAuth()
  const [params] = useSearchParams()
  const recruiterId = params.get('recruiter_id')
  const jobId       = params.get('job_id')

  // Debug: always log URL params on every render
  console.log('[StartJob] render — recruiterId:', recruiterId, '| jobId:', jobId, '| user:', user?.id ?? 'null', '| authLoading:', authLoading)

  const [job,        setJob]        = useState(null)
  const [recruiter,  setRecruiter]  = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [actionError, setActionError] = useState('')
  const [shortlist,  setShortlist]  = useState(5)
  const [agreed,     setAgreed]     = useState([false, false, false, false])
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)

  useEffect(() => {
    // Wait for auth to finish resolving before deciding anything
    if (authLoading) {
      console.log('[StartJob] useEffect — auth still loading, waiting…')
      return
    }

    if (!user) {
      console.log('[StartJob] useEffect — no user after auth resolved')
      setFetchError('You must be signed in to access this page.')
      setLoading(false)
      return
    }

    if (!recruiterId || !jobId) {
      console.log('[StartJob] useEffect — missing URL params:', { recruiterId, jobId })
      setFetchError('Missing recruiter_id or job_id in URL.')
      setLoading(false)
      return
    }

    console.log('[StartJob] useEffect — fetching job and recruiter…', { jobId, recruiterId })
    setLoading(true)
    setFetchError('')

    Promise.all([
      supabase
        .from('jobs')
        .select('id, title, sector, location_country, location_city, location_type, salary_min, salary_max, currency, seniority_level, description, status')
        .eq('id', jobId)
        .single(),
      supabase
        .from('recruiter_profiles')
        .select('id, user_id, first_name, last_name, preferred_fee_percentage')
        .eq('id', recruiterId)
        .single(),
    ]).then(([jobResult, recruiterResult]) => {
      console.log('[StartJob] jobs query result:', jobResult)
      console.log('[StartJob] recruiter_profiles query result:', recruiterResult)

      const jobData       = jobResult.data
      const recruiterData = recruiterResult.data
      const jobErr        = jobResult.error
      const recruiterErr  = recruiterResult.error

      if (jobErr) {
        console.error('[StartJob] jobs query error:', jobErr)
        setFetchError(`Job not found: ${jobErr.message}`)
        setLoading(false)
        return
      }
      if (recruiterErr) {
        console.error('[StartJob] recruiter_profiles query error:', recruiterErr)
        setFetchError(`Recruiter not found: ${recruiterErr.message}`)
        setLoading(false)
        return
      }
      if (!jobData) {
        setFetchError('Job not found — it may have been deleted or you may not have permission to view it.')
        setLoading(false)
        return
      }
      if (!recruiterData) {
        setFetchError('Recruiter not found — they may no longer be on the platform.')
        setLoading(false)
        return
      }

      console.log('[StartJob] loaded job:', jobData)
      console.log('[StartJob] loaded recruiter:', recruiterData)
      setJob(jobData)
      setRecruiter(recruiterData)
      setLoading(false)
    }).catch(err => {
      console.error('[StartJob] unexpected error during fetch:', err)
      setFetchError(`Unexpected error: ${err.message}`)
      setLoading(false)
    })
  }, [user, authLoading, recruiterId, jobId])

  const fee      = recruiter?.preferred_fee_percentage ?? 0
  const maxSal   = job?.salary_max ?? job?.salary_min ?? 0
  const totalFee = maxSal * (fee / 100)

  function toggleAgreed(i) {
    setAgreed(prev => prev.map((v, idx) => idx === i ? !v : v))
  }

  const allAgreed = agreed.every(Boolean)

  async function handleStart() {
    if (!allAgreed || !recruiter || !job) return
    setSubmitting(true)
    setActionError('')

    console.log('[StartJob] inserting job_recruiter_assignments…', { jobId, recruiterId })
    const { data: assignment, error: jraErr } = await supabase
      .from('job_recruiter_assignments')
      .insert({ job_id: jobId, recruiter_id: recruiterId, status: 'assigned' })
      .select('id')
      .single()

    console.log('[StartJob] assignment insert result:', { assignment, jraErr })
    if (jraErr || !assignment) {
      setActionError(jraErr?.message ?? 'Failed to create assignment. Please try again.')
      setSubmitting(false)
      return
    }

    const milestones = MILESTONES_DEF.map(m => ({
      job_recruiter_assignment_id: assignment.id,
      milestone_number:            m.number,
      milestone_name:              m.name,
      amount:                      Math.round(totalFee * m.pct),
      currency:                    job.currency ?? 'EUR',
      status:                      'pending',
    }))

    console.log('[StartJob] inserting milestones…', milestones)
    const { error: msErr } = await supabase.from('milestones').insert(milestones)
    console.log('[StartJob] milestones insert result error:', msErr)

    if (msErr) {
      setActionError(msErr.message ?? 'Failed to create milestones.')
      setSubmitting(false)
      return
    }

    const { error: updateErr } = await supabase
      .from('jobs')
      .update({ status: 'active', agreed_shortlist_size: shortlist })
      .eq('id', jobId)

    console.log('[StartJob] job status update error:', updateErr)

    setSuccess(true)
    setSubmitting(false)
  }

  // ── Always render something — never a blank screen ──

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <p className="text-sm text-gray-400">
          {authLoading ? 'Checking authentication…' : 'Loading role details…'}
        </p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/hiring-manager/dashboard" className="text-lg font-bold text-slate-900 tracking-tight">
              Talent<span className="text-primary-600">Desk</span>
            </Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Could not load page</h2>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">{fetchError}</p>
          <p className="text-xs text-gray-400 mb-6 font-mono">
            recruiter_id: {recruiterId ?? '(missing)'}<br />
            job_id: {jobId ?? '(missing)'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/browse-recruiters" className="btn-primary text-sm">Browse Recruiters</Link>
            <Link to="/hiring-manager/dashboard" className="btn-secondary text-sm">Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Started!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Your role <strong>{job.title}</strong> is now active and{' '}
            <strong>{recruiter.first_name} {recruiter.last_name}</strong> has been assigned.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You'll receive candidates via TalentDesk. Milestones are invoiced at each stage.
          </p>
          <div className="flex gap-3">
            <Link to="/messages" className="btn-primary flex-1">Go to Messages</Link>
            <Link to="/hiring-manager/dashboard" className="btn-secondary flex-1">Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  // At this point job and recruiter are guaranteed to be non-null
  const recruiterName = [recruiter.first_name, recruiter.last_name].filter(Boolean).join(' ')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/hiring-manager/dashboard" className="text-lg font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </Link>
          <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Start Job Agreement</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review the details and confirm terms to begin the retained engagement.
          </p>
        </div>

        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{actionError}</div>
        )}

        {/* Role summary */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Role Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Title</dt>
              <dd className="font-medium text-gray-900">{job.title}</dd>
            </div>
            {job.sector && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Sector</dt>
                <dd className="font-medium text-gray-900">{job.sector}</dd>
              </div>
            )}
            {(job.location_city || job.location_country) && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Location</dt>
                <dd className="font-medium text-gray-900">
                  {[job.location_city, job.location_country].filter(Boolean).join(', ')}
                  {job.location_type && ` · ${job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1)}`}
                </dd>
              </div>
            )}
            {(job.salary_min || job.salary_max) && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Salary</dt>
                <dd className="font-medium text-gray-900">
                  {job.salary_min && job.salary_max
                    ? `${fmtCurrency(job.salary_min, job.currency)} – ${fmtCurrency(job.salary_max, job.currency)}`
                    : fmtCurrency(job.salary_min || job.salary_max, job.currency)}
                </dd>
              </div>
            )}
            {job.seniority_level && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Seniority</dt>
                <dd className="font-medium text-gray-900 capitalize">
                  {job.seniority_level.replace('_', '-')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Recruiter + fee */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recruiter</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{recruiterName}</p>
              <p className="text-xs text-gray-500 mt-0.5">Placement fee: {fee}% of agreed annual salary</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-primary-600">{fee}%</p>
            </div>
          </div>
        </div>

        {/* Fee breakdown */}
        {totalFee > 0 && (
          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Fee Breakdown</h2>
            <p className="text-xs text-gray-500 mb-4">
              Based on maximum salary of {fmtCurrency(maxSal, job.currency)} × {fee}%
              = <strong className="text-gray-800">{fmtCurrency(totalFee, job.currency)} total fee</strong>
            </p>
            <div className="space-y-3">
              {MILESTONES_DEF.map(m => (
                <div key={m.number}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Milestone {m.number}: {m.name}
                    </p>
                    <p className="text-xs text-gray-400">{Math.round(m.pct * 100)}% of total fee</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {fmtCurrency(Math.round(totalFee * m.pct), job.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortlist size */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Agreed Shortlist Size
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 flex-1">
              The number of candidates the recruiter will submit for this role.
            </p>
            <select
              className="input w-24"
              value={shortlist}
              onChange={e => setShortlist(Number(e.target.value))}
            >
              {[3, 4, 5, 6, 7, 8, 10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Terms */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Terms &amp; Conditions
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Please confirm you understand and agree to each of the following:
          </p>
          <div className="space-y-3">
            {TERMS.map((term, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed[i]}
                  onChange={() => toggleAgreed(i)}
                  className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                />
                <span className={`text-sm leading-relaxed ${agreed[i] ? 'text-gray-900' : 'text-gray-600'}`}>
                  {term}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pb-8">
          <button
            onClick={handleStart}
            className="btn-primary w-full text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!allAgreed || submitting}
          >
            {submitting ? 'Starting…' : 'Pay and Start Job'}
          </button>
          {!allAgreed && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Please confirm all four terms above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
