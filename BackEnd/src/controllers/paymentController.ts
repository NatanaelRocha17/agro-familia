import { Request, Response } from "express";
import paymentRepository from "../repositories/paymentRepository";

export const getByFarmerIdPayment = async (req: Request, res: Response) => {
  try {
    const farmerId = Number(req.params.farmerId);
    
    // Usando os nomes atualizados do repositório
    const paymentMethodsFarmer = await paymentRepository.getByFarmerId(farmerId);
    const allPaymentMethods = await paymentRepository.getAllMethods();

    // Lógica excelente para o frontend saber o que marcar no Checkbox
    const result = allPaymentMethods.map(method => {
      const accepted = paymentMethodsFarmer.some((pm: any) => pm.id === method.id);
      return { ...method, accepted };
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Erro no getByFarmerId (Payment):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao buscar métodos de pagamento do agricultor." 
    });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const farmerId = Number(req.params.farmerId);
    const { paymentMethodIds } = req.body;

    console.log("Atualizando métodos de pagamento:", { farmerId, paymentMethodIds });

    const currentPaymentMethods = await paymentRepository.getByFarmerId(farmerId);
    const currentPaymentMethodIds = currentPaymentMethods.map((pm: any) => pm.id);   

    // Compara o que existe com o que chegou do front
    const paymentMethodIdsToAdd = paymentMethodIds.filter((id: number) => !currentPaymentMethodIds.includes(id));
    const paymentMethodIdsToRemove = currentPaymentMethodIds.filter((id: number) => !paymentMethodIds.includes(id));

    // Adiciona os novos
    for (const paymentMethodId of paymentMethodIdsToAdd) {
      await paymentRepository.addMethodToFarmer(farmerId, paymentMethodId);
    }

    // Remove os desmarcados
    for (const paymentMethodId of paymentMethodIdsToRemove) {
      await paymentRepository.removeMethodFromFarmer(farmerId, paymentMethodId);
    }

    return res.status(200).json({ 
      success: true,
      message: "Métodos de pagamento atualizados com sucesso." 
    });
  } catch (error) {
    console.error("Erro no update (Payment):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao atualizar métodos de pagamento." 
    });
  }
};

export const removePayment = async (req: Request, res: Response) => {
  try {
    const farmerId = Number(req.params.farmerId);
    // Corrigido para singular, já que a deleção unitária espera um ID só
    const paymentMethodId = Number(req.params.paymentMethodId); 

    const success = await paymentRepository.removeMethodFromFarmer(farmerId, paymentMethodId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Vínculo de método de pagamento não encontrado para remoção."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Método de pagamento removido com sucesso."
    });
  } catch (error) {
    console.error("Erro no remove (Payment):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao remover método de pagamento." 
    });
  }
};

export default {
  getByFarmerIdPayment,
  updatePayment,
  removePayment
};
