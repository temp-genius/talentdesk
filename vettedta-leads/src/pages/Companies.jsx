import DashboardLayout from '../components/layout/DashboardLayout'
import FilterBar from '../components/dashboard/FilterBar'
import CompanyCard from '../components/dashboard/CompanyCard'
import { DUMMY_COMPANIES } from '../lib/dummyData'

export default function Companies() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Companies</h1>
        <p className="mt-1 text-sm text-navy-500">
          The full company list — browse, filter and drill into any lead.
        </p>
      </div>

      <div className="space-y-6">
        <FilterBar />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DUMMY_COMPANIES.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
