import { supabase } from './supabase'
import { OUTREACH_PENDING_STATUSES } from './constants'

const DAY_MS = 24 * 60 * 60 * 1000

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function groupByCompany(rows) {
  const map = {}
  for (const row of rows) {
    if (!map[row.company_id]) map[row.company_id] = []
    map[row.company_id].push(row)
  }
  return map
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function fetchStats() {
  const [companies, contacts, outreachPending, signalsToday] = await Promise.all([
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('contacts').select('id', { count: 'exact', head: true }),
    supabase
      .from('outreach')
      .select('id', { count: 'exact', head: true })
      .in('status', OUTREACH_PENDING_STATUSES),
    supabase
      .from('signals')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfToday().toISOString()),
  ])

  for (const res of [companies, contacts, outreachPending, signalsToday]) {
    if (res.error) throw res.error
  }

  return {
    totalCompanies: companies.count ?? 0,
    contactsFound: contacts.count ?? 0,
    outreachPending: outreachPending.count ?? 0,
    newSignalsToday: signalsToday.count ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Company feed (dashboard / companies page)
// ---------------------------------------------------------------------------

export async function fetchCompanyFeed(filters, userId) {
  let query = supabase
    .from('signals')
    .select('*, companies(*)')
    .order('signal_date', { ascending: false, nullsFirst: false })
    .limit(500)

  if (filters.signalType) query = query.eq('signal_type', filters.signalType)
  if (filters.dateRange && filters.dateRange !== 'all') {
    const days = Number(filters.dateRange)
    const cutoff = new Date(Date.now() - days * DAY_MS).toISOString()
    query = query.gte('signal_date', cutoff)
  }

  const { data: signalRows, error } = await query
  if (error) throw error

  // Rows are ordered most-recent-first, so the first time we see a
  // company_id it's that company's freshest signal.
  const byCompany = new Map()
  for (const row of signalRows ?? []) {
    if (!row.companies) continue
    if (!byCompany.has(row.company_id)) {
      byCompany.set(row.company_id, { company: row.companies, signal: row })
    }
  }

  let entries = Array.from(byCompany.values())

  if (filters.country) entries = entries.filter((e) => e.company.country === filters.country)
  if (filters.headcount) {
    entries = entries.filter((e) => e.company.headcount_bracket === filters.headcount)
  }
  if (filters.specialism) {
    entries = entries.filter((e) => e.company.specialism_bucket?.includes(filters.specialism))
  }

  const companyIds = entries.map((e) => e.company.id)
  if (companyIds.length === 0) return []

  const [{ data: contacts, error: contactsError }, outreachResult] = await Promise.all([
    supabase.from('contacts').select('*').in('company_id', companyIds),
    userId
      ? supabase.from('outreach').select('*').eq('user_id', userId).in('company_id', companyIds)
      : Promise.resolve({ data: [] }),
  ])
  if (contactsError) throw contactsError
  if (outreachResult.error) throw outreachResult.error

  const contactsByCompany = groupByCompany(contacts ?? [])
  const outreachByCompany = new Map((outreachResult.data ?? []).map((o) => [o.company_id, o]))

  let result = entries.map(({ company, signal }) => ({
    ...company,
    signal,
    contacts: contactsByCompany[company.id] ?? [],
    outreach: outreachByCompany.get(company.id) ?? null,
  }))

  if (filters.status) {
    result = result.filter((c) => (c.outreach?.status ?? 'new') === filters.status)
  }

  return result
}

export async function fetchCompanyDetail(companyId, userId) {
  const [companyRes, signalRes, contactsRes, outreachRes] = await Promise.all([
    supabase.from('companies').select('*').eq('id', companyId).single(),
    supabase
      .from('signals')
      .select('*')
      .eq('company_id', companyId)
      .order('signal_date', { ascending: false, nullsFirst: false })
      .limit(1),
    supabase.from('contacts').select('*').eq('company_id', companyId),
    userId
      ? supabase.from('outreach').select('*').eq('user_id', userId).eq('company_id', companyId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  if (companyRes.error) throw companyRes.error
  if (signalRes.error) throw signalRes.error
  if (contactsRes.error) throw contactsRes.error
  if (outreachRes.error) throw outreachRes.error

  return {
    ...companyRes.data,
    signal: signalRes.data?.[0] ?? null,
    contacts: contactsRes.data ?? [],
    outreach: outreachRes.data ?? null,
  }
}

// ---------------------------------------------------------------------------
// Signals feed
// ---------------------------------------------------------------------------

export async function fetchSignalsFeed(limit = 100) {
  const { data, error } = await supabase
    .from('signals')
    .select('*, companies(*)')
    .order('signal_date', { ascending: false, nullsFirst: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createCompany({
  name,
  domain,
  country,
  headcountBracket,
  linkedinCompanyUrl,
  specialismBucket,
  notes,
  signalType,
  signalHeadline,
  signalDate,
}) {
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name,
      domain: domain || null,
      country: country || null,
      headcount_bracket: headcountBracket || null,
      linkedin_company_url: linkedinCompanyUrl || null,
      specialism_bucket: specialismBucket?.length ? specialismBucket : null,
      description: notes || null,
    })
    .select()
    .single()
  if (companyError) throw companyError

  const { error: signalError } = await supabase.from('signals').insert({
    company_id: company.id,
    signal_type: signalType,
    signal_date: signalDate ? new Date(signalDate).toISOString() : new Date().toISOString(),
    headline: signalHeadline,
    source_name: 'Manual entry',
  })
  if (signalError) throw signalError

  return company
}

export async function setOutreachStatus({ companyId, userId, status }) {
  const { data, error } = await supabase
    .from('outreach')
    .upsert({ company_id: companyId, user_id: userId, status }, { onConflict: 'user_id,company_id' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Edge Functions
// ---------------------------------------------------------------------------

export async function triggerIngestRss() {
  const { data, error } = await supabase.functions.invoke('ingest-rss', { method: 'POST' })
  if (error) throw error
  return data
}

export async function triggerEnrichCompany(companyId) {
  const { data, error } = await supabase.functions.invoke('enrich-company', {
    method: 'POST',
    body: { company_id: companyId },
  })
  if (error) throw error
  return data
}
