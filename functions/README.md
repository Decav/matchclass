# functions — Cloud Functions de MatchClass

Workspace independiente de la app cliente (RC-017 §10 D1): tiene su propio
`package.json`, su propio `tsconfig` y sus propias dependencias. Nada de `src/`
importa desde acá, ni al revés.

## Qué hay

`cleanupAnonymousAccounts` (HU-15) — job programado que, una vez al día, borra
de Firebase Auth las cuentas anónimas sin actividad en 90 días, salteando las de
alumnos que respondieron en una sala todavía `active`. **Los documentos de
`rooms/{roomId}/responses/{uid}` no se tocan nunca**: los datos de matching valen
más que un cleanup perfecto.

| Archivo | Rol |
|---------|-----|
| `src/cleanup/select-stale-anonymous.ts` | La regla, pura y testeada: quién califica para borrarse |
| `src/cleanup/collect-protected-uids.ts` | Los uids intocables, leídos de las salas activas |
| `src/cleanup/run-cleanup.ts` | Orquestación: recolectar → paginar → seleccionar → borrar → loguear |
| `src/cleanup/cleanup-config.ts` | Región, horario, umbral y el interruptor de dry-run |
| `src/index.ts` | Cableado con `onSchedule`. Sin lógica |

## Comandos

Desde este directorio (o desde la raíz con `npm run functions:*`):

```bash
npm run type-check   # tsc --noEmit sobre src + tests
npm run test         # vitest: unitarios + integración contra emuladores
npm run build        # compila a lib/ (sin los tests)
```

Los tests de integración necesitan `npm run emulators` corriendo en la raíz. Si
los emuladores no responden, esos tests **se saltean** con el motivo a la vista
(`vitest run --reporter=verbose` lo muestra), no fallan.

## Dry-run: primero mirar, después borrar

`CLEANUP_DRY_RUN` arranca en `true` y **solo el valor literal `'false'` habilita
el borrado real**. En dry-run el job recorre todo, loguea el `CleanupReport`
completo y una muestra de los uids que borraría, y no llama a `deleteUsers` ni
una vez.

La asimetría es a propósito: el borrado es irreversible, el job corre solo de
madrugada y hay un único proyecto de Firebase, sin staging. Una variable vacía o
mal escrita tiene que degradar a "no borres nada".

## Despliegue — paso manual (RC-017 §10 D4)

Ni el agente implementador ni la IA ejecutan `firebase deploy`: es una acción
irreversible sobre el único proyecto real, que además programa un job que borra
cuentas.

1. Desplegar con el dry-run puesto (el default, no hace falta declarar nada):

   ```bash
   firebase deploy --only functions:cleanupAnonymousAccounts
   ```

2. Esperar la primera corrida (03:00 `America/Santiago`) o dispararla a mano
   desde Cloud Scheduler, y leer el `CleanupReport` en Cloud Logging: cuántas
   cuentas se escanearon, cuántas eran anónimas, cuántas quedaron protegidas por
   una sala activa y cuántas se borrarían.

3. Recién si esos números tienen sentido, habilitar el borrado real definiendo
   `CLEANUP_DRY_RUN=false` en la configuración de la función y redesplegando. La
   variable se lee en cada invocación, no al desplegar.

Región `southamerica-east1` y zona `America/Santiago` viven en
`src/cleanup/cleanup-config.ts`. Cambiar la región después del primer deploy
obliga a borrar y recrear la función.
