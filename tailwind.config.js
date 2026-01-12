/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom breakpoints for better device coverage
      screens: {
        'xs': '480px',
        // Default sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
        // Orientation-specific breakpoints
        'landscape': { 'raw': '(orientation: landscape)' },
        'portrait': { 'raw': '(orientation: portrait)' },
        // Tablet landscape (iPad Mini/Air in landscape)
        'tablet-landscape': { 'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)' },
        // iPad Pro landscape
        'ipad-landscape': { 'raw': '(min-width: 1024px) and (max-height: 820px) and (orientation: landscape)' },
        // Short landscape screens (any device with limited height)
        'short-landscape': { 'raw': '(max-height: 600px) and (orientation: landscape)' },
        // Touch devices
        'touch': { 'raw': '(pointer: coarse)' },
      },
      // Fluid spacing using clamp()
      spacing: {
        'fluid-1': 'clamp(0.25rem, 0.5vmin, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 1vmin, 0.75rem)',
        'fluid-3': 'clamp(0.75rem, 1.5vmin, 1rem)',
        'fluid-4': 'clamp(1rem, 2vmin, 1.5rem)',
        'fluid-5': 'clamp(1.25rem, 2.5vmin, 2rem)',
        'fluid-6': 'clamp(1.5rem, 3vmin, 2.5rem)',
      },
      // Fluid font sizes
      fontSize: {
        'fluid-xs': ['clamp(0.625rem, 0.5vmin + 0.5rem, 0.75rem)', { lineHeight: '1.4' }],
        'fluid-sm': ['clamp(0.75rem, 0.75vmin + 0.5rem, 0.875rem)', { lineHeight: '1.4' }],
        'fluid-base': ['clamp(0.875rem, 1vmin + 0.5rem, 1rem)', { lineHeight: '1.5' }],
        'fluid-lg': ['clamp(1rem, 1.25vmin + 0.5rem, 1.25rem)', { lineHeight: '1.5' }],
        'fluid-xl': ['clamp(1.125rem, 1.5vmin + 0.5rem, 1.5rem)', { lineHeight: '1.4' }],
        'fluid-2xl': ['clamp(1.25rem, 2vmin + 0.5rem, 2rem)', { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.5rem, 3vmin + 0.5rem, 2.5rem)', { lineHeight: '1.2' }],
        'fluid-4xl': ['clamp(2rem, 4vmin + 0.5rem, 3.5rem)', { lineHeight: '1.1' }],
        'fluid-5xl': ['clamp(2.5rem, 5vmin + 0.5rem, 4rem)', { lineHeight: '1' }],
      },
      // Theme colors as CSS variable references
      colors: {
        'app-bg': 'var(--bg-app)',
        'header-text': 'var(--header-text)',
        'header-accent': 'var(--header-accent)',
      },
      // Border radius from theme
      borderRadius: {
        'theme': 'var(--border-radius)',
      },
      // Widget height utilities
      height: {
        'widget-row': 'clamp(160px, 24vh, 280px)',
        'widget-row-short': 'clamp(140px, 20vh, 200px)',
      },
      // Min heights
      minHeight: {
        'widget': '140px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
