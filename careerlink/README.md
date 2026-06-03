# CareerLink OS™

**CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™**

> A local-first, offline-capable employment support platform for coaches, caseworkers, and jobseekers.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://careerlinkos.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-gold?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.1-purple?style=flat-square)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-green?style=flat-square)]()

---

## What is CareerLink OS™?

CareerLink OS™ is a full employment support case management system built for coaches, caseworkers, and employment advisors. It tracks jobseeker activity, weekly job-search targets, applications, interviews, check-ins, evidence records, and support risks — all in one platform.

It runs entirely in the browser with **no backend required** in Demo Mode. For live deployments, Supabase is the supported backend with Firebase, AWS, and Custom API adapters configurable for future use.

---

## Products

### 🖥️ CareerLink Coach Dashboard
Full case management interface for employment coaches and advisors.
- Caseload management with risk scoring
- Weekly activity monitoring (35-hour target tracking)
- Application and interview pipeline
- Evidence record management
- Support risk and barrier flags
- AI-assisted jobseeker insights (4P3X Intelligent AI 1 & 2)
- Compliance reporting

### 📱 Jobseeker Activity PWA
Mobile-first Progressive Web App for jobseekers to log activity on the go.
- Works fully offline — syncs when reconnected
- Installable on Android and iOS home screens
- 12 activity types (applications, interviews, training, networking, etc.)
- Daily check-ins with 10 questions
- Evidence upload and management
- AI guide and support assistant (4P3X Intelligent AI 3 & 4)
- Shared via unique secure link from coach dashboard

---

## Features at a Glance

| Feature | Description |
|---|---|
| 📊 Weekly Tracking | Evidence-based 35-hour job-search hour monitoring |
| 🧠 4P3X AI Layer | 4 embedded AI assistants across coach + jobseeker interfaces |
| 📴 Offline PWA | Jobseeker app works fully offline, syncs on reconnect |
| 🔒 Privacy First | All data stored locally — no cloud dependency in demo mode |
| 🗄️ Live Backend | Supabase integration for real-time sync (optional) |
| 🔧 Multi-Backend | Firebase, AWS, Custom API configurable for future adapters |
| 🎨 White-Label Ready | Organisation name, logo, colours, and dashboard title are customisable |
| 🛡️ Security Guard | Forbidden secrets blocked from frontend config |
| 📋 Demo Mode | Full sample data set for presentations and training |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/kyzelkreates/careerlinkos.git
cd careerlinkos

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you'll land on the CareerLink OS™ home page.

### First Run

1. The app loads in **Demo Mode** by default — sample data is active, no backend required.
2. Open the **Coach Dashboard** to explore the caseload management interface.
3. Open the **Jobseeker PWA** to see the mobile activity logging experience.
4. Go to **Settings → Demo Mode** to toggle between demo data and live mode.
5. Go to **Settings → Live Backend → Live Backend Settings** to configure a backend provider.

### Production Build

```bash
npm run build
# Output: dist/
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.

```env
# Supabase (Primary Live Backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Firebase (config-only — adapter coming)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=

# AWS / Amplify (config-only — adapter coming)
VITE_AWS_REGION=
VITE_AWS_API_ENDPOINT=

# Custom Backend (config-only — adapter coming)
VITE_CUSTOM_API_BASE_URL=
```

> ⚠️ **NEVER** add `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `JWT_SECRET`, `AWS_SECRET_ACCESS_KEY`, `FIREBASE_SERVICE_ACCOUNT`, or any other backend secrets to your `.env` or Vercel frontend env vars. These are blocked by the built-in secret guard.

---

## Live Backend Setup (Supabase)

