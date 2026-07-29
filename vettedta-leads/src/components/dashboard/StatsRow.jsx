const STATS = [
  { key: 'totalCompanies', label: 'Total companies' },
  { key: 'newSignalsToday', label: 'New signals today' },
  { key: 'contactsFound', label: 'Contacts found' },
  { key: 'outreachPending', label: 'Outreach pending' },
]

export default function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map(({ key, label }) => (
        <div key={key} className="card p-5">
          <p className="text-sm font-medium text-navy-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-navy-900">{stats[key]}</p>
        </div>
      ))}
    </div>
  )
}
