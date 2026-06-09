import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/database";

// Obtém os métodos de pagamento aceitos por um agricultor específico, retornando uma lista de métodos de pagamento
export const getByFarmerId = async (farmerId: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.*
     FROM accepts a
     LEFT JOIN Payment_method p ON p.id = a.fk_payment_method_id
     WHERE a.fk_farmer_id = ?`,
    [farmerId]
  );

  return rows;
};

// Obtém todos os métodos de pagamento disponíveis no sistema, retornando uma lista completa de métodos de pagamento para que o frontend possa exibir opções ao agricultor
export const getAllMethods = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM Payment_method`
  );

  return rows;
};

// Cria um novo método de entrega para um agricultor específico, associando-o a um ou mais endereços (se fornecidos)
export const addMethodToFarmer = async (
  farmerId: number, 
  paymentMethodId: number
): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO accepts (fk_farmer_id, fk_payment_method_id) 
     VALUES (?, ?)`,
    [farmerId, paymentMethodId]
  );
  
  return result.affectedRows > 0;
};

//  Deleta um método de pagamento associado a um agricultor específico, retornando true se a exclusão foi bem-sucedida ou false se o método de pagamento não foi encontrado para aquele agricultor
export const removeMethodFromFarmer = async (
  farmerId: number, 
  paymentMethodId: number
): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM accepts 
     WHERE fk_farmer_id = ? AND fk_payment_method_id = ?`,
    [farmerId, paymentMethodId]
  );
  
  return result.affectedRows > 0;
};

export default {
  getByFarmerId,
  getAllMethods,
  addMethodToFarmer,
  removeMethodFromFarmer
};
