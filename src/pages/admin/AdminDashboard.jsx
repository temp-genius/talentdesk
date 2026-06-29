import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import AdminNav from '../../components/admin/AdminNav'
import { approveRecruiter as runApprovalFlow } from '../../lib/recruiterActions'

// ── helpers ──────────────────────────────────────────────────────────
function fmtCurrency(n, currency = 'EUR') {
  return n == null ? '—' : new Intl.NumberFormat('en-IE', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(n)
}

function daysUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso) - new Date()
  return Math.ceil(diff / 86_400_000)
}

const STATUS_BADGE = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended:'bg-gray-100 text-gray-700',
  active:   'bg-green-100 text-green-800',
  draft:    'bg-gray-100 text-gray-600',
  completed:'bg-blue-100 text-blue-800',
}

// ── Action Required tab ───────────────────────────────────────────────
function ActionRequired() {
  const { user } = useAuth()
  const [pending,       setPending]       = useState([])
  const [disputes,      setDisputes]      = useState({ count: 0 })
  const [payments,      setPayments]      = useState({ count: 0 })
  const [newStarts,     setNewStarts]     = useState([])
  const [loading,       setLoading]       = useState(true)
  const [noteInputs,    setNoteInputs]    = useState({})
  const [emailWarning,  setEmailWarning]  = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const yesterday = new Date(Date.now() - 86_400_000).toISOString()

    const [
      { data: pRecs },
      { count: dCount },
      { count: pCount },
      { data: starts },
    ] = await Promise.all([
      supabase.from('recruiter_profiles')
        .select('id, user_id, first_name, last_name, linkedin_url, created_at, approval_notes, years_experience, recruiter_locations(country)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase.from('disputes').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
      supabase.from('job_recruiter_assignments')
        .select('id, assigned_at, jobs(title), recruiter_profiles(first_name, last_name)')
        .gte('assigned_at', yesterday)
        .order('assigned_at', { ascending: false }),
    ])

    setPending(pRecs ?? [])
    setDisputes({ count: dCount ?? 0 })
    setPayments({ count: pCount ?? 0 })
    setNewStarts(starts ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function approveRecruiter(profile) {
    setEmailWarning('')
    const result = await runApprovalFlow(profile, user?.id)
    if (result.warning) setEmailWarning(result.warning)
    load()
  }

  async function declineRecruiter(id) {
    await supabase.from('recruiter_profiles').update({ status: 'rejected' }).eq('id', id)
    load()
  }

  async function saveNote(id) {
    const note = noteInputs[id] ?? ''
    await supabase.from('recruiter_profiles').update({ approval_notes: note }).eq('id', id)
    setNoteInputs(n => ({ ...n, [id]: undefined }))
    load()
  }

  if (loading) return <LoadingSpinner />

  const totalActions = pending.length + disputes.count + payments.count

  return (
    <div className="space-y-6">
      {emailWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{emailWarning}</span>
        </div>
      )}

      {totalActions === 0 && newStarts.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-gray-500 font-medium">No actions required right now.</p>
        </div>
      )}

      {/* Pending recruiter applications */}
      {pending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Pending Recruiter Applications</h2>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length}
            </span>
          </div>
          <div className="space-y-4">
            {pending.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">
                      {r.first_name ?? '(no name)'} {r.last_name ?? ''}
                    </p>
                    <div className="text-sm text-gray-500 space-y-0.5 mt-1">
                      {r.linkedin_url && (
                        <p>
                          <a href={r.linkedin_url} target="_blank" rel="noreferrer"
                            className="text-primary-600 hover:underline truncate block max-w-xs">
                            {r.linkedin_url}
                          </a>
                        </p>
                      )}
                      {r.recruiter_locations?.length > 0 && (
                        <p>Markets: {r.recruiter_locations.map(l => l.country).join(', ')}</p>
                      )}
                      {r.years_experience && <p>{r.years_experience} years experience</p>}
                      <p className="text-xs text-gray-400">
                        Applied {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {r.approval_notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">Note: {r.approval_notes}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <input
                        className="input text-xs py-1 flex-1 max-w-xs"
                        placeholder="Add a note (optional)"
                        value={noteInputs[r.id] ?? r.approval_notes ?? ''}
                        onChange={e => setNoteInputs(n => ({ ...n, [r.id]: e.target.value }))}
                      />
                      <button onClick={() => saveNote(r.id)} className="btn-secondary text-xs px-2 py-1">
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approveRecruiter(r)} className="btn-primary text-sm">
                      Approve
                    </button>
                    <button
                      onClick={() => declineRecruiter(r.id)}
                      className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium
                                 bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Open disputes */}
      {disputes.count > 0 && (
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Open Disputes</p>
            <p className="text-sm text-gray-500">{disputes.count} require resolution</p>
          </div>
          <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
            {disputes.count}
          </span>
        </div>
      )}

      {/* Failed payments */}
      {payments.count > 0 && (
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Failed Payments</p>
            <p className="text-sm text-gray-500">{payments.count} need attention</p>
          </div>
          <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
            {payments.count}
          </span>
        </div>
      )}

      {/* New job starts */}
      {newStarts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            New Job Starts — Email Accounts to Create ({newStarts.length})
          </h2>
          <div className="space-y-2">
            {newStarts.map(a => (
              <div key={a.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.jobs?.title ?? '—'}</p>
                  <p className="text-xs text-gray-500">
                    {a.recruiter_profiles?.first_name} {a.recruiter_profiles?.last_name}
                    · Started {new Date(a.assigned_at).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  New
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Platform Overview tab ─────────────────────────────────────────────
function Platform() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: rps },
        { count: companies },
        { count: activeJobs },
        { count: placements },
        { data: payments },
        { count: allDisputes },
        { count: openDisputes },
      ] = await Promise.all([
        supabase.from('recruiter_profiles').select('status'),
        supabase.from('hiring_company_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('job_recruiter_assignments').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('payments').select('platform_fee_amount').eq('status', 'transferred'),
        supabase.from('disputes').select('id', { count: 'exact', head: true }),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).neq('status', 'resolved'),
      ])

      const recruitersByStatus = (rps ?? []).reduce((acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1
        return acc
      }, {})

      const totalFees = (payments ?? []).reduce((sum, p) => sum + (p.platform_fee_amount ?? 0), 0)
      const disputeRate = allDisputes ? ((openDisputes ?? 0) / allDisputes * 100).toFixed(1) : '0'

      setStats({
        recruitersByStatus,
        totalRecruiters: (rps ?? []).length,
        companies: companies ?? 0,
        activeJobs: activeJobs ?? 0,
        placements: placements ?? 0,
        totalFees,
        disputeRate,
        openDisputes: openDisputes ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />
  if (!stats)  return null

  const cards = [
    { label: 'Total Recruiters',   value: stats.totalRecruiters },
    { label: '— Approved',        value: stats.recruitersByStatus.approved ?? 0, sub: true },
    { label: '— Pending',         value: stats.recruitersByStatus.pending ?? 0, sub: true, warn: true },
    { label: '— Rejected',        value: stats.recruitersByStatus.rejected ?? 0, sub: true },
    { label: 'Hiring Companies',   value: stats.companies },
    { label: 'Active Jobs',        value: stats.activeJobs },
    { label: 'Completed Placements', value: stats.placements },
    { label: 'Platform Fees Earned', value: fmtCurrency(stats.totalFees) },
    { label: 'Open Disputes',      value: stats.openDisputes, warn: stats.openDisputes > 0 },
    { label: 'Dispute Rate',       value: `${stats.disputeRate}%` },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`card ${c.sub ? 'pl-10 py-4' : ''}`}>
          <p className={`text-xs font-medium uppercase tracking-wide ${c.sub ? 'text-gray-400' : 'text-gray-500'}`}>
            {c.label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${c.warn ? 'text-red-600' : 'text-gray-900'}`}>
            {c.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Edit Tier modal ───────────────────────────────────────────────────
function EditTierModal({ recruiter, onSave, onCancel }) {
  const [floor,   setFloor]   = useState(recruiter.fee_floor   != null ? String(recruiter.fee_floor)   : '')
  const [ceiling, setCeiling] = useState(recruiter.fee_ceiling != null ? String(recruiter.fee_ceiling) : '')

  const floorNum   = floor   === '' ? null : Number(floor)
  const ceilingNum = ceiling === '' ? null : Number(ceiling)
  const rangeError = floorNum !== null && ceilingNum !== null && ceilingNum < floorNum
  const canSave    = floorNum !== null && ceilingNum !== null && !rangeError

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-0.5">
          Edit Fee Tier — {recruiter.first_name} {recruiter.last_name}
        </h3>
        <p className="text-xs text-gray-500 mb-4">No email will be sent. Data correction only.</p>
        <div className="flex gap-4 mb-2">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fee Floor</label>
            <select className="input" value={floor} onChange={e => setFloor(e.target.value)}>
              <option value="">—</option>
              {[8, 10, 12].map(v => <option key={v} value={v}>{v}%</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fee Ceiling</label>
            <select className="input" value={ceiling} onChange={e => setCeiling(e.target.value)}>
              <option value="">—</option>
              {[8, 10, 12].map(v => <option key={v} value={v}>{v}%</option>)}
            </select>
          </div>
        </div>
        {rangeError && <p className="text-xs text-red-600 mb-3">Ceiling must be ≥ floor.</p>}
        <div className="flex gap-3 justify-end mt-4">
          <button className="btn-secondary text-sm" onClick={onCancel}>Cancel</button>
          <button
            className="btn-primary text-sm disabled:opacity-50"
            onClick={() => canSave && onSave(floorNum, ceilingNum)}
            disabled={!canSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Recruiters tab ────────────────────────────────────────────────────
function RecruitersTab() {
  const { user } = useAuth()
  const [rows,         setRows]         = useState([])
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [marketFilter, setMarketFilter] = useState('all')
  const [loading,      setLoading]      = useState(true)
  const [emailWarning, setEmailWarning] = useState('')
  const [editingTier,  setEditingTier]  = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('recruiter_profiles')
      .select(`
        id, first_name, last_name, status, total_placements, last_active_at,
        approval_notes, years_experience, availability_status, career_dna, capacity_status,
        fee_floor, fee_ceiling,
        users(email),
        recruiter_specialisms!left(
          specialism_category_id,
          specialism_categories(sector, specialism_name)
        ),
        recruiter_locations!left(country)
      `)
      .order('created_at', { ascending: false })
    setRows(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveTier(id, feeFloor, feeCeiling) {
    await supabase
      .from('recruiter_profiles')
      .update({ fee_floor: feeFloor, fee_ceiling: feeCeiling })
      .eq('id', id)
    setEditingTier(null)
    load()
  }

  async function setStatus(id, newStatus) {
    setEmailWarning('')
    const currentStatus = rows.find(r => r.id === id)?.status
    if (newStatus === 'approved' && currentStatus !== 'suspended') {
      const profile = rows.find(r => r.id === id)
      const result  = await runApprovalFlow(profile, user?.id)
      if (result.warning) setEmailWarning(result.warning)
    } else {
      await supabase.from('recruiter_profiles').update({ status: newStatus }).eq('id', id)
    }
    load()
  }

  // ── derive stats (no extra queries) ──────────────────────────────────
  const statusCounts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  // Each card uses only the OTHER axis's filter so both show a meaningful
  // cross-tab breakdown rather than a trivially self-confirming result.
  const sectorCardRows = marketFilter === 'all'
    ? rows
    : rows.filter(r =>
        (r.recruiter_locations ?? []).map(l => l.country).includes(marketFilter)
      )

  const marketCardRows = sectorFilter === 'all'
    ? rows
    : rows.filter(r =>
        (r.recruiter_specialisms ?? [])
          .map(s => s.specialism_categories?.sector)
          .filter(Boolean)
          .includes(sectorFilter)
      )

  const sectorCardCounts = {}
  sectorCardRows.forEach(r => {
    const sectors = new Set(
      (r.recruiter_specialisms ?? []).map(s => s.specialism_categories?.sector).filter(Boolean)
    )
    sectors.forEach(s => { sectorCardCounts[s] = (sectorCardCounts[s] ?? 0) + 1 })
  })

  const marketCardCounts = {}
  marketCardRows.forEach(r => {
    const countries = new Set((r.recruiter_locations ?? []).map(l => l.country).filter(Boolean))
    countries.forEach(c => { marketCardCounts[c] = (marketCardCounts[c] ?? 0) + 1 })
  })

  const topSectors = Object.entries(sectorCardCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topMarkets = Object.entries(marketCardCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const sectorCardTitle = marketFilter !== 'all' ? `Sectors in ${marketFilter}` : 'Top Sectors'
  const marketCardTitle = sectorFilter !== 'all' ? `Markets in ${sectorFilter}` : 'Top Markets'

  // ── filter options (always from full rows so dropdowns never disappear) ──
  const allSectorCounts = {}
  rows.forEach(r => {
    new Set((r.recruiter_specialisms ?? []).map(s => s.specialism_categories?.sector).filter(Boolean))
      .forEach(s => { allSectorCounts[s] = (allSectorCounts[s] ?? 0) + 1 })
  })
  const allMarketCounts = {}
  rows.forEach(r => {
    new Set((r.recruiter_locations ?? []).map(l => l.country).filter(Boolean))
      .forEach(c => { allMarketCounts[c] = (allMarketCounts[c] ?? 0) + 1 })
  })
  const allSectors = Object.keys(allSectorCounts).sort()
  const allMarkets = Object.keys(allMarketCounts).sort()

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    const name  = `${r.first_name ?? ''} ${r.last_name ?? ''}`.toLowerCase()
    const email = (r.users?.email ?? '').toLowerCase()
    if (q && !name.includes(q) && !email.includes(q)) return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (sectorFilter !== 'all') {
      const sectors = (r.recruiter_specialisms ?? [])
        .map(s => s.specialism_categories?.sector)
        .filter(Boolean)
      if (!sectors.includes(sectorFilter)) return false
    }
    if (marketFilter !== 'all') {
      const countries = (r.recruiter_locations ?? []).map(l => l.country).filter(Boolean)
      if (!countries.includes(marketFilter)) return false
    }
    return true
  })

  const hasFilters = search || statusFilter !== 'all' || sectorFilter !== 'all' || marketFilter !== 'all'

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {emailWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{emailWarning}</span>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Recruiters</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{rows.length}</p>
          <div className="flex flex-wrap gap-1.5">
            {['approved','pending','rejected','suspended'].map(s => statusCounts[s] ? (
              <span key={s} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[s]}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)} · {statusCounts[s]}
              </span>
            ) : null)}
          </div>
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{sectorCardTitle}</p>
          {topSectors.length === 0
            ? <p className="text-sm text-gray-400">No data</p>
            : (
              <dl className="space-y-1">
                {topSectors.map(([sector, count]) => (
                  <div key={sector} className="flex justify-between text-sm">
                    <dt className="text-gray-600 truncate">{sector}</dt>
                    <dd className="font-semibold text-gray-900 ml-2">{count}</dd>
                  </div>
                ))}
              </dl>
            )
          }
        </div>
        <div className="card">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{marketCardTitle}</p>
          {topMarkets.length === 0
            ? <p className="text-sm text-gray-400">No data</p>
            : (
              <dl className="space-y-1">
                {topMarkets.map(([country, count]) => (
                  <div key={country} className="flex justify-between text-sm">
                    <dt className="text-gray-600 truncate">{country}</dt>
                    <dd className="font-semibold text-gray-900 ml-2">{count}</dd>
                  </div>
                ))}
              </dl>
            )
          }
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search recruiters…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {['approved','pending','rejected','suspended'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select className="input w-auto" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
          <option value="all">All sectors</option>
          {allSectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-auto" value={marketFilter} onChange={e => setMarketFilter(e.target.value)}>
          <option value="all">All markets</option>
          {allMarkets.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {hasFilters && (
          <button
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            onClick={() => { setSearch(''); setStatusFilter('all'); setSectorFilter('all'); setMarketFilter('all') }}
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          Showing {filtered.length} of {rows.length} recruiters
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Name', 'Email', 'Sectors', 'Markets', 'Status', 'Tier', 'Placements', 'Last Active', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(r => {
              const sectors   = [...new Set((r.recruiter_specialisms ?? []).map(s => s.specialism_categories?.sector).filter(Boolean))]
              const countries = (r.recruiter_locations ?? []).map(l => l.country).filter(Boolean)
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{r.users?.email ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                    {sectors.length ? sectors.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate">
                    {countries.length ? countries.join(', ') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {r.fee_floor != null && r.fee_ceiling != null
                      ? r.fee_floor === r.fee_ceiling
                        ? `${r.fee_floor}%`
                        : `${r.fee_floor}–${r.fee_ceiling}%`
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.total_placements ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {r.last_active_at ? new Date(r.last_active_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {(r.status === 'pending' || r.status === 'rejected') && (
                        <button onClick={() => setStatus(r.id, 'approved')}
                          className="text-xs text-green-700 hover:text-green-900 font-medium">
                          Approve
                        </button>
                      )}
                      {r.status === 'suspended' && (
                        <button onClick={() => setStatus(r.id, 'approved')}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium">
                          Reinstate
                        </button>
                      )}
                      {r.status !== 'suspended' && (
                        <button onClick={() => setStatus(r.id, 'suspended')}
                          className="text-xs text-red-600 hover:text-red-800 font-medium">
                          Suspend
                        </button>
                      )}
                      <button onClick={() => setEditingTier(r)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        Edit Tier
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No recruiters found.</p>
        )}
      </div>

      {editingTier && (
        <EditTierModal
          recruiter={editingTier}
          onSave={(floor, ceiling) => saveTier(editingTier.id, floor, ceiling)}
          onCancel={() => setEditingTier(null)}
        />
      )}
    </div>
  )
}

// ── Jobs tab ──────────────────────────────────────────────────────────
function JobsTab() {
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('jobs')
      .select(`
        id, title, status, created_at,
        hiring_company_profiles(company_name),
        job_recruiter_assignments!left(
          id, status,
          recruiter_profiles(first_name, last_name),
          milestones(milestone_number, status)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setJobs(data ?? [])
        setLoading(false)
      })
  }, [])

  function milestoneStage(assignments) {
    const active = assignments?.find(a => a.status === 'assigned')
    if (!active) return '—'
    const sorted = [...(active.milestones ?? [])].sort((a, b) => a.milestone_number - b.milestone_number)
    const current = sorted.find(m => m.status !== 'released')
    if (!current) return 'All released'
    return `M${current.milestone_number} ${current.status}`
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {['Title', 'Company', 'Recruiter', 'Status', 'Milestone', 'Created', ''].map(h => (
              <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {jobs.map(j => {
            const assignment = j.job_recruiter_assignments?.find(a => a.status === 'assigned')
            const recruiter  = assignment?.recruiter_profiles
            return (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{j.title}</td>
                <td className="px-4 py-3 text-gray-500">{j.hiring_company_profiles?.company_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {recruiter ? `${recruiter.first_name} ${recruiter.last_name}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[j.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {j.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {milestoneStage(j.job_recruiter_assignments)}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                  {new Date(j.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {assignment && (
                    <Link to={`/job/${assignment.id}`} target="_blank"
                      className="text-xs text-primary-600 hover:underline font-medium">
                      View →
                    </Link>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {jobs.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-8">No jobs found.</p>
      )}
    </div>
  )
}

// ── Disputes tab ──────────────────────────────────────────────────────
function DisputesTab() {
  const [disputes, setDisputes] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [resolving, setResolving] = useState(null)
  const [partialAmt, setPartialAmt] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('disputes')
      .select(`
        id, dispute_reason, tier, status, outcome, created_at,
        direct_resolution_deadline, adjudicator_notes,
        job_recruiter_assignments(
          jobs(title),
          recruiter_profiles(first_name, last_name)
        )
      `)
      .neq('status', 'resolved')
      .order('created_at', { ascending: true })
    setDisputes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function resolve(id, outcome) {
    const updates = {
      status: 'resolved',
      outcome,
      adjudicator_notes: null,
    }
    if (outcome === 'partial_split' && partialAmt) {
      updates.outcome_amount_if_partial = parseFloat(partialAmt)
    }
    await supabase.from('disputes').update(updates).eq('id', id)
    setResolving(null)
    setPartialAmt('')
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      {disputes.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-gray-500">No open disputes.</p>
        </div>
      )}
      {disputes.map(d => {
        const job       = d.job_recruiter_assignments?.jobs?.title ?? '—'
        const recruiter = d.job_recruiter_assignments?.recruiter_profiles
        const days      = daysUntil(d.direct_resolution_deadline)
        const isResolving = resolving === d.id

        return (
          <div key={d.id} className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{job}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Recruiter: {recruiter ? `${recruiter.first_name} ${recruiter.last_name}` : '—'}
                  {d.tier > 1 && <span className="ml-2 text-xs text-orange-600 font-medium">Tier {d.tier}</span>}
                </p>
                {d.dispute_reason && (
                  <p className="text-sm text-gray-600 mt-1 italic">"{d.dispute_reason}"</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                  <span>Opened {new Date(d.created_at).toLocaleDateString()}</span>
                  {days !== null && (
                    <span className={days <= 3 ? 'text-red-600 font-medium' : ''}>
                      {days > 0 ? `${days}d until deadline` : `${Math.abs(days)}d overdue`}
                    </span>
                  )}
                </div>
              </div>

              {!isResolving ? (
                <button
                  onClick={() => setResolving(d.id)}
                  className="btn-primary text-sm flex-shrink-0"
                >
                  Resolve
                </button>
              ) : (
                <div className="flex flex-col gap-2 flex-shrink-0 min-w-[200px]">
                  <button onClick={() => resolve(d.id, 'release_to_recruiter')}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 font-medium">
                    Release to Recruiter
                  </button>
                  <button onClick={() => resolve(d.id, 'refund_to_hm')}
                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 font-medium">
                    Refund to HM
                  </button>
                  <div className="flex gap-1">
                    <input
                      className="input text-xs py-1 w-24"
                      placeholder="Amount"
                      type="number"
                      value={partialAmt}
                      onChange={e => setPartialAmt(e.target.value)}
                    />
                    <button onClick={() => resolve(d.id, 'partial_split')}
                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 font-medium">
                      Partial Split
                    </button>
                  </div>
                  <button onClick={() => setResolving(null)}
                    className="text-xs text-gray-500 hover:text-gray-700">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'actions',   label: 'Action Required' },
  { id: 'platform',  label: 'Platform' },
  { id: 'recruiters',label: 'Recruiters' },
  { id: 'jobs',      label: 'Jobs' },
  { id: 'disputes',  label: 'Disputes' },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('actions')

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1 mb-6 w-fit overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                ${tab === t.id
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'actions'    && <ActionRequired />}
        {tab === 'platform'   && <Platform />}
        {tab === 'recruiters' && <RecruitersTab />}
        {tab === 'jobs'       && <JobsTab />}
        {tab === 'disputes'   && <DisputesTab />}
      </div>
    </main>
  )
}
