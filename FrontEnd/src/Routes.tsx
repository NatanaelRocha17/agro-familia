// src/routes.tsx
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './Layout.tsx';
import { Home } from './pages/Home.tsx';
import { Login } from './pages/Login.tsx';
import { FarmerRegister } from './pages/Register.tsx';
import { Dashboard } from './pages/Dash.tsx';
import { FarmerProfile } from './pages/FarmerProfile.tsx';

export const router = createBrowserRouter([
  {
    element: <Layout />, 
    children: [
      {path: '/', element: <Home /> },
      {path: '/agricultor/login', element: <Login /> },
      {path: '/agricultor/register', element: <FarmerRegister /> },
      {path: '/agricultor/dashboard', element: <Dashboard />},
      {path: '/agricultor/perfil', element: <FarmerProfile />},
    ],
  },
]);