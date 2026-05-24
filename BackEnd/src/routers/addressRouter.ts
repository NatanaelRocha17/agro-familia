import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import addressController from '../controllers/addressController';

const router = Router();

router.get('/:id', addressController.getByFarmerId); // Rota para obter o endereço do agricultor logado, protegida por autenticação
router.delete('/:id', authMiddleware, addressController.removeAddress); // Rota para deletar um endereço específico, protegida por autenticação
router.post('/create/:id', authMiddleware, addressController.createAddress); // Rota para criar um novo endereço de entrega para o usuário autenticado
router.delete('/delete/:id', authMiddleware, addressController.removeAddress); // Rota para atualizar o endereço de entrega do usuário autenticado

export default router;