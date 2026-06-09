import { Request, Response } from "express";

// Importando dependências que serão "mockadas" (falsificadas para o teste)
import farmerRepository from "./repositories/farmerRepository";
import deliveryRepository from "./repositories/deliveryRepository";
import cloudinary from "./config/cloudinary";

import {
  createFarmer,
  getMeFarmer,
  removeFarmer,
} from "./controllers/farmerController";
import {
  getTypesDelivery,
  removeDelivery,
} from "./controllers/deliveryController";
import {
  createProduct,
  getNearbyProducts,
  removeCloudinaryImageProduct,
} from "./controllers/productController";

// Avisando ao Jest para simular (mockar) esses arquivos inteiros
jest.mock("./repositories/farmerRepository");
jest.mock("./repositories/deliveryRepository");
jest.mock("./config/database", () => ({
  getConnection: jest.fn().mockResolvedValue({
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
  }),
}));
jest.mock("./config/cloudinary", () => ({
  uploader: {
    destroy: jest.fn(),
  },
}));

// Função auxiliar para simular o objeto Response do Express
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Suíte de Testes - Controladores AgroFamilia", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Limpa o histórico dos mocks antes de cada teste
  });

  // ==========================================
  // TESTES DO FARMER CONTROLLER
  // ==========================================
  describe("Farmer Controller", () => {
    it("1. createFarmer: Deve retornar 400 (Fail-fast) se as senhas não conferirem", async () => {
      const req = {
        body: { password: "senha123", confirm_password: "senhaDiferente" },
      } as Request;
      const res = mockResponse();

      await createFarmer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "As senhas não conferem.",
      });
    });

    it("2. getMeFarmer: Deve retornar 200 e remover o password_hash da resposta", async () => {
      const mockFarmer = { id: 1, name: "João", password_hash: "hash_secreto" };
      (farmerRepository.getFarmerById as jest.Mock).mockResolvedValue(
        mockFarmer,
      );

      const req = { user: { id: 1 } } as any; // Simulando o req.user injetado pelo middleware
      const res = mockResponse();

      await getMeFarmer(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: "João" }, // Garante que o password_hash não vazou
      });
    });

    it("3. removeFarmer: Deve retornar 404 se o agricultor não for encontrado para deleção", async () => {
      (farmerRepository.deleteFarmer as jest.Mock).mockResolvedValue(false); // Finge que não deletou nada

      const req = { params: { id: "99" } } as any;
      const res = mockResponse();

      await removeFarmer(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Agricultor não encontrado para deleção.",
      });
    });
  });

  // ==========================================
  // TESTES DO DELIVERY CONTROLLER
  // ==========================================
  describe("Delivery Controller", () => {
    it("4. getTypesDelivery: Deve retornar 200 e a lista de tipos de entrega", async () => {
      const mockTypes = [{ id: 1, name: "Retirada no local" }];
      (deliveryRepository.getDeliveryTypes as jest.Mock).mockResolvedValue(
        mockTypes,
      );

      const req = {} as Request;
      const res = mockResponse();

      await getTypesDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTypes,
      });
    });

    it("5. removeDelivery: Deve retornar 200 ao deletar um método de entrega com sucesso", async () => {
      (deliveryRepository.deleteDeliveryMethod as jest.Mock).mockResolvedValue(
        true,
      );

      const req = { params: { id: "1" } } as any;
      const res = mockResponse();

      await removeDelivery(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Método de entrega deletado com sucesso.",
      });
    });
  });

  // ==========================================
  // TESTES DO PRODUCT CONTROLLER
  // ==========================================
  describe("Product Controller", () => {
    it("6. createProduct: Deve retornar 400 se o array de imagens estiver vazio ou ausente", async () => {
      const req = {
        params: { farmer_id: "1" },
        body: {
          name: "Alface",
          price: 2.5,
          unit_measure: "kg",
          category_id: 1,
          images: [],
        }, // Imagens vazias
      } as any;
      const res = mockResponse();

      await createProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Pelo menos uma imagem é obrigatória.",
      });
    });

    it("7. getNearbyProducts: Deve retornar 400 se latitude ou longitude não forem enviadas", async () => {
      const req = { query: { radius: "10" } } as any; // Faltando lat e lng
      const res = mockResponse();

      await getNearbyProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Latitude e longitude são obrigatórias.",
      });
    });

    it("8. getNearbyProducts: Deve retornar 400 se latitude ou longitude forem inválidas (letras)", async () => {
      const req = { query: { lat: "abc", lng: "def" } } as any;
      const res = mockResponse();

      await getNearbyProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Latitude ou longitude inválidas.",
      });
    });

    it("9. removeCloudinaryImageProduct: Deve retornar 400 se o public_id não for enviado", async () => {
      const req = { params: {} } as any; // Faltando public_id na rota
      const res = mockResponse();

      await removeCloudinaryImageProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "publicId é obrigatório.",
      });
    });

    it("10. removeCloudinaryImageProduct: Deve retornar 400 se o Cloudinary não retornar status OK", async () => {
      // Simulando uma resposta de falha da API externa do Cloudinary
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
        result: "not found",
      });

      const req = { params: { public_id: "img_12345" } } as any;
      const res = mockResponse();

      await removeCloudinaryImageProduct(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Falha ao remover imagem do servidor externo.",
      });
    });
  });
});
