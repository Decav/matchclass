import { Navigate, useParams } from 'react-router-dom';
import { DoorOpen, LayoutDashboard, Users } from 'lucide-react';
import { Q5AppShell, type Q5NavItem } from '@global/components/q5-app-shell';
import { Q3SidebarUserPanel } from '../q3-sidebar-user-panel';
import { Q4RoomBlocksGrid } from '../q4-room-blocks-grid';

// Mismos ítems que `PaDashboard`/`PaCreateRoom` — duplicado a propósito
// (ver nota en `pa-create-room.tsx`, RC-009 §10).
const NAV_ITEMS: Q5NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Mis salas', icon: DoorOpen, to: '/dashboard', matchActive: false },
  { label: 'Próximamente', icon: Users, disabled: true },
];

/**
 * Página real de `/salas/:roomId/bloques` (RC-010, HU-08) — reemplaza
 * `PaRoomBlocksPlaceholder` (RC-009). Destino de "Configurar mis bloques"
 * desde la confirmación de sala creada, o de abrir una sala existente con
 * restricciones ya guardadas.
 */
export function PaRoomBlocks() {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) return <Navigate to="/dashboard" replace />;

  return (
    <Q5AppShell navItems={NAV_ITEMS} footer={<Q3SidebarUserPanel />} title="Mis bloques">
      <Q4RoomBlocksGrid roomId={roomId} />
    </Q5AppShell>
  );
}
