import DashboardLayout from '../components/layout/DashboardLayout'
import CompanyBrowser from '../components/dashboard/CompanyBrowser'

export default function Companies() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Companies</h1>
        <p className="mt-1 text-sm text-navy-500">
          The full company list — browse, filter and drill into any lead.
        </p>
      </div>

      <CompanyBrowser />
    </DashboardLayout>
  )
}
