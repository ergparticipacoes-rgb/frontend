// Script para adicionar planos Bronze, Silver e Gold via API
// Execute este script com: node addPlansScript.js

// Configuração da API
const API_BASE = 'http://localhost:3002/api';

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

// Função para adicionar os planos
async function addPlans() {
  try {
    console.log('🔐 Fazendo login como administrador...');
    const token = await getAdminToken();
    console.log('✅ Login realizado com sucesso!');
    
    console.log('📋 Adicionando planos Bronze, Silver e Gold...');
    
    const response = await fetch(`${API_BASE}/plans/admin/add-additional`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao adicionar planos');
    }
    
    console.log('✅ Planos adicionados com sucesso!');
    console.log('📊 Planos criados:');
    data.plans.forEach(plan => {
      console.log(`   - ${plan.name}: R$ ${plan.price} (${plan.maxProperties} imóveis)`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar o script
addPlans();

console.log('\n🎉 Script executado! Os planos Bronze, Silver e Gold foram adicionados ao sistema.');
console.log('💡 Agora você pode acessar o painel administrativo para gerenciar os planos.');