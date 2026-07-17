import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'
import Footer from '../../components/layout/Footer'

const NAVY   = '#1a2b6d'
const BLUE   = '#3b82f6'
const GOLD   = '#c9a84c'
const OFF_WH = '#f8f7f4'
const GRAY   = '#6b7280'
const LGRAY  = '#e5e7eb'

const S = {
  serif: { fontFamily: "'Playfair Display', Georgia, serif" },
  sans:  { fontFamily: "'DM Sans', system-ui, sans-serif" },
  container: { maxWidth: 1120, margin: '0 auto', padding: '0 24px' },
  containerWide: { maxWidth: 1280, margin: '0 auto', padding: '0 24px' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: NAVY, color: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 600, fontSize: 15, padding: '12px 28px',
    borderRadius: 6, border: 'none', cursor: 'pointer',
    textDecoration: 'none', transition: 'background 0.2s', letterSpacing: 0.2,
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', color: NAVY,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 600, fontSize: 15, padding: '11px 28px',
    borderRadius: 6, border: `2px solid ${NAVY}`, cursor: 'pointer',
    textDecoration: 'none', transition: 'all 0.2s', letterSpacing: 0.2,
  },
  btnWhiteOutline: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', color: '#fff',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 600, fontSize: 15, padding: '11px 28px',
    borderRadius: 6, border: '2px solid rgba(255,255,255,0.55)', cursor: 'pointer',
    textDecoration: 'none', transition: 'all 0.2s', letterSpacing: 0.2,
  },
}

const RECRUITER_CARDS = [
  {
    img: '/images/sarah-c.png',
    name: 'Sarah C.',
    title: 'Senior Technology Recruiter',
    markets: 'Dublin · London',
    specialism: 'Engineering & Product',
    fee: '10%',
    quote: 'I was tired of giving 80% of my fee to an agency. Here I keep the majority, the work is exclusive, and I actually enjoy what I do again.',
  },
  {
    img: '/images/mark-r.png',
    name: 'Mark R.',
    title: 'Commercial Recruitment Lead',
    markets: 'London · Manchester',
    specialism: 'Sales & Revenue',
    fee: '8–10%',
    quote: 'The milestone payments changed everything for me. I get paid as I deliver, not six months after the offer letter.',
  },
  {
    img: '/images/claire-o.png',
    name: 'Elena M.',
    title: 'Executive Search Specialist',
    markets: 'Dublin · New York',
    specialism: 'C-Suite & Leadership',
    fee: '12%',
    quote: 'The platform looked serious from the start. The vetting process was thorough but quick, and I knew straightaway this was something different. I signed up the same day I was approved.',
  },
]

