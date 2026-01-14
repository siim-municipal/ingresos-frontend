const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Tailwind usa las variables CSS generadas por Sass
        primary: {
          DEFAULT: 'var(--primary-500)',
          dark: 'var(--primary-700)',
        },
        accent: 'var(--accent-500)',
        warn: 'var(--warn-500)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
