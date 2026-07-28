# MatchClass React Seed — Documentación de Bootstrapping

Este directorio es un kit de documentación autocontenido para arrancar proyectos React nuevos usando la **NDK Architecture**, **Atomic Design** y el stack establecido.

> **Instrucción importante**: NO copies el proyecto padre. Usa únicamente esta carpeta `seed/` como referencia. El proyecto padre contiene lógica de negocio específica que no debe trasladarse a nuevos proyectos.

---

## Propósito

Permite que cualquier desarrollador, sin contexto previo del proyecto, arranque una nueva aplicación React desde cero con:

- Arquitectura en capas NDK (app / global / library / modules / resources)
- Atomic Design con prefijos q1–q5
- Stack moderno con versiones exactas y reproducibles
- Patrones probados para estado, datos y testing

---

## Orden de lectura recomendado

| # | Archivo | Descripción |
|---|---------|-------------|
| 1 | [01-bootstrapping.md](01-bootstrapping.md) | Guía paso a paso: de cero a `npm run dev` funcionando |
| 2 | [02-architecture.md](02-architecture.md) | Modelo de 5 capas NDK, reglas de dependencia, diagramas |
| 3 | [03-atomic-design.md](03-atomic-design.md) | Convenciones q1–q5, estructura de carpetas, ejemplos |
| 4 | [04-stack.md](04-stack.md) | Versiones exactas de todas las dependencias y configuración |
| 5 | [05-patterns.md](05-patterns.md) | Patrones genéricos: Zustand, TanStack Query, Axios, MSW, Zod |
| 6 | [06-auth-integration.md](06-auth-integration.md) | Patrones de autenticación: auth store, rutas protegidas, Axios |
| 7 | [07-testing.md](07-testing.md) | Estrategia de testing: unit, integration, e2e |
| 8 | [08-environments.md](08-environments.md) | Variables de entorno, `.env.example`, tipado con Vite |

---

## Templates disponibles

| Ruta | Descripción |
|------|-------------|
| [templates/module/](./templates/module/) | Scaffold de módulo React completo con estructura de carpetas |
| [templates/component/px-generic-card.tsx](templates/component/px-generic-card.tsx) | Componente PrimeReact genérico listo para copiar |
| [templates/store/example.store.ts](templates/store/example.store.ts) | Zustand store tipado con TypeScript |

---

## Checklist de arranque rápido

- [ ] Node.js 20+ y npm 10+ instalados
- [ ] `npm create vite@latest my-app -- --template react-ts`
- [ ] Instalar dependencias con versiones exactas (ver [01-bootstrapping.md](01-bootstrapping.md))
- [ ] Configurar `vite.config.ts` con aliases
- [ ] Configurar `tsconfig.app.json` con paths
- [ ] Crear estructura de carpetas `src/`
- [ ] Copiar `.env.example` → `.env.local`
- [ ] `npm run dev` — verificar que arranca sin errores
