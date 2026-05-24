import {Request, Response} from 'express';
import categoryRepository from '../repositories/categoryRepository';

export const listCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryRepository.getCategories();
    return res.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
};


export default {   
    listCategories
};