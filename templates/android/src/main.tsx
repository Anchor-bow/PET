import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RuntimeRenderer } from '@pet/runtime';
import type { AppDefinition } from '@pet/types';
import appData from './app.data.json';
import './style.css';

const app = appData as unknown as AppDefinition;

function App() {
  return <RuntimeRenderer app={app} />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
