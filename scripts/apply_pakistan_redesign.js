const fs = require('fs');

console.log('=== Applying Pakistan Localization, Menu Header Removal, Scroll Fix, and Footer Fix ===');

// ==========================================
// 1. UPDATE CLINIC_CONFIG IN js/data.js
// ==========================================
const dataPath = 'js/data.js';
let dataCode = fs.readFileSync(dataPath, 'utf8');

const oldConfig = `const CLINIC_CONFIG = {
  name: "Smile Dental & Orthodontics Clinic",
  tagline: "Center for Advanced Family Dentistry & Specialized Orthodontics",
  address: "452 Grand Avenue, Suite 300, Metro City, MC 90210",
  phone: "+1 (555) 948-8325",
  emergencyPhone: "+1 (555) 948-HELP",
  email: "reception@smiledentalortho.com",
  website: "www.smiledentalortho.com",
  taxId: "TAX-894-002-SDO",
  operatingHours: "Mon - Sat: 8:00 AM - 7:00 PM | Sun: Emergency Only",`;

const newConfig = `const CLINIC_CONFIG = {
  name: "Smile Dental & Orthodontics Clinic",
  tagline: "Center for Advanced Family Dentistry & Specialized Orthodontics (Islamabad, Pakistan)",
  address: "Plot 14-B, Executive Medical Plaza, Blue Area, Islamabad, Pakistan",
  phone: "+92 (51) 289-4321",
  emergencyPhone: "+92 (300) 948-HELP",
  email: "reception@smiledentalortho.pk",
  website: "www.smiledentalortho.pk",
  taxId: "NTN: 894002-7 (FBR / PRA Reg.)",
  currency: "PKR",
  currencySymbol: "Rs.",
  country: "Pakistan",
  operatingHours: "Mon - Sat: 9:00 AM - 9:00 PM | Sun: Emergency Triage Only (PKT)",`;

if (dataCode.includes(oldConfig)) {
  dataCode = dataCode.replace(oldConfig, newConfig);
  console.log('✅ Updated CLINIC_CONFIG with Pakistan details in js/data.js');
} else {
  console.log('⚠️ Could not find exact oldConfig match in js/data.js, attempting regex replacement...');
  dataCode = dataCode.replace(
    /const CLINIC_CONFIG = \{[\s\S]*?operatingHours: [^\n]*,/,
    newConfig
  );
}

fs.writeFileSync(dataPath, dataCode, 'utf8');

// ==========================================
// 2. UPDATE index.html
// ==========================================
const indexPath = 'index.html';
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// 2A. Remove <div class="sidebar-brand"> inside app-sidebar
const oldSidebarBrand = `    <!-- Sidebar Navigation -->
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7.5 2 5 5 5 9.5c0 3.5 1.5 7.5 3.5 11.5 1 1.8 2 2.5 3.5 2.5s2.5-.7 3.5-2.5c2-4 3.5-8 3.5-11.5C19 5 16.5 2 12 2z"/><path d="M12 2v9"/></svg>
        </div>
        <div class="brand-text">
          <h1>Smile Dental</h1>
          <span>& Orthodontics</span>
        </div>
      </div>`;

const newSidebarTop = `    <!-- Sidebar Navigation -->
    <aside class="app-sidebar">`;

if (indexHtml.includes(oldSidebarBrand)) {
  indexHtml = indexHtml.replace(oldSidebarBrand, newSidebarTop);
  console.log('✅ Removed sidebar brand heading from index.html');
}

// 2B. Remove section headings inside menu: <div class="nav-section-title">...</div>
indexHtml = indexHtml.replace(/<div class="nav-section-title">[\s\S]*?<\/div>\s*/g, '');
console.log('✅ Removed all section headings within menu from index.html');

// 2C. Update sidebar footer in vertical section of navigation
const oldSidebarFooter = `      <div class="sidebar-footer">
        <div class="sidebar-user-badge">
          <div class="sidebar-user-avatar" id="sidebar-user-avatar" style="background-color: var(--primary-teal);">SC</div>
          <div class="sidebar-user-details">
            <strong id="sidebar-user-name">Dr. Sarah Chen, DDS</strong>
            <span id="sidebar-user-role">Attending Clinician</span>
          </div>
        </div>
      </div>`;

const newSidebarFooter = `      <div class="sidebar-footer">
        <div class="sidebar-user-badge" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md);">
          <div class="sidebar-user-avatar" id="sidebar-user-avatar" style="background-color: var(--primary-teal); position: relative; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #FFF; flex-shrink: 0;">
            SC
            <span style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: #22C55E; border: 2px solid #FFF;" title="Active Clinician Online"></span>
          </div>
          <div class="sidebar-user-details" style="flex: 1; min-width: 0;">
            <strong id="sidebar-user-name" style="font-size: 0.85rem; color: #0F172A; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dr. Sarah Chen, BDS</strong>
            <span id="sidebar-user-role" style="font-size: 0.72rem; color: #64748B; display: flex; align-items: center; gap: 4px;">
              <span>Attending</span>
              <span style="color: #CBD5E1;">•</span>
              <span style="color: var(--primary-teal); font-weight: 700;">Islamabad</span>
            </span>
          </div>
        </div>
      </div>`;

if (indexHtml.includes(oldSidebarFooter)) {
  indexHtml = indexHtml.replace(oldSidebarFooter, newSidebarFooter);
  console.log('✅ Updated sidebar-footer in index.html');
} else {
  // Regex replacement for footer
  indexHtml = indexHtml.replace(
    /<div class="sidebar-footer">[\s\S]*?<\/div>\s*<\/aside>/,
    newSidebarFooter + '\n    </aside>'
  );
  console.log('✅ Replaced sidebar-footer via regex in index.html');
}

fs.writeFileSync(indexPath, indexHtml, 'utf8');

console.log('Finished Step 1 & 2!');
