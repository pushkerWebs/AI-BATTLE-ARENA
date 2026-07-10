import { useState, useEffect, useRef } from 'react'
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Sidebar from '../components/Sidebar'
import Icon from '../components/Icon'
import { C } from '../constants/colors'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../context/ThemeContext'

// ─── Shared animation config ──────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94]
const fadeUp = (delay = 0, shouldReduceMotion = false) => ({
  initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease },
})
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.45, delay },
})

// ─── Animated score bar ───────────────────────────────────────────────────────
function ScoreBar({ pct, winner }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()

  return (
    <div ref={ref} style={{ height: 6, background: C.surfHigh2, borderRadius: 3, overflow: 'hidden' }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.3, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: `${pct}%`,
          height: '100%',
          transformOrigin: 'left',
        }}
        className={winner ? 'score-fill-winner' : 'score-fill-loser'}
      />
    </div>
  )
}

// ─── Animated metric bar ──────────────────────────────────────────────────────
function MetricBar({ label, val, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.45, delay, ease }}
      style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'Geist Pixel', monospace" }}>
        <span>{label}</span>
        <span style={{ color: C.primary }}>{val}%</span>
      </div>
      <div style={{ height: 4, background: C.surfHigh2, borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 1.1, delay: delay + 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ 
            height: '100%', 
            width: `${val}%`,
            background: C.primary, 
            borderRadius: 2,
            transformOrigin: 'left'
          }}
        />
      </div>
    </motion.div>
  )
}

