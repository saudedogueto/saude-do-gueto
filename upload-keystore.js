const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const PROJECT_ID = 'eb186d7d-18ce-49c0-8711-26e016fc7930';
const ACCOUNT_NAME = 'saudedogueto';

const cert = fs.readFileSync('android-cert.pem', 'utf8');
const key = fs.readFileSync('android-key.pem', 'utf8');

console.log('Certificate and key loaded.');
console.log('To upload manually to EAS:');
console.log('');
console.log('1. Go to https://expo.dev/accounts/' + ACCOUNT_NAME + '/projects/saude-do-gueto/settings/credentials');
console.log('2. Under "Android" section, click "Add Credentials"');
console.log('3. Select "Use existing keystore"');
console.log('4. Enter:');
console.log('   Alias: saudedogueto');
console.log('   Keystore password: Karumbe1');
console.log('   Key password: Karumbe1');
console.log('5. Paste the certificate and private key from these files');
