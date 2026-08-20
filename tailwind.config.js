/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        accent: {
          DEFAULT: '#6c47ff',
          active: '#5534e0',
          subtle: '#f0ecff',
          muted: '#d4c9ff',
        },
        // Canvas (light surfaces)
        canvas: {
          DEFAULT: '#f5f4f0',
          soft: '#f9f8f5',
        },
        surface: {
          card: '#ffffff',
          strong: '#e8e7e1',
        },
        // Text
        ink: {
          DEFAULT: '#1a1917',
        },
        body: {
          DEFAULT: '#55534e',
          strong: '#1a1917',
        },
        muted: {
          DEFAULT: '#7e7b72',
          soft: '#a09c92',
        },
        // Hairlines
        hairline: {
          DEFAULT: '#e2e1db',
          soft: '#eceae4',
          strong: '#cbc9c0',
        },
        // Semantic
        success: '#1f8a65',
        error: '#cf2d56',
        warning: '#b87c0a',
        // Editor dark environment
        editor: {
          bg: '#1c1b18',
          panel: '#242320',
          surface: '#2e2c28',
          border: '#3a3835',
          text: '#e8e7e2',
          muted: '#7e7b72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-hero': ['64px', { lineHeight: '1.08', letterSpacing: '-0.028em', fontWeight: '400' }],
        'display-lg': ['40px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-md': ['28px', { lineHeight: '1.2', letterSpacing: '-0.0125em', fontWeight: '400' }],
        'display-sm': ['22px', { lineHeight: '1.25', letterSpacing: '-0.007em', fontWeight: '400' }],
      },
      spacing: {
        'section': '80px',
        'xxl': '48px',
      },
      borderRadius: {
        'xs': '3px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        skeleton: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
      backgroundImage: {
        'checkerboard': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23ccc'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23ccc'/%3E%3C/svg%3E")`,
      },
    },
  },
  plugins: [],
}
