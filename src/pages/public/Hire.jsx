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

export default function Hire() {
  return (
    <div style={{ ...S.sans, backgroundColor: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <Seo
        title="Hire Specialist Recruiters | Vetted TA"
        description="Post a role and receive proposals from independently vetted specialist recruiters. Retained engagements, milestone payments, 8–12% fees. No agency markup."
        path="/hire"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { -webkit-font-smoothing: antialiased; }
        a { color: inherit; }
        .hi-btn-primary:hover   { background-color: #14245a !important; }
        .hi-btn-wo:hover        { background-color: rgba(255,255,255,0.15) !important; }
        .hi-nav-link:hover      { color: ${BLUE} !important; }
        .hi-card:hover          { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(26,43,109,0.12) !important; }
        .hi-r-card              { transition: transform 0.2s, box-shadow 0.2s; }
        .hi-r-card:hover        { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(26,43,109,0.14) !important; }
        @media (max-width: 768px) {
          .hi-nav-links         { display: none !important; }
          .hi-hero-grid         { grid-template-columns: 1fr !important; }
          .hi-hero-imgs         { display: none !important; }
          .hi-cards-grid        { grid-template-columns: 1fr !important; }
          .hi-feature-grid      { grid-template-columns: 1fr !important; }
          .hi-cta-btns          { flex-direction: column !important; align-items: stretch !important; }
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

          <nav className="hi-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <Link to="/how-it-works" className="hi-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              How it works
            </Link>
            <Link to="/browse-recruiters" className="hi-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              Browse recruiters
            </Link>
            <Link to="/for-recruiters" className="hi-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              For recruiters
            </Link>
            <Link to="/hire" className="hi-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              For companies
            </Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/login" className="hi-nav-link" style={{ ...S.sans, fontSize: 14, fontWeight: 500, color: '#374151', textDecoration: 'none', transition: 'color 0.15s' }}>
              Sign in
            </Link>
            <Link to="/hiring-manager/signup" className="hi-btn-primary" style={{ ...S.btnPrimary, fontSize: 13, padding: '9px 20px' }}>
              Post a Role
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ backgroundColor: NAVY, color: '#fff', padding: '80px 24px 70px' }}>
        <div style={{ ...S.container }}>
          <div
            className="hi-hero-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}
          >
            {/* Left — copy */}
            <div>
              <span style={{
                ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: BLUE, background: 'rgba(59,130,246,0.18)',
                padding: '5px 12px', borderRadius: 4, display: 'inline-block', marginBottom: 24,
              }}>
                Retained recruitment · 8–12% fees · No agency markup
              </span>
              <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 52, lineHeight: 1.12, color: '#fff', maxWidth: 580, marginBottom: 22 }}>
                Hire the{' '}
                <span style={{ fontStyle: 'italic', color: '#93c5fd' }}>specialist</span>{' '}
                your brief actually needs.
              </h1>
              <p style={{ ...S.sans, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 460, marginBottom: 36 }}>
                Post a role and receive proposals from independently vetted recruiters. One recruiter per brief. Milestone payments. No competing agencies.
              </p>
              <div className="hi-cta-btns" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/hiring-manager/signup" style={{
                  ...S.sans, fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  backgroundColor: BLUE, color: '#fff', padding: '12px 24px', borderRadius: 4,
                  border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  Post a Role — It's Free
                </Link>
                <Link to="/browse-recruiters" style={{
                  ...S.sans, fontWeight: 300, fontSize: 12, backgroundColor: 'transparent',
                  border: '0.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)',
                  padding: '11px 20px', borderRadius: 4, textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: 6,
                }}>
                  Browse recruiters <span style={{ color: '#93c5fd' }}>→</span>
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
                    Vetted specialists · 15% acceptance rate · From Meta, Google, Amazon and more
                  </p>
                  <p style={{ ...S.sans, fontWeight: 300, fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: 2 }}>
                    Senior recruiters · Ireland, UK and beyond.
                  </p>
                </div>
              </div>
            </div>

            {/* Right — proposal comparison mockup */}
            <div
              className="hi-hero-imgs"
              style={{ background: '#f1f3f8', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 480, overflowY: 'auto' }}
            >
              {/* Browser bar */}
              <div style={{ background: '#1a2b6d', padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 1 }}>
                <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'block' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e', display: 'block' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'block' }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
                  vettedta.com/jobs/42
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: 18 }}>
                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, color: '#6b7280', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
                    9 proposals received · Compare and choose your specialist
                  </span>
                  <span style={{ fontSize: 12, color: '#1a2b6d', fontWeight: 500, fontFamily: "'DM Sans', system-ui, sans-serif", flexShrink: 0, marginLeft: 8 }}>
                    3 shortlisted
                  </span>
                </div>

                {/* Two cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                  {/* Card 1 — Jack N. */}
                  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #1a2b6d', padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1a2b6d', flexShrink: 0 }}>JN</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Jack N.</span>
                          <span style={{ fontSize: 20, fontWeight: 700, color: '#1a2b6d', fontFamily: "'DM Sans', system-ui, sans-serif", flexShrink: 0 }}>10%</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.3 }}>Senior Technology Recruiter · Dublin · London</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                      {['Software Engineering', 'DevOps & Cloud', 'AI & ML'].map(p => (
                        <span key={p} style={{ fontSize: 9, background: 'rgba(59,130,246,0.08)', color: '#1a2b6d', padding: '2px 6px', borderRadius: 3, fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500 }}>{p}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 9, color: '#9ca3af', fontFamily: "'DM Sans', system-ui, sans-serif" }}>of agreed salary</span>
                      <span style={{ fontSize: 9, background: '#eff6ff', color: '#3b82f6', fontWeight: 700, padding: '2px 8px', borderRadius: 10, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Shortlisted</span>
                    </div>
                    <div style={{ borderTop: '1px solid #f3f4f6', marginBottom: 10 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      {[
                        { label: 'Sourcing',  val: 'Direct LinkedIn Recruiter outreach targeting passive Node.js and TypeScript candidates. Tapping 3 niche tech communities. Headhunting only — no job board blasting.' },
                        { label: 'Screening', val: '30-min structured screen covering AWS depth and system design before any CV is submitted. Max 6 candidates. Written summary with each CV.' },
                        { label: 'Tools',     val: 'LinkedIn Recruiter, GitHub sourcing, Workable ATS, HireEZ' },
                        { label: 'Timeline',  val: 'First shortlist of 4–6 within 10 business days' },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{f.label}</div>
                          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#f8f9ff', borderLeft: '2px solid #1a2b6d', padding: '8px 10px', marginBottom: 10, borderRadius: '0 4px 4px 0' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 3, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Track record</div>
                      <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Placed 3 senior full-stack engineers in 6 months — two at Series B startups in Dublin, one at a US-listed fintech. Average time-to-shortlist: 9 days. All still in role after 12+ months.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ flex: 1, background: '#1a2b6d', color: '#fff', border: 'none', borderRadius: 5, padding: '7px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Accept proposal</button>
                      <button style={{ flex: 1, background: 'transparent', color: '#1a2b6d', border: '1px solid #1a2b6d', borderRadius: 5, padding: '7px 0', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Remove shortlist</button>
                    </div>
                  </div>

                  {/* Card 2 — Tracey B. */}
                  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#7c3aed', flexShrink: 0 }}>TB</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#111827', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Tracey B.</span>
                          <span style={{ fontSize: 20, fontWeight: 700, color: '#1a2b6d', fontFamily: "'DM Sans', system-ui, sans-serif", flexShrink: 0 }}>8%</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'DM Sans', system-ui, sans-serif", lineHeight: 1.3 }}>Technology Specialist · Dublin · Remote-first</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                      {['Full Stack', 'Product Engineering'].map(p => (
                        <span key={p} style={{ fontSize: 9, background: 'rgba(59,130,246,0.08)', color: '#1a2b6d', padding: '2px 6px', borderRadius: 3, fontFamily: "'DM Sans', system-ui, sans-serif", fontWeight: 500 }}>{p}</span>
                      ))}
                    </div>
                    <div style={{ borderTop: '1px solid #f3f4f6', marginBottom: 10 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      {[
                        { label: 'Sourcing',  val: 'Warm network first — placed engineers at 4 Dublin tech companies in past 14 months. Boolean search supplement across LinkedIn and Stack Overflow Talent.' },
                        { label: 'Screening', val: 'CV review then 20-min intro call. One-page candidate summary sheet with each CV.' },
                        { label: 'Tools',     val: 'LinkedIn Recruiter, Stack Overflow Talent, Ashby ATS' },
                        { label: 'Timeline',  val: 'First CVs within 7 business days' },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 2, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{f.label}</div>
                          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>{f.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: '#f8f9ff', borderLeft: '2px solid #1a2b6d', padding: '8px 10px', marginBottom: 10, borderRadius: '0 4px 4px 0' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 3, fontFamily: "'DM Sans', system-ui, sans-serif" }}>Track record</div>
                      <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5, fontFamily: "'DM Sans', system-ui, sans-serif" }}>8 placements in Technology past 12 months, 5 full-stack or backend. 100% offer acceptance rate.</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={{ flex: 1, background: 'transparent', color: '#1a2b6d', border: '1px solid #1a2b6d', borderRadius: 5, padding: '7px 0', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Shortlist</button>
                      <button style={{ flex: 1, background: 'transparent', color: '#9ca3af', border: '1px solid #e5e7eb', borderRadius: 5, padding: '7px 0', fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif" }}>Decline</button>
                    </div>
                  </div>

                </div>
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
              { value: 'Exclusive',  label: 'One recruiter per role' },
              { value: 'Elite only', label: 'Roughly 1 in 7 applicants approved' },
              { value: 'Milestone',  label: 'Pay as work is delivered' },
              { value: 'No markup',  label: 'No agency overhead' },
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

      {/* ── PAIN POINTS ── */}
      <section style={{ backgroundColor: '#ffffff', padding: '96px 24px' }}>
        <div style={{ ...S.containerWide }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ ...S.sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              Sound familiar?
            </p>
            <h2 style={{ ...S.serif, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.2, letterSpacing: '-0.3px', margin: 0 }}>
              The problem with agencies.
            </h2>
          </div>
          <div className="hi-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                title: "CVs that don't fit the brief",
                body: 'Agencies optimise for speed, not fit. You get volume, not quality — and you spend your time filtering candidates that were never right.',
              },
              {
                title: 'Paying 20%+ for a junior consultant',
                body: 'Agency fees fund overheads, management layers, and BD teams you never asked for. The person working your role is rarely the person you met.',
              },
              {
                title: 'Three agencies, same candidate pool',
                body: 'Contingency models mean multiple recruiters racing the same brief. Exclusivity goes out the window and urgency replaces quality.',
              },
            ].map(item => (
              <div
                key={item.title}
                className="hi-card"
                style={{
                  backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${LGRAY}`,
                  borderTop: `3px solid ${NAVY}`, padding: '28px 26px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <h3 style={{ ...S.sans, fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10 }}>
                  {item.title}
                </h3>
                <p style={{ ...S.sans, fontSize: 14, color: GRAY, lineHeight: 1.65, margin: 0 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
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
              <h2 style={{ ...S.serif, fontSize: 36, fontWeight: 700, color: NAVY, lineHeight: 1.2, letterSpacing: '-0.3px', margin: '0 0 10px 0' }}>
                The recruiters you'll work with.
              </h2>
              <p style={{ ...S.sans, fontWeight: 300, fontSize: 14, color: GRAY, margin: 0 }}>
                Independently vetted specialists — in their own words.
              </p>
            </div>
            <Link to="/browse-recruiters" style={{
              ...S.btnPrimary, backgroundColor: 'transparent', color: NAVY,
              border: `2px solid ${NAVY}`, fontSize: 13,
            }}>
              Browse all recruiters →
            </Link>
          </div>

          <div className="hi-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {RECRUITER_CARDS.map(r => (
              <div
                key={r.name}
                className="hi-r-card"
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
              Simple. Transparent. Accountable.
            </h2>
          </div>

          <div className="hi-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              {
                step: '01',
                title: 'Post a role to the marketplace',
                body: 'Publish your brief and qualified recruiters submit proposals — their fee, sourcing strategy, and track record. You choose who to work with.',
              },
              {
                step: '02',
                title: 'Review proposals and choose',
                body: 'Compare proposals side by side. Every recruiter is manually vetted before they can bid. No agencies, no junior consultants — specialist independents only.',
              },
              {
                step: '03',
                title: 'Pay on milestones, not on faith',
                body: '20% when CVs are approved. 30% when interviews are confirmed. 50% when the offer is accepted. Every payment held in escrow by Stripe until the work is delivered.',
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
              For companies
            </p>
            <ul className="hi-feature-grid" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                'Exclusive: one recruiter per role, no competing agencies',
                'Vetted specialists: roughly 1 in 7 applicants is approved',
                'Milestone payments: pay as work is delivered, not upfront',
                'Transparent fees: 8–12% of salary, no hidden costs',
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

      {/* ── TESTIMONIAL ── */}
      <section style={{ backgroundColor: '#f8f9fc', padding: '64px 48px' }}>
        <div style={{ ...S.container }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ ...S.sans, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: BLUE, marginBottom: 10 }}>
              From our clients
            </p>
            <h2 style={{ ...S.serif, fontWeight: 400, fontSize: 28, color: '#1a1f36', margin: '0 0 6px 0' }}>
              Why they chose us.
            </h2>
            <p style={{ ...S.sans, fontWeight: 300, fontSize: 14, color: '#6b7280', margin: 0 }}>
              Hiring managers — in their own words.
            </p>
          </div>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7f0', borderRadius: 8, padding: '32px 28px', maxWidth: 680 }}>
            <span style={{ ...S.serif, fontSize: 44, color: '#c7d2fe', lineHeight: 0.8, display: 'block', marginBottom: 10 }}>"</span>
            <p style={{ ...S.sans, fontWeight: 300, fontStyle: 'italic', fontSize: 14, lineHeight: 1.8, color: '#4b5563', marginBottom: 20 }}>
              We'd been burned by agencies sending CVs that clearly didn't fit the brief. What I liked about Vetted TA is that the recruiter had spent years in our sector and actually understood what we were looking for. The proposal process made it easy to compare and choose with confidence.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/images/paul-h.png" alt="Paul H." style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
              <div>
                <p style={{ ...S.sans, fontWeight: 500, fontSize: 12, color: '#1a1f36', margin: 0 }}>Paul H.</p>
                <p style={{ ...S.sans, fontWeight: 300, fontSize: 10, color: '#9ca3af', margin: 0 }}>Head of People · Scale-up · London</p>
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
            Post a role. It's free.
          </h2>
          <p style={{ ...S.sans, fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, marginBottom: 40 }}>
            No upfront fees. No retainer until you choose a recruiter. Post your brief, review proposals from vetted specialists, and only pay when the work is delivered.
          </p>
          <div className="hi-cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hiring-manager/signup" className="hi-btn-primary" style={{ ...S.btnPrimary, backgroundColor: BLUE, fontSize: 15, padding: '14px 36px' }}>
              Post a Role — It's Free
            </Link>
            <Link to="/browse-recruiters" className="hi-btn-wo" style={{ ...S.btnWhiteOutline, fontSize: 15, padding: '13px 36px' }}>
              Browse recruiters
            </Link>
          </div>
          <p style={{ ...S.sans, fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 20 }}>
            No credit card required · Roles are live within minutes
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
