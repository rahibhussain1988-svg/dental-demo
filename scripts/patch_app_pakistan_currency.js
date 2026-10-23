const fs = require('fs');

const appPath = 'js/app.js';
let appCode = fs.readFileSync(appPath, 'utf8');

console.log('=== Updating js/app.js with Pakistan Currency & Localization ===');

// 1. Add formatCurrency method to ClinicApp
if (!appCode.includes('formatCurrency(val) {')) {
  appCode = appCode.replace(
    'class ClinicApp {',
    `class ClinicApp {
  formatCurrency(val) {
    const num = Math.round(Number(val) || 0);
    return 'Rs. ' + num.toLocaleString('en-PK');
  }`
  );
  console.log('✅ Added formatCurrency method to ClinicApp');
}

// 2. Update Kiosk Open Slots pricing
appCode = appCode.replace(
  "{ time: '11:30 AM', doc: 'Dr. Sarah Chen, DDS', chair: 'Chair 1: General', chairId: 'c1', docId: 'u2', fee: '$65' }",
  "{ time: '11:30 AM', doc: 'Dr. Sarah Chen, BDS', chair: 'Chair 1: General Operatory', chairId: 'c1', docId: 'u2', fee: 'Rs. 1,500' }"
);
appCode = appCode.replace(
  "{ time: '01:15 PM', doc: 'Dr. Marcus Vance, Ortho', chair: 'Chair 2: Ortho Bay', chairId: 'c2', docId: 'u3', fee: '$50' }",
  "{ time: '01:15 PM', doc: 'Dr. Marcus Vance, Ortho', chair: 'Chair 2: Ortho Bay', chairId: 'c2', docId: 'u3', fee: 'Rs. 2,000' }"
);
appCode = appCode.replace(
  "{ time: '03:30 PM', doc: 'Dr. Sarah Chen, DDS', chair: 'Chair 3: Surgical Suite', chairId: 'c3', docId: 'u2', fee: '$85' }",
  "{ time: '03:30 PM', doc: 'Dr. Sarah Chen, BDS', chair: 'Chair 3: Surgical Suite', chairId: 'c3', docId: 'u2', fee: 'Rs. 2,500' }"
);
appCode = appCode.replace(
  "{ time: '04:45 PM', doc: 'Liam Vance, RDA', chair: 'Chair 4: Hygiene Bay', chairId: 'c4', docId: 'u4', fee: '$40' }",
  "{ time: '04:45 PM', doc: 'Liam Vance, RDA', chair: 'Chair 4: Hygiene Bay', chairId: 'c4', docId: 'u4', fee: 'Rs. 1,200' }"
);

// 3. Update Step 1 Attending Clinician Fee & Concern list
appCode = appCode.replace(
  'const docFee = isOrtho ? "$50 Consult" : "$65 Exam & Consult";',
  'const docFee = isOrtho ? "Rs. 2,000 Consult" : "Rs. 1,500 Exam & Consult";'
);

appCode = appCode.replace("est: '$75'", "est: 'Rs. 3,000'");
appCode = appCode.replace("est: '$60'", "est: 'Rs. 2,500'");
appCode = appCode.replace("est: '$80'", "est: 'Rs. 4,000'");
appCode = appCode.replace("est: '$50'", "est: 'Rs. 2,000'");
appCode = appCode.replace("est: '$65'", "est: 'Rs. 1,500'");
appCode = appCode.replace("est: '$80'", "est: 'Rs. 4,500'");
appCode = appCode.replace("est: '$40'", "est: 'Rs. 1,500'");
appCode = appCode.replace("est: '$95'", "est: 'Rs. 3,500'");
appCode = appCode.replace("est: '$70'", "est: 'Rs. 2,500'");
appCode = appCode.replace("est: '$90'", "est: 'Rs. 4,000'");

// Step 1 Input Placeholders
appCode = appCode.replace('placeholder="e.g. John Doe (or leave blank)"', 'placeholder="e.g. Tariq Mehmood (or leave blank for Walk-in)"');
appCode = appCode.replace('placeholder="e.g. (555) 012-3456"', 'placeholder="e.g. 0300-1234567 or 0321-9876543"');
appCode = appCode.replace(
  'Used for SMS queue announcements and clinical records.',
  'Used for SMS queue announcements and clinical records across Pakistan.'
);

// Step 1 Button
appCode = appCode.replace(
  '<span>Touch to Print Token Slip</span>',
  '<span>Touch to Print Token Slip (Rs. 1,500)</span>'
);

// Emergency Triage
appCode = appCode.replace('placeholder="(555) 000-0000"', 'placeholder="0300-1234567"');

