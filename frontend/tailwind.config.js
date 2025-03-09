/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          main: '#2196f3',
          dark: '#0d47a1',
        },
        secondary: {
          light: '#ff7961',
          main: '#f44336',
          dark: '#ba000d',
        },
      },
    },
  },
  plugins: [],
  // Allow MUI to work alongside Tailwind
  corePlugins: {
    preflight: false,
  },
  important: true,
}