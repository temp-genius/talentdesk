import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import SpecialismSelector from '../../components/recruiter/SpecialismSelector'

const MARKETS  = ['Ireland', 'UK', 'USA', 'Canada', 'Australia']
const BIO_MAX  = 600
const EMPTY_FORM = {
  firstName: '', lastName: '', bio: '', headline: '',
  linkedinUrl: '', yearsExperience: '',
  preferredFeePercentage: '', availabilityStatus: 'available',
  samplePlacements: '',
}

function calcScore(form, specialisms, markets) {
  let n = 0
  if ((form.bio ?? '').length > 100)           n++
  if ((form.linkedinUrl ?? '').trim())         n++
  if ((form.headline ?? '').trim())            n++
  if (specialisms.length >= 3)                 n++
  if (markets.length >= 1)                     n++
  if ((form.samplePlacements ?? '').trim())    n++
  return n
}

function CompletenessBar({ score }) {
  const pct = Math.round((score / 6) * 100)
  const { bar, text, msg } = pct < 50
    ? { bar: 'bg-red-500',   text: 'text-red-700',   msg: 'Your profile needs work. Hiring managers cannot find you yet.' }
    : pct < 80
    ? { bar: 'bg-amber-500', text: 'text-amber-700', msg: 'Good start. Add more detail to improve your search ranking.' }
    : { bar: 'bg-green-500', text: 'text-green-700', msg: 'Strong profile. You are well positioned to be found by hiring managers.' }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Profile Completeness</h2>
        <span className="text-sm font-bold text-gray-900">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div className={`${bar} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <p className={`text-sm font-medium ${text}`}>{msg}</p>
      <p className="text-xs text-gray-400 mt-1">
        {score} of 6 — bio over 100 chars, LinkedIn URL, headline, 3+ specialisms, market, sample placements
      </p>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div className="card mb-6">
      <h2 className="text-base font-semibold text-gray-900 mb-5">{title}</h2>
      {children}
    </div>
  )
}

function InfoBox({ children }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-blue-800 leading-relaxed">{children}</p>
    </div>
  )
}

export default function EditProfile() {
  const { user } = useAuth()

  const [profileId, setProfileId] = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [specialisms, setSpecialisms] = useState([])
  const [markets,     setMarkets]     = useState([])
  const [allCategories, setAllCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!user) return
    async function load() {
      const [profileRes, catsRes] = await Promise.all([
        supabase
          .from('recruiter_profiles')
          .select('id, first_name, last_name, bio, headline, linkedin_url, years_experience, preferred_fee_percentage, availability_status, sample_placements')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('specialism_categories')
          .select('id, sector, specialism_name')
          .order('display_order'),
      ])

      const p = profileRes.data
      if (!p) { setLoading(false); return }

      setProfileId(p.id)
      setForm({
        firstName:            p.first_name ?? '',
        lastName:             p.last_name ?? '',
        bio:                  p.bio ?? '',
        headline:             p.headline ?? '',
        linkedinUrl:          p.linkedin_url ?? '',
        yearsExperience:      p.years_experience?.toString() ?? '',
        preferredFeePercentage: p.preferred_fee_percentage?.toString() ?? '',
        availabilityStatus:   p.availability_status ?? 'available',
        samplePlacements:     p.sample_placements ?? '',
      })
      if (catsRes.data) setAllCategories(catsRes.data)

      const [specsRes, locsRes] = await Promise.all([
        supabase.from('recruiter_specialisms').select('specialism_category_id').eq('recruiter_profile_id', p.id),
        supabase.from('recruiter_locations').select('country').eq('recruiter_profile_id', p.id),
      ])
      setSpecialisms(specsRes.data?.map(s => s.specialism_category_id) ?? [])
      setMarkets(locsRes.data?.map(l => l.country) ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleMarket(country) {
    setMarkets(prev =>
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    )
  }

  async function handleSave() {
    if (!profileId) return
    setSaving(true)
    setError('')
    setSaved(false)

    const { error: updateErr } = await supabase
      .from('recruiter_profiles')
      .update({
        first_name:               form.firstName.trim() || null,
        last_name:                form.lastName.trim() || null,
        bio:                      form.bio.trim() || null,
        headline:                 form.headline.trim() || null,
        linkedin_url:             form.linkedinUrl.trim() || null,
        years_experience:         form.yearsExperience ? parseInt(form.yearsExperience, 10) : null,
        preferred_fee_percentage: form.preferredFeePercentage ? parseFloat(form.preferredFeePercentage) : null,
        availability_status:      form.availabilityStatus,
        sample_placements:        form.samplePlacements.trim() || null,
      })
      .eq('id', profileId)

    if (updateErr) { setError(updateErr.message); setSaving(false); return }

    // Sync specialisms
    await supabase.from('recruiter_specialisms').delete().eq('recruiter_profile_id', profileId)
    if (specialisms.length > 0) {
      await supabase.from('recruiter_specialisms').insert(
        specialisms.map(id => ({ recruiter_profile_id: profileId, specialism_category_id: id }))
      )
    }

    // Sync markets
    await supabase.from('recruiter_locations').delete().eq('recruiter_profile_id', profileId)
    if (markets.length > 0) {
      await supabase.from('recruiter_locations').insert(
        markets.map(country => ({ recruiter_profile_id: profileId, country }))
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const score    = useMemo(() => calcScore(form, specialisms, markets), [form, specialisms, markets])
  const initials = [form.firstName, form.lastName].filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/recruiter/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
              ← Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-900">Edit Profile</span>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-green-600 font-medium">Saved!</span>}
            {error && <span className="text-xs text-red-600 max-w-xs truncate">{error}</span>}
            <button onClick={handleSave} disabled={saving || !profileId} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Completeness bar */}
        <CompletenessBar score={score} />

        {/* Profile photo */}
        <SectionCard title="Profile Photo">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => alert('Photo upload is coming in a future update.')}
              >
                Upload Photo
              </button>
              <p className="text-xs text-gray-400 mt-1.5">Photo upload coming soon</p>
            </div>
          </div>
        </SectionCard>

        {/* Bio */}
        <SectionCard title="Bio">
          <InfoBox>
            Your bio is your most important search tool. Hiring managers search by keywords so be specific. Include the exact role types you place, the technologies or sectors you specialise in, the seniority levels you recruit for, and the markets you cover.{' '}
            <span className="font-medium">Example:</span> Senior technology recruiter specialising in Java, Python and data engineering roles for Irish fintech and financial services companies. Permanent placements at mid to senior level across Dublin and remote-first organisations.
          </InfoBox>
          <div className="relative">
            <textarea
              className="input resize-none"
              rows={6}
              maxLength={BIO_MAX}
              value={form.bio}
              onChange={e => setField('bio', e.target.value)}
              placeholder="Write your bio here…"
            />
            <span className={`absolute bottom-2.5 right-3 text-xs ${form.bio.length > BIO_MAX * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
              {form.bio.length}/{BIO_MAX}
            </span>
          </div>
        </SectionCard>

        {/* Personal Details */}
        <SectionCard title="Personal Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                <input
                  type="text" className="input"
                  value={form.firstName}
                  onChange={e => setField('firstName', e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input
                  type="text" className="input"
                  value={form.lastName}
                  onChange={e => setField('lastName', e.target.value)}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline <span className="text-gray-400 font-normal">(one-line summary shown on your card)</span>
              </label>
              <input
                type="text" className="input"
                value={form.headline}
                onChange={e => setField('headline', e.target.value)}
                placeholder="e.g. Senior Java and Fintech Recruiter — Dublin and Remote"
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn profile URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url" className="input"
                value={form.linkedinUrl}
                onChange={e => setField('linkedinUrl', e.target.value)}
                placeholder="https://www.linkedin.com/in/yourname"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years experience</label>
                <input
                  type="number" min="0" max="50" className="input"
                  value={form.yearsExperience}
                  onChange={e => setField('yearsExperience', e.target.value)}
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred fee</label>
                <select className="input" value={form.preferredFeePercentage} onChange={e => setField('preferredFeePercentage', e.target.value)}>
                  <option value="">Select</option>
                  <option value="6">6%</option>
                  <option value="8">8%</option>
                  <option value="10">10%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select className="input" value={form.availabilityStatus} onChange={e => setField('availabilityStatus', e.target.value)}>
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Specialisms */}
        <SectionCard title="Specialisms">
          {allCategories.length > 0 ? (
            <SpecialismSelector
              categories={allCategories}
              selected={specialisms}
              onChange={setSpecialisms}
            />
          ) : (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
            </div>
          )}
        </SectionCard>

        {/* Markets */}
        <SectionCard title="Markets">
          <p className="text-sm text-gray-500 mb-3">Which markets do you recruit in?</p>
          <div className="grid grid-cols-2 gap-2">
            {MARKETS.map(country => (
              <label key={country} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={markets.includes(country)}
                  onChange={() => toggleMarket(country)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                {country}
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Sample Placements */}
        <SectionCard title="Sample Placements">
          <InfoBox>
            Describe your three best placements. Include the role title, the sector, the level, and why it was a strong placement. This appears on your public profile and helps hiring managers assess your track record.
          </InfoBox>
          <textarea
            className="input resize-none"
            rows={6}
            value={form.samplePlacements}
            onChange={e => setField('samplePlacements', e.target.value)}
            placeholder="Example: VP of Engineering for a Series B fintech startup in Dublin. The client had struggled to fill the role for 6 months. I placed a candidate with deep payments infrastructure experience within 3 weeks at €170k..."
          />
        </SectionCard>

        {/* Bottom save */}
        <div className="flex items-center justify-between pb-12">
          {saved && <span className="text-sm text-green-600 font-medium">Profile saved!</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
          {!saved && !error && <span />}
          <button onClick={handleSave} disabled={saving || !profileId} className="btn-primary">
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
