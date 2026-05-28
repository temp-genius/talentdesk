import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const TERMS = [
  'This is a retained engagement — fees are paid at each milestone stage, not outcome-only.',
  'All CVs will be submitted exclusively through TalentDesk.',
  'This role is exclusive: one recruiter only, for the duration of the assignment.',
  'If the role is cancelled, the recruiter keeps all payments earned to that point.',
]

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

export default function StartJob() {
  const [searchParams] = useSearchParams()
  const recruiterId    = searchParams.get('recruiter_id')
  const jobId          = searchParams.get('job_id')
  const { user, loading: authLoading } = useAuth()

  const [job,            setJob]            = useState(null)
  const [recruiter,      setRecruiter]      = useState(null)
  const [companyProfile, setCompanyProfile] = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [submitted,      setSubmitted]      = useState(false)
  const [authTimedOut,   setAuthTimedOut]   = useState(false)

  const [shortlist,  setShortlist]  = useState(5)
  const [agreed,     setAgreed]     = useState([false, false, false, false])
  const [submitting, setSubmitting] = useState(false)
  const [actionErr,  setActionErr]  = useState('')

  // Unmount guard — prevents setState calls after the component is gone
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  // Log every state change
  console.log('START JOB RENDER', {
    authLoading, authTimedOut, loading, error: error || '(none)',
    userId: user?.id ?? 'null', recruiterId, jobId,
    job: job?.id ?? 'null', recruiter: recruiter?.id ?? 'null',
  })

  // Safety net 1: if authLoading is still true after 3 seconds, proceed anyway
  useEffect(() => {
    if (!authLoading) return
    console.log('[StartJob] auth timeout timer started (3s)')
    const t = setTimeout(() => {
      if (mounted.current && authLoading) {
        console.warn('[StartJob] AUTH TIMED OUT after 3s — proceeding without waiting')
        setAuthTimedOut(true)
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [authLoading])

  // Safety net 2: if loading is still true after 5 seconds, force it off
  useEffect(() => {
    if (!loading) return
    console.log('[StartJob] loading timeout timer started (5s)')
    const t = setTimeout(() => {
      if (mounted.current && loading) {
        console.warn('[StartJob] LOADING TIMED OUT after 5s — forcing loading=false')
        setLoading(false)
        if (!job && !error) {
          setError('Request timed out. Please check your connection and try again.')
        }
      }
    }, 5000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // Main data fetch
  useEffect(() => {
    // Wait for auth unless the timer already gave up
    if (authLoading && !authTimedOut) {
      console.log('[StartJob] useEffect: waiting for auth (authLoading=true, not timed out yet)')
      return
    }
    if (!user) {
      console.log('[StartJob] useEffect: no user — skipping fetch')
      return
    }
    if (!recruiterId || !jobId) {
      console.log('[StartJob] useEffect: missing params', { recruiterId, jobId })
      if (mounted.current) {
        setError('Missing role or recruiter information in the URL.')
        setLoading(false)
      }
      return
    }

    console.log('[StartJob] useEffect: starting fetch', { jobId, recruiterId, userId: user.id })

    async function fetchAll() {
      if (mounted.current) setLoading(true)

      const jobResult = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()
      console.log('[StartJob] jobs result:', { data: jobResult.data, error: jobResult.error })

      const recruiterResult = await supabase
        .from('recruiter_profiles')
        .select('id, user_id, first_name, last_name, bio, preferred_fee_percentage, total_placements, availability_status')
        .eq('id', recruiterId)
        .single()
      console.log('[StartJob] recruiter_profiles result:', { data: recruiterResult.data, error: recruiterResult.error })

      const companyResult = await supabase
        .from('hiring_company_profiles')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single()
      console.log('[StartJob] hiring_company_profiles result:', { data: companyResult.data, error: companyResult.error })

      if (!mounted.current) {
        console.log('[StartJob] fetchAll: component unmounted, skipping setState')
        return
      }

      if (jobResult.error) {
        console.error('[StartJob] job fetch error:', jobResult.error)
        setError(`Could not load job: ${jobResult.error.message}`)
        setLoading(false)
        return
      }
      if (recruiterResult.error) {
        console.error('[StartJob] recruiter fetch error:', recruiterResult.error)
        setError(`Could not load recruiter: ${recruiterResult.error.message}`)
        setLoading(false)
        return
      }
      if (companyResult.error) {
        console.warn('[StartJob] company profile fetch error (non-fatal):', companyResult.error)
        // Non-fatal — company profile missing shouldn't block the page
      }

      console.log('[StartJob] QUERY RESULTS', {
        job: jobResult.data,
        recruiter: recruiterResult.data,
        company: companyResult.data,
      })

      setJob(jobResult.data)
      setRecruiter(recruiterResult.data)
      setCompanyProfile(companyResult.data ?? null)
      setLoading(false)
    }

    fetchAll().catch(err => {
      console.error('[StartJob] unexpected fetch error:', err)
      if (mounted.current) {
        setError(`Unexpected error: ${err.message}`)
        setLoading(false)
      }
    })
  }, [user, authLoading, authTimedOut, recruiterId, jobId])

  // ── Render guards — always render something ──

  if (authLoading && !authTimedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600" />
        <p className="text-sm text-gray-400">Checking authentication…</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600" />
        <p className="text-sm text-gray-400">Loading role details…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <Link to="/hiring-manager/dashboard" className="text-lg font-bold text-slate-900 tracking-tight">
              Talent<span className="text-primary-600">Desk</span>
            </Link>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading page</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <p className="text-xs text-gray-400 font-mono mb-6">
            recruiter_id: {recruiterId ?? '(missing)'}<br />
            job_id: {jobId ?? '(missing)'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="btn-primary text-sm">
              Retry
            </button>
            <Link to="/hiring-manager/dashboard" className="btn-secondary text-sm">Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!job || !recruiter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <p className="text-gray-700 font-semibold mb-2">Role or recruiter not found</p>
          <p className="text-gray-500 text-sm mb-4">
            The data could not be retrieved. Check the URL parameters below are correct.
          </p>
          <p className="text-xs text-gray-400 font-mono mb-6">
            recruiter_id: {recruiterId ?? '(missing)'}<br />
            job_id: {jobId ?? '(missing)'}
          </p>
          <Link to="/browse-recruiters" className="btn-secondary text-sm">Browse Recruiters</Link>
        </div>
      </div>
    )
  }

  if (submitted) {
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
            <strong>{job.title}</strong> is now active and{' '}
            <strong>{recruiter.first_name} {recruiter.last_name}</strong> has been assigned.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            You'll receive candidates via TalentDesk. Milestones are invoiced at each stage.
          </p>
          <div className="flex gap-3">
            <Link to="/messages" className="btn-primary flex-1">Messages</Link>
            <Link to="/hiring-manager/dashboard" className="btn-secondary flex-1">Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Calculations (job + recruiter guaranteed non-null here) ──
  const fee      = recruiter.preferred_fee_percentage ?? 0
  const maxSal   = job.salary_max ?? job.salary_min ?? 0
  const totalFee = maxSal * (fee / 100)
  const currency = job.currency ?? 'EUR'

  const milestones = [
    { number: 1, name: 'CV Submission',    amount: Math.round(totalFee * 0.3), pct: 30 },
    { number: 2, name: 'Interviews Stage', amount: Math.round(totalFee * 0.3), pct: 30 },
    { number: 3, name: 'Offer Accepted',   amount: Math.round(totalFee * 0.4), pct: 40 },
  ]

  const allAgreed = agreed.every(Boolean)

  async function handleStart() {
    if (!allAgreed) return
    setSubmitting(true)
    setActionErr('')

    const { data: assignment, error: jraErr } = await supabase
      .from('job_recruiter_assignments')
      .insert({ job_id: jobId, recruiter_id: recruiterId, status: 'assigned' })
      .select('id')
      .single()
    console.log('[StartJob] INSERT assignment:', { assignment, jraErr })

    if (jraErr || !assignment) {
      setActionErr(jraErr?.message ?? 'Failed to create assignment.')
      setSubmitting(false)
      return
    }

    const { error: msErr } = await supabase
      .from('milestones')
      .insert(milestones.map(m => ({
        job_recruiter_assignment_id: assignment.id,
        milestone_number: m.number,
        milestone_name:   m.name,
        amount:           m.amount,
        currency,
        status: 'pending',
      })))
    console.log('[StartJob] INSERT milestones error:', msErr)

    if (msErr) {
      setActionErr(msErr.message ?? 'Failed to create milestones.')
      setSubmitting(false)
      return
    }

    const { error: updateErr } = await supabase
      .from('jobs')
      .update({ status: 'active', agreed_shortlist_size: shortlist })
      .eq('id', jobId)
    console.log('[StartJob] UPDATE job error:', updateErr)

    setSubmitted(true)
    setSubmitting(false)
  }

  // ── Full form ──
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/hiring-manager/dashboard" className="text-lg font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </Link>
          <Link to="/browse-recruiters" className="btn-secondary text-sm">← Back</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Start Job Agreement</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Review the details and confirm terms to begin the retained engagement.
          </p>
        </div>

        {actionErr && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {actionErr}
          </div>
        )}

        {/* Role */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Role</h2>
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
            {maxSal > 0 && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Salary</dt>
                <dd className="font-medium text-gray-900">
                  {job.salary_min && job.salary_max
                    ? `${fmtCurrency(job.salary_min, currency)} – ${fmtCurrency(job.salary_max, currency)}`
                    : fmtCurrency(maxSal, currency)}
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

        {/* Recruiter */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recruiter</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {recruiter.first_name} {recruiter.last_name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Placement fee: {fee}% of agreed annual salary
              </p>
            </div>
            <p className="text-3xl font-extrabold text-primary-600">{fee}%</p>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Fee Breakdown</h2>
          {totalFee > 0 ? (
            <>
              <p className="text-xs text-gray-500 mb-4">
                {fmtCurrency(maxSal, currency)} × {fee}% ={' '}
                <strong className="text-gray-800">{fmtCurrency(totalFee, currency)} total fee</strong>
              </p>
              <div className="space-y-2">
                {milestones.map(m => (
                  <div key={m.number}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Milestone {m.number}: {m.name}
                      </p>
                      <p className="text-xs text-gray-400">{m.pct}% of total fee</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{fmtCurrency(m.amount, currency)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No salary entered — fee will be agreed on start.
            </p>
          )}
        </div>

        {/* Shortlist */}
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Agreed Shortlist Size
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600 flex-1">
              Number of candidates the recruiter will submit for this role.
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
          <p className="text-xs text-gray-500 mb-4">Please confirm all four points before proceeding:</p>
          <div className="space-y-3">
            {TERMS.map((term, i) => (
              <label key={i} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed[i]}
                  onChange={() => setAgreed(prev => prev.map((v, idx) => idx === i ? !v : v))}
                  className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                />
                <span className={`text-sm leading-relaxed ${agreed[i] ? 'text-gray-900' : 'text-gray-500'}`}>
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
            disabled={!allAgreed || submitting}
            className="btn-primary w-full text-base py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Starting…' : 'Pay and Start Job'}
          </button>
          {!allAgreed && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Confirm all four terms above to continue
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
