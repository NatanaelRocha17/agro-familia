import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Carrega as variáveis de ambiente do arquivo .env localizado na raiz do projeto

const database = mysql.createPool(process.env.MYSQL_PUBLIC_URL!); // Cria um pool de conexões com o banco de dados MySQL usando a URL fornecida nas variáveis de ambiente

export default database;