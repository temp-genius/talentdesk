import { Link } from 'react-router-dom'

const CAREER_DNA_LABELS = { agency: 'Agency', inhouse: 'In-house', hybrid: 'Hybrid' }
const CAPACITY_CONFIG = {
  open_to_new:  { label: 'Open to new', bar: 'bg-green-500', pct: 33,  text: 'text-green-700', bg: 'bg-green-50' },
  nearly_full:  { label: 'Nearly full',  bar: 'bg-amber-500', pct: 66,  text: 'text-amber-700', bg: 'bg-amber-50' },
  full:         { label: 'At capacity',  bar: 'bg-red-500',   pct: 100, text: 'text-red-700',   bg: 'bg-red-50'   },
}
const AVAIL_CONFIG = {
  available:   { label: 'Available now', dot: true,  cls: 'bg-green-100 text-green-700' },
  limited:     { label: 'Limited',        dot: false, cls: 'bg-amber-100 text-amber-700' },
  unavailable: { label: 'Unavailable',    dot: false, cls: 'bg-gray-100 text-gray-500'  },
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function MatchBadge({ score }) {
  if (score == null) return null
  const { cls, label } =
    score >= 80 ? { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: `${score}% match` } :
    score >= 55 ? { cls: 'bg-blue-100 text-blue-700 border-blue-200',          label: `${score}% match` } :
                  { cls: 'bg-gray-100 text-gray-500 border-gray-200',           label: `${score}% match` }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      ✦ {label}
    </span>
  )
}

export default function RecruiterCard({ recruiter, jobId, matchScore }) {
  const jobParam = jobId ? `?job=${jobId}` : ''

  const scores    = recruiter.recruiter_scores?.[0] ?? null
  const rating    = scores?.overall_average ?? null
  const reviews   = (scores?.total_hm_reviews ?? 0) + (scores?.total_candidate_reviews ?? 0)

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

  const avail    = AVAIL_CONFIG[recruiter.availability_status] ?? AVAIL_CONFIG.unavailable
  const capacity = CAPACITY_CONFIG[recruiter.capacity_status] ?? CAPACITY_CONFIG.open_to_new

  const employers = (recruiter.previous_employers ?? '')
    .split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)

  const lastPlacement = timeAgo(recruiter.last_placement_at)
  const avgDays       = recruiter.average_days_to_shortlist
    ? Math.round(recruiter.average_days_to_shortlist) : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all flex flex-col">

      {/* Top: avatar + name + fee */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold text-sm
                        flex items-center justify-center flex-shrink-0 overflow-hidden">
          {recruiter.profile_photo_url
            ? <img src={recruiter.profile_photo_url} alt={initials} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {recruiter.first_name} {recruiter.last_name}
              </p>
              {headline && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{headline}</p>}
            </div>
            {recruiter.preferred_fee_percentage != null && (
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-primary-600 leading-none">{recruiter.preferred_fee_percentage}%</p>
                <p className="text-xs text-gray-400">fee</p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${avail.cls}`}>
              {avail.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              {avail.label}
            </span>
            {recruiter.career_dna && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                {CAREER_DNA_LABELS[recruiter.career_dna]}
              </span>
            )}
            <MatchBadge score={matchScore} />
          </div>
        </div>
      </div>

      {/* Employer badges */}
      {employers.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {employers.map(emp => (
            <span key={emp} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
              {emp}
            </span>
          ))}
        </div>
      )}

      {/* Capacity bar */}
      <div className={`mx-4 mb-3 rounded-md px-3 py-2 ${capacity.bg}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${capacity.text}`}>{capacity.label}</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-1.5">
          <div className={`${capacity.bar} h-1.5 rounded-full transition-all`} style={{ width: `${capacity.pct}%` }} />
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-gray-500">
        {avgDays != null && (
          <span><span className="font-semibold text-gray-800">{avgDays}d</span> to shortlist</span>
        )}
        {(recruiter.total_placements ?? 0) > 0 && (
          <span><span className="font-semibold text-gray-800">{recruiter.total_placements}</span> placements</span>
        )}
        {rating != null && (
          <span>
            <span className="font-semibold text-gray-800">★ {Number(rating).toFixed(1)}</span>
            {reviews > 0 && <span className="text-gray-400 ml-0.5">({reviews})</span>}
          </span>
        )}
      </div>

      {/* Specialism tags */}
      {specialisms.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {specialisms.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{s}</span>
          ))}
          {specialisms.length > 3 && (
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-400 text-xs">+{specialisms.length - 3}</span>
          )}
        </div>
      )}

      {/* Last placement */}
      {lastPlacement && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400">Last placement: <span className="text-gray-600">{lastPlacement}</span></p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 mt-auto flex gap-2">
        <Link
          to={`/recruiter/profile/${recruiter.id}${jobParam}`}
          className="btn-secondary flex-1 text-center text-xs py-1.5"
        >
          View Profile
        </Link>
        <Link
          to={`/recruiter/profile/${recruiter.id}${jobParam}#contact`}
          className="btn-primary flex-1 text-center text-xs py-1.5"
        >
          Message
        </Link>
      </div>
    </div>
  )
}
