import { Request, Response } from "express";
import productRepository from "../repositories/productRepository";
import farmerRepository from "../repositories/farmerRepository";
import database from "../config/database";
import paymentRepository from "../repositories/paymentRepository";
import deliveryRepository from "../repositories/deliveryRepository";
import cloudinary from "../config/cloudinary";


//busca produtos de um agricultor específico, retornando uma lista de produtos associados ao ID do agricultor fornecido na URL, permitindo que os agricultores possam visualizar e gerenciar seus produtos cadastrados na plataforma, com suporte para paginação
export const getByFarmerIdProduct = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.farmer_id);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const { data, total } = await productRepository.getByFarmerIdProduct(farmer_id, page, limit);

    return res.status(200).json({
      success: true,
      data: {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (err) {
    console.error("Erro no getByFarmerId (Product):", err);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao buscar produtos do agricultor.' 
    });
  }
};

// Cria um novo produto para um agricultor específico, recebendo os dados do produto no corpo da requisição e retornando o ID do produto criado ou uma mensagem de erro em caso de falha, permitindo que os agricultores possam cadastrar novos produtos na plataforma
export const getStatistics = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.farmer_id);
    const stats = await productRepository.getStatistics(farmer_id);
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error("Erro no getStatistics (Product):", err);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao buscar estatísticas dos produtos.'
    });
  }
};

