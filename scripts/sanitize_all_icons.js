const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// 1. In renderActiveRecordTab overview tab
content = content.replace(
  '<div class="summary-icon-box" style="background:#E0F2FE; color:#0284C7;">📋</div>',
  '<div class="summary-icon-box" style="background:#E0F2FE; color:#0284C7;">${CLINIC_ICONS.report}</div>'
);
content = content.replace(
  '<div class="summary-icon-box" style="background:#CCFBF1; color:#0D9488;">🦷</div>',
  '<div class="summary-icon-box" style="background:#CCFBF1; color:#0D9488;">${CLINIC_ICONS.tooth}</div>'
);
content = content.replace(
  '<div class="summary-icon-box" style="background:#F3E8FF; color:#7C3AED;">✨</div>',
  '<div class="summary-icon-box" style="background:#F3E8FF; color:#7C3AED;">${CLINIC_ICONS.brackets}</div>'
);
content = content.replace(
  '<div class="summary-icon-box" style="background:#FEF2F2; color:#DC2626;">💳</div>',
  '<div class="summary-icon-box" style="background:#FEF2F2; color:#DC2626;">${CLINIC_ICONS.creditCard}</div>'
);
content = content.replace(
  '<div class="card-title"><span>🩺</span> Active Clinical Conditions & Treatment Focus</div>',
  '<div class="card-title" style="display:flex;align-items:center;gap:8px;">${CLINIC_ICONS.stethoscope}<span>Active Clinical Conditions & Treatment Focus</span></div>'
);
content = content.replace(
  '<div class="card-title"><span>⚡</span> Quick Patient Actions</div>',
  '<div class="card-title" style="display:flex;align-items:center;gap:8px;">${CLINIC_ICONS.chart}<span>Quick Patient Actions</span></div>'
);
content = content.replace(
  '<span>🦷</span> Dental Examination',
  '${CLINIC_ICONS.tooth} Dental Examination'
);
content = content.replace(
  '<span>💊</span> Write Prescription',
  '${CLINIC_ICONS.pharmacy} Write Prescription'
);
content = content.replace(
  '<span>📋</span> View Treatment Plan',
  '${CLINIC_ICONS.report} View Treatment Plan'
);
content = content.replace(
  '<span>💳</span> Cashier & Invoicing',
  '${CLINIC_ICONS.creditCard} Cashier & Invoicing'
);

// 2. In medical and dental tab
content = content.replace(
  '<div class="card-title"><span>🩺</span> Complete Medical History & Risk Profile</div>',
  '<div class="card-title" style="display:flex;align-items:center;gap:8px;">${CLINIC_ICONS.stethoscope}<span>Complete Medical History & Risk Profile</span></div>'
);
content = content.replace(
  '<strong style="color: #991B1B;">⚠️ ${a.name}</strong>',
  '<div style="display:flex;align-items:center;gap:6px;"><span style="color:#DC2626;">${CLINIC_ICONS.alertTriangle}</span><strong style="color: #991B1B;">${a.name}</strong></div>'
);
content = content.replace(
  '⚕️ ${c}',
  '• ${c}'
);
content = content.replace(
  '💊 ${m}',
  '• ${m}'
);
content = content.replace(
  '<div class="card-title"><span>🦷</span> Previous Dental History & Oral Hygiene Profile</div>',
  '<div class="card-title" style="display:flex;align-items:center;gap:8px;">${CLINIC_ICONS.tooth}<span>Previous Dental History & Oral Hygiene Profile</span></div>'
);

// 3. In renderPrescriptionsTab
content = content.replace(
  '<span>💊</span> New Prescription',
  '${CLINIC_ICONS.userPlus} New Prescription'
);
content = content.replace(
  '<span>🖨️</span> Print Official Rx',
  '${CLINIC_ICONS.printer} Print Official Rx'
);

// 4. In renderVisitsTab
content = content.replace(
  '<span>✍️</span> Start New Consultation',
  '${CLINIC_ICONS.stethoscope} Start New Consultation'
);

// 5. In renderXraysTab
content = content.replace(
  '<span>🩻</span> Digital Radiographs & Intraoral Imaging',
  '${CLINIC_ICONS.xray} Digital Radiographs & Intraoral Imaging'
);
content = content.replace(
  '<span>📤</span> Upload DICOM / X-ray',
  '${CLINIC_ICONS.camera} Upload DICOM / X-ray'
);
content = content.replace(
  '🔍 Tap to Inspect',
  'Tap to Inspect'
);

// 6. In renderAuditTab
content = content.replace(
  '<span>🛡️</span> Regulatory & HIPAA Audit History',
  '${CLINIC_ICONS.shield} Regulatory & HIPAA Audit History'
);

