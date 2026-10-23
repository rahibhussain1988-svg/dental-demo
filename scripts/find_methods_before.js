const fs = require('fs');
const content = fs.readFileSync('js/app.js', 'utf8');
const lines = content.split('\n');

for (let i = 5380; i < 5805 && i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^\s{2}[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/)) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
}
