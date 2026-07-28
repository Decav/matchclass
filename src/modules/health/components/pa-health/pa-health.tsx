import { CheckCircle2, XCircle, Loader2, FlaskConical, Cloud } from 'lucide-react';
import { useFirebaseHealth, type ServiceStatus } from '@global/hooks/use-firebase-health';
import { EMULATOR_PORTS, isUsingEmulators } from '@library/firebase';

const STATUS_ICON: Record<ServiceStatus, React.ReactNode> = {
  checking: <Loader2 size={18} className="animate-spin" aria-hidden="true" />,
  ok: <CheckCircle2 size={18} aria-hidden="true" />,
  error: <XCircle size={18} aria-hidden="true" />,
};

const STATUS_COLOR: Record<ServiceStatus, string> = {
  checking: 'var(--mc-text-tertiary)',
  ok: 'var(--mc-success)',
  error: 'var(--mc-danger)',
};

const STATUS_LABEL: Record<ServiceStatus, string> = {
  checking: 'Comprobando',
  ok: 'Operativo',
  error: 'Sin conexión',
};

interface ServiceRowProps {
  name: string;
  port: number;
  status: ServiceStatus;
  detail: string | null;
}

function ServiceRow({ name, port, status, detail }: ServiceRowProps) {
  return (
    <li
      className="flex items-center gap-3 px-4 py-3"
      style={{ borderTop: '1px solid var(--mc-border)' }}
    >
      <span style={{ color: STATUS_COLOR[status] }}>{STATUS_ICON[status]}</span>

      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium">{name}</span>
        <span className="block text-xs truncate" style={{ color: 'var(--mc-text-secondary)' }}>
          {detail ?? 'Esperando respuesta…'}
        </span>
      </span>

      <span className="mc-numeric text-xs" style={{ color: 'var(--mc-text-tertiary)' }}>
        :{port}
      </span>

      {/* El color no es el único canal: el estado también va como texto */}
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: STATUS_COLOR[status] }}
      >
        {STATUS_LABEL[status]}
      </span>
    </li>
  );
}

/**
 * Pantalla de verificación del RC-001. Confirma que el toolchain arranca y que
 * el SDK de Firebase alcanza Auth y Firestore.
 *
 * Se reemplaza por la UI real en RC-002 / RC-007.
 */
export function PaHealth() {
  const health = useFirebaseHealth();
  const usingEmulators = isUsingEmulators();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-hero-bg)' }}
    >
      <div
        className="w-full max-w-md overflow-hidden"
        style={{
          background: 'var(--mc-card)',
          borderRadius: 'var(--mc-radius-lg)',
          boxShadow: 'var(--mc-shadow-md)',
        }}
      >
        <header
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'var(--mc-brand-gradient)' }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{
              borderRadius: 'var(--mc-radius)',
              background: 'rgb(255 255 255 / 15%)',
            }}
          >
            {usingEmulators ? (
              <FlaskConical size={22} color="#fff" aria-hidden="true" />
            ) : (
              <Cloud size={22} color="#fff" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold" style={{ color: 'var(--mc-text-inverse)' }}>
              MatchClass
            </h1>
            <p className="text-xs" style={{ color: 'rgb(255 255 255 / 70%)' }}>
              {usingEmulators ? 'Emuladores locales' : 'Proyecto Firebase remoto'}
            </p>
          </div>
        </header>

        <ul className="list-none m-0 p-0">
          <ServiceRow
            name="Firebase Auth"
            port={EMULATOR_PORTS.auth}
            status={health.auth}
            detail={health.authDetail}
          />
          <ServiceRow
            name="Cloud Firestore"
            port={EMULATOR_PORTS.firestore}
            status={health.firestore}
            detail={health.firestoreDetail}
          />
        </ul>

        <footer className="px-4 py-3" style={{ borderTop: '1px solid var(--mc-border)' }}>
          <p className="text-xs m-0" style={{ color: 'var(--mc-text-tertiary)' }}>
            {usingEmulators
              ? 'Si los servicios no responden, ejecuta npm run emulators.'
              : 'Conectado al proyecto real: los datos que escribas son reales.'}
          </p>
        </footer>
      </div>
    </main>
  );
}
