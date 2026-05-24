import { Leaf, Truck, Heart } from 'lucide-react';

export function BenefitsSection() {
  return (
    <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 border border-stone-100 shadow-sm">
      <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">Por que escolher a AgroFamília?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Leaf className="text-green-700" size={32} />
          </div>
          <h3 className="font-bold text-stone-900 mb-2">Produtos Frescos</h3>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Truck className="text-green-700" size={32} />
          </div>
          <h3 className="font-bold text-stone-900 mb-2">Entrega Rápida</h3>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="text-green-700" size={32} />
          </div>
          <h3 className="font-bold text-stone-900 mb-2">Apoio Local</h3>
        </div>
      </div>
    </div>
  );
}