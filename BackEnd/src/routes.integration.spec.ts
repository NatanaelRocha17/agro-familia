import request from "supertest";
import jwt from "jsonwebtoken";
import app from "./app";

// Mocks
import farmerRepository from "./repositories/farmerRepository";
import productRepository from "./repositories/productRepository";
import deliveryRepository from "./repositories/deliveryRepository";

jest.mock("./repositories/farmerRepository");
jest.mock("./repositories/productRepository");
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

// Gera um token real para os testes
const gerarTokenValido = (userId: number = 1) => {
  const secret = process.env.JWT_SECRET || "secret_de_teste_super_seguro";
  return jwt.sign({ id: userId }, secret, { expiresIn: "1h" });
};

describe("Testes de Integração com Autenticação Real - AgroFamilia", () => {
  let tokenAutenticado: string;

  beforeAll(() => {
    tokenAutenticado = gerarTokenValido(1);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // ROTAS DE AGRICULTOR (/agricultores)
  // ==========================================
  describe("Integração: Rotas de Agricultor", () => {
    it("GET /farmer/me - Deve retornar 401 se a requisição não enviar o token", async () => {
      const response = await request(app).get("/farmer/me");
      expect(response.status).toBe(401);
    });

    it("GET /farmer/me - Deve passar pelo Middleware com token válido", async () => {
      const mockFarmer = {
        id: 1,
        name: "João Batista",
        email: "joao@roca.com",
      };
      (farmerRepository.getFarmerById as jest.Mock).mockResolvedValue(
        mockFarmer,
      );

      const response = await request(app)
        .get("/farmer/me")
        .set("Authorization", `Bearer ${tokenAutenticado}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("João Batista");
    });

    it("POST /farmer - Rota pública deve cadastrar agricultor sem exigir token", async () => {
      (farmerRepository.createFarmer as jest.Mock).mockResolvedValue(15);

      const novoAgricultor = {
        name: "Maria Clara",
        password: "senha123",
        confirm_password: "senha123",
      };

      const response = await request(app)
        .post("/farmer")
        .send(novoAgricultor);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(15);
    });
  });

  // ==========================================
  // ROTAS DE ENTREGA (/delivery)
  // ==========================================
  describe("Integração: Rotas de Entrega", () => {
    it("GET /delivery - Rota pública deve listar os tipos de entrega sem token", async () => {
      const mockTypes = [{ id: 1, name: "Entrega a Domicílio" }];
      (deliveryRepository.getDeliveryTypes as jest.Mock).mockResolvedValue(
        mockTypes,
      );

      const response = await request(app).get("/delivery");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockTypes);
    });

    it("POST /delivery/farmer/:id - Deve criar método de entrega quando autenticado", async () => {
      (deliveryRepository.createDeliveryMethod as jest.Mock).mockResolvedValue(
        1,
      );

      const novaEntrega = { type_id: 1, tax: 5.0 };

      const response = await request(app)
        .post("/delivery/farmer/1")
        .set("Authorization", `Bearer ${tokenAutenticado}`)
        .send(novaEntrega);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Método de entrega criado com sucesso.",
      );
    });
  });

  // ==========================================
  // ROTAS DE PRODUTO (/produtos)
  // ==========================================
  describe("Integração: Rotas de Produto", () => {
    it("POST /product/cadastrar/:farmer_id - Deve barrar cadastro se não estiver logado", async () => {
      const payload = {
        name: "Tomate",
        price: 5.5,
        unit_measure: "kg", 
        category_id: 1, 
        images: [{ image_url: "url" }],
      };

      const response = await request(app)
        .post("/produtos/cadastrar/1")
        .send(payload);

      expect(response.status).toBe(401);
    });
    
    it("POST /produtos/cadastrar/:farmer_id - Deve retornar 400 se o array de imagens estiver vazio ou ausente", async () => {
      
      // 1. Criamos o payload (corpo da requisição) EXATAMENTE como o frontend enviaria
      const payloadInvalido = {
        name: "Alface",
        price: 2.5,
        unit_measure: "kg", 
        category_id: 1, 
        images: [], 
      };

      // 2. Usamos o Supertest para fazer uma requisição POST de verdade
      const response = await request(app)
        .post("/produtos/cadastrar/1")
        .set("Authorization", `Bearer ${tokenAutenticado}`)
        .send(payloadInvalido);

      // 3. Verificamos se a API respondeu corretamente com o erro 400
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Pelo menos uma imagem é obrigatória.");
    });

    it("DELETE /produtos/deletar/:product_id - Deve excluir produto autenticado com sucesso", async () => {
      (productRepository.deleteProduct as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .delete("/produtos/deletar/99")
        .set("Authorization", `Bearer ${tokenAutenticado}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Produto deletado com sucesso.");
    });
  });
});
