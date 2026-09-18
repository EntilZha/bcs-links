// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Served from the root of its own domain, so unlike bcs-calendar and bcs-birdweb there
// is no `base` prefix to thread through every link.
export default defineConfig({
  site: 'https://bcs.pedro.ai',
  // The dev toolbar sits over the bottom of a phone-sized viewport and hides the page.
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
