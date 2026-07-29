import { useState } from 'react'
import { triggerEnrichCompany } from '../../lib/api'
import OutreachStatusSelect from './OutreachStatusSelect'

const SIGNAL_BADGE_STYLES = {
  funding: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  senior_hire: 'bg-accent-50 text-accent-700 ring-accent-600/20',
  job_posting: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  expansion: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  careers_page: 'bg-navy-50 text-navy-700 ring-navy-600/20',
  other: 'bg-gray-50 text-gray-700 ring-gray-600/20',
}

const SIGNAL_LABELS = {
  funding: 'Funding',
  senior_hire: 'Senior hire',
  job_posting: 'Job posting',
  expansion: 'Expansion',
  careers_page: 'Careers page',
  other: 'Other',
}

function initialsFor(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function CompanyCard({ company, onChanged, onOpenDetail }) {
  const [enriching, setEnriching] = useState(false)
  const [enrichError, setEnrichError] = useState(null)

  const signal = company.signal
  const canEnrich = Boolean(company.domain) && !company.enriched_at
  const clickable = Boolean(onOpenDetail)

  const handleEnrich = async () => {
    setEnriching(true)
    setEnrichError(null)
    try {
      await triggerEnrichCompany(company.id)
      await onChanged?.()
    } catch (err) {
      setEnrichError(err.message)
    } finally {
      setEnriching(false)
    }
  }

  return (
    <div
      className={`card flex flex-col gap-4 p-5 transition hover:shadow-md ${clickable ? 'cursor-pointer' : ''}`}
      onClick={clickable ? () => onOpenDetail(company.id) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg object-contain ring-1 ring-navy-100"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <div className="min-w-0">
            {clickable ? (
              <h3 className="truncate text-base font-semibold text-navy-900">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenDetail(company.id)
                  }}
                  className="truncate hover:text-accent-600 hover:underline"
                >
                  {company.name}
                </button>
              </h3>
            ) : (
              <h3 className="truncate text-base font-semibold text-navy-900">{company.name}</h3>
            )}
            <p className="truncate text-sm text-navy-500">
              {company.location || company.country || 'Location unknown'}
              {company.headcount_bracket ? ` · ${company.headcount_bracket} employees` : ''}
            </p>
          </div>
        </div>
        {signal && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
              SIGNAL_BADGE_STYLES[signal.signal_type] ?? SIGNAL_BADGE_STYLES.other
            }`}
          >
            {SIGNAL_LABELS[signal.signal_type] ?? signal.signal_type}
          </span>
        )}
      </div>

      {signal && (
        <div>
          <p className="text-sm text-navy-700">{signal.headline}</p>
          {(signal.source_name || signal.signal_date) && (
            <p className="mt-0.5 text-xs text-navy-400">
              {signal.source_name}
              {signal.source_name && signal.signal_date ? ' · ' : ''}
              {signal.signal_date ? new Date(signal.signal_date).toLocaleDateString() : ''}
            </p>
          )}
        </div>
      )}

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
        {company.contacts?.length > 0 ? (
          <ul className="space-y-2">
            {company.contacts.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[11px] font-semibold text-accent-700">
                  {initialsFor(c.name)}
                </span>
                <span className="min-w-0 flex-1 truncate text-navy-700">
                  <span className="font-medium">{c.name}</span>
                  {c.title ? ` — ${c.title}` : ''}
                </span>
                {c.linkedin_url && (
                  <a
                    href={c.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-xs font-semibold text-accent-600 hover:text-accent-700"
                  >
                    LinkedIn
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm italic text-navy-400">No contacts enriched yet</p>
        )}

        {canEnrich && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEnrich()
            }}
            disabled={enriching}
            className="btn-secondary mt-3 w-full text-xs"
          >
            {enriching ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-navy-300 border-t-navy-700" />
                Enriching…
              </span>
            ) : (
              'Enrich contacts'
            )}
          </button>
        )}
        {enrichError && <p className="mt-2 text-xs text-red-600">{enrichError}</p>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
        <OutreachStatusSelect companyId={company.id} initialStatus={company.outreach?.status} />
        {company.linkedin_company_url && (
          <a
            href={company.linkedin_company_url}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            View on LinkedIn
          </a>
        )}
      </div>
    </div>
  )
}
