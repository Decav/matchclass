/**
 * Estado de la sesión del ayudante. Distingue "aún no se sabe" (`Idle` /
 * `Loading`, mientras Firebase restaura la sesión) de "no hay sesión"
 * (`Unauthenticated`) — sin esto se muestra un flash de login en cada F5.
 *
 * `as const` en vez de `enum`: mejor tree-shaking, sin código JS extra
 * (ver SKILL.md, anti-patrones TypeScript).
 */
export const AuthStatus = {
  Idle: 'idle',
  Loading: 'loading',
  Authenticated: 'authenticated',
  Unauthenticated: 'unauthenticated',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];
