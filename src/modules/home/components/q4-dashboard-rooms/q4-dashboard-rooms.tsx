import { Link } from 'react-router-dom';
import { Activity, DoorOpen, Plus, Users } from 'lucide-react';
import { useAuthStore } from '@global/store/auth.store';
import { useDashboardRoomsQuery } from '../../core/hooks/use-dashboard-rooms-query';
import { Q2KpiCard } from '../q2-kpi-card';
import { Q3RoomCard } from '../q3-room-card';
import { Q2PastRoomRow } from '../q2-past-room-row';
import { Q3DashboardSkeleton } from '../q3-dashboard-skeleton';
import { Q2DashboardEmptyState } from '../q2-dashboard-empty-state';
import { Q2DashboardErrorState } from '../q2-dashboard-error-state';

/**
 * Organismo con la lógica de "LoadDashboard" (RC-008 §6). Único punto donde
 * se elige el estado de render: loading -> skeletons, error -> reintento,
 * vacío -> empty state, datos -> KPIs + listas activas/pasadas.
 */
export function Q4DashboardRooms() {
  const user = useAuthStore((s) => s.user);
  const uid = user?.id ?? '';
  const { data, isLoading, isError, refetch } = useDashboardRoomsQuery(uid);

  if (isLoading) return <Q3DashboardSkeleton />;
  if (isError) return <Q2DashboardErrorState onRetry={() => void refetch()} />;
  if (!data || data.length === 0) return <Q2DashboardEmptyState />;

  const activeRooms = data.filter((room) => room.status === 'active');
  const pastRooms = data.filter((room) => room.status !== 'active');
  const totalRooms = data.length;
  const totalResponses = data.reduce((sum, room) => sum + room.responseCount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="mc-page-header__title">Mis salas</h1>
          <p className="mc-page-header__subtitle">Administra tus salas de coordinación</p>
        </div>
        <Link to="/salas/nueva" className="mc-btn mc-btn-primary">
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          Nueva sala
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Q2KpiCard icon={DoorOpen} value={totalRooms} label="Salas totales" />
        <Q2KpiCard icon={Users} value={totalResponses} label="Respuestas recibidas" />
        <Q2KpiCard icon={Activity} value={activeRooms.length} label="Salas activas" />
      </div>

      {activeRooms.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
            Salas activas
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {activeRooms.map((room) => (
              <Q3RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}

      {pastRooms.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
            Salas pasadas
          </h2>
          <div className="flex flex-col gap-2">
            {pastRooms.map((room) => (
              <Q2PastRoomRow key={room.id} room={room} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
