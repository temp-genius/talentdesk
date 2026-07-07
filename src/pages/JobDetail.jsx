import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/layout/Logo'
import {
  sendProposalShortlistedNotification,
  sendProposalRejectedNotification,
  sendProposalRoleFilledNotification,
  sendProposalAcceptedNotification,
  sendProposalSubmittedAdminNotification,
} from '../lib/emailService'

const SENIORITY_LABELS  = { junior: 'Junior', mid: 'Mid', senior: 'Senior', director: 'Director', c_suite: 'C-Suite' }
const LOCATION_LABELS   = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' }
const ROLE_TYPE_LABELS  = { permanent: 'Permanent', contract: 'Contract' }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatDeadline(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`
}

const RECRUITER_STATUS_CFG = {
  submitted:   { label: 'Proposal submitted', bg: 'bg-blue-50',     text: 'text-blue-700'    },
  shortlisted: { label: 'Shortlisted',        bg: 'bg-green-50',    text: 'text-green-700'   },
  rejected:    { label: 'Not selected',       bg: 'bg-gray-100',    text: 'text-gray-600'    },
  accepted:    { label: 'Accepted',           bg: 'bg-primary-50',  text: 'text-primary-700' },
  withdrawn:   { label: 'Withdrawn',          bg: 'bg-gray-100',    text: 'text-gray-500'    },
}

const HM_STATUS_CFG = {
  submitted:   { label: 'New',         bg: 'bg-blue-50',    text: 'text-blue-700'    },
  shortlisted: { label: 'Shortlisted', bg: 'bg-green-50',   text: 'text-green-700'   },
  rejected:    { label: 'Rejected',    bg: 'bg-red-50',     text: 'text-red-700'     },
  accepted:    { label: 'Accepted',    bg: 'bg-primary-50', text: 'text-primary-700' },
  withdrawn:   { label: 'Withdrawn',   bg: 'bg-gray-100',   text: 'text-gray-500'    },
}

function fmt(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function salaryRange(job) {
  if (!job.salary_min && !job.salary_max) return null
  const cur = job.currency ?? 'EUR'
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min, cur)} – ${fmt(job.salary_max, cur)}`
  if (job.salary_min) return `From ${fmt(job.salary_min, cur)}`
  return `Up to ${fmt(job.salary_max, cur)}`
}

function Pill({ children, bg, text }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {children}
    </span>
  )
}

function JobMetaBadges({ job }) {
  const salary = salaryRange(job)
  const location = [job.location_city, job.location_country].filter(Boolean).join(', ') || null
  return (
    <div className="flex flex-wrap gap-2">
      {job.location_type && (
        <Pill bg="bg-blue-50" text="text-blue-700">{LOCATION_LABELS[job.location_type] ?? job.location_type}</Pill>
      )}
      {job.seniority_level && (
        <Pill bg="bg-gray-100" text="text-gray-700">{SENIORITY_LABELS[job.seniority_level] ?? job.seniority_level}</Pill>
      )}
      {job.role_type && (
        <Pill bg="bg-gray-100" text="text-gray-700">{ROLE_TYPE_LABELS[job.role_type] ?? job.role_type}</Pill>
      )}
      {salary && <Pill bg="bg-green-50" text="text-green-700">{salary}</Pill>}
      {location && <Pill bg="bg-gray-100" text="text-gray-600">{location}</Pill>}
    </div>
  )
}

// ─── Recruiter: existing proposal display ────────────────────────────────────

