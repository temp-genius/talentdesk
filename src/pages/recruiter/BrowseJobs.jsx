import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { MARKETS } from '../../lib/constants'
import Logo from '../../components/layout/Logo'

const SECTORS = [
  'Technology', 'Finance', 'Legal', 'HR', 'Marketing',
  'Operations', 'Logistics', 'Construction', 'Healthcare', 'Executive',
]

const SENIORITY_OPTIONS = [
  { value: 'junior',   label: 'Junior'   },
  { value: 'mid',      label: 'Mid'      },
  { value: 'senior',   label: 'Senior'   },
  { value: 'director', label: 'Director' },
  { value: 'c_suite',  label: 'C-Suite'  },
]

const LOCATION_TYPE_OPTIONS = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
]

const ROLE_TYPE_LABELS = { permanent: 'Permanent', contract: 'Contract' }
const SENIORITY_LABELS = { junior: 'Junior', mid: 'Mid', senior: 'Senior', director: 'Director', c_suite: 'C-Suite' }
const LOCATION_LABELS  = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' }

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatDeadline(dateStr) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`
}

const EMPTY_FILTERS = { sectors: [], seniority: [], locationTypes: [], countries: [] }

function fmt(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency', currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function salaryRange(job) {
  if (!job.salary_min && !job.salary_max) return null
  const cur = job.currency ?? 'EUR'
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min, cur)} – ${fmt(job.salary_max, cur)}`
  if (job.salary_min) return `From ${fmt(job.salary_min, cur)}`
  return `Up to ${fmt(job.salary_max, cur)}`
}

function locationLine(job) {
  const parts = [job.location_city, job.location_country].filter(Boolean)
  return parts.join(', ') || null
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  )
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 py-0.5">
      <input
        type="checkbox" checked={checked} onChange={onChange}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
      />
      {label}
    </label>
  )
}

function JobCard({ job }) {
  const salary   = salaryRange(job)
  const location = locationLine(job)
  const deadline = formatDeadline(job.proposal_deadline)
  const excerpt  = job.description
    ? job.description.slice(0, 140) + (job.description.length > 140 ? '…' : '')
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">{job.title}</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
            {job.sector && <span>{job.sector}</span>}
            {job.seniority_level && (
              <span>{SENIORITY_LABELS[job.seniority_level] ?? job.seniority_level}</span>
            )}
            {location && <span>{location}</span>}
            {job.role_type && (
              <span>{ROLE_TYPE_LABELS[job.role_type] ?? job.role_type}</span>
            )}
          </div>
        </div>
        <Link
          to={`/jobs/${job.id}`}
          className="btn-primary text-sm px-4 py-2 flex-shrink-0"
        >
          View Role
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.location_type && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {LOCATION_LABELS[job.location_type] ?? job.location_type}
          </span>
        )}
        {salary && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
            {salary}
          </span>
        )}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
          Open for proposals
        </span>
        {deadline && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Closes {deadline}
          </span>
        )}
      </div>

      {excerpt && (
        <p className="text-sm text-gray-600 leading-relaxed">{excerpt}</p>
      )}
    </div>
  )
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      {hasFilters ? (
        <>
          <p className="text-gray-700 font-medium mb-1">No roles match your filters</p>
          <p className="text-sm text-gray-500 mb-5">Try adjusting your criteria</p>
          <button onClick={onClear} className="btn-secondary text-sm">Clear all filters</button>
        </>
      ) : (
        <>
          <p className="text-gray-700 font-medium mb-1">No open roles right now</p>
          <p className="text-sm text-gray-500">Check back soon — new roles are posted regularly</p>
        </>
      )}
    </div>
  )
}

export default function BrowseJobs() {
  const { user, logout } = useAuth()
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('jobs')
      .select('id, title, sector, seniority_level, location_type, location_country, location_city, salary_min, salary_max, currency, role_type, description, proposal_deadline')
      .eq('status', 'open_for_proposals')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setJobs(data ?? [])
        setLoading(false)
      })
  }, [user])

  function toggle(key, value) {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }))
  }

  const hasActiveFilters = Object.values(filters).some(a => a.length > 0)
  const activeFilterCount = Object.values(filters).reduce((n, a) => n + a.length, 0)

  const filtered = useMemo(() => jobs.filter(job => {
    if (filters.sectors.length > 0       && !filters.sectors.includes(job.sector))              return false
    if (filters.seniority.length > 0     && !filters.seniority.includes(job.seniority_level))   return false
    if (filters.locationTypes.length > 0 && !filters.locationTypes.includes(job.location_type)) return false
    if (filters.countries.length > 0     && !filters.countries.includes(job.location_country))  return false
    return true
  }), [jobs, filters])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/recruiter/dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/recruiter/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link to="/recruiter/messages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Messages
            </Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Open Roles</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Roles published to the marketplace by hiring companies — propose to work on one you're suited for
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Sidebar filters */}
          <aside className="w-full md:w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 md:sticky md:top-24 md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
            <button
              type="button"
              onClick={() => setFiltersOpen(o => !o)}
              className="md:hidden w-full flex items-center justify-between px-5 py-4"
            >
              <span className="text-sm font-semibold text-gray-900">
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                    {activeFilterCount}
                  </span>
                )}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`p-5 border-t border-gray-100 md:border-0 ${filtersOpen ? '' : 'hidden'} md:block`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="hidden md:block text-sm font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <FilterSection title="Sector">
              <div className="space-y-1">
                {SECTORS.map(s => (
                  <FilterCheckbox key={s} label={s}
                    checked={filters.sectors.includes(s)}
                    onChange={() => toggle('sectors', s)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Seniority">
              <div className="space-y-1">
                {SENIORITY_OPTIONS.map(o => (
                  <FilterCheckbox key={o.value} label={o.label}
                    checked={filters.seniority.includes(o.value)}
                    onChange={() => toggle('seniority', o.value)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Work type">
              <div className="space-y-1">
                {LOCATION_TYPE_OPTIONS.map(o => (
                  <FilterCheckbox key={o.value} label={o.label}
                    checked={filters.locationTypes.includes(o.value)}
                    onChange={() => toggle('locationTypes', o.value)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Country">
              <div className="space-y-1">
                {MARKETS.map(c => (
                  <FilterCheckbox key={c} label={c}
                    checked={filters.countries.includes(c)}
                    onChange={() => toggle('countries', c)} />
                ))}
              </div>
            </FilterSection>
            </div>
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0 w-full">
            <p className="text-sm text-gray-500 mb-5">
              {loading ? 'Loading…' : (
                <>
                  <span className="font-semibold text-gray-800">{filtered.length}</span>{' '}
                  role{filtered.length !== 1 ? 's' : ''} found
                </>
              )}
            </p>

            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-3" />
                    <div className="flex gap-2 mb-3">
                      <div className="h-4 bg-gray-200 rounded w-20" />
                      <div className="h-4 bg-gray-200 rounded w-16" />
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
