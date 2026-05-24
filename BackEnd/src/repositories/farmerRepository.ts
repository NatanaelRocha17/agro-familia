import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { Farmer } from '../models/Farmer';

// Tipagem para os dados de criação (sem o ID e campos automáticos)
export interface FarmerInput {
  first_name: string;
  last_name: string;
  display_name: string;
  cpf: string;
  phone: string;
  email: string;
  profession: string;
  description: string;
  password_hash: string;
  status?: number;
  gender: string;
}

export const getAllFarmers = async (page: number, limit: number): Promise<{ data: Farmer[]; total: number }> => { 
  const offset = (page - 1) * limit;

  // Traz os dados paginados
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Farmer LIMIT ? OFFSET ?',
    [limit, offset]
  );

  // Traz o total (tipamos como RowDataPacket para acessar o .total sem usar any)
  const [countResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM Farmer'
  );

  return {
    data: rows as Farmer[],
    total: countResult[0].total as number
  };
};

export const getFarmerByEmail = async (email: string): Promise<Farmer | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM Farmer WHERE email = ?',
    [email]
  );

  return rows.length ? (rows[0] as Farmer) : null;
};

export const getFarmerById = async (id: number): Promise<any | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
        f.id,
        f.first_name,
        f.last_name,
        f.display_name,
        f.email,
        f.cpf,
        f.phone,
        f.profession,
        f.description,
        f.status,
        f.gender,
        JSON_OBJECT(
            'address_type', a.address_type,
            'street', a.street,
            'number', a.number,
            'complement', a.complement,
            'neighborhood', a.neighborhood,
            'city', a.city,
            'state', a.state,
            'zip_code', a.zip_code,
            'latitude', a.latitude,
            'longitude', a.longitude,
            'is_primary', a.is_primary,
            'created_at', a.created_at
        ) AS address
    FROM Farmer f
    LEFT JOIN Address a 
        ON a.fk_farmer_id = f.id AND a.is_primary = 1
    WHERE f.id = ?`,
    [id]
  );

  return rows.length ? rows[0] : null;
};

export const createFarmer = async (
  farmer: FarmerInput, 
  connection?: PoolConnection | Pool
): Promise<number> => { // Corrigido: Retorna number (insertId) ao invés de Farmer
  const db = connection || pool;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO Farmer
    (first_name, last_name, display_name, cpf, phone, email, profession, description, password_hash, status, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farmer.first_name,
      farmer.last_name,
      farmer.display_name,
      farmer.cpf,
      farmer.phone,
      farmer.email,
      farmer.profession,
      farmer.description,
      farmer.password_hash,
      farmer.status ?? 1, // Valor default mantido
      farmer.gender
    ]
  );

  return result.insertId;
};

export const updateFarmer = async (
  id: number, 
  data: Partial<Farmer>, // Partial permite enviar apenas os campos que vão mudar
  connection?: PoolConnection | Pool
): Promise<void> => {
  if (Object.keys(data).length === 0) return;

  const db = connection || pool;
  
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
  const values = Object.values(data);

  await db.query<ResultSetHeader>(
    `UPDATE Farmer SET ${fields} WHERE id = ?`,
    [...values, id]
  );
};

export const deleteFarmer = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM Farmer WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
};

export default {
  getAllFarmers,
  getFarmerByEmail,
  getFarmerById,
  createFarmer,
  updateFarmer,
  deleteFarmer
};

