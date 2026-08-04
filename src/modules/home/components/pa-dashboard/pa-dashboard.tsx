import { DoorOpen, LayoutDashboard, Users } from 'lucide-react';
import { Q5AppShell, type Q5NavItem } from '@global/components/q5-app-shell';
import { Q4DashboardRooms } from '../q4-dashboard-rooms';
import { Q3SidebarUserPanel } from '../q3-sidebar-user-panel';

/**
 * Página real de `/dashboard` (RC-008, HU-06) — reemplaza
 * `PaDashboardPlaceholder` (RC-003). Primer montaje de `Q5AppShell`
 * (RC-002) en una ruta: sidebar con nav + panel de usuario/logout, topbar
 * con toggle de tema.
 *
 * "Dashboard" y "Mis salas" navegan ambos a `/dashboard` por ahora (RC-008
 * §10) — todavía es la misma página. `matchActive: false` en "Mis salas"
 * evita que los dos ítems queden resaltados a la vez (el diseño solo marca
 * "Dashboard" como activo). "Próximamente" se renderiza deshabilitado, sin
 * ruta ni onClick.
 */
const NAV_ITEMS: Q5NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Mis salas', icon: DoorOpen, to: '/dashboard', matchActive: false },
  { label: 'Próximamente', icon: Users, disabled: true },
];

export function PaDashboard() {
  return (
    <Q5AppShell navItems={NAV_ITEMS} footer={<Q3SidebarUserPanel />}>
      <Q4DashboardRooms />
    </Q5AppShell>
  );
}
