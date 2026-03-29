import { useState } from 'react';
import { MagnifyingGlass, MapPin, SlidersHorizontal, ArrowRight, Gps } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { buscarCep } from '../services/locationService';
import { Header } from '../components/Header';

export function Home() {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userZipCode, setUserZipCode] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Handlers
  const handleSubmitZipCode = async () => {
    if (userZipCode.length === 8) {
      try {
        const zipData = await buscarCep(userZipCode);

        toast.success(
          `CEP encontrado: ${zipData.logradouro}, ${zipData.bairro} - ${zipData.localidade}/${zipData.uf}`
        );

      } catch (error) {
        toast.error('CEP não encontrado. Por favor, verifique e tente novamente.');
      }
    } else {
      toast.error('Por favor, digite um CEP válido com 8 dígitos.');
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta geolocalização');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        toast.success('Localização obtida com sucesso!');
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        toast.error('Não foi possível obter sua localização automaticamente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Header />

      {/* Seção Hero */}
      <section className="bg-green-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        
        <div className="container mx-auto relative z-10 max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Do campo direto para a sua mesa
          </h1>
          <p className="text-green-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Conectamos você aos agricultores familiares da sua região. 
            Frescor, qualidade e sustentabilidade em cada entrega.
          </p>

          {/* Card de Localização */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl mb-8 max-w-md mx-auto border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2 text-white mb-4 text-sm font-medium justify-center">
              <MapPin size={18} className="text-green-400" />
              <span>Para ver produtos perto de você, informe sua região:</span>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Digite seu CEP" 
                className="flex-1 bg-white text-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-stone-400 px-4 py-3"
                value={userZipCode}
                onChange={(e) => setUserZipCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                maxLength={8}
              />
              <button 
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                onClick={handleSubmitZipCode}
              >
                <ArrowRight size={20} />
              </button>
            </div>
            
            <div className="relative py-2 mb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-green-900/50 px-3 text-white text-xs">OU</span>
              </div>
            </div>

            <button 
              className="w-full bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/30 disabled:opacity-50" 
              onClick={handleGetLocation}
              disabled={isGettingLocation}
            >
              <Gps size={18} className={isGettingLocation ? "animate-spin" : ""} />
              {isGettingLocation ? 'Localizando...' : 'Usar minha localização atual'}
            </button>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 -mt-8 relative z-20">
        
        {/* Barra de Busca */}
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-100 mb-12 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full flex gap-2 items-center">
            <button 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${showFilters ? 'bg-green-100 text-green-800' : 'bg-stone-50 text-stone-600'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text" 
                placeholder="Busque por produtos ou produtores..." 
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 text-stone-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}