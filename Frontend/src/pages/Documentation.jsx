import { motion } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Icon from '../components/Icon'
import { C } from '../constants/colors'
import { useTheme } from '../context/ThemeContext'

// ─── Stacked Card Component ──────────────────────────────────────────────────
function StackedCard({ step, title, desc, index, total, children }) {
  const topOffset = 100 + index * 40

  return (
    <div
      style={{
        position: 'sticky',
        top: topOffset,
        zIndex: index + 1,
        marginBottom: index === total - 1 ? '20vh' : '30vh', // scroll distance before next card hits
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="doc-card"
        style={{
          borderRadius: 28,
          background: `${C.surface}f2`,
          backdropFilter: 'blur(30px)',
          border: `1px solid ${C.outlineV}28`,
          padding: '48px 40px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: index % 2 === 1 ? 'row-reverse' : 'row',
          alignItems: 'center',
          gap: 48,
          flexWrap: 'wrap',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          {/* Text Description Column */}
          <div style={{ flex: '1 2 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 10,
                fontWeight: 700,
                color: C.primary,
                background: `${C.primary}12`,
                border: `1px solid ${C.primary}2a`,
                padding: '3px 10px',
                borderRadius: 4,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {step}
              </span>
            </div>

            <h2 style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              margin: '0 0 16px',
              color: C.onSurf,
            }}>
              {title}
            </h2>

            <p style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 14,
              color: C.onSurfVar,
              lineHeight: '23px',
              margin: 0,
              opacity: 0.9,
            }}>
              {desc}
            </p>

            {/* Custom tags/extras for System Architecture card */}
            {step === 'Step 01' && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: `${C.primary}0a`, border: `1px solid ${C.outlineV}20`, borderRadius: 9999 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, boxShadow: `0 0 8px ${C.primary}` }} className="animate-pulse" />
                  <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, textTransform: 'uppercase', color: C.onSurfVar }}>Active Instance</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: `${C.primary}0a`, border: `1px solid ${C.outlineV}20`, borderRadius: 9999 }}>
                  <Icon n="speed" size={14} style={{ color: C.primary }} />
                  <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, textTransform: 'uppercase', color: C.onSurfVar }}>45ms Latency</span>
                </div>
              </div>
            )}
          </div>

          {/* Children (Illustration column) */}
          <div style={{
            flex: '1 1 280px',
            display: 'flex',
            justifyContent: 'center',
          }}>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Documentation Page ───────────────────────────────────────────────────────
