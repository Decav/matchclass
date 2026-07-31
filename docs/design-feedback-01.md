# Feedback para Diseñador — Iteración 1

**De:** Jefe de Proyecto
**Para:** Diseñador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Cambio de enfoque: unificación de pantallas

Las pantallas de **Login Ayudante** e **Ingreso Alumno** ahora se unifican en una **sola página** con tabs. Ver `docs/design-instrucciones.md` para la especificación completa.

### Estado actual en el archivo .pen

| Pantalla | ¿Sirve? | Qué hacer |
|---|---|---|
| `Login Ayudante` (HL5v6, mobile) | ❌ Reemplazar | Ahora es el tab "Ayudante" dentro de la página unificada |
| `Login Ayudante Desktop` (qGCl0, desktop) | ❌ Reemplazar | Pasa a ser la variante desktop del card con tabs |
| `Ingreso Alumno - Código` (WYbr6) | ❌ Reemplazar | Ahora es el tab "Alumno" dentro de la misma página |
| `Ingreso Alumno - Nombre` (k5MY6) | ✅ Conservar | Sigue siendo el paso posterior (nombre del alumno) |
| `Auth Components` (kIcgx) | ✅ Conservar | Los componentes reutilizables siguen igual |

### Lo nuevo a diseñar

Diseñar una página `/acceso` (un único frame top-level en reemplazo de los frames actuales) con:

1. **Card centrado** con logo en la parte superior
2. **Dos tabs:** "Ayudante" | "Alumno" (el default es Ayudante)
3. **Contenido del tab Ayudante** (email + password + botón + links) — reuse componentes existentes
4. **Contenido del tab Alumno** (6 celdas de código + botón "Ingresar") — reuse el diseño de celdas que ya existe
5. **Pantalla de nombre del alumno** — conservar el frame existente `Ingreso Alumno - Nombre` como pantalla posterior

### Requerido (solo desktop por ahora)

| Item | Desktop (≥ 1024px) |
|---|---|
| Página `/acceso` con tabs | ✅ Card centrado 400px |
| Tab Ayudante con formulario (email + password + links) | ✅ |
| Tab Alumno con código (6 celdas) | ✅ |
| Estados de error visibles en ambos tabs | ✅ |
| Loading state del botón | ✅ |
| Pantalla nombre alumno (post-código) | ✅ falta crear |

### Prioridad

**Solo desktop por ahora.** El responsive mobile se posterga para una iteración posterior. No diseñar variantes mobile.

### Archivo de referencia

`docs/design-instrucciones.md` tiene toda la especificación detallada.
