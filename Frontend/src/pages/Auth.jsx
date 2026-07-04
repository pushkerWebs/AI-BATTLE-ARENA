import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import { C } from '../constants/colors'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ─── Animated Input ────────────────────────────────────────────────────────
function AuthInput({ id, label, type = 'text', value, onChange, placeholder, icon, error }) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const hasValue = value.length > 0

  const isPassword = type === 'password'
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div style={{ marginBottom: 20 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontFamily: "'Geist Pixel', monospace",
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: focused ? C.primary : C.onSurfVar,
          marginBottom: 8,
          transition: 'color 0.2s',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {/* Icon */}
        <span
          className="material-symbols-outlined"
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 18,
            color: focused ? C.primary : C.onSurfVar,
            transition: 'color 0.2s',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>

        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'name'}
          style={{
            width: '100%',
            background: focused ? `${C.surfMid}` : C.surfLow,
            border: `1px solid ${error ? '#f87171' : focused ? C.primary : `${C.outlineV}44`}`,
            borderRadius: 10,
            padding: `13px ${isPassword ? '44px' : '14px'} 13px 44px`,
            fontFamily: "'Helvetica', Arial, sans-serif",
            fontSize: 14,
            color: C.onSurf,
            outline: 'none',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
            boxShadow: focused
              ? `0 0 0 3px ${C.primary}1a, 0 0 20px ${C.primary}0d`
              : 'none',
          }}
        />

        {isPassword && hasValue && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              color: showPassword ? C.primary : C.onSurfVar,
              transition: 'color 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 11,
            color: '#f87171',
            marginTop: 6,
            marginBottom: 0,
          }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ─── Auth Page ─────────────────────────────────────────────────────────────
export default function Auth({ onNavigate, defaultTab = 'login' }) {
  const { login, register } = useAuth()
  const { theme } = useTheme()
  const [tab, setTab] = useState(defaultTab) // 'login' | 'signup'

  // Login state
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError]       = useState('')
  const [loginLoading, setLoginLoading]   = useState(false)

  // Signup state
  const [signupName, setSignupName]         = useState('')
  const [signupEmail, setSignupEmail]       = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm]   = useState('')
  const [signupErrors, setSignupErrors]     = useState({})
  const [signupLoading, setSignupLoading]   = useState(false)

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      await login({ email: loginEmail, password: loginPassword })
      onNavigate('home')
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!signupName.trim()) errs.name = 'Name is required'
    if (!signupEmail.trim()) errs.email = 'Email is required'
    if (signupPassword.length < 6) errs.password = 'At least 6 characters'
    if (signupPassword !== signupConfirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length) { setSignupErrors(errs); return }

    setSignupErrors({})
    setSignupLoading(true)
    try {
      await register({ name: signupName, email: signupEmail, password: signupPassword })
      onNavigate('home')
    } catch (err) {
      setSignupErrors({ general: err.message })
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Background shader */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, opacity: 0.45, pointerEvents: 'none', zIndex: 0 }}>
          <ShaderBg />
        </div>
      )}

      {/* Decorative glow orbs */}
      <div style={{
        position: 'fixed', top: '20%', left: '15%',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.primary}18 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '20%', right: '10%',
        width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.secondary}12 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Top bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-navbar"
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px',
          borderBottom: `1px solid ${C.outlineV}18`,
          background: `${C.surface}99`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={() => onNavigate('home')}
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

        <span className="logo-brand" style={{ fontSize: 18 }}>
          AI ARENA
        </span>

        <div style={{ width: 80 }} /> {/* spacer */}
      </motion.header>

      {/* Main centered content */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            width: '100%', maxWidth: 440,
          }}
        >
          {/* Header text */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '5px 14px', borderRadius: 9999,
                border: `1px solid ${C.primary}44`,
                background: `${C.primary}0d`,
                marginBottom: 20,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: C.primary }}>
                shield_with_heart
              </span>
              <span style={{
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                color: C.primary,
              }}>
                Secure Authentication
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em',
                color: C.onSurf, margin: '0 0 10px',
              }}
            >
              {tab === 'login' ? 'Welcome back' : 'Join the Arena'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ fontSize: 14, color: C.onSurfVar, margin: 0, lineHeight: '22px' }}
            >
              {tab === 'login'
                ? 'Sign in to your AI Arena account'
                : 'Create your account and start battling'}
            </motion.p>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: `${C.surface}e8`,
              backdropFilter: 'blur(24px)',
              border: `1px solid ${C.outlineV}2a`,
              borderRadius: 20,
              padding: '8px',
              boxShadow: `0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px ${C.primary}0d, inset 0 1px 0 ${C.outlineV}18`,
            }}
          >
            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: C.surfLow,
              borderRadius: 14,
              padding: 4,
              marginBottom: 24,
              position: 'relative',
            }}>
              {[{ id: 'login', label: 'Sign In' }, { id: 'signup', label: 'Create Account' }].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id)
                    setLoginError('')
                    setSignupErrors({})
                  }}
                  style={{
                    flex: 1, padding: '10px 16px',
                    border: 'none', borderRadius: 11, cursor: 'pointer',
                    fontFamily: "'Geist Pixel', monospace",
                    fontSize: 12, fontWeight: 500, letterSpacing: '0.03em',
                    transition: 'all 0.25s',
                    background: tab === t.id ? C.surfHigh : 'transparent',
                    color: tab === t.id ? C.onSurf : C.onSurfVar,
                    boxShadow: tab === t.id
                      ? `0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 ${C.outlineV}22`
                      : 'none',
                    position: 'relative', zIndex: 1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Forms */}
            <div style={{ padding: '0 8px 8px' }}>
              <AnimatePresence mode="wait">
                {tab === 'login' ? (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleLogin}
                  >
                    <AuthInput
                      id="login-email"
                      label="Email Address"
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      icon="mail"
                    />
                    <AuthInput
                      id="login-password"
                      label="Password"
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      icon="lock"
                    />

                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: 'rgba(248,113,113,0.1)',
                          border: '1px solid rgba(248,113,113,0.3)',
                          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f87171', flexShrink: 0 }}>error</span>
                        <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 12, color: '#fca5a5' }}>
                          {loginError}
                        </span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={loginLoading || !loginEmail || !loginPassword}
                      whileHover={!loginLoading ? { scale: 1.02, boxShadow: `0 8px 32px ${C.primary}44` } : {}}
                      whileTap={!loginLoading ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%', padding: '14px',
                        background: loginLoading || !loginEmail || !loginPassword
                          ? `${C.primary}55`
                          : C.primary,
                        color: C.onPrimary, border: 'none', borderRadius: 12,
                        fontFamily: "'Geist Pixel', monospace",
                        fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
                        cursor: loginLoading || !loginEmail || !loginPassword ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.2s',
                        boxShadow: `0 4px 20px ${C.primary}33`,
                      }}
                    >
                      {loginLoading ? (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
                          Sign In
                        </>
                      )}
                    </motion.button>

                    <p style={{
                      textAlign: 'center', marginTop: 20, marginBottom: 0,
                      fontFamily: "'Geist Pixel', monospace", fontSize: 12, color: C.onSurfVar,
                    }}>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('signup')}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: C.primary, fontFamily: 'inherit', fontSize: 'inherit',
                          textDecoration: 'underline',
                        }}
                      >
                        Create one
                      </button>
                    </p>
                  </motion.form>
                ) : (
                  <motion.form
                    key="signup"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleSignup}
                  >
                    <AuthInput
                      id="signup-name"
                      label="Full Name"
                      type="text"
                      value={signupName}
                      onChange={e => setSignupName(e.target.value)}
                      placeholder="Alex Johnson"
                      icon="person"
                      error={signupErrors.name}
                    />
                    <AuthInput
                      id="signup-email"
                      label="Email Address"
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      icon="mail"
                      error={signupErrors.email}
                    />
                    <AuthInput
                      id="signup-password"
                      label="Password"
                      type="password"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      icon="lock"
                      error={signupErrors.password}
                    />
                    <AuthInput
                      id="signup-confirm"
                      label="Confirm Password"
                      type="password"
                      value={signupConfirm}
                      onChange={e => setSignupConfirm(e.target.value)}
                      placeholder="••••••••"
                      icon="lock_reset"
                      error={signupErrors.confirm}
                    />

                    {signupErrors.general && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          background: 'rgba(248,113,113,0.1)',
                          border: '1px solid rgba(248,113,113,0.3)',
                          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f87171', flexShrink: 0 }}>error</span>
                        <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 12, color: '#fca5a5' }}>
                          {signupErrors.general}
                        </span>
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={signupLoading}
                      whileHover={!signupLoading ? { scale: 1.02, boxShadow: `0 8px 32px ${C.primary}44` } : {}}
                      whileTap={!signupLoading ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%', padding: '14px',
                        background: signupLoading ? `${C.primary}55` : C.primary,
                        color: C.onPrimary, border: 'none', borderRadius: 12,
                        fontFamily: "'Geist Pixel', monospace",
                        fontSize: 13, fontWeight: 600, letterSpacing: '0.04em',
                        cursor: signupLoading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'background 0.2s',
                        boxShadow: `0 4px 20px ${C.primary}33`,
                      }}
                    >
                      {signupLoading ? (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 18, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                          Creating account...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>rocket_launch</span>
                          Create Account
                        </>
                      )}
                    </motion.button>

                    <p style={{
                      textAlign: 'center', marginTop: 20, marginBottom: 0,
                      fontFamily: "'Geist Pixel', monospace", fontSize: 12, color: C.onSurfVar,
                    }}>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setTab('login')}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: C.primary, fontFamily: 'inherit', fontSize: 'inherit',
                          textDecoration: 'underline',
                        }}
                      >
                        Sign in
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              textAlign: 'center', marginTop: 24, marginBottom: 0,
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 11, color: C.onSurfVar, opacity: 0.5, lineHeight: '18px',
            }}
          >
            By continuing, you agree to our Terms of Service.<br />
            Your data is end-to-end encrypted.
          </motion.p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
