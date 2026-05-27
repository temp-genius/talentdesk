# TalentDesk

A B2B marketplace connecting independent recruiters with hiring companies.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 19 + Vite |
| Styling | Tailwind CSS v3 + `@tailwindcss/forms` |
| Routing | React Router v7 |
| Backend / Auth | Supabase (Postgres + Auth) |
| HTTP client | Axios |

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared UI (ProtectedRoute, Navbar, etc.)
│   ├── recruiter/       # Recruiter-specific components
│   ├── hiring-manager/  # Hiring-manager-specific components
│   └── admin/           # Admin-specific components
├── pages/
│   ├── public/          # Unauthenticated pages (HomePage, etc.)
│   ├── recruiter/       # Recruiter pages (Dashboard, etc.)
│   ├── hiring-manager/  # Hiring manager pages
│   └── admin/           # Admin pages
├── context/
│   └── AuthContext.jsx  # Auth state, login/signup/logout helpers
├── hooks/               # Custom React hooks
├── lib/
│   └── supabase.js      # Supabase client initialisation
└── utils/               # Pure utility functions
```

## User Types

- **recruiter** — independent recruiter listing their services
- **hiring_manager** — company representative posting jobs
- **admin** — platform administrator

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-org/talentdesk.git
   cd talentdesk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your values in `.env`:

   | Variable | Description |
   |----------|-------------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (for billing) |
   | `VITE_RESEND_API_KEY` | Resend API key (for transactional email) |

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

## Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Home / landing page |
| `/recruiter/signup` | Public | Recruiter registration |
| `/hiring-manager/signup` | Public | Hiring manager registration |
| `/recruiter/dashboard` | `recruiter` only | Recruiter dashboard |
| `/hiring-manager/dashboard` | `hiring_manager` only | Hiring manager dashboard |
| `/admin/dashboard` | `admin` only | Admin dashboard |

## Contributing

1. Create a feature branch off `main`
2. Make your changes and add tests where appropriate
3. Open a pull request with a clear description
