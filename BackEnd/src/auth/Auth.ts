import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import farmerRepository from '../repositories/farmerRepository';
import { generateAccessToken, generateRefreshToken } from '../auth/jwt';
import { hashToken } from '../utils/hash';
import refreshTokenRepository from '../repositories/refreshTokenRepository';

export const loginAdmin = async (req: Request, res: Response) => {

  const { email, password } = req.body;

  try {
    const farmer = await farmerRepository.getFarmer(email); // busca o agricultor pelo email fornecido para verificar as credenciais

    if (!farmer) {
      return res.status(401).json({
        message: 'Usuário ou senha incorreta'
      });
    }

    const passwordValid = await bcrypt.compare(password, farmer.password_hash); // compara a senha fornecida com o hash armazenado no banco para autenticar o usuário

    if (!passwordValid) {
      return res.status(401).json({
        message: 'Usuário ou senha incorreta'
      });
    }

    const accessToken = generateAccessToken(farmer.id, farmer.email); // gera o token de acesso para realizar requests autenticados
    const refreshToken = generateRefreshToken(farmer.id, farmer.email); //gera o token de atualização para obter novos tokens de acesso sem precisar logar novamente

  
    const tokenHash = hashToken(refreshToken); // gera o hash do token de atualização para segurança, evitando armazenar o token em texto plano no banco de dados

 
    await refreshTokenRepository.createRefreshToken({ // salva o hash do token de atualização no banco para validação futura
      token_hash: tokenHash,
      fk_farmer_id: farmer.id,
      expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      revoked: false
    });


    res.cookie("refreshToken", refreshToken, { // envia o token de atualização como cookie HTTP-only para segurança
      httpOnly: true,
      secure: false, // COLOCAR TRUE EM PRODUÇÃO
      sameSite: "lax",
      maxAge: 4 * 24 * 60 * 60 * 1000
    });

    
    return res.json({ // retorna o token de acesso e informações básicas do usuário para o frontend após login bem-sucedido
      message: "Login realizado com sucesso",
      accessToken,
      user: {
        first_name: farmer.first_name,
        email: farmer.email,
        id: farmer.id
      }
    });

  } catch (err: any) {
    console.error("ERRO COMPLETO:", err);

    return res.status(500).json({
      message: 'Erro interno do servidor',
      error: err.message,
      stack: err.stack
    });
  }
};

export default {
  loginAdmin
};