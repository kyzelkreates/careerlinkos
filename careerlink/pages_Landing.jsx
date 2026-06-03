/**
 * ============================================================
 * CareerLink OS™ — Public Landing Page
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 * Route: /
 * No auth required. Entry point for all visitors.
 * ============================================================
 */

import { useNavigate } from 'react-router-dom'
import { useConfigStore } from './core_storage'
import Icon from './components_ui_Icon'

// ── Visual accent colours ─────────────────────────────────
const GOLD    = '#d4af37'
const SILVER  = '#b0b8c8'
const GREEN   = '#22c55e'
const PURPLE  = '#a855f7'
const BG_DEEP = '#050810'
const BG_CARD = '#0a0f1e'
const BG_CARD2= '#0d1426'
const BORDER  = 'rgba(212,175,55,0.18)'
const BORDER2 = 'rgba(176,184,200,0.12)'

// ── Inline style helpers ──────────────────────────────────
const card = (extra = {}) => ({
  background: BG_CARD2,
  border: `1px solid ${BORDER2}`,
  borderRadius: 16,
  padding: '28px 24px',
  ...extra,
})

const badge = (color, bg) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: bg,
  border: `1px solid ${color}33`,
  borderRadius: 999,
  padding: '4px 12px',
  fontSize: 11,
  fontWeight: 700,
  color,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
})

// ── Feature pill ──────────────────────────────────────────
function Pill({ label, icon, color = GOLD }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: color + '12', border: `1px solid ${color}28`,
      borderRadius: 999, padding: '5px 12px',
      fontSize: 12, fontWeight: 600, color,
    }}>
      {icon && <Icon name={icon} size={12} />}
      {label}
    </span>
  )
}

// ── Section header ────────────────────────────────────────
function SectionHeader({ number, label, color, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: color + '15', border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 900, color }}>{number}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name={icon} size={15} style={{ color }} />
        <span style={{ fontSize: 15, fontWeight: 700, color, letterSpacing: '0.02em' }}>{label}</span>
      </div>
    </div>
  )
}

// ── CTA Button ────────────────────────────────────────────
function CTAButton({ label, icon, onClick, primary = false, color = GOLD }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        padding: primary ? '15px 32px' : '13px 28px',
        borderRadius: 14,
        border: primary ? 'none' : `1.5px solid ${color}55`,
        background: primary
          ? `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`
          : `${color}10`,
        color: primary ? '#050810' : color,
        fontSize: primary ? 15 : 14,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        letterSpacing: '0.01em',
        flex: 1,
        minWidth: 180,
        maxWidth: 320,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `0 8px 24px ${color}30`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  )
}

