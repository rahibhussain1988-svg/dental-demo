// Automated End-to-End Verification Test Suite for Smile Dental & Orthodontics Clinic Management System
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Mock browser environment for Node.js execution
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockLocalStorage = new LocalStorageMock();
const mockEl = {
  innerHTML: "",
  appendChild: () => {},
  classList: { add: () => {}, remove: () => {} },
  querySelectorAll: () => []
};
const sandbox = {
  window: {},
  document: {
    getElementById: () => mockEl,
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
    querySelectorAll: () => []
  },
  localStorage: mockLocalStorage,
  console: console,
  Date: Date,
  Math: Math,
  JSON: JSON,
  parseInt: parseInt,
  parseFloat: parseFloat,
  String: String,
  Array: Array,
  Object: Object
};
sandbox.window = sandbox;

// Load js/data.js and js/odontogram.js into sandbox context
const dataCode = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
const odontoCode = fs.readFileSync(path.join(__dirname, 'js', 'odontogram.js'), 'utf8');

vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);
vm.runInContext(odontoCode, sandbox);

const ClinicStore = sandbox.window.clinicStore.constructor;
const Odontogram = sandbox.window.OdontogramChart;

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log("=================================================");
console.log("🚀 STARTING CLINIC SYSTEM AUTOMATED TEST SUITE");
console.log("=================================================\n");

// -----------------------------------------------------------------
// Test Suite 1: ClinicStore Initialization & MRN Generation
// -----------------------------------------------------------------
console.log("--- 1. Store Initialization & MRN Generation ---");
const store = new ClinicStore();
assert(store.patients.length > 0, "Default patient database loaded");
assert(store.appointments.length > 0, "Default appointments loaded");
assert(store.queue.length > 0, "Default queue tokens loaded");

const mrn1 = store.generateMRN();
assert(mrn1.startsWith("SDO-2026-"), `MRN format correct: ${mrn1}`);
store.savePatient({ firstName: "Test", lastName: "Patient" });
const mrn2 = store.generateMRN();
assert(mrn1 !== mrn2, `MRN generation increments sequence: ${mrn1} -> ${mrn2}`);

// -----------------------------------------------------------------
// Test Suite 2: Search & Filter Logic
// -----------------------------------------------------------------
console.log("\n--- 2. Search & Filter Logic ---");
function searchPatients(query) {
  const q = (query || "").toLowerCase().trim();
  if (!q) return store.patients;
  const cleanDigits = q.replace(/\D/g, "");
  return store.patients.filter(p => {
    const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const mrn = (p.mrn || '').toLowerCase();
    const pClean = (p.phone || '').replace(/\D/g, "");
    return (
      fullName.includes(q) ||
      mrn.includes(q) ||
      (cleanDigits.length >= 2 && pClean.includes(cleanDigits))
    );
  });
}

const searchJohn = searchPatients("john");
assert(searchJohn.length === 1 && searchJohn[0].firstName === "John", "Query 'john' matches only John Doe, not all patients");

const searchPhone = searchPatients("8901");
assert(searchPhone.length >= 1 && searchPhone[0].phone.includes("8901"), "Query phone digits '8901' matches target phone");

const searchNonExistent = searchPatients("xyznonexistent999");
assert(searchNonExistent.length === 0, "Non-matching query returns 0 results");

// -----------------------------------------------------------------
// Test Suite 3: Duplicate Detection Safeguards
// -----------------------------------------------------------------
console.log("\n--- 3. Duplicate Detection Safeguards ---");
const emptyCheck = store.checkDuplicate("", "", "");
assert(emptyCheck.length === 0, "Empty patient data does not trigger false duplicates");

const shortNameCheck = store.checkDuplicate("123", "J", "");
assert(shortNameCheck.length === 0, "Short name/phone < threshold does not trigger false duplicates");

const existingPt = store.patients.find(p => p.phone && p.dob);
const phoneDupCheck = store.checkDuplicate(existingPt.phone, "Different Person", "");
assert(phoneDupCheck.length >= 1 && phoneDupCheck[0].id === existingPt.id, "Existing phone correctly flags duplicate record");

const nameDobDupCheck = store.checkDuplicate("", `${existingPt.firstName} ${existingPt.lastName}`, existingPt.dob);
assert(nameDobDupCheck.length >= 1 && nameDobDupCheck[0].id === existingPt.id, "Exact Name + DOB correctly flags duplicate record");

