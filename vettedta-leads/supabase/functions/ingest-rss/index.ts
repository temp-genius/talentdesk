// Supabase Edge Function: ingest-rss
//
// Fetches every active RSS source, scans new articles for hiring-intent
// signals (funding / senior hire / expansion), and writes new
// companies + signals rows. Safe to run repeatedly — already-ingested
// articles (matched by source_url) are skipped.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
import { XMLParser } from 'npm:fast-xml-parser@4.5.0'
import { corsHeaders } from '../_shared/cors.ts'

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
// "Acme Robotics raises €5m Series A" + "raises" -> "Acme Robotics"
function extractCompanyName(title: string, keyword: string): string | null {
  const idx = title.toLowerCase().indexOf(keyword.toLowerCase())
  const left = (idx > -1 ? title.slice(0, idx) : title).trim()
  if (!left) return null

  const words = left.split(/\s+/).filter(Boolean)
  const nameWords: string[] = []
  // Walk backwards from the keyword, keeping capitalised / title-case words
  for (let i = words.length - 1; i >= 0 && nameWords.length < 5; i--) {
    const w = words[i].replace(/[,:;"'’]+$/, '')
    if (/^[A-Z][\w&.'-]*$/.test(w) || /^[A-Z0-9]+$/.test(w)) {
      nameWords.unshift(w)
    } else {
      break
    }
  }

  if (nameWords.length === 0) {
    // Fallback: first three words of the title
    return words.slice(0, 3).join(' ') || null
  }
  return nameWords.join(' ')
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
    errors: [] as string[],
  }

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
