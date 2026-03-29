import axios from 'axios';

// Função para buscar informações do CEP usando a API ViaCEP
export const buscarCep = async (cep: string) => {
  const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
  if (response.data.erro) {
    throw new Error('CEP não encontrado');
  }
  return response.data;
};


//busca a latitude e longitude de um endereço usando a API do OpenCageData
export const buscarLatLngPorEndereco = async (endereco: any) => {
  const enderecoFormatado = `${endereco.street}, ${endereco.neighborhood}, ${endereco.city}, ${endereco.state}, Brasil`;

  const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
    params: {
      q: enderecoFormatado,
      key: import.meta.env.VITE_CHAVE_CAPTURA_LOCAL,
    }
  });

  if (response.data.status.code !== 200) {
    throw new Error('Não foi possível obter as coordenadas');
  }

 
  const { lat, lng } = response.data.results[0].geometry;
  return { lat, lng };
};