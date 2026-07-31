# Feedback para Disenador — Iteracion 3: Recuperar Contrasena

**De:** Jefe de Proyecto
**Para:** Disenador UI/UX
**Archivo:** `matchclass_design.pen`

---

## Nueva pantalla: Recuperar Contrasena

Ruta: `/recuperar`. Se llega desde el link "Olvidaste tu contrasena?" del tab Ayudante en `/acceso`.

Sigue el mismo patron visual que el login: card centrado 400px, sin tabs, sin sidebar.

---

## Layout

Dos estados en la misma pantalla:

### Estado 1: Ingreso de email

```
+---------------------------------+
|          Logo MatchClass         |
|                                  |
|   "Recupera tu contrasena"       |
|   "Te enviaremos un link         |
|    para restablecerla"           |
|                                  |
|   Email          [input]         |
|                                  |
|   [Enviar link] (boton ppal)     |
|                                  |
|   Volver a Inicio de sesion      |
|   (link)                         |
+---------------------------------+
```

### Estado 2: Confirmacion de envio

```
+---------------------------------+
|          Logo MatchClass         |
|                                  |
|   "Revisa tu email"              |
|   "Si existe una cuenta con ese  |
|    email, recibiras un link      |
|    para restablecer tu           |
|    contrasena"                   |
|                                  |
|   [Volver al inicio] (boton)     |
+---------------------------------+
```

## Elementos

| Elemento | Comportamiento |
|---|---|
| Logo | Misma version que en login |
| Titulo estado 1 | "Recupera tu contrasena" |
| Subtitulo estado 1 | "Te enviaremos un link para restablecerla" |
| Email | Input de texto estandar. Placeholder: "tu@email.com" |
| Boton "Enviar link" | Boton primario, full-width. Deshabilitado si email vacio |
| Link "Volver a inicio de sesion" | Vuelve a `/acceso` |
| Titulo estado 2 | "Revisa tu email" |
| Mensaje estado 2 | Texto informativo: "Si existe una cuenta con ese email, recibiras un link para restablecer tu contrasena" |
| Boton "Volver al inicio" | Boton secundario o ghost, vuelve a `/acceso` |

## Estados

| Estado | Comportamiento |
|---|---|
| **Reposo** | Input vacio, boton deshabilitado |
| **Cargando** | Boton con spinner, campo deshabilitado |
| **Email invalido** | Borde rojo + "Ingresa un email valido" |
| **Envio exitoso** | Transicion al estado 2 (confirmacion) |
| **Error de red** | Error alert: "Error de conexion. Intenta de nuevo" |

## Especificaciones

- **Desktop (>= 1024px):** Card centrado 400px. Fondo `$bg-page`
- **Mobile:** Postergado
- **Componentes reutilizables:** `Text Input`, `Primary Button`, `Error Alert`, `Logo Component`
- **Paleta:** `docs/tech-document.md §6`

## Referencia

- Patron visual: `Acceso Desktop - Ayudante` (frame `NklB8`)
- Nota de idioma: usar espanol neutro, forma "tu" (ver `docs/estandar-idioma.md`)
