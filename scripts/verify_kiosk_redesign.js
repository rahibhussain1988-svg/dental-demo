const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Testing Dental Clinic Walk-In Registration Kiosk Redesign & Healthcare Workflow...');

class SimpleElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.innerHTML = '';
    this.value = '';
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
  remove() {}
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

[
  'clock-time', 'clock-date', 'kiosk-btn-time',
  'kiosk-main-mount', 'tv-main-mount', 'cabin-main-mount', 'billing-main-mount', 'pharmacy-main-mount',
  'station-kiosk', 'station-tv', 'station-cabin', 'station-billing', 'station-pharmacy', 'station-admin',
  'global-modal-mount', 'kiosk-thermal-modal', 'thermal-receipt-container', 'toast-container',
  'kiosk-live-appt-search', 'kiosk-walkin-name', 'kiosk-walkin-phone', 'kiosk-emg-name', 'kiosk-emg-phone',
  'kiosk-matched-patient-banner', 'kiosk-validation-error', 'kiosk-print-token-btn'
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

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

console.log('\n--- Test 1: Service Categories & Step 1 Selection ---');
const app = sandbox.window.app;
assert(sandbox.window.KIOSK_SERVICE_CATEGORIES.length === 4, '4 Kiosk Service Categories configured');
assert(sandbox.window.KIOSK_SERVICE_CATEGORIES[0].name === 'General Dentistry', 'Category 1 is General Dentistry');
assert(sandbox.window.KIOSK_SERVICE_CATEGORIES[1].name.includes('Orthodontics'), 'Category 2 is Orthodontics & Braces');
assert(sandbox.window.KIOSK_SERVICE_CATEGORIES[2].name === 'Emergency Dental Care', 'Category 3 is Emergency Dental Care');
assert(sandbox.window.KIOSK_SERVICE_CATEGORIES[3].name === 'Other Dental Services', 'Category 4 is Other Dental Services');

app.setKioskService('ortho');
assert(app.kioskState.serviceId === 'ortho', 'Active service updated to ortho');
assert(app.kioskState.selectedChair === 'chair-4', 'Ortho service assigns Chair 4 (Orthodontic Bay)');
assert(app.kioskState.selectedConcernId === 'ortho-consult', 'Ortho service defaults to ortho-consult concern');

app.setKioskService('emergency');
assert(app.kioskState.serviceId === 'emergency', 'Active service updated to emergency');
assert(app.kioskState.selectedChair === 'chair-3', 'Emergency service assigns Chair 3 (Surgical Suite)');
assert(app.kioskState.selectedConcernId === 'emg-abscess', 'Emergency service defaults to emg-abscess concern');

app.setKioskService('general');
assert(app.kioskState.serviceId === 'general', 'Active service updated to general');
assert(app.kioskState.selectedChair === 'chair-1', 'General service assigns Chair 1 (General Operatory)');
assert(app.kioskState.selectedConcernId === 'gen-exam', 'General service defaults to gen-exam concern');

console.log('\n--- Test 2: Step 2 Primary Concern Selection & Incompatibility Reset ---');
const genService = app.getActiveKioskService();
assert(genService.concerns.length >= 5, 'General dentistry contains >= 5 concerns');

app.selectKioskConcern('gen-cleaning');
assert(app.kioskState.selectedConcernId === 'gen-cleaning', 'Selected concern is gen-cleaning');
const activeConcern = app.getActiveKioskConcern();
assert(activeConcern.name === 'Ultrasonic Scaling & Polishing', 'Active concern resolved correctly');

// Switch to ortho: previous gen-cleaning MUST reset to ortho-consult!
app.setKioskService('ortho');
assert(app.kioskState.selectedConcernId === 'ortho-consult', 'Concern reset upon service switch (incompatible concern prevented)');
assert(app.getActiveKioskConcern().name === 'New Patient Braces & Ortho Consult', 'Active concern is ortho concern');

app.setKioskService('general');
app.selectKioskConcern('gen-filling');
assert(app.getActiveKioskConcern().name === 'Tooth Restoration (Composite Filling)', 'Selected gen-filling correctly');

console.log('\n--- Test 3: Clinician Card & Queue Information ---');
const generalClinician = app.getActiveKioskService();
assert(generalClinician.doctorName.includes('Sarah Chen'), 'Attending clinician is Dr. Sarah Chen for General');
assert(generalClinician.doctorTitle.includes('Senior'), 'Clinician qualifications displayed');
assert(generalClinician.estWait === '~10m', 'Estimated wait time is ~10m');

console.log('\n--- Test 4: Pricing Breakdown & Order Summary ---');
const kioskMount = elementMap.get('kiosk-main-mount');
const html = kioskMount.innerHTML;
assert(html.includes('Rs. 1,500'), 'Order summary contains Base Consultation Fee Rs. 1,500');
assert(html.includes('Est. Rs. 3,500'), 'Order summary contains concern procedure fee Est. Rs. 3,500');
assert(html.includes('Payable Now (Token Registration):'), 'Order summary clearly distinguishes Payable Now at Registration');

console.log('\n--- Test 5: Patient Lookup & Duplicate Matching ---');
app.onKioskPhoneInput('234-8901'); // Phone of John Miller
assert(app.kioskState.matchedPatient !== null, 'Existing patient matched by phone');
assert(app.kioskState.matchedPatient.name === 'John Miller' || app.kioskState.matchedPatient.firstName === 'John', 'Matched patient is John Miller');
assert(elementMap.get('kiosk-matched-patient-banner').style.display === 'flex', 'Matched patient banner visible');

app.onKioskPhoneInput('0300-9999999'); // Non-existent phone
assert(app.kioskState.matchedPatient === null, 'Non-existent phone clears matched patient');
assert(elementMap.get('kiosk-matched-patient-banner').style.display === 'none', 'Matched patient banner hidden');

console.log('\n--- Test 6: In-line Validation ---');
elementMap.get('kiosk-walkin-name').value = '';
elementMap.get('kiosk-walkin-phone').value = '';
app.kioskState.name = '';
app.kioskState.phone = '';
app.issueWalkinToken();
assert(app.kioskState.validationError.length > 0, 'Validation error triggered when name and phone are empty');
assert(elementMap.get('kiosk-validation-error').style.display === 'block', 'Validation error banner displayed');

console.log('\n--- Test 7: Registration & Thermal Slip Issuance ---');
elementMap.get('kiosk-walkin-name').value = 'Zubair Khan';
elementMap.get('kiosk-walkin-phone').value = '0300-5551234';
app.kioskState.name = 'Zubair Khan';
app.kioskState.phone = '0300-5551234';

const initialQueueLen = app.store.queue.length;
app.issueWalkinToken();
assert(app.store.queue.length === initialQueueLen + 1, 'Queue incremented with new patient token');
const latestToken = app.store.queue[app.store.queue.length - 1];
assert(latestToken.patientName === 'Zubair Khan', 'Queue item has patient Zubair Khan');
assert(latestToken.token.startsWith('T-'), `Token issued with T- prefix: ${latestToken.token}`);

const receiptHtml = elementMap.get('thermal-receipt-container').innerHTML;
assert(receiptHtml.includes(latestToken.token), 'Thermal slip contains token number');
assert(receiptHtml.includes('Plot 14-B, Executive Medical Plaza, Blue Area, Islamabad'), 'Thermal slip contains Islamabad address');
assert(receiptHtml.includes('+92 (51) 289-4321'), 'Thermal slip contains Pakistan clinic phone');
assert(receiptHtml.includes('Token Consultation Fee'), 'Thermal slip clearly shows token consultation fee');

console.log('\n--- Test 8: Duplicate Registration Prevention ---');
// If Zubair Khan attempts to register again immediately while active
elementMap.get('kiosk-walkin-name').value = 'Zubair Khan';
elementMap.get('kiosk-walkin-phone').value = '0300-5551234';
const queueCountBefore = app.store.queue.length;
app.issueWalkinToken();
assert(app.store.queue.length === queueCountBefore, 'Duplicate registration prevented: existing active token reused');

console.log('\n🎉 ALL 8 KIOSK REDESIGN & WORKFLOW VERIFICATIONS PASSED WITH 100% SUCCESS!\n');
