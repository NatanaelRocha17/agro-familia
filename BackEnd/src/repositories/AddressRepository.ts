import pool from '../config/database';

import { Address } from '../models/Address';
import { Farmer } from '../models/Farmer';

export const getAddressByFarmerId = async (farmer_id: number): Promise<Address | null> => { 
    console.log("Buscando endereço para farmer_id:", farmer_id);

    const [rows] = await pool.query(
        'SELECT * FROM Address WHERE fk_farmer_id = ?',
        [farmer_id]
    );

    const addresses = rows as Address[];

    return addresses.length ? addresses[0] : null;
};

export const createAddress = async (id: Farmer, address: Address, conn: any = pool) => {
  await conn.query(`
    INSERT INTO Address
    (fk_farmer_id, address_type, street, number, complement, neighborhood, city, state, zip_code, latitude, longitude, is_primary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
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
};

export const updateAddress = async ( userId: Farmer, address: Address, connection: any) => { 

  const [rows]: any = await connection.query( // Verifica se já existe um endereço para o agricultor
    `SELECT id FROM Address WHERE fk_farmer_id = ?`,
    [userId]
  );

  const fields = Object.keys(address) // Gerar dinamicamente os campos a serem atualizados
    .map((key) => `${key} = ?`)
    .join(', ');

  const values = Object.values(address); // Valores correspondentes aos campos

  if (rows.length > 0) { // UPDATE (caso exista)
    await connection.query(
      `UPDATE Address SET ${fields} WHERE fk_farmer_id = ?`,
      [...values, userId]
    );
  } else {
    // INSERT (caso não exista)
    await connection.query(
      `INSERT INTO Address (fk_farmer_id, ${Object.keys(address).join(', ')})
       VALUES (?, ${Object.keys(address).map(() => '?').join(', ')})`,
      [userId, ...values]
    );
  }
};

export const deleteAddress = async (id: Number): Promise<boolean> => {
    const [result] = await pool.query(
        `DELETE FROM Address WHERE id = ?`,
        [id]
    );

    return (result as any).affectedRows > 0;
};

export default {
    getAddressByFarmerId,
    createAddress,
    updateAddress,
    deleteAddress
};