import { Router } from "express";
import deliveryController from "../controllers/deliveryController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router = Router();

router.get('' ,deliveryController.getTypesDelivery); // Rota para listar todos os métodos de entrega
router.post('/farmer/:id', authMiddleware, deliveryController.createDelivery); // Rota para criar um novo método de entrega para o usuário autenticado
router.get('/farmer/:id', deliveryController.getByFarmerIdDelivery); // Rota para listar os métodos de entrega do agricultor logado, protegida por autenticação
router.delete('/method/:id', authMiddleware, deliveryController.removeDelivery); // Rota para deletar um método de entrega específico, protegida por autenticação

export default router;