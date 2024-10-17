import App from './App';
import './libs/twind';
import { tx } from '@twind/core';
import 'dockview/dist/styles/dockview.css';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <div className={tx`w-full h-dvh`}>
    <App />
  </div>,
);
