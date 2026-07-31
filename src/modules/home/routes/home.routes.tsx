import type { RouteObject } from 'react-router-dom';
import { PaDashboardPlaceholder } from '../components/pa-dashboard-placeholder/pa-dashboard-placeholder';

export const homeRoutes: RouteObject[] = [{ path: '/dashboard', element: <PaDashboardPlaceholder /> }];