// Obtém os tipos de entrega disponíveis, retornando uma lista de tipos de entrega configurados no sistema, permitindo que os agricultores possam escolher entre as opções de entrega disponíveis ao configurar seus métodos de entrega
export const createProduct = async (req: Request, res: Response) => {
  const farmer_id = Number(req.params.farmer_id);
  
  const {
    name, description, price, sale_price, unit_measure,
    product_origin, production_method, status, category_id, images,
  } = req.body;

  // validação básica dos campos obrigatórios
  const camposFaltantes = [];
  
  if (!name || name.trim() === '') camposFaltantes.push('name');
  if (price === undefined || price === null) camposFaltantes.push('price');
  if (!unit_measure || unit_measure.trim() === '') camposFaltantes.push('unit_measure');
  if (!category_id) camposFaltantes.push('category_id');

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Campos obrigatórios ausentes ou inválidos: ${camposFaltantes.join(', ')}.`
    });
  }

  // Validando o array de imagens- deve existir e conter pelo menos uma imagem
  if (!images || images.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Pelo menos uma imagem é obrigatória.',
    });
  }


  // Só abrimos a conexão se os dados estiverem perfeitos
  const connection = await database.getConnection();

  try {
    await connection.beginTransaction();

    const productId = await productRepository.createProduct(connection, {
      name, description, price, sale_price, unit_measure,
      product_origin, production_method, status, farmer_id, category_id
    });

    for (let i = 0; i < images.length; i++) {
      await productRepository.uploadProductImage(
        connection, productId, images[i].image_url, images[i].public_id, i
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso.',
      data: { productId },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro no create (Product):", error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao criar produto.',
    });
  } finally {
    connection.release();
  }
};

// Rota para atualizar apenas o status do produto (ativo/inativo)
export const updateStatusProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.product_id);
    const { status } = req.body;

    await productRepository.updateStatusProduct(productId, status);

    return res.status(200).json({ 
      success: true, 
      message: 'Status do produto atualizado com sucesso.' 
    });
  } catch (error) {
    console.error("Erro no updateStatus (Product):", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao atualizar status do produto.' 
    });
  } 
};

// Rota para deletar um produto por ID
export const removeProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.product_id);
    const deleted = await productRepository.deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produto não encontrado para deleção.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Produto deletado com sucesso.' 
    });
  } catch (error) {
    console.error("Erro no remove (Product):", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao deletar produto.' 
    });
  }
};

// Rota para obter um produto por ID, incluindo informações do agricultor, métodos de pagamento e entrega, e distância se lat/lng forem fornecidos
export const getByIdProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await productRepository.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Produto não encontrado.' 
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Erro no getById (Product):", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao buscar produto.' 
    });
  }
};

// Rota para atualizar um produto por ID, incluindo lógica para remoção de imagens do Cloudinary que foram deletadas no frontend
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const data = req.body;

    const currentProduct = await productRepository.getProductById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado.',
      });
    }

    const currentImages = currentProduct.images || [];
    const incomingImages = data.images || [];

    const removedImages = currentImages.filter(
      (currentImg) => !incomingImages.some(
        (incomingImg: any) => incomingImg.public_id === currentImg.public_id
      )
    );

    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map(async (img) => {
          try {
            await cloudinary.uploader.destroy(String(img.public_id));
          } catch (error) {
            console.error('Erro ao remover imagem Cloudinary:', img.public_id);
          }
        })
      );
    }

    await productRepository.updateProduct(productId, data);

    return res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso.',
    });
  } catch (error) {
    console.error("Erro no update (Product):", error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao atualizar produto.',
    });
  }
};

// Busca produtos próximos com filtros de distância, preço, categoria e busca textual, além de paginação
export const getNearbyProducts = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, priceMaximum, priceMinimum, categoriaId, search, page = '1', limit = '10' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude e longitude são obrigatórias."
      });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude ou longitude inválidas."
      });
    }
    // Tratando os filtros opcionais
    const radiusKm = radius !== undefined ? Number(radius) : 30;
    const minPrice = priceMinimum !== undefined ? Number(priceMinimum) : undefined;
    const maxPrice = priceMaximum !== undefined ? Number(priceMaximum) : undefined;
    const categoryId = categoriaId !== undefined ? Number(categoriaId) : undefined;
    
    // Tratando o termo de busca
    const searchTerm = search ? String(search) : undefined;
    
    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const offset = (pageNumber - 1) * limitNumber;

    const { data, total } = await productRepository.getNearbyProducts(
      userLat, userLng, radiusKm, limitNumber, 
      offset, minPrice, maxPrice, categoryId, searchTerm 
    );

    return res.status(200).json({
      success: true,
      data: {
        items: data,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber)
        }
      }
    });
  } catch (error) {
    console.error("Erro no getNearby (Product):", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar produtos próximos."
    });
  }
};

// Função auxiliar para calcular distância entre dois pontos geográficos usando a fórmula de Haversine
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Função para buscar dados completos do produto, incluindo informações do agricultor, métodos de pagamento e entrega, 
// e calcular distância se lat/lng forem fornecidos
export const getFullDataProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false, message: "ID do produto é obrigatório."
      });
    }

    const product = await productRepository.getProductById(Number(id));

    if (!product) {
      return res.status(404).json({
        success: false, message: "Produto não encontrado."
      });
    }

    const farmer_id = Number(product.farmer_id);
    // Buscando dados do agricultor, métodos de pagamento e entrega em paralelo para otimizar performance
    const [farmer, paymentMethods, deliveryMethods] = await Promise.all([
      farmerRepository.getFarmerById(farmer_id),
      paymentRepository.getByFarmerId(farmer_id),
      deliveryRepository.getDeliveryMethodsByFarmerId(farmer_id)
    ]);

    let farmerLat: number | null = null;
    let farmerLng: number | null = null;

    // Verificando se o agricultor tem endereço e extraindo lat/lng para cálculo de distância
    if (farmer?.address) {
      // Considerando que o agricultor pode ter múltiplos endereços, vamos pegar o principal ou o primeiro disponível
      if (Array.isArray(farmer.address)) {
        const primary = farmer.address.find((addr: any) => addr.is_primary) || farmer.address[0];
        if (primary) {
          farmerLat = Number(primary.latitude);
          farmerLng = Number(primary.longitude);
        }
      } else {
        farmerLat = Number(farmer.address.latitude);
        farmerLng = Number(farmer.address.longitude);
      }
    }

    let distanceKm: number | null = null;

    if (lat && lng && farmerLat && farmerLng) {
      distanceKm = calcularDistanciaKm(Number(lat), Number(lng), farmerLat, farmerLng);
      distanceKm = Number(distanceKm.toFixed(1));
    }

    return res.status(200).json({
      success: true,
      data: {
        product: {
          ...product,
          distance_km: distanceKm
        },
        farmer,
        paymentMethods,
        deliveryMethods
      }
    });

  } catch (error) {
    console.error("Erro no getFullData (Product):", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar dados completos do produto."
    });
  }
};

// Rota para remover uma imagem do Cloudinary associada a um produto
export const removeCloudinaryImageProduct = async (req: Request, res: Response) => {
  try {
    const publicId = req.params.public_id;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'publicId é obrigatório.',
      });
    }

    const result = await cloudinary.uploader.destroy(String(publicId));

    if (result.result.toUpperCase() === 'OK') {
      return res.status(200).json({
        success: true,
        message: 'Imagem removida com sucesso.',
      });
    } else {
       return res.status(400).json({
        success: false,
        message: 'Falha ao remover imagem do servidor externo.',
      });
    }
  } catch (error) {
    console.error("Erro no removeCloudinaryImage:", error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao deletar imagem.',
    });
  }
};

// Rota para buscar produtos de um agricultor para exibição na vitrine, com paginação e validação de parâmetros
export const getShowcaseProducts = async (req: Request, res: Response) => {
  try {
    const farmer_id = Number(req.params.farmer_id);

    if (isNaN(farmer_id)) {
      return res.status(400).json({
        success: false,
        message: "ID do agricultor inválido."
      });
    }

    // 1. Extração e validação dos parâmetros de paginação (com valores padrão)
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 20); // Padrão: 20 produtos por página
    const offset = (page - 1) * limit;

    const farmer = await farmerRepository.getFarmerById(farmer_id);

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Agricultor não encontrado."
      });
    }

    // 2. Chamada ao repositório repassando os limites para a subquery
    const products = await productRepository.getShowcaseProducts(farmer_id, limit, offset);

    // 3. Resposta enriquecida com os metadados de paginação
    return res.status(200).json({
      success: true,
      data: {
        farmer: {
          id: farmer.id,
          first_name: farmer.first_name,
          display_name: farmer.display_name,
          profession: farmer.profession,
          phone: farmer.phone,
          city: farmer.city
        },
        products: products.data,
        pagination: {
          total_items: products.total,
          current_page: page,
          limit_per_page: limit,
          total_pages: Math.ceil(products.total / limit)
        }
      }
    });

  } catch (error) {
    console.error("Erro no getShowcaseProducts (Product):", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao buscar produtos da vitrine."
    });
  }
};

export default {
  getByFarmerIdProduct,
  createProduct,
  updateStatusProduct,
  removeProduct,
  getByIdProduct,
  updateProduct,
  getNearbyProducts,
  getFullDataProduct,
  removeCloudinaryImageProduct,
  getStatistics,
  getShowcaseProducts
};
