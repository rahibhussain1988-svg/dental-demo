const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let code = fs.readFileSync(appJsPath, 'utf8');

// 1. Add CLINIC_ICONS at top of js/app.js if not already present
if (!code.includes('const CLINIC_ICONS = {')) {
  const iconsDefinition = `/**
 * Centralized High-DPI Vector SVG Icon Library
 * Prevents character encoding corruption across Windows & Unix systems
 */
const CLINIC_ICONS = {
  tooth: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.5 2 5 5 5 9.5c0 3.5 1.5 7.5 3.5 11.5 1 1.8 2 2.5 3.5 2.5s2.5-.7 3.5-2.5c2-4 3.5-8 3.5-11.5C19 5 16.5 2 12 2z"/><path d="M12 2v9"/></svg>',
  calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  userPlus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="8" rx="1"/><rect x="13" y="6" width="3" height="12" rx="1"/><rect x="19" y="13" width="3" height="5" rx="1"/></svg>',
  stethoscope: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M13.5 12.5v3.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V12.5"/><circle cx="18" cy="10" r="3"/><path d="M15 10h-1.5"/></svg>',
  brackets: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M8 12h8"/></svg>',
  creditCard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  report: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  tv: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  kiosk: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
  pharmacy: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>',
  lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  alertTriangle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  checkCircle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  printer: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  sound: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
  pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>',
  refresh: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
  xray: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  camera: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
  chair: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 19v2"/><path d="M18 19v2"/><path d="M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6H4Z"/><path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5"/></svg>',
  emergency: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  arrowRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
};
if (typeof window !== 'undefined') window.CLINIC_ICONS = CLINIC_ICONS;
`;

  code = iconsDefinition + '\n' + code;
}

