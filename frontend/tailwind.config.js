/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        backgroundSubtle: 'var(--color-background-subtle)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        divider: 'var(--color-divider)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        text: 'var(--color-text)',
        textMuted: 'var(--color-text-muted)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
        info: 'var(--color-info)',
        accent: 'var(--color-accent)',
        accentSoft: 'var(--color-accent-soft)',
        landing: 'var(--color-landing)',
        pill: {
          default: 'var(--pill-default-bg)',
          primary: 'var(--pill-primary-bg)',
          warning: 'var(--pill-warning-bg)',
          danger: 'var(--pill-danger-bg)',
          info: 'var(--pill-info-bg)',
        },
        pillBorder: {
          default: 'var(--pill-default-border)',
          primary: 'var(--pill-primary-border)',
          warning: 'var(--pill-warning-border)',
          danger: 'var(--pill-danger-border)',
          info: 'var(--pill-info-border)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        koulen: ['Koulen', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
