import { Link } from 'react-router-dom'

function Stars({ rating, size = 'sm' }) {
  const filled = Math.round(rating ?? 0)
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <svg key={n} className={`${cls} ${n <= filled ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function AvailabilityBadge({ status }) {
  const map = {
    available:   { label: 'Available now', dot: true,  cls: 'bg-green-100 text-green-700' },
    limited:     { label: 'Limited',        dot: false, cls: 'bg-amber-100 text-amber-700' },
    unavailable: { label: 'Unavailable',    dot: false, cls: 'bg-gray-100 text-gray-500'  },
  }
  const { label, dot, cls } = map[status] ?? map.unavailable
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
      {label}
    </span>
  )
}

export default function RecruiterCard({ recruiter, jobId }) {
  const jobParam    = jobId ? `?job=${jobId}` : ''
  const scores      = recruiter.recruiter_scores?.[0] ?? null
  const rating      = scores?.overall_average ?? null
  const reviews     = (scores?.total_hm_reviews ?? 0) + (scores?.total_candidate_reviews ?? 0)
  const hasLinkedIn = !!(recruiter.linkedin_url && recruiter.linkedin_network_size_tier)

  const specialisms = (recruiter.recruiter_specialisms ?? [])
    .map(rs => rs.specialism_categories?.specialism_name)
    .filter(Boolean)
  const firstSector = recruiter.recruiter_specialisms?.[0]?.specialism_categories?.sector ?? null

  const initials = [recruiter.first_name, recruiter.last_name]
    .filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?'

  const headline = recruiter.headline || [
    firstSector,
    recruiter.years_experience ? `${recruiter.years_experience} yrs exp` : null,
  ].filter(Boolean).join(' · ')

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3
                    hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
      {/* Top row: avatar + name + fee */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 font-bold text-sm
                        flex items-center justify-center flex-shrink-0 overflow-hidden">
          {recruiter.profile_photo_url
            ? <img src={recruiter.profile_photo_url} alt={initials} className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
            {recruiter.first_name} {recruiter.last_name}
          </p>
          {headline && <p className="text-xs text-gray-500 mt-0.5 truncate">{headline}</p>}
        </div>
        {recruiter.preferred_fee_percentage != null && (
          <div className="text-right flex-shrink-0">
            <p className="text-lg font-bold text-primary-600 leading-none">{recruiter.preferred_fee_percentage}%</p>
            <p className="text-xs text-gray-400 mt-0.5">fee</p>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <AvailabilityBadge status={recruiter.availability_status} />
        {recruiter.response_time_average != null && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            ⚡ ~{Math.round(recruiter.response_time_average)}h response
          </span>
        )}
        {hasLinkedIn && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn Recruiter
          </span>
        )}
      </div>

      {/* Rating + placements */}
      <div className="flex items-center gap-3 text-sm">
        {rating != null ? (
          <div className="flex items-center gap-1">
            <Stars rating={rating} />
            <span className="text-gray-700 font-medium text-xs">{Number(rating).toFixed(1)}</span>
            {reviews > 0 && <span className="text-gray-400 text-xs">({reviews})</span>}
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">No reviews yet</span>
        )}
        {(recruiter.total_placements ?? 0) > 0 && (
          <span className="text-xs text-gray-500">
            <span className="font-semibold text-gray-800">{recruiter.total_placements}</span> placements
          </span>
        )}
      </div>

      {/* Specialism tags */}
      {specialisms.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {specialisms.slice(0, 3).map(s => (
            <span key={s} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{s}</span>
          ))}
          {specialisms.length > 3 && (
            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-400 text-xs">+{specialisms.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-1">
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
