import {Request, Response} from 'express';
import categoryRepository from '../repositories/categoryRepository';


// Listagem de categorias, onde o controlador busca todas as categorias disponíveis no banco de dados e retorna a lista para o cliente, permitindo que os usuários possam filtrar ou navegar pelos produtos com base nas categorias
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