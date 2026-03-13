window.storage = {
  get: async (k) => { try { const v = localStorage.getItem(k); return v ? {value: v} : null; } catch { return null; } },
  set: async (k, v) => { try { localStorage.setItem(k, v); return {value: v}; } catch { return null; } },
  delete: async (k) => { try { localStorage.removeItem(k); return {deleted: true}; } catch { return null; } },
  list: async () => { return {keys: []}; }
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
