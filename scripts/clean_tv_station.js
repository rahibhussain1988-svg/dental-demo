const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

content = content.replace(
  '<div class="tv-brand-icon">🦷</div>',
  '<div class="tv-brand-icon" style="color:#2DD4BF;">${CLINIC_ICONS.tv}</div>'
);
content = content.replace(
  '🕒 ${new Date()',
  '${new Date()'
);
content = content.replace(
  '<span>📢</span> Re-Announce',
  '${CLINIC_ICONS.sound} Re-Announce'
);
content = content.replace(
  '<span>⛶</span> Fullscreen',
  'Fullscreen'
);
content = content.replace(
  '<span>📢</span> Announce & Call Next Waiting Patient',
  '${CLINIC_ICONS.sound} Call Next Waiting Patient'
);

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Cleaned TV station icons successfully!');
