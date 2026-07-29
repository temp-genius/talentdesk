import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchCompanyDetail } from '../../lib/api'
import CompanyCard from './CompanyCard'

export default function CompanyDetailModal({ companyId, onClose }) {
  const { user } = useAuth()
  const [company, setCompany] = useState(null)
  const [error, setError] = useState(null)

  const load = async () => {
    setError(null)
    try {
      const data = await fetchCompanyDetail(companyId, user?.id)
      setCompany(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 px-4 py-8">
      <div className="max-h-full w-full max-w-md overflow-y-auto">
        <div className="mb-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-navy-600 shadow hover:text-navy-900"
          >
            Close ✕
          </button>
        </div>
        {error && (
          <div className="card border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
        {!error && !company && (
          <div className="card h-56 animate-pulse bg-navy-50" />
        )}
        {company && <CompanyCard company={company} onChanged={load} />}
      </div>
    </div>
  )
}
