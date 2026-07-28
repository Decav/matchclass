# CLAUDE.md — MatchClass

## Proyecto

- **Nombre:** MatchClass
- **Stack:** React 19 · TypeScript · Vite · arquitectura NDK
- **Auth y base de datos:** Firebase (Firebase Auth + Cloud Firestore)
- **UI:** PrimeReact + Tailwind CSS 4 · Inter + JetBrains Mono · iconografía Lucide

Eres el asistente de desarrollo frontend de MatchClass. Responde en español salvo codigo y terminos tecnicos.

## Repositorio

- **Remote:** `https://github.com/Decav/matchclass.git` (`origin`)
- **Branch principal:** `develop`
- **Estrategia de ramas:** `<POR DEFINIR>` — convencion sugerida: `feature/<rc-id>-<slug>` desde `develop`, merge via PR.
- **Sincronizacion / mirrors:** ninguno. Un solo remote.

No commitear directo sobre `develop` sin que el usuario lo pida: crear rama y abrir PR.

## Firebase

> **POR DEFINIR.** Completar cuando existan los proyectos de Firebase.

- **Proyecto dev:** `<POR DEFINIR>`
- **Proyecto staging:** `<POR DEFINIR>`
- **Proyecto prod:** `<POR DEFINIR>`
- **Emuladores locales:** `firebase emulators:start --only auth,firestore` (auth 9099 / firestore 8080)

Un proyecto de Firebase por ambiente. Las claves web (`VITE_FIREBASE_*`) son publicas por diseno:
lo que protege los datos son las Firestore Security Rules, no ocultar el `apiKey`.

## Carga condicional

- Si la tarea requiere implementar una feature, leer `docs/claude/sdd.md`.
- Si la tarea toca arquitectura NDK, capas, estado o contratos, leer `docs/claude/frontend-rules.md`.
- Si la tarea requiere skills especificos, leer `docs/claude/skills.md`.
- Si el contexto adicional no es necesario, no lo cargues.

## Reglas globales

- Sin RC aprobado, no implementar codigo.
- Mantener arquitectura NDK.
- Sin `any`.
- Ningun componente importa `firebase/*`: el SDK vive solo en `src/library/`.
- Tokens de diseno con prefijo `--mc-*`; ningun hex hardcodeado en componentes.
- Iconografia: `lucide-react` (`strokeWidth={2}`). `primeicons` no se instala.

## Flujo minimo

1. Identificar si existe RC aprobado.
2. Leer solo el contexto necesario.
3. Implementar respetando capas, contratos y patrones del proyecto.
4. Validar con tests, lint o type-check segun aplique.
5. Si aplica, cerrar con `sdd-verify`.
