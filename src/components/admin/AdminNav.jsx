import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function AdminNav() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    supabase
      .from('recruiter_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => { if (count != null) setPendingCount(count) })
  }, [])

  const navLink = (to, label, badge) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap
          ${active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
      >
        {label}
        {badge > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1
                           bg-red-500 text-white text-xs font-bold rounded-full leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
            <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-sm">
              Admin
            </span>
          </span>
          <nav className="flex items-center gap-1">
            {navLink('/admin/dashboard', 'Dashboard', 0)}
            {navLink('/admin/vetting', 'Vetting Panel', pendingCount)}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
        </div>
      </div>
    </header>
  )
}
