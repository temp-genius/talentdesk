import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'

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

/* ─── Slide components ─── */

function BrowseSlide() {
  const recruiters = [
    {
      initials: 'SC', bg: '#3b82f6', name: 'Sarah Chen', title: 'Senior Tech Recruiter',
      specs: ['SWE', 'Platform', 'Data'], lang: ['English', 'Mandarin'], rate: '10%',
    },
    {
      initials: 'JH', bg: '#7c3aed', name: 'James Hughes', title: 'Product & Design Recruiter',
      specs: ['Product', 'UX', 'Design'], lang: ['English', 'French'], rate: '11%',
    },
    {
      initials: 'MR', bg: '#0891b2', name: 'Maria Rossi', title: 'Finance & Ops Recruiter',
      specs: ['Finance', 'Ops', 'Legal'], lang: ['English', 'Italian'], rate: '9%',
    },
  ]
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", padding: '20px 24px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '7px 12px', fontSize: 13, color: '#9ca3af', backgroundColor: '#fff' }}>
          Search by specialism, sector or language…
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Tech', 'Product', 'Finance'].map(tag => (
            <span key={tag} style={{ backgroundColor: '#eff6ff', color: '#3b82f6', fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 4, border: '1px solid #bfdbfe' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recruiters.map(r => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 14, backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {r.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{r.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{r.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {r.specs.map(s => (
                  <span key={s} style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3 }}>{s}</span>
                ))}
                {r.lang.map(l => (
                  <span key={l} style={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3 }}>{l}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', marginRight: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: NAVY }}>{r.rate}</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>fee</div>
            </div>
            <div style={{ backgroundColor: NAVY, color: '#fff', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 5, flexShrink: 0 }}>
              View
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProposalsSlide() {
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {/* Card 1 — Jack N. */}
      <div style={{ border: `2px solid ${NAVY}`, borderRadius: 8, padding: '16px', position: 'relative', backgroundColor: '#fff' }}>
        <div style={{ position: 'absolute', top: 12, right: 12, backgroundColor: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
          Shortlisted
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>JN</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Jack Nolan</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Tech · 9 yrs exp</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Sourcing',  val: 'LinkedIn · GitHub · Referrals' },
            { label: 'Screening', val: 'Structured async' },
            { label: 'Tools',     val: 'Greenhouse, Lever' },
            { label: 'Timeline',  val: '4–6 weeks' },
          ].map(row => (
            <div key={row.label}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 2 }}>{row.label}</div>
              <div style={{ fontSize: 11, color: '#374151' }}>{row.val}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: NAVY }}>10%</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Track record: 94% fill rate</div>
        </div>
      </div>
      {/* Card 2 — Tracey B. */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '16px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>TB</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>Tracey Burke</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Tech · 12 yrs exp</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Sourcing',  val: 'Boolean · Referrals' },
            { label: 'Screening', val: 'Video + portfolio' },
            { label: 'Tools',     val: 'Ashby, Notion' },
            { label: 'Timeline',  val: '5–7 weeks' },
          ].map(row => (
            <div key={row.label}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: 2 }}>{row.label}</div>
              <div style={{ fontSize: 11, color: '#374151' }}>{row.val}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: NAVY }}>8%</div>
          <div style={{ fontSize: 10, color: '#6b7280' }}>Track record: 88% fill rate</div>
        </div>
      </div>
    </div>
  )
}

function PipelineSlide() {
  const cols = [
    {
      title: 'Submitted', count: 2, color: '#3b82f6',
      cards: [
        { initials: 'JB', bg: '#3b82f6', name: 'Jordan B.', role: 'Senior Engineer' },
        { initials: 'MR', bg: '#7c3aed', name: 'Maya R.',   role: 'Staff Engineer' },
      ],
    },
    {
      title: 'CV Approved', count: 1, color: '#0891b2',
      cards: [
        { initials: 'PS', bg: '#0891b2', name: 'Priya S.', role: 'Principal Eng.', badge: 'M1 — 20% released' },
      ],
    },
    {
      title: 'Interviewing', count: 1, color: '#d97706',
      cards: [
        { initials: 'AL', bg: '#d97706', name: 'Alex L.', role: 'Lead Engineer' },
      ],
    },
    {
      title: 'Offer', count: 1, color: '#7c3aed',
      cards: [
        { initials: 'EM', bg: '#7c3aed', name: 'Elena M.', role: 'Staff Engineer', badge: 'M2 — 30% released' },
      ],
    },
    {
      title: 'Hired', count: 0, color: '#16a34a',
      cards: [],
    },
  ]
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
      {cols.map(col => (
        <div key={col.title} style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: '10px', minHeight: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151' }}>{col.title}</span>
            <span style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: col.color, color: '#fff', fontSize: 9, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{col.count}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {col.cards.map(card => (
              <div key={card.name} style={{ backgroundColor: '#fff', borderRadius: 6, padding: '8px 10px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: card.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 9, flexShrink: 0 }}>
                    {card.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 10, color: '#111827', lineHeight: 1.2 }}>{card.name}</div>
                    <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{card.role}</div>
                  </div>
                </div>
                {card.badge && (
                  <div style={{ marginTop: 6, backgroundColor: '#fef9c3', color: '#92400e', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, display: 'inline-block' }}>
                    {card.badge}
                  </div>
                )}
              </div>
            ))}
            {col.cards.length === 0 && (
              <div style={{ borderRadius: 6, border: '1px dashed #d1d5db', padding: '20px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#d1d5db' }}>Empty</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const SLIDES = [
  {
    label: 'vettedta.com/browse-recruiters',
    title: 'Browse recruiters',
    caption: 'Browse vetted specialists by sector, specialism, and language.',
    Component: BrowseSlide,
  },
  {
    label: 'vettedta.com/jobs/42',
    title: 'Compare proposals',
    caption: 'Compare structured proposals side-by-side before you commit.',
    Component: ProposalsSlide,
  },
  {
    label: 'vettedta.com/job/42/pipeline',
    title: 'Candidate pipeline',
    caption: 'Track every candidate. Milestone payments release automatically as work is delivered.',
    Component: PipelineSlide,
  },
]

function ProductCarousel() {
  const [active, setActive] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setActive(prev => (prev + 1) % SLIDES.length)
    }, 4500)
    return () => clearTimeout(t)
  }, [active, resetKey])

  function goTo(i) {
    setActive(i)
    setResetKey(k => k + 1)
  }

  const { Component, label, caption } = SLIDES[active]

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      {/* Browser chrome */}
      <div style={{ borderRadius: '10px 10px 0 0', backgroundColor: '#1e2a4a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ff5f57', display: 'block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffbd2e', display: 'block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#28c840', display: 'block' }} />
        </div>
        <div style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', system-ui, sans-serif", textAlign: 'center' }}>
          {label}
        </div>
      </div>
      {/* Slide content */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden', minHeight: 320 }}>
        <Component />
      </div>
      {/* Tab nav */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 0, marginTop: 32, borderBottom: `1px solid ${LGRAY}` }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            onClick={() => goTo(i)}
            style={{
              background: 'none', border: 'none', borderBottom: i === active ? `2px solid ${NAVY}` : '2px solid transparent',
              cursor: 'pointer', padding: '8px 24px', marginBottom: -1,
              fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: 13,
              fontWeight: i === active ? 700 : 400,
              color: i === active ? NAVY : GRAY,
              transition: 'all 0.2s',
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      {/* Caption */}
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", textAlign: 'center', fontSize: 14, color: GRAY, marginTop: 20, lineHeight: 1.6 }}>
        {caption}
      </p>
      {/* Dot nav */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.title + '-dot'}
            onClick={() => goTo(i)}
            aria-label={`View ${s.title}`}
            style={{
              width: i === active ? 32 : 8, height: 8, borderRadius: 4,
              backgroundColor: i === active ? NAVY : '#d1d5db',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Page ─── */

export default function HomePage() {
  return (
    <div style={{ ...S.sans, backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <Seo
        title="Vetted TA | Retained Recruitment Marketplace"
        description="Vetted TA connects hiring companies with independently vetted specialist recruiters. Milestone payments, 8–12% fees, exclusive engagements."
        path="/"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
        a { color: inherit; }
        .hp-btn-primary:hover { background-color: #14245a !important; }
        .hp-btn-blue:hover    { background-color: #2563eb !important; }
        .hp-btn-wo:hover      { background-color: rgba(255,255,255,0.15) !important; }
        .hp-nav-link:hover    { color: ${BLUE} !important; }
        .hp-split-link:hover  { text-decoration: underline !important; }
        @media (max-width: 768px) {
          .hp-nav-links    { display: none !important; }
          .hp-cta-btns     { flex-direction: column !important; align-items: flex-start !important; }
          .hp-hero-grid    { grid-template-columns: 1fr !important; }
          .hp-hero-img-col { display: none !important; }
          .hp-split-grid   { grid-template-columns: 1fr !important; }
          .hp-footer-grid  { grid-template-columns: 1fr !important; }
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
      <section style={{ backgroundColor: NAVY, color: '#fff', padding: '80px 24px 72px' }}>
        <div style={{ ...S.container }}>
          <div
            className="hp-hero-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 48, alignItems: 'center' }}
          >
            {/* Left — copy */}
            <div>
              <h1 style={{ ...S.serif, fontWeight: 700, fontSize: 52, lineHeight: 1.1, color: '#fff', marginBottom: 22 }}>
                The marketplace for elite recruiters and the companies who hire them.
              </h1>
              <p style={{ ...S.sans, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', marginBottom: 36 }}>
                Milestone payments, transparent fees, no agency overhead.
              </p>
              <div className="hp-cta-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/hire" className="hp-btn-blue" style={{
                  ...S.sans, fontWeight: 600, fontSize: 15,
                  backgroundColor: BLUE, color: '#fff', padding: '13px 28px', borderRadius: 6,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}>
                  I need to hire →
                </Link>
                <Link to="/for-recruiters" className="hp-btn-wo" style={{ ...S.btnWhiteOutline, fontSize: 15 }}>
                  I'm a recruiter →
                </Link>
              </div>
              <p style={{ ...S.sans, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 20, letterSpacing: '0.03em', marginBottom: 0 }}>
                Average fees 10% · Elite recruiters only · Payments via Stripe escrow
              </p>
            </div>

            {/* Right — hero photo */}
            <div className="hp-hero-img-col" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src="/images/hero-human.png"
                alt="Recruiter at work"
                onError={e => { e.target.style.display = 'none' }}
                style={{ width: '100%', maxWidth: 420, borderRadius: 12, objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7f0', borderBottom: '1px solid #e5e7f0' }}>
        <div style={{ ...S.container }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: 'avg. 10%',   label: 'Client fee — half the agency standard' },
              { value: 'Elite only', label: 'High bar — stringent vetting process' },
              { value: 'Escrow',     label: 'Every payment held by Stripe until delivered' },
              { value: 'You choose', label: 'See proposals before you commit to anything' },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`py-7 px-6 text-center${i < arr.length - 1 ? ' border-b border-[#e5e7f0] md:border-b-0 md:border-r' : ''}`}
              >
                <p style={{ ...S.sans, fontWeight: 500, fontSize: 20, color: '#1a2b6d', margin: 0, lineHeight: 1.1 }}>
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

      {/* ── PRODUCT CAROUSEL ── */}
      <section style={{ backgroundColor: OFF_WH, padding: '96px 24px' }}>
        <div style={{ ...S.container }}>
          <p style={{ ...S.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 12, textAlign: 'center' }}>
            The platform
          </p>
          <h2 style={{ ...S.serif, fontWeight: 400, fontSize: 40, color: NAVY, textAlign: 'center', marginBottom: 12, lineHeight: 1.15 }}>
            See how it works.
          </h2>
          <p style={{ ...S.sans, fontSize: 16, color: GRAY, textAlign: 'center', maxWidth: 520, margin: '0 auto 56px', lineHeight: 1.6 }}>
            From browsing specialists to tracking candidates — everything in one place.
          </p>
          <ProductCarousel />
        </div>
      </section>

      {/* ── TWO-COLUMN SPLIT ── */}
      <section style={{ backgroundColor: '#ffffff', padding: '96px 24px' }}>
        <div style={{ ...S.container }}>
          <div
            className="hp-split-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}
          >
            {/* LEFT — For companies */}
            <div style={{
              backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${LGRAY}`,
              borderTop: `4px solid ${NAVY}`, padding: '36px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 12 }}>
                For companies
              </p>
              <h2 style={{ ...S.serif, fontSize: 24, fontWeight: 700, color: NAVY, marginBottom: 16, lineHeight: 1.3 }}>
                Stop getting burned by agencies.
              </h2>
              <p style={{ ...S.sans, fontSize: 14, color: GRAY, lineHeight: 1.7, margin: 0 }}>
                Post your role, receive proposals from vetted specialists who actually know your sector, and pay only as work is delivered. No CVs that don't fit the brief. No inflated fees. No competing agencies racing the same brief.
              </p>
              <p style={{ ...S.sans, fontSize: 12, color: GRAY, marginTop: 16, marginBottom: 0 }}>
                8–12% fees · Milestone payments · Exclusive engagements
              </p>
              <Link to="/hire" className="hp-split-link" style={{ ...S.sans, fontSize: 13, color: NAVY, fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 20 }}>
                Post a role — it's free →
              </Link>
            </div>

            {/* RIGHT — For recruiters */}
            <div style={{
              backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${LGRAY}`,
              borderTop: `4px solid ${BLUE}`, padding: '36px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 12 }}>
                For recruiters
              </p>
              <h2 style={{ ...S.serif, fontSize: 24, fontWeight: 700, color: NAVY, marginBottom: 16, lineHeight: 1.3 }}>
                Work you love, without the politics.
              </h2>
              <p style={{ ...S.sans, fontSize: 14, color: GRAY, lineHeight: 1.7, margin: 0 }}>
                Exclusive retained briefs, no business development, and milestone payments that mean you're covered at every stage. Fill an €80k role at 12% and take home up to €6,720.
              </p>
              <p style={{ ...S.sans, fontSize: 12, color: GRAY, marginTop: 16, marginBottom: 0 }}>
                Zero BD · 70% of the fee · Founding cohort open now
              </p>
              <Link to="/for-recruiters" className="hp-split-link" style={{ ...S.sans, fontSize: 13, color: NAVY, fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: 20 }}>
                Apply as a recruiter →
              </Link>
            </div>
          </div>
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
                The marketplace for independently vetted talent acquisition specialists. Fees 8–12%. Milestone payments. No agency markup.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <p style={{ ...S.sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
                Platform
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { to: '/hire',              label: 'For companies' },
                  { to: '/for-recruiters',    label: 'For recruiters' },
                  { to: '/how-it-works',      label: 'How it works' },
                  { to: '/browse-recruiters', label: 'Browse recruiters' },
                  { to: '/hiring-manager/signup', label: 'Post a role' },
                  { to: '/recruiter/signup',  label: 'Join as recruiter' },
                  { to: '/login',             label: 'Sign in' },
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
                  { to: '/terms',               label: 'Terms of service' },
                  { to: '/privacy',             label: 'Privacy policy' },
                  { to: '/recruiter-agreement', label: 'Recruiter agreement' },
                  { to: '/careers',             label: 'Careers' },
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
