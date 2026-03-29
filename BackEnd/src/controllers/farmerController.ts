import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import farmerRepository from '../repositories/farmerRepository';
import addressRepository from '../repositories/AddressRepository';
import pool from '../config/database';


export const listFarmers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);

    const { data, total } = await farmerRepository.getAllFarmers(page, limit);

    // remove password_hash
    const sanitized = data.map(({ password_hash, ...rest }) => rest);

    return res.json({
      data: sanitized, 
      page,
      limit,
      total,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar Agricultores' });
  }
};


export const getFarmerMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const farmer = await farmerRepository.getFarmerMe(userId);

    if (!farmer) {
      return res.status(404).json({ message: "Agricultor não encontrado" });
    }

    const { password_hash, ...rest } = farmer;

    return res.json(rest);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar Agricultor' });
  }
};

//devido à complexidade do registro (inserção em duas tabelas(Farmer e Address), 
// a função de criação do agricultor é feita diretamente no controller, utilizando transações para garantir a integridade dos dados
export const registerFarmer = async (req: Request, res: Response) => {

const data = req.body
  const connection = await pool.getConnection();

  try {
    const { password, confirm_password, address, ...rest } = data;

    if (password !== confirm_password) {
      throw new Error("Senhas não conferem");
    }

    //cria uma conexão e inicia uma transação para garantir que tanto o agricultor quanto o endereço sejam criados com sucesso ou ambos sejam revertidos em caso de erro
    await connection.beginTransaction();

    const password_hash = await bcrypt.hash(password, 10);

    const farmerId = await farmerRepository.createFarmer(
      { ...rest, password_hash },
      connection //conexao
    );

    if (address) {
      await addressRepository.createAddress(
        farmerId,
        address,
        connection //a mesma conexão para garantir atomicidade
      );
    }

    await connection.commit();


    return res.status(201).json({
      message: "Agricultor adicionado com o ID: ", farmerId
    });

  } catch (error) {
    await connection.rollback(); //rolback em caso de erro para evitar dados inconsistentes
    throw error;

  } finally {
    connection.release();
  }
};


export const deleteFarmer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await farmerRepository.deleteFarmer(Number(id));

    if (!deleted) {
      return res.status(404).json({ message: "Agricultor não encontrado" });
    }

    return res.status(200).json({
      message: "Agricultor excluído com sucesso"
    });

  } catch (error: any) {
    console.error("Erro ao excluir Agricultor:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message
    });
  }
};


export const updateFarmer = async (req: Request, res: Response) => {
  const connection = await pool.getConnection(); 

  try {
    const userId = (req as any).user.id;

    const { address, ...rest } = req.body;

    await connection.beginTransaction(); //inicia a transação para garantir que as atualizações sejam atômicas

    //remove undefined/null
    const cleanData = Object.fromEntries(
      Object.entries(rest).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    );

    //Atualiza o agricultor só se tiver algo
    if (Object.keys(cleanData).length > 0) {
      await farmerRepository.updateFarmer(userId, cleanData, connection);
    }

    //Atualiza Address (parcial também)
    if (address && Object.keys(address).length > 0) {
      await addressRepository.updateAddress(userId, address, connection);
    }

    await connection.commit();

    return res.json({
      message: "Cadastro do Agricultor Atualizado com sucesso"
    });

  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.status(500).json({
      message: "Erro ao atualizar"
    });

  } finally {
    connection.release();
  }
};

export default {
  listFarmers,
  registerFarmer,
  deleteFarmer,
  updateFarmer,
  getFarmerMe
};