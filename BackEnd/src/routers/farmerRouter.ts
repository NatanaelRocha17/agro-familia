import { Router } from 'express';
import farmerController from '../controllers/farmerController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, farmerController.listFarmers); //rota para listar todos os agricultores, protegida por autenticação
router.get('/me', authMiddleware, farmerController.getFarmerMe); //rota para obter os dados do agricultor logado
router.delete('/:id', authMiddleware, farmerController.deleteFarmer); //rota de exclusão com autenticação
router.post('/', farmerController.registerFarmer); // Rota de registro sem autenticação
router.patch('/', authMiddleware, farmerController.updateFarmer); //adiciona a rota PATCH para atualização parcial


export default router;