// ── Main Landing Page ─────────────────────────────────────
export default function LandingPage() {
  const navigate   = useNavigate()
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config?.demoModeEnabled ?? true

  const goToDashboard   = () => navigate('/dashboard')
  const goToJobseekerPWA = () => navigate('/jobseeker-app')

  return (
    <div style={{
      minHeight: '100dvh',
      background: BG_DEEP,
      color: '#e8eaf0',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      overflowX: 'hidden',
    }}>

      {/* ── TOP NAV ─────────────────────────────────────── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: `1px solid ${BORDER}`,
        background: 'rgba(5,8,16,0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${GOLD}30 0%, ${GOLD}10 100%)`,
            border: `1px solid ${GOLD}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="Briefcase" size={16} style={{ color: GOLD }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: GOLD, lineHeight: 1.2 }}>CareerLink OS™</div>
            <div style={{ fontSize: 9, color: SILVER, opacity: 0.7, letterSpacing: '0.05em' }}>POWERED BY 4P3X INTELLIGENT AI</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={goToDashboard}
            aria-label="Open Coach Dashboard"
            style={{
              padding: '8px 16px', borderRadius: 10,
              border: `1px solid ${GOLD}40`, background: `${GOLD}10`,
              color: GOLD, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="LayoutDashboard" size={13} /> Coach Dashboard
          </button>
          <button
            onClick={goToJobseekerPWA}
            aria-label="Open Jobseeker PWA"
            style={{
              padding: '8px 16px', borderRadius: 10,
              border: `1px solid ${PURPLE}40`, background: `${PURPLE}10`,
              color: PURPLE, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="Smartphone" size={13} /> Jobseeker App
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{
        padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 80px) clamp(40px, 6vw, 80px)',
        maxWidth: 1100,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Mode badge */}
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={badge(isDemoMode ? GREEN : GOLD, isDemoMode ? GREEN + '18' : GOLD + '18')}>
            <Icon name={isDemoMode ? 'FlaskConical' : 'Database'} size={11} />
            {isDemoMode ? 'Demo Mode — Sample Data Active' : 'Live Mode — Real Data'}
          </span>
          <span style={badge(SILVER, SILVER + '14')}>
            <Icon name="Cpu" size={11} />
            4P3X Intelligent AI — 4 Embedded Assistants
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: 'clamp(28px, 5.5vw, 58px)',
          fontWeight: 900,
          lineHeight: 1.12,
          color: '#ffffff',
          marginBottom: 8,
          letterSpacing: '-0.02em',
        }}>
          <span style={{ color: GOLD }}>CareerLink OS</span>
          <sup style={{ fontSize: '0.45em', color: GOLD, verticalAlign: 'super', marginLeft: 1 }}>™</sup>
        </h1>
        <h2 style={{
          fontSize: 'clamp(14px, 2.5vw, 22px)',
          fontWeight: 400,
          color: SILVER,
          marginBottom: 28,
          letterSpacing: '0.01em',
        }}>
          Job Search Compliance Dashboard&nbsp;+&nbsp;Jobseeker Activity PWA
        </h2>

        {/* Hero description */}
        <p style={{
          fontSize: 'clamp(14px, 1.8vw, 17px)',
          color: '#8b9ab5',
          maxWidth: 680,
          margin: '0 auto 40px',
          lineHeight: 1.75,
        }}>
          A complete system for employment coaches and jobseekers to track job-search activity,
          evidence weekly hours, manage applications and interviews, flag support risks,
          and monitor progress — all powered by 4 embedded 4P3X Intelligent AI assistants.
        </p>

        {/* Hero CTA buttons */}
        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center',
          flexWrap: 'wrap', padding: '0 8px',
        }}>
          <CTAButton
            label="Open Coach Dashboard"
            icon="LayoutDashboard"
            onClick={goToDashboard}
            primary
            color={GOLD}
          />
          <CTAButton
            label="Open Jobseeker PWA"
            icon="Smartphone"
            onClick={goToJobseekerPWA}
            color={PURPLE}
          />
        </div>
      </section>

      {/* ── PRODUCT CARDS ────────────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 48px) clamp(40px, 6vw, 80px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24,
      }}>

        {/* Card 1 — Coach Dashboard */}
        <div style={{
          ...card(),
          border: `1px solid ${GOLD}30`,
          background: `linear-gradient(160deg, #0f1320 0%, #0a0f1e 100%)`,
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          <SectionHeader number="1" label="Coach / Caseworker Dashboard" color={GOLD} icon="LayoutDashboard" />

          <p style={{ fontSize: 13, color: '#8b9ab5', lineHeight: 1.7, marginBottom: 20 }}>
            The coach-facing dashboard gives employment coaches and caseworkers full visibility
            over their caseload. See who is on track, who needs attention, and who is at risk —
            at a glance.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {[
              ['Monitor jobseeker progress', 'TrendingUp'],
              ['35-hour weekly tracking', 'Clock'],
              ['Applications & interviews', 'FileText'],
              ['Evidence gap detection', 'AlertTriangle'],
              ['Check-in records', 'ClipboardCheck'],
              ['Risk signals & support flags', 'ShieldAlert'],
              ['Coach notes', 'StickyNote'],
              ['Weekly activity reporting', 'BarChart2'],
            ].map(([label, icon]) => (
              <Pill key={label} label={label} icon={icon} color={GOLD} />
            ))}
          </div>

          {/* AI assistants in this area */}
          <div style={{ borderTop: `1px solid ${GOLD}18`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Embedded AI Assistants
            </div>
            {[
              { num: '1', name: '4P3X Intelligent AI 1', desc: 'Guide the coach around the dashboard and explain features' },
              { num: '2', name: '4P3X Intelligent AI 2', desc: 'Explain jobseeker progress, risk levels, evidence gaps, and suggested actions' },
            ].map(ai => (
              <div key={ai.num} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                background: GOLD + '08', border: `1px solid ${GOLD}18`,
                borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: GOLD + '18', border: `1px solid ${GOLD}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: GOLD }}>{ai.num}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 2 }}>{ai.name}</div>
                  <div style={{ fontSize: 11, color: '#7a8599', lineHeight: 1.5 }}>{ai.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToDashboard}
            aria-label="Open Coach Dashboard"
            style={{
              marginTop: 24, width: '100%',
              padding: '13px 0', borderRadius: 12,
              background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD}bb 100%)`,
              border: 'none', color: '#050810',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Icon name="LayoutDashboard" size={15} />
            Open Coach Dashboard
          </button>
        </div>

        {/* Card 2 — Jobseeker PWA */}
        <div style={{
          ...card(),
          border: `1px solid ${PURPLE}30`,
          background: `linear-gradient(160deg, #100c1f 0%, #0a0f1e 100%)`,
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>
          <SectionHeader number="2" label="Jobseeker Activity PWA" color={PURPLE} icon="Smartphone" />

          <p style={{ fontSize: 13, color: '#8b9ab5', lineHeight: 1.7, marginBottom: 20 }}>
            A mobile-first Progressive Web App for jobseekers to log their job-search activity,
            track weekly hours, record applications and interviews, and complete daily check-ins —
            all synced to the coach dashboard.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {[
              ['Log job-search activity', 'PenLine'],
              ['Track weekly hours', 'Timer'],
              ['Record applications', 'Send'],
              ['Interview tracking', 'CalendarCheck'],
              ['Daily check-ins', 'CheckCircle2'],
              ['Evidence uploads', 'Upload'],
              ['Task management', 'ListTodo'],
              ['Support & barriers', 'LifeBuoy'],
            ].map(([label, icon]) => (
              <Pill key={label} label={label} icon={icon} color={PURPLE} />
            ))}
          </div>

          {/* AI assistants in this area */}
          <div style={{ borderTop: `1px solid ${PURPLE}18`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: PURPLE, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Embedded AI Assistants
            </div>
            {[
              { num: '3', name: '4P3X Intelligent AI 3', desc: 'Guide the jobseeker around the PWA and explain how to log activity' },
              { num: '4', name: '4P3X Intelligent AI 4', desc: 'Track weekly hours, evidence gaps, reminders, and what to do next' },
            ].map(ai => (
              <div key={ai.num} style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                background: PURPLE + '08', border: `1px solid ${PURPLE}18`,
                borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: PURPLE + '18', border: `1px solid ${PURPLE}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 1,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: PURPLE }}>{ai.num}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: PURPLE, marginBottom: 2 }}>{ai.name}</div>
                  <div style={{ fontSize: 11, color: '#7a8599', lineHeight: 1.5 }}>{ai.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={goToJobseekerPWA}
            aria-label="Open Jobseeker PWA"
            style={{
              marginTop: 24, width: '100%',
              padding: '13px 0', borderRadius: 12,
              background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE}bb 100%)`,
              border: 'none', color: '#ffffff',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Icon name="Smartphone" size={15} />
            Open Jobseeker PWA
          </button>
        </div>

      </section>

      {/* ── CONNECTED WORKFLOW ───────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 48px) clamp(40px, 6vw, 80px)',
      }}>
        <div style={{
          ...card({ padding: '32px 28px' }),
          border: `1px solid ${GREEN}25`,
          background: `linear-gradient(160deg, #0a1210 0%, #0a0f1e 100%)`,
        }}>
          <SectionHeader number="3" label="Connected Workflow" color={GREEN} icon="GitMerge" />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {[
              {
                icon: 'Smartphone',
                color: PURPLE,
                title: 'Jobseeker logs activity',
                body: 'The jobseeker opens the PWA and records job-search activities — applications sent, interviews attended, training completed, time spent, and check-in answers.',
              },
              {
                icon: 'ArrowRightLeft',
                color: GREEN,
                title: 'Data flows to the dashboard',
                body: 'All activity, applications, interviews, evidence records, check-ins, and risk flags are shared with the coach dashboard in real time — no manual data entry required.',
              },
              {
                icon: 'LayoutDashboard',
                color: GOLD,
                title: 'Coach monitors and acts',
                body: 'The coach sees an up-to-date picture of every jobseeker. Risk levels update automatically. AI assistants highlight who needs support and what action to take next.',
              },
            ].map((step, i) => (
              <div key={i} style={{
                background: step.color + '08',
                border: `1px solid ${step.color}20`,
                borderRadius: 12, padding: '18px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: step.color + '15', border: `1px solid ${step.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={step.icon} size={17} style={{ color: step.color }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: step.color }}>{step.title}</div>
                <div style={{ fontSize: 12, color: '#6b7a94', lineHeight: 1.65 }}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ────────────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 48px) clamp(40px, 6vw, 80px)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {[
            { icon: 'Timer',         color: GOLD,   label: '35-Hour Weekly Tracking',     sub: 'Evidence-based job-search hour monitoring with progress bars and risk signals' },
            { icon: 'Brain',         color: PURPLE, label: '4 Embedded AI Assistants',    sub: '4P3X Intelligent AI 1–4 across coach dashboard and jobseeker PWA' },
            { icon: 'WifiOff',       color: GREEN,  label: 'PWA — Works Offline',          sub: 'Jobseeker app works offline and syncs when reconnected' },
            { icon: 'ShieldCheck',   color: SILVER, label: 'Privacy First',               sub: 'All data stored locally — no cloud dependency required' },
          ].map((f, i) => (
            <div key={i} style={{
              ...card({ padding: '20px 18px' }),
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: f.color + '14', border: `1px solid ${f.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={f.icon} size={18} style={{ color: f.color }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#dce4f0', marginBottom: 5 }}>{f.label}</div>
                <div style={{ fontSize: 11, color: '#5a6880', lineHeight: 1.6 }}>{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA STRIP ─────────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 48px) clamp(48px, 7vw, 96px)',
      }}>
        <div style={{
          background: `linear-gradient(135deg, #0e1220 0%, #100b1e 100%)`,
          border: `1px solid ${GOLD}25`,
          borderRadius: 20,
          padding: 'clamp(28px, 5vw, 48px) clamp(24px, 4vw, 48px)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            Ready to get started?
          </div>
          <p style={{ fontSize: 14, color: '#6b7a94', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            Open the Coach Dashboard to manage your caseload, or open the Jobseeker PWA to log activity.
            No account required for demo mode.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <CTAButton label="Open Coach Dashboard" icon="LayoutDashboard" onClick={goToDashboard} primary color={GOLD} />
            <CTAButton label="Open Jobseeker PWA"   icon="Smartphone"      onClick={goToJobseekerPWA}      color={PURPLE} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        maxWidth: '100%',
      }}>
        <div style={{ fontSize: 12, color: '#374151' }}>
          <span style={{ color: GOLD, fontWeight: 700 }}>CareerLink OS™</span>
          {' '}— Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{
            fontSize: 11, display: 'flex', alignItems: 'center', gap: 5,
            color: isDemoMode ? GREEN : GOLD,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: isDemoMode ? GREEN : GOLD,
              display: 'inline-block',
              boxShadow: `0 0 6px ${isDemoMode ? GREEN : GOLD}`,
            }} />
            {isDemoMode ? 'Demo Mode ON' : 'Live Mode'}
          </span>
          <span style={{ fontSize: 11, color: '#374151' }}>v1.1</span>
        </div>
      </footer>

    </div>
  )
}
