// Supabase Edge Function: ingest-rss
//
// Fetches every active RSS source, scans new articles for hiring-intent
// signals (funding / senior hire / expansion), and writes new
// companies + signals rows. Safe to run repeatedly — already-ingested
// articles (matched by source_url) are skipped.
//
// For newly created companies, also tries to infer + verify a domain and
// kicks off enrich-company in the background, so contacts start appearing
// without anyone having to open the company and click "Enrich" by hand.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { XMLParser } from 'npm:fast-xml-parser@4.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const FUNDING_KEYWORDS = [
  'raises', 'secures', 'funding', 'investment', 'seed round',
  'series a', 'series b', 'series c', 'closes round', 'million', '€', '$',
]

const SENIOR_HIRE_KEYWORDS = [
  'appoints', 'joins as', 'welcomes', 'new cto', 'new cpo', 'new ceo',
  'head of', 'vp of',
]

const EXPANSION_KEYWORDS = [
  'expands to', 'opens office', 'new market', 'launches in',
  'european expansion',
]

// EU-Startups and Tech.eu cover the whole of Europe, not just Ireland/UK —
// require one of these place names in the title/description before an
// article from those two feeds is processed. Word-boundaried so short
// tokens like "UK" don't match inside unrelated words (e.g. "Ukraine").
const GEO_FILTER_TERMS = [
  'Ireland', 'Irish', 'Dublin', 'UK', 'London', 'Britain', 'British',
  'Edinburgh', 'Manchester', 'Belfast',
]
const GEO_FILTER_REGEX = new RegExp(
  `\\b(${GEO_FILTER_TERMS.join('|')})\\b`,
  'i',
)

// Silicon Republic, Irish Times, The Currency, and the new Ireland-only
// sources are already Ireland-focused, so they're intentionally excluded
// from this list and get no geographic filter applied.
function requiresGeoFilter(source: { name: string; url: string }): boolean {
  const haystack = `${source.name} ${source.url}`.toLowerCase()
  return haystack.includes('eu-startups') || haystack.includes('tech.eu')
}

function passesGeoFilter(source: { name: string; url: string }, text: string): boolean {
  if (!requiresGeoFilter(source)) return true
  return GEO_FILTER_REGEX.test(text)
}

// Extracted company names that are common words, city names, or otherwise
// clearly not a company — reject these rather than create a garbage
// company record. Extended beyond the literal "Dublin/London/Ireland"
// asks with other European tech-hub cities (e.g. "Vilnius"), since those
// are the same class of bad extraction and are what prompted this fix.
const GENERIC_NAME_BLOCKLIST = new Set([
  'the', 'this', 'new', 'how', 'why', 'when',
  'dublin', 'london', 'ireland', 'europe', 'european',
  'vilnius', 'berlin', 'paris', 'amsterdam', 'lisbon', 'madrid', 'warsaw',
  'prague', 'stockholm', 'copenhagen', 'helsinki', 'barcelona', 'munich',
  'vienna', 'zurich', 'brussels', 'krakow', 'tallinn', 'riga',
])

function isQualityCompanyName(name: string): boolean {
  const trimmed = name.trim()
  if (trimmed.length < 4) return false
  if (GENERIC_NAME_BLOCKLIST.has(trimmed.toLowerCase())) return false

  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length === 1 && trimmed.length < 5) return false

  return true
}

type ParsedItem = {
  title: string
  link: string
  pubDate: string | null
  description: string
}

function stripHtml(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchKeywords(text: string, keywords: string[]): string | null {
  const lower = text.toLowerCase()
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) return kw
  }
  return null
}

function detectSignalType(
  text: string,
): { type: string; keyword: string } | null {
  const funding = matchKeywords(text, FUNDING_KEYWORDS)
  if (funding) return { type: 'funding', keyword: funding }

  const seniorHire = matchKeywords(text, SENIOR_HIRE_KEYWORDS)
  if (seniorHire) return { type: 'senior_hire', keyword: seniorHire }

  const expansion = matchKeywords(text, EXPANSION_KEYWORDS)
  if (expansion) return { type: 'expansion', keyword: expansion }

  return null
}

