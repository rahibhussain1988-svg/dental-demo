const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');
let lines = content.split('\n');

function replaceMethod(startMethodName, nextMethodName, newMethodCode) {
  const startIdx = lines.findIndex(l => l.trim().startsWith(startMethodName + '('));
  if (startIdx === -1) {
    console.error('Method not found: ' + startMethodName);
    return false;
  }
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim().startsWith(nextMethodName + '('));
  if (endIdx === -1) {
    console.error('Next method not found: ' + nextMethodName);
    return false;
  }
  lines = lines.slice(0, startIdx).concat(newMethodCode.split('\n')).concat(lines.slice(endIdx));
  console.log('Replaced ' + startMethodName + ' (lines ' + (startIdx + 1) + ' to ' + (endIdx + 1) + ')');
  return true;
}

// 1. Upgraded renderOrthoTab
const newOrthoCode = `  renderOrthoTab(container) {
    const pt = this.selectedPatient;
    const ortho = pt.orthodonticCase;

    if (!ortho) {
      container.innerHTML = \`
        <div class="card" style="text-align: center; padding: 48px 24px; border-radius: var(--radius-xl);">
          <div style="color: var(--purple); margin-bottom: 16px; display: flex; justify-content: center;">
            \${CLINIC_ICONS.brackets}
          </div>
          <h4 style="font-size: 1.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">No Orthodontic Treatment Active</h4>
          <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 20px;">This patient has not commenced braces or clear aligners. Initialize an orthodontic treatment record to track malocclusion, archwire progressions, cephalometric metrics, and photographic stages.</p>
          <button class="btn btn-primary" onclick="app.initiateOrthoCase()">
            \${CLINIC_ICONS.brackets} Initiate Orthodontic Treatment Record
          </button>
        </div>
      \`;
      return;
    }

    const isOverdue = ortho.nextFollowUpDate && new Date(ortho.nextFollowUpDate) < new Date("2026-10-23");

    // Wire Progression Stages
    const stages = [
      { id: 1, name: "Stage 1: Alignment", wire: "0.014 CuNiTi", desc: "Rotations & Leveling" },
      { id: 2, name: "Stage 2: Leveling", wire: "0.018x0.025 NiTi", desc: "Arch Coordination" },
      { id: 3, name: "Stage 3: Working", wire: "0.019x0.025 SS", desc: "Space Closure / Torque" },
      { id: 4, name: "Stage 4: Finishing", wire: "0.021x0.025 TMA", desc: "Detailing & Settling" },
      { id: 5, name: "Stage 5: Retention", wire: "Essix / Hawley", desc: "Debond & Retainers" }
    ];

    const currentStageNum = ortho.currentStage && ortho.currentStage.includes("Stage 2") ? 2 :
                            ortho.currentStage && ortho.currentStage.includes("Stage 3") ? 3 :
                            ortho.currentStage && ortho.currentStage.includes("Stage 4") ? 4 :
                            ortho.currentStage && ortho.currentStage.includes("Stage 5") ? 5 : 1;

    container.innerHTML = \`
      \${isOverdue ? \`
        <div class="medical-alert-banner" style="background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 14px 18px; border-radius: var(--radius-lg);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="color: #DC2626;">\${CLINIC_ICONS.alertTriangle}</div>
            <div>
              <strong style="font-size: 0.95rem;">Orthodontic Recall Overdue</strong>
              <div style="font-size: 0.82rem; margin-top: 2px;">
                Scheduled follow-up was <strong>\${ortho.nextFollowUpDate}</strong>. Patient requires active archwire inspection, elastic vector verification, and bracket check.
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="app.navigateTo('appointments')">
            \${CLINIC_ICONS.calendar} Schedule Urgent Recall
          </button>
        </div>
      \` : ''}

      <!-- Orthodontic Case Header Banner -->
      <div class="ortho-summary-banner" style="margin-bottom: 24px; border-radius: var(--radius-xl); padding: 22px 24px; box-shadow: 0 4px 6px -1px rgba(13,148,136,0.15);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                Active Orthodontic Case
              </span>
              <span class="badge" style="background: #FFF; color: var(--purple); font-weight: 800; font-size: 0.78rem;">
                \${ortho.classification}
              </span>
            </div>
            <h3 style="font-size: 1.4rem; font-weight: 900; margin-top: 8px; color: #FFF; letter-spacing: -0.3px;">
              Orthodontic Management Console
            </h3>
            <p style="opacity: 0.9; font-size: 0.85rem; margin-top: 3px; color: #E0E7FF;">
              Treating Specialist: Dr. Marcus Vance, Orthodontist • Started: \${ortho.startDate} • Est. Duration: \${ortho.expectedDurationMonths || 18} Months
            </p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            \${isOverdue ? \`<span class="badge" style="background: #DC2626; color: #FFF; font-weight: 800; padding: 6px 12px;">RECALL OVERDUE</span>\` : ''}
            <div style="background: rgba(255,255,255,0.22); backdrop-filter: blur(8px); padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.85rem; color: #FFF; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #4ADE80; display: inline-block;"></span>
              <span>\${ortho.compliance} Compliance (\${ortho.progressPercent}% Complete)</span>
            </div>
          </div>
        </div>

        <div class="ortho-banner-grid" style="margin-top: 18px;">
          <div class="ortho-metric">
            <h5>Appliance System</h5>
            <p>\${ortho.applianceType}</p>
          </div>
          <div class="ortho-metric">
            <h5>Malocclusion</h5>
            <p>\${ortho.classification}</p>
          </div>
          <div class="ortho-metric">
            <h5>Current Phase</h5>
            <p>\${ortho.currentStage}</p>
          </div>
          <div class="ortho-metric">
            <h5>Next Follow-Up</h5>
            <p style="\${isOverdue ? 'color: #FECACA; font-weight: 800;' : ''}">
              \${ortho.nextFollowUpDate || 'Not Scheduled'}
            </p>
          </div>
          <div class="ortho-metric">
            <h5>Upper Archwire</h5>
            <p>\${ortho.upperArchwire || 'N/A'}</p>
          </div>
          <div class="ortho-metric">
            <h5>Lower Archwire</h5>
            <p>\${ortho.lowerArchwire || 'N/A'}</p>
          </div>
          <div class="ortho-metric">
            <h5>Elastics Vector</h5>
            <p>\${ortho.elastics || 'None'}</p>
          </div>
        </div>
      </div>

      <!-- 5-Stage Archwire Progression Stepper -->
      <div class="card" style="margin-bottom: 24px; border-radius: var(--radius-xl); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px; margin: 0;">
            \${CLINIC_ICONS.brackets}
            <span>Clinical Archwire Progression Sequence</span>
          </h4>
          <span class="badge badge-purple">Standard Biomechanical Protocol</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
          \${stages.map(s => {
            const isPassed = s.id < currentStageNum;
            const isCurrent = s.id === currentStageNum;
            return \`
              <div style="border-radius: var(--radius-lg); padding: 14px; border: 2px solid \${isCurrent ? 'var(--purple)' : isPassed ? 'var(--primary-teal)' : 'var(--border-color)'}; background: \${isCurrent ? '#FAF5FF' : isPassed ? '#F0FDFA' : '#FFF'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 800; color: \${isCurrent ? 'var(--purple)' : isPassed ? 'var(--primary-teal)' : 'var(--text-muted)'}; text-transform: uppercase;">
                    \${isPassed ? '✓ Completed' : isCurrent ? '● Active Phase' : '○ Upcoming'}
                  </span>
                  <span class="badge \${isCurrent ? 'badge-purple' : isPassed ? 'badge-teal' : 'badge-subtle'}" style="font-size: 0.7rem;">\${s.wire}</span>
                </div>
                <strong style="font-size: 0.88rem; display: block; color: var(--text-main);">\${s.name}</strong>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">\${s.desc}</div>
              </div>
            \`;
          }).join('')}
        </div>
      </div>

      <!-- Interactive Before & After Progress Comparison Slider -->
      <div class="card" style="margin-bottom: 24px; border-radius: var(--radius-xl);">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 16px 20px;">
          <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.chart}
            <span>Interactive Archform Superimposition (Before vs. Current Stage)</span>
          </div>
          <span class="badge badge-teal">Drag Slider Horizontally to Compare</span>
        </div>
        <div class="card-body" style="padding: 20px;">
          <div class="before-after-container" id="ortho-slider-box">
            <!-- After Image (Background) -->
            <div class="before-after-img-after">
              <svg viewBox="0 0 600 280" style="width: 100%; height: 100%; background: #0F172A;">
                <rect width="600" height="280" fill="#0F172A"/>
                <text x="500" y="36" fill="#10B981" font-size="12" font-weight="bold" text-anchor="middle">CURRENT PROGRESS</text>
                <path d="M100,220 Q300,50 500,220" fill="none" stroke="#10B981" stroke-width="8"/>
                <!-- Coordinated archform -->
                <circle cx="130" cy="195" r="16" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="170" cy="160" r="16" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="215" cy="130" r="18" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="265" cy="108" r="20" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="300" cy="100" r="22" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="335" cy="108" r="20" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="385" cy="130" r="18" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="430" cy="160" r="16" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
                <circle cx="470" cy="195" r="16" fill="#FFFFFF" stroke="#0D9488" stroke-width="3"/>
              </svg>
            </div>

            <!-- Before Image (Clipped overlay) -->
            <div class="before-after-img-before" id="ortho-before-img" style="clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);">
              <svg viewBox="0 0 600 280" style="width: 100%; height: 100%; background: #1E293B;">
                <rect width="600" height="280" fill="#1E293B"/>
                <text x="100" y="36" fill="#EF4444" font-size="12" font-weight="bold" text-anchor="middle">INITIAL PRESENTATION</text>
                <path d="M100,220 Q300,30 500,220" fill="none" stroke="#64748B" stroke-width="8"/>
                <!-- Crowded and rotated archform -->
                <circle cx="130" cy="198" r="16" fill="#CBD5E1"/>
                <circle cx="165" cy="165" r="15" fill="#CBD5E1"/>
                <circle cx="205" cy="140" r="17" fill="#CBD5E1" transform="rotate(-20, 205, 140)"/>
                <circle cx="250" cy="122" r="19" fill="#CBD5E1" transform="rotate(15, 250, 122)"/>
                <circle cx="295" cy="105" r="21" fill="#CBD5E1" transform="rotate(-10, 295, 105)"/>
                <circle cx="340" cy="120" r="19" fill="#CBD5E1" transform="rotate(25, 340, 120)"/>
                <circle cx="390" cy="142" r="17" fill="#CBD5E1"/>
                <circle cx="435" cy="166" r="15" fill="#CBD5E1"/>
                <circle cx="470" cy="198" r="16" fill="#CBD5E1"/>
              </svg>
            </div>

            <!-- Divider line & draggable handle -->
            <div class="before-after-divider" id="ortho-slider-divider" style="left: 50%;">
              <div class="before-after-handle" style="font-weight: 900; font-size: 14px;">⇄</div>
            </div>

            <!-- Slider input control -->
            <input type="range" class="before-after-slider-input" min="0" max="100" value="50" aria-label="Before after progress slider" oninput="app.updateBeforeAfter(this.value)">
          </div>
          <div style="text-align: center; margin-top: 12px; font-size: 0.85rem; color: var(--text-secondary);">
            Drag slider left / right to compare Initial Crowding vs. Month \${ortho.progressPercent > 70 ? '12' : '7'} Alignment
          </div>
        </div>
      </div>

      <!-- Before & After Progress Photo High-Res Cards -->
      <div class="card" style="margin-bottom: 24px; border-radius: var(--radius-xl);">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 16px 20px;">
          <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.camera}
            <span>Intraoral Photographic Records & Alignment Milestones</span>
          </div>
          <span class="badge badge-purple">High Resolution Intraoral Records</span>
        </div>

        <div class="card-body" style="padding: 20px;">
          <div class="compare-grid">
            <div class="photo-stage-card">
              <svg viewBox="0 0 200 150" style="background: #1E293B; width: 100%; border-radius: var(--radius-md);">
                <text x="100" y="25" fill="#94A3B8" font-size="11" text-anchor="middle">PRE-TREATMENT SCAN</text>
                <path d="M40,110 Q100,20 160,110" fill="none" stroke="#64748B" stroke-width="6"/>
                <circle cx="55" cy="98" r="8" fill="#E2E8F0"/>
                <circle cx="70" cy="80" r="8" fill="#E2E8F0"/>
                <circle cx="82" cy="72" r="9" fill="#E2E8F0" transform="rotate(-15, 82, 72)"/>
                <circle cx="98" cy="62" r="10" fill="#E2E8F0"/>
                <circle cx="114" cy="68" r="9" fill="#E2E8F0" transform="rotate(20, 114, 68)"/>
                <circle cx="128" cy="82" r="8" fill="#E2E8F0"/>
                <circle cx="145" cy="98" r="8" fill="#E2E8F0"/>
              </svg>
              <div class="photo-caption" style="padding: 10px 4px 4px;">
                <strong>Initial Presentation (Day 1)</strong>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Severe anterior crowding, 6mm overjet</div>
              </div>
            </div>

            <div class="photo-stage-card">
              <svg viewBox="0 0 200 150" style="background: #1E293B; width: 100%; border-radius: var(--radius-md);">
                <text x="100" y="25" fill="#94A3B8" font-size="11" text-anchor="middle">MONTH 7 MID-STAGE</text>
                <path d="M40,110 Q100,25 160,110" fill="none" stroke="#0D9488" stroke-width="4"/>
                <circle cx="55" cy="95" r="8" fill="#E2E8F0"/>
                <circle cx="70" cy="78" r="8" fill="#E2E8F0"/>
                <circle cx="85" cy="66" r="9" fill="#E2E8F0"/>
                <circle cx="100" cy="60" r="10" fill="#E2E8F0"/>
                <circle cx="115" cy="66" r="9" fill="#E2E8F0"/>
                <circle cx="130" cy="78" r="8" fill="#E2E8F0"/>
                <circle cx="145" cy="95" r="8" fill="#E2E8F0"/>
              </svg>
              <div class="photo-caption" style="padding: 10px 4px 4px;">
                <strong>Month 7 Alignment</strong>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Arch expanding, rotations resolving</div>
              </div>
            </div>

            <div class="photo-stage-card">
              <svg viewBox="0 0 200 150" style="background: #1E293B; width: 100%; border-radius: var(--radius-md);">
                <text x="100" y="25" fill="#10B981" font-size="11" text-anchor="middle">CURRENT PROGRESS</text>
                <path d="M40,110 Q100,30 160,110" fill="none" stroke="#10B981" stroke-width="5"/>
                <circle cx="55" cy="95" r="8" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
                <circle cx="70" cy="78" r="8" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
                <circle cx="85" cy="66" r="9" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
                <circle cx="100" cy="60" r="10" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
                <circle cx="115" cy="66" r="9" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
                <circle cx="130" cy="78" r="8" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
                <circle cx="145" cy="95" r="8" fill="#FFFFFF" stroke="#0D9488" stroke-width="2"/>
              </svg>
              <div class="photo-caption" style="padding: 10px 4px 4px;">
                <strong>Current Stage</strong>
                <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">Ideal archform, coordinated midline</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chronological Adjustment Timeline -->
      <div class="card" style="border-radius: var(--radius-xl);">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 16px 20px;">
          <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.report}
            <span>Orthodontic Adjustment Visit History</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openOrthoAdjustmentModal()">
            \${CLINIC_ICONS.userPlus} Record Adjustment Visit
          </button>
        </div>

        <div class="card-body" style="padding: 20px;">
          <div class="timeline-list">
            \${(ortho.adjustments || []).map(adj => \`
              <div class="timeline-item" style="padding-bottom: 16px;">
                <div class="timeline-dot" style="background: var(--purple);"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <strong style="font-size: 0.95rem; color: var(--text-main);">\${adj.date}</strong>
                  <span class="badge badge-purple">Verified Adjustment</span>
                </div>
                <div style="font-size: 0.88rem; color: var(--text-secondary); background: #F8FAFC; padding: 12px 16px; border-radius: var(--radius-md); border-left: 3px solid var(--purple);">
                  \${adj.notes}
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>
    \`;
  }`;

