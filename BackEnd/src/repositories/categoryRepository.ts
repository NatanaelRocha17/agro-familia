import pool from '../config/database';
import { Category } from '../models/Category';


// Obtém todas as categorias de produtos disponíveis
export const getCategories = async (): Promise<Category[]> => {
    const [rows] = await pool.query('SELECT * FROM Category');
    return rows as Category[];
};


export default {
    getCategories,
};