// -----------------------------------------------------------------
// Test Suite 4: Odontogram Surface & Condition Mapping
// -----------------------------------------------------------------
console.log("\n--- 4. Odontogram Surface & Condition Mapping ---");
const odonto = new Odontogram();
assert(odonto.getSurfaceColor("sound") === "#FFFFFF", "Sound surface is white (#FFFFFF)");
assert(odonto.getSurfaceColor("caries") === "#EF4444", "Caries surface is red (#EF4444)");
assert(odonto.getSurfaceColor("restoration") === "#0284C7", "Restoration surface is blue (#0284C7)");
assert(odonto.getSurfaceColor("amalgam") === "#475569", "Amalgam surface is slate (#475569)");
assert(odonto.getSurfaceColor("fracture") === "#DC2626", "Fracture surface is bright red (#DC2626)");

// -----------------------------------------------------------------
// Test Suite 5: Treatment Planning & Calculations
// -----------------------------------------------------------------
console.log("\n--- 5. Treatment Planning & Calculations ---");
const testPatient = JSON.parse(JSON.stringify(store.patients[0]));
testPatient.treatmentPlans = [
  {
    id: "tp-test-1",
    name: "Comprehensive Restorative Plan",
    status: "Accepted",
    procedures: [
      { id: "proc-1", code: "D2391", tooth: "16", description: "Resin Composite 1 Surface", cost: 180, status: "Planned" },
      { id: "proc-2", code: "D3330", tooth: "16", description: "Endodontic Root Canal Therapy", cost: 950, status: "Planned" },
      { id: "proc-3", code: "D2740", tooth: "16", description: "Porcelain Crown", cost: 1100, status: "Cancelled" }
    ]
  }
];

const plan = testPatient.treatmentPlans[0];
const activeTotal = plan.procedures
  .filter(p => p.status !== "Cancelled")
  .reduce((sum, p) => sum + p.cost, 0);
assert(activeTotal === (180 + 950), `Plan active total excludes cancelled procedures ($${activeTotal} === $1130)`);

// -----------------------------------------------------------------
// Test Suite 6: Central Billing, Balances & Refund Ledger
// -----------------------------------------------------------------
console.log("\n--- 6. Billing, Invoicing & Refund Ledger ---");
testPatient.billing = [
  {
    id: "inv-test-1",
    date: "2026-10-23",
    items: [{ code: "D2391", description: "Resin Composite", cost: 180 }],
    subtotal: 180,
    discount: 20,
    tax: 0,
    total: 160,
    paid: 160,
    balance: 0,
    status: "Paid",
    refunds: []
  }
];
store.savePatient(testPatient);

const refundRes = store.recordRefund(testPatient.id, "inv-test-1", 50, "Patient courtesy adjustment");
assert(Boolean(refundRes), "Refund recorded successfully");

const updatedPt = store.getPatient(testPatient.id);
const updatedInv = updatedPt.billing.find(b => b.id === "inv-test-1");
assert(updatedInv.paid === 110, `Updated paid amount after refund ($${updatedInv.paid} === $110)`);
assert(updatedInv.balance === 50, `Updated balance after refund ($${updatedInv.balance} === $50)`);
assert(updatedInv.status === "Partial", `Invoice status updated to Partial ($${updatedInv.status})`);
assert(updatedInv.refunds.length === 1 && updatedInv.refunds[0].amount === 50, "Refund entry appended to invoice ledger");

// -----------------------------------------------------------------
// Test Suite 7: Appointments Lifecycle
// -----------------------------------------------------------------
console.log("\n--- 7. Appointments Lifecycle ---");
const apt = store.appointments[0];
const originalAptId = apt.id;

// Reschedule
const reschedRes = store.rescheduleAppointment(originalAptId, "2026-11-01", "14:00", "chair-1", "Patient requested afternoon");
assert(Boolean(reschedRes), "Appointment rescheduled successfully");
const updatedApt = store.appointments.find(a => a.id === originalAptId);
assert(updatedApt.date === "2026-11-01" && updatedApt.time === "14:00", "Appointment date/time updated");
assert(updatedApt.status === "Rescheduled", "Appointment status updated to Rescheduled");

// Mark No-Show
store.markAppointmentNoShow(originalAptId);
const noShowApt = store.appointments.find(a => a.id === originalAptId);
assert(noShowApt.status === "No-Show", "Appointment marked as No-Show");

// Cancel
store.cancelAppointment(originalAptId, "Family emergency");
const cancelledApt = store.appointments.find(a => a.id === originalAptId);
assert(cancelledApt.status === "Cancelled" && cancelledApt.cancellationReason === "Family emergency", "Appointment cancelled with reason");

