/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optionale Ueberschreibung der Server-URL (sonst aus location.hostname). */
  readonly VITE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
