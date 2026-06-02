import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-white tracking-tight">
            Talent<span className="text-primary-400">Desk</span>
          </span>
          <div className="flex items-center gap-4">
            <Link to="/how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">How it works</Link>
            <Link to="/login" className="btn-secondary text-sm">Sign in</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-500/20 text-blue-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-blue-500/30">
            Now accepting recruiter applications
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            The marketplace for talented recruiters seeking fractional work
          </h1>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Pick up ad hoc recruitment roles on your own terms. Paid at every stage. Exclusive roles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/recruiter/signup"
              className="btn-primary text-base px-8 py-3 shadow-lg"
            >
              I'm a Recruiter — Join Free
            </Link>
            <Link
              to="/hiring-manager/signup"
              className="inline-flex items-center justify-center px-8 py-3 rounded-md text-base font-medium
                         bg-white/10 text-white border border-white/25 hover:bg-white/20 transition-colors"
            >
              Browse Recruiters
            </Link>
          </div>
        </div>
      </section>

      {/* Value prop cards */}
      <section className="py-20 px-6 bg-gray-50 flex-1">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Built for both sides of the recruitment market
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recruiter card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">For Independent Recruiters</h3>
              <p className="text-sm text-gray-500 mb-5">Grow your income without the agency overhead</p>
              <ul className="space-y-3 text-sm text-gray-600 flex-1">
                {[
                  'Access exclusive roles from verified companies',
                  'Get paid at every milestone — not just on placement',
                  'Work on your own terms — take as much or as little as you want',
                  'Build your reputation with verified reviews and a public profile',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-primary-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/recruiter/signup" className="btn-primary w-full text-center block">
                  Create Recruiter Profile
                </Link>
              </div>
            </div>

            {/* Hiring manager card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">For Hiring Companies</h3>
              <p className="text-sm text-gray-500 mb-5">Find specialist recruiters without agency markups</p>
              <ul className="space-y-3 text-sm text-gray-600 flex-1">
                {[
                  'Access a curated network of specialist recruiters',
                  'Pay only when milestones are reached — no upfront fees',
                  'Post roles anonymously to keep hiring confidential',
                  'Agreed fee percentage upfront — no surprises',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-blue-600 font-bold mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/hiring-manager/signup"
                  className="inline-flex items-center justify-center w-full px-4 py-2 rounded-md
                             text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Find Recruiters
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} TalentDesk. All rights reserved.</p>
      </footer>
    </div>
  )
}
