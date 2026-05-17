#!/bin/bash
# Post-processes dist/ for GitHub Pages SPA deployment
# Usage: inject-redirect.sh <path/to/index.html>

set -e

FILE="$1"
DIR="$(dirname "$FILE")"

echo "🔧 Preparando deploy para GitHub Pages..."

# 1) Fix absolute paths to relative
sed -i 's|src="/_expo/|src="./_expo/|g' "$FILE"

# 2) Inject hash-redirect ANTES do </head> (roda antes do bundle Expo)
LINE='<script>if(!window.location.hash||"#/"===window.location.hash||"#"===window.location.hash){window.location.replace(window.location.href.replace(/#*$/,"")+"#/(tabs)/dashboard")}</script>'
sed -i "s|</head>|${LINE}</head>|" "$FILE"

# 3) Inject manifest link + viewport + theme-color para PWA
MANIFEST='<link rel="manifest" href="./manifest.json"><meta name="theme-color" content="#FF8C00">'
sed -i "s|<title>|${MANIFEST}<title>|" "$FILE"

# 4) Inject service worker registrator
SW='<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("SW:",e)})})}</script>'
sed -i "s|</body>|${SW}</body>|" "$FILE"

# 5) Copy index.html as 404.html
cp "$FILE" "$DIR/404.html"

# 6) Copy public assets (manifest, icons) to dist
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cp "$PROJECT_DIR/public/"*.json "$DIR/" 2>/dev/null || true
cp "$PROJECT_DIR/public/"icon-*.png "$DIR/assets/" 2>/dev/null || true

# 7) Create service worker
cat > "$DIR/sw.js" << 'SWEOF'
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request).catch(function() {
    return caches.match(e.request);
  }));
});
SWEOF

echo "✅ Deploy preparado"
echo "   - Redirect injetado"
echo "   - Manifest/PWA configurado"
echo "   - 404.html criado"
echo "   - Service worker criado"
echo "   - Ícones copiados"
