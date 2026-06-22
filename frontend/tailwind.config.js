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
          bg: '#0A0F1C',
          card: '#131B2F',
          border: '#1E293B',
          primary: '#3B82F6',
          accent: '#10B981',
          danger: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
