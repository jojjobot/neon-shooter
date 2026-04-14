/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wow-gold': '#c8a84b',
        'wow-gold-light': '#e8c86b',
        'wow-gold-dark': '#a88830',
        'wow-dark': '#0d1117',
        'wow-card': '#161b22',
        'wow-border': '#30363d',
        'wow-text': '#e6e6e6',
        'wow-muted': '#8b949e',
        'wow-green': '#3fb950',
        'wow-red': '#f85149',
        'wow-blue': '#58a6ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'wow-hero': 'linear-gradient(135deg, #0d1117 0%, #1a1f2e 50%, #0d1117 100%)',
      },
      boxShadow: {
        'wow-glow': '0 0 20px rgba(200, 168, 75, 0.3)',
        'wow-glow-sm': '0 0 10px rgba(200, 168, 75, 0.2)',
      },
    },
  },
  plugins: [],
}
