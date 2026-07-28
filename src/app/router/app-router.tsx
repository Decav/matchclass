import { createBrowserRouter, Navigate } from 'react-router-dom';
import { healthRoutes } from '@modules/health';

/**
 * RC-001: solo la ruta de verificación.
 * Las rutas de producto llegan con RC-003 (auth), RC-004 (salas),
 * RC-005 (respuesta) y RC-007 (landing y dashboard).
 */
export const router = createBrowserRouter([
  ...healthRoutes,
  { path: '*', element: <Navigate to="/" replace /> },
]);
