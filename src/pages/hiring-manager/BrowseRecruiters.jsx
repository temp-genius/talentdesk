import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import RecruiterCard from '../../components/recruiter/RecruiterCard'
import Logo from '../../components/layout/Logo'
import { MARKETS } from '../../lib/constants'
const FILTER_FEES      = [{ label: '6%', value: '6' }, { label: '8%', value: '8' }, { label: '10%', value: '10' }]
const FILTER_AVAIL     = [{ label: 'Available now', value: 'available' }, { label: 'Limited', value: 'limited' }]
const FILTER_CAREER_DNA = [
  { label: 'Agency Recruiter',       value: 'agency'  },
  { label: 'In-House TA',            value: 'inhouse' },
  { label: 'Both Agency and In-House', value: 'hybrid'  },
]
const FILTER_CAPACITY  = [
  { label: 'Open to new',  value: 'open_to_new'  },
  { label: 'Nearly full',  value: 'nearly_full'  },
]

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Most Relevant'     },
  { value: 'rating',     label: 'Highest Rated'      },
  { value: 'placements', label: 'Most Placements'    },
  { value: 'fee_asc',    label: 'Lowest Fee'         },
  { value: 'response',   label: 'Fastest Response'   },
  { value: 'newest',     label: 'Newest to Platform' },
  { value: 'active',     label: 'Recently Active'    },
]

const STOPWORDS = new Set([
  'the','a','an','in','on','at','to','for','of','and','or','with','by','from',
  'is','as','be','will','you','we','our','their','this','that','it','its',
  'are','have','has','been','your','my','not','but','all','can','would','should',
  'may','also','who','what','how','where','when','which','they','them','its',
])

function extractKeywords(text) {
  return (text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
}

function computeMatchScore(r, jobSpecialismIds, jobCountries, jobKeywords, jobCareerDna) {
  let score = 0
  const rIds       = (r.recruiter_specialisms ?? []).map(rs => rs.specialism_category_id)
  const rCountries = (r.recruiter_locations ?? []).map(l => l.country)

  // Sector / specialism match (35 pts)
  if (jobSpecialismIds.length > 0) {
    const matches = jobSpecialismIds.filter(id => rIds.includes(id)).length
    score += (matches / jobSpecialismIds.length) * 35
  } else {
    score += 35
  }

  // Market match (25 pts)
  if (jobCountries.length > 0) {
    if (jobCountries.some(c => rCountries.includes(c))) score += 25
  } else {
    score += 25
  }

  // Bio keyword match (20 pts)
  if (jobKeywords.length > 0) {
    const rNames   = (r.recruiter_specialisms ?? []).map(rs => rs.specialism_categories?.specialism_name ?? '')
    const haystack = [r.bio ?? '', ...rNames].join(' ').toLowerCase()
    const hits     = jobKeywords.filter(kw => haystack.includes(kw)).length
    score += Math.min((hits / jobKeywords.length) * 20, 20)
  } else {
    score += 20
  }

  // Career DNA match (10 pts)
  if (jobCareerDna && r.career_dna) {
    if (r.career_dna === jobCareerDna || r.career_dna === 'hybrid') score += 10
  } else {
    score += 10
  }

  // Capacity (10 pts)
  if (r.capacity_status === 'open_to_new') score += 10
  else if (r.capacity_status === 'nearly_full') score += 5

  return Math.round(score)
}

function computeRelevance(r, filters, jobKeywords) {
  let score = 0
  const rIds       = (r.recruiter_specialisms ?? []).map(rs => rs.specialism_category_id)
  const rNames     = (r.recruiter_specialisms ?? []).map(rs => rs.specialism_categories?.specialism_name ?? '').filter(Boolean)
  const rCountries = (r.recruiter_locations ?? []).map(l => l.country)
  const sc         = r.recruiter_scores?.[0] ?? null

  if (filters.specialisms.length > 0) {
    const matches = filters.specialisms.filter(id => rIds.includes(id)).length
    score += (matches / filters.specialisms.length) * 35
  } else {
    score += 35
  }
  if (filters.countries.length > 0) {
    if (filters.countries.some(c => rCountries.includes(c))) score += 25
  } else {
    score += 25
  }
  score += sc?.overall_average ? (sc.overall_average / 5) * 10 : 5
  score += Math.min((r.total_placements ?? 0) / 10, 10)
  if (r.availability_status === 'available') score += 10
  else if (r.availability_status === 'limited') score += 5
  if (r.capacity_status === 'open_to_new') score += 5
  else if (r.capacity_status === 'nearly_full') score += 2
  if (r.bio)                              score += 1
  if (r.linkedin_url)                     score += 1
  if (r.preferred_fee_percentage != null) score += 1
  if (jobKeywords.length > 0) {
    const haystack = [r.bio ?? '', ...rNames].join(' ').toLowerCase()
    score += jobKeywords.filter(kw => haystack.includes(kw)).length
  }
  return score
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex gap-6">
        <div className="w-1/4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-32" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-16 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-16 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-48" />
        </div>
        <div className="w-[35%] space-y-3">
          <div className="h-14 bg-gray-200 rounded-lg w-24 self-end ml-auto" />
          <div className="h-3 bg-gray-200 rounded w-28" />
          <div className="flex gap-1">
            <div className="h-6 w-16 bg-gray-200 rounded-md" />
            <div className="h-6 w-20 bg-gray-200 rounded-md" />
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-gray-200 rounded-md" />
          <div className="h-8 w-44 bg-gray-200 rounded-md" />
        </div>
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
      <p className="text-gray-700 font-medium mb-1">No recruiters match your criteria</p>
      <p className="text-sm text-gray-500 mb-5">Try adjusting your filters or search terms</p>
      {hasFilters && (
        <button onClick={onClear} className="btn-secondary text-sm">Clear all filters</button>
      )}
    </div>
  )
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
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
      />
      {label}
    </label>
  )
}

