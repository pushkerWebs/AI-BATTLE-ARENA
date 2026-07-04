import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Icon from '../components/Icon'
import { C } from '../constants/colors'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

// ─── How It Works step ───────────────────────────────────────────────────────
function HowStep({ number, icon, title, desc, isLast, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        flex: 1, position: 'relative',
      }}
    >
      {/* Connector line to next step */}
      {!isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: delay + 0.45, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 36, left: '58%', right: '-42%',
            height: 1,
            background: `linear-gradient(90deg, ${C.outlineV}88, ${C.outlineV}11)`,
            transformOrigin: 'left',
            zIndex: 0,
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.88 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1,
        }}
      >
        {/* Icon circle */}
        <motion.div
          whileHover={{ scale: 1.1, boxShadow: `0 0 28px ${C.outlineV}55` }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.surfMid} 0%, ${C.surfLow} 100%)`,
            border: `1px solid ${C.outlineV}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, position: 'relative',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Icon n={icon} size={28} style={{ color: C.onSurf }} />
          {/* Number badge */}
          <div style={{
            position: 'absolute', top: -6, right: -6,
            width: 22, height: 22, borderRadius: '50%',
            background: C.primary, color: C.onPrimary,
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${C.bg}`,
          }}>
            {number}
          </div>
        </motion.div>

        <h3 style={{
          fontFamily: "'Michroma', 'Helvetica', Arial, sans-serif",
          fontSize: 13, fontWeight: 400, letterSpacing: '0.06em',
          color: C.onSurf, marginBottom: 10, marginTop: 0, textTransform: 'uppercase',
        }}>{title}</h3>

        <p style={{
          fontSize: 13, color: C.onSurfVar, lineHeight: '21px', maxWidth: 190,
          margin: 0,
        }}>{desc}</p>
      </motion.div>
    </div>
  )
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home({
  onBattle,
  onNavigate,
  error,
  model1, setModel1,
  model2, setModel2,
  judgeModel, setJudgeModel,
}) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [prompt, setPrompt] = useState('')

  const quickPrompts = [
    'Write a binary search in Python',
    'Design a REST API for a bookstore',
    'Explain recursion with an example',
    'Implement debounce in JavaScript',
  ]

  const howItWorksSteps = [
    {
      number: '01', icon: 'edit_note',
      title: 'Write a Prompt',
      desc: 'Enter any question, coding task, or complex problem into the input field.',
    },
    {
      number: '02', icon: 'smart_toy',
      title: 'Models Battle',
      desc: 'Two AI models respond simultaneously — no cherry-picking, no delays.',
    },
    {
      number: '03', icon: 'balance',
      title: 'Judge Evaluates',
      desc: 'A third AI acts as an impartial judge, scoring accuracy, depth, and coherence.',
    },
    {
      number: '04', icon: 'emoji_events',
      title: 'See the Winner',
      desc: 'Get a clear verdict with scores, analysis, and a side-by-side breakdown.',
    },
  ]

  const handleSubmit = () => {
    if (prompt.trim()) onBattle(prompt.trim())
  }

  const howRef = useRef(null)
  const howInView = useInView(howRef, { once: true, margin: '-80px' })

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg, overflowX: 'hidden' }}>

      {/* WebGL Shader background */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }}>
          <ShaderBg />
        </div>
      )}

      {/* ── Top Nav ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 24px 12px',
          maxWidth: 1280, margin: '0 auto', width: '100%',
          background: 'transparent',
          borderBottom: 'none',
          boxShadow: 'none',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="logo-brand" style={{ fontSize: 20 }}>AI ARENA</span>
        </div>

        {/* Nav links */}
        <nav
          className="navbar-pill"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            borderRadius: 8,
            padding: '8px 24px',
          }}
        >
          {[
            { label: 'Documentation', onClick: () => onNavigate('documentation') },
            { label: 'History', onClick: () => onNavigate(user ? 'history' : 'auth') },
            { label: 'GitHub', href: 'https://github.com' },
          ].map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href || '#'}
              onClick={item.onClick}
              target={item.href && item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href && item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
              style={{
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
                color: C.onSurfVar, textDecoration: 'none', transition: 'color 0.2s',
                cursor: 'pointer', background: 'none', border: 'none',
                padding: '4px 8px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.primary}
              onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
            >{item.label}</motion.a>
          ))}
        </nav>

        {/* Profile / Auth buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          {/* Theme toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'transparent',
              border: `1px solid ${C.outlineV}44`,
              borderRadius: 8,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: C.onSurfVar,
              padding: 0,
              transition: 'all 0.2s',
            }}
          >
            <Icon n={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={16} />
          </motion.button>

          <div style={{ width: 1, height: 24, background: `${C.outlineV}33`, margin: '0 4px' }} />
          {user ? (
            <div style={{ position: 'relative' }}>
              {/* Click outside overlay */}
              {profileOpen && (
                <div
                  onClick={() => setProfileOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }}
                />
              )}

              {/* Avatar circle */}
              <motion.button
                onClick={() => setProfileOpen(!profileOpen)}
                whileHover={{ scale: 1.05, boxShadow: `0 0 12px ${C.primary}55` }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.primary} 0%, ${C.outlineV} 100%)`,
                  color: C.onPrimary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Michroma', 'Helvetica', Arial, sans-serif",
                  fontSize: 14, fontWeight: 700,
                  cursor: 'pointer',
                  border: `1.5px solid ${C.outlineV}aa`,
                  boxShadow: `0 0 10px ${C.primary}22`,
                  padding: 0,
                  position: 'relative',
                  zIndex: 95,
                  outline: 'none',
                }}
              >
                {user.name.trim().charAt(0).toUpperCase()}
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 12,
                      width: 220,
                      background: `${C.surface}f2`,
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${C.outlineV}2a`,
                      borderRadius: 14,
                      padding: 16,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{
                        fontFamily: "'Helvetica', Arial, sans-serif",
                        fontSize: 13, fontWeight: 600, color: C.onSurf
                      }}>{user.name}</span>
                      <span style={{
                        fontFamily: "'Geist Pixel', monospace",
                        fontSize: 10, color: C.onSurfVar, opacity: 0.7
                      }}>{user.email}</span>
                    </div>

                    <div style={{ width: '100%', height: 1, background: `${C.outlineV}1a` }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, color: C.onSurfVar }}>Battles run</span>
                      <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, fontWeight: 700, color: C.primary }}>{user.battleCount || 0}</span>
                    </div>

                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        logout()
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.25)',
                        borderRadius: 8,
                        color: '#f87171',
                        fontFamily: "'Geist Pixel', monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.04, color: C.primary }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('auth')}
                style={{
                  background: 'transparent', color: C.onSurfVar,
                  padding: '8px 12px', border: 'none',
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                }}
              >Sign In</motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 0 16px ${C.primary}33` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('auth')}
                style={{
                  background: C.primary, color: C.onPrimary,
                  padding: '8px 14px', border: 'none', borderRadius: 6,
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >Register</motion.button>
            </div>
          )}
        </motion.div>
      </motion.header>

      {/* ── Error banner ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'relative', zIndex: 20,
            margin: '12px 24px 0', padding: '12px 20px',
            borderRadius: 8,
            background: 'rgba(220,38,38,0.12)',
            border: '1px solid rgba(220,38,38,0.35)',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#f87171', flexShrink: 0, marginTop: 2 }}>error</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f87171', marginBottom: 2, fontFamily: "'Geist Pixel', monospace" }}>
              Battle Failed
            </div>
            <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: '18px', wordBreak: 'break-word' }}>{error}</div>
            <div style={{ fontSize: 11, color: '#fca5a5', marginTop: 6, opacity: 0.7 }}>
              💡 Try switching to <strong>Gemini 2.5 Flash</strong> as the judge — it has a higher free quota.
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Main ── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        {/* ── Hero Section ── */}
        <section style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', paddingTop: 80, paddingBottom: 64,
        }}>

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="anim-pulse"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 9999,
              border: `1px solid ${C.outlineV}33`, background: C.surfLow,
              marginBottom: 28,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, flexShrink: 0, display: 'block' }} />
            <span style={{
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.onSurfVar,
            }}>System Status: Optimal</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: theme === 'light' ? '#000000' : C.onSurf, maxWidth: 720, marginBottom: 20, marginTop: 0,
            }}
          >
            Compare AI Models.{' '}
            <motion.span
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
              style={{ fontStyle: 'italic', display: 'inline-block' }}
            >
              <span style={{ color: theme === 'light' ? '#000000' : 'inherit' }}>Find the </span>
              <span style={{ color: theme === 'light' ? C.primary : 'inherit' }}>Best </span>
              <span style={{ color: theme === 'light' ? '#000000' : 'inherit' }}>Answer.</span>
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            style={{
              fontSize: 15, color: C.onSurfVar,
              maxWidth: 560, marginBottom: 36, lineHeight: '26px',
            }}
          >
            The high-performance evaluator for technical decision-makers. Run side-by-side
            comparisons of primary LLM providers with granular metrics and a customizable judge.
          </motion.p>

          {/* Model Selectors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.28 }}
            style={{
              width: '100%', maxWidth: 720,
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
              marginBottom: 20, textAlign: 'left',
            }}
          >
            {/* Model 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.onSurfVar, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model 1 (Contestant)</label>
              <select value={model1} onChange={e => setModel1(e.target.value)} style={{ background: C.surfLow, color: C.onSurf, border: `1px solid ${C.outlineV}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: "'Geist Pixel', monospace", outline: 'none', cursor: 'pointer' }}>
                <optgroup label="Mistral AI">
                  <option value="mistral-medium-latest">Mistral Medium</option>
                  <option value="mistral-large-latest">Mistral Large</option>
                  <option value="open-mixtral-8x22b">Mixtral 8x22B</option>
                </optgroup>
                <optgroup label="Cohere">
                  <option value="command-a-03-2025">Command A (Latest)</option>
                  <option value="command-r-08-2024">Command R</option>
                </optgroup>
                <optgroup label="Google Gemini">
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
              </select>
            </div>

            {/* Model 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.onSurfVar, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model 2 (Contestant)</label>
              <select value={model2} onChange={e => setModel2(e.target.value)} style={{ background: C.surfLow, color: C.onSurf, border: `1px solid ${C.outlineV}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: "'Geist Pixel', monospace", outline: 'none', cursor: 'pointer' }}>
                <optgroup label="Cohere">
                  <option value="command-a-03-2025">Command A (Latest)</option>
                  <option value="command-r-08-2024">Command R</option>
                </optgroup>
                <optgroup label="Mistral AI">
                  <option value="mistral-medium-latest">Mistral Medium</option>
                  <option value="mistral-large-latest">Mistral Large</option>
                  <option value="open-mixtral-8x22b">Mixtral 8x22B</option>
                </optgroup>
                <optgroup label="Google Gemini">
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
              </select>
            </div>

            {/* Judge */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.onSurfVar, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluation Judge</label>
              <select value={judgeModel} onChange={e => setJudgeModel(e.target.value)} style={{ background: C.surfLow, color: C.onSurf, border: `1px solid ${C.outlineV}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: "'Geist Pixel', monospace", outline: 'none', cursor: 'pointer' }}>
                <optgroup label="Google Gemini">
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
                <optgroup label="Mistral AI">
                  <option value="mistral-large-latest">Mistral Large</option>
                  <option value="mistral-medium-latest">Mistral Medium</option>
                  <option value="open-mixtral-8x22b">Mixtral 8x22B</option>
                </optgroup>
                <optgroup label="Cohere">
                  <option value="command-a-03-2025">Command A (Latest)</option>
                  <option value="command-r-08-2024">Command R</option>
                </optgroup>
              </select>
            </div>
          </motion.div>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: 720, borderRadius: 12 }}
          >
            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 24px', borderBottom: `1px solid ${C.outlineV}1a`,
            }}>
              <span style={{
                fontFamily: "'Geist Pixel', monospace", fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: C.onSurfVar, opacity: 0.5,
              }}>Main Input Field</span>
              <div style={{ display: 'flex', gap: 8, color: C.onSurfVar }}>
                <Icon n="terminal" size={18} />
                <Icon n="auto_awesome" size={18} />
              </div>
            </div>

            {/* Textarea */}
            <textarea
              id="mainPrompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit() }}
              placeholder="Ask anything..."
              rows={5}
              style={{
                width: '100%', background: 'transparent',
                border: 'none', outline: 'none', resize: 'none',
                padding: 24,
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 15, lineHeight: '24px', color: C.onSurf,
              }}
            />

            {/* Card footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderTop: `1px solid ${C.outlineV}1a`,
              flexWrap: 'wrap', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['attach_file', 'Context'], ['settings_input_component', 'Parameters']].map(([ic, lb]) => (
                  <motion.button key={lb}
                    whileHover={{ color: C.primary }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: "'Geist Pixel', monospace",
                      fontSize: 12, color: C.onSurfVar, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = C.primary}
                    onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
                  >
                    <Icon n={ic} size={18} style={{ color: 'inherit' }} />
                    {lb}
                  </motion.button>
                ))}
              </div>

              <motion.button
                id="compare-btn"
                disabled={!prompt.trim()}
                onClick={handleSubmit}
                whileHover={prompt.trim() ? { scale: 1.04, boxShadow: '0 0 24px rgba(255,255,255,0.14)' } : {}}
                whileTap={prompt.trim() ? { scale: 0.97 } : {}}
                className="btn-glow"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: C.primary, color: C.onPrimary,
                  padding: '12px 24px', border: 'none', borderRadius: 8,
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 12, fontWeight: 500,
                  cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                  opacity: prompt.trim() ? 1 : 0.45,
                  transition: 'opacity 0.3s',
                }}
              >
                <Icon n="auto_awesome" fill size={20} style={{ color: C.onPrimary }} />
                Compare Responses
              </motion.button>
            </div>
          </motion.div>

          {/* Quick prompts */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 }}
          >
            {quickPrompts.map(p => (
              <motion.button
                key={p}
                variants={fadeUp}
                onClick={() => setPrompt(p)}
                whileHover={{ y: -2, background: C.surfHigh, color: C.onSurf }}
                style={{
                  padding: '6px 14px', background: C.surfLow,
                  border: `1px solid ${C.outlineV}33`, borderRadius: 4,
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 12, color: C.onSurfVar, cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >{p}</motion.button>
            ))}
          </motion.div>
        </section>

        {/* ── How It Works ── */}
        <section
          ref={howRef}
          style={{
            paddingTop: 72, paddingBottom: 100,
            borderTop: `1px solid ${C.outlineV}18`,
          }}
        >
          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={howInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45 }}
              style={{
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: C.onSurfVar, opacity: 0.5, margin: '0 0 12px',
              }}
            >Process</motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={howInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.08 }}
              style={{
                fontFamily: "'Michroma', 'Helvetica', Arial, sans-serif",
                fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 400,
                letterSpacing: '0.04em', color: C.onSurf,
                margin: '0 0 14px',
              }}
            >How It Works</motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={howInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.16 }}
              style={{
                fontSize: 14, color: C.onSurfVar, maxWidth: 400, margin: '0 auto',
                lineHeight: '22px',
              }}
            >
              Four transparent steps. Zero black boxes. Full visibility into every verdict.
            </motion.p>
          </div>

          {/* Steps row */}
          <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', position: 'relative' }}>
            {howItWorksSteps.map((step, i) => (
              <HowStep
                key={step.number}
                number={step.number}
                icon={step.icon}
                title={step.title}
                desc={step.desc}
                isLast={i === howItWorksSteps.length - 1}
                delay={0.08 + i * 0.15}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.8 }}
            style={{ textAlign: 'center', marginTop: 64 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, borderColor: C.primary, boxShadow: `0 0 28px ${C.outlineV}44` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('mainPrompt')?.focus()}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'transparent',
                border: `1px solid ${C.outlineV}`,
                color: C.onSurf,
                padding: '14px 32px', borderRadius: 8,
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'border-color 0.2s, box-shadow 0.3s',
              }}
            >
              <Icon n="rocket_launch" size={18} style={{ color: C.primary }} />
              Start Your First Battle
              <Icon n="arrow_forward" size={16} style={{ opacity: 0.55 }} />
            </motion.button>
          </motion.div>
        </section>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <footer id="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'none', justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 16px 12px',
        background: `${C.surfHigh2}e6`, backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${C.outlineV}33`, borderRadius: '16px 16px 0 0',
        zIndex: 50,
      }}>
        {[
          { icon: 'add_circle', label: 'New', onClick: () => document.getElementById('mainPrompt')?.focus() },
          { icon: 'history', label: 'History', onClick: () => onNavigate(user ? 'history' : 'auth') },
          { icon: 'star', label: 'Favs', onClick: () => { } },
          { icon: 'menu', label: 'Menu', onClick: () => { } }
        ].map((item, i) => (
          <button
            key={item.label}
            onClick={item.onClick}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: i === 0 ? C.primary : 'transparent',
              color: i === 0 ? C.onPrimary : C.onSurfVar,
              fontFamily: "'Geist Pixel', monospace", fontSize: 11,
            }}
          >
            <Icon n={item.icon} size={22} style={{ color: 'inherit' }} />
            {item.label}
          </button>
        ))}
      </footer>
    </div>
  )
}
