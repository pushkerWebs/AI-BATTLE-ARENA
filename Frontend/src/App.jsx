import './app/App.css'
import { useState, useCallback, useEffect, lazy, Suspense } from 'react'
import Lenis from 'lenis'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Loader from './components/Loader'

import Home from './pages/Home'
import Comparing from './pages/Comparing'
import Verdict from './pages/Verdict'
import Documentation from './pages/Documentation'
import Auth from './pages/Auth'
import History from './pages/History'

function AppInner() {
  const [view, setView] = useState('home')
  const [appLoading, setAppLoading] = useState(() => {
    const hasVisited = sessionStorage.getItem('ai_arena_visited')
    return !hasVisited
  })
  const [problem, setProblem] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')


  // ── Lenis smooth scroll ──────────────────────────────────
  useEffect(() => {
    // Ensure we always start at the top on mount (backup for scroll restoration)
    window.scrollTo(0, 0)

    const lenis = new Lenis({
      lerp: 0.08,          // lower = slower / smoother glide
      smoothWheel: true,
      wheelMultiplier: 0.8,
    })

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  const [model1, setModel1] = useState('mistral-medium-latest')
  const [model2, setModel2] = useState('command-a-03-2025')
  const [judgeModel, setJudgeModel] = useState('gemini-2.5-flash')

  const handleBattle = useCallback((p) => {
    setProblem(p)
    setResult(null)
    setError('')
    setView('comparing')
  }, [])

  const handleDone = useCallback((apiResult) => {
    if (apiResult?.error) {
      const details = apiResult.details || ''
      const lowerDetails = details.toLowerCase()
      const lowerError = apiResult.error.toLowerCase()

      let finalMessage = apiResult.error

      // Detect API quota, rate limits, or exhausted resources
      if (
        lowerDetails.includes('quota') ||
        lowerDetails.includes('limit') ||
        lowerDetails.includes('exhausted') ||
        lowerDetails.includes('429') ||
        lowerDetails.includes('too many requests') ||
        lowerError.includes('quota') ||
        lowerError.includes('limit') ||
        lowerError.includes('exhausted') ||
        lowerError.includes('429') ||
        lowerError.includes('too many requests')
      ) {
        finalMessage = 'Model Limit Exceeded: One of the selected AI models has exceeded its request limits or free quota. Please select a different model and try again.'
      } else if (apiResult.details) {
        finalMessage = `${apiResult.error}: ${apiResult.details}`
      }

      setError(finalMessage)
      setView('home')
    } else {
      setResult(apiResult)
      setView('verdict')
    }
  }, [])

  const handleHome = useCallback(() => {
    setView('home')
    setProblem('')
    setResult(null)
    setError('')
  }, [])

  return (
    <>
      {appLoading ? (
        <Loader onComplete={() => {
          sessionStorage.setItem('ai_arena_visited', 'true')
          setAppLoading(false)
        }} />
      ) : (
        <div style={{ width: '100%', minHeight: '100vh' }}>
          <Suspense fallback={
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: '100vh', background: '#070708', color: '#e5e2e1',
              fontFamily: "'Geist Pixel', monospace", fontSize: 13,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 24, color: '#a855f7' }}>progress_activity</span>
                <span style={{ letterSpacing: '0.1em' }}>ARENA LOADING...</span>
              </div>
            </div>
          }>
            {view === 'home' && (
              <Home
                onBattle={handleBattle}
                onNavigate={setView}
                error={error}
                model1={model1}
                setModel1={setModel1}
                model2={model2}
                setModel2={setModel2}
                judgeModel={judgeModel}
                setJudgeModel={setJudgeModel}
              />
            )}

            {view === 'comparing' && (
              <Comparing
                problem={problem}
                model1={model1}
                model2={model2}
                judgeModel={judgeModel}
                onDone={handleDone}
                onNavigate={setView}
                onSelectBattle={(battle) => {
                  setResult(battle)
                  setView('verdict')
                }}
              />
            )}

            {view === 'verdict' && result && (
              <Verdict
                result={result}
                onNew={handleHome}
                onNavigate={setView}
                onSelectBattle={(battle) => {
                  setResult(battle)
                  setView('verdict')
                }}
              />
            )}

            {view === 'documentation' && (
              <Documentation
                onNavigate={setView}
              />
            )}

            {view === 'auth' && (
              <Auth
                onNavigate={setView}
              />
            )}

            {view === 'history' && (
              <History
                onNavigate={setView}
                onSelectBattle={(battle) => {
                  setResult(battle)
                  setView('verdict')
                }}
              />
            )}
          </Suspense>
        </div>
      )}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  )
}
