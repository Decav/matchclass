# MatchClass — Frontend Rules

## Reglas no negociables

- Mantener arquitectura NDK.
- No modificar capas, aliases, design system ni patrones base sin aprobacion.
- Flujo de datos: Component -> Hook -> Service -> Repository -> api.
- Query keys centralizadas.
- Sin `any`.

## Integracion

- Los tipos request/response en `src/resources/` son fuente de verdad.
- Los endpoints se definen primero en el RC.
- No llamar APIs directamente desde componentes.
