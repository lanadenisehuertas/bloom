/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#fdfcfa', 100: '#f7f3ec', 200: '#efe7d8' },
        sage: { 50: '#f2f5f0', 100: '#e2e9dd', 300: '#aec2a0', 500: '#7a9268', 700: '#54683f' },
        clay: { 50: '#fbf1ea', 100: '#f3ded0', 300: '#e0ac8a', 500: '#c67e52', 700: '#8f5535' },
        ink: { 50: '#f5f5f4', 300: '#a8a29e', 500: '#57534e', 700: '#292524', 900: '#1c1917' },
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: { soft: '0 8px 24px -8px rgba(41,37,36,0.15)' },
    },
  },
  plugins: [],
}
