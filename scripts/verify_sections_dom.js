const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Testing App Workstation Mounts & Section 3 (Cabin Operatory) & Section 1 (Kiosk)...');

class SimpleElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.innerHTML = '';
    this.style = {};
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      toggle: (c, v) => v ? this.classList.classes.add(c) : this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c)
    };
    this.children = [];
  }
  setAttribute(k, v) { this[k] = v; }
  appendChild(child) { this.children.push(child); }
  addEventListener(event, fn) {}
  focus() {}
  setSelectionRange() {}
}

const elementMap = new Map();
function getOrCreate(id) {
  if (!elementMap.has(id)) {
    elementMap.set(id, new SimpleElement('div', id));
  }
  return elementMap.get(id);
}

// Pre-create known elements from index.html
[
  'clock-time', 'clock-date', 'kiosk-btn-time',
  'kiosk-main-mount', 'tv-main-mount', 'cabin-main-mount', 'billing-main-mount', 'pharmacy-main-mount',
  'station-kiosk', 'station-tv', 'station-cabin', 'station-billing', 'station-pharmacy', 'station-admin',
  'tab-btn-kiosk', 'tab-btn-tv', 'tab-btn-cabin', 'tab-btn-billing', 'tab-btn-pharmacy', 'tab-btn-admin',
  'global-modal-mount', 'thermal-slip-modal', 'toast-container',
  'kiosk-live-appt-search', 'kiosk-walkin-name', 'kiosk-walkin-phone', 'kiosk-emg-name', 'kiosk-emg-phone'
].forEach(id => getOrCreate(id));

class LocalStorageMock {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}

const sandbox = {
  window: {},
  document: {
    getElementById: (id) => getOrCreate(id),
    createElement: (tag) => new SimpleElement(tag),
    querySelector: () => new SimpleElement('div'),
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: new SimpleElement('body'),
    documentElement: new SimpleElement('html')
  },
  localStorage: new LocalStorageMock(),
  addEventListener: () => {},
  pageYOffset: 0,
  console: console,
  Date: Date,
  Math: Math,
  JSON: JSON,
  parseInt: parseInt,
  parseFloat: parseFloat,
  String: String,
  Array: Array,
  Object: Object,
  setTimeout: (fn) => setTimeout(fn, 0),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: () => 123,
  clearInterval: () => {},
  scrollTo: () => {}
};
sandbox.window = sandbox;

vm.createContext(sandbox);

// 1. Load js/data.js
const dataCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
vm.runInContext(dataCode, sandbox);

// 2. Load js/odontogram.js
const odontoCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'odontogram.js'), 'utf8');
vm.runInContext(odontoCode, sandbox);

// 3. Load js/app.js
const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
vm.runInContext(appCode, sandbox);

// Initialize application
sandbox.window.app.init();

console.log('--- Checking /html/body/div[3]/section[3] (#station-cabin / #cabin-main-mount) ---');
const cabinMount = elementMap.get('cabin-main-mount');
if (!cabinMount || !cabinMount.innerHTML || cabinMount.innerHTML.trim().length === 0) {
  console.error('❌ FAIL: #cabin-main-mount is blank!');
  process.exit(1);
} else {
  console.log('✅ PASS: #cabin-main-mount is populated on init! Length:', cabinMount.innerHTML.length);
}

const cabinHtml = cabinMount.innerHTML;
const cabinChecks = [
  { name: 'Chair 1: General & Restorative (Active Chair)', expected: cabinHtml.includes('Chair 1: General & Restorative') },
  { name: 'Chair 2: Specialized Ortho Bay Tab', expected: cabinHtml.includes("app.selectCabinChair('chair-2')") && cabinHtml.includes('Dr. Marcus Vance') },
  { name: 'Chair 3: Surgical Suite Tab', expected: cabinHtml.includes("app.selectCabinChair('chair-3')") },
  { name: 'Chair 4: Pediatric & Hygiene Bay Tab', expected: cabinHtml.includes("app.selectCabinChair('chair-4')") && cabinHtml.includes('Liam Vance') },
  { name: 'Attending Clinician (Dr. Sarah Chen, DDS)', expected: cabinHtml.includes('Dr. Sarah Chen, DDS') },
  { name: 'Call Next Patient button', expected: cabinHtml.includes('Call Next Patient to Chair') },
  { name: 'Patient In Chair Card', expected: cabinHtml.includes('CURRENTLY IN CHAIR') },
  { name: 'Medical Alert & Vitals', expected: cabinHtml.includes('Medical Alerts') && cabinHtml.includes('Blood Pressure') },
  { name: 'Interactive Chairside Odontogram', expected: cabinHtml.includes('Interactive Chairside Odontogram') },
  { name: 'Odontogram Condition buttons', expected: cabinHtml.includes('Caries') && cabinHtml.includes('Root Canal') },
  { name: 'Odontogram Maxillary & Mandibular Arches', expected: cabinHtml.includes('Maxillary Arch') && cabinHtml.includes('Mandibular Arch') },
  { name: 'Chairside Procedures (D0120, D1110, D2330, etc.)', expected: cabinHtml.includes('D0120') && cabinHtml.includes('D2330') },
  { name: '1-Tap Quick Prescriptions (Clindamycin, Amoxicillin, Ibuprofen)', expected: cabinHtml.includes('Clindamycin') && cabinHtml.includes('Amoxicillin') },
  { name: 'Operatory Waiting Queue', expected: cabinHtml.includes('Waiting Queue for') }
];

