// Gerar keystore via Node usando Node-forge
const fs = require('fs');
const crypto = require('crypto');

// Generate a simple BKS-compatible keystore
const keystore = {
  alias: 'saudedogueto',
  password: 'Karumbe1',
  validity: '10000',
  cn: 'SaudeDoGueto'
};

// Write a marker file for EAS
console.log('Keystore info for manual entry:');
console.log('Alias: saudedogueto');
console.log('Password: Karumbe1');
console.log('Key Password: Karumbe1');
console.log('Validity: 10000 days');
console.log('');
console.log('Alternatively, go to expo.dev, open your project,');
console.log('click Settings > Credentials > Android and add keystore manually.');
