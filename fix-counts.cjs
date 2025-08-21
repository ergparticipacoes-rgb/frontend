// Script temporário para corrigir contadores
require('dotenv').config({ path: './server/.env' });
const mongoose = require('./server/node_modules/mongoose');
const User = require('./server/src/models/user.model');
const Property = require('./server/src/models/property.model');

async function fixCounts() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/litoral-imoveis');
    console.log('✅ Conectado!');
    
    console.log('📊 Verificando inconsistências...');
    
    const users = await User.find({ 
      userType: { $ne: 'admin' },
      publishedProperties: { $gt: 0 }
    });
    
    console.log(`Encontrados ${users.length} usuários para verificar\n`);
    
    let fixed = 0;
    
    for (const user of users) {
      const realCount = await Property.countDocuments({
        ownerId: user._id,
        isActive: true
      });
      
      console.log(`Usuário: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Contador atual: ${user.publishedProperties}`);
      console.log(`  Contagem real: ${realCount}`);
      
      if (user.publishedProperties !== realCount) {
        console.log(`  ❌ INCONSISTENTE - Corrigindo...`);
        user.publishedProperties = realCount;
        await user.save();
        console.log(`  ✅ Corrigido para ${realCount}`);
        fixed++;
      } else {
        console.log(`  ✅ Consistente`);
      }
      console.log('');
    }
    
    console.log(`🎉 Processo concluído! ${fixed} usuários corrigidos.`);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixCounts();