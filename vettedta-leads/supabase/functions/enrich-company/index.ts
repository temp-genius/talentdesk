// Supabase Edge Function: enrich-company
//
// Given a company_id: scrapes the company's website for a team/about page,
// extracts likely decision-maker contacts, resolves each contact's
// LinkedIn profile via a Bing "X-Ray" search, fetches a company logo from
// Clearbit, and marks the company as enriched.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import * as cheerio from 'npm:cheerio@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const BING_API_KEY = Deno.env.get('BING_API_KEY')

const TEAM_PAGE_PATHS = ['/team', '/about', '/about-us', '/people', '/company']

const TITLE_RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /chief executive|^ceo\b|\bceo\b|co-?founder|^founder\b/i, category: 'founder' },
  { pattern: /head of people|head of talent|hr director|chief people/i, category: 'people' },
  { pattern: /\bcto\b|chief technology|vp engineering|vp of engineering/i, category: 'tech' },
  { pattern: /\bcoo\b|chief operating|\bmd\b|managing director/i, category: 'ops' },
  { pattern: /\bcpo\b|chief product/i, category: 'commercial' },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function classifyTitle(title: string): string | null {
  for (const rule of TITLE_RULES) {
    if (rule.pattern.test(title)) return rule.category
  }
  return null
}

function normaliseUrl(domain: string, path: string): string {
  const base = domain.startsWith('http') ? domain : `https://${domain}`
  return new URL(path, base).toString()
}

type ScrapedContact = { name: string; title: string; category: string }

function extractContactsFromHtml(html: string): ScrapedContact[] {
  const $ = cheerio.load(html)
  const found: ScrapedContact[] = []
  const seen = new Set<string>()

  const addCandidate = (name: string, title: string) => {
    name = name.trim()
    title = title.trim()
    if (!name || !title) return
    if (name.length > 60 || title.length > 80) return
    const category = classifyTitle(title)
    if (!category) return
    const key = `${name.toLowerCase()}|${title.toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    found.push({ name, title, category })
  }

  // Pattern 1: heading (h2/h3/h4) followed by a paragraph, e.g.
  // <h3>Jane Doe</h3><p>Chief Executive Officer</p>
  $('h2, h3, h4').each((_, el) => {
    const name = $(el).text()
    const next = $(el).next('p, span, div')
    if (next.length) addCandidate(name, next.first().text())
  })

  // Pattern 2: sibling name/title elements sharing a common class prefix,
  // e.g. <div class="team-name">Jane Doe</div><div class="team-title">CEO</div>
  $('[class*="name" i]').each((_, el) => {
    const name = $(el).text()
    const container = $(el).closest('div, li, article')
    const titleEl = container.find('[class*="title" i], [class*="role" i], [class*="position" i]').first()
    if (titleEl.length) addCandidate(name, titleEl.text())
  })

  return found
}

async function scrapeTeamContacts(domain: string): Promise<ScrapedContact[]> {
  const allContacts: ScrapedContact[] = []
  const seenKeys = new Set<string>()

  for (const path of TEAM_PAGE_PATHS) {
    try {
      const url = normaliseUrl(domain, path)
      const res = await fetch(url, {
        headers: { 'User-Agent': 'VettedTALeadsBot/1.0' },
      })
      if (!res.ok) continue
      const html = await res.text()
      const contacts = extractContactsFromHtml(html)
      for (const c of contacts) {
        const key = c.name.toLowerCase()
        if (seenKeys.has(key)) continue
        seenKeys.add(key)
        allContacts.push(c)
      }
    } catch {
      // Path doesn't exist or timed out — try the next one
      continue
    }
  }

  return allContacts
}

async function findLinkedInUrl(
  contactName: string,
  companyName: string,
): Promise<{ url: string | null; confidence: number }> {
  if (!BING_API_KEY) return { url: null, confidence: 0 }

  const query = `site:linkedin.com/in/ "${contactName}" "${companyName}"`
  try {
    const res = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5`,
      { headers: { 'Ocp-Apim-Subscription-Key': BING_API_KEY } },
    )
    if (!res.ok) return { url: null, confidence: 0 }
    const data = await res.json()
    const results: Array<{ url: string; name?: string }> =
      data?.webPages?.value ?? []

    const linkedInResult = results.find((r) =>
      /linkedin\.com\/in\//i.test(r.url),
    )
    if (!linkedInResult) return { url: null, confidence: 20 }

    // Crude confidence heuristic: higher if the contact's name appears in
    // the result title, and it's the top result.
    const isTopResult = results[0] === linkedInResult
    const nameInTitle = linkedInResult.name
      ?.toLowerCase()
      .includes(contactName.toLowerCase())
    let confidence = 50
    if (isTopResult) confidence += 25
    if (nameInTitle) confidence += 15
    return { url: linkedInResult.url, confidence: Math.min(confidence, 95) }
  } catch {
    return { url: null, confidence: 0 }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { company_id } = await req.json()
    if (!company_id) {
      return new Response(JSON.stringify({ error: 'company_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single()
    if (companyError || !company) {
      return new Response(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = {
      company_id,
      contacts_found: 0,
      contacts_with_linkedin: 0,
      logo_set: false,
    }

    // Step 1 — website scrape
    let scraped: ScrapedContact[] = []
    if (company.domain) {
      scraped = await scrapeTeamContacts(company.domain)
    }

    const insertedContacts: Array<{ id: string; name: string }> = []
    let primaryAssigned = false

    for (const contact of scraped) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('company_id', company_id)
        .ilike('name', contact.name)
        .maybeSingle()
      if (existing) continue

      const isPrimary = !primaryAssigned && contact.category === 'people'

      const { data: inserted, error: insertError } = await supabase
        .from('contacts')
        .insert({
          company_id,
          name: contact.name,
          title: contact.title,
          title_category: contact.category,
          confidence_score: 40,
          is_primary_contact: isPrimary,
        })
        .select('id, name')
        .single()

      if (insertError || !inserted) continue
      if (isPrimary) primaryAssigned = true
      insertedContacts.push(inserted)
      result.contacts_found++
    }

    // If nobody in "people" was found, fall back to the first founder as primary
    if (!primaryAssigned && insertedContacts.length > 0) {
      await supabase
        .from('contacts')
        .update({ is_primary_contact: true })
        .eq('id', insertedContacts[0].id)
    }

    // Step 2 — Bing X-Ray search for each new contact, rate-limited to 1/sec
    for (const contact of insertedContacts) {
      const { url, confidence } = await findLinkedInUrl(contact.name, company.name)
      if (url) {
        await supabase
          .from('contacts')
          .update({ linkedin_url: url, confidence_score: confidence })
          .eq('id', contact.id)
        result.contacts_with_linkedin++
      }
      await sleep(1000)
    }

    // Step 3 — company logo via Clearbit
    let logoUrl: string | null = null
    if (company.domain) {
      logoUrl = `https://logo.clearbit.com/${company.domain}`
      try {
        const logoRes = await fetch(logoUrl, { method: 'HEAD' })
        if (!logoRes.ok) logoUrl = null
      } catch {
        logoUrl = null
      }
    }
    if (logoUrl) result.logo_set = true

    // Step 4 — mark company enriched
    await supabase
      .from('companies')
      .update({
        enriched_at: new Date().toISOString(),
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      })
      .eq('id', company_id)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
