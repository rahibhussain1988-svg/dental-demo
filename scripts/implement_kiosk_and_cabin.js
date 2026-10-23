const fs = require('fs');

const appPath = 'js/app.js';
let appCode = fs.readFileSync(appPath, 'utf8');

// 1. Update init() to pre-render all workstation sections so section[3] (cabin) is NEVER blank
const oldInit = `  init() {
    this.setupClock();
    this.setupNavigation();
    this.setupRoleSwitcher();
    this.setupKioskToggle();
    this.setupModals();
    this.setupWorkstationNav();
    this.switchStation("PATIENT_KIOSK");
  }`;

const newInit = `  init() {
    this.setupClock();
    this.setupNavigation();
    this.setupRoleSwitcher();
    this.setupKioskToggle();
    this.setupModals();
    this.setupWorkstationNav();

    // Pre-populate all workstation sections so no section is ever blank
    this.renderKioskStation();
    this.renderTvStation();
    this.renderCabinStation();
    this.renderBillingStation();
    this.renderPharmacyStation();

    this.switchStation("PATIENT_KIOSK");
  }`;

if (appCode.includes(oldInit)) {
  appCode = appCode.replace(oldInit, newInit);
  console.log('Pre-rendered all stations in init() successfully!');
}

// 2. Add properties to state if needed
if (!appCode.includes('kioskApptTab:')) {
  appCode = appCode.replace(
    'kioskState: {',
    'kioskApptTab: "today",\n  kioskApptSearch: "",\n  selectedCabinChair: "chair-1",\n  cabinSelectedTooth: "16",\n  kioskState: {'
  );
}

// 3. Helper methods for Kiosk Live Search & Cabin Station
const helperMethods = `
  onKioskLiveApptSearch(val) {
    this.kioskApptSearch = val || '';
    this.renderKioskStation();
    const searchInput = document.getElementById("kiosk-live-appt-search");
    if (searchInput) {
      if (typeof searchInput.focus === 'function') searchInput.focus();
      const len = (searchInput.value || '').length;
      if (typeof searchInput.setSelectionRange === 'function') {
        searchInput.setSelectionRange(len, len);
      }
    }
  },

  setKioskApptTab(tab) {
    this.kioskApptTab = tab;
    this.renderKioskStation();
  },

  kioskDirectCheckIn(aptId) {
    const apt = this.store.appointments.find(a => a.id === aptId);
    if (!apt) return;
    const pt = this.store.getPatient(apt.patientId) || { name: "Patient", phone: "555-0100" };

    apt.status = "In Consultation";
    this.store.saveAppointments();

    const tokenItem = this.store.addQueuePatient({
      patientId: pt.id || apt.patientId,
      name: pt.name || pt.firstName + " " + pt.lastName,
      phone: pt.phone,
      chair: apt.chairId || "chair-1",
      chiefComplaint: apt.service || "Scheduled Appointment Visit",
      painScore: 2,
      priority: "Normal"
    });

    if (window.clinicAudio) {
      window.clinicAudio.playChime();
      const chairObj = this.store.chairs.find(c => c.id === (apt.chairId || "chair-1")) || { name: "Operatory", doctor: "Dentist" };
      window.clinicAudio.announceToken(tokenItem.token, chairObj.name, chairObj.doctor);
    }

    this.launchConfetti();
    this.showThermalSlipModal(tokenItem.token, pt.name || (pt.firstName + " " + pt.lastName), apt.chairId || "chair-1", "0 Mins");
    this.renderKioskStation();
    this.renderTvStation();
    this.renderCabinStation();
  },

  kioskBookOpenSlot(time, doctorId, chairId, service) {
    const defaultPt = this.store.patients[0] || { id: "p1", name: "Walk-In Patient", phone: "+1 (555) 234-8901" };
    const newApt = {
      id: "apt-" + Date.now(),
      patientId: defaultPt.id,
      doctorId: doctorId || "u2",
      chairId: chairId || "chair-1",
      date: new Date().toISOString().split("T")[0],
      time: time,
      duration: 30,
      service: service || "Same-Day Dental Walk-In",
      status: "Waiting",
      notes: "Booked via Kiosk Touch Terminal",
      tokenNumber: "T-" + (100 + this.store.queue.length + 1)
    };
    this.store.appointments.push(newApt);
    this.store.saveAppointments();

    const tokenItem = this.store.addQueuePatient({
      patientId: defaultPt.id,
      name: defaultPt.name || (defaultPt.firstName + " " + defaultPt.lastName),
      phone: defaultPt.phone,
      chair: chairId || "chair-1",
      chiefComplaint: service || "Same-Day Consultation",
      painScore: 3,
      priority: "Normal"
    });

    if (window.clinicAudio) {
      window.clinicAudio.playChime();
      const chairObj = this.store.chairs.find(c => c.id === chairId) || { name: "Operatory", doctor: "Dentist" };
      window.clinicAudio.announceToken(tokenItem.token, chairObj.name, chairObj.doctor);
    }

    this.launchConfetti();
    this.showThermalSlipModal(tokenItem.token, defaultPt.name || (defaultPt.firstName + " " + defaultPt.lastName), chairId || "chair-1", "10 Mins");
    this.renderKioskStation();
    this.renderTvStation();
    this.renderCabinStation();
  },

  cabinAddProcedure(code, name, cost) {
    const chairId = this.selectedCabinChair || 'chair-1';
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    const ptId = currentPt ? currentPt.patientId : 'p1';
    const patient = this.store.getPatient(ptId);
    if (!patient) return;

    if (!patient.treatmentPlans) patient.treatmentPlans = [];
    let plan = patient.treatmentPlans[0];
    if (!plan) {
      plan = {
        id: "tp-" + Date.now(),
        title: "Chairside Treatment Encounter",
        createdAt: new Date().toISOString().split("T")[0],
        status: "Approved",
        procedures: [],
        estimatedTotal: 0,
        approvedTotal: 0,
        patientSigned: true
      };
      patient.treatmentPlans.push(plan);
    }

    plan.procedures.push({
      code: code,
      tooth: this.cabinSelectedTooth || "16",
      name: name,
      cost: cost,
      status: "Approved"
    });
    plan.estimatedTotal = plan.procedures.reduce((sum, p) => sum + p.cost, 0);
    plan.approvedTotal = plan.estimatedTotal;

    this.store.savePatients();
    this.showToast(\`Added \${code} (\${name}) to treatment plan for \${patient.name || patient.firstName}\`, 'success');
    this.renderCabinStation();
  },

  cabinMarkTooth(toothNum, condition) {
    this.cabinSelectedTooth = toothNum;
    const chairId = this.selectedCabinChair || 'chair-1';
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    const ptId = currentPt ? currentPt.patientId : 'p1';
    const patient = this.store.getPatient(ptId);
    if (!patient) return;

    if (!patient.dentalChart) patient.dentalChart = {};
    if (!patient.dentalChart[toothNum]) {
      patient.dentalChart[toothNum] = { status: "sound", surfaces: {}, findings: [], diagnosis: "", planned: [], completed: [] };
    }
    patient.dentalChart[toothNum].status = condition;
    this.store.savePatients();

    this.showToast(\`Tooth #\${toothNum} marked as \${condition.toUpperCase()}\`, 'success');
    this.renderCabinStation();
  },
`;

