#!/bin/bash
# Post-processes dist/index.html for GitHub Pages SPA deployment
# Usage: inject-redirect.sh <path/to/index.html>
#
# Expo Router with origin:false uses hash routing (#/rota).
# GitHub Pages serves index.html for root URL /saude-do-gueto/.
# The Expo app at root URL shows "Unmatched Route" because no hash is present.
# This script injects a script that forces a hash redirect before Expo loads.

set -e

FILE="$1"
DIR="$(dirname "$FILE")"

echo "🔧 Injetando redirect SPA em $FILE..."

# 1) Fix absolute paths to relative (needed for GitHub Pages subpath)
sed -i 's|src="/_expo/|src="./_expo/|g' "$FILE"

# 2) Inject hash-redirect BEFORE </head> to set hash before Expo bundle loads
# Uses sed with a simple approach (avoid Python dependency)
# The redirect script runs immediately (non-deferred) before the expo bundle
LINE='<script>if(!window.location.hash||"#/"===window.location.hash||"#"===window.location.hash){window.location.replace(window.location.href.replace(/#*$/,"")+"#/(tabs)/dashboard")}</script>'

# Insert before closing head tag
sed -i "s|</head>|${LINE}</head>|" "$FILE"

# 3) Copy index.html as 404.html for GitHub Pages SPA fallback
cp "$FILE" "$DIR/404.html"

echo "✅ Inject concluído e 404.html criado"
echo "--- Primeiras 5 linhas do $FILE:"
head -5 "$FILE"
