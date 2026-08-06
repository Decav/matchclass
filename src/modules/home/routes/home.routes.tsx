import type { RouteObject } from 'react-router-dom';
import { PaDashboard } from '../components/pa-dashboard';
import { PaCreateRoom } from '../components/pa-create-room';
import { PaRoomDetailPlaceholder } from '../components/pa-room-detail-placeholder';
import { PaRoomBlocksPlaceholder } from '../components/pa-room-blocks-placeholder';

/**
 * RC-009 reemplaza `PaNewRoomPlaceholder` (RC-008) por el flujo real de
 * creación de sala (HU-07) y agrega el placeholder `/salas/:roomId/bloques`
 * (HU-08, todavía sin RC) — destino de "Configurar mis bloques" desde la
 * confirmación. `/salas/:roomId` (gestión/detalle de sala) sigue siendo
 * placeholder de RC-008, sin cambios. Las cuatro quedan protegidas por
 * `Q5ProtectedRoute` (RC-005) desde `app-router.tsx`.
 */
export const homeRoutes: RouteObject[] = [
  { path: '/dashboard', element: <PaDashboard /> },
  { path: '/salas/nueva', element: <PaCreateRoom /> },
  { path: '/salas/:roomId', element: <PaRoomDetailPlaceholder /> },
  { path: '/salas/:roomId/bloques', element: <PaRoomBlocksPlaceholder /> },
];
