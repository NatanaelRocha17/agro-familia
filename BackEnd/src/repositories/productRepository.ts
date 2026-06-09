import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '../config/database';
import { Product, CreateProductDTO, ProductWithFarmerDTO } from '../models/Product';


// Obtém os produtos de um agricultor específico, retornando uma lista paginada de produtos com suas imagens associadas para exibição no frontend
export const getByFarmerIdProduct = async (
  farmer_id: number, 
  page: number, 
  limit: number
): Promise<{ data: Product[]; total: number }> => {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
        p.id, p.name, p.price, p.description, p.product_origin,
        p.production_method, p.sale_price, p.unit_measure,
        p.status, p.created_at, p.updated_at,
        COALESCE(
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', pi.id,
                    'image_url', pi.image_url,
                    'public_id', pi.public_id,
                    'display_order', pi.display_order,
                    'uploaded_at', pi.uploaded_at
                )
            ),
            JSON_ARRAY()
        ) AS images
    FROM (
        SELECT * FROM Product 
        WHERE fk_farmer_id = ?
        ORDER BY id
        LIMIT ? OFFSET ?
    ) p
    LEFT JOIN Product_image pi ON pi.fk_product_id = p.id
    GROUP BY p.id`,
    [farmer_id, limit, offset]
  );

 const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM Product WHERE fk_farmer_id = ?`,
    [farmer_id]
  );

  return {
    data: rows as Product[],
    total: countRows[0]?.total || 0
  };

};


// Cria um novo produto para um agricultor específico, retornando o ID do produto criado para que o Controller possa usar isso para associar as imagens em seguida (se necessário)
export const createProduct = async (
  connection: PoolConnection | Pool, 
  product: CreateProductDTO
): Promise<number> => {
  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO Product 
        (name, description, price, sale_price, unit_measure, product_origin, production_method, status, fk_farmer_id, fk_category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.name, product.description, product.price,
      product.sale_price, product.unit_measure, product.product_origin,
      product.production_method, product.status, product.farmer_id, product.category_id,
    ]
  );

  return result.insertId;
};

// Faz o upload de uma imagem para um produto específico, associando-a ao produto no banco de dados e retornando true se a operação foi bem-sucedida ou false caso contrário
export const uploadProductImage = async (
  connection: PoolConnection | Pool, 
  productId: number, 
  imageUrl: string, 
  public_id: string, 
  displayOrder: number
): Promise<boolean> => {
  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO Product_image (image_url, display_order, fk_product_id, public_id)
     VALUES (?, ?, ?, ?)`,
    [imageUrl, displayOrder, productId, public_id]
  );

  return result.affectedRows > 0;
};


// Atualiza o status de um produto específico, retornando true se a atualização foi bem-sucedida ou false se o produto não foi encontrado
export const updateStatusProduct = async (productId: number, status: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE Product SET status = ? WHERE id = ?`,
    [status, productId]
  );

  return result.affectedRows > 0;
};


// Deleta um produto específico por ID, retornando true se a exclusão foi bem-sucedida ou false se o produto não foi encontrado
export const deleteProduct = async (productId: number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>(
    `DELETE FROM Product WHERE id = ?`,
    [productId]
  );
  return result.affectedRows > 0;
};


