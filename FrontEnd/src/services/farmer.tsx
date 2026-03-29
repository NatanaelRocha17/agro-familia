import axios from "axios";

import api from "./api";
import type { Farmer, FarmerUpdate } from "../Models/Models";


export const postFarmer = async (dados: Farmer) => {
  const response = await api.post('/agricultores', dados);
  return response.data;
};

export const getFarmerMe = async () => {
  const response = await api.get('/agricultores/me');
  return response.data;
};


export const putchFarmer = async (dados: FarmerUpdate) => {
  const token = localStorage.getItem('farmer_token'); 

  const response = await axios.patch('http://localhost:3000/agricultores', dados, 
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};


export const deleteFarmer = async (id: number) => {
  const token = localStorage.getItem('farmer_token');
  console.log("token recebido para exclusão (frontend):", token);
  const response = await axios.delete(`http://localhost:3000/agricultores/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};
