/**
 * ============================================================
 * CareerLink OS™ — 404 Not Found
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-[100dvh] bg-[#050810] flex items-center justify-center p-4 text-center">
      <div className="space-y-5">
        <div className="font-mono text-6xl font-bold text-[#d4af37]/20">404</div>
        <h1 className="font-display font-bold text-white text-xl">Page Not Found</h1>
        <p className="text-slate-500 text-sm max-w-xs">The page you're looking for doesn't exist in CareerLink OS™.</p>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors mx-auto">
          <Icon name="Home" size={15} /> Back to Dashboard
        </button>
      </div>
    </div>
  )
}
