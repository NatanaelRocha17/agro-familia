import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App.tsx";

import { AuthProvider } from "./context/AuthContext.tsx";
import { CardProvider } from "./context/CardContext.tsx";

import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CardProvider>
        <App />
      </CardProvider>
    </AuthProvider>
  </StrictMode>
);