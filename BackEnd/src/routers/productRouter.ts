import { Router } from "express";
import productController from "../controllers/productController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.get('/agricultor/:farmer_id', authMiddleware, productController.getByFarmerIdProduct); // Rota para obter produtos por ID do agricultor
router.post('/cadastrar/:farmer_id', authMiddleware, productController.createProduct); // Rota para criar um novo produto
router.put('/atualizarstatus/:product_id', authMiddleware, productController.updateStatusProduct); // Rota para ativar/desativar um produto
router.delete('/deletar/:product_id', authMiddleware, productController.removeProduct); // Rota para deletar um produto
router.get('/:id', authMiddleware, productController.getByIdProduct); // Rota para obter um produto por ID
router.put('/:id', authMiddleware, productController.updateProduct);
router.get('', productController.getNearbyProducts); // Rota para obter produtos próximos
router.get('/full/:id', productController.getFullDataProduct); // Rota para obter dados completos de um produto, incluindo informações do agricultor
router.delete('/imagem/:public_id', productController.removeCloudinaryImageProduct); // Rota para remover imagem de um produto

export default router;