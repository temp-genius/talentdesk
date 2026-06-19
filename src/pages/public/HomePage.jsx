import { Link } from 'react-router-dom'

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

function StarRating({ n = 5 }) {
  return (
    <span style={{ color: GOLD, fontSize: 16, letterSpacing: 1 }}>
      {'★'.repeat(n)}
    </span>
  )
}

const RECRUITER_CARDS = [
  {
    img: '/images/sarah-c.png',
    name: 'Sarah C.',
    title: 'Senior Technology Recruiter',
    markets: 'Dublin · London',
    specialism: 'Engineering & Product',
    fee: '8–10%',
    placements: 34,
    quote: 'Vetted TA gives me real flexibility — I work with the clients I choose, on my schedule.',
  },
  {
    img: '/images/mark-r.png',
    name: 'Mark R.',
    title: 'Commercial Recruitment Lead',
    markets: 'London · Manchester',
    specialism: 'Sales & Revenue',
    fee: '6–8%',
    placements: 41,
    quote: "I've built a great part-time revenue stream around my own consultancy practice.",
  },
  {
    img: '/images/claire-o.png',
    name: 'Elena M.',
    title: 'Executive Search Specialist',
    markets: 'Dublin · New York',
    specialism: 'C-Suite & Leadership',
    fee: '10%',
    placements: 22,
    quote: 'The milestone payment model means I get paid at every stage — not just at the end.',
  },
]

const TESTIMONIALS = [
  {
    avatar: '/images/claire-o.png',
    quote: "After being made redundant I didn't want to go back into agency. Vetted TA let me keep doing the work I'm good at — without the politics or the cold calling. My first placement was €7,200. That's real money for one brief.",
    name: 'Claire O.',
    detail: 'Independent recruiter · Technology · Dublin',
  },
  {
    avatar: '/images/paul-h.png',
    quote: "We'd been burned by agencies sending CVs that clearly didn't fit. On Vetted TA we found a recruiter who'd spent ten years in our sector and actually understood the brief. Night and day difference.",
    name: 'Paul H.',
    detail: 'Head of People · Scale-up · London',
  },
]

