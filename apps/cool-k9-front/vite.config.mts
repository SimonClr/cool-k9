/// <reference types='vitest' />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import path from 'path';

/**
 * Environment variables the app cannot run without.
 * Checked here so the build fails immediately, instead of producing an artifact
 * that only turns out to be broken once loaded in the browser.
 */
const REQUIRED_ENV_VARS = ['VITE_API_BASE_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];

/**
 * Nx loads this file for every command in order to infer targets from it, long
 * before any build runs. Throwing during that phase would break unrelated tasks
 * (`nx build models`), so the check only applies to an actual build of this app.
 */
function assertRequiredEnv(mode: string) {
  const isRunningTask = Boolean(process.env.NX_TASK_TARGET_PROJECT);
  if (!isRunningTask) return;

  const env = loadEnv(mode, import.meta.dirname, 'VITE_');
  const missing = REQUIRED_ENV_VARS.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(', ')}. ` +
        `Set them in apps/cool-k9-front/.env (see .env.example) or in the ` +
        `deployment platform environment variables.`
    );
  }
}

export default defineConfig(({ mode, command }) => {
  if (command === 'build') assertRequiredEnv(mode);

  return {
    root: import.meta.dirname,
    cacheDir: '../../node_modules/.vite/cool-k9-front',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 4200,
      host: 'localhost',
    },
    preview: {
      port: 4200,
      host: 'localhost',
    },
    plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
    // Uncomment this if you are using workers.
    // worker: {
    //   plugins: () => [ nxViteTsPaths() ],
    // },
    test: {
      name: 'cool-k9-front',
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/test-setup.ts'],
      include: ['src/**/*.spec.{ts,tsx}'],
      watch: false,
      // A run that matches no test file is a tooling failure, not a success.
      passWithNoTests: false,
      reporters: ['default'],
      coverage: {
        provider: 'v8',
        reportsDirectory: '../../coverage/apps/cool-k9-front',
      },
    },
    build: {
      outDir: '../../dist/cool-k9-front',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-label', '@radix-ui/react-slot', 'class-variance-authority', 'clsx', 'tailwind-merge'],
            'vendor-icons': ['lucide-react'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
