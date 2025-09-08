// vercel-build.js
const fs = require('fs');
const path = require('path');

console.log('Iniciando o script de build para gerar a configuração do Firebase...');

// Objeto de configuração montado a partir das variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Validação crucial para garantir que as variáveis de ambiente foram carregadas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('ERRO CRÍTICO: As variáveis de ambiente do Firebase não foram encontradas!');
  console.error('Verifique se elas estão configuradas corretamente no painel do Vercel.');
  process.exit(1); // Falha o build intencionalmente para evitar um deploy quebrado
}

// Conteúdo do arquivo a ser gerado. Ele cria a variável global 'firebaseConfig'.
const fileContent = `
// Este arquivo foi gerado automaticamente pelo build da Vercel.
// Não o edite manualmente.

var firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
`;

// Define o caminho de destino dentro da pasta 'public'
const dirPath = path.join(__dirname, 'public');
const filePath = path.join(dirPath, 'firebase-config.js');

// Garante que o diretório 'public' exista
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
}

// Escreve o arquivo de configuração
try {
  fs.writeFileSync(filePath, fileContent);
  console.log(`✅ Arquivo firebase-config.js gerado com sucesso em: ${filePath}`);
} catch (error) {
  console.error('❌ Erro ao escrever o arquivo firebase-config.js:', error);
  process.exit(1);
}