/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parking: {
          available: '#22c55e',
          occupied: '#ef4444',
          reserved: '#eab308',
          disabled: '#9ca3af',
          primary: '#0f766e',
          secondary: '#14b8a6',
          accent: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
};