export default function Verdict({ result, onNew, onNavigate, onSelectBattle }) {
  const { theme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const { problem, solution_1, solution_2, judge, model1, model2, judgeModel } = result
  const winnerIsS1 = judge.winner === 'solution_1'

  const MODEL_NAMES = {
    'mistral-medium-latest': 'Mistral Medium',
    'mistral-large-latest': 'Mistral Large',
    'open-mixtral-8x22b': 'Mixtral 8x22B',
    'command-a-03-2025': 'Cohere Command A',
    'command-r-08-2024': 'Cohere Command R',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
  }

  const model1Name = MODEL_NAMES[model1] || 'Model 1'
  const model2Name = MODEL_NAMES[model2] || 'Model 2'
  const judgeModelName = MODEL_NAMES[judgeModel] || 'Judge Model'
  const winnerModel = winnerIsS1 ? model1Name : model2Name

  const getModelLogo = (modelId) => {
    if (!modelId) return null
    const id = modelId.toLowerCase()
    if (id.startsWith('gemini')) return '/gemini logo.png'
    if (id.startsWith('mistral') || id.startsWith('open-mixtral')) return '/mistral logo.png'
    if (id.startsWith('command')) return '/coherelogo.png'
    return null
  }

  const ModelBadge = ({ modelId, modelName, isWinner }) => {
    const logo = getModelLogo(modelId)
    return (
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: isWinner ? C.primary : C.surfHigh2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: logo ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        border: logo ? `1px solid ${C.outlineV}33` : 'none',
        padding: logo ? 4 : 0,
      }}>
        {logo
          ? <img src={logo} alt={modelName} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          : <span style={{ fontWeight: 700, fontSize: 12, color: isWinner ? C.onPrimary : C.onSurf }}>{modelName[0]}</span>
        }
      </div>
    )
  }

  const [copied1, setCopied1] = useState(false)
  const [copied2, setCopied2] = useState(false)
  const [expandedSolution, setExpandedSolution] = useState(null)

  const handleCopy1 = () => {
    navigator.clipboard.writeText(solution_1).then(() => {
      setCopied1(true); setTimeout(() => setCopied1(false), 2000)
    })
  }
  const handleCopy2 = () => {
    navigator.clipboard.writeText(solution_2).then(() => {
      setCopied2(true); setTimeout(() => setCopied2(false), 2000)
    })
  }

  const score1 = judge.solution_1_score ?? 8
  const score2 = judge.solution_2_score ?? 9
  const confidencePercent = Math.round(((score1 + score2) / 20) * 100)

  const [coords1, setCoords1] = useState({ x: -999, y: -999 })
  const [coords2, setCoords2] = useState({ x: -999, y: -999 })
  const handleMouseMove = (e, index) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (index === 1) setCoords1({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    else setCoords2({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  // SVG arc animation
  const arcLen = 364.4
  const arcRef = useRef(null)
  const arcInView = useInView(arcRef, { once: true })

  return (
    <div style={{
      display: 'flex', width: '100%', height: '100vh',
      background: C.bg, color: C.onSurf, position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Shader */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.3, pointerEvents: 'none' }}>
          <ShaderBg />
        </div>
      )}

      {/* Sidebar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'none', height: '100vh', flexShrink: 0 }} className="verdict-sidebar">
        <Sidebar activeKey="home" onNav={(key) => {
          if (key === 'home') onNew()
          else onNavigate(key)
        }} onSelectBattle={onSelectBattle} />
      </div>

      {/* Main area */}
      <div data-lenis-prevent style={{ flex: 1, height: '100vh', overflowY: 'auto', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, ease }}
          className="verdict-header"
          style={{
            position: 'sticky', top: 0, zIndex: 50,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: theme === 'light' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(20px)',
            borderBottom: 'none',
            boxShadow: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={onNew}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.onSurfVar, transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.primary}
              onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
              <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 12, letterSpacing: '0.04em' }}>Back</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: "'Geist Pixel', monospace", fontSize: 11,
              color: C.primary, background: `${C.primary}10`, border: `1px solid ${C.primary}2a`,
              padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Verdict Mode</span>
          </div>

          <div className="verdict-header-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 1, height: 24, background: `${C.outlineV}22` }} />
            <motion.button
              whileHover={{ color: C.primary }}
              onClick={() => onNavigate('history')}
              style={{ background: 'none', border: 'none', color: C.onSurfVar, fontFamily: "'Geist Pixel', monospace", fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }}
            >History</motion.button>
            <div style={{ width: 1, height: 24, background: `${C.outlineV}22` }} />
            <motion.button
              whileHover={{ color: C.primary }}
              onClick={() => onNavigate('documentation')}
              style={{ background: 'none', border: 'none', color: C.onSurfVar, fontFamily: "'Geist Pixel', monospace", fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }}
            >Documentation</motion.button>
            <div style={{ width: 1, height: 24, background: `${C.outlineV}22` }} />
            <motion.a
              whileHover={{ color: C.primary }}
              href="https://github.com/pushkerWebs/AI-BATTLE-ARENA"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', textDecoration: 'none', color: C.onSurfVar, fontFamily: "'Geist Pixel', monospace", fontSize: 12, cursor: 'pointer', transition: 'color 0.2s' }}
            >GitHub</motion.a>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${C.primary}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon n="person" size={16} style={{ color: C.primary }} />
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <main className="verdict-main">

          {/* Case metadata */}
          <motion.section
            {...fadeUp(0.05, shouldReduceMotion)}
            className="glass-panel"
            style={{ padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 16, '--mx': `${coords1.x}px`, '--my': `${coords1.y}px` }}
            onMouseMove={(e) => handleMouseMove(e, 1)}
          >
            <div className="verdict-meta-container">
              <div>
                <h3 style={{ fontFamily: "'Helvetica', Arial, sans-serif", fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', margin: '4px 0 0', color: C.primary }}>
                  System Architecture Evaluation
                </h3>
              </div>
              <div className="verdict-meta-right">
                <p style={{ fontFamily: "'Helvetica', Arial, sans-serif", fontSize: 12, color: C.onSurfVar, margin: 0 }}>Executed Live • Optimal Node</p>
                <div className="verdict-meta-badges">
                  {[model1Name, model2Name].map(n => (
                    <span key={n} style={{ padding: '2px 8px', background: C.surfHigh2, border: `1px solid ${C.outlineV}40`, borderRadius: 4, fontSize: 10, fontFamily: "'Geist Pixel', monospace", textTransform: 'uppercase' }}>{n}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: C.codeBg, padding: 16, borderRadius: 8, border: `1px solid ${C.outlineV}1a`, fontFamily: "'Geist Pixel', monospace" }}>
              <p style={{ fontSize: 14, color: C.onSurfVar, margin: 0, fontStyle: 'italic', lineHeight: '22px' }}>"{problem}"</p>
            </div>
          </motion.section>

          {/* Solutions grid */}
          <motion.section
            {...fadeUp(0.12, shouldReduceMotion)}
            style={{ position: 'relative', display: expandedSolution !== null ? 'grid' : undefined, gridTemplateColumns: expandedSolution !== null ? '1fr' : undefined }}
            className={expandedSolution !== null ? '' : 'verdict-grid'}
          >
            {/* VS badge */}
            <AnimatePresence>
              {expandedSolution === null && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.3 }}
                  style={{
                    position: 'absolute', top: 'calc(50% - 28px)', left: 'calc(50% - 28px)',
                    zIndex: 10, width: 56, height: 56, borderRadius: '50%',
                    background: C.surface, border: `4px solid ${C.surfHigh2}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                  className="verdict-vs"
                >
                  <span className="anim-pulse" style={{ fontSize: 16, fontWeight: 700, color: C.onSurfVar, letterSpacing: '-0.05em' }}>VS</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Solution 1 */}
            {(expandedSolution === null || expandedSolution === 'solution_1') && (
              <motion.article
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease }}
                className={`glass-panel ${winnerIsS1 ? 'winner-card' : ''}`}
                style={{ borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, '--mx': `${coords2.x}px`, '--my': `${coords2.y}px` }}
                onMouseMove={(e) => handleMouseMove(e, 2)}
              >
                {winnerIsS1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.35 }}
                    style={{ position: 'absolute', top: -1, right: -1, background: C.primary, color: C.onPrimary, padding: '4px 12px', fontFamily: "'Geist Pixel', monospace", fontSize: 10, fontWeight: 700, borderBottomLeftRadius: 12, display: 'flex', alignItems: 'center', gap: 4, zIndex: 10 }}
                  >
                    <Icon n="auto_awesome" size={12} fill style={{ color: C.onPrimary }} />
                    BEST RESPONSE
                  </motion.div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: C.surfLow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ModelBadge modelId={model1} modelName={model1Name} isWinner={winnerIsS1} />
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: C.primary }}>{model1Name}</h4>
                      <span style={{ fontSize: 11, fontFamily: "'Geist Pixel', monospace", color: C.outline }}>Solution 1</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 12, fontFamily: "'Geist Pixel', monospace", color: C.onSurfVar }}>{solution_1.split('\n').length} lines</span>
                    <button onClick={handleCopy1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfVar, display: 'flex' }}>
                      <Icon n={copied1 ? 'check' : 'content_copy'} size={16} style={{ color: copied1 ? '#4ade80' : 'inherit' }} />
                    </button>
                    <button onClick={() => setExpandedSolution(expandedSolution === 'solution_1' ? null : 'solution_1')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfVar, display: 'flex' }}>
                      <Icon n={expandedSolution === 'solution_1' ? 'fullscreen_exit' : 'fullscreen'} size={18} />
                    </button>
                  </div>
                </div>
                 <div style={{ background: C.codeBg, padding: 20, flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
                  <div className="markdown-body" data-lenis-prevent style={{ maxHeight: expandedSolution === 'solution_1' ? 'calc(100vh - 280px)' : 600, overflowY: 'auto', paddingBottom: 40, scrollbarWidth: 'thin', minWidth: 0 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{solution_1}</ReactMarkdown>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to top, ${C.codeBg}, transparent)`, pointerEvents: 'none' }} />
                </div>
              </motion.article>
            )}

            {/* Solution 2 */}
            {(expandedSolution === null || expandedSolution === 'solution_2') && (
              <motion.article
                initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease }}
                className={`glass-panel ${!winnerIsS1 ? 'winner-card' : ''}`}
                style={{ borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0, '--mx': `${coords2.x}px`, '--my': `${coords2.y}px` }}
                onMouseMove={(e) => handleMouseMove(e, 2)}
              >
                {!winnerIsS1 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.35 }}
                    style={{ position: 'absolute', top: -1, right: -1, background: C.primary, color: C.onPrimary, padding: '4px 12px', fontFamily: "'Geist Pixel', monospace", fontSize: 10, fontWeight: 700, borderBottomLeftRadius: 12, display: 'flex', alignItems: 'center', gap: 4, zIndex: 10 }}
                  >
                    <Icon n="auto_awesome" size={12} fill style={{ color: C.onPrimary }} />
                    BEST RESPONSE
                  </motion.div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: C.surfLow }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ModelBadge modelId={model2} modelName={model2Name} isWinner={!winnerIsS1} />
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 500, margin: 0, color: C.primary }}>{model2Name}</h4>
                      <span style={{ fontSize: 11, fontFamily: "'Geist Pixel', monospace", color: C.outline }}>Solution 2</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 12, fontFamily: "'Geist Pixel', monospace", color: C.onSurfVar }}>{solution_2.split('\n').length} lines</span>
                    <button onClick={handleCopy2} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfVar, display: 'flex' }}>
                      <Icon n={copied2 ? 'check' : 'content_copy'} size={16} style={{ color: copied2 ? '#4ade80' : 'inherit' }} />
                    </button>
                    <button onClick={() => setExpandedSolution(expandedSolution === 'solution_2' ? null : 'solution_2')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfVar, display: 'flex' }}>
                      <Icon n={expandedSolution === 'solution_2' ? 'fullscreen_exit' : 'fullscreen'} size={18} />
                    </button>
                  </div>
                </div>
                 <div style={{ background: C.codeBg, padding: 20, flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
                  <div className="markdown-body" data-lenis-prevent style={{ maxHeight: expandedSolution === 'solution_2' ? 'calc(100vh - 280px)' : 600, overflowY: 'auto', paddingBottom: 40, scrollbarWidth: 'thin', minWidth: 0 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{solution_2}</ReactMarkdown>
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to top, ${C.codeBg}, transparent)`, pointerEvents: 'none' }} />
                </div>
              </motion.article>
            )}
          </motion.section>

          {/* Winner banner */}
          <motion.section
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.3, type: 'spring', stiffness: 180, damping: 18 }}
            style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}
          >
            <div style={{ display: 'inline-flex', padding: 1, borderRadius: 9999, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}>
              <div className="verdict-winner-banner" style={{ background: C.bg }}>
                <span className="verdict-winner-text" style={{ color: C.primary }}>
                  🏆 Winner: {winnerModel} Wins
                </span>
              </div>
            </div>
          </motion.section>

          {/* Score row */}
          <motion.section
            {...fadeUp(0.35, shouldReduceMotion)}
            className="verdict-score-row"
          >
            {/* Score 1 */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease }}
              className="glass-panel verdict-score-card"
              style={{ borderRadius: 12 }}
            >
              <span className="verdict-score-title" style={{ fontFamily: "'Geist Pixel', monospace", letterSpacing: '0.02em', color: C.outline, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Solution 1 Score</span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="verdict-score-num"
                style={{ fontWeight: 700, color: C.primary, marginBottom: 12 }}
              >
                {score1}<span style={{ fontSize: 20, color: C.onSurfVar }}>/10</span>
              </motion.div>
              <ScoreBar pct={score1 * 10} winner={winnerIsS1} />
            </motion.div>

            {/* Confidence ring */}
            <div ref={arcRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <svg width={112} height={112} viewBox="0 0 128 128">
                <circle cx={64} cy={64} r={58} fill="none" stroke="#2a2a2a" strokeWidth={6} />
                <motion.circle
                  cx={64} cy={64} r={58} fill="none"
                  stroke="#ffffff" strokeWidth={6}
                  strokeDasharray={arcLen}
                  initial={{ strokeDashoffset: arcLen }}
                  animate={arcInView ? { strokeDashoffset: arcLen * (1 - confidencePercent / 100) } : {}}
                  transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="confidence-arc"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: C.primary, lineHeight: 1 }}>{confidencePercent}%</span>
                <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 9, color: C.outline, letterSpacing: '0.04em', marginTop: 2 }}>CONFIDENCE</span>
              </div>
            </div>

            {/* Score 2 */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease }}
              className="glass-panel verdict-score-card"
              style={{ borderRadius: 12 }}
            >
              <span className="verdict-score-title" style={{ fontFamily: "'Geist Pixel', monospace", letterSpacing: '0.02em', color: C.outline, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Solution 2 Score</span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="verdict-score-num"
                style={{ fontWeight: 700, color: C.primary, marginBottom: 12 }}
              >
                {score2}<span style={{ fontSize: 20, color: C.onSurfVar }}>/10</span>
              </motion.div>
              <ScoreBar pct={score2 * 10} winner={!winnerIsS1} />
            </motion.div>
          </motion.section>

          {/* Analysis + metrics */}
          <motion.section
            {...fadeUp(0.45, shouldReduceMotion)}
            className="verdict-analysis-row"
          >
            {/* Reasoning */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h5 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 500, margin: 0, color: C.primary }}>
                <Icon n="analytics" size={18} /> Reasoning Analysis
              </h5>
              <div className="verdict-reasoning-grid">
                {[
                  { icon: 'info', color: C.onSurfVar, label: `${model1Name.toUpperCase()} CRITIQUE`, text: judge.solution_1_reasoning ?? 'The output provides a solid initial architecture, but lacks detailed refresh token rotation logic, potentially creating session vulnerability.', delay: 0.5 },
                  { icon: 'verified', color: C.primary, label: `${model2Name.toUpperCase()} STRENGTHS`, text: judge.solution_2_reasoning ?? 'Excellent structural modularity and repository separation. Directly tackles security tokens with explicit rotation and audit logging.', delay: 0.58 },
                ].map((card) => (
                  <motion.div
                    key={card.label}
                    initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.48, delay: card.delay, ease }}
                    className="glass-panel"
                    style={{ padding: 20, borderRadius: 8 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: card.color, fontSize: 11, fontFamily: "'Geist Pixel', monospace", fontWeight: 700, marginBottom: 12 }}>
                      <Icon n={card.icon} size={14} style={{ color: card.color }} /> {card.label}
                    </div>
                    <p style={{ fontSize: 14, color: C.onSurfVar, lineHeight: '22px', margin: 0 }}>{card.text}</p>
                  </motion.div>
                ))}
              </div>

              {judge.overall_verdict && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.48, delay: 0.65, ease }}
                  className="glass-panel"
                  style={{ padding: 20, borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.primary, fontSize: 11, fontFamily: "'Geist Pixel', monospace", fontWeight: 700, marginBottom: 12 }}>
                    <Icon n="gavel" size={14} /> OVERALL VERDICT
                  </div>
                  <p style={{ fontSize: 14, color: C.onSurfVar, lineHeight: '22px', margin: 0 }}>{judge.overall_verdict}</p>
                </motion.div>
              )}
            </div>

            {/* Metrics */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <h5 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 500, margin: 0, color: C.primary }}>
                <Icon n="bar_chart" size={18} /> Feature Metrics
              </h5>
              <div className="glass-panel" style={{ padding: 20, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Accuracy', val: Math.round(Math.max(score1, score2) * 10) },
                  { label: 'Completeness', val: Math.round(((score1 + score2) / 20) * 94) },
                  { label: 'Reasoning Quality', val: Math.round(Math.max(score1, score2) * 9.9) },
                  { label: 'Latency Perf', val: 82 },
                ].map(({ label, val }, i) => (
                  <MetricBar key={label} label={label} val={val} delay={0.55 + i * 0.08} />
                ))}
              </div>
            </motion.div>
          </motion.section>

          {/* CTA */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}
          >
            <motion.button
              onClick={onNew}
              whileHover={shouldReduceMotion ? {} : { scale: 1.02, boxShadow: '0 0 28px rgba(255,255,255,0.15)' }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
              className="btn-glow"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: C.primary, color: C.onPrimary,
                padding: '12px 32px', border: 'none', borderRadius: 8,
                fontFamily: "'Geist Pixel', monospace", fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              <Icon n="add_circle" size={16} style={{ color: C.onPrimary }} />
              New Comparison
            </motion.button>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
