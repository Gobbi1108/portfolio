// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gabrielgobbi.dev',

  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en'],
    // PT-BR sem prefixo (fica em /), inglês em /en/. Saída estática, então
    // redirectToDefaultLocale e detecção por header não se aplicam.
    routing: { prefixDefaultLocale: false },
  },

  vite: {
    plugins: [tailwindcss()]
  }
});