const https = require('https');
const fs = require('fs');

async function run() {
  const jsCode = await new Promise((resolve) => {
    https.get('https://rahibhussain1988-svg.github.io/assets/index-D-pi7S4_.js', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
  });

  // Search for Kiosk component rendering
  const idx = jsCode.indexOf('Touchscreen Patient Intake');
  if (idx !== -1) {
    console.log('Found "Touchscreen Patient Intake" around index', idx);
    console.log(jsCode.substring(idx - 400, idx + 800));
  } else {
    console.log('Not found, searching for other kiosk strings...');
    const m = jsCode.match(/[a-zA-Z0-9_$]+\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*Kiosk[^}]*\}/i);
    if (m) console.log(m[0].substring(0, 500));
  }

  // Find occurrences of pathway, welcome, emergency, etc.
  const regex = /(?:Welcome|Emergency|Walk-In|Consultation|Token|Patient Intake)[\w\s,.-]{10,120}/gi;
  const matches = jsCode.match(regex) || [];
  console.log('Unique UI phrases:');
  console.log([...new Set(matches)].slice(0, 30));
}

run();
