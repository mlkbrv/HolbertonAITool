import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { prefetchCsrf } from './api/client.ts';
import { redirectStubHostIfNeeded } from './lib/legacyHost.ts';
import './index.css';

redirectStubHostIfNeeded();

const root = document.getElementById('root')!;

async function bootstrap() {
  try {
    await prefetchCsrf();
  } catch {
    /* retry on first POST */
  }
  createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
  );
}

bootstrap();
