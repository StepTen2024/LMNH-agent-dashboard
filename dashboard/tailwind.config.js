/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lmnh: {
          green: '#00ff88',
          dark: '#1a1a1a',
          gray: '#333',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'flipbook': 'flipbook 0.6s ease-in-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        flipbook: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '25%': { transform: 'rotateY(90deg) scale(1.1)' },
          '50%': { transform: 'rotateY(180deg) scale(1.2)' },
          '75%': { transform: 'rotateY(270deg) scale(1.1)' },
          '100%': { transform: 'rotateY(360deg) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

