import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

export default function ResetPassword() {
  const navigate              = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch {
      setError('Something went wrong. Your reset link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <Link to="/"><Logo /></Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Choose a new password</h1>
          </div>

          <div className="card">
            {done ? (
              <p className="text-sm text-gray-600">
                Password updated. Redirecting you to sign in…
              </p>
            ) : (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}{' '}
                    {error.includes('expired') && (
                      <Link to="/forgot-password" className="underline font-medium">
                        Request a new one.
                      </Link>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                    <input
                      type="password"
                      className="input"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="New password"
                      autoComplete="new-password"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                    <input
                      type="password"
                      className="input"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
