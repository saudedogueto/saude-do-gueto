#!/bin/bash
# Post-processes dist/ for GitHub Pages SPA deployment
# Usage: inject-redirect.sh <path/to/index.html> [project-dir]
set -e

FILE="$1"
DIR="$(dirname "$FILE")"
PROJECT_DIR="${2:-$PWD}"

echo "=== Preparando deploy para GitHub Pages ==="

# 1) Fix absolute paths to relative
sed -i 's|src="/_expo/|src="./_expo/|g' "$FILE"
echo "  [OK] Paths relativizados"

# 2) Inject hash-redirect before </head>
LINE='<script>if(!window.location.hash||"#/"===window.location.hash||"#"===window.location.hash){window.location.replace(window.location.href.replace(/#*$/,"")+"#/(tabs)/dashboard")}</script>'
sed -i "s|</head>|${LINE}</head>|" "$FILE"
echo "  [OK] Hash-redirect injetado"

# 3) Inject manifest + theme-color
sed -i 's|<title>|<link rel="manifest" href="./manifest.json"><meta name="theme-color" content="#FF8C00"><title>|' "$FILE"
echo "  [OK] Manifest injetado"

# 4) Inject SW registrator
sed -i 's|</body>|<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("SW:",e)})})}</script></body>|' "$FILE"
echo "  [OK] SW registrado"

# 5) 404.html = index.html
cp "$FILE" "$DIR/404.html"
echo "  [OK] 404.html criado"

# 6) Copy PWA assets from public/ to dist/
cp "$PROJECT_DIR/public/manifest.json" "$DIR/" 2>/dev/null && echo "  [OK] manifest.json copiado" || echo "  [!!] manifest.json NAO encontrado"
cp "$PROJECT_DIR/public/icon-192.png" "$DIR/" 2>/dev/null && echo "  [OK] icon-192.png copiado" || echo "  [!!] icon-192.png NAO encontrado"
cp "$PROJECT_DIR/public/icon-512.png" "$DIR/" 2>/dev/null && echo "  [OK] icon-512.png copiado" || echo "  [!!] icon-512.png NAO encontrado"

# 7) Create minimal sw.js
cat > "$DIR/sw.js" << 'EOF'
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));
EOF
echo "  [OK] sw.js criado"

# 8) .nojekyll
touch "$DIR/.nojekyll"

echo ""
echo "=== Conteudo de $DIR ==="
ls -la "$DIR/"
echo ""
echo "=== Deploy preparado ==="
