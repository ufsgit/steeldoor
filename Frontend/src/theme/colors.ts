/**
 * SINGLE COLOR SOURCE OF TRUTH
 * All colors in the application MUST be defined here.
 * Feeds tailwind.config.ts and CSS variables in styles.scss.
 * No hex values or default Tailwind colors (e.g., green-500) allowed anywhere else.
 */

export const themeColors = {
  // Brand Red Palette (FitMate Logo Red #ea1f25 with deep crimson hover accents)
  primary: '#ea1f25',
  'primary-dark': '#9e1116',
  'primary-light': '#ef4444',
  'primary-hover': '#c5161b',
  accent: '#dc2626',
  'accent-dark': '#b91c1c',
  'accent-light': '#f87171',

  // Neutrals & Surfaces (Clean warm off-white, steel-grey hints)
  background: '#faf7f8',
  surface: '#ffffff',
  'surface-hover': '#f9f4f4',
  'surface-muted': '#f4efef',
  'surface-elevated': '#ffffff',

  border: '#e6dede',
  'border-hover': '#d4c4c4',

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
