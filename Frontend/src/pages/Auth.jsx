import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

// ─── Minimal Comparison Flow Diagram (Left Side) ───────────────────────────
function ComparisonFlowDiagram() {
  return (
    <div style={{
      width: '100%',
      maxWidth: 420,
      background: '#09090b',
      border: '1px solid #1c1c1f',
      borderRadius: 10,
      padding: 16,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      alignSelf: 'flex-start',
      marginTop: 24,
    }}>
      {/* Step 1: Prompt */}
      <div style={{
        background: '#0e0e11',
        border: '1px solid #27272a',
        borderRadius: 6,
        padding: '10px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#3b82f6' }}>terminal</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#71717a', letterSpacing: '0.05em' }}>PROMPT INPUT</span>
        </div>
        <div style={{ fontSize: 11, color: '#e4e4e7', fontFamily: 'monospace' }}>
          "Compare efficiency of quicksort vs mergesort..."
        </div>
      </div>

      {/* Connection Wires */}
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '-8px 0', height: 16 }}>
        <div style={{ width: 1, borderLeft: '1px dashed #27272a' }} />
        <div style={{ width: 1, borderLeft: '1px dashed #27272a' }} />
      </div>

      {/* Step 2: Parallel Models */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Model A */}
        <div style={{
          flex: 1,
          background: '#0e0e11',
          border: '1px solid #27272a',
          borderRadius: 6,
          padding: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa' }}>Model A</span>
            <span style={{ fontSize: 8, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1px 4px', borderRadius: 4, fontWeight: 600 }}>FAST</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, width: '90%' }} />
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, width: '75%' }} />
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, width: '85%' }} />
          </div>
        </div>

        {/* Model B */}
        <div style={{
          flex: 1,
          background: '#0e0e11',
          border: '1px solid #27272a',
          borderRadius: 6,
          padding: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#a1a1aa' }}>Model B</span>
            <span style={{ fontSize: 8, background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '1px 4px', borderRadius: 4, fontWeight: 600 }}>DETAILED</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, width: '95%' }} />
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, width: '80%' }} />
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, width: '60%' }} />
          </div>
        </div>
      </div>

      {/* Connection Wires */}
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '-8px 0', height: 16 }}>
        <div style={{ width: 1, borderLeft: '1px dashed #27272a' }} />
        <div style={{ width: 1, borderLeft: '1px dashed #27272a' }} />
      </div>

      {/* Step 3: Verdict */}
      <div style={{
        background: '#0e0e11',
        border: '1px solid #27272a',
        borderRadius: 6,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#eab308' }}>gavel</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 8, fontWeight: 600, color: '#71717a', letterSpacing: '0.05em' }}>VERDICT</span>
            <span style={{ fontSize: 11, color: '#e4e4e7' }}>Model B wins audit</span>
          </div>
        </div>
        <span style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>100% MATCH</span>
      </div>
    </div>
  )
}

