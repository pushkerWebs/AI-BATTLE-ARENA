import { useState, useEffect } from 'react'
import Icon from './Icon'
import { C } from '../constants/colors'
import { useAuth } from '../context/AuthContext'
import { API_BASE } from '../config'

const NAV_ITEMS = [
  { key: 'home', icon: 'add_box', label: 'New Comparison' },
  { key: 'history', icon: 'history', label: 'History' },
  { key: 'prompts', icon: 'chat_bubble', label: 'Recent Prompts' },
  { key: 'fav', icon: 'star', label: 'Favorites' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar({ activeKey = 'home', onNav, onSelectBattle }) {
  const [recentPrompts, setRecentPrompts] = useState([])
  const [promptsOpen, setPromptsOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState(activeKey)
  const { token } = useAuth()

  useEffect(() => {
    setSelectedKey(activeKey)
  }, [activeKey])

  useEffect(() => {
    if (!token) return

    fetch(`${API_BASE}/auth/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('History fetch failed')
        return res.json()
      })
      .then(data => {
        const list = data.history || []
        const seen = new Set()
        const unique = []
        for (const item of list) {
          if (item.problem && !seen.has(item.problem.trim())) {
            seen.add(item.problem.trim())
            unique.push(item)
          }
          if (unique.length >= 5) break
        }
        setRecentPrompts(unique)
      })
      .catch(err => console.warn('Sidebar history fetch error:', err))
  }, [token])

  return (
    <aside style={{
      width: 256, flexShrink: 0,
      height: '100vh',
      display: 'flex', flexDirection: 'column',
      padding: 24, overflowY: 'auto',
      background: C.surfLow,
      borderRight: `1px solid ${C.outlineV}1a`,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 48 }}>
        <h1
          className="logo-brand"
          onClick={() => onNav('home')}
          style={{ fontSize: 22, margin: 0, cursor: 'pointer' }}
        >
          AI ARENA
        </h1>
        <p style={{
          fontFamily: "'Geist Pixel', monospace",
          fontSize: 11, color: C.onSurfVar, opacity: 0.6, marginTop: 6, letterSpacing: '0.04em',
        }}>v1.0.4</p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.key === selectedKey
          return (
            <div key={item.key} style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setSelectedKey(item.key)
                  if (item.key === 'prompts') {
                    setPromptsOpen(!promptsOpen)
                  } else if (item.key !== 'fav' && item.key !== 'settings') {
                    onNav?.(item.key)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '8px 16px', borderRadius: 8,
                  background: isActive ? C.surfHigh : 'transparent',
                  border: 'none',
                  borderRight: isActive ? `2px solid ${C.primary}` : '2px solid transparent',
                  color: isActive ? C.primary : C.onSurfVar,
                  fontFamily: "'Geist Pixel', monospace",
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.surfHigh }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon n={item.icon} size={20} style={{ color: 'inherit', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.key === 'prompts' && (
                  <Icon n={promptsOpen ? 'expand_less' : 'expand_more'} size={18} style={{ color: 'inherit', opacity: 0.7 }} />
                )}
              </button>

              {/* Sublist for recent prompts */}
              {item.key === 'prompts' && promptsOpen && (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  gap: 8, padding: '8px 16px 12px 36px',
                }}>
                  {recentPrompts.length > 0 ? (
                    recentPrompts.map((battle) => (
                      <button
                        key={battle._id}
                        onClick={() => onSelectBattle?.(battle)}
                        style={{
                          background: 'none', border: 'none',
                          color: C.onSurfVar, opacity: 0.75,
                          fontSize: 12, textAlign: 'left',
                          cursor: 'pointer', padding: '2px 0',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', width: '100%',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'opacity 0.2s, color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.opacity = '1' }}
                        onMouseLeave={e => { e.currentTarget.style.color = C.onSurfVar; e.currentTarget.style.opacity = '0.75' }}
                        title={battle.problem}
                      >
                        {battle.problem}
                      </button>
                    ))
                  ) : (
                    <span style={{ fontSize: 11, color: C.onSurfVar, opacity: 0.5, fontFamily: "'Inter', sans-serif" }}>No recent prompts</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 24 }}>
        <button style={{
          width: '100%', padding: '12px 16px',
          background: C.primary,
          color: C.onPrimary,
          fontFamily: "'Inter', 'Helvetica', Arial, sans-serif",
          fontSize: 14, fontWeight: 700,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'opacity 0.2s, transform 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(0.99)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          Upgrade to Pro
        </button>
      </div>
    </aside>
  )
}
