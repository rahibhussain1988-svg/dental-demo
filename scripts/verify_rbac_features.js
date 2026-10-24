/**
 * Automated Verification Script: Role-Based Access Control (RBAC) & Feature Restriction
 * Target: /html/body/div[3]/section[6]/div/main/header/div[2]/div (#active-role-selector)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("Testing Role-Based Access Control (RBAC) & Feature Permissions...\n");

class SimpleElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this._innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.style = {};
    this.attributes = new Map();
    this.classList = {
      classes: new Set(),
      add: (c) => this.classList.classes.add(c),
      remove: (c) => this.classList.classes.delete(c),
      toggle: (c, v) => (v !== undefined ? v : !this.classList.classes.has(c)) ? this.classList.classes.add(c) : this.classList.classes.delete(c),
      contains: (c) => this.classList.classes.has(c)
    };
    this.children = [];
    this.childNodes = [{ nodeValue: '' }];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = val;
    // rough textContent extraction
    this.textContent = String(val).replace(/<[^>]*>/g, '').trim();
    this.childNodes[0].nodeValue = this.textContent;
  }

  setAttribute(k, v) { this.attributes.set(k, String(v)); this[k] = String(v); }
  getAttribute(k) { return this.attributes.get(k) || this[k] || null; }
  removeAttribute(k) { this.attributes.delete(k); delete this[k]; }
  remove() {}
  appendChild(child) { this.children.push(child); }
  addEventListener(event, fn) {}
  focus() {}
}

const elementMap = new Map();
function getOrCreate(id, tag = 'div') {
  if (!elementMap.has(id)) {
    elementMap.set(id, new SimpleElement(tag, id));
  }
  return elementMap.get(id);
}

// Pre-create known elements
const allScreens = [
  "dashboard",
  "registration",
  "search",
  "appointments",
  "queue",
  "record",
  "dentist-workspace",
  "orthodontics",
  "billing",
  "reports",
  "admin"
];

const sidebarNavItems = allScreens.map(scr => {
  const el = new SimpleElement('button');
  el.classList.add('nav-item');
  el.setAttribute('data-screen', scr);
  return el;
});

// Elements needed
getOrCreate('active-role-selector', 'select');
getOrCreate('header-user-avatar');
getOrCreate('header-user-role-badge');
getOrCreate('sidebar-user-avatar');
getOrCreate('sidebar-user-name');
getOrCreate('sidebar-user-role');
getOrCreate('toast-container');
getOrCreate('header-page-title');
getOrCreate('header-page-subtext');
getOrCreate('page-main-workspace');
getOrCreate('station-kiosk');
getOrCreate('station-tv');
getOrCreate('station-cabin');
getOrCreate('station-billing');
getOrCreate('station-pharmacy');
getOrCreate('station-admin');
getOrCreate('tab-btn-kiosk');
getOrCreate('tab-btn-tv');
getOrCreate('tab-btn-cabin');
getOrCreate('tab-btn-billing');
getOrCreate('tab-btn-pharmacy');
getOrCreate('tab-btn-admin');

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
    querySelector: (sel) => {
      if (sel === '.app-sidebar') return getOrCreate('app-sidebar');
      if (sel === '#toast-container') return getOrCreate('toast-container');
      return new SimpleElement('div');
    },
    querySelectorAll: (sel) => {
      if (sel.includes('.sidebar-nav .nav-item') || sel.includes('.nav-item')) {
        return sidebarNavItems;
      }
      return [];
    },
    body: new SimpleElement('body'),
    documentElement: new SimpleElement('html')
  },
  pageYOffset: 0,
  addEventListener: () => {},
  localStorage: new LocalStorageMock(),
  console,
  setTimeout,
  setInterval,
  clearInterval,
  clearTimeout,
  Date,
  Math,
  JSON,
  Array,
  Object,
  String,
  Number,
  Boolean,
  Set,
  Map,
  Promise
};

sandbox.window = sandbox;
sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.scrollTo = () => {};

vm.createContext(sandbox);

const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const odontogramJs = fs.readFileSync(path.join(__dirname, '../js/odontogram.js'), 'utf8');
const appJs = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

vm.runInContext(dataJs, sandbox);
vm.runInContext(odontogramJs, sandbox);
vm.runInContext(appJs, sandbox);

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`  ✅ PASS: ${message}`);
  }
}

const app = sandbox.app;
assert(Boolean(app), "ClinicApp instance initialized as app in sandbox");

console.log("\n--- Test 1: Verify Permission Matrix for all 6 Staff Roles ---");

// Test u1: Receptionist (Emma Brooks)
app.switchActiveUser("u1");
assert(app.store.currentUser.id === "u1", "u1 is active user");
assert(app.store.currentUser.role === "receptionist", "u1 role is receptionist");

const u1Allowed = allScreens.filter(s => app.isScreenAllowed(s, app.store.currentUser));
assert(u1Allowed.length === 5, `Receptionist has exactly 5 allowed screens (got ${u1Allowed.length}): ${u1Allowed.join(', ')}`);
assert(u1Allowed.includes("dashboard"), "Receptionist can access dashboard");
assert(u1Allowed.includes("registration"), "Receptionist can access registration");
assert(u1Allowed.includes("search"), "Receptionist can access search");
assert(u1Allowed.includes("appointments"), "Receptionist can access appointments");
assert(u1Allowed.includes("queue"), "Receptionist can access queue");
assert(!app.isScreenAllowed("record"), "Receptionist CANNOT access clinical records");
assert(!app.isScreenAllowed("dentist-workspace"), "Receptionist CANNOT access dentist operatory");
assert(!app.isScreenAllowed("orthodontics"), "Receptionist CANNOT access orthodontics");
assert(!app.isScreenAllowed("billing"), "Receptionist CANNOT access billing POS");
assert(!app.isScreenAllowed("reports"), "Receptionist CANNOT access reports");
assert(!app.isScreenAllowed("admin"), "Receptionist CANNOT access clinic admin");

// Test u2: Dentist (Dr. Sarah Chen, DDS)
app.switchActiveUser("u2");
assert(app.store.currentUser.id === "u2", "u2 is active user");
assert(app.store.currentUser.role === "dentist", "u2 role is dentist");
const u2Allowed = allScreens.filter(s => app.isScreenAllowed(s, app.store.currentUser));
assert(u2Allowed.length === 6, `Dentist has exactly 6 allowed screens (got ${u2Allowed.length}): ${u2Allowed.join(', ')}`);
assert(u2Allowed.includes("record"), "Dentist can access clinical records");
assert(u2Allowed.includes("dentist-workspace"), "Dentist can access dentist operatory");
assert(!app.isScreenAllowed("registration"), "Dentist CANNOT access registration");
assert(!app.isScreenAllowed("orthodontics"), "General Dentist CANNOT access specialized orthodontics");
assert(!app.isScreenAllowed("billing"), "Dentist CANNOT access cashier billing");
assert(!app.isScreenAllowed("admin"), "Dentist CANNOT access clinic admin");

// Test u3: Orthodontist (Dr. Marcus Vance)
app.switchActiveUser("u3");
assert(app.store.currentUser.id === "u3", "u3 is active user");
assert(app.store.currentUser.role === "orthodontist", "u3 role is orthodontist");
const u3Allowed = allScreens.filter(s => app.isScreenAllowed(s, app.store.currentUser));
assert(u3Allowed.length === 7, `Orthodontist has exactly 7 allowed screens (got ${u3Allowed.length}): ${u3Allowed.join(', ')}`);
assert(u3Allowed.includes("orthodontics"), "Orthodontist can access orthodontics module");
assert(u3Allowed.includes("record"), "Orthodontist can access clinical records");
assert(!app.isScreenAllowed("registration"), "Orthodontist CANNOT access registration");
assert(!app.isScreenAllowed("billing"), "Orthodontist CANNOT access billing");

// Test u4: Assistant (Liam Vance, RDA)
app.switchActiveUser("u4");
assert(app.store.currentUser.id === "u4", "u4 is active user");
assert(app.store.currentUser.role === "assistant", "u4 role is assistant");
const u4Allowed = allScreens.filter(s => app.isScreenAllowed(s, app.store.currentUser));
assert(u4Allowed.length === 5, `Assistant has exactly 5 allowed screens (got ${u4Allowed.length}): ${u4Allowed.join(', ')}`);
assert(u4Allowed.includes("dentist-workspace"), "Assistant can access dentist operatory chairside");
assert(!app.isScreenAllowed("record"), "Assistant CANNOT edit full dental chart records");
assert(!app.isScreenAllowed("orthodontics"), "Assistant CANNOT access orthodontics suite");
assert(!app.isScreenAllowed("billing"), "Assistant CANNOT access billing");
assert(!app.isScreenAllowed("admin"), "Assistant CANNOT access admin");

// Test u5: Cashier (Elena Rostova)
app.switchActiveUser("u5");
assert(app.store.currentUser.id === "u5", "u5 is active user");
assert(app.store.currentUser.role === "cashier", "u5 role is cashier");
const u5Allowed = allScreens.filter(s => app.isScreenAllowed(s, app.store.currentUser));
assert(u5Allowed.length === 4, `Cashier has exactly 4 allowed screens (got ${u5Allowed.length}): ${u5Allowed.join(', ')}`);
assert(u5Allowed.includes("billing"), "Cashier can access billing POS");
assert(u5Allowed.includes("reports"), "Cashier can access reports & analytics");
assert(!app.isScreenAllowed("appointments"), "Cashier CANNOT access clinical appointments");
assert(!app.isScreenAllowed("queue"), "Cashier CANNOT access clinical queue");
assert(!app.isScreenAllowed("record"), "Cashier CANNOT access clinical records");
assert(!app.isScreenAllowed("dentist-workspace"), "Cashier CANNOT access dentist operatory");

// Test u6: Admin (Dr. Sarah Chen Admin)
app.switchActiveUser("u6");
assert(app.store.currentUser.id === "u6", "u6 is active user");
assert(app.store.currentUser.role === "admin", "u6 role is admin");
const u6Allowed = allScreens.filter(s => app.isScreenAllowed(s, app.store.currentUser));
assert(u6Allowed.length === 11, `Admin has ALL 11 screens allowed (got ${u6Allowed.length})`);

console.log("\n--- Test 2: Sidebar Navigation DOM Filtering & Synchronization ---");

// Switch to Emma Brooks (Receptionist)
app.switchActiveUser("u1");

assert(sidebarNavItems.length === 11, `Sidebar has 11 nav items (found ${sidebarNavItems.length})`);

const visibleItems = sidebarNavItems.filter(item => item.style.display !== "none");
assert(visibleItems.length === 5, `Exactly 5 visible sidebar nav items for receptionist (found ${visibleItems.length})`);

const visibleScreens = visibleItems.map(item => item.getAttribute("data-screen"));
assert(visibleScreens.includes("dashboard"), "Sidebar shows dashboard");
assert(visibleScreens.includes("registration"), "Sidebar shows registration");
assert(visibleScreens.includes("search"), "Sidebar shows search");
assert(visibleScreens.includes("appointments"), "Sidebar shows appointments");
assert(visibleScreens.includes("queue"), "Sidebar shows queue");

const hiddenItems = sidebarNavItems.filter(item => item.style.display === "none");
assert(hiddenItems.length === 6, `Exactly 6 hidden sidebar nav items for receptionist (found ${hiddenItems.length})`);

const hiddenScreens = hiddenItems.map(item => item.getAttribute("data-screen"));
assert(hiddenScreens.includes("record"), "Sidebar hides record");
assert(hiddenScreens.includes("dentist-workspace"), "Sidebar hides dentist-workspace");
assert(hiddenScreens.includes("orthodontics"), "Sidebar hides orthodontics");
assert(hiddenScreens.includes("billing"), "Sidebar hides billing");
assert(hiddenScreens.includes("reports"), "Sidebar hides reports");
assert(hiddenScreens.includes("admin"), "Sidebar hides admin");

// Check Header & Sidebar Profile Elements
const headerAvatar = getOrCreate("header-user-avatar");
assert(headerAvatar && headerAvatar.textContent.trim() === "EB", `Header avatar updated to EB (got ${headerAvatar?.textContent.trim()})`);

const headerRoleBadge = getOrCreate("header-user-role-badge");
assert(headerRoleBadge && headerRoleBadge.textContent.trim() === "RECEPTIONIST", `Header role badge updated to RECEPTIONIST (got ${headerRoleBadge?.textContent.trim()})`);

const sidebarAvatar = getOrCreate("sidebar-user-avatar");
assert(sidebarAvatar && sidebarAvatar.textContent.includes("EB"), `Sidebar avatar includes EB`);

const sidebarName = getOrCreate("sidebar-user-name");
assert(sidebarName && sidebarName.textContent.trim() === "Emma Brooks", `Sidebar name updated to Emma Brooks`);

const sidebarRole = getOrCreate("sidebar-user-role");
assert(sidebarRole && sidebarRole.textContent.includes("5 Workspaces Allowed"), `Sidebar role shows 5 Workspaces Allowed`);

console.log("\n--- Test 3: Navigation Guard & Direct Route Protection ---");

// As receptionist, try to navigate to forbidden screen 'admin'
const navResultAdmin = app.navigateTo("admin");
assert(navResultAdmin === false, "navigateTo('admin') blocked for receptionist");
assert(app.currentScreen !== "admin", "currentScreen was NOT changed to admin");

// Try to navigate to forbidden screen 'billing'
const navResultBilling = app.navigateTo("billing");
assert(navResultBilling === false, "navigateTo('billing') blocked for receptionist");
assert(app.currentScreen !== "billing", "currentScreen was NOT changed to billing");

// Try to navigate to permitted screen 'queue'
const navResultQueue = app.navigateTo("queue");
assert(navResultQueue === true, "navigateTo('queue') succeeded for receptionist");
assert(app.currentScreen === "queue", "currentScreen correctly updated to queue");

console.log("\n--- Test 4: Live Workspace Auto-Redirection on User Switch ---");

// Switch to Admin, navigate to 'admin' screen
app.switchActiveUser("u6");
app.navigateTo("admin");
assert(app.currentScreen === "admin", "Admin is now on 'admin' screen");

// Now switch active user to Emma Brooks (u1 - Receptionist)
// Since 'admin' is restricted for receptionist, the app must auto-redirect to dashboard!
app.switchActiveUser("u1");
assert(app.currentScreen === "dashboard", `User automatically redirected to dashboard upon role restriction (got ${app.currentScreen})`);

console.log("\n--- Test 5: Cashier (u5) DOM & Navigation Protection ---");

// Switch to Cashier
app.switchActiveUser("u5");
assert(app.store.currentUser.role === "cashier", "Active role is cashier");

const cashierVisible = sidebarNavItems.filter(item => item.style.display !== "none").map(item => item.getAttribute("data-screen"));
assert(cashierVisible.length === 4, `Cashier has exactly 4 visible screens: ${cashierVisible.join(', ')}`);
assert(cashierVisible.includes("billing"), "Cashier has billing visible");
assert(cashierVisible.includes("reports"), "Cashier has reports visible");
assert(!cashierVisible.includes("appointments"), "Appointments hidden for cashier");

const navResultDoctor = app.navigateTo("dentist-workspace");
assert(navResultDoctor === false, "Cashier blocked from dentist workspace");
const navResultCashierBilling = app.navigateTo("billing");
assert(navResultCashierBilling === true, "Cashier allowed into billing workspace");
assert(app.currentScreen === "billing", "currentScreen is billing");

console.log("\n🎉 ALL RBAC FEATURE RESTRICTION TESTS PASSED WITH 100% SUCCESS!");
process.exit(0);
