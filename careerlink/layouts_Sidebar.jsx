/**
 * ============================================================
 * CareerLink OS™ — Sidebar (Burger Drawer)
 * Left overlay drawer. Closes on nav, overlay click, or X.
 * 4P3X gold/black/purple futuristic identity.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import Icon from './components_ui_Icon'
import { useAppStore } from './core_storage'
import { NAV_ITEMS, NAV_GROUPS } from './config_routes'

function CareerLinkLogo({ onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a1f00]/60">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 bg-[#b8860b]/10 border border-[#b8860b]/40 rounded-lg flex items-center justify-center">
            <span className="font-display font-bold text-[#d4af37] text-xs tracking-wider">CL</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-white text-sm leading-tight">CareerLink OS™</div>
          <div className="text-[10px] text-[#b8860b]/70 tracking-wide">4P3X Intelligent AI</div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors"
        aria-label="Close menu"
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  )
}

function NavGroupLabel({ label }) {
  if (!label) return null
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-600">
        {label}
      </span>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer group relative',
        active
          ? 'text-white bg-[#1a1200]/80'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#d4af37] rounded-r shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
      )}
      <Icon
        name={item.icon}
        size={16}
        className={clsx(
          'flex-shrink-0 transition-colors',
          active ? 'text-[#d4af37]' : 'text-slate-500 group-hover:text-slate-300'
        )}
      />
      <span className="truncate">{item.label}</span>
      {item.highlight && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37] shadow-[0_0_6px_rgba(212,175,55,0.8)] flex-shrink-0" />
      )}
      {item.badge && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
          {item.badge}
        </span>
      )}
    </button>
  )
}

function SidebarFooter() {
  return (
    <div className="px-3 py-3 border-t border-slate-800/60">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
        <span className="text-xs text-slate-500">System Active</span>
        <span className="ml-auto text-[10px] text-slate-700 font-mono">v1.0.0</span>
      </div>
      <div className="mt-2 text-[9px] text-slate-700 text-center leading-relaxed">
        Created by Kyzel Kreates
      </div>
    </div>
  )
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isOpen   = useAppStore(s => s.sidebarExpanded)
  const close    = useAppStore(s => s.closeSidebar)

  const groupOrder = Object.entries(NAV_GROUPS)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key]) => key)

  const grouped = groupOrder.reduce((acc, group) => {
    const items = NAV_ITEMS.filter(i => i.group === group)
    if (items.length) acc[group] = items
    return acc
  }, {})

  const handleNav = (route) => {
    navigate(route)
    close()
  }

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-full z-50',
        'flex flex-col bg-[#090e1c] border-r border-slate-800/60',
        'w-72 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <CareerLinkLogo onClose={close} />

      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none px-2 py-2">
        {groupOrder.map(group => {
          const items = grouped[group]
          if (!items) return null
          return (
            <div key={group}>
              <NavGroupLabel label={NAV_GROUPS[group].label} />
              <div className="space-y-0.5">
                {items.map(item => (
                  <NavItem
                    key={item.id}
                    item={item}
                    active={
                      location.pathname === item.route ||
                      location.pathname.startsWith(item.route + '/')
                    }
                    onClick={() => handleNav(item.route)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Coach Dashboard quick-access shortcut */}
      <div className="px-3 pb-2 space-y-2">
        <button
          onClick={() => { navigate('/dashboard'); close(); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 hover:bg-[#d4af37]/18 transition-all group"
        >
          <Icon name="LayoutDashboard" size={14} className="text-[#d4af37] flex-shrink-0" />
          <span className="text-xs font-bold text-[#d4af37] flex-1 text-left">Coach Dashboard</span>
          <Icon name="ChevronRight" size={11} className="text-[#d4af37]/40 group-hover:text-[#d4af37]/80 transition-colors" />
        </button>
        <button
          onClick={() => { navigate('/jobseeker-setup'); close(); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/40 bg-slate-800/20 hover:bg-slate-800/40 transition-all group"
        >
          <Icon name="UserPlus" size={13} className="text-slate-500 flex-shrink-0" />
          <span className="text-xs font-medium text-slate-500 flex-1 text-left">Invite Jobseeker</span>
          <Icon name="ChevronRight" size={10} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
        </button>
      </div>

      <SidebarFooter />
    </aside>
  )
}
