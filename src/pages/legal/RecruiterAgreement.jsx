import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import Logo from '../../components/layout/Logo'

const SECTIONS = [
  {
    title: '1. Independent Contractor Status',
    body: 'By registering as a recruiter on Vetted TA you confirm that you are operating as an independent contractor and not as an employee of Vetted TA. You are responsible for your own tax obligations, insurance, and compliance with applicable employment laws in your jurisdiction.',
  },
  {
    title: '2. Market Representation',
    body: 'You confirm that you have genuine hands-on recruitment experience in the markets you have listed on your profile. You confirm that you have established candidate and client networks in those markets. Providing false or misleading information about your experience or market knowledge is grounds for immediate account removal without refund of any pending payments.',
  },
  {
    title: '3. Data Controller Obligations',
    body: 'You are the data controller for all candidate personal data you collect and process in connection with roles worked through Vetted TA. You confirm that you have a lawful basis for processing candidate data, that you will respond to candidate data subject requests within 30 days, and that you will handle candidate data in compliance with GDPR and applicable data protection law. Vetted TA is a data processor only for candidate profile information you log on the platform.',
  },
  {
    title: '4. Professional Conduct',
    body: 'You agree to conduct yourself professionally in all interactions with hiring companies and candidates introduced through the platform. You agree not to submit AI-generated or fabricated CVs or candidate profiles. You agree not to misrepresent candidates to hiring companies. Any fraudulent activity is grounds for immediate account removal and may result in legal action to recover damages.',
  },
  {
    title: '5. Platform Fee',
    body: 'You accept that Vetted TA deducts a platform fee of 15 percent from all milestone payments before releasing funds to your connected account. This fee is non-negotiable and applies to every placement made through the platform regardless of circumstances.',
  },
  {
    title: '6. Non-Circumvention',
    body: 'You agree to the non-circumvention terms set out in the Vetted TA Terms of Service. You will not accept direct payment from any hiring company introduced through Vetted TA within 24 months of that introduction. Breach of this obligation entitles Vetted TA to pursue the full placement fee plus damages.',
  },
  {
    title: '7. Account Suspension',
    body: 'Vetted TA reserves the right to suspend or permanently remove your account for breach of this agreement, for poor platform conduct including unjustified disputes or fraudulent submissions, or for withdrawing from roles without valid reason on more than two occasions. Suspended accounts forfeit any pending milestone payments under dispute.',
  },
]

export default function RecruiterAgreement() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo dark />
          </Link>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Agreement</h1>
          <p className="text-blue-300 text-sm mt-2">Last updated: June 2026</p>
        </div>
      </section>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {SECTIONS.map((s, i) => (
            <div key={i} className="px-8 py-6">
              <h2 className="text-base font-bold text-slate-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
