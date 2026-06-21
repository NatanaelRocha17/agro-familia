import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShoppingBasket,
  Truck,
  Calendar,
  Sprout,
  Package,
  CreditCard,
  Home,
  Store,
  Smartphone,
  Banknote,
  ShoppingCart,
  Landmark,
  Receipt,
  CalendarDays,
  PackageCheck,
  Map,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { GetProductDetailsResponse } from "../Models/Models";
import { getFullProductData } from "../services/product";
import { Loading } from "../components/Loading";
import { useCart } from "../context/CardContext";

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<GetProductDetailsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  function handleAddToCart() {
    if (!product) return;

    const productToCart = {
      ...product.product,
      farmer: product.farmer,
    };

    addToCart(productToCart, quantity);

    toast.success(`${product.product.name} adicionado à cesta!`, {
      description: `${quantity}x R$ ${Number(product.product.sale_price)
        .toFixed(2)
        .replace(".", ",")} por ${product.product.unit_measure}`,
    });
  }

  const deliveryTypeIcons: Record<number, any> = {
    1: Store, // Retirada no Local
    2: Home, // Entrega a Domicílio
    3: MapPin, // Ponto de Encontro
    4: ShoppingCart, // Retirada na Feira
    5: CalendarDays, // Entrega Programada
    6: PackageCheck, // Assinatura de Cestas
  };

  const paymentTypeIcons: Record<number, any> = {
    1: Banknote, // Dinheiro
    2: Smartphone, // PIX
    3: Landmark, // Transferência
    4: CreditCard, // Débito
    5: CreditCard, // Crédito
    6: Receipt, // Outros
  };

  useEffect(() => {
    const buscarProduto = async () => {
      let lat: number | null = null;
      let lng: number | null = null;

      const savedLocation = localStorage.getItem("userLocation");

      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);

        lat = Number(parsed.lat);
        lng = Number(parsed.lng);
      }

      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        setLoading(true);

        const rawResponse = (await getFullProductData(
          Number(id),
          lat ?? 0,
          lng ?? 0,
        )) as any;

        // Extraímos o nosso objeto principal de dentro de 'data'
        const response = rawResponse.data;

        const payloadComIcons = {
          ...response,
          paymentMethods: response.paymentMethods.map((item: any) => ({
            ...item,
            icon: paymentTypeIcons[item.id] || Receipt,
          })),
          deliveryMethods: response.deliveryMethods.map((item: any) => ({
            ...item,
            icon: deliveryTypeIcons[Number(item.type)] || PackageCheck,
          })),
        };

        setProduct(payloadComIcons);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar os detalhes do produto.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarProduto();
    }
  }, [id]);

  const images =
    product?.product?.images
      ?.slice(0, 3)
      ?.map((img) => img.image_url)
      ?.filter(Boolean) || [];

  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  return (
    <div className="bg-stone-50 min-h-screen pb-20 pt-8">
      {loading ? (
        <Loading />
      ) : !product ? (
        <div className="bg-stone-50 min-h-screen flex items-center justify-center">
          <p className="text-stone-500 text-lg">Produto não encontrado.</p>
        </div>
      ) : (
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-green-700 font-medium mb-6 transition-colors group"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Voltar
          </Link>

          <div className="bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden">
            <div className="block md:hidden p-4 pb-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.product.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-stone-900 leading-tight">
                {product.product.name}
              </h1>
            </div>

            <div className="grid md:grid-cols-2 gap-0 md:gap-8">
              {/* GALERIA DE IMAGENS */}
              <div className="p-4 md:p-6">
                <div className="flex flex-col gap-3 h-full">
                  {/* FOTO PRINCIPAL MAIOR */}
                  <div className="relative bg-stone-100 rounded-2xl overflow-hidden h-[220px] md:h-[360px] w-full">
                    <img
                      src={selectedImage || images[0]}
                      alt={product.product.name}
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  </div>

                  {/* MINIATURAS */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-3 gap-3">
                      {images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          className={`rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImage === img
                              ? "border-green-600 scale-105"
                              : "border-transparent hover:border-stone-300"
                          }`}
                        >
                          <div className="h-[110px] md:h-[130px] bg-stone-100">
                            <img
                              src={img}
                              alt={`Imagem ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6 md:p-10 flex flex-col h-full">
                <div className="hidden md:block">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {product.product.category}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 leading-tight">
                    {product.product.name}
                  </h1>
                </div>

                <div className="mb-8 prose prose-stone text-stone-600 leading-relaxed">
                  <p>{product.product.description}</p>
                </div>

                <div className="flex flex-col gap-4 mt-auto bg-stone-50 p-6 rounded-2xl border border-stone-100">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-sm text-stone-500 font-medium block mb-1">
                        Preço por {product.product.unit_measure}
                      </span>
                      <span className="text-4xl font-bold text-green-800">
                        R${" "}
                        {Number(product.product.sale_price)
                          .toFixed(2)
                          .replace(".", ",")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-stone-200 rounded-lg p-1 shadow-sm">
                      <button
                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-green-600 font-bold text-lg rounded hover:bg-stone-50 transition-colors"
                        onClick={() =>
                          setQuantity((prev) => Math.max(prev - 1, 1))
                        }
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-stone-800">
                        {quantity}
                      </span>
                      <button
                        className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-green-600 font-bold text-lg rounded hover:bg-stone-50 transition-colors"
                        onClick={() => setQuantity((prev) => prev + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      <ShoppingBasket size={20} />
                      Adicionar à Cesta
                    </button>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="bg-stone-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-stone-900 text-sm mb-4">
                    Informações do Produto
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Package
                        size={18}
                        className="text-green-600 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-stone-700">
                          Origem
                        </p>
                        <p className="text-sm text-stone-600">
                          {product.product.product_origin}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Sprout
                        size={18}
                        className="text-green-600 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-stone-700">
                          Método de Produção
                        </p>
                        <p className="text-sm text-stone-600">
                          {product.product.production_method}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar
                        size={18}
                        className="text-green-600 mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-xs font-semibold text-stone-700">
                          Disponível desde
                        </p>
                        <p className="text-sm text-stone-600">
                          {new Date(
                            product.product.created_at,
                          ).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {}
          {/* Formas de Pagamento e Métodos de Entrega */}
          <div className="border-t border-stone-100 p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Formas de Pagamento */}
              {product.paymentMethods.length > 0 && (
                <div>
                  <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-green-600" />
                    Formas de Pagamento Aceitas
                  </h3>
                  <div className="space-y-2">
                    {product.paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <div
                          key={method.id}
                          className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="text-green-700" />
                          </div>
                          <span className="text-sm font-medium text-stone-700">
                            {method.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Métodos de Entrega */}
              {product.deliveryMethods.length > 0 && (
                <div>
                  <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                    <Truck size={20} className="text-green-600" />
                    Opções de Entrega e Retirada
                  </h3>
                  <div className="space-y-3">
                    {product.deliveryMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <div
                          key={method.id}
                          className="p-3 bg-stone-50 rounded-lg border border-stone-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <IconComponent
                                size={20}
                                className="text-green-700"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <p className="font-semibold text-stone-900 text-sm">
                                    {method.option_name}
                                  </p>
                                  <p className="text-xs text-stone-600">
                                    {method.notes}
                                  </p>
                                </div>

                                {Number(method.cost) === 0 ? (
                                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                    Grátis
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold text-stone-700">
                                    R${" "}
                                    {Number(method.cost)
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-600">
                                {method.description}
                              </p>
                            </div>
                          </div>
                          <div>
                            {method.addresses && (
                              <div className="space-y-2">
                                {method.addresses.map((address: any) => (
                                  <div
                                    key={address.id}
                                    className="bg-green-50 rounded-lg p-3 text-sm"
                                  >
                                    <p className="font-medium text-stone-900">
                                      {address.street}, {address.number}
                                    </p>
                                    <p className="text-stone-600 text-xs mt-0.5">
                                      {address.neighborhood &&
                                        `${address.neighborhood} - `}
                                      {address.city}/{address.state} - CEP:{" "}
                                      {address.zip_code}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold overflow-hidden flex-shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${product?.farmer.display_name}&background=random&size=128`}
                  alt={product?.farmer.display_name}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900 mb-1">
                  Sobre {product?.farmer.display_name}
                </h3>
                <p className="text-stone-600 leading-relaxed mb-3">
                  {product?.farmer.description}
                </p>

                {/* Container do Endereço */}
                <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin size={16} className="text-green-600" />
                    <span>
                      {product?.farmer.address.street},{" "}
                      {product?.farmer.address.number} -{" "}
                      {product?.farmer.address.neighborhood}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-stone-600">
                    <span className="text-green-600">•</span>
                    <span>
                      {product?.farmer.address.city}/
                      {product?.farmer.address.state}
                    </span>
                  </div>

                  {/* Botão/Link para o Google Maps usando Coordenadas */}
                  {product?.farmer.address?.latitude &&
                    product?.farmer.address?.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${product.farmer.address.latitude},${product.farmer.address.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-700 hover:text-green-800 font-medium hover:underline transition-colors ml-1"
                        title="Abrir no Google Maps"
                      >
                        <Map size={16} />
                        <span>Ver no mapa</span>
                      </a>
                    )}
                </div>

                {/* Container da Vitrine */}
                <div className="pt-4 border-t border-stone-100 text-stone-600 text-sm">
                  Conheça mais produtos desse agricultor visitando a{" "}
                  <Link
                    to={`/vitrine/${product?.farmer.id}`}
                    className="text-green-700 font-bold hover:text-green-800 hover:underline transition-colors"
                  >
                    vitrine de {product?.farmer.display_name}
                  </Link>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
