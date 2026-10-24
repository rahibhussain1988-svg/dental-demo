const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Update initial kioskPage property
content = content.replace('kioskPage = "walkin";', 'kioskPage = "index";');

// 2. Update setKioskService to switch from 'index' to 'walkin' when service is selected
const oldSetKioskService = `  setKioskService(serviceId) {
    this.kioskState.serviceId = serviceId;`;

const newSetKioskService = `  setKioskService(serviceId) {
    if (this.kioskPage === 'index') {
      this.kioskPage = 'walkin';
    }
    this.kioskState.serviceId = serviceId;`;

if (content.includes(oldSetKioskService)) {
  content = content.replace(oldSetKioskService, newSetKioskService);
  console.log('✅ Updated setKioskService to switch from index to walkin');
} else {
  console.log('ℹ️ setKioskService already updated or pattern not found');
}

// 3. Update closeThermalReceiptModal to return to 'index'
const oldCloseReceipt = `    if (this.currentStation === 'PATIENT_KIOSK') {
      this.renderKioskStation();
    }`;

const newCloseReceipt = `    if (this.currentStation === 'PATIENT_KIOSK') {
      this.kioskPage = 'index';
      this.renderKioskStation();
    }`;

if (content.includes(oldCloseReceipt)) {
  content = content.replace(oldCloseReceipt, newCloseReceipt);
  console.log('✅ Updated closeThermalReceiptModal to return to index');
} else {
  console.log('ℹ️ closeThermalReceiptModal already updated');
}

// 4. Update renderKioskStation page fallback
content = content.replace("const page = this.kioskPage || 'walkin';", "const page = this.kioskPage || 'index';");

// 5. Update renderKioskStation HTML navigation tabs and add Index Page (Page 0 with 3 Cards)
const oldNavAndWalkin = `        <!-- KIOSK NAVIGATION PAGES BAR (Zero Scroll Switcher) -->
        <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
          
          <!-- Mode Tabs -->
          <div style="display: flex; gap: 8px; background: #FFFFFF; padding: 4px 6px; border-radius: var(--radius-pill); border: 1.5px solid var(--border-color); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
            <button onclick="app.setKioskPage('walkin')" style="padding: 8px 18px; border-radius: var(--radius-pill); font-size: 0.88rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'walkin' ? 'var(--primary-teal)' : 'transparent'}; color: \${page === 'walkin' ? '#FFF' : '#475569'};">
              <span>📋</span> <span>Walk-In Registration</span>
            </button>
            <button onclick="app.setKioskPage('appointments')" style="padding: 8px 18px; border-radius: var(--radius-pill); font-size: 0.88rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'appointments' ? 'var(--secondary-blue)' : 'transparent'}; color: \${page === 'appointments' ? '#FFF' : '#475569'};">
              <span>📅</span> <span>Appointments &amp; Check-In</span>
            </button>
            <button onclick="app.setKioskPage('emergency')" style="padding: 8px 18px; border-radius: var(--radius-pill); font-size: 0.88rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'emergency' ? '#DC2626' : 'transparent'}; color: \${page === 'emergency' ? '#FFF' : '#DC2626'};">
              <span>🚨</span> <span>Urgent Dental Trauma</span>
            </button>
          </div>

          <!-- Operatory Quick Status Indicator -->
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #FFF; padding: 6px 14px; border-radius: var(--radius-pill); border: 1px solid var(--border-color);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
            <span>4 Operatory Suites Active • Est. Wait: <strong style="color: #0F172A;">~10m</strong></span>
          </div>
        </div>

        <!-- PAGE CONTENT (Contained in single viewport with zero window scrolling) -->
        <div style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- ================= PAGE 1: WALK-IN REGISTRATION ================= -->
          \${page === 'walkin' ? \``;

