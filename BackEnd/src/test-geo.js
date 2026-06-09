// Exemplo de teste da rota espacial (test-geo.js)
const autocannon = require('autocannon');
const { faker } = require('@faker-js/faker');


console.log("Simulando 50 consumidores navegando na vitrine...");

const instance = autocannon({
  // Supondo que sua rota receba lat e lng para calcular o raio
  url: 'http://localhost:4000/products?lat=-14.9684346&lng=-42.3522247&radius=100&limit=12&page=1',
  connections: 50,
  duration: 30,
  method: 'GET'
}, (err, result) => {
  if (err) console.error(err);
  else {
    console.log(`\n✅ Vitrine Testada!`);
    console.log(`Média de requisições/seg: ${result.requests.average}`);
    console.log(`Tempo médio de resposta (Latência): ${result.latency.average} ms`);
  }
});

autocannon.track(instance, { renderProgressBar: true });