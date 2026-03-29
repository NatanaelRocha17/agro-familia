import jwt, { JwtPayload } from "jsonwebtoken";

const accessSecret = process.env.JWT_SECRET;
if (!accessSecret) throw new Error("JWT_SECRET não definido");

const refreshSecret = process.env.JWT_REFRESH_SECRET;
if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET não definido");

export const generateAccessToken = (id: number, email: string): string => { // gera um token de acesso com o ID e email do usuário, usando a chave secreta de acesso e definindo uma expiração de 15 minutos
  return jwt.sign({ id, email }, accessSecret, { expiresIn: "15m" });
};

export const generateRefreshToken = (id: number, email: string): string => { // gera um token de atualização com o ID e email do usuário, usando a chave secreta de atualização e definindo uma expiração de 4 dias
  return jwt.sign({ id, email }, refreshSecret, { expiresIn: "4d" });
};

export const verifyAccessToken = (token: string): JwtPayload | null => { // verifica a validade do token de acesso usando a chave secreta de acesso, retornando o payload decodificado se for válido ou null se for inválido
  try {
    return jwt.verify(token, accessSecret) as JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => { //  verifica a validade do token de atualização usando a chave secreta de atualização, retornando o payload decodificado se for válido ou null se for inválido
  try {
    return jwt.verify(token, refreshSecret) as JwtPayload;
  } catch {
    return null;
  }
};