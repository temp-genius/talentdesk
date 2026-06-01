import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { stripePromise } from '../../lib/stripe'
import { sendJobStartedNotification } from '../../lib/emailService'

const TERMS = [
  'This is a retained engagement — fees are paid at each milestone stage, not outcome-only.',
  'All CVs will be submitted exclusively through TalentDesk.',
  'This role is exclusive: one recruiter only, for the duration of the assignment.',
  'If the role is cancelled, the recruiter keeps all payments earned to that point.',
]

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      color: '#111827',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
  },
}

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

// ── Card setup form (saves card via SetupIntent) ──────────────────────
function SetupForm({ clientSecret, onSuccess, onError, onCancel, amount, currency, email }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSaving(true)

    const cardElement = elements.getElement(CardElement)
    const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { email },
      },
    })

    setSaving(false)

    if (error) {
      onError(error.message)
      return
    }
    if (setupIntent?.status === 'succeeded') {
      onSuccess(setupIntent.payment_method)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Card details</p>
        <div className="border border-gray-300 rounded-md px-4 py-3 bg-white
                        focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Your card will be charged automatically at each stage — no manual action required.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || !stripe}
          className="btn-primary flex-1 py-3 text-base disabled:opacity-50"
        >
          {saving ? 'Saving card…' : `Pay Stage 1 — ${fmtCurrency(amount, currency)}`}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-3">
          Back
        </button>
      </div>
      <p className="text-xs text-gray-400 text-center">
        Payments are processed securely via Stripe.
      </p>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────
