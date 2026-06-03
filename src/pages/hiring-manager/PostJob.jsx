import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Logo from '../../components/layout/Logo'

const SECTORS    = ['Technology', 'Finance', 'Legal', 'HR', 'Marketing', 'Operations', 'Logistics', 'Construction', 'Healthcare', 'Executive']
const COUNTRIES  = ['Ireland', 'UK', 'USA', 'Canada', 'Australia']
const CURRENCIES = [
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'USD', label: '$ USD' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
]
const SENIORITY = [
  { value: 'junior',    label: 'Junior'    },
  { value: 'mid',       label: 'Mid'       },
  { value: 'senior',    label: 'Senior'    },
  { value: 'director',  label: 'Director'  },
  { value: 'c_suite',   label: 'C-Suite'   },
]
const LOCATION_TYPES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
]

const INIT = {
  title: '', sector: '', location_country: '', location_city: '',
  location_type: 'hybrid', salary_min: '', salary_max: '',
  currency: 'EUR', seniority_level: '', description: '',
}

export default function PostJob() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [companyId, setCompanyId]     = useState(null)
  const [loadingCompany, setLoading]  = useState(true)
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState('')
  const [form, setForm]               = useState(INIT)

  useEffect(() => {
    if (!user) return
    supabase
      .from('hiring_company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error: e }) => {
        if (data) setCompanyId(data.id)
        else setError('Company profile not found. Please contact support.')
        setLoading(false)
      })
  }, [user])

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!companyId) return
    if (!form.title.trim()) { setError('Role title is required'); return }
    setSubmitting(true)
    setError('')

    const { data, error: err } = await supabase
      .from('jobs')
      .insert({
        hiring_company_id: companyId,
        title:             form.title.trim(),
        sector:            form.sector             || null,
        location_country:  form.location_country   || null,
        location_city:     form.location_city.trim() || null,
        location_type:     form.location_type       || null,
        salary_min:        form.salary_min   ? Number(form.salary_min)  : null,
        salary_max:        form.salary_max   ? Number(form.salary_max)  : null,
        currency:          form.currency,
        seniority_level:   form.seniority_level     || null,
        description:       form.description.trim()  || null,
        status:            'draft',
        anonymous:         true,
      })
      .select('id')
      .single()

    if (err || !data) {
      setError(err?.message ?? 'Failed to post job. Please try again.')
      setSubmitting(false)
      return
    }
    navigate(`/browse-recruiters?job=${data.id}`)
  }

  if (loadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/hiring-manager/dashboard">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/hiring-manager/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <button className="btn-secondary text-sm" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post a Role</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Describe the role you're hiring for and we'll match you with the right recruiters.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-700">
            This role will be posted <strong>anonymously</strong> — your company name is not shown to
            recruiters until a Start Job agreement has been signed by both parties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Role title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text" className="input"
              placeholder="e.g. Senior Software Engineer"
              value={form.title} onChange={set('title')} required
            />
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select className="input" value={form.sector} onChange={set('sector')}>
              <option value="">Select sector</option>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select className="input" value={form.location_country} onChange={set('location_country')}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" className="input" placeholder="e.g. Dublin"
                value={form.location_city} onChange={set('location_city')} />
            </div>
          </div>

          {/* Work type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
            <div className="flex gap-6">
              {LOCATION_TYPES.map(lt => (
                <label key={lt.value} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio" name="location_type" value={lt.value}
                    checked={form.location_type === lt.value}
                    onChange={set('location_type')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  {lt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Currency</label>
                <select className="input" value={form.currency} onChange={set('currency')}>
                  {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input type="number" className="input" placeholder="60000" min="0"
                  value={form.salary_min} onChange={set('salary_min')} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input type="number" className="input" placeholder="90000" min="0"
                  value={form.salary_max} onChange={set('salary_max')} />
              </div>
            </div>
          </div>

          {/* Seniority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
            <select className="input" value={form.seniority_level} onChange={set('seniority_level')}>
              <option value="">Select seniority</option>
              {SENIORITY.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brief Description
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({form.description.length}/500)
              </span>
            </label>
            <textarea
              className="input resize-none" rows={4} maxLength={500}
              placeholder="Key requirements, must-haves, and what you're looking for in a candidate…"
              value={form.description} onChange={set('description')}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full text-base py-3"
              disabled={submitting || !companyId}
            >
              {submitting ? 'Posting…' : 'Find Recruiters →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
