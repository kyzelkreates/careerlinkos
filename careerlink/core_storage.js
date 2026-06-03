/**
 * ============================================================
 * CareerLink OS™ — SINGLE SOURCE OF TRUTH
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * ALL system state reads and writes go through this module.
 * NO secondary state engines.
 * NO duplicate localStorage keys.
 * NO hard-coded UI state outside this file.
 * ============================================================
 */

import { create } from 'zustand'

// ─── Storage Keys ─────────────────────────────────────────────
export const STORAGE_KEYS = {
  // App
  APP_THEME:          'cl:app:theme',
  APP_SIDEBAR:        'cl:app:sidebar',
  APP_LOCALE:         'cl:app:locale',

  // Auth
  AUTH_SESSION:       'cl:auth:session',
  AUTH_USER:          'cl:auth:user',
  AUTH_ROLE:          'cl:auth:role',

  // Config
  APP_CONFIG:         'cl:config:app',

  // AI
  AI_PROVIDER:        'cl:ai:provider',
  AI_MODEL:           'cl:ai:model',
  AI_CONFIG:          'cl:ai:config',

  // Jobseeker (PWA)
  JOBSEEKER_SESSION:  'cl:jobseeker:session',
  JOBSEEKER_SELECTED: 'cl:jobseeker:selected',

  // Data
  JOBSEEKERS:         'cl:data:jobseekers',
  ACTIVITY_LOGS:      'cl:data:activityLogs',
  APPLICATIONS:       'cl:data:applications',
  INTERVIEWS:         'cl:data:interviews',
  CHECKINS:           'cl:data:checkIns',
  EVIDENCE:           'cl:data:evidenceRecords',
  TASKS:              'cl:data:tasks',
  SUPPORT_FLAGS:      'cl:data:supportFlags',
  COACH_NOTES:        'cl:data:coachNotes',

  // Notifications
  NOTIF_QUEUE:        'cl:notif:queue',
  NOTIF_PREFS:        'cl:notif:prefs',
}

// ─── Persist Helpers ──────────────────────────────────────────
const persist = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('[CareerLink:Storage] persist.set failed:', key, e)
    }
  },
  remove: (key) => {
    try { localStorage.removeItem(key) } catch { /* silent */ }
  },
  clear: (prefix = 'cl:') => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(prefix))
        .forEach(k => localStorage.removeItem(k))
    } catch { /* silent */ }
  }
}

// ─── ID Generator ─────────────────────────────────────────────
export const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

// ─── App Config Store (CareerLink programme settings) ─────────
const DEFAULT_APP_CONFIG = {
  appName:                   'CareerLink OS™',
  brandLine:                 'Powered by 4P3X Intelligent AI — Created by Kyzel Kreates',
  organisationName:          'CareerLink Employment Support',
  weeklyTargetHoursDefault:  35,
  applicationTargetDefault:  5,
  checkInFrequency:          'daily',
  evidenceRequired:          true,
  demoModeEnabled:           true,
  pwaInstallEnabled:         true,
}

export const useConfigStore = create((set, get) => ({
  config: persist.get(STORAGE_KEYS.APP_CONFIG, DEFAULT_APP_CONFIG),

  getConfig: () => get().config,

  updateConfig: (patch) => {
    const next = { ...get().config, ...patch }
    persist.set(STORAGE_KEYS.APP_CONFIG, next)
    set({ config: next })
  },

  setDemoMode: (enabled) => {
    const next = { ...get().config, demoModeEnabled: enabled }
    persist.set(STORAGE_KEYS.APP_CONFIG, next)
    set({ config: next })
  },

  isDemoMode: () => get().config.demoModeEnabled,

  getWeeklyTarget: () => get().config.weeklyTargetHoursDefault ?? 35,

  resetConfig: () => {
    persist.set(STORAGE_KEYS.APP_CONFIG, DEFAULT_APP_CONFIG)
    set({ config: DEFAULT_APP_CONFIG })
  }
}))

