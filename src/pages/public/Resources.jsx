import { Link } from 'react-router-dom'
import Seo from '../../components/Seo'

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .rp-wrap *, .rp-wrap *::before, .rp-wrap *::after { box-sizing: border-box; }
  .rp-wrap {
    --rp-navy:      #1F3864;
    --rp-navy-lt:   #2a4a82;
    --rp-blue:      #3B7DD8;
    --rp-sky:       #D5E8F0;
    --rp-gold:      #C9932A;
    --rp-gold-bg:   #FFF8E7;
    --rp-green:     #2D7A4F;
    --rp-green-bg:  #E8F5EE;
    --rp-grey:      #595959;
    --rp-light:     #F7F9FC;
    --rp-white:     #FFFFFF;
    --rp-border:    #DDE4EE;
    --rp-text:      #2C2C2C;
    font-family: 'DM Sans', 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: var(--rp-light);
    color: var(--rp-text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  /* NAV */
  .rp-nav {
    background: var(--rp-navy);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }
  .rp-brand { color: white; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.02em; text-decoration: none; }
  .rp-brand span { font-size: 0.65rem; font-weight: 400; letter-spacing: 0.12em; display: block; opacity: 0.7; text-transform: uppercase; margin-top: -2px; }
  .rp-nav-link { color: rgba(255,255,255,0.8); font-size: 0.9rem; text-decoration: none; }
  .rp-nav-link:hover { color: white; }

  /* HERO */
  .rp-hero {
    background: linear-gradient(135deg, var(--rp-navy) 0%, var(--rp-navy-lt) 100%);
    color: white;
    padding: 4rem 2rem 3rem;
    text-align: center;
  }
  .rp-hero-eyebrow {
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    margin-bottom: 1rem;
  }
  .rp-hero h1 {
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }
  .rp-hero h1 em { font-style: normal; color: #7FB8E8; }
  .rp-hero p {
    font-size: 1rem;
    color: rgba(255,255,255,0.75);
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* PINNED BANNER */
  .rp-pinned {
    background: var(--rp-gold-bg);
    border-top: 3px solid var(--rp-gold);
    border-bottom: 1px solid #E8D8B0;
    padding: 1.25rem 2rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    max-width: 860px;
    margin: 2rem auto 0;
    border-radius: 8px;
  }
  .rp-pinned-icon { font-size: 1.4rem; flex-shrink: 0; margin-top: 2px; }
  .rp-pinned-text strong { color: var(--rp-gold); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.25rem; }
  .rp-pinned-text p { font-size: 0.92rem; color: #5A4A1A; line-height: 1.6; }

  /* MAIN */
  .rp-main {
    max-width: 860px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  /* SECTION HEADER */
  .rp-section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 2.5rem 0 1.25rem;
  }
  .rp-section-header:first-child { margin-top: 0; }
  .rp-section-tag {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--rp-blue);
    background: var(--rp-sky);
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    white-space: nowrap;
  }
  .rp-section-line { flex: 1; height: 1px; background: var(--rp-border); }

  /* TOOL CARD */
  .rp-tool-card {
    background: var(--rp-white);
    border: 1px solid var(--rp-border);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    position: relative;
    transition: box-shadow 0.15s ease;
  }
  .rp-tool-card:hover { box-shadow: 0 4px 16px rgba(31,56,100,0.1); }
  .rp-tool-card.featured { border-color: var(--rp-navy); border-width: 2px; }

  .rp-featured-badge {
    position: absolute;
    top: -1px;
    right: 1.25rem;
    background: var(--rp-navy);
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.25rem 0.6rem;
    border-radius: 0 0 6px 6px;
  }

  .rp-tool-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  .rp-tool-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
    background: var(--rp-sky);
  }
  .rp-tool-icon.green { background: var(--rp-green-bg); }
  .rp-tool-icon.gold  { background: var(--rp-gold-bg); }

  .rp-tool-meta { flex: 1; }
  .rp-tool-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--rp-navy);
    margin-bottom: 0.15rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .rp-tool-cost {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--rp-green);
    background: var(--rp-green-bg);
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
  }
  .rp-tool-cost.paid { color: var(--rp-grey); background: #F0F0F0; }
  .rp-tool-subtitle { font-size: 0.82rem; color: var(--rp-grey); }

  .rp-tool-desc {
    font-size: 0.9rem;
    color: var(--rp-grey);
    line-height: 1.65;
    margin-bottom: 1rem;
  }

  /* WHAT YOU GET LIST */
  .rp-wyg {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem 1rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 540px) { .rp-wyg { grid-template-columns: 1fr; } }
  .rp-wyg li {
    font-size: 0.85rem;
    color: var(--rp-text);
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
  }
  .rp-wyg li::before {
    content: '✓';
    color: var(--rp-green);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* WORKAROUND NOTE */
  .rp-workaround {
    background: #F7F9FC;
    border-left: 3px solid var(--rp-blue);
    border-radius: 0 6px 6px 0;
    padding: 0.75rem 1rem;
    font-size: 0.83rem;
    color: var(--rp-grey);
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  .rp-workaround strong { color: var(--rp-navy); }

  /* TRIAL CALLOUT */
  .rp-trial {
    background: var(--rp-green-bg);
    border: 1px solid #B8DEC8;
    border-radius: 6px;
    padding: 0.7rem 1rem;
    font-size: 0.85rem;
    color: var(--rp-green);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* TOOL LINK */
  .rp-tool-link {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.83rem;
    font-weight: 600;
    color: var(--rp-blue);
    text-decoration: none;
    margin-top: 0.5rem;
  }
  .rp-tool-link:hover { text-decoration: underline; }
  .rp-tool-link::after { content: '→'; }

  /* COMPARISON TABLE */
  .rp-compare-wrap {
    background: white;
    border: 1px solid var(--rp-border);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 1rem;
    overflow-x: auto;
  }
  .rp-compare-wrap table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .rp-compare-wrap thead { background: var(--rp-navy); color: white; }
  .rp-compare-wrap thead th { padding: 0.75rem 1rem; text-align: left; font-weight: 600; font-size: 0.82rem; }
  .rp-compare-wrap tbody tr { border-top: 1px solid var(--rp-border); }
  .rp-compare-wrap tbody tr:hover { background: var(--rp-light); }
  .rp-compare-wrap tbody td { padding: 0.7rem 1rem; color: var(--rp-grey); vertical-align: top; }
  .rp-compare-wrap tbody td:first-child { color: var(--rp-navy); font-weight: 600; }
  .rp-check { color: var(--rp-green); font-weight: 700; }
  .rp-cross { color: #C0392B; }
  .rp-hl-row td { background: #F0F6FF; }

  /* FREE TOOLS GRID */
  .rp-free-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  @media (max-width: 540px) { .rp-free-grid { grid-template-columns: 1fr; } }
  .rp-free-card {
    background: white;
    border: 1px solid var(--rp-border);
    border-radius: 8px;
    padding: 1rem 1.1rem;
  }
  .rp-free-card-name { font-size: 0.92rem; font-weight: 700; color: var(--rp-navy); margin-bottom: 0.25rem; }
  .rp-free-card-desc { font-size: 0.82rem; color: var(--rp-grey); line-height: 1.55; }
  .rp-free-badge {
    display: inline-block;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rp-green);
    background: var(--rp-green-bg);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    margin-bottom: 0.4rem;
  }

  /* CHECKLIST */
  .rp-checklist {
    background: white;
    border: 1px solid var(--rp-border);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  .rp-checklist h3 { font-size: 0.95rem; font-weight: 700; color: var(--rp-navy); margin-bottom: 1rem; }
  .rp-cl-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid var(--rp-border);
  }
  .rp-cl-item:last-child { border-bottom: none; padding-bottom: 0; }
  .rp-cl-box {
    width: 20px;
    height: 20px;
    border: 2px solid var(--rp-border);
    border-radius: 4px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .rp-cl-label { font-size: 0.88rem; color: var(--rp-text); line-height: 1.5; }
  .rp-cl-label span { display: block; font-size: 0.78rem; color: var(--rp-grey); margin-top: 0.1rem; }

  /* FOOTER */
  .rp-footer {
    background: var(--rp-navy);
    color: rgba(255,255,255,0.6);
    text-align: center;
    padding: 2rem;
    font-size: 0.82rem;
  }
  .rp-footer a { color: rgba(255,255,255,0.8); text-decoration: none; }
  .rp-footer p + p { margin-top: 0.5rem; }
`

export default function Resources() {
  return (
    <div className="rp-wrap">
      <Seo
        title="Recruiter Resources | Vetted TA"
        description="Tools and resources for Vetted TA recruiters — sourcing tools, job boards, candidate tracking, and a pre-brief checklist."
        path="/resources"
      />
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className="rp-nav">
        <Link to="/" className="rp-brand">
          Vetted TA
          <span>Recruitment Marketplace</span>
        </Link>
        <Link to="/" className="rp-nav-link">← Back to Vetted TA</Link>
      </nav>

      {/* ── HERO ── */}
      <div className="rp-hero">
        <p className="rp-hero-eyebrow">Resources for Founding Members</p>
        <h1>The tools you need to <em>deliver</em> on your first brief</h1>
        <p>You've been approved. A brief is coming. Here's exactly what you need to source confidently, work independently, and get paid.</p>
      </div>

      {/* ── PINNED BANNER ── */}
      <div className="rp-pinned">
        <div className="rp-pinned-icon">📌</div>
        <div className="rp-pinned-text">
          <strong>Before you take your first brief</strong>
          <p>When a brief lands, your fee goes into escrow before you start. That money is nearly guaranteed once you deliver. LinkedIn Recruiter Lite costs €170/month and can be cancelled any time. On an €80k placement at 10%, you take home €5,600. Lite pays for itself on the day your first milestone releases — start the free trial the moment your brief is confirmed.</p>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="rp-main">

        {/* Section: Essential */}
        <div className="rp-section-header">
          <span className="rp-section-tag">Essential</span>
          <div className="rp-section-line" />
        </div>

        {/* LinkedIn Recruiter Lite — Featured */}
        <div className="rp-tool-card featured">
          <div className="rp-featured-badge">⭐ Recommended</div>
          <div className="rp-tool-header">
            <div className="rp-tool-icon">🔍</div>
            <div className="rp-tool-meta">
              <div className="rp-tool-name">
                LinkedIn Recruiter Lite
                <span className="rp-tool-cost paid">~€170/month</span>
              </div>
              <div className="rp-tool-subtitle">The single most important sourcing tool for independent tech recruiters</div>
            </div>
          </div>
          <p className="rp-tool-desc">LinkedIn is where the candidates are. Recruiter Lite gives you the search filters and InMail credits to reach them directly — without it, you're limited to your existing connections and can't do targeted outreach at scale. For working one exclusive brief at a time, Lite is everything you need.</p>
          <ul className="rp-wyg">
            <li>30 InMails per month — enough for one focused brief</li>
            <li>20+ advanced search filters</li>
            <li>Full 3rd-degree network access</li>
            <li>Boolean search for precision targeting</li>
            <li>Candidate pipeline and project folders</li>
            <li>Cancel any time — no long-term commitment</li>
          </ul>
          <div className="rp-workaround">
            <strong>The one thing Lite doesn't have:</strong> the Open to Work filter (Corporate only). The workaround is simple — use Boolean search to include phrases like "open to new opportunities" or "seeking new role" in your keyword search. Most strong passive candidates don't have the badge anyway.
          </div>
          <div className="rp-trial">
            🎁 30-day free trial available for new accounts — start your trial when your first brief lands and pay from your Milestone 1 payment.
          </div>
          <a href="https://www.linkedin.com/talent/recruiter-lite" className="rp-tool-link" target="_blank" rel="noopener noreferrer">
            Start free trial on LinkedIn
          </a>
        </div>

        {/* Comparison table */}
        <div className="rp-compare-wrap">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free LinkedIn</th>
                <th>Recruiter Lite</th>
                <th>Corporate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monthly cost</td>
                <td>Free</td>
                <td>~€170/mo</td>
                <td>~€900/mo</td>
              </tr>
              <tr className="rp-hl-row">
                <td>InMails per month</td>
                <td className="rp-cross">0</td>
                <td className="rp-check">30</td>
                <td className="rp-check">150</td>
              </tr>
              <tr>
                <td>Advanced search filters</td>
                <td className="rp-cross">Basic only</td>
                <td className="rp-check">20+</td>
                <td className="rp-check">40+</td>
              </tr>
              <tr className="rp-hl-row">
                <td>Network access</td>
                <td className="rp-cross">1st degree only</td>
                <td className="rp-check">3rd degree</td>
                <td className="rp-check">Full 1B+ members</td>
              </tr>
              <tr>
                <td>Open to Work filter</td>
                <td className="rp-cross">No</td>
                <td className="rp-cross">No</td>
                <td className="rp-check">Yes</td>
              </tr>
              <tr className="rp-hl-row">
                <td>Candidate pipeline tools</td>
                <td className="rp-cross">No</td>
                <td className="rp-check">Yes</td>
                <td className="rp-check">Yes</td>
              </tr>
              <tr>
                <td>Cancel any time</td>
                <td>—</td>
                <td className="rp-check">Yes</td>
                <td className="rp-cross">Annual contract</td>
              </tr>
              <tr className="rp-hl-row">
                <td>Right for Vetted TA recruiters?</td>
                <td className="rp-cross">Too limited</td>
                <td className="rp-check" style={{ color: 'var(--rp-green)', fontWeight: 700 }}>Perfect fit</td>
                <td className="rp-cross">Overkill</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section: Job Advertising */}
        <div className="rp-section-header">
          <span className="rp-section-tag">Job Advertising</span>
          <div className="rp-section-line" />
        </div>

        <div className="rp-tool-card">
          <div className="rp-tool-header">
            <div className="rp-tool-icon green">📋</div>
            <div className="rp-tool-meta">
              <div className="rp-tool-name">
                LinkedIn Job Post
                <span className="rp-tool-cost">Free</span>
              </div>
              <div className="rp-tool-subtitle">Still the highest-quality source for active tech candidates</div>
            </div>
          </div>
          <p className="rp-tool-desc">Post the role under your own name as an independent recruiter. Free job posts appear in search results and get real organic reach — often better than paid alternatives for specialist tech roles. One free post at a time, active for 14 days before needing a refresh.</p>
          <ul className="rp-wyg">
            <li>Appears in LinkedIn job search</li>
            <li>Collect and filter applicants directly</li>
            <li>Free — no credits needed</li>
            <li>Works on a personal account, no company page required</li>
          </ul>
        </div>

        <div className="rp-tool-card">
          <div className="rp-tool-header">
            <div className="rp-tool-icon">🌍</div>
            <div className="rp-tool-meta">
              <div className="rp-tool-name">
                Wellfound (formerly AngelList Talent)
                <span className="rp-tool-cost">Free</span>
              </div>
              <div className="rp-tool-subtitle">Best free database for startup-focused tech candidates</div>
            </div>
          </div>
          <p className="rp-tool-desc">Unlimited free job postings with no time expiry. Strong candidate pool for software engineers, data roles, and product managers — exactly the specialisms on Vetted TA. Candidates are generally startup-minded and open to smaller, scaling companies.</p>
          <ul className="rp-wyg">
            <li>Unlimited job posts, no expiry</li>
            <li>Browsable candidate profiles</li>
            <li>Strong software engineering and product talent</li>
            <li>US, UK, and European coverage</li>
          </ul>
          <a href="https://wellfound.com" className="rp-tool-link" target="_blank" rel="noopener noreferrer">
            Post on Wellfound
          </a>
        </div>

        {/* Section: Candidate Tracking */}
        <div className="rp-section-header">
          <span className="rp-section-tag">Candidate Tracking</span>
          <div className="rp-section-line" />
        </div>

        <div className="rp-tool-card">
          <div className="rp-tool-header">
            <div className="rp-tool-icon gold">📁</div>
            <div className="rp-tool-meta">
              <div className="rp-tool-name">
                Vetted TA Platform
                <span className="rp-tool-cost">Free — included</span>
              </div>
              <div className="rp-tool-subtitle">Your brief, your candidates, your milestones — all in one place</div>
            </div>
          </div>
          <p className="rp-tool-desc">The Vetted TA platform handles brief management, CV uploads, milestone tracking, and payment releases. You don't need a separate ATS for roles you're working through Vetted TA — everything the hiring manager needs to see is already built in.</p>
          <ul className="rp-wyg">
            <li>Upload and log candidate CVs against the brief</li>
            <li>Track milestone sign-offs from the hiring manager</li>
            <li>Payment releases automatically at each stage</li>
            <li>Full audit trail of deliverables</li>
          </ul>
        </div>

        {/* Section: Free Tools */}
        <div className="rp-section-header">
          <span className="rp-section-tag">Free Tools Worth Having</span>
          <div className="rp-section-line" />
        </div>

        <div className="rp-free-grid">
          {[
            { name: 'Notion', desc: 'Simple candidate tracker if you're running multiple searches. Build a lightweight pipeline with status columns — no ATS licence needed for 1–2 concurrent roles.' },
            { name: 'Google Sheets', desc: 'A well-structured spreadsheet covers everything you need to track candidates, interview stages, and feedback for a single brief. Fast to set up, nothing to learn.' },
            { name: 'Calendly', desc: 'Send candidates a self-serve booking link for screening calls. Cuts the back-and-forth and signals professionalism without any cost on the free tier.' },
            { name: 'Recruiting Brainfood', desc: "Hung Lee's weekly newsletter and community. The best free resource for staying sharp on market trends, sourcing techniques, and what's happening in the TA world." },
          ].map(t => (
            <div key={t.name} className="rp-free-card">
              <div className="rp-free-badge">Free</div>
              <div className="rp-free-card-name">{t.name}</div>
              <div className="rp-free-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Section: Before Your First Brief */}
        <div className="rp-section-header">
          <span className="rp-section-tag">Before Your First Brief</span>
          <div className="rp-section-line" />
        </div>

        <div className="rp-checklist">
          <h3>Make sure you have these in place before you accept a brief</h3>
          {[
            { label: 'LinkedIn Recruiter Lite trial activated', note: 'Start the free trial the moment your brief is confirmed — not after' },
            { label: 'Bank account connected on Vetted TA', note: "Milestone payments can't release without this — set it up now, not when the first payment is due" },
            { label: 'LinkedIn profile updated and public', note: 'Hiring managers and candidates will look you up — make sure it reflects your specialism clearly' },
            { label: 'Wellfound account created', note: 'Free job posting ready to go the moment you have a brief to advertise' },
            { label: 'Candidate tracker set up (Vetted TA platform, Notion, or Google Sheets)', note: 'Have somewhere to log candidate names, status, and notes before sourcing begins' },
            { label: 'Calendly or equivalent set up for screening calls', note: 'Saves hours of scheduling back-and-forth on every brief' },
          ].map(item => (
            <div key={item.label} className="rp-cl-item">
              <div className="rp-cl-box" />
              <div className="rp-cl-label">
                {item.label}
                <span>{item.note}</span>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="rp-footer">
        <p>Vetted TA — Recruitment Marketplace &nbsp;·&nbsp; <a href="https://vettedta.com">vettedta.com</a></p>
        <p>Questions? Email <a href="mailto:hello@vettedta.com">hello@vettedta.com</a></p>
      </footer>
    </div>
  )
}
