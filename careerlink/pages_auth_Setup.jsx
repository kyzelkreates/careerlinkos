/**
 * ============================================================
 * CareerLink OS™ — First-Run Setup Page
 * Creates the initial coach/admin account.
 * Shown only once — when cl:setup_complete is not set.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { authService } from './services_supabase_authService'

const Field = ({ label, type = 'text', value, onChange, placeholder, required = true, show, onToggle }) => (
  <div className="space-y-1">
    <label className="text-xs text-slate-400 font-medium">{label}</label>
    <div className="relative">
      <input
        type={type === 'password' ? (show ? 'text' : 'password') : type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"
      />
      {type === 'password' && onToggle && (
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
          <Icon name={show ? 'EyeOff' : 'Eye'} size={14} />
        </button>
      )}
    </div>
  </div>
)

export default function Setup() {
  const navigate    = useNavigate()
  const [step, setStep]   = useState(1)
  const [error, setError] = useState(null)
  const [showPass, setShowPass] = useState({})
  const toggle = (key) => setShowPass(p => ({ ...p, [key]: !p[key] }))

  const [coach, setCoach] = useState({ username: '', email: '', password: '', confirm: '' })
  const setC = (k) => (v) => setCoach(p => ({ ...p, [k]: v }))

  const validate = () => {
    if (!coach.username.trim())            return 'Username is required.'
    if (coach.password.length < 6)         return 'Password must be at least 6 characters.'
    if (coach.password !== coach.confirm)  return 'Passwords do not match.'
    return null
  }

  const handleComplete = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    // Save coach account locally
    authService.createAccount({ username: coach.username, email: coach.email, password: coach.password, role: 'coach' })
    localStorage.setItem('cl:setup_complete', 'true')
    navigate('/auth/login')
  }

  return (
    <div className="min-h-[100dvh] bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl flex items-center justify-center">
            <span className="font-display font-bold text-[#d4af37] text-2xl">CL</span>
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-white text-xl">CareerLink OS™</h1>
            <p className="text-[10px] text-[#d4af37]/60 mt-0.5 uppercase tracking-widest">First-time setup</p>
          </div>
        </div>

        <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-white">Create Coach Account</h2>
            <p className="text-slate-500 text-xs mt-0.5">This creates your employment coach / admin login for the CareerLink dashboard.</p>
          </div>

          <div className="space-y-3">
            <Field label="Username" value={coach.username} onChange={setC('username')} placeholder="e.g. coach_admin" />
            <Field label="Email (optional)" type="email" value={coach.email} onChange={setC('email')} placeholder="coach@organisation.com" required={false} />
            <Field label="Password" type="password" value={coach.password} onChange={setC('password')} placeholder="Min 6 characters"
              show={showPass.p} onToggle={() => toggle('p')} />
            <Field label="Confirm Password" type="password" value={coach.confirm} onChange={setC('confirm')} placeholder="Repeat password"
              show={showPass.c} onToggle={() => toggle('c')} />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-700/30">
              <Icon name="AlertCircle" size={13} className="text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          <button onClick={handleComplete}
            className="w-full py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors">
            Create Account & Launch CareerLink OS™
          </button>

          <p className="text-[10px] text-slate-700 text-center leading-relaxed">
            CareerLink OS™ · Powered by 4P3X Intelligent AI · Created by Kyzel Kreates
          </p>
        </div>
      </div>
    </div>
  )
}
