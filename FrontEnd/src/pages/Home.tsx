import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "../components/ProductCard";
import { Loading } from "../components/Loading";

import { getAllCategories, getAllProductsNearby } from "../services/product";

import {
  buscarCep,
  buscarLatLngPorEndereco,
} from "../services/locationService";

import type { GetAllCategories, Product } from "../Models/Models";

import {
  DollarSign,
  Filter,
  Locate,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BenefitsSection } from "../components/Home/BenefitsSection";
import { FilterPanel } from "../components/Home/FilterPanel";
import { HeroLocation } from "../components/Home/HeroLocation";

type UserLocation = {
  lat: number;
  lng: number;
  timestamp: number;
};

type PersistedFilters = {
  selectedRadius: number | null;
  priceMin: string;
  priceMax: string;
  categoryId: number | null;
  searchTerm: string;
  timestamp: number;
};

const ONE_HOUR = 1000 * 60 * 60;
const DEFAULT_RADIUS = 50;
const DEFAULT_LIMIT = 12;

const FILTERS_STORAGE_KEY = "homeFilters";
const LOCATION_STORAGE_KEY = "userLocation";

const normalizeNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const getInitialFilters = (): PersistedFilters | null => {
  const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
  if (!savedFilters) return null;

  try {
    const parsed = JSON.parse(savedFilters) as PersistedFilters;
    const isValid = Date.now() - parsed.timestamp < ONE_HOUR;

    if (!isValid) {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(FILTERS_STORAGE_KEY);
    return null;
  }
};

export function Home() {
  const initialFilters = getInitialFilters();

  // 1. ESTADOS
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm ?? "");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState(initialFilters?.searchTerm ?? "");

  const [showFilters, setShowFilters] = useState(false);
  const [userCep, setUserCep] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocationOrCep, setuserLocationOrCep] = useState<boolean>(true);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedRadius, setSelectedRadius] = useState<number | null>(initialFilters?.selectedRadius ?? DEFAULT_RADIUS);
  const [priceMin, setPriceMin] = useState(initialFilters?.priceMin ?? "");
  const [priceMax, setPriceMax] = useState(initialFilters?.priceMax ?? "");
  const [categories, setCategories] = useState<GetAllCategories[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(initialFilters?.categoryId ?? null);

  // 2. FUNÇÕES BASE E STORAGE (Devem vir antes dos handlers)
  const loadCategories = useCallback(async () => {
    try {
      const response = await getAllCategories();
      setCategories(response as GetAllCategories[]);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  }, []);

  const persistLocation = useCallback((lat: number, lng: number) => {
    const locationData: UserLocation = { lat, lng, timestamp: Date.now() };
    setUserLocation(locationData);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
    return locationData;
  }, []);

  // Nova função inteligente de cache
  const saveFiltersToStorage = useCallback((overrides: Partial<PersistedFilters> = {}) => {
    const filtersToSave: PersistedFilters = {
      selectedRadius,
      priceMin,
      priceMax,
      categoryId,
      searchTerm: appliedSearchTerm,
      timestamp: Date.now(),
      ...overrides,
    };
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filtersToSave));
  }, [selectedRadius, priceMin, priceMax, categoryId, appliedSearchTerm]);

  // MOTOR CENTRAL DE BUSCA
  const loadProducts = useCallback(
    async (
      lat: number,
      lng: number,
      pageNumber = 1,
      reset = false,
      overrides?: {
        searchTerm?: string;
        priceMin?: string;
        priceMax?: string;
        categoryId?: number | null;
        radius?: number | null;
      }
    ) => {
      try {
        setIsLoadingProducts(true);

        const finalSearch = overrides?.searchTerm !== undefined ? overrides.searchTerm : appliedSearchTerm;
        const finalPriceMin = overrides?.priceMin !== undefined ? overrides.priceMin : priceMin;
        const finalPriceMax = overrides?.priceMax !== undefined ? overrides.priceMax : priceMax;
        const finalCategoryId = overrides?.categoryId !== undefined ? overrides.categoryId : categoryId;
        const finalRadius = overrides?.radius !== undefined ? overrides.radius : selectedRadius;

        const response = await getAllProductsNearby(
          lat,
          lng,
          finalRadius ?? DEFAULT_RADIUS,
          pageNumber,
          DEFAULT_LIMIT,
          normalizeNumber(finalPriceMin),
          normalizeNumber(finalPriceMax),
          finalCategoryId ?? undefined,
          finalSearch
        );

        const result = response?.data?.items ?? [];
        const totalPages = response?.data?.pagination?.totalPages ?? 1;
        setHasMore(pageNumber < totalPages);

        setProducts((prev) => (reset ? result : [...prev, ...result]));
      } catch {
        toast.error("Erro ao buscar produtos");
      } finally {
        setIsLoadingProducts(false);
        setIsGettingLocation(false);
      }
    },
    [appliedSearchTerm, priceMin, priceMax, categoryId, selectedRadius]
  );

  // 3. HANDLERS (Agora enxergam loadProducts e saveFiltersToStorage corretamente)
  const handlePageChange = useCallback((newPage: number) => {
      if (!userLocation) return;
      setPage(newPage);
      loadProducts(userLocation.lat, userLocation.lng, newPage, true);
      document.getElementById("area-produtos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [userLocation, loadProducts]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) return toast.error("Seu navegador não suporta geolocalização");
    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        persistLocation(latitude, longitude);
        setPage(1);
        setHasMore(true);
        setuserLocationOrCep(true);
        await loadProducts(latitude, longitude, 1, true);
      },
      () => {
        setIsGettingLocation(false);
        toast.error("Erro ao obter localização");
      }
    );
  }, [persistLocation, loadProducts]);

  const handleCepSubmit = useCallback(async () => {
    const cepLimpo = userCep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return toast.error("CEP inválido");

    try {
      const data = await buscarCep(userCep);
      const endereco = { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf };
      const { lat, lng } = await buscarLatLngPorEndereco(endereco);

      persistLocation(lat, lng);
      setPage(1);
      setHasMore(true);
      toast.success(`${data.localidade} - ${data.uf}`);
      setuserLocationOrCep(false);

      await loadProducts(lat, lng, 1, true);
    } catch {
      toast.error("CEP não encontrado");
    }
  }, [userCep, persistLocation, loadProducts]);

  const handleApplyFilters = useCallback(async () => {
    if (!userLocation) return toast.error("Precisamos da sua localização primeiro");

    setAppliedSearchTerm(searchTerm);
    setPage(1);
    setHasMore(true);
    setShowFilters(false);

    saveFiltersToStorage({ searchTerm: searchTerm });
    await loadProducts(userLocation.lat, userLocation.lng, 1, true, { searchTerm });
  }, [userLocation, searchTerm, loadProducts, saveFiltersToStorage]);

  const handleClearFilters = useCallback(async () => {
    setCategoryId(null);
    setSelectedRadius(null);
    setPriceMin("");
    setPriceMax("");
    setSearchTerm(""); 
    setAppliedSearchTerm("");

    saveFiltersToStorage({ categoryId: null, selectedRadius: null, priceMin: "", priceMax: "", searchTerm: "" });

    if (userLocation) {
      setPage(1);
      setHasMore(true);
      await loadProducts(userLocation.lat, userLocation.lng, 1, true, {
        categoryId: null, radius: null, priceMin: "", priceMax: "", searchTerm: ""
      });
    }
  }, [userLocation, loadProducts, saveFiltersToStorage]);

  const removeFilter = useCallback(async (filterType: "category" | "radius" | "price" | "search") => {
      if (!userLocation) return;

      let newSearch = appliedSearchTerm;
      let newCat = categoryId;
      let newRadius = selectedRadius;
      let newPriceMin = priceMin;
      let newPriceMax = priceMax;

      if (filterType === "category") { setCategoryId(null); newCat = null; }
      if (filterType === "radius") { setSelectedRadius(null); newRadius = null; }
      if (filterType === "price") { setPriceMin(""); setPriceMax(""); newPriceMin = ""; newPriceMax = ""; }
      if (filterType === "search") { setSearchTerm(""); setAppliedSearchTerm(""); newSearch = ""; }

      saveFiltersToStorage({
        categoryId: newCat,
        selectedRadius: newRadius,
        priceMin: newPriceMin,
        priceMax: newPriceMax,
        searchTerm: newSearch,
      });

      setPage(1);
      setHasMore(true);

      await loadProducts(userLocation.lat, userLocation.lng, 1, true, {
        searchTerm: newSearch,
        categoryId: newCat,
        radius: newRadius,
        priceMin: newPriceMin,
        priceMax: newPriceMax,
      });
    },
    [userLocation, loadProducts, appliedSearchTerm, categoryId, selectedRadius, priceMin, priceMax, saveFiltersToStorage]
  );

  // 4. EFEITOS
  useEffect(() => {
    loadCategories();
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation) as UserLocation;
        const isValid = Date.now() - parsed.timestamp < ONE_HOUR;

        if (isValid && parsed.lat && parsed.lng) {
          setUserLocation(parsed);
          loadProducts(parsed.lat, parsed.lng, 1, true);
          return;
        }
      } catch {
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    }

    handleGetLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="inicio" className="min-h-screen bg-stone-50 pb-20">
      <HeroLocation
        userCep={userCep}
        setUserCep={setUserCep}
        handleCepSubmit={handleCepSubmit}
        handleGetLocation={handleGetLocation}
        isGettingLocation={isGettingLocation}
      />

      <main id="area-produtos" className="container mx-auto px-4 -mt-8 relative z-20">
        
        {/* BARRA DE BUSCA E BOTÃO DE FILTROS */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row gap-3 md:items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all shadow-sm 
              ${showFilters ? "bg-green-700 text-white border-green-700 shadow-md" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}
          >
            <SlidersHorizontal size={18} />
            {/* Texto "Filtros" visível também no mobile */}
            <span className="font-medium">Filtros</span>
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              className="w-full pl-10 pr-16 py-3 border border-stone-200 rounded-xl outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              placeholder="O que você procura hoje?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
            />
            <button
              onClick={handleApplyFilters}
              className="absolute right-2 top-2 bg-green-700 text-white p-1.5 rounded-lg hover:bg-green-800 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <FilterPanel
            categories={categories}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            selectedRadius={selectedRadius}
            setSelectedRadius={setSelectedRadius}
            priceMin={priceMin}
            setPriceMin={setPriceMin}
            priceMax={priceMax}
            setPriceMax={setPriceMax}
            handleApplyFilters={handleApplyFilters}
            handleClearFilters={handleClearFilters}
          />
        )}

        {/* INDICADOR DE LOCALIZAÇÃO */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {!userLocationOrCep ? (
                <>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Produtos baseados no CEP</p>
                    <p className="text-blue-700 text-sm">CEP {userCep.replace(/(\d{5})(\d{3})/, "$1-$2")} • Mostrando produtos da sua região</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Locate size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Produtos baseados na localização atual</p>
                    <p className="text-blue-700 text-sm">• Localização aproximada do dispositivo</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* FILTROS ATIVOS E BOTÕES (X) */}
        {(categoryId !== null || selectedRadius !== null || appliedSearchTerm !== "" || priceMin !== "" || priceMax !== "") && (
          <div className="bg-white rounded-lg border border-stone-200 p-4 mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={18} className="text-green-700" />
                  <h3 className="font-semibold text-stone-900 text-sm">Filtros Ativos</h3>
                  <span className="text-xs text-stone-500">
                    ({products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"})
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {appliedSearchTerm !== "" && (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-sm border border-green-200">
                      <Search size={14} />
                      <span className="font-medium">Busca: "{appliedSearchTerm}"</span>
                      <button onClick={() => removeFilter("search")} className="hover:bg-green-100 rounded-full p-0.5 transition-colors"><X size={14} /></button>
                    </div>
                  )}

                  {categoryId !== null && (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-sm border border-green-200">
                      <span className="font-medium">Categoria: {categories.find((c) => c.id === categoryId)?.name}</span>
                      <button onClick={() => removeFilter("category")} className="hover:bg-green-100 rounded-full p-0.5 transition-colors"><X size={14} /></button>
                    </div>
                  )}

                  {selectedRadius !== null && (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-sm border border-green-200">
                      <MapPin size={14} />
                      <span className="font-medium">Raio: até {selectedRadius} km</span>
                      <button onClick={() => removeFilter("radius")} className="hover:bg-green-100 rounded-full p-0.5 transition-colors"><X size={14} /></button>
                    </div>
                  )}

                  {(priceMin !== "" || priceMax !== "") && (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-sm border border-green-200">
                      <DollarSign size={14} />
                      <span className="font-medium">
                        {priceMin && priceMax ? `R$ ${priceMin} - R$ ${priceMax}` : priceMin ? `A partir de R$ ${priceMin}` : `Até R$ ${priceMax}`}
                      </span>
                      <button onClick={() => removeFilter("price")} className="hover:bg-green-100 rounded-full p-0.5 transition-colors"><X size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GRADE DE PRODUTOS */}
        {isGettingLocation || isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loading />
            <p className="text-stone-700 text-lg font-medium text-center">Estamos localizando produtos perto de você</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            Nenhum produto encontrado
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* PAGINAÇÃO */}
            <div className="flex items-center justify-center gap-4 mt-12 mb-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg bg-white text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <ChevronLeft size={20} />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <div className="flex items-center justify-center h-10 px-6 rounded-lg bg-white border border-stone-200 text-stone-700 font-bold shadow-sm">
                Página {page}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!hasMore}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg bg-white text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}
      </main>

      <BenefitsSection />
    </div>
  );
}