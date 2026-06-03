/**
 * ============================================================
 * CareerLink OS™ — Platform Credit Component
 * components_ui_PlatformCredit.jsx
 *
 * Renders the exact locked platform credit line:
 * "CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™"
 *
 * Use this component everywhere instead of hardcoded strings.
 * Organisation/client branding may NOT remove or replace this line.
 *
 * Props:
 *   size      'xs' | 'sm' | 'md'  — text size (default: 'xs')
 *   align     'left' | 'center'   — text alignment (default: 'left')
 *   opacity   number 0–1          — opacity (default: 0.5 for subtlety)
 *   className  string             — extra CSS classes
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 * ============================================================
 */

const GOLD = '#d4af37'

const SIZE_CLASS = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
}

export default function PlatformCredit({
  size      = 'xs',
  align     = 'left',
  opacity   = 0.55,
  className = '',
  style     = {},
}) {
  const textSize  = SIZE_CLASS[size] || SIZE_CLASS.xs
  const alignCls  = align === 'center' ? 'text-center' : 'text-left'

  return (
    <span
      className={`font-medium leading-relaxed select-none ${textSize} ${alignCls} ${className}`}
      style={{ color: GOLD, opacity, ...style }}
      aria-label="Platform credit"
    >
      CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™
    </span>
  )
}

/**
 * Block version — renders as a div for footer/header placements.
 */
export function PlatformCreditBlock({
  size      = 'xs',
  align     = 'center',
  opacity   = 0.45,
  className = '',
  style     = {},
}) {
  const textSize  = SIZE_CLASS[size] || SIZE_CLASS.xs
  const alignCls  = align === 'center' ? 'text-center' : 'text-left'

  return (
    <div
      className={`font-medium leading-relaxed select-none ${textSize} ${alignCls} ${className}`}
      style={{ color: GOLD, opacity, ...style }}
      aria-label="Platform credit"
    >
      CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™
    </div>
  )
}
