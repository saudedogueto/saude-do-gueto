# Gerar keystore usando .NET cryptography
Add-Type -AssemblyName System.Security

$storePass = "Karumbe1"
$keyPass = "Karumbe1"
$alias = "saudedogueto"
$storePath = Join-Path (Get-Location) "saude-do-gueto.keystore"

# Create a keystore using BouncyCastle-like approach
# Since .NET doesn't have built-in JKS support, we'll use Node.js to write it

@"
const forge = require('node-forge');
const fs = require('fs');

// Generate RSA key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create certificate
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 27);

const attrs = [
  { name: 'commonName', value: 'SaudeDoGueto' },
  { name: 'organizationName', value: 'SaudeDoGueto' },
  { name: 'localityName', value: 'Guarulhos' },
  { name: 'stateOrProvinceName', value: 'SP' },
  { name: 'countryName', value: 'BR' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey, forge.md.sha256.create());

// Export as PEM
const pem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// For EAS, just tell them the info
console.log('=== KEYSTORE INFO FOR EAS ===');
console.log('Alias: saudedogueto');
console.log('Store Password: Karumbe1');
console.log('Key Password: Karumbe1');
console.log('');
console.log('Upload the following to EAS:');
console.log('');
console.log('Private Key:');
console.log(keyPem);
console.log('');
console.log('Certificate:');
console.log(pem);
"@ | Out-File -FilePath "gerar-keystore-node.js" -Encoding utf8

Write-Output "Script criado. Instalando node-forge..."

# Install node-forge
npm install node-forge --save-dev 2>&1 | Out-Null

Write-Output "Gerando keystore..."
node gerar-keystore-node.js