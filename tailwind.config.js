/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        surface: '#F5F5F4',
        border: '#E7E5E4',
        primary: '#1C1917',
        muted: '#78716C',
        accent: '#0F766E',
        success: '#15803D',
        warning: '#B45309',
        danger: '#B91C1C',
        neutral: '#A8A29E',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
      letterSpacing: {
        premium: '0.35em',
        'tight-premium': '-0.025em',
      }
    },
  },
  plugins: [],
}