if (!appCode.includes('onKioskLiveApptSearch(')) {
  const insertPoint = appCode.indexOf('  renderKioskStation() {');
  appCode = appCode.substring(0, insertPoint) + helperMethods + '\n' + appCode.substring(insertPoint);
}

// 4. Redesign renderKioskStation() with Live Search & Auto-Populated List
const newRenderKiosk = `  renderKioskStation() {
    const mount = document.getElementById("kiosk-main-mount");
    if (!mount) return;

    const { pathway, step } = this.kioskState;
    let bodyHtml = '';

    // ================= STEP 0: WELCOME & PATHWAYS =================
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

      // Auto-Populated Today's Appointments with Live Search Filtering
      const todayStr = new Date().toISOString().split("T")[0];
      const query = (this.kioskApptSearch || "").toLowerCase().trim();
      
      const allTodayAppts = this.store.appointments.map(a => {
        const pt = this.store.getPatient(a.patientId) || {};
        const ptName = pt.name || ((pt.firstName || '') + ' ' + (pt.lastName || '')).trim() || 'Scheduled Patient';
        const phone = pt.phone || '555-0100';
        const staffList = (typeof STAFF_USERS !== 'undefined' ? STAFF_USERS : (window.STAFF_USERS || []));
        const doc = staffList.find(u => u.id === a.doctorId) || { name: 'Dr. Sarah Chen, DDS' };
        const chair = this.store.chairs.find(c => c.id === a.chairId) || { name: 'General Operatory' };
        return {
          id: a.id,
          time: a.time,
          date: a.date,
          service: a.service || 'Dental Consultation',
          status: a.status || 'Scheduled',
          patientName: ptName,
          phone: phone,
          photo: pt.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          doctorName: doc.name,
          chairName: chair.name
        };
      });

      const filteredAppts = allTodayAppts.filter(a => {
        if (!query) return true;
        const pDigits = a.phone.replace(/\\D/g, "");
        const qDigits = query.replace(/\\D/g, "");
        return a.patientName.toLowerCase().includes(query) ||
               (qDigits && pDigits.includes(qDigits)) ||
               a.doctorName.toLowerCase().includes(query) ||
               a.time.toLowerCase().includes(query) ||
               a.service.toLowerCase().includes(query);
      });

      const openSlots = [
        { time: '11:30 AM', doc: 'Dr. Sarah Chen, DDS', chair: 'Chair 1: General', chairId: 'c1', docId: 'u2', fee: '$65' },
        { time: '01:15 PM', doc: 'Dr. Marcus Vance, Ortho', chair: 'Chair 2: Ortho Bay', chairId: 'c2', docId: 'u3', fee: '$50' },
        { time: '03:30 PM', doc: 'Dr. Sarah Chen, DDS', chair: 'Chair 3: Surgical Suite', chairId: 'c3', docId: 'u2', fee: '$85' },
        { time: '04:45 PM', doc: 'Liam Vance, RDA', chair: 'Chair 4: Hygiene Bay', chairId: 'c4', docId: 'u4', fee: '$40' }
      ].filter(s => {
        if (!query) return true;
        return s.time.toLowerCase().includes(query) || s.doc.toLowerCase().includes(query) || s.chair.toLowerCase().includes(query);
      });

      const currentTab = this.kioskApptTab || 'today';

      bodyHtml = \`
        <div style="max-width: 1140px; margin: 16px auto 36px; padding: 0 20px;">
          
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

          <!-- 2 Primary Walk-In Touch Pathways -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
            
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
              </div>
            </div>

          </div>

          <!-- ================= NEW APPOINTMENTS SECTION: LIVE SEARCH & AUTO-POPULATED LIST ================= -->
          <div style="background: #FFFFFF; border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #E0F2FE; color: var(--secondary-blue); display: flex; align-items: center; justify-content: center;">
                  \${CLINIC_ICONS.calendar}
                </div>
                <div>
                  <h3 style="font-size: 1.35rem; font-weight: 900; color: #0F172A; margin: 0;">
                    Appointments &amp; Arrival Check-In
                  </h3>
                  <p style="font-size: 0.85rem; color: #64748B; margin: 0;">
                    Live search scheduled patients or tap your name to print your priority queue slip
                  </p>
                </div>
              </div>

              <!-- Tab Switcher -->
              <div style="display: flex; gap: 6px; background: #F1F5F9; padding: 4px; border-radius: var(--radius-pill);">
                <button onclick="app.setKioskApptTab('today')" style="padding: 6px 16px; border-radius: var(--radius-pill); font-size: 0.82rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; background: \${currentTab === 'today' ? 'var(--secondary-blue)' : 'transparent'}; color: \${currentTab === 'today' ? '#FFF' : '#475569'};">
                  📋 Today's Appointments (\${filteredAppts.length})
                </button>
                <button onclick="app.setKioskApptTab('open')" style="padding: 6px 16px; border-radius: var(--radius-pill); font-size: 0.82rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.15s ease; background: \${currentTab === 'open' ? 'var(--secondary-blue)' : 'transparent'}; color: \${currentTab === 'open' ? '#FFF' : '#475569'};">
                  ⚡ Open Slots Today (\${openSlots.length})
                </button>
              </div>
            </div>

            <!-- Live Search Bar -->
            <div style="position: relative; margin-bottom: 20px;">
              <div style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--secondary-blue); display: flex;">
                \${CLINIC_ICONS.search}
              </div>
              <input type="text" id="kiosk-live-appt-search" class="form-control" style="font-size: 1.05rem; padding: 13px 16px 13px 48px; border-radius: var(--radius-lg); border: 2px solid #BAE6FD; background: #F8FAFC;" placeholder="🔍 Live Search by Patient Name, Mobile Phone, Doctor, or Time..." value="\${this.kioskApptSearch || ''}" oninput="app.onKioskLiveApptSearch(this.value)">
              \${this.kioskApptSearch ? \`
                <button onclick="app.onKioskLiveApptSearch('')" style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); border: none; background: #E2E8F0; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; font-weight: 800;">✕</button>
              \` : ''}
            </div>

            <!-- Tab 1: Auto-Populated Scheduled Appointments List -->
            \${currentTab === 'today' ? \`
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px;">
                \${filteredAppts.length > 0 ? filteredAppts.map(apt => {
                  const isDone = apt.status === 'Completed';
                  const inChair = apt.status === 'In Consultation';
                  return \`
                    <div style="background: #FFFFFF; border: 1.5px solid \${inChair ? '#22C55E' : '#E2E8F0'}; border-radius: var(--radius-lg); padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: space-between; gap: 12px; transition: transform 0.15s ease;">
                      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <img src="\${apt.photo}" alt="\${apt.patientName}" style="width: 44px; height: 44px; border-radius: 10px; object-fit: cover; border: 1.5px solid #BAE6FD;" />
                          <div>
                            <h4 style="font-size: 1rem; font-weight: 800; color: #0F172A; margin: 0 0 2px 0;">\${apt.patientName}</h4>
                            <div style="font-size: 0.78rem; color: #64748B;">\${apt.phone}</div>
                          </div>
                        </div>
                        <div style="background: #F0F9FF; border: 1px solid #BAE6FD; padding: 4px 10px; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 800; color: #0284C7; white-space: nowrap;">
                          ⏰ \${apt.time}
                        </div>
                      </div>

                      <div style="font-size: 0.82rem; color: #475569; background: #F8FAFC; border-radius: var(--radius-md); padding: 8px 10px;">
                        <div><strong>Service:</strong> \${apt.service}</div>
                        <div><strong>Doctor:</strong> \${apt.doctorName} (\${apt.chairName})</div>
                      </div>

                      <div>
                        \${isDone ? \`
                          <div style="text-align: center; padding: 10px; background: #F1F5F9; border-radius: var(--radius-md); font-size: 0.82rem; font-weight: 700; color: #64748B;">
                            ✓ Consultation Completed Today
                          </div>
                        \` : inChair ? \`
                          <div style="text-align: center; padding: 10px; background: #F0FDF4; border: 1px solid #86EFAC; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 800; color: #16A34A;">
                            🟢 Currently In Operatory Chair
                          </div>
                        \` : \`
                          <button class="btn btn-primary" onclick="app.kioskDirectCheckIn('\${apt.id}')" style="width: 100%; height: 44px; font-weight: 800; font-size: 0.88rem; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; gap: 8px;">
                            \${CLINIC_ICONS.checkCircle} <span>Touch to Check In &amp; Print Slip</span>
                          </button>
                        \`}
                      </div>
                    </div>
                  \`;
                }).join('') : \`
                  <div style="grid-column: 1 / -1; padding: 36px; text-align: center; background: #F8FAFC; border-radius: var(--radius-lg); border: 1px dashed #CBD5E1;">
                    <div style="font-size: 2rem; margin-bottom: 6px;">🔍</div>
                    <h4 style="font-size: 1.1rem; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">No appointments found matching "\${this.kioskApptSearch}"</h4>
                    <p style="font-size: 0.85rem; color: #64748B; margin: 0 0 16px 0;">Check your phone number spelling or register as a General Walk-In above.</p>
                    <button class="btn btn-outline" onclick="app.onKioskLiveApptSearch('')">Clear Search Query</button>
                  </div>
                \`}
              </div>
            \` : \`
              <!-- Tab 2: Available Open Slots Today -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
                \${openSlots.map(s => \`
                  <div style="background: #FFFFFF; border: 2px solid #BAE6FD; border-radius: var(--radius-lg); padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span class="badge badge-teal" style="font-size: 0.75rem;">OPEN SLOT TODAY</span>
                      <strong style="font-size: 1.15rem; color: #0284C7; font-family: 'JetBrains Mono', monospace;">\${s.time}</strong>
                    </div>
                    <div>
                      <h4 style="font-size: 1rem; font-weight: 800; color: #0F172A; margin: 0 0 2px 0;">\${s.doc}</h4>
                      <div style="font-size: 0.82rem; color: #64748B;">\${s.chair} • Consult: \${s.fee}</div>
                    </div>
                    <button class="btn btn-outline" onclick="app.kioskBookOpenSlot('\${s.time}', '\${s.docId}', '\${s.chairId}', 'Same-Day Dental Walk-In')" style="width: 100%; height: 42px; font-weight: 800; font-size: 0.86rem; border-color: var(--secondary-blue); color: var(--secondary-blue);">
                      <span>⚡ Quick Book This Slot</span>
                    </button>
                  </div>
                \`).join('')}
              </div>
            \`}
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

          <!-- 2-Column Split: Left Concern Options, Right Patient Info & Action -->
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
            </div>

            <!-- Right: Patient Info & Dispatch -->
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <label style="display: block; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 6px;">
                Patient Full Name:
              </label>
              <div style="position: relative; margin-bottom: 16px;">
                <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #64748B; display: flex;">
                  \${CLINIC_ICONS.user}
                </div>
                <input type="text" id="kiosk-emg-name" class="form-control" style="font-size: 1rem; padding: 12px 14px 12px 42px; border-radius: var(--radius-md);" placeholder="Full Name" value="\${this.kioskState.emergencyName || ''}" oninput="app.kioskState.emergencyName = this.value">
              </div>

              <label style="display: block; font-weight: 800; font-size: 0.95rem; color: #0F172A; margin-bottom: 6px;">
                Contact Mobile Phone:
              </label>
              <div style="position: relative; margin-bottom: 24px;">
                <div style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #DC2626; display: flex;">
                  \${CLINIC_ICONS.phone}
                </div>
                <input type="tel" id="kiosk-emg-phone" class="form-control" style="font-size: 1.05rem; padding: 12px 14px 12px 42px; border-radius: var(--radius-md); font-family: 'JetBrains Mono', monospace; border: 2px solid #FCA5A5;" placeholder="(555) 000-0000" value="\${this.kioskState.emergencyPhone || ''}" oninput="app.kioskState.emergencyPhone = this.value">
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

    mount.innerHTML = bodyHtml;
  },`;

