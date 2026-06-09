const autocannon = require('autocannon');

console.log("Simulando 100 consumidores navegando na vitrine...");

const instance = autocannon({
  url: 'http://localhost:4000/products', // Sua rota de listagem (GET)
  connections: 100, // Dobro de conexões para simular leituras
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