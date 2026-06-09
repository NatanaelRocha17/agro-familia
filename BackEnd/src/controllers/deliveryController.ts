import { Request, Response } from 'express';
import deliveryRepository from '../repositories/deliveryRepository';

// Obtém os tipos de entrega disponíveis no sistema, retornando uma lista de tipos de entrega para que o frontend possa exibir opções ao agricultor ao configurar seus métodos de entrega
export const getTypesDelivery = async (req: Request, res: Response) => {
  try {
    const types = await deliveryRepository.getDeliveryTypes();
    
    return res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error("Erro no getTypes:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao buscar tipos de entrega." 
    });
  }
};

// Cria um novo método de entrega para um agricultor específico, recebendo os dados do método de entrega no corpo da requisição e retornando o ID do método de entrega criado ou uma mensagem de erro em caso de falha, permitindo que os agricultores possam configurar suas opções de entrega para os clientes
export const createDelivery = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.id);
    const deliveryData = req.body;

    
    // O repositório agora retorna a quantidade de linhas inseridas (útil para logs ou front)
    const insertedRows = await deliveryRepository.createDeliveryMethod(farmer_id, deliveryData);
    
    return res.status(201).json({ 
      success: true,
      message: "Método de entrega criado com sucesso.",
      data: { insertedRows }
    });
  } catch (error) {
    console.error("Erro no create (Delivery):", error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno ao criar método de entrega." 
    });
  }
};


// Obtém os métodos de entrega associados a um agricultor específico, retornando uma lista de métodos de entrega para o ID do agricultor fornecido na URL, permitindo que os agricultores possam visualizar e gerenciar seus métodos de entrega configurados
export const getByFarmerIdDelivery = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.id);
    const deliveries = await deliveryRepository.getDeliveryMethodsByFarmerId(farmer_id);
    
    return res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    console.error("Erro no getByFarmerId (Delivery):", error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno ao buscar métodos de entrega do agricultor." 
    });
  }
};

// Deleta um método de entrega específico por ID, retornando uma mensagem de sucesso ou erro dependendo do resultado da operação, e tratando erros específicos de integridade referencial para informar o usuário caso o método de entrega esteja sendo utilizado em pedidos ou outras entidades relacionadas
export const removeDelivery = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const success = await deliveryRepository.deleteDeliveryMethod(id);
    
    if (!success) {
      return res.status(404).json({ 
        success: false,
        message: "Método de entrega não encontrado para deleção." 
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Método de entrega deletado com sucesso." 
    });
  } catch (error) {
    console.error("Erro no remove (Delivery):", error);
    return res.status(500).json({ 
      success: false,
      message: "Erro interno ao deletar método de entrega." 
    });
  }  
};

export default {   
  getTypesDelivery,
  createDelivery,
  getByFarmerIdDelivery, 
  removeDelivery
};
