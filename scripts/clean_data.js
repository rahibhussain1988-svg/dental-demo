const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, '..', 'js', 'data.js');
let dataCode = fs.readFileSync(dataJsPath, 'utf8');

// Replace symptoms icons
dataCode = dataCode.replace(/id: "sym-toothache",[\s\S]*?icon: ".*?",/, 'id: "sym-toothache",\n    label: "Toothache & Cavity Pain",\n    icon: "tooth",');
dataCode = dataCode.replace(/id: "sym-braces",[\s\S]*?icon: ".*?",/, 'id: "sym-braces",\n    label: "Braces & Aligners Review",\n    icon: "brackets",');
dataCode = dataCode.replace(/id: "sym-bleeding-gums",[\s\S]*?icon: ".*?",/, 'id: "sym-bleeding-gums",\n    label: "Bleeding Gums & Cleaning",\n    icon: "shield",');
dataCode = dataCode.replace(/id: "sym-broken-tooth",[\s\S]*?icon: ".*?",/, 'id: "sym-broken-tooth",\n    label: "Broken or Chipped Tooth",\n    icon: "alertTriangle",');
dataCode = dataCode.replace(/id: "sym-wisdom-tooth",[\s\S]*?icon: ".*?",/, 'id: "sym-wisdom-tooth",\n    label: "Wisdom Tooth & Swelling",\n    icon: "alertTriangle",');
dataCode = dataCode.replace(/id: "sym-root-canal",[\s\S]*?icon: ".*?",/, 'id: "sym-root-canal",\n    label: "Root Canal (RCT) Consultation",\n    icon: "tooth",');
dataCode = dataCode.replace(/id: "sym-implants",[\s\S]*?icon: ".*?",/, 'id: "sym-implants",\n    label: "Dental Implants & Missing Teeth",\n    icon: "chair",');
dataCode = dataCode.replace(/id: "sym-pediatric",[\s\S]*?icon: ".*?",/, 'id: "sym-pediatric",\n    label: "Kids Dental & Checkup",\n    icon: "userPlus",');
dataCode = dataCode.replace(/id: "sym-whitening",[\s\S]*?icon: ".*?",/, 'id: "sym-whitening",\n    label: "Teeth Whitening & Smile Design",\n    icon: "chart",');

// Replace emergency procedures icons
dataCode = dataCode.replace(/id: "emg-1",[\s\S]*?icon: ".*?"/, (match) => match.replace(/icon: ".*?"/, 'icon: "emergency"'));
dataCode = dataCode.replace(/id: "emg-2",[\s\S]*?icon: ".*?"/, (match) => match.replace(/icon: ".*?"/, 'icon: "tooth"'));
dataCode = dataCode.replace(/id: "emg-3",[\s\S]*?icon: ".*?"/, (match) => match.replace(/icon: ".*?"/, 'icon: "alertTriangle"'));
dataCode = dataCode.replace(/id: "emg-4",[\s\S]*?icon: ".*?"/, (match) => match.replace(/icon: ".*?"/, 'icon: "brackets"'));

fs.writeFileSync(dataJsPath, dataCode, 'utf8');
console.log('Successfully updated js/data.js icons cleanly!');
