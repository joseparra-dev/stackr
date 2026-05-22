import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [angular()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/app/core', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/app/shared', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/app/features', import.meta.url)),
      '@env': fileURLToPath(new URL('./src/environments', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/environments/**', '**/*.types.ts'],
    },
  },
});