// ─── Password Strength Meter ─────────────────────────────────────────────────
function PasswordStrengthMeter({ password }) {
  if (!password) return null

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const labels = ['Too Short', 'Weak', 'Medium', 'Strong']
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']

  return (
    <div style={{ marginTop: -8, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 3, height: 2, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              borderRadius: 1,
              background: step <= score ? colors[score - 1] : '#27272a',
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#71717a', fontFamily: 'system-ui, sans-serif' }}>
        <span>Strength</span>
        <span style={{ color: colors[score - 1] || '#ef4444', fontWeight: 600 }}>
          {labels[score - 1] || 'Weak'}
        </span>
      </div>
    </div>
  )
}

// ─── Minimal High-Contrast Input ─────────────────────────────────────────────
function AuthInput({ id, label, type = 'text', value, onChange, placeholder, icon, error, required = false }) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockActive, setCapsLockActive] = useState(false)

  const isPassword = type === 'password'
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

  const handleKeyDown = (e) => {
    if (isPassword && e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'))
    }
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: 10,
          fontWeight: 600,
          color: '#a1a1aa',
          fontFamily: "system-ui, -apple-system, sans-serif",
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: 4,
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 15,
              color: error ? '#ef4444' : '#71717a',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          type={actualType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!error}
          style={{
            width: '100%',
            background: '#09090b',
            border: `1px solid ${error ? '#ef4444' : focused ? '#3b82f6' : '#27272a'}`,
            borderRadius: 6,
            padding: `8px 10px 8px ${icon ? '32px' : '10px'}`,
            fontSize: 13,
            color: '#f4f4f5',
            fontFamily: "system-ui, -apple-system, sans-serif",
            outline: 'none',
            transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
            boxSizing: 'border-box',
            boxShadow: focused ? '0 0 0 2px rgba(59, 130, 246, 0.15)' : 'none',
          }}
        />

        {isPassword && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#71717a',
              zIndex: 3,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              {showPassword ? 'visibility' : 'visibility_off'}
            </span>
          </button>
        )}
      </div>

      {capsLockActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#eab308', fontSize: 10, marginTop: 4, fontFamily: 'system-ui, sans-serif' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>keyboard_capslock</span> CAPS LOCK ACTIVE
        </div>
      )}

      {error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4, marginBottom: 0, fontFamily: 'system-ui, sans-serif' }}>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Auth Page ─────────────────────────────────────────────────────────────
