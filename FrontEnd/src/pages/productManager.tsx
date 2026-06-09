import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../Models/Models";
import {
  deleteProduct,
  getProductsByFarmerId,
  updateProductStatus,
} from "../services/product";
import { Loading } from "../components/Loading";

export function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  // Usado para exibir a lista na tela sem perder os dados originais quando o usuário busca algo
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Armazena qual produto foi selecionado para exclusão até que o usuário confirme no modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [page]);

  useEffect(() => {
    // Filtrar produtos
    let filtered = products;

    // Filtro por status
    if (filterStatus === "active") {
      filtered = filtered.filter((p) => p.status === 1);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((p) => p.status === 0);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (p.description?.toLowerCase() || "").includes(
            searchTerm.toLowerCase(),
          ),
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterStatus]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr || "{}");

      const res = (await getProductsByFarmerId(user.id, page, 10)) as any;

      const items = res.data?.items || [];

      const totalPages = res.data?.pagination?.totalPages || 1;

      setProducts(items);
      setTotalPages(totalPages);
    } catch (error) {
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string) => {
    try {
      const product = products.find((p) => p.id === productId);

      if (!product) {
        toast.error("Produto não encontrado");
        return;
      }

      const newStatus = product.status === 1 ? 0 : 1;
      await updateProductStatus(Number(productId), { status: newStatus });
      const updatedProducts = products.map((p) =>
        p.id === productId ? { ...p, status: newStatus } : p,
      );

      setProducts(updatedProducts);
      toast.success(
        newStatus === 1
          ? "Produto ativado com sucesso"
          : "Produto desativado com sucesso",
      );
    } catch (error) {
      toast.error("Erro ao alterar status do produto. Tente novamente!");
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(Number(productToDelete.id));

      const updatedProducts = products.filter(
        (p) => p.id !== productToDelete.id,
      );

      setProducts(updatedProducts);

      const userStr = localStorage.getItem("farmer_user");
      const user = JSON.parse(userStr || "{}");

      localStorage.setItem(
        `products_${user.id}`,
        JSON.stringify(updatedProducts),
      );

      toast.success("Produto excluído com sucesso");

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir produto");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-stone-50 bg-gradient-to-r">
      {/* Header */}
      <header className="border-b border-stone-200 sticky top-0 z-40 shadow-sm bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* Linha superior: Voltar na esquerda, Novo Produto na direita */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/agricultor/dashboard")}
                className="flex items-center gap-2 text-stone-700 hover:text-stone-900 active:scale-95 transition-all w-fit"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Voltar</span>
              </button>

              <button
                onClick={() => navigate("/agricultor/produtos/novo")}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white hover:bg-green-800 active:scale-95 rounded-lg transition-all font-medium w-fit shadow-sm"
              >
                <Plus size={20} />
                <span>Novo Produto</span>
              </button>
            </div>

            {/* Título e Subtítulo logo abaixo */}
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Meus Produtos
              </h1>
              <p className="text-sm text-stone-600">
                Gerencie o seu catálogo de produtos
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 ">
        {/* Busca e Filtros */}
        <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Filtro de Status */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap active:scale-95 ${
                  filterStatus === "all"
                    ? "bg-green-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap active:scale-95 ${
                  filterStatus === "active"
                    ? "bg-green-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setFilterStatus("inactive")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap active:scale-95 ${
                  filterStatus === "inactive"
                    ? "bg-green-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                Inativos
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-stone-200 text-center">
            <Package className="mx-auto text-stone-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              {products.length === 0
                ? "Nenhum produto cadastrado"
                : "Nenhum produto encontrado"}
            </h3>
            <p className="text-stone-600 mb-6">
              {products.length === 0
                ? "Comece adicionando seu primeiro produto"
                : "Tente ajustar os filtros de busca"}
            </p>
            {products.length === 0 && (
              <button
                onClick={() => navigate("/agricultor/produtos/novo")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white hover:bg-green-800 active:scale-95 rounded-lg transition-all font-medium"
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-white rounded-xl p-6 border shadow-sm transition-all ${
                  product.status === 1
                    ? "border-stone-200"
                    : "border-stone-200 opacity-60 grayscale-[20%]"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Imagem do Produto: Corrigido o object-cover para object-contain e adicionado fundo */}
                  {product.images && product.images.length > 0 && (
                    <div className="w-full md:w-32 h-32 flex-shrink-0 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.images[0].image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Informações do Produto */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-stone-900">
                            {product.name}
                          </h3>
                          {product.status === 1 ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-stone-200 text-stone-600 text-xs font-semibold rounded-full">
                              Inativo
                            </span>
                          )}
                        </div>

                        <p className="text-stone-600 mb-3">
                          {product.description}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-stone-500 mb-1">
                              Preço Normal
                            </p>
                            <p className="font-semibold text-stone-700">
                              R${" "}
                              {Number(product.price)
                                .toFixed(2)
                                .replace(".", ",")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500 mb-1">
                              Preço Venda
                            </p>
                            <p className="font-semibold text-green-700">
                              R${" "}
                              {Number(product.sale_price)
                                .toFixed(2)
                                .replace(".", ",")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500 mb-1">
                              Unidade
                            </p>
                            <p className="font-semibold text-stone-700">
                              {product.unit_measure}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-500 mb-1">
                              Origem
                            </p>
                            <p className="font-semibold text-stone-700">
                              {product.product_origin}
                            </p>
                          </div>
                        </div>

                        {product.production_method && (
                          <div className="mt-3 pt-3 border-t border-stone-100">
                            <p className="text-xs text-stone-500 mb-1">
                              Método de Produção
                            </p>
                            <p className="text-sm text-stone-700">
                              {product.production_method}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações com active:scale para feedback tátil */}
                  <div className="flex md:flex-col gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        navigate(`/agricultor/produtos/editar/${product.id}`)
                      }
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 rounded-lg transition-all font-medium"
                      title="Editar produto"
                    >
                      <Edit size={18} />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleToggleStatus(product.id)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 font-medium ${
                        product.status === 1
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      title={
                        product.status === 1
                          ? "Inativar produto"
                          : "Ativar produto"
                      }
                    >
                      {product.status === 1 ? (
                        <>
                          <ToggleLeft size={18} />
                          <span>Inativar</span>
                        </>
                      ) : (
                        <>
                          <ToggleRight size={18} />
                          <span>Ativar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setProductToDelete(product);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 active:scale-95 rounded-lg transition-all font-medium"
                      title="Excluir produto"
                    >
                      <Trash2 size={18} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="flex justify-center items-center gap-4 mt-6 pb-8">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-stone-800 text-white rounded hover:bg-stone-900 active:scale-95 transition-all disabled:bg-stone-300 disabled:text-stone-500 disabled:active:scale-100"
        >
          Anterior
        </button>

        <span className="font-medium text-black">
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-stone-800 text-white rounded hover:bg-stone-900 active:scale-95 transition-all disabled:bg-stone-300 disabled:text-stone-500 disabled:active:scale-100"
        >
          Próxima
        </button>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 text-center mb-2">
              Excluir Produto?
            </h3>
            <p className="text-stone-600 text-center mb-6">
              Esta ação não pode ser desfeita. O produto será permanentemente
              removido do seu catálogo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-3 bg-red-600 text-white hover:bg-red-700 active:scale-95 rounded-xl transition-all font-medium"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
