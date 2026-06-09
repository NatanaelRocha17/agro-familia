
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
   server: {
    port: 3008,
    host: true, 
    allowedHosts: [
      "dubiously-bacteria-unroasted.ngrok-free.dev"
    ]
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: 'auto', 
      manifest: {
        name: "Agro Família",
        short_name: "Agro Família",
        description: "Vitrine da agricultura familiar",
        theme_color: "#da9e48",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
         icons: [
          {
            src: "/logo194.png", 
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo512.png", 
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});


