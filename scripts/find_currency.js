const fs = require('fs');

const appCode = fs.readFileSync('js/app.js', 'utf8');
const dataCode = fs.readFileSync('js/data.js', 'utf8');

const dollarRegex = /\$[0-9,]+|\$\{[^}]+\}/g;
const staticDollar = /\$[0-9]+/g;

const staticInApp = appCode.match(staticDollar) || [];
const staticInData = dataCode.match(staticDollar) || [];

console.log('Static $ in app.js:', staticInApp.length, [...new Set(staticInApp)]);
console.log('Static $ in data.js:', staticInData.length, [...new Set(staticInData)]);

// Check formatCurrency
console.log('formatCurrency in app.js:', appCode.includes('formatCurrency'));
console.log('formatCurrency in data.js:', dataCode.includes('formatCurrency'));

// Search for any '$' literal followed by number or space
const allDollarLiterals = appCode.match(/['"`]\$[0-9]/g) || [];
console.log('Dollar literals in app.js:', allDollarLiterals);
