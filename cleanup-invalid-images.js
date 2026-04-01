// Script para eliminar mensajes IMAGE sin imageUrl
const admin = require('firebase-admin');

// Configura tu service account
// Descárgalo desde: Firebase Console → Project Settings → Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.database();
const messagesRef = db.ref('messages');

async function cleanupInvalidImages() {
  console.log('🔍 Buscando mensajes IMAGE sin imageUrl...\n');
  
  const snapshot = await messagesRef.once('value');
  let deleted = 0;
  let totalImages = 0;
  
  snapshot.forEach((child) => {
    const msg = child.val();
    if (msg.messageType === 'IMAGE') {
      totalImages++;
      if (!msg.imageUrl) {
        console.log(`❌ Eliminando: ${child.key}`);
        console.log(`   Message: ${msg.message}`);
        console.log(`   Timestamp: ${new Date(msg.timestamp).toLocaleString()}\n`);
        messagesRef.child(child.key).remove();
        deleted++;
      }
    }
  });
  
  console.log('\n==========================================');
  console.log(`📊 Total mensajes IMAGE encontrados: ${totalImages}`);
  console.log(`✅ Eliminados: ${deleted}`);
  console.log(`⚠️  Válidos conservados: ${totalImages - deleted}`);
  console.log('==========================================\n');
  
  process.exit(0);
}

cleanupInvalidImages().catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});
