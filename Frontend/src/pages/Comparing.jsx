import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Sidebar from '../components/Sidebar'
import Icon from '../components/Icon'
import { C } from '../constants/colors'

import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE } from '../config'

const STEPS = [
  { id: 'step-1', icon: 'memory',     label: 'Generating Solution 1...', duration: 2500 },
  { id: 'step-2', icon: 'psychology', label: 'Generating Solution 2...', duration: 2200 },
  { id: 'step-3', icon: 'balance',    label: 'Judge Evaluating...',      duration: 3000 },
  { id: 'step-4', icon: 'verified',   label: 'Final Verdict...',         duration: 1500 },
]

function StepCard({ step, state, progress, index }) {
  const isActive = state === 'active'
  const isDone   = state === 'done'
  const isIdle   = state === 'idle'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isIdle ? 0.4 : isDone ? 0.8 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px', borderRadius: 12,
        border: `1px solid ${isActive ? `${C.primary}33` : `${C.outlineV}1a`}`,
        background: isActive ? C.surfHigh : C.surfLow,
        filter: isIdle ? 'grayscale(1)' : 'none',
        boxShadow: isActive ? '0 0 15px rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Icon ring */}
      <div style={{
        flexShrink: 0,
        width: 36, height: 36, borderRadius: '50%',
        border: `1.5px solid ${isActive || isDone ? C.primary : `${C.outlineV}55`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 0.4s',
      }}>
        <Icon n={step.icon} size={18} style={{ color: isActive || isDone ? C.primary : C.outlineV }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{
            fontFamily: "'Helvetica', Arial, sans-serif",
            fontSize: 15, fontWeight: 400, letterSpacing: '-0.01em',
            color: C.onSurf, margin: 0,
          }}>{step.label}</p>
          <span style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 11, color: C.onSurfVar, minWidth: 32, textAlign: 'right',
          }}>{Math.floor(progress)}%</span>
        </div>
        <div style={{ height: 3, background: C.surfHigh, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: C.primary, borderRadius: 2,
            transition: 'width 0.3s linear',
          }} />
        </div>
      </div>
    </motion.div>
  )
}

export default function Comparing({ problem, model1, model2, judgeModel, onDone, onNavigate, onSelectBattle }) {
  const { token } = useAuth()
  const { theme } = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [activePct,  setActivePct]  = useState(0)

  // Refs (never stale inside closures)
  const apiDoneRef   = useRef(false)
  const apiResultRef = useRef(null)
  const finishingRef = useRef(false)

  // ── Animation constants ────────────────────────────────────────────────────
  const TICK        = 40
  const SOFT_CAP    = 85
  const HARD_CAP    = 95
  const NORMAL_RATE = 85 / (6000 / TICK)
  const CREEP_RATE  = 10 / (30000 / TICK)

  // ── Fire the real API call ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    fetch(`${API_BASE}/battle`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ problem, model1, model2, judgeModel }),
    })
      .then(r => r.json())
      .catch(err => ({ error: err.message }))
      .then(result => {
        if (!cancelled) {
          apiResultRef.current = result
          apiDoneRef.current   = true
        }
      })
    return () => { cancelled = true }
  }, [problem, model1, model2, judgeModel, token])

  // ── Backend-aware animation state machine ──────────────────────────────────
  useEffect(() => {
    let step      = 0
    let pct       = 0
    let cancelled = false

    const tick = () => {
      if (cancelled) return

      // ★ API responded → instantly snap all steps to 100% then navigate
      if (apiDoneRef.current && !finishingRef.current) {
        finishingRef.current = true
        setActiveStep(STEPS.length - 1)
        setActivePct(100)
        setTimeout(() => {
          if (!cancelled) onDone(apiResultRef.current)
        }, 300)
        return
      }

      // Normal fill while waiting for API
      if (pct < SOFT_CAP) {
        pct = Math.min(pct + NORMAL_RATE, SOFT_CAP)
      } else {
        pct = Math.min(pct + CREEP_RATE, HARD_CAP)
      }

      setActivePct(pct)

      // Natural stage advance (only while API hasn't responded yet)
      if (pct >= 100) {
        if (step < STEPS.length - 1) {
          step++; pct = 0
          setActiveStep(step)
          setActivePct(0)
          setTimeout(tick, TICK)
        } else {
          // All four stages done → transition to result immediately
          setTimeout(() => {
            if (!cancelled) onDone(apiResultRef.current)
          }, 80)
        }
        return
      }

      // At HARD_CAP and still waiting → poll slowly until API responds
      const nextDelay = (!finishingRef.current && pct >= HARD_CAP) ? 200 : TICK
      setTimeout(tick, nextDelay)
    }

    setTimeout(tick, 400)
    return () => { cancelled = true }
  }, [])   // runs once; all live values read through refs

  // Compute per-card display: completed=100, active=live, waiting=0
  const getCardProgress = (i) => {
    if (i < activeStep)  return 100
    if (i === activeStep) return activePct
    return 0
  }





  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: C.bg, overflow: 'hidden', position: 'relative' }}>
      {/* Shader */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.3, pointerEvents: 'none' }}>
          <ShaderBg />
        </div>
      )}

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
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', overflow: 'hidden',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            width: '100%', maxWidth: 460,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 32,
          }}
        >
          {/* Gavel eye — smaller */}
          <div style={{
            position: 'relative',
            width: 112, height: 112, borderRadius: '50%',
            border: '1px solid var(--color-primary-glow, #a855f7)22',
            background: C.surfLow2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', inset: '0 0 50% 0',
              background: 'linear-gradient(to bottom, transparent, var(--color-primary-glow, #a855f7)30, transparent)',
              animation: 'scanning 2s linear infinite',
            }} />
            <Icon n="gavel" fill size={48} className="anim-hammer" style={{ color: 'var(--color-primary-glow, #a855f7)', position: 'relative', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--color-primary-glow, #a855f7)0d', animation: 'ping-anim 2s ease-in-out infinite' }} />
          </div>

          {/* Step cards */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map((step, i) => (
              <StepCard
                key={step.id}
                step={step}
                index={i}
                state={activeStep > i ? 'done' : activeStep === i ? 'active' : 'idle'}
                progress={getCardProgress(i)}
              />
            ))}
          </div>

          {/* Footer */}
          <p style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: C.outline, textAlign: 'center', margin: 0,
          }}>System identifying optimal architecture patterns</p>
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <nav id="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        display: 'none', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 16px 12px',
        background: `${C.surfHigh2}e6`, backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.outlineV}33`, borderRadius: '16px 16px 0 0',
      }}>
        {[['add_circle','New'],['history','History'],['star','Favs'],['menu','Menu']].map(([ic, lb], i) => (
          <button key={lb} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: i === 0 ? C.primary : 'transparent',
            color: i === 0 ? C.onPrimary : C.onSurfVar,
            fontFamily: "'Geist Pixel', monospace", fontSize: 11,
          }}>
            <Icon n={ic} size={20} style={{ color: 'inherit' }} />{lb}
          </button>
        ))}
      </nav>
    </div>
  )
}