// Obtém um produto específico por ID, incluindo suas imagens associadas, retornando o produto completo para exibição no frontend ou null se o produto não for encontrado
export const getProductById = async (id: number): Promise<Product | null> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      p.*,
      pi.id AS image_id, pi.image_url, pi.public_id, pi.display_order, pi.uploaded_at,
      c.name as categoria
    FROM Product p
    LEFT JOIN Product_image pi ON pi.fk_product_id = p.id
    LEFT JOIN Category c ON p.fk_category_id = c.id 
    WHERE p.id = ?
    ORDER BY pi.display_order ASC`,
    [id]
  );

  if (rows.length === 0) return null;

  const images = rows
    .filter(row => row.image_id !== null)
    .map(row => ({
      id: row.image_id,
      image_url: row.image_url,
      display_order: row.display_order,
      uploaded_at: row.uploaded_at,
      public_id: row.public_id,
    }));

  return {
    id: rows[0].id,
    name: rows[0].name,
    description: rows[0].description,
    price: rows[0].price,
    sale_price: rows[0].sale_price,
    unit_measure: rows[0].unit_measure,
    product_origin: rows[0].product_origin,
    production_method: rows[0].production_method,
    status: rows[0].status,
    created_at: rows[0].created_at,
    updated_at: rows[0].updated_at,
    category: rows[0].categoria,
    farmer_id: rows[0].fk_farmer_id,
    category_id: rows[0].fk_category_id,
    images,
  } as Product;
};


// Atualiza um produto específico por ID, permitindo a atualização de seus campos e imagens associadas, retornando void e lançando um erro se a operação falhar
export const updateProduct = async (id: number, data: any): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query<ResultSetHeader>(
      `UPDATE Product SET
        name = ?, description = ?, price = ?, sale_price = ?,
        unit_measure = ?, product_origin = ?, production_method = ?,
        status = ?, fk_category_id = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        data.name, data.description, Number(data.price), Number(data.sale_price),
        data.unit_measure, data.product_origin, data.production_method,
        data.status, data.category_id, id
      ]
    );

    // Remove TODAS as imagens antigas
    await connection.query<ResultSetHeader>(
      `DELETE FROM Product_image WHERE fk_product_id = ?`,
      [id]
    );

    // Insere novamente as imagens novas
    if (data.images && data.images.length > 0) {
      const imageValues = data.images.map((img: any, index: number) => [
        id,
        img.image_url,
        img.display_order ?? index,
        img.public_id
      ]);

      await connection.query<ResultSetHeader>(
        `INSERT INTO Product_image (fk_product_id, image_url, display_order, public_id) VALUES ?`,
        [imageValues]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Atualiza um produto específico por ID, permitindo a atualização de seus campos e imagens associadas, retornando void e lançando um erro se a operação falhar
export const getNearbyProducts = async (
  userLat: number, 
  userLng: number, 
  radiusKm: number, 
  limit: number, 
  offset: number,
  priceMinimum?: number, 
  priceMaximum?: number, 
  categoriaId?: number, 
  searchTerm?: string
): Promise<{ data: ProductWithFarmerDTO[]; total: number }> => {
  
  // 1. Montagem dinâmica dos filtros SQL
  const filters: string[] = [];
  const params: any[] = [];

  if (priceMinimum !== undefined) {
    filters.push(`p.sale_price >= ?`);
    params.push(priceMinimum);
  }
  if (priceMaximum !== undefined) {
    filters.push(`p.sale_price <= ?`);
    params.push(priceMaximum);
  }
  if (categoriaId !== undefined) {
    filters.push(`p.fk_category_id = ?`);
    params.push(categoriaId);
  }
  if (searchTerm && searchTerm.trim() !== "") {
    filters.push(`p.name LIKE ?`);
    params.push(`%${searchTerm}%`); // Busca parcial com wildcards
  }

  const whereFilters = filters.length > 0 ? `AND ${filters.join(" AND ")}` : "";

  // 2. Consulta para contar o total (para a paginação)
  // Nota: A contagem precisa dos mesmos filtros do JOIN original
  const countParams = [...params, userLat, userLng, userLat, radiusKm];
  
  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total
    FROM (
      SELECT p.id,
        (6371 * ACOS(LEAST(1, COS(RADIANS(?)) * COS(RADIANS(a.latitude)) * COS(RADIANS(a.longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(a.latitude))))) AS distance
      FROM Product p
      LEFT JOIN Farmer f ON f.id = p.fk_farmer_id
      LEFT JOIN Address a ON a.fk_farmer_id = f.id
      WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND a.is_primary = 1 AND p.status = 1 ${whereFilters}
      HAVING distance <= ?
    ) sub`,
    countParams
  );

  const total = countRows[0]?.total || 0;

  // 3. Consulta principal para buscar os dados
  const rowsParams = [userLat, userLng, userLat, ...params, radiusKm, limit, offset];

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      p.id, p.name, p.description, p.price, p.sale_price, p.product_origin, p.status, p.unit_measure,
      f.id as farmer_id, f.first_name, f.display_name, f.profession, f.phone,
      a.city, c.name as category,
      pi.id as image_id, pi.image_url, dist.distance
    FROM (
      SELECT p.id,
        (6371 * ACOS(LEAST(1, COS(RADIANS(?)) * COS(RADIANS(a.latitude)) * COS(RADIANS(a.longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(a.latitude))))) AS distance
      FROM Product p
      LEFT JOIN Farmer f ON f.id = p.fk_farmer_id
      LEFT JOIN Address a ON a.fk_farmer_id = f.id
      WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND a.is_primary = 1 AND p.status = 1 ${whereFilters}
      HAVING distance <= ?
      ORDER BY distance ASC
      LIMIT ? OFFSET ?
    ) dist
    JOIN Product p ON p.id = dist.id
    LEFT JOIN Farmer f ON f.id = p.fk_farmer_id
    LEFT JOIN Address a ON a.fk_farmer_id = f.id
    LEFT JOIN Product_image pi ON pi.fk_product_id = p.id
    LEFT JOIN Category c ON c.id = p.fk_category_id
    ORDER BY dist.distance ASC, pi.display_order ASC`,
    rowsParams
  );

  // 4. Mapeamento dos resultados (agrupando imagens)
  const map = new Map<number, any>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        sale_price: row.sale_price,
        unit_measure: row.unit_measure,
        product_origin: row.product_origin,
        status: row.status,
        city: row.city,
        category: row.category,
        distance_km: Number(row.distance.toFixed(2)),
        images: [],
        farmer: {
          id: row.farmer_id,
          first_name: row.first_name,
          display_name: row.display_name,
          profession: row.profession,
          phone: row.phone
        }
      });
    }
    if (row.image_id) {
      map.get(row.id).images.push({
        id: row.image_id,
        image_url: row.image_url
      });
    }
  }

  return {
    data: Array.from(map.values()),
    total
  };
};

