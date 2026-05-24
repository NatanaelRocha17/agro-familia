import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "../config/database";

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

export const getAllMethods = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM Payment_method`
  );

  return rows;
};

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
