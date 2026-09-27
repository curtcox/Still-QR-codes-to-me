import { defineConfig } from 'vite';

export default defineConfig({
  // configure-pages supplies the repository path, or an empty path for a custom domain.
  base: process.env.PAGES_BASE_PATH || '/',
  build: { outDir: 'web-dist' },
});
