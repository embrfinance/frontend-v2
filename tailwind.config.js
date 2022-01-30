const defaultTheme = require('tailwindcss/defaultTheme');
module.exports = {
  purge: {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    options: {
      safelist: [
        /^shadow/,
        /^bg/,
        /^text/,
        /^border/,
        /^from/,
        /^to/,
        /^dark:/,
        /^hover:/,
        'dark',
        /^dark:/
      ]
    }
  },
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    fontFamily: {
      body: [
        'Inter-Variable',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"'
      ],
      display: ['"Gotham Rounded"', 'Times', '"Times New Roman"', 'serif']
    },
    boxShadow: {
      sm: '0 2px 4px 0 rgba(0,0,0,0.05)',
      DEFAULT:
        '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.05)',
      lg: '0 2px 4px 0 rgba(0,0,0,0.03), 0 10px 40px 0 rgba(0,0,0,0.05)',
      xl: '0 2px 4px 0 rgba(0,0,0,0.05), 0 0px 40px 0 rgba(0,0,0,0.1)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      none: 'none'
    },
    borderColor: theme => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.100', 'currentColor')
    }),
    screens: {
      xs: '440px',
      ...defaultTheme.screens
    },
    extend: {
      height: {
        '112': '28rem'
      },
      colors: {
        green: {
          50: '#00FF00',
          100: '#FAFC00',
          200: '#D0FC00',
          300: '#A6FC00',
          400: '#00FC02',
          500: '#28FC00',
          600: '#52FC00',
          700: '#7CFC00',
          800: '#69D600',
          850: '#56B000',
          900: '#448900'
        },
        gray: {
          50: '#f9f9f9',
          100: '#999999',
          200: '#888888',
          300: '7777777',
          400: '#666666',
          500: '#555555',
          600: '#444444',
          700: '#333333',
          800: '#222222',
          850: '#111111',
          900: '#000000'
        },
        primary: {
          50: '#53555e',
          100: '#494b54',
          200: '#3f414a',
          300: '#353740',
          400: '#2b2d36',
          500: '#21232c',
          600: '#171922',
          700: '#0d0f18',
          800: '#03050e',
          900: '#000004'
        },
        'primary-dark': {
          50: '#6a7cff',
          100: '#6072ff',
          200: '#5668ff',
          300: '#4c5eff',
          400: '#4254ff',
          500: '#384aff',
          600: '#2e40f5',
          700: '#2436eb',
          800: '#1a2ce1',
          900: '#1022d7'
        },
        blue: {
          50: '#6a7cff',
          100: '#6072ff',
          200: '#5668ff',
          300: '#4c5eff',
          400: '#4254ff',
          500: '#384aff',
          600: '#2e40f5',
          700: '#2436eb',
          800: '#1a2ce1',
          900: '#1022d7'
        },
        pink: {
          50: '#ff4dff',
          100: '#ff43ff',
          200: '#ff39ff',
          300: '#ff2fff',
          400: '#fc25ff',
          500: '#f21bf6',
          600: '#e811ec',
          700: '#de07e2',
          800: '#d400d8',
          900: '#ca00ce'
        },
        gold:{
          50: '#ffba08',
          100: '#faa307',
          200: '#f48c06',
          300: '#e85d04',
          400: '#dc2f02',
          500: '#d00000',
          600: '#9d0208',
          700: '#6a040f',
          800: '#370617',
          900: '#03071e'
        },
        red: {
          500: '#FF0000'
        }
      }
    }
  },
  variants: {
    extend: {
      margin: ['first'],
      borderRadius: ['first', 'last'],
      zIndex: ['hover'],
      borderWidth: ['dark', 'last']
    }
  },
  plugins: []
};