export default function Auth({ onNavigate, defaultTab = 'login' }) {
  const { login, register, googleLogin, logout, loading: authLoading, user } = useAuth()
  const { theme } = useTheme()
  const shouldReduceMotion = useReducedMotion()

  const [tab, setTab] = useState(defaultTab)
  const [rememberMe, setRememberMe] = useState(true)

  // Animation states
  const [shake, setShake] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form states
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError]       = useState('')
  const [loginLoading, setLoginLoading]   = useState(false)

  const [signupName, setSignupName]         = useState('')
  const [signupEmail, setSignupEmail]       = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm]   = useState('')
  const [signupErrors, setSignupErrors]     = useState({})
  const [signupLoading, setSignupLoading]   = useState(false)

  // Real-time Validations
  const loginEmailError = loginEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail) ? 'Invalid email format' : ''
  const signupEmailError = signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail) ? 'Invalid email format' : ''
  const signupMatchError = signupPassword && signupConfirm && signupPassword !== signupConfirm ? 'Passwords do not match' : ''

  // Google OAuth Login
  const handleGoogleLogin = async (response) => {
    setLoginError('')
    setSignupErrors({})
    try {
      await googleLogin(response.credential)
      setIsSuccess(true)
      setTimeout(() => onNavigate('home'), 1000)
    } catch (err) {
      if (tab === 'login') {
        setLoginError(err.message)
      } else {
        setSignupErrors({ general: err.message })
      }
      setShake(true)
      setTimeout(() => setShake(false), 400)
    }
  }

  useEffect(() => {
    /* global google */
    if (typeof google !== 'undefined' && !authLoading && !user) {
      try {
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        })
        const btnContainer = document.getElementById('google-signin-btn')
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: 'dark',
            size: 'large',
            width: btnContainer.clientWidth || 404,
            text: 'continue_with',
            shape: 'rectangular',
          })
        }
      } catch (err) {
        console.error('Error rendering Google Sign-In button:', err)
      }
    }
  }, [theme, googleLogin, authLoading, user])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loginEmailError) return
    setLoginError('')
    setLoginLoading(true)
    try {
      await login({ email: loginEmail, password: loginPassword })
      setIsSuccess(true)
      setTimeout(() => onNavigate('home'), 1000)
    } catch (err) {
      setLoginError(err.message)
      setShake(true)
      setTimeout(() => setShake(false), 400)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!signupName.trim()) errs.name = 'Name is required'
    if (!signupEmail.trim()) errs.email = 'Email is required'
    if (signupEmailError) errs.email = 'Invalid email format'
    if (signupPassword.length < 6) errs.password = 'At least 6 characters'
    if (signupPassword !== signupConfirm) errs.confirm = 'Passwords do not match'

    if (Object.keys(errs).length) {
      setSignupErrors(errs)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setSignupErrors({})
    setSignupLoading(true)
    try {
      await register({ name: signupName, email: signupEmail, password: signupPassword })
      setIsSuccess(true)
      setTimeout(() => onNavigate('home'), 1000)
    } catch (err) {
      setSignupErrors({ general: err.message })
      setShake(true)
      setTimeout(() => setShake(false), 400)
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="auth-layout" style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#09090b',
      display: 'flex',
      color: '#f4f4f5',
      fontFamily: "system-ui, -apple-system, sans-serif",
      overflow: 'hidden',
    }}>
      {/* Subtle Background shader */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, opacity: 0.1, pointerEvents: 'none', zIndex: 0 }}>
          <ShaderBg />
        </div>
      )}

      {/* ─── LEFT PANEL: Typographical + Diagram (57% Width Split) ─── */}
      <div style={{
        flex: 57,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        borderRight: '1px solid #1c1c1f',
        background: '#09090b',
        padding: '40px 60px',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }} className="auth-diagram-panel">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            alignSelf: 'flex-start',
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#71717a', transition: 'color 0.15s ease',
            fontFamily: "system-ui, sans-serif", fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f4f4f5'}
          onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
          Back to Arena
        </button>

        {/* Typographical Hero + Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 16 }}>
          <div>
            <h1 style={{
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#f4f4f5',
              margin: '0 0 10px',
              lineHeight: 1.2,
            }}>
              Evaluate models with peerless precision.
            </h1>
            <p style={{
              fontSize: 13,
              color: '#a1a1aa',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 440,
            }}>
              Run transparent side-by-side completions across top providers. Leverage custom evaluation models to automatically judge and audit outputs.
            </p>
          </div>

          <ComparisonFlowDiagram />
        </div>
      </div>

      {/* ─── RIGHT PANEL: Centered Form Card Container (43% Width Split) ─── */}
      <div style={{
        flex: 43,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        position: 'relative',
        zIndex: 1,
        background: '#09090b',
        boxSizing: 'border-box',
      }} className="auth-right-form auth-form-panel">

        <motion.div
          animate={shake ? { x: [-6, 6, -4, 4, -2, 2, 0] } : {}}
          transition={{ duration: 0.3 }}
          style={{ width: '100%', maxWidth: 468 }}
        >
          {/* SKELETON LOAD STATE */}
          {authLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 100, height: 20, background: '#27272a', borderRadius: 4, marginBottom: 16 }} className="skeleton-pulse" />
              <div style={{ width: '100%', background: '#0e0e11', borderRadius: 10, border: '1px solid #27272a', padding: '24px 28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ height: 18, width: '50%', background: '#27272a', borderRadius: 4, alignSelf: 'center', marginBottom: 4 }} className="skeleton-pulse" />
                  <div style={{ height: 12, width: '70%', background: '#27272a', borderRadius: 4, alignSelf: 'center', marginBottom: 8 }} className="skeleton-pulse" />
                  <div style={{ height: 34, background: '#1c1c1f', borderRadius: 6 }} className="skeleton-pulse" />
                  <div style={{ height: 34, background: '#1c1c1f', borderRadius: 6 }} className="skeleton-pulse" />
                  <div style={{ height: 34, background: '#1c1c1f', borderRadius: 6 }} className="skeleton-pulse" />
                </div>
              </div>
            </div>
          ) : user ? (
            /* PRE-AUTHENTICATED STATE */
            <div style={{ background: '#0e0e11', borderRadius: 10, border: '1px solid #27272a', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ marginBottom: 12 }}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid #27272a' }}
                  />
                ) : (
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f4f4f5', fontSize: 18, fontWeight: 600,
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px', color: '#f4f4f5' }}>{user.name}</h2>
              <p style={{ fontSize: 12, color: '#71717a', margin: '0 0 16px' }}>{user.email}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <button
                  onClick={() => onNavigate('home')}
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: '#ffffff',
                    border: 'none', borderRadius: 6,
                    fontSize: 13, fontWeight: 500, color: '#09090b',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Continue to Arena
                </button>

                <button
                  onClick={logout}
                  style={{
                    width: '100%', padding: '9px 12px',
                    background: 'transparent',
                    border: '1px solid #27272a', borderRadius: 6,
                    fontSize: 13, fontWeight: 500, color: '#a1a1aa',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease, color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#ef4444'
                    e.currentTarget.style.color = '#ef4444'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#27272a'
                    e.currentTarget.style.color = '#a1a1aa'
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* SUCCESS OVERLAY STATE */
            <div style={{ background: '#0e0e11', borderRadius: 10, border: '1px solid #27272a', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1.5px solid #22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#22c55e', fontWeight: 'bold' }}>
                  check
                </span>
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', color: '#f4f4f5' }}>Authenticated</h2>
              <p style={{ fontSize: 12, color: '#71717a', margin: 0 }}>Opening your workspace...</p>
            </div>
          ) : (
            /* ACTIVE FORM CARD */
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Card container */}
              <div
                style={{
                  width: '100%',
                  background: '#0e0e11',
                  borderRadius: 10,
                  border: '1px solid #27272a',
                  padding: '24px 28px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
              >
                {/* Form header details */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <h2 style={{
                      fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em',
                      color: '#f4f4f5', margin: '0 0 2px',
                    }}>
                      {tab === 'login' ? 'Sign In' : 'Create Account'}
                    </h2>
                  </div>

                  {/* Text-based toggle swapper instead of separate header blocks */}
                  <button
                    onClick={() => {
                      setTab(tab === 'login' ? 'signup' : 'login')
                      setLoginError('')
                      setSignupErrors({})
                    }}
                    style={{
                      background: 'none', border: 'none', color: '#3b82f6',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      padding: 0, outline: 'none',
                    }}
                  >
                    {tab === 'login' ? 'Create an account?' : 'Sign in instead?'}
                  </button>
                </div>

                <div style={{ position: 'relative', minHeight: 270, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <AnimatePresence mode="wait">
                    {tab === 'login' ? (
                      /* SIGN IN FORM */
                      <motion.form
                        key="login-form"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.12 }}
                        onSubmit={handleLogin}
                        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                      >
                        <AuthInput
                          id="login-email"
                          label="Email Address"
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          error={loginEmailError}
                        />

                        <AuthInput
                          id="login-password"
                          label="Password"
                          type="password"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                        />

                        {/* Options Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, fontSize: 12, fontFamily: 'system-ui, sans-serif' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#71717a', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={(e) => setRememberMe(e.target.checked)}
                              style={{
                                accentColor: '#3b82f6',
                                cursor: 'pointer',
                              }}
                            />
                            Remember me
                          </label>
                          <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); alert('Password reset is simulated.') }}
                            style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
                          >
                            Forgot Password?
                          </a>
                        </div>

                        {loginError && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 6, padding: '6px 10px',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ef4444' }}>error</span>
                            <span style={{ fontSize: 11, color: '#fca5a5' }}>
                              {loginError}
                            </span>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={loginLoading || !loginEmail || !loginPassword || !!loginEmailError}
                          style={{
                            width: '100%', padding: '9px 12px',
                            background: loginLoading || !loginEmail || !loginPassword || !!loginEmailError ? '#27272a' : '#ffffff',
                            color: loginLoading || !loginEmail || !loginPassword || !!loginEmailError ? '#71717a' : '#09090b',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 13, fontWeight: 600,
                            cursor: loginLoading || !loginEmail || !loginPassword || !!loginEmailError ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'opacity 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            if (!(loginLoading || !loginEmail || !loginPassword || !!loginEmailError)) {
                              e.currentTarget.style.opacity = '0.9'
                            }
                          }}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          {loginLoading ? (
                            <>
                              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 15 }}>progress_activity</span>
                              Signing In...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </button>
                      </motion.form>
                    ) : (
                      /* SIGN UP FORM */
                      <motion.form
                        key="signup-form"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.12 }}
                        onSubmit={handleSignup}
                        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                      >
                        <AuthInput
                          id="signup-name"
                          label="Full Name"
                          type="text"
                          value={signupName}
                          onChange={e => setSignupName(e.target.value)}
                          placeholder="Alex Smith"
                          required
                          error={signupErrors.name}
                        />

                        <AuthInput
                          id="signup-email"
                          label="Email Address"
                          type="email"
                          value={signupEmail}
                          onChange={e => setSignupEmail(e.target.value)}
                          placeholder="name@domain.com"
                          required
                          error={signupErrors.email || signupEmailError}
                        />

                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <AuthInput
                              id="signup-password"
                              label="Password"
                              type="password"
                              value={signupPassword}
                              onChange={e => setSignupPassword(e.target.value)}
                              placeholder="Min. 6 chars"
                              required
                              error={signupErrors.password}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <AuthInput
                              id="signup-confirm"
                              label="Confirm Password"
                              type="password"
                              value={signupConfirm}
                              onChange={e => setSignupConfirm(e.target.value)}
                              placeholder="••••••••"
                              required
                              error={signupErrors.confirm || signupMatchError}
                            />
                          </div>
                        </div>

                        {/* Real-time Strength Meter */}
                        <PasswordStrengthMeter password={signupPassword} />

                        {signupErrors.general && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 6, padding: '6px 10px',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15, color: '#ef4444' }}>error</span>
                            <span style={{ fontSize: 11, color: '#fca5a5' }}>
                              {signupErrors.general}
                            </span>
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirm || !!signupEmailError || !!signupMatchError}
                          style={{
                            width: '100%', padding: '9px 12px',
                            background: signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirm || !!signupEmailError || !!signupMatchError ? '#27272a' : '#ffffff',
                            color: signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirm || !!signupEmailError || !!signupMatchError ? '#71717a' : '#09090b',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 13, fontWeight: 600,
                            cursor: signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirm || !!signupEmailError || !!signupMatchError ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            transition: 'opacity 0.15s ease',
                          }}
                          onMouseEnter={e => {
                            if (!(signupLoading || !signupName || !signupEmail || !signupPassword || !signupConfirm || !!signupEmailError || !!signupMatchError)) {
                              e.currentTarget.style.opacity = '0.9'
                            }
                          }}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          {signupLoading ? (
                            <>
                              <span className="material-symbols-outlined animate-spin" style={{ fontSize: 15 }}>progress_activity</span>
                              Registering...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shared Divider & Google button mounted permanently */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
                    <div style={{ flex: 1, height: 1, background: '#27272a' }} />
                    <span style={{ fontSize: 11, color: '#71717a' }}>or continue with</span>
                    <div style={{ flex: 1, height: 1, background: '#27272a' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div id="google-signin-btn" style={{ width: '100%', minHeight: 40 }}></div>
                  </div>
                </div>
              </div>

              {/* Footer terms */}
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 10, color: '#71717a', lineHeight: '14px' }}>
                By continuing, you agree to our{' '}
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a> and{' '}
                <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>.
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {styleTag}
    </div>
  )
}

// ─── Inline Styles & Keyframe Overrides ──────────────────────────────────────
const styleTag = (
  <style>{`
    .animate-spin {
      animation: spin-anim-rotate 1.2s linear infinite;
    }
    @keyframes spin-anim-rotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes skeleton-pulse-anim {
      0% { opacity: 0.3; }
      50% { opacity: 0.6; }
      100% { opacity: 0.3; }
    }
    .skeleton-pulse {
      animation: skeleton-pulse-anim 1.5s ease-in-out infinite;
    }
    @media (max-width: 960px) {
      .auth-left-visuals {
        display: none !important;
      }
      .auth-right-form {
        flex: 1 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
    }
  `}</style>
)
