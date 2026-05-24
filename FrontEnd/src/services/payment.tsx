import api from "./api";

// Função para adicionar um método de pagamento para um agricultor

// Função para atualizar um método de pagamento para um agricultor
export const putPaymentMethod = async (farmerId: number, paymentData: any): Promise<any> => {
    console.log('Enviando dados para atualização de métodos de pagamento:', paymentData);
    const response = await api.put(`/farmers/${farmerId}/payment-methods`, { paymentMethodIds: paymentData.paymentMethodIds });
    return response.data;
}



// Função para obter os métodos de pagamento de um agricultor
export const getPaymentMethodsFarmer = async (farmerId: number): Promise<any[]> => {
    const response = await api.get(`/farmers/${farmerId}/methods`);
    return response.data;
}