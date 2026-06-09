import React, { useEffect, useState } from "react";
import { CreditCard, Truck } from "lucide-react";
import { getPaymentMethodsFarmer } from "../../services/payment";
import { listDeliveryMethodsByFarmer } from "../../services/delivery";
import type { deliveryMethods, paymentMethods } from "../../Models/Models";
import { Loading } from "../Loading";

interface PaymentsDeliveryProps {
  farmerId: number | string;
}

export const PaymentsDelivery: React.FC<PaymentsDeliveryProps> = ({
  farmerId,
}) => {
  const [loading, setLoading] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<paymentMethods[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<deliveryMethods[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!farmerId) return;

      try {
        setLoading(true);
        const [paymentResponse, deliveryResponse] = (await Promise.all([
          getPaymentMethodsFarmer(Number(farmerId)),
          listDeliveryMethodsByFarmer(Number(farmerId)),
        ])) as any[];

        // Extraímos as listas de dentro do '.data' de cada resposta
        setPaymentMethods(paymentResponse?.data || []);
        setDeliveryMethods(deliveryResponse?.data || []);
        
      } catch (error) {
        console.error("Erro ao carregar métodos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [farmerId]);

  return (
    <div className="space-y-6 px-[10px]">
      {loading ? (
        <Loading/>
      ) : (
        <>
          {/* PAGAMENTOS */}
          <div>
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CreditCard size={18} />
              Métodos de Pagamento
            </h3>

            {paymentMethods.filter((method) => method.accepted).length === 0 ? (
              <p className="text-sm text-stone-500">
                Nenhum método de pagamento cadastrado.
              </p>
            ) : (
              <div className="space-y-2">
                {paymentMethods
                  .filter((method) => method.accepted)
                  .map((method) => (
                    <div
                      key={method.id}
                      className="border border-stone-200 rounded-lg p-3 bg-stone-50"
                    >
                      <p className="font-medium text-stone-900">
                        {method.description || method.method_name}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ENTREGAS */}
          <div>
            <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Truck size={18} />
              Métodos de Entrega
            </h3>

            {deliveryMethods.length === 0 ? (
              <p className="text-sm text-stone-500">
                Nenhum método de entrega cadastrado.
              </p>
            ) : (
              <div className="space-y-3">
                {deliveryMethods.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border border-stone-200 rounded-lg p-3 bg-stone-50"
                  >
                    <p className="font-medium text-stone-900">
                      {delivery.option_name}
                    </p>

                    <p className="text-sm text-stone-600">
                      Prazo: {delivery.estimated_time} dia(s)
                    </p>

                    {delivery.addresses.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {delivery.addresses.map((address) => (
                          <p
                            key={address.id}
                            className="text-sm text-stone-600"
                          >
                            Endereço: {address.street}, {address.number}
                            {" - "}
                            {address.city}/{address.state}
                          </p>
                        ))}
                      </div>
                    )}

                    <p className="text-sm text-stone-600">
                      Taxa:{" "}
                      {Number(delivery.cost) === 0
                        ? "Grátis"
                        : `R$ ${Number(delivery.cost)
                            .toFixed(2)
                            .replace(".", ",")}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
