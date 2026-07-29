import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, profile } = useAuth()

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-500">Your account and plan details.</p>
      </div>

      <div className="card max-w-xl space-y-4 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Full name
          </p>
          <p className="text-sm text-navy-900">{profile?.full_name || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Email
          </p>
          <p className="text-sm text-navy-900">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Company
          </p>
          <p className="text-sm text-navy-900">{profile?.company || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
            Plan
          </p>
          <span className="inline-block rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-700">
            {profile?.plan || 'beta'}
          </span>
        </div>
      </div>
    </DashboardLayout>
  )
}
