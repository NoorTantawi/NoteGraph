import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializePlugins } from './plugins'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

// ── Global exception handlers ──────────────────────────────────────
window.onerror = (message, source, lineno, colno, error) => {
  console.error('[NoteGraph Global Error]', { message, source, lineno, colno, error })
}

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  console.error('[NoteGraph Unhandled Rejection]', event.reason)
}

// Boot the plugin system before rendering
initializePlugins()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary name="NoteGraph Root">
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
