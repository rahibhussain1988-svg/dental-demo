const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexHtmlPath, 'utf8');

// SVG Helpers
const SVG_ICONS = {
  tooth: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.5 2 5 5 5 9.5c0 3.5 1.5 7.5 3.5 11.5 1 1.8 2 2.5 3.5 2.5s2.5-.7 3.5-2.5c2-4 3.5-8 3.5-11.5C19 5 16.5 2 12 2z"/><path d="M12 2v9"/></svg>`,
  kiosk: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  tv: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  billing: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  pharmacy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
  admin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  pin: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
  sound: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
  lock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`
};

// 1. Clean HTML title
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Smile Dental &amp; Orthodontics — Clinic Management System</title>');

// 2. Clean Revealer Pill
html = html.replace(/<div id="workstation-nav-revealer"[\s\S]*?<\/div>/, `<div id="workstation-nav-revealer" onclick="app.showWorkstationNav()" title="Touch to show Station Navigation">
    ${SVG_ICONS.tooth}
    <span>Station Menu</span>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
  </div>`);

// 3. Clean Workstation Brand
html = html.replace(/<div class="workstation-brand"[\s\S]*?<\/div>\s*<\/div>/, `<div class="workstation-brand" onclick="app.switchStation('PATIENT_KIOSK')">
      <div class="workstation-brand-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.5 2 5 5 5 9.5c0 3.5 1.5 7.5 3.5 11.5 1 1.8 2 2.5 3.5 2.5s2.5-.7 3.5-2.5c2-4 3.5-8 3.5-11.5C19 5 16.5 2 12 2z"/><path d="M12 2v9"/></svg>
      </div>
      <div class="workstation-brand-text">
        <h2>Smile Dental <span class="badge badge-teal" style="font-size: 0.65rem; padding: 2px 6px; font-weight: 800;">v2.5 PRO</span></h2>
        <span>Clinic Operating System</span>
      </div>
    </div>`);

// 4. Clean Workstation Tabs
const tabsReplacement = `<nav class="workstation-tabs">
      <button class="station-tab-btn active" id="tab-btn-kiosk" onclick="app.switchStation('PATIENT_KIOSK')" title="Patient Self-Service Intake Kiosk">
        ${SVG_ICONS.kiosk}
        <span class="tab-long-label">Patient </span>Kiosk
      </button>
      <button class="station-tab-btn" id="tab-btn-tv" onclick="app.switchStation('CABIN_QUEUE_TV')" title="Waiting Lounge Queue TV Display">
        ${SVG_ICONS.tv}
        <span class="tab-long-label">Lounge </span>Queue TV
      </button>
      <button class="station-tab-btn" id="tab-btn-cabin" onclick="app.switchStation('DOCTOR_CABIN')" title="Dentist Operatory Station & Quick Rx">
        ${SVG_ICONS.tooth}
        Operatory<span class="tab-long-label"> Cabin</span>
      </button>
      <button class="station-tab-btn" id="tab-btn-billing" onclick="app.switchStation('BILLING_PHARMACY')" title="Cashier & Billing Desk POS">
        ${SVG_ICONS.billing}
        Billing POS
      </button>
      <button class="station-tab-btn" id="tab-btn-pharmacy" onclick="app.switchStation('INHOUSE_PHARMACY')" title="Dental Dispensary & Materials Stock">
        ${SVG_ICONS.pharmacy}
        Dispensary
      </button>
      <button class="station-tab-btn" id="tab-btn-admin" onclick="app.switchStation('ADMIN_DASHBOARD')" title="Clinic Administration & Records">
        ${SVG_ICONS.admin}
        <span class="tab-long-label">Clinic </span>Admin
      </button>
    </nav>`;
html = html.replace(/<nav class="workstation-tabs">[\s\S]*?<\/nav>/, tabsReplacement);

// 5. Clean Workstation Right Controls
const controlsReplacement = `<div class="workstation-right-controls">
      <button class="control-pill-btn" id="btn-toggle-autohide" onclick="app.toggleNavAutoHide()" title="Toggle Navigation Auto-Hide (Pin / Auto-Hide)">
        <span id="autohide-icon">${SVG_ICONS.pin}</span>
        <span class="control-text" id="autohide-label">Auto-Hide</span>
      </button>
      <button class="control-pill-btn" id="btn-toggle-sound" onclick="app.toggleSound()" title="Toggle Vocal Audio & Hospital Chimes">
        <span id="sound-icon">${SVG_ICONS.sound}</span>
        <span class="control-text" id="sound-label">Sound On</span>
      </button>
      <button class="control-pill-btn" onclick="app.openKioskLockModal()" title="Lock Kiosk Terminal (PIN 1234)">
        <span>${SVG_ICONS.lock}</span>
        <span class="control-text">Lock</span>
      </button>
      <button class="control-pill-btn" onclick="app.resetDemoData()" title="Reset All Demo Data">
        <span>${SVG_ICONS.refresh}</span>
        <span class="control-text">Reset</span>
      </button>
    </div>`;
html = html.replace(/<div class="workstation-right-controls">[\s\S]*?<\/div>\s*<\/header>/, controlsReplacement + '\n  </header>');

// 6. Clean Sidebar
html = html.replace(/<div class="sidebar-brand">[\s\S]*?<\/aside>/, `<div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.5 2 5 5 5 9.5c0 3.5 1.5 7.5 3.5 11.5 1 1.8 2 2.5 3.5 2.5s2.5-.7 3.5-2.5c2-4 3.5-8 3.5-11.5C19 5 16.5 2 12 2z"/><path d="M12 2v9"/></svg>
        </div>
        <div class="brand-text">
          <h1>Smile Dental</h1>
          <span>& Orthodontics</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Core Operations</div>
        <button class="nav-item active" data-screen="dashboard">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          <span>Dashboard</span>
        </button>
        <button class="nav-item" data-screen="registration">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></span>
          <span>New Patient</span>
        </button>
        <button class="nav-item" data-screen="search">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
          <span>Find Patient</span>
        </button>
        <button class="nav-item" data-screen="appointments">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span>Appointments</span>
          <span class="badge badge-teal">Today</span>
        </button>
        <button class="nav-item" data-screen="queue">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          <span>Patient Queue</span>
          <span class="badge badge-amber">Live</span>
        </button>

        <div class="nav-section-title">Clinical Suite</div>
        <button class="nav-item" data-screen="record">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C7.5 2 5 5 5 9.5c0 3.5 1.5 7.5 3.5 11.5 1 1.8 2 2.5 3.5 2.5s2.5-.7 3.5-2.5c2-4 3.5-8 3.5-11.5C19 5 16.5 2 12 2z"/><path d="M12 2v9"/></svg></span>
          <span>Dental Records & Chart</span>
        </button>
        <button class="nav-item" data-screen="dentist-workspace">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3"/><path d="M13.5 12.5v3.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V12.5"/><circle cx="18" cy="10" r="3"/><path d="M15 10h-1.5"/></svg></span>
          <span>Dentist Operatory</span>
        </button>
        <button class="nav-item" data-screen="orthodontics">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M8 12h8"/></svg></span>
          <span>Orthodontics (Braces)</span>
        </button>

        <div class="nav-section-title">Finance & Admin</div>
        <button class="nav-item" data-screen="billing">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>
          <span>Billing POS & Cashier</span>
        </button>
        <button class="nav-item" data-screen="reports">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
          <span>Reports & Analytics</span>
        </button>
        <button class="nav-item" data-screen="admin">
          <span class="nav-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
          <span>Clinic Admin</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="demo-banner">
          <strong>Clinical Prototype Mode:</strong> Local storage persistence active. Multi-station clinical operating system.
        </div>
        <button class="btn btn-sm btn-outline" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;" onclick="app.resetDemoData()">
          ${SVG_ICONS.refresh}
          <span>Reset Sample Records</span>
        </button>
      </div>
    </aside>`);

// 7. Clean up modal headers and broken symbols
html = html.replace(/<h3>dY"\.\s*Schedule Patient Appointment<\/h3>/g, '<h3>Schedule Patient Appointment</h3>');
html = html.replace(/<h3>dYZY,\?\s*Issue Walk-In Queue Token<\/h3>/g, '<h3>Issue Walk-In Queue Token</h3>');
html = html.replace(/<h3>o\?,\?\s*Finalize & Sign Clinical Encounter<\/h3>/g, '<h3>Finalize & Sign Clinical Encounter</h3>');
html = html.replace(/<h3>dY'S\s*Electronic Dental Prescription<\/h3>/g, '<h3>Electronic Dental Prescription</h3>');
html = html.replace(/<h3>dY'3\s*Record Patient Payment<\/h3>/g, '<h3>Record Patient Payment</h3>');
html = html.replace(/<h3>o"\s*Record Orthodontic Adjustment Visit<\/h3>/g, '<h3>Record Orthodontic Adjustment Visit</h3>');
html = html.replace(/<h3>dY-",\?\s*Document Print Preview<\/h3>/g, '<h3>Document Print Preview</h3>');
html = html.replace(/<h3>dY"\s*Patient QR \/ Barcode Scanner Simulator<\/h3>/g, '<h3>Patient QR / Barcode Scanner Simulator</h3>');
html = html.replace(/<h3>dY"\.\s*Reschedule Appointment<\/h3>/g, '<h3>Reschedule Appointment</h3>');
html = html.replace(/<h3>dY",\s*Transfer Patient \/ Operatory<\/h3>/g, '<h3>Transfer Patient / Operatory</h3>');
html = html.replace(/<h3>dY"\?\s*Add Controlled Clinical Amendment<\/h3>/g, '<h3>Add Controlled Clinical Amendment</h3>');
html = html.replace(/<h3 id="xray-viewer-title"[\s\S]*?>.*?Digital Radiograph Diagnostic Viewer<\/h3>/g, '<h3 id="xray-viewer-title" style="color: #FFF;">Digital Radiograph Diagnostic Viewer</h3>');
html = html.replace(/<h3>dY" \s*Upload Digital Radiograph \/ Intraoral Scan<\/h3>/g, '<h3>Upload Digital Radiograph / Intraoral Scan</h3>');
html = html.replace(/<h3>dY'3\s*Select Procedures to Bill<\/h3>/g, '<h3>Select Procedures to Bill</h3>');
html = html.replace(/<h3>\+c,\?\s*Issue Patient Refund<\/h3>/g, '<h3>Issue Patient Refund</h3>');

// 8. Clean lock modal
html = html.replace(/<div style="font-size: 3rem; margin-bottom: 8px;">dY"'<\/div>/g, '<div style="margin-bottom: 12px; display: flex; justify-content: center;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>');
html = html.replace(/<button class="kiosk-num-key action-backspace" onclick="app\.backspacePinDigit\(\)">.*?<\/button>/g, '<button class="kiosk-num-key action-backspace" onclick="app.backspacePinDigit()">&larr;</button>');

// 9. Clean any remaining broken strings in index.html
html = html.replace(/<span>dY"<\/span>\s*Kiosk View/g, '<span>Kiosk View</span>');
html = html.replace(/dY '\s*Loading clock\.\.\./g, '● Loading clock...');

fs.writeFileSync(indexHtmlPath, html, 'utf8');
console.log('Successfully updated index.html cleanly!');
