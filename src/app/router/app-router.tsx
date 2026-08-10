import { createBrowserRouter, Navigate } from 'react-router-dom';
import { healthRoutes } from '@modules/health';
import { accessRoutes } from '@modules/access';
import { schedulingRoutes } from '@modules/scheduling';
import { homeRoutes, homePublicRoutes } from '@modules/home';
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
 *
 * RC-015 (HU-13) pone la landing pública en `/` vía `homePublicRoutes` —
 * fuera de `Q5ProtectedRoute`, a diferencia del resto de `home` — y corre
 * `healthRoutes` a `/health`.
 */
export const router = createBrowserRouter([
  ...homePublicRoutes,
  ...healthRoutes,
  ...accessRoutes,
  ...schedulingRoutes,
  { element: <Q5ProtectedRoute />, children: [...homeRoutes, ...resultsRoutes] },
  { path: '*', element: <Navigate to="/" replace /> },
]);
