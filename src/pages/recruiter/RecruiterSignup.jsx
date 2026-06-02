import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import SpecialismSelector from '../../components/recruiter/SpecialismSelector'
import Footer from '../../components/layout/Footer'

const MARKETS = ['Ireland', 'UK', 'USA', 'Canada', 'Australia']
const TOTAL_STEPS = 4

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

export default function RecruiterSignup() {
  const { signup } = useAuth()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [specialismCategories, setSpecialismCategories] = useState([])

  useEffect(() => {
    supabase
      .from('specialism_categories')
      .select('id, sector, specialism_name')
      .order('display_order')
      .then(({ data }) => { if (data) setSpecialismCategories(data) })
  }, [])

  const [agreedTerms,    setAgreedTerms]    = useState(false)
  const [agreedLinkedin, setAgreedLinkedin] = useState(false)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    yearsExperience: '',
    specialisms: [],
    markets: [],
    linkedinLicence: '',
    linkedinUrl: '',
    linkedinNetworkSizeTier: '',
    preferredFeePercentage: '',
    bio: '',
    availabilityStatus: 'available',
  })

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggle(field, value) {
    setForm(prev => {
      const arr = prev[field]
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  function validate() {
    if (step === 1) {
      if (!form.firstName.trim()) return 'First name is required'
      if (!form.lastName.trim()) return 'Last name is required'
      if (!form.email.trim()) return 'Email address is required'
      if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address'
      if (form.password.length < 8) return 'Password must be at least 8 characters'
    }
    if (step === 2) {
      if (!form.yearsExperience) return 'Years of experience is required'
      if (form.specialisms.length === 0) return 'Please select at least one specialism'
      if (form.markets.length === 0) return 'Please select at least one market'
    }
    if (step === 3) {
      if (!form.linkedinLicence) return 'Please indicate whether you have a LinkedIn Recruiter licence'
      if (!form.linkedinUrl.trim()) {
        return 'LinkedIn profile URL is required — we use this to verify your credentials before approving your application.'
      }
      const url = form.linkedinUrl.trim().toLowerCase()
      if (!url.includes('linkedin.com')) {
        return 'Please enter a valid LinkedIn URL (e.g. https://www.linkedin.com/in/yourname).'
      }
      if (!form.linkedinNetworkSizeTier) return 'Please select your LinkedIn network size'
      if (!form.preferredFeePercentage) return 'Please select your preferred fee percentage'
    }
    return null
  }

  function next() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  function back() {
    setError('')
    setStep(s => s - 1)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup({
        email: form.email,
        password: form.password,
        userType: 'recruiter',
        firstName: form.firstName,
        lastName: form.lastName,
        specialisms: form.specialisms,
        markets: form.markets,
        years_experience: form.yearsExperience ? parseInt(form.yearsExperience, 10) : null,
        linkedin_url: form.linkedinUrl || null,
        linkedin_network_size_tier: form.linkedinNetworkSizeTier || null,
        preferred_fee_percentage: form.preferredFeePercentage
          ? parseFloat(form.preferredFeePercentage) : null,
        availability_status: form.availabilityStatus,
        bio: form.bio || null,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
          <p className="text-gray-600 mb-6">
            Thanks, <strong>{form.firstName}</strong>! Your application is under review.
            We'll be in touch within 2–3 business days once we've checked your profile.
          </p>
          <Link to="/" className="btn-secondary w-full text-center block">Back to Home</Link>
        </div>
      </main>
      <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
    <main className="flex-1 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight">
            Talent<span className="text-primary-600">Desk</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Create your recruiter profile</h1>
          <p className="text-sm text-gray-500 mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <StepIndicator current={step} />

        <div className="card">
          <ErrorBanner message={error} />

          {/* ── Step 1: Basic info ── */}
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
                      placeholder="Jane"
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
                      placeholder="Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="jane@example.com"
                  />
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

          {/* ── Step 2: Specialisms & markets ── */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Your specialisms</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of recruitment experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="input"
                    value={form.yearsExperience}
                    onChange={e => set('yearsExperience', e.target.value)}
                    placeholder="e.g. 5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sectors and specialisms you recruit in
                  </label>
                  {specialismCategories.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
                    </div>
                  ) : (
                    <SpecialismSelector
                      categories={specialismCategories}
                      selected={form.specialisms}
                      onChange={v => set('specialisms', v)}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Markets you recruit in
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MARKETS.map(market => (
                      <label key={market} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.markets.includes(market)}
                          onChange={() => toggle('markets', market)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        {market}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-secondary" onClick={back}>Back</button>
                <button className="btn-primary" onClick={next}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 3: LinkedIn & fees ── */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">LinkedIn & fees</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do you have a LinkedIn Recruiter licence?
                  </label>
                  <div className="flex gap-6">
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no',  label: 'No' },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="linkedinLicence"
                          value={opt.value}
                          checked={form.linkedinLicence === opt.value}
                          onChange={() => set('linkedinLicence', opt.value)}
                          className="border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn profile URL *
                  </label>
                  <input
                    type="url"
                    className="input"
                    value={form.linkedinUrl}
                    onChange={e => set('linkedinUrl', e.target.value)}
                    placeholder="https://www.linkedin.com/in/yourname"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required — we use this to verify your credentials before approving your application.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn network size
                  </label>
                  <select
                    className="input"
                    value={form.linkedinNetworkSizeTier}
                    onChange={e => set('linkedinNetworkSizeTier', e.target.value)}
                  >
                    <option value="">Select network size</option>
                    <option value="small">Small — under 1,000</option>
                    <option value="medium">Medium — 1,000 to 5,000</option>
                    <option value="large">Large — 5,000 to 10,000</option>
                    <option value="xlarge">X-Large — over 10,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred fee percentage
                  </label>
                  <select
                    className="input"
                    value={form.preferredFeePercentage}
                    onChange={e => set('preferredFeePercentage', e.target.value)}
                  >
                    <option value="">Select fee %</option>
                    <option value="6">6%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="btn-secondary" onClick={back}>Back</button>
                <button className="btn-primary" onClick={next}>Continue</button>
              </div>
            </div>
          )}

          {/* ── Step 4: About & availability ── */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">About you</h2>

              {/* How payments work */}
              <div className="border-l-4 border-slate-800 bg-slate-50 rounded-r-lg px-5 py-4 mb-6">
                <p className="text-sm font-bold text-slate-900 mb-3">How you get paid on TalentDesk</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                    <span className="text-sm text-slate-700 leading-relaxed">
                      <strong>Send CVs by email, then log them on the platform.</strong> You send CVs to the hiring manager from your TalentDesk email as normal. Then return to the platform and log each candidate — name, current role, brief note. Logging candidates on the platform is what triggers your Stage 1 payment review. Without logging candidates on the system no payment can be released.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                    <span className="text-sm text-slate-700 leading-relaxed">
                      <strong>Confirm interviews through the platform.</strong> When interviews are scheduled log the confirmed dates on the platform. The hiring manager confirms interviews took place. This triggers your Stage 2 payment. Interviews that happen outside the system cannot trigger payment — they must be logged here.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                    <span className="text-sm text-slate-700 leading-relaxed">
                      <strong>Log the offer on the platform.</strong> When your candidate verbally accepts relay the offer details and log it on the platform. The candidate receives an automated acceptance email. When they click Accept your Stage 3 payment releases automatically.
                    </span>
                  </li>
                </ol>
                <p className="text-sm font-bold text-slate-900 mt-4">
                  All actions that trigger payments must be logged on the TalentDesk platform. Sending emails alone is not enough.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short bio{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    className="input resize-none"
                    rows={4}
                    value={form.bio}
                    onChange={e => set('bio', e.target.value)}
                    placeholder="Tell hiring companies about your background, specialisations, and what makes you great at recruiting…"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability status
                  </label>
                  <select
                    className="input"
                    value={form.availabilityStatus}
                    onChange={e => set('availabilityStatus', e.target.value)}
                  >
                    <option value="available">Available — actively taking on work</option>
                    <option value="limited">Limited — can take some roles</option>
                    <option value="unavailable">Unavailable — not taking work right now</option>
                  </select>
                </div>

                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={e => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                      I have read and agree to the{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/recruiter-agreement" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">Recruiter Agreement</a>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedLinkedin}
                      onChange={e => setAgreedLinkedin(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700">
                      I understand that TalentDesk will review my LinkedIn profile and application details before approving my account
                    </span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button type="button" className="btn-secondary" onClick={back}>Back</button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || !agreedTerms || !agreedLinkedin}
                >
                  {submitting ? 'Submitting…' : 'Submit Application'}
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
    <Footer />
    </div>
  )
}
