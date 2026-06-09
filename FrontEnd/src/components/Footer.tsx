import { MapPin, Mail, Phone, Facebook, Instagram } from 'lucide-react';


export function Footer() {
  return (
    <footer id="sobre" className="bg-green-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-900 font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl">Agro<span className="text-green-200">Família</span></span>
            </div>
            <p className="text-green-100 text-sm leading-relaxed">
              Conectamos você aos pequenos produtores da sua região. Produtos frescos, sustentáveis e direto do campo.
            </p>
          </div>


          {/* Contato */}
          <div>
            <h3 className="font-bold mb-4">Fale Conosco</h3>
            <ul className="space-y-3 text-green-100 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="shrink-0 mt-0.5" />
                <span>Rua da Misericórdia, 0000<br />Centro, Vitória da Conquista - BA</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="shrink-0" />
                <a href="mailto:contato@agrofamilia.com" className="hover:text-white transition-colors">
                  contato@agrofamilia.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="shrink-0" />
                <a href="tel:+5577981012982" className="hover:text-white transition-colors">
                  (77) 98101-2982
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-green-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-green-200 text-sm">
            © 2026 AgroFamília. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-green-800 hover:bg-green-700 flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-green-800 hover:bg-green-700 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}