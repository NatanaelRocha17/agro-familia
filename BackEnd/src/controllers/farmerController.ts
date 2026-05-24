import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import farmerRepository from '../repositories/farmerRepository';
import addressRepository from '../repositories/addressRepository';
import pool from '../config/database';

export const getAllFarmers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);

    const { data, total } = await farmerRepository.getAllFarmers(page, limit);

    // Remove password_hash antes de enviar ao front
    const sanitized = data.map(({ password_hash, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      data: {
        items: sanitized,
        page,
        limit,
        total,
      }
    });
  } catch (err) {
    console.error("Erro no getAll (Farmer):", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao buscar agricultores.' 
    });
  }
};

export const getMeFarmer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const farmer = await farmerRepository.getFarmerById(userId);

    if (!farmer) {
      return res.status(404).json({ 
        success: false, 
        message: "Agricultor não encontrado." 
      });
    }

    const { password_hash, ...rest } = farmer;

    return res.status(200).json({
      success: true,
      data: rest
    });
  } catch (err) {
    console.error("Erro no getMe (Farmer):", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao buscar dados do agricultor.' 
    });
  }
};

export const createFarmer = async (req: Request, res: Response) => {
  try {
    const { password, confirm_password, address, ...rest } = req.body;

    // Fail-fast: Valida antes de abrir conexão com o banco
    if (password !== confirm_password) {
      return res.status(400).json({ 
        success: false, 
        message: "As senhas não conferem." 
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const farmerId = await farmerRepository.createFarmer(
        { ...rest, password_hash },
        connection
      );

      if (address) {
        await addressRepository.createAddress(
          Number(farmerId),
          address,
          connection
        );
      }

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: "Agricultor cadastrado com sucesso.",
        data: { id: farmerId }
      });

    } catch (error) {
      await connection.rollback();
      throw error; // Joga o erro para o catch externo capturar e devolver o 500
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erro no create (Farmer):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao cadastrar agricultor." 
    });
  }
};

export const updateFarmer = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { address, ...rest } = req.body;

    const connection = await pool.getConnection(); 

    try {
      await connection.beginTransaction();

      // Limpa dados undefined/null
      const cleanData = Object.fromEntries(
        Object.entries(rest).filter(([_, v]) => v !== undefined && v !== null)
      );

      // Atualiza Farmer
      if (Object.keys(cleanData).length > 0) {
        await farmerRepository.updateFarmer(userId, cleanData, connection);
      }

      // Atualiza Address
      if (address && Object.keys(address).length > 0) {
        await addressRepository.updateAddress(userId, address, connection);
      }

      await connection.commit();

      return res.status(200).json({
        success: true,
        message: "Cadastro atualizado com sucesso."
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erro no update (Farmer):", error);
    return res.status(500).json({ 
      success: false, 
      message: "Erro interno ao atualizar cadastro." 
    });
  }
};

export const removeFarmer = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const success = await farmerRepository.deleteFarmer(id);

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: "Agricultor não encontrado para deleção." 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Agricultor excluído com sucesso."
    });
  } catch (error: any) {
    console.error("Erro no remove (Farmer):", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao excluir agricultor."
    });
  }
};

export default {
  getAllFarmers,
  getMeFarmer,
  createFarmer,
  updateFarmer,
  removeFarmer
};

