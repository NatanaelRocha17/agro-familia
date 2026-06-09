import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductForm, base64ToFile } from '../pages/ProductForm'; // Ajuste o caminho
import { toast } from 'sonner';

// Mocks necessários
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: undefined }),
}));

vi.mock('../services/product', () => ({
  getAllCategories: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn(),
  uploadProductImage: vi.fn().mockResolvedValue({ image_url: 'http://test.com/img.png' }),
}));

// Mock do Toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

describe('ProductForm - Testes Completos', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. (Seu teste)
  it('deve validar nome obrigatório ao tentar salvar', async () => {
    render(<ProductForm />);
    const submitButton = screen.getByRole('button', { name: /Cadastrar Produto/i });
    fireEvent.click(submitButton);
    
    const errorMessage = await screen.findByText(/Nome é obrigatório/i);
    expect(errorMessage).toBeInTheDocument();
  });

  // 2. (Seu teste)
  it('deve formatar o valor do preço corretamente', async () => {
    render(<ProductForm />);
    const priceInput = screen.getByLabelText(/Preço Normal/i) as HTMLInputElement;
    fireEvent.change(priceInput, { target: { value: '1000' } });
    
    await waitFor(() => {
      const val = priceInput.value.replace(/\u00A0/g, ' ');
      expect(val).toBe('R$ 10,00');
    });
  });

  // 3. (Seu teste)
  it('deve alternar status do produto', async () => {
    render(<ProductForm />);
    const select = screen.getByLabelText(/Status do Produto/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '0' } });
    expect(select.value).toBe('0');
  });

  // 4. (NOVO) Teste de Função Pura
  it('deve converter uma string base64 em um objeto File válido', () => {
    const base64String = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const file = base64ToFile(base64String, "teste.png");
    
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("teste.png");
    expect(file.type).toBe("image/png");
  });

  // 5. (NOVO) Regra de Negócio de Imagens
  it('deve disparar um toast de erro se tentar salvar sem adicionar imagens', async () => {
    render(<ProductForm />);
    
    // Preenche o nome para passar da primeira validação do validateForm()
    const nameInput = screen.getByLabelText(/Nome do Produto \*/i);
    await userEvent.type(nameInput, 'Cenoura Orgânica');
    
    const submitButton = screen.getByRole('button', { name: /Cadastrar Produto/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Adicione pelo menos uma imagem");
    });
  });
});