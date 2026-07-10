import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// ── Disable browser scroll restoration ──────────────────────────────────────
// The browser's default 'auto' scroll restoration remembers the last scroll
// position and jumps there after hydration, causing a 20-60px visual jump on
// every refresh. Setting to 'manual' gives Lenis full control.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

// NOTE: React StrictMode intentionally double-invokes useEffect in development
// to detect side effects. This caused two POST /battle/stream requests per battle
// (mount → cleanup → remount), resulting in the doubled 'Battle started' backend logs
// and occasional duplicate API calls to Mistral/Cohere. Removed here.
createRoot(document.getElementById('root')).render(
  <App />,
)
