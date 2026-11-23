/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edumaster: {
          bg: '#06152B',
          surface: '#0A1F3D',
          surfaceLight: '#0D2B52',
          surfaceHover: '#133566',
          blue: '#087FE5',
          blueGlow: '#0a8eff',
          cyan: '#20C8F5',
          violet: '#8B4DFF',
          teal: '#00BFA6',
          cardBorder: 'rgba(8, 127, 229, 0.28)',
          cardBorderHover: 'rgba(32, 200, 245, 0.55)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        glowBlue: '0 0 20px -3px rgba(8, 127, 229, 0.45)',
        glowCyan: '0 0 20px -3px rgba(32, 200, 245, 0.45)',
        glowViolet: '0 0 20px -3px rgba(139, 77, 255, 0.45)',
        glowTeal: '0 0 20px -3px rgba(0, 191, 166, 0.45)',
        panel: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2.5s infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        }
      }
    },
  },
  plugins: [],
}
