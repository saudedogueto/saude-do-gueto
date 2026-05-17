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

# 2) Injetar hash redirect via python (escape seguro)
python3 -c "
import re
with open('index.html','r') as f:
    html = f.read()
# Inject hash redirect after <head>
script = '<script>if(!location.hash||location.hash==\"#/\"||location.hash==\"#\"){location.replace(location.href.replace(/#.*\$/,\"\")+\"#/(tabs)/dashboard\")}</script>'
html = html.replace('<head>', '<head>' + script)
with open('index.html','w') as f:
    f.write(html)
"
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
for f in manifest.json icon-192.png icon-512.png; do
  if [ -f "$PROJECT_DIR/public/$f" ]; then
    cp "$PROJECT_DIR/public/$f" .
    echo "  [OK] $f copiado"
  else
    echo "  [!!] $f NAO encontrado"
  fi
done

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
