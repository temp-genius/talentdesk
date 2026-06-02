import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = {
  recruiter:      'talentdesk_onboarded_recruiter',
  hiring_manager: 'talentdesk_onboarded_hiring_manager',
}

/* ── Recruiter slide content ── */
const RECRUITER_SLIDES = [
  {
    icon: '🤝',
    title: 'Welcome to TalentDesk',
    body: (
      <p className="text-gray-600 leading-relaxed">
        TalentDesk connects you with hiring companies looking for specialist independent recruiters.
        You work the role your way — your tools, your network, your pace. We handle the commercial side.
      </p>
    ),
  },
  {
    icon: '💰',
    title: 'How you get paid',
    body: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          Every role pays in three stages. You are paid for work done at every stage — not just on placement.
        </p>
        <div className="flex items-stretch gap-0 mt-4">
          {[
            { pct: '20%', label: 'Stage 1', sub: 'Shortlist approved',       color: 'bg-blue-500' },
            { pct: '30%', label: 'Stage 2', sub: 'Interviews confirmed',      color: 'bg-indigo-500' },
            { pct: '50%', label: 'Stage 3', sub: 'Offer accepted',            color: 'bg-violet-600' },
          ].map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 relative">
              {i < 2 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
              )}
              <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-sm z-10 flex-shrink-0`}>
                {s.pct}
              </div>
              <p className="text-xs font-semibold text-gray-700 text-center">{s.label}</p>
              <p className="text-xs text-gray-500 text-center leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: '✅',
    title: 'Your first steps',
    body: (
      <ul className="space-y-3">
        {[
          'Complete your profile with a detailed bio and specialisms so hiring managers can find you.',
          'Connect your bank account to receive milestone payments.',
          'Browse available roles or wait for hiring managers to contact you.',
          'Set your capacity status so hiring managers know your availability.',
        ].map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: '🚀',
    title: 'Ready to start',
    body: (
      <p className="text-gray-600 leading-relaxed">
        Your profile is under review. We will notify you within 48 hours once approved.
        While you wait, complete your profile to improve your search ranking. The more detail you add,
        the more discoverable you become to hiring managers searching for your specialisms.
      </p>
    ),
  },
]

/* ── Hiring manager slide content ── */
const HM_SLIDES = [
  {
    icon: '🔍',
    title: 'Welcome to TalentDesk',
    body: (
      <p className="text-gray-600 leading-relaxed">
        TalentDesk gives you access to vetted independent recruiters who specialise in your sector.
        Lower fees than traditional agencies. Paid in stages as work is delivered.
        One recruiter exclusively focused on your role.
      </p>
    ),
  },
  {
    icon: '📊',
    title: 'How the fee model works',
    body: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          You pay in three stages. Your card is saved securely and charged automatically at each stage.
        </p>
        <div className="flex items-stretch gap-0 mt-4">
          {[
            { pct: '20%', label: 'Stage 1', sub: 'Search starts',         color: 'bg-blue-500' },
            { pct: '30%', label: 'Stage 2', sub: 'Shortlist approved',     color: 'bg-indigo-500' },
            { pct: '50%', label: 'Stage 3', sub: 'Interviews confirmed',   color: 'bg-violet-600' },
          ].map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 relative">
              {i < 2 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
              )}
              <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center text-white font-bold text-sm z-10 flex-shrink-0`}>
                {s.pct}
              </div>
              <p className="text-xs font-semibold text-gray-700 text-center">{s.label}</p>
              <p className="text-xs text-gray-500 text-center leading-snug">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: '🔎',
    title: 'Finding your recruiter',
    body: (
      <p className="text-gray-600 leading-relaxed">
        Browse recruiters by sector, specialism, market, and career background. Read their track record
        and reviews. Message anyone directly. Arrange a call to discuss your role before committing to
        anything. No commitment until you click Start Job.
      </p>
    ),
  },
  {
    icon: '✔️',
    title: 'You are all set',
    body: (
      <div className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          Browse recruiters now or post a role and let matched recruiters come to you. Both paths lead
          to the same place — a specialist recruiter working exclusively on your role.
        </p>
        <div className="flex gap-3 pt-2">
          <Link to="/browse-recruiters" className="btn-primary flex-1 text-center text-sm">
            Browse Recruiters
          </Link>
          <Link to="/post-job" className="btn-secondary flex-1 text-center text-sm">
            Post a Role
          </Link>
        </div>
      </div>
    ),
    hideDefaultButton: true,
  },
]

const SLIDES_BY_TYPE = {
  recruiter:      RECRUITER_SLIDES,
  hiring_manager: HM_SLIDES,
}

export default function OnboardingModal({ userType }) {
  const key = STORAGE_KEY[userType]
  const [visible,  setVisible]  = useState(() => !localStorage.getItem(key))
  const [slide,    setSlide]    = useState(0)

  if (!visible) return null

  const slides   = SLIDES_BY_TYPE[userType] ?? []
  const total    = slides.length
  const current  = slides[slide]
  const isLast   = slide === total - 1

  function dismiss() {
    localStorage.setItem(key, '1')
    setVisible(false)
  }

  function next() {
    if (isLast) { dismiss(); return }
    setSlide(s => s + 1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white tracking-tight">
            Talent<span className="text-primary-400">Desk</span>
          </span>
          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 px-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide ? 'w-6 bg-primary-600' : i < slide ? 'w-3 bg-primary-300' : 'w-3 bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Slide content */}
        <div className="px-8 py-6">
          <div className="text-4xl mb-4 text-center">{current.icon}</div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 text-center">{current.title}</h2>
          <div className="text-sm">{current.body}</div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 flex items-center justify-between">
          <button
            onClick={dismiss}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
          {!current.hideDefaultButton && (
            <button onClick={next} className="btn-primary text-sm px-6">
              {isLast ? 'Get Started' : 'Next →'}
            </button>
          )}
          {current.hideDefaultButton && (
            <button onClick={dismiss} className="btn-secondary text-sm px-6">
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