// Obtém as estatísticas de produtos de um agricultor específico, retornando o total de produtos, quantidade de produtos ativos e inativos para exibição no dashboard do agricultor
export const getStatistics = async (id: number): Promise<any> => {
  const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
      COUNT(*) AS total_products,
      SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS active_products,
      SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS inactive_products
  FROM AgroFamilia.Product
  WHERE fk_farmer_id = ?`, [id]);

    return rows[0];
};

// Obtém os produtos em destaque (showcase) de um agricultor específico, retornando uma lista paginada de produtos ativos com suas imagens e informações do agricultor para exibição na seção de destaque do perfil do agricultor
export const getShowcaseProducts = async (
  farmer_id: number, 
  limit: number, 
  offset: number
): Promise<{ data: ProductWithFarmerDTO[]; total: number }> => {
  
  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total FROM Product WHERE fk_farmer_id = ? AND status = 1`,
    [farmer_id]
  );
  const total = countRows[0]?.total || 0;

  if (total === 0) {
    return { data: [], total: 0 };
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.sale_price,
      p.product_origin,
      p.status,
      p.unit_measure,
      c.name as category,
      f.id as farmer_id, 
      f.first_name, 
      f.display_name, 
      f.profession, 
      f.phone,
      a.city,
      pi.id as image_id,
      pi.image_url
    FROM (
      SELECT * FROM Product 
      WHERE fk_farmer_id = ? AND status = 1
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    ) p
    LEFT JOIN Product_image pi ON pi.fk_product_id = p.id
    LEFT JOIN Category c ON c.id = p.fk_category_id
    LEFT JOIN Farmer f ON f.id = p.fk_farmer_id
    LEFT JOIN Address a ON a.fk_farmer_id = f.id AND a.is_primary = 1
    ORDER BY p.id DESC, pi.display_order ASC`,
    [farmer_id, limit, offset]
  );

  // 3. Mapeamento dos resultados (agrupando imagens e dados do agricultor)
  const map = new Map<number, any>();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        sale_price: row.sale_price,
        unit_measure: row.unit_measure,
        product_origin: row.product_origin,
        status: row.status,
        city: row.city,
        category: row.category,
        farmer: {
          id: row.farmer_id,
          first_name: row.first_name,
          display_name: row.display_name,
          profession: row.profession,
          phone: row.phone
        },
        images: [],
      });
    }
    
    // Adiciona as imagens apenas se existirem
    if (row.image_id) {
      map.get(row.id).images.push({
        id: row.image_id,
        image_url: row.image_url
      });
    }
  }

  return {
    data: Array.from(map.values()),
    total
  };
};

export default {
  getByFarmerIdProduct,
  createProduct,
  uploadProductImage,
  updateStatusProduct,
  deleteProduct,
  getProductById,
  updateProduct,
  getNearbyProducts,
  getStatistics,
  getShowcaseProducts
};


