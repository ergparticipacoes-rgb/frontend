const fetch = require('node-fetch');

// Configuração da API
const API_BASE = 'http://localhost:3002/api';

// Token de administrador (você precisará fazer login primeiro para obter um token válido)
// Para este exemplo, vamos assumir que você tem um token de admin
const ADMIN_TOKEN = 'seu_token_admin_aqui';

const additionalPlans = [
  {
    name: 'Bronze',
    description: 'Plano Bronze ideal para iniciantes no mercado imobiliário',
    maxProperties: 10,
    price: 49.90,
    duration: 30,
    features: [
      'Até 10 imóveis publicados',
      'Suporte por email',
      'Painel básico de controle',
      'Estatísticas básicas'
    ],
    isActive: true
  },
  {
    name: 'Silver',
    description: 'Plano Silver para corretores em crescimento',
    maxProperties: 30,
    price: 99.90,
    duration: 30,
    features: [
      'Até 30 imóveis publicados',
      'Suporte prioritário',
      'Painel avançado de controle',
      'Relatórios detalhados',
      'Destaque em buscas'
    ],
    isActive: true
  },
  {
    name: 'Gold',
    description: 'Plano Gold para profissionais estabelecidos',
    maxProperties: 50,
    price: 149.90,
    duration: 30,
    features: [
      'Até 50 imóveis publicados',
      'Suporte premium 24/7',
      'Painel completo de controle',
      'Analytics avançados',
      'Destaque premium',
      'API de integração',
      'Gerenciador de leads'
    ],
    isActive: true
  }
];

const addPlansViaAPI = async () => {
  console.log('📋 Adicionando planos via API...');
  
  try {
    for (const plan of additionalPlans) {
      console.log(`Criando plano: ${plan.name}`);
      
      const response = await fetch(`${API_BASE}/plans/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify(plan)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${plan.name}: R$ ${plan.price} (${plan.maxProperties} imóveis)`);
      } else {
        const error = await response.json();
        console.error(`❌ Erro ao criar ${plan.name}:`, error);
      }
    }
    
    console.log('🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
};

console.log('⚠️  INSTRUÇÕES:');
console.log('1. Faça login como administrador na aplicação');
console.log('2. Abra o DevTools do navegador (F12)');
console.log('3. Vá para a aba Application/Storage > Local Storage');
console.log('4. Copie o valor do token');
console.log('5. Substitua "seu_token_admin_aqui" pelo token real neste arquivo');
console.log('6. Execute: node addPlansViaAPI.js');
console.log('');
console.log('Ou use o painel administrativo da aplicação para criar os planos manualmente.');

// Descomente a linha abaixo após configurar o token
// addPlansViaAPI();