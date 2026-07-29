import DashboardLayout from '../components/layout/DashboardLayout'
import { DUMMY_COMPANIES } from '../lib/dummyData'

const SIGNAL_LABELS = {
  funding: 'Funding',
  senior_hire: 'Senior hire',
  job_posting: 'Job posting',
  expansion: 'Expansion',
  careers_page: 'Careers page',
}

export default function SignalsFeed() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Signals feed</h1>
        <p className="mt-1 text-sm text-navy-500">
          A chronological feed of every hiring-intent signal detected across sources.
        </p>
      </div>

      <div className="card divide-y divide-navy-100">
        {DUMMY_COMPANIES.map((company) => (
          <div key={company.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-navy-900">{company.name}</p>
              <p className="text-sm text-navy-500">{company.signal.headline}</p>
            </div>
            <span className="shrink-0 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-700 ring-1 ring-inset ring-accent-600/20">
              {SIGNAL_LABELS[company.signal.type]}
            </span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
