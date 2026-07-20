import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const DASHBOARD_BY_TYPE = {
  recruiter:       '/recruiter/dashboard',
  hiring_manager:  '/hiring-manager/dashboard',
  admin:           '/admin/dashboard',
}

function friendlyError(message) {
  if (!message) return 'Something went wrong. Please try again.'
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }
  if (m.includes('user not found') || m.includes('no user found')) {
    return 'No account found with that email address.'
  }
  if (m.includes('too many requests')) {
    return 'Too many login attempts. Please wait a moment and try again.'
  }
  return message
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await login({ email, password })
      const userType = result?.resolvedUserType
      const destination = DASHBOARD_BY_TYPE[userType] ?? '/'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(friendlyError(err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/">
            <Logo />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Sign in to your account</h1>
        </div>

        <div className="card">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <div className="text-right mt-1.5">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            New recruiter?{' '}
            <Link to="/recruiter/signup" className="text-primary-600 hover:underline font-medium">
              Create a recruiter profile
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Looking to hire?{' '}
            <Link to="/hiring-manager/signup" className="text-primary-600 hover:underline font-medium">
              Sign up as a hiring company
            </Link>
          </p>
        </div>
      </div>
    </main>
    <Footer />
    </div>
  )
}
