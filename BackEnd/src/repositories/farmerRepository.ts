import pool from '../config/database';
import { Farmer } from '../models/Farmer';

export const getAllFarmers = async ( page: number, limit: number): Promise<{ data: Farmer[]; total: number }> => { 
  // Implementação de paginação
  const offset = (page - 1) * limit;

  // Consulta para obter os agricultores com limite e offset
  const [rows] = await pool.query(
    'SELECT * FROM Farmer LIMIT ? OFFSET ?',
    [limit, offset]
  );

  // Consulta para obter o total de agricultores (sem limite)
  const [countResult]: any = await pool.query(
    'SELECT COUNT(*) as total FROM Farmer'
  );

  // Retorna os agricultores e o total para a paginação
  return {
    data: rows as Farmer[],
    total: countResult[0].total
  };
};


export const getFarmer = async (email: string): Promise<Farmer | null> => {
    const [rows] = await pool.query(
        'SELECT * FROM Farmer WHERE email = ?',
        [email]
    );

    const farmers = rows as Farmer[];

    return farmers.length ? farmers[0] : null;
};

export const getFarmerMe = async (id: number): Promise<Farmer | null> => {
    const [rows] = await pool.query(
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

    const farmers = rows as any[];

    return farmers.length ? farmers[0] : null;
};

export const createFarmer = async ( farmer: any, conn: any = pool): Promise<Farmer> => {

  const [result]: any = await conn.query(
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
      farmer.status ?? 1,
      farmer.gender
    ]
  );

  return result.insertId;
};

export const deleteFarmer = async (id: number): Promise<boolean> => {
    const [result]: any = await pool.query(
        'DELETE FROM Farmer WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
};


export const updateFarmer = async (userId: number, data: any, connection: any) => {

  if (Object.keys(data).length === 0) return;

  const fields = Object.keys(data)
    .map((key) => `${key} = ?`)
    .join(', ');

  const values = Object.values(data);

  await connection.query(
    `UPDATE Farmer SET ${fields} WHERE id = ?`,
    [...values, userId]
  );
};

export default {
    getAllFarmers,
    getFarmer,
    getFarmerMe,
    createFarmer,
    deleteFarmer,
    updateFarmer
};