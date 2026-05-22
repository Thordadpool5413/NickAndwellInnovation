import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest-setup.ts'],
    include: ['lib/**/*.test.ts', 'lib/**/*.test.tsx', 'app/api/**/*.test.ts', 'components/**/*.test.tsx'],
    exclude: ['node_modules'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: ['lib/**/*.test.ts', 'lib/**/*.d.ts', 'lib/growth-plan/**'],
    },
  },
});
