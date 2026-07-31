import type { RouteObject } from 'react-router-dom';
import { PaRoomPlaceholder } from '../components/pa-room-placeholder/pa-room-placeholder';

export const schedulingRoutes: RouteObject[] = [{ path: '/sala/:roomId', element: <PaRoomPlaceholder /> }];
