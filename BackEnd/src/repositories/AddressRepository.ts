import { Pool, PoolConnection, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { Address } from '../models/Address';

// 1. GET
export const getAddressByFarmerId = async (farmer_id: number): Promise<Address[]> => {
  const [rows] = await pool.query(
    `SELECT *
     FROM Address
     WHERE fk_farmer_id = ?
     ORDER BY is_primary DESC, id ASC`,
    [farmer_id]
  );

  return rows as Address[];
};

// 2. CREATE
export const createAddress = async (
  farmer_id: number, 
  address: Address, 
  connection?: PoolConnection | Pool
): Promise<number> => {
  const db = connection || pool;

  // Usamos ResultSetHeader para conseguir pegar o insertId do MySQL depois
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO Address
    (fk_farmer_id, address_type, street, number, complement,
     neighborhood, city, state, zip_code, latitude, longitude, is_primary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      farmer_id,
      address.address_type,
      address.street,
      address.number,
      address.complement,
      address.neighborhood,
      address.city,
      address.state,
      address.zip_code,
      address.latitude || null,
      address.longitude || null,
      address.is_primary ? 1 : 0
    ]
  );

  return result.insertId; // Retorna o ID gerado
};

// 3. UPDATE (Upsert)
export const updateAddress = async (
  farmer_id: number,
  address: Partial<Address>, // Partial permite passar apenas os campos que vão mudar
  connection?: PoolConnection | Pool
): Promise<void> => {
  const db = connection || pool; // Correção: Garantindo que db sempre exista

  const [rows]: any = await db.query(
    `SELECT id
     FROM Address
     WHERE fk_farmer_id = ?
     AND address_type = 'residential'`,
    [farmer_id]
  );

  const fields = Object.keys(address).map((key) => `${key} = ?`).join(", ");
  const values = Object.values(address);

  if (rows.length > 0) {
    await db.query(
      `UPDATE Address
       SET ${fields}
       WHERE fk_farmer_id = ?
       AND address_type = 'residential'`,
      [...values, farmer_id]
    );
  } else {
    await db.query(
      `INSERT INTO Address (
        fk_farmer_id,
        address_type,
        ${Object.keys(address).join(", ")}
      )
      VALUES (
        ?,
        'residential',
        ${Object.keys(address).map(() => "?").join(", ")}
      )`,
      [farmer_id, ...values]
    );
  }
};

// 4. DELETE
export const deleteAddress = async (id: number): Promise<boolean> => {
  // O repositório só executa. Se der erro de chave estrangeira (ER_ROW_IS_REFERENCED_2), 
  // o try/catch do Controller vai capturar isso!
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM Address WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};

export default {
  getAddressByFarmerId,
  createAddress,
  updateAddress,
  deleteAddress
};

