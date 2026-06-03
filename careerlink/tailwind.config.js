/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

/**
 * CareerLink OS™ — Tailwind Config
 * 4P3X black/gold/silver/green/purple futuristic identity
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 */
export default {
  darkMode: 'class',
  content: ['./*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        mono:    ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        apex: {
          base:    '#050810',
          surface: '#0a0f1e',
          card:    '#0d1426',
          border:  '#1a2035',
          muted:   '#2a3a5c',
          // CareerLink brand palette
          gold:    '#d4af37',
          silver:  '#c0c0c0',
          green:   '#34d399',
          purple:  '#a78bfa',
          cyan:    '#22d3ee',
          amber:   '#fbbf24',
          red:     '#f87171',
          blue:    '#3b82f6',
          text: {
            primary:   '#f1f5f9',
            secondary: '#94a3b8',
            muted:     '#475569',
            dim:       '#334155',
          },
        },
      },
      boxShadow: {
        'glow-gold':   '0 0 20px rgba(212,175,55,0.15)',
        'glow-green':  '0 0 20px rgba(52,211,153,0.15)',
        'glow-red':    '0 0 20px rgba(248,113,113,0.15)',
        'glow-purple': '0 0 20px rgba(167,139,250,0.15)',
        'glow-cyan':   '0 0 20px rgba(34,211,238,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
