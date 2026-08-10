import { Navigate, useParams } from 'react-router-dom';
import { DoorOpen, LayoutDashboard, Users } from 'lucide-react';
import { Q5AppShell, type Q5NavItem } from '@global/components/q5-app-shell';
import { Q3SidebarUserPanel } from '@global/components/q3-sidebar-user-panel';
import { useResultsRoomQuery } from '../../core/hooks/use-results-room-query';
import { Q4RoomResults } from '../q4-room-results';

// Mismos ítems que las páginas de `home` — duplicado a propósito (ver nota
// en `pa-create-room.tsx`, RC-009 §10).
const NAV_ITEMS: Q5NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Mis salas', icon: DoorOpen, to: '/dashboard', matchActive: false },
  { label: 'Próximamente', icon: Users, disabled: true },
];

/**
 * Página real de `/salas/:roomId` (RC-014, HU-12) — reemplaza
 * `PaRoomDetailPlaceholder` (RC-008). Destino de "Abrir" en la card de una
 * sala del dashboard.
 *
 * El nombre de la sala va en la topbar (frame `Resultados Sala` · "R TB
 * Title"). Se lee acá con la misma query que después usa `Q4RoomResults`:
 * la key es compartida, así que no cuesta una lectura extra.
 */
export function PaRoomResults() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: room } = useResultsRoomQuery(roomId ?? '');

  if (!roomId) return <Navigate to="/dashboard" replace />;

  return (
    <Q5AppShell navItems={NAV_ITEMS} footer={<Q3SidebarUserPanel />} title={room?.name ?? 'Resultados'}>
      <Q4RoomResults roomId={roomId} />
    </Q5AppShell>
  );
}
