const fs = require('fs');

const appPath = 'js/app.js';
let appCode = fs.readFileSync(appPath, 'utf8');

// Find boundaries of renderKioskStation
const startIdx = appCode.indexOf('  renderKioskStation() {');
const endIdx = appCode.indexOf('  renderTvStation() {');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find renderKioskStation');
  process.exit(1);
}

const currentKiosk = appCode.substring(startIdx, endIdx);

// Let's replace the Step 1 block in currentKiosk
const step1Target = `          <!-- 2-Column Split: Left Concern & Details, Right Touch Keypad -->
          <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start;">
            
            <!-- Left: Concern Options & Name -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <label style="font-weight: 800; font-size: 0.95rem; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span style="background: var(--primary-teal); color: #FFF; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">1</span>
                  <span>Select Primary Dental Concern:</span>
                </label>
                <span style="font-size: 0.75rem; color: #64748B;">Touch to select</span>
              </div>

              <!-- Concern Items List with Icons -->
              <div style="display: flex; flex-direction: column; gap: 9px; margin-bottom: 22px;">
                \${concernList.map(c => {
                  const isSelected = this.kioskState.selectedSymptoms.includes(c.id);
                  return \`
                    <div onclick="app.toggleKioskSymptom('\${c.id}')" style="display: flex; justify-content: space-between; align-items: center; padding: 11px 15px; border-radius: var(--radius-lg); border: 2px solid \${isSelected ? 'var(--primary-teal)' : '#E2E8F0'}; background: \${isSelected ? '#F0FDFA' : '#FFF'}; cursor: pointer; transition: all 0.15s ease;">
                      <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: \${isSelected ? '#CCFBF1' : '#F8FAFC'}; border: 1px solid \${isSelected ? '#99F6E4' : '#E2E8F0'}; display: flex; align-items: center; justify-content: center; color: \${isSelected ? 'var(--dark-teal)' : '#475569'}; flex-shrink: 0;">
                          \${c.icon}
                        </div>
                        <strong style="font-size: 0.88rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${c.name}</strong>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        <span class="badge \${isSelected ? 'badge-teal' : 'badge-subtle'}" style="font-size: 0.75rem;">\${c.est}</span>
                        <span style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid \${isSelected ? 'var(--primary-teal)' : '#CBD5E1'}; background: \${isSelected ? 'var(--primary-teal)' : '#FFF'}; display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 11px; font-weight: 800;">
                          \${isSelected ? '✓' : ''}
                        </span>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>

              <!-- Name Input -->
              <div style="margin-bottom: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 8px;">
                  <span style="background: var(--primary-teal); color: #FFF; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">2</span>
                  <span>Patient Full Name (Optional):</span>
                </label>
                <div style="position: relative;">
                  <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748B; display: flex;">
                    \${CLINIC_ICONS.user}
                  </div>
                  <input type="text" id="kiosk-walkin-name" class="form-control" style="font-size: 1rem; padding: 12px 14px 12px 42px; border-radius: var(--radius-md);" placeholder="e.g. John Doe (or leave blank for Walk-in)" value="\${this.kioskState.name || ''}" oninput="app.kioskState.name = this.value">
                </div>
              </div>
            </div>

            <!-- Right: Touch Keypad for Phone & Dispense Action -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm); text-align: center;">
              <label style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 10px; text-align: left;">
                <span style="background: var(--primary-teal); color: #FFF; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">3</span>
                <span>Mobile Phone Number:</span>
              </label>
              
              <!-- Digital Formatted Phone Display -->
              <div class="kiosk-phone-display active" onclick="app.setKioskActiveInput('phone')" style="margin-bottom: 16px; height: 56px; font-size: 1.5rem; letter-spacing: 2px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-lg); font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0F172A; background: #F8FAFC; border: 2px solid var(--primary-teal);">
                \${this.kioskState.phone ? this.kioskState.phone : '<span style="color:#94A3B8; font-weight:500;">(555) 000-0000</span>'}
              </div>

              <!-- Virtual Numpad Grid (58px+ targets) -->
              <div class="kiosk-numpad-grid" style="margin-bottom: 20px;">
                \${[1,2,3,4,5,6,7,8,9].map(n => \`<button class="kiosk-num-key" onclick="app.enterKioskNum('\${n}')">\${n}</button>\`).join('')}
                <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
                <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
                <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
              </div>

              <!-- Issue Token Primary Button -->
              <button class="btn btn-primary" onclick="app.issueWalkinToken()" style="width: 100%; height: 58px; font-size: 1.15rem; font-weight: 800; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 20px rgba(13,148,136,0.25);">
                \${CLINIC_ICONS.printer}
                <span>Touch to Print Token Slip</span>
              </button>
            </div>
          </div>`;

