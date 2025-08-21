// Configuração PM2 para produção escalável
module.exports = {
  apps: [
    {
      name: 'litoral-api',
      script: './server/src/server.js',
      instances: 'max', // Usar todos os CPUs disponíveis
      exec_mode: 'cluster',
      
      // Configurações de ambiente
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        ENABLE_CLUSTERING: 'false' // PM2 já gerencia clustering
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        ENABLE_CLUSTERING: 'false',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        MONGODB_URI: 'mongodb://localhost:27017/litoral'
      },
      
      // Configurações de performance
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Configurações de restart
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Configurações de log
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Configurações de monitoramento
      pmx: true,
      
      // Configurações de deploy
      source_map_support: true,
      
      // Health check
      health_check_grace_period: 3000,
      
      // Configurações de cluster
      instance_var: 'INSTANCE_ID',
      
      // Configurações de restart graceful
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Variáveis de ambiente específicas
      env_vars: {
        'CLUSTER_WORKER_ID': 'PM2_INSTANCE_ID'
      }
    }
  ],
  
  // Configurações de deploy
  deploy: {
    production: {
      user: 'deploy',
      host: ['server1.example.com', 'server2.example.com'],
      ref: 'origin/main',
      repo: 'git@github.com:username/litoral-project.git',
      path: '/var/www/litoral',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    },
    
    staging: {
      user: 'deploy',
      host: 'staging.example.com',
      ref: 'origin/develop',
      repo: 'git@github.com:username/litoral-project.git',
      path: '/var/www/litoral-staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
};