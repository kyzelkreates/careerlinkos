/**
 * ============================================================
 * CareerLink OS™ — Live Data Service
 * services_careerlink_liveDataService.js
 *
 * Single routing layer that decides:
 *   DEMO MODE ON  → read/write local storage (existing stores)
 *   DEMO MODE OFF + Supabase configured → read/write Supabase
 *   DEMO MODE OFF + Supabase missing   → return safe empty state
 *
 * Coach Dashboard and Jobseeker PWA both call this service.
 * They do NOT call Supabase directly.
 *
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { getCLSupabaseClient, isCLSupabaseReady } from './services_supabase_clSupabaseClient'

// ── Mode helpers ──────────────────────────────────────────────

function isDemo() {
  try {
    const raw = localStorage.getItem('cl:config:app')
    if (!raw) return true
    const cfg = JSON.parse(raw)
    return cfg?.demoModeEnabled !== false
  } catch { return true }
}

function sb() {
  return getCLSupabaseClient()
}

function sbReady() {
  return !isDemo() && isCLSupabaseReady()
}

// ── Shared safe error result ──────────────────────────────────
function notConfigured() {
  return { data: [], error: 'Supabase not configured', source: 'not_configured' }
}

function demoOnly() {
  return { data: [], error: null, source: 'demo_local' }
}

// ─────────────────────────────────────────────────────────────
// JOBSEEKERS
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all jobseekers for a coach.
 * coachToken: optional access token stored in localStorage (MVP)
 */
export async function fetchJobseekers({ organisationId } = {}) {
  if (!sbReady()) return notConfigured()
  try {
    let q = sb().from('jobseekers').select('*').order('created_at', { ascending: false })
    if (organisationId) q = q.eq('organisation_id', organisationId)
    const { data, error } = await q
    return { data: data || [], error: error?.message || null, source: 'supabase' }
  } catch (e) {
    return { data: [], error: e.message, source: 'error' }
  }
}

