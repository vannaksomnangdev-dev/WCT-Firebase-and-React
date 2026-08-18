import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/WCT-Firebase-and-React/", // 👈 Ensure this matches your repo name
  server: {
    port: 3000,
  },
});