const newNavAndIndex = `        <!-- KIOSK NAVIGATION PAGES BAR (Zero Scroll Switcher) -->
        <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
          
          <!-- Mode Tabs & Back to Index -->
          <div style="display: flex; align-items: center; gap: 8px;">
            \${page !== 'index' ? \`
              <button onclick="app.setKioskPage('index')" class="btn btn-outline" style="padding: 7px 14px; border-radius: var(--radius-pill); font-size: 0.84rem; font-weight: 800; display: flex; align-items: center; gap: 6px; background: #FFFFFF; border: 1.5px solid var(--border-color); color: #0F172A; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">
                <span>←</span> <span>Kiosk Home</span>
              </button>
            \` : ''}
            <div style="display: flex; gap: 6px; background: #FFFFFF; padding: 4px 6px; border-radius: var(--radius-pill); border: 1.5px solid var(--border-color); box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
              <button onclick="app.setKioskPage('index')" style="padding: 7px 16px; border-radius: var(--radius-pill); font-size: 0.86rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'index' ? 'var(--primary-teal)' : 'transparent'}; color: \${page === 'index' ? '#FFF' : '#475569'};">
                <span>🏠</span> <span>Kiosk Home</span>
              </button>
              <button onclick="app.setKioskPage('walkin')" style="padding: 7px 16px; border-radius: var(--radius-pill); font-size: 0.86rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'walkin' ? 'var(--primary-teal)' : 'transparent'}; color: \${page === 'walkin' ? '#FFF' : '#475569'};">
                <span>📋</span> <span>Walk-In Registration</span>
              </button>
              <button onclick="app.setKioskPage('appointments')" style="padding: 7px 16px; border-radius: var(--radius-pill); font-size: 0.86rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'appointments' ? 'var(--secondary-blue)' : 'transparent'}; color: \${page === 'appointments' ? '#FFF' : '#475569'};">
                <span>📅</span> <span>Appointments &amp; Check-In</span>
              </button>
              <button onclick="app.setKioskPage('emergency')" style="padding: 7px 16px; border-radius: var(--radius-pill); font-size: 0.86rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px; background: \${page === 'emergency' ? '#DC2626' : 'transparent'}; color: \${page === 'emergency' ? '#FFF' : '#DC2626'};">
                <span>🚨</span> <span>Urgent Dental Trauma</span>
              </button>
            </div>
          </div>

          <!-- Operatory Quick Status Indicator -->
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #FFF; padding: 6px 14px; border-radius: var(--radius-pill); border: 1px solid var(--border-color);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
            <span>4 Operatory Suites Active • Est. Wait: <strong style="color: #0F172A;">~10m</strong></span>
          </div>
        </div>

        <!-- PAGE CONTENT (Contained in single viewport with zero window scrolling) -->
        <div style="flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;">
          
          <!-- ================= PAGE 0: KIOSK INDEX / 3 PATHWAY CARDS ================= -->
          \${page === 'index' ? \`
            <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; gap: 12px;">

              <!-- Urgent Dental Trauma Fast-Track Banner -->
              <div onclick="app.setKioskPage('emergency')" style="flex-shrink: 0; background: linear-gradient(135deg, #8B0029 0%, #BE123C 60%, #9F1239 100%); color: #FFF; border: 2px solid #FDA4AF; border-radius: 14px; padding: 10px 18px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 14px; box-shadow: 0 4px 16px rgba(190, 18, 60, 0.28); transition: transform 0.15s ease;">
                <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
                  <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.22); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">
                    🚨
                  </div>
                  <div style="min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="font-size: 0.95rem; font-weight: 900; letter-spacing: -0.2px;">Urgent Dental Trauma &amp; Severe Pain Fast-Track</strong>
                      <span class="badge" style="background: #FFF; color: #BE123C; font-size: 0.65rem; font-weight: 900; padding: 1px 6px;">PRIORITY 1</span>
                    </div>
                    <div style="font-size: 0.74rem; color: #FFE4E6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      Acute dental trauma, uncontrolled bleeding, severe facial swelling, or knocked-out tooth • Direct priority triage to Surgical Chair 3
                    </div>
                  </div>
                </div>
                <button class="btn btn-danger btn-sm" style="background: #FFF; color: #991B1B; font-weight: 900; font-size: 0.78rem; border-radius: var(--radius-pill); border: none; padding: 6px 14px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                  Emergency Fast-Track ➔
                </button>
              </div>

              <!-- Welcome / Instruction Row -->
              <div style="flex-shrink: 0; text-align: center; margin: 0 0 2px 0;">
                <h2 style="font-size: 1.35rem; font-weight: 900; color: #0F172A; margin: 0 0 3px 0; letter-spacing: -0.3px;">
                  Welcome to Islamabad Dental Specialists &amp; Tele-Clinic
                </h2>
                <p style="font-size: 0.82rem; color: #64748B; margin: 0; font-weight: 600;">
                  Touch an option below to register for a walk-in token or check in for your scheduled appointment:
                </p>
              </div>

              <!-- 3 Pathway Cards in a 3-Column Responsive Grid -->
              <div style="flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; overflow: hidden;">

                <!-- CARD 1: GENERAL DENTAL WALK-IN -->
                <div class="kiosk-pathway-card-v2" onclick="app.setKioskService('general'); app.setKioskPage('walkin');" style="display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; height: 100%;">
                  <div style="overflow: hidden;">
                    <div class="kiosk-pathway-img-wrap" style="height: 125px; flex-shrink: 0;">
                      <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80" alt="General Dental Walk-In" />
                      <div class="kiosk-pathway-badge-floating">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #2DD4BF;"></span>
                        <span>Same-Day Walk-In</span>
                      </div>
                      <div class="kiosk-pathway-icon-floating" style="color: var(--primary-teal);">
                        \${CLINIC_ICONS.tooth}
                      </div>
                    </div>
                    <div style="padding: 16px 18px 8px;">
                      <h3 class="kiosk-pathway-title" style="font-size: 1.15rem; font-weight: 900; margin: 0 0 4px 0; color: #0F172A;">General Dental Walk-In</h3>
                      <p class="kiosk-pathway-desc" style="font-size: 0.78rem; line-height: 1.4; color: #64748B; margin: 0 0 8px 0;">
                        No booking needed. Same-day exam, teeth cleaning &amp; scaling, cavity fillings, toothache relief, or extractions.
                      </p>
                      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.74rem; color: #475569; font-weight: 700; margin-bottom: 6px;">
                        <span>👨‍⚕️ Dr. Sarah Chen, BDS</span>
                        <span style="color: #CBD5E1;">•</span>
                        <span>Chair 1 (General)</span>
                      </div>
                    </div>
                  </div>
                  <div style="padding: 0 18px 16px; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 0.78rem;">
                      <span style="color: #64748B; font-weight: 700;">Base Consult:</span>
                      <span class="badge badge-teal" style="font-size: 0.78rem; font-weight: 900;">Rs. 1,500</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; height: 40px; font-weight: 900; font-size: 0.84rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 6px;">
                      <span>Touch to Register Walk-In ➔</span>
                    </button>
                  </div>
                </div>

                <!-- CARD 2: BRACES & ORTHODONTICS (ORTHO BAY) -->
                <div class="kiosk-pathway-card-v2" onclick="app.setKioskService('ortho'); app.setKioskPage('walkin');" style="display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; height: 100%; border-color: #E9D5FF;">
                  <div style="overflow: hidden;">
                    <div class="kiosk-pathway-img-wrap" style="height: 125px; flex-shrink: 0;">
                      <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80" alt="Orthodontics & Braces" />
                      <div class="kiosk-pathway-badge-floating" style="background: rgba(88, 28, 135, 0.88);">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #C084FC;"></span>
                        <span>Ortho Bay • Chair 2</span>
                      </div>
                      <div class="kiosk-pathway-icon-floating" style="color: #7C3AED; border-color: #E9D5FF;">
                        \${CLINIC_ICONS.brackets}
                      </div>
                    </div>
                    <div style="padding: 16px 18px 8px;">
                      <h3 class="kiosk-pathway-title" style="font-size: 1.15rem; font-weight: 900; margin: 0 0 4px 0; color: #0F172A;">Braces &amp; Orthodontics</h3>
                      <p class="kiosk-pathway-desc" style="font-size: 0.78rem; line-height: 1.4; color: #64748B; margin: 0 0 8px 0;">
                        Orthodontic wire adjustments, loose bracket repairs, clear aligner tray reviews, or new braces consultation.
                      </p>
                      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.74rem; color: #475569; font-weight: 700; margin-bottom: 6px;">
                        <span>👨‍⚕️ Dr. Marcus Vance, Ortho</span>
                        <span style="color: #CBD5E1;">•</span>
                        <span>Chair 2 (Ortho Bay)</span>
                      </div>
                    </div>
                  </div>
                  <div style="padding: 0 18px 16px; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 0.78rem;">
                      <span style="color: #64748B; font-weight: 700;">Base Consult:</span>
                      <span class="badge" style="background: #F3E8FF; color: #7C3AED; font-size: 0.78rem; font-weight: 900;">Rs. 2,000</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; height: 40px; font-weight: 900; font-size: 0.84rem; border-radius: var(--radius-md); background: #7C3AED; border-color: #7C3AED; display: flex; align-items: center; justify-content: center; gap: 6px;">
                      <span>Touch to Register Braces / Ortho ➔</span>
                    </button>
                  </div>
                </div>

                <!-- CARD 3: SCHEDULED APPOINTMENT CHECK-IN (Third card on Index page for Appointment) -->
                <div class="kiosk-pathway-card-v2" onclick="app.setKioskPage('appointments');" style="display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; height: 100%; border-color: #BAE6FD;">
                  <div style="overflow: hidden;">
                    <div class="kiosk-pathway-img-wrap" style="height: 125px; flex-shrink: 0;">
                      <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80" alt="Appointment Check-In" />
                      <div class="kiosk-pathway-badge-floating" style="background: rgba(12, 74, 110, 0.88);">
                        <span style="width: 6px; height: 6px; border-radius: 50%; background: #38BDF8;"></span>
                        <span>Confirmed Booking</span>
                      </div>
                      <div class="kiosk-pathway-icon-floating" style="color: #0284C7; border-color: #BAE6FD;">
                        \${CLINIC_ICONS.calendar}
                      </div>
                    </div>
                    <div style="padding: 16px 18px 8px;">
                      <h3 class="kiosk-pathway-title" style="font-size: 1.15rem; font-weight: 900; margin: 0 0 4px 0; color: #0F172A;">Scheduled Appointment Check-In</h3>
                      <p class="kiosk-pathway-desc" style="font-size: 0.78rem; line-height: 1.4; color: #64748B; margin: 0 0 8px 0;">
                        Already booked for today? Live search your name or mobile number to confirm arrival and print your queue token.
                      </p>
                      <div style="display: flex; align-items: center; gap: 6px; font-size: 0.74rem; color: #475569; font-weight: 700; margin-bottom: 6px;">
                        <span>⚡ Zero Wait Arrival</span>
                        <span style="color: #CBD5E1;">•</span>
                        <span>Live Slot Search</span>
                      </div>
                    </div>
                  </div>
                  <div style="padding: 0 18px 16px; flex-shrink: 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 0.78rem;">
                      <span style="color: #64748B; font-weight: 700;">Check-In Status:</span>
                      <span class="badge" style="background: #E0F2FE; color: #0284C7; font-size: 0.78rem; font-weight: 900;">Pre-Booked Slot</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; height: 40px; font-weight: 900; font-size: 0.84rem; border-radius: var(--radius-md); background: #0284C7; border-color: #0284C7; display: flex; align-items: center; justify-content: center; gap: 6px;">
                      <span>Touch to Check In Appointment ➔</span>
                    </button>
                  </div>
                </div>

              </div>

              <!-- Bottom Telemetry Bar -->
              <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; font-size: 0.74rem; color: #64748B; background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-pill); padding: 6px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <span style="display: flex; align-items: center; gap: 5px;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #22C55E;"></span>
                    <strong style="color: #0F172A;">4 Operatory Suites</strong> Active
                  </span>
                  <span>•</span>
                  <span>Est. Current Wait: <strong style="color: #0F172A;">~10 mins</strong></span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span>🔒 Contactless Thermal Queue Ticket</span>
                  <span>•</span>
                  <span>🇵🇰 Islamabad Sector F-7/2 Clinic</span>
                </div>
              </div>

            </div>
          \` : page === 'walkin' ? \``;

if (content.includes(oldNavAndWalkin)) {
  content = content.replace(oldNavAndWalkin, newNavAndIndex);
  console.log('✅ Updated renderKioskStation with 3 Pathway Cards on Index Page and Next Page for Walk-In');
} else {
  console.error('❌ Could not match oldNavAndWalkin block in js/app.js');
  process.exit(1);
}

fs.writeFileSync(appPath, content, 'utf8');
console.log('🎉 Successfully saved patched js/app.js');
