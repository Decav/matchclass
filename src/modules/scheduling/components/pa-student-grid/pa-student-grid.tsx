import { Navigate, useParams } from 'react-router-dom';
import { Q1Skeleton } from '@global/components/q1-skeleton';
import { useStudentSessionQuery } from '../../core/hooks/use-student-session-query';
import { useStudentRoomQuery } from '../../core/hooks/use-student-room-query';
import { Q4StudentGrid } from '../q4-student-grid';

const CLOSED_ROOM_MESSAGE = 'Esta sala ya no acepta respuestas';

/**
 * Página de `/sala/:roomId` (RC-013, HU-11) — reemplaza
 * `PaRoomPlaceholder` (RC-003). Sin `Q5AppShell` a propósito: el alumno
 * está en sesión anónima, no tiene sidebar ni dashboard. Card centrado de
 * 840px sobre el fondo de página, como el frame `Grilla Alumno` (`J2ZlIY`).
 *
 * Resuelve tres cosas antes de mostrar la grilla:
 * 1. La sesión anónima ya restaurada (`useStudentSessionQuery`). Mientras
 *    carga muestra skeletons — nunca redirige durante la carga, que es el
 *    mismo error que `Q5ProtectedRoute` evita con `AuthStatus.Loading`.
 * 2. Sin uid → a `/acceso?tipo=alumno`: sin sesión no hay documento de
 *    respuesta que leer ni escribir.
 * 3. Sala inexistente o `status !== 'active'` → el mismo mensaje que ya
 *    muestra el formulario de código (RC-013 §4). La autorización real
 *    siguen siendo las Security Rules; esto solo evita que el alumno marque
 *    50 celdas para que el guardado falle en silencio.
 */
export function PaStudentGrid() {
  const { roomId } = useParams<{ roomId: string }>();
  const { data: uid, isLoading: isSessionLoading } = useStudentSessionQuery();
  const { data: room, isLoading: isRoomLoading } = useStudentRoomQuery(roomId ?? '');

  if (!roomId) return <Navigate to="/acceso?tipo=alumno" replace />;

  if (isSessionLoading || isRoomLoading) {
    return (
      <main className="mc-student-page">
        <div className="mc-student-page__content" role="status" aria-label="Cargando la sala">
          <Q1Skeleton width={260} height={28} borderRadius={8} />
          <Q1Skeleton width="100%" height={480} borderRadius={16} />
        </div>
      </main>
    );
  }

  if (!uid) return <Navigate to="/acceso?tipo=alumno" replace />;

  if (!room || room.status !== 'active') {
    return (
      <main className="mc-student-page">
        <div className="mc-card mc-empty-state" style={{ maxWidth: 480 }}>
          <p className="mc-empty-state__title">{CLOSED_ROOM_MESSAGE}</p>
          <p className="mc-empty-state__description">
            El ayudante cerró esta sala. Si crees que es un error, escríbele para que vuelva a abrirla.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mc-student-page">
      <div className="mc-student-page__content">
        <header className="mc-student-page__header">
          <span className="mc-student-page__logo" aria-hidden="true">
            MC
          </span>
          <div className="flex flex-col gap-1">
            <span className="mc-student-page__room-tag">Estás respondiendo a</span>
            <span className="mc-student-page__room-name">{room.name}</span>
          </div>
        </header>

        <h1 className="mc-student-page__title">Marca los bloques donde tienes clase</h1>
        <p className="mc-student-page__subtitle">
          Selecciona solo los horarios ocupados. El sistema calcula tu disponibilidad automáticamente.
        </p>

        <Q4StudentGrid roomId={roomId} uid={uid} />

        <p className="mc-student-page__privacy">Tu nombre solo lo verá el ayudante</p>
      </div>
    </main>
  );
}
