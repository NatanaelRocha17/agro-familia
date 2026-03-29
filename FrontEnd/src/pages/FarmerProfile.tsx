import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Save } from 'lucide-react';
import { toast } from 'sonner';
import { putchFarmer, getFarmerMe } from '../services/farmer';
import type { Farmer, FarmerUpdate } from '../Models/Models';

export function FarmerProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState<FarmerUpdate | null>(null);
  const [formData, setFormData] = useState<FarmerUpdate>({
    id: '',
    first_name: '',
    last_name: '',
    display_name: '',
    cpf: '',
    phone: '',
    email: '',
    profession: '',
    description: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
    }
  });

  // Funções de formatação para CPF, telefone e CEP
  const formatCPF = (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .slice(0, 14);

  const formatPhone = (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);

  const formatZipCode = (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);

  // Função para buscar os dados do agricultor e formatá-los para exibição
  async function fetchFarmerData() {
    const data = await getFarmerMe();

    const formattedData: FarmerUpdate = {
      ...data,
      cpf: formatCPF(data.cpf || ""),
      phone: formatPhone(data.phone || ""),
      address: {
        ...data.address,
        zip_code: formatZipCode(data.address?.zip_code || "")
      }
    };

    setFormData(formattedData);
    setOriginalData(formattedData);
  }

  // useEffect para verificar autenticação e carregar os dados do agricultor ao montar o componente
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user.id) {
      navigate('/agricultor/login');
      return;
    }

    fetchFarmerData();
  }, [navigate]);

  const handleFieldChange = (field: keyof Farmer, value: string) => {
    let formattedValue = value;

    if (field === 'phone') formattedValue = formatPhone(value);

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Função para lidar com mudanças nos campos de endereço, aplicando formatação específica para o CEP
  const handleAddressChange = (
    field: keyof Farmer['address'],
    value: string
  ) => {
    let formattedValue = value;

    if (field === 'zip_code') {
      formattedValue = formatZipCode(value);
    }

    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: formattedValue
      }
    }));
  };

  // Função para comparar os dados originais com os atuais e extrair apenas os campos que foram alterados
  function getChangedFields(original: any, current: any): any {
    const changes: any = {};

    for (const key in current) {
      const currentValue = current[key];
      const originalValue = original?.[key];

      if (
        typeof currentValue === 'object' &&
        currentValue !== null &&
        !Array.isArray(currentValue)
      ) {
        const nestedChanges = getChangedFields(originalValue || {}, currentValue);

        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges;
        }
      } else if (currentValue !== originalValue) {
        changes[key] = currentValue;
      }
    }

    return changes;
  }

  // Função para lidar com o envio do formulário, que compara os dados atuais com os originais, extrai as mudanças e envia apenas os campos alterados para a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user.id) {
        toast.error('Invalid user');
        return;
      }

      if (!originalData) {
        toast.error('Error comparing data');
        return;
      }

      const cleanedData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        address: {
          ...formData.address,
          zip_code: formData.address.zip_code.replace(/\D/g, '')
        }
      };

      const cleanedOriginal = {
        ...originalData,
        cpf: originalData.cpf.replace(/\D/g, ''),
        phone: originalData.phone.replace(/\D/g, ''),
        address: {
          ...originalData.address,
          zip_code: originalData.address.zip_code.replace(/\D/g, '')
        }
      };

      const changes = getChangedFields(cleanedOriginal, cleanedData);

      if (Object.keys(changes).length === 0) {
        toast.info('Nenhuma alteração realizada. Clique em Cancelar para voltar.');
        return;
      }

      await putchFarmer(changes);

      toast.success('Perfil atualizado com sucesso!');
      navigate("/agricultor/dashboard");

    } catch (error) {
      console.error(error);
      toast.error('Error saving profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          <header className="mb-8">
            <Link to="/agricultor/dashboard" className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4">
              <ArrowLeft size={20} /> Voltar
            </Link>

            <h1 className="text-3xl font-bold text-white">
              Editar Perfil
            </h1>

            <p className="text-green-100">
              Atualize suas informações.
            </p>

          </header>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* DADOS PESSOAIS */}

            <section className="bg-white p-8 rounded-3xl shadow-2xl">

              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b pb-4">
                <User size={24} className="text-green-700" />
                Dados Pessoais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="label-estilizada">Nome</label>
                  <input
                    className="input-estilizado"
                    value={formData.first_name}
                    onChange={(e) => handleFieldChange("first_name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label-estilizada">Sobrenome</label>
                  <input
                    className="input-estilizado"
                    value={formData.last_name}
                    onChange={(e) => handleFieldChange("last_name", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-estilizada">
                    Nome de Apresentação
                  </label>

                  <input
                    className="input-estilizado"
                    value={formData.display_name}
                    onChange={(e) => handleFieldChange("display_name", e.target.value)}
                  />

                </div>

                <div>
                  <label className="label-estilizada">Telefone</label>

                  <input className="input-estilizado" value={formData.phone} onChange={(e) => handleFieldChange("phone", e.target.value)}
                  />

                </div>

                <div>
                  <label className="label-estilizada">Email</label>
                  <input className="input-estilizado" value={formData.email} onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                </div>
              </div>
            </section>


            {/* ATIVIDADE */}

            <section className="bg-white p-8 rounded-3xl shadow-2xl">
              <h2 className="text-xl font-bold text-stone-800 mb-6 border-b pb-4">
                Atividade Rural
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="label-estilizada">
                    Profissão
                  </label>
                  <input
                    className="input-estilizado"
                    value={formData.profession}
                    onChange={(e) => handleFieldChange("profession", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-estilizada">
                    Descrição
                  </label>
                  <textarea
                    rows={4}
                    className="input-estilizado"
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                  />
                </div>
              </div>
            </section>



            {/* ENDEREÇO */}

            <section className="bg-white p-8 rounded-3xl shadow-2xl">

              <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b pb-4">
                <MapPin size={24} className="text-green-700" />
                Endereço
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div>
                  <label className="label-estilizada max-w-md=9">CEP</label>
                  <input
                    className="input-estilizado"
                    value={formData.address.zip_code}
                    onChange={(e) => handleAddressChange("zip_code", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label-estilizada">Número</label>
                  <input
                    className="input-estilizado"
                    value={formData.address.number}
                    onChange={(e) => handleAddressChange("number", e.target.value)}
                  />
                </div>

                <div>
                  <label className="label-estilizada">Complemento</label>
                  <input
                    className="input-estilizado"
                    value={formData.address.complement || ''}
                    onChange={(e) => handleAddressChange("complement", e.target.value)}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="label-estilizada">Rua</label>

                  <input
                    className="input-estilizado"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
                  />

                </div>

                <div>
                  <label className="label-estilizada">Bairro</label>

                  <input
                    className="input-estilizado"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                  />

                </div>

                <div>
                  <label className="label-estilizada">Cidade</label>

                  <input
                    className="input-estilizado"
                    value={formData.address.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                  />

                </div>

                <div>

                  <label className="label-estilizada">
                    Estado
                  </label>

                  <input
                    className="input-estilizado"
                    value={formData.address.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                  />

                </div>

              </div>

            </section>
            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => navigate('/agricultor/dashboard')}
                className="w-full bg-gray-500 hover:bg-gray-400 text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-xl"
              >
                {isLoading ? "Salvando..." : "Salvar Alterações"}
                <Save size={22} />
              </button>

            </div>
          </form>
        </div>
        <style>{`

.input-estilizado{
width:100%;
padding:0.85rem 1rem;
background:#f3f4f6;
border:2px solid #e5e7eb;
border-radius:1rem;
outline:none;
font-weight:500;
transition:all .2s;
}

.input-estilizado:focus{
background:#fff;
border-color:#15803d;
box-shadow:0 0 0 5px rgba(21,128,61,0.25);
}

.label-estilizada{
display:block;
font-size:0.875rem;
font-weight:600;
color:#4b5563;
margin-bottom:.4rem;
}

`}</style>

      </div>

    </>
  )
}