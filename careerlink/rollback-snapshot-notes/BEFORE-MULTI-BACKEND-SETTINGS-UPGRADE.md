# CareerLink OS™ — Rollback Record
## Snapshot: BEFORE-MULTI-BACKEND-SETTINGS-UPGRADE
## Created: 2026-06-03 23:07 (Europe/London)

### Current working routes
- Landing page:            /#/
- Coach Dashboard:         /#/dashboard
- Jobseeker PWA (legacy):  /#/jobseeker-app
- Jobseeker PWA (link):    /#/pwa/:publicLinkId
- Jobseeker Setup:         /#/jobseeker-setup
- Settings:                /#/settings / /#/settings/:section
- Live Backend Settings:   /#/supabase-setup  ← SINGLE PROVIDER ONLY

### Current backend setup flow
- Settings → 'Live Backend' tab (settings/backend) → BackendPanel
- BackendPanel has 'Live Backend Setup — Full Guide' button → /#/supabase-setup
- SupabaseSetup page exists at pages_SupabaseSetup.jsx
- ONLY Supabase is supported — no Firebase/AWS/Custom tabs

### Current branding text (not yet exact match required wording)
- Dashboard footer:     "CareerLink OS™ · Powered by 4P3X Intelligent AI · Created by Kyzel Kreates"
- Sidebar footer:       "Created by Kyzel Kreates"
- Landing footer:       "CareerLink OS™ — Powered by 4P3X Intelligent AI — Created by Kyzel Kreates"
- Jobseeker PWA:        "Powered by 4P3X Intelligent AI" (partial)
- SupabaseSetup header: "Powered by 4P3X Intelligent AI — Created by Kyzel Kreates"

### Required exact wording (new):
"CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™"

### Current SSOT (core_storage.js) — NO backendSettings key yet
- STORAGE_KEYS has no BACKEND_SETTINGS
- DEFAULT_APP_CONFIG has no backendSettings
- updateConfig() is the write method

### Current forbidden keys in apiConfigGuard.js
- Missing: AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_SESSION_TOKEN,
           FIREBASE_SERVICE_ACCOUNT, GOOGLE_APPLICATION_CREDENTIALS

### Files to be touched in this upgrade
- core_storage.js               — add BACKEND_SETTINGS key + default + store
- services_supabase_apiConfigGuard.js — extend FORBIDDEN_KEYS
- services_backend_providerService.js — new provider adapter layer
- components_ui_PlatformCredit.jsx    — new shared credit component
- pages_LiveBackendSettings.jsx        — new multi-backend settings page
- app_Router.jsx                       — add /live-backend-settings route
- pages_Settings.jsx                   — update button → /live-backend-settings
- pages_SupabaseSetup.jsx              — update button → /live-backend-settings
- pages_Dashboard.jsx                  — update credit to exact wording
- layouts_Sidebar.jsx                  — update credit to exact wording
- pages_JobseekerApp.jsx               — update credit to exact wording
- pages_JobseekerPwa.jsx               — update credit to exact wording
- pages_Landing.jsx                    — update credit to exact wording
- .env.example                         — add Firebase/AWS/Custom vars

### SQL changes
None. RLS status unchanged.
