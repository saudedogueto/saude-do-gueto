const sharp = require('sharp');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="80" fill="#FF8C00"/>
  <text x="256" y="300" text-anchor="middle" font-size="280" font-family="sans-serif" fill="white">🐢</text>
</svg>`;

sharp(Buffer.from(svg)).resize(192, 192).png().toFile('public/icon-192.png').then(() => {
  return sharp(Buffer.from(svg)).resize(512, 512).png().toFile('public/icon-512.png');
}).then(() => {
  console.log('Ícones criados com sucesso!');
}).catch(err => console.error('Erro:', err));