// 7. In setupWorkstationNav, toggleNavAutoHide, toggleSound
const oldSetupWorkstationNav = `  setupWorkstationNav() {
    const soundLabel = document.getElementById("sound-label");
    const soundIcon = document.getElementById("sound-icon");
    if (window.clinicAudio && soundLabel && soundIcon) {
      soundLabel.textContent = window.clinicAudio.enabled ? "Sound On" : "Muted";
      soundIcon.textContent = window.clinicAudio.enabled ? "🔊" : "🔇";
    }

    const autoHideLabel = document.getElementById("autohide-label");
    const autoHideIcon = document.getElementById("autohide-icon");
    if (autoHideLabel && autoHideIcon) {
      autoHideLabel.textContent = this.isNavPinned ? "Pinned" : "Auto-Hide";
      autoHideIcon.textContent = this.isNavPinned ? "📌" : "👁️";
    }

    this.setupNavAutoHide();
  },`;

const newSetupWorkstationNav = `  setupWorkstationNav() {
    const soundLabel = document.getElementById("sound-label");
    const soundIcon = document.getElementById("sound-icon");
    if (window.clinicAudio && soundLabel && soundIcon) {
      soundLabel.textContent = window.clinicAudio.enabled ? "Sound On" : "Muted";
      soundIcon.innerHTML = window.clinicAudio.enabled ? CLINIC_ICONS.sound : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M16 9a5 5 0 0 1 .42 6.5"/></svg>';
    }

    const autoHideLabel = document.getElementById("autohide-label");
    const autoHideIcon = document.getElementById("autohide-icon");
    if (autoHideLabel && autoHideIcon) {
      autoHideLabel.textContent = this.isNavPinned ? "Pinned" : "Auto-Hide";
      autoHideIcon.innerHTML = this.isNavPinned ? CLINIC_ICONS.pin : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
    }

    this.setupNavAutoHide();
  },`;

content = content.replace(oldSetupWorkstationNav, newSetupWorkstationNav);

const oldToggleAutoHide = `  toggleNavAutoHide() {
    this.isNavPinned = !this.isNavPinned;
    const autoHideLabel = document.getElementById("autohide-label");
    const autoHideIcon = document.getElementById("autohide-icon");
    if (autoHideLabel) autoHideLabel.textContent = this.isNavPinned ? "Pinned" : "Auto-Hide";
    if (autoHideIcon) autoHideIcon.textContent = this.isNavPinned ? "📌" : "👁️";

    if (this.isNavPinned) {
      this.showWorkstationNav();
      this.showToast("Navigation Pinned: Top bar is permanently visible.", "info");
    } else {
      this.showToast("Navigation Auto-Hide: Enabled (slides away when scrolling down).", "success");
    }
  },`;

const newToggleAutoHide = `  toggleNavAutoHide() {
    this.isNavPinned = !this.isNavPinned;
    const autoHideLabel = document.getElementById("autohide-label");
    const autoHideIcon = document.getElementById("autohide-icon");
    if (autoHideLabel) autoHideLabel.textContent = this.isNavPinned ? "Pinned" : "Auto-Hide";
    if (autoHideIcon) {
      autoHideIcon.innerHTML = this.isNavPinned ? CLINIC_ICONS.pin : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>';
    }

    if (this.isNavPinned) {
      this.showWorkstationNav();
      this.showToast("Navigation Pinned: Top bar is permanently visible.", "info");
    } else {
      this.showToast("Navigation Auto-Hide: Enabled (slides away when scrolling down).", "success");
    }
  },`;

content = content.replace(oldToggleAutoHide, newToggleAutoHide);

const oldToggleSound = `  toggleSound() {
    if (window.clinicAudio) {
      const enabled = window.clinicAudio.toggle();
      const soundLabel = document.getElementById("sound-label");
      const soundIcon = document.getElementById("sound-icon");
      if (soundLabel) soundLabel.textContent = enabled ? "Sound On" : "Muted";
      if (soundIcon) soundIcon.textContent = enabled ? "🔊" : "🔇";
      if (enabled) {
        window.clinicAudio.playChime();
        this.showToast("Voice announcements & audio chimes enabled", "success");
      } else {
        this.showToast("Audio muted", "info");
      }
    }
  },`;

const newToggleSound = `  toggleSound() {
    if (window.clinicAudio) {
      const enabled = window.clinicAudio.toggle();
      const soundLabel = document.getElementById("sound-label");
      const soundIcon = document.getElementById("sound-icon");
      if (soundLabel) soundLabel.textContent = enabled ? "Sound On" : "Muted";
      if (soundIcon) {
        soundIcon.innerHTML = enabled ? CLINIC_ICONS.sound : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M16 9a5 5 0 0 1 .42 6.5"/></svg>';
      }
      if (enabled) {
        window.clinicAudio.playChime();
        this.showToast("Voice announcements & audio chimes enabled", "success");
      } else {
        this.showToast("Audio muted", "info");
      }
    }
  },`;

content = content.replace(oldToggleSound, newToggleSound);

fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Sanitization of icons completed successfully!');
