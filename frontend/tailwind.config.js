/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgdark: "#1A1C29",
        panel: "#2A2D43",
        gold: "#FFD700",
        danger: "#E53935",
        sakura: "#FFB7C5",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', '"VT323"', "monospace"],
      },
      boxShadow: {
        pixel: "0 4px 0 rgba(0,0,0,0.4)",
        glow: "0 0 12px rgba(255,215,0,0.6)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        flicker: { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.6 } },
        zzz: { "0%,100%": { transform: "translateY(0) scale(1)" }, "50%": { transform: "translateY(-8px) scale(1.05)" } },
        sakura: { "0%": { transform: "translateY(-10px) rotate(0deg)", opacity: 0 }, "10%": { opacity: 1 }, "100%": { transform: "translateY(110vh) rotate(360deg)", opacity: 0 } },
      },
      animation: {
        float: "float 2.5s ease-in-out infinite",
        flicker: "flicker 0.6s infinite",
        zzz: "zzz 1.8s ease-in-out infinite",
        sakura: "sakura linear infinite",
      },
    },
  },
  plugins: [],
};
