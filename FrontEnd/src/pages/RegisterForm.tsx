import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Lock,
  MapPin,
  Sprout,
  Eye,
  EyeOff,
  Locate,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  buscarCep,
  buscarLatLngPorEndereco,
} from "../services/locationService";
import { postFarmer } from "../services/farmer";
import type { Farmer } from "../Models/Models";

export function RegisterForm() {
  const navigate = useNavigate();

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [farmerData, setFarmerData] = useState<Farmer>({
    id: "",
    first_name: "",
    last_name: "",
    display_name: "",
    cpf: "",
    phone: "",
    email: "",
    profession: "",
    description: "",
    password: "",
    confirm_password: "",
    gender: "",
    address: {
      id: 0,
      address_type: "residential",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
      latitude: 0,
      longitude: 0,
      is_primary: true,
    },
  });

  // Estilos padronizados
  const inputClass =
    "w-full px-4 py-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all";

  const textareaClass =
    "w-full px-4 py-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none";

  const labelClass = "block text-sm font-medium text-stone-700 mb-2";

  const cardClass = "bg-white rounded-xl p-6 border border-green-600 shadow-sm";

  // Funções de formatação
  const formatCPF = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);

  const formatPhone = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

  const formatZipCode = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);

  const validateForm = () => {
    // Dados Pessoais
    if (!farmerData.first_name.trim()) {
      toast.warning("O nome é obrigatório");
      return false;
    }
    if (!farmerData.last_name.trim()) {
      toast.warning("O sobrenome é obrigatório");
      return false;
    }
    if (!farmerData.display_name.trim()) {
      toast.warning("O nome de exibição é obrigatório");
      return false;
    }
    if (!farmerData.cpf.trim()) {
      toast.warning("O CPF é obrigatório");
      return false;
    }
    if (!farmerData.phone.trim()) {
      toast.warning("O telefone é obrigatório");
      return false;
    }
    if (!farmerData.email.trim()) {
      toast.warning("O e-mail é obrigatório");
      return false;
    }
    if (!farmerData.gender) {
      toast.warning("Selecione o seu sexo");
      return false;
    }

    // Atividade Rural
    if (!farmerData.profession.trim()) {
      toast.warning("A profissão é obrigatória");
      return false;
    }
    if (!farmerData.description.trim()) {
      toast.warning("A descrição da atividade é obrigatória");
      return false;
    }

    // Endereço
    const addr = farmerData.address;
    if (!addr.zip_code.trim()) {
      toast.warning("O CEP é obrigatório");
      return false;
    }
    if (!addr.number.trim()) {
      toast.warning("O número do endereço é obrigatório");
      return false;
    }
    if (!addr.street.trim()) {
      toast.warning("A rua é obrigatória");
      return false;
    }
    if (!addr.neighborhood.trim()) {
      toast.warning("O bairro é obrigatório");
      return false;
    }
    if (!addr.city.trim()) {
      toast.warning("A cidade é obrigatória");
      return false;
    }
    if (!addr.state) {
      toast.warning("Selecione o estado (UF)");
      return false;
    }

    // Senha
    if (!farmerData.password) {
      toast.warning("A senha é obrigatória");
      return false;
    }
    if (farmerData.password.length < 8) {
      toast.warning("A senha deve ter pelo menos 8 caracteres");
      return false;
    }
    if (farmerData.password !== farmerData.confirm_password) {
      toast.warning("As senhas não coincidem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação intercepta o envio
    if (!validateForm()) return;

    setIsSubmitting(true);

    let updatedAddress = { ...farmerData.address };

    if (updatedAddress.latitude === 0 || updatedAddress.longitude === 0) {
      try {
        const { lat, lng } = await buscarLatLngPorEndereco(updatedAddress);
        updatedAddress = {
          ...updatedAddress,
          latitude: lat,
          longitude: lng,
        };
      } catch (error) {
        console.error("Erro ao buscar coordenadas", error);
      }
    }

    // Criamos uma cópia para enviar ao back-end com os dados limpos
    const dataToSend = {
      ...farmerData,
      cpf: farmerData.cpf.replace(/\D/g, ""),
      phone: farmerData.phone.replace(/\D/g, ""),
      address: {
        ...updatedAddress,
        zip_code: farmerData.address.zip_code.replace(/\D/g, ""),
      },
    };

    try {
      await postFarmer(dataToSend);
      toast.success("Cadastro concluído com sucesso!");
      navigate("/agricultor/login");
    } catch (error: any) {
      if (error.response && error.response.data) {
        const { message, errorType } = error.response.data;

        if (errorType === "DUPLICATE_ENTRY") {
          toast.error("Ops! Esse e-mail ou CPF já está cadastrado.");
        } else {
          toast.error(message || "Erro ao realizar o cadastro.");
        }
      } else {
        toast.error(
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para mudar campos de dentro do endereço
  const handleAddressChange = async (
    campo: keyof Farmer["address"],
    valor: string,
  ) => {
    let valorFormatado = valor;

    if (campo === "zip_code") {
      valorFormatado = formatZipCode(valor);
    }

    setFarmerData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [campo]: valorFormatado,
      },
    }));

    // Busca CEP apenas quando completo
    if (campo === "zip_code" && valor.replace(/\D/g, "").length === 8) {
      try {
        const dadosCep = await buscarCep(valorFormatado);
        setFarmerData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            zip_code: valorFormatado,
            street: dadosCep.logradouro,
            neighborhood: dadosCep.bairro,
            city: dadosCep.localidade,
            state: dadosCep.uf,
          },
        }));
      } catch {
        toast.error("CEP não encontrado");
      }
    }
  };

  const aoMudarCampo = (campo: keyof Farmer, valor: string) => {
    let valorFormatado = valor;
    if (campo === "cpf") valorFormatado = formatCPF(valor);
    if (campo === "phone") valorFormatado = formatPhone(valor);
    setFarmerData((prev) => ({ ...prev, [campo]: valorFormatado }));
  };

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      return toast.error("Seu navegador não suporta GPS");
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFarmerData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        }));
        setLocationCaptured(true);
        toast.success("Localização capturada do seu local com precisão!");
        setIsGettingLocation(false);
      },
      () => {
        toast.error("Erro ao obter GPS. Preencha o endereço somente.");
        setIsGettingLocation(false);
      },
    );
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* HEADER AJUSTADO */}
      <header className="border-b border-stone-200 sticky top-0 z-40 shadow-sm bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/agricultor/login")}
              className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors w-fit"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Voltar ao Login</span>
            </button>

            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Cadastro de Agricultor
              </h1>
              <p className="text-sm text-stone-600">
                Preencha seus dados para vender na AgroFamília
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DADOS PESSOAIS */}
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-200 pb-4">
              <User size={22} className="text-green-700" />
              Dados Pessoais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nome *</label>
                <input
                  className={inputClass}
                  value={farmerData.first_name}
                  onChange={(e) => aoMudarCampo("first_name", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Sobrenome *</label>
                <input
                  className={inputClass}
                  value={farmerData.last_name}
                  onChange={(e) => aoMudarCampo("last_name", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Nome de Exibição (Como você é conhecido) *
                </label>
                <input
                  className={inputClass}
                  value={farmerData.display_name}
                  onChange={(e) => aoMudarCampo("display_name", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>CPF *</label>
                <input
                  className={inputClass}
                  value={farmerData.cpf}
                  onChange={(e) => aoMudarCampo("cpf", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Telefone *</label>
                <input
                  className={inputClass}
                  value={farmerData.phone}
                  onChange={(e) => aoMudarCampo("phone", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>E-mail *</label>
                <input
                  type="email"
                  className={inputClass}
                  value={farmerData.email}
                  onChange={(e) => aoMudarCampo("email", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Sexo *</label>
                <select
                  className={inputClass}
                  value={farmerData.gender}
                  onChange={(e) => aoMudarCampo("gender", e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>
          </section>

          {/* ATIVIDADE PROFISSIONAL */}
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-200 pb-4">
              <Sprout size={22} className="text-green-700" />
              Atividade Rural
            </h2>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Profissão / Especialidade *
                </label>
                <input
                  className={inputClass}
                  placeholder="Ex: Produtor de Hortaliças Orgânicas"
                  value={farmerData.profession}
                  onChange={(e) => aoMudarCampo("profession", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Descrição da Atividade *</label>
                <textarea
                  rows={4}
                  className={textareaClass}
                  placeholder="Conte sobre seus produtos e sua propriedade..."
                  value={farmerData.description}
                  onChange={(e) => aoMudarCampo("description", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ENDEREÇO E LOCALIZAÇÃO */}
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
              <MapPin size={22} className="text-green-700" />
              Localização da Propriedade
            </h2>
            <p className="text-sm text-stone-600 mb-6 border-b border-stone-200 pb-4">
              O endereço onde você produz seus produtos será utilizado para
              calcular a distância até os clientes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className={labelClass}>CEP *</label>
                <input
                  className={inputClass}
                  value={farmerData.address.zip_code}
                  onChange={(e) =>
                    handleAddressChange("zip_code", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Número *</label>
                <input
                  className={inputClass}
                  value={farmerData.address.number}
                  onChange={(e) =>
                    handleAddressChange("number", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Complemento</label>
                <input
                  className={inputClass}
                  placeholder="Opcional"
                  value={farmerData.address.complement}
                  onChange={(e) =>
                    handleAddressChange("complement", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelClass}>Rua / Endereço *</label>
                <input
                  className={inputClass}
                  value={farmerData.address.street}
                  onChange={(e) =>
                    handleAddressChange("street", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Bairro *</label>
                <input
                  className={inputClass}
                  value={farmerData.address.neighborhood}
                  onChange={(e) =>
                    handleAddressChange("neighborhood", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Cidade *</label>
                <input
                  className={inputClass}
                  value={farmerData.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Estado (UF) *</label>
                <select
                  className={inputClass}
                  value={farmerData.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-stone-600 flex-1">
                  Capture sua localização atual para garantir mais precisão no
                  mapa para os seus clientes.
                </p>
                {/* BOTÃO DE LOCALIZAÇÃO ATUALIZADO */}
                <button
                  type="button"
                  onClick={capturarLocalizacao}
                  disabled={isGettingLocation || locationCaptured}
                  className={`w-full md:w-auto px-6 py-3 border-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    locationCaptured
                      ? "bg-green-600 border-green-600 text-white hover:bg-green-700"
                      : "border-green-600 text-green-700 bg-white hover:bg-green-50"
                  }`}
                >
                  {isGettingLocation ? (
                    <>
                      <Locate size={18} className="animate-pulse" />
                      Capturando...
                    </>
                  ) : locationCaptured ? (
                    <>
                      <Check size={18} />
                      Localização Capturada
                    </>
                  ) : (
                    <>
                      <Locate size={18} />
                      Capturar Localização
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* ACESSO E SEGURANÇA */}
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Lock size={22} className="text-green-700" />
              Dados de Acesso
            </h2>
            <p className="text-sm text-stone-600 mb-6 border-b border-stone-200 pb-4">
              As senhas devem ter no mínimo 8 caracteres.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Senha *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inputClass}
                    value={farmerData.password}
                    onChange={(e) => aoMudarCampo("password", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Confirmar Senha *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className={inputClass}
                  value={farmerData.confirm_password}
                  onChange={(e) =>
                    aoMudarCampo("confirm_password", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/agricultor/login")}
              className="flex-1 px-6 py-4 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-green-700 text-white hover:bg-green-800 rounded-lg transition-colors font-bold flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Finalizar Meu Cadastro"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
