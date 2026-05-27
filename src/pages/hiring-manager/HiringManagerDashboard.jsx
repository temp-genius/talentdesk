import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function HiringManagerDashboard() {
  const { user, logout } = useAuth()
  const [profile, setProfile]       = useState(null)
  const [loadingProfile, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('hiring_company_profiles')
      .select('company_name, industry, country, trust_tier')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setLoading(false)
      })
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </span>
          <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loadingProfile ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{profile?.company_name ? `, ${profile.company_name}` : ''}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">{user?.email}</p>
            </div>

            {/* Browse CTA banner */}
            <div className="bg-gradient-to-r from-primary-600 to-blue-700 rounded-xl p-6 mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Find your next specialist recruiter</h2>
                <p className="text-primary-100 text-sm mt-0.5">
                  Browse our curated network of vetted independent recruiters
                </p>
              </div>
              <Link
                to="/browse-recruiters"
                className="flex-shrink-0 bg-white text-primary-700 font-semibold text-sm px-5 py-2.5
                           rounded-lg hover:bg-primary-50 transition-colors shadow-sm"
              >
                Browse Recruiters →
              </Link>
            </div>

            {/* Dashboard grid */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* Company profile */}
              <div className="card">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Company Profile
                </h3>
                {profile ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Company</dt>
                      <dd className="font-medium text-gray-900">{profile.company_name}</dd>
                    </div>
                    {profile.industry && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Industry</dt>
                        <dd className="font-medium text-gray-900">{profile.industry}</dd>
                      </div>
                    )}
                    {profile.country && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Country</dt>
                        <dd className="font-medium text-gray-900">{profile.country}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Trust tier</dt>
                      <dd className="font-medium text-gray-900 capitalize">{profile.trust_tier ?? 'New'}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-400">Company profile not found.</p>
                )}
              </div>

              {/* My Active Jobs */}
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    My Active Jobs
                  </h3>
                  <button className="btn-primary text-xs px-3 py-1.5" disabled>
                    Post a Role
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">No active jobs yet</p>
                  <p className="text-xs text-gray-400 mt-1">Post your first role to start receiving CV submissions</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card lg:col-span-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                  Recent Activity
                </h3>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Messages, CV submissions, and role updates will appear here</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
