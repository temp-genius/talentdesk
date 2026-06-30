import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'
import Seo from '../../components/Seo'

/* ── Shared ── */
function StepCard({ number, icon, title, description }) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
          {number}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xl font-bold text-slate-900 mb-6">{children}</h2>
  )
}

function Accordion({ items }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
            <svg
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {open === i && (
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Recruiter content ── */
const RECRUITER_STEPS = [
  {
    icon: '📋',
    title: 'Apply and get approved',
    description: 'Submit your profile and our team manually reviews your experience. We verify your market background before approving you to receive roles.',
  },
  {
    icon: '💼',
    title: 'Browse open roles and submit proposals',
    description: 'Browse roles published to the marketplace, filtered by your sectors, specialisms, and niches. Submit a proposal for any role that fits — your fee (within your assigned range), sourcing strategy, tools, screening approach, track record, and delivery timeline. The hiring manager reviews all proposals and decides who to work with.',
  },
  {
    icon: '💳',
    title: 'Get accepted and get paid at every stage',
    description: 'If a hiring manager accepts your proposal, the role becomes active and payment is triggered at three milestones — so you earn as you deliver, not only at placement.',
  },
]

const RECRUITER_FAQS = [
  {
    q: 'How do I get found by hiring managers?',
    a: 'There are two ways work reaches you. The primary path is the marketplace: browse open roles and submit proposals — your profile and proposal together are what hiring managers evaluate when deciding who to work with. The second path is direct: hiring managers can also browse the recruiter directory and message you directly for roles where they already have someone in mind. For both paths, a complete profile matters — write a detailed bio covering the role types, sectors, and markets you have placed in, and select your specialisms carefully as hiring managers filter by these.',
  },
  {
    q: 'How does payment work?',
    a: 'Payments are held in escrow and released at three milestones — shortlist approval, interview confirmation, and offer acceptance. Vetted TA deducts a 30 percent platform fee from each release. The remainder transfers to your connected bank account within two business days.',
  },
  {
    q: 'Do I need to connect my bank account before starting work?',
    a: 'You can start work without connecting your bank but no payments can be released until you connect through Stripe. We recommend connecting during your first active role.',
  },
  {
    q: 'What is the Vetted TA email for?',
    a: 'When you win your first role we create a professional Vetted TA email address for you. Use this to send CVs to hiring managers. It keeps your communications professional and provides an audit trail.',
  },
  {
    q: 'Can I work multiple roles at once?',
    a: 'Yes. Your capacity status on your profile signals to hiring managers how many roles you can take. Set it honestly — taking on more than you can deliver damages your rating.',
  },
  {
    q: 'What happens if a role is cancelled?',
    a: 'If the hiring manager cancels you keep all milestone payments already released. If you withdraw you keep milestone payments already released but forfeit any future milestones on that role.',
  },
]

/* ── Hiring Manager content ── */
const HM_STEPS = [
  {
    icon: '🔍',
    title: 'Browse vetted recruiters',
    description: 'Every recruiter is manually approved. Browse by sector, specialism, and career background. Read reviews from other hiring managers before reaching out.',
  },
  {
    icon: '🤝',
    title: 'Post a role to the marketplace',
    description: 'Publish your role and qualified recruiters submit proposals — their fee, sourcing approach, and track record. Compare proposals side by side and shortlist the ones you like. If you already know which recruiter you want to work with, you can also message them directly and assign the role without going through the marketplace.',
  },
  {
    icon: '✅',
    title: 'Accept a proposal and the work begins',
    description: 'Once you accept a proposal, your card is charged the first milestone (20%) and the recruiter starts work. Approve the shortlist to trigger Stage 2, confirm interviews for Stage 3. You pay as real work is delivered.',
  },
]

const HM_FAQS = [
  {
    q: 'How is Vetted TA different from a recruitment agency?',
    a: 'Vetted TA connects you directly with independent specialist recruiters. You choose who you work with based on their track record and specialisms. Fees are typically 8 to 12 percent versus 15 to 20 percent at traditional agencies. You pay as work is delivered not as one lump sum on placement.',
  },
  {
    q: 'How do I know the recruiters are legitimate?',
    a: 'Every recruiter on Vetted TA is manually vetted. We review their LinkedIn profile, verify their market experience, and check their stated track record before approving their profile. Platform ratings and reviews from other hiring managers provide ongoing quality assurance.',
  },
  {
    q: 'Why do different recruiters show different fee ranges?',
    a: 'Every recruiter is assigned a fee range during approval based on their experience and track record — more experienced recruiters may have access to higher rates. When submitting a proposal, a recruiter proposes a specific fee within their assigned range, so you always know exactly what you are paying before you accept.',
  },
  {
    q: 'What if I am not happy with the shortlist?',
    a: "If a shortlist doesn't match the brief, contact us directly at hello@vettedta.com and we'll review the case individually and help resolve it.",
  },
  {
    q: 'Can I use the same recruiter again?',
    a: 'Yes. There is no restriction on re-engaging a recruiter you have worked with through Vetted TA. Subsequent engagements go through the platform to maintain the payment protection and audit trail for both sides.',
  },
  {
    q: 'What happens if the candidate does not start?',
    a: 'Vetted TA operates a no-rebate policy. The recruiter\'s obligation ends at offer acceptance and candidate confirmation. If a candidate subsequently pulls out this is outside the recruiter\'s control. We recommend this is factored into your hiring process.',
  },
  {
    q: 'Is my payment information secure?',
    a: 'All payments are processed through Stripe which is PCI DSS Level 1 compliant — the highest security standard. Vetted TA never stores your card details directly.',
  },
]

/* ── Fee tables ── */
function RecruiterFeeTable() {
  const rows = [
    { milestone: 'Milestone 1 — Shortlist approved',  pct: '20%', note: 'Released when HM approves CVs' },
    { milestone: 'Milestone 2 — Interviews confirmed', pct: '30%', note: 'Released when interviews booked' },
    { milestone: 'Milestone 3 — Offer accepted',       pct: '50%', note: 'Released on candidate acceptance' },
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Milestone</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">% of total fee</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{r.milestone}</td>
                <td className="px-4 py-3 text-center font-bold text-primary-600">{r.pct}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Platform fee:</span> Vetted TA deducts 30% from each milestone release.
          You receive 70% of each milestone payment, transferred to your bank within two business days.
        </p>
      </div>
    </div>
  )
}

function HMFeeTable() {
  const rows = [
    { milestone: 'Milestone 1',  trigger: 'When you start the search',        pct: '20%', timing: 'Charged immediately' },
    { milestone: 'Milestone 2',  trigger: 'When you approve the shortlist',   pct: '30%', timing: 'Charged automatically' },
    { milestone: 'Milestone 3',  trigger: 'When you confirm interviews',      pct: '50%', timing: 'Charged automatically' },
  ]
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Stage</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Trigger</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Amount</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Timing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{r.milestone}</td>
                <td className="px-4 py-3 text-gray-600">{r.trigger}</td>
                <td className="px-4 py-3 text-center font-bold text-primary-600">{r.pct}</td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.timing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Secure by default:</span> All funds are held securely by Stripe
          until each milestone is reached. You are never charged for work that hasn't been delivered.
        </p>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function HowItWorks() {
  const [tab, setTab] = useState('recruiter')
  const isRecruiter = tab === 'recruiter'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Seo
        title="How It Works | Vetted TA"
        description="A transparent retained recruitment marketplace. Learn how milestone payments, vetted recruiters, and exclusive briefs work for both sides."
        path="/how-it-works"
      />
      {/* Nav */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo dark />
          </Link>
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
            How Vetted TA Works
          </h1>
          <p className="text-lg text-blue-200 max-w-xl mx-auto">
            A transparent retained recruitment marketplace for both sides.
          </p>
        </div>
      </section>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 flex gap-0">
          {[
            { value: 'recruiter',      label: 'For Recruiters' },
            { value: 'hiring_manager', label: 'For Hiring Managers' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.value
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full space-y-14">

        {/* Section 1 — Steps */}
        <section>
          <SectionTitle>{isRecruiter ? 'How it works for recruiters' : 'How it works for hiring managers'}</SectionTitle>
          <div className="flex flex-col md:flex-row gap-4">
            {(isRecruiter ? RECRUITER_STEPS : HM_STEPS).map((step, i) => (
              <StepCard key={i} number={i + 1} {...step} />
            ))}
          </div>
        </section>

        {/* Section 2 — Fee model */}
        <section>
          <SectionTitle>The fee model explained</SectionTitle>
          {isRecruiter ? <RecruiterFeeTable /> : <HMFeeTable />}
        </section>

        {/* Section 3 — FAQ */}
        <section>
          <SectionTitle>Frequently asked questions</SectionTitle>
          <Accordion items={isRecruiter ? RECRUITER_FAQS : HM_FAQS} />
        </section>

        {/* CTA */}
        <section className="bg-slate-900 rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">
            {isRecruiter ? 'Ready to take on your first role?' : 'Ready to find your recruiter?'}
          </h3>
          <p className="text-slate-400 text-sm mb-6">
            {isRecruiter
              ? 'Apply in minutes. Get approved within 48 hours.'
              : 'Browse our vetted specialist recruiters right now.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isRecruiter ? (
              <>
                <Link to="/recruiter/signup" className="btn-primary text-sm px-6 py-2.5">Apply as a Recruiter</Link>
                <Link to="/login" className="btn-secondary text-sm px-6 py-2.5 bg-white/10 text-white border-white/20 hover:bg-white/20">Sign In</Link>
              </>
            ) : (
              <>
                <Link to="/browse-recruiters" className="btn-primary text-sm px-6 py-2.5">Browse Recruiters</Link>
                <Link to="/hiring-manager/signup" className="btn-secondary text-sm px-6 py-2.5 bg-white/10 text-white border-white/20 hover:bg-white/20">Create Account</Link>
              </>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