export async function upsertJobseeker(record) {
  if (!sbReady()) return { data: null, error: 'Supabase not configured' }
  try {
    const { data, error } = await sb()
      .from('jobseekers')
      .upsert(record, { onConflict: 'id' })
      .select()
      .single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY LOGS
// ─────────────────────────────────────────────────────────────

export async function insertActivityLog(log) {
  if (!sbReady()) return { data: null, error: 'Supabase not configured', queued: false }
  try {
    const { data, error } = await sb()
      .from('activity_logs')
      .insert(log)
      .select()
      .single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

export async function fetchActivityLogs({ jobseekerId, weekStart } = {}) {
  if (!sbReady()) return notConfigured()
  try {
    let q = sb().from('activity_logs').select('*').order('date', { ascending: false })
    if (jobseekerId) q = q.eq('jobseeker_id', jobseekerId)
    if (weekStart)   q = q.gte('date', weekStart)
    const { data, error } = await q
    return { data: data || [], error: error?.message || null, source: 'supabase' }
  } catch (e) {
    return { data: [], error: e.message, source: 'error' }
  }
}

// ─────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────

export async function insertApplication(app) {
  if (!sbReady()) return { data: null, error: 'Supabase not configured' }
  try {
    const { data, error } = await sb()
      .from('applications')
      .insert(app)
      .select()
      .single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

export async function fetchApplications({ jobseekerId } = {}) {
  if (!sbReady()) return notConfigured()
  try {
    let q = sb().from('applications').select('*').order('date_applied', { ascending: false })
    if (jobseekerId) q = q.eq('jobseeker_id', jobseekerId)
    const { data, error } = await q
    return { data: data || [], error: error?.message || null, source: 'supabase' }
  } catch (e) {
    return { data: [], error: e.message, source: 'error' }
  }
}

// ─────────────────────────────────────────────────────────────
// INTERVIEWS
// ─────────────────────────────────────────────────────────────

export async function insertInterview(iv) {
  if (!sbReady()) return { data: null, error: 'Supabase not configured' }
  try {
    const { data, error } = await sb()
      .from('interviews')
      .insert(iv)
      .select()
      .single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

export async function fetchInterviews({ jobseekerId } = {}) {
  if (!sbReady()) return notConfigured()
  try {
    let q = sb().from('interviews').select('*').order('interview_date', { ascending: false })
    if (jobseekerId) q = q.eq('jobseeker_id', jobseekerId)
    const { data, error } = await q
    return { data: data || [], error: error?.message || null, source: 'supabase' }
  } catch (e) {
    return { data: [], error: e.message, source: 'error' }
  }
}

// ─────────────────────────────────────────────────────────────
// CHECK-INS
// ─────────────────────────────────────────────────────────────

export async function insertCheckIn(ci) {
  if (!sbReady()) return { data: null, error: 'Supabase not configured' }
  try {
    const { data, error } = await sb()
      .from('check_ins')
      .insert(ci)
      .select()
      .single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

export async function fetchCheckIns({ jobseekerId, since } = {}) {
  if (!sbReady()) return notConfigured()
  try {
    let q = sb().from('check_ins').select('*').order('check_in_date', { ascending: false })
    if (jobseekerId) q = q.eq('jobseeker_id', jobseekerId)
    if (since)       q = q.gte('check_in_date', since)
    const { data, error } = await q
    return { data: data || [], error: error?.message || null, source: 'supabase' }
  } catch (e) {
    return { data: [], error: e.message, source: 'error' }
  }
}

// ─────────────────────────────────────────────────────────────
// EVIDENCE RECORDS
// ─────────────────────────────────────────────────────────────

export async function insertEvidenceRecord(ev) {
  if (!sbReady()) return { data: null, error: 'Supabase not configured' }
  try {
    const { data, error } = await sb()
      .from('evidence_records')
      .insert(ev)
      .select()
      .single()
    return { data, error: error?.message || null }
  } catch (e) {
    return { data: null, error: e.message }
  }
}

export async function fetchEvidenceRecords({ jobseekerId } = {}) {
  if (!sbReady()) return notConfigured()
  try {
    let q = sb().from('evidence_records').select('*').order('created_at', { ascending: false })
    if (jobseekerId) q = q.eq('jobseeker_id', jobseekerId)
    const { data, error } = await q
    return { data: data || [], error: error?.message || null, source: 'supabase' }
  } catch (e) {
    return { data: [], error: e.message, source: 'error' }
  }
}

// ─────────────────────────────────────────────────────────────
// PWA ACCESS LINKS
// ─────────────────────────────────────────────────────────────

/**
 * Generate a deterministic public link ID from jobseeker ID.
 * In production, this would be stored in pwa_access_links table.
 * MVP: derive from id so no round-trip is needed for link generation.
 */
export function generatePwaLinkId(jobseekerId) {
  // Simple deterministic: first 8 chars of jobseekerId + timestamp hash
  const base = jobseekerId?.replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'js'
  return `${base}-${Math.abs(hashStr(jobseekerId)).toString(36).slice(0, 6)}`
}

function hashStr(str) {
  let h = 0
  for (let i = 0; i < (str || '').length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return h
}

/**
 * Store PWA access link in Supabase (live mode).
 * MVP: also stores jobseekerId in localStorage for lookup.
 */
export async function createPwaAccessLink(jobseekerId, jobseekerName) {
  const publicLinkId = generatePwaLinkId(jobseekerId)

  // Always store locally for demo / fallback lookup
  try {
    const existing = JSON.parse(localStorage.getItem('cl:pwa:links') || '{}')
    existing[publicLinkId] = { jobseekerId, jobseekerName, createdAt: new Date().toISOString() }
    localStorage.setItem('cl:pwa:links', JSON.stringify(existing))
  } catch {}

  if (sbReady()) {
    try {
      await sb().from('pwa_access_links').upsert({
        public_link_id: publicLinkId,
        jobseeker_id:   jobseekerId,
        created_at:     new Date().toISOString(),
        is_active:      true,
      }, { onConflict: 'public_link_id' })
    } catch (e) {
      console.warn('[CL:PWA] Could not store link in Supabase:', e.message)
    }
  }

  return publicLinkId
}

/**
 * Look up jobseekerId from a public PWA link ID.
 * Checks localStorage first (works for demo), then Supabase.
 */
export async function resolveJobseekerFromLink(publicLinkId) {
  // Local lookup first (works offline / demo)
  try {
    const local = JSON.parse(localStorage.getItem('cl:pwa:links') || '{}')
    if (local[publicLinkId]) {
      return { jobseekerId: local[publicLinkId].jobseekerId, source: 'local' }
    }
  } catch {}

  // Supabase lookup (live mode)
  if (sbReady()) {
    try {
      const { data, error } = await sb()
        .from('pwa_access_links')
        .select('jobseeker_id')
        .eq('public_link_id', publicLinkId)
        .eq('is_active', true)
        .single()
      if (data?.jobseeker_id) {
        return { jobseekerId: data.jobseeker_id, source: 'supabase' }
      }
    } catch {}
  }

  return { jobseekerId: null, source: 'not_found' }
}

// ─────────────────────────────────────────────────────────────
// COACH DASHBOARD — aggregated read (live mode)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch full dashboard data from Supabase.
 * Returns all required metrics for the coach dashboard.
 * Caller must check isDemoMode first — this is live mode only.
 */
export async function fetchDashboardData({ organisationId } = {}) {
  if (!sbReady()) {
    return {
      jobseekers:     [],
      activityLogs:   [],
      applications:   [],
      interviews:     [],
      checkIns:       [],
      evidenceRecords:[],
      supportFlags:   [],
      tasks:          [],
      error:          'Supabase not configured',
      source:         'not_configured',
      lastSynced:     null,
    }
  }

  try {
    const [jsRes, actRes, appRes, ivRes, ciRes, evRes] = await Promise.all([
      sb().from('jobseekers').select('*').order('created_at', { ascending: false }),
      sb().from('activity_logs').select('*').order('date', { ascending: false }).limit(500),
      sb().from('applications').select('*').order('date_applied', { ascending: false }).limit(500),
      sb().from('interviews').select('*').order('interview_date', { ascending: false }).limit(200),
      sb().from('check_ins').select('*').order('check_in_date', { ascending: false }).limit(500),
      sb().from('evidence_records').select('*').order('created_at', { ascending: false }).limit(500),
    ])

    return {
      jobseekers:      jsRes.data  || [],
      activityLogs:    actRes.data || [],
      applications:    appRes.data || [],
      interviews:      ivRes.data  || [],
      checkIns:        ciRes.data  || [],
      evidenceRecords: evRes.data  || [],
      supportFlags:    [],  // derived from risk levels for now
      tasks:           [],
      error:           null,
      source:          'supabase',
      lastSynced:      new Date().toISOString(),
    }
  } catch (e) {
    return {
      jobseekers: [], activityLogs: [], applications: [],
      interviews: [], checkIns: [], evidenceRecords: [],
      supportFlags: [], tasks: [],
      error: e.message, source: 'error', lastSynced: null,
    }
  }
}

// ─────────────────────────────────────────────────────────────
// DATA NORMALISATION — Supabase snake_case → local camelCase
// ─────────────────────────────────────────────────────────────

export function normaliseJobseeker(r) {
  if (!r) return null
  return {
    id:                r.id,
    displayName:       r.display_name || r.full_name || '',
    email:             r.email || '',
    phone:             r.phone || '',
    status:            r.status || 'active',
    programme:         r.programme || '',
    weeklyTargetHours: r.weekly_target_hours ?? 35,
    riskLevel:         r.risk_level || 'low',
    notes:             r.notes || '',
    isDemo:            false,
    createdAt:         r.created_at,
    lastActiveAt:      r.last_active_at || r.updated_at || r.created_at,
    coachId:           r.coach_id,
    organisationId:    r.organisation_id,
    pwaLinkId:         r.pwa_link_id,
  }
}

export function normaliseActivityLog(r) {
  if (!r) return null
  return {
    id:              r.id,
    jobseekerId:     r.jobseeker_id,
    date:            r.date,
    startTime:       r.start_time,
    endTime:         r.end_time,
    durationMinutes: r.duration_minutes || 0,
    activityType:    r.activity_type || '',
    description:     r.description || '',
    notes:           r.notes || '',
    evidenceIds:     r.evidence_ids || [],
    isDemo:          false,
    createdAt:       r.created_at,
  }
}

export function normaliseApplication(r) {
  if (!r) return null
  return {
    id:          r.id,
    jobseekerId: r.jobseeker_id,
    employer:    r.employer || '',
    roleTitle:   r.role_title || '',
    source:      r.source || '',
    dateApplied: r.date_applied,
    status:      r.status || 'Applied',
    notes:       r.notes || '',
    evidenceIds: r.evidence_ids || [],
    isDemo:      false,
    createdAt:   r.created_at,
  }
}

export function normaliseInterview(r) {
  if (!r) return null
  return {
    id:               r.id,
    jobseekerId:      r.jobseeker_id,
    employer:         r.employer || '',
    roleTitle:        r.role_title || '',
    dateTime:         r.interview_date,
    locationOrLink:   r.location_or_link || '',
    preparationTasks: r.preparation_tasks || '',
    outcome:          r.outcome || '',
    notes:            r.notes || '',
    isDemo:           false,
    createdAt:        r.created_at,
  }
}

export function normaliseCheckIn(r) {
  if (!r) return null
  return {
    id:            r.id,
    jobseekerId:   r.jobseeker_id,
    date:          r.check_in_date,
    answers:       r.answers || {},
    hoursReported: r.hours_reported || 0,
    supportNeeded: r.support_needed || false,
    barrierFlags:  r.barrier_flags || [],
    notes:         r.notes || '',
    isDemo:        false,
    createdAt:     r.created_at,
  }
}

export function normaliseEvidenceRecord(r) {
  if (!r) return null
  return {
    id:              r.id,
    jobseekerId:     r.jobseeker_id,
    title:           r.title || '',
    evidenceType:    r.evidence_type || '',
    linkedRecordType:r.linked_record_type || '',
    linkedRecordId:  r.linked_record_id || '',
    date:            r.evidence_date || r.created_at,
    notes:           r.notes || '',
    fileUrl:         r.file_url || '',
    isDemo:          false,
    createdAt:       r.created_at,
  }
}

export default {
  fetchJobseekers, upsertJobseeker,
  insertActivityLog, fetchActivityLogs,
  insertApplication, fetchApplications,
  insertInterview, fetchInterviews,
  insertCheckIn, fetchCheckIns,
  insertEvidenceRecord, fetchEvidenceRecords,
  createPwaAccessLink, resolveJobseekerFromLink, generatePwaLinkId,
  fetchDashboardData,
  normaliseJobseeker, normaliseActivityLog, normaliseApplication,
  normaliseInterview, normaliseCheckIn, normaliseEvidenceRecord,
}
