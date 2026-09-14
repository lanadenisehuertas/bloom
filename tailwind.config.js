/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page + neutrals
        cream: { DEFAULT: '#FFF6EC', deep: '#FBEADA', edge: '#F0DDC9' },
        ink: { DEFAULT: '#17171F', 900: '#17171F', 700: '#2E2E3A', 500: '#55555F' },

        // Block colors — ink text (all verified >= 4.5:1)
        blush: '#FF7BA9',
        coral: '#FF7F4D',
        sun: '#FFC53D',
        mint: '#86DCB6',
        lilac: '#A292FF',
        sky: '#7CC6FF',

        // Block colors — white text (all verified >= 4.5:1)
        rose: '#C42557',
        forest: '#14675A',
      },
      fontFamily: {
        display: ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif'],
        body: ['"DM Sans Variable"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
        label: ['0.8125rem', { lineHeight: '1.125rem' }],
        numeral: ['3rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'numeral-sm': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        block: '1.75rem',
        chip: '1rem',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}
