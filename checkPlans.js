const mongoose = require('mongoose');
const Plan = require('./server/src/models/plan.model');

async function checkPlans() {
  try {
    await mongoose.connect('mongodb://localhost:27017/imobi-litoral');
    console.log('✅ Conectado ao MongoDB');
    
    const allPlans = await Plan.find();
    const activePlans = await Plan.find({ isActive: true });
    
    console.log('\n📊 RESUMO DOS PLANOS:');
    console.log('Total de planos no banco:', allPlans.length);
    console.log('Planos ativos:', activePlans.length);
    
    if (allPlans.length === 0) {
      console.log('\n⚠️  NENHUM PLANO ENCONTRADO NO BANCO!');
      console.log('Execute: node seedAllPlans.js para criar os planos');
    } else {
      console.log('\n📋 LISTA DE PLANOS:');
      allPlans.forEach(plan => {
        console.log(`\n- ${plan.name}`);
        console.log(`  Preço: R$ ${plan.price}`);
        console.log(`  Ativo: ${plan.isActive ? '✅ Sim' : '❌ Não'}`);
        console.log(`  Prioridade: ${plan.priority}`);
        console.log(`  Limite de imóveis: ${plan.maxProperties}`);
      });
      
      if (activePlans.length === 0) {
        console.log('\n⚠️  TODOS OS PLANOS ESTÃO INATIVOS!');
        console.log('Os planos precisam estar ativos para aparecer na seleção.');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkPlans();