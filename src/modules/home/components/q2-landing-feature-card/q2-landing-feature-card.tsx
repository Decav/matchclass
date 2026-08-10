import type { LucideIcon } from 'lucide-react';

/**
 * Token del ícono, al 10% de opacidad como fondo del cuadro (RC-015 §10):
 * `secondary` → indigo, `accent` → dorado, `high` → verde del heatmap. Se
 * nombra por el token y no por el color para que la card no conozca hex.
 */
export type Q2LandingFeatureCardTone = 'secondary' | 'accent' | 'high';

export interface Q2LandingFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: Q2LandingFeatureCardTone;
}

/** Una de las tres cards de "Cómo funciona" de la landing (RC-015, HU-13). */
export function Q2LandingFeatureCard({
  icon: Icon,
  title,
  description,
  tone,
}: Q2LandingFeatureCardProps) {
  return (
    <article className="mc-landing-card">
      <span className={`mc-landing-card__icon mc-landing-card__icon--${tone}`} aria-hidden="true">
        <Icon size={26} strokeWidth={2} />
      </span>

      <div className="mc-landing-card__text">
        <h3 className="mc-landing-card__title">{title}</h3>
        <p className="mc-landing-card__desc">{description}</p>
      </div>
    </article>
  );
}
