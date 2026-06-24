import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const JOB_SCHEMA = {
  '@context': 'https://schema.org/',
  '@type': 'JobPosting',
  title: 'Talent Acquisition Partner (Contract)',
  description:
    'Vetted TA is a retained recruitment marketplace connecting independent recruiters with companies that need hiring help. Every recruiter is personally vetted. Every role is exclusive. Every payment is milestone-protected. We are looking for experienced in-house TA professionals ready to work independently. You will take on exclusive retained briefs from hiring companies that need senior recruitment expertise but cannot justify a full-time hire. You manage the process end to end — sourcing, screening, managing hiring managers — exactly what you have always done. Zero business development. This is a marketplace where work finds you. Responsibilities: Manage end-to-end recruitment on exclusive retained briefs. Deliver an agreed shortlist of quality candidates. Manage the interview process and candidate experience. See placements through to offer accepted and signed. Compensation: Fee-based. Client fees capped at 6–10% of candidate salary. Example: €80,000 role at 10% = €6,800 net to you after platform fee. Payments released in three escrow-protected milestones — 20% on shortlist approval, 30% on interview confirmation, 50% on offer acceptance. No invoice chasing. No contingency risk. Eligibility: Must have proven history placing candidates in Ireland, UK, USA, Canada, Australia, Netherlands, Germany, France, Switzerland, Belgium, Denmark, Sweden, Norway, Finland, or UAE.',
  datePosted: '2026-06-24',
  validThrough: '2026-12-31',
  employmentType: 'CONTRACTOR',
  hiringOrganization: {
    '@type': 'Organization',
    name: 'Vetted TA',
    sameAs: 'https://www.vettedta.com',
  },
  jobLocationType: 'TELECOMMUTE',
  incentiveCompensation:
    'Fee-based compensation. Recruiters receive 85% of the placement fee (after a 15% platform fee). Client fees are capped at 6–10% of candidate annual salary. Payments are protected by escrow and released in three milestones: 20% on shortlist approval, 30% on interview confirmation, 50% on offer acceptance.',
  applicantLocationRequirements: [
    { '@type': 'Country', name: 'Ireland' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'Australia' },
    { '@type': 'Country', name: 'Netherlands' },
    { '@type': 'Country', name: 'Germany' },
    { '@type': 'Country', name: 'France' },
    { '@type': 'Country', name: 'Switzerland' },
    { '@type': 'Country', name: 'Belgium' },
    { '@type': 'Country', name: 'Denmark' },
    { '@type': 'Country', name: 'Sweden' },
    { '@type': 'Country', name: 'Norway' },
    { '@type': 'Country', name: 'Finland' },
    { '@type': 'Country', name: 'United Arab Emirates' },
  ],
}

function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold text-slate-900 mb-4">{children}</h2>
}

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JOB_SCHEMA) }}
      />

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo dark /></Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign in</Link>
            <Link to="/recruiter/signup" className="btn-primary text-sm">Join as Recruiter</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Careers at Vetted TA
          </h1>
          <p className="text-lg text-blue-200 max-w-xl mx-auto">
            Join the marketplace changing how independent recruiters work.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-10">

        {/* Job title */}
        <div>
          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
            Now Hiring
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Talent Acquisition Partner</h2>
          <p className="text-sm text-gray-500 mt-1">Contract · Remote · Worldwide</p>
        </div>

        {/* Opening hook */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <p className="text-sm text-amber-900 leading-relaxed">
            <span className="mr-1">🚨</span>
            <strong>The in-house TA market has been decimated.</strong> AI. Hiring freezes. Entire TA teams
            wiped out overnight. If you've been made redundant or you're watching your team shrink, you're
            not alone — and it's not your fault. Your skills didn't disappear with your job.
          </p>
        </div>

        {/* About Vetted TA */}
        <section>
          <SectionTitle>About Vetted TA</SectionTitle>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>Vetted TA is a retained recruitment marketplace connecting independent recruiters with companies that need hiring help.</p>
            <p>Not Upwork. Not Fiverr. A properly vetted platform where experienced recruiters load their profile, specialisms, and track record — and get matched with exclusive retained briefs.</p>
            <p>Every recruiter is personally vetted before going live. Every role is exclusive. Every payment is protected by milestones.</p>
          </div>
        </section>

        {/* The Role */}
        <section>
          <SectionTitle>The Role</SectionTitle>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
            <p>We're looking for experienced in-house TA professionals who are ready to work independently. You'll take on exclusive retained briefs from hiring companies who need senior recruitment expertise but can't justify a full-time hire.</p>
            <p>You manage the process end to end — sourcing, screening, managing hiring managers — exactly what you've always done. Just without the politics.</p>
          </div>
          <div className="mt-5 bg-slate-900 rounded-xl px-6 py-4 text-center">
            <p className="text-sm font-bold text-white tracking-wide leading-snug">
              ZERO BUSINESS DEVELOPMENT.{' '}
              THIS IS NOT A RECRUITMENT AGENCY.{' '}
              IT IS A MARKETPLACE — WHERE WORK FINDS YOU.
            </p>
          </div>
        </section>

        {/* What You'll Do */}
        <section>
          <SectionTitle>What You'll Do</SectionTitle>
          <ul className="space-y-3">
            {[
              'Manage end-to-end recruitment on exclusive retained briefs',
              'Deliver an agreed shortlist of quality candidates to the hiring company',
              'Manage the interview process and candidate experience',
              'See the placement through to offer accepted and signed',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Compensation */}
        <section>
          <SectionTitle>Compensation</SectionTitle>
          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <p>This is where it gets interesting.</p>
            <p>
              Fees on Vetted TA are capped at 6–10% — fair for clients, and life-changing for you compared
              to what you were earning in-house or what you'd take home at an agency.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 space-y-1.5">
              <p className="text-sm font-semibold text-blue-800">Here's the maths:</p>
              <p className="text-sm text-blue-900">
                Fill an €80k role at 10% → €8,000 fee → you take home <strong>€6,800</strong> after the platform fee.
              </p>
              <p className="text-xs text-blue-600 italic">
                When were you last paid €6,800 for a single placement as an in-house TA?
              </p>
            </div>

            <p>Payment is released in milestones and protected by escrow, so your time is always covered:</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { pct: '20%', label: 'Milestone 1', desc: 'Your agreed CVs are delivered and approved' },
                { pct: '30%', label: 'Milestone 2', desc: 'First round interviews are confirmed' },
                { pct: '50%', label: 'Milestone 3', desc: 'The offer is accepted' },
              ].map((m, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center">
                  <span className="text-3xl font-extrabold text-primary-600">{m.pct}</span>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{m.label}</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {[
                'No invoice chasing',
                'No contingency risk',
                'No competing against other recruiters on the same role',
              ].map((point, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {point}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Markets eligibility */}
        <section>
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Please Note</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Currently we are only able to accept recruiters who have proven history placing candidates in
              the following markets:{' '}
              <strong>Ireland, UK, USA, Canada, Australia, Netherlands, Germany, France, Switzerland, Belgium, Nordics</strong>{' '}
              or <strong>UAE</strong>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">Founding cohort open now</h3>
          <p className="text-slate-400 text-sm mb-6">Apply in minutes. Get approved within 48 hours. Start taking briefs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/recruiter/signup" className="btn-primary text-sm px-6 py-2.5">Apply as a Recruiter</Link>
            <Link to="/how-it-works" className="btn-secondary text-sm px-6 py-2.5 bg-white/10 text-white border-white/20 hover:bg-white/20">How It Works</Link>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  )
}
