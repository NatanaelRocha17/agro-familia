import { MapPin } from 'lucide-react';
import type { GetAllCategories } from '../../Models/Models';


interface FilterPanelProps {
  categories: GetAllCategories[];
  categoryId: number | null;
  setCategoryId: (id: number | null) => void;
  selectedRadius: number | null;
  setSelectedRadius: (radius: number | null) => void;
  priceMin: string;
  setPriceMin: (price: string) => void;
  priceMax: string;
  setPriceMax: (price: string) => void;
  handleApplyFilters: () => void;
  handleClearFilters: () => void;
}

export function FilterPanel({
  categories, categoryId, setCategoryId,
  selectedRadius, setSelectedRadius,
  priceMin, setPriceMin, priceMax, setPriceMax,
  handleApplyFilters, handleClearFilters
}: FilterPanelProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-lg mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
      {/* Categorias */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Categorias</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryId(null)}
            className={`px-4 py-2 rounded-full text-sm border transition ${categoryId === null ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200 hover:border-green-500'}`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCategoryId(category.id)}
              className={`px-4 py-2 rounded-full text-sm border transition ${categoryId === category.id ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200 hover:border-green-500'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Raio */}
      <div className="pt-4 border-t border-stone-200">
        <h3 className="text-sm font-semibold text-stone-700 mb-3 flex items-center gap-2">
          <MapPin size={16} /> Raio de distância
        </h3>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 20, 30, 50, 100].map((km) => (
            <button
              key={km}
              onClick={() => setSelectedRadius(km)}
              className={`px-4 py-2 rounded-full text-sm border transition ${selectedRadius === km ? 'bg-green-700 text-white border-green-700' : 'bg-white text-stone-600 border-stone-200 hover:border-green-500'}`}
            >
              {km} km
            </button>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div className="pt-4 border-t border-stone-200 mt-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Preço</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Mín" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm" />
          <input type="number" placeholder="Máx" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full px-3 py-2 border border-stone-200 rounded-md text-sm" />
        </div>
      </div>

      {/* Ações */}
      <div className="mt-6 flex gap-3">
        <button onClick={handleClearFilters} className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition">
          Limpar
        </button>
        <button onClick={handleApplyFilters} className="flex-1 py-3 rounded-xl bg-green-700 text-white font-medium hover:bg-green-600 transition shadow">
          Aplicar filtros
        </button>
      </div>
    </div>
  );
}