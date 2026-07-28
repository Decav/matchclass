# MatchClass Design System — Estándar de Diseño

**Versión:** 1.0
**Stack:** React 19 · PrimeReact 10.9.7 (preset Aura/Lara) · Tailwind CSS 4.2.2 · Inter + JetBrains Mono (Google Fonts) · Lucide Icons

**Identidad:** paleta híbrida *Academic Tech + Data Heat* — azul marino académico como base, índigo como acento interactivo, dorado como acento cálido de acción, y una escala de calor dedicada para la grilla de disponibilidad.

---

## 1. Introducción y Filosofía

El MatchClass Design System define el lenguaje visual unificado para todos los proyectos front-end de MatchClass. Su objetivo es garantizar consistencia visual, eficiencia de desarrollo y mantenibilidad a largo plazo.

### Principios

1. **Variables primero:** Todos los valores de diseño (colores, radios, sombras) viven como CSS custom properties en `theme.css`. Ningún valor se hardcodea en componentes.
2. **Dark mode nativo:** El sistema soporta dark mode desde el arranque mediante el atributo `data-theme="dark"` en `<html>`. No hay dos hojas de estilo separadas.
3. **PrimeReact + Tailwind, no uno u otro:** PrimeReact provee componentes complejos (DataTable, Dialog, Calendar). Tailwind provee utilidades de layout, spacing y flexbox. Las clases MatchClass (`mc-*`) puentes el gap.
4. **Accesibilidad obligatoria:** Todos los componentes deben cumplir WCAG AA (contraste mínimo 4.5:1 en texto, 3:1 en elementos UI). Los focus states son visibles y usan el color brand.
5. **Sin magic numbers:** Spacing, radios y z-index se toman de las variables `--mc-*`. Nada de `margin: 13px` hardcodeado.
6. **Consistencia mediante clases MatchClass:** Para patrones recurrentes (badges, KPI cards, sidebar items) se usan las clases utility del design system, no se reinventa cada vez.

---

## 2. Tokens de Diseño

### 2.1 Colores — Brand

| Variable CSS | Valor | Rol |
|---|---|---|
| `--mc-brand-primary` | `#1B2A4A` | Color principal — botones, headers, navegación, bloque de grilla ocupado |
| `--mc-brand-secondary` | `#4F46E5` | Acento secundario — links, info badges, elementos interactivos |
| `--mc-brand-accent` | `#E8A838` | Acento cálido — CTAs principales, highlights, badges destacados |
| `--mc-brand-accent-dark` | `#D97706` | Hover del acento, warning |
| `--mc-brand-gradient` | `linear-gradient(135deg, #1B2A4A, #4F46E5)` | Sidebar header, KPI card headers, topbar brand |
| `--mc-brand-gradient-accent` | `linear-gradient(135deg, #E8A838, #D97706)` | CTA principal, badges de destaque |

Los colores brand **no cambian** entre light y dark mode. El navy y el índigo funcionan como base en ambos temas; el dorado mantiene contraste suficiente sobre fondos claros y oscuros.

**Reparto de responsabilidades:** el navy (`primary`) es estructura y jerarquía; el índigo (`secondary`) es interacción y navegación; el dorado (`accent`) es la única llamada a la acción destacada por pantalla. No usar los tres con el mismo peso visual en un mismo bloque.

### 2.2 Colores — Neutrales

| Variable CSS | Valor | Uso |
|---|---|---|
| `--mc-neutral-50` | `#F8F9FA` | Fondos sutiles, hover de filas |
| `--mc-neutral-100` | `#E5E7EB` | Bordes, divisores |
| `--mc-neutral-300` | `#9CA3AF` | Texto deshabilitado, placeholders |
| `--mc-neutral-500` | `#6B7280` | Texto secundario, metadatos, bloques bloqueados |
| `--mc-neutral-600` | `#4B5563` | Texto corporal |
| `--mc-neutral-700` | `#374151` | Texto de alto contraste |
| `--mc-neutral-900` | `#1F2937` | Texto principal oscuro |

Los neutrales son la fuente de verdad; los tokens semánticos de texto y borde (§2.5, §2.6) los referencian.

### 2.3 Colores — Sidebar (siempre dark)

| Variable CSS | Valor | Uso |
|---|---|---|
| `--mc-sidebar-bg` | `#1B2A4A` | Fondo principal del sidebar |
| `--mc-sidebar-bg2` | `#22355C` | Secciones/grupos dentro del sidebar |
| `--mc-sidebar-bg3` | `#2B4272` | Hover secundario, separadores |
| `--mc-sidebar-text` | `#E8EDF5` | Texto de items activos |
| `--mc-sidebar-text-muted` | `#94A3B8` | Texto de items inactivos |
| `--mc-sidebar-active` | `rgba(232,168,56,0.18)` | Background del item activo (halo dorado) |
| `--mc-sidebar-hover` | `rgba(255,255,255,0.06)` | Hover sobre items |
| `--mc-sidebar-border` | `rgba(255,255,255,0.08)` | Separador entre sidebar y main |
| `--mc-sidebar-width` | `280px` | Ancho fijo del sidebar |

El sidebar reutiliza el navy brand como fondo: `--mc-sidebar-bg` y `--mc-brand-primary` son el mismo valor por diseño.

### 2.4 Colores — Surface y Card (adaptan en dark)

| Variable CSS | Light | Dark | Uso |
|---|---|---|---|
| `--mc-surface` | `#FAFAF8` | `#0F1729` | Fondo general de la app (`$bg-page`) |
| `--mc-surface-alt` | `#F9FAFB` | `#16223A` | Filas elevadas, cebrado de tabla (`$bg-elevated`) |
| `--mc-card` | `#FFFFFF` | `#1B2A4A` | Fondo de cards, dialogs, dropdowns (`$bg-card`) |
| `--mc-card-hover` | `#F8F9FA` | `#22355C` | Hover sobre cards y filas interactivas |
| `--mc-topbar-bg` | `#FFFFFF` | `#1B2A4A` | Fondo del topbar |

`--mc-surface` (`#FAFAF8`) es cálido a propósito: separa el lienzo de la app del blanco puro de las cards sin recurrir a un gris frío.

### 2.5 Colores — Texto (adaptan en dark)

| Variable CSS | Light | Dark | Uso |
|---|---|---|---|
| `--mc-text-primary` | `#1F2937` | `#F3F4F6` | Texto principal, títulos |
| `--mc-text-secondary` | `#6B7280` | `#9CA3AF` | Subtítulos, descripciones, metadatos |
| `--mc-text-tertiary` | `#9CA3AF` | `#6B7280` | Placeholders, texto de menor jerarquía (`$text-muted`) |
| `--mc-text-body` | `#4B5563` | `#D1D5DB` | Texto corporal de párrafos largos |
| `--mc-text-strong` | `#374151` | `#E5E7EB` | Texto de alto contraste dentro de cards |
| `--mc-text-disabled` | `#D1D5DB` | `#4B5563` | Elementos deshabilitados |
| `--mc-text-inverse` | `#FFFFFF` | `#FFFFFF` | Texto sobre fondos oscuros (navy, gradiente) |
| `--mc-text-on-brand` | `#FFFFFF` | `#FFFFFF` | Texto sobre `--mc-brand-primary` / gradiente |
| `--mc-text-on-accent` | `#1F2937` | `#1F2937` | Texto sobre dorado — **nunca blanco**, no pasa AA |

**Regla de contraste del acento:** `#E8A838` sobre blanco da ~2.0:1. El dorado es fondo de elementos, nunca color de texto sobre fondo claro. Para texto dorado sobre blanco usar `--mc-accent-text` (`#B45309`).

### 2.6 Colores — Bordes (adaptan en dark)

| Variable CSS | Light | Dark | Uso |
|---|---|---|---|
| `--mc-border` | `#E5E7EB` | `rgba(255,255,255,0.08)` | Bordes generales, separadores (`$border-default`) |
| `--mc-border-strong` | `#D1D5DB` | `rgba(255,255,255,0.14)` | Bordes de inputs, cards enfatizadas |
| `--mc-border-focus` | `#4F46E5` | `#A5B4FC` | Borde en estado focus |

El focus ring usa el índigo secundario, no el navy: sobre un botón navy el focus debe distinguirse del propio botón.

### 2.7 Colores — Semánticos

#### Success (Verde)
| Variable | Light | Dark |
|---|---|---|
| `--mc-success` | `#10B981` | `#34D399` |
| `--mc-success-bg` | `#ECFDF5` | `rgba(16,185,129,0.15)` |
| `--mc-success-border` | `#A7F3D0` | `rgba(16,185,129,0.3)` |
| `--mc-success-text` | `#065F46` | `#6EE7B7` |

#### Warning (Ámbar)
| Variable | Light | Dark |
|---|---|---|
| `--mc-warning` | `#D97706` | `#FBBF24` |
| `--mc-warning-bg` | `#FFFBEB` | `rgba(217,119,6,0.15)` |
| `--mc-warning-border` | `#FCD34D` | `rgba(217,119,6,0.3)` |
| `--mc-warning-text` | `#92400E` | `#FCD34D` |

#### Danger (Rojo)
| Variable | Light | Dark |
|---|---|---|
| `--mc-danger` | `#EF4444` | `#F87171` |
| `--mc-danger-bg` | `#FEF2F2` | `rgba(239,68,68,0.15)` |
| `--mc-danger-border` | `#FECACA` | `rgba(239,68,68,0.3)` |
| `--mc-danger-text` | `#991B1B` | `#FCA5A5` |

#### Info (Índigo)
| Variable | Light | Dark |
|---|---|---|
| `--mc-info` | `#4F46E5` | `#A5B4FC` |
| `--mc-info-bg` | `#EEF2FF` | `rgba(79,70,229,0.2)` |
| `--mc-info-border` | `#C7D2FE` | `rgba(79,70,229,0.35)` |
| `--mc-info-text` | `#3730A3` | `#C7D2FE` |

#### Accent (Dorado — brand)
| Variable | Light | Dark |
|---|---|---|
| `--mc-accent` | `#E8A838` | `#F2C14E` |
| `--mc-accent-bg` | `#FEF6E7` | `rgba(232,168,56,0.15)` |
| `--mc-accent-border` | `#F7D9A0` | `rgba(232,168,56,0.3)` |
| `--mc-accent-text` | `#B45309` | `#F5D08A` |

### 2.8 Colores — Mapa de Calor (Heatmap)

Escala dedicada a la grilla de disponibilidad. **No reutilizar los tokens semánticos** para el heatmap: un bloque naranja significa "10–39% de disponibilidad", no "advertencia".

