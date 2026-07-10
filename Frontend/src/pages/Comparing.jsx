import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Sidebar from '../components/Sidebar'
import Icon from '../components/Icon'
import { C } from '../constants/colors'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE } from '../config'

// ── Status label sequences ────────────────────────────────────────────────────
const CONTESTANT_STATUSES = [
  'Initializing...',
  'Connecting...',
  'Generating...',
  'Formatting...',
  'Completed ✓',
]

const JUDGE_STATUSES = [
  'Waiting for contestants...',
  'Analyzing...',
  'Comparing...',
  'Scoring...',
  'Selecting Winner...',
  'Completed ✓',
]

const OVERALL_STATUSES = [
  'Preparing...',
  'Generating...',
  'Judging...',
  'Saving...',
  'Completed ✓',
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(ms) {
  if (ms === null) return ''
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
function ProgressBar({ progress, state, themeColors }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = themeColors || {
    border: isDark ? '#262a30' : '#e2e8f0',
    completed: '#22c55e',
    error: '#ef4444',
  }
  const color = state === 'done' ? colors.completed : state === 'error' ? colors.error : 'var(--color-primary-glow, #a855f7)'
  return (
    <div style={{ height: 2, background: colors.border, borderRadius: 1, overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: color,
          borderRadius: 1,
          transition: 'width 0.35s ease, background 0.4s ease',
        }}
      />
    </div>
  )
}

// ── BattleCard ────────────────────────────────────────────────────────────────
function BattleCard({ title, icon, cardState, progress, statusLabel, elapsedMs, index }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = {
    cardBg: isDark ? '#17191d' : '#ffffff',
    border: isDark ? '#262a30' : '#e2e8f0',
    textPrimary: isDark ? '#ffffff' : '#0f172a',
    textSecondary: isDark ? '#9ca3af' : '#64748b',
    completed: '#22c55e',
    error: '#ef4444',
  }

  const isDone    = cardState === 'done'
  const isActive  = cardState === 'active'
  const isIdle    = cardState === 'idle'
  const isError   = cardState === 'error'

  const border = isDone
    ? `1px solid ${colors.completed}44`
    : isError
    ? `1px solid ${colors.error}33`
    : `1px solid ${colors.border}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: isIdle ? 0.5 : 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: 'easeOut' }}
      style={{
        padding: '20px 24px',
        borderRadius: 16,
        border,
        background: colors.cardBg,
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '144px',
        transition: 'border-color 0.25s ease, opacity 0.25s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Icon */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isDone ? colors.completed : isError ? colors.error : colors.textSecondary,
          }}>
            {isDone ? (
              <Icon n="check_circle" fill size={18} style={{ color: colors.completed }} />
            ) : isError ? (
              <Icon n="error" fill size={18} style={{ color: colors.error }} />
            ) : (
              <Icon n={icon} size={18} style={{
                color: isActive ? 'var(--color-primary-glow, #a855f7)' : colors.textSecondary,
                opacity: isActive ? 1 : 0.7
              }} />
            )}
          </div>

          {/* Title */}
          <p style={{
            margin: 0, flex: 1,
            fontFamily: "'Helvetica', Arial, sans-serif",
            fontSize: 14, fontWeight: 600,
            color: colors.textPrimary,
            letterSpacing: '-0.01em',
          }}>
            {title}
          </p>

          {/* Elapsed badge */}
          {isDone && elapsedMs !== null && (
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 10,
                color: colors.completed,
                background: `${colors.completed}10`,
                border: `1px solid ${colors.completed}25`,
                borderRadius: 4,
                padding: '2px 6px',
                whiteSpace: 'nowrap',
              }}
            >
              {fmt(elapsedMs)}
            </motion.span>
          )}
        </div>

        {/* Status label */}
        <div style={{ minHeight: 20, display: 'flex', alignItems: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={statusLabel}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              style={{
                margin: 0,
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                color: isDone ? `${colors.completed}dd` : colors.textSecondary,
              }}
            >
              {statusLabel}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
        <ProgressBar progress={progress} state={cardState} themeColors={colors} />
      </div>
    </motion.div>
  )
}

// ── useAnimatedProgress ────────────────────────────────────────────────────────
function useAnimatedProgress(state) {
  const [pct, setPct] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (state === 'idle') { setPct(0); return }
    if (state === 'done' || state === 'error') { setPct(100); return }

    // Active: animate
    const SOFT_CAP = 82
    const HARD_CAP = 94
    let current = pct

    const step = () => {
      if (current < SOFT_CAP) {
        current = Math.min(current + 1.4, SOFT_CAP)
      } else if (current < HARD_CAP) {
        current = Math.min(current + 0.08, HARD_CAP)
      }
      setPct(current)
      if (current < HARD_CAP) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [state])

  return pct
}

// ── useStatusCycle ─────────────────────────────────────────────────────────────
function useStatusCycle(labels, state, intervalMs = 3200) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (state !== 'active') {
      if (state === 'done' || state === 'error') setIdx(labels.length - 1)
      else setIdx(0)
      return
    }

    // Cycle through labels (stop at second-to-last while still active)
    const advance = () => {
      setIdx((prev) => {
        const next = prev + 1
        if (next < labels.length - 1) {
          timerRef.current = setTimeout(advance, intervalMs)
          return next
        }
        return prev   // stay at penultimate until done
      })
    }
    timerRef.current = setTimeout(advance, intervalMs)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [state, labels, intervalMs])

  return labels[idx]
}

// ── IndependentCard ────────────────────────────────────────────────────────────
function IndependentCard({ title, icon, statusLabels, cardState, elapsedMs, index, cycleDuration }) {
  const progress = useAnimatedProgress(cardState)
  const statusLabel = useStatusCycle(statusLabels, cardState, cycleDuration ?? 3200)
  return (
    <BattleCard
      title={title}
      icon={icon}
      cardState={cardState}
      progress={cardState === 'done' ? 100 : cardState === 'idle' ? 0 : progress}
      statusLabel={statusLabel}
      elapsedMs={elapsedMs}
      index={index}
    />
  )
}

// ── Main Comparing component ───────────────────────────────────────────────────
export default function Comparing({ problem, model1, model2, judgeModel, onDone, onNavigate, onSelectBattle }) {
  const { token } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const colors = {
    bg: isDark ? '#0f1115' : '#f8fafc',
    cardBg: isDark ? '#17191d' : '#ffffff',
    border: isDark ? '#262a30' : '#e2e8f0',
    textPrimary: isDark ? '#ffffff' : '#0f172a',
    textSecondary: isDark ? '#9ca3af' : '#64748b',
    completed: '#22c55e',
    error: '#ef4444',
  }

  // Per-card state
  const [c1State, setC1State] = useState('idle')
  const [c2State, setC2State] = useState('idle')
  const [judgeState, setJudgeState] = useState('idle')
  const [overallState, setOverallState] = useState('idle')

  const [c1Elapsed, setC1Elapsed] = useState(null)
  const [c2Elapsed, setC2Elapsed] = useState(null)
  const [judgeElapsed, setJudgeElapsed] = useState(null)
  const [overallElapsed, setOverallElapsed] = useState(null)

  const startRef = useRef(Date.now())
  const readerRef = useRef(null)

  // ── Connect to the SSE stream ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    startRef.current = Date.now()

    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    setOverallState('active')

    const run = async () => {
      let result = null

      try {
        const response = await fetch(`${API_BASE}/battle/stream`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ problem, model1, model2, judgeModel }),
        })

        if (!response.ok || !response.body) {
          const err = await response.json().catch(() => ({ error: 'Network error' }))
          if (!cancelled) onDone(err)
          return
        }

        const reader = response.body.getReader()
        readerRef.current = reader
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''   // keep incomplete line

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue

            let event
            try {
              event = JSON.parse(trimmed.slice(5).trim())
            } catch { continue }

            if (cancelled) break

            switch (event.type) {
              case 'battle_start':
                break
              case 'contestant_1_start':
                setC1State('active')
                break
              case 'contestant_2_start':
                setC2State('active')
                break
              case 'contestant_1_token':
              case 'contestant_2_token':
                break
              case 'contestant_1_done':
                setC1State('done')
                setC1Elapsed(event.elapsedMs ?? null)
                break
              case 'contestant_2_done':
                setC2State('done')
                setC2Elapsed(event.elapsedMs ?? null)
                break
              case 'judge_start':
                setJudgeState('active')
                break
              case 'judge_done':
                setJudgeState('done')
                setJudgeElapsed(event.elapsedMs ?? null)
                break
              case 'save_done':
                break
              case 'complete':
                result = event.data
                setOverallState('done')
                setOverallElapsed(Date.now() - startRef.current)
                if (!cancelled && result) {
                  reader.cancel().catch(() => {})
                  onDone(result)
                  return
                }
                break
              case 'error':
                setC1State(c1State === 'idle' ? 'idle' : 'error')
                setC2State(c2State === 'idle' ? 'idle' : 'error')
                setJudgeState('idle')
                setOverallState('error')
                if (!cancelled) onDone(event.data)
                return
            }
          }
        }
      } catch (err) {
        if (!cancelled) onDone({ error: err.message || 'Network error' })
        return
      }
    }

    run()
    return () => {
      cancelled = true
      if (readerRef.current) readerRef.current.cancel().catch(() => {})
    }
  }, [problem, model1, model2, judgeModel, token])

  // ── Build model display names for card titles ────────────────────────────────
  const MODEL_DISPLAY = {
    'mistral-medium-latest': 'Mistral Medium',
    'mistral-large-latest': 'Mistral Large',
    'open-mixtral-8x22b': 'Mixtral 8x22B',
    'mistral-small-latest': 'Mistral Small',
    'command-a-03-2025': 'Cohere Command A',
    'command-r-08-2024': 'Cohere Command R',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-2.0-flash': 'Gemini 2.0 Flash',
  }

  const m1Name = MODEL_DISPLAY[model1] || model1
  const m2Name = MODEL_DISPLAY[model2] || model2

  // ── Overall progress from card states ────────────────────────────────────────
  function overallProgress() {
    const weights = [
      c1State === 'done' ? 35 : c1State === 'active' ? 10 : 0,
      c2State === 'done' ? 35 : c2State === 'active' ? 10 : 0,
      judgeState === 'done' ? 25 : judgeState === 'active' ? 5 : 0,
    ]
    const sum = weights.reduce((a, b) => a + b, 0)
    return Math.min(sum, overallState === 'done' ? 100 : 95)
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: colors.bg, overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar — desktop only */}
      <div style={{ position: 'relative', zIndex: 10, display: 'none' }} className="comparing-sidebar">
        <Sidebar activeKey="home" onNav={(key) => {
          if (key === 'home') onNavigate?.('home')
          else onNavigate?.(key)
        }} onSelectBattle={onSelectBattle} />
      </div>

      {/* Main */}
      <main style={{
        flex: 1, position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '60px 40px', overflowY: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="comparing-step-container"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, width: '100%', marginTop: 'auto', marginBottom: 'auto' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1px solid ${colors.border}`,
              background: colors.cardBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon n="gavel" size={16} style={{ color: colors.textSecondary }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <h1 style={{
                margin: 0,
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 20,
                fontWeight: 600,
                color: colors.textPrimary,
                letterSpacing: '-0.02em',
              }}>
                AI Battle in Progress
              </h1>
              <p style={{
                margin: 0,
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 14,
                color: colors.textSecondary,
              }}>
                Comparing responses from multiple AI models.
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="comparing-grid">
            <IndependentCard
              title={`Contestant 1 — ${m1Name}`}
              icon="memory"
              statusLabels={CONTESTANT_STATUSES}
              cardState={c1State}
              elapsedMs={c1Elapsed}
              index={0}
              cycleDuration={4500}
            />
            <IndependentCard
              title={`Contestant 2 — ${m2Name}`}
              icon="psychology"
              statusLabels={CONTESTANT_STATUSES}
              cardState={c2State}
              elapsedMs={c2Elapsed}
              index={1}
              cycleDuration={5000}
            />
            <IndependentCard
              title="Judge AI"
              icon="balance"
              statusLabels={JUDGE_STATUSES}
              cardState={judgeState}
              elapsedMs={judgeElapsed}
              index={2}
              cycleDuration={3500}
            />

            {/* Overall Card */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.15, ease: 'easeOut' }}
              style={{
                padding: '20px 24px',
                borderRadius: 16,
                border: overallState === 'done' 
                  ? `1px solid ${colors.completed}44` 
                  : `1px solid ${colors.border}`,
                background: colors.cardBg,
                boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '144px',
                transition: 'border-color 0.25s ease, opacity 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: overallState === 'done' ? colors.completed : colors.textSecondary,
                  }}>
                    {overallState === 'done' ? (
                      <Icon n="check_circle" fill size={18} style={{ color: colors.completed }} />
                    ) : (
                      <Icon n="verified" size={18} style={{
                        color: overallState === 'active' ? 'var(--color-primary-glow, #a855f7)' : colors.textSecondary,
                        opacity: overallState === 'active' ? 1 : 0.7
                      }} />
                    )}
                  </div>
                  <p style={{
                    margin: 0, flex: 1,
                    fontFamily: "'Helvetica', Arial, sans-serif",
                    fontSize: 14, fontWeight: 600,
                    color: colors.textPrimary,
                    letterSpacing: '-0.01em',
                  }}>
                    Overall Battle
                  </p>
                  {overallState === 'done' && overallElapsed !== null && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: 10,
                        color: colors.completed,
                        background: `${colors.completed}10`,
                        border: `1px solid ${colors.completed}25`,
                        borderRadius: 4,
                        padding: '2px 6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fmt(overallElapsed)}
                    </motion.span>
                  )}
                </div>

                <div style={{ minHeight: 20, display: 'flex', alignItems: 'center' }}>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={overallState}
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -2 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: 12,
                        color: overallState === 'done' ? `${colors.completed}dd` : colors.textSecondary,
                      }}
                    >
                      {overallState === 'done' ? OVERALL_STATUSES[4]
                       : judgeState === 'active' || judgeState === 'done' ? OVERALL_STATUSES[2]
                       : c1State === 'active' || c2State === 'active' ? OVERALL_STATUSES[1]
                       : OVERALL_STATUSES[0]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 12 }}>
                <ProgressBar
                  progress={overallState === 'done' ? 100 : overallProgress()}
                  state={overallState}
                  themeColors={colors}
                />
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <p style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: colors.textSecondary, textAlign: 'center', margin: 0,
            opacity: 0.75,
          }}>
            {overallState === 'done'
              ? 'Battle complete — loading results...'
              : 'AI models processing your request in parallel'}
          </p>
        </motion.div>
      </main>
    </div>
  )
}
