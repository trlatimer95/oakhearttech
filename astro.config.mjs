import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oakhearttech.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/console/') })],
  vite: { plugins: [tailwindcss()] },
});