function ExistingProposalCard({ proposal, onWithdraw, withdrawing }) {
  const cfg = RECRUITER_STATUS_CFG[proposal.status] ?? RECRUITER_STATUS_CFG.submitted
  const submittedDate = new Date(proposal.submitted_at).toLocaleDateString('en-IE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">Your proposal</h2>
        <Pill bg={cfg.bg} text={cfg.text}>{cfg.label}</Pill>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Fee proposed</p>
          <p className="font-semibold text-gray-900">{proposal.proposed_fee_percentage}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Submitted</p>
          <p className="text-gray-700">{submittedDate}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1">Your pitch</p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.pitch}</p>
      </div>

      {proposal.relevant_experience && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Relevant experience</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.relevant_experience}</p>
        </div>
      )}

      {proposal.status === 'shortlisted' && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm text-green-800 font-medium">
            You've been shortlisted. The hiring manager may reach out to start a job agreement.
          </p>
        </div>
      )}

      {proposal.status === 'submitted' && (
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={onWithdraw}
            disabled={withdrawing}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {withdrawing ? 'Withdrawing…' : 'Withdraw proposal'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Recruiter: submit proposal form ─────────────────────────────────────────

const FEE_OPTIONS = [
  { value: 8,  label: '8%',  sub: 'Competitive' },
  { value: 10, label: '10%', sub: 'Standard'    },
  { value: 12, label: '12%', sub: 'Premium'      },
]

function ProposalForm({ jobId, recruiterId, feeFloor, feeCeiling, onSubmitted }) {
  const filteredFeeOptions = FEE_OPTIONS.filter(o =>
    (feeFloor == null || o.value >= feeFloor) &&
    (feeCeiling == null || o.value <= feeCeiling)
  )

  const [fee,              setFee]              = useState(
    () => filteredFeeOptions.find(o => o.value === (feeFloor ?? 8))?.value
          ?? filteredFeeOptions[0]?.value ?? 8
  )
  const [pitch,            setPitch]            = useState('')
  const [exp,              setExp]              = useState('')
  const [sourcingStrategy,  setSourcingStrategy]  = useState('')
  const [toolsUsed,         setToolsUsed]         = useState('')
  const [deliveryDays,      setDeliveryDays]      = useState('')
  const [screeningStrategy, setScreeningStrategy] = useState('')
  const [trackRecord,       setTrackRecord]       = useState('')
  const [submitting,        setSubmitting]        = useState(false)
  const [error,            setError]            = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pitch.trim()) { setError('A pitch is required'); return }
    setSubmitting(true)
    setError('')

    const { error: err } = await supabase
      .from('job_proposals')
      .insert({
        job_id:                  jobId,
        recruiter_id:            recruiterId,
        proposed_fee_percentage: fee,
        pitch:                   pitch.trim(),
        relevant_experience:     exp.trim() || null,
        sourcing_strategy:       sourcingStrategy.trim() || null,
        tools_used:              toolsUsed.trim() || null,
        delivery_timeline_days:  deliveryDays ? parseInt(deliveryDays, 10) : null,
        screening_strategy:      screeningStrategy.trim() || null,
        track_record:            trackRecord.trim() || null,
      })

    if (err) { setError(err.message); setSubmitting(false); return }

    onSubmitted()
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <h2 className="text-base font-semibold text-gray-900">Submit a proposal</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Proposed fee <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          {filteredFeeOptions.map(o => (
            <label
              key={o.value}
              className={`flex-1 flex flex-col items-center border rounded-lg py-3 px-2 cursor-pointer transition-colors ${
                fee === o.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <input
                type="radio" name="fee" value={o.value}
                checked={fee === o.value}
                onChange={() => setFee(o.value)}
                className="sr-only"
              />
              <span className="text-lg font-bold text-gray-900">{o.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">{o.sub}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Why are you the right recruiter for this role? <span className="text-red-500">*</span>
        </label>
        <textarea
          className="input resize-none" rows={5}
          placeholder="Describe your approach, your network in this space, and why you're well-placed to fill this role…"
          value={pitch} onChange={e => setPitch(e.target.value)} required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relevant experience
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <textarea
          className="input resize-none" rows={3}
          placeholder="Have you recruited similar roles before? Describe relevant placements…"
          value={exp} onChange={e => setExp(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sourcing Strategy
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <textarea
          className="input resize-none" rows={3}
          placeholder="Where will you find these candidates? e.g. GitHub, specific Slack/Discord communities, niche job boards, your own network"
          value={sourcingStrategy} onChange={e => setSourcingStrategy(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tools You'll Use
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <textarea
          className="input resize-none" rows={3}
          placeholder="What tools or platforms will you use? e.g. LinkedIn Recruiter, Boolean search on GitHub, a specific ATS"
          value={toolsUsed} onChange={e => setToolsUsed(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How many business days until you can deliver the first shortlist?
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <input
          type="number" min={1} max={90}
          className="input w-32 text-sm"
          placeholder="e.g. 7"
          value={deliveryDays}
          onChange={e => setDeliveryDays(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Screening Strategy
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <textarea
          className="input resize-none" rows={3}
          placeholder="How will you vet candidates before sending them to me? e.g. technical screening calls, take-home tests, reference checks"
          value={screeningStrategy} onChange={e => setScreeningStrategy(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Track Record
          <span className="ml-2 text-xs font-normal text-gray-400">Optional</span>
        </label>
        <textarea
          className="input resize-none" rows={4}
          placeholder="Tell us about similar roles you've filled — e.g. 'While at Meta, filled 10 similar roles per quarter' or 'Placed 3 SREs at a Series B startup in 2024'"
          value={trackRecord} onChange={e => setTrackRecord(e.target.value)}
        />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
        {submitting ? 'Submitting…' : 'Submit proposal'}
      </button>
    </form>
  )
}

// ─── HM: single proposal card with shortlist/reject actions ──────────────────

function ProposalCard({ proposal, onUpdate, onAccept }) {
  const [updating,     setUpdating]     = useState(false)
  const [accepting,    setAccepting]    = useState(false)
  const [acceptError,  setAcceptError]  = useState('')
  const recruiter = proposal.recruiter_profiles
  const name = recruiter
    ? `${recruiter.first_name ?? ''} ${recruiter.last_name ?? ''}`.trim() || 'Recruiter'
    : 'Recruiter'
  const cfg = HM_STATUS_CFG[proposal.status] ?? HM_STATUS_CFG.submitted
  const submittedDate = new Date(proposal.submitted_at).toLocaleDateString('en-IE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  async function update(newStatus) {
    setUpdating(true)
    const { error } = await supabase
      .from('job_proposals')
      .update({ status: newStatus, responded_at: new Date().toISOString() })
      .eq('id', proposal.id)
    setUpdating(false)
    if (!error) onUpdate(proposal.id, newStatus)
  }

  async function handleAcceptClick() {
    setAccepting(true)
    setAcceptError('')
    const err = await onAccept(proposal.id, recruiter?.id)
    if (err) {
      setAcceptError(err)
      setAccepting(false)
    }
    // on success onAccept navigates away — component unmounts, no cleanup needed
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {recruiter?.id ? (
              <Link
                to={`/recruiter/profile/${recruiter.id}`}
                className="group inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                {name}
                <svg className="w-3.5 h-3.5 text-primary-400 group-hover:text-primary-600 transition-colors flex-shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{name}</span>
            )}
            <Pill bg={cfg.bg} text={cfg.text}>{cfg.label}</Pill>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Submitted {submittedDate}
            {' · '}
            <span className="font-medium text-gray-700">{proposal.proposed_fee_percentage}% fee</span>
            {proposal.delivery_timeline_days != null && (
              <>{' · '}Delivery: <span className="font-medium text-gray-700">{proposal.delivery_timeline_days} business days</span></>
            )}
          </p>
          {recruiter?.id && (
            <p className="text-xs text-gray-400 mt-0.5">View profile &amp; message</p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {proposal.status === 'submitted' && (
            <>
              <button
                onClick={() => update('shortlisted')}
                disabled={updating}
                className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
              >
                Shortlist
              </button>
              <button
                onClick={() => update('rejected')}
                disabled={updating}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
          {proposal.status === 'shortlisted' && (
            <>
              <button
                onClick={handleAcceptClick}
                disabled={accepting || updating}
                className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
              >
                {accepting ? 'Accepting…' : 'Accept & Start Job'}
              </button>
              <button
                onClick={() => update('rejected')}
                disabled={updating || accepting}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50"
              >
                Remove from shortlist
              </button>
            </>
          )}
        </div>
      </div>

      {acceptError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          {acceptError}
        </div>
      )}

      <div>
        <p className="text-xs text-gray-500 mb-1">Pitch</p>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.pitch}</p>
      </div>

      {proposal.relevant_experience && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Relevant experience</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.relevant_experience}</p>
        </div>
      )}

      {proposal.sourcing_strategy && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Sourcing strategy</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.sourcing_strategy}</p>
        </div>
      )}

      {proposal.tools_used && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Tools</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.tools_used}</p>
        </div>
      )}

      {proposal.screening_strategy && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Screening strategy</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.screening_strategy}</p>
        </div>
      )}

      {proposal.track_record && (
        <div>
          <p className="text-xs text-gray-500 mb-1">Track record</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.track_record}</p>
        </div>
      )}
    </div>
  )
}

// ─── Shared loading / error shells ───────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Logo />
        </div>
      </header>
      {children}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function JobDetail() {
  const { id: jobId } = useParams()
  const { user, userType, logout } = useAuth()
  const navigate = useNavigate()

  const [job,            setJob]            = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // recruiter-only
  const [myProfileId,    setMyProfileId]    = useState(null)
  const [myProfileName,  setMyProfileName]  = useState(null)
  const [myFeeFloor,     setMyFeeFloor]     = useState(null)
  const [myFeeCeiling,   setMyFeeCeiling]   = useState(null)
  const [myProposal,     setMyProposal]     = useState(null)
  const [proposalLoaded, setProposalLoaded] = useState(false)
  const [withdrawing,    setWithdrawing]    = useState(false)

  // HM-only
  const [proposals,      setProposals]      = useState([])
  const [isOwner,        setIsOwner]        = useState(false)

  useEffect(() => {
    if (!user || !jobId) return
    load()
  }, [user, jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true)

    if (userType === 'recruiter') {
      const [{ data: jobData, error: jobErr }, { data: profile }] = await Promise.all([
        supabase
          .from('jobs')
          .select('id, title, sector, seniority_level, location_type, location_country, location_city, salary_min, salary_max, currency, role_type, description, status, proposal_deadline')
          .eq('id', jobId)
          .single(),
        supabase
          .from('recruiter_profiles')
          .select('id, first_name, last_name, fee_floor, fee_ceiling')
          .eq('user_id', user.id)
          .single(),
      ])

      if (jobErr || !jobData) { setNotFound(true); setLoading(false); return }
      setJob(jobData)

      if (profile) {
        setMyProfileId(profile.id)
        setMyProfileName([profile.first_name, profile.last_name].filter(Boolean).join(' ') || null)
        setMyFeeFloor(profile.fee_floor ?? null)
        setMyFeeCeiling(profile.fee_ceiling ?? null)
        const { data: existing } = await supabase
          .from('job_proposals')
          .select('id, proposed_fee_percentage, pitch, relevant_experience, status, submitted_at')
          .eq('job_id', jobId)
          .eq('recruiter_id', profile.id)
          .maybeSingle()
        setMyProposal(existing ?? null)
      }
      setProposalLoaded(true)
    }

    if (userType === 'hiring_manager') {
      // Selecting hiring_company_profiles(id) will return non-null only when the
      // HM's own company owns this job (hcp_select RLS filters otherwise).
      const { data: jobData, error: jobErr } = await supabase
        .from('jobs')
        .select('id, title, sector, seniority_level, location_type, location_country, location_city, salary_min, salary_max, currency, role_type, description, status, hiring_company_profiles(id)')
        .eq('id', jobId)
        .single()

      if (jobErr || !jobData) { setNotFound(true); setLoading(false); return }
      setJob(jobData)

      const owned = !!jobData.hiring_company_profiles
      setIsOwner(owned)

      if (owned) {
        const { data: props } = await supabase
          .from('job_proposals')
          .select('id, proposed_fee_percentage, pitch, relevant_experience, sourcing_strategy, tools_used, delivery_timeline_days, screening_strategy, track_record, status, submitted_at, responded_at, recruiter_profiles(id, first_name, last_name)')
          .eq('job_id', jobId)
          .order('submitted_at', { ascending: false })
        setProposals(props ?? [])
      }
    }

    setLoading(false)
  }

  async function handleWithdraw() {
    if (!myProposal) return
    setWithdrawing(true)
    const { error } = await supabase
      .from('job_proposals')
      .update({ status: 'withdrawn' })
      .eq('id', myProposal.id)
    setWithdrawing(false)
    if (!error) setMyProposal(prev => ({ ...prev, status: 'withdrawn' }))
  }

  async function handleProposalSubmitted() {
    if (!myProfileId) return
    const { data } = await supabase
      .from('job_proposals')
      .select('id, proposed_fee_percentage, pitch, relevant_experience, status, submitted_at')
      .eq('job_id', jobId)
      .eq('recruiter_id', myProfileId)
      .maybeSingle()
    setMyProposal(data ?? null)
    sendProposalSubmittedAdminNotification(myProfileName || user.email, job?.title ?? 'a role')
      .catch(e => console.error('[JobDetail] admin proposal notification failed:', e))
  }

  function handleProposalUpdate(proposalId, newStatus) {
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: newStatus } : p))
    if (newStatus === 'shortlisted' || newStatus === 'rejected') {
      sendProposalStatusEmail(proposalId, newStatus)
        .catch(e => console.error('[JobDetail] proposal status email failed:', e))
    }
  }

  async function sendProposalStatusEmail(proposalId, newStatus) {
    const { data: email } = await supabase.rpc('get_recruiter_email_for_proposal', {
      p_proposal_id: proposalId,
    })
    if (!email) return
    if (newStatus === 'shortlisted') {
      sendProposalShortlistedNotification(email, job.title)
    } else {
      sendProposalRejectedNotification(email, job.title)
    }
  }

  async function handleAccept(proposalId, recruiterId) {
    if (!recruiterId) return 'Recruiter profile not found — cannot start job.'

    const { error } = await supabase
      .from('job_proposals')
      .update({ status: 'accepted', responded_at: new Date().toISOString() })
      .eq('id', proposalId)

    if (error) return error.message

    // Send acceptance email — awaited but non-blocking on failure
    try {
      const { data: email } = await supabase.rpc('get_recruiter_email_for_proposal', {
        p_proposal_id: proposalId,
      })
      if (email) await sendProposalAcceptedNotification(email, job.title)
    } catch (e) {
      console.error('[JobDetail] accept email failed:', e)
    }

    // Fetch proposals about to be bulk-rejected so we can notify them
    const { data: toReject } = await supabase
      .from('job_proposals')
      .select('id')
      .eq('job_id', jobId)
      .neq('id', proposalId)
      .in('status', ['submitted', 'shortlisted'])

    // Reject all remaining submitted/shortlisted proposals on this job (non-blocking)
    await supabase
      .from('job_proposals')
      .update({ status: 'rejected', responded_at: new Date().toISOString() })
      .eq('job_id', jobId)
      .neq('id', proposalId)
      .in('status', ['submitted', 'shortlisted'])

    // Notify bulk-rejected recruiters (fire and forget — don't block navigation)
    if (toReject?.length) {
      Promise.allSettled(
        toReject.map(async (rp) => {
          const { data: email } = await supabase.rpc(
            'get_recruiter_email_for_proposal',
            { p_proposal_id: rp.id }
          )
          if (email) sendProposalRoleFilledNotification(email, job.title)
        })
      ).catch(err => console.error('[JobDetail] bulk-reject notifications failed:', err))
    }

    navigate(`/start-job?recruiter_id=${recruiterId}&job_id=${jobId}`)
    return null
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </PageShell>
    )
  }

  if (notFound || !job) {
    const backTo = userType === 'recruiter' ? '/recruiter/browse-jobs' : '/jobs'
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-gray-600 font-medium mb-4">Role not found</p>
          <Link to={backTo} className="btn-secondary text-sm">Back to jobs</Link>
        </div>
      </PageShell>
    )
  }

  // ── RECRUITER VIEW ──────────────────────────────────────────────────────────
  if (userType === 'recruiter') {
    const isOpen = job.status === 'open_for_proposals'

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/recruiter/dashboard"><Logo /></Link>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/recruiter/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/recruiter/browse-jobs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Browse Roles
              </Link>
              <Link to="/recruiter/messages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Messages
              </Link>
              <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
            </div>
            {/* Mobile controls */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="p-1 text-gray-500 hover:text-gray-900 transition-colors md:hidden"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 px-6 py-4 flex flex-col gap-3 bg-white">
              <Link to="/recruiter/dashboard" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/recruiter/browse-jobs" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>Browse Roles</Link>
              <Link to="/recruiter/messages" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <button className="text-left text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={logout}>Sign out</button>
            </div>
          )}
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link to="/recruiter/browse-jobs" className="text-sm text-primary-600 hover:underline mb-6 inline-block">
            ← Back to browse
          </Link>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* Job details */}
            <div className="lg:col-span-3 card space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                  {!isOpen && (
                    <Pill bg="bg-gray-100" text="text-gray-600">Closed</Pill>
                  )}
                </div>
                {job.sector && <p className="text-sm text-gray-500">{job.sector}</p>}
              </div>

              <JobMetaBadges job={job} />

              {job.proposal_deadline && (
                <div className="flex items-center gap-1.5 text-sm text-amber-700">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Proposals close <strong>{formatDeadline(job.proposal_deadline)}</strong></span>
                </div>
              )}

              {job.description ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No description provided</p>
              )}
            </div>

            {/* Proposal panel */}
            <div className="lg:col-span-2">
              {!proposalLoaded ? (
                <div className="card flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                </div>
              ) : myProposal ? (
                <ExistingProposalCard
                  proposal={myProposal}
                  onWithdraw={handleWithdraw}
                  withdrawing={withdrawing}
                />
              ) : isOpen ? (
                <ProposalForm
                  jobId={jobId}
                  recruiterId={myProfileId}
                  feeFloor={myFeeFloor}
                  feeCeiling={myFeeCeiling}
                  onSubmitted={handleProposalSubmitted}
                />
              ) : (
                <div className="card text-center py-10">
                  <p className="text-sm text-gray-500">This role is no longer accepting proposals.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── HIRING MANAGER VIEW ─────────────────────────────────────────────────────
  if (userType === 'hiring_manager') {
    if (!isOwner) {
      return (
        <PageShell>
          <div className="flex flex-col items-center justify-center py-32">
            <p className="text-gray-600 font-medium mb-4">You don't have access to this role</p>
            <Link to="/jobs" className="btn-secondary text-sm">Back to my jobs</Link>
          </div>
        </PageShell>
      )
    }

    const shortlisted = proposals.filter(p => p.status === 'shortlisted')
    const newProps    = proposals.filter(p => p.status === 'submitted')
    const other       = proposals.filter(p => p.status !== 'shortlisted' && p.status !== 'submitted')

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/hiring-manager/dashboard"><Logo /></Link>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/hiring-manager/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/jobs" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                My Jobs
              </Link>
              <Link to="/messages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Messages
              </Link>
              <Link to="/post-job" className="btn-primary text-sm">Post a Role</Link>
              <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
            </div>
            {/* Mobile controls */}
            <div className="flex items-center gap-3 md:hidden">
              <Link to="/post-job" className="btn-primary text-sm">Post a Role</Link>
              <button
                onClick={() => setMobileMenuOpen(o => !o)}
                className="p-1 text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 px-6 py-4 flex flex-col gap-3 bg-white">
              <Link to="/hiring-manager/dashboard" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/jobs" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>My Jobs</Link>
              <Link to="/messages" className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}>Messages</Link>
              <button className="text-left text-sm text-gray-700 hover:text-gray-900 transition-colors"
                onClick={logout}>Sign out</button>
            </div>
          )}
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link to="/jobs" className="text-sm text-primary-600 hover:underline mb-6 inline-block">
            ← Back to my jobs
          </Link>

          {/* Job summary */}
          <div className="card mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h1>
            {job.sector && <p className="text-sm text-gray-500 mb-3">{job.sector}</p>}
            <JobMetaBadges job={job} />
            {job.description && (
              <p className="text-sm text-gray-700 leading-relaxed mt-4 whitespace-pre-wrap">{job.description}</p>
            )}
          </div>

          {/* Proposals header */}
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-lg font-bold text-gray-900">Proposals</h2>
            <p className="text-sm text-gray-500">
              {proposals.length} total · {shortlisted.length} shortlisted
            </p>
          </div>

          {proposals.length === 0 ? (
            <div className="card text-center py-14">
              <p className="font-medium text-gray-600 mb-1">No proposals yet</p>
              <p className="text-sm text-gray-400">
                Recruiters browsing the marketplace can submit proposals on this role
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {shortlisted.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Shortlisted ({shortlisted.length})
                  </h3>
                  <div className="space-y-4">
                    {shortlisted.map(p => (
                      <ProposalCard key={p.id} proposal={p} onUpdate={handleProposalUpdate} onAccept={handleAccept} />
                    ))}
                  </div>
                </section>
              )}

              {newProps.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    New ({newProps.length})
                  </h3>
                  <div className="space-y-4">
                    {newProps.map(p => (
                      <ProposalCard key={p.id} proposal={p} onUpdate={handleProposalUpdate} onAccept={handleAccept} />
                    ))}
                  </div>
                </section>
              )}

              {other.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Other ({other.length})
                  </h3>
                  <div className="space-y-4">
                    {other.map(p => (
                      <ProposalCard key={p.id} proposal={p} onUpdate={handleProposalUpdate} onAccept={handleAccept} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
