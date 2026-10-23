const fs = require('fs');

const appPath = 'js/app.js';
let code = fs.readFileSync(appPath, 'utf8');

const target = 'this.switchStation("PATIENT_KIOSK");';
const replacement = `// Pre-populate all workstation sections so no section is ever blank on initial load
    this.renderKioskStation();
    this.renderTvStation();
    this.renderCabinStation();
    this.renderBillingStation();
    this.renderPharmacyStation();

    this.switchStation("PATIENT_KIOSK");`;

if (code.includes(replacement)) {
  console.log('Already patched init()!');
} else if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync(appPath, code, 'utf8');
  console.log('Successfully patched init() with pre-renders!');
} else {
  console.error('Target string not found in js/app.js');
}
