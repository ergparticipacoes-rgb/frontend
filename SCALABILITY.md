# Guia de Escalabilidade - Sistema Litoral

Este documento descreve as técnicas escaláveis implementadas no sistema Litoral para suportar alta carga e crescimento.

## 🚀 Técnicas Implementadas

### 1. **Clustering e Load Balancing**
- **Node.js Clustering**: Utiliza todos os cores da CPU
- **Nginx Load Balancer**: Distribui requisições entre múltiplas instâncias
- **Docker Compose**: Orquestração de múltiplos containers
- **Kubernetes**: Deploy escalável em produção

### 2. **Cache Distribuído**
- **Redis**: Cache distribuído para sessões e dados
- **Smart Cache**: Cache inteligente com invalidação automática
- **Cache por Rota**: TTL específico para diferentes endpoints
- **Cache de API**: Reduz carga no banco de dados

### 3. **Rate Limiting Distribuído**
- **Rate Limiter Flexible**: Controle avançado de taxa
- **Limites por Endpoint**: Diferentes limites para cada rota
- **Limites por Usuário**: Controle baseado em IP e usuário
- **Fallback para Memória**: Funciona mesmo sem Redis

### 4. **Monitoramento e Observabilidade**
- **Health Checks**: Verificação de saúde dos serviços
- **Métricas de Performance**: CPU, memória, cache
- **Logs Estruturados**: Logging otimizado por ambiente
- **Graceful Shutdown**: Encerramento seguro dos processos

## 📦 Opções de Deploy

### Opção 1: Docker Compose (Desenvolvimento/Staging)

```bash
# 1. Construir as imagens
docker-compose build

# 2. Iniciar todos os serviços
docker-compose up -d

# 3. Verificar status
docker-compose ps

# 4. Ver logs
docker-compose logs -f api-server-1

# 5. Escalar serviços
docker-compose up -d --scale api-server-1=3 --scale api-server-2=3
```

**Serviços incluídos:**
- 2x API Servers (Node.js)
- 1x Frontend (React + Nginx)
- 1x Load Balancer (Nginx)
- 1x Redis (Cache)
- 1x MongoDB (Banco)

### Opção 2: PM2 (Produção Simples)

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Instalar dependências
cd server && npm install --production

# 3. Iniciar com PM2
pm2 start ecosystem.config.js --env production

# 4. Monitorar
pm2 monit

# 5. Ver logs
pm2 logs litoral-api

# 6. Restart graceful
pm2 reload litoral-api
```

### Opção 3: Kubernetes (Produção Escalável)

```bash
# 1. Aplicar configurações
kubectl apply -f k8s-deployment.yaml

# 2. Verificar pods
kubectl get pods -n litoral

# 3. Verificar serviços
kubectl get services -n litoral

# 4. Escalar manualmente
kubectl scale deployment litoral-api --replicas=5 -n litoral

# 5. Ver logs
kubectl logs -f deployment/litoral-api -n litoral

# 6. Port forward para teste
kubectl port-forward service/nginx-lb-service 8080:80 -n litoral
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente Principais

```bash
# Aplicação
NODE_ENV=production
PORT=5000
ENABLE_CLUSTERING=true

# Banco de Dados
MONGODB_URI=mongodb://localhost:27017/litoral

# Cache Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=1000

# Cache TTL (segundos)
CACHE_TTL_PROPERTIES=300     # 5 minutos
CACHE_TTL_NEWS=600          # 10 minutos
CACHE_TTL_USERS=1800        # 30 minutos
```

## 📊 Monitoramento

### Endpoints de Monitoramento

- **Health Check**: `GET /health`
- **Métricas**: `GET /metrics`
- **Limpar Cache**: `POST /dev/clear-cache` (apenas desenvolvimento)

### Exemplo de Response do Health Check

```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "worker": "1",
  "pid": 12345,
  "cache": "connected",
  "memory": {
    "used": 128,
    "total": 256
  },
  "uptime": 3600
}
```

## 🎯 Benchmarks e Performance

### Capacidade Estimada

| Configuração | RPS | Usuários Simultâneos | Latência Média |
|--------------|-----|---------------------|----------------|
| Single Instance | 1,000 | 5,000 | 50ms |
| Docker Compose | 5,000 | 25,000 | 30ms |
| Kubernetes (3 pods) | 15,000 | 75,000 | 20ms |
| Kubernetes (10 pods) | 50,000 | 250,000 | 15ms |

### Teste de Carga

```bash
# Usando Apache Bench
ab -n 10000 -c 100 http://localhost/api/properties/featured

# Usando Artillery
npx artillery quick --count 100 --num 1000 http://localhost/api/properties
```

## 🔄 Auto Scaling

### Kubernetes HPA (Horizontal Pod Autoscaler)

- **CPU**: Escala quando uso > 70%
- **Memória**: Escala quando uso > 80%
- **Min Replicas**: 3 (API), 2 (Frontend)
- **Max Replicas**: 10 (API), 5 (Frontend)

### Docker Compose Scaling

```bash
# Escalar API servers
docker-compose up -d --scale api-server-1=5

# Escalar com diferentes configurações
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

## 🛡️ Segurança e Rate Limiting

### Limites por Endpoint

- **API Geral**: 1000 req/15min por IP
- **Login**: 5 req/15min por IP
- **Registro**: 3 req/15min por IP
- **Upload**: 10 req/15min por usuário
- **Busca**: 100 req/15min por IP
- **Criar Propriedade**: 20 req/15min por usuário

### Headers de Segurança

- **CORS**: Configurado para domínios específicos
- **Helmet**: Headers de segurança automáticos
- **Rate Limit Headers**: Informações sobre limites

## 🚨 Troubleshooting

### Problemas Comuns

1. **Redis Desconectado**
   - Verificar se Redis está rodando
   - Sistema funciona com fallback para memória

2. **Alta Latência**
   - Verificar cache hit rate
   - Analisar queries do MongoDB
   - Verificar load balancing

3. **Memory Leaks**
   - Monitorar `/metrics`
   - PM2 restart automático em 1GB
   - Kubernetes limits configurados

### Comandos Úteis

```bash
# Ver uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f --tail=100

# Conectar ao Redis
docker exec -it litoral_redis_1 redis-cli

# Backup do MongoDB
docker exec litoral_mongodb_1 mongodump --out /backup

# Verificar conexões ativas
ss -tuln | grep :5000
```

## 📈 Próximos Passos

1. **CDN**: Implementar CloudFlare ou AWS CloudFront
2. **Database Sharding**: Particionar MongoDB
3. **Microservices**: Separar em serviços menores
4. **Message Queue**: Implementar Redis Pub/Sub ou RabbitMQ
5. **Elasticsearch**: Para busca avançada
6. **Prometheus + Grafana**: Monitoramento avançado

---

**Desenvolvido com foco em escalabilidade e performance** 🚀