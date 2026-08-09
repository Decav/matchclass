import type { RouteObject } from 'react-router-dom';
import { PaStudentGrid } from '../components/pa-student-grid/pa-student-grid';

/**
 * `/sala/:roomId` es pública a propósito: el alumno llega con una sesión
 * anónima, no con cuenta (RC-003 §10). El control de acceso real lo hacen
 * las Security Rules de `responses`.
 */
export const schedulingRoutes: RouteObject[] = [{ path: '/sala/:roomId', element: <PaStudentGrid /> }];