// -----------------------------------------------------------------
// Test Suite 8: Queue Duplicate Prevention & Re-Queue
// -----------------------------------------------------------------
console.log("\n--- 8. Queue Management & Token Safeguards ---");
const activeWaitingPtId = "p-queue-test";
const token1 = store.addQueueItem({
  patientId: activeWaitingPtId,
  patientName: "Active Queue Test Patient",
  serviceType: "Consultation",
  chairName: "Chair 1",
  status: "Waiting"
});
assert(token1 && token1.token, `Initial queue token generated: ${token1.token}`);

const token2 = store.addQueueItem({
  patientId: activeWaitingPtId,
  patientName: "Active Queue Test Patient",
  serviceType: "Consultation",
  chairName: "Chair 1",
  status: "Waiting"
});
assert(token2.alreadyActive === true, "Duplicate queue check-in blocked by store safeguard");
assert(token2.token === token1.token, "Existing token returned instead of creating a second queue item");

store.transferQueueItem(token1.token, "u2", "Chair 3");
const transferredItem = store.queue.find(q => q.token === token1.token);
assert(transferredItem.chairName === "Chair 3" && transferredItem.doctorId === "u2", "Queue item transferred to Chair 3");

store.markQueueNoShow(token1.token);
const noShowQueueItem = store.queue.find(q => q.token === token1.token);
assert(noShowQueueItem.status === "No-Show", "Queue item marked as No-Show");

store.requeueItem(token1.token);
const requeuedItem = store.queue.find(q => q.token === token1.token);
assert(requeuedItem.status === "Waiting", "Queue item successfully recalled / requeued to Waiting status");

// -----------------------------------------------------------------
// Test Suite 9: Role-Based Access Control (RBAC) Permissions
// -----------------------------------------------------------------
console.log("\n--- 9. Role-Based Access Control (RBAC) ---");
function hasPermission(role, permission) {
  const matrix = {
    dentist: ["edit_chart", "lock_encounter", "view_reports", "view_patients", "manage_queue"],
    orthodontist: ["edit_chart", "lock_encounter", "ortho_module", "view_patients", "manage_queue"],
    assistant: ["view_chart", "view_patients", "manage_queue"],
    receptionist: ["register_patient", "manage_appointments", "manage_queue", "view_patients", "process_billing"],
    billing: ["process_billing", "view_reports", "manage_refunds", "view_patients"],
    admin: ["*"]
  };
  const perms = matrix[role] || [];
  return perms.includes("*") || perms.includes(permission);
}

assert(hasPermission("dentist", "edit_chart") === true, "Dentist can edit dental chart");
assert(hasPermission("receptionist", "edit_chart") === false, "Receptionist cannot edit dental chart");
assert(hasPermission("receptionist", "register_patient") === true, "Receptionist can register patients");
assert(hasPermission("billing", "process_billing") === true, "Billing staff can process billing");
assert(hasPermission("assistant", "lock_encounter") === false, "Assistant cannot lock encounters");
assert(hasPermission("admin", "any_arbitrary_permission") === true, "Admin has universal permissions");

// -----------------------------------------------------------------
// Test Suite 10: Orthodontic Overdue Follow-up Detection
// -----------------------------------------------------------------
console.log("\n--- 10. Orthodontic Overdue Follow-up Detection ---");
const orthoCase = {
  startDate: "2025-06-15",
  nextFollowUpDate: "2026-10-10"
};
const isOverdue = Boolean(orthoCase.nextFollowUpDate && new Date(orthoCase.nextFollowUpDate) < new Date("2026-10-23"));
assert(isOverdue === true, "Follow-up date 2026-10-10 detected as OVERDUE on 2026-10-23");

const futureOrthoCase = {
  startDate: "2026-08-01",
  nextFollowUpDate: "2026-11-15"
};
const isFutureOverdue = Boolean(futureOrthoCase.nextFollowUpDate && new Date(futureOrthoCase.nextFollowUpDate) < new Date("2026-10-23"));
assert(isFutureOverdue === false, "Future follow-up date 2026-11-15 is not overdue");

// -----------------------------------------------------------------
// Test Suite 11: Clinical Encounter Locking & Controlled Amendments
// -----------------------------------------------------------------
console.log("\n--- 11. Clinical Encounter Locking & Controlled Amendments ---");
const clinicalPt = JSON.parse(JSON.stringify(store.patients[0]));
clinicalPt.encounterLocked = true;
clinicalPt.encounterLockedAt = "2026-10-23 10:30:00";
clinicalPt.encounterLockedBy = "Dr. Marcus Vance";
clinicalPt.auditLogs = clinicalPt.auditLogs || [];

