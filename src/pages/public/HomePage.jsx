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
        .hp-btn-wo:hover      { background-color: rgba(255,255,255,0.15) !important; }
        .hp-nav-link:hover    { color: ${BLUE} !important; }
        .hp-split-link:hover  { text-decoration: underline !important; }
        @media (max-width: 768px) {
          .hp-nav-links   { display: none !important; }
          .hp-cta-btns    { flex-direction: column !important; align-items: center !important; }
          .hp-split-grid  { grid-template-columns: 1fr !important; }
          .hp-footer-grid { grid-template-columns: 1fr !important; }
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
      <section style={{ backgroundColor: NAVY, color: '#fff', padding: '100px 24px 90px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ ...S.serif, fontWeight: 400, fontSize: 52, lineHeight: 1.12, color: '#fff', marginBottom: 22 }}>
            Retained recruitment, done differently.
          </h1>
          <p style={{ ...S.sans, fontWeight: 300, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 520, margin: '0 auto 40px' }}>
            Vetted TA connects hiring companies with independently vetted specialist recruiters. Milestone payments, transparent fees, no agency overhead.
          </p>
          <div className="hp-cta-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hire" style={{
              ...S.sans, fontWeight: 500, fontSize: 15,
              backgroundColor: BLUE, color: '#fff', padding: '13px 28px', borderRadius: 6,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
            }}>
              I need to hire →
            </Link>
            <Link to="/for-recruiters" className="hp-btn-wo" style={{ ...S.btnWhiteOutline, fontSize: 15 }}>
              I'm a recruiter →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e7f0', borderBottom: '1px solid #e5e7f0' }}>
        <div style={{ ...S.container }}>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[
              { value: '8–12%',  label: 'Fees — half what agencies charge' },
              { value: '1 in 7', label: 'Recruiters approved — elite only' },
              { value: 'Escrow', label: 'Every payment held by Stripe until delivered' },
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
                  { to: '/hire',           label: 'For companies' },
                  { to: '/for-recruiters', label: 'For recruiters' },
                  { to: '/how-it-works',   label: 'How it works' },
                  { to: '/browse-recruiters', label: 'Browse recruiters' },
                  { to: '/hiring-manager/signup', label: 'Post a role' },
                  { to: '/recruiter/signup', label: 'Join as recruiter' },
                  { to: '/login',          label: 'Sign in' },
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
