#!/bin/bash
# Post-processes dist/ for GitHub Pages SPA deployment
# Usage: inject-redirect.sh <dist-dir> [project-dir]

DIST="$1"
PROJECT_DIR="${2:-$PWD}"

echo "=== Preparando $DIST para GitHub Pages ==="

cd "$DIST" || { echo "ERRO: nao encontrou $DIST"; exit 1; }

# 1) Paths absolutos -> relativos
sed -i 's|src="/_expo/|src="./_expo/|g' index.html
echo "  [OK] Paths relativizados"

# 2) Injetar hash redirect NO INICIO do <head> (primeiro <meta>)
#    Usando um marcador simples para evitar problemas com regex complexo
sed -i 's|<meta charset|<script>if(!location.hash||location.hash=="#/"||location.hash=="#"){location.replace(location.href.replace(/#.*$/,"")+"#/(tabs)/dashboard")}</script>\n<meta charset|' index.html
echo "  [OK] Hash redirect injetado"

# 3) PWA manifest + theme-color no <head>
sed -i 's|<title>|<link rel="manifest" href="./manifest.json"><meta name="theme-color" content="#FF8C00"><title>|' index.html
echo "  [OK] Manifest injetado"

# 4) Service worker registration
sed -i 's|</body>|<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("SW:",e)})})}</script></body>|' index.html
echo "  [OK] SW registrado"

# 5) 404.html = index.html
cp index.html 404.html
echo "  [OK] 404.html criado"

# 6) PWA assets from project public/
if [ -f "$PROJECT_DIR/public/manifest.json" ]; then
  cp "$PROJECT_DIR/public/manifest.json" .
  echo "  [OK] manifest.json copiado"
else
  echo "  [!!] manifest.json NAO encontrado"
fi

if [ -f "$PROJECT_DIR/public/icon-192.png" ]; then
  cp "$PROJECT_DIR/public/icon-192.png" .
  echo "  [OK] icon-192.png copiado"
else
  echo "  [!!] icon-192.png NAO encontrado"
fi

if [ -f "$PROJECT_DIR/public/icon-512.png" ]; then
  cp "$PROJECT_DIR/public/icon-512.png" .
  echo "  [OK] icon-512.png copiado"
else
  echo "  [!!] icon-512.png NAO encontrado"
fi

# 7) Service worker minimal
cat > sw.js << 'SWEOF'
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));
SWEOF
echo "  [OK] sw.js criado"

# 8) .nojekyll
touch .nojekyll
echo "  [OK] .nojekyll"

echo ""
echo "=== Conteudo de $(pwd) ==="
ls -la
echo ""
echo "=== Deploy preparado com sucesso! ==="
