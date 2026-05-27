import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { validateHiringManagerEmail } from '../../utils/emailValidation'

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Legal', 'Consulting', 'Healthcare',
  'Manufacturing', 'Retail & E-commerce', 'Education', 'Media & Marketing',
  'Real Estate', 'Construction', 'Logistics', 'Other',
]

const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '501–1,000', '1,000+']

const COUNTRIES = [
  'Ireland', 'United Kingdom', 'United States', 'Canada', 'Australia',
  'Germany', 'France', 'Netherlands', 'Spain', 'Other',
]

const TOTAL_STEPS = 2

function StepIndicator({ current }) {
  return (
    <div className="flex items-center mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
            s < current  ? 'bg-primary-600 text-white' :
            s === current ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                            'bg-gray-200 text-gray-500'
          }`}>
            {s < current ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : s}
          </div>
          {s < TOTAL_STEPS && (
            <div className={`flex-1 h-0.5 mx-2 ${s < current ? 'bg-primary-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
      {message}
    </div>
  )
}

export default function HiringManagerSignup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    website: '',
    industry: '',
    companySize: '',
    country: '',
  })

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validateStep1() {
    if (!form.firstName.trim()) return 'First name is required'
    if (!form.lastName.trim()) return 'Last name is required'
    if (!form.email.trim()) return 'Email address is required'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address'
    if (!validateHiringManagerEmail(form.email)) {
      return 'Please use your company email address — personal email providers are not accepted. If you use Gmail for business (Google Workspace), please contact support.'
    }
    if (form.password.length < 8) return 'Password must be at least 8 characters'
    return null
  }

  function validateStep2() {
    if (!form.companyName.trim()) return 'Company name is required'
    if (!form.industry) return 'Please select an industry'
    if (!form.companySize) return 'Please select a company size'
    if (!form.country) return 'Please select a country'
    return null
  }

  function next() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError('')
    setStep(2)
  }

  function back() {
    setError('')
    setStep(1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }
    setError('')
    setSubmitting(true)
    try {
      const domain = form.email.split('@')[1] ?? null
      await signup({
        email: form.email,
        password: form.password,
        userType: 'hiring_manager',
        firstName: form.firstName,
        lastName: form.lastName,
        companyName: form.companyName,
        companyDomain: domain,
        website: form.website || null,
        industry: form.industry || null,
        companySize: form.companySize || null,
        country: form.country || null,
      })
      navigate('/hiring-manager/dashboard', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Find specialist recruiters</h1>
          <p className="text-sm text-gray-500 mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <StepIndicator current={step} />

        <div className="card">
          <ErrorBanner message={error} />

          {/* ── Step 1: Account details ── */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Your details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input
                      type="text"
                      className="input"
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="Alex"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <input
                      type="text"
                      className="input"
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="Murphy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company email address
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="alex@yourcompany.com"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Must be a company email — personal providers (Gmail, Outlook, etc.) are not accepted.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    className="input"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="btn-primary" onClick={next}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Company details ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Company details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                  <input
                    type="text"
                    className="input"
                    value={form.companyName}
                    onChange={e => set('companyName', e.target.value)}
                    placeholder="Acme Ltd"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company website{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    className="input"
                    value={form.industry}
                    onChange={e => set('industry', e.target.value)}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company size</label>
                  <select
                    className="input"
                    value={form.companySize}
                    onChange={e => set('companySize', e.target.value)}
                  >
                    <option value="">Select company size</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    className="input"
                    value={form.country}
                    onChange={e => set('country', e.target.value)}
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button type="button" className="btn-secondary" onClick={back}>Back</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </main>
  )
}
