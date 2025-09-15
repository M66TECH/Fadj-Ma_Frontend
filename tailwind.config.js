/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fadj-primary': '#2c3e50',
        'fadj-secondary': '#34495e',
        'fadj-accent': '#16a085',
        'fadj-yellow': '#f39c12',
        'fadj-green': '#27ae60',
        'fadj-blue': '#3498db',
        'fadj-red': '#e74c3c',
        'fadj-gray': '#ecf0f1',
        'fadj-dark': '#2c3e50',
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
