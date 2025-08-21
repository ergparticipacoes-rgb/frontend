const mongoose = require('mongoose');
const Plan = require('./server/src/models/plan.model');

const checkPlans = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/litoral');
    console.log('Conectado ao MongoDB');
    
    const plans = await Plan.find({});
    console.log('Total de planos encontrados:', plans.length);
    
    if (plans.length === 0) {
      console.log('❌ Nenhum plano encontrado no banco de dados!');
    } else {
      console.log('📋 Planos encontrados:');
      plans.forEach(plan => {
        console.log(`- ${plan.name}: R$ ${plan.price} (ativo: ${plan.isActive}, maxProperties: ${plan.maxProperties})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
};

checkPlans();