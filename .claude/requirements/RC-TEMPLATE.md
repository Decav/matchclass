# RC-NNN: [Título del Feature]

> **Estado:** `draft` | `approved` | `implemented`
> **Módulo:** `{nombre-modulo}`
> **Autor:** [Nombre]
> **Fecha:** YYYY-MM-DD
> **Aprobado por:** [Líder técnico] — YYYY-MM-DD

---

## 1. Contexto y Problema

<!--
¿Qué situación existe hoy? ¿Qué dolor de negocio resuelve este feature?
Máximo 1 párrafo. Si necesitas más, el feature es demasiado grande → dividir.
-->

## 2. Objetivo

<!--
1-3 oraciones. Qué se logra, medible y concreto.
Ejemplo: "Permitir que los usuarios se autentiquen vía Google OAuth
y mantener sesión con cookie segura durante 8 horas."
-->

---

## 3. Entidades y Value Objects

<!--
Solo las entidades NUEVAS o MODIFICADAS de este feature.
Define propiedades, invariantes de negocio y comportamiento.
NO incluir imports, decoradores ni detalles de framework.

Ejemplo:
- **UserSession** (entidad)
  - userId: string
  - email: Email (VO)
  - roles: string[]
  - expiresAt: Date
  - Invariante: expiresAt debe ser futuro al momento de crear
  - Comportamiento: isExpired(): boolean

- **Email** (value object)
  - value: string
  - Invariante: debe contener @, se normaliza a lowercase
-->

## 4. Errores de Dominio

<!--
Lista de errores específicos de este módulo.
Solo nombre, código, mensaje y HTTP status.

| Error | Código | Mensaje | Status |
|-------|--------|---------|--------|
| TokenExpiredError | TOKEN_EXPIRED | The session token has expired | 401 |
| InvalidStateError | INVALID_STATE | OAuth state mismatch | 400 |
-->

## 5. Puertos (Interfaces)

<!--
Interfaces que el dominio necesita del exterior.
Solo firma, sin implementación.

- **TokenService**
  - encrypt(payload): Promise<string>
  - decrypt(token): Promise<Payload>

- **OAuthProvider**
  - getAuthorizationUrl(state): string
  - exchangeCode(code): Promise<OAuthTokens>
  - getUserInfo(accessToken): Promise<OAuthUser>
-->

## 6. Use Cases

<!--
Un use case por operación de negocio.
Describe QUÉ hace, no CÓMO lo implementa.

| Use Case | Input | Output | Errores posibles |
|----------|-------|--------|------------------|
| ExchangeToken | code, state | UserSession | TokenExpired, InvalidState |
| ValidateSession | token (cookie) | UserSession | TokenExpired |
| Logout | token (cookie) | void | — |

### ExchangeToken
1. Valida que el state coincida con el almacenado
2. Intercambia code por tokens con el OAuthProvider
3. Obtiene info del usuario
4. Crea UserSession
5. Encripta sesión como JWE y la setea en cookie

### ValidateSession
1. Desencripta el token JWE de la cookie
2. Verifica que no esté expirado
3. Retorna la UserSession
-->

---

## 7. Contrato HTTP

<!--
Solo la interfaz pública. El formato de errores (RFC 7807),
el wrapper de respuesta y la autenticación están en CLAUDE.md.

| Método | Ruta | Input | Output | Status | Auth |
|--------|------|-------|--------|--------|------|
| GET | /auth/authorize | — | { url, state } | 200 | No |
| GET | /auth/token | ?code=&state= | redirect | 302 | No |
| GET | /auth/validate | — | { user } | 200, 401 | Cookie |
| POST | /auth/logout | — | — | 204 | Cookie |
-->

---

## 8. Modelo de Datos

<!--
Solo si este feature crea o modifica tablas.
Describe el modelo conceptual, NO el schema Prisma literal
(las convenciones de Prisma están en CLAUDE.md).

- **User**
  - id: UUID (PK)
  - email: string (unique)
  - name: string
  - roles: string[]
  - timestamps: createdAt, updatedAt

- Relaciones: ninguna en este módulo
- Índices: email (unique)
-->

---

## 9. Criterios de Aceptación

<!--
Cada criterio es un test. Si no se puede testear, no es un criterio.

### Unitarios
- [ ] ExchangeToken: happy path retorna UserSession válida
- [ ] ExchangeToken: state inválido lanza InvalidStateError
- [ ] ExchangeToken: code expirado lanza TokenExpiredError
- [ ] UserSession.create: expiresAt en pasado lanza error
- [ ] UserSession.isExpired: retorna true si expiresAt < now
- [ ] Email.create: input sin @ lanza InvalidEmailError
- [ ] TokenService: encrypt → decrypt retorna payload original

### E2E
- [ ] GET /auth/authorize retorna 200 con url y state
- [ ] GET /auth/token con code válido → 302 + cookie seteada
- [ ] GET /auth/token con state inválido → 400 RFC 7807
- [ ] GET /auth/validate con cookie válida → 200 con user
- [ ] GET /auth/validate sin cookie → 401 RFC 7807
- [ ] POST /auth/logout → 204 + cookie eliminada

### Definition of Done
- [ ] tsc --noEmit sin errores
- [ ] Coverage ≥ 80% en archivos nuevos
- [ ] Lint sin errores
- [ ] Swagger actualizado
- [ ] Docker compose levanta sin errores
-->

---

## 10. Notas

<!--
Trade-offs, decisiones de seguridad, dependencias con otros módulos,
o cualquier contexto que Claude Code necesite para no tomar malas decisiones.

Ejemplo: "El JWE usa A256GCM. No usar JWT firmado porque
necesitamos que el contenido sea opaco para el frontend."
-->

---

## Historial

| Fecha | Acción | Autor |
|-------|--------|-------|
| YYYY-MM-DD | Creación | [Nombre] |