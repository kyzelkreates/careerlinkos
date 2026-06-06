# CareerLink OS™

> **Employment Support Case Management Platform**
> Coach Dashboard · Jobseeker PWA · 4P3X Intelligent AI™
> Created by **Kyzel Kreates™** — Version **1.1** — June 2026

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Core Products](#3-core-products)
4. [Tech Stack](#4-tech-stack)
5. [Project Structure](#5-project-structure)
6. [Getting Started — Local Development](#6-getting-started--local-development)
7. [Environment Variables](#7-environment-variables)
8. [Operating Modes](#8-operating-modes)
9. [Database — Supabase Schema](#9-database--supabase-schema)
10. [4P3X Intelligent AI™ System](#10-4p3x-intelligent-ai-system)
11. [Jobseeker PWA — Link-Based Access](#11-jobseeker-pwa--link-based-access)
12. [Multi-Backend Architecture](#12-multi-backend-architecture)
13. [State Management — SSOT](#13-state-management--ssot)
14. [Security & API Safety](#14-security--api-safety)
15. [Responsive Design — Screen Coverage](#15-responsive-design--screen-coverage)
16. [Vercel Deployment](#16-vercel-deployment)
17. [White-Label Rules](#17-white-label-rules)
18. [Roadmap](#18-roadmap)
19. [Legal & Compliance](#19-legal--compliance)

---

## 1. Product Overview

CareerLink OS™ is a full-stack, offline-capable, PWA-ready platform built for employment support providers. It gives coaches a structured dashboard to manage jobseeker caseloads, and gives jobseekers a mobile-first app (PWA) to log their daily job-search activity independently — no app store required.

### What problem does it solve?

Employment support providers (Restart Scheme, UKSPF, JFG, PCO, IPS) need to:
- Track jobseeker activity (hours, applications, interviews, check-ins)
- Monitor compliance against 35-hour weekly job-search targets
- Flag risks early (disengagement, barriers, low confidence)
- Generate evidence for commissioner audits and outcome payments
- Share real-time progress between coach and jobseeker

CareerLink OS™ replaces spreadsheets, paper forms, and generic CRMs with a purpose-built tool that works on any device, online or offline.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CareerLink OS™                          │
│              Powered by 4P3X Intelligent AI™                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐   ┌──────────────────────────┐    │
│  │   Coach Dashboard    │   │    Jobseeker PWA          │    │
│  │                      │   │                           │    │
│  │  Case metrics        │   │  Activity logging         │    │
│  │  Risk monitoring     │   │  Job applications         │    │
│  │  Evidence review     │   │  Interview tracking       │    │
│  │  35h target tracking │   │  Weekly check-ins         │    │
│  │  Support flags       │   │  Evidence upload          │    │
│  │  AI advisory panel   │   │  AI assistant             │    │
│  └──────────┬───────────┘   └─────────────┬─────────────┘   │
│             │                             │                   │
│  ┌──────────▼─────────────────────────────▼─────────────┐   │
│  │                   core_storage.js (SSOT)               │   │
│  │           Zustand · localStorage · Demo/Live mode      │   │
│  └──────────────────────────┬────────────────────────────┘   │
│                             │                                 │
│  ┌──────────────────────────▼────────────────────────────┐   │
│  │                  Backend Layer                         │   │
│  │   Supabase │ Firebase │ AWS DynamoDB │ Custom REST     │   │
│  │   (pluggable via providerService.js)                   │   │
│  └──────────────────────────────────────────────────────-┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data flow

```
Jobseeker (mobile) → PWA → pwa_link_id token → Supabase INSERT (anon key)
Coach (desktop)    → Dashboard ← Supabase SELECT (anon key) → derived metrics
AI Engine (local)  → reads state from SSOT → generates advisory output
```

---

## 3. Core Products

### 3.1 Coach Dashboard

The primary case-management interface for employment coaches.

**Key screens:**
| Screen | Purpose |
|---|---|
| `/dashboard` | KPI overview: caseload, risk, activity, interviews |
| `/jobseekers` | Full caseload list with risk-sorted profiles |
| `/weekly-activity` | 35h/week target tracking per jobseeker |
| `/applications` | All job applications across caseload |
| `/interviews` | Upcoming and past interviews |
| `/check-ins` | Weekly check-in survey responses |
| `/evidence` | Evidence records with type filters |
| `/support-risks` | Open risk and support flags |
| `/tasks` | Coach action tasks |
| `/ai` | 4P3X Intelligent AI advisory panel |
| `/reports` | Exportable summary reports |
| `/settings` | Programme config, demo mode, AI providers, backend |
| `/jobseeker-setup` | Create a new jobseeker + generate their PWA link |

### 3.2 Jobseeker PWA

A mobile-first progressive web app accessible via a unique shareable link — no app store, no login, no password.

**URL pattern:** `https://careerlinkos.vercel.app/#/pwa/<public_link_id>`

**Tabs:**
| Tab | What the jobseeker can do |
|---|---|
| Home | View weekly progress, AI encouragement message |
| Log Activity | Record hours spent on job-search activities |
| Applications | Log jobs applied for |
| Interviews | Record upcoming and completed interviews |
| Evidence | Add notes, URLs, screenshots |
| Check-in | Complete weekly check-in survey |

**PWA features:**
- Installable on Android and iOS home screen
- Service worker + offline-first caching
- Syncs when back online
- No login required — link is the auth token

---

## 4. Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | Zustand (SSOT via core_storage.js) |
| Router | React Router DOM 6 (hash routing) |
| PWA | vite-plugin-pwa + Workbox |
| Backend (default) | Supabase (PostgreSQL 15 + RLS) |
| Backend (optional) | Firebase / AWS DynamoDB / Custom REST |
| AI (local/API-ready) | Configurable — OpenAI, Anthropic, local LLM |
| Icons | Lucide React |
| Maps | Leaflet (optional — for future geo features) |
| Deployment | Vercel |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage (file uploads) |
| Auth (MVP) | Token-based (public_link_id) |
| Auth (production) | Supabase Auth (to be added pre-production) |

---

## 5. Project Structure

All source files are flat in the project root (Vite flat-file build pattern). Naming convention: `category_module_component.jsx`.

```
careerlinkos/
│
├── index.html                        # App entry point + PWA meta
├── main.jsx                          # React root mount
├── vite.config.js                    # Vite + PWA plugin config
├── tailwind.config.js                # CareerLink gold/silver/black theme
├── postcss.config.js
├── package.json
│
├── app_App.jsx                       # App root + core initialisation
├── app_Router.jsx                    # Hash router (all routes defined here)
│
├── core_storage.js                   # ★ SSOT — all Zustand stores
├── config_app.js                     # App-level constants
├── config_routes.js                  # Route + nav item definitions
│
├── styles_globals.css                # Global CSS + responsive utilities
│
│── layouts/
│   ├── layouts_AppShell.jsx          # Main layout shell (sidebar + topnav + main)
│   ├── layouts_Sidebar.jsx           # Burger drawer sidebar
│   └── layouts_TopNav.jsx            # Top navigation bar
│
├── components/
│   ├── components_ui_Badge.jsx
│   ├── components_ui_ConnectionStatus.jsx
│   ├── components_ui_Icon.jsx        # Lucide icon wrapper
│   ├── components_ui_PlatformCredit.jsx  # Branding component
│   └── components_ui_StatusDot.jsx
│
├── pages/
│   ├── pages_Landing.jsx             # ★ Public entry point (/)
│   ├── pages_Dashboard.jsx           # Coach dashboard KPIs
│   ├── pages_Jobseekers.jsx          # Caseload list + profiles
│   ├── pages_JobseekerSetup.jsx      # Create jobseeker + generate PWA link
│   ├── pages_JobseekerPwa.jsx        # ★ Jobseeker PWA (/pwa/:linkId)
│   ├── pages_JobseekerApp.jsx        # Legacy PIN PWA (compat only)
│   ├── pages_WeeklyActivity.jsx      # 35h weekly target tracker
│   ├── pages_Applications.jsx        # Job applications
│   ├── pages_Interviews.jsx          # Interview tracker
│   ├── pages_CheckIns.jsx            # Check-in responses
│   ├── pages_Evidence.jsx            # Evidence records
│   ├── pages_SupportRisks.jsx        # Risk flags
│   ├── pages_Tasks.jsx               # Coach tasks
│   ├── pages_AI.jsx                  # 4P3X AI advisory panel
│   ├── pages_Reports.jsx             # Reports
│   ├── pages_Settings.jsx            # Settings (tabbed)
│   ├── pages_LiveBackendSettings.jsx # Multi-provider backend config
│   ├── pages_SupabaseSetup.jsx       # Supabase setup guide
│   ├── pages_Messaging.jsx           # Messaging
│   ├── pages_Analytics.jsx           # Analytics
│   └── pages_NotFound.jsx            # 404
│
├── modules/
│   ├── modules_ai_AICommandPanel.jsx # 4P3X AI chat panel
│   └── modules_ai_AssistantPanel.jsx
│
├── services/
│   ├── services_careerlink_jobseekerService.js   # Core jobseeker logic
│   ├── services_careerlink_demoData.js            # Demo seed data
│   ├── services_careerlink_liveDataService.js     # Live Supabase sync
│   ├── services_backend_providerService.js        # Multi-backend routing
│   ├── services_supabase_clSupabaseClient.js      # CareerLink Supabase client
│   ├── services_supabase_apiConfigGuard.js        # Secret key blocker
│   ├── services_ai_aiRouter.js                    # AI provider router
│   ├── services_ai_aiConfig.js                    # AI mode config
│   └── services_pwa_jobSyncService.js             # PWA offline sync
│
├── hooks/
│   ├── hooks_useAuth.js
│   ├── hooks_useLocalStorage.js
│   └── hooks_useSystemStatus.js
│
├── sql/
│   ├── sql_careerlinkos_MASTER_SCHEMA.txt         # ★ USE THIS — full schema
│   ├── supabase_careerlinkos_schema.sql            # Previous version schema
│   └── supabase_schema.sql                         # Base schema reference
│
├── public/
│   └── sw-job-sync.js                             # Service worker
│
├── rollback-snapshot-notes/                        # Pre-change snapshots
│
└── .github/
    └── workflows/
        └── deploy.yml                             # GitHub Actions deploy
```

---

## 6. Getting Started — Local Development

### Prerequisites
- Node.js 18+
- npm 9+
- Git

### Install

```bash
git clone https://github.com/kyzelkreates/careerlinkos.git
cd careerlinkos
npm install
```

### Run locally

```bash
npm run dev
```

App opens at `http://localhost:5173`

Default route: `http://localhost:5173/#/` (public landing page — no login needed)

### Build for production

```bash
npm run build
```

Output in `/dist`. Serve with any static host.

### Preview production build

```bash
npm run preview
```

### First run steps

1. Open the app — you land on the public landing page
2. Click **"Open Coach Dashboard"** — loads immediately in **Demo Mode**
3. Demo data is pre-loaded — explore the full UI with sample jobseekers, applications, interviews, and check-ins
4. Click **Settings → Demo Mode tab** to toggle Demo Mode off
5. Click **Settings → Live Backend tab** to connect Supabase (see Section 9)

---

## 7. Environment Variables

All env vars use the `VITE_` prefix (exposed to the frontend build).

Create a `.env` file in the project root:

```env
# ─── Supabase (Live Mode) ──────────────────────────────────
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# ─── AI Providers (optional — OFF mode works without these) ─
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_AI_KEY=...

# ─── Map Providers (optional) ─────────────────────────────
VITE_MAPBOX_TOKEN=pk.eyJ1...
VITE_GRAPHHOPPER_API_KEY=...
```

### Security rules — READ BEFORE ADDING KEYS

| Key | Allowed in frontend | Reason |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Yes | Public project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Public key — protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ NEVER | Full DB access — backend only |
| `VITE_OPENAI_API_KEY` | ⚠️ Dev only | Use a backend proxy in production |
| `VITE_ANTHROPIC_API_KEY` | ⚠️ Dev only | Use a backend proxy in production |
| `FIREBASE_PRIVATE_KEY` | ❌ NEVER | Backend/server only |
| `AWS_SECRET_ACCESS_KEY` | ❌ NEVER | Backend/server only |

The `apiConfigGuard.js` service actively blocks forbidden keys from being saved to the in-app settings store.

**Blocked key patterns:**
```
SERVICE_ROLE_KEY · PRIVATE_KEY · SECRET_ACCESS_KEY · MASTER_KEY
CLIENT_SECRET · APP_SECRET · ADMIN_TOKEN · ROOT_TOKEN · SERVER_KEY
PRIVATE_TOKEN · INTERNAL_KEY · BACKEND_KEY · SIGNING_KEY · JWT_SECRET
```

---

## 8. Operating Modes

CareerLink OS™ uses a three-mode system for AI and backend connections:

### Demo Mode (default on first run)

- All data is generated locally from `services_careerlink_demoData.js`
- No backend connection required
- No API keys required
- Fully functional UI — coaches can explore all features
- Safe for presentations, onboarding, and development

Toggle: **Settings → Demo Mode → Disable Demo Mode**

### Local Mode (AI: OFF)

- Live backend (Supabase or other) connected
- AI features disabled — no API keys required
- All data is real and persistent
- Best for organisations that don't want AI features

### API-Ready Mode (AI: enabled)

- Live backend connected
- AI provider configured (OpenAI / Anthropic / Google AI / local LLM)
- 4P3X Intelligent AI assistants fully active
- Insights, risk scoring, and advisory generation live

Configure: **Settings → AI Providers tab**

---

## 9. Database — Supabase Schema

### Quick setup

1. Create a Supabase project at https://supabase.com
2. Go to **SQL Editor** in your Supabase dashboard
3. Open `sql_careerlinkos_MASTER_SCHEMA.txt` from this repo
4. Paste the full contents and click **Run**
5. Copy your **Project URL** and **anon key** from **Project Settings → API**
6. Add them to your `.env` file (see Section 7)
7. In CareerLink OS: **Settings → Live Backend → Supabase → Save**

### Tables

| Table | Purpose | Rows |
|---|---|---|
| `organisations` | Provider organisations | 1 per org |
| `coaches` | Case workers and admins | 1 per coach |
| `jobseekers` | People being supported | 1 per person |
| `pwa_access_links` | Shareable PWA tokens | 1+ per jobseeker |
| `activity_logs` | Daily job-search activity | Many per jobseeker |
| `weekly_activity_totals` | 35h weekly progress summary | 1 per jobseeker per week |
| `applications` | Job applications submitted | Many per jobseeker |
| `interviews` | Interview records | Many per jobseeker |
| `check_ins` | Weekly survey responses | 1 per jobseeker per week |
| `evidence_records` | Screenshots, notes, URLs | Many per jobseeker |
| `dashboard_events` | Coach activity feed events | Auto-generated |
| `ai_insight_snapshots` | 4P3X AI advisory records | Auto-generated |
| `support_flags` | Risk and support flags | Raised by coach or AI |
| `tasks` | Coach action items | 1 per task |

### Row Level Security

RLS is **enabled on every table**. MVP policy:
- `anon` key can **SELECT** all records (coach dashboard reads)
- `anon` key can **INSERT** jobseeker-submitted records only if a valid, active `pwa_link_id` token is present
- All other writes require the service role key (backend/server only — never in frontend)

### Realtime

Enable realtime on: `activity_logs`, `weekly_activity_totals`, `dashboard_events`, `check_ins`, `support_flags`

Via Supabase Dashboard: **Database → Replication → Realtime**

---

## 10. 4P3X Intelligent AI™ System

CareerLink OS™ embeds four distinct AI assistants under the **4P3X Intelligent AI™** brand.

### The Four Assistants

| ID | Name | Role |
|---|---|---|
| `1` | 4P3X Intelligent AI 1 — Coach Dashboard Guide | Explains dashboard data, suggests actions for coaches |
| `2` | 4P3X Intelligent AI 2 — Coach Data Insight | Analyses caseload patterns, flags risks, generates reports |
| `3` | 4P3X Intelligent AI 3 — Jobseeker Assistant | Helps jobseekers log activity and stay motivated (in PWA) |
| `4` | 4P3X Intelligent AI 4 — PWA Support Advisor | Barrier identification and support suggestions in PWA |

### AI Modes

| Mode | Description |
|---|---|
| `OFF` | AI features disabled. No keys required. UI shows advisory text only. |
| `LOCAL` | Local pattern-matching engine. Rules-based. No API calls. |
| `API-READY` | Full LLM API connection. Requires provider key. |

### Supported Providers (API-READY)

- OpenAI (GPT-4o, GPT-4-turbo, GPT-3.5-turbo)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku)
- Google AI (Gemini 1.5 Pro, Gemini Flash)
- Custom / local LLM (Ollama, LM Studio)

### AI Ethics & Safety

- AI outputs are **advisory only** — never auto-actioned
- `human_review_required = TRUE` on all AI insight records
- AI risk scores are one input — coaches make all decisions
- No personal data is sent to AI APIs without explicit configuration

### Risk Engine

The LOCAL risk engine (`services_ai_localAIOrchestrator.js`) runs entirely in-browser:

| Signal | Weight |
|---|---|
| Weekly hours below 30% of target | High |
| No activity logged in 7+ days | High |
| No applications in 14+ days | Medium |
| Multiple open support flags | High |
| Low confidence score in check-in | Medium |
| Barrier flags declared | Medium |

Risk levels: `low` → `medium` → `high` → `critical`

---

## 11. Jobseeker PWA — Link-Based Access

### How it works

1. Coach opens **Settings → Add Jobseeker** (or `/jobseeker-setup`)
2. System generates a unique `public_link_id` (UUID / nanoid)
3. Coach receives the shareable URL: `https://careerlinkos.vercel.app/#/pwa/<id>`
4. Coach shares the link with the jobseeker (WhatsApp, text, email)
5. Jobseeker opens the link on their phone
6. Optional: jobseeker taps **"Add to Home Screen"** to install the PWA
7. Jobseeker logs activity — data syncs to Supabase in real time

### Link security

- `public_link_id` is a non-guessable token
- RLS validates the token on every database INSERT
- Links can be deactivated instantly from the coach dashboard
- Links can have expiry dates (optional — MVP default: no expiry)

### PWA Install

The PWA is Workbox-powered and supports:
- Android Chrome: **"Add to Home Screen"** prompt
- iOS Safari: **Share → Add to Home Screen** (manual)
- Service worker handles offline data queuing
- Sync queue flushes when connectivity is restored

---

## 12. Multi-Backend Architecture

CareerLink OS™ supports four backend providers, configured via **Settings → Live Backend**.

| Provider | Use case |
|---|---|
| Supabase | Default. PostgreSQL. Real-time. RLS. Open source. |
| Firebase | Firestore. Google ecosystem. Serverless. |
| AWS DynamoDB | Enterprise scale. AWS infrastructure. |
| Custom REST | Any REST API. BYO backend. |

All providers are routed through `services_backend_providerService.js`:

```js
// Example: switch backend provider
setBackendProvider('firebase')
// All reads/writes now go through the Firebase adapter
```

The SSOT (`core_storage.js`) never needs to know which backend is active — the service layer handles all provider logic.

---

## 13. State Management — SSOT

All application state lives in `core_storage.js`. This is the **Single Source of Truth** for the entire application.

### Stores

| Store | Contents |
|---|---|
| `useAuthStore` | Current user, session, auth status |
| `useAppStore` | Sidebar state, UI state |
| `useConfigStore` | Programme config, demo mode toggle, org name |
| `useDataStore` | Jobseekers, applications, interviews, check-ins, evidence, tasks, flags |
| `useAIConfigStore` | AI mode, provider, model, keys (masked) |
| `useBackendStore` | Active backend provider + connection status |

### SSOT rules

- All components read from stores via Zustand selectors
- No component manages its own data state
- All data mutations go through store actions
- LocalStorage persistence is handled by Zustand middleware
- Demo data is seeded once into the store on first load

---

## 14. Security & API Safety

### Frontend key safety

`services_supabase_apiConfigGuard.js` runs on every settings save:

```js
const result = checkFieldSafety(fieldName, value)
if (!result.safe) {
  showError(`${fieldName}: ${result.reason}`)
  return // block save
}
```

Blocked field patterns (partial match, case-insensitive):
```
service_role · private_key · secret_access · master_key · client_secret
app_secret · admin_token · root_token · server_key · private_token
internal_key · backend_key · signing_key · jwt_secret
```

### CSP recommendations (add to Vercel headers)

```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co https://api.openai.com; img-src 'self' data: https:;
```

### Data privacy

- No personal data is transmitted to third parties without explicit AI provider configuration
- Demo mode uses entirely synthetic data — no real individuals
- Evidence files are stored as public CDN URLs (Supabase Storage) — no private file paths in the frontend

---

## 15. Responsive Design — Screen Coverage

CareerLink OS™ v1.1 is fully responsive across all target breakpoints.

### Tested breakpoints

| Category | Widths |
|---|---|
| Mobile | 320px, 360px, 375px, 390px, 414px, 430px |
| Tablet | 768px, 820px, 912px, 1024px |
| Laptop | 1280px, 1366px, 1440px |
| Desktop | 1536px, 1728px, 1920px |
| Large | 2560px |

### PWA mobile targets

- iOS Safari (iPhone SE → iPhone 16 Pro Max)
- Android Chrome (Galaxy S20 → Pixel 9 Pro)
- Portrait and landscape
- Safe-area insets (iOS home indicator bar)

### Responsive patterns used

- `clamp()` for fluid heading sizes
- `minmax(min(100%, Xpx), 1fr)` for all card grids
- `overflow-wrap: anywhere` for technical strings (API keys, URLs, IDs)
- `tab-scroll-row` horizontal scroll for tab headers on small screens
- `table-responsive` horizontal scroll for data tables
- `env(safe-area-inset-bottom)` for PWA fixed bottom nav
- `100dvh` (dynamic viewport height) for iOS Safari compatibility
- `scroll-to-top` on every route change (no mid-page opens)

---

## 16. Vercel Deployment

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kyzelkreates/careerlinkos)

### Manual deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

### vercel.json (already in repo)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This handles SPA hash routing — all routes resolve to `index.html`.

### Environment variables in Vercel

In your Vercel project dashboard: **Settings → Environment Variables**

Add the same variables from your `.env` file. Never commit `.env` to Git.

### GitHub Actions (optional auto-deploy)

The workflow file at `.github/workflows/deploy.yml` requires the `workflow` scope on your GitHub token. To enable:
1. Regenerate your GitHub PAT with `workflow` scope
2. Or manually add the workflow file through the GitHub UI
3. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` to GitHub Secrets

---

## 17. White-Label Rules

CareerLink OS™ is designed for white-labelling by employment support providers. The following rules apply:

### What can be customised

- Organisation name (via Settings → Profile)
- Programme name (Restart Scheme, UKSPF, JFG, etc.)
- Colour accent (via `tailwind.config.js` — gold is the default)
- Logo (replace `CL` monogram in Sidebar and TopNav)
- Domain / Vercel project name

### What is locked and must be preserved

The following must appear in every deployment and cannot be removed or obscured:

```
CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™
```

This branding appears in:
- Sidebar footer
- Landing page footer
- All AI assistant panels
- Settings page
- PWA home screen
- Any generated reports or exports

The `PlatformCredit` component (`components_ui_PlatformCredit.jsx`) renders this line globally and must not be removed.

---

## 18. Roadmap

### v1.2 — In progress

- [ ] Supabase Auth integration (email magic link for coaches)
- [ ] Coach portal login with org-scoped data
- [ ] Evidence file upload to Supabase Storage
- [ ] PDF report export (commissioner-ready)
- [ ] Push notifications for jobseeker milestones
- [ ] Bulk import from CSV (jobseeker onboarding)

### v1.3 — Planned

- [ ] Multi-coach per organisation
- [ ] Commissioner / admin read-only view
- [ ] Outcome payment tracking (IPS / Restart)
- [ ] WhatsApp integration for jobseeker nudges
- [ ] AI-generated weekly summary emails to coaches
- [ ] Compliance report templates (ESFA, DWP)

### v2.0 — Future

- [ ] Multi-tenancy (full org isolation)
- [ ] Native mobile apps (React Native)
- [ ] Real-time coach ↔ jobseeker messaging
- [ ] AI-powered interview preparation coach
- [ ] Integration with Universal Credit journal API

---

## 19. Legal & Compliance

### License

MIT License — Copyright 2026 Kyzel Kreates™

See `LICENSE` for full terms.

### AI Disclaimer

The 4P3X Intelligent AI™ system provides **advisory output only**. All AI-generated insights, risk scores, and recommendations:

- Are not clinical assessments
- Are not legal advice
- Require human review before any action is taken
- Must not be used as the sole basis for decisions about individuals
- Are stored with `human_review_required = TRUE`

Employment support professionals remain solely responsible for all decisions regarding jobseekers in their care.

### Data Protection

- This software does not automatically comply with GDPR or UK GDPR
- Operators are responsible for lawful basis, data retention, and subject rights
- Personal data should only be entered into live (non-demo) mode after a Data Protection Impact Assessment (DPIA)
- The MVP access-token auth pattern is not sufficient for production use with real personal data without additional security controls
- Before go-live: add Supabase Auth, enforce per-org RLS, implement data retention policies

---

## Acknowledgements

Built with:
- [React](https://react.dev) — UI framework
- [Vite](https://vitejs.dev) — Build tool
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Zustand](https://zustand-demo.pmnd.rs) — State management
- [Supabase](https://supabase.com) — Backend platform
- [Lucide React](https://lucide.dev) — Icons
- [Workbox](https://developer.chrome.com/docs/workbox) — PWA service worker

---

<div align="center">

**CareerLink OS™ v1.1**

CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™

© 2026 Kyzel Kreates™ — All rights reserved

</div>
