const autocannon = require('autocannon');
const { faker } = require('@faker-js/faker');

const TOKEN_DE_TESTE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJuYXRhbmFlbC5yb2NoYUBnbWFpbC5jb20iLCJpYXQiOjE3ODA0NTAwNzYsImV4cCI6MTc4MDQ1MDk3Nn0.efClQSzzYBkUDzLhSmsGH6yHxjNAZ9gVhOfkI3BXFeM';

console.log("Iniciando o bombardeio na API AgroFamilia...");

const instance = autocannon({
  url: 'http://localhost:4000/products/create/2',
  connections: 50, // Vai simular a criação de 50 produtos clicando em "Salvar" ao mesmo tempo
  duration: 30,    // O teste vai durar 30 segundos ininterruptos
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${TOKEN_DE_TESTE}`,
    'Content-type': 'application/json'
  },
  setupClient: (client) => {
    // Geramos um produto completamente aleatório para cada requisição
    const produtoFake = {
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      sale_price: parseFloat(faker.commerce.price()),
      unit_measure: 'kg',
      category_id: 1, 
      images: [{ image_url: faker.image.url() }] // Passando a imagem para não dar erro 400!
    };
    
    // Injeta os dados falsos no corpo da requisição
    client.setBody(JSON.stringify(produtoFake));
  }
}, (err, result) => {
  if (err) {
    console.error("Deu ruim no teste:", err);
  } else {
    console.log("\n✅ Teste Concluído!");
    console.log(`Total de requisições disparadas: ${result.requests.total}`);
    console.log(`Média de requisições por segundo: ${result.requests.average}`);
    console.log(`Tempo médio de resposta: ${result.latency.average} ms`);
    console.log(`Erros ou falhas: ${result.errors}`);
  }
});

autocannon.track(instance, { renderProgressBar: true });