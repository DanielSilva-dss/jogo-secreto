// vercel-build.js
const fs = require('fs');

console.log('Gerando arquivo de configuração do Firebase...');

const configContent = `
// Configuração gerada automaticamente durante o build
window.firebaseConfig = {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}"
};
console.log("Firebase config injetado pelo Vercel");
`;

fs.writeFileSync('firebase-config.js', configContent);
console.log('Arquivo firebase-config.js gerado com sucesso!');