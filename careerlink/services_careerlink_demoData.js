/**
 * ============================================================
 * CareerLink OS™ — Demo Data Service
 * Generates presentation-safe demo records.
 * ALL demo records are marked isDemo: true.
 * Demo mode ON/OFF is controlled by useConfigStore.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { genId } from './core_storage'

const now = () => new Date().toISOString()
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()
const weeksAgo = (n) => daysAgo(n * 7)
const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString()

// ─── Demo Jobseekers ──────────────────────────────────────────
export const DEMO_JOBSEEKERS = [
  {
    id: 'demo_js_001',
    displayName: 'Jordan Mitchell',
    email: 'jordan.m@demo.careerlinkos',
    phone: '07700 000001',
    status: 'active',
    programme: 'Restart Scheme',
    weeklyTargetHours: 35,
    riskLevel: 'low',
    notes: 'Strong digital skills. Targeting admin and customer service roles.',
    isDemo: true,
    createdAt: weeksAgo(6),
    lastActiveAt: daysAgo(1),
  },
  {
    id: 'demo_js_002',
    displayName: 'Amara Osei',
    email: 'amara.o@demo.careerlinkos',
    phone: '07700 000002',
    status: 'at_risk',
    programme: 'Work & Health Programme',
    weeklyTargetHours: 35,
    riskLevel: 'high',
    notes: 'Childcare barrier flagged. May need flexible appointment times.',
    isDemo: true,
    createdAt: weeksAgo(8),
    lastActiveAt: daysAgo(5),
  },
  {
    id: 'demo_js_003',
    displayName: 'Ryan Clarke',
    email: 'ryan.c@demo.careerlinkos',
    phone: '07700 000003',
    status: 'active',
    programme: 'Restart Scheme',
    weeklyTargetHours: 35,
    riskLevel: 'medium',
    notes: 'Making steady progress. CV updated. First interviews coming up.',
    isDemo: true,
    createdAt: weeksAgo(4),
    lastActiveAt: daysAgo(2),
  },
  {
    id: 'demo_js_004',
    displayName: 'Priya Sharma',
    email: 'priya.s@demo.careerlinkos',
    phone: '07700 000004',
    status: 'active',
    programme: 'Sector-Based Work Academy',
    weeklyTargetHours: 20,
    riskLevel: 'low',
    notes: 'Enrolled in warehouse logistics training. On track.',
    isDemo: true,
    createdAt: weeksAgo(3),
    lastActiveAt: daysAgo(1),
  },
  {
    id: 'demo_js_005',
    displayName: 'Leon Fraser',
    email: 'leon.f@demo.careerlinkos',
    phone: '07700 000005',
    status: 'inactive',
    programme: 'Local Authority Support',
    weeklyTargetHours: 35,
    riskLevel: 'critical',
    notes: 'No check-in for 10 days. Wellbeing check recommended.',
    isDemo: true,
    createdAt: weeksAgo(10),
    lastActiveAt: daysAgo(10),
  },
]

// ─── Demo Activity Logs ───────────────────────────────────────
export const DEMO_ACTIVITY_LOGS = [
  {
    id: 'demo_al_001', jobseekerId: 'demo_js_001',
    date: daysAgo(0), startTime: '09:00', endTime: '12:00', durationMinutes: 180,
    activityType: 'Job search', description: 'Searched Indeed and Reed for admin roles in city centre.',
    evidenceIds: [], notes: '', createdAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo_al_002', jobseekerId: 'demo_js_001',
    date: daysAgo(1), startTime: '14:00', endTime: '15:30', durationMinutes: 90,
    activityType: 'Job application', description: 'Applied to Office Manager role at Horizon Ltd.',
    evidenceIds: ['demo_ev_001'], notes: 'Good match for experience.', createdAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo_al_003', jobseekerId: 'demo_js_001',
    date: daysAgo(2), startTime: '10:00', endTime: '11:00', durationMinutes: 60,
    activityType: 'CV update', description: 'Updated skills section with recent Microsoft Office training.',
    evidenceIds: [], notes: '', createdAt: daysAgo(2), isDemo: true,
  },
  {
    id: 'demo_al_004', jobseekerId: 'demo_js_003',
    date: daysAgo(0), startTime: '09:30', endTime: '11:30', durationMinutes: 120,
    activityType: 'Interview preparation', description: 'Practised interview questions for Barclays call centre role.',
    evidenceIds: [], notes: '', createdAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo_al_005', jobseekerId: 'demo_js_003',
    date: daysAgo(1), startTime: '13:00', endTime: '14:00', durationMinutes: 60,
    activityType: 'Job search', description: 'Searched LinkedIn for customer service vacancies.',
    evidenceIds: [], notes: '', createdAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo_al_006', jobseekerId: 'demo_js_004',
    date: daysAgo(0), startTime: '08:00', endTime: '16:00', durationMinutes: 480,
    activityType: 'Training / course', description: 'Full day warehouse operations training at provider site.',
    evidenceIds: ['demo_ev_002'], notes: 'Excellent attendance.', createdAt: daysAgo(0), isDemo: true,
  },
]

// ─── Demo Applications ────────────────────────────────────────
export const DEMO_APPLICATIONS = [
  {
    id: 'demo_app_001', jobseekerId: 'demo_js_001',
    employer: 'Horizon Ltd', roleTitle: 'Office Manager',
    source: 'Reed', dateApplied: daysAgo(1),
    status: 'Awaiting response', evidenceIds: ['demo_ev_001'], notes: 'Strong match.',
    createdAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo_app_002', jobseekerId: 'demo_js_001',
    employer: 'City Council', roleTitle: 'Administrative Assistant',
    source: 'Indeed', dateApplied: daysAgo(4),
    status: 'Interview offered', evidenceIds: [], notes: 'Interview confirmed for next Monday.',
    createdAt: daysAgo(4), isDemo: true,
  },
  {
    id: 'demo_app_003', jobseekerId: 'demo_js_003',
    employer: 'Barclays', roleTitle: 'Customer Service Advisor',
    source: 'LinkedIn', dateApplied: daysAgo(3),
    status: 'Applied', evidenceIds: [], notes: '',
    createdAt: daysAgo(3), isDemo: true,
  },
  {
    id: 'demo_app_004', jobseekerId: 'demo_js_003',
    employer: 'TalkTalk', roleTitle: 'Contact Centre Agent',
    source: 'Total Jobs', dateApplied: daysAgo(6),
    status: 'Rejected', evidenceIds: [], notes: 'No feedback provided.',
    createdAt: daysAgo(6), isDemo: true,
  },
  {
    id: 'demo_app_005', jobseekerId: 'demo_js_002',
    employer: 'Asda', roleTitle: 'Part-time Customer Host',
    source: 'Indeed', dateApplied: daysAgo(8),
    status: 'Awaiting response', evidenceIds: [], notes: 'School hours only applied for.',
    createdAt: daysAgo(8), isDemo: true,
  },
]

// ─── Demo Interviews ──────────────────────────────────────────
export const DEMO_INTERVIEWS = [
  {
    id: 'demo_iv_001', jobseekerId: 'demo_js_001',
    employer: 'City Council', roleTitle: 'Administrative Assistant',
    dateTime: hoursFromNow(48), locationOrLink: 'Town Hall, Room 3B',
    preparationTasks: 'Review job description. Prepare STAR examples. Smart dress.',
    outcome: '', notes: 'Confirmed via email.',
    createdAt: daysAgo(2), isDemo: true,
  },
  {
    id: 'demo_iv_002', jobseekerId: 'demo_js_003',
    employer: 'Barclays', roleTitle: 'Customer Service Advisor',
    dateTime: hoursFromNow(72), locationOrLink: 'https://teams.microsoft.com/demo',
    preparationTasks: 'Research Barclays values. Practice telephone manner.',
    outcome: '', notes: 'Teams video call — link sent by recruiter.',
    createdAt: daysAgo(1), isDemo: true,
  },
]

// ─── Demo Check-ins ───────────────────────────────────────────
const CHECK_IN_QUESTIONS = [
  'Did you complete job-search activity today?',
  'How many hours did you spend on job-search activity?',
  'Did you apply for any jobs today?',
  'Did you contact any employers or recruiters?',
  'Did you update your CV, cover letter, or portfolio?',
  'Do you have any interviews coming up?',
  'Are there any barriers stopping you from job searching?',
  'Do you need support from your coach or advisor?',
  'How confident do you feel about your progress today?',
  'What is your priority for tomorrow?',
]

export const DEMO_CHECKINS = [
  {
    id: 'demo_ci_001', jobseekerId: 'demo_js_001',
    date: daysAgo(0),
    answers: {
      0: 'Yes', 1: '3', 2: 'No', 3: 'No', 4: 'Yes',
      5: 'Yes', 6: 'No', 7: 'No', 8: '8/10', 9: 'Apply for 2 more roles.'
    },
    hoursReported: 3, supportNeeded: false, confidenceScore: 8,
    barrierFlags: [], notes: 'Good day overall.',
    createdAt: daysAgo(0), isDemo: true,
  },
  {
    id: 'demo_ci_002', jobseekerId: 'demo_js_001',
    date: daysAgo(1),
    answers: {
      0: 'Yes', 1: '2.5', 2: 'Yes', 3: 'No', 4: 'No',
      5: 'Yes', 6: 'No', 7: 'No', 8: '7/10', 9: 'Prepare for interview.'
    },
    hoursReported: 2.5, supportNeeded: false, confidenceScore: 7,
    barrierFlags: [], notes: '',
    createdAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo_ci_003', jobseekerId: 'demo_js_002',
    date: daysAgo(5),
    answers: {
      0: 'Partially', 1: '1', 2: 'No', 3: 'No', 4: 'No',
      5: 'No', 6: 'Yes — childcare issues', 7: 'Yes', 8: '4/10', 9: 'Speak to coach about support.'
    },
    hoursReported: 1, supportNeeded: true, confidenceScore: 4,
    barrierFlags: ['childcare_barrier', 'confidence_issue'],
    notes: 'Struggling this week due to childcare. Needs support call.',
    createdAt: daysAgo(5), isDemo: true,
  },
  {
    id: 'demo_ci_004', jobseekerId: 'demo_js_003',
    date: daysAgo(0),
    answers: {
      0: 'Yes', 1: '2', 2: 'Yes', 3: 'No', 4: 'No',
      5: 'Yes', 6: 'No', 7: 'No', 8: '7/10', 9: 'Interview prep for Barclays.'
    },
    hoursReported: 2, supportNeeded: false, confidenceScore: 7,
    barrierFlags: [], notes: '',
    createdAt: daysAgo(0), isDemo: true,
  },
]

// ─── Demo Evidence ────────────────────────────────────────────
export const DEMO_EVIDENCE = [
  {
    id: 'demo_ev_001', jobseekerId: 'demo_js_001',
    title: 'Horizon Ltd Application Confirmation',
    evidenceType: 'Application confirmation',
    linkedRecordType: 'application', linkedRecordId: 'demo_app_001',
    date: daysAgo(1), notes: 'Email screenshot saved.',
    filePlaceholderName: 'horizon_application_confirmation.jpg',
    createdAt: daysAgo(1), isDemo: true,
  },
  {
    id: 'demo_ev_002', jobseekerId: 'demo_js_004',
    title: 'Warehouse Training Attendance Certificate',
    evidenceType: 'Training certificate',
    linkedRecordType: 'activity', linkedRecordId: 'demo_al_006',
    date: daysAgo(0), notes: 'Full day attendance verified by trainer.',
    filePlaceholderName: 'warehouse_training_attendance.pdf',
    createdAt: daysAgo(0), isDemo: true,
  },
]

// ─── Demo Tasks ───────────────────────────────────────────────
export const DEMO_TASKS = [
  {
    id: 'demo_task_001', jobseekerId: 'demo_js_001',
    title: 'Update LinkedIn profile with recent experience',
    description: 'Add last 2 years of work history. Add skills endorsements.',
    dueDate: daysAgo(-3), status: 'pending', assignedBy: 'coach',
    createdAt: daysAgo(2), isDemo: true,
  },
  {
    id: 'demo_task_002', jobseekerId: 'demo_js_001',
    title: 'Prepare for City Council interview',
    description: 'Research the council. Prepare 3 STAR examples. Print CV.',
    dueDate: daysAgo(-1), status: 'in_progress', assignedBy: 'coach',
    createdAt: daysAgo(3), isDemo: true,
  },
  {
    id: 'demo_task_003', jobseekerId: 'demo_js_002',
    title: 'Contact childcare support worker',
    description: 'Speak to support team about childcare options during job search.',
    dueDate: daysAgo(-2), status: 'pending', assignedBy: 'coach',
    createdAt: daysAgo(5), isDemo: true,
  },
  {
    id: 'demo_task_004', jobseekerId: 'demo_js_003',
    title: 'Complete mock phone interview practice',
    description: '30-minute practice call with coach. Focus on telephone manner.',
    dueDate: daysAgo(-1), status: 'pending', assignedBy: 'coach',
    createdAt: daysAgo(1), isDemo: true,
  },
]

// ─── Demo Support Flags ───────────────────────────────────────
export const DEMO_SUPPORT_FLAGS = [
  {
    id: 'demo_sf_001', jobseekerId: 'demo_js_002',
    type: 'childcare_barrier', severity: 'high',
    description: 'Jobseeker reported childcare issues preventing full job-search engagement.',
    status: 'open', createdAt: daysAgo(5), isDemo: true,
  },
  {
    id: 'demo_sf_002', jobseekerId: 'demo_js_002',
    type: 'confidence_issue', severity: 'medium',
    description: 'Low confidence score reported in check-in (4/10). Escalation recommended.',
    status: 'open', createdAt: daysAgo(5), isDemo: true,
  },
  {
    id: 'demo_sf_003', jobseekerId: 'demo_js_005',
    type: 'mental_wellbeing_concern', severity: 'critical',
    description: 'No check-in for 10 days. No activity logged. Wellbeing check required.',
    status: 'escalated', createdAt: daysAgo(10), isDemo: true,
  },
]

// ─── Demo Coach Notes ─────────────────────────────────────────
export const DEMO_COACH_NOTES = [
  {
    id: 'demo_cn_001', jobseekerId: 'demo_js_001',
    note: 'Jordan is making excellent progress. Preparing well for the City Council interview. Confident and motivated.',
    createdAt: daysAgo(2), createdBy: 'coach', isDemo: true,
  },
  {
    id: 'demo_cn_002', jobseekerId: 'demo_js_002',
    note: 'Amara needs additional support around childcare barriers. Referred to in-house support team. Check in by Friday.',
    createdAt: daysAgo(5), createdBy: 'coach', isDemo: true,
  },
  {
    id: 'demo_cn_003', jobseekerId: 'demo_js_005',
    note: 'Leon has not responded to messages or attended scheduled appointment. Escalated to manager for welfare check.',
    createdAt: daysAgo(9), createdBy: 'coach', isDemo: true,
  },
]

// ─── Load all demo data into stores ───────────────────────────
export function loadDemoData(jobseekerService, dataStore) {
  // Load demo jobseekers
  const existing = jobseekerService.getAll()
  const existingDemoIds = new Set(existing.filter(j => j.isDemo).map(j => j.id))
  const toAdd = DEMO_JOBSEEKERS.filter(j => !existingDemoIds.has(j.id))
  if (toAdd.length > 0) {
    jobseekerService.bulkCreate(toAdd)
  }

  // Load demo data records
  dataStore.bulkLoad({
    activityLogs:    DEMO_ACTIVITY_LOGS,
    applications:    DEMO_APPLICATIONS,
    interviews:      DEMO_INTERVIEWS,
    checkIns:        DEMO_CHECKINS,
    evidenceRecords: DEMO_EVIDENCE,
    tasks:           DEMO_TASKS,
    supportFlags:    DEMO_SUPPORT_FLAGS,
    coachNotes:      DEMO_COACH_NOTES,
  })
}

// ─── Remove all demo data from stores ─────────────────────────
export function removeDemoData(jobseekerService, dataStore) {
  jobseekerService.removeDemoJobseekers()
  dataStore.removeDemoRecords()
}

export const CHECK_IN_QUESTIONS_DEFAULT = CHECK_IN_QUESTIONS

export default { loadDemoData, removeDemoData, DEMO_JOBSEEKERS }
