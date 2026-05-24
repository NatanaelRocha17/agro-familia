import type { GetAllCategories, Product } from "../Models/Models";

import api from "./api";

type PaginatedProducts = {
  data: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

interface UploadedImage {
  image_url: string;
  public_id: string;
}

// Função para obter produtos por ID do agricultor com paginação
export const getProductsByFarmerId = async (
  farmer_id: number,
  page = 1,
  limit = 10,
): Promise<PaginatedProducts> => {
  const response = await api.get(
    `/produtos/agricultor/${farmer_id}?page=${page}&limit=${limit}`,
  );

  return response.data;
};

// Função para obter um produto por ID
export const getProductsById = async (id: number): Promise<Product> => {
  const response = await api.get(`/produtos/${id}`);
  console.log("Resposta da API:", response.data);
  return response.data;
};

// Função para enviar as imagens dos produtos para o cloudinary
export const uploadProductImage = async (
  imageFile: File,
): Promise<UploadedImage> => {
  const formData = new FormData();

  formData.append("file", imageFile);
  formData.append("upload_preset", "agro_upload");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/df6ej3s8g/image/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    throw new Error("Erro ao enviar imagem");
  }

  const data = await res.json();

  console.log("Resposta do Cloudinary:", data);
  return {
    image_url: data.secure_url,
    public_id: data.public_id,
  };
};

/*export const deleteProductImage = async (publicId: string) => {

  const response = await api.delete(`/produtos/imagem/${publicId}`);

  return response.data;

};*/

// Função para criar um novo produto
export const createProduct = async (
  farmer_id: number,
  productData: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product> => {
  const response = await api.post(
    `/produtos/cadastrar/${farmer_id}`,
    productData,
  );
  return response.data;
};

// Função para atualizar o status do produto (ativo/inativo) - ATENÇÃO: esse método é específico para atualizar apenas o status, revise com calma
export const updateProductStatus = async (
  productId: number,
  productData: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<Product> => {
  const response = await api.put(
    `/produtos/atualizarstatus/${productId}`,
    productData,
  );
  return response.data;
};

// Função para deletar um produto por ID
export const deleteProduct = async (productId: number): Promise<boolean> => {
  const response = await api.delete(`/produtos/deletar/${productId}`);
  return response.data;
};

// Função para atualizar um produto por ID (com upload de imagens) - ATENÇÃO: esse método é complexo, revise com calma
export const updateProduct = async (
  productId: number,
  productData: Partial<Omit<Product, "id" | "created_at" | "updated_at">>,
): Promise<any> => {
  const response = await api.put(`/produtos/${productId}`, productData);
  return response.data;
};

// Função para obter produtos próximos com paginação
export const getAllProductsNearby = async (
  lat: number,
  lng: number,
  radius?: number,
  page = 1,
  limit = 10,
  priceMinimum?: number,
  priceMaximum?: number,
  categoriaId?: number,
  searchTerm?: string,
): Promise<any> => {
  const params = new URLSearchParams();

  params.append("lat", String(lat));
  params.append("lng", String(lng));
  params.append("page", String(page));
  params.append("limit", String(limit));

  if (radius !== undefined && !isNaN(radius))
    params.append("radius", String(radius));
  if (priceMinimum !== undefined && !isNaN(priceMinimum))
    params.append("priceMinimum", String(priceMinimum));
  if (priceMaximum !== undefined && !isNaN(priceMaximum))
    params.append("priceMaximum", String(priceMaximum));
  if (categoriaId !== undefined && !isNaN(categoriaId))
    params.append("categoriaId", String(categoriaId));

  // Adicionando o termo de busca na URL
  if (searchTerm && searchTerm.trim() !== "") {
    params.append("search", searchTerm);
  }

  const response = await api.get(`/produtos?${params.toString()}`);
  return response.data;
};

// Função para obter dados completos de um produto, incluindo informações do agricultor com base no ID do produto e localização do usuário (lat/lng)
export const getFullProductData = async (
  product_id: number,
  lat: number,
  lng: number,
): Promise<any> => {
  const response = await api.get(`/produtos/full/${product_id}`, {
    params: {
      lat,
      lng,
    },
  });

  return response.data;
};

// Função para obter todas as categorias de produtos
export const getAllCategories = async (): Promise<GetAllCategories[]> => {
  console.log("Chamando getAllCategories");
  const response = await api.get(`/categoria`);
  return response.data;
};