CareerLink OS™ works offline-first without any backend. To enable live sync:

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase_careerlinkos_schema.sql` in the Supabase SQL Editor (creates 12 tables with RLS)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your Vercel environment variables
4. Redeploy (Vite bakes env vars at build time)
5. In the app: **Settings → Live Backend → Test Connection**
6. Turn **Demo Mode OFF** in Settings

### Supabase Tables Created

`organisations` · `coaches` · `jobseekers` · `pwa_access_links` · `activity_logs` · `weekly_activity_totals` · `applications` · `interviews` · `check_ins` · `evidence_records` · `dashboard_events` · `ai_insight_snapshots`

> Row Level Security (RLS) is enabled on all 12 tables. Do not disable in production.

---

## Project Structure

```
careerlinkos/
├── app_App.jsx                     # App entry + Zustand provider
├── app_Router.jsx                  # All routes
├── core_storage.js                 # SSOT — all state, storage keys, stores
│
├── pages_Landing.jsx               # Public landing page (/)
├── pages_Dashboard.jsx             # Coach Dashboard (/dashboard)
├── pages_JobseekerApp.jsx          # Jobseeker PWA legacy (/jobseeker-app)
├── pages_JobseekerPwa.jsx          # Jobseeker PWA link-based (/pwa/:id)
├── pages_JobseekerSetup.jsx        # Create jobseeker + share link
├── pages_LiveBackendSettings.jsx   # Multi-backend config (/live-backend-settings)
├── pages_SupabaseSetup.jsx         # Supabase-specific guide (/supabase-setup)
├── pages_Settings.jsx              # All settings (/settings/:section)
├── pages_Jobseekers.jsx            # Caseload list
├── pages_WeeklyActivity.jsx        # Weekly hours tracking
├── pages_Applications.jsx          # Application pipeline
├── pages_Interviews.jsx            # Interview pipeline
├── pages_Evidence.jsx              # Evidence records
├── pages_CheckIns.jsx              # Daily check-ins
├── pages_Tasks.jsx                 # Coach task management
├── pages_Reports.jsx               # Compliance reports
├── pages_AI.jsx                    # AI assistant hub
├── pages_Analytics.jsx             # Analytics overview
│
├── components_ui_PlatformCredit.jsx  # Shared brand credit component
├── components_ui_Icon.jsx            # Lucide icon wrapper
├── components_ui_Badge.jsx           # Status badges
│
├── layouts_AppShell.jsx            # Main authenticated shell
├── layouts_Sidebar.jsx             # Navigation sidebar
├── layouts_TopNav.jsx              # Top navigation bar
│
├── services_backend_providerService.js    # Multi-provider routing layer
├── services_careerlink_liveDataService.js # Supabase live data reads
├── services_careerlink_jobseekerService.js # Jobseeker CRUD
├── services_careerlink_demoData.js        # Demo data generator
├── services_supabase_clSupabaseClient.js  # Supabase client + status
├── services_supabase_apiConfigGuard.js    # Secret guard + field safety
├── services_ai_*/                         # AI provider layer (OFF/LOCAL/API-READY)
│
├── supabase_careerlinkos_schema.sql  # Full Supabase schema (run once)
├── .env.example                      # Environment variable template
├── vercel.json                        # SPA fallback (all routes → index.html)
└── vite.config.js                     # Vite + PWA config
```

---

## AI Layer — 4P3X Intelligent AI™

CareerLink OS™ ships with 4 embedded AI assistants:

| Assistant | Location | Role |
|---|---|---|
| **4P3X Intelligent AI 1** | Coach Dashboard | General dashboard guide and feature explainer |
| **4P3X Intelligent AI 2** | Coach Dashboard | Jobseeker progress, risk analysis, suggested actions |
| **4P3X Intelligent AI 3** | Jobseeker PWA | PWA guide — how to log activity, use features |
| **4P3X Intelligent AI 4** | Jobseeker PWA | Encouragement, hour tracking, evidence reminders |

### AI Modes

| Mode | Description |
|---|---|
| **OFF** | AI panels hidden |
| **LOCAL** | Rule-based advisory engine — no API key needed, fully offline |
| **API-READY** | Connect an external provider (OpenAI, OpenRouter, Groq, Anthropic) |

> **AI Disclaimer:** 4P3X Intelligent AI provides guidance, organisation support, and dashboard help only. It does not replace official guidance, legal advice, medical advice, benefits advice, or professional human review.

---

## Multi-Backend Architecture

```
CareerLink OS™
    │
    ├── Demo Mode ON  ──→ localStorage / sample data (always works, no backend)
    │
    └── Demo Mode OFF ──→ providerService.js
                              │
                              ├── Supabase ──→ clSupabaseClient.js (LIVE ✓)
                              ├── Firebase ──→ Config saved, adapter pending
                              ├── AWS      ──→ Config saved, adapter pending
                              └── Custom   ──→ Config saved, adapter pending
```

Selecting Firebase, AWS, or Custom saves your configuration safely but does not enable live sync until the respective adapter package is installed. The app never pretends a non-wired provider is live.

---

## Security

- All user-entered backend settings are validated by `checkFieldSafety()` before saving
- 21 forbidden secret key names are blocked (service role keys, IAM secrets, service accounts, etc.)
- Supabase service role key detection checks JWT payload for `service_role` claim
- RLS is enforced on all 12 Supabase tables
- No credentials are ever logged or transmitted to third parties by the app itself

---

## Deployment (Vercel)

```bash
# Push to GitHub → connect repo in Vercel → auto-deploys on push
# OR use Vercel CLI:
npm i -g vercel
vercel --prod
```

Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Vercel → Project → Settings → Environment Variables**.

The `vercel.json` SPA fallback is already configured:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## White-Label

Organisation-level customisation is supported:

- Organisation name
- Logo
- Primary colour
- Dashboard title
- PWA title

The platform credit **cannot be removed or hidden** — it must remain visible in the live UI of both the Coach Dashboard and Jobseeker PWA:

> **CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™**

---

## Disclaimers

CareerLink OS™ supports job-search tracking, evidence organisation, and employment support workflows. It does not replace official guidance, legal advice, benefits advice, medical advice, or human decision-making. Reports produced are support and evidence summaries only. They do not guarantee eligibility, compliance, benefit entitlement, employment outcome, or government acceptance.

AI features are advisory only. 4P3X Intelligent AI does not provide regulated advice of any kind.

---

## Roadmap

- [ ] Firebase adapter
- [ ] AWS Amplify adapter
- [ ] Supabase Auth (phone/email OTP for jobseekers)
- [ ] Multi-organisation / multi-tenancy
- [ ] Coach-to-jobseeker in-app messaging
- [ ] Automated weekly compliance reports (email)
- [ ] Jobseeker goal-setting module
- [ ] Integration with Universal Credit / DWP APIs (when available)

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

**CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™**
