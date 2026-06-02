import { Link } from 'react-router-dom'
import Footer from '../../components/layout/Footer'

const SECTIONS = [
  {
    title: '1. About TalentDesk',
    body: 'TalentDesk is a B2B marketplace operated by TalentDesk (Ireland) that connects independent recruitment professionals with hiring companies. TalentDesk is not a recruitment agency. We provide a platform that facilitates commercial engagements between independent recruiters and businesses seeking to hire.',
  },
  {
    title: '2. Eligibility',
    body: 'To use TalentDesk as a hiring company you must register using a valid company domain email address. Personal email addresses from providers including Gmail, Hotmail, Outlook, and Yahoo are not accepted. To use TalentDesk as a recruiter you must apply and be approved through our vetting process. Approval is at TalentDesk\'s sole discretion.',
  },
  {
    title: '3. The Engagement Model',
    body: 'All recruitment engagements facilitated through TalentDesk are retained engagements. Hiring companies pay in three milestone stages — 20 percent on commencement, 30 percent on shortlist approval, and 50 percent on interview confirmation. Payments are held securely via Stripe and released to recruiters as milestones are completed. TalentDesk deducts a platform fee of 15 percent from each milestone payment before releasing funds to recruiters.',
  },
  {
    title: '4. Exclusivity',
    body: 'Each role posted on TalentDesk is assigned to one recruiter exclusively. Hiring companies agree not to engage multiple recruiters simultaneously on the same role through TalentDesk.',
  },
  {
    title: '5. Non-Circumvention',
    body: 'By using TalentDesk both recruiters and hiring companies agree that any candidate introduction made through the platform creates a protected relationship for 24 months from the date of introduction. If a hiring company engages a candidate introduced through TalentDesk outside the platform within this period the full placement fee becomes immediately due. If a recruiter accepts direct payment from a hiring company introduced through TalentDesk within this period their account will be permanently suspended.',
  },
  {
    title: '6. No Rebate Policy',
    body: 'The recruiter\'s contractual obligation ends at offer acceptance confirmed through the TalentDesk platform. No refund or rebate applies after this point regardless of subsequent employment outcomes including candidate resignation or termination.',
  },
  {
    title: '7. Milestone Payments and Refunds',
    body: 'If a hiring company cancels a role before any CVs are submitted they receive a full refund minus the TalentDesk platform fee. If a hiring company cancels after CVs have been approved all milestone payments already released to the recruiter are non-refundable. Remaining unearned milestones are refunded to the hiring company. If a recruiter withdraws from a role before submitting CVs the hiring company receives a full refund including the platform fee. If a recruiter withdraws after CVs have been submitted milestone payments already released are retained by the recruiter.',
  },
  {
    title: '8. Dispute Resolution',
    body: 'Disputes between recruiters and hiring companies are resolved through TalentDesk\'s three-tier dispute process. TalentDesk\'s decision at the final tier is binding on both parties. Where evidence is genuinely ambiguous TalentDesk may apply a 50-50 split of the disputed milestone amount. TalentDesk\'s liability to any user is limited to the platform fees paid by that user in the preceding 12 months.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'TalentDesk is not liable for the quality of placements made through the platform, the conduct of recruiters or hiring companies, employment outcomes following placement, or any losses arising from the use of the platform beyond the limitations stated in these terms.',
  },
  {
    title: '10. Governing Law',
    body: 'These terms are governed by the laws of Ireland. Any disputes arising under these terms are subject to the exclusive jurisdiction of the Irish courts.',
  },
  {
    title: '11. Changes to These Terms',
    body: 'TalentDesk reserves the right to update these terms at any time. Material changes will be communicated to registered users by email. Continued use of the platform after notification constitutes acceptance of the updated terms.',
  },
  {
    title: '12. Contact',
    body: 'For questions about these terms contact support@talentdesk.io',
  },
]

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white tracking-tight">
            Talent<span className="text-primary-400">Desk</span>
          </Link>
          <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign in</Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
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
