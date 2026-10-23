const fs = require('fs');

const appCode = fs.readFileSync('js/app.js', 'utf8');

// Find all matches of $ followed by number or curly brace or text
const regex = /(\$|\bUSD\b|\bfee\b|\bcost\b)[^;,\n<]*/gi;
const matches = [];
let m;
while ((m = regex.exec(appCode)) !== null) {
  if (m[0].includes('$')) {
    matches.push(m[0].trim());
  }
}

console.log('Total dollar matches:', matches.length);
console.log('Sample dollar occurrences:');
console.log(matches.slice(0, 30));