// 4. Update Cabin Procedures in Operatory
appCode = appCode.replace("{ code: 'D0120', name: 'Periodic Oral Exam', cost: 45 }", "{ code: 'D0120', name: 'Periodic Oral Exam', cost: 1500 }");
appCode = appCode.replace("{ code: 'D1110', name: 'Dental Hygiene Prophylaxis', cost: 80 }", "{ code: 'D1110', name: 'Dental Hygiene Prophylaxis', cost: 4500 }");
appCode = appCode.replace("{ code: 'D2330', name: 'Composite Resin 1-Surface', cost: 150 }", "{ code: 'D2330', name: 'Composite Resin 1-Surface', cost: 3500 }");
appCode = appCode.replace("{ code: 'D2740', name: 'Porcelain/Zirconia Crown', cost: 950 }", "{ code: 'D2740', name: 'Porcelain/Zirconia Crown', cost: 25000 }");
appCode = appCode.replace("{ code: 'D3330', name: 'Molar Endodontic Therapy', cost: 980 }", "{ code: 'D3330', name: 'Molar Endodontic Therapy', cost: 18000 }");
appCode = appCode.replace("{ code: 'D7140', name: 'Surgical Tooth Extraction', cost: 180 }", "{ code: 'D7140', name: 'Surgical Tooth Extraction', cost: 6000 }");
appCode = appCode.replace("{ code: 'D8670', name: 'Ortho Archwire Adjustment', cost: 75 }", "{ code: 'D8670', name: 'Ortho Archwire Adjustment', cost: 3000 }");
appCode = appCode.replace('<span class="badge badge-teal" style="font-size: 0.75rem;">+ $${p.cost}</span>', '<span class="badge badge-teal" style="font-size: 0.75rem;">+ Rs. ${p.cost.toLocaleString()}</span>');

// Quick Rx in Operatory
appCode = appCode.replace(
  `<button onclick="app.cabinAddRxChip('Clindamycin HCl', '300mg Q6H x 5d', 'Take with large glass of water. Penicillin safe.')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Clindamycin 300mg</strong> (Penicillin-Allergy Safe)
                </button>
                <button onclick="app.cabinAddRxChip('Amoxicillin', '500mg tid x 5 days', 'Take 1 capsule every 8 hours with water')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Amoxicillin 500mg</strong> (Dental Infection)
                </button>
                <button onclick="app.cabinAddRxChip('Ibuprofen', '600mg Q8H PRN', 'Take with food for dental swelling and pain')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Ibuprofen 600mg</strong> (Anti-Inflammatory Analgesic)
                </button>
                <button onclick="app.cabinAddRxChip('Chlorhexidine 0.2%', '10ml oral rinse bid', 'Swish 10ml in mouth for 60s after brushing')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  🧴 <strong>Chlorhexidine 0.2% Rinse</strong> (Gingival Disinfectant)
                </button>`,
  `<button onclick="app.cabinAddRxChip('Augmentin (Amoxicillin + Clavulanate)', '625mg BD x 5d', 'Take 1 tablet twice daily with meals (Dental Infection)')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Augmentin 625mg</strong> (Rs. 480 • Dental Abscess / Infection)
                </button>
                <button onclick="app.cabinAddRxChip('Flagyl (Metronidazole)', '400mg TDS x 5 days', 'Take 1 tablet thrice daily after food (Anaerobic / Gum Infection)')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Flagyl 400mg</strong> (Rs. 220 • Periodontal &amp; Gum Infection)
                </button>
                <button onclick="app.cabinAddRxChip('Brufen (Ibuprofen)', '400mg TDS PRN', 'Take with food for toothache swelling and inflammation')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Brufen 400mg</strong> (Rs. 180 • Analgesic &amp; Anti-Inflammatory)
                </button>
                <button onclick="app.cabinAddRxChip('Chlorhexidine 0.2% Rinse', '10ml mouthwash BD', 'Rinse 10ml in mouth for 60 seconds after brushing')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  🧴 <strong>Chlorhexidine 0.2% Mouthwash</strong> (Rs. 350 • Antiseptic Disinfectant)
                </button>`
);

// 5. Billing Station Labels & Currency
appCode = appCode.replace('Amount Tendered ($)', 'Amount Tendered (Rs.)');
appCode = appCode.replace('Change Due ($)', 'Change Due (Rs.)');
appCode = appCode.replace('<strong style="color: #0D9488;">${p.fee}</strong>', '<strong style="color: #0D9488;">Rs. ${Number(p.fee).toLocaleString()}</strong>');
appCode = appCode.replace('<strong>${subtotal}</strong>', '<strong>Rs. ${Number(subtotal).toLocaleString()}</strong>');
appCode = appCode.replace('<span>+${taxAmount}</span>', '<span>+Rs. ${Number(taxAmount).toLocaleString()}</span>');
appCode = appCode.replace('<span style="color: #0D9488;">${netTotal}</span>', '<span style="color: #0D9488;">Rs. ${Number(netTotal).toLocaleString()}</span>');
appCode = appCode.replace('<span>💳</span> Process Payment (${netTotal})', '<span>💳</span> Process Payment (Rs. ${Number(netTotal).toLocaleString()})');

