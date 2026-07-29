import DashboardLayout from '../components/layout/DashboardLayout'
import StatsRow from '../components/dashboard/StatsRow'
import FilterBar from '../components/dashboard/FilterBar'
import CompanyCard from '../components/dashboard/CompanyCard'
import { DUMMY_COMPANIES, DUMMY_STATS } from '../lib/dummyData'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="mt-1 text-sm text-navy-500">
          Companies showing hiring intent, ranked by freshest signal.
        </p>
      </div>

      <div className="space-y-6">
        <StatsRow stats={DUMMY_STATS} />
        <FilterBar />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-navy-700">
              {DUMMY_COMPANIES.length} companies
            </h2>
            <p className="text-xs italic text-navy-400">
              Showing placeholder data — live signals connect in session 2
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DUMMY_COMPANIES.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
