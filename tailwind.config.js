/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      animation: {
        'intro': 'intro 6s ease-out 1s',
        'enter': "enter 10s ease-out",
        'fadeInLag': 'fadeInLag 10s ease-out',
        'fadeIn': 'fadeIn 1s ease-in',
        'fadeOut': 'fadeOut 1s ease-in'
      },
      keyframes: {
        'intro': {
          '0%, 100%': { opacity: 0 },
          '20%, 90%': { opacity: 1 },
        },
        'enter': {
          '0%': { opacity: 0, height: 0 },
          '10%': { opacity: 0, height: 0 },
          '30%': { opacity: 0, height: 0 },
          '60%': { opacity: 0, height: 0 },
          '70%': { opacity: 0, height: 0 },
          '100%': { opacity: 1, height: "100%" },
        },
        'fadeInLag': {
          '0%': { opacity: 0, },
          '10%': { opacity: 0, },
          '30%': { opacity: 0, },
          '60%': { opacity: 0, },
          '70%': { opacity: 0, },
          '100%': { opacity: 1, },
        },
        'fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'fadeOut': {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