| Variable CSS | Valor | Significado |
|---|---|---|
| `--mc-heatmap-high` | `#34D399` | ≥70% disponibilidad — verde esmeralda |
| `--mc-heatmap-medium` | `#FBBF24` | 40–69% disponibilidad — ámbar |
| `--mc-heatmap-low` | `#F97316` | 10–39% disponibilidad — naranja |
| `--mc-heatmap-conflict` | `#EF4444` | Superposición / conflicto — rojo |
| `--mc-heatmap-blocked` | `#6B7280` | Bloqueado por admin — gris |

**Accesibilidad:** el color por sí solo no comunica el nivel. Todo bloque del heatmap debe llevar además el porcentaje como texto (`--mc-font-mono`) o un `aria-label` descriptivo. Un usuario con deuteranopía no distingue `high` de `medium`.

### 2.9 Colores — Grilla de Bloques

| Variable CSS | Valor | Estado |
|---|---|---|
| `--mc-grid-resting` | `#FFFFFF` | Bloque libre / no tocado |
| `--mc-grid-occupied` | `#1B2A4A` | Bloque ocupado (con clase asignada) |
| `--mc-grid-disabled` | `#F3F4F6` | Bloque fuera de rango horario |

En dark mode: `--mc-grid-resting` → `#16223A`, `--mc-grid-occupied` mantiene `#1B2A4A` con borde `--mc-accent` para seguir siendo distinguible del fondo, y `--mc-grid-disabled` → `rgba(255,255,255,0.04)`.

### 2.10 Tipografía — Familias

| Variable | Valor | Uso |
|---|---|---|
| `--mc-font-sans` | `'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif` | Headings y body — todo el texto de UI |
| `--mc-font-mono` | `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace` | Datos numéricos, celdas de grilla, IDs, horarios, código |

**Regla:** todo dato numérico que se compara verticalmente (columnas de tabla, valores KPI, porcentajes del heatmap, horas de la grilla) usa `--mc-font-mono` con `font-variant-numeric: tabular-nums`. El texto narrativo nunca usa mono.

```css
/* theme.css */
:root {
  --mc-font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --mc-font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}

body {
  font-family: var(--mc-font-sans);
  font-feature-settings: 'cv11', 'ss01';  /* Inter: 'a' y '1' de una sola pierna */
}

.mc-numeric {
  font-family: var(--mc-font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
```

Carga de fuentes en `index.html` (subset latin, solo los pesos usados):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
/>
```

Registrar ambas familias en Tailwind 4 para poder usar `font-sans` / `font-mono`:

```css
/* src/styles/main.css */
@theme {
  --font-sans: var(--mc-font-sans);
  --font-mono: var(--mc-font-mono);
}
```

### 2.11 Escala Tipográfica

| Variable | Tamaño | px | Uso |
|---|---|---|---|
| `--mc-text-xs` | `0.75rem` | 12px | Badges, labels, notas pie |
| `--mc-text-sm` | `0.875rem` | 14px | Texto de UI, inputs, tabla cells |
| `--mc-text-base` | `1rem` | 16px | Texto de párrafos, body |
| `--mc-text-lg` | `1.125rem` | 18px | Subtítulos secundarios |
| `--mc-text-xl` | `1.25rem` | 20px | Títulos de sección, card titles |
| `--mc-text-2xl` | `1.5rem` | 24px | Títulos de página |
| `--mc-text-3xl` | `1.875rem` | 30px | KPI values, números grandes |
| `--mc-text-4xl` | `2.25rem` | 36px | Hero headings |

#### Font weights

| Variable | Valor | Uso |
|---|---|---|
| `--mc-font-light` | `300` | Texto decorativo, taglines |
| `--mc-font-normal` | `400` | Texto body, párrafos |
| `--mc-font-medium` | `500` | Labels, metadatos |
| `--mc-font-semibold` | `600` | Títulos, botones, headings |
| `--mc-font-bold` | `700` | Números KPI, títulos primarios |

#### Line heights

| Variable | Valor | Uso |
|---|---|---|
| `--mc-leading-tight` | `1.25` | Headings, títulos |
| `--mc-leading-snug` | `1.375` | Subtítulos |
| `--mc-leading-normal` | `1.5` | Texto de UI |
| `--mc-leading-relaxed` | `1.625` | Párrafos largos |

### 2.12 Escala de Espaciado

| Variable | Valor | Uso |
|---|---|---|
| `--mc-spacing-1` | `4px` | Gaps internos mínimos |
| `--mc-spacing-2` | `8px` | Gap entre icono y texto |
| `--mc-spacing-3` | `12px` | Padding de items compactos |
| `--mc-spacing-4` | `16px` | Padding estándar de componentes |
| `--mc-spacing-5` | `20px` | Padding de secciones |
| `--mc-spacing-6` | `24px` | Padding de página, gap de grid |
| `--mc-spacing-8` | `32px` | Separación entre secciones |
| `--mc-spacing-10` | `40px` | Margins grandes |
| `--mc-spacing-12` | `48px` | Secciones de formulario |
| `--mc-spacing-16` | `64px` | Empty states, heroes |

### 2.13 Border Radius

| Variable | Valor | Uso |
|---|---|---|
| `--mc-radius-xs` | `4px` | Badges pequeños, tags compactos |
| `--mc-radius-sm` | `6px` | Botones pequeños, chips |
| `--mc-radius` | `8px` | Inputs, botones, elementos estándar |
| `--mc-radius-md` | `12px` | Dropdowns, popovers, menús |
| `--mc-radius-lg` | `16px` | Cards, panels, contenedores |
| `--mc-radius-xl` | `24px` | Dialogs, modales |
| `--mc-radius-2xl` | `32px` | Secciones hero, banners |
| `--mc-radius-full` | `9999px` | Badges pill, avatares, toggle |

### 2.14 Sombras

| Variable | Valor | Uso |
|---|---|---|
| `--mc-shadow-sm` | `0 1px 3px rgba(0,0,0,.08)` | Cards en reposo, inputs |
| `--mc-shadow-md` | `0 4px 16px rgba(0,0,0,.10)` | Cards en hover, dropdowns |
| `--mc-shadow-lg` | `0 8px 32px rgba(0,0,0,.12)` | Dialogs, modales, drawers |
| `--mc-shadow-brand` | `0 4px 16px rgba(27,42,74,.25)` | Botón primario (navy) en hover |
| `--mc-shadow-accent` | `0 4px 16px rgba(232,168,56,.30)` | CTA dorado en hover |

### 2.15 Gradientes y Fondos Compuestos

| Variable | Valor | Uso |
|---|---|---|
| `--mc-hero-bg` | `linear-gradient(135deg, #0C1322 0%, #1B2A4A 55%, #16223A 100%)` | Fondo de landing y pantallas públicas |
| `--mc-gradient-text-on-dark` | `linear-gradient(90deg, #E8A838, #A5B4FC)` | Texto con degradado sobre fondos oscuros |

Sobre fondo navy, el degradado de marca (`navy → índigo`) es prácticamente invisible. En superficies oscuras se invierte a `dorado → índigo claro`.

### 2.16 Z-Index Layers

| Variable | Valor | Uso |
|---|---|---|
| `--mc-z-base` | `0` | Contenido estático |
| `--mc-z-dropdown` | `10` | Dropdowns inline |
| `--mc-z-sticky` | `20` | Headers sticky de tabla |
| `--mc-z-fixed` | `30` | Topbar fijo |
| `--mc-z-sidebar` | `50` | Sidebar de navegación |
| `--mc-z-overlay` | `100` | Overlays de fondo |
| `--mc-z-modal` | `200` | Dialogs, modales, drawers |
| `--mc-z-toast` | `300` | Notificaciones toast |
| `--mc-z-tooltip` | `400` | Tooltips (siempre encima de todo) |

---

## 3. Dark / Light Mode

### 3.1 Implementación via CSS Variables

El sistema usa CSS custom properties con el selector `[data-theme="dark"]` en el elemento `<html>`. Esto permite que todos los componentes, sin excepción, cambien de tema con un solo toggle.

```css
/* En theme.css */
:root {
  --mc-surface: #FAFAF8;
  --mc-text-primary: #1F2937;
}

[data-theme="dark"] {
  --mc-surface: #0F1729;
  --mc-text-primary: #F3F4F6;
}
```

**Activar dark mode:**
```ts
document.documentElement.setAttribute('data-theme', 'dark');
```

**Volver a light mode:**
```ts
document.documentElement.removeAttribute('data-theme');
```

### 3.2 Hook `useTheme`

Ubicación: `src/global/hooks/use-theme.ts`

```ts
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'matchclass-theme';

function getInitialTheme(): Theme {
  // Respeta preferencia del sistema si no hay nada guardado
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLight = () => setTheme('light');
  const setDark = () => setTheme('dark');

  return { theme, toggleTheme, setLight, setDark, isDark: theme === 'dark' };
}
```

### 3.3 ThemeProvider Pattern

Para que el tema esté disponible globalmente sin prop drilling, se usa un contexto.

```tsx
// src/global/providers/theme-provider.tsx
import { createContext, useContext } from 'react';
import { useTheme } from '../hooks/use-theme';

type ThemeContextType = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext debe usarse dentro de ThemeProvider');
  return ctx;
}
```

Agregar `ThemeProvider` en `app-providers.tsx`:

```tsx
// src/app/providers/app-providers.tsx
import { PrimeReactProvider } from 'primereact/api';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@global/providers/theme-provider';
import { queryClient } from '@library/query/query-client';
import { router } from '../router/app-router';

export function AppProviders() {
  return (
    <ThemeProvider>
      <PrimeReactProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
```

### 3.4 PrimeReact Dark Mode Integration

PrimeReact 10 con el preset Aura o Lara usa CSS variables del sistema. Al hacer override de `--p-surface-*`, `--surface-*`, y `--text-color` en `[data-theme="dark"]`, PrimeReact adopta automáticamente el dark theme.

Las variables clave que PrimeReact respeta (ya definidas en `theme.css`):

```css
[data-theme="dark"] {
  --surface-a: #1B2A4A;      /* fondo de componentes */
  --surface-b: #0F1729;      /* fondo de la página */
  --surface-c: rgba(255,255,255,0.06);  /* hover */
  --surface-e: #1B2A4A;      /* overlay */
  --text-color: #F3F4F6;     /* texto principal */
  --text-color-secondary: #9CA3AF;
  --surface-card: #1B2A4A;   /* fondo de card */
  --surface-border: rgba(255,255,255,0.08);
}
```

---

## 4. Responsive Design

### 4.1 Breakpoints (Tailwind 4)

| Breakpoint | Min-width | Uso típico |
|---|---|---|
| `sm` | `640px` | Teléfonos landscape |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Laptops pequeñas |
| `xl` | `1280px` | Desktops |
| `2xl` | `1536px` | Pantallas grandes |

### 4.2 Estrategia Mobile-First

Todos los estilos se escriben para mobile primero y se expanden con prefijos Tailwind:

```tsx
// Correcto: mobile-first
<div className="flex flex-col gap-4 lg:flex-row lg:gap-6">

// Incorrecto: desktop-first
<div className="flex-row gap-6 max-lg:flex-col max-lg:gap-4">
```

### 4.3 Sidebar Responsive

En pantallas menores a `lg` (1024px), el sidebar se oculta con `transform: translateX(-100%)` y se muestra con un overlay al activarlo.

```tsx
// src/global/components/q5-app-shell/q5-app-shell.tsx
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useThemeContext } from '@global/providers/theme-provider';

export function Q5AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mc-app-shell">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`mc-sidebar ${sidebarOpen ? 'mc-sidebar--open' : ''}`}>
        {/* contenido del sidebar */}
      </aside>

      {/* Main */}
      <main className="mc-main">
        <header className="mc-topbar">
          <button
            className="lg:hidden mc-btn mc-btn-ghost"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          {/* resto del topbar */}
        </header>

        <div className="mc-content">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### 4.4 Grid System

Se usa la combinación de Tailwind grid + PrimeFlex para layouts de página:

```tsx
// Grid de 4 columnas en desktop, 2 en tablet, 1 en mobile
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <div className="mc-kpi-card">...</div>
  <div className="mc-kpi-card">...</div>
  <div className="mc-kpi-card">...</div>
  <div className="mc-kpi-card">...</div>
</div>
```

---

## 5. Layout Architecture

### 5.1 AppShell Pattern

La arquitectura de layout de todos los proyectos MatchClass sigue el patrón AppShell:

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (280px, dark, fixed, z-50)                         │
│  ┌──────────┐  ┌────────────────────────────────────────┐  │
│  │  Logo    │  │  TOPBAR (64px, sticky, z-30)           │  │
│  │  ------- │  └────────────────────────────────────────┘  │
│  │  Nav     │  ┌────────────────────────────────────────┐  │
│  │  items   │  │  CONTENT AREA (flex-1, bg: --surface)  │  │
│  │  ...     │  │                                        │  │
│  │          │  │  <Outlet /> / {children}               │  │
│  │  ------- │  │                                        │  │
│  │  User    │  │                                        │  │
│  └──────────┘  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Implementación del Layout

```tsx
// src/global/components/q5-app-shell/q5-app-shell.tsx
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, BarChart3, Settings,
  Menu, Bell, Sun, Moon, LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useThemeContext } from '@global/providers/theme-provider';