export default function ForRecruiters() {
  return (
    <div style={{ ...S.sans, backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <Seo
        title="Independent Recruiter Jobs | Vetted TA"
        description="Elite independent recruiters find exclusive retained briefs on Vetted TA. Milestone payments, 8–12% fees, zero business development. Apply to join."
        path="/for-recruiters"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
        a { color: inherit; }
        .fr-btn-primary:hover   { background-color: #14245a !important; }
        .fr-btn-wo:hover        { background-color: rgba(255,255,255,0.15) !important; }
        .fr-nav-link:hover      { color: ${BLUE} !important; }
        .fr-card:hover          { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(26,43,109,0.12) !important; }
        .fr-r-card              { transition: transform 0.2s, box-shadow 0.2s; }
        .fr-r-card:hover        { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(26,43,109,0.14) !important; }
        @media (max-width: 768px) {
          .fr-nav-links         { display: none !important; }
          .fr-hero-grid         { grid-template-columns: 1fr !important; }
          .fr-hero-imgs         { display: none !important; }
          .fr-cards-grid        { grid-template-columns: 1fr !important; }
          .fr-feature-grid      { grid-template-columns: 1fr !important; }
          .fr-cta-btns          { flex-direction: column !important; align-items: stretch !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <header style={{ backgroundColor: '#fff', borderBottom: `1px solid ${LGRAY}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ ...S.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: 68 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ ...S.serif, fontWeight: 700, fontSize: 22, color: NAVY, letterSpacing: '-0.3px' }}>
              Vetted TA
            </span>
            <span style={{ ...S.sans, fontWeight: 500, fontSize: 9, color: BLUE, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 1 }}>
              Recruitment Marketplace
            </span>
          </Link>

          <nav className="fr-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link to="/how-it-works" className="fr-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              How it works
            </Link>
            <Link to="/browse-recruiters" className="fr-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              Browse recruiters
            </Link>
            <Link to="/for-recruiters" className="fr-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              For recruiters
            </Link>
            <Link to="/hire" className="fr-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              For companies
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="fr-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              Sign in
            </Link>
            <Link to="/recruiter/signup" className="fr-btn-primary" style={{ ...S.btnPrimary, fontSize: 13, padding: '9px 20px' }}>
              Join as Recruiter
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: NAVY, color: '#fff', padding: '80px 24px 70px' }}>
        <div style={{ ...S.container }}>
          <div
            className="fr-hero-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}
          >
            {/* Left — copy */}
            <div>
              <span style={{
                ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: BLUE, background: 'rgba(59,130,246,0.18)',
                padding: '5px 12px', borderRadius: 4, display: 'inline-block', marginBottom: 24,
              }}>
                Now accepting founding recruiter applications — 15% acceptance rate
              </span>
              <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 52, lineHeight: 1.12, color: '#fff', maxWidth: 580, marginBottom: 22 }}>
                The retained marketplace for{' '}
                <span style={{ fontStyle: 'italic', color: '#93c5fd' }}>elite</span>{' '}
                recruiters.
              </h1>
              <p style={{ ...S.sans, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 460, marginBottom: 36 }}>
                Fill an €80k role at 12% and take home up to €6,720. No BD. No competing agencies. No invoice chasing.
              </p>
              <div className="fr-cta-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/recruiter/signup" style={{
                  ...S.sans, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  backgroundColor: BLUE, color: '#fff', padding: '12px 24px', borderRadius: 4,
                  border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  Apply as a Recruiter
                </Link>
                <Link to="/how-it-works" style={{
                  ...S.sans, fontWeight: 300, fontSize: 12, backgroundColor: 'transparent',
                  border: '0.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)',
                  padding: '11px 20px', borderRadius: 4, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 6,
                }}>
                  How it works <span style={{ color: '#93c5fd' }}>→</span>
                </Link>
              </div>
              {/* Avatar strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                <div style={{ display: 'flex' }}>
                  {[
                    '/images/sarah-c.png',
                    '/images/mark-r.png',
                    '/images/claire-o.png',
                    '/images/lifestyle.png',
                  ].map((src, i) => (
                    <div key={src} style={{
                      width: 30, height: 30, borderRadius: '50%',
                      border: '2px solid #1a2b6d',
                      overflow: 'hidden', marginLeft: i > 0 ? -8 : 0,
                      backgroundColor: 'rgba(59,130,246,0.3)', flexShrink: 0,
                      position: 'relative', zIndex: 10 - i,
                    }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} onError={e => { e.target.style.display = 'none' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ ...S.sans, fontWeight: 500, fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    Applications open · 15% acceptance rate · Recruiters from Meta, Google, Amazon and more
                  </p>
                  <p style={{ ...S.sans, fontWeight: 300, fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: 2 }}>
                    Senior recruiters · Ireland, UK and beyond.
                  </p>
                </div>
              </div>
            </div>

            {/* Right — image collage */}
            <div
              className="fr-hero-imgs"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 220px', gap: 12 }}
            >
              <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', background: 'rgba(59,130,246,0.2)' }}>
                <img src="/images/hero-1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div style={{ gridColumn: '2 / 3', gridRow: '1 / 3', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', marginTop: 32, background: 'rgba(59,130,246,0.15)' }}>
                <img src="/images/hero-2.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { e.target.style.display = 'none' }} />
              </div>
              <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', background: 'rgba(59,130,246,0.2)' }}>
                <img src="/images/hero-3.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} onError={e => { e.target.style.display = 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ── */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7f0', borderBottom: '1px solid #e5e7f0' }}>
        <div style={{ ...S.container }}>
          <div className="grid grid-cols-2 md:grid-cols-5">
            {[
              { value: '8–12%',      label: 'Transparent fee range' },
              { value: '70% of fee', label: 'Paid to the recruiter' },
              { value: 'Elite only', label: 'Roughly 1 in 7 applicants approved' },
              { value: 'Exclusive',  label: 'One recruiter per role' },
              { value: 'Zero BD',    label: 'Work finds you' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`py-7 px-6 text-center${i < arr.length - 1 ? ' border-b border-[#e5e7f0] md:border-b-0 md:border-r' : ''}`}
              >
                <p style={{ ...S.sans, fontWeight: 500, fontSize: 22, color: '#1a2b6d', margin: 0, lineHeight: 1.1 }}>
                  {item.value}
                </p>
                <p style={{ ...S.sans, fontWeight: 300, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginTop: 6, marginBottom: 0 }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section style={{ backgroundColor: '#eef2ff', borderTop: '1px solid #c7d2fe', borderBottom: '1px solid #c7d2fe', padding: '64px 48px' }}>
        <div style={{ ...S.container }}>
          <blockquote style={{
            ...S.serif, fontWeight: 400, fontStyle: 'italic', fontSize: 22, lineHeight: 1.6,
            color: '#3730a3', borderLeft: '3px solid #3b82f6', paddingLeft: 24,
            maxWidth: 640, margin: '0 0 14px 0',
          }}>
            There are thousands of brilliant recruiters who've been made redundant. They have the networks. They have the craft. They just need somewhere to work.
          </blockquote>
          <p style={{ ...S.sans, fontWeight: 300, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b7280', paddingLeft: 24, margin: 0 }}>
            — Why Vetted TA exists
          </p>
        </div>
      </section>

      {/* ── RECRUITER CARDS ── */}
      <section style={{ backgroundColor: OFF_WH, padding: '96px 24px' }}>
        <div style={{ ...S.containerWide }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              The talent
            </p>
            <h2 style={{ ...S.serif, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.2, letterSpacing: '-0.3px', margin: '0 0 10px 0' }}>
              Why they joined.
            </h2>
            <p style={{ ...S.sans, fontWeight: 300, fontSize: 14, color: GRAY, margin: 0 }}>
              Founding members — in their own words.
            </p>
          </div>

          <div className="fr-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {RECRUITER_CARDS.map(r => (
              <div
                key={r.name}
                className="fr-r-card"
                style={{ backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${LGRAY}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div style={{ height: 200, backgroundColor: '#dbeafe', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={r.img}
                    alt={r.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    backgroundColor: NAVY, color: '#fff',
                    ...S.sans, fontSize: 13, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    {r.fee}
                  </div>
                </div>
                <div style={{ padding: '22px 24px 24px' }}>
                  <h3 style={{ ...S.serif, fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 3px 0' }}>
                    {r.name}
                  </h3>
                  <p style={{ ...S.sans, fontSize: 13, color: BLUE, fontWeight: 600, marginBottom: 2 }}>
                    {r.title}
                  </p>
                  <p style={{ ...S.sans, fontSize: 12, color: GRAY, marginBottom: 16 }}>
                    {r.markets} · {r.specialism}
                  </p>
                  <blockquote style={{ ...S.sans, fontSize: 13, color: '#4b5563', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 16px 0', paddingLeft: 14, borderLeft: `3px solid ${BLUE}` }}>
                    "{r.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ backgroundColor: NAVY, color: '#fff', padding: '96px 24px' }}>
        <div style={{ ...S.container }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 14 }}>
              The process
            </p>
            <h2 style={{ ...S.serif, fontSize: 36, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px', margin: 0 }}>
              Apply. Browse. Get paid.
            </h2>
          </div>

          <div className="fr-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              {
                step: '01',
                title: 'Apply and get approved',
                body: 'Submit your application and go through our manual vetting process. Roughly 1 in 7 applicants is approved — we check your track record, specialisms, and markets.',
              },
              {
                step: '02',
                title: 'Browse open roles and submit proposals',
                body: "Once approved, you see open briefs that match your specialisms. Submit a proposal with your fee, approach, and why you're the right fit. No competing recruiters on the same brief.",
              },
              {
                step: '03',
                title: 'Get accepted and get paid at every stage',
                body: '20% when CVs are shortlisted. 30% when interviews are confirmed. 50% when the offer is accepted. Paid via Stripe — no chasing invoices.',
              },
            ].map(item => (
              <div key={item.step} style={{ padding: '32px 28px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ ...S.serif, fontSize: 42, fontWeight: 700, color: 'rgba(255,255,255,0.12)', lineHeight: 1, display: 'block', marginBottom: 16 }}>
                  {item.step}
                </span>
                <h3 style={{ ...S.sans, fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ ...S.sans, fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: '28px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ ...S.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 16 }}>
              For independent recruiters
            </p>
            <ul className="fr-feature-grid" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                'No business development: work finds you through the marketplace',
                'Milestone payments: get paid at every stage, not just at placement',
                'Recruiters retain 70% of the placement fee after the Vetted TA platform fee — every time, on every brief.',
                'Exclusive briefs: you are never competing against another recruiter on the same role',
              ].map(t => (
                <li key={t} style={{ display: 'flex', gap: 10, ...S.sans, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                  <span style={{ color: '#93c5fd', flexShrink: 0 }}>✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── WHO WE APPROVE ── */}
      <section style={{ backgroundColor: OFF_WH, padding: '96px 24px' }}>
        <div style={{ ...S.containerWide }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              The standard
            </p>
            <h2 style={{ ...S.serif, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.2, letterSpacing: '-0.3px', margin: '0 0 12px 0' }}>
              The calibre of recruiters we approve.
            </h2>
            <p style={{ ...S.sans, fontWeight: 300, fontSize: 15, color: GRAY, margin: 0, maxWidth: 560 }}>
              Roughly 1 in 7 applicants makes it through our vetting process. Here is the type of professional who does.
            </p>
          </div>
          <div className="fr-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { title: 'Agency recruiters', desc: 'Experienced consultants stepping out of agency life who bring established client relationships, billing track records, and the discipline of working retained briefs.' },
              { title: 'In-house TA alumni', desc: 'Former talent acquisition professionals from Meta, Google, Amazon, Salesforce and similar — with deep candidate networks built without the agency overhead.' },
              { title: 'Tech specialists', desc: 'Engineering, product, data and AI recruiters with genuine hands-on hiring experience across fast-growth startups and enterprise environments.' },
              { title: 'Executive search', desc: 'C-suite, board, and senior leadership specialists with long-term candidate relationships and the patience that complex searches require.' },
              { title: 'Legal and financial services', desc: 'Specialist recruiters covering qualified legal, compliance, risk, and financial services professionals across multiple markets.' },
              { title: 'Construction and built environment', desc: 'Experienced recruiters covering civil, structural, M&E, and project management roles across Ireland, UK and Europe.' },
            ].map(item => (
              <div
                key={item.title}
                className="fr-card"
                style={{ backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${LGRAY}`, padding: '28px 26px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              >
                <h3 style={{ ...S.sans, fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ ...S.sans, fontSize: 14, color: GRAY, lineHeight: 1.65, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <p style={{ ...S.sans, fontWeight: 300, fontSize: 13, color: GRAY, textAlign: 'center', marginTop: 28 }}>
            And specialists across many more sectors — each manually reviewed before approval.
          </p>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={{ backgroundColor: '#f8f9fc', padding: '64px 48px' }}>
        <div style={{ ...S.container }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ ...S.sans, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              From our recruiters
            </p>
            <h2 style={{ ...S.serif, fontWeight: 400, fontSize: 28, color: '#1a1f36', margin: '0 0 6px 0' }}>
              Why they joined.
            </h2>
            <p style={{ ...S.sans, fontWeight: 300, fontSize: 14, color: '#6b7280', margin: 0 }}>
              Founding members — in their own words.
            </p>
          </div>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7f0', borderRadius: 8, padding: '32px 28px', maxWidth: 680 }}>
            <span style={{ ...S.serif, fontSize: 44, color: '#c7d2fe', lineHeight: 0.8, display: 'block', marginBottom: 10 }}>"</span>
            <p style={{ ...S.sans, fontWeight: 300, fontStyle: 'italic', fontSize: 14, lineHeight: 1.8, color: '#4b5563', marginBottom: 20 }}>
              After being made redundant I didn't want to go back into agency. Vetted TA gives me the infrastructure to keep doing the work I'm good at — without the politics or the cold calling. The milestone payments mean I'm covered at every stage, not just when an offer lands.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/images/claire-o.png" alt="Claire O." style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
              <div>
                <p style={{ ...S.sans, fontWeight: 500, fontSize: 12, color: '#1a1f36', margin: 0 }}>Claire O.</p>
                <p style={{ ...S.sans, fontWeight: 300, fontSize: 10, color: '#9ca3af', margin: 0 }}>Independent recruiter · Technology · Dublin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #1e3a8a 100%)`, padding: '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 20 }}>
            Get started today
          </p>
          <h2 style={{ ...S.serif, fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1.18, marginBottom: 20, letterSpacing: '-0.4px' }}>
            Ready to work smarter, not harder?
          </h2>
          <p style={{ ...S.sans, fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 40 }}>
            No business development. No competing agencies. Exclusive retained briefs from vetted companies — and milestone payments that mean you get paid at every stage, not just when the offer letter lands.
          </p>
          <div className="fr-cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/recruiter/signup" className="fr-btn-primary" style={{ ...S.btnPrimary, backgroundColor: BLUE, fontSize: 15, padding: '14px 36px' }}>
              Apply as a Recruiter
            </Link>
            <Link to="/how-it-works" className="fr-btn-wo" style={{ ...S.btnWhiteOutline, fontSize: 15, padding: '13px 36px' }}>
              How it works
            </Link>
          </div>
          <p style={{ ...S.sans, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 20 }}>
            Recruiters are manually reviewed within 48 hours
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
