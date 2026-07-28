# Requirements — Specification-Driven Development (SDD)

## Principio

En SDD, **la spec se escribe antes que el código**. El requirement es el contrato entre el equipo de negocio (qué construir) y el equipo de desarrollo (cómo construirlo). Claude usa estos archivos como entrada para generar código que respeta la arquitectura NDK.

## Flujo

```
1. El equipo crea/copia el template → RC-{código}.md
2. Llena TODAS las secciones obligatorias
3. Revisión por líder técnico (aprueba o pide cambios)
4. Claude lee el RC aprobado + el SKILL.md de arquitectura
5. Claude implementa siguiendo el flujo SDD del CLAUDE.md
6. El equipo valida contra los criterios de aceptación del RC
```

## Convención de archivos

| Patrón | Ejemplo | Descripción |
|--------|---------|-------------|
| `rc{NNN}.md` | `rc001.md` | Requirement completo aprobado |
| `rc{NNN}-draft.md` | `rc002-draft.md` | Borrador en revisión (NO ejecutar) |
| `RC-TEMPLATE.md` | — | Template base para copiar |

## Reglas

1. **No implementar sin RC aprobado.** Si el requirement está en `draft`, Claude debe responder: "Este RC está en borrador. Necesita aprobación antes de implementar."
2. **Un RC = un módulo o feature.** No mezclar dominios en un solo RC.
3. **Los endpoints deben estar documentados.** Sin tabla de endpoints, Claude no puede generar repositories ni MSW handlers correctamente.
4. **Los criterios de aceptación son testeables.** Cada criterio debe poder verificarse con un test automatizado.
5. **El RC es inmutable después de aprobado.** Si hay cambios, crear un nuevo RC que referencia al anterior.