import { useAuthStore } from '@global/store/auth.store';

interface NavItem {
  label: string;
  icon: LucideIcon;   // componente, no string
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Reportes', icon: BarChart3, to: '/reportes' },
  { label: 'Configuración', icon: Settings, to: '/configuracion' },
];

export function Q5AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useThemeContext();
  const { user, logout } = useAuthStore();

  return (
    <div className="mc-app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`mc-sidebar ${sidebarOpen ? 'mc-sidebar--open' : ''}`} aria-label="Navegación principal">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid var(--mc-sidebar-border)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--mc-brand-gradient)' }}
          >
            A
          </div>
          <span className="text-white font-semibold text-sm">MatchClass Platform</span>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `mc-sidebar-item ${isActive ? 'mc-sidebar-item--active' : ''}`
              }
            >
              <i className={`pi ${item.icon} mc-sidebar-item__icon`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4" style={{ borderTop: '1px solid var(--mc-sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--mc-brand-gradient)' }}
            >
              {user?.username?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs truncate" style={{ color: 'var(--mc-sidebar-text-muted)' }}>{user?.email}</p>
            </div>
            <button
              className="mc-btn mc-btn-ghost p-2"
              onClick={logout}
              title="Cerrar sesión"
              style={{ color: 'var(--mc-sidebar-text-muted)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="mc-main">
        {/* Topbar */}
        <header className="mc-topbar">
          <button
            className="lg:hidden mc-btn mc-btn-ghost -ml-2 mr-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1" />

          {/* Theme toggle */}
          <button
            className="mc-btn mc-btn-ghost"
            onClick={toggleTheme}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notificaciones */}
          <button className="mc-btn mc-btn-ghost" aria-label="Notificaciones">
            <Bell size={20} />
          </button>
        </header>

        {/* Contenido */}
        <div className="mc-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

### 5.3 Variantes de Layout

| Variante | Uso | Cómo |
|---|---|---|
| Con sidebar (default) | Apps autenticadas | `Q5AppShell` con sidebar visible |
| Sin sidebar (full-width) | Login, landing pública | `<main className="min-h-screen">` sin `mc-main` |
| Sidebar colapsado | Modo compacto | Añadir clase `mc-sidebar-collapsed` al sidebar |

---

## 6. Componentes PrimeReact con Estilo MatchClass

### 6.1 Configuración del Preset

PrimeReact 10 se inicializa en `app-providers.tsx`. El preset se puede configurar con valores de brand:

```tsx
import { PrimeReactProvider } from 'primereact/api';

// Los overrides de CSS variables en theme.css
// son suficientes para customizar el preset Aura/Lara.
// No se necesita pasar un objeto de theme en el Provider.
export function AppProviders() {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      {/* ... */}
    </PrimeReactProvider>
  );
}
```

Para un override profundo del preset (tokens JS-level), instalar `@primereact/themes` y usar `definePreset`:

```ts
// src/library/theme/mc-preset.ts
import { definePreset } from '@primereact/themes';
import Aura from '@primereact/themes/aura';

export const McPreset = definePreset(Aura, {
  semantic: {
    // Navy MatchClass — 500 es el brand primary
    primary: {
      50:  '#F2F5F9',
      100: '#DFE6F0',
      200: '#BCC9DE',
      300: '#8FA3C2',
      400: '#4E6B9B',
      500: '#1B2A4A',
      600: '#16233E',
      700: '#121D33',
      800: '#0D1626',
      900: '#090F1A',
      950: '#05080E',
    },
  },
});
```

Y usar en el provider:
```tsx
<PrimeReactProvider value={{ ripple: true, theme: { preset: McPreset } }}>
```

### 6.2 Button

```tsx
import { Button } from 'primereact/button';
import { Check, Trash2 } from 'lucide-react';

// Primario — gradiente brand (override via theme.css)
<Button label="Guardar" icon={<Check size={18} />} />

// Secundario — outline morado
<Button label="Cancelar" outlined severity="secondary" />

// Ghost / texto
<Button label="Ver más" text />

// Peligro
<Button label="Eliminar" severity="danger" icon={<Trash2 size={18} />} />

// Cargando
<Button label="Guardando..." loading={isPending} disabled={isPending} />

// Con clases MatchClass directas
<button className="mc-btn mc-btn-primary">
  <Check size={18} />
  Guardar
</button>
```

### 6.3 InputText

```tsx
import { InputText } from 'primereact/inputtext';
import { Search, AlertCircle } from 'lucide-react';

// Estándar
<InputText
  id="username"
  placeholder="Ingrese usuario"
  className="w-full"
  aria-label="Usuario"
/>

// Con icono izquierdo
<span className="p-input-icon-left w-full">
  <Search size={18} />
  <InputText placeholder="Buscar..." className="w-full" />
</span>

// Con error (clase p-invalid)
<InputText
  id="email"
  className={`w-full ${errors.email ? 'p-invalid' : ''}`}
  aria-describedby="email-error"
/>
{errors.email && (
  <small id="email-error" className="mc-form-error">
    <AlertCircle size={14} />
    {errors.email.message}
  </small>
)}
```

### 6.4 Dropdown y MultiSelect

```tsx
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';

const statusOptions = [
  { label: 'Activo', value: 'active' },
  { label: 'Inactivo', value: 'inactive' },
  { label: 'Pendiente', value: 'pending' },
];

// Dropdown simple
<Dropdown
  value={status}
  options={statusOptions}
  onChange={(e) => setStatus(e.value)}
  placeholder="Seleccionar estado"
  className="w-full"
/>

// MultiSelect con búsqueda
<MultiSelect
  value={selectedRoles}
  options={roleOptions}
  onChange={(e) => setSelectedRoles(e.value)}
  placeholder="Seleccionar roles"
  filter
  className="w-full"
  display="chip"
/>
```

### 6.5 DataTable

```tsx
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { Pencil, Trash2, Inbox } from 'lucide-react';

interface User { id: string; name: string; email: string; status: string; }

function Q4UsersTable({ data, isLoading }: { data?: User[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="mc-card">
        <div className="flex flex-col gap-3">
          <Skeleton height="3rem" borderRadius="8px" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height="3rem" borderRadius="8px" />
          ))}
        </div>
      </div>
    );
  }

  const statusBodyTemplate = (row: User) => {
    const variant = row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'neutral';
    return <span className={`mc-badge mc-badge-${variant}`}>{row.status}</span>;
  };

  const actionsBodyTemplate = (row: User) => (
    <div className="flex items-center gap-2">
      <button className="mc-btn mc-btn-ghost p-1" title="Editar">
        <Pencil size={16} />
      </button>
      <button className="mc-btn mc-btn-ghost p-1 text-red-500" title="Eliminar">
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="mc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <DataTable
        value={data}
        dataKey="id"
        stripedRows
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage={
          <div className="mc-empty-state">
            <Inbox size={28} className="mc-empty-state__icon" />
            <p className="mc-empty-state__title">Sin resultados</p>
            <p className="mc-empty-state__description">No se encontraron registros.</p>
          </div>
        }
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="status" header="Estado" body={statusBodyTemplate} />
        <Column header="Acciones" body={actionsBodyTemplate} style={{ width: '8rem' }} />
      </DataTable>
    </div>
  );
}
```

### 6.6 Dialog / Drawer

```tsx
import { Dialog } from 'primereact/dialog';
import { Sidebar } from 'primereact/sidebar';
import { Check } from 'lucide-react';

// Dialog (modal centrado)
<Dialog
  visible={visible}
  onHide={() => setVisible(false)}
  header="Crear usuario"
  style={{ width: '520px' }}
  modal
  draggable={false}
  resizable={false}
>
  <div className="flex flex-col gap-4 pt-2">
    <Q2InputField label="Nombre" id="name" />
    <Q2InputField label="Email" id="email" />
  </div>
  <div className="flex justify-end gap-3 mt-6">
    <button className="mc-btn mc-btn-ghost" onClick={() => setVisible(false)}>
      Cancelar
    </button>
    <button className="mc-btn mc-btn-primary">
      <Check size={18} />
      Guardar
    </button>
  </div>
</Dialog>

// Sidebar / Drawer (desde la derecha)
<Sidebar
  visible={drawerVisible}
  onHide={() => setDrawerVisible(false)}
  position="right"
  style={{ width: '480px' }}
  header="Editar usuario"
>
  <div className="flex flex-col gap-4">
    {/* Formulario */}
  </div>
</Sidebar>
```

### 6.7 Toast

```tsx
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

function MyComponent() {
  const toast = useRef<Toast>(null);

  const showSuccess = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Guardado',
      detail: 'El registro fue guardado correctamente.',
      life: 4000,
    });
  };

  const showError = () => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Ocurrió un error al guardar.',
      life: 6000,
    });
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <button className="mc-btn mc-btn-primary" onClick={showSuccess}>
        Guardar
      </button>
    </>
  );
}
```

Para uso global del Toast desde cualquier parte de la app, crear un `useToast` hook con un ref singleton registrado en el AppShell.

### 6.8 Badge / Tag

```tsx
import { Tag } from 'primereact/tag';

// Via PrimeReact Tag (override via theme.css)
<Tag severity="success" value="Activo" />
<Tag severity="warning" value="Pendiente" />
<Tag severity="danger" value="Inactivo" />
<Tag severity="info" value="En revisión" />

// Via clases MatchClass (más control visual)
<span className="mc-badge mc-badge-success">Activo</span>
<span className="mc-badge mc-badge-warning">Pendiente</span>
<span className="mc-badge mc-badge-danger">Rechazado</span>
<span className="mc-badge mc-badge-info">En revisión</span>
<span className="mc-badge mc-badge-accent">Nuevo</span>
```

### 6.9 Skeleton

Ver [11-http-error-handling.md](11-http-error-handling.md). Siempre usar `<Skeleton>` de PrimeReact en `isLoading`.

```tsx
import { Skeleton } from 'primereact/skeleton';

// Card skeleton
<div className="mc-card">
  <Skeleton height="1.5rem" width="60%" className="mb-3" />
  <Skeleton height="1rem" className="mb-2" />
  <Skeleton height="1rem" width="80%" />
</div>

// Lista skeleton
{Array.from({ length: 5 }).map((_, i) => (
  <Skeleton key={i} height="3.5rem" borderRadius="8px" />
))}

// KPI card skeleton
<div className="mc-kpi-card">
  <Skeleton height="3.5rem" style={{ borderRadius: '16px 16px 0 0' }} />
  <div className="p-5">
    <Skeleton height="2.5rem" width="40%" className="mb-2" />
    <Skeleton height="1rem" width="60%" />
  </div>
</div>
```

---

## 7. Atomic Design con PrimeReact

### 7.1 Átomos (q1) — Wrappers de PrimeReact

Los átomos envuelven componentes PrimeReact añadiendo las convenciones MatchClass: accesibilidad, tokens de diseño, props tipadas.

```tsx
// src/global/components/q1-button/q1-button.tsx
import { Button, type ButtonProps } from 'primereact/button';

type McButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Q1ButtonProps extends Omit<ButtonProps, 'severity'> {
  variant?: McButtonVariant;
}

const VARIANT_MAP: Record<McButtonVariant, Partial<ButtonProps>> = {
  primary:   { severity: undefined, outlined: false, text: false },
  secondary: { severity: 'secondary', outlined: true },
  ghost:     { severity: 'secondary', text: true },
  danger:    { severity: 'danger' },
};

export function Q1Button({ variant = 'primary', className = '', ...props }: Q1ButtonProps) {
  const variantProps = VARIANT_MAP[variant];
  return (
    <Button
      {...variantProps}
      {...props}
      className={`${className}`}
    />
  );
}
```

```tsx
// src/global/components/q1-status-badge/q1-status-badge.tsx
import type { LucideIcon } from 'lucide-react';

type StatusColor = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

interface Q1StatusBadgeProps {
  label: string;
  color: StatusColor;
  icon?: string;
}

export function Q1StatusBadge({ label, color, icon }: Q1StatusBadgeProps) {
  return (
    <span className={`mc-badge mc-badge-${color}`}>
      {icon && <i className={`pi ${icon}`} style={{ fontSize: '0.65rem' }} />}
      {label}
    </span>
  );
}
```

### 7.2 Moléculas (q2) — Combinaciones con propósito

```tsx
// src/global/components/q2-input-field/q2-input-field.tsx
import { forwardRef } from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';
import { AlertCircle } from 'lucide-react';

interface Q2InputFieldProps extends InputTextProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Q2InputField = forwardRef<HTMLInputElement, Q2InputFieldProps>(
  ({ label, error, hint, required, id, className = '', ...props }, ref) => {
    return (
      <div className="mc-form-group">
        <label htmlFor={id} className="mc-form-label">
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        <InputText
          ref={ref}
          id={id}
          className={`w-full ${error ? 'p-invalid' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {error && (
          <span id={`${id}-error`} className="mc-form-error" role="alert">
            <AlertCircle size={12} />
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${id}-hint`} className="mc-form-hint">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Q2InputField.displayName = 'Q2InputField';
```

```tsx
// src/global/components/q2-search-bar/q2-search-bar.tsx
import { useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Search } from 'lucide-react';

interface Q2SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function Q2SearchBar({ value, onChange, placeholder = 'Buscar...', onSearch }: Q2SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
    if (e.key === 'Escape') {
      onChange('');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="p-input-icon-left flex-1 max-w-xs">
      <Search size={18} style={{ color: 'var(--mc-text-tertiary)' }} />
      <InputText
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full"
        aria-label="Campo de búsqueda"
      />
    </div>
  );
}
```

### 7.3 Células (q3) — Estado local complejo

```tsx
// src/global/components/q3-stat-card/q3-stat-card.tsx
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';

interface Q3StatCardProps {
  title: string;
  value: string | number;
  icon?: string;
  delta?: number;        // porcentaje de cambio
  deltaLabel?: string;   // ej: "vs. mes anterior"
  footer?: React.ReactNode;
}

export function Q3StatCard({ title, value, icon, delta, deltaLabel, footer }: Q3StatCardProps) {
  const isPositiveDelta = delta !== undefined && delta >= 0;
  const deltaColor = isPositiveDelta ? 'success' : 'danger';
  const deltaIcon = isPositiveDelta ? 'pi-arrow-up' : 'pi-arrow-down';

  return (
    <div className="mc-kpi-card">
      <div className="mc-kpi-card__header">
        <span className="mc-kpi-card__header-title">{title}</span>
        {icon && <i className={`pi ${icon} mc-kpi-card__header-icon`} aria-hidden="true" />}
      </div>
      <div className="mc-kpi-card__body">
        <div className="mc-kpi-card__value">{value}</div>
        {delta !== undefined && (
          <div className={`mc-kpi-card__delta mc-kpi-card__delta--${isPositiveDelta ? 'up' : 'down'}`}>
            <i className={`pi ${deltaIcon}`} style={{ fontSize: '0.7rem' }} />
            <span>{Math.abs(delta)}%</span>
            {deltaLabel && (
              <span style={{ fontWeight: 400, color: 'var(--mc-text-tertiary)' }}>{deltaLabel}</span>
            )}
          </div>
        )}
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </div>
  );
}
```

### 7.4 Organismos (q4) — Lógica de negocio completa

Ver ejemplos en [04-patterns.md](04-patterns.md). Los organismos típicos del MatchClass Design System:

- `q4-login-form` — formulario de autenticación con RHF + Zod
- `q4-data-table` — tabla con búsqueda, filtros y paginación
- `q4-detail-form` — formulario de edición en drawer
- `q4-kanban-board` — tablero con drag & drop

```tsx
// src/modules/users/components/q4-users-list/q4-users-list.tsx
import { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { Plus, Users } from 'lucide-react';
import { Q2SearchBar } from '@global/components/q2-search-bar/q2-search-bar';
import { Q1StatusBadge } from '@global/components/q1-status-badge/q1-status-badge';
import { Q2Forbidden } from '@global/components/q2-forbidden/q2-forbidden';
import { useHttpError } from '@global/hooks/use-http-error';
import { useUsersQuery } from '../../core/hooks/use-users-query';
import type { User } from '@resources/entities/user.entity';

export function Q4UsersList() {
  const [search, setSearch] = useState('');
  const { data: users, isLoading, error } = useUsersQuery();
  const { isForbidden } = useHttpError(error);

  if (isLoading) {
    return (
      <div className="mc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-4 flex items-center gap-4" style={{ borderBottom: '1px solid var(--mc-border)' }}>
          <Skeleton height="2.5rem" width="300px" borderRadius="8px" />
          <Skeleton height="2.5rem" width="120px" borderRadius="8px" />
        </div>
        <div className="p-4 flex flex-col gap-2">
          <Skeleton height="3rem" borderRadius="8px" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="3rem" borderRadius="8px" />
          ))}
        </div>
      </div>
    );
  }

  if (isForbidden) return <Q2Forbidden />;

  const filtered = users?.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const statusTemplate = (row: User) => (
    <Q1StatusBadge
      label={row.status === 'active' ? 'Activo' : 'Inactivo'}
      color={row.status === 'active' ? 'success' : 'neutral'}
    />
  );

  return (
    <div className="mc-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        className="flex items-center justify-between gap-4 p-4"
        style={{ borderBottom: '1px solid var(--mc-border)' }}
      >
        <Q2SearchBar value={search} onChange={setSearch} placeholder="Buscar usuarios..." />
        <button className="mc-btn mc-btn-primary">
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      <DataTable
        value={filtered}
        dataKey="id"
        stripedRows
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        emptyMessage={
          <div className="mc-empty-state">
            <Users size={28} className="mc-empty-state__icon" />
            <p className="mc-empty-state__title">Sin usuarios</p>
            <p className="mc-empty-state__description">
              {search ? 'No se encontraron usuarios con esa búsqueda.' : 'Aún no hay usuarios registrados.'}
            </p>
          </div>
        }
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="status" header="Estado" body={statusTemplate} />
      </DataTable>
    </div>
  );
}
```

### 7.5 Templates (q4 con layout de página)

```tsx
// Patrón PageHeader + Contenido
export function Q4PageLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="mc-page-header">
          <h1 className="mc-page-header__title">{title}</h1>
          {subtitle && <p className="mc-page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
```

### 7.6 Páginas (pa) — Destino de rutas

```tsx
// src/modules/users/components/pa-users/pa-users.tsx
import { Q4UsersList } from '../q4-users-list/q4-users-list';

export function PaUsers() {
  return (
    <div className="flex flex-col gap-6 mc-animate-slide-up">
      <div className="mc-page-header">
        <h1 className="mc-page-header__title">Gestión de Usuarios</h1>
        <p className="mc-page-header__subtitle">Administra los usuarios del sistema</p>
      </div>
      <Q4UsersList />
    </div>
  );
}
```

---

## 8. Patrones de Diseño UI

### 8.1 KPI Cards con Gradiente

```tsx
// Dashboard con 4 KPI cards
function Q3DashboardKpis() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Q3StatCard
        title="Usuarios Activos"
        value="2,847"
        icon="pi-users"
        delta={12.5}
        deltaLabel="vs. mes anterior"
      />
      <Q3StatCard
        title="Solicitudes Hoy"
        value="184"
        icon="pi-inbox"
        delta={-3.2}
        deltaLabel="vs. ayer"
      />
      <Q3StatCard
        title="Tasa de Aprobación"
        value="94.8%"
        icon="pi-check-circle"
        delta={2.1}
        deltaLabel="vs. semana anterior"
      />
      <Q3StatCard
        title="Tiempo Promedio"
        value="1.4h"
        icon="pi-clock"
        delta={-8.0}
        deltaLabel="de procesamiento"
      />
    </div>
  );
}
```

### 8.2 Status Badges

```tsx
// Mapa de estado a color — define en un archivo de utilidades
const STATUS_MAP: Record<string, { label: string; color: StatusColor }> = {
  active:   { label: 'Activo',    color: 'success' },
  inactive: { label: 'Inactivo', color: 'neutral' },
  pending:  { label: 'Pendiente', color: 'warning' },
  rejected: { label: 'Rechazado', color: 'danger' },
  review:   { label: 'En revisión', color: 'info' },
  new:      { label: 'Nuevo', color: 'accent' },
};

// Uso en tabla
const statusTemplate = (row: { status: string }) => {
  const mapped = STATUS_MAP[row.status] ?? { label: row.status, color: 'neutral' as StatusColor };
  return <Q1StatusBadge label={mapped.label} color={mapped.color} />;
};
```

### 8.3 Tabla de Datos con Acciones

```tsx
// Columna de acciones con iconos
const actionsTemplate = (row: User) => (
  <div className="flex items-center gap-1">
    <button
      className="mc-btn mc-btn-ghost p-2"
      title="Ver detalle"
      aria-label={`Ver detalle de ${row.name}`}
    >
      <Eye size={16} style={{ color: 'var(--mc-text-secondary)' }} />
    </button>
    <button
      className="mc-btn mc-btn-ghost p-2"
      title="Editar"
      aria-label={`Editar ${row.name}`}
      onClick={() => onEdit(row)}
    >
      <Pencil size={16} style={{ color: 'var(--mc-brand-secondary)' }} />
    </button>
    <button
      className="mc-btn mc-btn-ghost p-2"
      title="Eliminar"
      aria-label={`Eliminar ${row.name}`}
      onClick={() => onDelete(row)}
    >
      <Trash2 size={16} style={{ color: 'var(--mc-danger)' }} />
    </button>
  </div>
);
```

### 8.4 Formularios en Drawer/Dialog

```tsx
// Patrón formulario en Sidebar (drawer desde la derecha)
function Q4EditUserDrawer({
  user,
  visible,
  onHide,
  onSuccess,
}: {
  user: User | null;
  visible: boolean;
  onHide: () => void;
  onSuccess: () => void;
}) {
  const { mutate: update, isPending } = useUpdateUserMutation({ onSuccess: () => { onSuccess(); onHide(); } });
  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user ?? { name: '', email: '', status: 'active' },
  });

  useEffect(() => { if (user) reset(user); }, [user, reset]);

  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      position="right"
      style={{ width: '480px' }}
      header={
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--mc-brand-gradient)' }}
          >
            <User size={16} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--mc-text-primary)' }}>
            {user ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
        </div>
      }
    >
      <form onSubmit={handleSubmit((data) => update({ id: user!.id, ...data }))} className="flex flex-col gap-4 h-full">
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Q2InputField
                {...field}
                id="name"
                label="Nombre completo"
                error={errors.name?.message}
                required
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Q2InputField
                {...field}
                id="email"
                label="Email"
                type="email"
                error={errors.email?.message}
                required
              />
            )}
          />
        </div>
        <div
          className="flex justify-end gap-3 pt-4"
          style={{ borderTop: '1px solid var(--mc-border)' }}
        >
          <button type="button" className="mc-btn mc-btn-ghost" onClick={onHide}>
            Cancelar
          </button>
          <button type="submit" className="mc-btn mc-btn-primary" disabled={isPending}>
            {isPending ? (
              <><Loader2 size={18} className="animate-spin" />Guardando...</>
            ) : (
              <><Check size={18} />Guardar</>
            )}
          </button>
        </div>
      </form>
    </Sidebar>
  );
}
```

### 8.5 Empty State

```tsx
// Reutilizable con variantes
interface Q2EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
}

export function Q2EmptyState({ icon = 'pi-inbox', title, description, action }: Q2EmptyStateProps) {
  return (
    <div className="mc-empty-state">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--mc-surface-alt)' }}
      >
        <i className={`pi ${icon}`} style={{ fontSize: '1.75rem', color: 'var(--mc-text-tertiary)' }} />
      </div>
      <p className="mc-empty-state__title">{title}</p>
      {description && <p className="mc-empty-state__description">{description}</p>}
      {action && (
        <button
          className="mc-btn mc-btn-primary mt-5"
          onClick={action.onClick}
        >
          {action.icon && <i className={`pi ${action.icon}`} />}
          {action.label}
        </button>
      )}
    </div>
  );
}
```

### 8.6 Estado de Error 403 — Forbidden

Ver [11-http-error-handling.md](11-http-error-handling.md).

```tsx
// src/global/components/q2-forbidden/q2-forbidden.tsx
import { Lock } from 'lucide-react';

export function Q2Forbidden() {
  return (
    <div className="mc-empty-state">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--mc-danger-bg)' }}
      >
        <Lock size={28} style={{ color: 'var(--mc-danger)' }} />
      </div>
      <p className="mc-empty-state__title" style={{ color: 'var(--mc-danger-text)' }}>
        Sin permisos
      </p>
      <p className="mc-empty-state__description">
        No tienes permisos para ver este contenido. Contacta al administrador si crees que es un error.
      </p>
    </div>
  );
}
```

### 8.7 Filtros + Búsqueda

```tsx
// Toolbar de filtros para tablas
function Q2FilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = search || Object.values(filters).some(Boolean);

  return (
    <div
      className="flex items-center gap-3 p-4 flex-wrap"
      style={{ borderBottom: '1px solid var(--mc-border)' }}
    >
      <Q2SearchBar value={search} onChange={onSearchChange} />

      <Dropdown
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(e) => onFiltersChange({ ...filters, status: e.value })}
        placeholder="Estado"
        className="w-40"
        showClear
      />

      <Dropdown
        value={filters.role}
        options={ROLE_OPTIONS}
        onChange={(e) => onFiltersChange({ ...filters, role: e.value })}
        placeholder="Rol"
        className="w-40"
        showClear
      />

      {hasActiveFilters && (
        <button className="mc-btn mc-btn-ghost text-sm" onClick={onReset}>
          <X size={12} />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
```

### 8.8 Skeleton en Carga

Ver [11-http-error-handling.md](11-http-error-handling.md) para la regla completa. Patrones clave:

```tsx
// Page skeleton — emula estructura de la página
if (isLoading) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton height="2rem" width="200px" className="mb-2" />
          <Skeleton height="1rem" width="300px" />
        </div>
        <Skeleton height="2.5rem" width="140px" borderRadius="8px" />
      </div>
      {/* KPI grid */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mc-kpi-card">
            <Skeleton height="3.5rem" style={{ borderRadius: '16px 16px 0 0' }} />
            <div className="p-5">
              <Skeleton height="2.5rem" width="40%" className="mb-2" />
              <Skeleton height="1rem" width="60%" />
            </div>
          </div>
        ))}
      </div>
      {/* Tabla */}
      <div className="mc-card" style={{ padding: '16px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="3rem" className="mb-2" borderRadius="8px" />
        ))}
      </div>
    </div>
  );
}
```

### 8.9 Paginación

DataTable de PrimeReact incluye paginador. Configuración estándar MatchClass:

```tsx
<DataTable
  value={data}
  paginator
  rows={10}
  rowsPerPageOptions={[10, 25, 50]}
  paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
  currentPageReportTemplate="{first}-{last} de {totalRecords}"
  paginatorLeft={
    <span className="text-sm" style={{ color: 'var(--mc-text-secondary)' }}>
      {data?.length} registros
    </span>
  }
/>
```

Para paginación server-side:

```tsx
<DataTable
  value={data}
  lazy
  paginator
  first={first}
  rows={rows}
  totalRecords={totalRecords}
  onPage={(e) => { setFirst(e.first); setRows(e.rows); }}
  loading={isLoading}
/>
```

---

## 9. Iconografía

### Lucide — librería oficial de íconos

MatchClass usa **Lucide** (`lucide-react`), no PrimeIcons. Íconos lineales, trazo 2px, 22px por defecto.

```bash
npm install lucide-react
```

**Convención base:**

| Propiedad | Valor por defecto | Nota |
|---|---|---|
| `size` | `22` | 16 en celdas de tabla, 18 en botones, 22 en navegación, 28+ en empty states |
| `strokeWidth` | `2` | No cambiar: el trazo uniforme es lo que da coherencia al set |
| `color` | `currentColor` | Heredar del contenedor; nunca hardcodear hex en el ícono |

```tsx
import { Home, User, Search, X } from 'lucide-react';

// Decorativo — acompaña a un texto que ya comunica el significado
<Home size={22} aria-hidden="true" />

// En una celda de tabla
<Search size={16} />

// Con significado propio (sin texto): el aria-label va en el elemento interactivo
<button aria-label="Cerrar" onClick={onClose}>
  <X size={18} aria-hidden="true" />
</button>

// El color se hereda — no pasar hex al ícono
<span style={{ color: 'var(--mc-danger)' }}>
  <Trash2 size={16} />
</span>
```

**Wrapper `Q1Icon` (opcional pero recomendado)** — centraliza los defaults del design system:

```tsx
// src/global/components/q1-icon/q1-icon.tsx
import type { LucideIcon } from 'lucide-react';

type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<IconSize, number> = { sm: 16, md: 18, lg: 22, xl: 28 };

interface Q1IconProps {
  icon: LucideIcon;
  size?: IconSize;
  label?: string;        // si se pasa, el ícono es semántico; si no, decorativo
  className?: string;
}

export function Q1Icon({ icon: Icon, size = 'lg', label, className }: Q1IconProps) {
  return (
    <Icon
      size={SIZE_MAP[size]}
      strokeWidth={2}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
```

#### Íconos estándar MatchClass

| Contexto | Componente Lucide |
|---|---|
| Dashboard / inicio | `LayoutDashboard` |
| Cursos / clases | `GraduationCap` |
| Grilla de horarios | `CalendarDays` / `LayoutGrid` |
| Profesores | `Users` |
| Estudiante / perfil | `User` |
| Disponibilidad (heatmap) | `Flame` |
| Configuración | `Settings` |
| Búsqueda | `Search` |
| Agregar | `Plus` |
| Editar | `Pencil` |
| Eliminar | `Trash2` |
| Ver detalle | `Eye` |
| Guardar / confirmar | `Check` |
| Cancelar / cerrar | `X` |
| Éxito | `CheckCircle2` |
| Error | `AlertCircle` |
| Advertencia | `AlertTriangle` |
| Info | `Info` |
| Cerrar sesión | `LogOut` |
| Menú hamburguesa | `Menu` |
| Notificaciones | `Bell` |
| Filtros | `SlidersHorizontal` |
| Exportar | `Download` |
| Cargando | `Loader2` + `className="animate-spin"` |
| Bloqueado / sin permiso | `Lock` |
| Reportes | `BarChart3` |
| Sin resultados (empty) | `Inbox` |
| Tendencia positiva / negativa | `ArrowUp` / `ArrowDown` |
| Tema claro / oscuro | `Sun` / `Moon` |
| Enlace externo | `ExternalLink` |

#### Íconos dentro de PrimeReact

PrimeReact 10 acepta `ReactNode` en las props `icon` de `Button`, `Tag`, `Message` y similares, así que Lucide se integra sin adaptador:

```tsx
import { Button } from 'primereact/button';
import { Check } from 'lucide-react';

<Button label="Guardar" icon={<Check size={18} />} />
```

Para los íconos internos que PrimeReact renderiza por su cuenta (paginador del `DataTable`, flechas del `Dropdown`, cierre del `Dialog`) se usan las props de template — `pt` o los `*Icon` específicos del componente:

```tsx
import { ChevronDown, X } from 'lucide-react';

<Dropdown dropdownIcon={<ChevronDown size={16} />} /* ... */ />
<Dialog closeIcon={<X size={18} />} /* ... */ />
```

`primeicons` **no se instala ni se importa**. Si un componente de PrimeReact muestra un cuadro vacío donde iría su ícono nativo, es que falta pasarle el template Lucide — no se resuelve reinstalando PrimeIcons.

#### Cuándo NO usar Lucide

- Íconos de marca / logos de terceros: SVG propio o librería específica.
- Ilustraciones complejas y empty states ilustrados: SVG custom.
- El logo de MatchClass: componente SVG dedicado, no un ícono de la librería.

---

## 10. Animaciones y Transiciones

### 10.1 Transiciones Estándar

```css
/* Variables de transición */
--mc-transition-fast:  150ms ease;  /* hover estados, cambios de color */
--mc-transition:       200ms ease;  /* aparición de elementos, focus */
--mc-transition-slow:  300ms ease;  /* drawer, sidebar, dark mode */
```

**Regla:** No usar `transition: all`. Especificar siempre la propiedad:

```css
/* Correcto */
transition: background-color 200ms ease, border-color 200ms ease;

/* Incorrecto */
transition: all 200ms;
```

### 10.2 Clases de Animación de Entrada

```tsx
// fade in — para contenido que aparece
<div className="mc-animate-fade-in">...</div>

// slide up — para cards, páginas
<div className="mc-animate-slide-up">...</div>

// slide down — para dropdowns, notificaciones desde arriba
<div className="mc-animate-slide-down">...</div>

// slide in left — para contenido de sidebar
<div className="mc-animate-slide-in-left">...</div>

// scale in — para modales, tooltips
<div className="mc-animate-scale-in">...</div>
```

### 10.3 Micro-interacciones

```tsx
// Botón con feedback de loading
<button
  className="mc-btn mc-btn-primary"
  disabled={isPending}
  style={{ transition: 'opacity 150ms ease, box-shadow 150ms ease' }}
>
  {isPending ? (
    <><Loader2 size={18} className="animate-spin" />Procesando...</>
  ) : (
    <><Check size={18} />Guardar</>
  )}
</button>

// Card con hover lift
<div
  className="mc-card"
  style={{ transition: 'box-shadow 200ms ease, transform 200ms ease' }}
  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
>
  ...
</div>
```

### 10.4 Animaciones de Página

Envolver el contenido de `pa-*` con la clase de animación:

```tsx
export function PaDashboard() {
  return (
    <div className="flex flex-col gap-6 mc-animate-slide-up">
      {/* contenido */}
    </div>
  );
}
```

---

## 11. Accesibilidad

### 11.1 Contraste (WCAG AA mínimo)

| Combinación | Ratio | Estado |
|---|---|---|
| `#1B2A4A` (primary) sobre `#FFFFFF` | 14.2:1 | ✓ AAA |
| `#FFFFFF` sobre `#1B2A4A` | 14.2:1 | ✓ AAA — botón primario |
| `#4F46E5` (secondary) sobre `#FFFFFF` | 6.3:1 | ✓ AA |
| `#1F2937` (text-primary) sobre `#FAFAF8` | 14.2:1 | ✓ AAA |
| `#6B7280` (text-secondary) sobre `#FFFFFF` | 4.8:1 | ✓ AA |
| `#F3F4F6` sobre `#1B2A4A` | 12.8:1 | ✓ AAA (dark) |
| `#1F2937` sobre `#E8A838` (accent) | 7.1:1 | ✓ AAA — CTA dorado |
| ~~`#FFFFFF` sobre `#E8A838`~~ | 2.1:1 | ✗ **Prohibido** — texto blanco sobre dorado |
| ~~`#E8A838` sobre `#FFFFFF`~~ | 2.1:1 | ✗ **Prohibido** — dorado como color de texto |

**El dorado es fondo, nunca texto sobre claro.** Para texto en tono dorado usar `--mc-accent-text` (`#B45309`, 4.8:1 sobre blanco).

### 11.2 Focus States

Todo elemento interactivo debe mostrar un focus visible claro:

```css
/* Ya definido en theme.css */
:focus-visible {
  outline: 2px solid var(--mc-border-focus);  /* índigo #4F46E5 */
  outline-offset: 2px;
}
```

Se usa el índigo secundario y no el navy primary: sobre un botón navy un outline navy es invisible.

No remover `outline: none` en elementos interactivos sin proveer un reemplazo.

### 11.3 ARIA en Componentes

```tsx
// Botones solo con ícono → aria-label obligatorio
<button aria-label="Cerrar modal" onClick={onClose}>
  <X size={18} aria-hidden="true" />
</button>

// Errores de formulario → role="alert" o aria-live
<span role="alert" className="mc-form-error">
  {error}
</span>

// Íconos decorativos → aria-hidden="true"
<Check size={18} aria-hidden="true" />

// Loading state → aria-busy
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Skeleton height="3rem" /> : <Content />}
</div>

// Sidebar → aria-label
<aside aria-label="Navegación principal">...</aside>

// Tabla → caption o aria-label
<DataTable
  aria-label="Lista de usuarios"
  ...
/>
```

---

## 12. Checklist de Consistencia

Antes de hacer merge de un componente o página nueva, verificar:

### Tokens y Colores
- [ ] Todos los colores usan variables `--mc-*` (no hardcoded hex)
- [ ] Los textos usan `--mc-text-primary/secondary/tertiary`
- [ ] Los fondos usan `--mc-card` o `--mc-surface`
- [ ] Los bordes usan `--mc-border` o `--mc-border-strong`
- [ ] Los datos numéricos comparables (KPI, horas, porcentajes) usan `--mc-font-mono` + `tabular-nums`
- [ ] El heatmap usa `--mc-heatmap-*` y **no** los tokens semánticos (`--mc-success`, `--mc-warning`…)
- [ ] Ningún texto va en `#E8A838` sobre fondo claro (usar `--mc-accent-text`)

### Dark Mode
- [ ] Verificar visualmente el componente en dark mode
- [ ] Los backgrounds no están hardcodeados como `#FFFFFF` o `#FAFAF8`
- [ ] Los textos no están hardcodeados como `#000000` o `#1F2937`
- [ ] Los bordes no están hardcodeados

### Spacing y Layout
- [ ] El spacing usa clases Tailwind (`gap-4`, `p-6`) o variables `--mc-spacing-*`
- [ ] No hay valores de `margin` o `padding` hardcodeados en px
- [ ] El layout es responsive: funciona en mobile (< 640px) y desktop

### Accesibilidad
- [ ] Todos los botones sin texto tienen `aria-label`
- [ ] Los íconos decorativos tienen `aria-hidden="true"`
- [ ] Todo bloque del heatmap comunica su nivel con texto o `aria-label`, no solo con color
- [ ] Los errores de formulario tienen `role="alert"` o `aria-describedby`
- [ ] El focus visible es visible sobre el elemento

### Componentes PrimeReact
- [ ] Los estados de carga usan `<Skeleton>` de PrimeReact (no spinners custom)
- [ ] Los errores 403 usan `<Q2Forbidden />` (no redirección)
- [ ] Los botones usan `Q1Button` o `Button` de PrimeReact (no `<button>` HTML puro)
- [ ] Los íconos vienen de `lucide-react` con `strokeWidth={2}` (no PrimeIcons, no SVG suelto)

### Patrones de Código
- [ ] El componente tiene export nombrado (no default)
- [ ] El nombre sigue el patrón `{nivel}-{nombre}.tsx` → `export function {Nivel}{Nombre}`
- [ ] Existe un `index.ts` barrel en la carpeta del componente
- [ ] Los tests existen (`*.test.tsx`) para componentes q1-q4
- [ ] Storybook story existe (`*.stories.tsx`) para componentes q1-q3

### Animaciones
- [ ] Las páginas (`pa-*`) tienen clase `mc-animate-slide-up` en el wrapper raíz
- [ ] Los modales/drawers tienen `mc-animate-scale-in` o `mc-animate-slide-in-left`
- [ ] Las transiciones especifican la propiedad (no `transition: all`)

---

## 13. AppShell Pattern (Q3AppShell) — Layout Estándar MatchClass

`Q3AppShell` es el componente de layout estándar para todas las apps autenticadas MatchClass. Provee sidebar dark fijo en desktop (280px), hamburger con overlay en mobile, topbar, y un `<Outlet>` de React Router para el contenido de cada ruta.

### 13.1 Interfaces

```typescript
// src/global/components/q3-app-shell/q3-app-shell.tsx
export interface NavItem {
  path: string;   // ruta exacta, ej: '/apps'
  icon: LucideIcon;   // componente Lucide, ej: LayoutGrid
  label: string;  // texto del nav item, ej: 'Aplicaciones'
}

interface Props {
  appName: string;          // nombre de la app mostrado en el header del sidebar
  navItems: NavItem[];      // items de navegación
  topbarTitle?: string;     // título del topbar; default: label del item activo o 'MatchClass'
  topbarActions?: ReactNode; // slot para botones adicionales en el topbar
}
```

### 13.2 Implementación completa

```tsx
// src/global/components/q3-app-shell/q3-app-shell.tsx
import { type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '@global/store/auth.store';
import { useUiStore } from '@global/store/ui.store';
import { useLogoutMutation } from '@modules/authentication/core';

export interface NavItem {
  path: string;
  icon: string;
  label: string;
}

interface Props {
  appName: string;
  navItems: NavItem[];
  topbarTitle?: string;
  topbarActions?: ReactNode;
}

export function Q3AppShell({ appName, navItems, topbarTitle, topbarActions }: Props) {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const location = useLocation();
  const activeNavItem = navItems.find((item) => item.path === location.pathname);
  const pageTitle = topbarTitle ?? activeNavItem?.label ?? 'MatchClass';

  const avatarInitials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className="mc-app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`mc-sidebar${sidebarOpen ? '' : ' mc-sidebar-collapsed'} lg:!transform-none`}
        data-testid="sidebar"
      >
        {/* Sidebar header con gradiente brand */}
        <div className="mc-gradient flex items-center gap-3 px-5 py-5 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/60 text-xs font-medium leading-none mb-0.5">MatchClass</p>
            <p className="text-white text-sm font-bold leading-none truncate">{appName}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mc-sidebar-item${isActive ? ' mc-sidebar-item--active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`${item.icon} mc-sidebar-item__icon`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User panel */}
        <div
          className="flex-shrink-0 border-t px-4 py-4"
          style={{ borderColor: 'var(--mc-sidebar-border)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mc-gradient"
            >
              {avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--mc-sidebar-text)' }}
              >
                {user?.name ?? 'Usuario'}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: 'var(--mc-sidebar-text-muted)' }}
              >
                {user?.email ?? ''}
              </p>
            </div>
          </div>
          <button
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
            style={{
              color: 'var(--mc-sidebar-text-muted)',
              backgroundColor: 'transparent',
              border: '1px solid var(--mc-sidebar-border)',
            }}
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            <LogOut size={16} />
            {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className={`mc-main${sidebarOpen ? '' : ' mc-main-full'} lg:!ml-[var(--mc-sidebar-width)]`}
      >
        {/* Topbar */}
        <header className="mc-topbar">
          <button
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            data-testid="hamburger-button"
          >
            <Menu size={22} style={{ color: 'var(--mc-text-secondary)' }} />
          </button>
          <h1
            className="text-base font-semibold flex-1"
            style={{ color: 'var(--mc-text-primary)' }}
          >
            {pageTitle}
          </h1>
          {topbarActions && (
            <div className="flex items-center gap-2">{topbarActions}</div>
          )}
        </header>

        {/* Content */}
        <main className="mc-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

### 13.3 Registrar rutas con AppShell en el router

```typescript
// src/app/router/app-router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Q5ProtectedRoute } from '@global/components/q5-protected-route/q5-protected-route';
import { Q3AppShell } from '@global/components/q3-app-shell/q3-app-shell';
import type { NavItem } from '@global/components/q3-app-shell/q3-app-shell';
import { LayoutGrid, Users, BarChart3 } from 'lucide-react';
import { authenticationRoutes } from '@modules/authentication';
import { homeRoutes } from '@modules/home';

const NAV_ITEMS: NavItem[] = [
  { path: '/apps', icon: LayoutGrid, label: 'Aplicaciones' },
  // Agregar nuevos items aquí:
  // { path: '/users', icon: Users, label: 'Usuarios' },
];

export const router = createBrowserRouter([
  ...authenticationRoutes,
  {
    element: <Q5ProtectedRoute />,
    children: [
      {
        element: <Q3AppShell appName="Mi App" navItems={NAV_ITEMS} />,
        children: [
          // Aquí van las rutas que se renderizan dentro del AppShell
          ...homeRoutes.filter((r) => r.path === '/apps'),
        ],
      },
    ],
  },
  homeRoutes.find((r) => r.path === '/')!,
]);
```

### 13.4 Agregar un nuevo nav item

1. Agregar la ruta al módulo correspondiente (`src/modules/{mod}/routes/{mod}.routes.tsx`)
2. Registrar en `app-router.tsx` dentro del `children` del `Q3AppShell`
3. Agregar el item al array `NAV_ITEMS`:

```typescript
const NAV_ITEMS: NavItem[] = [
  { path: '/apps',  icon: LayoutGrid, label: 'Aplicaciones' },
  { path: '/users', icon: Users,    label: 'Usuarios' },       // nuevo
  { path: '/reports', icon: BarChart3, label: 'Reportes' },    // nuevo
];
```

### 13.5 Dependencias del AppShell

`Q3AppShell` depende de dos stores en `src/global/`:

- `useUiStore` — controla `sidebarOpen` / `setSidebarOpen`
- `useAuthStore` — provee datos del usuario autenticado (`user.name`, `user.email`)
- `useLogoutMutation` — de `@modules/authentication/core` (hook del modulo de autenticacion)

---

## 14. PrimeReact Setup — Sin tema CSS externo

### 14.1 Orden correcto de imports en main.tsx

```typescript
// src/app/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './providers/app-providers';

// ORDEN CRITICO DE IMPORTS:
import 'primereact/resources/primereact.min.css';  // base de PrimeReact (sin tema)
import '@/styles/theme.css';                       // overrides MatchClass (sobreescribe variables PrimeReact)
import '@/styles/main.css';                        // Tailwind + imports

// NO importar ningun archivo de tema de PrimeReact:
// ❌ import 'primereact/resources/themes/lara-light-indigo/theme.css';
// ❌ import 'primereact/resources/themes/aura-light-blue/theme.css';
// El archivo theme.css del seed reemplaza completamente el rol de estos archivos.

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
);
```

### 14.2 Por qué NO importar el tema CSS de PrimeReact

`theme.css` del seed ya contiene todos los overrides de las variables CSS que PrimeReact expone:

```css
/* Variables que theme.css sobreescribe (extracto) */
--p-primary-color: #1B2A4A;
--p-primary-contrast-color: #ffffff;
--p-focus-ring-color: rgba(79, 70, 229, 0.3);
--p-surface-0: var(--mc-card);
--p-surface-ground: var(--mc-surface);
--p-text-color: var(--mc-text-primary);
--p-text-muted-color: var(--mc-text-secondary);
```

Importar un tema CSS de PrimeReact encima de `theme.css` sobrescribiría los colores brand y romperia el dark mode MatchClass.

### 14.3 Configuracion de AppProviders

```tsx
// src/app/providers/app-providers.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { PrimeReactProvider } from 'primereact/api';
import { ThemeProvider } from '@global/providers/theme-provider';
import { queryClient } from '@library/query/query-client';
import { router } from '../router/app-router';

export function AppProviders() {
  return (
    <ThemeProvider>
      <PrimeReactProvider value={{ ripple: true }}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
```

`PrimeReactProvider` recibe solo `{ ripple: true }`. No se pasa ningun objeto `theme` porque los overrides se hacen via CSS en `theme.css`.

---

## 15. App Launcher Page Pattern (PaApps + Q3AppCard)

### 15.1 Interfaz PortalApp

```typescript
// Definida en q3-app-card.tsx y re-exportada via index.ts
export type AppStatus = 'active' | 'coming-soon' | 'maintenance';

export interface PortalApp {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;        // componente Lucide, ej: LayoutGrid
  status: AppStatus;
  url?: string;        // URL externa; si undefined y status='active', onClick es requerido
}
```

### 15.2 Mapa de status a badge

```typescript
const statusBadge: Record<AppStatus, { label: string; status: 'success' | 'warning' | 'danger' }> = {
  active:       { label: 'Activo',        status: 'success' },
  'coming-soon': { label: 'Próximamente', status: 'warning' },
  maintenance:  { label: 'Mantenimiento', status: 'danger'  },
};
```

### 15.3 Grid responsivo

```tsx
// src/modules/home/components/pa-apps/pa-apps.tsx
import { Users, ShieldCheck } from 'lucide-react';
import { Q3AppCard } from '../q3-app-card/q3-app-card';
import type { PortalApp } from '../q3-app-card/q3-app-card';

const PORTAL_APPS: PortalApp[] = [
  {
    id: 'bench-manager',
    name: 'Bench Manager',
    description: 'Gestión de profesionales disponibles y matching con ofertas.',
    icon: Users,
    status: 'active',
    url: 'http://localhost:5174',
  },
  {
    id: 'portal-admin',
    name: 'Portal Admin',
    description: 'Administración de usuarios, roles y permisos.',
    icon: ShieldCheck,
    status: 'coming-soon',
  },
];

export function PaApps() {
  return (
    <div>
      <div className="mc-page-header">
        <h1 className="mc-page-header__title">Aplicaciones</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--mc-text-secondary)' }}>
          Selecciona una aplicación del ecosistema MatchClass
        </p>
      </div>
      {/* Grid: 1 col mobile → 2 cols sm → 3 cols lg → 4 cols xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PORTAL_APPS.map((app) => (
          <Q3AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  );
}
```

### 15.4 Agregar una nueva app al launcher

1. Agregar un objeto `PortalApp` al array `PORTAL_APPS` en `pa-apps.tsx`
2. Si la app es `active` y tiene URL externa, poner `url: 'http://...'` — el card la abre en nueva pestaña
3. Si la app todavia no existe, usar `status: 'coming-soon'` — el boton Abrir queda deshabilitado
4. Para una app en mantenimiento temporal: `status: 'maintenance'`

---

## 16. Landing Page Pattern (PaLanding)

### 16.1 Logica de autenticacion

`PaLanding` es la ruta `/` publica. Verifica si hay sesion activa al montar:

- Si hay sesion (`isSuccess`) → redirige automaticamente a `/apps`
- Si no hay sesion (`isError`) → muestra el hero con boton de login
- Mientras verifica (`isPending`) → muestra spinner centrado

```typescript
// Flujo de autenticacion en PaLanding
const { isPending, isSuccess, isError } = useAuthValidateQuery();

useEffect(() => {
  if (isSuccess) void navigate('/apps');
}, [isSuccess, navigate]);
```

La query se resetea al montar para forzar una verificacion fresca (limpia cache anterior):

```typescript
useMemo(() => {
  queryClient.resetQueries({ queryKey: queryKeys.auth.validate });
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### 16.2 Implementacion completa

```tsx
// src/modules/home/components/pa-landing/pa-landing.tsx
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Q1LoadingSpinner } from '@global/components/q1-loading-spinner/q1-loading-spinner';
import { useAuthValidateQuery } from '@global/hooks/use-auth-validate-query';
import { queryKeys } from '@library/query/query-keys';

export function PaLanding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useMemo(() => {
    queryClient.resetQueries({ queryKey: queryKeys.auth.validate });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { isPending, isSuccess, isError } = useAuthValidateQuery();

  useEffect(() => {
    if (isSuccess) void navigate('/apps');
  }, [isSuccess, navigate]);

  if (isPending)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Q1LoadingSpinner size="lg" label="Verificando sesión..." />
      </div>
    );

  if (isSuccess) return null;

  void isError;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: 'linear-gradient(135deg, #0C1322 0%, #1B2A4A 40%, #16223A 100%)' }}
    >
      {/* Logo con gradiente brand */}
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 mc-gradient">
        <GraduationCap size={40} className="text-white" />
      </div>

      {/* Hero text — sobre fondo navy el degradado va de dorado a índigo claro */}
      <h1 className="text-5xl font-black text-white text-center mb-4 tracking-tight">
        Match{' '}
        <span
          style={{
            background: 'linear-gradient(90deg, #E8A838, #A5B4FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Class
        </span>
      </h1>
      <p className="text-lg text-center max-w-md mb-10" style={{ color: '#94A3B8' }}>
        Coordinación de horarios y disponibilidad docente, en una sola grilla.
      </p>

      {/* CTA principal — dorado, texto oscuro (blanco sobre dorado no pasa AA) */}
      <button
        onClick={() => void navigate('/login')}
        className="px-8 py-4 rounded-xl font-bold text-base inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
        style={{
          background: 'var(--mc-brand-gradient-accent)',
          color: 'var(--mc-text-on-accent)',
          boxShadow: 'var(--mc-shadow-accent)',
        }}
      >
        Iniciar sesión
        <ArrowRight size={18} />
      </button>

      <p className="text-xs mt-12" style={{ color: '#6B7280' }}>MatchClass</p>
    </main>
  );
}
```

**Nota sobre el degradado del hero:** sobre el fondo navy, un texto en `linear-gradient(#1B2A4A, #4F46E5)` sería casi invisible. En superficies oscuras el degradado de marca se invierte: dorado (`#E8A838`) → índigo claro (`#A5B4FC`).

### 16.3 Customizar para una app especifica

Para adaptar el landing a otra app del ecosistema, cambiar:

1. El texto del hero (`MatchClass` → nombre de la app)
2. La descripcion (`Coordinación de horarios...` → descripcion de la app)
3. El fondo (el gradiente dark puede mantenerse o adaptarse)
4. El logo (`GraduationCap` puede reemplazarse por un SVG propio de marca)

Los colores brand (`#1B2A4A`, `#4F46E5`, `#E8A838`) y los gradientes **no cambian** — son parte de la identidad MatchClass.

---

## 17. Grilla de Disponibilidad y Heatmap

El componente central del producto. Esta sección fija las reglas visuales; la lógica de dominio vive en su módulo.

### 17.1 Reglas

1. **Los tokens del heatmap no son tokens semánticos.** `--mc-heatmap-medium` es ámbar porque representa 40–69% de disponibilidad, no porque sea una advertencia. Nunca intercambiar `--mc-heatmap-*` con `--mc-warning` / `--mc-success`.
2. **El color nunca es el único canal.** Cada celda lleva el dato como texto (en `--mc-font-mono`) o un `aria-label` explícito. Con deuteranopía, `high` y `medium` son indistinguibles.
3. **Los estados de bloque y los del heatmap son ejes distintos.** `--mc-grid-*` describe si el bloque está libre / ocupado / fuera de rango; `--mc-heatmap-*` describe cuánta disponibilidad hay. Un bloque puede estar `occupied` y tener heatmap `low`.
4. **Las horas y los porcentajes siempre en mono con `tabular-nums`.** Sin eso las columnas no se alinean y la grilla se lee mal.

### 17.2 Escala de intensidad

```ts
// src/modules/schedule/core/utils/heatmap-level.ts
export const HeatmapLevel = {
  High:     'high',
  Medium:   'medium',
  Low:      'low',
  Conflict: 'conflict',
  Blocked:  'blocked',
} as const;
export type HeatmapLevel = typeof HeatmapLevel[keyof typeof HeatmapLevel];

const LEVEL_LABEL: Record<HeatmapLevel, string> = {
  high:     'Alta disponibilidad',
  medium:   'Disponibilidad media',
  low:      'Baja disponibilidad',
  conflict: 'Conflicto de horario',
  blocked:  'Bloqueado por administración',
};

export function resolveHeatmapLevel(availability: number): HeatmapLevel {
  if (availability >= 70) return HeatmapLevel.High;
  if (availability >= 40) return HeatmapLevel.Medium;
  if (availability >= 10) return HeatmapLevel.Low;
  return HeatmapLevel.Low;
}

export function heatmapLabel(level: HeatmapLevel, availability: number): string {
  return `${LEVEL_LABEL[level]} — ${availability}%`;
}
```

`resolveHeatmapLevel` no devuelve `conflict` ni `blocked`: esos dos no se derivan del porcentaje, los determina el estado del bloque y se pasan explícitamente.

### 17.3 Celda del heatmap (q2)

```tsx
// src/global/components/q2-heatmap-cell/q2-heatmap-cell.tsx
import { HeatmapLevel, heatmapLabel } from '@modules/schedule/core/utils/heatmap-level';

interface Q2HeatmapCellProps {
  level: HeatmapLevel;
  availability: number;   // 0-100
  onSelect?: () => void;
}

export function Q2HeatmapCell({ level, availability, onSelect }: Q2HeatmapCellProps) {
  const label = heatmapLabel(level, availability);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      title={label}
      className={`mc-heatmap-cell mc-heatmap-cell--${level}`}
    >
      <span className="mc-numeric text-xs">{availability}%</span>
    </button>
  );
}
```

```css
/* theme.css */
.mc-heatmap-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.25rem;
  border: 1px solid var(--mc-border);
  border-radius: var(--mc-radius-xs);
  color: var(--mc-text-on-accent);          /* texto oscuro: legible sobre toda la escala */
  transition: outline-color 150ms ease, transform 150ms ease;
}
.mc-heatmap-cell:focus-visible { outline: 2px solid var(--mc-border-focus); outline-offset: 2px; }

.mc-heatmap-cell--high     { background: var(--mc-heatmap-high); }
.mc-heatmap-cell--medium   { background: var(--mc-heatmap-medium); }
.mc-heatmap-cell--low      { background: var(--mc-heatmap-low); }
.mc-heatmap-cell--conflict { background: var(--mc-heatmap-conflict); color: var(--mc-text-inverse); }
.mc-heatmap-cell--blocked  { background: var(--mc-heatmap-blocked); color: var(--mc-text-inverse); }
```

Los cinco fondos del heatmap son medios-claros salvo `conflict` y `blocked`; por eso el texto es oscuro (`--mc-text-on-accent`) en los tres primeros e invertido en los dos últimos.

### 17.4 Bloque de la grilla (q2)

```tsx
// src/global/components/q2-grid-block/q2-grid-block.tsx
type GridBlockState = 'resting' | 'occupied' | 'disabled';

interface Q2GridBlockProps {
  state: GridBlockState;
  time: string;            // '08:30'
  label?: string;          // 'Álgebra I — Sala 204'
  onClick?: () => void;
}

export function Q2GridBlock({ state, time, label, onClick }: Q2GridBlockProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'disabled'}
      className={`mc-grid-block mc-grid-block--${state}`}
      aria-label={label ? `${time} — ${label}` : `${time} — bloque libre`}
    >
      <span className="mc-numeric text-xs">{time}</span>
      {label && <span className="text-xs truncate">{label}</span>}
    </button>
  );
}
```

```css
.mc-grid-block {
  display: flex; flex-direction: column; gap: 2px;
  padding: var(--mc-spacing-2);
  text-align: left;
  border: 1px solid var(--mc-border);
  border-radius: var(--mc-radius-sm);
  background: var(--mc-grid-resting);
  color: var(--mc-text-secondary);
}
.mc-grid-block--occupied {
  background: var(--mc-grid-occupied);
  color: var(--mc-text-on-brand);
  border-color: var(--mc-grid-occupied);
}
.mc-grid-block--disabled {
  background: var(--mc-grid-disabled);
  color: var(--mc-text-disabled);
  cursor: not-allowed;
}

[data-theme="dark"] .mc-grid-block            { background: #16223A; }
[data-theme="dark"] .mc-grid-block--occupied  { border-color: var(--mc-accent); }
[data-theme="dark"] .mc-grid-block--disabled  { background: rgba(255,255,255,0.04); }
```

En dark mode `--mc-grid-occupied` (`#1B2A4A`) es casi el color del fondo; el borde dorado es lo que mantiene el bloque distinguible. No quitarlo.

### 17.5 Leyenda obligatoria

Toda vista que muestre el heatmap incluye su leyenda. Sin ella la escala de color no es interpretable:

```tsx
const LEGEND: Array<{ level: HeatmapLevel; label: string }> = [
  { level: 'high',     label: '≥70%' },
  { level: 'medium',   label: '40–69%' },
  { level: 'low',      label: '10–39%' },
  { level: 'conflict', label: 'Conflicto' },
  { level: 'blocked',  label: 'Bloqueado' },
];

export function Q2HeatmapLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-4" aria-label="Leyenda del mapa de calor">
      {LEGEND.map(({ level, label }) => (
        <li key={level} className="flex items-center gap-2 text-xs" style={{ color: 'var(--mc-text-secondary)' }}>
          <span
            className="w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: `var(--mc-heatmap-${level})` }}
            aria-hidden="true"
          />
          {label}
        </li>
      ))}
    </ul>
  );
}
```
