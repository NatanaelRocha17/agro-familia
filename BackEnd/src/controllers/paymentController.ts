import { Request, Response } from "express";
import paymentRepository from "../repositories/paymentRepository";


// Obtém os métodos de pagamento aceitos por um agricultor específico, retornando uma lista de métodos de pagamento para o ID do agricultor fornecido na URL, permitindo que os agricultores possam visualizar e gerenciar seus métodos de pagamento configurados
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

// Atualiza os métodos de pagamento aceitos por um agricultor específico, recebendo uma lista de IDs de métodos de pagamento no corpo da requisição e atualizando os vínculos entre o agricultor e os métodos de pagamento no banco de dados, retornando uma mensagem de sucesso ou erro dependendo do resultado da operação, permitindo que os agricultores possam manter seus métodos de pagamento atualizados na plataforma
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const farmerId = Number(req.params.farmerId);
    const { paymentMethodIds } = req.body;


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

// Deleta um método de pagamento específico por ID, retornando uma mensagem de sucesso ou erro dependendo do resultado da operação, e tratando erros específicos de integridade referencial para informar o usuário caso o método de pagamento esteja sendo utilizado em pedidos ou outras entidades relacionadas
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