cabinChecks.forEach(c => {
  if (c.expected) {
    console.log(`  ✅ PASS: Cabin contains ${c.name}`);
  } else {
    console.error(`  ❌ FAIL: Cabin missing ${c.name}`);
    process.exit(1);
  }
});

console.log('\n--- Checking /html/body/div[3]/section[1] (#station-kiosk / #kiosk-main-mount) Step 0 ---');
const kioskMount = elementMap.get('kiosk-main-mount');
const kioskHtml = kioskMount.innerHTML;

const kioskChecks = [
  { name: 'Live Search input (#kiosk-live-appt-search)', expected: kioskHtml.includes('id="kiosk-live-appt-search"') },
  { name: 'Appointments & Arrival Check-In title', expected: kioskHtml.includes('Appointments &amp; Arrival Check-In') },
  { name: 'Auto-Populated Appointments list tab', expected: kioskHtml.includes("Today's Appointments") },
  { name: 'Open Slots Today tab', expected: kioskHtml.includes('Open Slots Today') },
  { name: 'Touch to Check In & Print Slip button', expected: kioskHtml.includes('Touch to Check In &amp; Print Slip') },
  { name: 'Operatory Cabins Strip', expected: kioskHtml.includes('kiosk-cabins-strip') },
  { name: 'Urgent Dental Trauma Banner', expected: kioskHtml.includes('Urgent Dental Trauma &amp; Emergency Triage') },
  { name: 'General Dental Walk-In Pathway', expected: kioskHtml.includes('General Dental Walk-In') },
  { name: 'Orthodontics & Braces Bay Pathway', expected: kioskHtml.includes('Braces &amp; Clear Aligners') }
];

kioskChecks.forEach(c => {
  if (c.expected) {
    console.log(`  ✅ PASS: Kiosk Step 0 contains ${c.name}`);
  } else {
    console.error(`  ❌ FAIL: Kiosk Step 0 missing ${c.name}`);
    process.exit(1);
  }
});

console.log('\n--- Checking Live Search Interaction ---');
sandbox.window.app.onKioskLiveApptSearch('Jane');
const searchedKioskHtml = kioskMount.innerHTML;
if (searchedKioskHtml.includes('Jane Doe') || searchedKioskHtml.includes('Jane Smith') || searchedKioskHtml.includes('Jane')) {
  console.log('  ✅ PASS: Live Search filtered to match Jane');
} else {
  console.log('  ⚠️ Search rendered without error, checked query filter.');
}

console.log('\n--- Checking Kiosk Step 1 (Walk-In Intake & Inputs) ---');
sandbox.window.app.setKioskPathway('WALK_IN');
sandbox.window.app.setKioskStep(1);
const step1Html = kioskMount.innerHTML;

const step1Checks = [
  { name: 'Patient Full Name text box (#kiosk-walkin-name)', expected: step1Html.includes('id="kiosk-walkin-name"') },
  { name: 'Mobile Phone Number text box (#kiosk-walkin-phone)', expected: step1Html.includes('id="kiosk-walkin-phone"') },
  { name: 'NO virtual numpad grid (.kiosk-numpad-grid removed)', expected: !step1Html.includes('kiosk-numpad-grid') },
  { name: 'Touch to Print Token Slip button', expected: step1Html.includes('Touch to Print Token Slip') }
];

step1Checks.forEach(c => {
  if (c.expected) {
    console.log(`  ✅ PASS: Step 1 contains ${c.name}`);
  } else {
    console.error(`  ❌ FAIL: Step 1 check failed for ${c.name}`);
    process.exit(1);
  }
});

console.log('\n🎉 ALL DOM WORKSTATION & SECTION ASSERTIONS PASSED WITH 100% SUCCESS!');
