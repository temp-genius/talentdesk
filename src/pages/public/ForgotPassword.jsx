import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      })
      if (err) throw err
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
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
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              {sent ? 'Check your email' : 'Reset your password'}
            </h1>
          </div>

          <div className="card">
            {sent ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
                </p>
                <p className="text-sm text-gray-500">
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => { setSent(false); setEmail(''); setError('') }}
                    className="text-primary-600 hover:underline font-medium bg-transparent border-none cursor-pointer p-0 text-sm"
                  >
                    try again
                  </button>
                  .
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-5">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input
                      type="email"
                      className="input"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to sign in
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
