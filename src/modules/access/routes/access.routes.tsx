import type { RouteObject } from 'react-router-dom';
import { PaAccess } from '../components/pa-access/pa-access';
import { PaRegister } from '../components/pa-register/pa-register';
import { PaRecoverPassword } from '../components/pa-recover-password/pa-recover-password';

/**
 * RC-004 agrega `/registro` (HU-02), destino del link "Registrarse" del tab
 * Ayudante en `/acceso`. RC-007 agrega `/recuperar` (HU-05), destino del link
 * "¿Olvidaste tu contraseña?" del mismo tab.
 */
export const accessRoutes: RouteObject[] = [
  { path: '/acceso', element: <PaAccess /> },
  { path: '/registro', element: <PaRegister /> },
  { path: '/recuperar', element: <PaRecoverPassword /> },
];
