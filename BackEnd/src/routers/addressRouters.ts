import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import addressController from '../controllers/addressController';

const router = Router();

router.get('/:id', authMiddleware, addressController.getAddressByFarmer); // Rota para obter o endereço do agricultor logado, protegida por autenticação
router.delete('/:id', authMiddleware, addressController.deleteAddress); // Rota para deletar um endereço específico, protegida por autenticação



export default router;