import { createBrowserRouter, Navigate } from 'react-router-dom';
import { healthRoutes } from '@modules/health';
import { accessRoutes } from '@modules/access';
import { schedulingRoutes } from '@modules/scheduling';
import { homeRoutes } from '@modules/home';
import { resultsRoutes } from '@modules/results';
import { Q5ProtectedRoute } from '@global/components/q5-protected-route/q5-protected-route';

/**
 * RC-003 agrega `/acceso` (auth ayudante + ingreso alumno) y los placeholders
 * `/sala/:roomId` (RC-005-del-tech-document lo reemplazará) y `/dashboard`
 * (RC-007 lo reemplaza). `/sala/:roomId` es la pantalla del alumno (sesión
 * anónima) y queda pública a propósito.
 *
 * RC-005 (HU-03) agrega `Q5ProtectedRoute` como layout route: envuelve
 * `/dashboard`, la única ruta privada del ayudante que existe hoy. Rutas
 * futuras bajo `/salas/*` (gestión de salas) se agregarán como hijas del
 * mismo layout route cuando existan.
 *
 * RC-014 (HU-12) suma `resultsRoutes` bajo ese mismo guard: `/salas/:roomId`
 * pasó de placeholder en `home` a la pantalla de resultados del módulo
 * `results`.
 */
export const router = createBrowserRouter([
  ...healthRoutes,
  ...accessRoutes,
  ...schedulingRoutes,
  { element: <Q5ProtectedRoute />, children: [...homeRoutes, ...resultsRoutes] },
  { path: '*', element: <Navigate to="/" replace /> },
]);
