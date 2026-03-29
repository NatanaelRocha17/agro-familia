import pool from '../config/database';

type RefreshToken = {
  id?: number;
  token_hash: string;
  fk_farmer_id: number;
  expires_at: Date;
  revoked: boolean;
  created_at?: Date;
};

export const createRefreshToken = async (data: RefreshToken, conn: any = pool): Promise<number> => { // Retorna o ID do token criado
  const [result]: any = await conn.query(
    `INSERT INTO Refresh_token 
    (token_hash, fk_farmer_id, expires_at, revoked, created_at)
    VALUES (?, ?, ?, ?, NOW())`,
    [
      data.token_hash,
      data.fk_farmer_id,
      data.expires_at,
      data.revoked
    ]
  );

  return result.insertId;
};

export const findRefreshTokenByHash = async ( // Busca um token de atualização no banco usando o hash do token recebido
  tokenHash: string
): Promise<RefreshToken | null> => {

  const [rows] = await pool.query(
    `SELECT * FROM Refresh_token
     WHERE token_hash = ?
     LIMIT 1`,
    [tokenHash]
  );

  const tokens = rows as RefreshToken[];

  return tokens.length ? tokens[0] : null;
};

export const revokeRefreshToken = async ( // Revoga um token de atualização específico, marcando-o como revogado no banco
  id: number,
  conn: any = pool
): Promise<void> => {

  await conn.query(
    `UPDATE Refresh_token
     SET revoked = true
     WHERE id = ?`,
    [id]
  );
};

export const revokeAllRefreshTokensByUser = async ( // Revoga todos os tokens de atualização de um usuário específico, útil para logout global ou segurança
  userId: number,
  conn: any = pool
): Promise<void> => {

  await conn.query(
    `UPDATE Refresh_token
     SET revoked = true
     WHERE fk_farmer_id = ?`,
    [userId]
  );
};

export const deleteExpiredRefreshTokens = async (): Promise<void> => { // Limpa o banco de dados removendo tokens de atualização que já expiraram para manter a segurança e desempenho

  await pool.query(
    `DELETE FROM Refresh_token
     WHERE expires_at < NOW()`
  );
};

export default {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllRefreshTokensByUser,
  deleteExpiredRefreshTokens
};