import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      'playwright-report',
      'test-results',
      // Plantillas de referencia de las skills: no son codigo del proyecto
      // y no estan en ningun tsconfig.
      '.claude/**',
    ],
  },

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      // v7 expone el flat config bajo `configs.flat`; `configs['recommended-latest']`
      // sigue siendo eslintrc y ESLint 9 lo rechaza.
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Regla no negociable del proyecto (CLAUDE.md): sin `any`
      '@typescript-eslint/no-explicit-any': 'error',

      // Los casts silencian errores en vez de corregirlos. Ver SKILL.md, anti-patrones.
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
      ],

      // Firebase y React Query devuelven muchas promesas: no dejarlas sueltas
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // Imports de tipo explícitos — requerido por verbatimModuleSyntax
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // console.* no es estrategia de debugging (SKILL.md)
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  // El SDK de Firebase solo puede importarse desde library/
  {
    files: ['src/global/**/*.{ts,tsx}', 'src/modules/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase/*'],
              message:
                'El SDK de Firebase vive solo en src/library/. Accede vía un repository (component -> hook -> repository -> SDK).',
            },
          ],
        },
      ],
    },
  },

  // Excepción: los tests SÍ pueden importar `firebase/app` (`FirebaseError`)
  // para simular códigos de error reales sin pegarle a Firebase — ver
  // 08-testing.md "Simular un error de Firebase en un test". El repository
  // que consume el error real sigue viviendo solo en library/.
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // resources es agnóstico: sin React, sin Axios, sin Firebase
  {
    files: ['src/resources/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'firebase', 'firebase/*', 'axios', '@library/*', '@global/*', '@modules/*'],
              message:
                'src/resources/ es agnóstico: solo TypeScript puro y Zod. No importa React, Firebase ni otras capas.',
            },
          ],
        },
      ],
    },
  },

  // library no tiene JSX
  {
    files: ['src/library/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', '@global/*', '@modules/*'],
              message: 'src/library/ no renderiza componentes ni depende de capas superiores.',
            },
          ],
        },
      ],
    },
  },

  // La config de Vite/Playwright y los scripts de e2e corren en Node, no en el browser
  {
    files: ['vite.config.ts', 'eslint.config.js', 'playwright.config.ts', 'e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // Los providers colocan el componente Provider y su hook de contexto
  // (useXContext) en el mismo archivo por contrato (ver 12-design-system.md
  // §3.3): Fast Refresh pierde granularidad ahí, pero partir el archivo
  // rompería la ubicación acordada en los RCs.
  {
    files: ['src/global/providers/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
