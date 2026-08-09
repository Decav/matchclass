# Feedback para Disenador — Iteracion 8: Acciones de Sala y Dialogo de Confirmacion

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Ajuste necesario para HU-10

La HU-10 requiere poder cerrar, reabrir y eliminar salas. Para esto hacen falta dos cosas en el diseno:

---

## 1. Agregar acciones al Room Card Component

El componente `Room Card Component` (`uksGB`) actualmente tiene dos acciones: "Abrir" y "Copiar". Necesita dos mas:

| Accion | Cuando se muestra | Icono sugerido |
|---|---|---|
| "Cerrar sala" | Solo en salas activas | `XCircle` o `Lock` |
| "Eliminar sala" | Siempre visible | `Trash2` |

Las acciones pueden ir en un menu desplegable (kebab `...`) o como iconos adicionales en la fila de acciones existente. A eleccion del disenador.

Para la **reaccion "Reabrir sala"**, usar el mismo boton de "Cerrar sala" cambiando el label — si la sala esta cerrada, el boton dice "Reabrir sala".

## 2. Componente de dialogo de confirmacion

Crear un componente reutilizable de dialogo/modal para confirmar acciones destructivas:

```
┌──────────────────────────────────┐
│  [Icono warning]                 │
│                                  │
│  "¿Cerrar esta sala?"            │
│  "No se aceptaran mas            │
│   respuestas de alumnos"         │
│                                  │
│  [Cancelar]    [Cerrar sala]     │
└──────────────────────────────────┘
```

| Elemento | Comportamiento |
|---|---|
| Icono | Warning o danger (triangulo o circulo rojo) |
| Titulo | Pregunta de confirmacion |
| Mensaje | Descripcion de la consecuencia |
| Boton cancelar | Boton secundario/ghost. Cierra el dialogo |
| Boton confirmar | Boton danger (rojo) para delete, boton primario/default para close |

**Variantes:** El mismo componente se usa para:
- Cerrar sala: titulo "¿Cerrar esta sala?", mensaje "No se aceptaran mas respuestas", boton "Cerrar sala" (normal)
- Eliminar sala: titulo "¿Eliminar esta sala?", mensaje "Esta accion no se puede deshacer", boton "Eliminar" (danger/rojo)

## Especificaciones

- **Desktop:** >= 1024px. Mobile postergado
- **Componente reutilizable:** El dialogo debe ser un componente standalone que se pueda instanciar con diferentes titulos, mensajes y colores de boton
- **Paleta e idioma:** Igual que el resto

## Referencias

- Componente base: `Room Card Component` (`uksGB`)
- HU-10: `docs/hu-10-gestionar-sala.md`
