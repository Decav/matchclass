import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { connectEmulators } from '@library/firebase';
import { AppProviders } from './providers/app-providers';

// ORDEN CRITICO — no reordenar, no agregar temas de PrimeReact.
// theme.css ya sobreescribe las variables CSS que definiria un tema de PrimeReact.
import 'primereact/resources/primereact.min.css';
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
