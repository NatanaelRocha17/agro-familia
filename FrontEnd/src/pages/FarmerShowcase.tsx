import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { MapPin, Leaf, ShoppingBasket,  Sprout,  ChevronLeft, ChevronRight } from 'lucide-react';

import { ProductCard } from '../components/ProductCard';
import { toast } from 'sonner';
import { getShowcaseProducts } from '../services/product';
import type { Product } from '../Models/Models';


interface FarmerInfo {
  id: string;
  name: string;
  email?: string;
  display_name?: string;
  profession?: string;
  phone?: string;
  city?: string;
  state?: string;
}

export function FarmerShowcase() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [farmerInfo, setFarmerInfo] = useState<FarmerInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT_PER_PAGE = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!farmerId) {
          setNotFound(true);
          return;
        }

        setLoading(true);

        const response = await getShowcaseProducts(Number(farmerId), page, LIMIT_PER_PAGE);

        const showcase = response.data; 
    
        const enrichedProducts = showcase.products.map((product: any) => ({
          ...product,
          farmer: showcase.farmer
        }));

        setProducts(enrichedProducts);

        if (showcase.pagination) {
          setTotalPages(showcase.pagination.total_pages);
          setTotalItems(showcase.pagination.total_items);
        }

        setFarmerInfo({
          id: String(showcase.farmer.id),
          name: showcase.farmer.first_name,
          display_name: showcase.farmer.display_name,
          profession: showcase.farmer.profession,
          phone: showcase.farmer.phone,
          city: showcase.farmer.city,
          state: showcase.farmer.state,
        });

        // Opcional: Rola a tela suavemente para o topo dos produtos ao trocar de página
        if (page > 1) {
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }

      } catch (error: any) {
        console.error('Erro ao carregar a vitrine:', error);

        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(
            'Ocorreu um erro ao carregar a vitrine. Por favor, tente novamente mais tarde.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [farmerId, page]); // Adicionado 'page' como dependência para refazer a busca ao trocar de página

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Sprout size={48} className="text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-700 mb-2">Vitrine não encontrada</h2>
          <p className="text-stone-500 mb-6">O link pode estar incorreto ou expirado.</p>
          <button onClick={() => navigate('/')} className="bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
            Ir para a página inicial
          </button>
        </div>
      </div>
    );
  }

  if (!farmerInfo && loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = farmerInfo?.display_name || farmerInfo?.name;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header da Vitrine */}
      <header className="bg-green-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 py-8">
         
          {/* Perfil do agricultor */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8">
            <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white/30">
              <Sprout size={36} className="text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{displayName}</h1>
              {(farmerInfo?.city || farmerInfo?.state) && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-green-200 text-sm mb-3">
                  <MapPin size={14} />
                  <span>{[farmerInfo.city, farmerInfo.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-green-200 text-sm">
                <Leaf size={14} />
                {/* Atualizado para usar o totalItems do banco, e não apenas o array da página */}
                <span>{farmerInfo?.profession || 'Agricultor'} · {totalItems} {totalItems === 1 ? 'produto disponível' : 'produtos disponíveis'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative z-10 h-6 bg-stone-50" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', marginTop: '-1px' }}></div>
      </header>

      {/* Produtos */}
      <main className="container mx-auto px-4 py-8">
        {loading && products.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
            <ShoppingBasket size={48} className="text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 text-lg font-medium mb-1">Nenhum produto disponível no momento</p>
            <p className="text-stone-400 text-sm">Este agricultor ainda não publicou produtos ativos.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-stone-800 mb-6">Produtos de {displayName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Componente de Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-stone-200 rounded-lg text-stone-500 bg-white hover:bg-stone-50 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                
                <div className="px-4 py-2 text-sm font-semibold text-stone-800 bg-white border border-stone-200 rounded-lg shadow-sm">
                  Página {page}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-stone-200 rounded-lg text-stone-500 bg-white hover:bg-stone-50 hover:text-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Próxima
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-stone-600 mb-2">
          <Sprout size={20} className="text-green-700" />
          <span className="font-bold text-green-800">AgroFamília</span>
        </div>
        <p className="text-stone-500 text-sm">Conectando você diretamente ao agricultor familiar</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-green-700 hover:text-green-600 text-sm font-medium hover:underline transition-colors"
        >
          Conhecer mais produtos →
        </button>
      </footer>
    </div>
  );
}