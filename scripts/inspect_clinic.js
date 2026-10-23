const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  try {
    const html = await fetchUrl('https://rahibhussain1988-svg.github.io/');
    console.log('HTML length:', html.length);
    const scriptMatch = html.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
    if (scriptMatch) {
      const jsUrl = 'https://rahibhussain1988-svg.github.io/' + scriptMatch[1].replace(/^\.\//, '');
      console.log('Fetching JS:', jsUrl);
      const jsCode = await fetchUrl(jsUrl);
      console.log('JS length:', jsCode.length);
      
      // Search for kiosk elements, titles, buttons, layout
      const patterns = [
        /Emergency/gi,
        /Walk-In/gi,
        /Token/gi,
        /Triage/gi,
        /Reception/gi,
        /Fatima/gi
      ];
      
      // Extract string literals
      const strings = jsCode.match(/"([^"\\]{4,80})"/g) || [];
      const interesting = strings
        .map(s => s.replace(/"/g, ''))
        .filter(s => /kiosk|patient|token|reception|clinic|doctor|counter|queue/i.test(s));
      
      console.log('Sample interesting strings in Fatima Clinic:');
      console.log([...new Set(interesting)].slice(0, 40));
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

run();
