const fs = require('fs');

// Let's inspect kiosk HTML for Step 0 and Step 1
const appCode = fs.readFileSync('js/app.js', 'utf8');

// Find step 1 HTML in renderKioskStation
const step1Idx = appCode.indexOf('STEP 1: FAST-TRACK WALK-IN INTAKE');
const step1Slice = appCode.substring(step1Idx, step1Idx + 4000);

console.log('--- Step 1 Slice ---');
console.log(step1Slice.substring(0, 1500));
