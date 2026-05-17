#!/bin/bash
# Injects redirect script into index.html for GitHub Pages SPA routing
# This runs AFTER expo export, on the dist/ output
# Fixes the "Unmatched Route" error on root URL by forcing navigation to dashboard

FILE="$1"

# 1) Fix absolute paths to relative (needed for GitHub Pages subpath)
sed -i 's|src="/_expo/|src="./_expo/|g' "$FILE"

# 2) Inject redirect script BEFORE closing head tag
# Uses python3 for reliable multiline insertion
python3 -c "
with open('$FILE', 'r') as f:
    content = f.read()

script = '''<script>
(function(){
  var h = window.location.hash;
  if(!h||h===\"#/\"||h===\"#\"){
    window.location.replace(window.location.href.replace(/#*$/, '') + '#/(tabs)/dashboard');
  }
})();
</script>'''

content = content.replace('</head>', script + '\n</head>')

with open('$FILE', 'w') as f:
    f.write(content)

print('Script injected successfully')
"
