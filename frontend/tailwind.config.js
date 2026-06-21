/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kfintech: {
          primary: '#0033A0',
          accent: '#FF6600',
          bg: '#f3f4f6',
        }
      }
    },
  },
  plugins: [],
}
