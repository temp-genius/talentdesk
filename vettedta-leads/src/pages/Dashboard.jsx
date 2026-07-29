import DashboardLayout from '../components/layout/DashboardLayout'
import StatsRow from '../components/dashboard/StatsRow'
import CompanyBrowser from '../components/dashboard/CompanyBrowser'

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
        <StatsRow />
        <CompanyBrowser />
      </div>
    </DashboardLayout>
  )
}
