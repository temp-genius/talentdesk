import { useEffect, useState } from 'react'
import { fetchStats } from '../../lib/api'

const STATS = [
  { key: 'totalCompanies', label: 'Total companies' },
  { key: 'newSignalsToday', label: 'New signals today' },
  { key: 'contactsFound', label: 'Contacts found' },
  { key: 'outreachPending', label: 'Outreach pending' },
]

export default function StatsRow() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchStats()
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="card border-red-100 bg-red-50 p-4 text-sm text-red-700">
        Couldn't load stats: {error}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map(({ key, label }) => (
        <div key={key} className="card p-5">
          <p className="text-sm font-medium text-navy-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-navy-900">
            {stats ? stats[key] : <span className="inline-block h-8 w-12 animate-pulse rounded bg-navy-100" />}
          </p>
        </div>
      ))}
    </div>
  )
}
