const fs = require('fs');

const appCode = fs.readFileSync('js/app.js', 'utf8');

// Find all occurrences of '\$' in template literals or text
const lines = appCode.split('\n');
const currencyLines = [];

lines.forEach((l, i) => {
  if (l.includes('$$') || l.includes('+$') || l.includes('>$') || l.includes(' $') || l.includes('"$') || l.includes("'$") || l.includes('`$') || l.includes('($')) {
    currencyLines.push({ line: i + 1, text: l.trim() });
  }
});

console.log('Found', currencyLines.length, 'currency lines in app.js:');
currencyLines.forEach(c => console.log(`${c.line}: ${c.text}`));
