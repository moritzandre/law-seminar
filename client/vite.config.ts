import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // "@shared" zeigt auf den gemeinsamen Typ-/Logik-Ordner im Wurzelverzeichnis.
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    // host: true -> Vite bindet an 0.0.0.0, damit Teilnehmende im LAN zugreifen.
    host: true,
    port: 5173,
    fs: {
      // Zugriff auf Dateien ausserhalb von client/ erlauben (../shared).
      allow: [fileURLToPath(new URL('..', import.meta.url))],
    },
  },
});
