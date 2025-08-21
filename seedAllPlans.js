// Script para adicionar todos os planos padrão ao banco de dados
// Execute este script com: node seedAllPlans.js

const API_BASE = 'http://localhost:3002/api';

// Planos padrão a serem criados
const defaultPlans = [
  {
    name: 'Básico',
    description: 'Ideal para corretores iniciantes',
    maxProperties: 5,
    price: 29.90,
    duration: 30,
    features: [
      'Até 5 imóveis publicados',
      'Fotos ilimitadas',
      'Destaque na busca',
      'Suporte por email'
    ],
    isActive: true,
    priority: 1
  },
  {
    name: 'Profissional',
    description: 'Para corretores em crescimento',
    maxProperties: 20,
    price: 79.90,
    duration: 30,
    features: [
      'Até 20 imóveis publicados',
      'Fotos e vídeos ilimitados',
      'Destaque premium na busca',
      'Estatísticas de visualização',
      'Suporte prioritário'
    ],
    isActive: true,
    priority: 2
  },
  {
    name: 'Premium',
    description: 'Para imobiliárias e corretores estabelecidos',
    maxProperties: 100,
    price: 199.90,
    duration: 30,
    features: [
      'Até 100 imóveis publicados',
      'Fotos, vídeos e tours virtuais',
      'Destaque máximo na busca',
      'Estatísticas completas',
      'API de integração',
      'Suporte 24/7'
    ],
    isActive: true,
    priority: 3
  },
  {
    name: 'Empresarial',
    description: 'Solução completa para grandes imobiliárias',
    maxProperties: 500,
    price: 499.90,
    duration: 30,
    features: [
      'Até 500 imóveis publicados',
      'Todos os recursos Premium',
      'Múltiplos usuários',
      'Relatórios personalizados',
      'Integração com CRM',
      'Gerente de conta dedicado'
    ],
    isActive: true,
    priority: 4
  },
  {
    name: 'Bronze',
    description: 'Plano intermediário com bom custo-benefício',
    maxProperties: 10,
    price: 49.90,
    duration: 30,
    features: [
      'Até 10 imóveis publicados',
      'Fotos ilimitadas',
      'Destaque bronze na busca',
      'Relatórios básicos',
      'Suporte por email e chat'
    ],
    isActive: true,
    priority: 5
  },
  {
    name: 'Silver',
    description: 'Para corretores com demanda média',
    maxProperties: 30,
    price: 99.90,
    duration: 30,
    features: [
      'Até 30 imóveis publicados',
      'Fotos e vídeos ilimitados',
      'Destaque silver na busca',
      'Estatísticas avançadas',
      'Suporte prioritário por telefone'
    ],
    isActive: true,
    priority: 6
  },
  {
    name: 'Gold',
    description: 'Plano avançado para profissionais exigentes',
    maxProperties: 50,
    price: 149.90,
    duration: 30,
    features: [
      'Até 50 imóveis publicados',
      'Todos os tipos de mídia',
      'Destaque gold na busca',
      'Estatísticas em tempo real',
      'API básica',
      'Suporte VIP'
    ],
    isActive: true,
    priority: 7
  }
];

// Função para fazer login e obter token de admin
async function getAdminToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@litoral.com',
        password: 'senha123'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer login');
    }
    
    return data.token;
  } catch (error) {
    console.error('❌ Erro ao obter token de admin:', error.message);
    throw error;
  }
}

// Função para criar um plano
async function createPlan(plan, token) {
  try {
    const response = await fetch(`${API_BASE}/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(plan)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Se o plano já existe, não é erro
      if (data.error && data.error.includes('already exists')) {
        console.log(`   ⚠️  Plano "${plan.name}" já existe, pulando...`);
        return null;
      }
      throw new Error(data.error || `Erro ao criar plano ${plan.name}`);
    }
    
    return data.plan;
  } catch (error) {
    console.error(`   ❌ Erro ao criar plano ${plan.name}:`, error.message);
    return null;
  }
}

// Função principal para adicionar todos os planos
async function seedAllPlans() {
  try {
    console.log('🚀 Iniciando seed de planos...\n');
    
    console.log('🔐 Fazendo login como administrador...');
    const token = await getAdminToken();
    console.log('✅ Login realizado com sucesso!\n');
    
    console.log('📋 Criando planos...');
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const plan of defaultPlans) {
      console.log(`\n   📦 Processando plano "${plan.name}"...`);
      const created = await createPlan(plan, token);
      
      if (created) {
        console.log(`   ✅ Plano "${plan.name}" criado com sucesso!`);
        console.log(`      💰 Preço: R$ ${plan.price}`);
        console.log(`      🏠 Limite: ${plan.maxProperties} imóveis`);
        createdCount++;
      } else {
        skippedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Resumo da operação:');
    console.log(`   ✅ Planos criados: ${createdCount}`);
    console.log(`   ⚠️  Planos existentes (pulados): ${skippedCount}`);
    console.log(`   📦 Total processado: ${defaultPlans.length}`);
    console.log('='.repeat(50));
    
    console.log('\n🎉 Seed de planos concluído com sucesso!');
    console.log('💡 Agora você pode acessar o sistema e selecionar um plano.');
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar o script
seedAllPlans();