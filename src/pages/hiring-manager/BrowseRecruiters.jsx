import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import RecruiterCard from '../../components/recruiter/RecruiterCard'

const FILTER_COUNTRIES  = ['Ireland', 'UK', 'USA', 'Canada', 'Australia']
const FILTER_SECTORS    = ['Technology', 'Finance', 'Legal', 'HR', 'Marketing', 'Operations', 'Logistics', 'Construction', 'Healthcare', 'Executive']
const FILTER_FEES       = [{ label: '6%', value: '6' }, { label: '8%', value: '8' }, { label: '10%', value: '10' }]
const FILTER_AVAIL      = [{ label: 'Available now', value: 'available' }, { label: 'Limited', value: 'limited' }]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant'     },
  { value: 'rating',    label: 'Highest Rated'      },
  { value: 'placements',label: 'Most Placements'    },
  { value: 'fee_asc',   label: 'Lowest Fee'         },
  { value: 'response',  label: 'Fastest Response'   },
  { value: 'newest',    label: 'Newest to Platform' },
  { value: 'active',    label: 'Recently Active'    },
]

function computeRelevance(r, filters) {
  let score = 0
  const rSectors   = r.recruiter_sectors?.map(s => s.sector_name) ?? []
  const rCountries = r.recruiter_locations?.map(l => l.country)   ?? []
  const sc         = r.recruiter_scores?.[0] ?? null

  // Sector match (35 pts)
  if (filters.sectors.length > 0) {
    const matches = filters.sectors.filter(s => rSectors.includes(s)).length
    score += (matches / filters.sectors.length) * 35
  } else {
    score += 35
  }

  // Location match (25 pts)
  if (filters.countries.length > 0) {
    if (filters.countries.some(c => rCountries.includes(c))) score += 25
  } else {
    score += 25
  }

  // Performance (20 pts): rating 0-10 + placements 0-10
  score += sc?.overall_average ? (sc.overall_average / 5) * 10 : 5
  score += Math.min((r.total_placements ?? 0) / 10, 10)

  // Availability & response (15 pts)
  if (r.availability_status === 'available') score += 15
  else if (r.availability_status === 'limited') score += 8
  if (r.response_time_average && r.response_time_average <= 4) score += 5
  else if (r.response_time_average && r.response_time_average <= 24) score += 2

  // Profile completeness (5 pts)
  if (r.bio)                             score += 1
  if (r.linkedin_url)                    score += 1
  if (r.recruiter_tools?.length > 0)     score += 1
  if (r.linkedin_network_size_tier)      score += 1
  if (r.preferred_fee_percentage != null) score += 1

  return score
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-24 bg-gray-200 rounded-full" />
        <div className="h-5 w-28 bg-gray-200 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-18 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-7 flex-1 bg-gray-200 rounded-md" />
        <div className="h-7 flex-1 bg-gray-200 rounded-md" />
      </div>
    </div>
  )
}

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="text-gray-700 font-medium mb-1">No recruiters found matching your criteria</p>
      <p className="text-sm text-gray-500 mb-5">Try adjusting your filters to see more results</p>
      {hasFilters && (
        <button onClick={onClear} className="btn-secondary text-sm">Clear all filters</button>
      )}
    </div>
  )
}

function FilterSection({ title, children }) {
  return (
    <div className="border-b border-gray-100 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </div>
  )
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
      />
      {label}
    </label>
  )
}

const EMPTY_FILTERS = { countries: [], sectors: [], fees: [], availability: [] }

