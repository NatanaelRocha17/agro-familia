// src/routes.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";

import { Layout } from "./components/Layout";
import { Home } from "./pages/Home.tsx";
import { Login } from "./pages/Login.tsx";
import { FarmerRegister } from "./pages/Register.tsx";
import { Dashboard } from "./pages/Dash.tsx";
import { FarmerProfile } from "./pages/FarmerProfile.tsx";
import { ProductManagement } from "./pages/productManager.tsx";
import { ProductForm } from "./pages/ProductForm.tsx";
import { ProductEdit } from "./pages/ProductEdit.tsx";
import { ProductDetails } from "./pages/ProductDetails.tsx";
import { FarmerSettings } from "./pages/FarmerSetting.tsx";
import type { JSX } from "react";

function isAuthenticated() {
  const token = localStorage.getItem("farmer_token");
  const user = localStorage.getItem("user");

  return !!token && !!user;
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  return isAuthenticated() ? children : <Navigate to="/agricultor/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, // pública
      { path: "produto/:id", element: <ProductDetails /> }, // pública
    ],
  },

  {
    path: "/agricultor",
    children: [
      { path: "login", element: <Login /> }, // pública
      { path: "register", element: <FarmerRegister /> }, // pública

      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "perfil",
        element: (
          <PrivateRoute>
            <FarmerProfile />
          </PrivateRoute>
        ),
      },
      {
        path: "produtos",
        element: (
          <PrivateRoute>
            <ProductManagement />
          </PrivateRoute>
        ),
      },
      {
        path: "produtos/novo",
        element: (
          <PrivateRoute>
            <ProductForm />
          </PrivateRoute>
        ),
      },
      {
        path: "produtos/editar/:id",
        element: (
          <PrivateRoute>
            <ProductEdit />
          </PrivateRoute>
        ),
      },
      {
        path: "metodos",
        element: (
          <PrivateRoute>
            <FarmerSettings />
          </PrivateRoute>
        ),
      },
    ],
  },

  {
    path: "*",
    element: <div>Página não encontrada</div>,
  },
]);