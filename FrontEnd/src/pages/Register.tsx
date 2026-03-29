import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, User, Envelope, Phone, Lock,
    Briefcase, IdentificationCard,
    Eye, EyeSlash, MapPin, Gps, 
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { buscarCep, buscarLatLngPorEndereco } from '../services/locationService';
import { postFarmer } from '../services/farmer';
import type { Farmer } from '../Models/Models';


export function FarmerRegister() {
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [farmerData, setFarmerData] = useState<Farmer>({
        id: '',
        first_name: '',
        last_name: '',
        display_name: '',
        cpf: '',
        phone: '',
        email: '',
        profession: '',
        description: '',
        password: '',
        confirm_password: '',
        gender: '',
        address: {
            address_type: 'residential',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zip_code: '',
            latitude: 0,
            longitude: 0,
            is_primary: true

        }

    });

    const navigate = useNavigate();

    // Funções de formatação
    const formatCPF = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);
    const formatPhone = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
    const formatZipCode = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);


    console.log('Dados atuais do formulário:', farmerData); // Log para verificar os dados do formulário em tempo real

    const handleSubmit = async (e: React.FormEvent) => {
        setIsSubmitting(true);
        e.preventDefault();
        if (farmerData.password !== farmerData.confirm_password) {
            return toast.error('As senhas não coincidem');
        }

        if (farmerData.password.length < 8) {
            return toast.error('A senha deve ter pelo menos 8 caracteres');
        }


        let updatedAddress = { ...farmerData.address };

        if (updatedAddress.latitude === 0 || updatedAddress.longitude === 0) {
            const { lat, lng } = await buscarLatLngPorEndereco(updatedAddress);

            updatedAddress = {
                ...updatedAddress,
                latitude: lat,
                longitude: lng
            };
        }

        // Criamos uma cópia para enviar ao back-end com os dados limpos
        const dataToSend = {
            ...farmerData,
            cpf: farmerData.cpf.replace(/\D/g, ''),
            phone: farmerData.phone.replace(/\D/g, ''),
            address: {
                ...updatedAddress,
                zip_code: farmerData.address.zip_code.replace(/\D/g, '')
            }
        };

        try {
            await postFarmer(dataToSend);
            toast.success('Cadastro concluído com sucesso!');
            navigate('/agricultor/login');

        } catch (error) {
            toast.error('Erro ao realizar cadastro. Tente novamente.');
        }
    };



    // Função para mudar campos de dentro do endereço   
    const handleAddressChange = async (campo: keyof Farmer['address'], valor: string) => {
        let valorFormatado = valor;

        if (campo === 'zip_code') {
            valorFormatado = formatZipCode(valor);
        }

        // Atualiza sempre o campo digitado
        setFarmerData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [campo]: valorFormatado
            }
        }));

        if (campo === 'zip_code') {
            valorFormatado = formatZipCode(valor);
        }

        // Atualiza sempre o campo digitado
        setFarmerData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [campo]: valorFormatado
            }
        }));

        // Busca CEP apenas quando completo
        if (campo === 'zip_code' && valor.replace(/\D/g, '').length === 8) {
            try {
                const dadosCep = await buscarCep(valorFormatado);
                console.log('Dados do CEP:', dadosCep); // Verifique os dados retornados
                setFarmerData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        zip_code: valorFormatado,
                        street: dadosCep.logradouro,
                        neighborhood: dadosCep.bairro,
                        city: dadosCep.localidade,
                        state: dadosCep.uf
                    }
                }));

            } catch {
                toast.error("CEP não encontrado");
            }
        }
    };

    const aoMudarCampo = (campo: keyof Farmer, valor: string) => {
        let valorFormatado = valor;
        if (campo === 'cpf') valorFormatado = formatCPF(valor);
        if (campo === 'phone') valorFormatado = formatPhone(valor);
        setFarmerData(prev => ({ ...prev, [campo]: valorFormatado }));
    };


    const capturarLocalizacao = () => {
        if (!navigator.geolocation) return toast.error('Seu navegador não suporta GPS');
        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFarmerData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    },
                }));
                toast.success('Localização capturada do seu local com precisão!');
                setIsGettingLocation(false);
            },
            () => {
                toast.error('Erro ao obter GPS. Preencha o endereço somente.');
                setIsGettingLocation(false);
            }
        );
    };




    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">

                <header className="mb-8">
                    <Link to="/agricultor/login" className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 transition-all">
                        <ArrowLeft size={20} /> Voltar ao Login
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Cadastro de Agricultor</h1>
                    <p className="text-green-100">Preencha todos os dados para começar a vender na AgroFamília.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* SEÇÃO 1: DADOS PESSOAIS */}
                    <section className="bg-white p-8 rounded-3xl shadow-2xl">
                        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b pb-4">
                            <User size={24} className="text-green-700" /> Dados Pessoais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label-estilizada">Nome *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.first_name} onChange={e => aoMudarCampo('first_name', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-estilizada">Sobrenome *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.last_name} onChange={e => aoMudarCampo('last_name', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-estilizada">Nome de Exibição (Nome como você é conhecido) *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.display_name} onChange={e => aoMudarCampo('display_name', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-estilizada">CPF *</label>
                                <div className="relative">
                                    <IdentificationCard className="absolute left-3 top-3.5 text-stone-400" size={20} />
                                    <input type="text" required className="input-estilizado pl-10" value={farmerData.cpf} onChange={e => aoMudarCampo('cpf', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="label-estilizada">Telefone *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 text-stone-400" size={20} />
                                    <input type="text" required className="input-estilizado pl-10" value={farmerData.phone} onChange={e => aoMudarCampo('phone', e.target.value)} />
                                </div>
                            </div>
                            <div className="md:col-span-1">
                                <label className="label-estilizada">E-mail *</label>
                                <div className="relative">
                                    <Envelope className="absolute left-3 top-3.5 text-stone-400" size={20} />
                                    <input type="email" required className="input-estilizado pl-10" value={farmerData.email} onChange={e => aoMudarCampo('email', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="label-estilizada">Sexo *</label>
                                <div className="relative">

                                    <select className="input-estilizado pl-10 appearance-none bg-stone-50" value={farmerData.gender} onChange={e => aoMudarCampo('gender', e.target.value)}>
                                        <option value="">Selecione</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Feminino</option>
                                        <option value="O">Outro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 2: ATIVIDADE PROFISSIONAL */}
                    <section className="bg-white p-8 rounded-3xl shadow-2xl">
                        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b pb-4">
                            <Briefcase size={24} className="text-green-700" /> Atividade Rural
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="label-estilizada">Profissão / Especialidade *</label>
                                <div className="relative">
                                    <input type="text" required className="input-estilizado pl-10" placeholder="Ex: Produtor de Hortaliças Orgânicas" value={farmerData.profession} onChange={e => aoMudarCampo('profession', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="label-estilizada">Descrição da Atividade *</label>
                                <div className="relative">
                                    <textarea rows={4} required className="input-estilizado pl-10 resize-none" placeholder="Conte sobre seus produtos e sua propriedade... Iremos exibir para passar mais segurança para o seu cliente" value={farmerData.description} onChange={e => aoMudarCampo('description', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SEÇÃO 3: ENDEREÇO E LOCALIZAÇÃO */}
                    <section className="bg-white p-8 rounded-3xl shadow-2xl">
                        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b pb-4">
                            <MapPin size={24} className="text-green-700" /> Localização da Propriedade
                        </h2>
                        <p className='pb-4'>O endereço onde você produz seus produtos. Ele será utilizado como ponto central para calcular a distância dos seus produtos e os clientes.</p>



                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="label-estilizada">CEP *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.address.zip_code} onChange={e => handleAddressChange('zip_code', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-estilizada">Número *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.address.number} onChange={e => handleAddressChange('number', e.target.value)} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="label-estilizada">Complemento</label>
                                <input type="text" className="input-estilizado" placeholder="Opcional" value={farmerData.address.complement} onChange={e => handleAddressChange('complement', e.target.value)} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="label-estilizada">Rua / Endereço *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.address.street} onChange={e => handleAddressChange('street', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-estilizada">Bairro *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-estilizada">Cidade *</label>
                                <input type="text" required className="input-estilizado" value={farmerData.address.city} onChange={e => handleAddressChange('city', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-estilizada">Estado (UF) *</label>

                                <select
                                    required
                                    className="input-estilizado"
                                    value={farmerData.address.state}
                                    onChange={e => handleAddressChange('state', e.target.value)}>
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

                        {/* Seletor de Método */}

                        <div className=" items-center gap-4 mt-6 mb-4">
                            <span className="text-sm text-stone-500">Capture sua localização atual para garantir mais precisão no seu endereço.</span>
                            <button type="button" onClick={capturarLocalizacao} disabled={isGettingLocation} className="mb-8 w-full py-4 bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-all">
                                <Gps size={24} className={isGettingLocation ? 'animate-spin' : ''} />
                                {isGettingLocation ? 'Capturando...' : 'Capturar Localização Atual'}
                            </button>
                        </div>



                    </section>

                    {/* SEÇÃO 4: ACESSO E SEGURANÇA */}
                    <section className="bg-white p-8 rounded-3xl shadow-2xl">
                        <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2 border-b pb-4">
                            <Lock size={24} className="text-green-700" /> Dados de Acesso
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <p className="text-sm text-stone-500 mb-4 italic">As senhas devem ter no mínimo 6 caracteres.</p>
                            </div>
                            <div>
                                <label className="label-estilizada">Senha *</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} required className="input-estilizado" value={farmerData.password} onChange={e => aoMudarCampo('password', e.target.value)} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-stone-400">
                                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="label-estilizada">Confirmar Senha *</label>
                                <input type={showPassword ? "text" : "password"} required className="input-estilizado" value={farmerData.confirm_password} onChange={e => aoMudarCampo('confirm_password', e.target.value)} />
                            </div>
                        </div>
                    </section>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-xl active:scale-95 shadow-green-900/40">
                        {isSubmitting ? <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : 'Finalizar Meu Cadastro'}
                    </button>

                </form>
            </div>

            <style>{`
        .input-estilizado {
          width: 100%;
          padding: 0.85rem 1rem;
          background-color: #f3f4f6; /* CINZA PADRÃO */
          border: 2px solid #e5e7eb;
          border-radius: 1rem;
          outline: none;
          color: #1f2937;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
        }

        /* DESTAQUE FORTE NO FOCO */
        .input-estilizado:focus {
          background-color: #ffffff;
          border-color: #15803d; /* VERDE FORTE */
          box-shadow: 0 0 0 5px rgba(21, 128, 61, 0.25);
          transform: translateY(-1px);
        }

        .label-estilizada {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.4rem;
        }
      `}</style>
        </div>
    );
}