import './app/App.css'
import { useState, useCallback, useEffect } from 'react'
import Lenis from 'lenis'
import Home from './pages/Home'
import Comparing from './pages/Comparing'
import Verdict from './pages/Verdict'
import Documentation from './pages/Documentation'
import Auth from './pages/Auth'
import History from './pages/History'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function AppInner() {
  const [view, setView]       = useState('home')
  const [problem, setProblem] = useState('')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')


  // ── Lenis smooth scroll ──────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,          // lower = slower / smoother glide
      smoothWheel: true,
      wheelMultiplier: 0.8,
    })
    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  const [model1, setModel1]         = useState('mistral-medium-latest')
  const [model2, setModel2]         = useState('command-a-03-2025')
  const [judgeModel, setJudgeModel] = useState('gemini-2.5-flash')

  const handleBattle = useCallback((p) => {
    setProblem(p)
    setResult(null)
    setError('')
    setView('comparing')
  }, [])

  const handleDone = useCallback((apiResult) => {
    if (apiResult?.error) {
      setError(apiResult.error)
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
