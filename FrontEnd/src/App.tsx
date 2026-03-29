// src/App.tsx
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes.tsx';
import './App.css';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
    </>
  );
}

export default App;