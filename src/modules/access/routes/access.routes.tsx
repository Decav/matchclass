import type { RouteObject } from 'react-router-dom';
import { PaAccess } from '../components/pa-access/pa-access';
import { PaRegister } from '../components/pa-register/pa-register';

/**
 * RC-004 agrega `/registro` (HU-02), destino del link "Registrarse" del tab
 * Ayudante en `/acceso`.
 */
export const accessRoutes: RouteObject[] = [
  { path: '/acceso', element: <PaAccess /> },
  { path: '/registro', element: <PaRegister /> },
];