// 2. Redesign renderDashboard
const newRenderDashboard = `  renderDashboard(container) {
    const today = "2026-10-23";
    const todayApts = this.store.appointments.filter(a => a.date === today);
    const waitingPatients = this.store.queue.filter(q => q.status === "Waiting");
    const inConsult = this.store.queue.filter(q => q.status === "In Consultation");
    const completedToday = this.store.queue.filter(q => q.status === "Completed");
    const orthoCases = this.store.patients.filter(p => p.orthodonticCase !== null);

    // Calculate production & collections
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalBalance = 0;
    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        totalInvoiced += (b.total || 0);
        totalCollected += (b.paid || 0);
        totalBalance += (b.balance || 0);
      });
    });

    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

    container.innerHTML = \`
      <!-- 1. Executive Clinic Command Banner -->
      <div class="dashboard-hero-banner">
        <div class="hero-clinic-info">
          <h2>
            \${CLINIC_ICONS.tooth}
            <span>Smile Dental & Orthodontics • Operations Command</span>
          </h2>
          <p>
            Real-time multispecialty practice telemetry • 4 digital operatories online • Comprehensive restorative dentistry & dentofacial orthopedics.
          </p>
          <div class="hero-live-badges">
            <span class="hero-live-pill">
              <span class="pulse-dot-green"></span>
              4 Operatories Active
            </span>
            <span class="hero-live-pill">
              <span class="pulse-dot-green"></span>
              Emergency Triage Monitored
            </span>
            <span class="hero-live-pill">
              \${CLINIC_ICONS.stethoscope}
              Clinicians: Dr. Chen, DDS • Dr. Vance (Ortho)
            </span>
          </div>
        </div>

        <div class="hero-action-buttons">
          <button class="btn-hero-primary" onclick="app.navigateTo('registration')">
            \${CLINIC_ICONS.userPlus}
            <span>Register Walk-in</span>
          </button>
          <button class="btn-hero-glass" onclick="app.openQuickTokenModal()">
            \${CLINIC_ICONS.kiosk}
            <span>Issue Token Slip</span>
          </button>
          <button class="btn-hero-glass" onclick="app.openSamplePatientRecord()">
            \${CLINIC_ICONS.chart}
            <span>Open Sample Chart</span>
          </button>
        </div>
      </div>

      <!-- 2. Executive 4-KPI Metric Grid -->
      <div class="executive-kpi-grid">
        <div class="executive-kpi-card" onclick="app.navigateTo('appointments')">
          <div class="kpi-header">
            <span class="kpi-title">Today's Patient Volume</span>
            <div class="kpi-icon-badge" style="background: #E0F2FE; color: #0284C7;">
              \${CLINIC_ICONS.calendar}
            </div>
          </div>
          <div class="kpi-value">\${todayApts.length} Patients</div>
          <div class="kpi-footer">
            <span class="trend-badge trend-up">↑ 14% vs avg</span>
            <span>\${todayApts.filter(a => a.status === 'Completed').length} completed • \${todayApts.filter(a => a.status === 'In Chair').length} in-chair</span>
          </div>
        </div>

        <div class="executive-kpi-card" onclick="app.navigateTo('queue')">
          <div class="kpi-header">
            <span class="kpi-title">Operatory Occupancy</span>
            <div class="kpi-icon-badge" style="background: #CCFBF1; color: #0D9488;">
              \${CLINIC_ICONS.chair}
            </div>
          </div>
          <div class="kpi-value">75% Occupied</div>
          <div class="kpi-footer">
            <span class="trend-badge trend-up">3 of 4 Active</span>
            <span>Avg chair turnover ~8 mins</span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: 75%; background: #0D9488;"></div>
          </div>
        </div>

        <div class="executive-kpi-card" onclick="app.navigateTo('billing')">
          <div class="kpi-header">
            <span class="kpi-title">Gross Collections</span>
            <div class="kpi-icon-badge" style="background: #DCFCE7; color: #16A34A;">
              \${CLINIC_ICONS.creditCard}
            </div>
          </div>
          <div class="kpi-value">$\${totalCollected.toLocaleString()}</div>
          <div class="kpi-footer">
            <span class="trend-badge trend-up">\${collectionRate}% Collected</span>
            <span>$\${totalBalance.toLocaleString()} Outstanding</span>
          </div>
          <div class="kpi-progress-bar">
            <div class="kpi-progress-fill" style="width: \${collectionRate}%; background: #16A34A;"></div>
          </div>
        </div>

        <div class="executive-kpi-card" onclick="app.navigateTo('orthodontics')">
          <div class="kpi-header">
            <span class="kpi-title">Active Orthodontic Cases</span>
            <div class="kpi-icon-badge" style="background: #F3E8FF; color: #7C3AED;">
              \${CLINIC_ICONS.brackets}
            </div>
          </div>
          <div class="kpi-value">\${orthoCases.length} Active</div>
          <div class="kpi-footer">
            <span class="trend-badge trend-neutral">Damon & Aligners</span>
            <span>0 overdue recalls</span>
          </div>
        </div>
      </div>

      <!-- 3. Interactive 4-Operatory Chair Floorplan Matrix -->
      <div class="floorplan-section-header">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
          \${CLINIC_ICONS.chair}
          <span>Live Operatory Chair Matrix</span>
        </h3>
        <span style="font-size: 0.82rem; color: var(--text-secondary);">4 High-Precision Sirona Intego Operatories</span>
      </div>

      <div class="floorplan-grid">
        <!-- Chair 1 -->
        <div class="operatory-card occupied">
          <div class="operatory-card-top">
            <div>
              <div class="operatory-name">Chair 1 (General)</div>
              <div class="operatory-suite">Suite A • Restorative</div>
            </div>
            <span class="operatory-status-pill status-occupied">
              <span class="pulse-dot-green"></span> In Procedure
            </span>
          </div>
          <div class="operatory-body">
            <div class="chair-patient-box">
              <div class="chair-patient-name">
                <span>John Miller</span>
                <span class="chair-elapsed-time">22m</span>
              </div>
              <div class="chair-procedure">Composite Resin #14 (O/D)</div>
            </div>
            <div class="chair-doctor">
              \${CLINIC_ICONS.stethoscope}
              <span>Dr. Sarah Chen, DDS</span>
            </div>
          </div>
          <div class="operatory-actions">
            <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="app.openSamplePatientRecord()">Chart</button>
            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.navigateTo('queue')">Queue</button>
          </div>
        </div>

        <!-- Chair 2 -->
        <div class="operatory-card occupied">
          <div class="operatory-card-top">
            <div>
              <div class="operatory-name">Chair 2 (Restorative)</div>
              <div class="operatory-suite">Suite B • Endodontics</div>
            </div>
            <span class="operatory-status-pill status-occupied">
              <span class="pulse-dot-green"></span> In Procedure
            </span>
          </div>
          <div class="operatory-body">
            <div class="chair-patient-box">
              <div class="chair-patient-name">
                <span>Emily Zhang</span>
                <span class="chair-elapsed-time">15m</span>
              </div>
              <div class="chair-procedure">Crown Delivery #30 (Zirconia)</div>
            </div>
            <div class="chair-doctor">
              \${CLINIC_ICONS.stethoscope}
              <span>Dr. Sarah Chen, DDS</span>
            </div>
          </div>
          <div class="operatory-actions">
            <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="app.openPatientRecordByMrn('SDO-2026-0102')">Chart</button>
            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.navigateTo('queue')">Queue</button>
          </div>
        </div>

        <!-- Chair 3 -->
        <div class="operatory-card available">
          <div class="operatory-card-top">
            <div>
              <div class="operatory-name">Chair 3 (Surgical)</div>
              <div class="operatory-suite">Suite C • Oral Surgery & Implants</div>
            </div>
            <span class="operatory-status-pill status-available">
              ● Ready & Sanitized
            </span>
          </div>
          <div class="operatory-body">
            <div class="chair-patient-box" style="background: #F0FDF4; border-color: #DCFCE7;">
              <div class="chair-patient-name" style="color: #15803D;">
                <span>Turnover Complete</span>
                <span style="font-size: 0.75rem; color: #16A34A;">Ready</span>
              </div>
              <div class="chair-procedure" style="color: #16A34A;">Autoclaved instrument tray staged</div>
            </div>
            <div class="chair-doctor">
              \${CLINIC_ICONS.stethoscope}
              <span>Emergency Triage Priority Bay</span>
            </div>
          </div>
          <div class="operatory-actions">
            <button class="btn btn-sm btn-primary" style="width: 100%;" onclick="app.callNextPatient()">Call Next Patient</button>
          </div>
        </div>

        <!-- Chair 4 -->
        <div class="operatory-card occupied">
          <div class="operatory-card-top">
            <div>
              <div class="operatory-name">Chair 4 (Ortho Bay)</div>
              <div class="operatory-suite">Suite D • Orthodontics</div>
            </div>
            <span class="operatory-status-pill status-occupied">
              <span class="pulse-dot-green"></span> In Procedure
            </span>
          </div>
          <div class="operatory-body">
            <div class="chair-patient-box">
              <div class="chair-patient-name">
                <span>Chloe Bennett</span>
                <span class="chair-elapsed-time">10m</span>
              </div>
              <div class="chair-procedure">0.019x0.025 SS Wire Progression</div>
            </div>
            <div class="chair-doctor">
              \${CLINIC_ICONS.brackets}
              <span>Dr. Marcus Vance (Chief Ortho)</span>
            </div>
          </div>
          <div class="operatory-actions">
            <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="app.openPatientRecordByMrn('SDO-2026-0104')">Chart</button>
            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.navigateTo('orthodontics')">Ortho</button>
          </div>
        </div>
      </div>

      <!-- 4. Operations Hub Split: Today's Appointments Timeline & Live Reception Queue -->
      <div class="operations-hub-split">
        <!-- Schedule Timeline Column -->
        <div class="timeline-schedule-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                \${CLINIC_ICONS.calendar}
                <span>Today's Treatment Schedule</span>
              </h4>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">Chronological patient schedule across all 4 operatories</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="app.navigateTo('appointments')">Full Calendar →</button>
          </div>

          <div class="schedule-timeline-list">
            \${todayApts.slice(0, 5).map(a => \`
              <div class="schedule-slot-item">
                <div class="slot-time-badge">\${a.time}</div>
                <div class="slot-patient-info">
                  <div class="slot-patient-name">
                    <span>\${a.patientName}</span>
                    <span class="badge \${a.status === 'Completed' ? 'badge-green' : a.status === 'In Chair' ? 'badge-teal' : 'badge-amber'}">\${a.status}</span>
                  </div>
                  <div class="slot-meta">
                    <span>\${a.service}</span>
                    <span>•</span>
                    <span style="color: var(--primary-teal); font-weight: 600;">\${a.chairName}</span>
                  </div>
                </div>
                <div>
                  <button class="btn btn-sm btn-outline" onclick="app.openPatientRecordByMrn('\${a.patientMrn}')">Record</button>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>

        <!-- Live Queue Column -->
        <div class="queue-snapshot-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                \${CLINIC_ICONS.users}
                <span>Reception Queue (\${waitingPatients.length})</span>
              </h4>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">Waiting room status with live SLA benchmark</span>
            </div>
            <button class="btn btn-sm btn-outline" onclick="app.navigateTo('queue')">Queue Board →</button>
          </div>

          <div class="queue-snapshot-list">
            \${this.store.queue.slice(0, 4).map(item => \`
              <div class="queue-row-item">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div class="queue-row-token">\${item.token}</div>
                  <div>
                    <strong style="font-size: 0.9rem; color: var(--text-main);">\${item.patientName}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">\${item.service}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="\${item.waitTimeMinutes > 25 ? 'queue-sla-red' : item.waitTimeMinutes > 15 ? 'queue-sla-amber' : 'queue-sla-green'}">
                    ~\${item.waitTimeMinutes}m wait
                  </span>
                  <button class="btn btn-sm btn-primary" onclick="app.openPatientRecordByMrn('\${item.mrn}')">View</button>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>

      <!-- 5. Core Clinic Action Hub (9 Large Kiosk Tiles) -->
      <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 16px; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
        \${CLINIC_ICONS.kiosk}
        <span>Practice Navigation & Action Hub</span>
      </h3>

      <div class="kiosk-tiles-grid">
        <div class="kiosk-tile" onclick="app.navigateTo('registration')">
          <span class="badge badge-teal tile-badge">Guided Wizard</span>
          <div class="tile-icon-wrapper" style="background: var(--primary-teal-light); color: var(--primary-teal);">
            \${CLINIC_ICONS.userPlus}
          </div>
          <div>
            <div class="tile-title">1. New Patient Registration</div>
            <div class="tile-desc">Register new patients with duplicate checking, medical history, and photo ID creation.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('search')">
          <span class="badge badge-blue tile-badge">Instant Lookup</span>
          <div class="tile-icon-wrapper" style="background: var(--secondary-blue-light); color: var(--secondary-blue);">
            \${CLINIC_ICONS.search}
          </div>
          <div>
            <div class="tile-title">2. Find Patient Charts</div>
            <div class="tile-desc">Search electronic medical records by patient name, phone number, MRN, or simulated QR badge.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('appointments')">
          <span class="badge badge-amber tile-badge">\${todayApts.length} Today</span>
          <div class="tile-icon-wrapper" style="background: var(--warning-light); color: var(--warning);">
            \${CLINIC_ICONS.calendar}
          </div>
          <div>
            <div class="tile-title">3. Master Appointments</div>
            <div class="tile-desc">Chair matrix, week view, conflict warnings, rescheduling, and 1-click arrival check-in.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('queue')">
          <span class="badge badge-red tile-badge">\${waitingPatients.length} Waiting</span>
          <div class="tile-icon-wrapper" style="background: var(--error-light); color: var(--error);">
            \${CLINIC_ICONS.users}
          </div>
          <div>
            <div class="tile-title">4. Patient Queue & Tokens</div>
            <div class="tile-desc">Digital waiting room queue, doctor chair calling, acoustic chimes, and thermal slips.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.openSamplePatientRecord()">
          <span class="badge badge-teal tile-badge">Interactive Chart</span>
          <div class="tile-icon-wrapper" style="background: var(--primary-teal-light); color: var(--primary-teal);">
            \${CLINIC_ICONS.tooth}
          </div>
          <div>
            <div class="tile-title">5. Dental Records & Odontogram</div>
            <div class="tile-desc">32-adult & 20-primary FDI odontogram, 5-surface mapping, periodontal charting, and locked encounters.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('orthodontics')">
          <span class="badge badge-purple tile-badge">Specialty</span>
          <div class="tile-icon-wrapper" style="background: var(--purple-light); color: var(--purple);">
            \${CLINIC_ICONS.brackets}
          </div>
          <div>
            <div class="tile-title">6. Orthodontic Suite</div>
            <div class="tile-desc">Braces and aligner tracking, archwire progression stepper, and before/after photo slider.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('billing')">
          <span class="badge badge-green tile-badge">Cashier POS</span>
          <div class="tile-icon-wrapper" style="background: var(--success-light); color: var(--success);">
            \${CLINIC_ICONS.creditCard}
          </div>
          <div>
            <div class="tile-title">7. Billing & Payments</div>
            <div class="tile-desc">Itemized ADA/CDT invoicing, selective procedures, copay calculator, cash change, and receipts.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('reports')">
          <span class="badge badge-subtle tile-badge">Analytics</span>
          <div class="tile-icon-wrapper" style="background: #F1F5F9; color: var(--text-secondary);">
            \${CLINIC_ICONS.report}
          </div>
          <div>
            <div class="tile-title">8. Reports & Analytics</div>
            <div class="tile-desc">Daily production, collections ledger, clinician workload, wait times, and CSV data export.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('admin')">
          <span class="badge badge-subtle tile-badge">Governance</span>
          <div class="tile-icon-wrapper" style="background: #F1F5F9; color: var(--text-secondary);">
            \${CLINIC_ICONS.settings}
          </div>
          <div>
            <div class="tile-title">9. Clinic Administration</div>
            <div class="tile-desc">Staff roles & permissions matrix, clinician licenses, fee schedule, and HIPAA audit trail.</div>
          </div>
        </div>
      </div>
    \`;
  }`;