export default function BrowseRecruiters() {
  const { user, logout } = useAuth()
  const [recruiters, setRecruiters]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [sort, setSort]               = useState('relevance')
  const [filters, setFilters]         = useState(EMPTY_FILTERS)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    console.log('Auth user at query time:', user)
    supabase
      .from('recruiter_profiles')
      .select(`
        id, user_id, first_name, last_name, bio, profile_photo_url,
        years_experience, availability_status, preferred_fee_percentage,
        total_placements, linkedin_url, linkedin_network_size_tier,
        response_time_average, last_active_at, created_at,
        recruiter_sectors!left(sector_name),
        recruiter_locations!left(country, region),
        recruiter_tools!left(tool_name, verified),
        recruiter_scores!left(overall_average, total_hm_reviews, total_candidate_reviews)
      `)
      .eq('status', 'approved')
      .then(({ data, error }) => {
        console.log('Supabase recruiter_profiles result:', data, error)
        if (!error && data) setRecruiters(data)
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

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [])

  const hasActiveFilters = Object.values(filters).some(a => a.length > 0)

  const filtered = useMemo(() => recruiters.filter(r => {
    if (filters.countries.length > 0) {
      const rc = r.recruiter_locations?.map(l => l.country) ?? []
      if (!filters.countries.some(c => rc.includes(c))) return false
    }
    if (filters.sectors.length > 0) {
      const rs = r.recruiter_sectors?.map(s => s.sector_name) ?? []
      if (!filters.sectors.some(s => rs.includes(s))) return false
    }
    if (filters.fees.length > 0) {
      const fee = String(Math.round(r.preferred_fee_percentage ?? -1))
      if (!filters.fees.includes(fee)) return false
    }
    if (filters.availability.length > 0) {
      if (!filters.availability.includes(r.availability_status)) return false
    }
    return true
  }), [recruiters, filters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sort) {
      case 'relevance':
        return arr.sort((a, b) => computeRelevance(b, filters) - computeRelevance(a, filters))
      case 'rating':
        return arr.sort((a, b) => (b.recruiter_scores?.[0]?.overall_average ?? 0) - (a.recruiter_scores?.[0]?.overall_average ?? 0))
      case 'placements':
        return arr.sort((a, b) => (b.total_placements ?? 0) - (a.total_placements ?? 0))
      case 'fee_asc':
        return arr.sort((a, b) => (a.preferred_fee_percentage ?? 99) - (b.preferred_fee_percentage ?? 99))
      case 'response':
        return arr.sort((a, b) => (a.response_time_average ?? 9999) - (b.response_time_average ?? 9999))
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      case 'active':
        return arr.sort((a, b) => {
          if (!a.last_active_at && !b.last_active_at) return 0
          if (!a.last_active_at) return 1
          if (!b.last_active_at) return -1
          return new Date(b.last_active_at) - new Date(a.last_active_at)
        })
      default:
        return arr
    }
  }, [filtered, sort, filters])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/hiring-manager/dashboard" className="text-lg font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/hiring-manager/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Recruiters</h1>
          <p className="text-gray-500 mt-1 text-sm">Find the right specialist for your next hire</p>
        </div>

        <div className="flex gap-8 items-start">
          {/* ── Filter sidebar ── */}
          <aside className="w-52 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <FilterSection title="Country">
              <div className="space-y-1">
                {FILTER_COUNTRIES.map(c => (
                  <FilterCheckbox
                    key={c} label={c}
                    checked={filters.countries.includes(c)}
                    onChange={() => toggle('countries', c)}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Sector">
              <div className="space-y-1">
                {FILTER_SECTORS.map(s => (
                  <FilterCheckbox
                    key={s} label={s}
                    checked={filters.sectors.includes(s)}
                    onChange={() => toggle('sectors', s)}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Fee">
              <div className="space-y-1">
                {FILTER_FEES.map(f => (
                  <FilterCheckbox
                    key={f.value} label={f.label}
                    checked={filters.fees.includes(f.value)}
                    onChange={() => toggle('fees', f.value)}
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Availability">
              <div className="space-y-1">
                {FILTER_AVAIL.map(a => (
                  <FilterCheckbox
                    key={a.value} label={a.label}
                    checked={filters.availability.includes(a.value)}
                    onChange={() => toggle('availability', a.value)}
                  />
                ))}
              </div>
            </FilterSection>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading…' : (
                  <><span className="font-semibold text-gray-800">{sorted.length}</span> recruiter{sorted.length !== 1 ? 's' : ''} found</>
                )}
              </p>
              <select
                className="input w-44 text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {sorted.map(r => <RecruiterCard key={r.id} recruiter={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
