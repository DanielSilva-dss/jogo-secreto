const fs = require("fs");

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

if (!config.apiKey) {
  console.error("❌ ERRO: Variáveis do Firebase não foram carregadas.");
  process.exit(1);
}

const fileContent = `window.firebaseConfig = ${JSON.stringify(config, null, 2)};`;

fs.mkdirSync("./public", { recursive: true });
fs.writeFileSync("./public/firebase-config.js", fileContent);

console.log("✅ firebase-config.js gerado com sucesso!");
