import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Automatically recover when Vite dynamic chunk assets change on new deployment
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    console.warn('[ProcureSync] Vite preload error intercepted. Auto-reloading with latest assets...');
    const lastReload = sessionStorage.getItem('procuresync_preload_reload');
    const now = Date.now();
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('procuresync_preload_reload', String(now));
      if ('caches' in window) {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).finally(() => {
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