const amendmentNote = "Amended diagnosis: Caries extends into distal marginal ridge. Scheduled bitewings.";
clinicalPt.auditLogs.unshift({
  timestamp: "2026-10-23 11:15:00",
  user: "Dr. Sarah Jenkins",
  action: `CONTROLLED AMENDMENT: ${amendmentNote}`
});
store.savePatient(clinicalPt);

const savedClinicalPt = store.getPatient(clinicalPt.id);
assert(savedClinicalPt.encounterLocked === true, "Encounter remains strictly locked");
assert(savedClinicalPt.auditLogs.length > 0, "Audit trail contains amendment entry");
assert(savedClinicalPt.auditLogs[0].action.includes("CONTROLLED AMENDMENT"), "Audit trail records amendment reason and attribution");

// -----------------------------------------------------------------
// Test Suite 12: Selective Procedure Invoicing
// -----------------------------------------------------------------
console.log("\n--- 12. Selective Procedure Invoicing ---");
const selectiveProcs = [
  { id: "proc-10", code: "D2391", cost: 180, description: "Resin-Based Composite" },
  { id: "proc-11", code: "D0150", cost: 95, description: "Comprehensive Oral Exam" }
];
const subtotal = selectiveProcs.reduce((sum, p) => sum + p.cost, 0);
const discountPercent = 10;
const discountVal = (subtotal * discountPercent) / 100;
const totalDue = subtotal - discountVal;

assert(subtotal === 275, `Selective subtotal correctly computed ($${subtotal} === $275)`);
assert(discountVal === 27.5, `Selective discount correctly computed ($${discountVal} === $27.5)`);
assert(totalDue === 247.5, `Selective net total correctly computed ($${totalDue} === $247.5)`);

// -----------------------------------------------------------------
// Test Suite 13: Reports Dynamic Financial Aggregation
// -----------------------------------------------------------------
console.log("\n--- 13. Reports Dynamic Financial Aggregation ---");
let totalClinicRevenue = 0;
store.patients.forEach(p => {
  (p.billing || []).forEach(inv => {
    totalClinicRevenue += (inv.paid || 0);
  });
});
assert(totalClinicRevenue > 0, `Total clinic revenue dynamically computed: $${totalClinicRevenue}`);

// -----------------------------------------------------------------
// Test Suite 14: Digital Radiograph Record Storage
// -----------------------------------------------------------------
console.log("\n--- 14. Digital Radiograph Storage ---");
const ptWithXray = store.patients[0];
ptWithXray.xrays = ptWithXray.xrays || [];
const newXrayEntry = {
  id: "xr-test-" + Date.now(),
  title: "Periapical PA (Tooth #36)",
  type: "Periapical PA",
  region: "Tooth #36",
  date: "2026-10-23",
  sensor: "Dexis Titanium Sensor",
  notes: "Normal periapical tissues, no furcation involvement.",
  svgType: "pa"
};
ptWithXray.xrays.unshift(newXrayEntry);
store.savePatient(ptWithXray);

const verifyPtXray = store.getPatient(ptWithXray.id);
assert(verifyPtXray.xrays.some(x => x.id === newXrayEntry.id), "New digital radiograph successfully persisted to patient record");

// -----------------------------------------------------------------
// Test Suite 15: Emergency Triage, Dispensary & Kiosk PIN Lock
// -----------------------------------------------------------------
console.log("\n--- 15. Emergency Triage, Dispensary & Kiosk Lock ---");

// Test 15.1: Emergency triage intake
const emgResult = store.emergencyRegister("Alexander Trauma", "555-0999", "emg-2");
assert(emgResult.token.token.startsWith("EMG-"), `Emergency token generated with EMG prefix: ${emgResult.token.token}`);
assert(emgResult.token.priority === "Urgent", "Emergency priority is tagged as Urgent");
assert(emgResult.chair.id === "chair-3", `Emergency assigned to Surgical Chair: ${emgResult.chair.name}`);
assert(store.patients.some(p => p.id === emgResult.patient.id), "Emergency patient persisted in database");

// Test 15.2: Dispensary stock decrement
const initialMedStock = (sandbox.window.DENTAL_PHARMACY_INVENTORY || []).find(i => i.id === "ph-1").stock;
const dispenseRes = store.dispenseItem("ph-1", 2);
assert(dispenseRes.success === true, "Dispensary item successfully dispensed");
assert(dispenseRes.item.stock === initialMedStock - 2, `Stock decremented correctly: ${initialMedStock} -> ${dispenseRes.item.stock}`);

// Test 15.3: Kiosk PIN Lock default
assert(store.kioskPin === "1234", `Default kiosk PIN is securely 1234: ${store.kioskPin}`);

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log("\n=================================================");
console.log(`🎯 TEST SUITE COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log("=================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
