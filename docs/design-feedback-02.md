# Feedback para Diseñador — Iteración 2: Pantalla de Registro

**De:** Jefe de Proyecto
**Para:** Diseñador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla necesaria: Registro de Ayudante

Ruta: `/registro`. Es una página independiente (sin tabs), a la que se llega desde el link "Registrarse" del tab Ayudante en `/acceso`.

Debe seguir **exactamente el mismo patrón visual** que `Acceso Desktop - Ayudante`, pero con el formulario de registro en lugar del de login.

---

## Layout

```
┌─────────────────────────────────┐
│          Logo MatchClass        │
│                                 │
│   "Creá tu cuenta" (título)     │
│   "Completá tus datos para      │
│    registrarte como ayudante"   │
│                                 │
│   ─── Formulario ───            │
│   Nombre completo [input]       │
│   Email          [input]        │
│   Contraseña     [input + ojo]  │
│   Confirmar      [input + ojo]  │
│                                 │
│   [Crear cuenta] (botón ppal)   │
│                                 │
│   ¿Ya tenés cuenta?             │
│   Iniciá sesión (link)          │
└─────────────────────────────────┘
```

## Elementos

| Elemento | Comportamiento |
|---|---|
| Logo | Misma versión que en login |
| Título | "Creá tu cuenta" |
| Subtítulo | "Completá tus datos para registrarte como ayudante" |
| Nombre completo | Input de texto. Placeholder: "Ej: María González" |
| Email | Input de texto con teclado @ en mobile |
| Contraseña | Input con toggle de visibilidad (ojo) |
| Confirmar contraseña | Input con toggle de visibilidad |
| Botón "Crear cuenta" | Botón primario, full-width. Deshabilitado si hay campos vacíos |
| Link "Iniciá sesión" | Vuelve a `/acceso` |

## Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Formulario limpio, placeholders visibles |
| **Cargando** | Botón con spinner, campos deshabilitados |
| **Email duplicado** | Error alert: "Este email ya está registrado. Iniciá sesión" |
| **Contraseña débil** | Validación inline: "La contraseña debe tener al menos 6 caracteres" |
| **Confirmación no coincide** | Validación inline: "Las contraseñas no coinciden" |
| **Campo vacío** | Borde rojo + "Este campo es obligatorio" |
| **Error de red** | Error alert: "Error de conexión. Intentá de nuevo" |
| **Éxito** | Redirige al dashboard |

## Especificaciones de diseño

- **Desktop (≥ 1024px):** Card centrado con ancho máximo **400px**. Fondo `$bg-page`. Sin sidebar ni navegación
- **Mobile:** Postergado (misma prioridad que el login)
- **Paleta:** Misma que login — `$brand-*`, `$neutral-*`, `$text-*`, `$bg-*`, `$border-*`
- **Componentes reutilizables:** Usar los mismos `Text Input`, `Password Input`, `Primary Button`, `Error Alert` y `Logo Component` de Auth Components
- **Dark mode:** Asegurar que se vea correctamente en ambos modos

## Referencias

- Patrón visual: `Acceso Desktop - Ayudante` (frame `NklB8`)
- HU-02: `docs/hu-02-registro-ayudante.md` (especificación completa de validaciones y escenarios)
- Paleta: `docs/tech-document.md §6`
