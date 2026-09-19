/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--color-paper) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
        hairline: 'rgb(var(--color-hairline) / <alpha-value>)',
        paid: 'rgb(var(--color-paid) / <alpha-value>)',
        'paid-soft': 'rgb(var(--color-paid-soft) / <alpha-value>)',
        due: 'rgb(var(--color-due) / <alpha-value>)',
        'due-soft': 'rgb(var(--color-due-soft) / <alpha-value>)',
        brass: 'rgb(var(--color-accent) / <alpha-value>)',
        'brass-dark': 'rgb(var(--color-accent-strong) / <alpha-value>)',
        partial: 'rgb(var(--color-partial) / <alpha-value>)',
        'partial-soft': 'rgb(var(--color-partial-soft) / <alpha-value>)',
        'partial-border': 'rgb(var(--color-partial-border) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        ledger: '0 4px 20px -2px var(--shadow-color)',
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
