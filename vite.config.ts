/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Deben coincidir con los `paths` de tsconfig.app.json
    alias: {
      '@': resolvePath('./src'),
      '@app': resolvePath('./src/app'),
      '@global': resolvePath('./src/global'),
      '@library': resolvePath('./src/library'),
      '@modules': resolvePath('./src/modules'),
      '@resources': resolvePath('./src/resources'),
    },
  },
  server: {
    port: 5173,
    // Falla en vez de saltar al 5174: el puerto es parte del contrato del RC-001
    strictPort: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.stories.tsx', 'src/app/main.tsx'],
    },
  },
});
