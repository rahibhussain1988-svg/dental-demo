const fs = require('fs');

const appPath = 'js/app.js';
let code = fs.readFileSync(appPath, 'utf8');

console.log('Patching remaining 28 dollar strings in js/app.js...');

code = code.replace(
  'Policy #DD-88921 • Copay: 80/20 • Remaining: $1,250 / $2,000',
  'Policy #EFU-88921 • Copay: 80/20 • Remaining: Rs. 125,000 / Rs. 200,000 (EFU Health PK)'
);
code = code.replace(
  '<div class="summary-value">$${(pt.billing || []).reduce((acc, b) => acc + (b.balance || 0), 0)}</div>',
  '<div class="summary-value">Rs. ${(pt.billing || []).reduce((acc, b) => acc + (b.balance || 0), 0)}</div>'
);
code = code.replace(
  '<option value="${p.code}">${p.code}: ${p.name} ($${p.price})</option>',
  '<option value="${p.code}">${p.code}: ${p.name} (Rs. ${p.price})</option>'
);
code = code.replace(
  '${this.store.procedures.map(p => `<option value="${p.code}">${p.code}: ${p.name} ($${p.price})</option>`).join(\'\')}',
  '${this.store.procedures.map(p => `<option value="${p.code}">${p.code}: ${p.name} (Rs. ${p.price})</option>`).join(\'\')}'
);
code = code.replace(
  '<td><strong>$${p.cost}</strong></td>',
  '<td><strong>Rs. ${p.cost}</strong></td>'
);
code = code.replace(
  '<div>Approved Total: <strong style="font-size: 1.2rem; color: var(--success);">$${plan.procedures.filter(p => p.status === \'Approved\' || p.status === \'Completed\').reduce((acc, p) => acc + p.cost, 0)}</strong></div>',
  '<div>Approved Total: <strong style="font-size: 1.2rem; color: var(--success);">Rs. ${plan.procedures.filter(p => p.status === \'Approved\' || p.status === \'Completed\').reduce((acc, p) => acc + p.cost, 0)}</strong></div>'
);
code = code.replace(
  '<strong style="color: var(--text-main);">$${p.cost}</strong>',
  '<strong style="color: var(--text-main);">Rs. ${p.cost}</strong>'
);
code = code.replace('if (subEl) subEl.textContent = `$${subtotal}`;', 'if (subEl) subEl.textContent = `Rs. ${subtotal}`;');
code = code.replace('if (discEl) discEl.textContent = `-$${discount}`;', 'if (discEl) discEl.textContent = `-Rs. ${discount}`;');
code = code.replace('if (netEl) netEl.textContent = `$${netTotal}`;', 'if (netEl) netEl.textContent = `Rs. ${netTotal}`;');
code = code.replace(
  'action: `Generated Selective Invoice #${newInvoice.id} for $${newInvoice.total} (${items.length} procedures)`',
  'action: `Generated Selective Invoice #${newInvoice.id} for Rs. ${newInvoice.total} (${items.length} procedures)`'
);
code = code.replace(
  'this.showToast(`Invoice #${newInvoice.id} generated for $${newInvoice.total}!`, "success");',
  'this.showToast(`Invoice #${newInvoice.id} generated for Rs. ${newInvoice.total}!`, "success");'
);
code = code.replace(
  '<td style="text-align: right;">$${item.amount}</td>',
  '<td style="text-align: right;">Rs. ${item.amount}</td>'
);
code = code.replace(
  '${inv.discount ? `<div>Discount: <strong style="color: var(--success);">-$${inv.discount}</strong></div>` : \'\'}',
  '${inv.discount ? `<div>Discount: <strong style="color: var(--success);">-Rs. ${inv.discount}</strong></div>` : \'\'}'
);
code = code.replace(
  '<div>Paid: <strong style="color: var(--success);">$${inv.paid}</strong></div>',
  '<div>Paid: <strong style="color: var(--success);">Rs. ${inv.paid}</strong></div>'
);
code = code.replace(
  'document.getElementById("modal-pay-balance").textContent = `$${inv.balance}`;',
  'document.getElementById("modal-pay-balance").textContent = `Rs. ${inv.balance}`;'
);
code = code.replace(
  'action: `Recorded Payment of $${payAmount} via ${payMethod} (Ref: ${refNum || \'N/A\'})`',
  'action: `Recorded Payment of Rs. ${payAmount} via ${payMethod} (Ref: ${refNum || \'N/A\'})`'
);
code = code.replace(
  'this.showToast(`Payment of $${payAmount} recorded successfully!`, "success");',
  'this.showToast(`Payment of Rs. ${payAmount} recorded successfully!`, "success");'
);
code = code.replace(
  'document.getElementById("refund-modal-paid").textContent = `$${inv.paid}`;',
  'document.getElementById("refund-modal-paid").textContent = `Rs. ${inv.paid}`;'
);
code = code.replace(
  'this.showToast(`Refund of $${amount} processed successfully.`, "success");',
  'this.showToast(`Refund of Rs. ${amount} processed successfully.`, "success");'
);
code = code.replace(
  '<div class="kpi-value" style="color: var(--success);">$${totalCollected.toLocaleString()}</div>',
  '<div class="kpi-value" style="color: var(--success);">Rs. ${totalCollected.toLocaleString()}</div>'
);
code = code.replace(
  '<div class="kpi-value" style="color: var(--error);">$${totalDue.toLocaleString()}</div>',
  '<div class="kpi-value" style="color: var(--error);">Rs. ${totalDue.toLocaleString()}</div>'
);
code = code.replace(
  "const displayAmt = day.amount > 0 ? `$${(day.amount / 1000).toFixed(1)}k` : '$0';",
  "const displayAmt = day.amount > 0 ? `Rs. ${(day.amount / 1000).toFixed(1)}k` : 'Rs. 0';"
);
code = code.replace(
  'title="${day.iso}: $${day.amount}"',
  'title="${day.iso}: Rs. ${day.amount}"'
);
code = code.replace(
  '<td><strong style="color: var(--text-main); font-size: 0.95rem;">$${proc.price}</strong></td>',
  '<td><strong style="color: var(--text-main); font-size: 0.95rem;">Rs. ${proc.price}</strong></td>'
);
code = code.replace(
  '<td style="padding: 8px; text-align: right;">$${p.cost}</td>',
  '<td style="padding: 8px; text-align: right;">Rs. ${p.cost}</td>'
);
code = code.replace(
  '<div style="font-size: 1.25rem; font-weight: 800;">Estimated Total: $${plan.estimatedTotal}</div>',
  '<div style="font-size: 1.25rem; font-weight: 800;">Estimated Total: Rs. ${plan.estimatedTotal}</div>'
);
code = code.replace(
  '<td style="padding: 8px; text-align: right;">$${item.amount}</td>',
  '<td style="padding: 8px; text-align: right;">Rs. ${item.amount}</td>'
);

fs.writeFileSync(appPath, code, 'utf8');
console.log('✅ Replaced remaining dollar occurrences with Rs. in js/app.js!');
