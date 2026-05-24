import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
   server: {
    port: 3008,
    host: true, 
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Essa opção garante que o html tenha a tag chamando o manifest
      injectRegister: 'auto', 
      manifest: {
        name: "Agro Família",
        short_name: "Agro",
        description: "Vitrine da agricultura familiar",
        theme_color: "#da9e48",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
         icons: [
          {
            src: "/logo194.png", // Busca direto na raiz da pasta public/
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo512.png", // Busca direto na raiz da pasta public/
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});


