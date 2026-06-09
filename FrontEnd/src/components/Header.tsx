import { Menu, ShoppingBasket, Sprout, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CardContext";
import { CartSheet } from "./CartSheet";

export function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pega a URL atual
  const location = useLocation();
  // Verifica se está na página de produto
  const isProductPage = location.pathname.startsWith("/produto");

  function handleOpenCart() {
    setIsOpen(true);
    setIsMobileMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* ESQUERDA */}
          <div className="flex items-center gap-4">
            {/* Esconde o menu  se for página de produto */}
            {!isProductPage && (
              <button
                type="button"
                className="md:hidden p-2 text-stone-600"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <Sprout className="text-green-700" size={32} />
              </div>
              <span className="text-xl font-bold text-green-900">
                Agro
                <span className="text-stone-600">Família</span>
              </span>
            </Link>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-8">
            {!isProductPage && (
              <>
                <a
                  href="#inicio"
                  className="hover:text-green-700 transition-colors"
                >
                  Início
                </a>
                <a
                  href="#produtos"
                  className="hover:text-green-700 transition-colors"
                >
                  Produtos
                </a>
                <a
                  href="#sobre"
                  className="hover:text-green-700 transition-colors"
                >
                  Sobre Nós
                </a>

                <Link
                  to={
                    isAuthenticated
                      ? "/agricultor/dashboard"
                      : "/agricultor/login"
                  }
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Sprout size={18} />
                  {isAuthenticated ? "Dashboard" : "Sou Agricultor"}
                </Link>
              </>
            )}
          </nav>

          {/* BOTÃO CARRINHO */}
          <button
            type="button"
            onClick={handleOpenCart}
            className="p-2 text-stone-600 hover:text-green-700 hover:bg-green-50 rounded-full relative transition-colors"
          >
            <ShoppingBasket size={24} />

            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-700 text-white text-xs rounded-full flex items-center justify-center">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>

        {/* MENU MOBILE */}
        {isMobileMenuOpen && !isProductPage && (
          <div className="md:hidden border-t border-stone-200 bg-white">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <a
                href="#inicio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-stone-50 rounded-lg"
              >
                Início
              </a>

              <a
                href="#produtos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-stone-50 rounded-lg"
              >
                Produtos
              </a>

              <a
                href="#sobre"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-stone-50 rounded-lg"
              >
                Sobre Nós
              </a>

              <Link
                to={
                  isAuthenticated
                    ? "/agricultor/dashboard"
                    : "/agricultor/login"
                }
                className="flex items-center gap-2 px-4 py-3 mt-2 bg-green-50 text-green-700 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Sprout size={18} />
                {isAuthenticated ? "Dashboard" : "Sou Agricultor"}
              </Link>
            </nav>
          </div>
        )}
      </header>

      <CartSheet />
    </>
  );
}