// ─── App Store ────────────────────────────────────────────────
export const useAppStore = create((set, get) => ({
  theme:           persist.get(STORAGE_KEYS.APP_THEME, 'dark'),
  sidebarExpanded: false,
  locale:          persist.get(STORAGE_KEYS.APP_LOCALE, 'en'),
  systemStatus:    'online',
  notifications:   [],
  alerts:          [],

  setTheme: (theme) => {
    persist.set(STORAGE_KEYS.APP_THEME, theme)
    set({ theme })
  },
  toggleSidebar: () => {
    const next = !get().sidebarExpanded
    persist.set(STORAGE_KEYS.APP_SIDEBAR, next)
    set({ sidebarExpanded: next })
  },
  setSidebarExpanded: (val) => {
    persist.set(STORAGE_KEYS.APP_SIDEBAR, val)
    set({ sidebarExpanded: val })
  },
  closeSidebar: () => set({ sidebarExpanded: false }),
  openSidebar:  () => set({ sidebarExpanded: true }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  addNotification: (notif) => set(s => ({
    notifications: [{ id: Date.now(), ...notif }, ...s.notifications].slice(0, 50)
  })),
  clearNotifications: () => set({ notifications: [] }),
  addAlert: (alert) => set(s => ({
    alerts: [{ id: Date.now(), ...alert }, ...s.alerts].slice(0, 20)
  })),
  dismissAlert: (id) => set(s => ({
    alerts: s.alerts.filter(a => a.id !== id)
  })),
}))

// ─── Auth Store ───────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  session:         persist.get(STORAGE_KEYS.AUTH_SESSION, null),
  user:            persist.get(STORAGE_KEYS.AUTH_USER, null),
  role:            persist.get(STORAGE_KEYS.AUTH_ROLE, null),
  isLoading:       false,
  isAuthenticated: false,

  setSession: (session) => {
    persist.set(STORAGE_KEYS.AUTH_SESSION, session)
    set({ session, isAuthenticated: !!session })
  },
  setUser: (user) => {
    persist.set(STORAGE_KEYS.AUTH_USER, user)
    set({ user })
  },
  setRole: (role) => {
    persist.set(STORAGE_KEYS.AUTH_ROLE, role)
    set({ role })
  },
  setLoading: (isLoading) => set({ isLoading }),
  clearAuth: () => {
    persist.remove(STORAGE_KEYS.AUTH_SESSION)
    persist.remove(STORAGE_KEYS.AUTH_USER)
    persist.remove(STORAGE_KEYS.AUTH_ROLE)
    set({ session: null, user: null, role: null, isAuthenticated: false })
  }
}))

// ─── AI Store ─────────────────────────────────────────────────
export const useAIStore = create((set) => ({
  provider:       persist.get(STORAGE_KEYS.AI_PROVIDER, 'openai'),
  model:          persist.get(STORAGE_KEYS.AI_MODEL, null),
  config:         persist.get(STORAGE_KEYS.AI_CONFIG, {}),
  status:         'idle',
  activeModule:   null,
  tokenUsage:     { prompt: 0, completion: 0, total: 0 },
  costEstimate:   0,
  fallbackActive: false,

  setProvider: (provider) => {
    persist.set(STORAGE_KEYS.AI_PROVIDER, provider)
    set({ provider })
  },
  setModel: (model) => {
    persist.set(STORAGE_KEYS.AI_MODEL, model)
    set({ model })
  },
  setConfig: (config) => {
    persist.set(STORAGE_KEYS.AI_CONFIG, config)
    set({ config })
  },
  setStatus:         (status) => set({ status }),
  setActiveModule:   (module) => set({ activeModule: module }),
  setFallbackActive: (val)    => set({ fallbackActive: val }),
  updateTokenUsage:  (usage)  => set(s => ({
    tokenUsage: {
      prompt:     s.tokenUsage.prompt + (usage.prompt || 0),
      completion: s.tokenUsage.completion + (usage.completion || 0),
      total:      s.tokenUsage.total + (usage.total || 0)
    }
  })),
}))

// ─── Jobseeker Store ──────────────────────────────────────────
export const useJobseekerStore = create((set) => ({
  jobseekers:        [],
  activeJobseeker:   persist.get(STORAGE_KEYS.JOBSEEKER_SELECTED, null),
  jobseekerSession:  persist.get(STORAGE_KEYS.JOBSEEKER_SESSION, null),
  isLoading:         false,

  setJobseekers:      (jobseekers)      => set({ jobseekers }),
  setActiveJobseeker: (jobseeker) => {
    persist.set(STORAGE_KEYS.JOBSEEKER_SELECTED, jobseeker)
    set({ activeJobseeker: jobseeker })
  },
  setJobseekerSession: (session) => {
    persist.set(STORAGE_KEYS.JOBSEEKER_SESSION, session)
    set({ jobseekerSession: session })
  },
  setLoading: (isLoading) => set({ isLoading })
}))

