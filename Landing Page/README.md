# MediSmile Platform

A clinic management and patient portal built with React, TypeScript, Tailwind CSS, and Supabase. Localized for the Philippines (PHP currency, PH insurance/HMOs, Filipino doctor names, PRC license numbers).

## Quick Start (Demo Mode)

The app works out of the box with no external services — mock data powers everything when Supabase credentials are absent.

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (includes npm)
- [Git](https://git-scm.com/) (optional, for version control)

### Install & Run

```bash
cd "Landing Page"
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Demo Accounts

In demo mode, the login page shows quick-login buttons:

| Role | Description |
|------|-------------|
| **Super Admin** | Full platform control — dashboard, doctor approvals, CMS, impersonation |
| **Doctor / Clinic** | Patient records, appointments, billing |
| **Patient** | Doctor directory, geolocation search, booking |

## Connecting Supabase (Optional)

To use real auth and persistent data:

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your credentials from **Project Settings > API**:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Run the database migration — open the **SQL Editor** in your Supabase dashboard and paste the contents of `supabase-schema.sql`. This creates all tables, RLS policies, triggers, and seed data.
5. Restart the dev server.

## Project Structure

```
Landing Page/
├── src/
│   ├── App.tsx                  # Router, route definitions, auth redirects
│   ├── main.tsx                 # Entry point
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client, demo mode detection
│   │   ├── auth-context.tsx      # Auth provider, roles, impersonation
│   │   ├── site-content-context.tsx  # CMS content provider
│   │   ├── currency.ts           # PHP formatting (₱)
│   │   ├── payments.ts           # Payment provider abstraction
│   │   └── demo-data.ts          # Mock data for demo mode
│   └── components/
│       ├── auth/LoginPage.tsx           # Login/signup with password strength
│       ├── layout/AppShell.tsx          # Sidebar layout, role-based nav
│       ├── patient/
│       │   ├── PatientPortalHome.tsx    # Doctor directory with geolocation
│       │   └── DoctorProfile.tsx        # Doctor detail with PH credentials
│       ├── marketing/
│       │   └── DoctorClinicLanding.tsx  # Provider marketing page
│       ├── payments/
│       │   └── PaymentMethodSelector.tsx # PH payment methods UI
│       └── generated/
│           ├── MediSmileLanding.tsx      # Public homepage
│           ├── SuperAdminDashboard.tsx   # Admin control center
│           ├── AppointmentBooking.tsx    # Booking flow
│           ├── BillingInvoicing.tsx      # Billing dashboard
│           └── PatientRecords.tsx        # Patient records + dental chart
├── supabase-schema.sql          # Full database schema + seed data
├── .env.example                 # Environment variable template
└── package.json
```

## Architecture Decisions

- **No react-router-dom** — routing uses `window.history.pushState` + `popstate` listener for zero-dependency URL-based routing
- **Demo mode** — when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing or placeholder, the app uses in-memory mock data
- **Lazy loading** — all route components are loaded with `React.lazy()` + `Suspense`
- **Role-based access** — `super_admin`, `subscriber` (doctor/clinic), `patient` with status flow: `pending → approved`
- **Impersonation** — SuperAdmin can view the app as any user (client-side, suitable for MVP)
- **PHP currency** — all money stored as integer centavos, displayed with `₱` formatting
- **PH payments** — GCash, Maya, cash, card, bank transfer, insurance/HMO with `PaymentProvider` abstraction
- **CMS** — site content editable from SuperAdmin dashboard, changes reflect on public pages in real-time

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Vite
- Supabase (Auth, Postgres, RLS)
- Lucide React (icons)
- Recharts (charts)
- Framer Motion (animations)

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel, Netlify, or any static host. Set the environment variables in your hosting dashboard.
