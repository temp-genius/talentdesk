import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import SpecialismSelector from '../../components/recruiter/SpecialismSelector'

const MARKETS  = ['Ireland', 'UK', 'USA', 'Canada', 'Australia']
const BIO_MAX  = 600
const CLIENT_TYPES = [
  { value: 'startup',      label: 'Startups' },
  { value: 'scaleup',      label: 'Scale-ups' },
  { value: 'enterprise',   label: 'Enterprise' },
  { value: 'sme',          label: 'SME' },
  { value: 'public_sector',label: 'Public Sector' },
]

const CAREER_DNA_OPTIONS = [
  { value: 'agency',  label: 'Agency Recruiter',        desc: 'You come from agency recruitment. You know how to headhunt, manage pipelines at volume, and work across multiple clients.' },
  { value: 'inhouse', label: 'In-House TA',             desc: 'You come from internal talent acquisition. You understand company culture, stakeholder management, and employer branding.' },
  { value: 'hybrid',  label: 'Both — Agency and In-House', desc: 'You have significant experience in both agency recruitment and in-house talent acquisition.' },
]

const TOOLS = [
  'LinkedIn Basic',
  'LinkedIn Recruiter Lite',
  'LinkedIn Recruiter',
  'Indeed CV Database',
  'IrishJobs CV Database',
  'Jobs.ie',
  'Glassdoor',
  'Reed',
  'Totaljobs',
  'Monster',
  'CV Library',
  'Direct Sourcing and Boolean Search',
  'Referral Networks',
]

const CAPACITY_OPTIONS = [
  { value: 'open_to_new',  label: 'Open to new roles',    color: 'green' },
  { value: 'nearly_full',  label: 'Nearly at capacity',   color: 'amber' },
  { value: 'full',         label: 'At full capacity',     color: 'red'   },
]

