import { Router } from "express";
import { loginAdmin, refresh, revoke } from "../controllers/authController";

const router = Router();

router.post("/login", loginAdmin);// Rota de login para administradores, onde o controlador lida com a autenticação e geração de tokens.
router.post("/refresh", refresh); // Rota para renovar o token de acesso usando o token de atualização, onde o controlador verifica o token de atualização e emite um novo token de acesso se for válido.
router.post("/revoke", revoke); // Rota para revogar o token de atualização, onde o controlador verifica o token de atualização e o revoga no banco de dados para impedir seu uso futuro, efetivamente desconectando o usuário.

export default router;