# MatchClass — Mapa General del Proyecto

**Proyecto:** matchclass
**Stack:** React 19 · TypeScript 5.9 · Vite 8 · React Router 7 · TanStack Query 5 · Zustand 5 · Firebase 12 (Auth + Firestore) · Axios · RHF · Zod 4 · PrimeReact 10 · Lucide · Tailwind 4 · Inter + JetBrains Mono · Vitest 4 · Playwright · MSW 2 · Sentry · Storybook 10
**Version:** 0.1.0

---

## 5 Reglas Inviolables NDK

1. **UI no llama datos directamente.** Todo acceso pasa por: `component → hook → service → repository → SDK/axios`. Ningun componente usa `api.*`, `fetch` ni importa `firebase/*` directamente.
2. **`global` no tiene logica de negocio.** Los componentes en `global/` son configurables via props; no conocen dominios como "autenticacion" ni "home".
3. **`library` no tiene JSX.** Ningun archivo en `library/` importa React ni renderiza componentes.
4. **`resources` es completamente agnostico.** No importa React, Axios, Firebase ni ninguna libreria. Solo TypeScript puro y Zod.
5. **`modules` orquesta todo.** Es la unica capa que puede combinar `library + global + resources` para implementar una feature completa.

---

## Tabla de Archivos de Documentacion

| Archivo | Descripcion |
|---------|-------------|
| [01-layers.md](01-layers.md) | Las 4 capas NDK: definicion, rutas, aliases, reglas de importacion |
| [02-atomic-design.md](02-atomic-design.md) | Los 6 niveles de componentes q1-q5 y pa con reglas de composicion |
| [03-stack.md](03-stack.md) | Tabla completa de tecnologias con versiones, capas y aliases |
| [04-patterns.md](04-patterns.md) | 8 patrones canonicos con snippets reales del proyecto |
| [05-conventions.md](05-conventions.md) | Tabla de nomenclatura para cada tipo de archivo |
| [06-data-flows.md](06-data-flows.md) | 4 flujos end-to-end con diagramas ASCII |
| [07-new-module-guide.md](07-new-module-guide.md) | Guia ejecutable de 14 pasos para crear un modulo nuevo |
| [08-testing.md](08-testing.md) | Estrategia de testing con snippets por tipo de test |
| [09-adrs.md](09-adrs.md) | 7 ADRs del proyecto con contexto, decision y consecuencias |
| [10-config.md](10-config.md) | Configuracion tecnica: tsconfig, vite, env vars, scripts npm |
| [11-http-error-handling.md](11-http-error-handling.md) | Skeleton en carga, interceptor 401, componente Q2Forbidden para 403 |
| [12-design-system.md](12-design-system.md) | Estandar de diseno MatchClass: tokens de color, tipografia, dark mode, PrimeReact overrides, patrones UI |

---

## Arbol de Directorios `src/`

```
src/
├── app/                        # Bootstrap — punto de entrada
│   ├── main.tsx                # Entry point: initSentry + createRoot
│   ├── providers/
│   │   └── app-providers.tsx   # ThemeProvider + AuthProvider + QueryClient + Router
│   └── router/
│       └── app-router.tsx      # createBrowserRouter con rutas de modulos
│
├── resources/                  # CAPA 1 — contratos puros (sin React, sin HTTP)
│   ├── entities/
│   │   └── user.entity.ts      # interface User
│   ├── requests/
│   │   └── auth.request.ts     # interface LoginRequest
│   ├── responses/
│   │   └── auth.response.ts    # interface AuthResponse
│   ├── enums/
│   │   └── auth-status.enum.ts # AuthStatus (as const, no enum)
│   ├── errors/                 # Tipos de error de dominio
│   ├── schemas/                # Schemas Zod base compartidos
│   ├── types/                  # Tipos utilitarios
│   └── index.ts                # Barrel export
│
├── global/                     # CAPA 2 — reutilizable en toda la app
│   ├── components/
│   │   ├── q1-button/          # Atomo: boton base PrimeReact
│   │   ├── q1-loading-spinner/ # Atomo: spinner de carga
│   │   ├── q2-badge/           # Molecula: badge con label/color
│   │   ├── q3-stat-card/       # Celula: tarjeta de estadistica
│   │   └── q5-protected-route/ # Ecosistema: ruta autenticada
│   ├── store/
│   │   ├── auth.store.ts       # Zustand: sesion de usuario
│   │   └── ui.store.ts         # Zustand: preferencias de UI
│   ├── providers/
│   │   ├── auth-provider.tsx   # Suscripcion unica a onAuthStateChanged
│   │   └── theme-provider.tsx  # Dark/light mode
│   ├── hooks/                  # Hooks utilitarios reutilizables
│   ├── utils/                  # Funciones puras utilitarias
│   ├── validators/             # Validadores reutilizables
│   ├── constants/              # Constantes globales
│   └── index.ts                # Barrel export
│
├── library/                    # CAPA 3 — integracion con servicios externos
│   ├── firebase/
│   │   ├── firebase-app.ts     # initializeApp + getAuth + getFirestore
│   │   └── firebase-emulators.ts # Conexion a emuladores en dev
│   ├── api/                    # Solo APIs HTTP auxiliares (Cloud Functions, terceros)
│   │   ├── client/
│   │   │   └── api-instance.ts  # Instancia Axios con baseURL
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts   # Adjunta el ID token de Firebase
│   │       └── error.interceptor.ts  # Manejo de errores HTTP
│   ├── query/
│   │   ├── query-client.ts     # TanStack QueryClient configurado
│   │   └── query-keys.ts       # Claves de query centralizadas
│   ├── repositories/
│   │   ├── auth.repository.ts  # Firebase Auth + mapper FirebaseUser → User
│   │   ├── room.repository.ts  # Firestore: salas (rooms)
│   │   └── response.repository.ts # Firestore: respuestas (subcoleccion)
│   ├── services/
│   │   └── matching.service.ts # Solo cuando hay logica de negocio real
│   ├── mocks/
│   │   ├── browser.ts          # MSW para navegador (dev)
│   │   ├── server.ts           # MSW para Node (tests)
│   │   └── handlers/           # Handlers de APIs HTTP auxiliares
│   ├── integrations/
│   │   └── sentry/
│   │       └── sentry.client.ts # Inicializacion de Sentry
│   └── index.ts                # Barrel export
│
├── modules/                    # CAPA 4 — logica de negocio por dominio
│   ├── authentication/
│   │   ├── components/
│   │   │   ├── q2-input-field/   # Molecula: input de usuario
│   │   │   ├── q2-password-field/ # Molecula: input de password
│   │   │   ├── q4-login-form/    # Organismo: formulario de login
│   │   │   └── pa-login/         # Pagina: vista de login
│   │   ├── core/
│   │   │   ├── hooks/
│   │   │   │   └── use-login-mutation.ts
│   │   │   └── schemas/
│   │   │       └── login.schema.ts
│   │   ├── routes/
│   │   │   └── authentication.routes.tsx
│   │   └── index.ts
│   ├── home/
│   │   ├── components/
│   │   │   ├── pa-landing/       # Pagina: landing publica
│   │   │   └── pa-dashboard/     # Pagina: dashboard autenticado
│   │   ├── core/
│   │   │   └── hooks/
│   │   │       └── use-stats-query.ts
│   │   ├── routes/
│   │   │   └── home.routes.tsx
│   │   └── index.ts
│   └── index.ts
│
├── styles/
│   └── main.css                # Tailwind entry point
└── test/
    └── setup.ts                # Vitest setup: jest-dom + MSW server
```
