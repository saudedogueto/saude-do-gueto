#!/bin/bash
# Injects hash-redirect script into index.html for GitHub Pages SPA routing
# This runs AFTER expo export, on the dist/ output

FILE="$1"

# 1) Fix absolute paths to relative
sed -i 's|src="/_expo/|src="./_expo/|g' "$FILE"

# 2) Inject hash-redirect inline script BEFORE the expo bundle loads
# Uses python3 for reliable multiline insertion
python3 -c "
import re
with open('$FILE', 'r') as f:
    content = f.read()
script = '''<script>
(function(){
  var h = window.location.hash;
  if(!h||h===\"#/\"||h===\"#\"){window.location.hash=\"#/(tabs)/dashboard\";}
})();
</script>'''
content = content.replace('</head>', script + '\n</head>')
with open('$FILE', 'w') as f:
    f.write(content)
"
