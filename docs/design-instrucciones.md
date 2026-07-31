# Instrucciones para Diseñador — Pantalla de Acceso

**Proyecto:** MatchClass
**Remitente:** Jefe de Proyecto
**Destinatario:** Diseñador UI/UX
**Prioridad:** Alta

---

## Concepto

Una sola pantalla en la ruta `/acceso` con dos tabs: **Ayudante** y **Alumno**. Cada tab tiene su propio formulario. El tab activo se refleja en la URL vía query param: `/acceso?tipo=ayudante` (default) o `/acceso?tipo=alumno` para permitir enlaces directos.

| Actor | Tab | Formulario | Redirección post-éxito |
|---|---|---|---|
| Ayudante | "Ayudante" | Email + password | Dashboard |
| Alumno | "Alumno" | Código de sala → nombre | Grilla de bloques |

---

## Layout general (aplica a mobile y desktop)

### Estructura del card

Un solo card centrado que contiene todo. El contenido cambia según el tab activo.

```
┌─────────────────────────────────┐
│          Logo MatchClass        │
│                                 │
│    [ Ayudante  |  Alumno ]      │  ← tabs
│                                 │
│   ─── Contenido del tab ───     │
│                                 │
│   (email + password)            │  ← si tab Ayudante
│   o (campo código + botón)      │  ← si tab Alumno
│                                 │
│   ─────────────────────────     │
│   Links / notas al pie          │
└─────────────────────────────────┘
```

### Tabs

| Estado | Ayudante | Alumno |
|---|---|---|
| **Inactivo** | Texto neutral, sin fondo | Texto neutral, sin fondo |
| **Activo** | Texto con color brand, línea/borde inferior indicador | Mismo estilo |
| **Hover** | Cambio sutil de opacidad o color | Igual |

Los tabs deben ser dos botones/labels lado a lado, mismo ancho, sin iconos. El activo se distingue con un indicador visual abajo (línea o underline).

El tab por defecto es **Ayudante**.

---

## Tab Ayudante (email + password)

### Elementos

| Elemento | Comportamiento |
|---|---|
| Logo / nombre MatchClass | Arriba del card, fuera de los tabs. Versión simplificada, sin eslogan |
| Campo email | Input de texto, teclado con @ en mobile |
| Campo password | Input con toggle de visibilidad (ojo) |
| Botón "Iniciar sesión" | Botón primario, full-width |
| Link "¿Olvidaste tu contraseña?" | Texto secundario, abre flujo de reset |
| Link "Registrarse" | Texto secundario "¿No tenés cuenta? Registrarse" |
| Mensaje de error general | Arriba del formulario, sin desplazar el layout |

### Estados

| Estado | Comportamiento visual |
|---|---|
| **Reposo** | Formulario limpio, placeholders visibles |
| **Cargando** | Botón muestra spinner, campos deshabilitados |
| **Error credenciales** | Mensaje "Email o contraseña incorrectos" arriba del formulario. Campos no se limpian |
| **Error de red** | Mensaje "Error de conexión. Intentá de nuevo" |
| **Campo inválido** | Borde rojo en el campo + mensaje debajo |
| **Éxito** | Transición al dashboard |

---

## Tab Alumno (código de sala)

### Elementos

| Elemento | Comportamiento |
|---|---|
| Logo / nombre MatchClass | Misma posición que en tab Ayudante (compartido) |
| Título "Ingresá tu código" | Texto claro |
| Subtítulo "Ingresá el código que te dio tu ayudante" | Texto secundario |
| Campo de código | Input segmentado en 6 celdas individuales (44×54px cada una). No placeholder |
| Botón "Ingresar" | Botón primario, full-width |
| Indicador de sala encontrada | Al ingresar código válido, mostrar nombre de la sala antes de pedir nombre |
| Error alert | Componente de error reutilizable |

### Estados

| Estado | Comportamiento visual |
|---|---|
| **Reposo** | 6 celdas vacías, botón deshabilitado si no están todas completas |
| **Código inválido** | Borde rojo en celdas + alert "Código inválido. Revisá con tu ayudante" |
| **Sala cerrada** | Alert "Esta sala ya no acepta respuestas" |
| **Cargando** | Botón muestra spinner |
| **Código válido** | Transición a la pantalla de nombre del alumno |

### Pantalla de nombre del alumno (post-código)

Después del código válido, el card muestra:

| Elemento | Comportamiento |
|---|---|
| Logo | Misma posición |
| Nombre de la sala | En grande, como confirmación |
| Badge o icono de sala | Opcional, para reforzar |
| Campo "Tu nombre" | Input de texto. Solo nombre, sin email |
| Botón "Entrar a la grilla" | Botón primario |
| Nota de privacidad | Texto pequeño "Tu nombre solo lo verá el ayudante" |

Esta pantalla NO lleva tabs — es un paso siguiente dentro del flujo del alumno.

---

## Prioridad: Desktop

Diseñar primero y únicamente para **Desktop (≥ 1024px)**. La versión mobile se define en una iteración posterior.

| Breakpoint | Prioridad |
|---|---|
| **Desktop (≥ 1024px)** | ✅ Diseñar ahora — card centrado con ancho máximo 400px. Fondo con `$bg-page`. Tabs horizontales centrados |
| **Mobile (< 768px)** | ⏳ Postergado — se define después |

---

## Estados de carga inicial

Mientras Firebase restaura sesión previa (ayudante) o evalúa la ruta, mostrar un **spinner/skeleton con el logo** en el centro de la pantalla. Sin mostrar ningún tab ni formulario hasta que se sepa si hay sesión activa.

---

## Restricciones de marca (aplican a ambos tabs)

- Paleta de colores: `docs/tech-document.md §6`
- Tipografía: Inter (textos), JetBrains Mono solo si se usa en datos numéricos
- Iconografía: Lucide, trazo 2px, 22px default
- Sin ilustraciones ni imágenes decorativas
- Sin sidebar, topbar, ni navegación en esta pantalla

### Accesibilidad

- Contraste ≥ 4.5:1
- Focus visible en tabs, inputs, botones
- Tabs navegables con teclado (tab / arrow keys)
- Área táctil mínima 44×44px
- Error alert con `role="alert"`

### Dark mode

Ambos tabs deben verse correctamente en modo claro y oscuro. Usar variables `--mc-*`.

---

## Lo que NO debe estar

- ❌ Enlaces a "PWA", "modo oscuro", "configuración"
- ❌ Sidebar, topbar, navegación
- ❌ Publicidad, banners
- ❌ Información de otras salas o usuarios
- ❌ Botón de cierre de sesión (no hay sesión aún)

---

## Referencias

- **Paleta completa:** `docs/tech-document.md §6`
- **Tipografía:** Inter (headings + body)
- **Iconografía:** Lucide, trazo 2px
- **Entidades:** `docs/tech-document.md §2`
- **RC relacionados:** RC-003 (Auth ayudante), RC-005 (Respuesta alumno)
- **Feedback anterior:** `docs/design-feedback-01.md`
