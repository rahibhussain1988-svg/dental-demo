const fs = require('fs');

const appPath = 'js/app.js';
let appCode = fs.readFileSync(appPath, 'utf8');

const newRenderKioskStation = `  renderKioskStation() {
    const mount = document.getElementById("kiosk-main-mount");
    if (!mount) return;

    const { pathway, step } = this.kioskState;

    let bodyHtml = '';

    // ================= STEP 0: WELCOME & 4 PATHWAYS =================
    if (step === 0 && (pathway === 'WALK_IN' || !pathway)) {
      const cabins = [
        {
          id: "c1",
          name: "Chair 1 (General)",
          doctor: "Dr. Sarah Chen, DDS",
          spec: "Restorative Lead",
          wait: "Est. ~5m",
          status: "Active",
          statusColor: "#22C55E",
          photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
        },
        {
          id: "c2",
          name: "Chair 2 (Ortho Bay)",
          doctor: "Dr. Marcus Vance",
          spec: "Chief Orthodontist",
          wait: "Est. ~8m",
          status: "Active",
          statusColor: "#22C55E",
          photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
        },
        {
          id: "c3",
          name: "Chair 3 (Surgical)",
          doctor: "Dr. Sarah Chen, DDS",
          spec: "Surgeon & Trauma",
          wait: "Priority Ready",
          status: "Sanitized",
          statusColor: "#0EA5E9",
          photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"
        },
        {
          id: "c4",
          name: "Chair 4 (Hygiene/Kids)",
          doctor: "Liam Vance, RDA",
          spec: "Hygiene & Cleanings",
          wait: "Est. ~10m",
          status: "Open",
          statusColor: "#22C55E",
          photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80"
        }
      ];

      bodyHtml = \`
        <div style="max-width: 1140px; margin: 8px auto 36px; padding: 0 20px;">
          
          <!-- Clinic Welcome Header -->
          <div style="text-align: center; margin-bottom: 22px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #F0FDFA; border: 1px solid #CCFBF1; padding: 5px 16px; border-radius: var(--radius-pill); margin-bottom: 10px;">
              <span style="color: var(--primary-teal); display: flex;">\${CLINIC_ICONS.tooth}</span>
              <span style="font-size: 0.76rem; font-weight: 800; color: var(--dark-teal); letter-spacing: 0.6px; text-transform: uppercase;">
                Smile Dental &amp; Orthodontics • Self-Service Intake Terminal #01
              </span>
              <span style="width: 7px; height: 7px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
            </div>
            <h1 style="font-size: 2.35rem; font-weight: 900; color: #0F172A; margin: 0 0 6px 0; letter-spacing: -0.5px;">
              Touchscreen Patient Intake &amp; Check-In
            </h1>
            <p style="font-size: 1rem; color: #64748B; margin: 0 auto; max-width: 620px;">
              Select your visit type below for instant token dispensing, pre-booked arrivals, or fast-track emergency dental triage.
            </p>
          </div>

          <!-- Operatory Cabin Live Availability Strip -->
          <div class="kiosk-cabins-strip">
            \${cabins.map(c => \`
              <div class="kiosk-cabin-tile">
                <img src="\${c.photo}" alt="\${c.doctor}" class="kiosk-cabin-avatar" />
                <div class="kiosk-cabin-info">
                  <div class="kiosk-cabin-title">\${c.name}</div>
                  <div class="kiosk-cabin-doc">\${c.doctor}</div>
                  <div class="kiosk-cabin-meta">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: \${c.statusColor}; display: inline-block;"></span>
                    <span>\${c.spec}</span>
                    <span style="color: #CBD5E1;">•</span>
                    <strong style="color: #0F172A;">\${c.wait}</strong>
                  </div>
                </div>
              </div>
            \`).join('')}
          </div>

          <!-- Urgent Trauma / Emergency Fast-Track Banner -->
          <div class="kiosk-urgent-banner" onclick="app.setKioskPathway('EMERGENCY_TRIAGE')" style="background: linear-gradient(135deg, #8B0029 0%, #BE123C 60%, #9F1239 100%); color: #FFF; border: 2px solid #FDA4AF; border-radius: 18px; padding: 16px 22px; cursor: pointer; box-shadow: 0 10px 25px -4px rgba(190,18,60,0.35); transition: transform 0.2s ease; margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px; min-width: 0;">
              <div style="width: 46px; height: 46px; border-radius: 12px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; color: #FFF; flex-shrink: 0;">
                \${CLINIC_ICONS.alertTriangle}
              </div>
              <div style="min-width: 0;">
                <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.22); color: #FFF; font-weight: 800; font-size: 0.72rem; padding: 2px 10px; border-radius: 9999px; margin-bottom: 4px;">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #FDE047;"></span>
                  <span>PRIORITY 1 FAST-TRACK • DIRECT DISPATCH CHAIR 3</span>
                </div>
                <h3 style="font-size: 1.25rem; font-weight: 900; color: #FFF; margin: 0 0 2px 0;">Urgent Dental Trauma &amp; Emergency Triage</h3>
                <p style="font-size: 0.85rem; color: #FFE4E6; margin: 0;">Immediate priority care for severe toothache, facial swelling/abscess, bleeding, or broken braces wire.</p>
              </div>
            </div>
            <div style="flex-shrink: 0; background: #FFF; color: #8B0029; font-weight: 800; font-size: 0.88rem; padding: 12px 18px; border-radius: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <span>Emergency Triage</span>
              \${CLINIC_ICONS.chevronRight}
            </div>
          </div>

          <!-- 3 Primary Touch Workflows with Dental Healthcare Pictures -->
          <div class="kiosk-pathways-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
            
            <!-- Option 1: General Dental Walk-In -->
            <div class="kiosk-pathway-card-v2" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(1);">
              <div class="kiosk-pathway-img-wrap">
                <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&auto=format&fit=crop&q=80" alt="General Dental Walk-In" />
                <div class="kiosk-pathway-badge-floating">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #2DD4BF;"></span>
                  <span>Same-Day Walk-In</span>
                </div>
                <div class="kiosk-pathway-icon-floating" style="color: var(--primary-teal);">
                  \${CLINIC_ICONS.tooth}
                </div>
              </div>
              <div class="kiosk-pathway-content">
                <h3 class="kiosk-pathway-title">General Dental Walk-In</h3>
                <p class="kiosk-pathway-desc">
                  No booking needed. Same-day exam, teeth cleaning &amp; hygiene, cavity fillings, toothache relief, or extractions.
                </p>
                <div class="kiosk-pathway-footer">
                  <span style="font-weight: 700; font-size: 0.84rem; color: var(--primary-teal); display: flex; align-items: center; gap: 5px;">
                    \${CLINIC_ICONS.clock} Est. Wait: ~10 Mins
                  </span>
                  <span class="kiosk-pathway-action-btn">
                    <span>Touch for Token</span> \${CLINIC_ICONS.chevronRight}
                  </span>
                </div>
              </div>
            </div>

            <!-- Option 2: Orthodontics & Braces Bay -->
            <div class="kiosk-pathway-card-v2" onclick="app.setKioskPathway('ORTHO_WALKIN'); app.setKioskStep(1);" style="border-color: #E9D5FF;">
              <div class="kiosk-pathway-img-wrap">
                <img src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500&auto=format&fit=crop&q=80" alt="Orthodontics & Braces" />
                <div class="kiosk-pathway-badge-floating" style="background: rgba(88, 28, 135, 0.88);">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #C084FC;"></span>
                  <span>Ortho Bay • Chair 2</span>
                </div>
                <div class="kiosk-pathway-icon-floating" style="color: #7C3AED; border-color: #E9D5FF;">
                  \${CLINIC_ICONS.brackets}
                </div>
              </div>
              <div class="kiosk-pathway-content">
                <h3 class="kiosk-pathway-title">Braces &amp; Clear Aligners</h3>
                <p class="kiosk-pathway-desc">
                  Orthodontic wire adjustments, loose bracket repairs, clear aligner tray pick-up, or new braces consultation.
                </p>
                <div class="kiosk-pathway-footer">
                  <span style="font-weight: 700; font-size: 0.84rem; color: #7C3AED; display: flex; align-items: center; gap: 5px;">
                    \${CLINIC_ICONS.stethoscope} Dr. Marcus Vance
                  </span>
                  <span class="kiosk-pathway-action-btn" style="background: #7C3AED;">
                    <span>Touch for Ortho</span> \${CLINIC_ICONS.chevronRight}
                  </span>
                </div>
              </div>
            </div>

            <!-- Option 3: Pre-Booked Appointment Arrival Check-In -->
            <div class="kiosk-pathway-card-v2" onclick="app.setKioskPathway('CHECKIN_SEARCH');" style="border-color: #BAE6FD;">
              <div class="kiosk-pathway-img-wrap">
                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80" alt="Appointment Check-In" />
                <div class="kiosk-pathway-badge-floating" style="background: rgba(12, 74, 110, 0.88);">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: #38BDF8;"></span>
                  <span>Scheduled Patient</span>
                </div>
                <div class="kiosk-pathway-icon-floating" style="color: #0284C7; border-color: #BAE6FD;">
                  \${CLINIC_ICONS.calendar}
                </div>
              </div>
              <div class="kiosk-pathway-content">
                <h3 class="kiosk-pathway-title">Appointment Check-In</h3>
                <p class="kiosk-pathway-desc">
                  Already booked for today? Enter your mobile phone number on the touch keypad to confirm arrival &amp; print queue slip.
                </p>
                <div class="kiosk-pathway-footer">
                  <span style="font-weight: 700; font-size: 0.84rem; color: #0284C7; display: flex; align-items: center; gap: 5px;">
                    \${CLINIC_ICONS.checkCircle} Verified Arrival
                  </span>
                  <span class="kiosk-pathway-action-btn" style="background: #0284C7;">
                    <span>Check In Now</span> \${CLINIC_ICONS.chevronRight}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- Bottom Live Status Telemetry Bar -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap; padding: 12px 24px; background: #FFFFFF; border: 1px solid var(--border-color); border-radius: var(--radius-pill); box-shadow: var(--shadow-sm); font-size: 0.84rem; color: #475569;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #22C55E; display: inline-block;"></span>
              <span><strong>4 Operatory Suites</strong> Active &amp; Sanitized</span>
            </div>
            <span style="color: #CBD5E1;">•</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--primary-teal); display: flex;">\${CLINIC_ICONS.clock}</span>
              <span>Lounge Wait Time: <strong>~10 Mins</strong></span>
            </div>
            <span style="color: #CBD5E1;">•</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: var(--secondary-blue); display: flex;">\${CLINIC_ICONS.printer}</span>
              <span>Thermal Token Printer: <strong>Ready</strong></span>
            </div>
            <span style="color: #CBD5E1;">•</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: #0D9488; display: flex;">\${CLINIC_ICONS.shield}</span>
              <span>Need help? Front desk staff is nearby</span>
            </div>
          </div>
        </div>
      \`;
    }

    // ================= STEP 1: FAST-TRACK WALK-IN INTAKE =================
    else if ((pathway === 'WALK_IN' || pathway === 'ORTHO_WALKIN') && step >= 1) {
      const isOrtho = pathway === 'ORTHO_WALKIN';
      
      const docPhoto = isOrtho 
        ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80";
      const docName = isOrtho ? "Dr. Marcus Vance, Ortho Lead" : "Dr. Sarah Chen, DDS";
      const docSuite = isOrtho ? "Chair 2: Specialized Orthodontic Bay" : "Chair 1: General & Restorative Operatory";
      const docFee = isOrtho ? "$50 Consult" : "$65 Exam & Consult";

      const concernList = isOrtho ? [
        { id: 'ortho-wire', name: 'Archwire Adjustment / Tightening', est: '$75', icon: CLINIC_ICONS.wrench },
        { id: 'ortho-bracket', name: 'Loose Bracket / Pokey Wire Trauma', est: '$60', icon: CLINIC_ICONS.alertTriangle },
        { id: 'ortho-aligner', name: 'Clear Aligner Check / Tray Pick-up', est: '$80', icon: CLINIC_ICONS.sparkles },
        { id: 'ortho-consult', name: 'New Patient Braces Consultation', est: '$50', icon: CLINIC_ICONS.smile }
      ] : [
        { id: 'sym-1', name: 'Severe Toothache / Cavity Pain', est: '$65', icon: CLINIC_ICONS.tooth },
        { id: 'sym-2', name: 'Teeth Cleaning & Scaling (Hygiene)', est: '$80', icon: CLINIC_ICONS.sparkles },
        { id: 'sym-3', name: 'Comprehensive Dental Exam & Checkup', est: '$40', icon: CLINIC_ICONS.stethoscope },
        { id: 'sym-4', name: 'Broken Tooth / Chipped Enamel', est: '$95', icon: CLINIC_ICONS.alertTriangle },
        { id: 'sym-5', name: 'Gum Swelling / Bleeding Gums', est: '$70', icon: CLINIC_ICONS.shield },
        { id: 'sym-6', name: 'Tooth Extraction / Wisdom Tooth Pain', est: '$90', icon: CLINIC_ICONS.emergency }
      ];

      bodyHtml = \`
        <div style="max-width: 980px; margin: 10px auto 30px; padding: 0 20px;">
          
          <!-- Header Bar with Back Button & Attending Clinician Badge -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 12px;">
            <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="padding: 10px 18px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <span>←</span> Return to Welcome
            </button>
            
            <!-- Attending Doctor Badge -->
            <div style="display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1.5px solid var(--border-color); padding: 8px 16px; border-radius: var(--radius-lg); box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <img src="\${docPhoto}" alt="\${docName}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 1.5px solid \${isOrtho ? '#C084FC' : '#CCFBF1'};" />
              <div>
                <div style="font-size: 0.72rem; font-weight: 800; color: \${isOrtho ? '#7C3AED' : 'var(--primary-teal)'}; text-transform: uppercase;">
                  Attending Clinician • \${docFee}
                </div>
                <div style="font-size: 0.92rem; font-weight: 800; color: #0F172A;">\${docName}</div>
                <div style="font-size: 0.76rem; color: #64748B;">\${docSuite}</div>
              </div>
            </div>
          </div>

          <!-- 2-Column Split: Left Concern & Details, Right Touch Keypad -->
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
          </div>
        </div>
      \`;
    }

    // ================= EMERGENCY TRIAGE =================
    else if (pathway === 'EMERGENCY_TRIAGE') {
      const selectedProc = this.kioskState.selectedEmergencyProc || 'emg-1';
      bodyHtml = \`
        <div style="max-width: 960px; margin: 10px auto 30px; padding: 0 20px;">
          <!-- Back button & Emergency Badge -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="padding: 10px 18px; font-weight: 700;">
              ← Return to Welcome
            </button>

            <!-- Attending Trauma Surgeon Card -->
            <div style="display: flex; align-items: center; gap: 12px; background: #FEF2F2; border: 1.5px solid #FCA5A5; padding: 8px 16px; border-radius: var(--radius-lg);">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80" alt="Dr. Sarah Chen, DDS" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 1.5px solid #EF4444;" />
              <div>
                <div style="font-size: 0.72rem; font-weight: 800; color: #DC2626; text-transform: uppercase;">
                  Immediate Trauma Dispatch
                </div>
                <div style="font-size: 0.92rem; font-weight: 800; color: #991B1B;">Dr. Sarah Chen, Oral Surgeon</div>
                <div style="font-size: 0.76rem; color: #7F1D1D;">Chair 3: Surgical &amp; Implant Suite</div>
              </div>
            </div>
          </div>

          <!-- Emergency Banner -->
          <div style="background: #FEF2F2; border: 2px solid #F87171; border-radius: var(--radius-xl); padding: 18px 24px; margin-bottom: 20px; display: flex; align-items: center; gap: 16px;">
            <div style="color: #DC2626; display: flex; width: 44px; height: 44px; background: rgba(220,38,38,0.12); border-radius: 12px; align-items: center; justify-content: center; flex-shrink: 0;">
              \${CLINIC_ICONS.alertTriangle}
            </div>
            <div>
              <h2 style="font-size: 1.3rem; font-weight: 900; color: #991B1B; margin: 0 0 2px 0;">Urgent Dental Trauma &amp; Emergency Triage</h2>
              <p style="font-size: 0.88rem; color: #B91C1C; margin: 0;">Priority 1 clinical fast-track. Direct dispatch to Surgical &amp; Implant Suite (Chair 3).</p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: start;">
            <!-- Left: Emergency Conditions -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <label style="display: block; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 12px;">
                Select Emergency Condition:
              </label>
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;">
                \${(window.EMERGENCY_DENTAL_PROCEDURES || []).map(proc => \`
                  <div class="kiosk-symptom-card \${selectedProc === proc.id ? 'selected' : ''}" onclick="app.selectEmergencyProcedure('\${proc.id}')" style="padding: 12px 16px; border-radius: var(--radius-lg); border: 2px solid \${selectedProc === proc.id ? '#DC2626' : '#E2E8F0'}; background: \${selectedProc === proc.id ? '#FEF2F2' : '#FFF'}; cursor: pointer; transition: all 0.15s ease;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <strong style="color: #991B1B; font-size: 0.92rem; display: block;">\${proc.name}</strong>
                      <span class="badge badge-red" style="font-size: 0.7rem;">Immediate</span>
                    </div>
                    <div style="font-size: 0.78rem; color: #64748B; margin-top: 3px;">Assigned: \${proc.assignedChair}</div>
                  </div>
                \`).join('')}
              </div>

              <label style="display: block; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 6px;">
                Patient Full Name:
              </label>
              <div style="position: relative;">
                <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748B; display: flex;">
                  \${CLINIC_ICONS.user}
                </div>
                <input type="text" id="kiosk-emg-name" class="form-control" style="font-size: 1rem; padding: 12px 14px 12px 42px; border-radius: var(--radius-md);" placeholder="Full Name" value="\${this.kioskState.emergencyName || ''}" oninput="app.kioskState.emergencyName = this.value">
              </div>
            </div>

            <!-- Right: Touch Keypad for Phone -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm); text-align: center;">
              <label style="display: block; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 10px; text-align: left;">
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
        <div style="max-width: 760px; margin: 10px auto 30px; padding: 0 20px;">
          <!-- Back button -->
          <div style="margin-bottom: 16px;">
            <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="padding: 10px 18px; font-weight: 700;">
              ← Return to Welcome
            </button>
          </div>

          <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 28px; box-shadow: var(--shadow-sm); text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 16px; background: #E0F2FE; color: var(--secondary-blue); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">
              \${CLINIC_ICONS.calendar}
            </div>
            <h2 style="font-size: 1.6rem; font-weight: 900; color: #0F172A; margin: 0 0 6px 0;">Appointment Arrival Check-In</h2>
            <p style="font-size: 0.95rem; color: #64748B; margin: 0 0 20px 0;">Enter your 10-digit mobile phone number using the touch keypad to verify today's visit:</p>

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

            <button class="btn btn-primary" onclick="app.searchAppointmentKiosk()" style="padding: 14px 36px; font-size: 1.05rem; font-weight: 800; border-radius: var(--radius-pill); margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px;">
              \${CLINIC_ICONS.search} <span>Search My Appointment</span>
            </button>

            <!-- Search Results -->
            \${res ? (
              res.appointment ? \`
                <div style="background: #F0FDF4; border: 2px solid #22C55E; border-radius: var(--radius-xl); padding: 20px; text-align: left; margin-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80" alt="Doctor" style="width: 52px; height: 52px; border-radius: 12px; object-fit: cover; border: 2px solid #22C55E;" />
                    <div>
                      <span class="badge badge-green" style="font-size: 0.72rem; padding: 3px 8px; margin-bottom: 4px;">APPOINTMENT CONFIRMED</span>
                      <h3 style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0 0 2px 0;">\${res.patient.name}</h3>
                      <div style="font-size: 0.88rem; color: #166534;">
                        Time: <strong>\${res.appointment.time}</strong> • Attending: <strong>\${res.appointment.doctor}</strong>
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-success" onclick="app.confirmAppointmentCheckin()" style="padding: 14px 22px; font-weight: 800; font-size: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 8px;">
                    \${CLINIC_ICONS.checkCircle} <span>Confirm &amp; Print Token</span>
                  </button>
                </div>
              \` : \`
                <div style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: var(--radius-lg); padding: 14px; text-align: center; color: #991B1B; font-weight: 700; font-size: 0.9rem;">
                  No scheduled appointment found for that phone number today. Please select General Walk-In or speak with reception.
                </div>
              \`
            ) : ''}
          </div>
        </div>
      \`;
    }

    mount.innerHTML = bodyHtml;
  },`;

const startIdx = appCode.indexOf('  renderKioskStation() {');
const endIdx = appCode.indexOf('  renderTvStation() {');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate renderKioskStation boundaries!');
  process.exit(1);
}

appCode = appCode.substring(0, startIdx) + newRenderKioskStation + '\n\n' + appCode.substring(endIdx);
fs.writeFileSync(appPath, appCode, 'utf8');
console.log('Successfully replaced renderKioskStation in js/app.js!');
