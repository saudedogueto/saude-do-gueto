#!/bin/bash
# Post-processes dist/ for GitHub Pages SPA deployment
# Usage: inject-redirect.sh <dist-dir> [project-dir]

DIST="$1"
PROJECT_DIR="${2:-$PWD}"

echo "=== Preparando $DIST para GitHub Pages ==="

cd "$DIST" || { echo "ERRO: nao encontrou $DIST"; exit 1; }

# 1) Paths absolutos -> relativos
sed -i 's|src="/_expo/|src="./_expo/|g' index.html && echo "  [OK] Paths relativizados" || echo "  [FALHA] Paths"

# 2) Hash redirect: injetar DEPOIS de <head> usando duas tags
#    Primeiro: adicionar uma marcação APOS <head>
sed -i 's|<head>|<head>__HASH_REDIRECT__|' index.html && echo "  [OK] Marcador <head>" || echo "  [FALHA] Marcador head"
#    Segundo: substituir a marcacao pelo script
sed -i 's|__HASH_REDIRECT__|<script>if(!location.hash||location.hash=="#/"||location.hash=="#"){location.replace(location.href.replace(/#.*$/,"")+"#/(tabs)/dashboard")}</script>|' index.html && echo "  [OK] Hash redirect" || echo "  [FALHA] Hash redirect"

# 3) PWA manifest + theme-color no <head>
sed -i 's|<title>|<link rel="manifest" href="./manifest.json"><meta name="theme-color" content="#FF8C00"><title>|' index.html && echo "  [OK] Manifest" || echo "  [FALHA] Manifest"

# 4) Service worker registration
sed -i 's|</body>|<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(e){console.warn("SW:",e)})})}</script></body>|' index.html && echo "  [OK] SW" || echo "  [FALHA] SW"

# 5) 404.html = index.html
cp index.html 404.html && echo "  [OK] 404.html" || echo "  [FALHA] 404"

# 6) Verificar resultado
echo ""
echo "=== Verificacao: linhas com script no index.html ==="
grep -c '<script' index.html && echo " scripts encontrados" || echo " 0 scripts"

echo ""
echo "=== Deploy preparado ==="
