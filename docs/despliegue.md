# Despliegue en producción

**Origen:** RC-019 / HU-16 · **Sitio:** https://matchclass.web.app

MatchClass tiene **un solo proyecto de Firebase** (`matchclass`, plan Blaze). No hay staging
ni preproducción: **cada despliegue pisa producción directamente**. Por eso el paso de
`firebase deploy` lo ejecuta una persona, nunca un agente ni un script automático
(RC-019/D4).

---

## 1. Piezas de configuración

| Archivo | Qué aporta |
|---|---|
| `.firebaserc` | Proyecto por defecto: `matchclass` |
| `firebase.json` → `hosting` | `public: "dist"`, rewrite SPA, cache headers |
| `firebase.json` → `firestore.database` | `matchclass-db` — a qué base se publican las reglas |
| `.env.production` | Claves del proyecto real. Se versiona (RC-019/D2) |
| `src/library/firebase/firebase-app.ts` | Elige la base de Firestore según el entorno |
| `firestore.rules` | Reglas de seguridad. Se despliegan tal cual están en el repo |

### La base de Firestore es nombrada

El proyecto `matchclass` **no tiene base `(default)`**: la única base se llama
`matchclass-db`. `getFirestore(app)` siempre resuelve a `(default)`, así que la app
apuntaría a una base inexistente/vacía, cargando sin errores visibles y sin encontrar
ninguna sala. De ahí las tres piezas:

- `firebase-app.ts` pasa el id solo cuando **no** se usan emuladores
- `firebase.json` declara `"database": "matchclass-db"` para que las reglas se publiquen
  en la base correcta
- **Los emuladores y los e2e siguen usando `(default)`** — el emulador no sirve bases
  nombradas y no hay que cambiarlos

Está cubierto por `src/library/firebase/firebase-app.test.ts` y
`src/test/config/firebase-json.test.ts`. Si algún día esos tests estorban, el problema
no son los tests.

### El rewrite de SPA

`rewrites: [{ "source": "**", "destination": "/index.html" }]` es lo único que evita que
`matchclass.web.app/acceso` devuelva 404: React Router resuelve las rutas en el cliente,
y Hosting no conoce ninguna ruta salvo `/`.

### Cache

- `/assets/**` → `public, max-age=31536000, immutable`. Vite hashea los nombres de los
  archivos, así que un archivo con un nombre dado nunca cambia de contenido.
- `/index.html` → `no-cache`. Es el archivo que referencia los assets nuevos; si queda
  cacheado, el deploy no se ve.

---

## 2. Checklist previa en la consola de Firebase

Se verifica una vez y se revisa si algo falla en producción. Sin esto, el deploy sube
pero la app no funciona.

- [ ] **Authentication → Sign-in method → Anonymous** habilitado.
      Sin esto el flujo del alumno (HU-01) falla en producción.
- [ ] **Authentication → Sign-in method → Email/Password** habilitado.
      Sin esto no hay registro ni login de ayudantes.
- [ ] **Authentication → Settings → Authorized domains** incluye `matchclass.web.app` y
      `matchclass.firebaseapp.com`.
- [ ] **Firestore** tiene la base `matchclass-db` creada y activa.

---

## 3. Procedimiento de despliegue

### 3.1 Validar en local

```bash
npm run type-check
npm run lint
npx vitest run
npm run emulators        # en otra terminal; los e2e lo necesitan
npx playwright test
```

Todo en verde antes de seguir (Escenario 1 de HU-16).

### 3.2 Construir

```bash
npm run build
```

Corre `tsc -b` y luego `vite build`, y genera `dist/`. Vite usa `.env.production` en este
modo; `.env.local` no interviene. El build emite un aviso de tamaño de chunk: es
conocido y aceptado para la v1 — el code splitting por ruta es un RC aparte.

### 3.3 Desplegar las reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

Van a `matchclass-db` gracias a `firestore.database` en `firebase.json`.

### 3.4 Desplegar el sitio

```bash
firebase deploy --only hosting
```

> Las Cloud Functions (RC-017) tienen su propio despliegue y no entran acá.

### 3.5 Verificación manual en producción

- [ ] `https://matchclass.web.app/` carga la landing
- [ ] `https://matchclass.web.app/acceso` carga directo, sin 404 (prueba del rewrite)
- [ ] Estando en `/dashboard`, F5 no devuelve 404
- [ ] Ciclo completo: registro → crear sala → el alumno responde con el código → el
      ayudante ve el heatmap
- [ ] Sin errores en la consola del navegador durante ese ciclo
- [ ] El botón "Copiar enlace" genera `matchclass.web.app/acceso?tipo=alumno&codigo=…` y
      el enlace funciona en otro navegador
- [ ] **La sala recién creada aparece en la consola de Firestore dentro de
      `matchclass-db`** — es la prueba de que la app quedó apuntando a la base nombrada
      y no a una `(default)` vacía

---

## 4. Diagnóstico rápido

| Síntoma | Causa probable |
|---|---|
| Pantalla en blanco, sin nada renderizado | Falta una `VITE_FIREBASE_*` en `.env.production`: `readFirebaseEnv()` lanza en el arranque, a propósito |
| La app carga pero no aparece ninguna sala | Está apuntando a la base `(default)` — revisar el ternario de `firebase-app.ts` y que `VITE_FIREBASE_USE_EMULATORS=false` |
| 404 al entrar directo a `/acceso` | Falta el rewrite `**` → `/index.html` en `firebase.json` |
| `auth/unauthorized-domain` al iniciar sesión | El dominio no está en los dominios autorizados de Auth |
| `permission-denied` en operaciones normales | Las reglas no se desplegaron, o se desplegaron en otra base |
| Se ve la versión anterior tras desplegar | Cache de `index.html` en el navegador; verificar los `headers` de `firebase.json` |

---

## 5. Fuera de alcance (RCs propios)

Dominio propio y certificados, CI/CD (GitHub Actions), previews de Hosting por PR,
Sentry (RC-019/D3), code splitting del bundle, y el despliegue de las Cloud Functions.
