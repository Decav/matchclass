# Instrucciones para Diseñador — Pantallas de Acceso

**Proyecto:** MatchClass
**Remitente:** Jefe de Proyecto
**Destinatario:** Diseñador UI/UX
**Prioridad:** Alta — estas pantallas definen el primer contacto de ambos actores con la app

---

## Resumen

Necesitamos dos pantallas de acceso. Cada una corresponde a un actor distinto:

| Pantalla | Actor | Flujo |
|---|---|---|
| Login ayudante | Ayudante (autenticado) | Email + password → dashboard |
| Ingreso alumno | Alumno (anónimo) | Código de sala → nombre → grilla |

Ambas deben compartir el mismo look & feel de marca. El alumno no debe ver ni rastro de la pantalla de login del ayudante, y viceversa.

---

## 1. Login del Ayudante

### Propósito
El ayudante se autentica con email y contraseña para acceder a su dashboard y gestión de salas.

### Elementos obligatorios

| Elemento | Comportamiento |
|---|---|
| Logo / nombre MatchClass | Debe estar presente, versión simplificada. Sin eslogan |
| Campo email | Input de texto, teclado con @ en mobile |
| Campo password | Input con toggle de visibilidad (ojo) |
| Botón "Iniciar sesión" | Botón primario, full-width en mobile |
| Link "¿Olvidaste tu contraseña?" | Texto secundario, abre flujo de reset |
| Link "Registrarse" | Para ayudantes nuevos, navega a registro |
| Mensaje de error general | Arriba del formulario, sin desplazar el layout |

### Estados

| Estado | Comportamiento visual |
|---|---|
| **Reposo** | Formulario limpio, placeholders visibles |
| **Cargando** | Botón muestra spinner, campos deshabilitados |
| **Error de credenciales** | Mensaje "Email o contraseña incorrectos" sobre el formulario. Campos no se limpian |
| **Error de red** | Mensaje "Error de conexión. Intentá de nuevo" |
| **Campo inválido** | Borde rojo en el campo + mensaje debajo ("Email inválido", "La contraseña debe tener al menos 6 caracteres") |
| **Éxito** | Transición al dashboard (sin animación bloqueante, máximo 1.5s) |

### Flujo
1. Ayudante abre la app → ve login (si no hay sesión activa)
2. Completa email y password
3. Toca "Iniciar sesión"
4. El sistema valida contra Firebase Auth
5. Éxito → redirige al dashboard
6. Error → muestra mensaje sobre el formulario

### Diseño responsive

| Breakpoint | Comportamiento |
|---|---|
| Mobile (< 768px) | Formulario centrado, ocupa todo el ancho con padding 16px. Sin sidebar ni topbar |
| Desktop (≥ 768px) | Formulario centrado en un card de ancho máximo 400px. Fondo de la página con el color `$bg-page` |

### Restricciones de marca
- Usar colores de la paleta en `docs/tech-document.md §6`
- Tipografía: Inter para labels y textos, JetBrains Mono no aplica aquí
- Iconografía: Lucide, trazo 2px, tamaño 22px default
- Sin ilustraciones ni imágenes decorativas
- El card de login debe tener sombra suave (`box-shadow` con opacidad baja)

---

## 2. Ingreso del Alumno

### Propósito
El alumno ingresa a una sala mediante un código corto. Sin registro, sin contraseña. Este es el primer contacto del alumno con MatchClass.

### Elementos obligatorios

| Elemento | Comportamiento |
|---|---|
| Logo / nombre MatchClass | Misma versión que en login, sin cambios |
| Título "Ingresá tu código" | Texto claro, tamaño de título |
| Subtítulo "Ingresá el código que te dio tu ayudante" | Texto secundario, ayuda contextual |
| Campo de código | Input de texto, centrado, idealmente 4-6 caracteres. Sin placeholder engañoso |
| Botón "Ingresar" | Botón primario, full-width en mobile |
| Indicador de sala encontrada (post-código) | Al ingresar código válido, mostrar nombre de la sala antes de pedir nombre |

### Estados

| Estado | Comportamiento visual |
|---|---|
| **Reposo** | Input vacío, botón deshabilitado si no hay texto |
| **Código inválido** | Input con borde rojo + mensaje "Código inválido. Revisá con tu ayudante" |
| **Sala cerrada** | Mensaje "Esta sala ya no acepta respuestas" (si status = closed) |
| **Cargando** | Botón muestra spinner |
| **Código válido** | Transición a la pantalla de nombre del alumno. Mostrar nombre de la sala tipo "Estructuras de Datos - Secc 1" |

### Pantalla posterior (nombre del alumno)

Después del código válido, mostrar una pantalla simple:

| Elemento | Comportamiento |
|---|---|
| Nombre de la sala | En grande, como confirmación |
| Campo "Tu nombre" | Input de texto. Solo nombre, sin email |
| Botón "Entrar a la grilla" | Botón primario |
| Nota de privacidad | Texto pequeño "Tu nombre solo lo verá el ayudante" |

### Flujo completo del alumno
1. Alumno abre la app o llega por enlace
2. Ve la pantalla de código
3. Ingresa código → sistema valida contra Firestore
4. Código válido → ve nombre de la sala + campo para su nombre
5. Ingresa nombre → entra a la grilla de bloques (futura HU)
6. Código inválido → ve error

### Diseño responsive

| Breakpoint | Comportamiento |
|---|---|
| Mobile (< 768px) | Una sola columna, input grande (fácil de tocar), botón grande |
| Desktop (≥ 768px) | Card centrado con ancho máximo 400px. Todo igual que login en estructura |

### Restricciones de marca
- Misma paleta que login. Coherencia visual obligatoria
- Sin autenticación visible — el alumno no debe ver "cerrar sesión", "registrarse" ni nada de auth
- El logo debe ser el mismo en ambas pantallas para reforzar marca
- Sans serif (Inter) en toda la interfaz del alumno
- Área táctil mínima 44×44px en todos los botones y campos (WCAG 2.2)

---

## Consideraciones generales para ambas pantallas

### Estado de carga inicial
Mientras Firebase restaura una sesión previa (ayudante) o crea la anónima (alumno), mostrar un **skeleton/spinner** antes de decidir qué pantalla mostrar. No debe verse un flash de login si el ayudante ya tiene sesión activa.

### Dark mode
Ambas pantallas deben funcionar en modo claro y oscuro. Los inputs, cards y textos deben adaptarse via las variables CSS `--mc-*` ya definidas.

### Accesibilidad
- Contraste de texto ≥ 4.5:1 (WCAG AA)
- Focus visible en todos los elementos interactivos
- Labels asociados a inputs (`htmlFor` / `aria-label`)
- Mensajes de error con `role="alert"`
- Sin información solo por color (los errores deben tener icono o texto además del borde rojo)

### Lo que NO debe estar en estas pantallas
- ❌ Links a "PWA", "modo oscuro", "configuración"
- ❌ Sidebar, topbar, navegación
- ❌ Publicidad, banners, features de la app
- ❌ Información de otras salas o usuarios

---

## Referencias

- **Paleta de colores completa:** `docs/tech-document.md §6` — usar las variables `$brand-*`, `$neutral-*`, `$text-*`, `$bg-*`, `$border-*`
- **Tipografía:** Inter (headings + body)
- **Iconografía:** Lucide, trazo 2px, 22px default
- **Entidades:** `docs/tech-document.md §2` — modelo de datos para referencia de conceptos (Sala, Response, User)
- **RCs relacionados:** RC-003 (Auth ayudante) y RC-005 (Respuesta alumno) para contexto de negocio
