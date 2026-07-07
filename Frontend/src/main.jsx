import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ── Disable browser scroll restoration ──────────────────────────────────────
// The browser's default 'auto' scroll restoration remembers the last scroll
// position and jumps there after hydration, causing a 20-60px visual jump on
// every refresh. Setting to 'manual' gives Lenis full control.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
