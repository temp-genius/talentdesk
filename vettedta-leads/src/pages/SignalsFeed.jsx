import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import CompanyDetailModal from '../components/dashboard/CompanyDetailModal'
import { fetchSignalsFeed } from '../lib/api'

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

export default function SignalsFeed() {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewingCompanyId, setViewingCompanyId] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchSignalsFeed()
      .then((data) => {
        if (!cancelled) setSignals(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Signals feed</h1>
        <p className="mt-1 text-sm text-navy-500">
          A chronological feed of every hiring-intent signal detected across sources.
        </p>
      </div>

      {error && (
        <div className="card border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load signals: {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-navy-50" />
          ))}
        </div>
      ) : signals.length === 0 && !error ? (
        <div className="card p-12 text-center text-sm text-navy-500">
          No signals yet — run an RSS scan from Settings to get started.
        </div>
      ) : (
        <div className="card divide-y divide-navy-100">
          {signals.map((signal) => (
            <div key={signal.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-navy-900">
                    {signal.companies?.name ?? 'Unknown company'}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      SIGNAL_BADGE_STYLES[signal.signal_type] ?? SIGNAL_BADGE_STYLES.other
                    }`}
                  >
                    {SIGNAL_LABELS[signal.signal_type] ?? signal.signal_type}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-navy-600">{signal.headline}</p>
                <p className="mt-0.5 text-xs text-navy-400">
                  {signal.source_name}
                  {signal.source_name && signal.signal_date ? ' · ' : ''}
                  {signal.signal_date ? new Date(signal.signal_date).toLocaleDateString() : ''}
                </p>
              </div>
              {signal.company_id && (
                <button
                  onClick={() => setViewingCompanyId(signal.company_id)}
                  className="btn-secondary shrink-0 px-3 py-1.5 text-xs"
                >
                  View company
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {viewingCompanyId && (
        <CompanyDetailModal companyId={viewingCompanyId} onClose={() => setViewingCompanyId(null)} />
      )}
    </DashboardLayout>
  )
}
