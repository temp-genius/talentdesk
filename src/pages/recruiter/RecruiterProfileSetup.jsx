import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const STEPS = [
  {
    title: 'Profile Review',
    desc: 'Our team reviews your experience, LinkedIn profile, and sector expertise to ensure quality on the platform.',
  },
  {
    title: 'Approval Notification',
    desc: "You'll receive an email once your profile has been approved — or if we need any additional information from you.",
  },
  {
    title: 'Start Receiving Role Enquiries',
    desc: 'Once approved, hiring companies can find your profile and send you exclusive, curated role opportunities.',
  },
]

export default function RecruiterProfileSetup() {
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </Link>
        </div>

        <div className="card">
          {/* Checkmark icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We will review your profile within 48 hours. You'll receive a notification at{' '}
              <span className="font-medium text-gray-700">{user?.email}</span> once your application has been assessed.
            </p>
          </div>

          {/* What happens next */}
          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              What happens next
            </h2>
            <ol className="space-y-5">
              {STEPS.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4">
          <button className="btn-secondary w-full" onClick={logout}>Sign out</button>
        </div>
      </div>
    </main>
  )
}
