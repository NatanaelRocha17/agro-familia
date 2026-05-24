import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.121:3000",
  withCredentials: false // auxiliar no cookie do refresh
});

// 🔹 Adiciona o access token em TODAS requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("farmer_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Controle de refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se falhou no refresh → desloga direto
    if (originalRequest.url?.includes("/auth/refresh")) {
      localStorage.removeItem("farmer_token");
      window.location.href = "agricultor/login";
      console.log("401 detectado", originalRequest.url);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        //NÃO precisa enviar refresh token (cookie já vai automático)
        const res = await api.post("/auth/refresh");

        const newToken = res.data.accessToken;

        // salva novo access token
        localStorage.setItem("farmer_token", newToken);

        // atualiza header global
        api.defaults.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        // refaz a requisição original
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);

        localStorage.removeItem("farmer_token");
        window.location.href = "agricultor/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;