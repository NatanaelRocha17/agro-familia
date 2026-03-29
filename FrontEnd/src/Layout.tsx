// src/Layout.tsx
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-stone-100">
      <main >
        <Outlet /> {/* Renderiza as páginas */}
      </main>
    </div>
  );
}