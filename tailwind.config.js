/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["./src/**/*.{js,jsx,ts,tsx}"],
   darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg': 'var(--color-bg)',
        'subtext': 'var(--color-subtext)',
        'blog': 'var(--color-blog)',
      },
      fontFamily: {
        'font-1': 'var(--font-1)',
        'font-2': 'var(--font-2)',
      },
    },
  },
  plugins: [],
}