replaceMethod('renderOrthoTab', 'updateBeforeAfter', newOrthoCode);

// 2. Upgraded renderBilling
const newBillingCode = `  renderBilling(container) {
    let allInvoices = [];
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalDue = 0;

    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        allInvoices.push({ ...b, patientName: \`\${p.firstName} \${p.lastName}\`, patientId: p.id, patientMrn: p.mrn });
        totalInvoiced += (b.total || 0);
        totalCollected += (b.paid || 0);
        totalDue += (b.balance || 0);
      });
    });

    let filteredInvoices = allInvoices;
    if (this.currentBillingStatusFilter === "paid") filteredInvoices = allInvoices.filter(i => i.status === "Paid");
    else if (this.currentBillingStatusFilter === "partial") filteredInvoices = allInvoices.filter(i => i.status === "Partial");
    else if (this.currentBillingStatusFilter === "unpaid") filteredInvoices = allInvoices.filter(i => i.status === "Unpaid");

    container.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.creditCard}
            <span>Central Billing & Accounts Ledger</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Real-time accounts receivable • Split payment ledger • 80mm thermal receipts
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="app.exportDailyCollectionsCsv()">
            \${CLINIC_ICONS.report} Export Daily Collections CSV
          </button>
          <button class="btn btn-primary btn-sm" onclick="app.switchStation('BILLING_PHARMACY')">
            \${CLINIC_ICONS.creditCard} Open Cashier POS Terminal →
          </button>
        </div>
      </div>

      <!-- Financial Metrics Summary Cards -->
      <div class="executive-kpi-grid" style="margin-bottom: 24px;">
        <div class="executive-kpi-card" style="border-top-color: var(--primary-teal);">
          <div class="kpi-header">
            <span class="kpi-label">Gross Production</span>
            <div class="kpi-icon-badge" style="background: #CCFBF1; color: var(--primary-teal);">
              \${CLINIC_ICONS.chart}
            </div>
          </div>
          <div class="kpi-value">$\${totalInvoiced.toLocaleString()}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--text-secondary);">Total invoiced procedures</span>
          </div>
        </div>

        <div class="executive-kpi-card" style="border-top-color: var(--success);">
          <div class="kpi-header">
            <span class="kpi-label">Net Collections</span>
            <div class="kpi-icon-badge" style="background: #DCFCE7; color: var(--success);">
              \${CLINIC_ICONS.creditCard}
            </div>
          </div>
          <div class="kpi-value" style="color: var(--success);">$\${totalCollected.toLocaleString()}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--success); font-weight: 600;">\${totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% Realized collections</span>
          </div>
        </div>

        <div class="executive-kpi-card" style="border-top-color: var(--error);">
          <div class="kpi-header">
            <span class="kpi-label">Outstanding AR</span>
            <div class="kpi-icon-badge" style="background: #FEE2E2; color: var(--error);">
              \${CLINIC_ICONS.alertTriangle}
            </div>
          </div>
          <div class="kpi-value" style="color: var(--error);">$\${totalDue.toLocaleString()}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--error); font-weight: 600;">Pending copay & claims</span>
          </div>
        </div>

        <div class="executive-kpi-card" style="border-top-color: var(--secondary-blue);">
          <div class="kpi-header">
            <span class="kpi-label">Ledger Invoices</span>
            <div class="kpi-icon-badge" style="background: #E0F2FE; color: var(--secondary-blue);">
              \${CLINIC_ICONS.report}
            </div>
          </div>
          <div class="kpi-value">\${allInvoices.length}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--text-secondary);">Clinical billing encounters</span>
          </div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;">
        <button class="btn btn-sm \${this.currentBillingStatusFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('all')">
          All Invoices (\${allInvoices.length})
        </button>
        <button class="btn btn-sm \${this.currentBillingStatusFilter === 'paid' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('paid')">
          Paid In Full (\${allInvoices.filter(i => i.status === 'Paid').length})
        </button>
        <button class="btn btn-sm \${this.currentBillingStatusFilter === 'partial' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('partial')">
          Partial (\${allInvoices.filter(i => i.status === 'Partial').length})
        </button>
        <button class="btn btn-sm \${this.currentBillingStatusFilter === 'unpaid' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('unpaid')">
          Unpaid Due (\${allInvoices.filter(i => i.status === 'Unpaid').length})
        </button>
      </div>

      <div class="card" style="border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-color);">
        <div class="table-responsive">
          <table class="appointments-list-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Total Fee</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              \${filteredInvoices.map(inv => \`
                <tr>
                  <td><strong style="font-family: 'JetBrains Mono', monospace; color: var(--primary-teal);">#\${inv.id}</strong></td>
                  <td>\${inv.date}</td>
                  <td>
                    <strong>\${inv.patientName}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block; font-family: 'JetBrains Mono', monospace;">\${inv.patientMrn}</span>
                  </td>
                  <td><strong style="font-size: 0.98rem; color: var(--text-main);">$\${inv.total}</strong></td>
                  <td style="color: var(--success); font-weight: 700;">$\${inv.paid}</td>
                  <td style="color: \${inv.balance > 0 ? 'var(--error)' : 'var(--success)'}; font-weight: 800;">$\${inv.balance}</td>
                  <td>
                    <span class="badge \${inv.status === 'Paid' ? 'badge-green' : inv.status === 'Partial' ? 'badge-amber' : 'badge-red'}" style="font-size: 0.8rem; padding: 4px 10px;">
                      \${inv.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button class="btn btn-sm btn-outline" title="Print 80mm Thermal Receipt" onclick="app.printInvoiceReceipt('\${inv.id}')">
                        \${CLINIC_ICONS.printer} Receipt
                      </button>
                      \${inv.paid > 0 ? \`
                        <button class="btn btn-sm btn-outline" style="color: var(--error);" title="Issue Controlled Refund" onclick="app.openRefundModal('\${inv.id}', '\${inv.patientId}')">
                          \${CLINIC_ICONS.refresh} Refund
                        </button>
                      \` : ''}
                    </div>
                  </td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    \`;
  }`;

