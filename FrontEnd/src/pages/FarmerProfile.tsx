import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, MapPin, Save, Sprout } from "lucide-react";
import { toast } from "sonner";
import { getFarmerMe, patchFarmer } from "../services/farmer";
import type { Farmer, FarmerUpdate } from "../Models/Models";
import { Loading } from "../components/Loading";
import { buscarCep } from "../services/locationService";

export function FarmerProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState<FarmerUpdate | null>(null);
  const [formData, setFormData] = useState<FarmerUpdate>({
    id: "",
    first_name: "",
    last_name: "",
    display_name: "",
    cpf: "",
    phone: "",
    email: "",
    profession: "",
    description: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });

  const inputClass =
    "w-full px-4 py-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all";

  const textareaClass =
    "w-full px-4 py-3 border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all resize-none";

  const labelClass = "block text-sm font-medium text-stone-700 mb-2";

  const cardClass = "bg-white rounded-xl p-6 border border-green-600 shadow-sm";

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

    // Função para buscar os dados do agricultor logado e formatar os campos de CPF, telefone e CEP para exibição
  async function fetchFarmerData() {
    try {
      const response = (await getFarmerMe()) as any;
      const farmerData = response.data;

      const formattedData: FarmerUpdate = {
        ...farmerData,
        cpf: formatCPF(farmerData?.cpf || ""),
        phone: formatPhone(farmerData?.phone || ""),
        address: {
          ...farmerData?.address,
          zip_code: formatZipCode(farmerData?.address?.zip_code || ""),
        },
      };

      setFormData(formattedData);
      setOriginalData(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  }

  // Verificação de autenticação e carregamento dos dados do agricultor ao montar o componente
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user.id) {
      navigate("/agricultor/login");
      return;
    }

    fetchFarmerData();
  }, [navigate]);

  // Função para lidar com mudanças nos campos do formulário, aplicando formatações específicas para CPF, telefone e CEP
  const handleFieldChange = (field: keyof Farmer, value: string) => {
    let formattedValue = value;

    if (field === "phone") {
      formattedValue = formatPhone(value);
    }
    if (field === "cpf") {
      formattedValue = formatCPF(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  // Função para lidar com mudanças nos campos de endereço, aplicando formatação para CEP e buscando os dados do CEP quando o campo de CEP for preenchido completamente
  const handleAddressChange = async (
    field: keyof Farmer["address"],
    value: string,
  ) => {
    let formattedValueCep = formatZipCode(value);

    if (field === "zip_code" && value.replace(/\D/g, "").length === 8) {
      try {
        const dadosCep = await buscarCep(formattedValueCep);
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            zip_code: formattedValueCep,
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

    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: field === "zip_code" ? formattedValueCep : value,
      },
    }));
  };

  // Função para comparar os dados original e atual do formulário e retornar apenas os campos que foram alterados, incluindo a lógica para campos aninhados como o endereço
  function getChangedFields(original: any, current: any): any {
    const changes: any = {};

    for (const key in current) {
      const currentValue = current[key];
      const originalValue = original?.[key];

      if (
        typeof currentValue === "object" &&
        currentValue !== null &&
        !Array.isArray(currentValue)
      ) {
        const nestedChanges = getChangedFields(
          originalValue || {},
          currentValue,
        );

        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges;
        }
      } else if (currentValue !== originalValue) {
        changes[key] = currentValue;
      }
    }

    return changes;
  }

  // FUNÇÃO DE VALIDAÇÃO
  const validateForm = () => {
    // Dados Pessoais
    if (!formData.first_name?.trim()) {
      toast.warning("O nome é obrigatório");
      return false;
    }
    if (!formData.last_name?.trim()) {
      toast.warning("O sobrenome é obrigatório");
      return false;
    }
    if (!formData.display_name?.trim()) {
      toast.warning("O nome de exibição é obrigatório");
      return false;
    }
    if (!formData.cpf?.trim()) {
      toast.warning("O CPF é obrigatório");
      return false;
    }
    if (!formData.phone?.trim()) {
      toast.warning("O telefone é obrigatório");
      return false;
    }
    if (!formData.email?.trim()) {
      toast.warning("O e-mail é obrigatório");
      return false;
    }
    if (!formData.gender) {
      toast.warning("Selecione o seu sexo");
      return false;
    }

    // Atividade Rural
    if (!formData.profession?.trim()) {
      toast.warning("A profissão é obrigatória");
      return false;
    }
    if (!formData.description?.trim()) {
      toast.warning("A descrição da atividade é obrigatória");
      return false;
    }

    // Endereço
    const addr = formData.address;
    if (!addr.zip_code?.trim()) {
      toast.warning("O CEP é obrigatório");
      return false;
    }
    if (!addr.number?.trim()) {
      toast.warning("O número do endereço é obrigatório");
      return false;
    }
    if (!addr.street?.trim()) {
      toast.warning("A rua é obrigatória");
      return false;
    }
    if (!addr.neighborhood?.trim()) {
      toast.warning("O bairro é obrigatório");
      return false;
    }
    if (!addr.city?.trim()) {
      toast.warning("A cidade é obrigatória");
      return false;
    }
    if (!addr.state) {
      toast.warning("Selecione o estado (UF)");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Chama a validação antes de qualquer coisa
    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user.id) {
        toast.error("Usuário inválido");
        return;
      }

      if (!originalData) {
        toast.error("Erro ao comparar dados");
        return;
      }

      const cleanedData = {
        ...formData,
        cpf: (formData.cpf ?? "").replace(/\D/g, ""),
        phone: (formData.phone ?? "").replace(/\D/g, ""),
        address: {
          ...formData.address,
          zip_code: (formData.address?.zip_code ?? "").replace(/\D/g, ""),
        },
      };

      const cleanedOriginal = {
        ...originalData,
        cpf: (originalData.cpf ?? "").replace(/\D/g, ""),
        phone: (originalData.phone ?? "").replace(/\D/g, ""),
        address: {
          ...originalData.address,
          zip_code: (originalData.address?.zip_code ?? "").replace(/\D/g, ""),
        },
      };

      const changes = getChangedFields(cleanedOriginal, cleanedData);

      if (Object.keys(changes).length === 0) {
        toast.info("Nenhuma alteração realizada.");
        return;
      }

      await patchFarmer(changes);

      toast.success("Perfil atualizado com sucesso!");

      navigate("/agricultor/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* HEADER */}
      <header className="border-b border-stone-200 sticky top-0 z-40 shadow-sm bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button
              onClick={() => navigate("/agricultor/dashboard")}
              className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Voltar</span>
            </button>

            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                Editar Perfil
              </h1>

              <p className="text-sm text-stone-600">
                Atualize suas informações pessoais
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
                <label className={labelClass}>
                  Nome <span className="text-red-500">*</span>
                </label>

                <input
                  className={inputClass}
                  value={formData.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Sobrenome <span className="text-red-500">*</span>
                </label>

                <input
                  className={inputClass}
                  value={formData.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                />
              </div>

              {/* Omiti o resto do formulário para brevidade, mas o JSX continua exatamente igual ao seu original a partir daqui. A única diferença visual que sugiro é adicionar o `<span className="text-red-500">*</span>` nas labels obrigatórias acima. */}

              <div className="md:col-span-2">
                <label className={labelClass}>Nome de Apresentação</label>
                <input
                  className={inputClass}
                  value={formData.display_name}
                  onChange={(e) =>
                    handleFieldChange("display_name", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.cpf}
                  onChange={(e) => handleFieldChange("cpf", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ATIVIDADE */}
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-200 pb-4">
              <Sprout size={22} className="text-green-700" />
              Atividade Rural
            </h2>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>
                  Profissão <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.profession}
                  onChange={(e) =>
                    handleFieldChange("profession", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  className={textareaClass}
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* ENDEREÇO */}
          <section className={cardClass}>
            <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2 border-b border-stone-200 pb-4">
              <MapPin size={22} className="text-green-700" />
              Endereço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>
                  CEP <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.address.zip_code}
                  onChange={(e) =>
                    handleAddressChange("zip_code", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.address.number}
                  onChange={(e) =>
                    handleAddressChange("number", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Complemento</label>
                <input
                  className={inputClass}
                  value={formData.address.complement || ""}
                  onChange={(e) =>
                    handleAddressChange("complement", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-3">
                <label className={labelClass}>
                  Rua <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.address.street}
                  onChange={(e) =>
                    handleAddressChange("street", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Bairro <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.address.neighborhood}
                  onChange={(e) =>
                    handleAddressChange("neighborhood", e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Estado <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => navigate("/agricultor/dashboard")}
              className="flex-1 px-6 py-3 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded-lg transition-colors font-medium "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-700 text-white hover:bg-green-800 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
              <Save size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
