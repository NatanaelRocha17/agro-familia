import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import database from './config/database';

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

(async () => {
  try {
    const conn = await database.getConnection();
    console.log("Banco conectado com sucesso");
    conn.release();
  } catch (err) {
    console.error("Erro ao conectar:", err);
  }
})();