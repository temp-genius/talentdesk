import { Link } from 'react-router-dom'

const AGENCY_TAG  = { label: 'Agency Recruiter', cls: 'bg-blue-100 text-blue-700' }
const INHOUSE_TAG = { label: 'In-House TA',      cls: 'bg-purple-100 text-purple-700' }

function careerDnaTags(value) {
  if (value === 'agency')  return [AGENCY_TAG]
  if (value === 'inhouse') return [INHOUSE_TAG]
  if (value === 'hybrid')  return [AGENCY_TAG, INHOUSE_TAG]
  return []
}

const CAPACITY_CONFIG = {
  open_to_new: {
    label: 'Taking on new mandates (2–3 roles available)',
    bar: 'bg-green-500', track: 'bg-green-100', pct: 33,
    text: 'text-green-700',
  },
  nearly_full: {
    label: 'Selective capacity (1 exclusive search)',
    bar: 'bg-amber-500', track: 'bg-amber-100', pct: 66,
    text: 'text-amber-700',
  },
  full: {
    label: 'Waitlist only (not taking new work)',
    bar: 'bg-gray-400', track: 'bg-gray-100', pct: 100,
    text: 'text-gray-500',
  },
}

const CLIENT_TYPE_LABELS = {
  startup: 'Startups', scaleup: 'Scale-ups', enterprise: 'Enterprise',
  sme: 'SME', public_sector: 'Public Sector',
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 30)  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`
}

function MetricBox({ value, label, fallbackValue, fallbackLabel }) {
  const hasValue = value != null
  return (
    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 text-center">
      <p className="text-xl font-bold text-gray-900 leading-none">
        {hasValue ? value : (fallbackValue ?? '—')}
      </p>
      <p className="text-xs text-gray-500 mt-1 leading-snug">
        {hasValue ? label : (fallbackLabel ?? label)}
      </p>
    </div>
  )
}

function Stars({ rating }) {
  const filled = Math.round(rating ?? 0)
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className={`w-3 h-3 ${n <= filled ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

export default function RecruiterCard({ recruiter, jobId, matchScore }) {
  const jobParam = jobId ? `?job=${jobId}` : ''

  const scores   = recruiter.recruiter_scores?.[0] ?? null
  const rating   = scores?.overall_average ?? null
  const reviews  = (scores?.total_hm_reviews ?? 0) + (scores?.total_candidate_reviews ?? 0)

  const specialisms = (recruiter.recruiter_specialisms ?? [])
    .map(rs => rs.specialism_categories?.specialism_name)
    .filter(Boolean)

  const initials = [recruiter.first_name, recruiter.last_name]
    .filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?'

  const firstSector = recruiter.recruiter_specialisms?.[0]?.specialism_categories?.sector ?? null
  const headline = recruiter.headline || [
    firstSector,
    recruiter.years_experience ? `${recruiter.years_experience} yrs exp` : null,
  ].filter(Boolean).join(' · ')

  const capacity    = CAPACITY_CONFIG[recruiter.capacity_status] ?? CAPACITY_CONFIG.open_to_new
  const dnaTags     = careerDnaTags(recruiter.career_dna)
  const employers   = (recruiter.previous_employers ?? '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
  const clientTypes = (recruiter.previous_client_types ?? []).slice(0, 4)
  const lastPlacement = timeAgo(recruiter.last_placement_at)
  const avgDays     = recruiter.average_days_to_shortlist ? Math.round(recruiter.average_days_to_shortlist) : null
  const placements  = recruiter.total_placements ?? 0

  // Left border accent based on match score
  const accentBorder = matchScore != null
    ? matchScore >= 70 ? 'border-l-4 border-l-green-500'
    : matchScore >= 40 ? 'border-l-4 border-l-amber-400'
    : ''
    : ''

  // Match badge colours
  const matchCfg = matchScore == null ? null
    : matchScore >= 70 ? { bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-700', label: `${matchScore}%` }
    : matchScore >= 40 ? { bg: 'bg-amber-50 border-amber-300',     text: 'text-amber-700',   label: `${matchScore}%` }
    :                    { bg: 'bg-gray-50 border-gray-300',        text: 'text-gray-500',    label: `${matchScore}%` }

  // Rating display
  const ratingDisplay = rating != null
    ? <span className="inline-flex items-center gap-1"><Stars rating={rating} /><span className="font-bold text-gray-900 text-xl leading-none">{Number(rating).toFixed(1)}</span></span>
    : null

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden ${accentBorder}`}>
      <div className="p-6">
        <div className="flex gap-6">

          {/* ── Left column: Identity (25%) ── */}
          <div className="w-1/4 flex-shrink-0 flex flex-col gap-3">
            {/* Avatar + name */}
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 font-bold text-lg
                              flex items-center justify-center flex-shrink-0 overflow-hidden">
                {recruiter.profile_photo_url
                  ? <img src={recruiter.profile_photo_url} alt={initials} className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="font-bold text-gray-900 text-base leading-tight">
                  {recruiter.first_name} {recruiter.last_name}
                </p>
                {headline && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-snug">{headline}</p>
                )}
              </div>
            </div>

            {/* Career DNA */}
            {dnaTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {dnaTags.map(tag => (
                  <span key={tag.label} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tag.cls}`}>
                    {tag.label}
                  </span>
                ))}
              </div>
            )}

            {/* Fee */}
            {recruiter.preferred_fee_percentage != null && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide leading-none mb-0.5">Placement fee</p>
                <p className="text-lg font-bold text-primary-600 leading-none">
                  {recruiter.preferred_fee_percentage}%
                </p>
              </div>
            )}
          </div>

          {/* ── Middle column: Track Record (40%) ── */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Metric boxes */}
            <div className="flex gap-2">
              <MetricBox
                value={placements > 0 ? placements : null}
                label="Mandates completed"
                fallbackValue="0"
              />
              <MetricBox
                value={avgDays != null ? `${avgDays}d` : null}
                label="Avg. days to first CVs"
                fallbackValue="—"
                fallbackLabel="Not yet recorded"
              />
              <MetricBox
                value={ratingDisplay}
                label={reviews > 0 ? `Platform rating (${reviews})` : 'Platform rating'}
                fallbackValue="New"
                fallbackLabel="New to platform"
              />
            </div>

            {/* Capacity bar */}
            <div>
              <div className={`w-full ${capacity.track} rounded-full h-2 mb-1.5`}>
                <div
                  className={`${capacity.bar} h-2 rounded-full transition-all`}
                  style={{ width: `${capacity.pct}%` }}
                />
              </div>
              <p className={`text-xs font-medium ${capacity.text}`}>{capacity.label}</p>
            </div>

            {/* Last placement */}
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lastPlacement ? (
                <p className="text-xs text-gray-500">
                  Last mandate delivered: <span className="font-medium text-gray-700">{lastPlacement}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">New to TalentDesk</p>
              )}
            </div>
          </div>

          {/* ── Right column: Specialisms + Employers (35%) ── */}
          <div className="w-[35%] flex-shrink-0 flex flex-col gap-3">
            {/* Match badge */}
            {matchCfg && (
              <div className={`self-end text-center border rounded-lg px-3 py-2 ${matchCfg.bg}`}>
                <p className={`text-xl font-extrabold leading-none ${matchCfg.text}`}>{matchCfg.label}</p>
                <p className={`text-xs mt-0.5 font-medium ${matchCfg.text}`}>Role compatibility</p>
              </div>
            )}

            {/* Specialisms */}
            {specialisms.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Top specialisms</p>
                <div className="flex flex-wrap gap-1">
                  {specialisms.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{s}</span>
                  ))}
                  {specialisms.length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-xs">+{specialisms.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Employers */}
            {employers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Previous employers</p>
                <div className="flex flex-wrap gap-1">
                  {employers.map(emp => (
                    <span key={emp} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">{emp}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom row: client types + actions ── */}
      <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between gap-4">
        {/* Client experience tags */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {clientTypes.length > 0 ? (
            <>
              <span className="text-xs text-gray-400 font-medium flex-shrink-0">Client experience:</span>
              {clientTypes.map(ct => (
                <span key={ct} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                  {CLIENT_TYPE_LABELS[ct] ?? ct}
                </span>
              ))}
            </>
          ) : (
            <span />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to={`/recruiter/profile/${recruiter.id}${jobParam}`}
            className="btn-secondary text-sm px-4 py-1.5 whitespace-nowrap"
          >
            View Profile
          </Link>
          <Link
            to={`/recruiter/profile/${recruiter.id}${jobParam}#contact`}
            className="btn-primary text-sm px-4 py-1.5 whitespace-nowrap"
          >
            Message or Request Services
          </Link>
        </div>
      </div>
    </div>
  )
}
