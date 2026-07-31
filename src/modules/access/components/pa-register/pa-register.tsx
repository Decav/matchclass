import { Q4RegisterForm } from '../q4-register-form/q4-register-form';

/**
 * Página `/registro` (RC-004, HU-02). Página independiente, sin tabs —
 * mismo patrón visual que la card de `/acceso` (`mc-access-card`, 400px,
 * logo centrado), reemplazando el formulario de login por el de registro.
 */
export function PaRegister() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--mc-surface)' }}
    >
      <div className="mc-card mc-access-card">
        <div className="mc-access-logo-row">
          <div className="mc-access-logo-box" aria-hidden="true">
            MC
          </div>
          <span className="mc-access-logo-name">MatchClass</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--mc-text-primary)' }}>
            Crea tu cuenta
          </h1>
          <p className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
            Completa tus datos para registrarte como ayudante
          </p>
        </div>

        <Q4RegisterForm />
      </div>
    </main>
  );
}
