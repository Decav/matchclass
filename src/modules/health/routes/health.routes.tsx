import type { RouteObject } from 'react-router-dom';
import { PaHealth } from '../components/pa-health/pa-health';

/**
 * RC-015 (D2) mueve el diagnóstico de `/` a `/health`: la raíz pasó a ser la
 * landing pública. `PaHealth` no se elimina ni se esconde detrás de
 * `import.meta.env.DEV` — sigue siendo la forma rápida de verificar que los
 * emuladores responden, y fuera de `/` no le estorba a nadie.
 */
export const healthRoutes: RouteObject[] = [{ path: '/health', element: <PaHealth /> }];
