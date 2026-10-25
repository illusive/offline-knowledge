/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        surface: token('surface'),
        text: token('text'),
        muted: token('muted'),
        border: token('border'),
        accent: token('accent'),
        'on-accent': token('on-accent'),
        'note-bg': token('note-bg'),
        'note-text': token('note-text'),
      },
      borderRadius: { card: '12px' },
    },
  },
  plugins: [],
};
