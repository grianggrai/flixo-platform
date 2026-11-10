import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { brand: "#F04455", ink: "#111216", surface: "#1C1E25", gold: "#F4B942" } } }, plugins: [] };
export default config;
