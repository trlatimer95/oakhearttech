import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oakhearttech.com',
  devToolbar: { enabled: false },
  integrations: [sitemap({ filter: (page) => !page.includes('/console/') })],
  vite: { plugins: [tailwindcss()] },
});