// Replace renderKioskStation
const kioskStart = appCode.indexOf('  renderKioskStation() {');
const kioskEnd = appCode.indexOf('  renderTvStation() {');
appCode = appCode.substring(0, kioskStart) + newRenderKiosk + '\n\n' + appCode.substring(kioskEnd);
console.log('Replaced renderKioskStation successfully!');

// 5. Complete, rich renderCabinStation() for section[3]
const newRenderCabin = `  renderCabinStation() {
    const mount = document.getElementById("cabin-main-mount");
    if (!mount) return;

    const chairId = this.selectedCabinChair || 'chair-1';
    
    // Chairs with real doctors and photos
    const cabinChairs = [
      { id: 'chair-1', name: 'Chair 1: General & Restorative', doc: 'Dr. Sarah Chen, DDS', spec: 'Senior Dental Surgeon', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', badge: 'Active' },
      { id: 'chair-2', name: 'Chair 2: Specialized Ortho Bay', doc: 'Dr. Marcus Vance', spec: 'Chief Orthodontist', photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', badge: 'Active' },
      { id: 'chair-3', name: 'Chair 3: Surgical & Implant Suite', doc: 'Dr. Sarah Chen, DDS', spec: 'Trauma & Oral Surgeon', photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80', badge: 'Sanitized' },
      { id: 'chair-4', name: 'Chair 4: Pediatric & Hygiene Bay', doc: 'Liam Vance, RDA', spec: 'Hygiene & Cleanings', photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80', badge: 'Ready' }
    ];

    const currentChair = cabinChairs.find(c => c.id === chairId) || cabinChairs[0];

    // Find active patient in chair or fallback to current patient in store
    const inChairQueue = this.store.queue.find(q => (q.chair === chairId || q.chairName?.toLowerCase().includes(chairId.replace('chair-', ''))) && (q.status === 'in-consultation' || q.status === 'called'));
    
    // Waiting queue for this chair
    const waitingQueue = this.store.queue.filter(q => q.status === 'waiting' && (q.chair === chairId || !q.chair || q.chairName?.toLowerCase().includes(chairId.replace('chair-', ''))));
    
    // Active patient object
    const ptId = inChairQueue ? inChairQueue.patientId : (waitingQueue[0] ? waitingQueue[0].patientId : 'p1');
    const patient = this.store.getPatient(ptId) || this.store.patients[0];
    const ptName = patient.name || ((patient.firstName || '') + ' ' + (patient.lastName || '')).trim() || 'Patient';

    const selectedTooth = this.cabinSelectedTooth || '16';
    const toothChart = patient.dentalChart || {};

    const toothList = [
      // Upper Right
      '18','17','16','15','14','13','12','11',
      // Upper Left
      '21','22','23','24','25','26','27','28',
      // Lower Left
      '38','37','36','35','34','33','32','31',
      // Lower Right
      '41','42','43','44','45','46','47','48'
    ];

    const conditionColors = {
      sound: '#FFFFFF',
      caries: '#EF4444',
      restoration: '#0284C7',
      amalgam: '#475569',
      crown: '#D97706',
      rct: '#7C3AED',
      missing: '#94A3B8',
      ortho: '#6366F1'
    };

    mount.innerHTML = \`
      <div style="max-width: 1280px; margin: 16px auto 40px; padding: 0 20px;">
        
        <!-- Operatory Suite Selector Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #F0FDFA; border: 1px solid #CCFBF1; padding: 4px 14px; border-radius: var(--radius-pill); margin-bottom: 6px;">
              <span style="color: var(--primary-teal);">\${CLINIC_ICONS.chair}</span>
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--dark-teal); text-transform: uppercase;">Dentist Operatory Station &amp; Chairside EHR</span>
            </div>
            <h2 style="font-size: 1.85rem; font-weight: 900; color: #0F172A; margin: 0;">\${currentChair.name}</h2>
          </div>

          <!-- Chair Switcher Tabs -->
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            \${cabinChairs.map(c => {
              const isActive = c.id === chairId;
              const qCount = this.store.queue.filter(q => q.status === 'waiting' && (q.chair === c.id || q.chairName?.includes(c.id.replace('chair-','')))).length;
              return \`
                <button onclick="app.selectCabinChair('\${c.id}')" style="display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-radius: var(--radius-lg); border: 2px solid \${isActive ? 'var(--primary-teal)' : '#E2E8F0'}; background: \${isActive ? '#F0FDFA' : '#FFF'}; cursor: pointer; transition: all 0.15s ease;">
                  <img src="\${c.photo}" alt="\${c.doc}" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover;" />
                  <div style="text-align: left;">
                    <strong style="font-size: 0.82rem; color: #0F172A; display: block;">\${c.name.split(':')[0]}</strong>
                    <span style="font-size: 0.72rem; color: #64748B;">\${qCount} in Queue</span>
                  </div>
                </button>
              \`;
            }).join('')}
          </div>
        </div>

        <!-- Operatory Hero Banner with Doctor Info and Call Button -->
        <div style="background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%); color: #FFF; border-radius: var(--radius-xl); padding: 18px 24px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 10px 25px -4px rgba(13,148,136,0.25);">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="\${currentChair.photo}" alt="\${currentChair.doc}" style="width: 56px; height: 56px; border-radius: 14px; object-fit: cover; border: 2px solid #FFF;" />
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: var(--radius-pill); font-size: 0.72rem; font-weight: 800;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #4ADE80;"></span>
                <span>STERILIZED &amp; BARRIER-FILM PROTECTED</span>
              </div>
              <h3 style="font-size: 1.35rem; font-weight: 900; margin: 4px 0 2px 0;">\${currentChair.doc}</h3>
              <p style="font-size: 0.85rem; color: #CCFBF1; margin: 0;">\${currentChair.spec} • Autoclave Cycle #04 Passed</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="btn btn-outline" onclick="app.cabinCallNextPatient()" style="background: #FFF; color: var(--dark-teal); font-weight: 800; font-size: 0.9rem; padding: 12px 22px; border-radius: var(--radius-lg); display: flex; align-items: center; gap: 8px;">
              <span>📢</span> <span>Call Next Patient to Chair</span>
            </button>
          </div>
        </div>

        <!-- 2-Column Main Console: Left Patient & Odontogram, Right Procedures & Rx -->
        <div style="display: grid; grid-template-columns: 1.25fr 0.75fr; gap: 24px; align-items: start; margin-bottom: 24px;">
          
          <!-- LEFT COLUMN: Patient in Chair & Interactive Odontogram -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Patient In Chair Identity Card -->
            <div style="background: #FFF; border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <img src="\${patient.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}" alt="\${ptName}" style="width: 58px; height: 58px; border-radius: 14px; object-fit: cover; border: 2px solid var(--primary-teal);" />
                  <div>
                    <span class="badge badge-amber" style="font-size: 0.72rem; margin-bottom: 3px;">CURRENTLY IN CHAIR</span>
                    <h3 style="font-size: 1.35rem; font-weight: 900; color: #0F172A; margin: 0 0 2px 0;">\${ptName}</h3>
                    <div style="font-size: 0.82rem; color: #64748B;">MRN: <code>\${patient.mrn}</code> • \${patient.age || '34'} yrs (\${patient.gender || 'Male'}) • Tel: \${patient.phone}</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 1.8rem; font-weight: 900; color: var(--primary-teal); font-family: 'JetBrains Mono', monospace;">\${inChairQueue ? inChairQueue.token : 'T-101'}</div>
                  <span class="badge badge-teal" style="font-size: 0.72rem;">PRIORITY 1</span>
                </div>
              </div>

              <!-- Medical Alert & Vitals Strip -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #F8FAFC; border-radius: var(--radius-lg); padding: 12px; margin-bottom: 16px;">
                <div style="border-right: 1px solid #E2E8F0; padding-right: 8px;">
                  <span style="font-size: 0.7rem; font-weight: 800; color: #DC2626; text-transform: uppercase;">Medical Alerts</span>
                  <div style="font-size: 0.85rem; font-weight: 800; color: #991B1B;">\${(patient.medicalInfo?.allergies?.[0]?.name) || patient.allergies || 'Penicillin Allergy'}</div>
                </div>
                <div style="border-right: 1px solid #E2E8F0; padding-right: 8px;">
                  <span style="font-size: 0.7rem; font-weight: 800; color: #0284C7; text-transform: uppercase;">Blood Pressure</span>
                  <div style="font-size: 0.85rem; font-weight: 800; color: #0F172A;">122 / 78 mmHg</div>
                </div>
                <div>
                  <span style="font-size: 0.7rem; font-weight: 800; color: #D97706; text-transform: uppercase;">Pain Rating</span>
                  <div style="font-size: 0.85rem; font-weight: 800; color: #D97706;">6 / 10 (Moderate)</div>
                </div>
              </div>

              <div style="font-size: 0.86rem; color: #475569; margin-bottom: 16px;">
                <strong>Chief Complaint:</strong> \${inChairQueue?.chiefComplaint || patient.visits?.[0]?.reason || 'Severe throbbing ache in upper right back tooth (#16)'}
              </div>

              <!-- Actions -->
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="app.openPatientInOdontogram('\${patient.id}')" style="flex: 1; min-width: 200px; font-weight: 800; font-size: 0.88rem; padding: 10px;">
                  \${CLINIC_ICONS.tooth} <span>Open Full Odontogram EHR</span>
                </button>
                <button class="btn btn-success" onclick="app.cabinCompleteConsultation()" style="flex: 1; min-width: 180px; font-weight: 800; font-size: 0.88rem; padding: 10px;">
                  \${CLINIC_ICONS.checkCircle} <span>Send to Billing POS</span>
                </button>
              </div>
            </div>

            <!-- Interactive Odontogram Arch Panel -->
            <div style="background: #FFF; border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                <h4 style="font-size: 1.1rem; font-weight: 900; color: #0F172A; margin: 0; display: flex; align-items: center; gap: 8px;">
                  \${CLINIC_ICONS.tooth} <span>Interactive Chairside Odontogram (Touch to Chart)</span>
                </h4>
                <span style="font-size: 0.75rem; color: #64748B;">Selected: <strong>Tooth #\${selectedTooth}</strong></span>
              </div>

              <!-- Condition Selector Buttons -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                \${[
                  { id: 'sound', label: 'Sound', color: '#64748B', bg: '#FFF' },
                  { id: 'caries', label: 'Caries', color: '#FFF', bg: '#EF4444' },
                  { id: 'restoration', label: 'Composite', color: '#FFF', bg: '#0284C7' },
                  { id: 'crown', label: 'Crown', color: '#FFF', bg: '#D97706' },
                  { id: 'rct', label: 'Root Canal', color: '#FFF', bg: '#7C3AED' },
                  { id: 'missing', label: 'Extract', color: '#FFF', bg: '#94A3B8' }
                ].map(cond => \`
                  <button onclick="app.cabinMarkTooth('\${selectedTooth}', '\${cond.id}')" style="padding: 5px 12px; border-radius: var(--radius-pill); font-size: 0.76rem; font-weight: 800; border: 1.5px solid #CBD5E1; cursor: pointer; background: \${cond.bg}; color: \${cond.color};">
                    \${cond.label}
                  </button>
                \`).join('')}
              </div>

              <!-- 32-Tooth Visual Teeth Grid -->
              <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 12px;">
                <div style="font-size: 0.7rem; font-weight: 800; color: #64748B; text-align: center; margin-bottom: 8px; text-transform: uppercase;">
                  Maxillary Arch (Upper Dentition)
                </div>
                <div style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; margin-bottom: 12px;">
                  \${toothList.slice(0, 16).map(t => {
                    const st = toothChart[t]?.status || 'sound';
                    const color = conditionColors[st] || '#FFFFFF';
                    const isSel = selectedTooth === t;
                    return \`
                      <button onclick="app.cabinMarkTooth('\${t}', 'caries')" style="height: 38px; border-radius: 6px; border: 2px solid \${isSel ? 'var(--primary-teal)' : '#CBD5E1'}; background: \${color}; font-size: 0.72rem; font-weight: 800; color: \${st === 'sound' ? '#0F172A' : '#FFF'}; cursor: pointer; box-shadow: \${isSel ? '0 0 0 2px rgba(13,148,136,0.3)' : 'none'};">
                        \${t}
                      </button>
                    \`;
                  }).join('')}
                </div>

                <div style="font-size: 0.7rem; font-weight: 800; color: #64748B; text-align: center; margin-bottom: 8px; text-transform: uppercase;">
                  Mandibular Arch (Lower Dentition)
                </div>
                <div style="display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px;">
                  \${toothList.slice(16, 32).map(t => {
                    const st = toothChart[t]?.status || 'sound';
                    const color = conditionColors[st] || '#FFFFFF';
                    const isSel = selectedTooth === t;
                    return \`
                      <button onclick="app.cabinMarkTooth('\${t}', 'caries')" style="height: 38px; border-radius: 6px; border: 2px solid \${isSel ? 'var(--primary-teal)' : '#CBD5E1'}; background: \${color}; font-size: 0.72rem; font-weight: 800; color: \${st === 'sound' ? '#0F172A' : '#FFF'}; cursor: pointer; box-shadow: \${isSel ? '0 0 0 2px rgba(13,148,136,0.3)' : 'none'};">
                        \${t}
                      </button>
                    \`;
                  }).join('')}
                </div>
              </div>
              <div style="font-size: 0.75rem; color: #64748B; text-align: center;">
                Tap any tooth button above to assign caries, restoration, crown, or extraction.
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Procedures, Prescriptions & Queue -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Quick Procedure Additions -->
            <div style="background: #FFF; border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: var(--shadow-sm);">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0 0 12px 0;">
                Chairside Procedures &amp; Treatment Codes
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${[
                  { code: 'D0120', name: 'Periodic Oral Exam', cost: 45 },
                  { code: 'D1110', name: 'Dental Hygiene Prophylaxis', cost: 80 },
                  { code: 'D2330', name: 'Composite Resin 1-Surface', cost: 150 },
                  { code: 'D2740', name: 'Porcelain/Zirconia Crown', cost: 950 },
                  { code: 'D3330', name: 'Molar Endodontic Therapy', cost: 980 },
                  { code: 'D7140', name: 'Surgical Tooth Extraction', cost: 180 },
                  { code: 'D8670', name: 'Ortho Archwire Adjustment', cost: 75 }
                ].map(p => \`
                  <button onclick="app.cabinAddProcedure('\${p.code}', '\${p.name}', \${p.cost})" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; transition: all 0.15s ease;">
                    <div>
                      <strong style="font-size: 0.85rem; color: #0F172A; display: block;">\${p.name}</strong>
                      <span style="font-size: 0.72rem; color: #64748B;">\${p.code} • Tooth #\${selectedTooth}</span>
                    </div>
                    <span class="badge badge-teal" style="font-size: 0.75rem;">+ $\${p.cost}</span>
                  </button>
                \`).join('')}
              </div>
            </div>

            <!-- 1-Tap Quick Dental Rx -->
            <div style="background: #FFF; border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: var(--shadow-sm);">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
                1-Tap Quick Dental Prescriptions
              </h4>
              <p style="font-size: 0.78rem; color: #64748B; margin: 0 0 12px 0;">Touch any medication to immediately prescribe &amp; route to Dispensary:</p>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <button onclick="app.cabinAddRxChip('Clindamycin HCl', '300mg Q6H x 5d', 'Take with large glass of water. Penicillin safe.')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Clindamycin 300mg</strong> (Penicillin-Allergy Safe)
                </button>
                <button onclick="app.cabinAddRxChip('Amoxicillin', '500mg tid x 5 days', 'Take 1 capsule every 8 hours with water')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Amoxicillin 500mg</strong> (Dental Infection)
                </button>
                <button onclick="app.cabinAddRxChip('Ibuprofen', '600mg Q8H PRN', 'Take with food for dental swelling and pain')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  💊 <strong>Ibuprofen 600mg</strong> (Anti-Inflammatory Analgesic)
                </button>
                <button onclick="app.cabinAddRxChip('Chlorhexidine 0.2%', '10ml oral rinse bid', 'Swish 10ml in mouth for 60s after brushing')" style="padding: 9px 12px; border-radius: var(--radius-md); border: 1px solid #E2E8F0; background: #FFF; cursor: pointer; text-align: left; font-size: 0.82rem;">
                  🧴 <strong>Chlorhexidine 0.2% Rinse</strong> (Gingival Disinfectant)
                </button>
              </div>
            </div>

            <!-- Operatory Waiting Queue -->
            <div style="background: #FFF; border: 1.5px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h4 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin: 0;">
                  Waiting Queue for \${currentChair.name.split(':')[0]}
                </h4>
                <span class="badge badge-teal" style="font-size: 0.75rem;">\${waitingQueue.length} Waiting</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                \${waitingQueue.length > 0 ? waitingQueue.map(q => \`
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-md); background: #F8FAFC; border: 1px solid #E2E8F0;">
                    <div>
                      <strong style="color: #0F172A; font-size: 0.85rem;">\${q.token} • \${q.patientName || q.name}</strong>
                      <div style="font-size: 0.72rem; color: #64748B;">\${q.service || q.chiefComplaint || 'Consultation'}</div>
                    </div>
                    <button class="btn btn-outline" onclick="app.cabinCallPatientToken('\${q.token}')" style="padding: 6px 12px; font-size: 0.75rem; font-weight: 800;">
                      Call
                    </button>
                  </div>
                \`).join('') : \`
                  <div style="font-size: 0.82rem; color: #94A3B8; text-align: center; padding: 16px;">
                    No waiting patients in queue for this suite.
                  </div>
                \`}
              </div>
            </div>

          </div>

        </div>

      </div>
    \`;
  },

  cabinCallPatientToken(token) {
    const qItem = this.store.queue.find(q => q.token === token);
    const chairId = this.selectedCabinChair || 'chair-1';
    const chairObj = this.store.chairs.find(c => c.id === chairId) || { name: 'Operatory Chair', doctor: 'Dr. Sarah Chen, DDS' };

    if (qItem) {
      qItem.status = 'in-consultation';
      qItem.chair = chairId;
      this.store.saveQueue();

      if (window.clinicAudio) {
        window.clinicAudio.announceToken(qItem.token, chairObj.name, chairObj.doctor);
      }
      this.showToast(\`Calling \${qItem.token} (\${qItem.patientName || qItem.name}) to \${chairObj.name}\`, 'success');
      this.renderCabinStation();
      this.renderTvStation();
    }
  },

  selectCabinChair(chairId) {
    this.selectedCabinChair = chairId;
    this.renderCabinStation();
  },

  cabinCallNextPatient() {
    const chairId = this.selectedCabinChair || 'chair-1';
    const chairObj = this.store.chairs.find(c => c.id === chairId) || { name: 'Operatory Chair', doctor: 'Dr. Sarah Chen, DDS' };

    const nextPt = this.store.queue.find(q => q.status === 'waiting' && (q.chair === chairId || !q.chair));
    if (!nextPt) {
      this.showToast(\`No patients currently waiting for \${chairObj.name}.\`, 'info');
      return;
    }

    nextPt.status = 'in-consultation';
    nextPt.chair = chairId;
    this.store.saveQueue();

    if (window.clinicAudio) {
      window.clinicAudio.announceToken(nextPt.token, chairObj.name, chairObj.doctor);
    }

    this.showToast(\`Calling token \${nextPt.token} (\${nextPt.patientName || nextPt.name}) to \${chairObj.name}\`, 'success');
    this.renderCabinStation();
    this.renderTvStation();
  },

  cabinCompleteConsultation() {
    const chairId = this.selectedCabinChair || 'chair-1';
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    if (!currentPt) {
      this.showToast("No active patient in chair to complete.", "warning");
      return;
    }

    currentPt.status = 'completed';
    this.store.saveQueue();
    this.showToast(\`Consultation completed for \${currentPt.patientName || currentPt.name}. Routed to Billing Desk POS.\`, 'success');
    this.renderCabinStation();
    this.renderTvStation();
  },

  cabinAddRxChip(medName, dosage, instructions) {
    const chairId = this.selectedCabinChair || 'chair-1';
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    const ptId = currentPt ? currentPt.patientId : 'p1';
    const patient = this.store.getPatient(ptId);
    if (!patient) return;

    if (!patient.prescriptions) patient.prescriptions = [];
    let rx = patient.prescriptions[0];
    if (!rx) {
      rx = {
        id: "rx-" + Date.now(),
        date: new Date().toISOString().split("T")[0],
        doctor: "Dr. Sarah Chen, DDS",
        items: []
      };
      patient.prescriptions.push(rx);
    }

    rx.items.push({
      drug: medName,
      strength: dosage.split(' ')[0] || "500mg",
      form: "Oral",
      dose: dosage,
      duration: "5 days",
      qty: 15,
      instructions: instructions
    });

    this.store.savePatients();
    this.showToast(\`Prescribed \${medName} for \${patient.name || patient.firstName}. Routed to Dispensary.\`, 'success');
    this.renderCabinStation();
  },
`;

// Replace renderCabinStation and related methods
const cabinStart = appCode.indexOf('  renderCabinStation() {');
const billingStart = appCode.indexOf('  renderBillingStation() {');

if (cabinStart !== -1 && billingStart !== -1) {
  appCode = appCode.substring(0, cabinStart) + newRenderCabin + '\n\n' + appCode.substring(billingStart);
  console.log('Replaced renderCabinStation successfully!');
} else {
  console.error('Could not locate renderCabinStation or renderBillingStation');
  process.exit(1);
}

fs.writeFileSync(appPath, appCode, 'utf8');
console.log('All updates written to js/app.js!');