const step1Replacement = `          <!-- 2-Column Split: Left Concern & Details, Right Patient Info & Action -->
          <div class="kiosk-intake-grid" style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start;">
            
            <!-- Left: Concern Options -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <label style="font-weight: 800; font-size: 0.95rem; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span style="background: var(--primary-teal); color: #FFF; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">1</span>
                  <span>Select Primary Dental Concern:</span>
                </label>
                <span style="font-size: 0.75rem; color: #64748B;">Touch to select</span>
              </div>

              <!-- Concern Items List with Icons -->
              <div style="display: flex; flex-direction: column; gap: 9px;">
                \${concernList.map(c => {
                  const isSelected = this.kioskState.selectedSymptoms.includes(c.id);
                  return \`
                    <div onclick="app.toggleKioskSymptom('\${c.id}')" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: var(--radius-lg); border: 2px solid \${isSelected ? 'var(--primary-teal)' : '#E2E8F0'}; background: \${isSelected ? '#F0FDFA' : '#FFF'}; cursor: pointer; transition: all 0.15s ease;">
                      <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                        <div style="width: 34px; height: 34px; border-radius: 8px; background: \${isSelected ? '#CCFBF1' : '#F8FAFC'}; border: 1px solid \${isSelected ? '#99F6E4' : '#E2E8F0'}; display: flex; align-items: center; justify-content: center; color: \${isSelected ? 'var(--dark-teal)' : '#475569'}; flex-shrink: 0;">
                          \${c.icon}
                        </div>
                        <strong style="font-size: 0.88rem; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${c.name}</strong>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                        <span class="badge \${isSelected ? 'badge-teal' : 'badge-subtle'}" style="font-size: 0.75rem;">\${c.est}</span>
                        <span style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid \${isSelected ? 'var(--primary-teal)' : '#CBD5E1'}; background: \${isSelected ? 'var(--primary-teal)' : '#FFF'}; display: flex; align-items: center; justify-content: center; color: #FFF; font-size: 11px; font-weight: 800;">
                          \${isSelected ? '✓' : ''}
                        </span>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>

            <!-- Right: Patient Information & Instant Token Dispense (Name & Number Text Boxes) -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
                <span style="background: var(--primary-teal); color: #FFF; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800;">2</span>
                <h3 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0;">Patient Information</h3>
              </div>

              <!-- Patient Full Name Text Box -->
              <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 800; font-size: 0.88rem; color: #0F172A; margin-bottom: 6px;">
                  Patient Full Name (Optional):
                </label>
                <div style="position: relative;">
                  <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748B; display: flex;">
                    \${CLINIC_ICONS.user}
                  </div>
                  <input type="text" id="kiosk-walkin-name" class="form-control" style="font-size: 1rem; padding: 12px 14px 12px 42px; border-radius: var(--radius-md);" placeholder="e.g. John Doe (or leave blank)" value="\${this.kioskState.name || ''}" oninput="app.kioskState.name = this.value">
                </div>
              </div>

              <!-- Mobile Phone Number Text Box -->
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 800; font-size: 0.88rem; color: #0F172A; margin-bottom: 6px;">
                  Mobile Phone Number:
                </label>
                <div style="position: relative;">
                  <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748B; display: flex;">
                    \${CLINIC_ICONS.phone}
                  </div>
                  <input type="tel" id="kiosk-walkin-phone" class="form-control" style="font-size: 1.05rem; padding: 12px 14px 12px 42px; border-radius: var(--radius-md); font-family: 'JetBrains Mono', monospace;" placeholder="e.g. (555) 012-3456" value="\${this.kioskState.phone || ''}" oninput="app.kioskState.phone = this.value">
                </div>
                <div style="font-size: 0.76rem; color: #64748B; margin-top: 5px;">
                  Used for SMS queue announcements and clinical records.
                </div>
              </div>

              <!-- Operatory & Doctor Summary Pill -->
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-lg); padding: 12px 14px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 0.7rem; font-weight: 800; color: var(--primary-teal); text-transform: uppercase;">Assigned Suite</div>
                  <div style="font-size: 0.86rem; font-weight: 800; color: #0F172A;">\${docSuite}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.7rem; font-weight: 800; color: #64748B; text-transform: uppercase;">Estimated Wait</div>
                  <div style="font-size: 0.86rem; font-weight: 800; color: #16A34A;">~10 Mins</div>
                </div>
              </div>

              <!-- Issue Token Primary Button -->
              <button class="btn btn-primary" onclick="app.issueWalkinToken()" style="width: 100%; height: 56px; font-size: 1.12rem; font-weight: 800; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 10px 20px rgba(13,148,136,0.25);">
                \${CLINIC_ICONS.printer}
                <span>Touch to Print Token Slip</span>
              </button>

              <div style="margin-top: 12px; text-align: center; font-size: 0.74rem; color: #94A3B8;">
                🔒 Contactless Check-In • Thermal Queue Ticket
              </div>
            </div>
          </div>`;

if (!appCode.includes(step1Target)) {
  console.error('Could not find step1Target in appCode!');
  process.exit(1);
}

appCode = appCode.replace(step1Target, step1Replacement);
fs.writeFileSync(appPath, appCode, 'utf8');
console.log('Successfully adjusted Step 1 Name and Number text boxes!');
