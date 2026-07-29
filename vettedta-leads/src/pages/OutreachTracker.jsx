import DashboardLayout from '../components/layout/DashboardLayout'
import { DUMMY_COMPANIES, OUTREACH_STATUSES } from '../lib/dummyData'

export default function OutreachTracker() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Outreach tracker</h1>
        <p className="mt-1 text-sm text-navy-500">
          Track where every lead sits in your connect → call pipeline.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50/50 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Primary contact</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {DUMMY_COMPANIES.map((company) => (
              <tr key={company.id}>
                <td className="px-4 py-3 font-medium text-navy-900">{company.name}</td>
                <td className="px-4 py-3 text-navy-600">
                  {company.contacts[0]?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input-field w-44 py-1.5"
                    defaultValue={company.outreach_status}
                  >
                    {OUTREACH_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-navy-400 italic">Add a note…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
