import client from 'prom-client';
import { Express } from 'express';

// 1. Limpa o registro global para garantir estado limpo a cada reinicialização
// Isso evita o erro: "A metric with the name ... has already been registered"
client.register.clear();

// 2. Coleta métricas padrão do Node.js (CPU, memória, etc.)
// Chamamos aqui uma única vez após limpar o registro
client.collectDefaultMetrics();

// 3. Definição das suas métricas personalizadas
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status']
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5]
});

// 4. Função de configuração do monitoramento
export function setupMonitoring(app: Express) {
  // Middleware para medir cada requisição
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      // Trata a rota para não ficar poluída com IDs de banco de dados
      const route = req.route ? req.route.path : req.path;
      
      httpRequestCounter.inc({ 
        method: req.method, 
        route: route, 
        status: res.statusCode.toString() 
      });
      
      httpRequestDuration.observe({ 
        method: req.method, 
        route: route, 
        status: res.statusCode.toString() 
      }, duration);
    });
    
    next();
  });

  // Rota de exposição das métricas para o Prometheus
  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } catch (err) {
      res.status(500).send(err);
    }
  });
} 