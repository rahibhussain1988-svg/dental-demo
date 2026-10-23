const https = require('https');
const fs = require('fs');

https.get('https://rahibhussain1988-svg.github.io/assets/index-C2oM4noC.css', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('CSS length:', d.length);
    // Find key classes
    const classes = d.match(/\.([a-zA-Z0-9_-]+)/g) || [];
    const unique = [...new Set(classes)].filter(c => /kiosk|token|card|btn|hero|grid/i.test(c));
    console.log('Sample classes:', unique.slice(0, 40));
  });
}).on('error', console.error);
