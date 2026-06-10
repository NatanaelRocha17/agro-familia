import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, X, Camera } from "lucide-react";
import { toast } from "sonner";
import type {
  GetAllCategories,
  Product,
  ProductFormData,
} from "../Models/Models";
import {
  createProduct,
  getAllCategories,
  uploadProductImage,
} from "../services/product";
import { Loading } from "../components/Loading";

export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<GetAllCategories[]>([]);

  async function loadCategories() {
    try {
      const response = await getAllCategories();
      const data = response as GetAllCategories[];

      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    sale_price: 0,
    unit_measure: "kg",
    product_origin: "",
    production_method: "",
    status: 1,
    images: [],
    category_id: 0,
  });

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const products = JSON.parse(
        localStorage.getItem(`products_${user.id}`) || "[]",
      );

      const product = products.find((p: any) => p.id === id);

      if (!product) {
        toast.error("Produto não encontrado");
        navigate("/agricultor/produtos");
        return;
      }

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        sale_price: product.sale_price || 0,
        unit_measure: product.unit_measure || "kg",
        product_origin: product.product_origin || "",
        production_method: product.production_method || "",
        status: product.status ?? 1,
        images: product.images || [],
        category_id: product.category_id || 0,
      });
    } catch {
      toast.error("Erro ao carregar produto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // necessário pra permitir drop
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const updatedImages = [...formData.images];
    const draggedItem = updatedImages[dragIndex];

    // remove da posição antiga
    updatedImages.splice(dragIndex, 1);

    // insere na nova posição
    updatedImages.splice(dropIndex, 0, draggedItem);

    // atualiza display_order
    const reordered = updatedImages.map((img, index) => ({
      ...img,
      display_order: index,
    }));

    setFormData((prev) => ({
      ...prev,
      images: reordered,
    }));

    setDragIndex(null);
  };

  // VALIDAÇÃO POR TOASTS
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.warning("Nome do produto é obrigatório");
      return false;
    }
    if (!formData.category_id || formData.category_id === 0) {
      toast.warning("Categoria é obrigatória");
      return false;
    }
    if (formData.price <= 0) {
      toast.warning("Preço normal inválido ou não preenchido");
      return false;
    }
    if (formData.sale_price <= 0) {
      toast.warning("Preço de venda inválido ou não preenchido");
      return false;
    }
    if (!formData.unit_measure) {
      toast.warning("Unidade de medida é obrigatória");
      return false;
    }
    if (!formData.images || formData.images.length === 0) {
      toast.warning("Adicione pelo menos uma imagem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const userStr = localStorage.getItem("user"); 
      const user = JSON.parse(userStr || "{}");

      const uploadedImages: { image_url: string }[] = [];

      for (let i = 0; i < formData.images.length; i++) {
        const img = formData.images[i];

        if (img.image_url.startsWith("http")) {
          uploadedImages.push(img);
          continue;
        }

        const file = base64ToFile(
          img.image_url,
          `product_${Date.now()}_${i}.png`,
        );
        const upload = await uploadProductImage(file);
        uploadedImages.push(upload);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price / 100,
        sale_price: formData.sale_price / 100,
        unit_measure: formData.unit_measure,
        product_origin: formData.product_origin,
        production_method: formData.production_method,
        status: formData.status,
        images: uploadedImages,
        category_id: formData.category_id,
      };

      if (isEditing) {
        // Aqui você poderia chamar updateProduct se tiver endpoint
        // Por enquanto vamos atualizar localStorage
        const products = JSON.parse(
          localStorage.getItem(`products_${user.id}`) || "[]",
        );
        const updatedProduct: Product = {
          id,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          sale_price: formData.sale_price,
          unit_measure: formData.unit_measure,
          product_origin: formData.product_origin,
          production_method: formData.production_method,
          status: formData.status,
          images: uploadedImages,
          created_at:
            products.find((p: any) => p.id === id)?.created_at || new Date(),
          updated_at: String(new Date()), // 🔥 agora é Date
        };
        const updatedProducts = products.map((p: any) =>
          p.id === id ? updatedProduct : p,
        );
        localStorage.setItem(
          `products_${user.id}`,
          JSON.stringify(updatedProducts),
        );
        updatedProduct;
      } else {
        await createProduct(user.id, productData as any);
      }

      toast.success("Produto salvo com sucesso!");
      navigate("/agricultor/produtos");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("price") ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      if (formData.images.length >= 3) {
        toast.error("Máximo de 3 imagens");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, { image_url: reader.result as string }],
        }));
      };

      reader.readAsDataURL(files[0]);
    }

    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) return <Loading />;

  const formatCurrency = (value: number) => {
    return (value / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 ">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/agricultor/produtos")}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 active:scale-95 transition-all w-fit"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Voltar para Produtos</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl from-green-900 to-green-900">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-stone-600">
            {isEditing
              ? "Atualize as informações do seu produto"
              : "Preencha os dados para cadastrar um novo produto"}
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm"
        >
          {/* Nome do Produto */}
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block font-semibold text-stone-900 mb-2"
            >
              Nome do Produto <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={150}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Ex: Tomate Orgânico"
            />
            <p className="text-sm text-stone-500 mt-1">
              {formData.name.length}/150 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block font-semibold text-stone-900 mb-2"
            >
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              placeholder="Descreva seu produto, suas características e qualidades..."
            />
            <p className="text-sm text-stone-500 mt-1">
              Opcional - adicione detalhes que possam interessar os compradores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="price"
                className="block font-semibold text-stone-900 mb-2"
              >
                Preço Normal (R$) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formatCurrency(formData.price)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(onlyNumbers),
                  }));
                }}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="R$ 0,00"
              />
            </div>

            <div>
              <label
                htmlFor="sale_price"
                className="block font-semibold text-stone-900 mb-2"
              >
                Preço de Venda (R$) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="sale_price"
                name="sale_price"
                value={formatCurrency(formData.sale_price)}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({
                    ...prev,
                    sale_price: Number(onlyNumbers),
                  }));
                }}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                placeholder="R$ 0,00"
              />
            </div>
          </div>
          {/* Unidade de Medida */}
          <div className="mb-6">
            <label
              htmlFor="unit_measure"
              className="block font-semibold text-stone-900 mb-2"
            >
              Unidade de Medida <span className="text-red-600">*</span>
            </label>
            <select
              id="unit_measure"
              name="unit_measure"
              value={formData.unit_measure}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              <option value="kg">Quilograma (kg)</option>
              <option value="g">Grama (g)</option>
              <option value="un">Unidade (un)</option>
              <option value="dz">Dúzia (dz)</option>
              <option value="lt">Litro (lt)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="sc">Saco (sc)</option>
              <option value="cx">Caixa (cx)</option>
              <option value="mc">Maço (mc)</option>
            </select>
          </div>

          {/* Origem do Produto */}
          <div className="mb-6">
            <label
              htmlFor="product_origin"
              className="block font-semibold text-stone-900 mb-2"
            >
              Origem do Produto
            </label>
            <input
              type="text"
              id="product_origin"
              name="product_origin"
              value={formData.product_origin}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Ex: Fazenda São José, Cidade - UF"
            />
            <p className="text-sm text-stone-500 mt-1">
              Local de produção ou origem do produto
            </p>
          </div>

          {/* Categoria */}
          <div className="mb-6">
            <label
              htmlFor="category_id"
              className="block font-semibold text-stone-900 mb-2"
            >
              Categoria <span className="text-red-600">*</span>
            </label>

            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              {categories.length === 0 ? (
                <option value="">Carregando categorias...</option>
              ) : (
                <>
                  <option value="">Selecione uma categoria</option>
                  {categories.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Método de Produção */}
          <div className="mb-6">
            <label
              htmlFor="production_method"
              className="block font-semibold text-stone-900 mb-2"
            >
              Método de Produção
            </label>
            <input
              type="text"
              id="production_method"
              name="production_method"
              value={formData.production_method}
              onChange={handleChange}
              maxLength={150}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Ex: Orgânico certificado, Agroecológico, Convencional"
            />
            <p className="text-sm text-stone-500 mt-1">
              Como o produto é cultivado ou produzido
            </p>
          </div>

          {/* Status */}
          <div className="mb-8">
            <label
              htmlFor="status"
              className="block font-semibold text-stone-900 mb-2"
            >
              Status do Produto
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: parseInt(e.target.value),
                }))
              }
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            >
              <option value={1}>Ativo - Produto visível e disponível</option>
              <option value={0}>Inativo - Produto oculto dos clientes</option>
            </select>
            <p className="text-sm text-stone-500 mt-1">
              Produtos inativos não aparecem na listagem pública
            </p>
          </div>

          {/* Imagens */}
          <div className="mb-8">
            <label className="block font-semibold text-stone-900 mb-2">
              Imagens do Produto <span className="text-red-600">*</span>
            </label>
            <p className="text-sm text-stone-600 mb-3">
              Adicione de 1 a 3 imagens do seu produto ({formData.images.length}
              /3)
            </p>

            {/* Botão de Upload */}
            {formData.images.length < 3 && (
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Opção 1: Galeria */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUploadGallery"
                    disabled={formData.images.length >= 3}
                  />
                  <label
                    htmlFor="imageUploadGallery"
                    className={`flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 rounded-lg transition-colors active:scale-95 font-medium cursor-pointer ${
                      formData.images.length >= 3
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-green-700 text-white hover:bg-green-800"
                    }`}
                  >
                    <Upload size={20} />
                    {formData.images.length === 0
                      ? "Galeria"
                      : "Mais da Galeria"}
                  </label>

                  {/* Opção 2: Câmera */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="imageUploadCamera"
                    disabled={formData.images.length >= 3}
                  />
                  <label
                    htmlFor="imageUploadCamera"
                    className={`flex-1 md:hidden inline-flex justify-center items-center gap-2 px-4 py-3 rounded-lg transition-colors active:scale-95 font-medium cursor-pointer ${
                      formData.images.length >= 3
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-stone-800 text-white hover:bg-stone-900 shadow-md"
                    }`}
                  >
                    <Camera size={20} />
                    Tirar Foto
                  </label>
                </div>
              </div>
            )}

            {/* Grid de Imagens */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className="relative"
                  >
                    <img
                      src={image.image_url}
                      alt={`Produto ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-stone-200 cursor-move"
                    />

                    {/* Botão X */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-sm hover:bg-red-700 active:scale-90 transition-colors z-10"
                      title="Remover imagem"
                    >
                      <X size={18} />
                    </button>

                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold pointer-events-none">
                      Imagem {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-stone-600 mb-3 mt-3">
              Você pode arrastar e soltar as imagens para reordená-las. A
              primeira imagem será a principal exibida para os clientes.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/agricultor/produtos")}
              className="flex-1 px-6 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 active:scale-95 rounded-lg transition-all font-medium"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-700 text-white hover:bg-green-800 active:scale-95 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditing ? "Atualizar Produto" : "Cadastrar Produto"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
