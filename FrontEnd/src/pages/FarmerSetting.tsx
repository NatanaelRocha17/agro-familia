// src/pages/FarmerSettings.tsx

import { useState } from "react";
import { ArrowLeft, CreditCard, Truck } from "lucide-react";
import { PaymentSettings } from "../components/PaymentSettings";
import { DeliverySettings } from "../components/DeliverySettings";
import { useNavigate } from "react-router-dom";

export function FarmerSettings() {
  const [tab, setTab] = useState<"payment" | "delivery">("payment");

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4 white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/agricultor/dashboard")}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Voltar</span>
            </button>
          </div>
        </div>
      </header>
      <div className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-stone-900">Configurações</h1>
          <p className="text-stone-600 mt-1">
            Gerencie pagamentos e entregas da sua loja
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-2 border border-stone-200 flex gap-2 mb-8">
          <button
            onClick={() => setTab("payment")}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              tab === "payment"
                ? "bg-green-700 text-white"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <CreditCard size={18} />
            Pagamentos
          </button>

          <button
            onClick={() => setTab("delivery")}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              tab === "delivery"
                ? "bg-green-700 text-white"
                : "text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Truck size={18} />
            Entregas
          </button>
        </div>

        {tab === "payment" && <PaymentSettings />}
        {tab === "delivery" && <DeliverySettings />}
      </main>
    </div>
  );
}