const EMPTY_FORM = {
  firstName: '', lastName: '', bio: '', headline: '',
  linkedinUrl: '', yearsExperience: '',
  preferredFeePercentage: [], availabilityStatus: 'available',
  samplePlacements: '',
  careerDna: '', capacityStatus: 'open_to_new',
  previousEmployers: '', previousClientTypes: [],
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

function CardSelector({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? '' : opt.value)}
          className={`rounded-lg border-2 p-3 text-left transition-all ${
            value === opt.value
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <p className={`text-sm font-semibold ${value === opt.value ? 'text-primary-700' : 'text-gray-900'}`}>
            {opt.label}
          </p>
          {opt.desc && (
            <p className="text-xs text-gray-500 mt-1 leading-snug">{opt.desc}</p>
          )}
        </button>
      ))}
    </div>
  )
}

function CapacitySelector({ value, onChange }) {
  const colorMap = { green: 'border-green-500 bg-green-50', amber: 'border-amber-500 bg-amber-50', red: 'border-red-500 bg-red-50' }
  const textMap  = { green: 'text-green-700', amber: 'text-amber-700', red: 'text-red-700' }
  return (
    <div className="grid grid-cols-3 gap-3">
      {CAPACITY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-lg border-2 p-3 text-left transition-all ${
            value === opt.value ? colorMap[opt.color] : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <p className={`text-sm font-semibold ${value === opt.value ? textMap[opt.color] : 'text-gray-900'}`}>
            {opt.label}
          </p>
        </button>
      ))}
    </div>
  )
}

export default function EditProfile() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [profileId,      setProfileId]     = useState(null)
  const [form,           setForm]          = useState(EMPTY_FORM)
  const [specialisms,    setSpecialisms]   = useState([])
  const [markets,        setMarkets]       = useState([])
  const [allCategories,  setAllCategories] = useState([])
  const [photoUrl,       setPhotoUrl]      = useState(null)
  const [photoUploading, setPhotoUploading]= useState(false)
  const [selectedTools,  setSelectedTools] = useState([])

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
          .select(`id, first_name, last_name, bio, headline, linkedin_url, years_experience,
                   preferred_fee_percentage, availability_status, sample_placements,
                   profile_photo_url, career_dna, capacity_status,
                   previous_employers, previous_client_types`)
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
      setPhotoUrl(p.profile_photo_url ?? null)
      setForm({
        firstName:              p.first_name ?? '',
        lastName:               p.last_name ?? '',
        bio:                    p.bio ?? '',
        headline:               p.headline ?? '',
        linkedinUrl:            p.linkedin_url ?? '',
        yearsExperience:        p.years_experience?.toString() ?? '',
        preferredFeePercentage: p.preferred_fee_percentage
          ? p.preferred_fee_percentage.toString().split(',').map(s => s.trim()).filter(Boolean)
          : [],
        availabilityStatus:     p.availability_status ?? 'available',
        samplePlacements:       p.sample_placements ?? '',
        careerDna:              p.career_dna ?? '',
        capacityStatus:         p.capacity_status ?? 'open_to_new',
        previousEmployers:      p.previous_employers ?? '',
        previousClientTypes:    p.previous_client_types ?? [],
      })
      if (catsRes.data) setAllCategories(catsRes.data)

      const [specsRes, locsRes, toolsRes] = await Promise.all([
        supabase.from('recruiter_specialisms').select('specialism_category_id').eq('recruiter_profile_id', p.id),
        supabase.from('recruiter_locations').select('country').eq('recruiter_profile_id', p.id),
        supabase.from('recruiter_tools').select('tool_name').eq('recruiter_profile_id', p.id),
      ])
      setSpecialisms(specsRes.data?.map(s => s.specialism_category_id) ?? [])
      setMarkets(locsRes.data?.map(l => l.country) ?? [])
      setSelectedTools(toolsRes.data?.map(t => t.tool_name) ?? [])
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

  function toggleTool(tool) {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  function toggleClientType(value) {
    setForm(prev => ({
      ...prev,
      previousClientTypes: prev.previousClientTypes.includes(value)
        ? prev.previousClientTypes.filter(v => v !== value)
        : [...prev.previousClientTypes, value],
    }))
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setPhotoUploading(true)
    setError('')

    const ext  = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('profile-photos')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadErr) { setError(uploadErr.message); setPhotoUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(path)

    await supabase
      .from('recruiter_profiles')
      .update({ profile_photo_url: publicUrl })
      .eq('id', profileId)

    setPhotoUrl(`${publicUrl}?t=${Date.now()}`)
    setPhotoUploading(false)
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
        preferred_fee_percentage: form.preferredFeePercentage.length > 0
          ? [...form.preferredFeePercentage].sort().join(',') : null,
        availability_status:      form.availabilityStatus,
        sample_placements:        form.samplePlacements.trim() || null,
        career_dna:               form.careerDna || null,
        capacity_status:          form.capacityStatus,
        previous_employers:       form.previousEmployers.trim() || null,
        previous_client_types:    form.previousClientTypes.length > 0 ? form.previousClientTypes : null,
      })
      .eq('id', profileId)

    if (updateErr) { setError(updateErr.message); setSaving(false); return }

    await supabase.from('recruiter_specialisms').delete().eq('recruiter_profile_id', profileId)
    if (specialisms.length > 0) {
      await supabase.from('recruiter_specialisms').insert(
        specialisms.map(id => ({ recruiter_profile_id: profileId, specialism_category_id: id }))
      )
    }

    await supabase.from('recruiter_locations').delete().eq('recruiter_profile_id', profileId)
    if (markets.length > 0) {
      await supabase.from('recruiter_locations').insert(
        markets.map(country => ({ recruiter_profile_id: profileId, country }))
      )
    }

    await supabase.from('recruiter_tools').delete().eq('recruiter_profile_id', profileId)
    if (selectedTools.length > 0) {
      await supabase.from('recruiter_tools').insert(
        selectedTools.map(tool_name => ({ recruiter_profile_id: profileId, tool_name, verified: false }))
      )
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const score    = useMemo(() => calcScore(form, specialisms, markets), [form, specialisms, markets])
  const initials = [form.firstName, form.lastName].filter(Boolean).map(n => n[0].toUpperCase()).join('') || '?'
  const showClientTypes = form.careerDna === 'agency' || form.careerDna === 'hybrid'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
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
        <CompletenessBar score={score} />

        {/* Profile Photo */}
        <SectionCard title="Profile Photo">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {photoUrl
                ? <img src={photoUrl} alt={initials} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={photoUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUploading ? 'Uploading…' : photoUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, recommended 400×400px</p>
            </div>
          </div>
        </SectionCard>

        {/* Career DNA */}
        <SectionCard title="Career DNA">
          <InfoBox>
            Your background tells hiring managers how you work. Agency recruiters bring broad market reach and pipeline volume. In-house TA professionals bring deep culture and stakeholder expertise. Select both if you have significant experience in each.
          </InfoBox>
          <CardSelector
            options={CAREER_DNA_OPTIONS}
            value={form.careerDna}
            onChange={v => setField('careerDna', v)}
          />
        </SectionCard>

        {/* Capacity Status */}
        <SectionCard title="Current Capacity">
          <p className="text-sm text-gray-500 mb-3">Let hiring managers know how much bandwidth you currently have.</p>
          <CapacitySelector value={form.capacityStatus} onChange={v => setField('capacityStatus', v)} />
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
                <input type="text" className="input" value={form.firstName} onChange={e => setField('firstName', e.target.value)} placeholder="Jane" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                <input type="text" className="input" value={form.lastName} onChange={e => setField('lastName', e.target.value)} placeholder="Smith" />
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
              <input type="url" className="input" value={form.linkedinUrl} onChange={e => setField('linkedinUrl', e.target.value)} placeholder="https://www.linkedin.com/in/yourname" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years experience</label>
                <input type="number" min="0" max="50" className="input" value={form.yearsExperience} onChange={e => setField('yearsExperience', e.target.value)} placeholder="e.g. 5" />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Standard rate</label>
              <div className="flex gap-5">
                {['6', '8', '10'].map(fee => (
                  <label key={fee} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.preferredFeePercentage.includes(fee)}
                      onChange={() => setForm(prev => ({
                        ...prev,
                        preferredFeePercentage: prev.preferredFeePercentage.includes(fee)
                          ? prev.preferredFeePercentage.filter(v => v !== fee)
                          : [...prev.preferredFeePercentage, fee],
                      }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    {fee}%
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Select all rates you work at — actual fee agreed on engagement.</p>
            </div>
          </div>
        </SectionCard>

        {/* Previous Employers */}
        <SectionCard title="Previous Employers">
          <InfoBox>
            List the companies you have worked at as a recruiter. This builds trust with hiring managers who recognise reputable agencies or companies you have trained at.
          </InfoBox>
          <input
            type="text"
            className="input"
            value={form.previousEmployers}
            onChange={e => setField('previousEmployers', e.target.value)}
            placeholder="e.g. Hays, Michael Page, Stripe, Intercom"
            maxLength={300}
          />

          {showClientTypes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client types you have placed for
              </label>
              <div className="flex flex-wrap gap-2">
                {CLIENT_TYPES.map(ct => (
                  <label key={ct.value} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.previousClientTypes.includes(ct.value)}
                      onChange={() => toggleClientType(ct.value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                    />
                    {ct.label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Specialisms */}
        <SectionCard title="Specialisms">
          {allCategories.length > 0 ? (
            <SpecialismSelector categories={allCategories} selected={specialisms} onChange={setSpecialisms} />
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

        {/* Tools and Sourcing Resources */}
        <SectionCard title="Tools and Sourcing Resources">
          <p className="text-sm text-gray-500 mb-4">
            List the sourcing tools and databases you actively use. This helps hiring managers understand your sourcing capability.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TOOLS.map(tool => (
              <label key={tool} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={selectedTools.includes(tool)}
                  onChange={() => toggleTool(tool)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                {tool}
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
