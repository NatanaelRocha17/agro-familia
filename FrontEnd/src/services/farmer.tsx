

import api from "./api";
import type { Farmer, FarmerUpdate } from "../Models/Models";

// Registrar um Agricultor
export const postFarmer = async (dados: Farmer) => {
  const response = await api.post('/agricultores', dados);
  return response.data;
};

// Retornar dados do Agricultor
export const getFarmerMe = async () => {
  const response = await api.get('/agricultores/me');
  return response.data;
};

// Atualizar dados do Agricultor
export const putchFarmer = async (dados: FarmerUpdate) => {
  const response = await api.patch('/agricultores', dados);

  return response.data;
};

// Deletar um Agricultor
export const deleteFarmer = async (id: number) => {
  const response = await api.delete(`/agricultores/${id}`);

  return response.data;
};
