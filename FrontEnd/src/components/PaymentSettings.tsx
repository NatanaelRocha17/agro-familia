import { useEffect, useState } from "react";
import { Save, Check, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { getPaymentMethodsFarmer, putPaymentMethod } from "../services/payment";
import { Loading } from "./Loading";

interface PaymentMethod {
  id: number;
  method_name: string;
  description: string;
  status: number;
  accepted: boolean;
}

export function PaymentSettings() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Colocamos o 'as any' temporário para o TypeScript não reclamar
      const response = (await getPaymentMethodsFarmer(user.id)) as any;

      // Extraímos a lista real que o backend enviou dentro de .data
      setMethods(response?.data || []);
    } catch (error) {
      toast.error("Erro ao carregar métodos.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMethod = (id: number) => {
    setMethods((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, accepted: !item.accepted } : item,
      ),
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const selectedIds = methods
        .filter((item) => item.accepted)
        .map((item) => item.id);

      await putPaymentMethod(user.id, {
        paymentMethodIds: selectedIds,
      });

      toast.success("Métodos atualizados com sucesso.");
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">
          Métodos de Pagamento
        </h2>
        <p className="text-stone-600 mt-1">
          Escolha quais formas de pagamento você aceita.
        </p>
      </div>

      <div className="space-y-4">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => toggleMethod(method.id)}
            className={`w-full p-4 rounded-xl border flex items-center justify-between transition ${
              method.accepted
                ? "border-green-600 bg-green-50"
                : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-green-700" />
              <span className="font-medium text-stone-800">
                {method.description}
              </span>
            </div>

            {method.accepted && <Check size={18} className="text-green-700" />}
          </button>
        ))}
      </div>

      {methods.every((m) => m.accepted === false) && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800 text-sm">
            ⚠️ Selecione pelo menos um método de pagamento para que os clientes
            possam negociar com você
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-green-700 text-white rounded-xl hover:bg-green-800 transition flex items-center gap-2 font-semibold disabled:opacity-60"
        >
          <Save size={18} />
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
