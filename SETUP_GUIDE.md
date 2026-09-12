# MediSmile Platform -- Setup Instructions & Documentation

> **Version:** MVP 1.0  
> **Last Updated:** September 11, 2026  
> **Primary Application:** `Landing Page/` (unified React SPA)

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Environment Setup & Pre-Requisites](#2-environment-setup--pre-requisites)
3. [Local Installation & Launch Guide](#3-local-installation--launch-guide)
4. [Component & Feature Walkthrough](#4-component--feature-walkthrough)
5. [Troubleshooting & Live Deployment](#5-troubleshooting--live-deployment)

---

## 1. Project Overview & Architecture

### 1.1 System Introduction

MediSmile is a healthcare platform MVP designed for the Philippine market. It provides a unified web application where patients can discover doctors, book appointments, and manage billing, while healthcare providers (doctors and clinics) manage patient records, schedules, and invoicing. A super-admin dashboard provides platform-wide oversight including account approvals and content management.

The application ships with a **demo mode** that runs entirely on mock data when Supabase is not configured. This means you can explore every feature immediately after installation, without needing any external services.

### 1.2 Tech Stack

| Layer            | Technology                                                      |
| ---------------- | --------------------------------------------------------------- |
| **Framework**    | React 19 with TypeScript ~5.7                                   |
| **Build Tool**   | Vite 6.2 (dev server + production bundler)                      |
| **Styling**      | Tailwind CSS 4.0 (via `@tailwindcss/vite` plugin)               |
| **Icons**        | Lucide React                                                    |
| **Charts**       | Recharts 2.15                                                   |
| **Forms**        | React Hook Form 7 + Zod 4 validation                            |
| **Date Handling**| date-fns 4                                                      |
| **Backend/Auth** | Supabase (`@supabase/supabase-js` ^2.49) -- optional for demo   |
| **Animations**   | Framer Motion 12                                                |
| **Linting**      | ESLint 9 + Prettier 3.5                                         |

### 1.3 Workspace Structure

The repository contains four directories. The **Landing Page** directory is the primary, unified application that contains all features. The other three directories (`Booking and Appointment`, `Patients Records`, `Billing and Invoicing`) were earlier standalone prototypes whose components have now been consolidated into the main app.

```
MediSmile-Platform/
  Landing Page/              <-- PRIMARY APP (run this one)
    src/
      App.tsx                 <-- Root component + client-side router
      main.tsx                <-- React DOM entry point
      lib/
        auth-context.tsx      <-- Authentication provider (Supabase + demo mode)
        supabase.ts           <-- Supabase client initialization + demo detection
        currency.ts           <-- PHP peso formatting utilities
        payments.ts           <-- Payment types, mock payment provider, HMO list
        demo-data.ts          <-- Mock doctors, patients, appointments, invoices
        site-content-context.tsx <-- CMS-like content context for landing page
      components/
        auth/
          LoginPage.tsx       <-- Login/signup with demo mode quick-access buttons
        layout/
          AppShell.tsx        <-- Sidebar navigation + header shell (role-aware)
        patient/
          PatientPortalHome.tsx <-- Doctor directory with search, filters, geolocation
          DoctorProfile.tsx     <-- Full doctor profile page
        marketing/
          DoctorClinicLanding.tsx <-- "For Providers" marketing page
        payments/
          PaymentMethodSelector.tsx <-- Multi-method payment flow (GCash, Maya, etc.)
        generated/
          MediSmileLanding.tsx     <-- Public landing/marketing page
          SuperAdminDashboard.tsx   <-- Admin: approvals, subscriptions, content, impersonation
          AppointmentBooking.tsx    <-- Appointment scheduling interface
          PatientRecords.tsx        <-- Patient records management
          BillingInvoicing.tsx      <-- Invoices, claims tracker, receipt preview
    .env.example              <-- Environment variable template
    index.html                <-- HTML entry point
    package.json              <-- Dependencies and scripts
    vite.config.ts            <-- Vite configuration (React + Tailwind plugins)
    tsconfig.json             <-- TypeScript project references
    tsconfig.app.json         <-- App-level TypeScript config
    tsconfig.node.json        <-- Node/build TypeScript config
  Booking and Appointment/    <-- Legacy standalone prototype (not used)
  Patients Records/           <-- Legacy standalone prototype (not used)
  Billing and Invoicing/      <-- Legacy standalone prototype (not used)
```

### 1.4 User Roles

The platform defines three distinct user roles, each with their own navigation items, views, and permissions:

#### Patient (`patient`)
- **Default view:** `home` (Find a Doctor directory)
- **Available views:**
  - **Find a Doctor** -- Browse and search the doctor directory with filters for specialty, insurance acceptance, and availability. Includes geolocation-based distance sorting.
  - **Doctor Profile** -- View a doctor's full credentials, accepted payment methods, HMO affiliations, and consultation fees. Book an appointment directly.
  - **Book Appointment** -- Schedule an appointment with date/time selection.
- **Entry point:** Self-registration on the login page (select "Patient" role). Immediate access upon signup.

#### Doctor / Clinic (`subscriber`)
- **Default view:** `patients` (Patient Records)
- **Available views:**
  - **Patient Records** -- View and manage patient information, medical history, allergies, and conditions.
  - **Appointments** -- Manage the clinic's appointment schedule, confirm or reschedule bookings.
  - **Billing & Invoicing** -- Create invoices, track payments, manage insurance claims, process payments via multiple methods (GCash, Maya, Cash, Card, Bank Transfer, Insurance/HMO).
- **Entry point:** Registration on the login page (select "Doctor / Clinic Staff" role). Requires admin approval before access is granted. Pending accounts see a "Pending Approval" screen.

#### Super Admin (`super_admin`)
- **Default view:** `dashboard` (Super Admin Dashboard)
- **Available views:**
  - **Dashboard** -- Platform-wide overview with tabs for:
    - **Overview** -- KPIs (total revenue, registered doctors, active patients, monthly appointments) with metric cards.
    - **Approvals** -- Review and approve/reject pending doctor/clinic registrations.
    - **Subscriptions** -- Manage pricing tiers (Starter, Growth, Enterprise) with inline editing.
    - **Content** -- Edit the public landing page hero text, contact information, and statistics.
    - **Impersonate** -- View the platform as any registered user to troubleshoot issues.
- **Entry point:** Only via demo mode button or direct Supabase database assignment. There is no public registration for super-admin accounts.

### 1.5 Routing Architecture

The application uses a custom client-side router built directly in `App.tsx` (no external routing library). Routes are parsed from `window.location.pathname`:

| URL Path                        | Component Rendered                  | Access        |
| -------------------------------- | ----------------------------------- | ------------- |
| `/`                              | `MediSmileLanding`                  | Public        |
| `/for-providers`                 | `DoctorClinicLanding`               | Public        |
| `/login`                         | `LoginPage`                         | Public        |
| `/portal/home`                   | `PatientPortalHome`                 | Patient       |
| `/portal/doctor-profile/:id`     | `DoctorProfile`                     | Patient       |
| `/portal/booking`                | `AppointmentBooking`                | Patient       |
| `/portal/patients`               | `PatientRecords`                    | Subscriber    |
| `/portal/schedule`               | `AppointmentBooking`                | Subscriber    |
| `/portal/billing`                | `BillingInvoicing`                  | Subscriber    |
| `/portal/dashboard`              | `SuperAdminDashboard`               | Super Admin   |

All `/portal/*` routes require authentication. Unauthenticated users are redirected to `LoginPage`.

---

## 2. Environment Setup & Pre-Requisites

### 2.1 Local Tools

Before you begin, make sure you have the following software installed on your machine:

**Node.js (v18 or higher recommended)**

Node.js is the JavaScript runtime that powers the development server and build process.

1. Download the LTS installer from [https://nodejs.org](https://nodejs.org)
2. Run the installer and follow the prompts (accept all defaults)
3. Verify installation by opening a terminal and running:

```bash
node --version
```

You should see output like `v18.x.x` or `v20.x.x` or higher.

**npm (comes bundled with Node.js)**

npm is the package manager used to install project dependencies. It is included automatically when you install Node.js.

```bash
npm --version
```

You should see output like `9.x.x` or `10.x.x`.

**Git**

Git is used for version control. If you plan to clone the repository or track changes:

1. Download from [https://git-scm.com](https://git-scm.com)
2. Run the installer (accept defaults; on Windows, choose "Git from the command line and also from 3rd-party software")
3. Verify:

```bash
git --version
```

**Code Editor (recommended: VS Code)**

Visual Studio Code provides excellent TypeScript and React support out of the box:

1. Download from [https://code.visualstudio.com](https://code.visualstudio.com)
2. Recommended extensions to install:
   - **ESLint** -- real-time linting feedback
   - **Prettier** -- automatic code formatting
   - **Tailwind CSS IntelliSense** -- autocomplete for Tailwind classes
   - **TypeScript Importer** -- auto-import suggestions

### 2.2 Environment Variables

The application uses environment variables to connect to Supabase. When these variables are absent or set to placeholder values, the app automatically runs in **demo mode** with mock data -- no external services required.

**Create your `.env` file:**

Navigate to the `Landing Page` directory and create a file named `.env` with the following contents:

```env
# Supabase Configuration
# Get these values from your Supabase project: Settings > API
#
# When these are not set (or left as placeholders), the app
# runs in demo mode with mock data -- no Supabase needed.

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How demo mode detection works:**

The file `src/lib/supabase.ts` checks whether the environment variables are present and valid:

```typescript
export const isDemoMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project-id.supabase.co';
```

If `isDemoMode` is `true`:
- Authentication uses in-memory demo users (Patient: "Juan Dela Cruz", Doctor: "Dr. Maria Santos", Admin: "Admin")
- The login page displays three quick-access demo buttons (Patient, Doctor, Admin)
- All data comes from `src/lib/demo-data.ts` (6 doctors, 8 patients, 6 appointments, 8 invoices)
- No network requests are made to Supabase

**To connect to a real Supabase project:**

1. Create a free project at [https://supabase.com](https://supabase.com)
2. Go to **Project Settings > API** in your Supabase dashboard
3. Copy the **Project URL** and **anon/public key**
4. Replace the placeholders in your `.env` file:

```env
VITE_SUPABASE_URL=https://abcdefghijkl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```

### 2.3 Supabase Database Setup

If you are connecting to a real Supabase instance, you will need to create the following tables. This is a conceptual checklist of the database schema the application expects:

**Core Tables:**

- [ ] **`profiles`** -- Extended user profile data (linked to Supabase Auth)
  - `id` (UUID, primary key, references `auth.users.id`)
  - `email` (text)
  - `full_name` (text)
  - `role` (text: `'patient'`, `'subscriber'`, `'super_admin'`)
  - `status` (text: `'pending'`, `'approved'`, `'rejected'`, `'suspended'`)
  - `avatar_url` (text, nullable)
  - `created_at` (timestamp)

- [ ] **`doctor_profiles`** -- Doctor/clinic-specific information
  - `id` (UUID, primary key, references `profiles.id`)
  - `specialties` (text array)
  - `bio` (text)
  - `clinic_name` (text)
  - `clinic_address` (text)
  - `city` (text)
  - `province` (text)
  - `latitude` (float)
  - `longitude` (float)
  - `prc_license_number` (text)
  - `prc_license_expiry` (date)
  - `prc_license_verified` (boolean)
  - `medical_degree` (text)
  - `board_certifications` (text array)
  - `years_of_experience` (integer)
  - `languages` (text array)
  - `accepted_payment_methods` (text array)
  - `accepted_hmos` (text array)
  - `consultation_fee_cents` (integer)
  - `rating` (float)
  - `review_count` (integer)
  - `is_accepting_patients` (boolean)

- [ ] **`appointments`** -- Booking records
  - `id` (UUID, primary key)
  - `patient_id` (UUID, references `profiles.id`)
  - `doctor_id` (UUID, references `doctor_profiles.id`)
  - `patient_name` (text)
  - `doctor_name` (text)
  - `service` (text)
  - `scheduled_at` (timestamp)
  - `duration_minutes` (integer)
  - `status` (text: `'pending'`, `'confirmed'`, `'cancelled'`, `'completed'`)
  - `created_at` (timestamp)

- [ ] **`invoices`** -- Billing records
  - `id` (UUID, primary key)
  - `invoice_number` (text, unique)
  - `doctor_id` (UUID, references `doctor_profiles.id`)
  - `patient_id` (UUID, references `profiles.id`)
  - `patient_name` (text)
  - `service` (text)
  - `date` (date)
  - `amount_cents` (integer)
  - `status` (text: `'Paid'`, `'Pending'`, `'Overdue'`, `'Insurance'`, `'Voided'`)
  - `payment_method` (text, nullable)
  - `created_at` (timestamp)

- [ ] **`insurance_claims`** -- HMO/insurance claim tracking
  - `id` (UUID, primary key)
  - `claim_number` (text, unique)
  - `invoice_id` (UUID, references `invoices.id`)
  - `patient_name` (text)
  - `insurer` (text)
  - `submitted_at` (date)
  - `amount_cents` (integer)
  - `status` (text: `'Under Review'`, `'Additional Info Needed'`, `'Approved — Paid'`, `'Rejected'`)
  - `created_at` (timestamp)

**Row-Level Security (RLS) recommendations:**

- Patients should only read/write their own profile and appointments.
- Subscribers (doctors) should access their own patients' records and their clinic's invoices.
- Super admins should have full read/write access to all tables.
- Enable RLS on every table and create policies based on the `role` field in the user's JWT claims.

---

## 3. Local Installation & Launch Guide

### 3.1 Step-by-Step Commands

**Step 1: Open a terminal**

- **Windows:** Press `Win + R`, type `cmd` or `powershell`, press Enter. Or open Windows Terminal from the Start menu.
- **macOS:** Press `Cmd + Space`, type `Terminal`, press Enter.
- **Linux:** Press `Ctrl + Alt + T` or open your terminal from the applications menu.

**Step 2: Navigate to the project**

Change directory to the main application folder (`Landing Page`). All commands from this point forward should be run from inside this directory:

```bash
cd "C:\Users\YUMI\Downloads\MediSmile-Platform\Landing Page"
```

On macOS/Linux, adjust the path accordingly:

```bash
cd ~/Downloads/MediSmile-Platform/Landing\ Page
```

**Step 3: Install dependencies**

This command reads `package.json` and downloads all required packages into the `node_modules/` folder:

```bash
npm install
```

This will take 1-3 minutes depending on your internet speed. You will see a progress bar and a summary like:

```
added 312 packages in 45s
```

**Step 4: Create your environment file (if you haven't already)**

Copy the provided example:

```bash
cp .env.example .env
```

On Windows (Command Prompt):

```bash
copy .env.example .env
```

The default `.env.example` values will run the app in demo mode, which is perfectly fine for development.

**Step 5: Start the development server**

```bash
npm run dev
```

You should see output similar to:

```
  VITE v6.2.x  ready in 800ms

  ->  Local:   http://localhost:5173/
  ->  Network: http://192.168.x.x:5173/
```

**Step 6: Open the application**

Open your web browser and navigate to:

```
http://localhost:5173
```

You will see the MediSmile landing page. Since Supabase is not configured, the app runs in demo mode. Click "Get Started" or navigate to `/login` to access the demo sign-in buttons.

**Step 7: Test demo mode**

On the login page, you will see a "Demo Mode" section at the bottom with three buttons:
- **Patient** -- Signs in as "Juan Dela Cruz" and opens the doctor directory
- **Doctor** -- Signs in as "Dr. Maria Santos" and opens the patient records view
- **Admin** -- Signs in as "Admin" and opens the super admin dashboard

### 3.2 Available npm Scripts

| Command              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Start the Vite development server with hot module reload   |
| `npm run build`      | Run TypeScript type-check (`tsc -b`) then Vite production build |
| `npm run preview`    | Serve the production build locally for testing             |
| `npm run lint`       | Run ESLint on all source files                             |
| `npm run format`     | Auto-format all files with Prettier                        |
| `npm run format:check` | Check formatting without modifying files                 |

### 3.3 Production Build Testing

To verify that the application compiles cleanly and is ready for deployment, run the full build command:

```bash
npm run build
```

This executes two steps sequentially:

1. **TypeScript compilation** (`tsc -b`) -- Type-checks every `.ts` and `.tsx` file. If there are type errors, the build stops here and reports them.
2. **Vite production build** (`vite build`) -- Bundles, tree-shakes, and minifies the application into the `dist/` folder.

A successful build produces output similar to:

```
vite v6.2.x building for production...
✓ 2,089 modules transformed.
dist/index.html                  0.38 kB  gzip:  0.27 kB
dist/assets/index-[hash].css    48.12 kB  gzip: 10.21 kB
dist/assets/index-[hash].js    312.45 kB  gzip: 98.67 kB
✓ built in 8.42s
```

The 2,089 module count confirms that all components, utilities, and third-party libraries have been successfully resolved and compiled.

**Preview the production build locally:**

After building, you can serve the `dist/` folder to test the production output:

```bash
npm run preview
```

This starts a local server (typically on port `4173`) serving the minified production files. Open `http://localhost:4173` to verify everything works as expected.

---

## 4. Component & Feature Walkthrough

### 4.1 Authentication & Routing

**File:** `src/App.tsx`

The root `App` component wraps the entire application in two context providers:

```
<SiteContentProvider>    <-- Provides editable landing page content
  <AuthProvider>         <-- Provides authentication state + demo mode
    <AppRouter />        <-- Custom client-side router
  </AuthProvider>
</SiteContentProvider>
```

**AppRouter** is the routing heart of the application. It:

1. Reads the current URL path via `window.location.pathname`
2. Parses it into a typed `AppRoute` discriminated union (`home | for-providers | login | portal`)
3. Listens for `popstate` events to handle browser back/forward
4. Exposes a `navigate(path)` function that uses `history.pushState` for SPA navigation
5. Auto-redirects authenticated users away from `/login` to their role's default view

**Route guards** are handled inline: every `/portal/*` route checks `if (!user)` and falls back to `LoginPage`. The subscriber role additionally checks for `status === 'pending'` and shows a `PendingApproval` screen if the account has not been approved by an admin.

**Role-based default views** are defined in `getDefaultView()`:

- `super_admin` -> `/portal/dashboard`
- `subscriber` -> `/portal/patients`
- `patient` -> `/portal/home`

**Lazy loading:** Every page component is loaded with `React.lazy()` and wrapped in `<Suspense>` with a spinner fallback. This means the browser only downloads the JavaScript for a page when you first navigate to it, improving initial load performance.

**File:** `src/components/layout/AppShell.tsx`

`AppShell` provides the authenticated layout wrapper with:

- **Sidebar navigation** (slate-800 background) -- Role-aware: each role sees only its own nav items, defined in the `NAV_CONFIG` record
- **Mobile responsive** -- Sidebar slides in/out with a hamburger menu on screens smaller than `lg` (1024px)
- **Header bar** -- Displays the current view title from `VIEW_TITLES`
- **User info** -- Shows the active user's name and role label at the sidebar bottom
- **Sign Out** -- The sign-out button calls `signOut()` from the auth context, then programmatically navigates to `/login` by pushing state and dispatching a `popstate` event:

```typescript
onClick={async () => {
  await signOut();
  window.history.pushState({}, '', '/login');
  window.dispatchEvent(new PopStateEvent('popstate'));
}}
```

This ensures a clean redirect directly to the login page after sign-out, without any intermediate state.

- **Impersonation banner** -- When a super admin is impersonating another user, a fixed yellow banner appears at the top with a "Return to Admin" button

### 4.2 Patient Portal

**File:** `src/components/patient/PatientPortalHome.tsx`

The Patient Portal home page is a doctor directory with search, filtering, and geolocation features.

**Search & Location:**
- A search input filters doctors by name, specialty, or clinic name (case-insensitive substring match)
- A location input with a "Use my location" button triggers the browser's Geolocation API
- When location is available, doctors are sorted by distance (nearest first) using the Haversine formula
- When location is unavailable, doctors are sorted by rating (highest first)

**Filter chips:**
- **Specialty** -- Dropdown populated dynamically from all unique specialties in the dataset
- **Accepts Insurance** -- Toggles to show only doctors whose `acceptedPaymentMethods` includes `'insurance'`
- **Accepting Patients** -- Toggles to show only doctors where `isAcceptingPatients` is `true`
- A result count badge shows "X doctors found"

**Doctor Cards:**
Each doctor is rendered as a card with avatar, name, specialties, clinic info, rating, and consultation fee. The entire card is clickable (via an `onClick` handler on the outer `<div>`), which navigates to that doctor's full profile:

```typescript
<div onClick={onBook} className="flex cursor-pointer flex-col rounded-2xl ...">
```

The `onBook` callback triggers navigation to `/portal/doctor-profile/{doctorId}`, where the patient can view the doctor's full credentials.

**Consultation fee display** uses the `formatPHP` utility from `src/lib/currency.ts`, which converts cents to Philippine Peso format:

```typescript
formatPHP(50000)   // -> "₱500.00"
formatPHP(120000)  // -> "₱1,200.00"
formatPHP(80000)   // -> "₱800.00"
```

**File:** `src/components/patient/DoctorProfile.tsx`

The full doctor profile page displays:
- Doctor's avatar (color-coded by ID hash), name, and specialties
- Clinic name, full address, and distance if geolocation is available
- PRC License number, expiry, and verification badge
- Medical degree and board certifications
- Years of experience and languages spoken
- Accepted payment methods (Cash, Card, GCash, Maya, Bank Transfer, Insurance)
- Accepted HMOs (e.g., Maxicare, PhilHealth, Intellicare, Medicard)
- Consultation fee in Philippine Pesos
- Star rating and review count
- "Book Appointment" button that navigates to the booking page

### 4.3 Billing & Invoicing

**File:** `src/components/generated/BillingInvoicing.tsx`

The Billing & Invoicing module is the financial workspace for the Doctor/Clinic (subscriber) role. It is structured as a two-column layout:

**Left Column (main content):**

1. **Summary Cards** (4 KPI tiles across the top):
   - **Total Revenue** -- `₱2,416,000` with +12% indicator
   - **Pending Invoices** -- 14 invoices, `₱342,500` outstanding
   - **Paid This Month** -- 38 invoices, `₱2,073,500` collected
   - **Insurance Claims** -- 9 active, 3 pending review

2. **Invoices Table** -- A searchable, filterable table with:
   - Tab filters: All (52), Paid (38), Pending (14), Overdue (3), Voided (0)
   - Search by patient name, invoice ID, or service
   - Date range filter (month picker)
   - Columns: Invoice ID, Patient, Service, Date, Amount, Status, Actions
   - Status badges with color coding:
     - **Paid** -- Green background with checkmark
     - **Pending** -- Yellow/amber background
     - **Overdue** -- Red background
     - **Insurance** -- Teal background with heart icon
   - All monetary amounts use Philippine Peso (₱) formatting with thousands separators

   Sample invoice amounts displayed:
   - `₱16,000.00` (Cavity Filling)
   - `₱4,750.00` (Routine Cleaning)
   - `₱10,500.00` (Specialist Consult)
   - `₱22,500.00` (X-Ray + Filling)
   - `₱3,750.00` (General Checkup)
   - `₱44,500.00` (Root Canal)
   - `₱19,000.00` (Teeth Whitening)
   - `₱7,750.00` (Orthodontic Review)

3. **Insurance Claims Tracker** -- A dedicated table tracking HMO/insurance claim statuses:
   - Claims reference Philippine HMOs: Maxicare, Intellicare, PhilHealth, Medicard
   - Statuses: Under Review, Additional Info Needed, Approved -- Paid, Rejected
   - Actions: View Details, Upload Docs, Download EOB, Appeal Claim

**Right Column (sidebar):**

1. **Receipt Preview** -- A formatted payment receipt for invoice INV-1042 showing:
   - Service fee: `₱14,000.00`
   - VAT (12%): `₱1,680.00`
   - Total: `₱16,000.00`
   - Payment method: GCash
   - Download PDF and Send to Patient buttons

2. **Record a Payment** -- A form to manually record payments with:
   - Invoice ID input
   - Amount input (pre-filled)
   - Payment method selector with Philippine-market options:
     - GCash
     - Maya
     - Cash
     - Credit Card
     - Bank Transfer
     - Insurance / HMO
   - Optional note field
   - "Process Payment" submit button (shows "Payment Processed" checkmark on success)

3. **Revenue This Month** -- A bar chart showing monthly collection trends (Jan-Jun) with:
   - Y-axis: ₱0 to ₱3M
   - Current month highlighted in dark teal
   - Summary stats: Average per Invoice (₱46,350), Collection Rate (89%)

**File:** `src/lib/payments.ts`

The payment system defines six Philippine-market payment methods:

| Method          | Label                  | Flow Description                             |
| --------------- | ---------------------- | -------------------------------------------- |
| `cash`          | Cash (Pay at Clinic)   | Payment collected at the physical clinic      |
| `card`          | Credit / Debit Card    | Standard card processing                     |
| `gcash`         | GCash                  | Philippine e-wallet redirect                  |
| `maya`          | Maya                   | Philippine e-wallet redirect                  |
| `bank_transfer` | Bank Transfer          | Manual transfer to BDO Unibank account        |
| `insurance`     | Insurance / HMO        | Claim submitted for verification              |

The `MockPaymentProvider` simulates the full payment lifecycle (initiate -> confirm -> success/fail) with a 90% success rate and 1.5-second processing delay. Bank transfers generate a reference number, and the Philippine HMO list includes 14 major providers (Maxicare, Intellicare, Medicard, PhilHealth, Pacific Cross, Cocolife, EastWest Healthcare, Caritas Health Shield, Generali, AXA Philippines, Sun Life Grepa, Valucare, AsianLife, Insular Health Care).

**File:** `src/lib/currency.ts`

Two formatting functions are available:

```typescript
formatPHP(cents)       // Full format: ₱1,200.00
formatPHPShort(cents)  // Compact format: ₱1.2K or ₱2.4M
```

Both use the `en-PH` locale for proper thousands separators.

### 4.4 Super Admin Dashboard

**File:** `src/components/generated/SuperAdminDashboard.tsx`

The super admin dashboard provides five tabs:

1. **Overview** -- Platform-wide KPIs with revenue in PHP, doctor and patient counts, and appointment metrics
2. **Approvals** -- Queue of pending doctor/clinic registrations with Approve/Reject actions
3. **Subscriptions** -- Editable pricing tiers (Starter: ₱2,499/mo, Growth: ₱5,999/mo, Enterprise: Custom)
4. **Content** -- Inline editing of the public landing page (hero headline, subheadline, CTA, contact info, stats)
5. **Impersonate** -- Search for any user and view the platform as that user, with a yellow "Return to Admin" banner

### 4.5 Authentication Flow

**File:** `src/lib/auth-context.tsx`

The `AuthProvider` component manages the complete authentication lifecycle:

**Demo mode:**
- `demoSignIn(role)` sets a pre-built `AuthUser` object in state immediately
- No network calls, no persistence -- signing out clears the in-memory state
- Three demo users: `patient@demo.medismile.ph`, `doctor@demo.medismile.ph`, `admin@demo.medismile.ph`

**Supabase mode:**
- `signUp(email, password, fullName, role)` calls `supabase.auth.signUp()` with metadata
- `signIn(email, password)` calls `supabase.auth.signInWithPassword()`
- `signOut()` calls `supabase.auth.signOut()` and clears local state
- On mount, `supabase.auth.getSession()` restores existing sessions
- `onAuthStateChange` listener keeps state synchronized across tabs

**Impersonation:**
- Only available to `super_admin` users
- `startImpersonation(targetUser)` sets a separate `impersonating` state
- `activeUser` is computed as `impersonating ?? user` -- all role checks use `activeUser`
- `stopImpersonation()` clears the impersonation state, returning to the admin view

---

## 5. Troubleshooting & Live Deployment

### 5.1 Common Fixes

**Problem: `npm install` fails with permission errors**

On macOS/Linux, avoid using `sudo npm install`. Instead, fix npm's global directory permissions:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
```

Add `~/.npm-global/bin` to your PATH in `~/.bashrc` or `~/.zshrc`.

**Problem: TypeScript compilation errors**

If `npm run build` reports type errors, you can isolate them by running the type checker alone:

```bash
npx tsc -b --noEmit
```

This shows all type errors without attempting to build. Common fixes:
- Missing imports: add the required `import` statement at the top of the file
- Type mismatches: check that function parameters and return types match their declarations
- Null/undefined: use optional chaining (`?.`) or null checks before accessing properties

**Problem: JSX syntax errors like "Unexpected token `<`"**

This usually means a `.ts` file contains JSX but has the wrong file extension. Rename it to `.tsx`:

```bash
mv src/components/MyComponent.ts src/components/MyComponent.tsx
```

Or check your `tsconfig.app.json` includes `"jsx": "react-jsx"` in `compilerOptions`.

**Problem: Port 5173 is already in use**

Another process is using the default Vite port. Either stop that process, or start Vite on a different port:

```bash
npx vite --port 3000
```

**Problem: Changes not appearing in the browser**

Vite's hot module reload is usually instant. If changes aren't reflecting:
1. Check the terminal for build errors
2. Hard-refresh the browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS)
3. Clear the browser cache and restart the dev server

**Problem: Blank page after navigating to a route directly**

Since this is a single-page app with client-side routing, directly visiting `http://localhost:5173/portal/home` requires the dev server to serve `index.html` for all routes. Vite handles this automatically in development. In production (see deployment section below), you need to configure your hosting platform's rewrite rules.

### 5.2 Hosting Deployment

The production build generates a fully static `dist/` folder that can be hosted on any static hosting platform. Here are step-by-step guides for the two most popular options:

#### Option A: Deploy to Vercel (Recommended)

Vercel provides the simplest deployment path for Vite + React apps.

**Step 1: Install the Vercel CLI**

```bash
npm install -g vercel
```

**Step 2: Build the application**

```bash
cd "Landing Page"
npm run build
```

**Step 3: Deploy**

```bash
vercel
```

The CLI will prompt you:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (for first deploy)
- **Project name?** `medismile-platform`
- **In which directory is your code located?** `./` (current directory)
- **Override settings?** Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Development Command:** `npm run dev`

Vercel automatically detects the Vite framework and configures SPA routing (all paths serve `index.html`).

**Step 4: Set environment variables (if using Supabase)**

In the Vercel dashboard:
1. Go to your project > **Settings** > **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Redeploy for changes to take effect

**Step 5: Production deployment**

```bash
vercel --prod
```

Your app will be live at `https://medismile-platform.vercel.app` (or your custom domain).

#### Option B: Deploy to Netlify

**Step 1: Install the Netlify CLI**

```bash
npm install -g netlify-cli
```

**Step 2: Build the application**

```bash
cd "Landing Page"
npm run build
```

**Step 3: Create a `_redirects` file for SPA routing**

Netlify needs a redirects file to serve `index.html` for all routes. Create `dist/_redirects`:

```bash
echo "/*    /index.html   200" > dist/_redirects
```

On Windows (PowerShell):

```bash
"/*    /index.html   200" | Out-File -Encoding utf8 dist/_redirects
```

**Step 4: Deploy**

```bash
netlify deploy --dir=dist
```

This creates a draft deployment. Preview it in the provided URL.

**Step 5: Production deployment**

When you're satisfied with the draft:

```bash
netlify deploy --dir=dist --prod
```

**Step 6: Set environment variables (if using Supabase)**

In the Netlify dashboard:
1. Go to **Site settings** > **Environment variables**
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Trigger a rebuild from the **Deploys** tab

#### Alternative: Manual Build + Upload

For any static hosting provider (GitHub Pages, Cloudflare Pages, AWS S3 + CloudFront, Firebase Hosting):

1. Run `npm run build` to generate the `dist/` folder
2. Upload the entire contents of `dist/` to your hosting provider
3. Configure a "catch-all" or "rewrite" rule so that all URL paths serve `dist/index.html` (this is required for client-side routing to work)
4. Set environment variables during the build step if using Supabase

#### Post-Deployment Checklist

- [ ] Verify the landing page loads at your domain
- [ ] Test navigation: click through Home -> Login -> Demo Patient -> Find a Doctor
- [ ] Test direct URL access: navigate directly to `yourdomain.com/login` (should load the login page, not a 404)
- [ ] Test sign-out: click Sign Out and confirm you're redirected to the login page
- [ ] If using Supabase: verify real authentication works (sign up, sign in, sign out)
- [ ] Test on mobile: the sidebar should collapse to a hamburger menu
- [ ] Check browser console for errors (press `F12` -> Console tab)

---

## Quick Reference Card

| What                | Command / Path                          |
| ------------------- | --------------------------------------- |
| Install deps        | `npm install`                           |
| Start dev server    | `npm run dev`                           |
| Production build    | `npm run build`                         |
| Preview prod build  | `npm run preview`                       |
| Lint code           | `npm run lint`                          |
| Format code         | `npm run format`                        |
| App entry point     | `src/App.tsx`                           |
| Auth context        | `src/lib/auth-context.tsx`              |
| Supabase config     | `src/lib/supabase.ts`                   |
| Demo data           | `src/lib/demo-data.ts`                  |
| Currency formatting | `src/lib/currency.ts`                   |
| Payment system      | `src/lib/payments.ts`                   |
| Environment vars    | `.env` (copy from `.env.example`)       |
| Build output        | `dist/`                                 |
| Dev server URL      | `http://localhost:5173`                 |
| Preview server URL  | `http://localhost:4173`                 |
