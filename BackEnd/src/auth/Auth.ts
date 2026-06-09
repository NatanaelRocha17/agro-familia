import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "./jwt";
import { hashToken } from "../utils/hash";
import refreshTokenRepository from "../repositories/refreshTokenRepository";

export const refresh = async (req: Request, res: Response) => {
  try {
    
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token não encontrado" });
    }

    let payload: JwtPayload;

    try {
      payload = verifyRefreshToken(refreshToken) as JwtPayload;
    } catch {
      return res.status(401).json({ message: "Refresh token inválido" });
    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return res.status(401).json({ message: "Refresh token não reconhecido" });
    }

    if (storedToken.revoked) {
      return res.status(401).json({ message: "Refresh token revogado" });
    }

    if (new Date(storedToken.expires_at) < new Date()) {
      return res.status(401).json({ message: "Refresh token expirado" });
    }

    await refreshTokenRepository.revokeTokenByHash(tokenHash);

   // Gerar novos tokens
    const userId = payload.id;
    const email = payload.email;

    const newRefreshToken = generateRefreshToken(userId, email);
    const newTokenHash = hashToken(newRefreshToken);

    await refreshTokenRepository.createRefreshToken({
      token_hash: newTokenHash,
      fk_farmer_id: userId,
      expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      revoked: false
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 4 * 24 * 60 * 60 * 1000
    });

    const newAccessToken = generateAccessToken(userId, email);

    return res.json({
      accessToken: newAccessToken
    });

  } catch (err: any) {
    console.error("Erro no refresh:", err);

    return res.status(500).json({
      message: "Erro interno",
      error: err.message
    });
  }
};