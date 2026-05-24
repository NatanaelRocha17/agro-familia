import { Link } from "react-router-dom";
import { MapPin, ShoppingBag, UserRound } from "lucide-react";
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

  return (
    <Link
      to={`/produto/${product.id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-100 flex flex-col h-full focus:ring-4 focus:ring-green-500/50 focus:outline-none"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      {/* IMAGEM */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={product.images?.[0]?.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-stone-800 leading-tight group-hover:text-green-800 transition-colors">
            {product.name}
          </h3>

          <span className="text-xs font-medium text-stone-500 px-2 py-1 bg-stone-100 rounded-md whitespace-nowrap">
            {product.category}
          </span>
        </div>

        {/* LOCALIZAÇÃO */}
        <div className="flex items-center gap-1.5 text-stone-500 text-sm mb-3">
          <UserRound size={14} className="text-green-600 shrink-0" />

          <span className="truncate">
            {product.farmer !== undefined
              ? product.farmer.display_name
              : "Desconhecido"}
          </span>

          <span className="w-1 h-1 bg-stone-300 rounded-full shrink-0"></span>

          <span className="text-green-700 font-medium whitespace-nowrap">
            {product.distance_km} km
          </span>
        </div>

        {/* PREÇO */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex flex-col">
            <span className="text-xs text-stone-500 font-medium">
              Preço por {product.unit_measure}
            </span>

            <span className="text-xl font-bold text-green-900">
              R$ {Number(product.sale_price).toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* BOTÃO CARRINHO */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center hover:bg-green-700 hover:text-white transition-colors"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingBag size={20} />
          </button>
        </div>
      </div>
    </Link>
  );
}
