/**
 * SINGLE COLOR SOURCE OF TRUTH
 * All colors in the application MUST be defined here.
 * Feeds tailwind.config.ts and CSS variables in styles.scss.
 * No hex values or default Tailwind colors (e.g., green-500) allowed anywhere else.
 */

export const themeColors = {
  // Brand Green Palette (Deep forest green with fresh emerald accents)
  primary: '#14532d',
  'primary-dark': '#0d381e',
  'primary-light': '#1b6e3b',
  'primary-hover': '#166534',
  accent: '#10b981',
  'accent-dark': '#047857',
  'accent-light': '#34d399',

  // Neutrals & Surfaces (Warm off-white, steel-grey hints)
  background: '#f8faf7',
  surface: '#ffffff',
  'surface-hover': '#f1f5f0',
  'surface-muted': '#f0f4f1',
  'surface-elevated': '#ffffff',

  border: '#dbe4dc',
  'border-hover': '#c2d1c4',

  // Typography Tokens
  text: '#0f172a',
  'text-muted': '#64748b',
  'text-light': '#94a3b8',
  'text-inverted': '#ffffff',

  // Feedback & State Tokens
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',

  // Booking Status Tokens
  'status-pending': '#d97706',
  'status-accepted': '#0284c7',
  'status-scheduled': '#7c3aed',
  'status-finished': '#16a34a',
  'status-rejected': '#dc2626',
  'status-delayed': '#ea580c',
} as const;

export type ThemeColorKey = keyof typeof themeColors;
