# CareerLink OS™ — Rollback Record
## Snapshot: BEFORE-RESPONSIVE-POLISH
## Created: 2026-06-06 18:40 (Europe/London)

### Files to be touched
- styles_globals.css        — responsive utilities, safe-area, scroll-to-top, overflow fixes
- layouts_AppShell.jsx      — scroll-to-top on route change, main overflow fix
- layouts_Sidebar.jsx       — mobile safe-area, footer credit text update
- layouts_TopNav.jsx        — safe-area top, mobile branding truncation
- pages_Landing.jsx         — min-width constraint on CTAButton, section padding on small screens
- pages_Dashboard.jsx       — KpiCard mobile text sizing, clock scaling
- pages_Settings.jsx        — tab overflow-x scroll, input sizing
- pages_LiveBackendSettings.jsx — tab header overflow, forbidden keys grid, form inputs
- pages_JobseekerPwa.jsx    — bottom nav safe-area, max-w full on very small screens
- pages_SupabaseSetup.jsx   — forbidden keys grid, card padding on mobile

### Exact issues identified
1. No scroll-to-top on route change (pages open mid-scroll)
2. body { overflow: hidden } but main pages have their own scroll — fine on desktop,
   but safe-area bottom not applied to fixed bottom nav in PWA
3. Landing CTAButton minWidth:180 forces horizontal scroll on 320px
4. Dashboard KpiCard: 'sub' text uses text-xs which is fine but value text can be large
5. Settings: tab row not scrollable on 320px
6. LiveBackendSettings: provider tab headers need safe overflow-x scroll
7. Sidebar footer credit text out of date ("Created by Kyzel Kreates" not full wording)
8. TopNav branding can get tight on 320px
9. JobseekerPwa fixed bottom nav needs pb-safe for iOS home bar
10. Forbidden keys grids can overflow on 320px (font-mono small text)

### SQL changes
None.
