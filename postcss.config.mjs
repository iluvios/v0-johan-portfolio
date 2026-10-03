/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    // Adds -webkit- prefixes (backdrop-filter, mask-image) for Safari before 18.
    autoprefixer: {},
  },
}

export default config
