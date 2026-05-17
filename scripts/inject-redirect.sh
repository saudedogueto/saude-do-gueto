#!/bin/bash
# Post-processes dist/ for GitHub Pages SPA deployment
# Usage: inject-redirect.sh <path/to/index.html> [project-dir]
#   project-dir defaults to current working directory

set -e

FILE="$1"
DIR="$(dirname "$FILE")"
PROJECT_DIR="${2:-$PWD}"

echo "=== Preparando deploy para GitHub Pages ==="
echo "  Project dir: $PROJECT_DIR"
echo "  Dist dir: $DIR"

# 1) Fix absolute paths to relative
sed -i 's|src="/_expo/|src="./_expo/|g' "$FILE" && echo "  [OK] Paths relativizados"

# 2) Inject hash-redirect ANTES do </head>
LINE='<script>if(!window.location.hash||"#/"===window.location.hash||"#"===window.location.hash){window.location.replace(window.location.href.replace(/#*$/,"")+"#/(tabs)/dashboard")}</script>'
sed -i "s|</head>|${LINE}</head>|" "$FILE" && echo "  [OK] Hash-redirect injetado"

# 3) Inject manifest link + theme-color
if grep -q '<title>' "$FILE"; then
  sed -i 's|<title>|<link rel="manifest" href="./manifest.json"><meta name="theme-color" content="#FF8C00"><title>|' "$FILE" && echo "  [OK] Manifest link injetado"
else
  echo "  [!] <title> nao encontrado, pulando manifest"
fi

# 4) Inject service worker registrator
if grep -q '</body>' "$FILE"; then
  sed -i 's|</body>|<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("SW:",e)})})}</script></body>|' "$FILE" && echo "  [OK] Service worker registrado"
else
  echo "  [!] </body> nao encontrado, pulando SW"
fi

# 5) Copy index.html as 404.html
cp "$FILE" "$DIR/404.html" && echo "  [OK] 404.html criado"

# 6) Copy public assets (manifest, icons, sw.js) to dist
if [ -f "$PROJECT_DIR/public/manifest.json" ]; then
  cp "$PROJECT_DIR/public/manifest.json" "$DIR/" && echo "  [OK] manifest.json copiado"
fi
if [ -f "$PROJECT_DIR/public/icon-192.png" ]; then
  cp "$PROJECT_DIR/public/icon-"*.png "$DIR/" 2>/dev/null && echo "  [OK] Icones copiados"
fi

# 7) Create minimal service worker at dist root
cat > "$DIR/sw.js" << 'EOF'
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request)));
EOF
echo "  [OK] sw.js criado"

echo ""
echo "=== Conteudo final de $DIR ==="
ls -la "$DIR/"
echo ""
echo "=== Deploy preparado com sucesso ==="
