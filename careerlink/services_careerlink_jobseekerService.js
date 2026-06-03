/**
 * ============================================================
 * CareerLink OS™ — Jobseeker Service
 * SSOT service for jobseeker CRUD + status management.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { STORAGE_KEYS, genId } from './core_storage'

const JOBSEEKER_KEY = STORAGE_KEYS.JOBSEEKERS

// ─── Status constants ─────────────────────────────────────────
export const JOBSEEKER_STATUS = {
  ACTIVE:      'active',
  INACTIVE:    'inactive',
  AT_RISK:     'at_risk',
  ON_HOLD:     'on_hold',
  COMPLETED:   'completed',
  PLACED:      'placed',
}

export const RISK_LEVEL = {
  LOW:      'low',
  MEDIUM:   'medium',
  HIGH:     'high',
  CRITICAL: 'critical',
}

const persist = {
  get: (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : fallback
    } catch { return fallback }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* silent */ }
  }
}

function getAll() {
  return persist.get(JOBSEEKER_KEY, [])
}

function save(list) {
  persist.set(JOBSEEKER_KEY, list)
}

export const jobseekerService = {
  getAll,

  getById: (id) => getAll().find(j => j.id === id) || null,

  create: (data) => {
    const record = {
      id:               genId(),
      displayName:      data.displayName || 'New Jobseeker',
      email:            data.email || '',
      phone:            data.phone || '',
      status:           data.status || JOBSEEKER_STATUS.ACTIVE,
      programme:        data.programme || '',
      weeklyTargetHours: data.weeklyTargetHours ?? 35,
      riskLevel:        data.riskLevel || RISK_LEVEL.LOW,
      notes:            data.notes || '',
      isDemo:           data.isDemo || false,
      createdAt:        new Date().toISOString(),
      lastActiveAt:     new Date().toISOString(),
    }
    const list = [record, ...getAll()]
    save(list)
    return record
  },

  update: (id, patch) => {
    const list = getAll().map(j => j.id === id ? { ...j, ...patch, lastActiveAt: new Date().toISOString() } : j)
    save(list)
    return list.find(j => j.id === id) || null
  },

  delete: (id) => {
    const list = getAll().filter(j => j.id !== id)
    save(list)
  },

  getRealJobseekers: () => getAll().filter(j => !j.isDemo),

  getDemoJobseekers: () => getAll().filter(j => j.isDemo),

  removeDemoJobseekers: () => {
    const list = getAll().filter(j => !j.isDemo)
    save(list)
    return list
  },

  bulkCreate: (list) => {
    const existing = getAll()
    const merged   = [...list, ...existing]
    save(merged)
    return merged
  },
}

export default jobseekerService
