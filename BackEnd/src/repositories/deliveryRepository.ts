import { ResultSetHeader } from 'mysql2/promise';
import pool from '../config/database';
import { TypeDelivery } from '../models/Delivery';

// Criamos uma interface para tipar os dados que chegam no Create
export interface DeliveryMethodInput {
  option_name: string;
  type_id: number;
  estimated_time: string;
  cost: number;
  notes: string;
  address_ids?: number[];
}

export const getDeliveryTypes = async (): Promise<TypeDelivery[]> => {
  const [rows] = await pool.query(
    'SELECT id, name, description, created_at, status, type FROM Delivery_type'
  );
  return rows as TypeDelivery[];
};

// Cria um novo método de entrega para um agricultor específico, associando-o a um ou mais endereços (se fornecidos)
export const createDeliveryMethod = async (farmerId: number,deliveryData: DeliveryMethodInput
): Promise<number> => {
  const {
    option_name,
    type_id,
    estimated_time,
    cost,
    notes,
    address_ids
  } = deliveryData;

  const addresses = Array.isArray(address_ids) && address_ids.length > 0
      ? address_ids
      : [null];

  let insertedRows = 0;

  // O repositório apenas executa. Se der erro, o Controller captura!
  for (const addressId of addresses) {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Delivery_method_old
        (option_name, type, estimated_time, cost, notes, fk_farmer_id, fk_address_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        option_name,
        type_id,
        estimated_time,
        cost,
        notes,
        farmerId,
        addressId
      ]
    );

    insertedRows += result.affectedRows;
  }

  return insertedRows; // Retornamos quantas linhas foram inseridas para o Controller saber
};

// Deleta um método de entrega específico por ID
export const deleteDeliveryMethod = async (id: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM Delivery_method_old WHERE id = ?', 
    [id]
  );
  return result.affectedRows > 0;
};

// Obtém os métodos de entrega de um agricultor específico, incluindo os endereços relacionados
export const getDeliveryMethodsByFarmerId = async (farmerId: number) => {
  const [rows] = await pool.query(
    `SELECT
      MIN(d.id) AS id,
      d.option_name,
      d.type,
      dt.name AS type_name,
      d.estimated_time,
      d.cost,
      d.notes,
      CASE
        WHEN COUNT(a.id) = 0 THEN JSON_ARRAY()
        ELSE JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', a.id,
            'street', a.street,
            'number', a.number,
            'neighborhood', a.neighborhood,
            'city', a.city,
            'state', a.state,
            'zip_code', a.zip_code
          )
        )
      END AS addresses
    FROM Delivery_method_old d
    LEFT JOIN Address a ON d.fk_address_id = a.id
    LEFT JOIN Delivery_type dt ON d.type = dt.id
    WHERE d.fk_farmer_id = ?
    GROUP BY
      d.option_name,
      d.type,
      dt.name,
      d.estimated_time,
      d.cost,
      d.notes`,
    [farmerId]
  );

  return rows;
};

export default {
  getDeliveryTypes,
  createDeliveryMethod,
  deleteDeliveryMethod,
  getDeliveryMethodsByFarmerId
};
