

import api from "./api";
import type { Farmer, FarmerUpdate } from "../Models/Models";

// Registrar um Agricultor
export const postFarmer = async (dados: Farmer) => {
  const response = await api.post('/farmer', dados);
  return response.data;
};

// Retornar dados do Agricultor
export const getFarmerMe = async () => {
  const response = await api.get('/farmer/me');
  return response.data;
};

// Atualizar dados do Agricultor
export const patchFarmer = async (dados: FarmerUpdate) => {
  const response = await api.patch('/farmer', dados);

  return response.data;
};

// Deletar um Agricultor
export const deleteFarmer = async (id: number) => {
  const response = await api.delete(`/farmer/${id}`);

  return response.data;
};
