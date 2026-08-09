import type { KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Q4LoginForm } from '../q4-login-form/q4-login-form';
import { Q5StudentAccessFlow } from '../q5-student-access-flow/q5-student-access-flow';

type AccessTab = 'ayudante' | 'alumno';

const CODE_LENGTH = 6;

function readActiveTab(searchParams: URLSearchParams): AccessTab {
  return searchParams.get('tipo') === 'alumno' ? 'alumno' : 'ayudante';
}

/**
 * Lee `?codigo=` (RC-011 §6, HU-09 Escenario 3) para precargar el código del
 * tab Alumno cuando se llega por un enlace compartido
 * (`buildAlumnoAccessLink`). Normalizada a mayúsculas y truncada a
 * `CODE_LENGTH`, igual criterio que la validación manual de
 * `RoomRepository.findByCode` (Firestore no hace match case-insensitive).
 */
function readInitialCode(searchParams: URLSearchParams): string {
  return (searchParams.get('codigo') ?? '').toUpperCase().slice(0, CODE_LENGTH);
}

/**
 * Card con logo + tabs "Ayudante"/"Alumno" de `/acceso`. El tab activo vive
 * en la URL (`?tipo=alumno`), no en estado local — permite enlaces directos
 * (HU-01 Escenarios 6-7).
 *
 * Ambos contenidos de tab quedan siempre montados (ocultos con `hidden`), no
 * condicionalmente renderizados: así el formulario de login conserva lo
 * escrito al volver del tab Alumno (Escenario 8), sin levantar su estado
 * fuera de React Hook Form.
 */
export function Q5AccessTabs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = readActiveTab(searchParams);
  const initialCode = readInitialCode(searchParams);

  function selectTab(tab: AccessTab) {
    setSearchParams(tab === 'alumno' ? { tipo: 'alumno' } : {}, { replace: true });
  }

  function handleTabsKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      selectTab(activeTab === 'ayudante' ? 'alumno' : 'ayudante');
    }
  }

  return (
    <div className="mc-card mc-access-card">
      <div className="mc-access-logo-row">
        <div className="mc-access-logo-box" aria-hidden="true">
          MC
        </div>
        <span className="mc-access-logo-name">MatchClass</span>
      </div>

      <div className="mc-access-tabs" role="tablist" aria-label="Tipo de acceso" onKeyDown={handleTabsKeyDown}>
        {(
          [
            { tab: 'ayudante', label: 'Ayudante' },
            { tab: 'alumno', label: 'Alumno' },
          ] as const
        ).map(({ tab, label }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`mc-access-tab${isActive ? ' mc-access-tab--active' : ''}`}
              onClick={() => {
                selectTab(tab);
              }}
            >
              {label}
              <span
                className={`mc-access-tab-indicator${isActive ? ' mc-access-tab-indicator--active' : ''}`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Ambos paneles quedan siempre montados: el atributo nativo `hidden`
          (no una clase) los oculta sin desmontarlos, así el estado de RHF del
          login sobrevive al cambio de tab (Escenario 8). */}
      <div hidden={activeTab !== 'ayudante'}>
        <Q4LoginForm />
      </div>
      <div hidden={activeTab !== 'alumno'}>
        <Q5StudentAccessFlow initialCode={initialCode} />
      </div>
    </div>
  );
}
