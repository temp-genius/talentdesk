import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { fetchCompanyFeed } from '../../lib/api'
import FilterBar, { EMPTY_FILTERS } from './FilterBar'
import CompanyCard from './CompanyCard'
import EmptyState from './EmptyState'
import AddCompanyModal from './AddCompanyModal'
import CompanyDetailModal from './CompanyDetailModal'

function hasActiveFilters(filters) {
  return Object.entries(filters).some(([key, value]) => {
    if (key === 'dateRange') return value !== '30' && value !== ''
    return Boolean(value)
  })
}

export default function CompanyBrowser() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewingCompanyId, setViewingCompanyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompanyFeed(filters, user?.id)
      setCompanies(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters, user?.id])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <FilterBar filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-navy-700">
          {loading ? 'Loading…' : `${companies.length} companies`}
        </h2>
        <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
          + Add company
        </button>
      </div>

      {error && (
        <div className="card border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load companies: {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-56 animate-pulse bg-navy-50" />
          ))}
        </div>
      ) : companies.length === 0 && !error ? (
        <EmptyState
          hasFilters={hasActiveFilters(filters)}
          onClearFilters={() => setFilters(EMPTY_FILTERS)}
          onAddCompany={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onChanged={load}
              onOpenDetail={setViewingCompanyId}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddCompanyModal onClose={() => setShowAddModal(false)} onCreated={load} />
      )}

      {viewingCompanyId && (
        <CompanyDetailModal companyId={viewingCompanyId} onClose={() => setViewingCompanyId(null)} />
      )}
    </div>
  )
}