replaceMethod('renderBilling', 'renderReports', newBillingCode);

// 3. Upgraded renderReports
const newReportsCode = `  renderReports(container) {
    let allInvoices = [];
    let totalGross = 0;
    let totalCollected = 0;
    let totalDue = 0;

    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        allInvoices.push({ ...b, patientName: \`\${p.firstName} \${p.lastName}\` });
        totalGross += (b.total || 0);
        totalCollected += (b.paid || 0);
        totalDue += (b.balance || 0);
      });
    });

    const activeOrthoCount = this.store.patients.filter(p => p.orthodonticCase !== null).length;

    // Dynamically calculate 7-day revenue collections
    const baseDate = new Date("2026-10-23T12:00:00Z");
    const dailyData = [];
    let maxDaily = 100;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      
      const dayTotal = allInvoices
        .filter(inv => inv.date === iso)
        .reduce((sum, inv) => sum + (inv.paid || 0), 0);

      if (dayTotal > maxDaily) maxDaily = dayTotal;
      dailyData.push({ iso, dayName, amount: dayTotal });
    }

    // Dynamic procedure mix
    let procCounts = { ortho: 0, restorative: 0, preventive: 0, surgery: 0 };
    this.store.patients.forEach(p => {
      (p.treatmentPlans || []).forEach(plan => {
        (plan.procedures || []).forEach(proc => {
          const c = (proc.code || "").toUpperCase();
          if (c.startsWith("D8")) procCounts.ortho++;
          else if (c.startsWith("D2") || c.startsWith("D3")) procCounts.restorative++;
          else if (c.startsWith("D0") || c.startsWith("D1")) procCounts.preventive++;
          else if (c.startsWith("D7") || c.startsWith("D4") || c.startsWith("D6")) procCounts.surgery++;
          else procCounts.preventive++;
        });
      });
    });

    const totalProcs = Math.max(1, procCounts.ortho + procCounts.restorative + procCounts.preventive + procCounts.surgery);
    const orthoPct = Math.round((procCounts.ortho / totalProcs) * 100);
    const restPct = Math.round((procCounts.restorative / totalProcs) * 100);
    const prevPct = Math.round((procCounts.preventive / totalProcs) * 100);
    const surgPct = Math.max(0, 100 - (orthoPct + restPct + prevPct));

    container.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.chart}
            <span>Practice Performance & Clinical Analytics</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Computed clinical KPIs • Dynamic 7-day collections • Procedure mix distribution
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="app.exportDailyCollectionsCsv()">
            \${CLINIC_ICONS.report} Export Collections CSV
          </button>
          <button class="btn btn-outline btn-sm" onclick="app.exportPatientRegisterCsv()">
            \${CLINIC_ICONS.report} Export Patient Register CSV
          </button>
        </div>
      </div>

      <!-- Practice KPI Row -->
      <div class="executive-kpi-grid" style="margin-bottom: 24px;">
        <div class="executive-kpi-card" style="border-top-color: var(--primary-teal);">
          <div class="kpi-header">
            <span class="kpi-label">Total Billed Revenue</span>
            <div class="kpi-icon-badge" style="background: #CCFBF1; color: var(--primary-teal);">
              \${CLINIC_ICONS.creditCard}
            </div>
          </div>
          <div class="kpi-value">$\${totalGross.toLocaleString()}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--success); font-weight: 600;">✓ All clinical encounters</span>
          </div>
        </div>

        <div class="executive-kpi-card" style="border-top-color: var(--success);">
          <div class="kpi-header">
            <span class="kpi-label">Collected Deposits</span>
            <div class="kpi-icon-badge" style="background: #DCFCE7; color: var(--success);">
              \${CLINIC_ICONS.checkCircle}
            </div>
          </div>
          <div class="kpi-value" style="color: var(--success);">$\${totalCollected.toLocaleString()}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--text-secondary);">Realized cash & card receipts</span>
          </div>
        </div>

        <div class="executive-kpi-card" style="border-top-color: var(--error);">
          <div class="kpi-header">
            <span class="kpi-label">Outstanding Receivables</span>
            <div class="kpi-icon-badge" style="background: #FEE2E2; color: var(--error);">
              \${CLINIC_ICONS.alertTriangle}
            </div>
          </div>
          <div class="kpi-value" style="color: var(--error);">$\${totalDue.toLocaleString()}</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--error); font-weight: 600;">Copay balance pending</span>
          </div>
        </div>

        <div class="executive-kpi-card" style="border-top-color: var(--purple);">
          <div class="kpi-header">
            <span class="kpi-label">Active Ortho Cases</span>
            <div class="kpi-icon-badge" style="background: #F3E8FF; color: var(--purple);">
              \${CLINIC_ICONS.brackets}
            </div>
          </div>
          <div class="kpi-value" style="color: var(--purple);">\${activeOrthoCount} Cases</div>
          <div class="kpi-footer">
            <span style="font-size: 0.78rem; color: var(--text-secondary);">Braces & aligner patients</span>
          </div>
        </div>
      </div>

      <div class="analytics-charts-grid" style="margin-bottom: 24px;">
        <div class="card" style="border-radius: var(--radius-xl); padding: 20px;">
          <div class="card-header" style="padding: 0 0 16px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px;">
            <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              \${CLINIC_ICONS.chart}
              <span>7-Day Revenue Collections Actuals</span>
            </div>
            <span class="badge badge-teal">Live Aggregation</span>
          </div>

          <!-- Dynamic Bar Chart -->
          <div class="css-bar-chart" style="height: 180px;">
            \${dailyData.map(day => {
              const heightPct = Math.max(15, Math.round((day.amount / maxDaily) * 100));
              const displayAmt = day.amount > 0 ? \`$\${(day.amount / 1000).toFixed(1)}k\` : '$0';
              return \`
                <div class="bar-col">
                  <div class="bar-fill" style="height: \${heightPct}%; background: linear-gradient(180deg, var(--primary-teal), var(--dark-teal)); border-radius: 4px 4px 0 0;" title="\${day.iso}: $\${day.amount}">
                    <span style="position: absolute; top: -20px; font-size: 0.72rem; font-weight: 800; color: var(--text-main);">\${displayAmt}</span>
                  </div>
                  <span class="bar-label" style="font-weight: 600; font-size: 0.75rem;">\${day.dayName}</span>
                </div>
              \`;
            }).join('')}
          </div>
        </div>

        <div class="card" style="border-radius: var(--radius-xl); padding: 20px;">
          <div class="card-header" style="padding: 0 0 16px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px;">
            <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
              \${CLINIC_ICONS.tooth}
              <span>Clinical Procedure Mix Distribution</span>
            </div>
            <span class="badge badge-subtle">\${totalProcs} Recorded Procedures</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                <span style="font-weight: 600;">Orthodontics (Braces / Aligners)</span>
                <strong>\${orthoPct}% (\${procCounts.ortho})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: \${orthoPct}%; height: 100%; background: var(--purple);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                <span style="font-weight: 600;">Restorative & Endodontics</span>
                <strong>\${restPct}% (\${procCounts.restorative})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: \${restPct}%; height: 100%; background: var(--primary-teal);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                <span style="font-weight: 600;">Preventive & Hygiene (Exams / Cleanings)</span>
                <strong>\${prevPct}% (\${procCounts.preventive})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: \${prevPct}%; height: 100%; background: var(--secondary-blue);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 5px;">
                <span style="font-weight: 600;">Oral Surgery & Periodontics</span>
                <strong>\${surgPct}% (\${procCounts.surgery})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: \${surgPct}%; height: 100%; background: var(--warning);"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    \`;
  }`;

