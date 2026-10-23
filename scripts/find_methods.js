const fs = require('fs');
const content = fs.readFileSync('js/app.js', 'utf8');
const lines = content.split('\n');

for (let i = 5790; i < 6340 && i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^\s{2}[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/)) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
}
