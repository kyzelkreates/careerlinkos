/**
 * ============================================================
 * CareerLink OS™ — Reset Confirm
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'

export default function ResetConfirm() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[100dvh] bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="w-14 h-14 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl flex items-center justify-center mx-auto">
          <Icon name="KeyRound" size={22} className="text-[#d4af37]" />
        </div>
        <h1 className="font-display font-bold text-white text-xl">Reset Complete</h1>
        <p className="text-slate-500 text-sm">Your account has been updated. You can now sign in with your new password.</p>
        <button onClick={() => navigate('/auth/login')}
          className="w-full py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors">
          Go to Sign In
        </button>
      </div>
    </div>
  )
}
