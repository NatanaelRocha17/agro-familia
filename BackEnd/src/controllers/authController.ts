import { Request, Response } from "express";
import bcrypt from "bcrypt";
import agricultorRepository from "../repositories/farmerRepository";
import {generateAccessToken, generateRefreshToken,verifyRefreshToken } from "../auth/jwt";
import { hashToken } from "../utils/hash";
import refreshTokenRepository from "../repositories/refreshTokenRepository";

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const farmer = await agricultorRepository.getFarmer(email);

        if (!farmer) {
            return res.status(401).json({ message: "Usuário ou senha incorreta" });
        }

        const passwordValid = await bcrypt.compare(password, farmer.password_hash);

        if (!passwordValid) {
            return res.status(401).json({ message: "Usuário ou senha incorreta" });
        }

        const accessToken = generateAccessToken(farmer.id, farmer.email);// gera o token de acesso para realizar requests autenticados
        const refreshToken = generateRefreshToken(farmer.id, farmer.email); //gera o token de atualização para obter novos tokens de acesso sem precisar logar novamente

        const tokenHash = hashToken(refreshToken); //

        await refreshTokenRepository.createRefreshToken({ // salva o hash do token de atualização no banco para validação futura
            token_hash: tokenHash,
            fk_farmer_id: farmer.id,
            expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            revoked: false
        });


        res.cookie("refreshToken", refreshToken, { // envia o token de atualização como cookie HTTP-only para segurança
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 4 * 24 * 60 * 60 * 1000
        });

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
        console.error("ERRO:", err);

        return res.status(500).json({
            message: "Erro interno do servidor",
            error: err.message
        });
    }
};


export const refresh = async (req: Request & { cookies: any }, res: Response) => {
    //
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({ message: "Refresh token ausente" });
    }

    const decoded: any = verifyRefreshToken(token);

    if (!decoded) {
        return res.status(401).json({ message: "Refresh inválido" });
    }

    const tokenHash = hashToken(token); // gera o hash do token recebido para comparação com o banco
    const savedToken: any = await refreshTokenRepository.findRefreshTokenByHash(tokenHash); // busca o token no banco usando o hash

    if (!savedToken || savedToken.revoked || new Date(savedToken.expires_at) < new Date()) { // valida se o token existe, não foi revogado e não expirou
        return res.status(401).json({ message: "Refresh inválido ou expirado" });
    }

    await refreshTokenRepository.revokeRefreshToken(savedToken.id); // revoga o token antigo para evitar reutilização

    const newRefreshToken = generateRefreshToken(decoded.id, decoded.email); // gera um novo token de atualização para o usuário
    const newAccessToken = generateAccessToken(decoded.id, decoded.email); // gera um novo token de acesso para o usuário

    const newHash = hashToken(newRefreshToken);

    await refreshTokenRepository.createRefreshToken({ // salva o novo token de atualização no banco
        token_hash: newHash,
        fk_farmer_id: decoded.id,
        expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        revoked: false
    });

    res.cookie("refreshToken", newRefreshToken, { // envia o novo token de atualização como cookie HTTP-only
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 4 * 24 * 60 * 60 * 1000
    });

    return res.json({ accessToken: newAccessToken });
};

export const revoke = async (req: Request & { cookies: any }, res: Response) => {
    const token = req.cookies.refreshToken;

    if (!token) {
        return res.status(400).json({ message: "Refresh token ausente" });
    }

    const decoded: any = verifyRefreshToken(token);
    if (!decoded) {
        return res.status(400).json({ message: "Refresh token inválido" });
    }

    const tokenHash = hashToken(token);
    const savedToken: any = await refreshTokenRepository.findRefreshTokenByHash(tokenHash);
    if (savedToken) {
        await refreshTokenRepository.revokeRefreshToken(savedToken.id);
    }

    res.clearCookie("refreshToken");
    return res.json({ message: "Logout realizado com sucesso" });
};