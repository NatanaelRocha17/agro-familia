import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true // necessário pro refresh token
});

// Interceptador para adicionar o token de acesso em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("farmer_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptador para lidar com erros de autenticação e tentar refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (error.response?.status === 401) {
      // Se o erro for 401, tenta fazer refresh do token e repetir a requisição original
      if (error.config.url === "/auth/refresh") {
        localStorage.removeItem("farmer_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await api.post("/auth/refresh");

        const newToken = res.data.accessToken;

        localStorage.setItem("farmer_token", newToken);

        error.config.headers.Authorization = `Bearer ${newToken}`;

        return api(error.config);

      } catch {
        localStorage.removeItem("farmer_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;