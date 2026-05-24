import { Router } from 'express';
import paymentController from '../controllers/paymentController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/:farmerId/methods', paymentController.getByFarmerIdPayment); //rota para listar todos os métodos de pagamento para o agricultor
router.put('/:farmerId/payment-methods', authMiddleware, paymentController.updatePayment); //rota para atualizar os métodos de pagamento para o agricultor, protegida por autenticação


export default router;