// ─── Data Store — all CareerLink records ──────────────────────
export const useDataStore = create((set, get) => ({
  activityLogs:   persist.get(STORAGE_KEYS.ACTIVITY_LOGS, []),
  applications:   persist.get(STORAGE_KEYS.APPLICATIONS, []),
  interviews:     persist.get(STORAGE_KEYS.INTERVIEWS, []),
  checkIns:       persist.get(STORAGE_KEYS.CHECKINS, []),
  evidenceRecords: persist.get(STORAGE_KEYS.EVIDENCE, []),
  tasks:          persist.get(STORAGE_KEYS.TASKS, []),
  supportFlags:   persist.get(STORAGE_KEYS.SUPPORT_FLAGS, []),
  coachNotes:     persist.get(STORAGE_KEYS.COACH_NOTES, []),

  // ── Activity Logs ──
  addActivityLog: (log) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), ...log }, ...get().activityLogs]
    persist.set(STORAGE_KEYS.ACTIVITY_LOGS, next)
    set({ activityLogs: next })
  },
  updateActivityLog: (id, patch) => {
    const next = get().activityLogs.map(r => r.id === id ? { ...r, ...patch } : r)
    persist.set(STORAGE_KEYS.ACTIVITY_LOGS, next)
    set({ activityLogs: next })
  },
  deleteActivityLog: (id) => {
    const next = get().activityLogs.filter(r => r.id !== id)
    persist.set(STORAGE_KEYS.ACTIVITY_LOGS, next)
    set({ activityLogs: next })
  },

  // ── Applications ──
  addApplication: (app) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), ...app }, ...get().applications]
    persist.set(STORAGE_KEYS.APPLICATIONS, next)
    set({ applications: next })
  },
  updateApplication: (id, patch) => {
    const next = get().applications.map(r => r.id === id ? { ...r, ...patch } : r)
    persist.set(STORAGE_KEYS.APPLICATIONS, next)
    set({ applications: next })
  },
  deleteApplication: (id) => {
    const next = get().applications.filter(r => r.id !== id)
    persist.set(STORAGE_KEYS.APPLICATIONS, next)
    set({ applications: next })
  },

  // ── Interviews ──
  addInterview: (iv) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), ...iv }, ...get().interviews]
    persist.set(STORAGE_KEYS.INTERVIEWS, next)
    set({ interviews: next })
  },
  updateInterview: (id, patch) => {
    const next = get().interviews.map(r => r.id === id ? { ...r, ...patch } : r)
    persist.set(STORAGE_KEYS.INTERVIEWS, next)
    set({ interviews: next })
  },
  deleteInterview: (id) => {
    const next = get().interviews.filter(r => r.id !== id)
    persist.set(STORAGE_KEYS.INTERVIEWS, next)
    set({ interviews: next })
  },

  // ── Check-ins ──
  addCheckIn: (ci) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), ...ci }, ...get().checkIns]
    persist.set(STORAGE_KEYS.CHECKINS, next)
    set({ checkIns: next })
  },

  // ── Evidence ──
  addEvidence: (ev) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), ...ev }, ...get().evidenceRecords]
    persist.set(STORAGE_KEYS.EVIDENCE, next)
    set({ evidenceRecords: next })
  },
  updateEvidence: (id, patch) => {
    const next = get().evidenceRecords.map(r => r.id === id ? { ...r, ...patch } : r)
    persist.set(STORAGE_KEYS.EVIDENCE, next)
    set({ evidenceRecords: next })
  },
  deleteEvidence: (id) => {
    const next = get().evidenceRecords.filter(r => r.id !== id)
    persist.set(STORAGE_KEYS.EVIDENCE, next)
    set({ evidenceRecords: next })
  },

  // ── Tasks ──
  addTask: (task) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), status: 'pending', ...task }, ...get().tasks]
    persist.set(STORAGE_KEYS.TASKS, next)
    set({ tasks: next })
  },
  updateTask: (id, patch) => {
    const next = get().tasks.map(r => r.id === id ? { ...r, ...patch } : r)
    persist.set(STORAGE_KEYS.TASKS, next)
    set({ tasks: next })
  },
  deleteTask: (id) => {
    const next = get().tasks.filter(r => r.id !== id)
    persist.set(STORAGE_KEYS.TASKS, next)
    set({ tasks: next })
  },

  // ── Support Flags ──
  addSupportFlag: (flag) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), status: 'open', ...flag }, ...get().supportFlags]
    persist.set(STORAGE_KEYS.SUPPORT_FLAGS, next)
    set({ supportFlags: next })
  },
  updateSupportFlag: (id, patch) => {
    const next = get().supportFlags.map(r => r.id === id ? { ...r, ...patch } : r)
    persist.set(STORAGE_KEYS.SUPPORT_FLAGS, next)
    set({ supportFlags: next })
  },

  // ── Coach Notes ──
  addCoachNote: (note) => {
    const next = [{ id: genId(), createdAt: new Date().toISOString(), ...note }, ...get().coachNotes]
    persist.set(STORAGE_KEYS.COACH_NOTES, next)
    set({ coachNotes: next })
  },
  deleteCoachNote: (id) => {
    const next = get().coachNotes.filter(r => r.id !== id)
    persist.set(STORAGE_KEYS.COACH_NOTES, next)
    set({ coachNotes: next })
  },

  // ── Bulk load (used by demo data service) ──
  bulkLoad: (data) => {
    const updates = {}
    if (data.activityLogs)    { persist.set(STORAGE_KEYS.ACTIVITY_LOGS,  data.activityLogs);    updates.activityLogs = data.activityLogs }
    if (data.applications)    { persist.set(STORAGE_KEYS.APPLICATIONS,    data.applications);    updates.applications = data.applications }
    if (data.interviews)      { persist.set(STORAGE_KEYS.INTERVIEWS,      data.interviews);      updates.interviews = data.interviews }
    if (data.checkIns)        { persist.set(STORAGE_KEYS.CHECKINS,        data.checkIns);        updates.checkIns = data.checkIns }
    if (data.evidenceRecords) { persist.set(STORAGE_KEYS.EVIDENCE,        data.evidenceRecords); updates.evidenceRecords = data.evidenceRecords }
    if (data.tasks)           { persist.set(STORAGE_KEYS.TASKS,           data.tasks);           updates.tasks = data.tasks }
    if (data.supportFlags)    { persist.set(STORAGE_KEYS.SUPPORT_FLAGS,   data.supportFlags);    updates.supportFlags = data.supportFlags }
    if (data.coachNotes)      { persist.set(STORAGE_KEYS.COACH_NOTES,     data.coachNotes);      updates.coachNotes = data.coachNotes }
    set(updates)
  },

  // ── Remove all demo records ──
  removeDemoRecords: () => {
    const keys = ['activityLogs', 'applications', 'interviews', 'checkIns', 'evidenceRecords', 'tasks', 'supportFlags', 'coachNotes']
    const storageMap = {
      activityLogs: STORAGE_KEYS.ACTIVITY_LOGS,
      applications: STORAGE_KEYS.APPLICATIONS,
      interviews:   STORAGE_KEYS.INTERVIEWS,
      checkIns:     STORAGE_KEYS.CHECKINS,
      evidenceRecords: STORAGE_KEYS.EVIDENCE,
      tasks:        STORAGE_KEYS.TASKS,
      supportFlags: STORAGE_KEYS.SUPPORT_FLAGS,
      coachNotes:   STORAGE_KEYS.COACH_NOTES,
    }
    const updates = {}
    keys.forEach(k => {
      const filtered = (get()[k] || []).filter(r => !r.isDemo)
      persist.set(storageMap[k], filtered)
      updates[k] = filtered
    })
    set(updates)
  }
}))

