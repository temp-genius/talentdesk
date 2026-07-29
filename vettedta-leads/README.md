# VettedTA Leads

A standalone hiring-intent monitor for recruiters. It watches news/RSS
sources for signals that a company is about to hire (funding, senior
hires, expansion), enriches each company with key contacts (website
scrape + Bing "X-Ray" LinkedIn search), and presents everything in a
filterable dashboard with outreach status tracking.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Hosting | Vercel (frontend) + Supabase (backend) |

## Project structure

```
src/
├── components/
│   ├── common/ProtectedRoute.jsx   # Redirects to /sign-in when logged out
│   ├── layout/                     # Sidebar, DashboardLayout, Logo
│   └── dashboard/                  # StatsRow, FilterBar, CompanyCard
├── context/AuthContext.jsx         # Supabase auth session + profile state
├── lib/
│   ├── supabase.js                 # Supabase client
│   └── dummyData.js                # Placeholder dashboard data (session 1 only)
└── pages/
    ├── auth/                       # SignIn, SignUp
    ├── Dashboard.jsx
    ├── Companies.jsx
    ├── SignalsFeed.jsx
    ├── OutreachTracker.jsx
    └── Settings.jsx

supabase/
├── migrations/0001_init.sql        # Full schema, RLS policies, triggers, RSS seed
└── functions/
    ├── ingest-rss/                 # Scans RSS sources for hiring signals
    ├── enrich-company/             # Website scrape + Bing X-Ray + Clearbit logo
    └── _shared/cors.ts
```

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Install the Supabase CLI and log in:
   ```bash
   npm install -g supabase
   supabase login
   ```
3. Link this directory to your project (find the ref in your project's
   dashboard URL):
   ```bash
   supabase link --project-ref your-project-ref
   ```
4. Push the schema (creates all tables, RLS policies, triggers, and seeds
   the five default RSS sources):
   ```bash
   supabase db push
   ```
5. Set the secrets used by the Edge Functions. `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by the Supabase Edge
   Runtime, so only the Bing key needs to be set explicitly:
   ```bash
   supabase secrets set BING_API_KEY=your-bing-search-v7-key
   ```
6. Deploy the Edge Functions:
   ```bash
   supabase functions deploy ingest-rss
   supabase functions deploy enrich-company
   ```
7. Get a free **Bing Search v7** key from [Azure Cognitive
   Services](https://portal.azure.com) (F1 free tier: 1,000 calls/month) —
   used for the "X-Ray" `site:linkedin.com/in/` contact search in
   `enrich-company`.

### Invoking the functions manually

```bash
# Pull in the latest signals from all active RSS sources
curl -i -X POST https://your-project-ref.functions.supabase.co/ingest-rss \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Enrich a specific company with contacts + logo
curl -i -X POST https://your-project-ref.functions.supabase.co/enrich-company \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"company_id": "uuid-of-company"}'
```

In session 2, wire these up to a "Refresh signals" button and a
per-company "Enrich" action in the dashboard, and/or put `ingest-rss` on
a `pg_cron` / Supabase Cron schedule.

## 2. Frontend setup

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project's public values (find them in
**Project Settings → API**):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run locally:

```bash
npm run dev
```

The app is available at `http://localhost:5173`. Sign up for an account —
a `user_profiles` row is created automatically via a database trigger.

## 3. Deploy to Vercel

```bash
npm install -g vercel
vercel link
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

`vercel.json` is already configured to rewrite all routes to
`index.html` so client-side routing (React Router) works on refresh and
deep links.

> **Note on this repository's environment:** this session has no
> Supabase or Vercel account credentials available, so the schema/Edge
> Functions/frontend were built and verified locally (`npm run build`
> succeeds, and the dashboard was smoke-tested in a headless browser)
> but **not actually deployed**. Follow steps 1–3 above with your own
> Supabase project and Vercel account to go live.

## Database schema

See `supabase/migrations/0001_init.sql` for the full definition. Summary:

- **companies** — the lead itself (name, domain, headcount, location, specialisms)
- **signals** — one row per detected hiring-intent event, linked to a company
- **contacts** — enriched people at a company, with LinkedIn URL + confidence score
- **user_profiles** — extends `auth.users`, auto-created on sign-up
- **outreach** — per-user pipeline status against a company/contact
- **rss_sources** — the list of feeds `ingest-rss` polls

Row Level Security: `companies` / `signals` / `contacts` / `rss_sources`
are readable by any authenticated user (shared lead pool) and are only
ever written to by Edge Functions using the service role key. `outreach`
and `user_profiles` rows are private to the owning user.

## Edge Functions

### `ingest-rss`

Fetches every active row in `rss_sources`, parses each feed's XML,
scans article titles/descriptions for funding / senior-hire / expansion
keywords, extracts a likely company name, and inserts a `companies` +
`signals` row (deduped by article URL and company name). Returns a JSON
summary of what was ingested.

### `enrich-company`

Given a `company_id`:

1. Tries `/team`, `/about`, `/about-us`, `/people`, `/company` on the
   company's domain and parses each page for name/title pairs matching
   known decision-maker titles (CEO, Founder, CTO, Head of People, etc).
2. For each contact found, runs a Bing "X-Ray" search
   (`site:linkedin.com/in/ "name" "company"`) to resolve a LinkedIn
   profile URL, rate-limited to 1 request/second.
3. Sets the company logo via `logo.clearbit.com`.
4. Stamps `companies.enriched_at`.

## What's next (session 2)

- Wire the dashboard, filters, and stats up to live Supabase queries
  instead of `src/lib/dummyData.js`.
- Add "Refresh signals" / "Enrich" buttons that call the Edge Functions.
- Schedule `ingest-rss` on a cron.
- Build out the Companies detail view, Outreach status transitions, and
  Settings/plan management.
