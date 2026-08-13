import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

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
