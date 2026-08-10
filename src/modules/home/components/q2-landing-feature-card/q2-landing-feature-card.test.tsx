import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarPlus } from 'lucide-react';
import { Q2LandingFeatureCard } from './q2-landing-feature-card';

describe('Q2LandingFeatureCard', () => {
  it('renderiza ícono, título y descripción recibidos por props', () => {
    const { container } = render(
      <Q2LandingFeatureCard
        icon={CalendarPlus}
        title="Crea una sala"
        description="El ayudante crea la sala en segundos"
        tone="secondary"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Crea una sala' })).toBeInTheDocument();
    expect(screen.getByText('El ayudante crea la sala en segundos')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('el `tone` elige la clase del cuadro del ícono, sin color hardcodeado', () => {
    const { container } = render(
      <Q2LandingFeatureCard icon={CalendarPlus} title="T" description="D" tone="high" />,
    );

    expect(container.querySelector('.mc-landing-card__icon--high')).toBeInTheDocument();
    expect(container.querySelector('.mc-landing-card__icon--secondary')).toBeNull();
  });
});
