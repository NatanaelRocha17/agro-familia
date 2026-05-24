import { MapPin, ArrowRight, Locate } from 'lucide-react';

interface HeroLocationProps {
  userCep: string;
  setUserCep: (cep: string) => void;
  handleCepSubmit: () => void;
  handleGetLocation: () => void;
  isGettingLocation: boolean;
}

export function HeroLocation({
  userCep,
  setUserCep,
  handleCepSubmit,
  handleGetLocation,
  isGettingLocation
}: HeroLocationProps) {
  return (
    <section className="bg-green-900 text-white py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854')] bg-cover bg-center opacity-20"></div>
      <div className="container mx-auto relative z-10 text-center max-w-4xl">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Do campo direto para a sua mesa
        </h1>
        <p className="text-green-100 mb-8">
          Produtos frescos direto de agricultores locais
        </p>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl max-w-md mx-auto border border-white/20">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <MapPin size={16} /> Onde você está?
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Digite seu CEP"
              className="flex-1 bg-white/90 text-stone-800 rounded-lg px-3 py-2"
              value={userCep}
              onChange={(e) => setUserCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
            />
            <button
              onClick={handleCepSubmit}
              className="bg-green-600 hover:bg-green-500 px-4 rounded-lg flex items-center gap-1"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          <button
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="w-full bg-white/20 hover:bg-white/30 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Locate size={18} />
            {isGettingLocation ? 'Obtendo localização...' : 'Usar minha localização'}
          </button>
        </div>
      </div>
    </section>
  );
}