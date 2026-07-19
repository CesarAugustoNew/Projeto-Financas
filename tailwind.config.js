/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FFFFFF',
          100: '#F7F6F1',
          200: '#EDEAE1'
        },
        line: {
          DEFAULT: '#E3E0D5',
          strong: '#CFCABB'
        },
        ink: {
          900: '#1B211C',
          700: '#454C46',
          500: '#6E756E',
          300: '#9DA398'
        },
        gold: {
          400: '#E3B94A',
          500: '#C89A2E',
          600: '#9C7A20'
        },
        teal: {
          400: '#4FB49F',
          500: '#2F9483',
          600: '#227566'
        },
        clay: {
          400: '#D5776C',
          500: '#BD554B',
          600: '#953F37'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,33,28,0.04), 0 8px 20px -14px rgba(27,33,28,0.18)'
      },
      borderRadius: {
        card: '14px'
      }
    }
  },
  plugins: []
}
