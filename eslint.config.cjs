// eslint.config.cjs
const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const astro = require('eslint-plugin-astro');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const astroParser = require('astro-eslint-parser');
const globals = require('globals');

module.exports = [
  {
    ignores: [
      '.astro/**',
      'dist/**',
      'build/**',
      '.vercel/**',
      '.netlify/**',
    ],
  },

  js.configs.recommended,
  ...astro.configs['flat/recommended'],
  jsxA11y.flatConfigs.recommended,

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
      },
    },
  },
];