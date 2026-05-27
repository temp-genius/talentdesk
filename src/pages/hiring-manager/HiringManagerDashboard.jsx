import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function HiringManagerDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('hiring_company_profiles')
      .select('company_name, industry, country, trust_tier')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoadingProfile(false)
      })
  }, [user])

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
                Welcome{profile?.company_name ? `, ${profile.company_name}` : ''}
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Company card */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Company Profile
                </h2>
                {profile ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Company</dt>
                      <dd className="text-gray-900 font-medium">{profile.company_name}</dd>
                    </div>
                    {profile.industry && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Industry</dt>
                        <dd className="text-gray-900 font-medium">{profile.industry}</dd>
                      </div>
                    )}
                    {profile.country && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Country</dt>
                        <dd className="text-gray-900 font-medium">{profile.country}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-sm text-gray-500">Company profile not found.</p>
                )}
              </div>

              {/* Quick actions card */}
              <div className="card">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </h2>
                <p className="text-sm text-gray-500">
                  Post a job, browse recruiters, and manage your active roles — coming soon.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
