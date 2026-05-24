import { useCart } from "../context/CardContext";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBasket,
  MessageCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { PaymentsDelivery } from "./Cart/PaymentsDelivery";

export function CartSheet() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart } =
    useCart();

  const [waitingReturn, setWaitingReturn] = useState(false);

  const [lastFarmerId, setLastFarmerId] = useState<string | null>(null);

  const [showFarmerInfo, setShowFarmerInfo] = useState(false);

  const [showNegotiationModal, setShowNegotiationModal] = useState(false);

  //Agrupa por Agricultor os produtos
  const groupedByFarmer = useMemo(() => {
    const groups: Record<string, typeof items> = {};

    items.forEach((item) => {
      const farmerId = String(item.product.farmer?.id ?? "");

      if (!farmerId) return;

      if (!groups[farmerId]) {
        groups[farmerId] = [];
      }

      groups[farmerId].push(item);
    });

    return groups;
  }, [items]);

  const farmerIds = Object.keys(groupedByFarmer);

  const selectedFarmerId = farmerIds.length > 0 ? farmerIds[0] : null;

  const selectedItems = selectedFarmerId
    ? groupedByFarmer[selectedFarmerId]
    : [];

  const selectedFarmer = selectedItems?.[0]?.product?.farmer;

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.product.sale_price) * item.quantity,
    0,
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showFarmerInfo) {
          setShowFarmerInfo(false);
        } else if (showNegotiationModal) {
          setShowNegotiationModal(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [setIsOpen, showFarmerInfo, showNegotiationModal]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleFocus = () => {
      if (!waitingReturn) return;

      setShowNegotiationModal(true);

      setWaitingReturn(false);
    };

    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, [waitingReturn]);

  function handleNegotiation() {
    if (!selectedFarmer || !selectedItems.length) {
      return;
    }

    const list = selectedItems
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} - R$ ${(
            Number(item.product.sale_price) * item.quantity
          )
            .toFixed(2)
            .replace(".", ",")}`,
      )
      .join("\n");

    const message = `Olá ${
      selectedFarmer.display_name
    }! Tenho interesse nesses produtos:

${list}

Total estimado: R$ ${selectedTotal.toFixed(2).replace(".", ",")}`;

    const whatsapp =
      `https://wa.me/55${selectedFarmer.phone}?text=` +
      encodeURIComponent(message);

    setWaitingReturn(true);

    setLastFarmerId(String(selectedFarmer.id));

    window.open(whatsapp, "_blank");
  }

  function handleConfirmNegotiation(success: boolean) {
    if (success && lastFarmerId) {
      const products = groupedByFarmer[lastFarmerId] || [];

      products.forEach((item) => {
        removeFromCart(item.product.id);
      });
    }

    setShowNegotiationModal(false);

    setLastFarmerId(null);
  }

  if (!isOpen) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* SHEET */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingBasket className="text-green-700" size={20} />
            </div>

            <div>
              <h2 className="font-bold text-stone-900">Sua Cesta</h2>

              <p className="text-sm text-stone-500">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={24} className="text-stone-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBasket size={32} className="text-stone-400" />
              </div>

              <h3 className="font-bold text-stone-800 mb-2">
                Sua cesta está vazia
              </h3>

              <p className="text-stone-500 text-sm">
                Adicione produtos frescos da agricultura familiar
              </p>
            </div>
          ) : (
            <>
              {/* MULTI AGRICULTOR */}
              {farmerIds.length > 1 ? (
                <div className="mb-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900 mb-2">
                    Como funcionará a sua compra?
                  </p>

                  <p className="text-sm text-amber-800 mb-2">
                    Você adicionou produtos de agricultores diferentes, por
                    isso, negociaremos um agricultor por vez.
                  </p>

                  <p className="text-sm text-amber-800 mb-3">
                    Você está negociando agora os produtos de{" "}
                    <strong>{selectedFarmer?.display_name}</strong>
                  </p>

                  <button
                    onClick={() => setShowFarmerInfo(true)}
                    className="text-sm text-amber-900 font-medium hover:underline"
                  >
                    Clique aqui e veja os métodos de pagamento e entrega
                  </button>
                </div>
              ) : (
                <div className="mb-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800 mb-3">
                    Você está negociando agora os produtos de{" "}
                    <strong>{selectedFarmer?.display_name}</strong>
                  </p>

                  <button
                    onClick={() => setShowFarmerInfo(true)}
                    className="text-sm text-amber-900 font-medium hover:underline"
                  >
                    Clique aqui e veja os métodos de pagamento e entrega que ele
                    oferece
                  </button>
                </div>
              )}

              {/* PRODUTOS ATIVOS */}
              <div className="space-y-4">
                {selectedItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-stone-50 rounded-xl p-4 border border-stone-100"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0">
                        <img
                          src={item.product.images?.[0]?.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-stone-800 text-sm leading-tight">
                            {item.product.name}
                          </h3>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p className="text-xs text-stone-500 mb-3">
                          Agricultor: {item.product.farmer?.display_name}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg p-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center font-bold text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <span className="font-bold text-green-800">
                            R${" "}
                            {(Number(item.product.sale_price) * item.quantity)
                              .toFixed(2)
                              .replace(".", ",")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PRODUTOS BLOQUEADOS */}
              {farmerIds.length > 1 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-stone-700 mb-3">
                    Próximos produtos
                  </h3>

                  <div className="space-y-3">
                    {farmerIds
                      .filter((id) => id !== selectedFarmerId)
                      .flatMap((id) =>
                        groupedByFarmer[id].map((item) => (
                          <div
                            key={item.product.id}
                            className="rounded-xl border border-stone-200 bg-stone-100 p-4 opacity-60"
                          >
                            <div className="flex gap-3">
                              <img
                                src={item.product.images?.[0]?.image_url}
                                alt={item.product.name}
                                className="w-16 h-16 rounded-lg object-cover grayscale"
                              />

                              <div className="flex-1">
                                <p className="font-semibold text-sm text-stone-700">
                                  {item.product.name}
                                </p>

                                <p className="text-xs text-stone-500">
                                  Agricultor:{" "}
                                  {item.product.farmer?.display_name}
                                </p>

                                <p className="text-xs text-stone-500">
                                  Quantidade: {item.quantity}
                                </p>
                              </div>
                            </div>
                          </div>
                        )),
                      )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-6 bg-white">
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-stone-700">Total atual</span>

                <span className="font-bold text-2xl text-green-800">
                  R$ {selectedTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>

              {farmerIds.length > 1 && (
                <p className="text-xs text-stone-500">
                  Referente aos produtos de {selectedFarmer?.display_name}
                </p>
              )}
            </div>

            <button
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              onClick={handleNegotiation}
            >
              <MessageCircle size={20} />
              Negociar com {selectedFarmer?.display_name}
            </button>
          </div>
        )}
      </div>

      {/* MODAL AGRICULTOR */}
      {showFarmerInfo && selectedFarmer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setShowFarmerInfo(false)}
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-stone-200">
                <div>
                  <h2 className="font-bold text-lg text-stone-900">
                    {selectedFarmer.display_name}
                  </h2>

                  <p className="text-sm text-stone-500">
                    Informações do agricultor
                  </p>
                </div>

                <button
                  onClick={() => setShowFarmerInfo(false)}
                  className="p-2 hover:bg-stone-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedFarmer?.id && (
                <PaymentsDelivery farmerId={selectedFarmer.id} />
              )}

              {/* FOOTER */}
              <div className="p-6 border-t border-stone-200">
                <button
                  onClick={() => setShowFarmerInfo(false)}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL NEGOCIAÇÃO */}
      {showNegotiationModal && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[80]" />

          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-stone-200">
                <h2 className="text-xl font-bold text-center text-stone-900">
                  A negociação deu certo?
                </h2>
              </div>

              <div className="p-6 flex flex-col gap-3">
                <button
                  onClick={() => handleConfirmNegotiation(true)}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold"
                >
                  Sim, remover da cesta
                </button>

                <button
                  onClick={() => setShowNegotiationModal(false)}
                  className="w-full py-3 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Vou deixar para mais tarde
                </button>
                <button
                  onClick={() => handleConfirmNegotiation(true)}
                  className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-xl font-semibold"
                >
                  Não, quero remover os produtos
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
