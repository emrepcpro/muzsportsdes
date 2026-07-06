/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#84cc16', // lime-500
          hover: '#a3e635', // lime-400
          dark: '#65a30d', // lime-600
        },
        background: {
          DEFAULT: '#050505',
          card: '#0c0c0c',
          highlight: '#111111',
          inner: '#080808',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(132, 204, 22, 0.3)',
        'neon-strong': '0 0 25px rgba(132, 204, 22, 0.5)',
        'stadium': '0 10px 40px rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'neon': 'neon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-up': 'float-up 3s ease-out forwards',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.7, filter: 'brightness(1.5)' },
        },
        'float-up': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '100%': { transform: 'translateY(-100px) scale(1.5)', opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
