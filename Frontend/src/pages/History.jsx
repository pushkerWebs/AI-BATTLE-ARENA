import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShaderBg from '../components/ShaderBg'
import Icon from '../components/Icon'
import { C } from '../constants/colors'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { API_BASE } from '../config'

// ─── Formatting helpers ──────────────────────────────────────────────────────
function formatDate(dStr) {
  try {
    const d = new Date(dStr)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return dStr
  }
}

function getModelLabel(modelId) {
  const mapping = {
    'mistral-medium-latest': 'Mistral Medium',
    'mistral-large-latest': 'Mistral Large',
    'open-mixtral-8x22b': 'Mixtral 8x22B',
    'command-a-03-2025': 'Command R+',
    'command-r-08-2024': 'Command R',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gemini-1.5-flash': 'Gemini 1.5 Flash',
  }
  return mapping[modelId] || modelId
}

export default function History({ onNavigate, onSelectBattle }) {
  const { token, logout } = useAuth()
  const { theme } = useTheme()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  // ── Fetch history ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setError('Please sign in to view your history.')
      setLoading(false)
      return
    }

    fetch(`${API_BASE}/auth/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          logout()
          throw new Error('Session expired. Please sign in again.')
        }
        if (!res.ok) throw new Error('Failed to fetch battle logs.')
        return res.json()
      })
      .then((data) => {
        setHistory(data.history || [])
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [token, logout])

  // Filter history
  const filtered = history.filter((item) =>
    item.problem.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* Background shader */}
      {theme === 'dark' && (
        <div style={{ position: 'fixed', inset: 0, opacity: 0.35, pointerEvents: 'none', zIndex: 0 }}>
          <ShaderBg />
        </div>
      )}

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px',
          background: C.bg,
          borderBottom: 'none',
          boxShadow: 'none',
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
          BATTLE HISTORY
        </span>

        <div style={{ width: 80 }} /> {/* spacer */}
      </motion.header>

      {/* Main Container */}
      <div style={{ flex: 1, position: 'relative', zIndex: 10, maxWidth: 840, width: '100%', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Search header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 14, color: C.onSurfVar, margin: 0 }}>
              {history.length} matches logged in this account
            </p>
          </div>

          {history.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: C.surfLow, border: `1px solid ${C.outlineV}33`,
              borderRadius: 12, padding: '10px 16px', width: '100%', maxWidth: 300,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: C.onSurfVar }}>search</span>
              <input
                type="text"
                placeholder="Search prompt history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 13, color: C.onSurf, width: '100%',
                }}
              />
            </div>
          )}
        </div>

        {/* List Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: C.primary, animation: 'spin 1.2s linear infinite' }}>progress_activity</span>
            <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 13, color: C.onSurfVar }}>Loading matches from database...</span>
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: 32, borderRadius: 16, textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#f87171', marginBottom: 12 }}>error</span>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.onSurf, margin: '0 0 8px' }}>History Error</h3>
            <p style={{ fontSize: 13, color: C.onSurfVar, margin: '0 0 20px' }}>{error}</p>
            <button
              onClick={() => onNavigate('auth')}
              style={{
                background: C.primary, color: C.onPrimary,
                padding: '10px 20px', border: 'none', borderRadius: 8,
                fontFamily: "'Geist Pixel', monospace", fontSize: 12, cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel" style={{ padding: 48, borderRadius: 20, textAlign: 'center', border: `1px solid ${C.outlineV}1f` }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, color: C.primary, opacity: 0.7, marginBottom: 16 }}>
              {search ? 'manage_search' : 'receipt_long'}
            </span>
            <h3 style={{ fontFamily: "'Helvetica', sans-serif", fontSize: 18, fontWeight: 600, color: C.onSurf, margin: '0 0 8px' }}>
              {search ? 'No matches found' : 'No battle logs yet'}
            </h3>
            <p style={{ fontSize: 14, color: C.onSurfVar, maxWidth: 360, margin: '0 auto 24px', lineHeight: '22px' }}>
              {search
                ? `We couldn't find any comparisons matching "${search}". Try checking your spelling.`
                : 'Run side-by-side completions of AI providers to populate your database archive.'}
            </p>
            <button
              onClick={() => onNavigate('home')}
              style={{
                background: C.primary, color: C.onPrimary,
                padding: '12px 24px', border: 'none', borderRadius: 8,
                fontFamily: "'Geist Pixel', monospace", fontSize: 12, fontWeight: 600, cursor: 'pointer',
                boxShadow: `0 4px 16px ${C.primary}33`,
              }}
            >
              {search ? 'Clear search' : 'Initiate First Battle'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {filtered.map((item, index) => {
                const winnerModel = item.judge.winner === 'solution_1' ? item.model1 : item.model2
                const isModel1Winner = item.judge.winner === 'solution_1'
                const scoreDiff = `${item.judge.solution_1_score} vs ${item.judge.solution_2_score}`

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="glass-panel history-card"
                    style={{
                      padding: 24, borderRadius: 16,
                      background: theme === 'light' ? '#ffffff' : `${C.surface}99`,
                      display: 'flex', flexDirection: 'column', gap: 16,
                      cursor: 'pointer',
                    }}
                    onClick={() => onSelectBattle(item)}
                  >
                    {/* Top Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontFamily: "'Geist Pixel', monospace", fontSize: 10,
                          color: C.onSurfVar, background: C.surfLow, border: `1px solid ${C.outlineV}40`,
                          padding: '3px 8px', borderRadius: 4,
                          textTransform: 'uppercase',
                        }}>
                          Match Log
                        </span>
                        <span style={{ fontSize: 12, color: C.onSurfVar }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      {/* Scores & Winner badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 12, color: C.onSurfVar }}>
                          Scores: <strong style={{ color: C.onSurf }}>{scoreDiff}</strong>
                        </span>

                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          background: `${C.primary}15`, border: `1px solid ${C.primary}33`,
                          padding: '4px 10px', borderRadius: 6,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 12, color: C.primary }}>emoji_events</span>
                          <span style={{ fontFamily: "'Geist Pixel', monospace", fontSize: 10, fontWeight: 700, color: C.primary, textTransform: 'uppercase' }}>
                            {getModelLabel(winnerModel)} Wins
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row - Prompt snippet */}
                    <div style={{
                      fontSize: 14, color: C.onSurf,
                      fontFamily: "'Helvetica', sans-serif",
                      fontWeight: 500, lineHeight: '22px',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap', maxWidth: '100%',
                      fontStyle: 'italic', opacity: 0.9,
                      borderLeft: `2px solid ${C.primary}88`,
                      paddingLeft: 12,
                    }}>
                      "{item.problem}"
                    </div>

                    {/* Bottom Row - Details / Contestants list */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderTop: `1px solid ${C.outlineV}11`, paddingTop: 14, marginTop: 4,
                    }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[item.model1, item.model2].map((m, i) => {
                          const isWinner = (i === 0 && isModel1Winner) || (i === 1 && !isModel1Winner)
                          return (
                            <span key={m} style={{
                              padding: '2px 8px', borderRadius: 4,
                              background: isWinner ? `${C.primary}0a` : C.surfLow,
                              border: `1px solid ${isWinner ? `${C.primary}2a` : `${C.outlineV}22`}`,
                              color: isWinner ? C.primary : C.onSurfVar,
                              fontSize: 10, fontFamily: "'Geist Pixel', monospace",
                              textTransform: 'uppercase',
                            }}>
                              {getModelLabel(m)}
                            </span>
                          )
                        })}
                      </div>

                      <button
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: "'Geist Pixel', monospace", fontSize: 11,
                          color: C.primary, fontWeight: 600,
                        }}
                      >
                        Details
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                      </button>
                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
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
