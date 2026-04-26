const fs = require('fs');
const http = require('http');
const https = require('https');

const PROJECT_ID = 'eb186d7d-18ce-49c0-8711-26e016fc7930';

// Read PEM files
const certPem = fs.readFileSync('android-cert.pem', 'utf8');
const keyPem = fs.readFileSync('android-key.pem', 'utf8');

console.log('=== CREDENCIAIS DO KEYSTORE ===');
console.log('Project ID:', PROJECT_ID);
console.log('');
console.log('Alias: saudedogueto');
console.log('Keystore Password: Karumbe1');
console.log('Key Password: Karumbe1');
console.log('');
console.log('=== CERTIFICADO (base64) ===');
const certB64 = Buffer.from(certPem).toString('base64');
console.log(certB64);
console.log('');
console.log('=== CHAVE PRIVADA (base64) ===');
const keyB64 = Buffer.from(keyPem).toString('base64');
console.log(keyB64);
console.log('');
console.log('=== INSTRUÇÕES ===');
console.log('Acesse: https://expo.dev/accounts/saudedogueto/projects/saude-do-gueto/settings');
console.log('Clique em "Credentials" na barra lateral');
console.log('Role até "Android"');
console.log('Se não tiver "Keystore", clique em "Add Credentials" ou no +');
console.log('Preencha:');
console.log('  - Keystore Alias: saudedogueto');
console.log('  - Keystore Password: Karumbe1');
console.log('  - Key Password: Karumbe1');
console.log('  - Certificate: cole o conteúdo de android-cert.pem');
console.log('  - Private Key: cole o conteúdo de android-key.pem');
