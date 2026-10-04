/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: { 50: '#FFFFFF', 100: '#F1F5F2', 200: '#E3EBE5' },
        line: { DEFAULT: '#DDE6DF', strong: '#C3D0C6' },
        ink: { 900: '#14221A', 700: '#3F4F45', 500: '#66756B', 300: '#9AA89F' },
        brand: {
          50: '#E8F6EE',
          400: '#3CBF84',
          500: '#22A06B',
          600: '#168A57',
          700: '#0F6E45',
          800: '#0C5636',
          900: '#0A3D2A'
        },
        teal: { 400: '#4CC38A', 500: '#22A06B', 600: '#168A57' },
        clay: { 400: '#D5776C', 500: '#BD554B', 600: '#953F37' }
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,61,42,0.04), 0 6px 18px -12px rgba(10,61,42,0.18)'
      },
      borderRadius: { card: '16px' }
    }
  },
  plugins: []
}
