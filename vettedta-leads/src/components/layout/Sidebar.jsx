import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from './Logo'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { to: '/companies', label: 'Companies', icon: CompaniesIcon },
  { to: '/signals', label: 'Signals feed', icon: SignalsIcon },
  { to: '/outreach', label: 'Outreach tracker', icon: OutreachIcon },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()

  const initials = (profile?.full_name || user?.email || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-navy-100 bg-white">
      <div className="flex h-16 items-center border-b border-navy-100 px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-navy-700 text-white'
                  : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-navy-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-navy-900">
              {profile?.full_name || 'Recruiter'}
            </p>
            <p className="truncate text-xs text-navy-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-navy-500 transition hover:bg-navy-50 hover:text-navy-900"
        >
          <SignOutIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

function DashboardIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6a2.25 2.25 0 012.25-2.25h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M9 20.25V9" />
    </svg>
  )
}
function CompaniesIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21V6.75A1.5 1.5 0 015.25 5.25h6A1.5 1.5 0 0112.75 6.75V21M15.75 21V10.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5V21M3 21h18M7.5 8.25h1.5m-1.5 3h1.5m-1.5 3h1.5" />
    </svg>
  )
}
function SignalsIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M12 12h.008v.008H12V12z" />
    </svg>
  )
}
function OutreachIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.007H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.007H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.007H3.75v-.007zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}
function SettingsIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.751.43.991l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.397-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.752-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function SignOutIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  )
}
