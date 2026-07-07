import React, { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Icon from '../components/Icon'
import { C } from '../constants/colors'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Avatar from '../components/Avatar'

// ─── How It Works step (triggered only when scrolled into view) ─────────────
function HowStep({ number, icon, title, desc, isLast, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const shouldReduceMotion = useReducedMotion()

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
          className="how-step-connector"
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
        initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1,
        }}
      >
        {/* Icon circle */}
        <motion.div
          whileHover={shouldReduceMotion ? {} : { scale: 1.02, boxShadow: `0 0 28px ${C.outlineV}55` }}
          transition={{ duration: 0.2 }}
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

// ─── Mobile Hamburger Drawer ─────────────────────────────────────────────────
const MobileDrawer = React.memo(({ open, onClose, onNavigate, user, logout, theme, toggleTheme }) => {
  const navItems = [
    { icon: 'add_box',     label: 'New Comparison',  onClick: () => { onNavigate('home'); onClose() } },
    { icon: 'history',     label: 'History',          onClick: () => { onNavigate(user ? 'history' : 'auth'); onClose() } },
    { icon: 'description', label: 'Documentation',    onClick: () => { onNavigate('documentation'); onClose() } },
    { icon: 'open_in_new', label: 'GitHub',           href: 'https://github.com/pushkerWebs/AI-BATTLE-ARENA' },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="mobile-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="mobile-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            {/* Drawer header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${C.outlineV}22`,
            }}>
              <span className="logo-brand" style={{ fontSize: 16 }}>AI ARENA</span>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: C.onSurfVar, display: 'flex', alignItems: 'center',
                  padding: 4, borderRadius: 6,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
              </button>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navItems.map((item, i) => (
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '11px 14px', borderRadius: 8,
                      color: C.onSurfVar, textDecoration: 'none',
                      fontFamily: "'Geist Pixel', monospace", fontSize: 12,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.surfHigh; e.currentTarget.style.color = C.onSurf }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.onSurfVar }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'inherit' }}>{item.icon}</span>
                    {item.label}
                    <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto', opacity: 0.4 }}>open_in_new</span>
                  </a>
                ) : (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '11px 14px', borderRadius: 8,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: C.onSurfVar, width: '100%', textAlign: 'left',
                      fontFamily: "'Geist Pixel', monospace", fontSize: 12,
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.surfHigh; e.currentTarget.style.color = C.onSurf }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.onSurfVar }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'inherit' }}>{item.icon}</span>
                    {item.label}
                  </button>
                )
              ))}

              {/* Divider */}
              <div style={{ height: 1, background: `${C.outlineV}22`, margin: '8px 0' }} />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '11px 14px', borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: C.onSurfVar, width: '100%', textAlign: 'left',
                  fontFamily: "'Geist Pixel', monospace", fontSize: 12,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.surfHigh}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </nav>

            {/* Bottom auth area */}
            <div style={{ padding: '16px 12px 24px', borderTop: `1px solid ${C.outlineV}22` }}>
              {user ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', marginBottom: 8,
                    background: C.surfMid, borderRadius: 8,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: C.surfHigh2, border: `1px solid ${C.outlineV}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 13, fontWeight: 600, color: C.primary,
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.onSurf, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                      <div style={{ fontSize: 10, color: C.onSurfVar, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { logout(); onClose() }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                      color: '#f87171', fontFamily: "'Geist Pixel', monospace",
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >Sign Out</button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={() => { onNavigate('auth'); onClose() }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      background: C.primary, border: 'none',
                      color: C.onPrimary, fontFamily: "'Geist Pixel', monospace",
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}
                  >Sign In / Register</button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

// ─── Header (React.memo to isolate profile toggles and navbar rendering) ─────
const Header = React.memo(({ onNavigate }) => {
  const [profileOpen, setProfileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const [hasAnimated] = useState(() => {
    const flag = sessionStorage.getItem('ai_arena_navbar_animated')
    if (!flag) {
      sessionStorage.setItem('ai_arena_navbar_animated', 'true')
      return false
    }
    return true
  })

  return (
    <>
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={onNavigate}
        user={user}
        logout={logout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <motion.header
        initial={(hasAnimated || shouldReduceMotion) ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: 'clamp(12px, 3vw, 24px) clamp(16px, 3vw, 24px) clamp(8px, 1.5vw, 12px)',
          maxWidth: 1280, margin: '0 auto', width: '100%',
          background: 'transparent',
          borderBottom: 'none',
          boxShadow: 'none',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="logo-brand"
            onClick={() => onNavigate('home')}
            style={{ fontSize: 20, cursor: 'pointer' }}
          >
            AI ARENA
          </span>
        </div>

        {/* Nav links (Static rendering to avoid layout shifts) */}
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
            { label: 'GitHub', href: 'https://github.com/pushkerWebs/AI-BATTLE-ARENA' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href || '#'}
              onClick={item.onClick}
              target={item.href && item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href && item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 13, fontWeight: 500, letterSpacing: '0.01em',
                color: C.onSurfVar, textDecoration: 'none', transition: 'color 0.2s',
                cursor: 'pointer', background: 'none', border: 'none',
                padding: '4px 8px',
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.primary}
              onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
            >{item.label}</a>
          ))}
        </nav>

        {/* Right side: desktop auth + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme toggle — desktop */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="desktop-auth"
            style={{
              background: 'transparent',
              border: `1px solid ${C.outlineV}44`,
              borderRadius: 8,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: C.onSurfVar,
              padding: 0,
              transition: 'all 0.2s',
            }}
          >
            <Icon n={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={16} />
          </motion.button>

          <div className="desktop-auth" style={{ width: 1, height: 24, background: `${C.outlineV}33`, margin: '0 4px' }} />

          {/* Desktop profile / auth buttons */}
          {user ? (
            <div className="desktop-auth" style={{ position: 'relative' }}>
              {profileOpen && (
                <div
                  onClick={() => setProfileOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 90, cursor: 'default' }}
                />
              )}
              <Avatar
                user={user}
                size={36}
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  cursor: 'pointer',
                  border: `1.5px solid ${C.outlineV}aa`,
                  boxShadow: `0 0 10px ${C.primary}22`,
                  zIndex: 95, position: 'relative',
                }}
              />
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 12,
                      width: 220, background: `${C.surface}f2`, backdropFilter: 'blur(20px)',
                      border: `1px solid ${C.outlineV}33`, borderRadius: 12,
                      padding: '12px 8px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                      display: 'flex', flexDirection: 'column', gap: 8, zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.outlineV}22`, marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, color: C.onSurf, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                      <div style={{ color: C.onSurfVar, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{user.email}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 12px' }}>
                      <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, color: C.onSurfVar }}>Battles run</span>
                      <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, fontWeight: 700, color: C.primary }}>{user.battleCount || 0}</span>
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); onNavigate('history') }}
                      style={{
                        width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${C.outlineV}33`, borderRadius: 8, color: C.onSurf,
                        fontFamily: "'Geist Pixel', monospace", fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >Battle History</button>
                    <button
                      onClick={() => { setProfileOpen(false); logout() }}
                      style={{
                        width: '100%', padding: '8px 12px', background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.25)', borderRadius: 8, color: '#f87171',
                        fontFamily: "'Geist Pixel', monospace", fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    >Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => onNavigate('auth')}
                style={{
                  background: 'transparent', color: C.onSurfVar,
                  padding: '8px 12px', border: 'none',
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = C.primary}
                onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
              >Sign In</button>
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

          {/* Hamburger — mobile only */}
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>menu</span>
          </button>
        </div>
      </motion.header>
    </>
  )
})

// ─── Model Selectors (React.memo to prevent changes from re-rendering the whole page) ─────
const ModelSelectors = React.memo(({
  model1, setModel1,
  model2, setModel2,
  judgeModel, setJudgeModel
}) => {
  return (
    <div className="model-selectors-grid">
      {/* Model 1 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.onSurfVar, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model 1 (Contestant)</label>
        <select value={model1} onChange={e => setModel1(e.target.value)} style={{ background: C.surfLow, color: C.onSurf, border: `1px solid ${C.outlineV}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: "'Geist Pixel', monospace", outline: 'none', cursor: 'pointer' }}>
          <optgroup label="Mistral AI">
            <option value="mistral-medium-latest">Mistral Medium</option>
            <option value="mistral-large-latest">Mistral Large</option>
            <option value="open-mixtral-8x22b">Mixtral 8x22B</option>
            <option value="mistral-small-latest">Mistral Small</option>
          </optgroup>
          <optgroup label="Cohere">
            <option value="command-a-03-2025">Command A (Latest)</option>
            <option value="command-r-08-2024">Command R</option>
          </optgroup>
          <optgroup label="Google Gemini">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
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
            <option value="mistral-small-latest">Mistral Small</option>
          </optgroup>
          <optgroup label="Google Gemini">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </optgroup>
        </select>
      </div>

      {/* Judge */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.onSurfVar, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluation Judge</label>
        <select value={judgeModel} onChange={e => setJudgeModel(e.target.value)} style={{ background: C.surfLow, color: C.onSurf, border: `1px solid ${C.outlineV}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: "'Geist Pixel', monospace", outline: 'none', cursor: 'pointer' }}>
          <optgroup label="Google Gemini">
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
          </optgroup>
          <optgroup label="Mistral AI">
            <option value="mistral-large-latest">Mistral Large</option>
            <option value="mistral-medium-latest">Mistral Medium</option>
            <option value="open-mixtral-8x22b">Mixtral 8x22B</option>
            <option value="mistral-small-latest">Mistral Small</option>
          </optgroup>
          <optgroup label="Cohere">
            <option value="command-a-03-2025">Command A (Latest)</option>
            <option value="command-r-08-2024">Command R</option>
          </optgroup>
        </select>
      </div>
    </div>
  )
})

// ─── BattleInputZone (React.memo to isolate prompt keystrokes rendering) ──────
const BattleInputZone = React.memo(({ onBattle }) => {
  const [prompt, setPrompt] = useState('')
  const shouldReduceMotion = useReducedMotion()

  const quickPrompts = [
    'Write a binary search in Python',
    'Design a REST API for a bookstore',
    'Explain recursion with an example',
    'Implement debounce in JavaScript',
  ]

  const handleSubmit = () => {
    if (prompt.trim()) onBattle(prompt.trim())
  }

  return (
    <>
      {/* Input Card */}
      <div
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
              <button key={lb}
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
              </button>
            ))}
          </div>

          <motion.button
            id="compare-btn"
            disabled={!prompt.trim()}
            onClick={handleSubmit}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: prompt.trim() ? 1 : 0.45 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={prompt.trim() && !shouldReduceMotion ? { scale: 1.02, boxShadow: '0 0 24px rgba(255,255,255,0.14)' } : {}}
            whileTap={prompt.trim() && !shouldReduceMotion ? { scale: 0.985 } : {}}
            className="btn-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.primary, color: C.onPrimary,
              padding: '12px 24px', border: 'none', borderRadius: 8,
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 12, fontWeight: 500,
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            <Icon n="auto_awesome" fill size={20} style={{ color: C.onPrimary }} />
            Compare Responses
          </motion.button>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {quickPrompts.map(p => (
          <button
            key={p}
            onClick={() => setPrompt(p)}
            style={{
              padding: '6px 14px', background: C.surfLow,
              border: `1px solid ${C.outlineV}33`, borderRadius: 4,
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 12, color: C.onSurfVar, cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = C.surfHigh
              e.currentTarget.style.color = C.onSurf
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = C.surfLow
              e.currentTarget.style.color = C.onSurfVar
            }}
          >{p}</button>
        ))}
      </div>
    </>
  )
})

// ─── HowItWorks (React.memo to isolate scrolling/intersection rendering) ─────
const HowItWorks = React.memo(() => {
  const howRef = useRef(null)
  const howInView = useInView(howRef, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()

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

  return (
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
      <div className="how-steps-row">
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
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        animate={howInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.8 }}
        style={{ textAlign: 'center', marginTop: 64 }}
      >
        <motion.button
          whileHover={shouldReduceMotion ? {} : { scale: 1.02, borderColor: C.primary, boxShadow: `0 0 28px ${C.outlineV}44` }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
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
  )
})

// ─── BackgroundLayer (React.memo to isolate ShaderBg mounting to ThemeContext only) ───
const BackgroundLayer = React.memo(() => {
  const { theme } = useTheme()
  if (theme !== 'dark') return null
  return (
    <div style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }}>
      <ShaderBg />
    </div>
  )
})

// ─── Footer (no longer used — mobile nav replaced by hamburger) ───────────────
// (bottom nav bar removed)

// ─── Main Home component (Pure Layout Wrapper — no direct Context subscriptions) ──
export default function Home({
  onBattle,
  onNavigate,
  error,
  model1, setModel1,
  model2, setModel2,
  judgeModel, setJudgeModel,
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg, overflowX: 'hidden' }}>

      {/* WebGL Shader background (Context decoupled background layer) */}
      <BackgroundLayer />

      {/* Top Nav (Isolated render lifecycle) */}
      <Header
        onNavigate={onNavigate}
      />

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
      <main className="home-main" style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto' }}>

        {/* ── Hero Section (Statically rendered above-the-fold elements) ── */}
        <section className="hero-section" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
        }}>

          {/* H1 Title (CSS Custom Property color mapping) */}
          <motion.h1
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: 'var(--color-hero-title)', maxWidth: 720, marginBottom: 20, marginTop: 0,
            }}
          >
            Compare AI Models.{' '}
            <span style={{ fontStyle: 'italic', display: 'inline-block' }}>
              <span style={{ color: 'var(--color-hero-accent-text)' }}>Find the </span>
              <span style={{ color: 'var(--color-hero-accent-primary)' }}>Best </span>
              <span style={{ color: 'var(--color-hero-accent-text)' }}>Answer.</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 15, color: C.onSurfVar,
              maxWidth: 560, marginBottom: 36, lineHeight: '26px',
            }}
          >
            The high-performance evaluator for technical decision-makers. Run side-by-side
            comparisons of primary LLM providers with granular metrics and a customizable judge.
          </p>

          {/* Model Selectors (Isolated render lifecycle) */}
          <ModelSelectors
            model1={model1}
            setModel1={setModel1}
            model2={model2}
            setModel2={setModel2}
            judgeModel={judgeModel}
            setJudgeModel={setJudgeModel}
          />

          {/* Prompt Input Card & Quick Prompts (Keystroke isolated render lifecycle) */}
          <BattleInputZone
            onBattle={onBattle}
          />
        </section>

        {/* ── How It Works (Animation triggered below-the-fold only) ── */}
        <HowItWorks />
      </main>

      {/* ── Mobile Bottom Nav removed — hamburger in header handles mobile nav ── */}
    </div>
  )
}
