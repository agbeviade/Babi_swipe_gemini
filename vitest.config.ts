import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // `server-only` refuse d'être chargé hors runtime serveur Next.
      'server-only': resolve(__dirname, 'tests/stubs/server-only.ts'),
    },
  },
});
