import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import './App.css'
import { C } from '../constants/colors'

const API_URL = 'http://localhost:3000'

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.5 } },
}
const stagger = (delay = 0.1) => ({
  hidden: {},
  show:   { transition: { staggerChildren: delay } },
})

// ─── Shorthand for Material Symbols ──────────────────────────────────────────
const Icon = ({ n, style: s = {}, fill = false, size = 24, className = '' }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{
      fontSize: size,
      fontVariationSettings: fill ? "'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24" : "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
      ...s,
    }}
  >{n}</span>
)

// ─── WebGL Shader Background ──────────────────────────────────────────────────
function ShaderBg() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const sync = () => {
      const w = canvas.clientWidth || 1280, h = canvas.clientHeight || 720
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
    }
    const ro = new ResizeObserver(sync); ro.observe(canvas); sync()
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return
    const vs = `attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0,1);}`
    const fs = `precision highp float;varying vec2 v;uniform float t;
float n(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 uv=v;float f=0.;vec2 p=uv*3.;float a=.5;
for(int i=0;i<4;i++){f+=n(p+t*.05)*a;p*=2.;a*=.5;}
vec3 c=mix(vec3(.035,.035,.035),vec3(.05,.05,.06),f);
float vg=1.-smoothstep(.5,1.5,length(uv-.5));gl_FragColor=vec4(c*vg,1);}`
    const mk = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, vs))
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(prog); gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0)
    const uT = gl.getUniformLocation(prog, 't')
    let raf
    const render = ts => {
      sync(); gl.viewport(0,0,canvas.width,canvas.height)
      gl.uniform1f(uT, ts * 0.001); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }
    render(0)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <canvas ref={ref} className="shader-canvas" />
}

// ─── How It Works Step Card ───────────────────────────────────────────────────
function HowStep({ number, icon, title, desc, isLast, delay }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
      {/* Connector line */}
      {!isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.7, delay: delay + 0.4, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 36, left: '60%', right: '-40%',
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
            transformOrigin: 'left',
            zIndex: 0,
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.9 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.9 }}
        transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', position: 'relative', zIndex: 1 }}
      >
        {/* Number badge */}
        <motion.div
          whileHover={{ scale: 1.1, boxShadow: '0 0 24px rgba(255,255,255,0.18)' }}
          style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20, position: 'relative',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Icon n={icon} size={28} style={{ color: 'rgba(255,255,255,0.9)' }} />
          {/* Step number bubble */}
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
          fontSize: 14, fontWeight: 400, letterSpacing: '0.05em',
          color: C.primary, marginBottom: 10, textTransform: 'uppercase',
        }}>{title}</h3>

        <p style={{
          fontSize: 13, color: C.onSurfVar, lineHeight: '22px',
          maxWidth: 180,
        }}>{desc}</p>
      </motion.div>
    </div>
  )
}

