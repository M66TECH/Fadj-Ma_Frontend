import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import api from './services/api'
import { initSessionSecurity } from './utils/session'

api.initDepuisStorage()


initSessionSecurity({
  idleMinutes: 30, 
  absoluteMinutes: 8 * 60,
  warnBeforeIdleSec: 60, 
  onLogout: () => {
    try { window.dispatchEvent(new CustomEvent('auth:unauthorized')) } catch {}
  },
  onWarnIdle: (secondsLeft, keepAlive) => {
    try {
      window.dispatchEvent(new CustomEvent('session:idle-warning', { detail: { secondsLeft, keepAlive } }))
    } catch {}
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
