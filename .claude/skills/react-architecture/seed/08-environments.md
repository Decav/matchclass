# 08 — Variables de entorno

## Cómo Vite maneja los archivos `.env`

Vite carga automáticamente los archivos de entorno según el modo activo:

| Archivo | Cuándo se carga |
|---------|----------------|
| `.env` | Siempre |
| `.env.local` | Siempre (ignorado por git) |
| `.env.development` | En modo `development` |
| `.env.development.local` | En modo `development` (ignorado por git) |
| `.env.production` | En modo `production` |
| `.env.production.local` | En modo `production` (ignorado por git) |
| `.env.staging` | Con `--mode staging` |

**Orden de precedencia**: `.local` sobreescribe el archivo base. Los archivos más específicos tienen prioridad.

---

## Regla del prefijo `VITE_`

**Solo las variables con prefijo `VITE_` son accesibles en el código del cliente.**

Las variables sin prefijo están disponibles solo en `vite.config.ts` (proceso de build), nunca en el bundle final.

```bash
# ✅ Accesible en el cliente (bundle)
VITE_API_BASE_URL=http://localhost:3000

# ❌ Solo disponible en vite.config.ts
DATABASE_URL=postgresql://...  # NUNCA en el bundle
SECRET_KEY=my-secret           # NUNCA en el bundle
```

> **Seguridad**: nunca pongas secretos, passwords o tokens privados en variables `VITE_*`. Todo lo que comience con `VITE_` va al bundle JavaScript y es visible en el navegador.

---

## Template `.env.example`

```bash
# =============================================================================
# React App — Variables de entorno
# Copia este archivo: cp .env.example .env.local
# =============================================================================

# ---------------------------------------------------------------------------
# Firebase — auth + Firestore
# ---------------------------------------------------------------------------
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Emuladores locales (auth 9099 / firestore 8080)
VITE_FIREBASE_USE_EMULATORS=false

# ---------------------------------------------------------------------------
# API auxiliar (Cloud Functions HTTP, terceros) — opcional
# ---------------------------------------------------------------------------
VITE_API_BASE_URL=http://localhost:3000

# ---------------------------------------------------------------------------
# Aplicación
# ---------------------------------------------------------------------------
# Ambiente actual: development | staging | production
VITE_APP_ENV=development

# Nombre de la aplicación (para títulos, breadcrumbs)
VITE_APP_NAME=My App

# ---------------------------------------------------------------------------
# Monitoreo / Sentry (dejar vacío para deshabilitar)
# ---------------------------------------------------------------------------
VITE_SENTRY_DSN=

```

> Las claves web de Firebase son **públicas por diseño**: viajan en el bundle. Lo que protege los datos son las Firestore Security Rules, no ocultar el `apiKey`. Se cargan por `.env` para apuntar a distintos proyectos según el entorno.

---

## Tipado de `import.meta.env` con TypeScript

Crea `src/vite-env.d.ts` (o extiende el existente):

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_USE_EMULATORS?: string;

  // API auxiliar (opcional)
  readonly VITE_API_BASE_URL: string;

  // App
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_APP_NAME: string;

  // Sentry
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

Uso en código TypeScript:

```typescript
// TypeScript sabe el tipo exacto
const apiUrl = import.meta.env.VITE_API_BASE_URL;        // string
const appEnv = import.meta.env.VITE_APP_ENV;              // 'development' | 'staging' | 'production'
const isDev = import.meta.env.VITE_APP_ENV === 'development'; // boolean

// Acceso al modo de Vite (no requiere prefijo VITE_)
const isProduction = import.meta.env.PROD;  // boolean
const isDevelopment = import.meta.env.DEV;  // boolean
const mode = import.meta.env.MODE;          // 'development' | 'production' | custom
```

---

## Variables por ambiente

### Development (`.env.development`)

```bash
VITE_FIREBASE_PROJECT_ID=matchclass-dev
VITE_FIREBASE_AUTH_DOMAIN=matchclass-dev.firebaseapp.com
VITE_FIREBASE_USE_EMULATORS=true
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_ENV=development
VITE_SENTRY_DSN=
```

### Staging (`.env.staging`)

```bash
VITE_FIREBASE_PROJECT_ID=matchclass-staging
VITE_FIREBASE_AUTH_DOMAIN=matchclass-staging.firebaseapp.com
VITE_FIREBASE_USE_EMULATORS=false
VITE_API_BASE_URL=https://api.staging.matchclass.cl
VITE_APP_ENV=staging
VITE_SENTRY_DSN=https://xxx@sentry.io/yyy
```

**Un proyecto de Firebase por ambiente.** Compartir el mismo `projectId` entre staging y produccion significa compartir la base de datos: un test de staging escribe en los datos reales.

Para arrancar en modo staging:

```bash
npm run dev -- --mode staging
npm run build -- --mode staging
```

### Production (`.env.production`)

```bash
VITE_FIREBASE_PROJECT_ID=matchclass-prod
VITE_FIREBASE_AUTH_DOMAIN=matchclass-prod.firebaseapp.com
VITE_FIREBASE_USE_EMULATORS=false
VITE_API_BASE_URL=https://api.matchclass.cl
VITE_APP_ENV=production
VITE_SENTRY_DSN=https://xxx@sentry.io/yyy
```

---

## Agregar una nueva variable de entorno

1. Agregar al `.env.example` con un comentario descriptivo
2. Agregar a todos los archivos `.env.*` relevantes
3. Extender la interfaz `ImportMetaEnv` en `src/vite-env.d.ts`
4. Usar en el código con `import.meta.env.VITE_MI_VARIABLE`

```typescript
// Ejemplo: nueva variable para URL de un servicio externo
// 1. En .env.example:
// VITE_ANALYTICS_URL=https://analytics.example.com

// 2. En src/vite-env.d.ts:
interface ImportMetaEnv {
  // ... existing vars
  readonly VITE_ANALYTICS_URL: string;
}

// 3. Uso:
const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL;
```

---

## `.gitignore` — qué ignorar

Asegúrate de que tu `.gitignore` incluya:

```gitignore
# Variables de entorno locales (contienen valores reales)
.env.local
.env.*.local

# Commitear estos archivos (son templates, sin valores reales):
# .env.example       ← siempre commitear
# .env.development   ← commitear si no tiene secretos
# .env.staging       ← commitear si no tiene secretos
# .env.production    ← commitear si no tiene secretos
```
