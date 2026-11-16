import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oakhearttech.com',
  devToolbar: { enabled: false },
  // Styles go inside each page instead of a separate file, so phones can draw the page without waiting on a
  // second request (it was the only thing holding up the first paint on PageSpeed).
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap({ filter: (page) => !page.includes('/console/') && !page.includes('/website-evaluation') })],
  vite: { plugins: [tailwindcss()] },
});
