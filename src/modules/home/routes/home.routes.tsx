import type { RouteObject } from 'react-router-dom';
import { PaDashboard } from '../components/pa-dashboard';
import { PaNewRoomPlaceholder } from '../components/pa-new-room-placeholder';
import { PaRoomDetailPlaceholder } from '../components/pa-room-detail-placeholder';

/**
 * RC-008 reemplaza `PaDashboardPlaceholder` (RC-003) por el dashboard real y
 * agrega los placeholders `/salas/nueva` (HU-07, todavía sin RC) y
 * `/salas/:roomId` (gestión/detalle de sala, todavía sin RC) — mismas rutas
 * que HU-03 ya anticipaba bajo `/salas/*`. Las tres quedan protegidas por
 * `Q5ProtectedRoute` (RC-005) desde `app-router.tsx`.
 */
export const homeRoutes: RouteObject[] = [
  { path: '/dashboard', element: <PaDashboard /> },
  { path: '/salas/nueva', element: <PaNewRoomPlaceholder /> },
  { path: '/salas/:roomId', element: <PaRoomDetailPlaceholder /> },
];
