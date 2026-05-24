import { useEffect, useState } from "react";
import { Plus, Truck, Trash2, Save, X, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  createDeliveryMethod,
  deleteAndress,
  deleteDeliveryMethod,
  getAndress,
  getDeliveryMethods,
  listDeliveryMethodsByFarmer,
  postAndress,
} from "../services/delivery";
import { Loading } from "./Loading";
import type { Address, Farmer } from "../Models/Models";
import { buscarCep } from "../services/locationService";

export interface TypeDelivery {
  id: number;
  name: string;
  description?: string;
  created_at: string | Date;
  status: number;
  type: string;
}

interface FarmerDelivery {
  id: number;
  option_name: string;
  type_id: number;
  type_name: string;
  estimated_time: number;
  cost: number;
  notes: string;
  status: number;
  address_ids: any[];
  addresses: Address[]; // Pode ser um array de IDs ou um array de objetos Address, dependendo de como os dados são retornados da API
}

export function DeliverySettings() {
  const [types, setTypes] = useState<TypeDelivery[]>([]);
  const [methods, setMethods] = useState<FarmerDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FarmerDelivery | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [listAndresses, setListAddresses] = useState<Address[]>([]); // Substitua 'any' pelo tipo correto de endereço

  const [form, setForm] = useState({
    option_name: "",
    type_id: "",
    estimated_time: 1,
    cost: "0",
    notes: "",
    address_ids: [] as number[],
  });

  console.log(form);

  const [addressForm, setaddressForm] = useState({
    id: "",
    address_type: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: 0,
    longitude: 0,
    is_primary: false,
  });
  console.log(addressForm);

  const resetAddressForm = () => {
  setaddressForm({
    id: "",
    address_type: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: 0,
    longitude: 0,
    is_primary: false,
  });
};

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const id = JSON.parse(localStorage.getItem("user") || "{}").id;

    try {
      // 1. Carrega os tipos de entrega
      const typesResponse = (await getDeliveryMethods()) as any;
      if (typesResponse?.data) {
        setTypes(typesResponse.data);
      }

      // 2. Carrega os endereços
      const addressResponse = (await getAndress(id)) as any;
      if (addressResponse?.data) {
        setListAddresses(addressResponse.data);
      }
      console.log("Endereços carregados:", addressResponse?.data);

      // 3. Carrega os métodos já configurados
      const methodsResponse = (await listDeliveryMethodsByFarmer(id)) as any;
      if (methodsResponse?.data) {
        setMethods(methodsResponse.data);
      }
      console.log("Métodos de entrega carregados:", methodsResponse?.data);
      
    } catch {
      toast.error("Erro ao carregar entregas.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      option_name: "",
      type_id: "",
      estimated_time: 1,
      cost: "0",
      notes: "",
      address_ids: [],
    });

    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleSave = async () => {
  try {
    const requiresAddress = ["1", "3", "4"].includes(form.type_id);

    if (requiresAddress && form.address_ids.length === 0) {
      toast.error(
        "Selecione pelo menos um endereço de retirada."
      );

      return;
    }

    if (form.option_name.length === 0) {
      toast.error(
        "O nome da opção de entrega é obrigatório."
      );

      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const payload = {
      option_name: form.option_name,
      type_id: form.type_id,
      estimated_time: form.estimated_time,
      cost: Number(form.cost),
      notes: form.notes,
      address_ids: form.address_ids,
    };

    console.log("Payload enviado para a API:", payload);

    const res = await createDeliveryMethod(user.id, payload);

    toast.success(res.message);

    setOpen(false);

    loadData();

  } catch {
    toast.error("Erro ao salvar.");
  }
};

  const formatZipCode = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);

  const habdleOnChangeAddress = async (
    field: keyof Farmer["address"],
    value: string,
  ) => {
    let formattedValue = value;

    if (field === "zip_code") {
      formattedValue = formatZipCode(value);

      const cleanCep = formattedValue.replace(/\D/g, "");

      if (cleanCep.length === 8) {
        try {
          const dadosCep = await buscarCep(cleanCep);

          setaddressForm((prev) => ({
            ...prev,
            zip_code: formattedValue,
            street: dadosCep.logradouro || "",
            neighborhood: dadosCep.bairro || "",
            city: dadosCep.localidade || "",
            state: dadosCep.uf || "",
          }));

          return;
        } catch {
          toast.error("CEP não encontrado");
        }
      }
    }

    setaddressForm((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  if (loading) {
    return <Loading />;
  }

 const handleSaveAddress = async () => {
  try {
    const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

    const payload = {
      address_type: "pickup_point",
      street: addressForm.street,
      number: addressForm.number,
      neighborhood: addressForm.neighborhood,
      complement: addressForm.complement,
      city: addressForm.city,
      state: addressForm.state,
      zip_code: addressForm.zip_code.replace(/\D/g, ""),
    };

    await postAndress(userId, payload);

    await loadData();

    resetAddressForm();


    toast.success("Endereço adicionado com sucesso.");

    setShowAddressForm(false);

  } catch {
    toast.error("Erro ao adicionar endereço.");
  }
};

  const toggleAddressSelection = (id: number) => {
    setForm((prev) => {
      const alreadySelected = prev.address_ids.includes(id);
      const newAddressIds = alreadySelected
        ? prev.address_ids.filter((addrId) => addrId !== id)
        : [...prev.address_ids, id];

      return { ...prev, address_ids: newAddressIds };
    });
  };

const deleteAddress = async (id: number) => {
  console.log("ID do endereço a ser deletado:", id);

  try {
    const res = await deleteAndress(id);

    setListAddresses((prev) =>
      prev.filter((addr) => addr.id !== id)
    );

    setForm((prev) => ({
      ...prev,
      address_ids: prev.address_ids.filter(
        (addrId) => addrId !== id
      ),
    }));

    toast.success(res.message);

  } catch (error: any) {
    console.error("Erro ao deletar endereço:", error);

    toast.error(
      error?.response?.data?.message ||
      "Erro ao remover endereço."
    );
  }
};

  const deleteMethod = async (id: number) => {
    try {
      const res = await deleteDeliveryMethod(id);
      setMethods((prev) => prev.filter((method) => method.id !== id));
      toast.success(res.message);
    } catch {
      toast.error("Erro ao remover método de entrega.");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Métodos de Entrega
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              Gerencie as opções disponíveis aos clientes
            </p>
          </div>

          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            Novo Método
          </button>
        </div>

        <div className="space-y-3">
          {methods.map((item) => (
            <div
              key={item.id}
              className="border border-stone-200 rounded-lg p-4 hover:border-stone-300 transition-colors"
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-stone-500 mb-1">
                      NOME DA OPÇÃO
                    </p>
                    <h3 className="font-bold text-lg text-stone-900">
                      {item.option_name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-stone-500 mb-1.5">
                        TIPO
                      </p>
                      <div className="flex items-center gap-2 font-medium text-stone-800">
                        <Truck size={16} className="text-green-700" />
                        <span className="text-sm">{item.type_name}</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-stone-500 mb-1.5">
                        PRAZO
                      </p>
                      <div className="flex items-center gap-2 font-medium text-stone-800">
                        <Clock size={16} className="text-green-700" />
                        <span className="text-sm">
                          {item.estimated_time} dia
                        </span>
                      </div>
                    </div>

                    <div className="bg-stone-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-stone-500 mb-1.5">
                        TAXA DE ENTREGA
                      </p>
                      <div className="flex items-center gap-2 font-medium text-stone-800">
                        {Number(item.cost) === 0 ? (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            Grátis
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 font-medium text-stone-800">
                            <DollarSign size={16} className="text-green-700" />
                            <span className="text-xs font-bold text-stone-700">
                              R${" "}
                              {Number(item.cost).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 mb-1.5">
                        OBSERVAÇÕES
                      </p>
                      <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-700">
                        {item.notes}
                      </div>
                    </div>
                  )}

                  {item.addresses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-stone-500 mb-1.5">
                        ENDEREÇOS DE RETIRADA
                      </p>
                      <div className="space-y-2">
                        {item.addresses.map((address: any) => {
                          return (
                            <div
                              key={address.id}
                              className="bg-green-50 rounded-lg p-3 text-sm"
                            >
                              <p className="font-medium text-stone-900">
                                {address.street}, {address.number}
                              </p>
                              <p className="text-stone-600 text-xs mt-0.5">
                                {address.neighborhood &&
                                  `${address.neighborhood} - `}
                                {address.city}/{address.state} - CEP:{" "}
                                {address.zip_code}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 self-start">
                  <button
                    onClick={() => deleteMethod(item.id)}
                    className="ml-auto flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium shrink-0"
                    title="Excluir produto"
                  >
                    <Trash2 size={18} />
                    <span className="hidden sm:inline">Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {methods.length === 0 && (
            <div className="text-center py-12 text-stone-500 border-2 border-dashed border-stone-200 rounded-lg">
              <p className="font-medium">Nenhum método cadastrado</p>
              <p className="text-sm mt-1">
                Clique em "Novo Método" para começar
              </p>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-stone-200 shadow-xl">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-stone-900">
                  {editing
                    ? "Editar Método de Entrega"
                    : "Novo Método de Entrega"}
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">
                  Nome da Opção *
                </label>
                <input
                  type="text"
                  value={form.option_name}
                  onChange={(e) =>
                    setForm({ ...form, option_name: e.target.value })
                  }
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Ex: Entrega Expressa"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">
                  Tipo de Entrega *
                </label>
                <select
                  value={form.type_id}
                  onChange={(e) =>
                    setForm({ ...form, type_id: e.target.value })
                  }
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                >
                  <option value="">Selecione um tipo</option>
                  {types.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.description}
                    </option>
                  ))}
                </select>
              </div>

              {(form.type_id == "1" ||
                form.type_id == "3" ||
                form.type_id == "4") && (
                <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                  <h4 className="font-semibold text-stone-900 mb-3">
                    Endereços de Retirada *
                  </h4>

                  {listAndresses.length > 0 && (
                    <div className="space-y-2 mb-4">
     
                      {listAndresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            form.address_ids.includes(addr.id)
                              ? "bg-green-100 border-2 border-green-600"
                              : "bg-white border-2 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                   
                          <input
                            type="checkbox"
                            checked={form.address_ids.includes(addr.id)}
                            onChange={() => toggleAddressSelection(addr.id)}
                            className="w-5 h-5 text-green-600 border-stone-300 rounded focus:ring-2 focus:ring-green-600 cursor-pointer mt-0.5"
                          />

                          <div className="flex items-start gap-3 flex-1 w-full">
                            <div className="flex-1">
                              <p className="font-medium text-stone-900">
                                {addr.street}, {addr.number}
                              </p>

                              <p className="text-sm text-stone-600 mt-0.5">
                                {addr.neighborhood && `${addr.neighborhood} - `}
                                {addr.city}/{addr.state} - CEP: {addr.zip_code}
                              </p>
                            </div>
                            {addr.is_primary ? (
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full self-start">
                                Principal
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  deleteAddress(addr.id);
                                  console.log("Endereço excluído:", addr.id);
                                }}
                                className="ml-auto flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors font-medium shrink-0"
                                title="Excluir produto"
                              >
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">
                                  Excluir
                                </span>
                              </button>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {listAndresses.length === 0 && !showAddressForm && (
                    <p className="text-sm text-stone-600 mb-3">
                      Nenhum endereço cadastrado
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    {showAddressForm
                      ? "− Fechar formulário"
                      : "+ Adicionar novo endereço"}
                  </button>

                  {showAddressForm && (
                    <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CEP */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            CEP <span className="text-red-500">*</span>
                          </label>

                          <input
                            type="text"
                            placeholder="00000-000"
                            value={addressForm.zip_code}
                            onChange={(e) =>
                              habdleOnChangeAddress("zip_code", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 text-sm bg-white transition-all
          ${
            !addressForm.zip_code
              ? "border-red-300 focus:ring-red-500"
              : "border-stone-300 focus:ring-green-600"
          }
          focus:outline-none focus:ring-2`}
                          />

                          {!addressForm.zip_code && (
                            <p className="text-red-500 text-xs mt-1">
                              CEP obrigatório
                            </p>
                          )}
                        </div>

                        {/* RUA */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Rua <span className="text-red-500">*</span>
                          </label>

                          <input
                            type="text"
                            placeholder="Digite a rua"
                            value={addressForm.street}
                            onChange={(e) =>
                              habdleOnChangeAddress("street", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 text-sm bg-white transition-all
                                                                ${
                                                                  !addressForm.street
                                                                    ? "border-red-300 focus:ring-red-500"
                                                                    : "border-stone-300 focus:ring-green-600"
                                                                }
                                                            focus:outline-none focus:ring-2`}
                          />

                          {!addressForm.street && (
                            <p className="text-red-500 text-xs mt-1">
                              Rua obrigatória
                            </p>
                          )}
                        </div>

                        {/* NÚMERO */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Número <span className="text-red-500">*</span>
                          </label>

                          <input
                            type="text"
                            placeholder="Digite o número"
                            value={addressForm.number}
                            onChange={(e) =>
                              habdleOnChangeAddress("number", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 text-sm bg-white transition-all
          ${
            !addressForm.number
              ? "border-red-300 focus:ring-red-500"
              : "border-stone-300 focus:ring-green-600"
          }
          focus:outline-none focus:ring-2`}
                          />

                          {!addressForm.number && (
                            <p className="text-red-500 text-xs mt-1">
                              Número obrigatório
                            </p>
                          )}
                        </div>

                        {/* BAIRRO */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Bairro
                          </label>

                          <input
                            type="text"
                            placeholder="Digite o bairro"
                            value={addressForm.neighborhood}
                            onChange={(e) =>
                              habdleOnChangeAddress(
                                "neighborhood",
                                e.target.value,
                              )
                            }
                            className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                          />
                        </div>

                        {/* CIDADE */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Cidade <span className="text-red-500">*</span>
                          </label>

                          <input
                            type="text"
                            placeholder="Digite a cidade"
                            value={addressForm.city}
                            onChange={(e) =>
                              habdleOnChangeAddress("city", e.target.value)
                            }
                            className={`w-full border rounded-lg px-4 py-3 text-sm bg-white transition-all
          ${
            !addressForm.city
              ? "border-red-300 focus:ring-red-500"
              : "border-stone-300 focus:ring-green-600"
          }
          focus:outline-none focus:ring-2`}
                          />

                          {!addressForm.city && (
                            <p className="text-red-500 text-xs mt-1">
                              Cidade obrigatória
                            </p>
                          )}
                        </div>

                        {/* ESTADO */}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Estado
                          </label>

                          <input
                            type="text"
                            placeholder="Digite o estado"
                            value={addressForm.state}
                            onChange={(e) =>
                              habdleOnChangeAddress("state", e.target.value)
                            }
                            className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        disabled={
                          !addressForm.street ||
                          !addressForm.number ||
                          !addressForm.city ||
                          !addressForm.zip_code
                        }
                        className="w-full bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-colors font-medium text-sm disabled:bg-stone-300 disabled:cursor-not-allowed"
                      >
                        Salvar Endereço
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-stone-700 block mb-2">
                    Prazo Estimado (dias) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.estimated_time}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        estimated_time: Number(e.target.value),
                      })
                    }
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-stone-700 block mb-2">
                    Valor (R$) *
                  </label>
                 
 
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                                   <p className="text-yellow-500 text-xs mt-1">
Deixe 0 para definir como grátis                            
</p>

                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-stone-700 block mb-2">
                  Observações
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  placeholder="Informações adicionais sobre este método..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-stone-200 p-6">
              <button
                onClick={handleSave}
                className="w-full py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Save size={18} />
                {editing ? "Salvar Alterações" : "Criar Método"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
