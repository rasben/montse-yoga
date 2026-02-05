// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://rasben.github.io',
  base: import.meta.env.PROD ? '/montse-yoga' : '/',
  integrations: [svelte()],

  vite: {
    plugins: [tailwindcss()]
  }
});
