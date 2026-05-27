import { useAuth } from '../../context/AuthContext'

export default function HiringManagerDashboard() {
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Hiring Manager Dashboard</h1>
          <button className="btn-secondary" onClick={logout}>Sign out</button>
        </div>
        <div className="card">
          <p className="text-gray-500">Welcome, {user?.email}. Dashboard coming soon.</p>
        </div>
      </div>
    </main>
  )
}
