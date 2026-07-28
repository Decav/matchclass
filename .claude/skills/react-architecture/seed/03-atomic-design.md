# 03 — Atomic Design con prefijos q1–q5

## Filosofía

Atomic Design divide los componentes UI en 5 niveles de complejidad creciente. Esta arquitectura usa **prefijos numéricos q1–q5** para indicar el nivel de cada componente de forma explícita en el nombre de la carpeta y el archivo.

---

## Los 5 niveles

### q1 — Atoms (átomos)

**Descripción**: El bloque de construcción más pequeño. Sin lógica de negocio. Solo presentación pura.

**Reglas**:
- No conectan con stores ni queries
- Solo reciben props
- Usan componentes de PrimeReact directamente
- Son completamente reutilizables en cualquier contexto

**Ejemplos**: Button, Input, Badge, Spinner, Avatar, Tag, Checkbox

**PrimeReact mapping**: `Button`, `InputText`, `Badge`, `ProgressSpinner`

---

### q2 — Molecules (moléculas)

**Descripción**: Combinaciones de q1 atoms que forman unidades con propósito específico.

**Reglas**:
- Solo importan de q1
- Pueden tener estado local mínimo (hover, focus)
- No conectan con stores globales ni queries externas

**Ejemplos**: FormField (label + input + error), StatCard (icon + number + label), DataCard (imagen + título + descripción + badge)

**PrimeReact mapping**: `Card`, `Panel`, `Fieldset`

---

### q3 — Organisms (organismos)

**Descripción**: Sección completa de UI. Pueden importar de q1 y q2. Primera capa que puede conectar con stores o queries.

**Reglas**:
- Pueden usar hooks de TanStack Query
- Pueden conectar con stores Zustand
- Representan una sección funcional completa de la página

**Ejemplos**: Header (logo + nav + user menu), Sidebar, DataTable (tabla con paginación + filtros + acciones), ProductGrid

---

### q4 — Templates (plantillas)

**Descripción**: Estructura de página sin contenido concreto. Define el layout.

**Reglas**:
- Definen `slot` areas donde van los organismos
- Sin lógica de negocio
- Reutilizables entre páginas similares

**Ejemplos**: PageLayout (header + sidebar + main + footer), DashboardLayout, AuthLayout, ModalLayout

---

### q5 — Pages / Features

**Descripción**: La página completa. Orquesta todo: templates, organismos, stores, queries, routing.

**Reglas**:
- Son el punto de entrada de un módulo
- Conectan el router con la UI
- Coordinan múltiples organismos
- Implementan la lógica de negocio de la feature completa

**Ejemplos**: ProductsPage, UserProfilePage, DashboardPage, LoginPage

---

## Naming Convention

```
q{nivel}-{nombre-en-kebab-case}
```

### Ejemplos:
- `q1-button`
- `q1-spinner`
- `q2-form-field`
- `q2-stat-card`
- `q3-data-table`
- `q3-app-header`
- `q4-dashboard-layout`
- `q4-auth-layout`
- `q5-products-page`
- `q5-user-profile-page`

---

## Estructura de carpeta

Cada componente tiene su propia carpeta con 4 archivos:

```
q1-button/
  q1-button.tsx          ← implementación del componente
  q1-button.test.tsx     ← tests con Vitest + Testing Library
  q1-button.stories.tsx  ← historia de Storybook
  index.ts               ← re-export público
```

### `index.ts` siempre re-exporta:
```typescript
export { Q1Button } from './q1-button';
export type { Q1ButtonProps } from './q1-button';
```

---

## Ejemplo completo: q1-button

### `q1-button.tsx`

```typescript
import { Button } from 'primereact/button';
import type { ButtonProps } from 'primereact/button';

export interface Q1ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  className?: string;
}

const variantMap: Record<NonNullable<Q1ButtonProps['variant']>, ButtonProps['severity']> = {
  primary: undefined,
  secondary: 'secondary',
  danger: 'danger',
};

export function Q1Button({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  className,
}: Q1ButtonProps) {
  return (
    <Button
      label={label}
      onClick={onClick}
      severity={variantMap[variant]}
      disabled={disabled}
      loading={loading}
      icon={icon}
      className={className}
    />
  );
}
```

### `q1-button.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Q1Button } from './q1-button';

describe('Q1Button', () => {
  it('renders the label', () => {
    render(<Q1Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Q1Button label="Submit" onClick={handleClick} />);
    await userEvent.click(screen.getByText('Submit'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    render(<Q1Button label="Submit" onClick={handleClick} disabled />);
    await userEvent.click(screen.getByText('Submit'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### `q1-button.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Q1Button } from './q1-button';

const meta: Meta<typeof Q1Button> = {
  title: 'Atoms/Q1Button',
  component: Q1Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Q1Button>;

export const Primary: Story = {
  args: {
    label: 'Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Button',
    variant: 'secondary',
  },
};

export const Loading: Story = {
  args: {
    label: 'Loading...',
    loading: true,
  },
};
```

---

## Ejemplo completo: q2-data-card

### `q2-data-card.tsx`

```typescript
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

export interface Q2DataCardProps {
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
  metadata?: string;
  onSelect?: () => void;
}

const statusSeverityMap = {
  active: 'success' as const,
  inactive: 'danger' as const,
  pending: 'warning' as const,
};

export function Q2DataCard({
  title,
  description,
  status,
  metadata,
  onSelect,
}: Q2DataCardProps) {
  const header = (
    <div className="flex justify-between items-center p-3">
      <span className="font-semibold text-lg">{title}</span>
      <Tag value={status} severity={statusSeverityMap[status]} />
    </div>
  );

  return (
    <Card
      header={header}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onSelect}
    >
      <p className="text-gray-600">{description}</p>
      {metadata && (
        <p className="text-sm text-gray-400 mt-2">{metadata}</p>
      )}
    </Card>
  );
}
```

---

## Dónde viven los componentes

| Nivel | Carpeta | Importable desde |
|-------|---------|-----------------|
| q1–q2 compartidos | `src/global/components/` | cualquier capa |
| q3 compartidos | `src/global/components/` | cualquier capa |
| q4 layouts | `src/global/components/` | `modules/`, `app/` |
| q5 pages | `src/modules/{feature}/components/` | solo `app/router.tsx` |
| q1–q3 específicos del módulo | `src/modules/{feature}/components/` | solo ese módulo |
