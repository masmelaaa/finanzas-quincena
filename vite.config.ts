import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// En build usamos la subruta del repo (GitHub Pages: /finanzas-quincena/).
// En dev servimos desde la raíz para comodidad local.
export default defineConfig(({ command }) => {
  const base = command === "build" ? "/finanzas-quincena/" : "/";
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "Quincena · Finanzas",
          short_name: "Quincena",
          description: "Controla tu plata quincena a quincena.",
          theme_color: "#000000",
          background_color: "#000000",
          display: "standalone",
          orientation: "portrait",
          scope: base,
          start_url: base,
          icons: [
            { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
            { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
      }),
    ],
    test: {
      environment: "node",
    },
  };
});
