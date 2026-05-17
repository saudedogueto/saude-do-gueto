#!/bin/bash
# Post-processes dist/ for GitHub Pages SPA deployment
set -euo pipefail

DIST="$1"
PROJECT_DIR="${2:-$PWD}"

echo "=== Preparando $DIST para GitHub Pages ==="

cd "$DIST"

# Paths relativos
sed -i 's|src="/_expo/|src="./_expo/|g' index.html

# Hash redirect (SPA)
sed -i 's|</head>|<script>if(!window.location.hash||"#/"===window.location.hash||"#"===window.location.hash){window.location.replace(window.location.href.replace(/#*$/,"")+"#/(tabs)/dashboard")}</script></head>|' index.html

# PWA manifest + theme-color
sed -i 's|<title>|<link rel="manifest" href="./manifest.json"><meta name="theme-color" content="#FF8C00"><title>|' index.html

# Service worker registration
sed -i 's|</body>|<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("SW:",e)})})}</script></body>|' index.html

# 404.html = index.html
cp index.html 404.html

# PWA assets from project public/
cp "$PROJECT_DIR/public/manifest.json" . 2>/dev/null && echo "  manifest.json OK" || echo "  manifest.json NOT FOUND"
cp "$PROJECT_DIR/public/icon-192.png" . 2>/dev/null && echo "  icon-192.png OK" || echo "  icon-192.png NOT FOUND"
cp "$PROJECT_DIR/public/icon-512.png" . 2>/dev/null && echo "  icon-512.png OK" || echo "  icon-512.png NOT FOUND"

# Service worker minimal
cat > sw.js << 'SWEOF'
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));
SWEOF
echo "  sw.js OK"

# .nojekyll
touch .nojekyll
echo "  .nojekyll OK"

echo ""
echo "=== Conteudo de $(pwd) ==="
ls -la
echo ""
echo "=== Deploy preparado com sucesso ==="