// 6. Global KPI & Dashboard currency display
appCode = appCode.replace('<div class="kpi-value">$${totalCollected.toLocaleString()}</div>', '<div class="kpi-value">Rs. ${totalCollected.toLocaleString()}</div>');
appCode = appCode.replace('<span>$${totalBalance.toLocaleString()} Outstanding</span>', '<span>Rs. ${totalBalance.toLocaleString()} Outstanding</span>');
appCode = appCode.replace('<div class="kpi-value">$${totalInvoiced.toLocaleString()}</div>', '<div class="kpi-value">Rs. ${totalInvoiced.toLocaleString()}</div>');
appCode = appCode.replace('<div class="kpi-value" style="color: var(--success);">$${totalCollected.toLocaleString()}</div>', '<div class="kpi-value" style="color: var(--success);">Rs. ${totalCollected.toLocaleString()}</div>');
appCode = appCode.replace('<div class="kpi-value" style="color: var(--error);">$${totalDue.toLocaleString()}</div>', '<div class="kpi-value" style="color: var(--error);">Rs. ${totalDue.toLocaleString()}</div>');
appCode = appCode.replace('<div class="kpi-value">$${totalGross.toLocaleString()}</div>', '<div class="kpi-value">Rs. ${totalGross.toLocaleString()}</div>');

// Invoices & Ledgers
appCode = appCode.replace('<td><strong style="font-size: 0.98rem; color: var(--text-main);">$${inv.total}</strong></td>', '<td><strong style="font-size: 0.98rem; color: var(--text-main);">Rs. ${inv.total}</strong></td>');
appCode = appCode.replace('<td style="color: var(--success); font-weight: 700;">$${inv.paid}</td>', '<td style="color: var(--success); font-weight: 700;">Rs. ${inv.paid}</td>');
appCode = appCode.replace('<td style="color: ${inv.balance > 0 ? \'var(--error)\' : \'var(--success)\'}; font-weight: 800;">$${inv.balance}</td>', '<td style="color: ${inv.balance > 0 ? \'var(--error)\' : \'var(--success)\'}; font-weight: 800;">Rs. ${inv.balance}</td>');
appCode = appCode.replace('<span class="alert-chip-red">${CLINIC_ICONS.creditCard} Outstanding Balance: $${totalBalance}</span>', '<span class="alert-chip-red">${CLINIC_ICONS.creditCard} Outstanding Balance: Rs. ${totalBalance}</span>');
appCode = appCode.replace('<span class="alert-chip-blue">${CLINIC_ICONS.checkCircle} Account Current ($0.00 Due)</span>', '<span class="alert-chip-blue">${CLINIC_ICONS.checkCircle} Account Current (Rs. 0 Due)</span>');
appCode = appCode.replace('Estimated Cost: $${pt.treatmentPlans[0].estimatedTotal}', 'Estimated Cost: Rs. ${pt.treatmentPlans[0].estimatedTotal}');
appCode = appCode.replace('Estimated Total: <strong style="font-size: 1.2rem; color: var(--text-main);">$${plan.estimatedTotal}</strong>', 'Estimated Total: <strong style="font-size: 1.2rem; color: var(--text-main);">Rs. ${plan.estimatedTotal}</strong>');
appCode = appCode.replace('Subtotal: <strong>$${inv.subtotal || inv.total}</strong>', 'Subtotal: <strong>Rs. ${inv.subtotal || inv.total}</strong>');
appCode = appCode.replace('Total: <strong>$${inv.total}</strong>', 'Total: <strong>Rs. ${inv.total}</strong>');
appCode = appCode.replace('Paid: <strong>$${inv.paid}</strong>', 'Paid: <strong>Rs. ${inv.paid}</strong>');
appCode = appCode.replace('Balance Due: <strong style="color: ${inv.balance > 0 ? \'var(--error)\' : \'var(--success)\'}; font-size: 1.15rem;">$${inv.balance}</strong>', 'Balance Due: <strong style="color: ${inv.balance > 0 ? \'var(--error)\' : \'var(--success)\'}; font-size: 1.15rem;">Rs. ${inv.balance}</strong>');
appCode = appCode.replace('Gross Total: $${inv.total}', 'Gross Total: Rs. ${inv.total}');
appCode = appCode.replace('Amount Paid: $${inv.paid}', 'Amount Paid: Rs. ${inv.paid}');
appCode = appCode.replace('Remaining Balance Due: $${inv.balance}', 'Remaining Balance Due: Rs. ${inv.balance}');

// 7. Fix scroll behavior on switchStation
appCode = appCode.replace(
  "window.scrollTo({ top: 0, behavior: 'smooth' });",
  "window.scrollTo({ top: 0, behavior: 'instant' });"
);

fs.writeFileSync(appPath, appCode, 'utf8');
console.log('✅ Updated js/app.js successfully!');
