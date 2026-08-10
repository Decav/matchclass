import type { RouteObject } from 'react-router-dom';
import { PaDashboard } from '../components/pa-dashboard';
import { PaCreateRoom } from '../components/pa-create-room';
import { PaRoomBlocks } from '../components/pa-room-blocks';
import { PaLanding } from '../components/pa-landing';

/**
 * Rutas públicas del módulo, separadas de `homeRoutes` porque se registran
 * FUERA de `Q5ProtectedRoute` (RC-015 D1). Hoy solo la landing: `/` no exige
 * sesión, y el guard del ayudante con sesión activa vive dentro de
 * `PaLanding`, no en el router.
 */
export const homePublicRoutes: RouteObject[] = [{ path: '/', element: <PaLanding /> }];

/**
 * RC-010 reemplaza `PaRoomBlocksPlaceholder` (RC-009) por la grilla real de
 * restricciones del ayudante (HU-08) en `/salas/:roomId/bloques`.
 *
 * `/salas/:roomId` ya no vive acá: RC-014 la convirtió en la pantalla de
 * resultados y la movió al módulo `results` (`resultsRoutes`), junto con la
 * baja de `PaRoomDetailPlaceholder`. Las tres rutas restantes siguen
 * protegidas por `Q5ProtectedRoute` (RC-005) desde `app-router.tsx`.
 */
export const homeRoutes: RouteObject[] = [
  { path: '/dashboard', element: <PaDashboard /> },
  { path: '/salas/nueva', element: <PaCreateRoom /> },
  { path: '/salas/:roomId/bloques', element: <PaRoomBlocks /> },
];