export default function HomePage() {
  return (
    <div style={{ ...S.sans, backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Google Fonts + global overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
        a { color: inherit; }
        .hp-btn-primary:hover   { background-color: #14245a !important; }
        .hp-btn-secondary:hover { background-color: ${NAVY} !important; color: #fff !important; }
        .hp-btn-wo:hover        { background-color: rgba(255,255,255,0.15) !important; }
        .hp-nav-link:hover      { color: ${BLUE} !important; }
        .hp-card:hover          { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(26,43,109,0.12) !important; }
        .hp-r-card              { transition: transform 0.2s, box-shadow 0.2s; }
        .hp-r-card:hover        { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(26,43,109,0.14) !important; }
        @media (max-width: 768px) {
          .hp-nav-links   { display: none !important; }
          .hp-hero-grid   { grid-template-columns: 1fr !important; }
          .hp-hero-imgs   { display: none !important; }
          .hp-proof-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .hp-cards-grid  { grid-template-columns: 1fr !important; }
          .hp-testi-grid  { grid-template-columns: 1fr !important; }
          .hp-footer-grid { grid-template-columns: 1fr !important; }
          .hp-cta-btns    { flex-direction: column !important; align-items: stretch !important; }
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

          <nav className="hp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link to="/how-it-works" className="hp-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              How it works
            </Link>
            <Link to="/browse-recruiters" className="hp-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              Browse recruiters
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="hp-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              Sign in
            </Link>
            <Link to="/recruiter/signup" className="hp-btn-primary" style={{ ...S.btnPrimary, fontSize: 13, padding: '9px 20px' }}>
              Join as Recruiter
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: NAVY, color: '#fff', padding: '80px 24px 70px' }}>
        <div style={{ ...S.container }}>
          <div
            className="hp-hero-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}
          >
            {/* Left — copy */}
            <div>
              <span style={{
                ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: BLUE, background: 'rgba(59,130,246,0.18)',
                padding: '5px 12px', borderRadius: 4, display: 'inline-block', marginBottom: 24,
              }}>
                Now accepting recruiter applications
              </span>
              <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 52, lineHeight: 1.12, color: '#fff', maxWidth: 580, marginBottom: 22 }}>
                The retained marketplace for{' '}
                <span style={{ fontStyle: 'italic', color: '#93c5fd' }}>elite</span>{' '}
                recruiters.
              </h1>
              <p style={{ ...S.sans, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 460, marginBottom: 36 }}>
                You've spent years building a network. Vetted TA gives you the infrastructure to monetise it — on your own terms. No agency. No cold calls. Work comes to you.
              </p>
              <div className="hp-cta-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/recruiter/signup" style={{
                  ...S.sans, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  backgroundColor: BLUE, color: '#fff', padding: '12px 24px', borderRadius: 4,
                  border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  Apply as a Recruiter
                </Link>
                <Link to="/hiring-manager/signup" style={{
                  ...S.sans, fontWeight: 300, fontSize: 12, backgroundColor: 'transparent',
                  border: '0.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)',
                  padding: '11px 20px', borderRadius: 4, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 6,
                }}>
                  I'm hiring talent <span style={{ color: '#93c5fd' }}>→</span>
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
                    Applications open
                  </p>
                  <p style={{ ...S.sans, fontWeight: 300, fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: 2 }}>
                    Senior recruiters · Ireland and UK
                  </p>
                </div>
              </div>
            </div>

            {/* Right — image collage */}
            <div
              className="hp-hero-imgs"
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
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7f0', borderBottom: '1px solid #e5e7f0', padding: '0 48px' }}>
        <div style={{ ...S.container }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {[
              { value: '6–10%',                   label: 'Transparent fee range' },
              { value: '€6,000+',                 label: 'Avg placement fee' },
              { value: 'Vetted',                   label: 'Every recruiter. No exceptions.' },
              { value: 'Exclusive',                label: 'Every role. No contingency.' },
              { value: 'No Business Development',  label: 'Just Delivery.' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{ flex: '1 1 0', padding: '28px 24px', textAlign: 'center', borderRight: i < arr.length - 1 ? '1px solid #e5e7f0' : 'none' }}
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
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
                The talent
              </p>
              <h2 style={{ ...S.serif, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.2, letterSpacing: '-0.3px', margin: 0 }}>
                Meet some of our vetted recruiters
              </h2>
            </div>
            <Link to="/browse-recruiters" className="hp-btn-secondary" style={{ ...S.btnSecondary, fontSize: 13 }}>
              Browse all recruiters →
            </Link>
          </div>

          <div className="hp-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {RECRUITER_CARDS.map(r => (
              <div
                key={r.name}
                className="hp-r-card"
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 14, borderTop: `1px solid ${LGRAY}` }}>
                    <span style={{ ...S.sans, fontSize: 12, fontWeight: 700, color: NAVY }}>{r.placements}</span>
                    <span style={{ ...S.sans, fontSize: 12, color: GRAY }}>placements on platform</span>
                  </div>
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
              Simple. Transparent. Accountable.
            </h2>
          </div>

          <div className="hp-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              {
                step: '01',
                title: 'Post your role',
                body: "Describe the position, the team, and the skills you need. We'll match you with recruiters who have genuine experience placing into that market.",
              },
              {
                step: '02',
                title: 'Agree the fee',
                body: 'Each recruiter sets their rate between 6–10%. You see their profile, reviews, and placement history before you agree anything.',
              },
              {
                step: '03',
                title: 'Pay on milestones',
                body: 'Stage 1: shortlist delivered (20%). Stage 2: interviews confirmed (30%). Stage 3: offer accepted (50%). Paid securely through Stripe.',
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

          <div className="hp-testi-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 48 }}>
            {[
              {
                heading: 'For companies',
                items: [
                  'Access pre-vetted, specialist recruiters instantly',
                  'Agreed fee upfront — no surprise invoices',
                  'Real accountability through milestone payments',
                  'Cancel any time before the next stage',
                ],
              },
              {
                heading: 'For independent recruiters',
                items: [
                  'Work flexibly — take on roles that fit your schedule',
                  'Get paid at every stage, not just at placement',
                  'Build your profile with verified reviews',
                  'No agency overhead, no targets, no politics',
                ],
              },
            ].map(col => (
              <div key={col.heading} style={{ padding: '28px', background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ ...S.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 16 }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.items.map(t => (
                    <li key={t} style={{ display: 'flex', gap: 10, ...S.sans, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                      <span style={{ color: '#93c5fd', flexShrink: 0 }}>✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ backgroundColor: '#f8f9fc', padding: '64px 48px' }}>
        <div style={{ ...S.container }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ ...S.sans, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              From the community
            </p>
            <h2 style={{ ...S.serif, fontWeight: 400, fontSize: 28, color: '#1a1f36', margin: '0 0 6px 0' }}>
              What recruiters say.
            </h2>
            <p style={{ ...S.sans, fontWeight: 300, fontSize: 14, color: '#6b7280', margin: 0 }}>
              Early members — in their own words.
            </p>
          </div>

          <div className="hp-testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                style={{ backgroundColor: '#fff', border: '1px solid #e5e7f0', borderRadius: 8, padding: '24px 22px' }}
              >
                <span style={{ ...S.serif, fontSize: 44, color: '#c7d2fe', lineHeight: 0.8, display: 'block', marginBottom: 10 }}>"</span>
                <p style={{ ...S.sans, fontWeight: 300, fontStyle: 'italic', fontSize: 13, lineHeight: 1.8, color: '#4b5563', marginBottom: 16 }}>
                  {t.quote}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={t.avatar} alt={t.name} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                  <div>
                    <p style={{ ...S.sans, fontWeight: 500, fontSize: 12, color: '#1a1f36', margin: 0 }}>{t.name}</p>
                    <p style={{ ...S.sans, fontWeight: 300, fontSize: 10, color: '#9ca3af', margin: 0 }}>{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
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
            Ready to hire smarter?
          </h2>
          <p style={{ ...S.sans, fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 40 }}>
            Join the growing number of companies and independent recruiters who are changing how talent acquisition works.
          </p>
          <div className="hp-cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hiring-manager/signup" className="hp-btn-primary" style={{ ...S.btnPrimary, backgroundColor: BLUE, fontSize: 15, padding: '14px 36px' }}>
              Post a Role — It's Free
            </Link>
            <Link to="/recruiter/signup" className="hp-btn-wo" style={{ ...S.btnWhiteOutline, fontSize: 15, padding: '13px 36px' }}>
              Apply as a Recruiter
            </Link>
          </div>
          <p style={{ ...S.sans, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 20 }}>
            No credit card required · Recruiters are manually reviewed within 48 hours
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0f1a3d', padding: '64px 24px 36px', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ ...S.container }}>
          <div className="hp-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', lineHeight: 1, marginBottom: 16 }}>
                <span style={{ ...S.serif, fontWeight: 700, fontSize: 20, color: '#fff', letterSpacing: '-0.3px' }}>
                  Vetted TA
                </span>
                <span style={{ ...S.sans, fontWeight: 500, fontSize: 9, color: '#93c5fd', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>
                  Recruitment Marketplace
                </span>
              </Link>
              <p style={{ ...S.sans, fontSize: 13, lineHeight: 1.7, maxWidth: 280, marginTop: 8 }}>
                The marketplace for independently vetted talent acquisition specialists. Fees 6–10%. Milestone payments. No agency markup.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <p style={{ ...S.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
                Platform
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { to: '/how-it-works', label: 'How it works' },
                  { to: '/browse-recruiters', label: 'Browse recruiters' },
                  { to: '/hiring-manager/signup', label: 'Post a role' },
                  { to: '/recruiter/signup', label: 'Join as recruiter' },
                  { to: '/login', label: 'Sign in' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="hp-nav-link" style={{ ...S.sans, fontSize: 13, textDecoration: 'none', color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p style={{ ...S.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
                Legal
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { to: '/terms', label: 'Terms of service' },
                  { to: '/privacy', label: 'Privacy policy' },
                  { to: '/recruiter-agreement', label: 'Recruiter agreement' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="hp-nav-link" style={{ ...S.sans, fontSize: 13, textDecoration: 'none', color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/contact" className="hp-nav-link" style={{ ...S.sans, fontSize: 13, textDecoration: 'none', color: 'rgba(255,255,255,0.5)', transition: 'color 0.15s' }}>
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ ...S.sans, fontSize: 12, margin: 0 }}>
              © 2026 Vetted TA Ltd. All rights reserved. Operated in Ireland.
            </p>
            <p style={{ ...S.sans, fontSize: 12, margin: 0 }}>
              Payments processed securely by Stripe
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
