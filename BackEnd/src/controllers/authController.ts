import { Request, Response } from "express";
import bcrypt from "bcrypt";
import agricultorRepository from "../repositories/farmerRepository";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../auth/jwt";
import { hashToken } from "../utils/hash";
import refreshTokenRepository from "../repositories/refreshTokenRepository";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "lax" as const,
  maxAge: 4 * 24 * 60 * 60 * 1000
};

// Controlador para gerenciar os endpoints relacionados à autenticação, incluindo login, refresh de tokens e logout, utilizando JWT para autenticação e refresh tokens armazenados no banco de dados para segurança adicional

// Login de administradores, onde o controlador lida com a autenticação e geração de tokens, verificando as credenciais fornecidas e emitindo um token de acesso e um refresh token se a autenticação for bem-sucedida, além de armazenar o refresh token no banco de dados para controle e segurança
export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const farmer = await agricultorRepository.getFarmerByEmail(email);

    if (!farmer) {
      return res.status(401).json({ message: "Usuário ou senha incorreta" });
    }

    const passwordValid = await bcrypt.compare(password, farmer.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ message: "Usuário ou senha incorreta" });
    }

    const accessToken = generateAccessToken(farmer.id, farmer.email);
    const refreshToken = generateRefreshToken(farmer.id, farmer.email);

    const tokenHash = hashToken(refreshToken);

    await refreshTokenRepository.createRefreshToken({
      token_hash: tokenHash,
      fk_farmer_id: farmer.id,
      expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res.json({
      message: "Login realizado com sucesso",
      accessToken,
      user: {
        first_name: farmer.first_name,
        email: farmer.email,
        id: farmer.id
      }
    });

  } catch (err: any) {
    console.error("ERRO LOGIN:", err);

    return res.status(500).json({
      message: "Erro interno do servidor",
      error: err.message
    });
  }
};

//  Renovação do token de acesso usando o refresh token armazenado como cookie HTTP-only, onde o controlador verifica o refresh token, revoga o token antigo para segurança, emite um novo token de acesso e um novo refresh token, e atualiza o cookie com o novo refresh token para manter a sessão do usuário ativa sem exigir um novo login
export const refresh = async (req: Request & { cookies: any }, res: Response) => {
 try {

    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token ausente" });
    }

    let decoded: any;

    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ message: "Refresh inválido" });
    }

    const tokenHash = hashToken(token);

    const savedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      !savedToken ||
      savedToken.revoked ||
      new Date(savedToken.expires_at) < new Date()
    ) {
      return res.status(401).json({ message: "Refresh inválido ou expirado" });
    }

    await refreshTokenRepository.revokeTokenByHash(tokenHash);

    const newRefreshToken = generateRefreshToken(decoded.id, decoded.email);
    const newAccessToken = generateAccessToken(decoded.id, decoded.email);

    const newHash = hashToken(newRefreshToken);

    await refreshTokenRepository.createRefreshToken({
      token_hash: newHash,
      fk_farmer_id: decoded.id,
      expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return res.json({ accessToken: newAccessToken });

  } catch (err: any) {
    console.error("ERRO REFRESH:", err);

    return res.status(500).json({
      message: "Erro interno",
      error: err.message
    });
  }
};

// Logout, onde o controlador verifica o refresh token, revoga o token no banco de dados para impedir seu uso futuro, limpa o cookie do refresh token e retorna uma mensagem de sucesso, efetivamente desconectando o usuário e invalidando a sessão atual
export const revoke = async (req: Request & { cookies: any }, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(200).json({ message: "Logout já realizado" });
    }

    let decoded: any;

    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res.status(200).json({ message: "Logout realizado" });
    }

    const tokenHash = hashToken(token);

    const savedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (savedToken) {
      await refreshTokenRepository.revokeTokenByHash(tokenHash);
    }

    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return res.json({ message: "Logout realizado com sucesso" });

  } catch (err: any) {
    console.error("ERRO LOGOUT:", err);

    return res.status(500).json({
      message: "Erro interno",
      error: err.message
    });
  }
};