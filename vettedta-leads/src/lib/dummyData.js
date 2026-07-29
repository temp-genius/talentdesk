// Placeholder data for the session-1 dashboard shell.
// Session 2 replaces this with live queries against companies/signals/contacts/outreach.

export const DUMMY_STATS = {
  totalCompanies: 128,
  newSignalsToday: 7,
  contactsFound: 341,
  outreachPending: 22,
}

export const DUMMY_COMPANIES = [
  {
    id: '1',
    name: 'Orbis Analytics',
    location: 'Dublin, Ireland',
    country: 'Ireland',
    headcount_bracket: '51-200',
    specialism_bucket: ['Data/AI', 'Software Engineering'],
    signal: { type: 'funding', headline: 'Orbis Analytics raises €8m Series A' },
    contacts: [
      { name: 'Sarah Kelly', title: 'Head of People', linkedin_url: '#' },
      { name: 'Mark Byrne', title: 'CTO', linkedin_url: '#' },
    ],
    outreach_status: 'new',
    linkedin_company_url: '#',
  },
  {
    id: '2',
    name: 'Fenwick Robotics',
    location: 'Cork, Ireland',
    country: 'Ireland',
    headcount_bracket: '11-50',
    specialism_bucket: ['Software Engineering'],
    signal: { type: 'senior_hire', headline: 'Fenwick Robotics appoints new VP of Engineering' },
    contacts: [{ name: 'Aoife Ryan', title: 'Founder & CEO', linkedin_url: '#' }],
    outreach_status: 'connection_sent',
    linkedin_company_url: '#',
  },
  {
    id: '3',
    name: 'Northlane Health',
    location: 'London, UK',
    country: 'UK',
    headcount_bracket: '200+',
    specialism_bucket: ['Product Management', 'Data/AI'],
    signal: { type: 'expansion', headline: 'Northlane Health opens office in Dublin' },
    contacts: [
      { name: 'Tom Hargreaves', title: 'Chief People Officer', linkedin_url: '#' },
      { name: 'Priya Shah', title: 'VP Product', linkedin_url: '#' },
    ],
    outreach_status: 'connected',
    linkedin_company_url: '#',
  },
  {
    id: '4',
    name: 'Vantar Cloud',
    location: 'Galway, Ireland',
    country: 'Ireland',
    headcount_bracket: '1-10',
    specialism_bucket: ['Software Engineering'],
    signal: { type: 'job_posting', headline: '5 new engineering roles posted this week' },
    contacts: [],
    outreach_status: 'new',
    linkedin_company_url: '#',
  },
  {
    id: '5',
    name: 'Brightline Finance',
    location: 'Dublin, Ireland',
    country: 'Ireland',
    headcount_bracket: '51-200',
    specialism_bucket: ['Data/AI'],
    signal: { type: 'funding', headline: 'Brightline Finance secures $12m in growth funding' },
    contacts: [{ name: 'Emer Nolan', title: 'Head of Talent', linkedin_url: '#' }],
    outreach_status: 'call_booked',
    linkedin_company_url: '#',
  },
  {
    id: '6',
    name: 'Solvex Systems',
    location: 'Manchester, UK',
    country: 'UK',
    headcount_bracket: '11-50',
    specialism_bucket: ['Software Engineering', 'Product Management'],
    signal: { type: 'careers_page', headline: 'Careers page refreshed with 8 open roles' },
    contacts: [{ name: 'Liam O\'Connor', title: 'COO', linkedin_url: '#' }],
    outreach_status: 'not_now',
    linkedin_company_url: '#',
  },
]

export const SIGNAL_TYPES = [
  { value: 'funding', label: 'Funding' },
  { value: 'senior_hire', label: 'Senior hire' },
  { value: 'job_posting', label: 'Job posting' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'careers_page', label: 'Careers page' },
]

export const HEADCOUNT_BRACKETS = ['1-10', '11-50', '51-200', '200+']

export const SPECIALISMS = ['Software Engineering', 'Data/AI', 'Product Management']

export const OUTREACH_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'connection_sent', label: 'Connection sent' },
  { value: 'connected', label: 'Connected' },
  { value: 'follow_up_1_sent', label: 'Follow-up 1 sent' },
  { value: 'follow_up_2_sent', label: 'Follow-up 2 sent' },
  { value: 'replied', label: 'Replied' },
  { value: 'call_booked', label: 'Call booked' },
  { value: 'active_client', label: 'Active client' },
  { value: 'not_now', label: 'Not now' },
  { value: 'dead', label: 'Dead' },
]
