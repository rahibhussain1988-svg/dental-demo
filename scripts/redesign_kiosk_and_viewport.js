const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Replace renderKioskStation method in js/app.js
const startKioskStr = '  renderKioskStation() {';
const nextMethodStr = '  renderTvStation() {';

const startIdx = content.indexOf(startKioskStr);
const endIdx = content.indexOf(nextMethodStr, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate renderKioskStation boundaries! startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

const newKioskCode = `  renderKioskStation() {
    const mount = document.getElementById("kiosk-main-mount");
    if (!mount) return;

    const { pathway, step } = this.kioskState;

    let bodyHtml = '';

    // ================= STEP 0: WELCOME & 4 PATHWAYS =================
    if (step === 0 && (pathway === 'WALK_IN' || !pathway)) {
      bodyHtml = \`
        <div style="max-width: 1100px; margin: 10px auto 40px; padding: 0 20px;">
          <!-- Welcome Hero Banner -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #F0FDFA; border: 1px solid #CCFBF1; padding: 6px 16px; border-radius: var(--radius-pill); margin-bottom: 14px;">
              <span style="color: var(--primary-teal);">\${CLINIC_ICONS.tooth}</span>
              <span style="font-size: 0.8rem; font-weight: 800; color: var(--dark-teal); letter-spacing: 0.5px; text-transform: uppercase;">
                Smile Dental &amp; Orthodontics • Patient Self-Service
              </span>
            </div>
            <h1 style="font-size: 2.3rem; font-weight: 900; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.5px;">
              Patient Touchscreen Intake
            </h1>
            <p style="font-size: 1.05rem; color: #64748B; margin: 0; max-width: 600px; margin: 0 auto;">
              Touch your visit category below to register and receive your printed clinic queue token
            </p>
          </div>

          <!-- 4 Pathway Cards Grid -->
          <div class="kiosk-pathways-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 32px;">
            <!-- 1. Emergency Pass -->
            <div class="kiosk-pathway-card pathway-emergency" onclick="app.setKioskPathway('EMERGENCY_TRIAGE')" style="background: linear-gradient(135deg, #991B1B 0%, #DC2626 100%); color: #FFF; border: 2px solid #FDA4AF; border-radius: var(--radius-xl); padding: 24px 26px; cursor: pointer; box-shadow: 0 10px 25px -4px rgba(220,38,38,0.35); transition: transform 0.2s ease;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;">
                <span class="pathway-badge" style="background: rgba(255,255,255,0.22); color: #FFF; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: var(--radius-pill);">
                  PRIORITY 1 FAST-TRACK
                </span>
                <div style="background: rgba(255,255,255,0.2); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #FFF;">
                  \${CLINIC_ICONS.alertTriangle}
                </div>
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 900; color: #FFF; margin: 0 0 6px 0;">Emergency Triage</h3>
              <p style="font-size: 0.88rem; color: #FEE2E2; margin: 0 0 18px 0; line-height: 1.4;">
                Severe acute toothache, facial swelling/abscess, trauma, bleeding, or broken braces wire.
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 14px;">
                <span style="font-weight: 800; font-size: 0.85rem; color: #FFF;">Direct to Surgical Suite</span>
                <span style="background: #FFF; color: #991B1B; font-weight: 800; font-size: 0.82rem; padding: 6px 14px; border-radius: var(--radius-md);">
                  Touch Here →
                </span>
              </div>
            </div>

            <!-- 2. Walk-In Consultation -->
            <div class="kiosk-pathway-card pathway-walkin" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(1);" style="background: #FFF; border: 2px solid #0D9488; border-radius: var(--radius-xl); padding: 24px 26px; cursor: pointer; box-shadow: 0 10px 25px -4px rgba(13,148,136,0.15); transition: transform 0.2s ease;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;">
                <span class="pathway-badge" style="background: #CCFBF1; color: #0F766E; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: var(--radius-pill);">
                  SAME-DAY WALK-IN
                </span>
                <div style="background: #F0FDFA; border: 1px solid #CCFBF1; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary-teal);">
                  \${CLINIC_ICONS.tooth}
                </div>
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 900; color: #0F172A; margin: 0 0 6px 0;">General Dental Walk-In</h3>
              <p style="font-size: 0.88rem; color: #64748B; margin: 0 0 18px 0; line-height: 1.4;">
                Toothache, oral hygiene cleaning, cavity fillings, crown checkup, or dental exam.
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 14px;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary-teal);">Est. Wait: ~10 Mins</span>
                <span style="background: var(--primary-teal); color: #FFF; font-weight: 800; font-size: 0.82rem; padding: 6px 14px; border-radius: var(--radius-md);">
                  Touch for Token →
                </span>
              </div>
            </div>

            <!-- 3. Orthodontics / Braces -->
            <div class="kiosk-pathway-card" onclick="app.setKioskPathway('ORTHO_WALKIN'); app.setKioskStep(1);" style="background: #FFF; border: 2px solid #7C3AED; border-radius: var(--radius-xl); padding: 24px 26px; cursor: pointer; box-shadow: 0 10px 25px -4px rgba(124,58,237,0.15); transition: transform 0.2s ease;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;">
                <span class="pathway-badge" style="background: #F3E8FF; color: #6B21A8; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: var(--radius-pill);">
                  ORTHODONTIC SUITE
                </span>
                <div style="background: #FAF5FF; border: 1px solid #E9D5FF; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--purple);">
                  \${CLINIC_ICONS.brackets}
                </div>
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 900; color: #0F172A; margin: 0 0 6px 0;">Braces &amp; Aligners</h3>
              <p style="font-size: 0.88rem; color: #64748B; margin: 0 0 18px 0; line-height: 1.4;">
                Orthodontic wire adjustments, loose bracket repairs, clear aligner tray pick-up, or consult.
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 14px;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--purple);">Chair 2: Ortho Clinic</span>
                <span style="background: var(--purple); color: #FFF; font-weight: 800; font-size: 0.82rem; padding: 6px 14px; border-radius: var(--radius-md);">
                  Touch for Ortho →
                </span>
              </div>
            </div>

            <!-- 4. Pre-Booked Appointment -->
            <div class="kiosk-pathway-card pathway-checkin" onclick="app.setKioskPathway('CHECKIN_SEARCH')" style="background: #FFF; border: 2px solid #0284C7; border-radius: var(--radius-xl); padding: 24px 26px; cursor: pointer; box-shadow: 0 10px 25px -4px rgba(2,132,199,0.15); transition: transform 0.2s ease;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px;">
                <span class="pathway-badge" style="background: #E0F2FE; color: #0369A1; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: var(--radius-pill);">
                  SCHEDULED PATIENT
                </span>
                <div style="background: #F0F9FF; border: 1px solid #BAE6FD; width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--secondary-blue);">
                  \${CLINIC_ICONS.calendar}
                </div>
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 900; color: #0F172A; margin: 0 0 6px 0;">Appointment Check-In</h3>
              <p style="font-size: 0.88rem; color: #64748B; margin: 0 0 18px 0; line-height: 1.4;">
                Already booked for today? Enter your mobile phone number on touch keypad to print slip.
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 14px;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--secondary-blue);">Quick Phone Lookup</span>
                <span style="background: var(--secondary-blue); color: #FFF; font-weight: 800; font-size: 0.82rem; padding: 6px 14px; border-radius: var(--radius-md);">
                  Touch to Check In →
                </span>
              </div>
            </div>
          </div>

          <!-- Bottom Status Telemetry -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; padding: 14px 24px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-pill); box-shadow: var(--shadow-sm); font-size: 0.85rem; color: #475569;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
              <span><strong>4 Operatories</strong> Active &amp; Sanitized</span>
            </div>
            <span style="color: #CBD5E1;">•</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--primary-teal);">\${CLINIC_ICONS.clock}</span>
              <span>Lounge Wait Time: <strong>~12 Mins</strong></span>
            </div>
            <span style="color: #CBD5E1;">•</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--secondary-blue);">\${CLINIC_ICONS.printer}</span>
              <span>Thermal Token Printer <strong>Online</strong></span>
            </div>
          </div>
        </div>
      \`;
    }

    // ================= STEP 1: FAST-TRACK WALK-IN INTAKE =================
    else if ((pathway === 'WALK_IN' || pathway === 'ORTHO_WALKIN') && step >= 1) {
      const isOrtho = pathway === 'ORTHO_WALKIN';
      bodyHtml = \`
        <div style="max-width: 960px; margin: 10px auto 30px; padding: 0 20px;">
          <!-- Header Bar with Back Button -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
            <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="padding: 10px 18px; font-weight: 700;">
              ← Return to Welcome
            </button>
            <div style="text-align: right;">
              <h2 style="font-size: 1.4rem; font-weight: 900; color: #0F172A; margin: 0;">
                \${isOrtho ? 'Orthodontics & Braces Intake' : 'Walk-In Dental Registration'}
              </h2>
              <span style="font-size: 0.82rem; color: #64748B;">
                \${isOrtho ? 'Assigned to Chair 2: Ortho Suite' : 'Assigned to General Operatory'}
              </span>
            </div>
          </div>

          <!-- 2-Column Split: Left Concern & Details, Right Touch Keypad -->
          <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
            <!-- Left: Concern Pills & Name -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: #0F172A; margin-bottom: 10px;">
                1. Select Primary Concern:
              </label>
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">
                \${(isOrtho ? [
                  { id: 'ortho-wire', name: 'Archwire Adjustment / Tightening', est: '$75' },
                  { id: 'ortho-bracket', name: 'Loose Bracket / Pokey Wire Trauma', est: '$60' },
                  { id: 'ortho-aligner', name: 'Clear Aligner Check / Tray Pick-up', est: '$80' },
                  { id: 'ortho-consult', name: 'New Patient Braces Consultation', est: '$50' }
                ] : [
                  { id: 'sym-1', name: 'Severe Toothache / Cavity Pain', est: '$65' },
                  { id: 'sym-2', name: 'Teeth Cleaning & Scaling (Hygiene)', est: '$80' },
                  { id: 'sym-3', name: 'Comprehensive Dental Exam & Checkup', est: '$40' },
                  { id: 'sym-4', name: 'Broken Tooth / Chipped Enamel', est: '$95' },
                  { id: 'sym-5', name: 'Gum Swelling / Bleeding Gums', est: '$70' },
                  { id: 'sym-6', name: 'Tooth Extraction / Wisdom Tooth Pain', est: '$90' }
                ]).map(c => {
                  const isSelected = this.kioskState.selectedSymptoms.includes(c.id);
                  return \`
                    <div onclick="app.toggleKioskSymptom('\${c.id}')" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: var(--radius-lg); border: 2px solid \${isSelected ? 'var(--primary-teal)' : '#E2E8F0'}; background: \${isSelected ? '#F0FDFA' : '#FFF'}; cursor: pointer; transition: all 0.15s ease;">
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid \${isSelected ? 'var(--primary-teal)' : '#CBD5E1'}; background: \${isSelected ? 'var(--primary-teal)' : '#FFF'}; display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 11px; font-weight: 800;">
                          \${isSelected ? '✓' : ''}
                        </span>
                        <strong style="font-size: 0.9rem; color: var(--text-main);">\${c.name}</strong>
                      </div>
                      <span class="badge \${isSelected ? 'badge-teal' : 'badge-subtle'}" style="font-size: 0.75rem;">\${c.est}</span>
                    </div>
                  \`;
                }).join('')}
              </div>

              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: #0F172A; margin-bottom: 6px;">
                2. Patient Full Name (Optional):
              </label>
              <input type="text" id="kiosk-walkin-name" class="form-control" style="font-size: 1.05rem; padding: 12px 16px; border-radius: var(--radius-md);" placeholder="e.g. John Doe" value="\${this.kioskState.name || ''}" oninput="app.kioskState.name = this.value">
            </div>

            <!-- Right: Touch Keypad for Phone -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm); text-align: center;">
              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: #0F172A; margin-bottom: 10px; text-align: left;">
                3. Mobile Phone Number:
              </label>
              
              <!-- Digital Phone Box -->
              <div class="kiosk-phone-display active" onclick="app.setKioskActiveInput('phone')" style="margin-bottom: 16px; height: 56px; font-size: 1.5rem; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg); font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0F172A; background: #F8FAFC; border: 2px solid var(--primary-teal);">
                \${this.kioskState.phone ? this.kioskState.phone : '<span style="color:#94A3B8; font-weight:500;">(555) 000-0000</span>'}
              </div>

              <!-- Virtual Numpad Grid -->
              <div class="kiosk-numpad-grid" style="margin-bottom: 20px;">
                \${[1,2,3,4,5,6,7,8,9].map(n => \`<button class="kiosk-num-key" onclick="app.enterKioskNum('\${n}')">\${n}</button>\`).join('')}
                <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
                <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
                <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
              </div>

              <!-- Issue Token Primary Button -->
              <button class="btn btn-primary" onclick="app.issueWalkinToken()" style="width: 100%; height: 58px; font-size: 1.15rem; font-weight: 800; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 20px rgba(13,148,136,0.25);">
                \${CLINIC_ICONS.checkCircle}
                <span>Touch to Print Token Slip</span>
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    // ================= EMERGENCY TRIAGE =================
    else if (pathway === 'EMERGENCY_TRIAGE') {
      const selectedProc = this.kioskState.selectedEmergencyProc || 'emg-1';
      bodyHtml = \`
        <div style="max-width: 900px; margin: 10px auto 30px; padding: 0 20px;">
          <!-- Back button -->
          <div style="margin-bottom: 16px;">
            <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="padding: 10px 18px; font-weight: 700;">
              ← Return to Welcome
            </button>
          </div>

          <!-- Emergency Banner -->
          <div style="background: #FEF2F2; border: 2px solid #F87171; border-radius: var(--radius-xl); padding: 20px 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 14px;">
            <div style="color: #DC2626; display: flex;">\${CLINIC_ICONS.alertTriangle}</div>
            <div>
              <h2 style="font-size: 1.35rem; font-weight: 900; color: #991B1B; margin: 0 0 2px 0;">Urgent Dental Trauma &amp; Emergency Triage</h2>
              <p style="font-size: 0.88rem; color: #B91C1C; margin: 0;">Priority 1 clinical fast-track. Direct dispatch to Surgical &amp; Implant Suite (Chair 3).</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
            <!-- Left: Emergency Conditions -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: #0F172A; margin-bottom: 10px;">
                Select Emergency Condition:
              </label>
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
                \${(window.EMERGENCY_DENTAL_PROCEDURES || []).map(proc => \`
                  <div class="kiosk-symptom-card \${selectedProc === proc.id ? 'selected' : ''}" onclick="app.selectEmergencyProcedure('\${proc.id}')" style="padding: 12px 16px; border-radius: var(--radius-lg); border: 2px solid \${selectedProc === proc.id ? '#DC2626' : '#E2E8F0'}; background: \${selectedProc === proc.id ? '#FEF2F2' : '#FFF'}; cursor: pointer; transition: all 0.15s ease;">
                    <strong style="color: #991B1B; font-size: 0.92rem; display: block;">\${proc.name}</strong>
                    <div style="font-size: 0.78rem; color: #64748B; margin-top: 2px;">Assigned: \${proc.assignedChair} • Priority: <strong style="color: #DC2626;">Immediate</strong></div>
                  </div>
                \`).join('')}
              </div>

              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: #0F172A; margin-bottom: 6px;">
                Patient Full Name:
              </label>
              <input type="text" id="kiosk-emg-name" class="form-control" style="font-size: 1.05rem; padding: 12px 16px; border-radius: var(--radius-md);" placeholder="Full Name" value="\${this.kioskState.emergencyName || ''}" oninput="app.kioskState.emergencyName = this.value">
            </div>

            <!-- Right: Touch Keypad for Phone -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm); text-align: center;">
              <label style="display: block; font-weight: 800; font-size: 0.9rem; color: #0F172A; margin-bottom: 10px; text-align: left;">
                Contact Mobile Phone:
              </label>
              
              <!-- Digital Phone Box -->
              <div class="kiosk-phone-display active" onclick="app.setKioskActiveInput('emergencyPhone')" style="margin-bottom: 16px; height: 56px; font-size: 1.5rem; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg); font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0F172A; background: #FEF2F2; border: 2px solid #DC2626;">
                \${this.kioskState.emergencyPhone ? this.kioskState.emergencyPhone : '<span style="color:#94A3B8; font-weight:500;">(555) 000-0000</span>'}
              </div>

              <!-- Virtual Numpad Grid -->
              <div class="kiosk-numpad-grid" style="margin-bottom: 20px;">
                \${[1,2,3,4,5,6,7,8,9].map(n => \`<button class="kiosk-num-key" onclick="app.enterKioskNum('\${n}')">\${n}</button>\`).join('')}
                <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
                <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
                <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
              </div>

              <button class="btn btn-danger btn-lg" onclick="app.submitEmergencyKiosk()" style="width: 100%; height: 58px; font-size: 1.15rem; font-weight: 900; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 25px rgba(220,38,38,0.35);">
                \${CLINIC_ICONS.alertTriangle}
                <span>PRINT EMERGENCY TOKEN (EMG)</span>
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    // ================= APPOINTMENT CHECK-IN SEARCH =================
    else if (pathway === 'CHECKIN_SEARCH') {
      const res = this.kioskState.checkinResult;
      bodyHtml = \`
        <div style="max-width: 700px; margin: 10px auto 30px; padding: 0 20px;">
          <!-- Back button -->
          <div style="margin-bottom: 16px;">
            <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="padding: 10px 18px; font-weight: 700;">
              ← Return to Welcome
            </button>
          </div>

          <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 28px; box-shadow: var(--shadow-sm); text-align: center;">
            <div style="display: flex; justify-content: center; margin-bottom: 12px; color: var(--secondary-blue);">
              \${CLINIC_ICONS.calendar}
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 900; color: #0F172A; margin: 0 0 6px 0;">Appointment Arrival Check-In</h2>
            <p style="font-size: 0.95rem; color: #64748B; margin: 0 0 20px 0;">Enter your 10-digit mobile phone number using touch keypad to verify today's visit:</p>

            <!-- Phone Display -->
            <div class="kiosk-phone-display active" onclick="app.setKioskActiveInput('checkinPhone')" style="margin: 0 auto 18px; max-width: 340px; height: 56px; font-size: 1.5rem; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg); font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0F172A; background: #F0F9FF; border: 2px solid var(--secondary-blue);">
              \${this.kioskState.checkinPhone ? this.kioskState.checkinPhone : '<span style="color:#94A3B8; font-weight:500;">(555) 000-0000</span>'}
            </div>

            <!-- Virtual Numpad Grid -->
            <div class="kiosk-numpad-grid" style="max-width: 320px; margin: 0 auto 20px;">
              \${[1,2,3,4,5,6,7,8,9].map(n => \`<button class="kiosk-num-key" onclick="app.enterKioskNum('\${n}')">\${n}</button>\`).join('')}
              <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
              <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
              <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
            </div>

            <button class="btn btn-primary" onclick="app.searchAppointmentKiosk()" style="padding: 14px 36px; font-size: 1.05rem; font-weight: 800; border-radius: var(--radius-pill); margin-bottom: 20px;">
              \${CLINIC_ICONS.search} Search My Appointment
            </button>

            <!-- Search Results -->
            \${res ? (
              res.appointment ? \`
                <div style="background: #F0FDF4; border: 2px solid #22C55E; border-radius: var(--radius-xl); padding: 20px; text-align: left; margin-top: 10px;">
                  <span class="badge badge-green" style="font-size: 0.75rem; padding: 4px 10px; margin-bottom: 8px;">APPOINTMENT CONFIRMED</span>
                  <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">\${res.patient.name}</h3>
                  <div style="font-size: 0.88rem; color: #166534;">
                    Time: <strong>\${res.appointment.time}</strong> • Attending: <strong>\${res.appointment.doctor}</strong>
                  </div>
                  <button class="btn btn-success" onclick="app.confirmAppointmentCheckin()" style="margin-top: 14px; width: 100%; padding: 14px; font-weight: 800; font-size: 1.05rem; border-radius: var(--radius-md);">
                    \${CLINIC_ICONS.checkCircle} Confirm Arrival &amp; Print Queue Token
                  </button>
                </div>
              \` : \`
                <div style="background: #FFFBEB; border: 2px solid #F59E0B; border-radius: var(--radius-xl); padding: 20px; text-align: center; margin-top: 10px;">
                  <h4 style="font-size: 1.1rem; font-weight: 800; color: #92400E; margin: 0 0 6px 0;">No Appointment Found for Today</h4>
                  <p style="font-size: 0.85rem; color: #B45309; margin: 0 0 14px 0;">We could not locate a pre-booked appointment under this mobile number.</p>
                  <button class="btn btn-primary" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(1);" style="padding: 10px 22px; font-weight: 700;">
                    Join as Walk-In Patient Instead →
                  </button>
                </div>
              \`
            ) : ''}
          </div>
        </div>
      \`;
    }

    mount.innerHTML = bodyHtml;
  }`;

content = content.slice(0, startIdx) + newKioskCode + '\n\n' + content.slice(endIdx);
fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Successfully redesigned renderKioskStation in js/app.js!');
