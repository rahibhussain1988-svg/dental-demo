const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// Parse direct children of <body>
const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) {
  console.log('No body found');
  process.exit(1);
}

const bodyInner = bodyMatch[1];
// Find top level tags in body
let depth = 0;
let pos = 0;
const tagRegex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;
let match;
let directChildren = [];
let topLevelDivs = [];

// Simple scanner for direct children of body
const lines = bodyInner.split('\n');
let divIndex = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^  <div\b/)) {
    divIndex++;
    console.log(`div[${divIndex}] at line ${i+16}: ${line.trim()}`);
  }
}
