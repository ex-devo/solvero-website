module.exports = {
  content: ['./index.html', './services/**/*.html', './blog/**/*.html', './authors/**/*.html', './script.js'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          'primary-dark': 'var(--brand-primary-dark)',
          secondary: 'var(--brand-accent)',
          tertiary: 'var(--brand-tertiary)'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
