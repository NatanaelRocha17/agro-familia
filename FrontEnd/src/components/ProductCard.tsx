import { Link } from "react-router-dom";
import { ShoppingBag, UserRound } from "lucide-react";
import { toast } from "sonner";

import type { Product } from "../Models/Models";
import { useCart } from "../context/CardContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, setIsOpen } = useCart();

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, 1);

    toast.success(`${product.name} adicionado à cesta!`, {
      description: `R$ ${Number(product.sale_price)
        .toFixed(2)
        .replace(".", ",")} por ${product.unit_measure}`,
    });

    setIsOpen(false);
  }

  const hasFooterInfo =
    !!product.farmer?.display_name || product.distance_km !== undefined;

  return (
    <Link
      to={`/produto/${product.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg active:scale-[0.98] active:bg-stone-50 transition-all duration-300 border border-stone-100 flex flex-row md:flex-col h-auto focus:ring-4 focus:ring-green-500/50 focus:outline-none p-3 gap-3 md:p-0 md:gap-0"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      {/* IMAGEM */}
      <div className="relative w-24 h-24 shrink-0 md:w-full md:h-auto md:aspect-[4/3] overflow-hidden bg-stone-100 rounded-xl md:rounded-none md:rounded-t-2xl">
        <img
          src={product.images?.[0]?.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* CONTEÚDO */}
      <div className="flex flex-col md:p-4 w-full">
        {/* CABEÇALHO */}
        <div className="flex items-start justify-between gap-2 mb-1 md:mb-2">
          <h3 className="text-sm md:text-lg font-bold text-stone-800 leading-tight group-hover:text-green-800 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.category && (
            <span className="hidden md:inline-block text-xs font-medium text-stone-500 px-2 py-1 bg-stone-100 rounded-md whitespace-nowrap">
              {product.category}
            </span>
          )}
        </div>

        {/* PREÇO E CARRINHO (Quando não tem rodapé) */}
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-[10px] md:text-xs text-stone-500 font-medium block">
              Preço por {product.unit_measure}
            </span>

            <span className="text-base md:text-xl font-bold text-green-900">
              R$ {Number(product.sale_price).toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* Renderiza aqui na frente do preço SE NÃO houver info de rodapé */}
          {!hasFooterInfo && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors ml-2"
            >
              <ShoppingBag size={16} className="md:w-5 md:h-5" />
            </button>
          )}
        </div>

        {/* RODAPÉ (Com Carrinho se houver info) */}
        {hasFooterInfo && (
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
            <div className="flex flex-wrap items-center gap-1.5 text-stone-500 text-xs md:text-sm">
              {product.farmer?.display_name && (
                <>
                  <UserRound size={14} className="text-green-600 shrink-0" />
                  <span className="truncate max-w-[100px]">
                    {product.farmer.display_name}
                  </span>
                </>
              )}

              {product.farmer?.display_name && product.distance_km !== undefined && (
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
              )}

              {product.distance_km !== undefined && (
                <span className="text-green-700 font-medium">
                  {product.distance_km} km
                </span>
              )}

              {product.category && (
                <span className="md:hidden text-[10px] font-medium text-stone-500 px-1.5 py-0.5 bg-stone-100 rounded">
                  {product.category}
                </span>
              )}
            </div>

            {/* Renderiza aqui no rodapé SE HOUVER info de rodapé */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors ml-2"
            >
              <ShoppingBag size={16} className="md:w-5 md:h-5" />
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}