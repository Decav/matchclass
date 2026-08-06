# Feedback para Disenador — Iteracion 5: Crear Sala

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Crear Sala

Se llega desde el boton "Nueva sala" o "Crear primera sala" del dashboard. Es un flujo de dos pasos dentro del AppShell (sidebar + topbar).

---

## Paso 1: Formulario de creacion

### Layout

Dentro del area de contenido del AppShell (sidebar + topbar ya visibles), mostrar el formulario de creacion. Puede ser un card centrado o un formulario a ancho completo dentro del area de contenido.

```
[Sidebar] | [Topbar: "Nueva sala"]
          |
          |  "Crear nueva sala"
          |  "Configura los datos de tu sala de coordinacion"
          |
          |  Nombre de la sala    [input]
          |  Asignatura           [input]
          |  Seccion              [input]
          |
          |  [Crear sala]  [Cancelar]
```

### Elementos

| Elemento | Comportamiento |
|---|---|
| Breadcrumb o titulo en topbar | "Nueva sala" |
| Titulo | "Crear nueva sala" |
| Subtitulo | "Configura los datos de tu sala de coordinacion" |
| Nombre de la sala | Input de texto. Placeholder: "Ej: Estructuras de Datos - Secc 1" |
| Asignatura | Input de texto. Placeholder: "Ej: Estructuras de Datos" |
| Seccion | Input de texto. Placeholder: "Ej: 1" |
| Boton "Crear sala" | Boton primario. Deshabilitado si campos vacios |
| Boton "Cancelar" | Boton secundario/ghost. Vuelve al dashboard |

### Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Formulario limpio |
| **Cargando** | Boton con spinner, campos deshabilitados |
| **Campo vacio** | Borde rojo + "Este campo es obligatorio" |
| **Exito** | Transicion al paso 2 |

---

## Paso 2: Sala creada — confirmacion

Despues de crear la sala, mostrar el codigo generado y opciones para compartir.

```
[Sidebar] | [Topbar: "Sala creada"]
          |
          |  "Sala creada"
          |
          |  Estructuras de Datos - Secc 1
          |  Codigo: [ EDS101 ]  [Copiar]
          |
          |  Comparte este codigo con tus alumnos
          |
          |  [Configurar mis bloques]  [Ir al dashboard]
```

### Elementos

| Elemento | Comportamiento |
|---|---|
| Titulo | "Sala creada" con icono de check |
| Nombre de la sala | En grande, para confirmar |
| Codigo | En JetBrains Mono, dentro de un box con fondo. Boton "Copiar" al lado |
| Subtitulo | "Comparte este codigo con tus alumnos" |
| Boton "Configurar mis bloques" | Accion primaria (proximo HU) |
| Boton "Ir al dashboard" | Boton secundario |

---

## Especificaciones

- **Layout:** Dentro del AppShell (sidebar + topbar existentes). No es una pantalla sin sidebar — el ayudante ya esta autenticado
- **Desktop:** >= 1024px. Mobile postergado
- **Componentes reutilizables:** Usar `Text Input`, `Primary Button`, `Room Card Component` (si aplica)
- **Paleta:** `docs/tech-document.md §6`
- **Idioma:** Espanol neutro, forma "tu" (`docs/estandar-idioma.md`)
- **Tipografia:** Inter para textos, JetBrains Mono para el codigo

## Referencias

- AppShell: `Dashboard Ayudante` en `matchclass_design.pen`
- HU-06: `docs/hu-06-dashboard-ayudante.md` (flujo desde el boton "Nueva sala")
- RC-004: `docs/tech-document.md` (gestion de salas)
