const fs = require('fs');

const appCode = fs.readFileSync('js/app.js', 'utf8');

// Match `$$` or `\$[0-9]` or `(\$)`
const pattern = /\$\$|\$[0-9]+|\(\$\)/g;
let match;
const found = [];
const lines = appCode.split('\n');

lines.forEach((line, lineNum) => {
  if (/\$\$|\$[0-9]+|\(\$\)/.test(line)) {
    found.push({ lineNum: lineNum + 1, text: line.trim() });
  }
});

console.log('Found', found.length, 'literal dollar currency occurrences:');
found.forEach(f => console.log(`${f.lineNum}: ${f.text}`));
