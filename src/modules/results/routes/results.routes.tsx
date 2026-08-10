import type { RouteObject } from 'react-router-dom';
import { PaRoomResults } from '../components/pa-room-results/pa-room-results';

/**
 * `/salas/:roomId` migra de `homeRoutes` a este módulo (RC-014 §10 D1): la
 * ruta dejó de ser un placeholder de gestión de sala y pasó a ser la
 * pantalla de resultados. Sigue protegida por `Q5ProtectedRoute` desde
 * `app-router.tsx`.
 */
export const resultsRoutes: RouteObject[] = [{ path: '/salas/:roomId', element: <PaRoomResults /> }];
