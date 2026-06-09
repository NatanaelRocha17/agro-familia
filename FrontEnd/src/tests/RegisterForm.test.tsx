
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterForm } from '../pages/RegisterForm'; // Ajuste o caminho se necessário
import { toast } from 'sonner';
import { buscarCep } from '../services/locationService';

// --- MOCKS ---
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../services/farmer', () => ({
  postFarmer: vi.fn().mockResolvedValue({}),
}));

vi.mock('../services/locationService', () => ({
  buscarCep: vi.fn().mockResolvedValue({
    logradouro: 'Rua das Flores',
    bairro: 'Centro',
    localidade: 'Vitória da Conquista',
    uf: 'BA'
  }),
  buscarLatLngPorEndereco: vi.fn().mockResolvedValue({ lat: -14.8661, lng: -40.8394 }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

// --- HELPER PARA SELEÇÃO DE ELEMENTOS ---
// Como os inputs não possuem 'id' ou 'name', buscamos o elemento logo após a label
const getInputByLabel = (labelText: RegExp | string) => {
  const label = screen.getByText(labelText);
  const nextElement = label.nextElementSibling as HTMLElement;
  
  // Se for um input direto (maioria dos campos)
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(nextElement.tagName)) {
    return nextElement as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  }
  // Se estiver dentro de uma div (como os campos de senha com ícone de olho)
  return nextElement.querySelector('input') as HTMLInputElement;
};

describe('FarmerRegister - Testes Completos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. deve renderizar as seções principais do formulário', () => {
    render(<RegisterForm />);
    
    expect(screen.getByText('Dados Pessoais')).toBeInTheDocument();
    expect(screen.getByText('Atividade Rural')).toBeInTheDocument();
    expect(screen.getByText('Localização da Propriedade')).toBeInTheDocument();
    expect(screen.getByText('Dados de Acesso')).toBeInTheDocument();
  });

  it('2. deve aplicar máscaras de CPF e Telefone enquanto o usuário digita', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const inputCpf = getInputByLabel(/CPF \*/i);
    const inputPhone = getInputByLabel(/Telefone \*/i);

    await user.type(inputCpf, '12345678901');
    await user.type(inputPhone, '77999998888');
    
    expect(inputCpf).toHaveValue('123.456.789-01');
    expect(inputPhone).toHaveValue('(77) 99999-8888');
  });

  it('3. deve bloquear submissão e exibir erro se as senhas não coincidirem', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const inputPassword = getInputByLabel(/^Senha \*/i);
    const inputConfirm = getInputByLabel(/Confirmar Senha \*/i);
    const submitButton = screen.getByRole('button', { name: /Finalizar Meu Cadastro/i });

    await user.type(inputPassword, 'SenhaForte123');
    await user.type(inputConfirm, 'SenhaDiferente123');
    
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('As senhas não coincidem');
    });
  });

  it('4. deve bloquear submissão e exibir erro se a senha tiver menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const inputPassword = getInputByLabel(/^Senha \*/i);
    const inputConfirm = getInputByLabel(/Confirmar Senha \*/i);
    const submitButton = screen.getByRole('button', { name: /Finalizar Meu Cadastro/i });

    // Senhas iguais, mas curtas (7 caracteres)
    await user.type(inputPassword, '1234567');
    await user.type(inputConfirm, '1234567');
    
    // 🔥 Mudança aqui também
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('A senha deve ter pelo menos 8 caracteres');
    });
  });

  it('5. deve buscar o endereço automaticamente quando o CEP for totalmente preenchido', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);
    
    const inputCep = getInputByLabel(/CEP \*/i);
    
    // Digita um CEP válido simulando o usuário
    await user.type(inputCep, '45000000');
    
    // Verifica se a máscara foi aplicada no input
    expect(inputCep).toHaveValue('45000-000');

    // Verifica se o serviço de buscar CEP foi chamado após digitar os 8 números
    await waitFor(() => {
      expect(buscarCep).toHaveBeenCalledWith('45000-000');
    });
  });
});