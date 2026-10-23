const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

content = content.replace(
  '    mount.innerHTML = bodyHtml;\n  }\n\n  renderTvStation() {',
  '    mount.innerHTML = bodyHtml;\n  },\n\n  renderTvStation() {'
);

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Fixed comma separation on renderKioskStation in js/app.js!');
