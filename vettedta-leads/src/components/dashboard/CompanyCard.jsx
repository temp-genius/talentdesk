const SIGNAL_BADGE_STYLES = {
  funding: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  senior_hire: 'bg-accent-50 text-accent-700 ring-accent-600/20',
  job_posting: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  expansion: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  careers_page: 'bg-navy-50 text-navy-700 ring-navy-600/20',
}

const SIGNAL_LABELS = {
  funding: 'Funding',
  senior_hire: 'Senior hire',
  job_posting: 'Job posting',
  expansion: 'Expansion',
  careers_page: 'Careers page',
}

const OUTREACH_BADGE_STYLES = {
  new: 'bg-navy-100 text-navy-700',
  connection_sent: 'bg-accent-100 text-accent-700',
  connected: 'bg-emerald-100 text-emerald-700',
  follow_up_1_sent: 'bg-amber-100 text-amber-700',
  follow_up_2_sent: 'bg-amber-100 text-amber-700',
  replied: 'bg-teal-100 text-teal-700',
  call_booked: 'bg-purple-100 text-purple-700',
  active_client: 'bg-emerald-200 text-emerald-800',
  not_now: 'bg-gray-100 text-gray-600',
  dead: 'bg-red-100 text-red-700',
}

function initialsFor(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function CompanyCard({ company }) {
  return (
    <div className="card flex flex-col gap-4 p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-navy-900">{company.name}</h3>
          <p className="text-sm text-navy-500">
            {company.location} · {company.headcount_bracket} employees
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            SIGNAL_BADGE_STYLES[company.signal.type]
          }`}
        >
          {SIGNAL_LABELS[company.signal.type]}
        </span>
      </div>

      <p className="text-sm text-navy-700">{company.signal.headline}</p>

      {company.specialism_bucket?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {company.specialism_bucket.map((s) => (
            <span
              key={s}
              className="rounded-md bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-600"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-navy-100 pt-3">
        {company.contacts.length > 0 ? (
          <ul className="space-y-2">
            {company.contacts.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[11px] font-semibold text-accent-700">
                  {initialsFor(c.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-navy-700">
                  <span className="font-medium">{c.name}</span> — {c.title}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-navy-400">No contacts enriched yet</p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            OUTREACH_BADGE_STYLES[company.outreach_status]
          }`}
        >
          {company.outreach_status.replace(/_/g, ' ')}
        </span>
        <a
          href={company.linkedin_company_url}
          className="btn-secondary px-3 py-1.5 text-xs"
        >
          View on LinkedIn
        </a>
      </div>
    </div>
  )
}
