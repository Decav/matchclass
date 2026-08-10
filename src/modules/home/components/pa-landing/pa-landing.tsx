import { Link, Navigate } from 'react-router-dom';
import { CalendarPlus, Link as LinkIcon, TrendingUp } from 'lucide-react';
import { Q1LoadingSpinner } from '@global/components/q1-loading-spinner';
import { useAuthStore } from '@global/store/auth.store';
import { AuthStatus } from '@resources/enums/auth-status.enum';
import { Q4LandingCodeForm } from '../q4-landing-code-form';
import {
  Q2LandingFeatureCard,
  type Q2LandingFeatureCardProps,
} from '../q2-landing-feature-card';

/** Las tres cards de "Cómo funciona" (RC-015 §10, tabla del frame). */
const FEATURES: Q2LandingFeatureCardProps[] = [
  {
    icon: CalendarPlus,
    tone: 'secondary',
    title: 'Crea una sala',
    description: 'El ayudante crea la sala en segundos y recibe un código único para compartir',
  },
  {
    icon: LinkIcon,
    tone: 'accent',
    title: 'Comparte el código',
    description:
      'Los alumnos ingresan sin registro ni contraseña. Solo necesitan el código de 6 caracteres',
  },
  {
    icon: TrendingUp,
    tone: 'high',
    title: 'Descubre el mejor horario',
    description: 'Heatmap de colores y ranking top 3 con los bloques de mayor disponibilidad',
  },
];

/**
 * Página `/` (RC-015, HU-13): landing pública. Se registra fuera de
 * `Q5ProtectedRoute` (`homePublicRoutes`) — es la única ruta de `home` que no
 * exige sesión.
 *
 * Con `idle`/`loading` no se redirige ni se pinta la landing: Firebase
 * todavía no resolvió la sesión, y decidir ahí manda al ayudante que recarga
 * la página a la pantalla equivocada — el mismo error que evita
 * `Q5ProtectedRoute` con sus tres estados.
 */
export function PaLanding() {
  const status = useAuthStore((s) => s.status);

  if (status === AuthStatus.Idle || status === AuthStatus.Loading) {
    return (
      <main className="mc-landing mc-landing--centered">
        <Q1LoadingSpinner size="lg" label="Cargando MatchClass…" />
      </main>
    );
  }

  if (status === AuthStatus.Authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="mc-landing">
      <div className="mc-landing__page">
        <section className="mc-landing__hero">
          <div className="mc-landing__logo" aria-hidden="true">
            MC
          </div>

          <div className="mc-landing__hero-text">
            <h1 className="mc-landing__title">MatchClass</h1>
            <p className="mc-landing__tagline">Coordinación de ayudantías sin fricción</p>
          </div>

          <Q4LandingCodeForm />
        </section>

        <div className="mc-landing__divider" aria-hidden="true" />

        <section className="mc-landing__how">
          <h2 className="mc-landing__how-title">Cómo funciona</h2>

          <div className="mc-landing__cards">
            {FEATURES.map((feature) => (
              <Q2LandingFeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <div className="mc-landing__divider" aria-hidden="true" />

        <footer className="mc-landing__footer">
          <span className="mc-landing__footer-text">¿Eres ayudante?</span>
          <Link to="/acceso" className="mc-landing__footer-link">
            Inicia sesión
          </Link>
        </footer>
      </div>
    </main>
  );
}
