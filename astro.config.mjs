// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.GITHUB_PAGES === 'true' ? 'https://npclabs-19.github.io' : 'http://localhost:4321',
  base: process.env.GITHUB_PAGES === 'true' ? '/four-four-fretboard' : '/',
  trailingSlash: 'always',
  server: { host: '127.0.0.1', port: 4321 },
  devToolbar: { enabled: false },
});
