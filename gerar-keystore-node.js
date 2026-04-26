const forge = require('node-forge');
const fs = require('fs');

console.log('=== GERANDO KEYSTORE ===');

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

const pem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Save files
fs.writeFileSync('android-cert.pem', pem);
fs.writeFileSync('android-key.pem', keyPem);

console.log('Certificate PEM saved: android-cert.pem');
console.log('Private Key PEM saved: android-key.pem');
console.log('');
console.log('=== KEYSTORE INFO FOR EAS MANUAL UPLOAD ===');
console.log('Alias: saudedogueto');
console.log('Store Password: Karumbe1');
console.log('Key Password: Karumbe1');
console.log('');
