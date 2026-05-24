import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';

export type RefreshToken = {
  id?: number;
  token_hash: string;
  fk_farmer_id: number;
  expires_at: Date;
  revoked: boolean;
  created_at?: Date;
};

// 1. Criar token
export const createRefreshToken = async (
  data: RefreshToken,
  connection?: PoolConnection | Pool
): Promise<number> => {
  const db = connection || pool;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO Refresh_token 
     (token_hash, fk_farmer_id, expires_at, revoked, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [
      data.token_hash,
      data.fk_farmer_id,
      data.expires_at,
      data.revoked ? 1 : 0 // Garante que o MySQL receba 0 ou 1
    ]
  );

  return result.insertId;
};

// 2. Buscar por hash 
export const findByTokenHash = async (
  tokenHash: string
): Promise<RefreshToken | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM Refresh_token
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash]
  );

  return rows.length ? (rows[0] as RefreshToken) : null;
};

// 3. Revogar por ID
export const revokeTokenById = async (
  id: number,
  connection?: PoolConnection | Pool
): Promise<boolean> => {
  const db = connection || pool;

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE Refresh_token
     SET revoked = 1
     WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};

// 4. Revogar por HASH 
export const revokeTokenByHash = async (
  tokenHash: string,
  connection?: PoolConnection | Pool
): Promise<boolean> => {
  const db = connection || pool;

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE Refresh_token
     SET revoked = 1
     WHERE token_hash = ?`,
    [tokenHash]
  );

  return result.affectedRows > 0;
};

// 5. Revogar todos do usuário (ex: trocar de senha, deslogar de tudo)
export const revokeAllByUser = async (
  userId: number,
  connection?: PoolConnection | Pool
): Promise<boolean> => {
  const db = connection || pool;

  const [result] = await db.query<ResultSetHeader>(
    `UPDATE Refresh_token
     SET revoked = 1
     WHERE fk_farmer_id = ?`,
    [userId]
  );

  return result.affectedRows > 0;
};

// 6. Limpar expirados (Job de faxina)
export const deleteExpiredRefreshTokens = async (): Promise<number> => {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM Refresh_token
     WHERE expires_at < NOW()`
  );

  return result.affectedRows; // Retorna quantas linhas foram deletadas
};

export default {
  createRefreshToken,
  findByTokenHash,
  revokeTokenById,
  revokeTokenByHash,
  revokeAllByUser,
  deleteExpiredRefreshTokens
};
