# MatchClass — SDD

## Regla principal

- Sin RC aprobado, no se implementa codigo.
- RC draft implica solo analisis.

## Ubicación

- `.claude/requirements/README.md`
- `.claude/requirements/RC-TEMPLATE.md`
- `.claude/requirements/rc{NNN}.md`

## Flujo minimo

1. Leer RC completo.
2. Leer `.claude/skills/react-architecture/SKILL.md`.
3. Implementar contratos, infraestructura, modulos y tests segun el RC.
4. Validar con type-check, tests y lint.
5. Si aplica, ejecutar `sdd-verify`.