// ─── Home Page ──────────────────────────────────────────────────────────────
function HomePage({ onBattle, theme, toggleTheme }) {
  const [prompt, setPrompt] = useState('')
  const isLight = theme === 'light'

  const quickPrompts = [
    'Write a binary search in Python',
    'Design a REST API for a bookstore',
    'Explain recursion with an example',
    'Implement debounce in JavaScript',
  ]

  const howItWorksSteps = [
    {
      number: '01', icon: 'edit_note', title: 'Write a Prompt',
      desc: 'Enter any question, coding task, or complex problem into the input field.',
    },
    {
      number: '02', icon: 'smart_toy', title: 'Models Battle',
      desc: 'Mistral and Cohere respond simultaneously — no cherry-picking, no delays.',
    },
    {
      number: '03', icon: 'balance', title: 'Judge Evaluates',
      desc: 'Gemini acts as an impartial judge, scoring accuracy, depth, and coherence.',
    },
    {
      number: '04', icon: 'emoji_events', title: 'See the Winner',
      desc: 'Get a clear verdict with scores, analysis, and a side-by-side comparison.',
    },
  ]

  const howRef = useRef(null)
  const howInView = useInView(howRef, { once: true, margin: '-80px' })

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg, overflowX: 'hidden' }}>
      {/* WebGL shader — dark mode only */}
      {!isLight && (
        <div style={{ position: 'fixed', inset: 0, opacity: 0.4, pointerEvents: 'none', zIndex: 0 }}>
          <ShaderBg />
        </div>
      )}

      {/* ── Top Navigation Bar ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-navbar"
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 24px',
          maxWidth: 1280, margin: '0 auto',
          background: isLight ? 'rgba(255,255,255,0.85)' : `${C.surface}cc`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${isLight ? '#e5e7eb' : C.outlineV + '1a'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="logo-brand" style={{ fontSize: 20 }}>AI ARENA</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
          {['Documentation','Benchmarks','GitHub'].map((l, i) => (
            <motion.a
              key={l} href="#"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              style={{
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 12, fontWeight: 500, letterSpacing: '0.02em',
                color: C.onSurfVar, textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.target.style.color = C.primary}
              onMouseLeave={e => e.target.style.color = C.onSurfVar}
            >{l}</motion.a>
          ))}
        </nav>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <button onClick={toggleTheme} title="Toggle theme" style={{
            padding: 8, background: 'none', border: 'none', cursor: 'pointer',
            color: C.onSurfVar, display: 'flex',
          }}>
            <Icon n={isLight ? 'dark_mode' : 'light_mode'} />
          </button>
          <div style={{ width: 1, height: 24, background: isLight ? '#e5e7eb' : `${C.outlineV}33`, margin: '0 8px' }} />
          <motion.button
            whileHover={{ scale: 1.04, opacity: 0.9 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: C.primary, color: C.onPrimary,
              padding: '8px 16px', border: 'none', borderRadius: 6,
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >Profile</motion.button>
        </motion.div>
      </motion.header>

      {/* ── Main ── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 48px' }}>

        {/* Hero */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: 80, paddingBottom: 64 }}>

          {/* Status pill */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="anim-pulse"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 9999,
              border: `1px solid ${C.primary}22`,
              background: isLight ? `${C.primary}0d` : C.surfLow,
              marginBottom: 24,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, display: 'block' }} />
            <span style={{
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: C.onSurfVar, opacity: 0.8,
            }}>System Status: Optimal</span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700,
              letterSpacing: '-0.04em', lineHeight: 1.1,
              color: isLight ? '#000000' : C.onSurf, maxWidth: 720, marginBottom: 20, marginTop: 0,
            }}
          >
            Compare AI Models.{' '}
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              style={{ fontStyle: 'italic', display: 'inline-block' }}
            >
              <span style={{ color: isLight ? '#000000' : 'inherit' }}>Find the </span>
              <span style={{ color: isLight ? C.primary : 'inherit' }}>Best.</span>
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.25 }}
            style={{ fontSize: 15, color: C.onSurfVar, maxWidth: 540, marginBottom: 48, lineHeight: '26px' }}
          >
            The high-performance evaluator for technical decision-makers. Run side-by-side comparisons
            of Mistral and Cohere with granular metrics and a Gemini judge.
          </motion.p>

          {/* Input card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.32 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: 720, borderRadius: 12 }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 24px',
              borderBottom: `1px solid ${isLight ? '#e5e7eb' : C.outlineV + '1a'}`,
            }}>
              <span style={{
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: C.onSurfVar, opacity: 0.6,
              }}>Main Input Field</span>
              <div style={{ display: 'flex', gap: 8, color: C.onSurfVar }}>
                <Icon n="terminal" size={18} />
                <Icon n="auto_awesome" size={18} />
              </div>
            </div>

            <textarea
              id="mainPrompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask anything..."
              rows={5}
              style={{
                width: '100%', background: 'transparent',
                border: 'none', outline: 'none', resize: 'none',
                padding: '24px',
                fontFamily: "'Helvetica', Arial, sans-serif",
                fontSize: 15, lineHeight: '24px', color: C.onSurf,
              }}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey && prompt.trim()) { e.preventDefault(); onBattle(prompt.trim()) } }}
            />

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              borderTop: `1px solid ${isLight ? '#e5e7eb' : C.outlineV + '1a'}`,
              flexWrap: 'wrap', gap: 8,
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['attach_file','Context'],['settings_input_component','Parameters']].map(([ic, lb]) => (
                  <motion.button key={lb}
                    whileHover={{ color: C.primary }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: "'Geist Pixel', monospace", fontSize: 12, color: C.onSurfVar, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = C.primary}
                    onMouseLeave={e => e.currentTarget.style.color = C.onSurfVar}
                  >
                    <Icon n={ic} size={18} />{lb}
                  </motion.button>
                ))}
              </div>
              <motion.button
                id="compare-btn"
                disabled={!prompt.trim()}
                onClick={() => prompt.trim() && onBattle(prompt.trim())}
                whileHover={prompt.trim() ? { scale: 1.03, boxShadow: '0 0 24px rgba(255,255,255,0.15)' } : {}}
                whileTap={prompt.trim() ? { scale: 0.97 } : {}}
                className="btn-glow"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: C.primary, color: C.onPrimary,
                  padding: '12px 24px', border: 'none', borderRadius: 8,
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 12, fontWeight: 600, cursor: prompt.trim() ? 'pointer' : 'default',
                  transition: 'opacity 0.3s',
                  opacity: prompt.trim() ? 1 : 0.4,
                }}
              >
                <Icon n="auto_awesome" fill size={20} />
                Compare Responses
              </motion.button>
            </div>
          </motion.div>

          {/* Quick prompts */}
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="show"
            transition={{ delayChildren: 0.5 }}
            style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 }}
          >
            {quickPrompts.map(p => (
              <motion.button
                key={p}
                variants={fadeUp}
                onClick={() => setPrompt(p)}
                whileHover={{ background: C.surfHigh, color: C.onSurf, y: -2 }}
                style={{
                  padding: '6px 14px',
                  background: C.surfLow,
                  border: `1px solid ${isLight ? '#e5e7eb' : C.outlineV + '33'}`,
                  borderRadius: 4,
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 12, color: C.onSurfVar, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{p}</motion.button>
            ))}
          </motion.div>
        </section>

        {/* ── How It Works ── */}
        <section
          ref={howRef}
          style={{
            paddingTop: 64, paddingBottom: 100,
            borderTop: `1px solid ${isLight ? '#e5e7eb' : C.outlineV + '18'}`,
          }}
        >
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: 56 }}
          >
            <span style={{
              fontFamily: "'Geist Pixel', monospace",
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: C.onSurfVar, opacity: 0.55,
            }}>Process</span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={howInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: "'Michroma', 'Helvetica', Arial, sans-serif",
                fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 400,
                letterSpacing: '0.04em', color: C.onSurf,
                marginTop: 12, marginBottom: 12,
              }}
            >
              How It Works
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={howInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.18 }}
              style={{ fontSize: 14, color: C.onSurfVar, maxWidth: 420, margin: '0 auto', lineHeight: '22px' }}
            >
              Four transparent steps. Zero black boxes. Full visibility into how every verdict is reached.
            </motion.p>
          </motion.div>

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
                delay={0.1 + i * 0.15}
              />
            ))}
          </div>

          {/* CTA below steps */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={howInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.75 }}
            style={{ textAlign: 'center', marginTop: 64 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(255,255,255,0.12)' }}
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
              onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.outlineV}
            >
              <Icon n="rocket_launch" size={18} style={{ color: C.primary }} />
              Start Your First Battle
              <Icon n="arrow_forward" size={16} style={{ opacity: 0.6 }} />
            </motion.button>
          </motion.div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <footer style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        justifyContent: 'space-around', alignItems: 'center',
        padding: '8px 16px 12px',
        background: isLight ? 'rgba(255,255,255,0.9)' : `${C.surfHigh2}e6`,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${isLight ? '#e5e7eb' : C.outlineV + '33'}`,
        borderRadius: '16px 16px 0 0', zIndex: 50, display: 'none',
      }} id="mobile-nav">
        {[['add_circle','New'],['history','History'],['star','Favs'],['menu','Menu']].map(([ic, lb], i) => (
          <button key={lb} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: i === 0 ? C.primary : 'transparent',
            color: i === 0 ? C.onPrimary : C.onSurfVar,
            fontFamily: "'Geist Pixel', monospace", fontSize: 11,
          }}>
            <Icon n={ic} size={22} style={{ color: 'inherit' }} />
            {lb}
          </button>
        ))}
      </footer>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [started, setStarted] = useState(false)
  const [problem, setProblem] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  function handleBattle(p) {
    setProblem(p)
    setStarted(true)
    alert(`Battle started! Problem: "${p}"\n\nNext: Comparing + Verdict screens coming next.`)
    setStarted(false)
  }

  return <HomePage onBattle={handleBattle} theme={theme} toggleTheme={toggleTheme} />
}
