import { Request, Response } from 'express';
import deliveryRepository from '../repositories/deliveryRepository';

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

export const createDelivery = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.id);
    const deliveryData = req.body;

    console.log("Dados recebidos para criação de método de entrega:", deliveryData);
    
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
