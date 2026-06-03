/**
 * ============================================================
 * CareerLink OS™ — Jobseeker Setup / Invite Page
 * Coach creates a jobseeker profile and gets their unique PWA link.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { createPwaAccessLink, generatePwaLinkId } from './services_careerlink_liveDataService'
import { isCLSupabaseReady, getCLSupabaseStatus } from './services_supabase_clSupabaseClient'

const GOLD   = '#d4af37'
const GREEN  = '#22c55e'
const BLUE   = '#3b82f6'
const AMBER  = '#f59e0b'

export default function JobseekerSetup() {
  const navigate       = useNavigate()
  const config         = useConfigStore(s => s.config)
  const weeklyTarget   = config.weeklyTargetHoursDefault ?? 35
  const sbStatus       = getCLSupabaseStatus()

  const [created,   setCreated]   = useState(null)
  const [linkId,    setLinkId]    = useState(null)
  const [copied,    setCopied]    = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [form, setForm] = useState({
    displayName: '', email: '', phone: '', programme: '',
    weeklyTargetHours: weeklyTarget,
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Build the shareable PWA URL
  function buildPwaUrl(id) {
    const base = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : ''
    return `${base}#/pwa/${id}`
  }

  const handleCreate = async () => {
    setError('')
    if (!form.displayName.trim()) { setError('Full name is required.'); return }
    setSaving(true)
    try {
      // 1. Create local jobseeker record
      const js = jobseekerService.create(form)

      // 2. Generate and store PWA access link
      const id = await createPwaAccessLink(js.id, js.displayName)

      // 3. Update jobseeker with pwa_link_id (local only for demo mode)
      jobseekerService.update(js.id, { pwaLinkId: id })

      setCreated(js)
      setLinkId(id)
    } catch (e) {
      setError(e.message || 'Failed to create jobseeker.')
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (!linkId) return
    navigator.clipboard?.writeText(buildPwaUrl(linkId)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">

        {/* Back + title */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <Icon name="ArrowLeft" size={16} />
          </button>
          <div>
            <h1 className="font-bold text-white text-xl">Invite Jobseeker</h1>
            <p className="text-slate-500 text-xs mt-0.5">Create a profile and share their unique PWA link</p>
          </div>
        </div>

        {/* Supabase status notice */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{
            background: sbStatus.configured ? `${GREEN}08` : `${AMBER}08`,
            border: `1px solid ${sbStatus.configured ? GREEN : AMBER}22`,
            color: sbStatus.configured ? GREEN : AMBER,
          }}>
          <Icon name={sbStatus.configured ? 'Wifi' : 'WifiOff'} size={12} />
          {sbStatus.configured
            ? 'Supabase connected — PWA link will sync live data.'
            : 'Supabase not configured — link works in local / demo mode only.'}
        </div>

        {!created ? (
          <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-6 space-y-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">
              Step 1 — Create Jobseeker Profile
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input value={form.displayName} onChange={e => set('displayName', e.target.value)}
                placeholder="e.g. Jordan Mitchell"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="jobseeker@example.com"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Phone Number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="07700 000000"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Programme</label>
              <input value={form.programme} onChange={e => set('programme', e.target.value)}
                placeholder="e.g. Restart Scheme, Work & Health Programme"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Weekly Target Hours</label>
              <input type="number" min="1" max="60" value={form.weeklyTargetHours}
                onChange={e => set('weeklyTargetHours', parseInt(e.target.value) || weeklyTarget)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button onClick={handleCreate} disabled={saving}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
              style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}35`, color: GOLD }}>
              {saving ? 'Creating…' : 'Create Jobseeker & Generate Link'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success */}
            <div className="bg-[#0d1426] border rounded-2xl p-5 space-y-3"
              style={{ borderColor: `${GREEN}30` }}>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={16} style={{ color: GREEN }} />
                <span className="text-sm font-bold" style={{ color: GREEN }}>Jobseeker created!</span>
              </div>
              <div className="text-white font-semibold">{created.displayName}</div>
              {created.email && <div className="text-slate-500 text-sm">{created.email}</div>}
              <div className="text-xs text-slate-600">
                Weekly target: {created.weeklyTargetHours || 35}h ·{' '}
                Programme: {created.programme || '—'}
              </div>
            </div>

            {/* Step 2 — PWA Link */}
            <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                Step 2 — Share Their PWA Link
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Share this unique link with <strong className="text-white">{created.displayName}</strong>.
                Opening it loads their personal Jobseeker Activity App.
              </p>

              {/* Link display */}
              <div className="rounded-xl px-4 py-3 font-mono text-xs break-all"
                style={{ background: '#060b16', border: `1px solid ${GOLD}20`, color: GOLD + 'aa' }}>
                {buildPwaUrl(linkId)}
              </div>

              <button onClick={handleCopy}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}35`, color: GOLD }}>
                <Icon name={copied ? 'Check' : 'Copy'} size={15} style={{ color: GOLD }} />
                {copied ? 'Copied to clipboard!' : 'Copy PWA Link'}
              </button>

              {/* QR hint */}
              <div className="text-xs text-slate-600 text-center">
                Send via SMS, email, WhatsApp, or any messaging app.
                The link works on any mobile browser and can be installed as an app.
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/dashboard')}
                className="py-3 rounded-xl text-sm font-semibold text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all">
                Back to Dashboard
              </button>
              <button
                onClick={() => { setCreated(null); setLinkId(null); setForm({ displayName:'', email:'', phone:'', programme:'', weeklyTargetHours: weeklyTarget }) }}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={{ background: `${BLUE}12`, border: `1px solid ${BLUE}28`, color: BLUE }}>
                Add Another
              </button>
            </div>

            {/* Security note */}
            <div className="rounded-xl px-4 py-3 text-[10px] text-slate-700"
              style={{ background: '#070d1a', border: '1px solid #1a2035' }}>
              <strong className="text-slate-600">MVP Security Note:</strong> This link grants access to this
              jobseeker's PWA. For production deployment with sensitive personal data, enable Supabase
              Auth (phone/email OTP) for stronger identity verification. See SECURITY_NOTE.md.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-800">
          CareerLink OS™ · Powered by 4P3X Intelligent AI · Created by Kyzel Kreates
        </div>
      </div>
    </div>
  )
}
