import { Router } from 'express';
import categoryController from '../controllers/categoryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();


router.get('', categoryController.listCategories); // Rota para listar todas as categorias


export default router;