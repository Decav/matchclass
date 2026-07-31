import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { connectEmulators } from '@library/firebase';
import { AppProviders } from './providers/app-providers';

// PrimeReact 10 inyecta su CSS en runtime via el preset Aura (ver
// `@library/theme/mc-preset.ts` + `AppProviders`), no via un archivo de tema
// estatico — `primereact/resources/*.css` esta deprecado y vacio en v10.
import '@/styles/main.css';

// Antes de renderizar: el SDK lanza si se le cambia el host despues de
// la primera operacion.
connectEmulators();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontro el elemento #root en index.html');

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
);
