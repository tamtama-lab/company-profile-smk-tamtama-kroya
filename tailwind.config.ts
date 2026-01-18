/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
 
    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#014921',
        secondary: "#56B680",
        'jurusan-tkr': '#ec4899',
        'jurusan-dkv': '#3b82f6',
        'jurusan-mesin': '#06b6d4',
        'jurusan-titl': '#a855f7',
      },
    },
  },
  plugins: [],
}