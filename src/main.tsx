import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Prevent uncaught browser extension or message channel disconnects from crashing runtime
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (String(event.reason?.message || event.reason).includes('Could not establish connection') ||
       String(event.reason?.message || event.reason).includes('Receiving end does not exist'))
    ) {
      event.preventDefault();
      console.debug('[Browser Extension / Channel] Connection ignored:', event.reason);
    }
  });
}

registerServiceWorker();

const rootElement = document.getElementById('root')!;
rootElement.dataset.mounted = 'true';

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
