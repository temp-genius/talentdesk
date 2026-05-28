import { useEffect, useState, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { sendJobWithdrawnByRecruiterNotification } from '../../lib/emailService'

const WITHDRAW_REASONS = [
  'Role no longer suitable for my specialisation',
  'Capacity constraints — unable to continue',
  'Communication issues with hiring company',
  'Other',
]

function fmtCurrency(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(amount)
}

function paymentImplication(milestones, currency) {
  const released = milestones.filter(m => m.status === 'released')
  if (released.length === 0) {
    return 'No milestones have been released. You will not receive any payment for this assignment.'
  }
  if (released.length === 1) {
    const amt = fmtCurrency(milestones[0].amount, currency)
    return `Milestone 1 payment of ${amt} has already been released to you. Milestones 2 and 3 will be refunded to the hiring company.`
  }
  const total = released.reduce((s, m) => s + (m.amount ?? 0), 0)
  return `Milestones 1 and 2 totalling ${fmtCurrency(total, currency)} have been released to you. Only Milestone 3 will be refunded to the hiring company.`
}

export default function WithdrawJob() {
  const { assignmentId } = useParams()
  const { user }         = useAuth()
  const navigate         = useNavigate()

  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [reason,     setReason]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formErr,    setFormErr]    = useState('')

  const load = useCallback(async () => {
    const { data: row, error: err } = await supabase
      .from('job_recruiter_assignments')
      .select(`
        id,
        jobs(id, title, currency),
        recruiter_profiles(first_name, last_name),
        milestones(id, milestone_number, amount, status)
      `)
      .eq('id', assignmentId)
      .single()

    if (err) { setError(err.message); setLoading(false); return }
    setData(row)
    setLoading(false)
  }, [assignmentId])

  useEffect(() => { if (user) load() }, [user, load])

  async function handleConfirm() {
    if (!reason) { setFormErr('Please select a reason before confirming.'); return }
    setFormErr('')
    setSubmitting(true)

    const { data: result, error: rpcErr } = await supabase.rpc('withdraw_from_job', {
      p_assignment_id: assignmentId,
    })
    if (rpcErr || result?.error) {
      setFormErr(rpcErr?.message ?? result?.error ?? 'Something went wrong.')
      setSubmitting(false)
      return
    }

    // Get HM email via SECURITY DEFINER RPC
    const { data: hmEmail } = await supabase.rpc('get_hm_email_for_assignment', {
      p_assignment_id: assignmentId,
    })
    if (hmEmail) {
      const recruiter = data?.recruiter_profiles
      const recruiterName = recruiter
        ? `${recruiter.first_name} ${recruiter.last_name}`
        : 'The recruiter'
      sendJobWithdrawnByRecruiterNotification(hmEmail, data.jobs?.title, recruiterName, reason)
    }

    navigate('/recruiter/dashboard', { replace: true })
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
        <Link to="/recruiter/dashboard" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  )

  const job        = data?.jobs
  const milestones = data?.milestones ?? []
  const implication = paymentImplication(milestones, job?.currency)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link to={`/recruiter/job/${assignmentId}`} className="text-sm text-gray-500 hover:text-gray-900 flex-shrink-0">
            ← Job Overview
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900">Withdraw from Role</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Withdraw from this role</h1>
          {job?.title && (
            <p className="text-sm text-gray-500 mt-1">{job.title}</p>
          )}
        </div>

        {/* Warning banner */}
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800">This action cannot be undone</p>
              <p className="text-sm text-red-700 mt-1">
                Withdrawing will end your engagement immediately and notify the hiring company.
              </p>
            </div>
          </div>
        </div>

        {/* Payment implications */}
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Payment implications</h2>
          <p className="text-sm text-gray-600">{implication}</p>
        </div>

        <div className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for withdrawing *
            </label>
            <select
              className="input"
              value={reason}
              onChange={e => setReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              {WITHDRAW_REASONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {formErr && <p className="text-sm text-red-600">{formErr}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? 'Withdrawing…' : 'Confirm Withdrawal'}
            </button>
            <Link to={`/recruiter/job/${assignmentId}`} className="btn-secondary flex-1 text-center">
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
