# CareerLink OS™ — Rollback Record
## Snapshot: BEFORE-SUPABASE-SETUP-BUTTON-FIX
## Created: 2026-06-03 22:51 (Europe/London)

### Current working routes
- Landing page:       /#/
- Coach Dashboard:    /#/dashboard
- Jobseeker PWA:      /#/jobseeker-app  (legacy PIN)
                      /#/pwa/:publicLinkId  (link-based)
- Jobseeker Setup:    /#/jobseeker-setup
- Settings:           /#/settings / /#/settings/:section
- No Admin page exists

### Location of "Live Backend Setup" button
- In pages_Settings.jsx — the "Live Backend" tab (key: 'backend')
- Clicking navigates to /#/settings/backend
- BackendPanel component renders — but crashes immediately

### Exact crash cause
- pages_Settings.jsx calls getCLSupabaseStatus(), testCLSupabaseConnection(), maskSecret()
- None of these are imported in pages_Settings.jsx
- Python patch in previous run failed to inject the import lines
  (the target string `import { useConfigStore, useAuthStore, useAIStore } from './core_storage'`
   was not found verbatim — the file already had slightly different content)
- Result: ReferenceError on BackendPanel render → React error boundary → blank screen

### Files expected to be touched in this fix
- pages_Settings.jsx           — add missing imports
- pages_SupabaseSetup.jsx      — new dedicated Supabase setup page
- app_Router.jsx               — add /#/supabase-setup route

### Files NOT touched
- pages_Landing.jsx            — no "Live Backend Setup" button here
- pages_Dashboard.jsx          — not involved
- pages_JobseekerApp.jsx       — not involved
- pages_JobseekerPwa.jsx       — not involved
- core_storage.js              — not involved
- services_supabase_clSupabaseClient.js  — working correctly
- services_supabase_apiConfigGuard.js    — working correctly
- services_careerlink_liveDataService.js — working correctly

### RLS status
No SQL changes in this run. Existing RLS status unchanged.
supabase_careerlinkos_schema.sql remains the reference schema.
