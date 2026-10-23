const fs = require('fs');

const appPath = 'js/app.js';
let appCode = fs.readFileSync(appPath, 'utf8');

// 1. Update issueWalkinToken to read phone from input if present
appCode = appCode.replace(
  'const phone = this.kioskState.phone.trim() || "555-0100";',
  'const phoneInput = document.getElementById("kiosk-walkin-phone");\n    const phone = (phoneInput ? phoneInput.value.trim() : "") || this.kioskState.phone.trim() || "555-0100";'
);

// 2. Update submitEmergencyKiosk to read phone from input if present
appCode = appCode.replace(
  'const phone = this.kioskState.emergencyPhone || "555-0911";',
  'const phoneInput = document.getElementById("kiosk-emg-phone");\n    const phone = (phoneInput ? phoneInput.value.trim() : "") || this.kioskState.emergencyPhone || "555-0911";'
);

// 3. Update searchAppointmentKiosk to read checkin phone from input if present
appCode = appCode.replace(
  'const phone = (this.kioskState.checkinPhone || "").replace(/\\D/g, "");',
  'const phoneInput = document.getElementById("kiosk-checkin-phone");\n    const phone = ((phoneInput ? phoneInput.value : "") || this.kioskState.checkinPhone || "").replace(/\\D/g, "");'
);

fs.writeFileSync(appPath, appCode, 'utf8');
console.log('Updated handler functions successfully!');
