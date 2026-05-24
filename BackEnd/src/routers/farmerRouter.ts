import { Router } from 'express';
import farmerController from '../controllers/farmerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, farmerController.getAllFarmers); //rota para listar todos os agricultores, protegida por autenticação
router.get('/me', authMiddleware, farmerController.getMeFarmer); //rota para obter os dados do agricultor logado
router.delete('/:id', authMiddleware, farmerController.removeFarmer); //rota de exclusão com autenticação
router.post('/', farmerController.createFarmer); // Rota de registro sem autenticação
router.patch('/', authMiddleware, farmerController.updateFarmer); //adiciona a rota PATCH para atualização parcial


export default router;