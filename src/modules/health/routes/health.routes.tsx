import type { RouteObject } from 'react-router-dom';
import { PaHealth } from '../components/pa-health/pa-health';

export const healthRoutes: RouteObject[] = [{ path: '/', element: <PaHealth /> }];
