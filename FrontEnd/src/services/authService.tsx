import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginData {
  email: string;
  password: string;
}

// Função para login, que envia as credenciais e recebe o token de acesso e o refresh token, armazenando o token de acesso
export const login = async (data: LoginData) => {
  const response = await axios.post(
    `${API_URL}/auth/login`,
    data,
    {
      withCredentials: true
    }
  );

  return response.data;
};

// Função para logout, que revoga o refresh token no backend e remove o token de acesso 
export const logout = async () => {
  try {
    await axios.post(
      `${API_URL}/auth/revoke`,
      {},
      { withCredentials: true }
    );
  } finally {
    localStorage.removeItem("farmer_token");
    localStorage.removeItem("user");
  }
};

// Função para refresh, que solicita um novo token de acesso usando o refresh token armazenado como cookie HTTP-only
export const refresh = async () => {
  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    {
      withCredentials: true
    }
  );

  return response.data;
};