// Replace renderDashboard in code
code = code.replace(/renderDashboard\(container\) \{[\s\S]*?openSamplePatientRecord\(\)/, newRenderDashboard + '\n\n  openSamplePatientRecord()');

// 3. Redesign renderPatientRecord
const newRenderPatientRecord = `  renderPatientRecord(container, activeTab = "overview") {
    if (!this.selectedPatient) {
      this.selectedPatient = this.store.patients[0];
    }
    const pt = this.selectedPatient;
    const age = pt.dob ? Math.abs(new Date(Date.now() - new Date(pt.dob).getTime()).getUTCFullYear() - 1970) : "N/A";
    const totalBalance = (pt.billing || []).reduce((acc, b) => acc + (b.balance || 0), 0);

    container.innerHTML = \`
      <!-- Top Sticky Patient Clinical Summary Banner -->
      <div class="patient-clinical-banner">
        <div class="patient-bio-section">
          <div class="patient-avatar-frame">
            <img src="\${pt.photoUrl}" class="patient-avatar-img" alt="\${pt.firstName}">
            <div class="patient-avatar-badge" title="Active Patient"></div>
          </div>
          <div>
            <div class="patient-title-row">
              <span class="patient-full-name">\${pt.firstName} \${pt.lastName}</span>
              <span class="patient-mrn-pill">\${pt.mrn}</span>
              <span class="badge badge-teal">Permanent Record</span>
            </div>
            <div class="patient-meta-row">
              <span>\${age} yrs • \${pt.gender}</span>
              <span>•</span>
              <span>DOB: \${pt.dob}</span>
              <span>•</span>
              <span>Blood: <strong>\${pt.bloodGroup || 'O+'}</strong></span>
              <span>•</span>
              <span>Phone: \${pt.phone}</span>
            </div>
            <!-- High-Impact Medical Safety Alert Bar -->
            <div class="patient-alerts-row">
              \${(pt.medicalInfo?.allergies || []).map(a => \`
                <span class="alert-chip-red">\${CLINIC_ICONS.alertTriangle} ALLERGY: \${a.name} (\${a.severity})</span>
              \`).join('')}
              \${(pt.medicalInfo?.conditions || []).map(c => \`
                <span class="alert-chip-amber">\${CLINIC_ICONS.alertTriangle} Alert: \${c}</span>
              \`).join('')}
              \${totalBalance > 0 ? \`
                <span class="alert-chip-red">\${CLINIC_ICONS.creditCard} Outstanding Balance: $\${totalBalance}</span>
              \` : \`
                <span class="alert-chip-blue">\${CLINIC_ICONS.checkCircle} Account Current ($0.00 Due)</span>
              \`}
              \${pt.orthodonticCase ? \`<span class="badge badge-purple">\${CLINIC_ICONS.brackets} Orthodontic Case Active</span>\` : ''}
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <!-- Insurance Info Box -->
          <div class="patient-insurance-box">
            <div class="insurance-title">Primary Dental Coverage</div>
            <div class="insurance-carrier">Delta Dental Premier PPO</div>
            <div class="insurance-coverage-details">
              Policy #DD-88921 • Copay: 80/20 • Remaining: $1,250 / $2,000
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-sm btn-outline" onclick="app.openBookAppointmentModal('\${pt.id}')">
                \${CLINIC_ICONS.calendar} Book
              </button>
              <button class="btn btn-sm btn-outline" onclick="app.quickIssueQueueToken('\${pt.id}')">
                \${CLINIC_ICONS.users} Token
              </button>
              <button class="btn btn-sm btn-outline" onclick="app.printPatientIdCard('\${pt.id}')">
                \${CLINIC_ICONS.printer} Badge
              </button>
            </div>
            <button class="btn btn-sm btn-primary" onclick="app.switchRecordTab('odontogram')">
              \${CLINIC_ICONS.tooth} Open Interactive Odontogram
            </button>
          </div>
        </div>
      </div>

      <!-- 11 Patient Record Tabs -->
      <div class="record-tabs-bar">
        <button class="record-tab-btn \${activeTab === 'overview' ? 'active' : ''}" onclick="app.switchRecordTab('overview')">1. Overview</button>
        <button class="record-tab-btn \${activeTab === 'medical' ? 'active' : ''}" onclick="app.switchRecordTab('medical')">2. Medical History</button>
        <button class="record-tab-btn \${activeTab === 'dental' ? 'active' : ''}" onclick="app.switchRecordTab('dental')">3. Dental History</button>
        <button class="record-tab-btn \${activeTab === 'odontogram' ? 'active' : ''}" onclick="app.switchRecordTab('odontogram')">4. Odontogram</button>
        <button class="record-tab-btn \${activeTab === 'visits' ? 'active' : ''}" onclick="app.switchRecordTab('visits')">5. Clinical Visits</button>
        <button class="record-tab-btn \${activeTab === 'treatment' ? 'active' : ''}" onclick="app.switchRecordTab('treatment')">6. Treatment Plans</button>
        <button class="record-tab-btn \${activeTab === 'ortho' ? 'active' : ''}" onclick="app.switchRecordTab('ortho')">7. Orthodontics</button>
        <button class="record-tab-btn \${activeTab === 'prescriptions' ? 'active' : ''}" onclick="app.switchRecordTab('prescriptions')">8. Prescriptions</button>
        <button class="record-tab-btn \${activeTab === 'xrays' ? 'active' : ''}" onclick="app.switchRecordTab('xrays')">9. X-rays & Docs</button>
        <button class="record-tab-btn \${activeTab === 'billing' ? 'active' : ''}" onclick="app.switchRecordTab('billing')">10. Billing</button>
        <button class="record-tab-btn \${activeTab === 'audit' ? 'active' : ''}" onclick="app.switchRecordTab('audit')">11. Audit Trail</button>
      </div>

      <!-- Tab Content Area -->
      <div id="patient-tab-content-container">
        <!-- Rendered dynamically based on activeTab -->
      </div>
    \`;

    this.renderActiveRecordTab(activeTab);
  }`;

// Replace renderPatientRecord in code
code = code.replace(/renderPatientRecord\(container, activeTab = "overview"\) \{[\s\S]*?renderActiveRecordTab\(activeTab\);\s*\}/, newRenderPatientRecord);

fs.writeFileSync(appJsPath, code, 'utf8');
console.log('Successfully updated js/app.js Dashboard & Patient Record renderers!');
