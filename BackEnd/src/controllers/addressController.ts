import { Request, Response } from "express";
import addressRepository from "../repositories/addressRepository";
import pool from "../config/database";

// Controlador para gerenciar os endpoints relacionados aos endereços dos agricultores, incluindo criação, atualização, remoção e consulta de endereços associados a um agricultor específico

// Obtém os endereços de um agricultor específico, retornando uma lista de endereços associados ao ID do agricultor fornecido na URL
export const getByFarmerId = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.id);

    const addresses = await addressRepository.getAddressByFarmerId(farmer_id);

    return res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    console.error("Erro no getByFarmerId:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao buscar endereços." 
    });
  }
};


// Cria  um novo endereço para um agricultor específico, recebendo os dados do endereço no corpo da requisição e retornando o ID do endereço criado ou uma mensagem de erro em caso de falha
export const createAddress = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.id);
    const addressData = req.body;

    const insertId = await addressRepository.createAddress(farmer_id, addressData);

    return res.status(201).json({ 
      success: true, 
      message: "Endereço criado com sucesso.",
      data: { id: insertId }
    });
  } catch (err) {
    console.error("Erro no create:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao criar endereço." 
    });
  }
};

// Atualiza um endereço específico por ID, recebendo os dados atualizados no corpo da requisição e retornando uma mensagem de sucesso ou erro dependendo do resultado da operação
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.id);
    const addressData = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await addressRepository.updateAddress(farmer_id, addressData, connection);
      await connection.commit();
      
      return res.status(200).json({ 
        success: true, 
        message: "Endereço atualizado com sucesso." 
      });
    } catch (err) {
      await connection.rollback();
      throw err; // Joga o erro para o catch externo capturar e responder ao client
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Erro no update:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao atualizar endereço." 
    });
  }
};

// Deleta um endereço específico por ID, retornando uma mensagem de sucesso ou erro dependendo do resultado da operação, e tratando erros específicos de integridade referencial para informar o usuário caso o endereço esteja sendo utilizado em um método de entrega
export const removeAddress = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const success = await addressRepository.deleteAddress(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Endereço não encontrado para deletar.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Endereço removido com sucesso.",
    });

  } catch (err: any) {
    console.error("Erro no remove:", err);
    
    // Captura o erro específico do banco de dados (Constraint de chave estrangeira)
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        success: false,
        message: "Este endereço está sendo utilizado em um método de entrega. Exclua o método primeiro.",
      });
    }

    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao deletar endereço." 
    });
  }
};

export default {
  getByFarmerId,
  createAddress,
  updateAddress,
  removeAddress,
};

