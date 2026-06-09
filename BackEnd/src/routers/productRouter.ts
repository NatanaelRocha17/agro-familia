import { Router } from "express";
import productController from "../controllers/productController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
router.get('/farmer/:farmer_id', authMiddleware, productController.getByFarmerIdProduct); // Rota para obter produtos por ID do agricultor
router.post('/create/:farmer_id', authMiddleware, productController.createProduct); // Rota para criar um novo produto
router.put('/update-status/:product_id', authMiddleware, productController.updateStatusProduct); // Rota para ativar/desativar um produto
router.delete('/delete/:product_id', authMiddleware, productController.removeProduct); // Rota para deletar um produto
router.get('/:id', authMiddleware, productController.getByIdProduct); // Rota para obter um produto por ID
router.put('/:id', authMiddleware, productController.updateProduct);
router.get('', productController.getNearbyProducts); // Rota para obter produtos próximos
router.get('/full/:id', productController.getFullDataProduct); // Rota para obter dados completos de um produto, incluindo informações do agricultor
router.delete('/imagem/:public_id',authMiddleware, productController.removeCloudinaryImageProduct); // Rota para remover imagem de um produt
router.get('/statistics/:farmer_id', authMiddleware, productController.getStatistics); // Rota para obter estatísticas de produtos
router.get('/showcase/:farmer_id', productController.getShowcaseProducts);

export default router;