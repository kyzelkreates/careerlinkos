/**
 * ============================================================
 * CareerLink OS™ — Coach Login Page
 * Local auth — validates against localStorage accounts.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { authService } from './services_supabase_authService'

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await authService.signIn(username, password)
    setLoading(false)
    if (err) { setError(err.message || 'Invalid username or password.'); return }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[100dvh] bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative">
            <div className="w-14 h-14 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl flex items-center justify-center">
              <span className="font-display font-bold text-[#d4af37] text-xl">CL</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="text-center">
            <h1 className="font-display font-bold text-white text-xl">CareerLink OS™</h1>
            <p className="text-[10px] text-[#d4af37]/60 uppercase tracking-widest mt-0.5">Coach Dashboard</p>
          </div>
        </div>

        <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-1">Sign In</h2>
          <p className="text-slate-500 text-xs mb-5">Employment coaches and authorised staff only.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Username or Email</label>
              <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username"
                placeholder="Your username or email"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                  type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 pr-10" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <Icon name={showPass ? 'EyeOff' : 'Eye'} size={14} />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-700/30">
                <Icon name="AlertCircle" size={13} className="text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !username || !password}
              className="w-full py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Icon name="Loader2" size={14} className="animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800/40">
            <p className="text-[10px] text-slate-600 text-center">
              Looking for the Jobseeker App?{' '}
              <a href="#/jobseeker-app" className="text-[#d4af37] hover:underline">Open here</a>
            </p>
          </div>
        </div>

        <p className="text-[9px] text-slate-700 text-center mt-4">
          CareerLink OS™ · Powered by 4P3X Intelligent AI · Created by Kyzel Kreates
        </p>
      </div>
    </div>
  )
}
