/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'space-mono': ['"Space Mono"', 'monospace'],
      },
      colors: {
        'transparent-blue': 'rgba(59, 130, 246, 0.05)',
        'transparent-blue-dark': 'rgba(59, 130, 246, 0.15)',
        'demo-light': 'rgba(59, 130, 246, 0.3)', // Increased opacity for visibility
        'demo-dark': 'rgba(29, 78, 216, 0.2)', // Unchanged for dark mode
      },
    },
  },
  plugins: [],
}