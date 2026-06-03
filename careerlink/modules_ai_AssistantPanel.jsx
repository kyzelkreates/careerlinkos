/**
 * ============================================================
 * CareerLink OS™ — 4P3X CareerLink Intelligence Layer™
 * Shared Assistant Panel UI Component
 * Used by all 4 separated AI assistants.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * Props:
 *   assistantKey     — string  (from ASSISTANT_KEYS)
 *   publicName       — string  ('4P3X Intelligent AI 1')
 *   displaySubtitle  — string  ('Coach Dashboard Guide')
 *   number           — number  (1|2|3|4)
 *   quickActions     — array   ([{ id, label }])
 *   onQuery          — fn(actionId, query) => AIResponse
 *   initialMessage   — AIResponse | null
 *   collapsed        — bool
 *   onCollapse       — fn()
 *   aiConfig         — object
 *   mobileFirst      — bool (default false)
 *   accentColor      — string (css color, default gold)
 *   className        — string
 * ============================================================
 */
import { useState, useEffect, useRef } from 'react'
import Icon from './components_ui_Icon'
import { AI_DISCLAIMER, AI_MODES } from './services_ai_aiConfig'
import { ASSISTANT_KEYS } from './services_ai_careerlinkAiRouter'

// ─── Accent colours per assistant ─────────────────────────────
const ACCENT = {
  [ASSISTANT_KEYS.AI_1]: { color: '#d4af37', bg: 'bg-[#d4af37]/10', border: 'border-[#d4af37]/25', text: 'text-[#d4af37]', badge: 'bg-[#1a1200]/80 border-[#d4af37]/30 text-[#d4af37]' },
  [ASSISTANT_KEYS.AI_2]: { color: '#a78bfa', bg: 'bg-purple-500/10', border: 'border-purple-500/25', text: 'text-purple-400', badge: 'bg-purple-900/30 border-purple-500/30 text-purple-300' },
  [ASSISTANT_KEYS.AI_3]: { color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', text: 'text-emerald-400', badge: 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' },
  [ASSISTANT_KEYS.AI_4]: { color: '#60a5fa', bg: 'bg-blue-500/10', border: 'border-blue-500/25', text: 'text-blue-400', badge: 'bg-blue-900/20 border-blue-500/30 text-blue-300' },
}

function getAccent(assistantKey) {
  return ACCENT[assistantKey] || ACCENT[ASSISTANT_KEYS.AI_1]
}

// ─── AI Mode Badge ────────────────────────────────────────────
function AIModeBadge({ mode }) {
  const cfg = {
    [AI_MODES.OFF]:       'text-slate-500 border-slate-700/50 bg-slate-800/30',
    [AI_MODES.LOCAL]:     'text-emerald-400 border-emerald-700/40 bg-emerald-900/10',
    [AI_MODES.API_READY]: 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10',
  }[mode] || 'text-emerald-400 border-emerald-700/40 bg-emerald-900/10'
  const label = { [AI_MODES.OFF]: 'OFF', [AI_MODES.LOCAL]: 'LOCAL', [AI_MODES.API_READY]: 'API-READY' }[mode] || 'LOCAL'
  return <span className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border ${cfg}`}>{label}</span>
}

// ─── Confidence Badge ─────────────────────────────────────────
function ConfidenceBadge({ level }) {
  const cfg = { High: 'text-emerald-400', Medium: 'text-amber-400', Low: 'text-slate-500' }[level] || 'text-slate-500'
  return <span className={`text-[9px] font-semibold ${cfg}`}>Confidence: {level}</span>
}

// ─── Urgency Badge ────────────────────────────────────────────
function UrgencyBadge({ level }) {
  if (!level) return null
  const cfg = {
    Critical: 'text-red-300 bg-red-500/15 border-red-500/30',
    High:     'text-red-400 bg-red-500/10 border-red-500/20',
    Medium:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Low:      'text-slate-500 bg-slate-800/30 border-slate-700/30',
  }[level] || 'text-slate-500 bg-slate-800/30 border-slate-700/30'
  return <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${cfg}`}>{level}</span>
}