function SpecialismFilterSection({ categories, filters, onToggle }) {
  const sectors = [...new Set(categories.map(c => c.sector))]
  const [sectorOpen, setSectorOpen] = useState({})

  function toggleSector(sector) {
    setSectorOpen(prev => ({ ...prev, [sector]: !prev[sector] }))
  }

  return (
    <div className="space-y-0.5">
      {sectors.map(sector => {
        const specs  = categories.filter(c => c.sector === sector)
        const isOpen = !!sectorOpen[sector]
        const count  = specs.filter(s => filters.specialisms.includes(s.id)).length
        return (
          <div key={sector}>
            <button
              type="button"
              onClick={() => toggleSector(sector)}
              className="w-full flex items-center justify-between py-1 text-left"
            >
              <span className="text-sm text-gray-700 leading-snug">{sector}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {count > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full font-medium leading-none">
                    {count}
                  </span>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="ml-3 mt-0.5 mb-1 space-y-0.5">
                {specs.map(spec => (
                  <FilterCheckbox
                    key={spec.id}
                    label={spec.specialism_name}
                    checked={filters.specialisms.includes(spec.id)}
                    onChange={() => onToggle('specialisms', spec.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const EMPTY_FILTERS = { countries: [], specialisms: [], fees: [], availability: [], careerDna: [], capacity: [] }

export default function BrowseRecruiters() {
  const { user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const jobId = searchParams.get('job')

  const [recruiters,       setRecruiters]       = useState([])
  const [allCategories,    setAllCategories]     = useState([])
  const [loading,          setLoading]           = useState(true)
  const [sort,             setSort]              = useState('relevance')
  const [filters,          setFilters]           = useState(EMPTY_FILTERS)
  const [search,           setSearch]            = useState('')
  const [jobTitle,         setJobTitle]          = useState(null)
  const [jobKeywords,      setJobKeywords]       = useState([])
  const [jobSpecialismIds, setJobSpecialismIds]  = useState([])
  const [jobCountries,     setJobCountries]      = useState([])
  const [jobCareerDna,     setJobCareerDna]      = useState(null)

  useEffect(() => {
    supabase
      .from('specialism_categories')
      .select('id, sector, specialism_name')
      .order('display_order')
      .then(({ data }) => { if (data) setAllCategories(data) })
  }, [])

  useEffect(() => {
    if (!jobId) return
    supabase
      .from('jobs')
      .select('title, description, sector')
      .eq('id', jobId)
      .single()
      .then(({ data }) => {
        if (!data) return
        setJobTitle(data.title)
        const raw = [data.title ?? '', data.description ?? '', data.sector ?? ''].join(' ')
        setJobKeywords([...new Set(extractKeywords(raw))])
      })
  }, [jobId])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase
      .from('recruiter_profiles')
      .select(`
        id, user_id, first_name, last_name, bio, headline, profile_photo_url,
        years_experience, availability_status, preferred_fee_percentage,
        total_placements, linkedin_url, linkedin_network_size_tier,
        response_time_average, last_active_at, created_at,
        career_dna, capacity_status, previous_employers,
        average_days_to_shortlist, last_placement_at,
        recruiter_specialisms!left(
          specialism_category_id,
          specialism_categories(sector, specialism_name)
        ),
        recruiter_locations!left(country, region),
        recruiter_tools!left(tool_name, verified),
        recruiter_scores!left(overall_average, total_hm_reviews, total_candidate_reviews)
      `)
      .eq('status', 'approved')
      .then(({ data, error }) => {
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

  const clearFilters = useCallback(() => { setFilters(EMPTY_FILTERS); setSearch('') }, [])
  const hasActiveFilters = search.length >= 3 || Object.values(filters).some(a => a.length > 0)

  const searchWords = useMemo(() => {
    if (search.length < 3) return []
    return extractKeywords(search)
  }, [search])

  const filtered = useMemo(() => recruiters.filter(r => {
    if (filters.countries.length > 0) {
      const rc = (r.recruiter_locations ?? []).map(l => l.country)
      if (!filters.countries.some(c => rc.includes(c))) return false
    }
    if (filters.specialisms.length > 0) {
      const rIds = (r.recruiter_specialisms ?? []).map(rs => rs.specialism_category_id)
      if (!filters.specialisms.some(id => rIds.includes(id))) return false
    }
    if (filters.fees.length > 0) {
      const recruiterFees = (r.preferred_fee_percentage ?? '').toString().split(',').map(s => s.trim()).filter(Boolean)
      if (!filters.fees.some(f => recruiterFees.includes(f))) return false
    }
    if (filters.availability.length > 0) {
      if (!filters.availability.includes(r.availability_status)) return false
    }
    if (filters.careerDna.length > 0) {
      if (!r.career_dna || !filters.careerDna.includes(r.career_dna)) return false
    }
    if (filters.capacity.length > 0) {
      if (!filters.capacity.includes(r.capacity_status)) return false
    }
    if (searchWords.length > 0) {
      const rNames   = (r.recruiter_specialisms ?? []).map(rs => rs.specialism_categories?.specialism_name ?? '')
      const haystack = [r.bio ?? '', r.first_name ?? '', r.last_name ?? '', ...rNames].join(' ').toLowerCase()
      if (!searchWords.some(kw => haystack.includes(kw))) return false
    }
    return true
  }), [recruiters, filters, searchWords])

  const withScores = useMemo(() => {
    if (!jobId) return filtered.map(r => ({ ...r, _matchScore: null }))
    return filtered.map(r => ({
      ...r,
      _matchScore: computeMatchScore(r, jobSpecialismIds, jobCountries, jobKeywords, jobCareerDna),
    }))
  }, [filtered, jobId, jobSpecialismIds, jobCountries, jobKeywords, jobCareerDna])

  const sorted = useMemo(() => {
    const arr = [...withScores]
    switch (sort) {
      case 'relevance':
        if (jobId) return arr.sort((a, b) => (b._matchScore ?? 0) - (a._matchScore ?? 0))
        return arr.sort((a, b) =>
          computeRelevance(b, filters, jobKeywords) - computeRelevance(a, filters, jobKeywords)
        )
      case 'rating':
        return arr.sort((a, b) =>
          (b.recruiter_scores?.[0]?.overall_average ?? 0) - (a.recruiter_scores?.[0]?.overall_average ?? 0)
        )
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
  }, [withScores, sort, filters, jobKeywords, jobId])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/hiring-manager/dashboard">
            <Logo />
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
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Browse Recruiters</h1>
          <p className="text-gray-500 mt-1 text-sm">Find the right specialist for your next hire</p>
        </div>

        <div className="mb-4">
          <div className="relative max-w-lg">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="input pl-9 w-full"
              placeholder="Search by name, specialism, or keyword…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search.length > 0 && search.length < 3 && (
            <p className="text-xs text-gray-400 mt-1 ml-1">Type at least 3 characters to search</p>
          )}
        </div>

        {jobId && jobTitle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-blue-800">
              Showing recruiters matched to your role: <strong>{jobTitle}</strong>
            </p>
            <Link to="/post-job" className="text-xs text-blue-600 hover:underline ml-auto flex-shrink-0">
              Post another role
            </Link>
          </div>
        )}

        <div className="flex gap-8 items-start">
          <aside className="w-60 flex-shrink-0 bg-white rounded-xl border border-gray-200 p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
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
                {MARKETS.map(c => (
                  <FilterCheckbox key={c} label={c}
                    checked={filters.countries.includes(c)}
                    onChange={() => toggle('countries', c)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Specialisms">
              {allCategories.length > 0 ? (
                <SpecialismFilterSection categories={allCategories} filters={filters} onToggle={toggle} />
              ) : (
                <div className="flex justify-center py-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />
                </div>
              )}
            </FilterSection>

            <FilterSection title="Career DNA">
              <div className="space-y-1">
                {FILTER_CAREER_DNA.map(f => (
                  <FilterCheckbox key={f.value} label={f.label}
                    checked={filters.careerDna.includes(f.value)}
                    onChange={() => toggle('careerDna', f.value)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Capacity">
              <div className="space-y-1">
                {FILTER_CAPACITY.map(f => (
                  <FilterCheckbox key={f.value} label={f.label}
                    checked={filters.capacity.includes(f.value)}
                    onChange={() => toggle('capacity', f.value)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Standard rate">
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                Recruiters may negotiate within the 6 to 10 percent range on the discovery call.
              </p>
              <div className="space-y-1">
                {FILTER_FEES.map(f => (
                  <FilterCheckbox key={f.value} label={f.label}
                    checked={filters.fees.includes(f.value)}
                    onChange={() => toggle('fees', f.value)} />
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Availability">
              <div className="space-y-1">
                {FILTER_AVAIL.map(a => (
                  <FilterCheckbox key={a.value} label={a.label}
                    checked={filters.availability.includes(a.value)}
                    onChange={() => toggle('availability', a.value)} />
                ))}
              </div>
            </FilterSection>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-500">
                {loading ? 'Loading…' : (
                  <>
                    <span className="font-semibold text-gray-800">{sorted.length}</span>{' '}
                    recruiter{sorted.length !== 1 ? 's' : ''} found
                  </>
                )}
              </p>
              <select
                className="input w-44 text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            ) : (
              <div className="flex flex-col gap-4">
                {sorted.map(r => (
                  <RecruiterCard
                    key={r.id}
                    recruiter={r}
                    jobId={jobId}
                    matchScore={r._matchScore}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
