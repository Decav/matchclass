# Atomic Design NDK — Niveles q1-q5 y pa

NDK extiende Atomic Design con prefijos numericos que forman parte del nombre del archivo y la carpeta. El nivel es visible directamente en el sistema de archivos.

---

## Niveles de Componentes

### q1 — Atomo

**Definicion:** Componente minimo, indivisible, sin dependencias de logica de negocio. Puede envolver una libreria UI (PrimeReact) pero su interfaz es generica y configurable por props.

**Cuando usarlo:** Cuando el componente no necesita estado interno complejo, no llama hooks de dominio, y puede usarse en cualquier contexto sin saber nada del negocio.

**Regla de composicion:**
- Puede usar: librerias UI (PrimeReact, HTML nativo), tipos de `@resources`
- No puede usar: q2, q3, q4, q5, hooks de `@library`, stores de dominio

**Ejemplos reales del proyecto:**
- `src/global/components/q1-button/q1-button.tsx` — boton base PrimeReact
- `src/global/components/q1-loading-spinner/q1-loading-spinner.tsx` — spinner de carga

```
q1-button/
├── q1-button.tsx
├── q1-button.test.tsx
├── q1-button.stories.tsx
└── index.ts
```

---

### q2 — Molecula

**Definicion:** Composicion de 2-3 atomos (q1) con logica de presentacion simple. Puede tener estado local minimo (hover, focus). No conoce logica de negocio.

**Cuando usarlo:** Cuando necesitas combinar elementos atomicos en una unidad reutilizable con un proposito concreto (campo de formulario, badge con icono).

**Regla de composicion:**
- Puede usar: q1, tipos de `@resources`
- No puede usar: q3, q4, q5, hooks de dominio, stores

**Ejemplos reales del proyecto:**
- `src/global/components/q2-badge/q2-badge.tsx` — badge con label y color semantico
- `src/modules/authentication/components/q2-input-field/q2-input-field.tsx` — input de usuario con label y error
- `src/modules/authentication/components/q2-password-field/q2-password-field.tsx` — input de password con label y error

---

### q3 — Celula

**Definicion:** Unidad funcional con estado local o logica de presentacion propia. Puede manejar interacciones complejas internas pero no llama APIs ni usa stores globales.

**Cuando usarlo:** Cuando el componente tiene logica interna significativa (toggle, accordion, tarjeta con multiples estados) pero no necesita datos del servidor ni estado global.

**Regla de composicion:**
- Puede usar: q1, q2, hooks utilitarios de `@global/hooks`, tipos de `@resources`
- No puede usar: q4, q5, hooks de `@library/services`, stores de dominio

**Ejemplos reales del proyecto:**
- `src/global/components/q3-stat-card/q3-stat-card.tsx` — tarjeta de estadistica con icono y delta

---

### q4 — Organismo

**Definicion:** Bloque complejo que combina multiples q2/q3 y contiene logica de negocio. Puede llamar hooks de dominio (`useLoginMutation`, `useStatsQuery`), acceder a stores globales, y manejar formularios completos.

**Cuando usarlo:** Cuando necesitas un bloque autocontenido que implementa un flujo de negocio completo (formulario de login, tabla de datos con filtros, panel de configuracion).

**Regla de composicion:**
- Puede usar: q1, q2, q3, hooks de `@library` via modulo, stores de `@global`
- No puede usar: q5, pa (no puede contener paginas ni flujos completos)

**Ejemplos reales del proyecto:**
- `src/modules/authentication/components/q4-login-form/q4-login-form.tsx` — formulario de login con RHF + Zod + useLoginMutation

---

### q5 — Ecosistema

**Definicion:** Flujo completo o seccion mayor de la aplicacion. Puede orquestar multiples organismos (q4), gestionar estados de carga globales, y controlar flujos de navegacion. Tipicamente es un wrapper de layout o un guard.

**Cuando usarlo:** Cuando necesitas un componente que controle un flujo de varios pasos, un layout con sidebar + contenido, o una ruta protegida.

**Regla de composicion:**
- Puede usar: q1, q2, q3, q4, stores globales, hooks de dominio
- No puede usar: pa (las paginas son hijas de q5, no al reves)

**Ejemplos reales del proyecto:**
- `src/global/components/q5-protected-route/q5-protected-route.tsx` — ruta autenticada que redirige a /login si no hay token

---

### pa — Pagina

**Definicion:** Vista directamente enrutable. Orquesta componentes del modulo (q4, q5) en un layout de pagina. No contiene logica de negocio inline — delega todo a los componentes hijos.

**Cuando usarlo:** Cuando un componente es el destino de una ruta React Router (`path: '/login'`). Siempre y solo cuando sea el componente asignado a un `element` en el router.

**Regla de composicion:**
- Puede usar: q4, q5, y componentes del modulo propio
- No puede contener: logica de negocio inline, hooks de dominio directamente en el cuerpo del componente, llamadas a servicios

**Ejemplos reales del proyecto:**
- `src/modules/authentication/components/pa-login/pa-login.tsx` — layout de login que renderiza Q4LoginForm
- `src/modules/home/components/pa-landing/pa-landing.tsx` — landing page publica
- `src/modules/home/components/pa-dashboard/pa-dashboard.tsx` — dashboard autenticado

---

## Tabla Resumen

| Prefijo | Nombre | Equivalente Atomic | Estado | Hooks dominio | Ejemplos |
|---------|--------|-------------------|--------|---------------|---------|
| q1 | Atomo | atom | No / minimo | No | q1-button, q1-loading-spinner |
| q2 | Molecula | molecule | Local simple | No | q2-badge, q2-input-field |
| q3 | Celula | cell | Local complejo | No | q3-stat-card |
| q4 | Organismo | organism | Local + global | Si | q4-login-form |
| q5 | Ecosistema | ecosystem | Global | Si | q5-protected-route |
| pa | Pagina | page | Minimo | No (delega) | pa-login, pa-dashboard |

---

## Arbol de Decision para Elegir Prefijo

```
¿Es el destino directo de una ruta React Router?
  └─ SI  →  pa

¿No es ruta, es un componente?
  └─ ¿Controla un flujo completo o es un layout/guard?
       └─ SI  →  q5
       └─ NO  →  ¿Tiene logica de negocio (hooks de dominio, stores, API)?
                   └─ SI  →  q4
                   └─ NO  →  ¿Tiene estado local complejo o multiples interacciones?
                               └─ SI  →  q3
                               └─ NO  →  ¿Combina 2-3 atomos con un proposito concreto?
                                           └─ SI  →  q2
                                           └─ NO  →  q1
```

---

## Regla de Ubicacion por Capa

| Nivel | Donde puede vivir |
|-------|------------------|
| q1 | `src/global/components/` (reutilizable) |
| q2 | `src/global/components/` o `src/modules/{modulo}/components/` |
| q3 | `src/global/components/` o `src/modules/{modulo}/components/` |
| q4 | `src/modules/{modulo}/components/` (casi siempre especifico del modulo) |
| q5 | `src/global/components/` (guards/layouts) o `src/modules/{modulo}/components/` |
| pa | `src/modules/{modulo}/components/` (siempre en el modulo) |

---

## Estructura de Carpeta por Componente

Cada componente vive en su propia carpeta con el mismo nombre:

```
q1-button/
├── q1-button.tsx           # Componente principal (export named)
├── q1-button.test.tsx      # Tests con Testing Library
├── q1-button.stories.tsx   # Stories de Storybook (opcional q1-q4)
└── index.ts                # Barrel: export { Q1Button } from './q1-button'
```
