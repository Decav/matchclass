CreateRequirementPrompt.md
Necesito que crees un requerimiento para la siguiente funcionalidad, Tienes que seguir la estructura del archivo RC-TEMPLATE.md y segun el modulo especificado,
se debe generar el archivo [rcxxx.md] dentro de la carpeta .claude.requirements.

Requerimiento: 

[

# HU-14: Modo oscuro

**Proyecto:** MatchClass

**Epica:** General

**Prioridad:** Media

**Story Points:** 2

---

## Narrativa (INVEST)

**Como** usuario,

**quiero** alternar entre modo claro y modo oscuro en la plataforma,

**para** tener una experiencia visual comoda segun mis preferencias o condiciones de luz.

---

## Descripcion / Contexto

Todas las pantallas de MatchClass deben soportar modo claro y modo oscuro. Los tokens de color ya estan definidos en `theme.css` con sus variantes dark bajo el selector `[data-theme="dark"]`. Esta HU implementa el mecanismo de toggle y persistencia.

El toggle se ubica en el topbar del AppShell (area autenticada) y usa el icono de sol/luna de Lucide. La preferencia se guarda en `localStorage` y al cargar la app se respeta la preferencia guardada. Si no hay preferencia guardada, se respeta la configuracion del sistema operativo (`prefers-color-scheme`).

El toggle debe ser visible en todas las pantallas que usan AppShell (dashboard, crear sala, restricciones, resultados). Las pantallas publicas (landing, acceso, registro, recuperar) tambien deben reaccionar al tema activo pero no necesitan mostrar el toggle.

---

## Especificaciones / Contrato

- **Mecanismo:** `document.documentElement.setAttribute('data-theme', 'dark')` y `removeAttribute('data-theme')` para claro
- **Persistencia:** `localStorage.setItem('matchclass-theme', theme)`
- **Preferencia inicial:**
    1. Leer `localStorage['matchclass-theme']`
    2. Si no existe, usar `window.matchMedia('(prefers-color-scheme: dark)').matches`
    3. Default: claro
- **Ubicacion del toggle:** Topbar del AppShell, icono sol/luna de Lucide
- **Sin cambios en CSS:** `theme.css` ya tiene todas las variables definidas para ambos modos

---

## Criterios de Aceptacion (Gherkin)

### Escenario 1: Alternar a modo oscuro

- **GIVEN** el usuario esta en modo claro (default)
- **WHEN** presiona el toggle de tema en el topbar
- **THEN** todas las pantallas cambian a modo oscuro
- **AND** el fondo, textos, inputs y cards usan los colores dark definidos en `theme.css`
- **AND** el icono cambia a sol (indicando "cambiar a modo claro")
- **AND** la preferencia se guarda en `localStorage`

### Escenario 2: Alternar a modo claro

- **GIVEN** el usuario esta en modo oscuro
- **WHEN** presiona el toggle de tema
- **THEN** todas las pantallas cambian a modo claro
- **AND** el icono cambia a luna (indicando "cambiar a modo oscuro")

### Escenario 3: Persistencia al recargar

- **GIVEN** el usuario selecciono modo oscuro previamente
- **WHEN** recarga la pagina o cierra y vuelve a abrir la app
- **THEN** la app carga en modo oscuro automaticamente
- **AND** el toggle refleja el estado correcto

### Escenario 4: Respetar preferencia del sistema

- **GIVEN** el usuario nunca cambio el tema (sin preferencia en localStorage)
- **AND** su sistema operativo esta en modo oscuro
- **WHEN** abre la aplicacion por primera vez
- **THEN** la app carga en modo oscuro

### Escenario 5: Pantallas publicas reaccionan al tema

- **GIVEN** el usuario cambio a modo oscuro en el AppShell
- **WHEN** navega a una pantalla publica (`/acceso`, `/`, `/registro`, `/recuperar`)
- **THEN** la pantalla se muestra en modo oscuro
- **AND** los inputs, cards y textos usan los colores del tema activo

### Escenario 6: Contraste WCAG AA en ambos modos

- **GIVEN** la app esta en modo oscuro
- **THEN** todos los textos mantienen un contraste >= 4.5:1 contra su fondo
- **AND** los elementos interactivos mantienen contraste >= 3:1

---

## Comportamiento Visual (UI/UX)

- **Toggle:** Icono de sol (modo oscuro activo) o luna (modo claro activo) en el topbar, a la derecha. Tamano 20-22px. Tooltip "Modo oscuro" / "Modo claro"
- **Transicion:** El cambio de tema debe ser instantaneo, sin animacion de fade
- **Sin flash:** Al cargar la app, aplicar el tema antes del primer render para evitar un flash blanco

---

## Definition of Done (DoD)

- [ ] El toggle de tema funciona en todas las pantallas con AppShell
- [ ] La preferencia persiste en localStorage y se respeta al recargar
- [ ] Sin preferencia guardada, se usa la configuracion del sistema operativo
- [ ] Las pantallas publicas reaccionan al tema activo
- [ ] No hay flash de tema incorrecto al cargar la app
- [ ] El contraste cumple WCAG AA en ambos modos
- [ ] La HU cumple con los criterios de aceptacion validados por QA


]

Notas: revisar el archivo pencil, para revisar los diseños desktop

Recuerda no implementar nada que no se haga mencion y tambien nunca aplicar cambios sin antes preguntarme, por otro lado si tienes algo que proponer, consultalo conmigo primero para poder aprobarlo o desaprobarlo.
Limitate siempre a seguir las instrucciones de los archivos .md (CLAUDE.md y skills) y no intentes hacer cambios en archivos que no se mencionen en el requerimiento.