function StartJobInner() {
  const [searchParams]  = useSearchParams()
  const recruiterId     = searchParams.get('recruiter_id')
  const jobId           = searchParams.get('job_id')
  const { user, loading: authLoading } = useAuth()

  const [job,            setJob]            = useState(null)
  const [recruiter,      setRecruiter]      = useState(null)
  const [companyProfile, setCompanyProfile] = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [submitted,      setSubmitted]      = useState(false)
  const [authTimedOut,   setAuthTimedOut]   = useState(false)

  const [shortlist,           setShortlist]           = useState(5)
  const [agreed,              setAgreed]              = useState([false, false, false, false])
  const [submitting,          setSubmitting]          = useState(false)
  const [actionErr,           setActionErr]           = useState('')
  const [setupClientSecret, setSetupClientSecret] = useState(null)
  const [customerId,        setCustomerId]        = useState(null)
  const [paymentStep,       setPaymentStep]       = useState(false)
  const [processingMsg,     setProcessingMsg]     = useState('')

  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!authLoading) return
    const t = setTimeout(() => {
      if (mounted.current && authLoading) setAuthTimedOut(true)
    }, 3000)
    return () => clearTimeout(t)
  }, [authLoading])

  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => {
      if (mounted.current && loading) {
        setLoading(false)
        if (!job && !error) setError('Request timed out. Please check your connection and try again.')
      }
    }, 5000)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (authLoading && !authTimedOut) return
    if (!user) return
    if (!recruiterId || !jobId) {
      if (mounted.current) { setError('Missing role or recruiter information in the URL.'); setLoading(false) }
      return
    }

    async function fetchAll() {
      if (mounted.current) setLoading(true)

      const [jobResult, recruiterResult, companyResult] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', jobId).single(),
        supabase
          .from('recruiter_profiles')
          .select('id, user_id, first_name, last_name, bio, preferred_fee_percentage, total_placements, availability_status, stripe_account_id, users(email)')
          .eq('id', recruiterId)
          .single(),
        supabase
          .from('hiring_company_profiles')
          .select('id, company_name, stripe_customer_id, stripe_payment_method_id')
          .eq('user_id', user.id)
          .single(),
      ])

      if (!mounted.current) return
      if (jobResult.error)       { setError(`Could not load job: ${jobResult.error.message}`); setLoading(false); return }
      if (recruiterResult.error) { setError(`Could not load recruiter: ${recruiterResult.error.message}`); setLoading(false); return }

      setJob(jobResult.data)
      setRecruiter(recruiterResult.data)
      setCompanyProfile(companyResult.data ?? null)
      setLoading(false)
    }

    fetchAll().catch(err => {
      if (mounted.current) { setError(`Unexpected error: ${err.message}`); setLoading(false) }
    })
  }, [user, authLoading, authTimedOut, recruiterId, jobId])

  // ── Render guards ──────────────────────────────────────────────────
  if (authLoading && !authTimedOut) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600" />
      <p className="text-sm text-gray-400">Checking authentication…</p>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600" />
      <p className="text-sm text-gray-400">Loading role details…</p>
    </div>
  )

  if (error) return (
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
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.location.reload()} className="btn-primary text-sm">Retry</button>
          <Link to="/hiring-manager/dashboard" className="btn-secondary text-sm">Dashboard</Link>
        </div>
      </div>
    </div>
  )

  if (!job || !recruiter) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <p className="text-gray-700 font-semibold mb-2">Role or recruiter not found</p>
        <Link to="/browse-recruiters" className="btn-secondary text-sm">Browse Recruiters</Link>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Job Started!</h2>
        <p className="text-gray-500 text-sm mb-6">
          <strong>{job.title}</strong> is now active and{' '}
          <strong>{recruiter.first_name} {recruiter.last_name}</strong> has been assigned.
          Stage 1 payment has been processed.
        </p>
        <div className="flex gap-3">
          <Link to="/messages" className="btn-primary flex-1">Messages</Link>
          <Link to="/hiring-manager/dashboard" className="btn-secondary flex-1">Dashboard</Link>
        </div>
      </div>
    </div>
  )

  // ── Calculations ──────────────────────────────────────────────────
  const fee      = recruiter.preferred_fee_percentage ?? 0
  const maxSal   = job.salary_max ?? job.salary_min ?? 0
  const totalFee = Math.round(maxSal * (fee / 100))
  const currency = job.currency ?? 'EUR'

  const milestones = [
    { number: 1, name: 'Shortlist Submission',  charge: Math.round(totalFee * 0.20), pct: 20, chargeAt: 'today (Stage 1)' },
    { number: 2, name: 'Shortlist Approval',    charge: Math.round(totalFee * 0.30), pct: 30, chargeAt: 'when you approve the shortlist' },
    { number: 3, name: 'Interview Confirmation',charge: Math.round(totalFee * 0.50), pct: 50, chargeAt: 'when you confirm interviews' },
  ]

  const m1Charge  = milestones[0].charge
  const allAgreed = agreed.every(Boolean)

  // Creates the assignment + milestones in the DB (job stays draft until charge succeeds)
  async function createAssignmentRecords() {
    const { data: assignment, error: jraErr } = await supabase
      .from('job_recruiter_assignments')
      .insert({ job_id: jobId, recruiter_id: recruiterId, status: 'assigned' })
      .select('id')
      .single()

    if (jraErr || !assignment) {
      setActionErr(jraErr?.message ?? 'Failed to create assignment.')
      return { ok: false, assignmentId: null }
    }

    const { error: msErr } = await supabase.from('milestones').insert(
      milestones.map(m => ({
        job_recruiter_assignment_id: assignment.id,
        milestone_number: m.number,
        milestone_name:   m.name,
        amount:           m.charge,
        charge_amount:    m.charge,
        transfer_amount:  Math.round(m.charge * 0.85),
        currency,
        status: 'pending',
      }))
    )

    if (msErr) { setActionErr(msErr.message); return { ok: false, assignmentId: null } }

    return { ok: true, assignmentId: assignment.id }
  }

  // Activates the job and notifies the recruiter — only called after charge succeeds
  async function activateJob() {
    await supabase.from('jobs')
      .update({ status: 'active', agreed_shortlist_size: shortlist })
      .eq('id', jobId)

    const recruiterEmail = recruiter.users?.email
    if (recruiterEmail) {
      sendJobStartedNotification(recruiterEmail, job.title, companyProfile?.company_name ?? null, shortlist)
    }
  }

  // Step 1: user clicks "Pay and Start Job" — create Stripe customer + show card form
  async function handleStart() {
    if (!allAgreed) return
    setSubmitting(true)
    setActionErr('')

    // Skip payment entirely if no fee (no salary set)
    if (totalFee === 0) {
      const { ok } = await createAssignmentRecords()
      if (ok) await activateJob()
      setSubmitting(false)
      if (ok) setSubmitted(true)
      return
    }

    // Step 1: create/retrieve Stripe customer and a SetupIntent
    const { data, error: fnErr } = await supabase.functions.invoke('stripe-create-customer', {
      body: { user_id: user.id, email: user.email },
    })

    setSubmitting(false)

    if (fnErr || data?.error) {
      setActionErr(fnErr?.message ?? data?.error ?? 'Payment setup failed. Please try again.')
      return
    }

    setCustomerId(data.customerId)
    setSetupClientSecret(data.setupIntentClientSecret)
    setPaymentStep(true)
  }

  // Steps 2-6: card confirmed — update profile, create records, charge M1, activate job
  async function handleCardSaved(paymentMethodId) {
    setSubmitting(true)
    setActionErr('')

    // Step 4: persist Stripe customer + saved payment method to HM profile
    setProcessingMsg('Saving your payment details…')
    await supabase
      .from('hiring_company_profiles')
      .update({ stripe_customer_id: customerId, stripe_payment_method_id: paymentMethodId })
      .eq('user_id', user.id)

    // Step 5 (prerequisite): create assignment + milestones so stripe-charge-milestone has an ID to work with
    setProcessingMsg('Creating assignment…')
    const { ok, assignmentId } = await createAssignmentRecords()

    if (!ok) {
      setSubmitting(false)
      setProcessingMsg('')
      return
    }

    // Step 5: charge Stage 1 using the saved payment method
    setProcessingMsg('Processing Stage 1 payment…')
    const { data: chargeData, error: chargeErr } = await supabase.functions.invoke('stripe-charge-milestone', {
      body: { assignment_id: assignmentId, milestone_number: 1 },
    })

    if (chargeErr || chargeData?.error) {
      setSubmitting(false)
      setProcessingMsg('')
      setActionErr(chargeErr?.message ?? chargeData?.error ?? 'Stage 1 payment failed. Please contact support.')
      return
    }

    // Step 6: charge succeeded — activate job and notify recruiter
    setProcessingMsg('Activating job…')
    await activateJob()

    setSubmitting(false)
    setProcessingMsg('')
    setSubmitted(true)
  }

  function handleCardError(msg) {
    setActionErr(msg)
  }

  // ── Payment step (card collection) ────────────────────────────────
  if (paymentStep && setupClientSecret) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <Link to="/hiring-manager/dashboard" className="text-lg font-bold text-slate-900 tracking-tight">
              Talent<span className="text-primary-600">Desk</span>
            </Link>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Payment Card</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Your card is saved for automatic charges at each milestone stage.
            </p>
          </div>

          <div className="card">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Payment Summary</h2>
            <dl className="space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <dt className="text-gray-500">Role</dt>
                <dd className="font-medium text-gray-900">{job.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Recruiter</dt>
                <dd className="font-medium text-gray-900">{recruiter.first_name} {recruiter.last_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Stage 1 — due now (20%)</dt>
                <dd className="font-bold text-gray-900 text-base">{fmtCurrency(m1Charge, currency)}</dd>
              </div>
            </dl>

            {submitting && processingMsg && (
              <div className="flex items-center gap-2 text-sm text-primary-600 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
                {processingMsg}
              </div>
            )}

            {actionErr && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                {actionErr}
              </div>
            )}

            {!submitting && (
              <SetupForm
                clientSecret={setupClientSecret}
                amount={m1Charge}
                currency={currency}
                email={user.email}
                onSuccess={handleCardSaved}
                onError={handleCardError}
                onCancel={() => { setPaymentStep(false); setSetupClientSecret(null); setCustomerId(null) }}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Main form ─────────────────────────────────────────────────────
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

        {/* Recruiter bank account warning */}
        {!recruiter.stripe_account_id && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This recruiter has not yet connected their bank account. They have been notified and you can proceed — payment will be held until they connect.
            </p>
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
                <dd className="font-medium text-gray-900 capitalize">{job.seniority_level.replace('_', '-')}</dd>
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
              <p className="text-xs text-gray-500 mt-0.5">Placement fee: {fee}% of agreed annual salary</p>
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
              <div className="space-y-0">
                {milestones.map((m, i) => (
                  <div key={m.number}
                    className={`flex items-start justify-between py-3 ${i < milestones.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Stage {m.number}: {m.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {m.pct}% of total — charged {m.chargeAt}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{fmtCurrency(m.charge, currency)}</p>
                      {m.number === 1 && (
                        <p className="text-xs text-primary-600 font-medium mt-0.5">Due today</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                Your card is saved at checkout and charged automatically at each stage — no manual action required.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 italic">
              No salary entered — fee will be agreed on start.
            </p>
          )}
        </div>

        {/* Shortlist size */}
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
            {submitting
              ? 'Preparing payment…'
              : totalFee > 0
                ? `Pay Stage 1 — ${fmtCurrency(m1Charge, currency)} and Start Job`
                : 'Start Job'}
          </button>
          {!allAgreed && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Confirm all four terms above to continue
            </p>
          )}
          {totalFee > 0 && allAgreed && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Stage 1 ({fmtCurrency(m1Charge, currency)}) is charged today. Stages 2 and 3 are charged automatically at subsequent milestones.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StartJob() {
  return (
    <Elements stripe={stripePromise}>
      <StartJobInner />
    </Elements>
  )
}