// Simple heuristic: take the run of capitalised words immediately before
// the matched keyword phrase as the company name, e.g.
// "Acme Robotics raises €5m Series A" + "raises" -> "Acme Robotics".
// Returns null if nothing usable is found, or if the candidate fails the
// quality checks (too short, a generic word, a city name, ...) — callers
// should skip the article entirely rather than fall back to something
// cruder, so we don't create garbage company records.
function extractCompanyName(title: string, keyword: string): string | null {
  const idx = title.toLowerCase().indexOf(keyword.toLowerCase())
  const left = (idx > -1 ? title.slice(0, idx) : title).trim()
  if (!left) return null

  const words = left.split(/\s+/).filter(Boolean)
  const isNameWord = (w: string) =>
    /^[A-Z][\w&.'-]*$/.test(w) || /^[A-Z0-9]+$/.test(w)

  const nameWords: string[] = []
  // Walk backwards from the keyword, keeping capitalised / title-case words
  for (let i = words.length - 1; i >= 0 && nameWords.length < 5; i--) {
    const w = words[i].replace(/[,:;"'’]+$/, '')
    if (isNameWord(w)) {
      nameWords.unshift(w)
    } else {
      break
    }
  }

  if (nameWords.length === 0) {
    // Nothing capitalised immediately precedes the keyword (e.g. "The
    // company raises..."). Fall back to scanning forward from the start
    // of the title fragment, but keep applying the same capitalisation
    // rule — a blind "first 3 words" fallback is exactly what let garbage
    // like a bare "The" through before.
    for (const raw of words) {
      if (nameWords.length >= 5) break
      const w = raw.replace(/[,:;"'’]+$/, '')
      if (isNameWord(w)) {
        nameWords.push(w)
      } else {
        break
      }
    }
  }

  const candidate = nameWords.join(' ')
  if (!candidate || !isQualityCompanyName(candidate)) return null
  return candidate
}

function extractFundingAmount(
  text: string,
): { amount: string; currency: string } | null {
  const match = text.match(
    /([€$£])\s?(\d+(?:[.,]\d+)?)\s?(million|bn|billion|k|m)?/i,
  )
  if (!match) return null
  const symbolToCurrency: Record<string, string> = {
    '€': 'EUR',
    '$': 'USD',
    '£': 'GBP',
  }
  return {
    amount: `${match[2]}${match[3] ? ' ' + match[3] : ''}`.trim(),
    currency: symbolToCurrency[match[1]] ?? match[1],
  }
}

function mapCountry(sourceCountry: string): string {
  if (sourceCountry === 'Ireland') return 'Ireland'
  if (sourceCountry === 'UK') return 'UK'
  return 'Other'
}

// --- Domain inference -------------------------------------------------
// Try a handful of common domain patterns for a freshly-created company
// and verify each with a HEAD request, so enrich-company can run without
// anyone manually typing in a domain first.

const DOMAIN_FILLER_WORDS = new Set(['the', 'and'])
const DOMAIN_TLDS = ['com', 'io', 'ai', 'co']

function slugifyCompanyName(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !DOMAIN_FILLER_WORDS.has(word) && word !== '&')
    .join('')
    .replace(/[^a-z0-9]/g, '')
}

function buildDomainCandidates(companyName: string): string[] {
  const slug = slugifyCompanyName(companyName)
  if (!slug) return []
  return DOMAIN_TLDS.map((tld) => `${slug}.${tld}`)
}

async function verifyDomain(domain: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)
  try {
    const res = await fetch(`https://${domain}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'VettedTALeadsBot/1.0' },
    })
    return res.status === 200
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

// Tries candidates in priority order (.com, .io, .ai, .co) and returns the
// first one that verifies, so this has to run sequentially rather than
// racing all candidates in parallel.
async function inferDomain(companyName: string): Promise<string | null> {
  for (const candidate of buildDomainCandidates(companyName)) {
    if (await verifyDomain(candidate)) return candidate
  }
  return null
}

// Fire-and-forget call to enrich-company. Errors are swallowed (and
// logged) rather than thrown — a failed background enrichment should
// never fail the ingest run itself.
async function invokeEnrichCompany(companyId: string): Promise<void> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/enrich-company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ company_id: companyId }),
    })
    if (!res.ok) {
      console.error(`enrich-company invocation failed for ${companyId}: HTTP ${res.status}`)
    }
  } catch (err) {
    console.error(`enrich-company invocation errored for ${companyId}:`, err)
  }
}

function parseFeed(xml: string): ParsedItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
  })
  const doc = parser.parse(xml)

  const rawItems: any[] =
    doc?.rss?.channel?.item ?? doc?.feed?.entry ?? []
  const items = Array.isArray(rawItems) ? rawItems : [rawItems]

  return items
    .filter(Boolean)
    .map((item) => {
      const title = stripHtml(String(item.title?.__cdata ?? item.title ?? ''))
      const link =
        typeof item.link === 'string'
          ? item.link
          : item.link?.['@_href'] ?? item.link?.[0]?.['@_href'] ?? ''
      const pubDate = item.pubDate ?? item.published ?? item.updated ?? null
      const description = stripHtml(
        String(
          item.description?.__cdata ??
            item.description ??
            item.summary?.__cdata ??
            item.summary ??
            '',
        ),
      )
      return { title, link, pubDate, description }
    })
    .filter((item) => item.title && item.link)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const summary = {
    sources_checked: 0,
    articles_scanned: 0,
    signals_created: 0,
    companies_created: 0,
    domains_inferred: 0,
    errors: [] as string[],
  }

  // Enrich-company invocations for newly-domained companies. Collected
  // instead of awaited inline so ingestion isn't slowed down by them, then
  // handed to EdgeRuntime.waitUntil() below so the runtime doesn't tear
  // down the isolate before they finish just because the response already
  // went out.
  const backgroundEnrichments: Promise<void>[] = []

  try {
    const { data: sources, error: sourcesError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError) throw sourcesError

    for (const source of sources ?? []) {
      summary.sources_checked++
      try {
        const res = await fetch(source.url, {
          headers: { 'User-Agent': 'VettedTALeadsBot/1.0' },
        })
        if (!res.ok) {
          summary.errors.push(`${source.name}: HTTP ${res.status}`)
          continue
        }
        const xml = await res.text()
        const items = parseFeed(xml)

        for (const item of items) {
          summary.articles_scanned++

          const text = `${item.title} ${item.description}`
          if (!passesGeoFilter(source, text)) continue

          const detected = detectSignalType(text)
          if (!detected) continue

          // Skip articles we've already ingested
          const { data: existingSignal } = await supabase
            .from('signals')
            .select('id')
            .eq('source_url', item.link)
            .maybeSingle()
          if (existingSignal) continue

          const companyName = extractCompanyName(item.title, detected.keyword)
          if (!companyName) continue

          let companyId: string
          const { data: existingCompany } = await supabase
            .from('companies')
            .select('id')
            .ilike('name', companyName)
            .maybeSingle()

          if (existingCompany) {
            companyId = existingCompany.id
          } else {
            const { data: newCompany, error: insertCompanyError } =
              await supabase
                .from('companies')
                .insert({
                  name: companyName,
                  country: mapCountry(source.country),
                })
                .select('id')
                .single()
            if (insertCompanyError || !newCompany) {
              summary.errors.push(
                `${source.name}: failed to create company "${companyName}" (${insertCompanyError?.message})`,
              )
              continue
            }
            companyId = newCompany.id
            summary.companies_created++

            const inferredDomain = await inferDomain(companyName)
            if (inferredDomain) {
              const { error: domainUpdateError } = await supabase
                .from('companies')
                .update({ domain: inferredDomain })
                .eq('id', companyId)
              if (!domainUpdateError) {
                summary.domains_inferred++
                backgroundEnrichments.push(invokeEnrichCompany(companyId))
              }
            }
          }

          const fundingInfo =
            detected.type === 'funding'
              ? extractFundingAmount(text)
              : null

          const { error: insertSignalError } = await supabase
            .from('signals')
            .insert({
              company_id: companyId,
              signal_type: detected.type,
              signal_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
              headline: item.title,
              detail: item.description.slice(0, 500),
              source_url: item.link,
              source_name: source.name,
              funding_amount: fundingInfo?.amount ?? null,
              funding_currency: fundingInfo?.currency ?? null,
              raw_content: item.description,
            })

          if (insertSignalError) {
            summary.errors.push(
              `${source.name}: failed to create signal for "${companyName}" (${insertSignalError.message})`,
            )
            continue
          }
          summary.signals_created++
        }

        await supabase
          .from('rss_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)
      } catch (err) {
        summary.errors.push(`${source.name}: ${(err as Error).message}`)
      }
    }

    if (backgroundEnrichments.length > 0) {
      const backgroundWork = Promise.allSettled(backgroundEnrichments)
      const edgeRuntime = (globalThis as Record<string, unknown>).EdgeRuntime as
        | { waitUntil?: (promise: Promise<unknown>) => void }
        | undefined
      if (edgeRuntime?.waitUntil) {
        edgeRuntime.waitUntil(backgroundWork)
      }
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message, ...summary }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
