import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://casas.sesimbrinha.de',
  output: 'static',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en', 'pt', 'fr'],
    routing: {
      prefixDefaultLocale: false, // DE stays at /, others at /en/, /pt/, /fr/
    },
  },
});
