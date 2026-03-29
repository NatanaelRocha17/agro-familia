import { ShoppingBasket, User, Menu, Sprout, X } from "lucide-react";
import { Link } from 'react-router';
import { useState } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-stone-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-green-900 tracking-tight hidden sm:block">
              Agro<span className="text-stone-600">Família</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-stone-600 hover:text-green-700 font-medium transition-colors">
            Início
          </Link>
          <Link to="/produtores" className="text-stone-600 hover:text-green-700 font-medium transition-colors">
            Produtos
          </Link>
          <Link to="/sobre" className="text-stone-600 hover:text-green-700 font-medium transition-colors">
            Sobre Nós
          </Link>
          <Link 
            to="/agricultor/login" 
            className="flex items-center gap-1.5 text-green-700 hover:text-green-800 font-medium transition-colors bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100"
          >
            <Sprout size={18} />
            <span>Sou Agricultor</span>
          </Link>
        </nav>

       
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link 
              to="/" 
              className="px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-green-700 rounded-lg font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link 
              to="/produtores" 
              className="px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-green-700 rounded-lg font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Produtores
            </Link>
            <Link 
              to="/sobre" 
              className="px-4 py-3 text-stone-700 hover:bg-stone-50 hover:text-green-700 rounded-lg font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sobre Nós
            </Link>
            <Link 
              to="/agricultor/login" 
              className="flex items-center gap-2 px-4 py-3 text-green-700 hover:bg-green-50 rounded-lg font-medium transition-colors bg-green-50/50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Sprout size={20} />
              <span>Área do Agricultor</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}