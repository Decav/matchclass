import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Q1Button } from '@global/components/q1-button';
import { Q4RecoverEmailForm } from '../q4-recover-email-form/q4-recover-email-form';

type RecoverPasswordState = 'form' | 'confirmation';

/**
 * Página `/recuperar` (RC-007, HU-05). Dos estados internos con `useState`
 * (sin cambiar de ruta) — mismo criterio que `Q5StudentAccessFlow` (RC-003)
 * para el flujo código → nombre del tab Alumno: un componente decide qué
 * sub-vista mostrar en vez de navegar entre rutas.
 *
 * Estado "confirmation" es intencionalmente genérico (Escenario 2, HU-05
 * §10): no hay forma de distinguir en la UI si el email tenía o no cuenta.
 */
export function PaRecoverPassword() {
  const [state, setState] = useState<RecoverPasswordState>('form');
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-access-card">
        <div className="mc-access-logo-row">
          <div className="mc-access-logo-box" aria-hidden="true">
            MC
          </div>
          <span className="mc-access-logo-name">MatchClass</span>
        </div>

        {state === 'form' ? (
          <>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--mc-text-primary)' }}>
                Recupera tu contraseña
              </h1>
              <p className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
                Te enviaremos un link para restablecerla
              </p>
            </div>

            <Q4RecoverEmailForm
              onSuccess={() => {
                setState('confirmation');
              }}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 64, height: 64, background: 'var(--mc-success)' }}
              aria-hidden="true"
            >
              <Mail size={28} strokeWidth={2} color="#ffffff" />
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--mc-text-primary)' }}>
                Revisa tu email
              </h1>
              <p className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
                Si existe una cuenta con ese email, recibirás un link para restablecer tu
                contraseña
              </p>
            </div>

            <Q1Button
              label="Volver al inicio"
              className="w-full"
              onClick={() => {
                void navigate('/acceso');
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
