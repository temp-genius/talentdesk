import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { triggerIngestRss } from '../lib/api'

export default function Settings() {
  const { user, profile } = useAuth()
  const [running, setRunning] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const handleRunIngestion = async () => {
    setRunning(true)
    setError(null)
    setSummary(null)
    try {
      const result = await triggerIngestRss()
      setSummary(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-500">Your account, plan, and data sources.</p>
      </div>

      <div className="space-y-6">
        <div className="card max-w-xl space-y-4 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              Full name
            </p>
            <p className="text-sm text-navy-900">{profile?.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              Email
            </p>
            <p className="text-sm text-navy-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              Company
            </p>
            <p className="text-sm text-navy-900">{profile?.company || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
              Plan
            </p>
            <span className="inline-block rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-700">
              {profile?.plan || 'beta'}
            </span>
          </div>
        </div>

        <div className="card max-w-xl space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold text-navy-900">Data ingestion</h2>
            <p className="mt-1 text-sm text-navy-500">
              Manually scan all active RSS sources for new hiring signals. Runs the same
              <code className="mx-1 rounded bg-navy-50 px-1 py-0.5 text-xs">ingest-rss</code>
              Edge Function a scheduled cron will use later.
            </p>
          </div>

          <button onClick={handleRunIngestion} disabled={running} className="btn-primary">
            {running ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Scanning sources…
              </span>
            ) : (
              'Run RSS scan'
            )}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {summary && (
            <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryStat label="Sources checked" value={summary.sources_checked} />
                <SummaryStat label="Articles scanned" value={summary.articles_scanned} />
                <SummaryStat label="Signals found" value={summary.signals_created} />
                <SummaryStat label="Companies created" value={summary.companies_created} />
              </div>
              {summary.errors?.length > 0 && (
                <div className="mt-4 border-t border-navy-100 pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
                    Source errors
                  </p>
                  <ul className="space-y-1 text-xs text-red-600">
                    {summary.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function SummaryStat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-navy-500">{label}</p>
      <p className="text-xl font-bold text-navy-900">{value ?? 0}</p>
    </div>
  )
}
