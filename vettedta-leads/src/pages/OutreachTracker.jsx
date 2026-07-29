import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import OutreachStatusSelect from '../components/dashboard/OutreachStatusSelect'
import { useAuth } from '../context/AuthContext'
import { fetchCompanyFeed } from '../lib/api'

export default function OutreachTracker() {
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompanyFeed({ dateRange: 'all' }, user?.id)
      setCompanies(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Outreach tracker</h1>
        <p className="mt-1 text-sm text-navy-500">
          Track where every lead sits in your connect → call pipeline.
        </p>
      </div>

      {error && (
        <div className="card border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load outreach: {error}
        </div>
      )}

      {loading ? (
        <div className="card h-64 animate-pulse bg-navy-50" />
      ) : companies.length === 0 && !error ? (
        <div className="card p-12 text-center text-sm text-navy-500">
          No companies to track yet — add one from the Companies page or run an RSS scan.
        </div>
      ) : (
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
              {companies.map((company) => {
                const primaryContact =
                  company.contacts.find((c) => c.is_primary_contact) ?? company.contacts[0]
                return (
                  <tr key={company.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">{company.name}</td>
                    <td className="px-4 py-3 text-navy-600">{primaryContact?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <OutreachStatusSelect
                        companyId={company.id}
                        initialStatus={company.outreach?.status}
                      />
                    </td>
                    <td className="px-4 py-3 text-navy-500">{company.outreach?.notes || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
