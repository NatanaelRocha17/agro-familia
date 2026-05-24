import api from "./api";

export interface TypeDelivery {
  id: number;
    name: string;
    description?: string;
    created_at: string | Date;
    status: number;
    type: string;
}


export const getDeliveryMethods = async (): Promise<TypeDelivery[]> => {
    const response = await api.get('/delivery');
    return response.data;
}

export const getAndress = async (farmerId: number) => {
    const response = await api.get(`/enderecos/${farmerId}`);
    return response.data;
}

export const postAndress = async (farmerId: number, deliveryData: any) => {
    console.log("Dados do endereço enviados para a API:", deliveryData);
    const response = await api.post(`enderecos/create/${farmerId}`, deliveryData);
    return response.data;
}

export const deleteAndress = async (addressId: number) => {
    const response = await api.delete(`/enderecos/delete/${addressId}`);
    return response.data;
}


export const createDeliveryMethod = async (farmerId: number, deliveryData: any) => {
    const response = await api.post(`/delivery/farmer/${farmerId}`, deliveryData);
    return response.data;
}

export const listDeliveryMethodsByFarmer = async (farmerId: number) => {
    const response = await api.get(`/delivery/farmer/${farmerId}`);
    return response.data;
}

export const deleteDeliveryMethod = async (id: number) => {
    console.log("ID do método de entrega a ser deletado:", id);
    const response = await api.delete(`/delivery/method/${id}`);
    return response.data;
}