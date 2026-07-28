/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Firebase — claves públicas por diseño, ver .env.example
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_USE_EMULATORS?: string;

  // Aplicación
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';

  // Opcional
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