replaceMethod('renderReports', 'exportDailyCollectionsCsv', newReportsCode);

// 4. Upgraded renderAdmin
const newAdminCode = `  renderAdmin(container) {
    container.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.settings}
            <span>System Administration & Security Policies</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Staff access control matrix • CDT standard fee catalog • Audit safeguards
          </p>
        </div>
        <button class="btn btn-outline btn-sm" onclick="app.resetDemoData()">
          \${CLINIC_ICONS.refresh} Reset Prototype Demo Data
        </button>
      </div>

      <div class="card" style="margin-bottom: 24px; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-color);">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 16px 20px;">
          <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.users}
            <span>Clinical Staff Directory & Role-Based Access Control (RBAC)</span>
          </div>
          <span class="badge badge-teal">Multi-Role Security</span>
        </div>
        <div class="table-responsive">
          <table class="plan-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>System Role</th>
                <th>License / Credential</th>
                <th>Granted Permissions</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              \${STAFF_USERS.map(user => \`
                <tr>
                  <td>
                    <strong>\${user.name}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">\${user.email}</span>
                  </td>
                  <td>
                    <span class="badge" style="background: \${user.color}15; color: \${user.color}; font-weight: 800; font-size: 0.78rem;">
                      \${user.role.toUpperCase()}
                    </span>
                  </td>
                  <td><span style="font-family: 'JetBrains Mono', monospace; font-size: 0.82rem;">\${user.license || 'N/A'}</span></td>
                  <td><span style="font-size: 0.8rem; color: var(--text-secondary);">\${user.permissions.join(', ')}</span></td>
                  <td style="text-align: right;">
                    <button class="btn btn-sm btn-outline" onclick="app.store.setCurrentUser('\${user.id}'); app.setupRoleSwitcher(); app.renderCurrentScreen();">
                      Impersonate User
                    </button>
                  </td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-color);">
        <div class="card-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 16px 20px;">
          <div class="card-title" style="font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.creditCard}
            <span>CDT Clinical Procedure Catalog & Standard Fee Schedule</span>
          </div>
          <span class="badge badge-subtle">Standard Clinic Charges</span>
        </div>
        <div class="table-responsive">
          <table class="plan-table">
            <thead>
              <tr>
                <th>CDT Code</th>
                <th>Category</th>
                <th>Procedure Name</th>
                <th>Est. Duration</th>
                <th>Standard Fee</th>
              </tr>
            </thead>
            <tbody>
              \${this.store.procedures.slice(0, 10).map(proc => \`
                <tr>
                  <td><strong style="font-family: 'JetBrains Mono', monospace; color: var(--primary-teal);">\${proc.code}</strong></td>
                  <td><span class="badge badge-subtle">\${proc.category}</span></td>
                  <td><strong>\${proc.name}</strong></td>
                  <td>\${proc.duration} mins</td>
                  <td><strong style="color: var(--text-main); font-size: 0.95rem;">$\${proc.price}</strong></td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    \`;
  }`;

replaceMethod('renderAdmin', 'resetDemoData', newAdminCode);

// Write changes back to file
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');
console.log('Successfully elevated Orthodontics, Billing, Reports, and Admin modules in js/app.js!');
