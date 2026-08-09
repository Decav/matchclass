import type { RouteObject } from 'react-router-dom';
import { PaDashboard } from '../components/pa-dashboard';
import { PaCreateRoom } from '../components/pa-create-room';
import { PaRoomDetailPlaceholder } from '../components/pa-room-detail-placeholder';
import { PaRoomBlocks } from '../components/pa-room-blocks';

/**
 * RC-010 reemplaza `PaRoomBlocksPlaceholder` (RC-009) por la grilla real de
 * restricciones del ayudante (HU-08) en `/salas/:roomId/bloques`.
 * `/salas/:roomId` (gestión/detalle de sala) sigue siendo placeholder de
 * RC-008, sin cambios. Las cuatro rutas quedan protegidas por
 * `Q5ProtectedRoute` (RC-005) desde `app-router.tsx`.
 */
export const homeRoutes: RouteObject[] = [
  { path: '/dashboard', element: <PaDashboard /> },
  { path: '/salas/nueva', element: <PaCreateRoom /> },
  { path: '/salas/:roomId', element: <PaRoomDetailPlaceholder /> },
  { path: '/salas/:roomId/bloques', element: <PaRoomBlocks /> },
];
