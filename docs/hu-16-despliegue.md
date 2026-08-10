# HU-16: Despliegue en Firebase Hosting

**Proyecto:** MatchClass

**Epica:** Infraestructura

**Prioridad:** Alta

**Story Points:** 2

---

## Narrativa (INVEST)

**Como** equipo,

**quiero** desplegar MatchClass en Firebase Hosting con la base de datos, autenticacion y reglas de seguridad funcionando,

**para** tener el proyecto accesible en produccion en `matchclass.web.app`.

---

## Descripcion / Contexto

El proyecto ya tiene:
- URL de produccion: `matchclass.web.app`
- Build funcionando con `npm run build` → `dist/`

Esta HU cubre la configuracion final de despliegue, las variables de entorno de produccion, las Firestore Security Rules y la verificacion de que todo funciona en el entorno productivo.

---

## Especificaciones / Contrato

- **Hosting:** Firebase Hosting sirviendo los archivos estaticos de `dist/`
- **Plan:** Blaze (disponible) — permite Cloud Functions y Scheduler para HU-15
- **Build de produccion:** `npm run build` genera `dist/`
- **Firestore:** Base nombrada `matchclass-db` en produccion. `getFirestore(app, "matchclass-db")`. En dev/emuladores se usa `(default)`
- **Firestore Security Rules:** Desplegar `firestore.rules` con las reglas definidas en `docs/tech-document.md §10`
- **Firebase Auth:** Proveedor Anonymous habilitado en la consola de Firebase (requerido por HU-01 para el flujo del alumno)
- **Dominios autorizados:** `matchclass.web.app` y `matchclass.firebaseapp.com` en la configuracion de Auth

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Build de produccion exitoso

- **GIVEN** el codigo esta en `develop` listo para produccion
- **WHEN** se ejecuta `npm run build`
- **THEN** se genera la carpeta `dist/` sin errores
- **AND** TypeScript strict mode no reporta errores
- **AND** el linter no reporta warnings

### Escenario 2: Despliegue en Firebase Hosting

- **GIVEN** el build de produccion esta generado
- **WHEN** se ejecuta `firebase deploy --only hosting`
- **THEN** los archivos se despliegan en `matchclass.web.app`
- **AND** la landing page carga en `matchclass.web.app/`
- **AND** la pagina de acceso carga en `matchclass.web.app/acceso`

### Escenario 3: Firestore Security Rules desplegadas

- **GIVEN** las reglas estan definidas en `firestore.rules`
- **WHEN** se ejecuta `firebase deploy --only firestore:rules`
- **THEN** las reglas se aplican en el proyecto de produccion
- **AND** un ayudante autenticado puede crear y modificar sus salas
- **AND** un alumno anonimo puede crear una respuesta
- **AND** un alumno anonimo no puede modificar respuestas de otros

### Escenario 4: Flujo completo en produccion

- **GIVEN** el sistema esta desplegado en `matchclass.web.app`
- **WHEN** se prueba el ciclo completo: registro → crear sala → alumno responde → heatmap
- **THEN** todas las pantallas cargan sin errores de consola
- **AND** Firebase Auth funciona (registro, login, sesion anonima)
- **AND** Firestore lee y escribe correctamente
- **AND** los enlaces de compartir sala funcionan con el dominio correcto

### Escenario 5: Variables de entorno correctas

- **GIVEN** el despliegue esta configurado
- **THEN** `.env.production` contiene las claves del proyecto Firebase de produccion
- **AND** `VITE_FIREBASE_USE_EMULATORS` es `false`
- **AND** `VITE_APP_ENV` es `production`

### Escenario 6: Redirects de SPA

- **GIVEN** el usuario navega a `matchclass.web.app/acceso`
- **WHEN** el servidor de Hosting recibe la request
- **THEN** sirve `index.html` (no devuelve 404)
- **AND** React Router maneja la ruta correctamente

---

## Definition of Done (DoD)

- [ ] Build de produccion genera `dist/` sin errores
- [ ] `firebase.json` tiene configurado `hosting.public: "dist"` y `rewrites` para SPA
- [ ] `.env.production` tiene las variables correctas
- [ ] Firestore Security Rules estan desplegadas y funcionales
- [ ] Firebase Auth tiene el proveedor Anonymous habilitado
- [ ] `matchclass.web.app` carga la landing page
- [ ] El flujo completo (registro → sala → respuesta → heatmap) funciona en produccion
- [ ] Los enlaces de sala compartidos funcionan con el dominio de produccion
- [ ] La HU cumple con los criterios de aceptacion validados por QA
