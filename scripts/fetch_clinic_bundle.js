const https = require('https');
const fs = require('fs');
const path = require('path');

const targetUrl = 'https://pos-siftp.vercel.app/clinic/assets/index-D-pi7S4_.js';
https.get(targetUrl, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const outPath = path.join(__dirname, '..', 'scratch', 'clinic_bundle.js');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, data, 'utf8');
    console.log('Saved Fatima Clinic bundle, size:', data.length);
  });
}).on('error', err => console.error(err));
