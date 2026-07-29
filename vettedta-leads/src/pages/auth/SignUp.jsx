import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/layout/Logo'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const { data, error } = await signUp({ email, password, fullName, company })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      navigate('/dashboard', { replace: true })
    } else {
      setMessage('Check your inbox to confirm your email address, then sign in.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-8">
          <h1 className="mb-1 text-xl font-bold text-navy-900">Create your account</h1>
          <p className="mb-6 text-sm text-navy-500">
            Start monitoring hiring signals in minutes.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                Full name
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                Company
              </label>
              <input
                type="text"
                className="input-field"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Your recruitment agency"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                Email
              </label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-accent-600 hover:text-accent-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
