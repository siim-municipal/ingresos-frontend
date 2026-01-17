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
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