export default function Documentation({ onNavigate }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: C.bg, color: C.onSurf, position: 'relative' }}>

      {/* Background Shader */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.35, pointerEvents: 'none' }}>
          <ShaderBg />
        </div>
      )}

      <div style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <motion.header
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            background: C.bg,
            borderBottom: 'none',
            boxShadow: 'none',
          }}
        >
          <motion.div
            whileHover={{ opacity: 0.8 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            <span className="logo-brand" style={{ fontSize: 18 }}>
              AI ARENA
            </span>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

            <motion.button
              onClick={() => onNavigate('home')}
              whileHover={{ scale: 1.04, boxShadow: `0 0 16px ${C.primary}22` }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: C.primary,
                color: C.onPrimary,
                padding: '8px 16px',
                border: 'none',
                borderRadius: 6,
                fontFamily: "'Geist Pixel', monospace",
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Icon n="keyboard_backspace" size={16} style={{ color: C.onPrimary }} />
              Back to Arena
            </motion.button>
          </div>
        </motion.header>

        {/* Content Wrapper */}
        <main style={{ maxWidth: 840, width: '100%', margin: '0 auto', padding: '64px 24px 80px', display: 'flex', flexDirection: 'column' }}>

          {/* Breadcrumbs & Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: 'left', marginBottom: '64px' }}
          >
            {/* Breadcrumb nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.onSurfVar, cursor: 'pointer' }} onClick={() => onNavigate('home')}>Docs</span>
              <Icon n="chevron_right" size={14} style={{ color: C.outline }} />
              <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 11, color: C.primary, fontWeight: 700 }}>Getting Started</span>
            </nav>

            <h1 style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 'clamp(36px, 6vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              margin: '0 0 16px',
              color: C.onSurf,
              lineHeight: 1.1,
            }}>
              Documentation
            </h1>

            <p style={{
              fontFamily: "'Helvetica', Arial, sans-serif",
              fontSize: 16,
              color: C.onSurfVar,
              maxWidth: 680,
              margin: 0,
              lineHeight: '26px',
            }}>
              AI Judge is the industry-standard framework for evaluating Large Language Model outputs with surgical precision. Learn how to implement objective benchmarking in your development workflow.
            </p>
          </motion.div>

          {/* Sibling-Based Cards Stack Container */}
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* Card 1: System Architecture */}
            <StackedCard
              step="Step 01"
              title="System Architecture"
              desc="Our judge operates on a triad system: deterministic validation, linguistic analysis, and cross-model verification. Each query passes through a high-throughput pipeline that generates a multi-dimensional score."
              index={0}
              total={4}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <div style={{ position: 'absolute', inset: 0, background: `${C.primary}05`, borderRadius: 24, filter: 'blur(40px)' }} />
                <div style={{
                  position: 'relative',
                  aspectRatio: '16/10',
                  background: C.surfLow,
                  border: `1px solid ${C.outlineV}1c`,
                  borderRadius: 24,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                  width: '100%',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ width: 100, height: 6, background: `${C.primary}33`, borderRadius: 4 }} />
                      <div style={{ width: 60, height: 6, background: `${C.primary}1a`, borderRadius: 4 }} />
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.onPrimary }}>
                      <Icon n="architecture" size={20} style={{ color: C.onPrimary }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 80 }}>
                    <div style={{ flex: 1, height: '60%', background: `${C.primary}33`, borderRadius: '4px 4px 0 0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: C.primary }} />
                    </div>
                    <div style={{ flex: 1, height: '90%', background: `${C.primary}22`, borderRadius: '4px 4px 0 0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', background: C.primary }} />
                    </div>
                    <div style={{ flex: 1, height: '50%', background: `${C.primary}1a`, borderRadius: '4px 4px 0 0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', background: C.primary }} />
                    </div>
                  </div>
                </div>
              </div>
            </StackedCard>

            {/* Card 2: Inputting Prompts */}
            <StackedCard
              step="Step 02"
              title="Inputting Prompts"
              desc="Begin by defining your test dataset. AI Judge supports JSONL, CSV, and direct API streaming. Structure your prompts to include specific success criteria and reference answers."
              index={1}
              total={4}
            >
              <div style={{
                background: '#090909',
                color: '#c4c7c8',
                borderRadius: 16,
                padding: '24px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                border: `1px solid ${C.outlineV}1c`,
                width: '100%',
                maxWidth: 320,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                boxSizing: 'border-box',
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {`{\n  "prompt": "Explain quantum tunneling",\n  "reference": "Quantum tunneling occurs...",\n  "criteria": [\n    "accuracy",\n    "brevity",\n    "hallucination_check"\n  ]\n}`}
                </pre>
              </div>
            </StackedCard>

            {/* Card 3: Model Selection */}
            <StackedCard
              step="Step 03"
              title="Model Selection"
              desc="Choose which models to benchmark. AI Judge offers pre-configured integrations with OpenAI, Anthropic, and local Llama-3 instances."
              index={2}
              total={4}
            >
              <div style={{
                background: C.surfLow,
                borderRadius: 20,
                padding: '24px',
                border: `1px solid ${C.outlineV}1c`,
                width: '100%',
                maxWidth: 320,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                boxSizing: 'border-box',
              }}>
                {/* Active check 1 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: C.surface, border: `1px solid ${C.primary}`, borderRadius: 12, boxShadow: `0 0 10px ${C.primary}11` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${C.primary}22`, color: C.primary, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Pixel', monospace" }}>GPT</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.onSurf }}>GPT-4o</span>
                  </div>
                  <Icon n="check_circle" size={18} style={{ color: C.primary }} />
                </div>

                {/* Disabled check 2 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: `${C.surface}66`, border: `1px solid ${C.outlineV}11`, borderRadius: 12, opacity: 0.4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${C.onSurfVar}11`, color: C.onSurfVar, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Pixel', monospace" }}>CLD</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.onSurf }}>Claude 3.5</span>
                  </div>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${C.outline}` }} />
                </div>

                {/* Active check 3 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: C.surface, border: `1px solid ${C.primary}`, borderRadius: 12, boxShadow: `0 0 10px ${C.primary}11` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${C.primary}22`, color: C.primary, fontSize: 10, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Geist Pixel', monospace" }}>LLM</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.onSurf }}>Llama-3-70b</span>
                  </div>
                  <Icon n="check_circle" size={18} style={{ color: C.primary }} />
                </div>
              </div>
            </StackedCard>

            {/* Card 4: The Resulting Scorecard */}
            <StackedCard
              step="Step 04"
              title="The Resulting Scorecard"
              desc="The final output provides a comprehensive scorecard. We go beyond simple pass/fail, offering 'Confidence Intervals' and 'Reasoning Tracebacks' for every evaluation."
              index={3}
              total={4}
            >
              <div style={{
                background: C.surfLow,
                borderRadius: 20,
                padding: '24px',
                border: `1px solid ${C.outlineV}1c`,
                width: '100%',
                maxWidth: 320,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                boxSizing: 'border-box',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, color: C.onSurfVar }}>LIVE RESULTS</span>
                  <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, color: '#4ade80', fontWeight: 'bold' }}>COMPLETE</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'Geist Pixel', monospace" }}>
                      <span style={{ color: C.onSurfVar }}>ACCURACY SCORE</span>
                      <span style={{ color: C.primary, fontWeight: 'bold' }}>0.982</span>
                    </div>
                    <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '88%', background: C.primary, borderRadius: 3 }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'Geist Pixel', monospace" }}>
                      <span style={{ color: C.onSurfVar }}>TOXICITY CHECK</span>
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>PASS</span>
                    </div>
                    <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '100%', background: '#22c55e', borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              </div>
            </StackedCard>

          </div>

        </main>
      </div>
    </div>
  )
}