// ─── AI Response Card ─────────────────────────────────────────
function AIResponseCard({ response, accentKey, showDataUsed, showConfidence }) {
  const [expanded, setExpanded] = useState(false)
  const ac = getAccent(accentKey)
  const isHandoff = !!response.handoffTarget

  return (
    <div className={`rounded-xl border ${ac.border} ${ac.bg} p-3 space-y-2`}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isHandoff && (
            <div className="flex items-center gap-1 mb-1">
              <Icon name="ArrowRight" size={10} className={ac.text} />
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Handing off</span>
            </div>
          )}
          <div className={`text-sm font-semibold ${ac.text}`}>{response.title}</div>
          <div className="text-[10px] text-slate-500">{response.assistantName} · {response.displaySubtitle}</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {response.urgency && <UrgencyBadge level={response.urgency} />}
          {showConfidence && <ConfidenceBadge level={response.confidence} />}
        </div>
      </div>

      {/* Summary */}
      {response.summary && (
        <p className="text-xs text-slate-300 leading-relaxed">{response.summary}</p>
      )}

      {/* Suggestion */}
      {response.suggestion && (
        <div className="bg-slate-900/50 border border-slate-800/40 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Icon name={isHandoff ? 'ArrowRight' : 'Lightbulb'} size={12} className={`${ac.text} flex-shrink-0 mt-0.5`} />
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{response.suggestion}</p>
          </div>
        </div>
      )}

      {/* Expandable: reason, data used, human review */}
      <button onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
        <Icon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={10} />
        {expanded ? 'Hide details' : 'Show details'}
      </button>

      {expanded && (
        <div className="space-y-1.5 pt-1 border-t border-slate-800/30">
          {response.reason && (
            <div>
              <span className="text-[9px] text-slate-600 uppercase tracking-widest">Reason: </span>
              <span className="text-[10px] text-slate-500">{response.reason}</span>
            </div>
          )}
          {showDataUsed && response.dataUsed && (
            <div>
              <span className="text-[9px] text-slate-600 uppercase tracking-widest">Data used: </span>
              <span className="text-[10px] text-slate-500">{response.dataUsed}</span>
            </div>
          )}
          <div className="flex items-start gap-1 mt-1">
            <Icon name="UserCheck" size={10} className="text-amber-500/60 flex-shrink-0 mt-0.5" />
            <span className="text-[9px] text-amber-500/50 italic">{response.humanReviewNote || 'Human review required.'}</span>
          </div>
        </div>
      )}

      {/* Next actions */}
      {response.nextActions?.length > 0 && !isHandoff && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {response.nextActions.slice(0, 3).map((a, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/30 text-slate-500">
              → {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Disabled State ───────────────────────────────────────────
function DisabledState({ publicName, displaySubtitle, accentKey }) {
  const ac = getAccent(accentKey)
  return (
    <div className="flex flex-col items-center py-6 px-4 text-center">
      <div className={`w-10 h-10 rounded-full ${ac.bg} border ${ac.border} flex items-center justify-center mb-3`}>
        <Icon name="BrainCircuit" size={16} className={`${ac.text} opacity-40`} />
      </div>
      <div className={`text-sm font-semibold ${ac.text} opacity-40`}>{publicName}</div>
      <div className="text-[10px] text-slate-600 mb-2">{displaySubtitle}</div>
      <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border text-slate-600 border-slate-700/50 bg-slate-800/30">AI OFF</span>
      <p className="text-[10px] text-slate-700 mt-2">Enable AI in Settings → CareerLink AI → AI Mode to use this assistant.</p>
    </div>
  )
}

// ─── Main AssistantPanel ──────────────────────────────────────
export default function AssistantPanel({
  assistantKey,
  publicName,
  displaySubtitle,
  number,
  quickActions = [],
  onQuery,
  initialMessage = null,
  aiConfig = {},
  mobileFirst = false,
  className = '',
}) {
  const [collapsed, setCollapsed]   = useState(false)
  const [history,   setHistory]     = useState([])
  const [input,     setInput]       = useState('')
  const [loading,   setLoading]     = useState(false)
  const [dismissed, setDismissed]   = useState(false)
  const bottomRef                   = useRef(null)
  const ac                          = getAccent(assistantKey)

  const mode    = aiConfig?.aiMode || AI_MODES.LOCAL
  const enabled = mode !== AI_MODES.OFF && aiConfig?.aiEnabled !== false
  const showConf     = aiConfig?.showConfidence !== false
  const showDataUsed = aiConfig?.showDataUsed    !== false

  // Show initial message on mount
  useEffect(() => {
    if (initialMessage && history.length === 0) {
      setHistory([{ type: 'response', data: initialMessage }])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when new message added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleQuery = (actionId, queryText) => {
    if (!enabled || loading) return
    const query = queryText || input.trim()
    if (!actionId && !query) return
    setInput('')
    setHistory(h => [...h, { type: 'user', text: actionId ? '' : query, actionId }])
    setLoading(true)
    setTimeout(() => {
      try {
        const result = onQuery(actionId || 'freeform', { query })
        setHistory(h => [...h, { type: 'response', data: result }])
      } catch {
        setHistory(h => [...h, { type: 'response', data: {
          assistantKey, assistantName: publicName, displaySubtitle,
          title: 'Error', summary: 'Something went wrong. Please try again.',
          suggestion: '', reason: '', dataUsed: '', confidence: 'Low',
          humanReviewNote: 'Please try again or use a quick action button.',
        }}])
      }
      setLoading(false)
    }, 400)
  }

  const handleReset = () => {
    setHistory(initialMessage ? [{ type: 'response', data: initialMessage }] : [])
  }

  if (dismissed) {
    return (
      <button onClick={() => setDismissed(false)}
        className={`w-full py-3 rounded-xl border ${ac.border} text-xs ${ac.text} opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${className}`}>
        <Icon name="BrainCircuit" size={13} />
        {publicName} · {displaySubtitle}
      </button>
    )
  }

  return (
    <div className={`bg-[#0d1426] border ${ac.border} rounded-xl overflow-hidden ${className}`}>
      {/* ── Header ── */}
      <div className={`px-4 py-3 border-b border-slate-800/40 flex items-center justify-between ${ac.bg}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-full ${ac.bg} border ${ac.border} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-[10px] font-black ${ac.text}`}>{number}</span>
          </div>
          <div className="min-w-0">
            <div className={`text-sm font-bold ${ac.text} truncate`}>{publicName}</div>
            <div className="text-[10px] text-slate-500 truncate">{displaySubtitle}</div>
          </div>
          <AIModeBadge mode={mode} />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button onClick={handleReset}
            title="Reset conversation"
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors px-1">
            <Icon name="RotateCcw" size={11} />
          </button>
          <button onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1">
            <Icon name={collapsed ? 'ChevronDown' : 'ChevronUp'} size={13} />
          </button>
          <button onClick={() => setDismissed(true)}
            title="Dismiss"
            className="text-slate-600 hover:text-slate-400 transition-colors p-1">
            <Icon name="X" size={13} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* ── Disabled state ── */}
          {!enabled ? (
            <DisabledState
              publicName={publicName}
              displaySubtitle={displaySubtitle}
              accentKey={assistantKey}
            />
          ) : (
            <>
              {/* ── Quick actions ── */}
              {quickActions.length > 0 && (
                <div className="px-3 py-2.5 border-b border-slate-800/30 flex flex-wrap gap-1.5">
                  {quickActions.map(qa => (
                    <button key={qa.id} onClick={() => handleQuery(qa.id, null)}
                      disabled={loading}
                      className={`text-[10px] px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:${ac.text} hover:border-${ac.color}/30 transition-colors disabled:opacity-40`}>
                      {qa.label}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Conversation ── */}
              <div className={`p-3 space-y-3 overflow-y-auto ${mobileFirst ? 'min-h-[140px] max-h-[240px]' : 'min-h-[160px] max-h-[320px]'}`}>
                {history.length === 0 && (
                  <p className="text-xs text-slate-600 text-center mt-4">
                    Use the quick actions above or type a question below…
                  </p>
                )}
                {history.map((item, i) => {
                  if (item.type === 'user') {
                    const label = item.actionId
                      ? (quickActions.find(q => q.id === item.actionId)?.label || item.actionId)
                      : item.text
                    return (
                      <div key={i} className="flex justify-end">
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${ac.bg} ${ac.text} border ${ac.border}`}>
                          {label}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="max-w-[95%] w-full">
                        <AIResponseCard
                          response={item.data}
                          accentKey={assistantKey}
                          showDataUsed={showDataUsed}
                          showConfidence={showConf}
                        />
                      </div>
                    </div>
                  )
                })}

                {/* Loading dots */}
                {loading && (
                  <div className="flex justify-start">
                    <div className={`px-3 py-2 rounded-xl ${ac.bg} border ${ac.border} flex gap-1`}>
                      {[0,1,2].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${ac.text} opacity-60 animate-bounce`}
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* ── Input ── */}
              <div className="px-3 pb-3 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleQuery(null, input)}
                  placeholder={`Ask ${publicName}…`}
                  disabled={loading}
                  className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 disabled:opacity-40"
                />
                <button
                  onClick={() => handleQuery(null, input)}
                  disabled={!input.trim() || loading}
                  className={`px-3 py-2 rounded-xl ${ac.bg} border ${ac.border} ${ac.text} font-semibold disabled:opacity-30 hover:brightness-110 transition-all`}>
                  <Icon name="Send" size={13} />
                </button>
              </div>

              {/* ── Disclaimer ── */}
              <div className="px-4 pb-3">
                <p className="text-[9px] text-slate-700 leading-relaxed">{AI_DISCLAIMER}</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
