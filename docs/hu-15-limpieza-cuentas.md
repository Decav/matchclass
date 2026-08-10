# HU-15: Limpieza de cuentas anonimas

**Proyecto:** MatchClass

**Epica:** Infraestructura

**Prioridad:** Baja

**Story Points:** 2

---

## Narrativa (INVEST)

**Como** administrador del sistema,

**quiero** que las cuentas anonimas sin actividad se eliminen automaticamente,

**para** evitar el crecimiento indefinido de usuarios en Firebase Auth.

---

## Descripcion / Contexto

Cada alumno que responde genera una cuenta anonima en Firebase Auth que es permanente. Firebase no las elimina automaticamente. Sin limpieza, el proyecto acumula cuentas muertas de forma indefinida.

Esta HU no bloquea el lanzamiento. Puede diferirse hasta despues del primer semestre en produccion, pero conviene tenerla implementada antes de que el volumen lo vuelva urgente.

---

## Especificaciones / Contrato

- **Ejecucion:** Cloud Function programada via Cloud Scheduler (ej: diaria a las 3 AM)
- **Criterio de eliminacion:** Cuentas anonimas sin actividad en los ultimos **90 dias**. Usar `lastRefreshTime ?? creationTime` como referencia (un alumno que responde una vez y no vuelve puede no tener `lastRefreshTime`)
- **Exclusion:** No eliminar cuentas cuya sala asociada siga en estado `active` (para no perder datos de matching activo)
- **Identificacion de cuentas anonimas:** Filtrar usuarios de Firebase Auth donde `providerData.length === 0 && !email && !phoneNumber` (en Admin SDK los usuarios anonimos tienen `providerData: []`, no un provider con tipo `anonymous` como en el SDK cliente)
- **Registro:** Loggear la cantidad de cuentas eliminadas en cada ejecucion
- **Cascada:** Al eliminar una cuenta anonima, sus documentos de respuesta en `rooms/{roomId}/responses/{uid}` se mantienen (datos de matching son mas valiosos que el cleanup perfecto)

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Eliminacion de cuentas inactivas

- **GIVEN** una cuenta anonima existe hace mas de 90 dias sin actividad
- **AND** su sala asociada no esta en estado `active`
- **WHEN** la Cloud Function se ejecuta
- **THEN** la cuenta anonima se elimina de Firebase Auth
- **AND** su documento de respuesta en Firestore se conserva

### Escenario 2: No eliminar cuentas con sala activa

- **GIVEN** una cuenta anonima existe hace mas de 90 dias
- **AND** la sala donde respondio tiene `status: 'active'`
- **WHEN** la Cloud Function se ejecuta
- **THEN** la cuenta NO se elimina

### Escenario 3: No eliminar cuentas con email

- **GIVEN** una cuenta de ayudante (con email y password)
- **WHEN** la Cloud Function se ejecuta
- **THEN** la cuenta NO se elimina (solo se procesan cuentas anonimas)

### Escenario 4: Registro de ejecucion

- **GIVEN** la Cloud Function se ejecuta
- **WHEN** completa el ciclo de eliminacion
- **THEN** se registra en los logs la cantidad de cuentas procesadas y eliminadas

---

## Definition of Done (DoD)

- [ ] La Cloud Function esta desplegada y ejecutandose segun el schedule definido
- [ ] Solo elimina cuentas anonimas (no afecta cuentas de ayudantes)
- [ ] Las cuentas con sala activa no se eliminan
- [ ] Los documentos de respuesta se conservan tras eliminar la cuenta
- [ ] Se registran metricas de ejecucion en los logs
- [ ] La HU cumple con los criterios de aceptacion validados por QA