// ─── Derived Metrics Helper ────────────────────────────────────
export function deriveJobseekerMetrics(jobseekerId, stores, weeklyTarget = 35) {
  const { activityLogs, applications, interviews, checkIns } = stores

  const now    = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const inWeek = (dateStr) => {
    const d = new Date(dateStr)
    return d >= monday && d <= sunday
  }

  const jsLogs   = activityLogs.filter(r => r.jobseekerId === jobseekerId)
  const weekLogs = jsLogs.filter(r => inWeek(r.date || r.createdAt))
  const weeklyHours = weekLogs.reduce((sum, r) => sum + ((r.durationMinutes || 0) / 60), 0)
  const weeklyTargetPercent = Math.min(100, Math.round((weeklyHours / weeklyTarget) * 100))

  const jsApps   = applications.filter(r => r.jobseekerId === jobseekerId)
  const weekApps = jsApps.filter(r => inWeek(r.dateApplied || r.createdAt))

  const jsInterviews = interviews.filter(r => r.jobseekerId === jobseekerId)
  const upcoming     = jsInterviews.filter(r => new Date(r.dateTime) >= now)

  const jsCheckIns  = checkIns.filter(r => r.jobseekerId === jobseekerId)
  const weekCheckIns = jsCheckIns.filter(r => inWeek(r.date || r.createdAt))

  let progressStatus = 'on_track'
  if (weeklyTargetPercent >= 100)     progressStatus = 'target_complete'
  else if (weeklyTargetPercent >= 60) progressStatus = 'on_track'
  else if (weeklyTargetPercent >= 30) progressStatus = 'needs_attention'
  else                                progressStatus = 'high_risk'

  return {
    weeklyHoursLogged:    Math.round(weeklyHours * 10) / 10,
    weeklyTargetPercent,
    progressStatus,
    applicationCountWeek: weekApps.length,
    interviewsUpcoming:   upcoming.length,
    checkInsThisWeek:     weekCheckIns.length,
    lastCheckIn:          jsCheckIns[0]?.date || jsCheckIns[0]?.createdAt || null,
  }
}

export { persist, genId as default }
