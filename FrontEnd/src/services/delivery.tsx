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

export const getAddress = async (farmerId: number) => {
    const response = await api.get(`/address/${farmerId}`);
    return response.data;
}

export const postAddress = async (farmerId: number, deliveryData: any) => {
    const response = await api.post(`/address/create/${farmerId}`, deliveryData);
    return response.data;
}

export const deleteAddress = async (addressId: number) => {
    const response = await api.delete(`/address/delete/${addressId}`);
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
    const response = await api.delete(`/delivery/method/${id}`);
    return response.data;
}