/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-green': '#153F2F',
        'brand-gold': '#D8A23A',
        'brand-cream': '#F5EDE2',
        'brand-dark': '#0E2A1F',
      },
    },
  },
  plugins: [],
};
