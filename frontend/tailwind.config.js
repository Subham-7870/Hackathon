/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0F19",       // Deep dark canvas
          surface: "#111827",  // Dark card background
          elevated: "#1E293B", // Elevated containers
          border: "#1F2937",   // Dark border
          borderLight: "#374151",
          muted: "#94A3B8",
          text: "#F8FAFC"
        },
        railway: {
          cobalt: "#38BDF8",   // Glowing cyan/blue for dark mode
          brand: "#2563EB",
          accent: "#60A5FA",
        },
        dept: {
          track: "#38BDF8",     // Sky/Cyan
          signal: "#34D399",    // Emerald
          traction: "#A78BFA",  // Violet
          emergency: "#F87171" // Coral Red
        }
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Manrope', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"DM Mono"', '"Cascadia Code"', 'monospace']
      }
    },
  },
  plugins: [],
}
