import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const STATUS_STYLES = {
  pending:  'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  suspended:'bg-gray-100 text-gray-700',
}

const STATUS_LABELS = {
  pending:  'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended:'Suspended',
}

export default function RecruiterDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('recruiter_profiles')
      .select('first_name, last_name, status, availability_status')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoadingProfile(false)
      })
  }, [user])

  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? ' ' + profile.last_name : ''}`
    : user?.email

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </span>
          <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loadingProfile ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Application status card */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Application Status
                </h2>
                {profile ? (
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_STYLES[profile.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[profile.status] ?? profile.status}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Profile not found</p>
                )}
                {profile?.status === 'pending' && (
                  <p className="text-sm text-gray-500 mt-3">
                    Your application is being reviewed. We'll notify you once it's been assessed, usually within 2–3 business days.
                  </p>
                )}
                {profile?.status === 'approved' && (
                  <p className="text-sm text-gray-500 mt-3">
                    Your profile is live. You can now be matched with exclusive roles.
                  </p>
                )}
              </div>

              {/* Profile card */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Your Profile
                </h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Name</dt>
                    <dd className="text-gray-900 font-medium">{displayName}</dd>
                  </div>
                  {profile?.availability_status && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Availability</dt>
                      <dd className="text-gray-900 font-medium capitalize">{profile.availability_status}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
