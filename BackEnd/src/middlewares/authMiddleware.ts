import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => { // middleware para proteger rotas que requerem autenticação
  const authHeader = req.headers.authorization; // espera o token no formato "Bearer <token>" no header de autorização

  if (!authHeader) {
    return res.status(401).json({ message: "Token ausente" }); 
  }

  const [, token] = authHeader.split(" "); //   extrai o token do header

  const decoded = verifyAccessToken(token); // verifica e decodifica o token, retornando os dados do usuário se for válido

  if (!decoded) { // se o token for inválido ou expirado, retorna erro de autenticação
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }

  (req as any).user = decoded;
  next();
};