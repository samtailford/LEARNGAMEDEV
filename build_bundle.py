"""Builds a single self-contained index.html (all CSS/JS inlined) for easy sharing.
Run this after any change to the source files if you need a fresh bundle."""
import re

def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()

html = read('index.html')
css = read('style.css')
icons_js = read('icons.js')
data_js = read('data.js')
votes_js = read('votes.js')
resources_js = read('resources.js')
app_js = read('app.js')

# Replace the external stylesheet link with an inline <style> block
html = html.replace(
    '<link rel="stylesheet" href="style.css">',
    f'<style>\n{css}\n</style>'
)

# Replace the script tags with one combined inline <script> block, in the same load order
script_block_pattern = re.compile(
    r'<script src="icons\.js\?v=2"></script>\s*'
    r'<script src="data\.js\?v=2"></script>\s*'
    r'<script src="votes\.js\?v=2"></script>\s*'
    r'<script src="resources\.js\?v=2"></script>\s*'
    r'<script src="app\.js\?v=2"></script>'
)

combined_js = "\n\n".join([icons_js, data_js, votes_js, resources_js, app_js])
html = script_block_pattern.sub(f'<script>\n{combined_js}\n</script>', html)

with open('index.bundled.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Wrote index.bundled.html —", len(html), "bytes")
