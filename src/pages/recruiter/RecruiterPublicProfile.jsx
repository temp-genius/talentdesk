import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/layout/Logo'

/* ── Shared UI helpers ── */
function Stars({ rating }) {
  const filled = Math.round(rating ?? 0)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`w-4 h-4 ${n <= filled ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function Tag({ label, color = 'gray' }) {
  const cls = {
    gray:  'bg-gray-100 text-gray-700',
    blue:  'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
  }[color] ?? 'bg-gray-100 text-gray-700'
  return <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${cls}`}>{label}</span>
}

function AvailabilityBadge({ status }) {
  const map = {
    available:   { label: 'Available now', cls: 'bg-green-100 text-green-700', dot: true },
    limited:     { label: 'Limited',        cls: 'bg-amber-100 text-amber-700', dot: false },
    unavailable: { label: 'Unavailable',    cls: 'bg-gray-100 text-gray-500',  dot: false },
  }
  const { label, cls, dot } = map[status] ?? map.unavailable
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
      {dot && <span className="w-2 h-2 rounded-full bg-green-500" />}
      {label}
    </span>
  )
}

function StatBox({ value, label }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function ReviewCard({ review }) {
  const overall = review.overall_score
    ?? ((review.speed_rating + review.quality_rating + review.communication_rating + review.market_knowledge_rating) / 4)
  return (
    <div className="border border-gray-100 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stars rating={overall} />
          <span className="text-sm font-medium text-gray-700">{Number(overall).toFixed(1)}</span>
        </div>
        <span className="text-xs text-gray-400 capitalize">{review.reviewer_type?.replace('_', ' ')}</span>
      </div>
      {review.written_comment && (
        <p className="text-sm text-gray-600 leading-relaxed">"{review.written_comment}"</p>
      )}
      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 pt-1">
        {[
          { label: 'Speed',    val: review.speed_rating },
          { label: 'Quality',  val: review.quality_rating },
          { label: 'Comms',    val: review.communication_rating },
          { label: 'Market',   val: review.market_knowledge_rating },
        ].map(({ label, val }) => val != null && (
          <div key={label}>
            <span className="text-gray-400">{label}: </span>
            <span className="font-medium text-gray-700">{val}/5</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SendMessageModal({ recruiterUserId, recruiterName, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlJobId = searchParams.get('job')

  const [jobs,       setJobs]      = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [selectedJob, setSelectedJob] = useState(urlJobId ?? '')
  const [body,       setBody]      = useState('Hello, I would like to discuss a role with you.')
  const [sending,    setSending]   = useState(false)
  const [error,      setError]     = useState('')

  useEffect(() => {
    if (!user) return
    supabase
      .from('jobs')
      .select('id, title, status')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setJobs(list)
        if (!urlJobId && list.length === 1) setSelectedJob(list[0].id)
        setLoadingJobs(false)
      })
  }, [user, urlJobId])

  async function handleSend(e) {
    e.preventDefault()
    if (!selectedJob || !body.trim()) return
    setSending(true)
    setError('')
    const { error: err } = await supabase.from('messages').insert({
      job_id:           selectedJob,
      sender_user_id:   user.id,
      recipient_user_id: recruiterUserId,
      message_body:     body.trim(),
    })
    if (err) { setError(err.message); setSending(false); return }
    console.log('Email notification queued:', { to: recruiterUserId, from: user.id, jobId: selectedJob })
    navigate('/messages')
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Message {recruiterName}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your message will be linked to a role posting</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">{error}</div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {loadingJobs ? (
            <div className="h-9 bg-gray-100 rounded animate-pulse" />
          ) : jobs.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700 mb-2">You need to post a role before starting a conversation.</p>
              <Link to="/post-job" className="btn-primary text-xs px-3 py-1.5">Post a Role →</Link>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="input" value={selectedJob} onChange={e => setSelectedJob(e.target.value)} required>
                <option value="">Select a role…</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
          )}

          {jobs.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="input resize-none" rows={4}
                  value={body} onChange={e => setBody(e.target.value)} required
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full disabled:opacity-50"
                disabled={sending || !selectedJob || !body.trim()}
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default function RecruiterPublicProfile() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const urlJobId = searchParams.get('job')
  const { user, userType } = useAuth()

  const [profile,  setProfile]  = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showMsg,  setShowMsg]  = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      // Fetch recruiter profile with related data
      const { data: p, error } = await supabase
        .from('recruiter_profiles')
        .select(`
          id, user_id, first_name, last_name, bio, headline, sample_placements,
          profile_photo_url, years_experience, availability_status, preferred_fee_percentage,
          total_placements, average_days_to_shortlist, linkedin_url,
          linkedin_network_size_tier, response_time_average, created_at,
          career_dna, capacity_status, previous_employers, previous_client_types,
          last_placement_at,
          recruiter_specialisms!left(specialism_categories(sector, specialism_name)),
          recruiter_locations(country, region),
          recruiter_tools(tool_name, verified),
          recruiter_scores(overall_average, total_hm_reviews, total_candidate_reviews, average_candidate_satisfaction)
        `)
        .eq('id', id)
        .eq('status', 'approved')
        .single()

      if (error || !p) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setProfile(p)

      // Fetch reviews via assignment IDs (RLS: visible to authenticated users on that assignment)
      const { data: assignments } = await supabase
        .from('job_recruiter_assignments')
        .select('id')
        .eq('recruiter_id', id)

      if (assignments?.length > 0) {
        const ids = assignments.map(a => a.id)
        const { data: rv } = await supabase
          .from('reviews')
          .select('speed_rating, quality_rating, communication_rating, market_knowledge_rating, overall_score, written_comment, reviewer_type, created_at')
          .in('job_recruiter_assignment_id', ids)
          .eq('visible', true)
          .order('created_at', { ascending: false })
        setReviews(rv ?? [])
      }

      setLoading(false)
    }

    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">This recruiter profile could not be found.</p>
          <Link to="/" className="btn-secondary text-sm">Go home</Link>
        </div>
      </div>
    )
  }

  const scores     = profile.recruiter_scores?.[0] ?? null
  const markets    = profile.recruiter_locations?.map(l => l.country) ?? []
  const tools      = profile.recruiter_tools ?? []
  const rating     = scores?.overall_average ?? null
  const totalReviews = (scores?.total_hm_reviews ?? 0) + (scores?.total_candidate_reviews ?? 0)

  const CAREER_DNA_TAGS = {
    agency:  { tags: [{ label: 'Agency Recruiter', cls: 'bg-blue-100 text-blue-700' }],                                                             desc: 'Comes from agency recruitment — experienced in headhunting, volume pipelines, and multi-client delivery.' },
    inhouse: { tags: [{ label: 'In-House TA',      cls: 'bg-purple-100 text-purple-700' }],                                                         desc: 'Comes from internal talent acquisition — deep expertise in culture fit, stakeholder management, and employer branding.' },
    hybrid:  { tags: [{ label: 'Agency Recruiter', cls: 'bg-blue-100 text-blue-700' }, { label: 'In-House TA', cls: 'bg-purple-100 text-purple-700' }], desc: 'Significant experience in both agency recruitment and in-house talent acquisition.' },
  }
  const CAPACITY_META = {
    open_to_new:  { label: 'Open to new roles',  bar: 'bg-green-500', pct: 33,  cls: 'text-green-700 bg-green-50' },
    nearly_full:  { label: 'Nearly at capacity', bar: 'bg-amber-500', pct: 66,  cls: 'text-amber-700 bg-amber-50' },
    full:         { label: 'At full capacity',   bar: 'bg-red-500',   pct: 100, cls: 'text-red-700 bg-red-50'     },
  }
  const CLIENT_TYPE_LABELS = {
    startup: 'Startups', scaleup: 'Scale-ups', enterprise: 'Enterprise',
    sme: 'SME', public_sector: 'Public Sector',
  }

  function feeDisplay(val) {
    if (val == null) return null
    const nums = val.toString().split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n)).sort((a, b) => a - b)
    if (nums.length === 0) return null
    if (nums.length === 1) return `${nums[0]}%`
    return `${nums[0]}–${nums[nums.length - 1]}%`
  }

  const careerDnaMeta  = CAREER_DNA_TAGS[profile.career_dna] ?? null
  const capacityMeta   = CAPACITY_META[profile.capacity_status] ?? null
  const employers      = (profile.previous_employers ?? '').split(',').map(s => s.trim()).filter(Boolean)
  const clientTypes    = profile.previous_client_types ?? []

  function lastPlacementLabel(dateStr) {
    if (!dateStr) return null
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (days < 7)   return 'in the last week'
    if (days < 30)  return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }
  const lastPlacement = lastPlacementLabel(profile.last_placement_at)

  // Group specialisms by sector
  const specialismsBySector = (profile.recruiter_specialisms ?? []).reduce((acc, rs) => {
    const cat = rs.specialism_categories
    if (!cat) return acc
    if (!acc[cat.sector]) acc[cat.sector] = []
    acc[cat.sector].push(cat.specialism_name)
    return acc
  }, {})
  const firstSector = Object.keys(specialismsBySector)[0] ?? null

  const initials = [profile.first_name, profile.last_name]
    .filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?'

  const fullName  = [profile.first_name, profile.last_name].filter(Boolean).join(' ')
  const headline  = profile.headline || [firstSector, profile.years_experience ? `${profile.years_experience} yrs exp` : null].filter(Boolean).join(' · ')
  const isHM      = user && userType === 'hiring_manager'

  return (
    <div className="min-h-screen bg-gray-50">
      {showMsg && profile?.user_id && (
        <SendMessageModal
          recruiterUserId={profile.user_id}
          recruiterName={profile.first_name}
          onClose={() => setShowMsg(false)}
        />
      )}

      {/* Nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          {isHM && (
            <Link to="/browse-recruiters" className="btn-secondary text-sm">← Browse Recruiters</Link>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">

          {/* ── Left column: main profile ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl
                                flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile.profile_photo_url
                    ? <img src={profile.profile_photo_url} alt={initials} className="w-full h-full object-cover" />
                    : initials}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                  {headline && <p className="text-gray-500 mt-0.5">{headline}</p>}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <AvailabilityBadge status={profile.availability_status} />
                    {profile.response_time_average != null && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                        ⚡ Usually responds in ~{Math.round(profile.response_time_average)}h
                      </span>
                    )}
                    {profile.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
                         className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors">
                        LinkedIn Profile ↗
                      </a>
                    )}
                  </div>

                  {/* Rating */}
                  {rating != null && (
                    <div className="flex items-center gap-2 mt-3">
                      <Stars rating={rating} />
                      <span className="text-sm font-medium text-gray-700">{Number(rating).toFixed(1)}</span>
                      {totalReviews > 0 && <span className="text-sm text-gray-400">({totalReviews} reviews)</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About</h2>
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Career DNA + Capacity */}
            {(careerDnaMeta || capacityMeta || employers.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                {careerDnaMeta && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Career DNA</h2>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-wrap gap-1.5 flex-shrink-0">
                        {careerDnaMeta.tags.map(tag => (
                          <span key={tag.label} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${tag.cls}`}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{careerDnaMeta.desc}</p>
                    </div>
                  </div>
                )}

                {capacityMeta && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Capacity</h2>
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg ${capacityMeta.cls}`}>
                      <div className="w-24 bg-white/60 rounded-full h-2">
                        <div className={`${capacityMeta.bar} h-2 rounded-full`} style={{ width: `${capacityMeta.pct}%` }} />
                      </div>
                      <span className="text-sm font-medium">{capacityMeta.label}</span>
                    </div>
                  </div>
                )}

                {employers.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Previous Employers</h2>
                    <div className="flex flex-wrap gap-2">
                      {employers.map(emp => (
                        <span key={emp} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-700">
                          {emp}
                        </span>
                      ))}
                    </div>
                    {clientTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {clientTypes.map(ct => (
                          <Tag key={ct} label={CLIENT_TYPE_LABELS[ct] ?? ct} color="blue" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Track record */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Track Record</h2>
              <div className="grid grid-cols-3 gap-4">
                <StatBox value={profile.total_placements ?? 0} label="Total Placements" />
                <StatBox
                  value={profile.average_days_to_shortlist ? `${Math.round(profile.average_days_to_shortlist)}d` : null}
                  label="Avg Days to Shortlist"
                />
                <StatBox
                  value={rating ? Number(rating).toFixed(1) : null}
                  label={`Rating (${totalReviews} reviews)`}
                />
              </div>
              {lastPlacement && (
                <p className="text-sm text-gray-500 mt-4">
                  Last verified placement: <span className="font-medium text-gray-700">{lastPlacement}</span>
                  <span className="text-xs text-gray-400 ml-1">(verified by platform)</span>
                </p>
              )}
            </div>

            {/* Notable Placements */}
            {profile.sample_placements && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notable Placements</h2>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{profile.sample_placements}</p>
              </div>
            )}

            {/* Specialisms & markets */}
            {(Object.keys(specialismsBySector).length > 0 || markets.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                {Object.keys(specialismsBySector).length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Specialisms</h2>
                    <div className="space-y-3">
                      {Object.entries(specialismsBySector).map(([sector, specs]) => (
                        <div key={sector}>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">{sector}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {specs.map(s => <Tag key={s} label={s} color="blue" />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {markets.length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Markets</h2>
                    <div className="flex flex-wrap gap-2">
                      {markets.map(m => <Tag key={m} label={m} color="gray" />)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tools */}
            {tools.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tools & Platforms</h2>
                <div className="flex flex-wrap gap-2">
                  {tools.map(t => (
                    <span key={t.tool_name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      {t.tool_name}
                      {t.verified && (
                        <span className="text-green-600" title="Verified">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl border border-gray-200 p-6" id="reviews">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar: contact + fee ── */}
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Fee card */}
            {feeDisplay(profile.preferred_fee_percentage) && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Standard rate</p>
                <p className="text-4xl font-extrabold text-primary-600">{feeDisplay(profile.preferred_fee_percentage)}</p>
                <p className="text-xs text-gray-400 mt-1">Actual fee agreed on engagement — within the Vetted TA 6 to 10 percent range.</p>
              </div>
            )}

            {/* Contact block */}
            <div className="bg-white rounded-xl border border-gray-200 p-5" id="contact">
              {isHM ? (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">Contact {profile.first_name}</h3>
                  <p className="text-xs text-gray-500 mb-4">Send a message to discuss a role or ask a question.</p>
                  <button className="btn-primary w-full" onClick={() => setShowMsg(true)}>Send Message</button>
                  {urlJobId && (
                    <Link
                      to={`/start-job?recruiter_id=${profile.id}&job_id=${urlJobId}`}
                      className="btn-secondary w-full block text-center mt-2 text-sm"
                    >
                      Start Job Agreement
                    </Link>
                  )}
                </>
              ) : user ? (
                <p className="text-sm text-gray-500 text-center">
                  Only hiring managers can contact recruiters.
                </p>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Sign in to contact this recruiter</p>
                  <Link to="/login" className="btn-primary w-full block text-center">Sign in</Link>
                </div>
              )}
            </div>

            {/* LinkedIn network size */}
            {profile.linkedin_network_size_tier && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">LinkedIn Network</p>
                <p className="text-sm font-medium text-gray-800 capitalize">
                  {{
                    small: 'Small (under 1,000)',
                    medium: 'Medium (1,000–5,000)',
                    large: 'Large (5,000–10,000)',
                    xlarge: 'X-Large (10,000+)',
                  }[profile.linkedin_network_size_tier] ?? profile.linkedin_network_size_tier}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
