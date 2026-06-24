import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Left — brand */}
          <div>
            <Logo dark />
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              The retained recruitment marketplace.
            </p>
          </div>

          {/* Centre — platform links */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/browse-recruiters" className="hover:text-white transition-colors">
                  Browse Recruiters
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="hover:text-white transition-colors">
                  Post a Role
                </Link>
              </li>
            </ul>
          </div>

          {/* Third column — company */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Right — legal + support */}
          <div>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Legal &amp; Support</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/recruiter-agreement" className="hover:text-white transition-colors">
                  Recruiter Agreement
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          &copy; 2026 Vetted TA. All rights reserved. Operated in Ireland.
        </div>
      </div>
    </footer>
  )
}
