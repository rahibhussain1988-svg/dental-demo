/**
 * Smile Dental & Orthodontics Clinic Management System
 * Main Application Controller, Navigation, and Interactive Workflows
 */

class ClinicApp {
  constructor() {
    this.store = window.clinicStore;
    this.currentScreen = "dashboard";
    this.selectedPatient = null;
    this.odontogramInstance = null;
    this.searchDebounceTimer = null;
    this.activeOdontogramTooth = null;
    this.currentAptFilter = "today";
    this.currentAptView = "list";
    this.currentBillingStatusFilter = "all";
    this.reportsDateRange = "all";
    this.xrayZoomLevel = 1.0;
    this.xrayInverted = false;
    this.xrayBrightness = 100;
    this.currentViewingXray = null;

    // Multi-Station Operating System State
    this.currentStation = 'PATIENT_KIOSK';
    this.pinInput = '';
    this.isNavPinned = false;
    this.navAutoHideTimer = null;
    this.selectedCabinChair = 'chair-1';
    this.selectedBillingPatientId = null;
    this.billingDiscountPercent = 0;
    this.billingAmountTendered = 0;
    this.billingSelectedProcedures = [];
    this.kioskCountdownTimer = null;

    this.kioskState = {
      pathway: 'WALK_IN',
      step: 0,
      selectedSymptoms: [],
      selectedChair: 'chair-1',
      phone: '',
      name: '',
      age: '',
      gender: 'Male',
      painScore: 3,
      paymentMethod: 'reception',
      activeInput: 'phone',
      selectedEmergencyProc: 'emg-1',
      emergencyName: '',
      emergencyPhone: '',
      checkinPhone: '',
      checkinResult: null,
      lastIssuedToken: null
    };

    this.init();
  }

  hasPermission(permission) {
    const user = this.store.currentUser;
    if (!user) return false;
    if (user.role === "admin" || (user.permissions && user.permissions.includes("*"))) return true;
    return Boolean(user.permissions && user.permissions.includes(permission));
  }

  init() {
    this.setupClock();
    this.setupNavigation();
    this.setupRoleSwitcher();
    this.setupKioskToggle();
    this.setupModals();
    this.setupWorkstationNav();
    this.switchStation("PATIENT_KIOSK");
  }

  setupClock() {
    const clockEl = document.getElementById("header-live-clock");
    const updateTime = () => {
      if (clockEl) {
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        clockEl.innerHTML = `<span class="clock-icon">🕒</span> ${dateStr} • ${timeStr}`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  setupNavigation() {
    // Nav items
    document.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", (e) => {
        const screen = item.getAttribute("data-screen");
        if (screen) {
          this.navigateTo(screen);
        }
      });
    });

    // Mobile sidebar toggle
    const mobileBtn = document.getElementById("mobile-nav-toggle-btn");
    const sidebar = document.querySelector(".app-sidebar");
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }
  }

  setupRoleSwitcher() {
    const roleSelect = document.getElementById("active-role-selector");
    const avatarEl = document.getElementById("header-user-avatar");
    if (roleSelect) {
      roleSelect.value = this.store.currentUser.id;
      roleSelect.addEventListener("change", (e) => {
        const userId = e.target.value;
        this.store.setCurrentUser(userId);
        if (avatarEl) {
          avatarEl.textContent = this.store.currentUser.avatar;
          avatarEl.style.backgroundColor = this.store.currentUser.color;
        }
        this.showToast(`Switched active profile to: ${this.store.currentUser.name} (${this.store.currentUser.role.toUpperCase()})`, "success");
        this.renderCurrentScreen();
      });
    }
  }

  setupKioskToggle() {
    const toggleBtn = document.getElementById("btn-kiosk-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("kiosk-mode");
        const isKiosk = document.body.classList.contains("kiosk-mode");
        toggleBtn.classList.toggle("active", isKiosk);
        toggleBtn.innerHTML = isKiosk ? `<span>🖥️</span> Exit Kiosk` : `<span>📱</span> Kiosk View`;
        this.showToast(isKiosk ? "Kiosk Touch Mode Enabled (Enlarged Targets)" : "Standard Desktop Mode Restored", "info");
      });
    }
  }

  setupModals() {
    // Backdrop close
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("open");
        }
      });
    });

    // Close buttons
    document.querySelectorAll(".modal-close-btn, .btn-modal-cancel").forEach(btn => {
      btn.addEventListener("click", () => {
        const modal = btn.closest(".modal-backdrop");
        if (modal) modal.classList.remove("open");
      });
    });
  }

  navigateTo(screen, params = {}) {
    this.currentScreen = screen;

    // Update sidebar active state
    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle("active", item.getAttribute("data-screen") === screen);
    });

    // Close mobile nav
    const sidebar = document.querySelector(".app-sidebar");
    if (sidebar) sidebar.classList.remove("mobile-open");

    // Handle params
    if (params.patientId) {
      this.selectedPatient = this.store.getPatient(params.patientId);
    }

    this.renderCurrentScreen(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "✓";
    if (type === "error") icon = "⚠️";
    if (type === "warning") icon = "⚡";
    if (type === "info") icon = "ℹ️";

    toast.innerHTML = `<span style="font-weight: bold; font-size: 1.1rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // ==========================================================================
  // Screen Rendering Router
  // ==========================================================================

  renderCurrentScreen(params = {}) {
    const mainContainer = document.getElementById("page-main-workspace");
    const pageTitleEl = document.getElementById("header-page-title");
    const pageSubtextEl = document.getElementById("header-page-subtext");
    if (!mainContainer) return;

    switch (this.currentScreen) {
      case "dashboard":
        if (pageTitleEl) pageTitleEl.textContent = "Clinic Operations Dashboard";
        if (pageSubtextEl) pageSubtextEl.textContent = "Welcome to Smile Dental & Orthodontics • Central Command & Kiosk Gateway";
        this.renderDashboard(mainContainer);
        break;

      case "registration":
        if (pageTitleEl) pageTitleEl.textContent = "New Patient Registration";
        if (pageSubtextEl) pageSubtextEl.textContent = "Step-by-step registration with real-time duplicate check & ID badge creation";
        this.renderPatientRegistration(mainContainer, params);
        break;

      case "search":
        if (pageTitleEl) pageTitleEl.textContent = "Find Patient & Live Search";
        if (pageSubtextEl) pageSubtextEl.textContent = "Fast lookup by Name, Phone, MRN or simulated QR Code Scan";
        this.renderPatientSearch(mainContainer);
        break;

      case "record":
        if (pageTitleEl) pageTitleEl.textContent = "Patient Medical Record";
        if (pageSubtextEl) pageSubtextEl.textContent = this.selectedPatient ? `${this.selectedPatient.firstName} ${this.selectedPatient.lastName} (${this.selectedPatient.mrn})` : "Comprehensive Dental & Orthodontic Charting";
        this.renderPatientRecord(mainContainer, params.activeTab || "overview");
        break;

      case "appointments":
        if (pageTitleEl) pageTitleEl.textContent = "Appointments Calendar";
        if (pageSubtextEl) pageSubtextEl.textContent = "Schedule, chair allocation, conflict detection, and arrival check-in";
        this.renderAppointments(mainContainer);
        break;

      case "queue":
        if (pageTitleEl) pageTitleEl.textContent = "Reception Queue & Token Management";
        if (pageSubtextEl) pageSubtextEl.textContent = "Live waiting room display, next-patient call, and thermal token slip printer";
        this.renderQueueBoard(mainContainer);
        break;

      case "dentist-workspace":
        if (pageTitleEl) pageTitleEl.textContent = "Dentist Clinical Workspace";
        if (pageSubtextEl) pageSubtextEl.textContent = "Direct chairside consultation console, rapid odontogram, and encounter sign-off";
        this.renderDentistWorkspace(mainContainer);
        break;

      case "orthodontics":
        if (pageTitleEl) pageTitleEl.textContent = "Orthodontic Module (Braces & Aligners)";
        if (pageSubtextEl) pageSubtextEl.textContent = "Appliance tracking, archwire progression log, and progress photo comparisons";
        this.renderOrthodonticsModule(mainContainer);
        break;

      case "billing":
        if (pageTitleEl) pageTitleEl.textContent = "Billing, Invoices & Cashier";
        if (pageSubtextEl) pageSubtextEl.textContent = "Procedure invoicing, split payments, receipts, and payment plans";
        this.renderBilling(mainContainer);
        break;

      case "reports":
        if (pageTitleEl) pageTitleEl.textContent = "Clinic Reports & Analytics";
        if (pageSubtextEl) pageSubtextEl.textContent = "Financial performance, wait times, treatment volumes, and CSV export";
        this.renderReports(mainContainer);
        break;

      case "admin":
        if (pageTitleEl) pageTitleEl.textContent = "Clinic Administration & Security";
        if (pageSubtextEl) pageSubtextEl.textContent = "Role-based access matrix, staff profiles, fee schedule, and audit logs";
        this.renderAdmin(mainContainer);
        break;

      default:
        this.renderDashboard(mainContainer);
    }
  }

  // ==========================================================================
  // Screen 1: Dashboard
  // ==========================================================================

  renderDashboard(container) {
    const today = new Date().toISOString().split("T")[0];
    const todayApts = this.store.appointments.filter(a => a.date === today);
    const waitingPatients = this.store.queue.filter(q => q.status === "Waiting");
    const inConsult = this.store.queue.filter(q => q.status === "In Consultation");
    const completedToday = this.store.queue.filter(q => q.status === "Completed");
    const orthoCases = this.store.patients.filter(p => p.orthodonticCase !== null);

    // Calculate collections
    let totalCollected = 0;
    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        totalCollected += (b.paid || 0);
      });
    });

    container.innerHTML = `
      <!-- Live Status Summary Cards -->
      <div class="dashboard-summary-grid">
        <div class="summary-card" onclick="app.navigateTo('appointments')">
          <div class="summary-icon-box" style="background: #E0F2FE; color: #0284C7;">📅</div>
          <div class="summary-details">
            <h4>Today's Appts</h4>
            <div class="summary-value">${todayApts.length}</div>
            <div class="summary-subtext">${todayApts.filter(a => a.status === 'Completed').length} Completed</div>
          </div>
        </div>

        <div class="summary-card" onclick="app.navigateTo('queue')">
          <div class="summary-icon-box" style="background: #FEF3C7; color: #D97706;">⏳</div>
          <div class="summary-details">
            <h4>Waiting in Queue</h4>
            <div class="summary-value">${waitingPatients.length}</div>
            <div class="summary-subtext">Avg wait ~14 mins</div>
          </div>
        </div>

        <div class="summary-card" onclick="app.navigateTo('dentist-workspace')">
          <div class="summary-icon-box" style="background: #F3E8FF; color: #7C3AED;">🦷</div>
          <div class="summary-details">
            <h4>In Consultation</h4>
            <div class="summary-value">${inConsult.length}</div>
            <div class="summary-subtext">Active chairs</div>
          </div>
        </div>

        <div class="summary-card" onclick="app.navigateTo('queue')">
          <div class="summary-icon-box" style="background: #DCFCE7; color: #16A34A;">✅</div>
          <div class="summary-details">
            <h4>Completed Today</h4>
            <div class="summary-value">${completedToday.length}</div>
            <div class="summary-subtext">Encounters closed</div>
          </div>
        </div>

        <div class="summary-card" onclick="app.navigateTo('orthodontics')">
          <div class="summary-icon-box" style="background: #CCFBF1; color: #0D9488;">✨</div>
          <div class="summary-details">
            <h4>Ortho Patients</h4>
            <div class="summary-value">${orthoCases.length}</div>
            <div class="summary-subtext">Active braces/aligners</div>
          </div>
        </div>

        <div class="summary-card" onclick="app.navigateTo('billing')">
          <div class="summary-icon-box" style="background: #F1F5F9; color: #0F172A;">💳</div>
          <div class="summary-details">
            <h4>Total Collections</h4>
            <div class="summary-value">$${totalCollected.toLocaleString()}</div>
            <div class="summary-subtext">Year-to-date receipts</div>
          </div>
        </div>
      </div>

      <!-- 9 Large Kiosk Action Tiles (Touch First) -->
      <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 16px; color: var(--text-main);">
        Core Clinic Action Hub
      </h3>

      <div class="kiosk-tiles-grid">
        <div class="kiosk-tile" onclick="app.navigateTo('registration')">
          <span class="badge badge-teal tile-badge">Step-by-Step</span>
          <div class="tile-icon-wrapper" style="background: var(--primary-teal-light); color: var(--primary-teal);">
            👤➕
          </div>
          <div>
            <div class="tile-title">1. New Patient</div>
            <div class="tile-desc">Register new patient with duplicate checking and photo ID creation.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('search')">
          <span class="badge badge-blue tile-badge">Live Search</span>
          <div class="tile-icon-wrapper" style="background: var(--secondary-blue-light); color: var(--secondary-blue);">
            🔍
          </div>
          <div>
            <div class="tile-title">2. Find Patient</div>
            <div class="tile-desc">Instant lookup by name, phone, MRN, or simulated QR code scan.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('appointments')">
          <span class="badge badge-amber tile-badge">${todayApts.length} Today</span>
          <div class="tile-icon-wrapper" style="background: var(--warning-light); color: var(--warning);">
            📅
          </div>
          <div>
            <div class="tile-title">3. Appointments</div>
            <div class="tile-desc">Calendar views, chair scheduling, conflict detection, and check-in.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('queue')">
          <span class="badge badge-red tile-badge">${waitingPatients.length} Waiting</span>
          <div class="tile-icon-wrapper" style="background: var(--error-light); color: var(--error);">
            🎟️
          </div>
          <div>
            <div class="tile-title">4. Patient Queue</div>
            <div class="tile-desc">Live token status, call next patient, and thermal token slips.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.openSamplePatientRecord()">
          <span class="badge badge-teal tile-badge">Interactive Chart</span>
          <div class="tile-icon-wrapper" style="background: var(--primary-teal-light); color: var(--primary-teal);">
            🦷
          </div>
          <div>
            <div class="tile-title">5. Dental Records</div>
            <div class="tile-desc">Interactive odontogram, 5-surface charting, diagnosis, and notes.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('orthodontics')">
          <span class="badge badge-purple tile-badge">Specialty</span>
          <div class="tile-icon-wrapper" style="background: var(--purple-light); color: var(--purple);">
            ✨
          </div>
          <div>
            <div class="tile-title">6. Orthodontics</div>
            <div class="tile-desc">Braces and aligner tracking, wire changes, and photo comparison.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('billing')">
          <span class="badge badge-green tile-badge">Cashier</span>
          <div class="tile-icon-wrapper" style="background: var(--success-light); color: var(--success);">
            💳
          </div>
          <div>
            <div class="tile-title">7. Billing & Payments</div>
            <div class="tile-desc">Invoicing from treatment plans, split payments, and official receipts.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('reports')">
          <span class="badge badge-subtle tile-badge">CSV Export</span>
          <div class="tile-icon-wrapper" style="background: #F1F5F9; color: var(--text-secondary);">
            📊
          </div>
          <div>
            <div class="tile-title">8. Reports & Analytics</div>
            <div class="tile-desc">Daily revenue, waiting times, clinician workload, and audit stats.</div>
          </div>
        </div>

        <div class="kiosk-tile" onclick="app.navigateTo('admin')">
          <span class="badge badge-subtle tile-badge">Configuration</span>
          <div class="tile-icon-wrapper" style="background: #F1F5F9; color: var(--text-secondary);">
            ⚙️
          </div>
          <div>
            <div class="tile-title">9. Administration</div>
            <div class="tile-desc">Roles & permissions, staff profiles, procedure fees, and system logs.</div>
          </div>
        </div>
      </div>

      <!-- Quick Consultation & Waiting Room Snapshot -->
      <div class="dashboard-lower-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>🎟️</span> Live Reception Queue Snapshot
            </div>
            <button class="btn btn-sm btn-outline" onclick="app.navigateTo('queue')">Open Full Board →</button>
          </div>
          <div class="table-responsive">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Service</th>
                  <th>Assigned Doctor</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${this.store.queue.slice(0, 4).map(item => `
                  <tr>
                    <td><strong class="token-number-badge" style="font-size: 1.1rem;">${item.token}</strong></td>
                    <td><strong>${item.patientName}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${item.mrn}</span></td>
                    <td>${item.service}</td>
                    <td>${item.doctorName}</td>
                    <td>
                      <span class="badge ${item.status === 'Waiting' ? 'badge-amber' : item.status === 'In Consultation' ? 'badge-purple' : 'badge-green'}">
                        ${item.status}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-primary" onclick="app.openPatientRecordByMrn('${item.mrn}')">View Record</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>⚡</span> Quick Kiosk Actions
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn btn-lg btn-primary" onclick="app.navigateTo('registration')">
              <span>👤➕</span> Register Walk-in Patient
            </button>
            <button class="btn btn-lg btn-secondary" onclick="app.openQuickTokenModal()">
              <span>🎟️</span> Issue Queue Token Slip
            </button>
            <button class="btn btn-lg btn-outline" onclick="app.openQrScannerSimulation()">
              <span>📷</span> Scan Patient QR / Barcode
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openSamplePatientRecord() {
    this.selectedPatient = this.store.patients[0]; // John Miller
    this.navigateTo("record");
  }

  openPatientRecordByMrn(mrn) {
    const pt = this.store.getPatient(mrn);
    if (pt) {
      this.selectedPatient = pt;
      this.navigateTo("record");
    }
  }

  // ==========================================================================
  // Screen 2: Patient Registration
  // ==========================================================================

  renderPatientRegistration(container, params = {}) {
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        <!-- Wizard Navigation Steps -->
        <div class="wizard-steps">
          <div class="wizard-step active" id="wz-step-1">
            <div class="step-num">1</div>
            <span>Personal Information</span>
          </div>
          <div class="step-line"></div>
          <div class="wizard-step" id="wz-step-2">
            <div class="step-num">2</div>
            <span>Medical & Dental History</span>
          </div>
          <div class="step-line"></div>
          <div class="wizard-step" id="wz-step-3">
            <div class="step-num">3</div>
            <span>Duplicate Check & Confirmation</span>
          </div>
          <div class="step-line"></div>
          <div class="wizard-step" id="wz-step-4">
            <div class="step-num">4</div>
            <span>ID Card & QR Badge</span>
          </div>
        </div>

        <form id="patient-reg-form" onsubmit="event.preventDefault();">
          <!-- Step 1: Personal Info -->
          <div class="card step-content active" id="step-pane-1">
            <div class="card-header">
              <div class="card-title"><span>👤</span> Step 1: Patient Personal Information</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">First Name</label>
                <input type="text" class="form-control" id="reg-first-name" required placeholder="e.g. John" value="${params.firstName || ''}">
              </div>
              <div class="form-group">
                <label class="form-label required">Last Name</label>
                <input type="text" class="form-control" id="reg-last-name" required placeholder="e.g. Miller" value="${params.lastName || ''}">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Mobile Phone Number</label>
                <input type="tel" class="form-control" id="reg-phone" required placeholder="e.g. +1 (555) 234-8901" value="${params.phone || ''}">
                <div class="form-hint">Used for SMS reminders and duplicate detection</div>
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-control" id="reg-email" placeholder="patient@example.com">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Date of Birth</label>
                <input type="date" class="form-control" id="reg-dob" required onchange="app.calcRegAge(this.value)">
              </div>
              <div class="form-group">
                <label class="form-label">Calculated Age</label>
                <input type="text" class="form-control" id="reg-calc-age" readonly placeholder="Calculated automatically">
              </div>
              <div class="form-group">
                <label class="form-label required">Gender</label>
                <select class="form-control" id="reg-gender" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-binary</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Blood Group</label>
                <select class="form-control" id="reg-blood">
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Residential Address</label>
              <input type="text" class="form-control" id="reg-address" placeholder="Street address, City, Postal Code">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Emergency Contact Name & Relation</label>
                <input type="text" class="form-control" id="reg-em-name" placeholder="e.g. Sarah Miller (Spouse)">
              </div>
              <div class="form-group">
                <label class="form-label">Emergency Contact Phone</label>
                <input type="tel" class="form-control" id="reg-em-phone" placeholder="+1 (555) 999-0000">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-outline" onclick="app.navigateTo('dashboard')">Cancel</button>
              <button type="button" class="btn btn-primary btn-lg" onclick="app.validateRegStep1()">Continue to Medical History →</button>
            </div>
          </div>

          <!-- Step 2: Medical History -->
          <div class="card step-content" id="step-pane-2">
            <div class="card-header">
              <div class="card-title"><span>📋</span> Step 2: Medical History & Clinical Alerts</div>
            </div>

            <div class="medical-alert-banner">
              <span>⚠️</span>
              <span><strong>Patient Safety Check:</strong> Document all drug allergies (e.g. Penicillin, Latex) and systemic conditions (Diabetes, Hypertension, Bleeding disorders).</span>
            </div>

            <div class="form-group">
              <label class="form-label">Drug & Substance Allergies</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-allergy-tag" value="Penicillin"> Penicillin / Amoxicillin</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-allergy-tag" value="Latex"> Latex Gloves/Rubber</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-allergy-tag" value="Local Anesthetic"> Local Anesthetic (Lidocaine)</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-allergy-tag" value="Sulfa"> Sulfa Drugs</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-allergy-tag" value="Aspirin"> Aspirin / NSAIDs</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-allergy-tag" value="Codeine"> Codeine / Opioids</label>
              </div>
              <input type="text" class="form-control" id="reg-allergies-custom" placeholder="Specify any other allergies or severity...">
            </div>

            <div class="form-group">
              <label class="form-label">Systemic Medical Conditions</label>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-condition-tag" value="Hypertension"> Hypertension (High BP)</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-condition-tag" value="Diabetes"> Diabetes Mellitus</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-condition-tag" value="Cardiac Disease / Stent"> Heart Stent / Pacemaker</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-condition-tag" value="Bleeding Disorder"> Bleeding Disorder / Anticoagulants</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-condition-tag" value="Asthma"> Asthma</label>
                <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" name="reg-condition-tag" value="Pregnancy"> Pregnancy</label>
              </div>
              <input type="text" class="form-control" id="reg-conditions-custom" placeholder="Other medical conditions or notes...">
            </div>

            <div class="form-group">
              <label class="form-label">Current Routine Medications</label>
              <textarea class="form-control" id="reg-medications" placeholder="List medications with dosages (e.g., Lisinopril 10mg daily, Metformin 500mg)..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Dental Anxiety Level</label>
                <select class="form-control" id="reg-anxiety">
                  <option value="Low">Low (Comfortable with dental treatment)</option>
                  <option value="Moderate">Moderate (Mild nervousness)</option>
                  <option value="High">High (Severe dental phobia - requires gentle care)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Previous Dental Experience / Surgeries</label>
                <input type="text" class="form-control" id="reg-previous-dental" placeholder="e.g. Wisdom tooth extraction, braces, root canals...">
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 20px;">
              <button type="button" class="btn btn-outline" onclick="app.showRegStep(1)">← Back to Step 1</button>
              <button type="button" class="btn btn-primary btn-lg" onclick="app.runDuplicateCheck()">Run Duplicate Check →</button>
            </div>
          </div>

          <!-- Step 3: Duplicate Check & Warning Review -->
          <div class="card step-content" id="step-pane-3">
            <div class="card-header">
              <div class="card-title"><span>🔍</span> Step 3: Duplicate Record Detection</div>
            </div>

            <div id="duplicate-check-results-box">
              <!-- Injected by checkDuplicate() -->
            </div>

            <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 24px;">
              <button type="button" class="btn btn-outline" onclick="app.showRegStep(2)">← Back to Medical History</button>
              <button type="button" class="btn btn-success btn-lg" id="btn-save-new-patient" onclick="app.commitNewPatient()">
                <span>💾</span> Confirm & Generate MRN
              </button>
            </div>
          </div>

          <!-- Step 4: Success & Patient ID Badge -->
          <div class="card step-content" id="step-pane-4">
            <div class="reg-success-container" id="reg-success-summary-box">
              <!-- Injected upon successful save -->
            </div>
          </div>
        </form>
      </div>
    `;
  }

  calcRegAge(dobVal) {
    if (!dobVal) return;
    const dob = new Date(dobVal);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const ageField = document.getElementById("reg-calc-age");
    if (ageField) ageField.value = `${age} years old`;
  }

  showRegStep(stepNum) {
    for (let i = 1; i <= 4; i++) {
      const pane = document.getElementById(`step-pane-${i}`);
      const stepNav = document.getElementById(`wz-step-${i}`);
      if (pane) pane.classList.toggle("active", i === stepNum);
      if (stepNav) {
        stepNav.classList.toggle("active", i === stepNum);
        stepNav.classList.toggle("completed", i < stepNum);
      }
    }
  }

  validateRegStep1() {
    const fn = document.getElementById("reg-first-name").value.trim();
    const ln = document.getElementById("reg-last-name").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const dob = document.getElementById("reg-dob").value;

    if (!fn || !ln || !phone || !dob) {
      this.showToast("Please complete all required fields (Name, Phone, DOB)", "error");
      return;
    }
    this.showRegStep(2);
  }

  runDuplicateCheck() {
    const phone = document.getElementById("reg-phone").value.trim();
    const fn = document.getElementById("reg-first-name").value.trim();
    const ln = document.getElementById("reg-last-name").value.trim();
    const fullName = `${fn} ${ln}`;
    const dob = document.getElementById("reg-dob").value;

    const duplicates = this.store.checkDuplicate(phone, fullName, dob);
    const resultsBox = document.getElementById("duplicate-check-results-box");

    if (duplicates.length > 0) {
      resultsBox.innerHTML = `
        <div class="duplicate-alert-card">
          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <span style="font-size: 2rem;">⚠️</span>
            <div>
              <h4 style="font-size: 1.15rem; font-weight: 700; color: #92400E; margin-bottom: 4px;">
                Possible Duplicate Record Detected!
              </h4>
              <p style="font-size: 0.88rem; color: #78350F; margin-bottom: 12px;">
                We found <strong>${duplicates.length} existing patient record(s)</strong> matching this phone number or patient name.
                Please review to prevent split medical charts.
              </p>

              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;">
                ${duplicates.map(p => `
                  <div style="background: #FFFFFF; border: 1.5px solid #FCD34D; border-radius: var(--radius-md); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="font-size: 1rem;">${p.firstName} ${p.lastName}</strong>
                      <span class="patient-mrn-badge" style="margin-left: 8px;">${p.mrn}</span>
                      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
                        Phone: ${p.phone} | DOB: ${p.dob} | Gender: ${p.gender}
                      </div>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="app.openExistingDuplicate('${p.id}')">
                      Open Existing Chart →
                    </button>
                  </div>
                `).join('')}
              </div>

              <div style="background: #FEF3C7; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.82rem; color: #92400E;">
                <strong>Clinical Protocol:</strong> If this is a family member sharing the same household telephone number (e.g. child or spouse), you may click <em>"Confirm & Proceed"</em> below.
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      resultsBox.innerHTML = `
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: var(--radius-lg); padding: 24px; text-align: center;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">✅</div>
          <h4 style="font-size: 1.15rem; font-weight: 700; color: #166534; margin-bottom: 4px;">
            No Duplicate Records Found!
          </h4>
          <p style="font-size: 0.9rem; color: #15803D;">
            The telephone number and patient name are unique in the clinic registry. Ready to generate Medical Record Number (MRN).
          </p>
        </div>
      `;
    }

    this.showRegStep(3);
  }

  openExistingDuplicate(patientId) {
    this.selectedPatient = this.store.getPatient(patientId);
    this.navigateTo("record");
    this.showToast("Loaded existing patient chart.", "info");
  }

  commitNewPatient() {
    const fn = document.getElementById("reg-first-name").value.trim();
    const ln = document.getElementById("reg-last-name").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const dob = document.getElementById("reg-dob").value;
    const gender = document.getElementById("reg-gender").value;
    const bloodGroup = document.getElementById("reg-blood").value;
    const address = document.getElementById("reg-address").value.trim();
    const emName = document.getElementById("reg-em-name").value.trim();
    const emPhone = document.getElementById("reg-em-phone").value.trim();

    // Allergies tags
    const allergyTags = Array.from(document.querySelectorAll("input[name='reg-allergy-tag']:checked")).map(el => el.value);
    const customAllergies = document.getElementById("reg-allergies-custom").value.trim();
    const allergiesList = allergyTags.map(a => ({ name: a, severity: "Documented" }));
    if (customAllergies) allergiesList.push({ name: customAllergies, severity: "Custom" });

    // Conditions
    const conditionTags = Array.from(document.querySelectorAll("input[name='reg-condition-tag']:checked")).map(el => el.value);
    const customConditions = document.getElementById("reg-conditions-custom").value.trim();
    if (customConditions) conditionTags.push(customConditions);

    const medications = document.getElementById("reg-medications").value.trim();
    const anxiety = document.getElementById("reg-anxiety").value;
    const previousDental = document.getElementById("reg-previous-dental").value.trim();

    const newPatient = {
      id: "p" + (this.store.patients.length + 1),
      mrn: `SDO-2026-${String(this.store.patients.length + 1).padStart(4, "0")}`,
      firstName: fn,
      lastName: ln,
      phone: phone,
      email: email || `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      dob: dob,
      gender: gender,
      bloodGroup: bloodGroup,
      address: address || "Metro City",
      emergencyContact: { name: emName, phone: emPhone },
      photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      medicalInfo: {
        allergies: allergiesList,
        conditions: conditionTags,
        medications: medications ? [medications] : [],
        medicalNotes: "New registration completed.",
        previousDental: previousDental,
        dentalAnxiety: anxiety
      },
      dentalChart: {},
      visits: [],
      treatmentPlans: [],
      orthodonticCase: null,
      prescriptions: [],
      billing: [],
      auditLogs: [
        {
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          user: this.store.currentUser.name,
          action: "Patient Registration & MRN Generation"
        }
      ]
    };

    this.store.savePatient(newPatient);
    this.selectedPatient = newPatient;

    // Show Step 4
    const summaryBox = document.getElementById("reg-success-summary-box");
    if (summaryBox) {
      summaryBox.innerHTML = `
        <div class="success-check-icon">✓</div>
        <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
          Patient Successfully Registered!
        </h3>
        <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 24px;">
          Medical Record Number (MRN) has been assigned and secure digital identity badge generated.
        </p>

        <!-- Patient ID Card Preview -->
        <div class="patient-id-card-preview" id="patient-printable-badge">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">🦷</span>
              <div>
                <strong style="font-size: 0.85rem; letter-spacing: 0.5px;">SMILE DENTAL & ORTHO</strong>
                <div style="font-size: 0.65rem; opacity: 0.85;">CLINIC ID CARD</div>
              </div>
            </div>
            <span style="background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;">
              ${newPatient.mrn}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 16px; margin: 10px 0;">
            <img src="${newPatient.photoUrl}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #FFF; object-fit: cover;">
            <div>
              <div style="font-size: 1.25rem; font-weight: 800;">${newPatient.firstName} ${newPatient.lastName}</div>
              <div style="font-size: 0.78rem; opacity: 0.9;">DOB: ${newPatient.dob} | Blood: ${newPatient.bloodGroup}</div>
              <div style="font-size: 0.78rem; opacity: 0.9;">Phone: ${newPatient.phone}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.25); padding-top: 8px;">
            <div style="font-size: 0.7rem; opacity: 0.8;">
              Emergency: ${newPatient.emergencyContact.phone || CLINIC_CONFIG.emergencyPhone}
            </div>
            <div style="background: #FFF; padding: 4px; border-radius: 6px;">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <rect width="40" height="40" fill="#FFF"/>
                <!-- Simulated QR matrix -->
                <rect x="4" y="4" width="10" height="10" fill="#000"/>
                <rect x="6" y="6" width="6" height="6" fill="#FFF"/>
                <rect x="7" y="7" width="4" height="4" fill="#000"/>
                <rect x="26" y="4" width="10" height="10" fill="#000"/>
                <rect x="28" y="6" width="6" height="6" fill="#FFF"/>
                <rect x="29" y="7" width="4" height="4" fill="#000"/>
                <rect x="4" y="26" width="10" height="10" fill="#000"/>
                <rect x="6" y="28" width="6" height="6" fill="#FFF"/>
                <rect x="7" y="29" width="4" height="4" fill="#000"/>
                <rect x="18" y="8" width="4" height="4" fill="#000"/>
                <rect x="18" y="18" width="8" height="8" fill="#000"/>
                <rect x="28" y="22" width="6" height="6" fill="#000"/>
                <rect x="16" y="30" width="6" height="4" fill="#000"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; justify-content: center; gap: 14px; margin-top: 28px; flex-wrap: wrap;">
          <button class="btn btn-outline btn-lg" onclick="app.printPatientIdCard('${newPatient.id}')">
            <span>🖨️</span> Print Patient ID Card
          </button>
          <button class="btn btn-secondary btn-lg" onclick="app.quickIssueQueueToken('${newPatient.id}')">
            <span>🎟️</span> Issue Queue Token
          </button>
          <button class="btn btn-primary btn-lg" onclick="app.navigateTo('record')">
            <span>🦷</span> Open Dental Record →
          </button>
        </div>
      `;
    }

    this.showRegStep(4);
    this.showToast(`Patient registered! Assigned MRN: ${newPatient.mrn}`, "success");
  }

  // ==========================================================================
  // Screen 3: Patient Live Search
  // ==========================================================================

  renderPatientSearch(container) {
    container.innerHTML = `
      <div style="max-width: 1000px; margin: 0 auto;">
        <!-- Search Input Bar -->
        <div class="search-bar-container">
          <span style="font-size: 1.4rem; color: var(--text-muted);">🔍</span>
          <input
            type="text"
            id="live-patient-search-input"
            class="search-bar-input"
            placeholder="Type patient name, phone number, or MRN (e.g., 'John', '555', 'SDO-2026')..."
            autofocus
          >
          <button class="btn btn-sm btn-outline" id="btn-clear-search" onclick="document.getElementById('live-patient-search-input').value=''; app.executePatientSearch('');">
            ✕ Clear
          </button>
          <button class="btn btn-sm btn-primary" onclick="app.openQrScannerSimulation()">
            <span>📷</span> Scan QR / Barcode
          </button>
        </div>

        <!-- Filter Chips -->
        <div class="search-filter-pills">
          <button class="filter-pill active" onclick="app.setSearchFilter('all', this)">All Patients (${this.store.patients.length})</button>
          <button class="filter-pill" onclick="app.setSearchFilter('queue', this)">Currently in Queue</button>
          <button class="filter-pill" onclick="app.setSearchFilter('ortho', this)">Orthodontics</button>
          <button class="filter-pill" onclick="app.setSearchFilter('balance', this)">Outstanding Balance</button>
          <button class="filter-pill" onclick="app.setSearchFilter('allergies', this)">Medical Alerts / Allergies</button>
        </div>

        <!-- Patient Results Grid -->
        <div class="patient-results-grid" id="patient-search-results-container">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;

    const searchInput = document.getElementById("live-patient-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.executePatientSearch(e.target.value);
        }, 250);
      });
    }

    this.executePatientSearch("");
  }

  setSearchFilter(filterType, btnEl) {
    document.querySelectorAll(".search-filter-pills .filter-pill").forEach(p => p.classList.remove("active"));
    if (btnEl) btnEl.classList.add("active");
    this.currentSearchFilter = filterType;
    const query = document.getElementById("live-patient-search-input")?.value || "";
    this.executePatientSearch(query);
  }

  executePatientSearch(query) {
    const resultsContainer = document.getElementById("patient-search-results-container");
    if (!resultsContainer) return;

    const q = (query || "").toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, "");
    let filtered = this.store.patients.filter(p => {
      const matchName = `${p.firstName} ${p.lastName}`.toLowerCase().includes(q);
      const matchPhone = cleanDigits.length >= 2 && (p.phone || "").replace(/\D/g, "").includes(cleanDigits);
      const matchMrn = (p.mrn || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchMrn;
    });

    // Apply secondary filter chip
    if (this.currentSearchFilter === "queue") {
      const queuedIds = this.store.queue.filter(q => q.status !== "Completed").map(q => q.patientId);
      filtered = filtered.filter(p => queuedIds.includes(p.id));
    } else if (this.currentSearchFilter === "ortho") {
      filtered = filtered.filter(p => p.orthodonticCase !== null);
    } else if (this.currentSearchFilter === "balance") {
      filtered = filtered.filter(p => {
        const bal = (p.billing || []).reduce((acc, b) => acc + (b.balance || 0), 0);
        return bal > 0;
      });
    } else if (this.currentSearchFilter === "allergies") {
      filtered = filtered.filter(p => p.medicalInfo?.allergies?.length > 0);
    }

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #FFFFFF; border-radius: var(--radius-lg); border: 1px dashed var(--border-strong);">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
          <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">No Matching Patients Found</h4>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px;">Try adjusting your search terms or register as a new patient.</p>
          <button class="btn btn-primary" onclick="app.navigateTo('registration', { phone: '${query}' })">
            <span>👤➕</span> Register New Patient with "${query}"
          </button>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(p => {
      const age = p.dob ? Math.abs(new Date(Date.now() - new Date(p.dob).getTime()).getUTCFullYear() - 1970) : "N/A";
      const hasAllergy = p.medicalInfo?.allergies?.length > 0;
      const hasOrtho = p.orthodonticCase !== null;
      const isQueued = this.store.queue.some(q => q.patientId === p.id && q.status !== "Completed");

      return `
        <div class="patient-card">
          <div>
            <div class="patient-card-header">
              <img src="${p.photoUrl}" class="patient-avatar" alt="${p.firstName}">
              <div class="patient-info-text">
                <h4>${p.firstName} ${p.lastName}</h4>
                <span class="patient-mrn-badge">${p.mrn}</span>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 3px;">
                  📞 ${p.phone}
                </div>
              </div>
            </div>

            <div class="patient-meta-grid">
              <div>Age/Sex: <strong>${age}y / ${p.gender}</strong></div>
              <div>Blood: <strong>${p.bloodGroup}</strong></div>
              <div>Last Visit: <strong>${p.visits?.[0]?.date || 'None'}</strong></div>
              <div>Ortho: <strong>${hasOrtho ? 'Active' : 'No'}</strong></div>
            </div>

            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
              ${hasAllergy ? `<span class="badge badge-red">⚠️ Allergy: ${p.medicalInfo.allergies[0].name}</span>` : ''}
              ${hasOrtho ? `<span class="badge badge-purple">✨ Braces/Aligner</span>` : ''}
              ${isQueued ? `<span class="badge badge-amber">🎟️ In Queue</span>` : ''}
            </div>
          </div>

          <div class="patient-card-actions">
            <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.selectAndOpenPatient('${p.id}')">
              <span>🦷</span> Open Record
            </button>
            <button class="btn btn-sm btn-outline" title="Issue Token" onclick="app.quickIssueQueueToken('${p.id}')">
              🎟️ Token
            </button>
            <button class="btn btn-sm btn-outline" title="Book Appointment" onclick="app.openBookAppointmentModal('${p.id}')">
              📅 Book
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  selectAndOpenPatient(patientId) {
    this.selectedPatient = this.store.getPatient(patientId);
    this.navigateTo("record");
  }

  // ==========================================================================
  // Screen 4: Patient Medical Record Workspace (11 Tabs)
  // ==========================================================================

  renderPatientRecord(container, activeTab = "overview") {
    if (!this.selectedPatient) {
      this.selectedPatient = this.store.patients[0];
    }
    const pt = this.selectedPatient;
    const age = pt.dob ? Math.abs(new Date(Date.now() - new Date(pt.dob).getTime()).getUTCFullYear() - 1970) : "N/A";
    const totalBalance = (pt.billing || []).reduce((acc, b) => acc + (b.balance || 0), 0);

    container.innerHTML = `
      <!-- Top Sticky Patient Summary Banner -->
      <div class="patient-record-header">
        <div class="patient-header-left">
          <img src="${pt.photoUrl}" class="patient-header-avatar" alt="${pt.firstName}">
          <div class="patient-header-details">
            <h2>
              ${pt.firstName} ${pt.lastName}
              <span class="patient-mrn-badge" style="font-size: 0.95rem;">${pt.mrn}</span>
            </h2>
            <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 2px;">
              ${age} yrs • ${pt.gender} • Blood: ${pt.bloodGroup} • Phone: ${pt.phone} • DOB: ${pt.dob}
            </div>
            <div class="patient-alert-chips">
              ${(pt.medicalInfo?.allergies || []).map(a => `
                <span class="badge badge-red">⚠️ ALLERGY: ${a.name} (${a.severity})</span>
              `).join('')}
              ${(pt.medicalInfo?.conditions || []).map(c => `
                <span class="badge badge-amber">⚕️ ${c}</span>
              `).join('')}
              ${totalBalance > 0 ? `
                <span class="badge badge-red">💳 Balance: $${totalBalance}</span>
              ` : `
                <span class="badge badge-green">✓ Account Settled</span>
              `}
              ${pt.orthodonticCase ? `<span class="badge badge-purple">✨ Orthodontic Case Active</span>` : ''}
            </div>
          </div>
        </div>

        <div class="patient-header-actions">
          <button class="btn btn-sm btn-outline" onclick="app.openBookAppointmentModal('${pt.id}')">
            📅 Book Appt
          </button>
          <button class="btn btn-sm btn-outline" onclick="app.quickIssueQueueToken('${pt.id}')">
            🎟️ Issue Token
          </button>
          <button class="btn btn-sm btn-outline" onclick="app.printPatientIdCard('${pt.id}')">
            🖨️ ID Badge
          </button>
          <button class="btn btn-sm btn-primary" onclick="app.switchRecordTab('odontogram')">
            🦷 Open Odontogram
          </button>
        </div>
      </div>

      <!-- 11 Patient Record Tabs -->
      <div class="record-tabs-bar">
        <button class="record-tab-btn ${activeTab === 'overview' ? 'active' : ''}" onclick="app.switchRecordTab('overview')">1. Overview</button>
        <button class="record-tab-btn ${activeTab === 'medical' ? 'active' : ''}" onclick="app.switchRecordTab('medical')">2. Medical History</button>
        <button class="record-tab-btn ${activeTab === 'dental' ? 'active' : ''}" onclick="app.switchRecordTab('dental')">3. Dental History</button>
        <button class="record-tab-btn ${activeTab === 'odontogram' ? 'active' : ''}" onclick="app.switchRecordTab('odontogram')">4. Odontogram</button>
        <button class="record-tab-btn ${activeTab === 'visits' ? 'active' : ''}" onclick="app.switchRecordTab('visits')">5. Clinical Visits</button>
        <button class="record-tab-btn ${activeTab === 'treatment' ? 'active' : ''}" onclick="app.switchRecordTab('treatment')">6. Treatment Plans</button>
        <button class="record-tab-btn ${activeTab === 'ortho' ? 'active' : ''}" onclick="app.switchRecordTab('ortho')">7. Orthodontics</button>
        <button class="record-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}" onclick="app.switchRecordTab('prescriptions')">8. Prescriptions</button>
        <button class="record-tab-btn ${activeTab === 'xrays' ? 'active' : ''}" onclick="app.switchRecordTab('xrays')">9. X-rays & Docs</button>
        <button class="record-tab-btn ${activeTab === 'billing' ? 'active' : ''}" onclick="app.switchRecordTab('billing')">10. Billing</button>
        <button class="record-tab-btn ${activeTab === 'audit' ? 'active' : ''}" onclick="app.switchRecordTab('audit')">11. Audit Trail</button>
      </div>

      <!-- Tab Content Area -->
      <div id="patient-tab-content-container">
        <!-- Rendered dynamically based on activeTab -->
      </div>
    `;

    this.renderActiveRecordTab(activeTab);
  }

  switchRecordTab(tabName) {
    document.querySelectorAll(".record-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.textContent.toLowerCase().includes(tabName));
    });
    this.renderActiveRecordTab(tabName);
  }

  renderActiveRecordTab(tabName) {
    const tabContainer = document.getElementById("patient-tab-content-container");
    if (!tabContainer || !this.selectedPatient) return;
    const pt = this.selectedPatient;

    switch (tabName) {
      case "overview":
        tabContainer.innerHTML = `
          <div class="dashboard-summary-grid" style="margin-bottom: 20px;">
            <div class="summary-card">
              <div class="summary-icon-box" style="background:#E0F2FE; color:#0284C7;">📋</div>
              <div class="summary-details">
                <h4>Visits Total</h4>
                <div class="summary-value">${pt.visits?.length || 0}</div>
                <div class="summary-subtext">Clinical Encounters</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon-box" style="background:#CCFBF1; color:#0D9488;">🦷</div>
              <div class="summary-details">
                <h4>Procedures</h4>
                <div class="summary-value">${(pt.treatmentPlans?.[0]?.procedures || []).length}</div>
                <div class="summary-subtext">Planned/Completed</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon-box" style="background:#F3E8FF; color:#7C3AED;">✨</div>
              <div class="summary-details">
                <h4>Ortho Status</h4>
                <div class="summary-value" style="font-size: 1.15rem;">${pt.orthodonticCase ? 'Active' : 'None'}</div>
                <div class="summary-subtext">${pt.orthodonticCase?.currentStage || 'No active braces'}</div>
              </div>
            </div>
            <div class="summary-card">
              <div class="summary-icon-box" style="background:#FEF2F2; color:#DC2626;">💳</div>
              <div class="summary-details">
                <h4>Due Balance</h4>
                <div class="summary-value">$${(pt.billing || []).reduce((acc, b) => acc + (b.balance || 0), 0)}</div>
                <div class="summary-subtext">Patient copay due</div>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
            <div class="card">
              <div class="card-header">
                <div class="card-title"><span>🩺</span> Active Clinical Conditions & Treatment Focus</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${Object.keys(pt.dentalChart || {}).length > 0 ? `
                  <div style="background: #F8FAFC; padding: 14px; border-radius: var(--radius-md); border-left: 4px solid var(--primary-teal);">
                    <strong>Odontogram Findings Recorded:</strong>
                    <ul style="margin-left: 20px; margin-top: 6px; font-size: 0.9rem; color: var(--text-secondary);">
                      ${Object.entries(pt.dentalChart).map(([tooth, data]) => `
                        <li>Tooth #${tooth}: <strong>${data.diagnosis || data.status.toUpperCase()}</strong> - ${data.findings.join(', ')}</li>
                      `).join('')}
                    </ul>
                  </div>
                ` : `<p style="color: var(--text-muted); font-size: 0.9rem;">No odontogram conditions recorded yet. Click "Odontogram" tab to begin exam.</p>`}

                ${pt.treatmentPlans?.[0] ? `
                  <div style="background: #F0FDF4; padding: 14px; border-radius: var(--radius-md); border-left: 4px solid var(--success);">
                    <strong>Active Treatment Plan: ${pt.treatmentPlans[0].title}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                      Estimated Cost: $${pt.treatmentPlans[0].estimatedTotal} | Status: <span class="badge badge-green">${pt.treatmentPlans[0].status}</span>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title"><span>⚡</span> Quick Patient Actions</div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <button class="btn btn-outline" onclick="app.switchRecordTab('odontogram')">
                  <span>🦷</span> Dental Examination
                </button>
                <button class="btn btn-outline" onclick="app.openNewPrescriptionModal()">
                  <span>💊</span> Write Prescription
                </button>
                <button class="btn btn-outline" onclick="app.switchRecordTab('treatment')">
                  <span>📋</span> View Treatment Plan
                </button>
                <button class="btn btn-outline" onclick="app.switchRecordTab('billing')">
                  <span>💳</span> Cashier & Invoicing
                </button>
              </div>
            </div>
          </div>
        `;
        break;

      case "medical":
        tabContainer.innerHTML = `
          <div class="card">
            <div class="card-header">
              <div class="card-title"><span>🩺</span> Complete Medical History & Risk Profile</div>
              <button class="btn btn-sm btn-outline" onclick="app.showToast('Medical record update mode enabled.', 'info')">Edit History</button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; color: var(--error);">
                  Known Allergies & Adverse Reactions
                </h4>
                ${(pt.medicalInfo?.allergies || []).length > 0 ? (pt.medicalInfo.allergies.map(a => `
                  <div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 10px 14px; border-radius: var(--radius-md); margin-bottom: 8px;">
                    <strong style="color: #991B1B;">⚠️ ${a.name}</strong>
                    <div style="font-size: 0.8rem; color: #7F1D1D;">Severity: ${a.severity}</div>
                  </div>
                `).join('')) : `<p style="font-size: 0.9rem; color: var(--text-secondary);">No known allergies reported (NKDA).</p>`}

                <h4 style="font-size: 0.95rem; font-weight: 700; margin: 16px 0 8px; color: var(--text-main);">
                  Systemic Medical Conditions
                </h4>
                ${(pt.medicalInfo?.conditions || []).length > 0 ? (pt.medicalInfo.conditions.map(c => `
                  <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-md); margin-bottom: 6px; font-size: 0.9rem;">
                    ⚕️ ${c}
                  </div>
                `).join('')) : `<p style="font-size: 0.9rem; color: var(--text-secondary);">No chronic medical conditions reported.</p>`}
              </div>

              <div>
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; color: var(--text-main);">
                  Current Prescription Medications
                </h4>
                ${(pt.medicalInfo?.medications || []).length > 0 ? (pt.medicalInfo.medications.map(m => `
                  <div style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-md); margin-bottom: 6px; font-size: 0.9rem;">
                    💊 ${m}
                  </div>
                `).join('')) : `<p style="font-size: 0.9rem; color: var(--text-secondary);">No routine medications.</p>`}

                <h4 style="font-size: 0.95rem; font-weight: 700; margin: 16px 0 8px; color: var(--text-main);">
                  Clinical Alerts & Special Precautions
                </h4>
                <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 12px; border-radius: var(--radius-md); font-size: 0.88rem; color: #92400E;">
                  ${pt.medicalInfo?.medicalNotes || 'No special precautions logged.'}
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "dental":
        tabContainer.innerHTML = `
          <div class="card">
            <div class="card-header">
              <div class="card-title"><span>🦷</span> Previous Dental History & Oral Hygiene Profile</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p><strong>Dental Anxiety Level:</strong> <span class="badge ${pt.medicalInfo?.dentalAnxiety === 'High' ? 'badge-red' : 'badge-teal'}">${pt.medicalInfo?.dentalAnxiety || 'Low'}</span></p>
                <p style="margin-top: 10px;"><strong>Previous Dental Interventions:</strong></p>
                <div style="background: #F8FAFC; padding: 12px; border-radius: var(--radius-md); margin-top: 4px; font-size: 0.9rem; color: var(--text-secondary);">
                  ${pt.medicalInfo?.previousDental || 'Regular dental attendee.'}
                </div>
              </div>
              <div>
                <p><strong>Caries Risk Assessment (CAMBRA):</strong> <span class="badge badge-amber">Moderate Risk</span></p>
                <p style="margin-top: 10px;"><strong>Periodontal Screening Score:</strong> PSR Code 2 (Calculus / defective margins)</p>
              </div>
            </div>
          </div>
        `;
        break;

      case "odontogram":
        this.renderOdontogramTab(tabContainer);
        break;

      case "visits":
        this.renderVisitsTab(tabContainer);
        break;

      case "treatment":
        this.renderTreatmentPlansTab(tabContainer);
        break;

      case "ortho":
        this.renderOrthoTab(tabContainer);
        break;

      case "prescriptions":
        this.renderPrescriptionsTab(tabContainer);
        break;

      case "xrays":
        this.renderXraysTab(tabContainer);
        break;

      case "billing":
        this.renderBillingTab(tabContainer);
        break;

      case "audit":
        this.renderAuditTab(tabContainer);
        break;

      default:
        tabContainer.innerHTML = `<p>Tab under construction.</p>`;
    }
  }

  // ==========================================================================
  // Screen 5: Odontogram Tab
  // ==========================================================================

  renderOdontogramTab(container) {
    const isLocked = Boolean(this.selectedPatient && this.selectedPatient.encounterLocked);
    const canEditOdonto = this.hasPermission("odontogram.edit");

    container.innerHTML = `
      ${isLocked ? `
        <div class="medical-alert-banner" style="background: #FEF3C7; border: 1px solid #F59E0B; color: #92400E; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.4rem;">🔒</span>
            <div>
              <strong>Clinical Encounter Finalized & Digitally Locked</strong>
              <div style="font-size: 0.85rem; opacity: 0.95;">Signed by ${this.selectedPatient.lockedBy || 'Clinician'} on ${this.selectedPatient.lockedDate || '2026-10-23'}. Chart modifications require an authorized controlled amendment.</div>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="app.openControlledAmendmentModal()">
            <span>📝</span> Add Controlled Amendment
          </button>
        </div>
      ` : !canEditOdonto ? `
        <div class="medical-alert-banner" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; margin-bottom: 14px;">
          <span>ℹ️</span>
          <span><strong>View-Only Mode:</strong> Your current role (${this.store.currentUser.role}) does not have clinical odontogram editing privileges. Switch to Dentist/Admin in the top bar to record findings.</span>
        </div>
      ` : ''}

      <div class="odontogram-layout">
        <div>
          <div id="odontogram-svg-mount"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 0.82rem; color: var(--text-secondary);">
              <strong>Standard:</strong> FDI World Dental Federation notation (Adult 11-48 / Deciduous 51-85). Touch or click any tooth to inspect surfaces.
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-outline btn-sm" onclick="app.saveOdontogramDraft()">
                <span>💾</span> Save Draft
              </button>
              <button class="btn btn-primary btn-sm" onclick="app.openFinalizeEncounterModal()">
                <span>✍️</span> Finalize & Sign Encounter
              </button>
            </div>
          </div>
        </div>

        <!-- Tooth Inspector Panel -->
        <div class="tooth-inspector-panel" id="tooth-inspector-mount">
          <div class="inspector-header">
            <div class="inspector-tooth-badge" id="inspector-tooth-number">Select Tooth</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);" id="inspector-tooth-name">Click any tooth on chart</div>
          </div>

          <div id="inspector-tooth-controls" style="display: none;">
            <label class="form-label">Tooth Surfaces Affected</label>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-occlusal" onchange="app.toggleSurface('occlusal')"> Occlusal (O)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-mesial" onchange="app.toggleSurface('mesial')"> Mesial (M)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-distal" onchange="app.toggleSurface('distal')"> Distal (D)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-buccal" onchange="app.toggleSurface('buccal')"> Buccal (B)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-lingual" onchange="app.toggleSurface('lingual')"> Lingual (L)</label>
            </div>

            <label class="form-label">Clinical Finding / Condition</label>
            <div class="condition-pill-grid">
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('healthy')">Sound / Healthy</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('caries')">Active Caries</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('restoration')">Composite</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('amalgam')">Amalgam</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('crown')">Crown / Cap</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('rct')">Root Canal</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('fracture')">Fracture</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('missing')">Missing</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('extraction_planned')">Extraction Planned</button>
              <button type="button" class="condition-pill" onclick="app.setInspectorCondition('implant')">Dental Implant</button>
            </div>

            <div class="form-group">
              <label class="form-label">Clinical Diagnosis Note</label>
              <input type="text" class="form-control" id="inspector-diagnosis-input" placeholder="e.g. Dentinal caries with pulp involvement">
            </div>

            <div class="form-group">
              <label class="form-label">Plan Procedure for this Tooth</label>
              <select class="form-control" id="inspector-procedure-select">
                <option value="">-- Choose Procedure --</option>
                ${this.store.procedures.map(p => `
                  <option value="${p.code}">${p.code}: ${p.name} ($${p.price})</option>
                `).join('')}
              </select>
            </div>

            <button type="button" class="btn btn-primary" style="width: 100%; margin-top: 8px;" onclick="app.addProcedureFromInspector()">
              <span>➕</span> Add to Treatment Plan
            </button>
          </div>
        </div>
      </div>
    `;

    // Instantiate OdontogramChart
    setTimeout(() => {
      this.odontogramInstance = new OdontogramChart("odontogram-svg-mount", {
        isPediatric: false,
        readOnly: isLocked || !canEditOdonto,
        onToothSelect: (toothNum, data, surface, toothName) => {
          this.handleToothSelection(toothNum, data, surface, toothName);
        }
      });

      if (this.selectedPatient && this.selectedPatient.dentalChart) {
        this.odontogramInstance.setChartData(this.selectedPatient.dentalChart);
      }
    }, 50);
  }

  handleToothSelection(toothNum, data, surface, toothName) {
    this.activeOdontogramTooth = toothNum;
    const controlsMount = document.getElementById("inspector-tooth-controls");
    const numEl = document.getElementById("inspector-tooth-number");
    const nameEl = document.getElementById("inspector-tooth-name");
    const diagInput = document.getElementById("inspector-diagnosis-input");

    if (numEl) numEl.textContent = `Tooth #${toothNum}`;
    if (nameEl) nameEl.textContent = toothName;
    if (controlsMount) controlsMount.style.display = "block";

    // Update checkboxes
    const surfaces = data.surfaces || {};
    ["occlusal", "mesial", "distal", "buccal", "lingual"].forEach(s => {
      const chk = document.getElementById(`surf-${s}`);
      if (chk) chk.checked = !!surfaces[s];
    });

    // If a specific surface was clicked, toggle it
    if (surface) {
      const chk = document.getElementById(`surf-${surface}`);
      if (chk) {
        chk.checked = !chk.checked;
        this.toggleSurface(surface);
      }
    }

    if (diagInput) diagInput.value = data.diagnosis || "";

    // Highlight active condition button
    document.querySelectorAll(".condition-pill").forEach(pill => {
      pill.classList.toggle("active", pill.textContent.toLowerCase().includes(data.status || 'healthy'));
    });
  }

  toggleSurface(surfaceName) {
    if (!this.activeOdontogramTooth || !this.selectedPatient) return;
    if (this.selectedPatient.encounterLocked) {
      this.showToast("Encounter chart is locked. Click 'Add Controlled Amendment' to modify.", "warning");
      return;
    }
    if (!this.hasPermission("odontogram.edit")) {
      this.showToast(`Access Denied: Current role (${this.store.currentUser.role}) cannot edit dental chart.`, "error");
      return;
    }
    const toothNum = this.activeOdontogramTooth;
    const ptChart = this.selectedPatient.dentalChart || {};
    const toothData = ptChart[toothNum] || { status: "caries", surfaces: {}, findings: [], diagnosis: "" };
    
    toothData.surfaces = toothData.surfaces || {};
    const chk = document.getElementById(`surf-${surfaceName}`);
    toothData.surfaces[surfaceName] = chk ? chk.checked : !toothData.surfaces[surfaceName];

    ptChart[toothNum] = toothData;
    this.selectedPatient.dentalChart = ptChart;
    this.store.savePatient(this.selectedPatient);
    this.odontogramInstance.updateToothData(toothNum, toothData);
  }

  setInspectorCondition(condition) {
    if (!this.activeOdontogramTooth || !this.selectedPatient) return;
    if (this.selectedPatient.encounterLocked) {
      this.showToast("Encounter chart is locked. Click 'Add Controlled Amendment' to modify.", "warning");
      return;
    }
    if (!this.hasPermission("odontogram.edit")) {
      this.showToast(`Access Denied: Current role (${this.store.currentUser.role}) cannot edit dental chart.`, "error");
      return;
    }
    const toothNum = this.activeOdontogramTooth;
    const ptChart = this.selectedPatient.dentalChart || {};
    const toothData = ptChart[toothNum] || { status: "healthy", surfaces: {}, findings: [], diagnosis: "" };

    toothData.status = condition;
    if (condition === "caries") {
      toothData.surfaces.occlusal = true;
      toothData.findings = ["Carious lesion detected"];
    } else if (condition === "restoration") {
      toothData.surfaces.occlusal = true;
      toothData.findings = ["Composite resin restoration"];
    } else if (condition === "amalgam") {
      toothData.surfaces.occlusal = true;
      toothData.findings = ["Amalgam restoration"];
    } else if (condition === "crown") {
      toothData.findings = ["Full coverage crown"];
    } else if (condition === "rct") {
      toothData.findings = ["Endodontic root canal therapy"];
    } else if (condition === "fracture") {
      toothData.findings = ["Fractured crown / incisal edge"];
    } else if (condition === "missing") {
      toothData.surfaces = {};
      toothData.findings = ["Tooth missing / extracted"];
    } else if (condition === "extraction_planned") {
      toothData.surfaces = {};
      toothData.findings = ["Planned for extraction"];
    } else if (condition === "implant") {
      toothData.surfaces = {};
      toothData.findings = ["Endosteal implant restoration"];
    } else if (condition === "healthy") {
      toothData.surfaces = {};
      toothData.findings = ["Intact sound enamel"];
    }

    ptChart[toothNum] = toothData;
    this.selectedPatient.dentalChart = ptChart;
    this.store.savePatient(this.selectedPatient);
    this.odontogramInstance.updateToothData(toothNum, toothData);

    // Update buttons
    document.querySelectorAll(".condition-pill").forEach(p => {
      const match = p.textContent.toLowerCase().includes(condition.replace('_', ' '));
      p.classList.toggle("active", match);
    });

    this.showToast(`Updated Tooth #${toothNum} to: ${condition.replace('_', ' ').toUpperCase()}`, "success");
  }

  addProcedureFromInspector() {
    if (!this.activeOdontogramTooth || !this.selectedPatient) return;
    const procCode = document.getElementById("inspector-procedure-select").value;
    if (!procCode) {
      this.showToast("Please choose a procedure to plan.", "warning");
      return;
    }

    const proc = this.store.procedures.find(p => p.code === procCode);
    if (!proc) return;

    let plan = this.selectedPatient.treatmentPlans?.[0];
    if (!plan) {
      plan = {
        id: "tp-" + Date.now(),
        title: "Comprehensive Restorative Plan",
        createdAt: new Date().toISOString().split("T")[0],
        status: "Proposed",
        procedures: [],
        estimatedTotal: 0,
        approvedTotal: 0
      };
      this.selectedPatient.treatmentPlans = [plan];
    }

    plan.procedures.push({
      code: proc.code,
      tooth: this.activeOdontogramTooth,
      name: proc.name,
      cost: proc.price,
      status: "Proposed"
    });

    plan.estimatedTotal = plan.procedures.filter(p => p.status !== "Cancelled").reduce((acc, p) => acc + p.cost, 0);
    this.store.savePatient(this.selectedPatient);

    this.showToast(`Added ${proc.name} (Tooth #${this.activeOdontogramTooth}) to Treatment Plan!`, "success");
  }

  saveOdontogramDraft() {
    if (!this.selectedPatient) return;
    this.store.savePatient(this.selectedPatient);
    this.showToast("Odontogram chart saved as draft.", "success");
  }

  openFinalizeEncounterModal() {
    // Only clinician can sign
    if (!this.store.currentUser.permissions.includes("encounters.finalize") && this.store.currentUser.role !== "admin") {
      this.showToast(`Access Denied: Current role (${this.store.currentUser.role}) is not authorized to sign clinical encounters. Switch to Dentist in top bar.`, "error");
      return;
    }

    const modal = document.getElementById("finalize-encounter-modal");
    if (modal) {
      modal.classList.add("open");
      const docNameEl = document.getElementById("modal-signing-doctor-name");
      if (docNameEl) docNameEl.textContent = this.store.currentUser.name;
    }
  }

  confirmFinalizeEncounter() {
    if (!this.selectedPatient) return;
    const notes = document.getElementById("finalize-clinical-summary-notes")?.value || "Encounter finalized.";

    const doctorSignature = `${this.store.currentUser.name} (${this.store.currentUser.license || 'Admin'})`;
    const newVisit = {
      id: "v-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doctor: this.store.currentUser.name,
      reason: "Dental Examination & Charting",
      soap: {
        s: "Patient evaluated for routine/complaint exam.",
        o: "Odontogram chart updated. Findings recorded.",
        a: "Oral diagnosis complete.",
        p: notes
      },
      status: "Finalized & Locked",
      signedBy: doctorSignature
    };

    this.selectedPatient.visits = this.selectedPatient.visits || [];
    this.selectedPatient.visits.unshift(newVisit);

    this.selectedPatient.encounterLocked = true;
    this.selectedPatient.lockedBy = doctorSignature;
    this.selectedPatient.lockedDate = new Date().toISOString().split("T")[0];

    this.selectedPatient.auditLogs = this.selectedPatient.auditLogs || [];
    this.selectedPatient.auditLogs.unshift({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: this.store.currentUser.name,
      action: "Finalized & Digitally Signed Clinical Encounter"
    });

    this.store.savePatient(this.selectedPatient);

    const modal = document.getElementById("finalize-encounter-modal");
    if (modal) modal.classList.remove("open");

    this.showToast("Clinical encounter digitally signed and locked.", "success");
    this.switchRecordTab("visits");
  }

  openControlledAmendmentModal() {
    if (!this.hasPermission("odontogram.edit") && this.store.currentUser.role !== "admin") {
      this.showToast(`Access Denied: Current role (${this.store.currentUser.role}) cannot add controlled amendments. Switch to Dentist/Admin.`, "error");
      return;
    }
    const modal = document.getElementById("controlled-amendment-modal");
    if (modal) {
      modal.classList.add("open");
      const justEl = document.getElementById("amendment-justification");
      if (justEl) justEl.value = "";
    }
  }

  confirmControlledAmendment() {
    if (!this.selectedPatient) return;
    const justification = document.getElementById("amendment-justification")?.value.trim();
    const pin = document.getElementById("amendment-doctor-pin")?.value.trim();

    if (!justification) {
      this.showToast("Clinical justification is strictly required for controlled amendments.", "warning");
      return;
    }

    if (!pin) {
      this.showToast("Doctor PIN / electronic signature required.", "warning");
      return;
    }

    this.selectedPatient.encounterLocked = false;
    this.selectedPatient.underAmendment = true;

    this.selectedPatient.auditLogs = this.selectedPatient.auditLogs || [];
    this.selectedPatient.auditLogs.unshift({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: this.store.currentUser.name,
      action: `[Controlled Clinical Amendment] ${justification}`
    });

    if (this.selectedPatient.visits && this.selectedPatient.visits.length > 0) {
      this.selectedPatient.visits[0].amendments = this.selectedPatient.visits[0].amendments || [];
      this.selectedPatient.visits[0].amendments.push({
        date: new Date().toISOString().split("T")[0],
        user: this.store.currentUser.name,
        justification: justification
      });
    }

    this.store.savePatient(this.selectedPatient);
    const modal = document.getElementById("controlled-amendment-modal");
    if (modal) modal.classList.remove("open");

    this.showToast("Chart unlocked for controlled clinical amendment.", "success");
    this.renderOdontogramTab(document.getElementById("patient-tab-content-container"));
  }

  // ==========================================================================
  // Screen 6: Treatment Plans Tab
  // ==========================================================================

  renderTreatmentPlansTab(container) {
    const pt = this.selectedPatient;
    const plans = pt.treatmentPlans || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">Dental Treatment Plans</h3>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="app.printTreatmentEstimate()">
            <span>🖨️</span> Print Patient Estimate
          </button>
          <button class="btn btn-primary btn-sm" onclick="app.openSelectiveBillingModal()">
            <span>💳</span> Generate Billable Invoice →
          </button>
        </div>
      </div>

      ${plans.length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary); margin-bottom: 12px;">No active treatment plans for this patient.</p>
          <button class="btn btn-primary" onclick="app.switchRecordTab('odontogram')">Create Plan from Odontogram</button>
        </div>
      ` : plans.map((plan, idx) => `
        <div class="treatment-plan-card" style="margin-bottom: 20px;">
          <div class="card-header">
            <div>
              <div class="card-title">${plan.title}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">Created on: ${plan.createdAt} | Plan ID: ${plan.id}</div>
            </div>
            <span class="badge ${plan.status === 'Approved' ? 'badge-green' : plan.status === 'In Progress' ? 'badge-purple' : 'badge-amber'}">
              ${plan.status}
            </span>
          </div>

          <div class="table-responsive">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Tooth / Site</th>
                  <th>Procedure Description</th>
                  <th>Standard Fee</th>
                  <th>Patient Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${plan.procedures.map((p, pIdx) => `
                  <tr style="${p.status === 'Cancelled' ? 'opacity: 0.5; text-decoration: line-through;' : ''}">
                    <td><strong>${p.code}</strong></td>
                    <td><span class="badge badge-subtle">Tooth #${p.tooth}</span></td>
                    <td>${p.name}</td>
                    <td><strong>$${p.cost}</strong></td>
                    <td style="text-decoration: none;">
                      <select class="form-control" style="padding: 4px 8px; min-height: 32px; font-size: 0.82rem;" onchange="app.updateProcedureStatus(${idx}, ${pIdx}, this.value)">
                        <option value="Proposed" ${p.status === 'Proposed' ? 'selected' : ''}>Proposed</option>
                        <option value="Awaiting Patient Approval" ${p.status === 'Awaiting Patient Approval' ? 'selected' : ''}>Awaiting Patient Approval</option>
                        <option value="Approved" ${p.status === 'Approved' ? 'selected' : ''}>Approved by Patient</option>
                        <option value="In Progress" ${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Deferred" ${p.status === 'Deferred' ? 'selected' : ''}>Deferred</option>
                        <option value="Cancelled" ${p.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                      </select>
                    </td>
                    <td style="text-decoration: none;">
                      <button class="btn btn-sm btn-outline" style="color: var(--error);" onclick="app.removePlanProcedure(${idx}, ${pIdx})">✕</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Add Procedure Directly on Plan -->
          <div style="background: #F8FAFC; border-top: 1px solid var(--border-color); padding: 12px; display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;">
            <div style="width: 100px;">
              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Tooth #</label>
              <input type="text" class="form-control" id="tp-add-tooth-${idx}" placeholder="e.g. 16" style="padding: 4px 8px; font-size: 0.85rem; min-height: 34px;">
            </div>
            <div style="flex: 1; min-width: 220px;">
              <label class="form-label" style="font-size: 0.75rem; margin-bottom: 2px;">Select Procedure</label>
              <select class="form-control" id="tp-add-proc-${idx}" style="padding: 4px 8px; font-size: 0.85rem; min-height: 34px;">
                ${this.store.procedures.map(p => `<option value="${p.code}">${p.code}: ${p.name} ($${p.price})</option>`).join('')}
              </select>
            </div>
            <button class="btn btn-primary btn-sm" style="min-height: 34px;" onclick="app.addProcedureDirectlyToPlan(${idx})">
              <span>➕</span> Add Procedure
            </button>
          </div>

          <div class="plan-totals-box">
            <div>Estimated Total: <strong style="font-size: 1.2rem; color: var(--text-main);">$${plan.estimatedTotal}</strong></div>
            <div>Approved Total: <strong style="font-size: 1.2rem; color: var(--success);">$${plan.procedures.filter(p => p.status === 'Approved' || p.status === 'Completed').reduce((acc, p) => acc + p.cost, 0)}</strong></div>
          </div>
        </div>
      `).join('')}
    `;
  }

  addProcedureDirectlyToPlan(planIdx) {
    if (!this.selectedPatient?.treatmentPlans?.[planIdx]) return;
    const tooth = document.getElementById(`tp-add-tooth-${planIdx}`)?.value.trim() || "Gen";
    const procCode = document.getElementById(`tp-add-proc-${planIdx}`)?.value;
    const proc = this.store.procedures.find(p => p.code === procCode);
    if (!proc) return;

    this.selectedPatient.treatmentPlans[planIdx].procedures.push({
      code: proc.code,
      tooth: tooth,
      name: proc.name,
      cost: proc.price,
      status: "Proposed"
    });

    this.selectedPatient.treatmentPlans[planIdx].estimatedTotal = this.selectedPatient.treatmentPlans[planIdx].procedures
      .filter(p => p.status !== "Cancelled")
      .reduce((acc, p) => acc + p.cost, 0);

    this.store.savePatient(this.selectedPatient);
    this.renderTreatmentPlansTab(document.getElementById("patient-tab-content-container"));
    this.showToast(`Added ${proc.name} to treatment plan!`, "success");
  }

  updateProcedureStatus(planIdx, procIdx, newStatus) {
    if (!this.selectedPatient?.treatmentPlans?.[planIdx]) return;
    this.selectedPatient.treatmentPlans[planIdx].procedures[procIdx].status = newStatus;
    this.selectedPatient.treatmentPlans[planIdx].estimatedTotal = this.selectedPatient.treatmentPlans[planIdx].procedures
      .filter(p => p.status !== "Cancelled")
      .reduce((acc, p) => acc + p.cost, 0);

    this.store.savePatient(this.selectedPatient);
    this.renderTreatmentPlansTab(document.getElementById("patient-tab-content-container"));
    this.showToast(`Procedure status updated to: ${newStatus}`, "success");
  }

  removePlanProcedure(planIdx, procIdx) {
    if (!this.selectedPatient?.treatmentPlans?.[planIdx]) return;
    this.selectedPatient.treatmentPlans[planIdx].procedures.splice(procIdx, 1);
    this.selectedPatient.treatmentPlans[planIdx].estimatedTotal = this.selectedPatient.treatmentPlans[planIdx].procedures
      .filter(p => p.status !== "Cancelled")
      .reduce((acc, p) => acc + p.cost, 0);

    this.store.savePatient(this.selectedPatient);
    this.renderTreatmentPlansTab(document.getElementById("patient-tab-content-container"));
    this.showToast("Procedure removed from plan.", "info");
  }

  openSelectiveBillingModal(planIdx = 0) {
    if (!this.selectedPatient) return;
    if (!this.hasPermission("invoices.create") && this.store.currentUser.role !== "admin") {
      this.showToast(`Access Denied: Current role (${this.store.currentUser.role}) cannot generate billing invoices. Switch to Cashier/Admin in top bar.`, "error");
      return;
    }

    const plan = this.selectedPatient.treatmentPlans?.[planIdx] || this.selectedPatient.treatmentPlans?.[0];
    if (!plan || plan.procedures.length === 0) {
      this.showToast("No procedures in active treatment plan to bill.", "warning");
      return;
    }

    const modal = document.getElementById("selective-billing-modal");
    const container = document.getElementById("selective-billing-items-container");
    if (!modal || !container) return;

    modal.setAttribute("data-plan-idx", planIdx);

    // Render checkboxes
    container.innerHTML = plan.procedures.map((p, pIdx) => {
      const isBillable = p.status !== "Cancelled";
      const isPreChecked = p.status === "Approved" || p.status === "Completed";
      return `
        <label style="display: flex; justify-content: space-between; align-items: center; padding: 8px 6px; border-bottom: 1px solid var(--border-color); cursor: pointer; ${p.status === 'Cancelled' ? 'opacity: 0.5;' : ''}">
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" class="billable-proc-chk" data-cost="${p.cost}" data-name="${p.name}" data-tooth="${p.tooth}" data-code="${p.code}" ${isPreChecked ? 'checked' : ''} ${!isBillable ? 'disabled' : ''} onchange="app.recalcSelectiveBillingTotal()">
            <div>
              <strong>${p.code} - Tooth #${p.tooth}</strong>: ${p.name}
              <span class="badge ${p.status === 'Completed' ? 'badge-green' : p.status === 'Approved' ? 'badge-teal' : 'badge-subtle'}" style="margin-left: 6px; font-size: 0.72rem;">${p.status}</span>
            </div>
          </div>
          <strong style="color: var(--text-main);">$${p.cost}</strong>
        </label>
      `;
    }).join('');

    document.getElementById("selective-bill-discount").value = "0";
    document.getElementById("selective-bill-discount-reason").value = "";
    this.recalcSelectiveBillingTotal();
    modal.classList.add("open");
  }

  recalcSelectiveBillingTotal() {
    const checkboxes = document.querySelectorAll(".billable-proc-chk:checked");
    let subtotal = 0;
    checkboxes.forEach(chk => {
      subtotal += parseFloat(chk.getAttribute("data-cost") || 0);
    });
    const discount = Math.max(0, parseFloat(document.getElementById("selective-bill-discount")?.value || 0));
    const netTotal = Math.max(0, subtotal - discount);

    const subEl = document.getElementById("selective-bill-subtotal");
    const discEl = document.getElementById("selective-bill-discount-display");
    const netEl = document.getElementById("selective-bill-net-total");

    if (subEl) subEl.textContent = `$${subtotal}`;
    if (discEl) discEl.textContent = `-$${discount}`;
    if (netEl) netEl.textContent = `$${netTotal}`;
  }

  confirmSelectiveInvoice() {
    if (!this.selectedPatient) return;
    const checkboxes = document.querySelectorAll(".billable-proc-chk:checked");
    if (checkboxes.length === 0) {
      this.showToast("Please select at least one procedure to bill.", "warning");
      return;
    }

    let items = [];
    let subtotal = 0;
    checkboxes.forEach(chk => {
      const cost = parseFloat(chk.getAttribute("data-cost") || 0);
      subtotal += cost;
      items.push({
        desc: `${chk.getAttribute("data-name")} (Tooth #${chk.getAttribute("data-tooth")})`,
        code: chk.getAttribute("data-code"),
        amount: cost
      });
    });

    const discount = Math.max(0, parseFloat(document.getElementById("selective-bill-discount")?.value || 0));
    const discountReason = document.getElementById("selective-bill-discount-reason")?.value.trim();
    const total = Math.max(0, subtotal - discount);

    const newInvoice = {
      id: "inv-" + Date.now().toString().slice(-4),
      date: new Date().toISOString().split("T")[0],
      items: items,
      subtotal: subtotal,
      discount: discount,
      discountReason: discountReason || "",
      total: total,
      paid: 0,
      balance: total,
      status: "Unpaid",
      method: "Pending Payment"
    };

    this.selectedPatient.billing = this.selectedPatient.billing || [];
    this.selectedPatient.billing.unshift(newInvoice);

    this.selectedPatient.auditLogs = this.selectedPatient.auditLogs || [];
    this.selectedPatient.auditLogs.unshift({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: this.store.currentUser.name,
      action: `Generated Selective Invoice #${newInvoice.id} for $${newInvoice.total} (${items.length} procedures)`
    });

    this.store.savePatient(this.selectedPatient);

    const modal = document.getElementById("selective-billing-modal");
    if (modal) modal.classList.remove("open");

    this.showToast(`Invoice #${newInvoice.id} generated for $${newInvoice.total}!`, "success");
    this.switchRecordTab("billing");
  }

  generateInvoiceFromPlan() {
    this.openSelectiveBillingModal();
  }

  // ==========================================================================
  // Screen 7: Orthodontics Module
  // ==========================================================================

  renderOrthoTab(container) {
    const pt = this.selectedPatient;
    const ortho = pt.orthodonticCase;

    if (!ortho) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">✨</div>
          <h4 style="font-size: 1.15rem; font-weight: 700;">No Orthodontic Treatment Active</h4>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">This patient has not commenced braces or clear aligners.</p>
          <button class="btn btn-primary" onclick="app.initiateOrthoCase()">
            <span>✨</span> Initiate Orthodontic Treatment Record
          </button>
        </div>
      `;
      return;
    }

    const isOverdue = ortho.nextFollowUpDate && new Date(ortho.nextFollowUpDate) < new Date("2026-10-23");

    container.innerHTML = `
      ${isOverdue ? `
        <div class="alert alert-warning" style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 12px 16px; border-radius: var(--radius-md);">
          <div>
            <strong style="font-size: 0.95rem;">⚠️ Orthodontic Recall Overdue!</strong>
            <div style="font-size: 0.85rem; margin-top: 2px;">
              Scheduled follow-up was <strong>${ortho.nextFollowUpDate}</strong>. Patient requires active archwire inspection and torque check.
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="app.navigateTo('appointments')">Schedule Recall</button>
        </div>
      ` : ''}

      <!-- Orthodontic Case Header Banner -->
      <div class="ortho-summary-banner">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-size: 1.35rem; font-weight: 800;">Orthodontic Management Console</h3>
            <p style="opacity: 0.9; font-size: 0.88rem;">Treating Specialist: Dr. Marcus Vance, Orthodontist | Case Started: ${ortho.startDate}</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${isOverdue ? `<span class="badge" style="background: #DC2626; color: #FFF; font-weight: 700;">RECALL OVERDUE</span>` : ''}
            <span class="badge" style="background: rgba(255,255,255,0.25); color: #FFF; font-size: 0.85rem;">
              ${ortho.compliance} Compliance (${ortho.progressPercent}% Complete)
            </span>
          </div>
        </div>

        <div class="ortho-banner-grid">
          <div class="ortho-metric">
            <h5>Appliance Type</h5>
            <p>${ortho.applianceType}</p>
          </div>
          <div class="ortho-metric">
            <h5>Malocclusion Classification</h5>
            <p>${ortho.classification}</p>
          </div>
          <div class="ortho-metric">
            <h5>Current Stage</h5>
            <p>${ortho.currentStage}</p>
          </div>
          <div class="ortho-metric">
            <h5>Next Follow-Up</h5>
            <p style="${isOverdue ? 'color: #FECACA; font-weight: 800;' : ''}">
              ${ortho.nextFollowUpDate || 'Not Scheduled'}
            </p>
          </div>
          <div class="ortho-metric">
            <h5>Upper Archwire</h5>
            <p>${ortho.upperArchwire || 'N/A'}</p>
          </div>
          <div class="ortho-metric">
            <h5>Lower Archwire</h5>
            <p>${ortho.lowerArchwire || 'N/A'}</p>
          </div>
          <div class="ortho-metric">
            <h5>Auxiliary / Elastics</h5>
            <p>${ortho.elastics || 'None'}</p>
          </div>
        </div>
      </div>

      <!-- Interactive Before & After Progress Comparison Slider -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <div class="card-title">
            <span>📐</span> Interactive Before vs. After Archform Comparison Slider
          </div>
          <span class="badge badge-teal">Drag Slider Horizontally to Track Alignment</span>
        </div>
        <div class="card-body" style="padding: 20px;">
          <div class="before-after-container" id="ortho-slider-box">
            <!-- After Image (Background) -->
            <div class="before-after-img-after">
              <svg viewBox="0 0 600 280" style="width: 100%; height: 100%; background: #0F172A;">
                <rect width="600" height="280" fill="#0F172A"/>
                <text x="500" y="36" fill="#10B981" font-size="13" font-weight="bold" text-anchor="middle">AFTER (CURRENT STAGE)</text>
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
                <text x="100" y="36" fill="#EF4444" font-size="13" font-weight="bold" text-anchor="middle">BEFORE (INITIAL PRESENTATION)</text>
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
              <div class="before-after-handle">⇄</div>
            </div>

            <!-- Slider input control -->
            <input type="range" class="before-after-slider-input" min="0" max="100" value="50" aria-label="Before after progress slider" oninput="app.updateBeforeAfter(this.value)">
          </div>
          <div style="text-align: center; margin-top: 10px; font-size: 0.85rem; color: var(--text-secondary);">
            Drag slider left / right to compare Day 1 Crowding vs. Month ${ortho.progressPercent > 70 ? '12' : '7'} Alignment
          </div>
        </div>
      </div>

      <!-- Before & After Progress Photo High-Res Cards -->
      <div class="ortho-photo-compare-box">
        <div class="card-header">
          <div class="card-title">
            <span>📷</span> Photographic Progress Stages & Intraoral Records
          </div>
          <span class="badge badge-purple">High Resolution Intraoral Records</span>
        </div>

        <div class="compare-grid">
          <div class="photo-stage-card">
            <svg viewBox="0 0 200 150" style="background: #1E293B;">
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
            <div class="photo-caption">
              <strong>Initial Presentation (Day 1)</strong>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">Severe anterior crowding, 6mm overjet</div>
            </div>
          </div>

          <div class="photo-stage-card">
            <svg viewBox="0 0 200 150" style="background: #1E293B;">
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
            <div class="photo-caption">
              <strong>Month 7 Alignment</strong>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">Arch expanding, rotations resolving</div>
            </div>
          </div>

          <div class="photo-stage-card">
            <svg viewBox="0 0 200 150" style="background: #1E293B;">
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
            <div class="photo-caption">
              <strong>Current Stage</strong>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">Ideal archform, coordinated midline</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chronological Adjustment Timeline -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>📝</span> Orthodontic Adjustment Visit History</div>
          <button class="btn btn-primary btn-sm" onclick="app.openOrthoAdjustmentModal()">
            <span>➕</span> Record Adjustment Visit
          </button>
        </div>

        <div class="timeline-list">
          ${(ortho.adjustments || []).map(adj => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="font-size: 0.95rem; color: var(--text-main);">${adj.date}</strong>
                <span class="badge badge-teal">Verified Adjustment</span>
              </div>
              <div style="font-size: 0.88rem; color: var(--text-secondary); background: #F8FAFC; padding: 10px 14px; border-radius: var(--radius-md);">
                ${adj.notes}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  updateBeforeAfter(val) {
    const beforeImg = document.getElementById("ortho-before-img");
    const divider = document.getElementById("ortho-slider-divider");
    if (beforeImg) {
      beforeImg.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
    }
    if (divider) {
      divider.style.left = `${val}%`;
    }
  }

  initiateOrthoCase() {
    if (!this.selectedPatient) return;
    this.selectedPatient.orthodonticCase = {
      applianceType: "Ceramic Damon Self-Ligating Brackets",
      classification: "Angle Class I Crowding",
      startDate: new Date().toISOString().split("T")[0],
      expectedDurationMonths: 18,
      currentStage: "Stage 1 — Initial Alignment & Leveling",
      upperArchwire: "0.014 CuNiTi",
      lowerArchwire: "0.014 CuNiTi",
      elastics: "None currently",
      compliance: "Good",
      progressPercent: 15,
      adjustments: [
        { date: new Date().toISOString().split("T")[0], notes: "Initial orthodontic bonding completed. Placed 0.014 NiTi archwires." }
      ],
      photos: []
    };
    this.store.savePatient(this.selectedPatient);
    this.showToast("Orthodontic case initiated!", "success");
    this.renderOrthoTab(document.getElementById("patient-tab-content-container"));
  }

  openOrthoAdjustmentModal() {
    const modal = document.getElementById("ortho-adjustment-modal");
    if (modal) modal.classList.add("open");
  }

  saveOrthoAdjustment() {
    if (!this.selectedPatient?.orthodonticCase) return;
    const wireUpper = document.getElementById("ortho-adj-wire-upper").value.trim();
    const wireLower = document.getElementById("ortho-adj-wire-lower").value.trim();
    const stage = document.getElementById("ortho-adj-stage").value;
    const notes = document.getElementById("ortho-adj-notes").value.trim();

    const newAdj = {
      date: new Date().toISOString().split("T")[0],
      notes: `${stage}: Placed Upper ${wireUpper || 'Same'}, Lower ${wireLower || 'Same'}. ${notes}`
    };

    this.selectedPatient.orthodonticCase.adjustments = this.selectedPatient.orthodonticCase.adjustments || [];
    this.selectedPatient.orthodonticCase.adjustments.unshift(newAdj);
    if (wireUpper) this.selectedPatient.orthodonticCase.upperArchwire = wireUpper;
    if (wireLower) this.selectedPatient.orthodonticCase.lowerArchwire = wireLower;
    this.selectedPatient.orthodonticCase.currentStage = stage;

    this.store.savePatient(this.selectedPatient);

    const modal = document.getElementById("ortho-adjustment-modal");
    if (modal) modal.classList.remove("open");

    this.showToast("Recorded orthodontic adjustment visit.", "success");
    this.renderOrthoTab(document.getElementById("patient-tab-content-container"));
  }

  // ==========================================================================
  // Screen 8: Prescriptions Builder Tab
  // ==========================================================================

  renderPrescriptionsTab(container) {
    const pt = this.selectedPatient;
    const rxs = pt.prescriptions || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">Prescriptions & Dental Pharmacotherapy</h3>
        <button class="btn btn-primary btn-sm" onclick="app.openNewPrescriptionModal()">
          <span>💊</span> New Prescription
        </button>
      </div>

      ${rxs.length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary); margin-bottom: 12px;">No prescriptions on file for this patient.</p>
          <button class="btn btn-primary" onclick="app.openNewPrescriptionModal()">Create Prescription</button>
        </div>
      ` : rxs.map(rx => `
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header">
            <div>
              <div class="card-title">Prescription #${rx.id}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">Date: ${rx.date} | Prescriber: ${rx.doctor}</div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="app.printPrescription('${rx.id}')">
              <span>🖨️</span> Print Official Rx
            </button>
          </div>

          <div class="rx-items-list">
            ${rx.items.map(item => `
              <div class="rx-item-card">
                <div>
                  <strong style="font-size: 1rem; color: var(--text-main);">${item.drug} ${item.strength} (${item.form})</strong>
                  <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">
                    Directions: ${item.dose} • Duration: ${item.duration} • Dispense: Qty ${item.qty}
                  </div>
                  <div style="font-size: 0.78rem; color: var(--primary-teal); font-style: italic; margin-top: 2px;">
                    Instructions: ${item.instructions}
                  </div>
                </div>
                <span class="badge badge-teal">Active</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    `;
  }

  openNewPrescriptionModal() {
    const modal = document.getElementById("new-prescription-modal");
    if (!modal) return;
    modal.classList.add("open");

    // Check allergy conflict warning
    const alertBox = document.getElementById("modal-rx-allergy-alert");
    const ptAllergies = this.selectedPatient?.medicalInfo?.allergies || [];
    if (ptAllergies.length > 0 && alertBox) {
      alertBox.style.display = "block";
      alertBox.innerHTML = `
        <span>⚠️</span>
        <div><strong>CRITICAL ALLERGY ALERT:</strong> Patient has documented allergy to: <strong>${ptAllergies.map(a => a.name).join(', ')}</strong>. Verify drug selection before prescribing!</div>
      `;
    } else if (alertBox) {
      alertBox.style.display = "none";
    }

    // Populate formulary dropdown
    const select = document.getElementById("rx-formulary-select");
    if (select) {
      select.innerHTML = `
        <option value="">-- Select from Dental Drug Formulary --</option>
        ${MEDICATION_FORMULARY.map(m => `
          <option value="${m.id}">${m.name} (${m.strengths[0]}) - ${m.forms[0]}</option>
        `).join('')}
      `;
    }
  }

  onFormularySelected(medId) {
    const med = MEDICATION_FORMULARY.find(m => m.id === medId);
    if (!med) return;

    // Check if patient allergic to this drug
    const ptAllergies = (this.selectedPatient?.medicalInfo?.allergies || []).map(a => a.name.toLowerCase());
    const isContraindicated = med.contraindicationAllergies.some(c => ptAllergies.some(pa => pa.includes(c.toLowerCase())));

    if (isContraindicated) {
      alert(`⚠️ CONTRAINDICATION DETECTED!\nPatient ${this.selectedPatient.firstName} has a documented allergy to ${med.name}.\nPlease choose a safe alternative (e.g., Clindamycin for Penicillin-allergic patients).`);
    }

    document.getElementById("rx-drug-name").value = med.name;
    document.getElementById("rx-strength").value = med.strengths[0];
    document.getElementById("rx-dosage").value = med.standardDose;
    document.getElementById("rx-duration").value = med.standardDuration;
    document.getElementById("rx-instructions").value = med.instructions;
    document.getElementById("rx-quantity").value = "15";
  }

  savePrescription() {
    if (!this.selectedPatient) return;
    const drug = document.getElementById("rx-drug-name").value.trim();
    const strength = document.getElementById("rx-strength").value.trim();
    const dose = document.getElementById("rx-dosage").value.trim();
    const duration = document.getElementById("rx-duration").value.trim();
    const instructions = document.getElementById("rx-instructions").value.trim();
    const qty = parseInt(document.getElementById("rx-quantity").value, 10) || 10;

    if (!drug) {
      this.showToast("Please enter or select a medication.", "warning");
      return;
    }

    const newRx = {
      id: "rx-" + Date.now().toString().slice(-4),
      date: new Date().toISOString().split("T")[0],
      doctor: this.store.currentUser.name,
      items: [
        {
          drug: drug,
          strength: strength,
          form: "Capsule/Tablet",
          dose: dose,
          duration: duration,
          qty: qty,
          instructions: instructions
        }
      ]
    };

    this.selectedPatient.prescriptions = this.selectedPatient.prescriptions || [];
    this.selectedPatient.prescriptions.unshift(newRx);
    this.store.savePatient(this.selectedPatient);

    const modal = document.getElementById("new-prescription-modal");
    if (modal) modal.classList.remove("open");

    this.showToast(`Prescription #${newRx.id} created!`, "success");
    this.renderPrescriptionsTab(document.getElementById("patient-tab-content-container"));
  }

  // ==========================================================================
  // Screen 9: Billing & Invoices Tab
  // ==========================================================================

  renderBillingTab(container) {
    const pt = this.selectedPatient;
    const invoices = pt.billing || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">Invoices & Financial Ledger</h3>
        <button class="btn btn-primary btn-sm" onclick="app.openSelectiveBillingModal()">
          <span>➕</span> Create New Invoice
        </button>
      </div>

      ${invoices.length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary); margin-bottom: 12px;">No invoices generated for this patient yet.</p>
          <button class="btn btn-primary" onclick="app.openSelectiveBillingModal()">Bill Treatment Plan</button>
        </div>
      ` : invoices.map(inv => `
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header">
            <div>
              <div class="card-title">Invoice #${inv.id}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">Date: ${inv.date} | Payment Terms: Immediate</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="badge ${inv.status === 'Paid' ? 'badge-green' : inv.status === 'Partial' ? 'badge-amber' : 'badge-red'}">
                ${inv.status}
              </span>
              <button class="btn btn-sm btn-outline" onclick="app.printInvoiceReceipt('${inv.id}')">
                <span>🖨️</span> Print Receipt
              </button>
              ${inv.balance > 0 ? `
                <button class="btn btn-sm btn-success" onclick="app.openRecordPaymentModal('${inv.id}')">
                  <span>💵</span> Collect Payment
                </button>
              ` : ''}
              ${inv.paid > 0 ? `
                <button class="btn btn-sm btn-outline" style="color: var(--error);" onclick="app.openRefundModal('${inv.id}')">
                  <span>↩️</span> Refund
                </button>
              ` : ''}
            </div>
          </div>

          <div class="table-responsive">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>Service / Item Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items.map(item => `
                  <tr>
                    <td>${item.desc}</td>
                    <td style="text-align: right;">$${item.amount}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="plan-totals-box" style="justify-content: flex-end; gap: 16px; flex-wrap: wrap;">
            <div>Subtotal: <strong>$${inv.subtotal || inv.total}</strong></div>
            ${inv.discount ? `<div>Discount: <strong style="color: var(--success);">-$${inv.discount}</strong></div>` : ''}
            <div>Total: <strong>$${inv.total}</strong></div>
            <div>Paid: <strong style="color: var(--success);">$${inv.paid}</strong></div>
            <div>Balance Due: <strong style="color: ${inv.balance > 0 ? 'var(--error)' : 'var(--success)'}; font-size: 1.15rem;">$${inv.balance}</strong></div>
          </div>
        </div>
      `).join('')}
    `;
  }

  openRecordPaymentModal(invoiceId) {
    if (!this.hasPermission("payments.record") && this.store.currentUser.role !== "admin" && this.store.currentUser.role !== "cashier") {
      this.showToast(`Access Denied: Role (${this.store.currentUser.role}) is not authorized to collect payments. Switch to Cashier/Admin in top bar.`, "error");
      return;
    }

    const inv = this.selectedPatient?.billing?.find(b => b.id === invoiceId);
    if (!inv) return;

    const modal = document.getElementById("record-payment-modal");
    if (!modal) return;

    modal.classList.add("open");
    document.getElementById("modal-pay-inv-id").textContent = inv.id;
    document.getElementById("modal-pay-balance").textContent = `$${inv.balance}`;
    document.getElementById("pay-amount-input").value = inv.balance;
    modal.setAttribute("data-invoice-id", invoiceId);
  }

  submitPayment() {
    const modal = document.getElementById("record-payment-modal");
    const invId = modal.getAttribute("data-invoice-id");
    const inv = this.selectedPatient?.billing?.find(b => b.id === invId);
    if (!inv) return;

    const payAmount = parseFloat(document.getElementById("pay-amount-input").value) || 0;
    const payMethod = document.getElementById("pay-method-select").value;
    const refNum = document.getElementById("pay-ref-input").value.trim();

    if (payAmount <= 0) {
      this.showToast("Payment amount must be greater than zero.", "warning");
      return;
    }

    inv.paid = (inv.paid || 0) + payAmount;
    inv.balance = Math.max(0, inv.total - inv.paid);
    inv.status = inv.balance === 0 ? "Paid" : "Partial";
    inv.method = payMethod;

    this.selectedPatient.auditLogs = this.selectedPatient.auditLogs || [];
    this.selectedPatient.auditLogs.unshift({
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: this.store.currentUser.name,
      action: `Recorded Payment of $${payAmount} via ${payMethod} (Ref: ${refNum || 'N/A'})`
    });

    this.store.savePatient(this.selectedPatient);
    modal.classList.remove("open");

    this.showToast(`Payment of $${payAmount} recorded successfully!`, "success");
    this.renderBillingTab(document.getElementById("patient-tab-content-container"));
  }

  openRefundModal(invoiceId, patientId = null) {
    if (!this.hasPermission("billing.manage") && this.store.currentUser.role !== "admin" && this.store.currentUser.role !== "cashier") {
      this.showToast(`Access Denied: Current role (${this.store.currentUser.role}) cannot issue refunds. Switch to Cashier/Admin.`, "error");
      return;
    }
    const pt = patientId ? this.store.getPatient(patientId) : this.selectedPatient;
    if (!pt) return;
    const inv = pt.billing?.find(b => b.id === invoiceId);
    if (!inv || !inv.paid) {
      this.showToast("No payments recorded on this invoice to refund.", "warning");
      return;
    }

    const modal = document.getElementById("refund-modal");
    if (!modal) return;

    modal.setAttribute("data-invoice-id", invoiceId);
    modal.setAttribute("data-patient-id", pt.id);
    document.getElementById("refund-modal-inv-id").textContent = inv.id;
    document.getElementById("refund-modal-paid").textContent = `$${inv.paid}`;
    document.getElementById("refund-amount-input").value = inv.paid;
    modal.classList.add("open");
  }

  confirmRefund() {
    const modal = document.getElementById("refund-modal");
    const invId = modal.getAttribute("data-invoice-id");
    const ptId = modal.getAttribute("data-patient-id");
    const amount = parseFloat(document.getElementById("refund-amount-input").value) || 0;
    const reason = document.getElementById("refund-reason-select").value;

    if (amount <= 0) {
      this.showToast("Refund amount must be greater than zero.", "warning");
      return;
    }

    const updatedInv = this.store.recordRefund(ptId, invId, amount, reason);
    if (!updatedInv) {
      this.showToast("Failed to process refund.", "error");
      return;
    }

    modal.classList.remove("open");
    this.showToast(`Refund of $${amount} processed successfully.`, "success");

    if (this.currentScreen === "billing") {
      this.renderBilling(document.getElementById("page-main-workspace"));
    } else if (this.selectedPatient && this.selectedPatient.id === ptId) {
      this.renderBillingTab(document.getElementById("patient-tab-content-container"));
    }
  }

  // ==========================================================================
  // Screen 10: Appointments Management
  // ==========================================================================

  setAppointmentTimeFilter(filter) {
    this.currentAptFilter = filter;
    this.renderAppointments(document.getElementById("page-main-workspace"));
  }

  setAppointmentView(view) {
    this.currentAptView = view;
    this.renderAppointments(document.getElementById("page-main-workspace"));
  }

  renderAppointments(container) {
    let apts = this.store.appointments;

    // Filter by time
    if (this.currentAptFilter === "today") {
      apts = apts.filter(a => a.date === "2026-10-23");
    } else if (this.currentAptFilter === "week") {
      apts = apts.filter(a => a.date >= "2026-10-19" && a.date <= "2026-10-25");
    }

    container.innerHTML = `
      <div class="calendar-view-header">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 700;">Master Appointment Schedule</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Filter by clinician, chair operatory, or switch between List, Operatory Chairs, and Week Grid</p>
        </div>

        <div class="calendar-filters" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <div style="display: flex; gap: 4px; background: #E2E8F0; padding: 3px; border-radius: var(--radius-sm);">
            <button class="btn btn-sm ${this.currentAptFilter === 'today' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentTimeFilter('today')">Today</button>
            <button class="btn btn-sm ${this.currentAptFilter === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentTimeFilter('week')">This Week</button>
            <button class="btn btn-sm ${this.currentAptFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentTimeFilter('all')">All Upcoming</button>
          </div>

          <div style="display: flex; gap: 4px; background: #E2E8F0; padding: 3px; border-radius: var(--radius-sm);">
            <button class="btn btn-sm ${this.currentAptView === 'list' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentView('list')">📋 List</button>
            <button class="btn btn-sm ${this.currentAptView === 'chairs' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentView('chairs')">🪑 Chairs (Day)</button>
            <button class="btn btn-sm ${this.currentAptView === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentView('week')">📅 Week Grid</button>
          </div>

          <button class="btn btn-primary btn-sm" onclick="app.openBookAppointmentModal()">
            <span>➕</span> New Appointment
          </button>
        </div>
      </div>

      ${this.currentAptView === 'chairs' ? this.renderOperatoryChairsView(apts) :
        this.currentAptView === 'week' ? this.renderWeekGridView() :
        this.renderAppointmentsListView(apts)
      }
    `;
  }

  renderAppointmentsListView(apts) {
    if (apts.length === 0) {
      return `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary); margin-bottom: 12px;">No appointments found for the selected time filter.</p>
          <button class="btn btn-primary" onclick="app.openBookAppointmentModal()">Book New Appointment</button>
        </div>
      `;
    }

    return `
      <div class="table-responsive">
        <table class="appointments-list-table">
          <thead>
            <tr>
              <th>Time / Slot</th>
              <th>Patient</th>
              <th>Service / Treatment</th>
              <th>Clinician</th>
              <th>Chair / Operatory</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${apts.map(apt => {
              const pt = this.store.getPatient(apt.patientId);
              const doc = STAFF_USERS.find(u => u.id === apt.doctorId);
              return `
                <tr>
                  <td>
                    <strong>${apt.time}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${apt.date} (${apt.duration}m)</span>
                  </td>
                  <td>
                    <strong>${pt ? `${pt.firstName} ${pt.lastName}` : 'Walk-in'}</strong><br>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${pt?.phone || ''}</span>
                  </td>
                  <td>${apt.service}</td>
                  <td>${doc ? doc.name : 'Unassigned'}</td>
                  <td><span class="badge badge-subtle">${apt.chairId.toUpperCase()}</span></td>
                  <td>
                    <span class="badge ${
                      apt.status === 'Completed' ? 'badge-green' :
                      apt.status === 'In Consultation' ? 'badge-purple' :
                      apt.status === 'Waiting' || apt.status === 'Checked In' ? 'badge-amber' :
                      apt.status === 'Cancelled' || apt.status === 'No-Show' ? 'badge-red' :
                      'badge-blue'
                    }">
                      ${apt.status}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                      ${apt.status !== 'Completed' && apt.status !== 'In Consultation' && apt.status !== 'Cancelled' && apt.status !== 'No-Show' ? `
                        <button class="btn btn-sm btn-primary" onclick="app.checkInAppointment('${apt.id}')">
                          🎟️ Check In
                        </button>
                      ` : `
                        <button class="btn btn-sm btn-outline" onclick="app.selectAndOpenPatient('${apt.patientId}')">
                          View
                        </button>
                      `}
                      ${apt.status !== 'Cancelled' && apt.status !== 'Completed' ? `
                        <button class="btn btn-sm btn-outline" title="Reschedule" onclick="app.openRescheduleModal('${apt.id}')">
                          📅
                        </button>
                        <button class="btn btn-sm btn-outline" style="color: var(--error);" title="Cancel Appointment" onclick="app.cancelAppointment('${apt.id}')">
                          ✕
                        </button>
                        <button class="btn btn-sm btn-outline" style="color: var(--warning);" title="Mark No-Show" onclick="app.markAppointmentNoShow('${apt.id}')">
                          ⚠️
                        </button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderOperatoryChairsView(apts) {
    const chairs = [
      { id: "c1", name: "Chair 1 (General Operatory)" },
      { id: "c2", name: "Chair 2 (Restorative Suite)" },
      { id: "c3", name: "Chair 3 (Surgical & Implant)" },
      { id: "c4", name: "Chair 4 (Orthodontic Bay)" }
    ];

    return `
      <div class="operatory-grid">
        ${chairs.map(chair => {
          const chairApts = apts.filter(a => a.chairId.toLowerCase() === chair.id.toLowerCase());
          return `
            <div class="operatory-column">
              <div class="operatory-header">
                <div>
                  <strong style="color: var(--text-main); font-size: 0.95rem;">${chair.name}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-secondary);">${chairApts.length} Patient(s) Scheduled</div>
                </div>
                <span class="badge badge-teal">${chair.id.toUpperCase()}</span>
              </div>

              ${chairApts.length === 0 ? `
                <div style="text-align: center; color: var(--text-muted); padding: 40px 10px; font-size: 0.85rem;">
                  Operatory available / unscheduled.
                </div>
              ` : chairApts.map(apt => {
                const pt = this.store.getPatient(apt.patientId);
                const doc = STAFF_USERS.find(u => u.id === apt.doctorId);
                return `
                  <div class="operatory-slot-card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <strong style="color: var(--primary-teal);">${apt.time}</strong>
                      <span class="badge ${apt.status === 'Completed' ? 'badge-green' : apt.status === 'Waiting' ? 'badge-amber' : 'badge-blue'}" style="font-size: 0.7rem;">${apt.status}</span>
                    </div>
                    <div style="font-weight: 700; font-size: 0.9rem;">${pt ? `${pt.firstName} ${pt.lastName}` : 'Walk-in'}</div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${apt.service}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${doc ? doc.name : ''}</div>
                    
                    <div style="display: flex; gap: 4px; margin-top: 8px;">
                      ${apt.status !== 'Completed' && apt.status !== 'In Consultation' ? `
                        <button class="btn btn-sm btn-primary" style="flex: 1; padding: 2px 6px; font-size: 0.75rem;" onclick="app.checkInAppointment('${apt.id}')">Check In</button>
                      ` : ''}
                      <button class="btn btn-sm btn-outline" style="padding: 2px 6px; font-size: 0.75rem;" onclick="app.openRescheduleModal('${apt.id}')">Reschedule</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderWeekGridView() {
    const days = [
      { name: "Monday", date: "2026-10-19" },
      { name: "Tuesday", date: "2026-10-20" },
      { name: "Wednesday", date: "2026-10-21" },
      { name: "Thursday", date: "2026-10-22" },
      { name: "Friday", date: "2026-10-23", isToday: true },
      { name: "Saturday", date: "2026-10-24" },
      { name: "Sunday", date: "2026-10-25" }
    ];

    return `
      <div class="week-grid">
        ${days.map(day => {
          const dayApts = this.store.appointments.filter(a => a.date === day.date);
          return `
            <div class="week-day-col" style="${day.isToday ? 'border: 2px solid var(--primary-teal); background: #F0FDFA;' : ''}">
              <div class="week-day-header">
                <strong>${day.name}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${day.date} ${day.isToday ? '• TODAY' : ''}</div>
                <span class="badge ${dayApts.length > 0 ? 'badge-teal' : 'badge-subtle'}" style="margin-top: 4px; font-size: 0.7rem;">${dayApts.length} appts</span>
              </div>

              ${dayApts.map(apt => {
                const pt = this.store.getPatient(apt.patientId);
                return `
                  <div style="background: #FFFFFF; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; margin-bottom: 6px; font-size: 0.8rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--primary-teal);">
                      <span>${apt.time}</span>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">${apt.chairId.toUpperCase()}</span>
                    </div>
                    <div style="font-weight: 600; margin-top: 2px;">${pt ? `${pt.firstName} ${pt.lastName}` : 'Walk-in'}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary);">${apt.service}</div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  checkInAppointment(aptId) {
    const apt = this.store.appointments.find(a => a.id === aptId);
    if (!apt) return;

    apt.status = "Waiting";
    const pt = this.store.getPatient(apt.patientId);

    const token = this.store.addQueueItem({
      patientId: apt.patientId,
      patientName: pt ? `${pt.firstName} ${pt.lastName}` : "Walk-in",
      mrn: pt?.mrn || "N/A",
      type: "Appointment",
      service: apt.service,
      doctorId: apt.doctorId,
      doctorName: STAFF_USERS.find(u => u.id === apt.doctorId)?.name || "Doctor",
      chairName: apt.chairId.toUpperCase(),
      status: "Waiting"
    });

    if (token.alreadyActive) {
      this.showToast(`Notice: Patient already checked in with Token ${token.token} (${token.status})`, "warning");
    } else {
      this.showToast(`Patient Checked In! Issued Token: ${token.token}`, "success");
    }
    this.navigateTo("queue");
  }

  openRescheduleModal(aptId) {
    const apt = this.store.appointments.find(a => a.id === aptId);
    if (!apt) return;
    const pt = this.store.getPatient(apt.patientId);

    const modal = document.getElementById("reschedule-appointment-modal");
    if (!modal) return;

    modal.setAttribute("data-apt-id", aptId);
    document.getElementById("reschedule-modal-patient-name").textContent = pt ? `${pt.firstName} ${pt.lastName} (${pt.mrn})` : "Walk-in";
    document.getElementById("reschedule-modal-current-slot").textContent = `Current: ${apt.date} at ${apt.time} • ${apt.chairId.toUpperCase()}`;
    document.getElementById("reschedule-new-date").value = apt.date;
    document.getElementById("reschedule-new-time").value = apt.time;
    document.getElementById("reschedule-new-chair").value = apt.chairId;
    document.getElementById("reschedule-reason").value = "";

    modal.classList.add("open");
  }

  confirmReschedule() {
    const modal = document.getElementById("reschedule-appointment-modal");
    const aptId = modal.getAttribute("data-apt-id");
    const newDate = document.getElementById("reschedule-new-date").value;
    const newTime = document.getElementById("reschedule-new-time").value;
    const newChair = document.getElementById("reschedule-new-chair").value;
    const reason = document.getElementById("reschedule-reason").value.trim();

    if (!newDate || !newTime) {
      this.showToast("Please provide valid date and time.", "warning");
      return;
    }

    const apt = this.store.rescheduleAppointment(aptId, newDate, newTime, newChair, reason);
    if (apt) {
      modal.classList.remove("open");
      this.showToast(`Appointment rescheduled to ${newDate} at ${newTime}!`, "success");
      this.renderAppointments(document.getElementById("page-main-workspace"));
    }
  }

  cancelAppointment(aptId) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    this.store.cancelAppointment(aptId, "Cancelled by clinic staff");
    this.showToast("Appointment status updated to: Cancelled", "info");
    this.renderAppointments(document.getElementById("page-main-workspace"));
  }

  markAppointmentNoShow(aptId) {
    this.store.markAppointmentNoShow(aptId);
    this.showToast("Appointment marked as No-Show.", "warning");
    this.renderAppointments(document.getElementById("page-main-workspace"));
  }

  openBookAppointmentModal(preselectedPatientId = null) {
    const modal = document.getElementById("new-appointment-modal");
    if (!modal) return;

    const patientSelect = document.getElementById("apt-patient-select");
    if (patientSelect) {
      patientSelect.innerHTML = this.store.patients.map(p => `
        <option value="${p.id}" ${p.id === preselectedPatientId ? 'selected' : ''}>
          ${p.firstName} ${p.lastName} (${p.mrn}) - ${p.phone}
        </option>
      `).join('');
    }

    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("apt-date");
    if (dateInput) dateInput.value = today;

    modal.classList.add("open");
  }

  saveAppointment() {
    const ptId = document.getElementById("apt-patient-select").value;
    const docId = document.getElementById("apt-doctor-select").value;
    const chairId = document.getElementById("apt-chair-select").value;
    const date = document.getElementById("apt-date").value;
    const time = document.getElementById("apt-time").value;
    const service = document.getElementById("apt-service").value;
    const notes = document.getElementById("apt-notes").value.trim();

    // Conflict detection simulation
    const conflict = this.store.appointments.find(a => a.date === date && a.time === time && (a.chairId === chairId || a.doctorId === docId));
    if (conflict) {
      if (!confirm("⚠️ SCHEDULING CONFLICT WARNING:\nAnother patient is already booked for this clinician or operatory chair at this time slot.\n\nDo you want to override and double-book?")) {
        return;
      }
    }

    const newApt = {
      id: "apt-" + Date.now().toString().slice(-4),
      patientId: ptId,
      doctorId: docId,
      chairId: chairId,
      date: date,
      time: time,
      duration: 30,
      service: service,
      status: "Confirmed",
      notes: notes
    };

    this.store.appointments.unshift(newApt);
    this.store.saveState();

    const modal = document.getElementById("new-appointment-modal");
    if (modal) modal.classList.remove("open");

    this.showToast(`Appointment booked for ${date} at ${time}!`, "success");
    this.renderAppointments(document.getElementById("page-main-workspace"));
  }

  // ==========================================================================
  // Screen 11: Queue & Token Management
  // ==========================================================================

  renderQueueBoard(container) {
    const waiting = this.store.queue.filter(q => q.status === "Waiting");
    const inConsult = this.store.queue.filter(q => q.status === "In Consultation");
    const completed = this.store.queue.filter(q => q.status === "Completed" || q.status === "No-Show");

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700;">Live Waiting Room Board</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Digital queue display with thermal token printing and sound chimes</p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="app.openQuickTokenModal()">
            <span>🎟️</span> Issue Walk-In Token
          </button>
          <button class="btn btn-secondary" onclick="app.callNextPatient()">
            <span>📢</span> Call Next Patient
          </button>
        </div>
      </div>

      <div class="queue-board-columns">
        <!-- Column 1: Waiting -->
        <div class="queue-column">
          <div class="queue-column-header">
            <h4>⏳ Waiting (${waiting.length})</h4>
            <span class="badge badge-amber">In Reception</span>
          </div>
          <div class="queue-cards-list">
            ${waiting.length === 0 ? `<p style="text-align: center; color: var(--text-muted); padding: 30px;">No patients waiting.</p>` :
              waiting.map(item => `
                <div class="token-card">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="token-number-badge">${item.token}</div>
                    <span class="badge badge-subtle">Wait ~${item.waitTimeMinutes}m</span>
                  </div>
                  <strong style="font-size: 1.05rem; display: block; margin: 6px 0 2px;">${item.patientName}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.service}</div>
                  <div style="font-size: 0.78rem; color: var(--primary-teal); margin-top: 4px;">Assigned: ${item.doctorName}</div>

                  <div style="display: flex; gap: 4px; margin-top: 12px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.startConsultation('${item.token}')">
                      Call In →
                    </button>
                    <button class="btn btn-sm btn-outline" title="Transfer Clinician / Chair" onclick="app.openTransferModal('${item.token}')">
                      🔄
                    </button>
                    <button class="btn btn-sm btn-outline" style="color: var(--warning);" title="Mark No-Show" onclick="app.markQueueNoShow('${item.token}')">
                      ⚠️
                    </button>
                    <button class="btn btn-sm btn-outline" title="Print Slip" onclick="app.printThermalSlip('${item.token}')">
                      🖨️
                    </button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- Column 2: In Consultation -->
        <div class="queue-column">
          <div class="queue-column-header">
            <h4>🦷 In Consultation (${inConsult.length})</h4>
            <span class="badge badge-purple">In Dental Chair</span>
          </div>
          <div class="queue-cards-list">
            ${inConsult.length === 0 ? `<p style="text-align: center; color: var(--text-muted); padding: 30px;">No active chair consultations.</p>` :
              inConsult.map(item => `
                <div class="token-card" style="border-color: var(--purple);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="token-number-badge" style="color: var(--purple);">${item.token}</div>
                    <span class="badge badge-purple">${item.chairName || 'Chair 1'}</span>
                  </div>
                  <strong style="font-size: 1.05rem; display: block; margin: 6px 0 2px;">${item.patientName}</strong>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">${item.service}</div>
                  <div style="font-size: 0.78rem; color: var(--purple); margin-top: 4px;">Doctor: ${item.doctorName}</div>

                  <div style="display: flex; gap: 4px; margin-top: 12px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.openPatientRecordByMrn('${item.mrn}')">
                      Open Chart
                    </button>
                    <button class="btn btn-sm btn-outline" title="Transfer Clinician / Chair" onclick="app.openTransferModal('${item.token}')">
                      🔄
                    </button>
                    <button class="btn btn-sm btn-success" onclick="app.completeConsultation('${item.token}')">
                      ✓ Done
                    </button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- Column 3: Completed Today -->
        <div class="queue-column">
          <div class="queue-column-header">
            <h4>✅ Completed / No-Show (${completed.length})</h4>
            <span class="badge badge-green">Discharged</span>
          </div>
          <div class="queue-cards-list">
            ${completed.length === 0 ? `<p style="text-align: center; color: var(--text-muted); padding: 30px;">No completed consultations yet today.</p>` :
              completed.map(item => `
                <div class="token-card" style="opacity: ${item.status === 'No-Show' ? '0.7' : '0.9'};">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: var(--text-muted);">${item.token}</strong>
                    <span class="badge ${item.status === 'No-Show' ? 'badge-red' : 'badge-green'}">${item.status === 'No-Show' ? 'No-Show' : 'Finished'}</span>
                  </div>
                  <strong style="display: block; margin-top: 4px;">${item.patientName}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">${item.service}</div>
                  <div style="display: flex; gap: 4px; margin-top: 8px;">
                    <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="app.openPatientRecordByMrn('${item.mrn}')">
                      Review Record
                    </button>
                    <button class="btn btn-sm btn-outline" title="Re-queue Patient" onclick="app.requeueItem('${item.token}')">
                      ↩️ Re-Queue
                    </button>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  callNextPatient() {
    const next = this.store.queue.find(q => q.status === "Waiting");
    if (!next) {
      this.showToast("No more patients currently waiting in reception queue.", "info");
      return;
    }
    this.startConsultation(next.token);
  }

  startConsultation(tokenNum) {
    const item = this.store.queue.find(q => q.token === tokenNum);
    if (!item) return;

    item.status = "In Consultation";
    item.chairName = "Chair 1";
    this.store.saveState();

    this.showToast(`📢 Calling Token ${item.token}: ${item.patientName} to ${item.chairName}`, "success");
    this.renderQueueBoard(document.getElementById("page-main-workspace"));
  }

  completeConsultation(tokenNum) {
    const item = this.store.queue.find(q => q.token === tokenNum);
    if (!item) return;

    item.status = "Completed";
    this.store.saveState();

    this.showToast(`Consultation for ${item.patientName} marked completed. Routed to Cashier.`, "success");
    this.renderQueueBoard(document.getElementById("page-main-workspace"));
  }

  openTransferModal(token) {
    const item = this.store.queue.find(q => q.token === token);
    if (!item) return;

    const modal = document.getElementById("transfer-queue-modal");
    if (!modal) return;

    modal.setAttribute("data-token", token);
    document.getElementById("transfer-modal-patient-name").textContent = `Token ${item.token}: ${item.patientName}`;
    document.getElementById("transfer-modal-current-info").textContent = `Current Doctor: ${item.doctorName} • Current Chair: ${item.chairName || 'None'}`;
    modal.classList.add("open");
  }

  confirmTransferQueue() {
    const modal = document.getElementById("transfer-queue-modal");
    const token = modal.getAttribute("data-token");
    const docId = document.getElementById("transfer-new-doctor").value;
    const chair = document.getElementById("transfer-new-chair").value;

    this.store.transferQueueItem(token, docId, chair);
    modal.classList.remove("open");
    this.showToast(`Transferred Token ${token} to ${chair}!`, "success");
    this.renderQueueBoard(document.getElementById("page-main-workspace"));
  }

  markQueueNoShow(token) {
    this.store.markQueueNoShow(token);
    this.showToast(`Token ${token} marked as No-Show.`, "warning");
    this.renderQueueBoard(document.getElementById("page-main-workspace"));
  }

  requeueItem(token) {
    this.store.requeueItem(token);
    this.showToast(`Token ${token} recalled and added back to active waiting queue.`, "success");
    this.renderQueueBoard(document.getElementById("page-main-workspace"));
  }

  openQuickTokenModal() {
    const modal = document.getElementById("quick-token-modal");
    if (modal) modal.classList.add("open");
  }

  issueQuickWalkInToken() {
    const name = document.getElementById("walkin-name").value.trim();
    const phone = document.getElementById("walkin-phone").value.trim();
    const service = document.getElementById("walkin-service").value;

    if (!name || !phone) {
      this.showToast("Please provide patient name and phone number.", "warning");
      return;
    }

    const token = this.store.addQueueItem({
      patientName: name,
      mrn: "WALK-IN",
      type: "Walk-In",
      service: service,
      doctorId: "u2",
      doctorName: "Dr. Sarah Chen, DDS",
      chairName: "Chair 1",
      status: "Waiting"
    });

    const modal = document.getElementById("quick-token-modal");
    if (modal) modal.classList.remove("open");

    if (token.alreadyActive) {
      this.showToast(`Notice: Patient already active in queue with Token ${token.token} (${token.status})`, "warning");
    } else {
      this.showToast(`Token Issued: ${token.token}!`, "success");
      this.printThermalSlip(token.token);
    }
    this.navigateTo("queue");
  }

  // ==========================================================================
  // Screen 12: Dentist Clinical Workspace
  // ==========================================================================

  renderDentistWorkspace(container) {
    const currentDoctor = this.store.currentUser;
    const assignedQueue = this.store.queue.filter(q => q.status !== "Completed");
    const activeChair = this.store.queue.find(q => q.status === "In Consultation");

    container.innerHTML = `
      <div class="active-chair-banner">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <span class="badge badge-teal" style="font-size: 0.85rem; margin-bottom: 6px;">Active Dental Chair Console</span>
            <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">
              ${activeChair ? `Currently Seated: ${activeChair.patientName} (${activeChair.token})` : 'Operatory Chair Currently Ready / Empty'}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">
              Clinician: ${currentDoctor.name} (${currentDoctor.title})
            </p>
          </div>

          ${activeChair ? `
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-primary" onclick="app.openPatientRecordByMrn('${activeChair.mrn}')">
                <span>🦷</span> Open Chart & Odontogram
              </button>
              <button class="btn btn-success" onclick="app.completeConsultation('${activeChair.token}')">
                <span>✓</span> Complete Consultation
              </button>
            </div>
          ` : `
            <button class="btn btn-secondary" onclick="app.callNextPatient()">
              <span>📢</span> Call Next Waiting Patient
            </button>
          `}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span>📋</span> Today's Clinical Schedule & Waiting Queue</div>
          </div>
          <table class="plan-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient</th>
                <th>Scheduled Procedure</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${assignedQueue.map(item => `
                <tr>
                  <td><strong>${item.token}</strong></td>
                  <td><strong>${item.patientName}</strong></td>
                  <td>${item.service}</td>
                  <td><span class="badge ${item.status === 'In Consultation' ? 'badge-purple' : 'badge-amber'}">${item.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="app.openPatientRecordByMrn('${item.mrn}')">Chart</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><span>⚡</span> Quick Clinical Formularies</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-outline" onclick="app.openNewPrescriptionModal()">
              <span>💊</span> Write Dental Antibiotic / Analgesic
            </button>
            <button class="btn btn-outline" onclick="app.openSamplePatientRecord()">
              <span>🦷</span> Launch Odontogram Simulator
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // Screen 13: Orthodontics Standalone Module View
  // ==========================================================================

  renderOrthodonticsModule(container) {
    const orthoPatients = this.store.patients.filter(p => p.orthodonticCase !== null);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700;">Orthodontic Department Roster</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Comprehensive tracking of active braces and clear aligner therapies</p>
        </div>
      </div>

      <div class="patient-results-grid">
        ${orthoPatients.map(p => {
          const ortho = p.orthodonticCase;
          return `
            <div class="patient-card">
              <div class="patient-card-header">
                <img src="${p.photoUrl}" class="patient-avatar">
                <div>
                  <h4>${p.firstName} ${p.lastName}</h4>
                  <span class="patient-mrn-badge">${p.mrn}</span>
                </div>
              </div>

              <div style="background: #F8FAFC; border-radius: var(--radius-md); padding: 12px; margin-bottom: 12px; font-size: 0.85rem;">
                <div>Appliance: <strong>${ortho.applianceType}</strong></div>
                <div>Stage: <span class="badge badge-purple" style="margin-top: 4px;">${ortho.currentStage}</span></div>
                <div style="margin-top: 6px;">Upper Wire: <strong>${ortho.upperArchwire}</strong></div>
                <div>Progress: <strong>${ortho.progressPercent}%</strong></div>
              </div>

              <button class="btn btn-primary" style="width: 100%;" onclick="app.selectAndOpenPatient('${p.id}'); app.switchRecordTab('ortho');">
                <span>✨</span> Open Orthodontic Console
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ==========================================================================
  // Screen 14: Billing & Cashier Screen
  // ==========================================================================

  setBillingStatusFilter(status) {
    this.currentBillingStatusFilter = status;
    this.renderBilling(document.getElementById("page-main-workspace"));
  }

  renderBilling(container) {
    let allInvoices = [];
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalDue = 0;

    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        allInvoices.push({ ...b, patientName: `${p.firstName} ${p.lastName}`, patientId: p.id, patientMrn: p.mrn });
        totalInvoiced += (b.total || 0);
        totalCollected += (b.paid || 0);
        totalDue += (b.balance || 0);
      });
    });

    let filteredInvoices = allInvoices;
    if (this.currentBillingStatusFilter === "paid") filteredInvoices = allInvoices.filter(i => i.status === "Paid");
    else if (this.currentBillingStatusFilter === "partial") filteredInvoices = allInvoices.filter(i => i.status === "Partial");
    else if (this.currentBillingStatusFilter === "unpaid") filteredInvoices = allInvoices.filter(i => i.status === "Unpaid");

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700;">Central Billing & Accounts Ledger</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Track daily transactions, insurance claims, and outstanding balances</p>
        </div>
        <button class="btn btn-outline" onclick="app.exportDailyCollectionsCsv()">
          <span>📥</span> Export Daily Collections CSV
        </button>
      </div>

      <!-- Financial Metrics Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div class="card" style="padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Total Gross Invoiced</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">$${totalInvoiced.toLocaleString()}</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Net Collections (Paid)</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--success); margin-top: 4px;">$${totalCollected.toLocaleString()}</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Outstanding Due</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--error); margin-top: 4px;">$${totalDue.toLocaleString()}</div>
        </div>
        <div class="card" style="padding: 16px;">
          <div style="font-size: 0.8rem; color: var(--text-secondary);">Ledger Invoices</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary-teal); margin-top: 4px;">${allInvoices.length}</div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div style="display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;">
        <button class="btn btn-sm ${this.currentBillingStatusFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('all')">
          All Invoices (${allInvoices.length})
        </button>
        <button class="btn btn-sm ${this.currentBillingStatusFilter === 'paid' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('paid')">
          Paid (${allInvoices.filter(i => i.status === 'Paid').length})
        </button>
        <button class="btn btn-sm ${this.currentBillingStatusFilter === 'partial' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('partial')">
          Partial (${allInvoices.filter(i => i.status === 'Partial').length})
        </button>
        <button class="btn btn-sm ${this.currentBillingStatusFilter === 'unpaid' ? 'btn-primary' : 'btn-outline'}" onclick="app.setBillingStatusFilter('unpaid')">
          Unpaid (${allInvoices.filter(i => i.status === 'Unpaid').length})
        </button>
      </div>

      <div class="table-responsive">
        <table class="appointments-list-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Patient</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${filteredInvoices.map(inv => `
              <tr>
                <td><strong>#${inv.id}</strong></td>
                <td>${inv.date}</td>
                <td><strong>${inv.patientName}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${inv.patientMrn}</span></td>
                <td><strong>$${inv.total}</strong></td>
                <td style="color: var(--success); font-weight: 600;">$${inv.paid}</td>
                <td style="color: ${inv.balance > 0 ? 'var(--error)' : 'var(--success)'}; font-weight: 700;">$${inv.balance}</td>
                <td><span class="badge ${inv.status === 'Paid' ? 'badge-green' : inv.status === 'Partial' ? 'badge-amber' : 'badge-red'}">${inv.status}</span></td>
                <td>
                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-outline" onclick="app.printInvoiceReceipt('${inv.id}')">🖨️ Receipt</button>
                    ${inv.paid > 0 ? `
                      <button class="btn btn-sm btn-outline" style="color: var(--error);" onclick="app.openRefundModal('${inv.id}', '${inv.patientId}')">↩️ Refund</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ==========================================================================
  // Screen 15: Reports & Analytics
  // ==========================================================================

  renderReports(container) {
    let allInvoices = [];
    let totalGross = 0;
    let totalCollected = 0;
    let totalDue = 0;

    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        allInvoices.push({ ...b, patientName: `${p.firstName} ${p.lastName}` });
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

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700;">Practice Performance & Clinical Analytics</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Live computed practice indicators, collections actuals, and procedure distribution</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline" onclick="app.exportDailyCollectionsCsv()">
            <span>📥</span> Export Collections CSV
          </button>
          <button class="btn btn-outline" onclick="app.exportPatientRegisterCsv()">
            <span>📥</span> Export Patient Register CSV
          </button>
        </div>
      </div>

      <!-- Practice KPI Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card" style="padding: 18px;">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Total Billed Revenue</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-top: 4px;">$${totalGross.toLocaleString()}</div>
          <div style="font-size: 0.75rem; color: var(--success); margin-top: 4px;">✓ Across all clinical encounters</div>
        </div>
        <div class="card" style="padding: 18px;">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Collected Cash/Card</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--success); margin-top: 4px;">$${totalCollected.toLocaleString()}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Realized bank deposits</div>
        </div>
        <div class="card" style="padding: 18px;">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Outstanding Receivables</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--error); margin-top: 4px;">$${totalDue.toLocaleString()}</div>
          <div style="font-size: 0.75rem; color: var(--error); margin-top: 4px;">Copay balance pending</div>
        </div>
        <div class="card" style="padding: 18px;">
          <div style="font-size: 0.85rem; color: var(--text-secondary);">Active Orthodontic Cases</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary-teal); margin-top: 4px;">${activeOrthoCount} Cases</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Braces & clear aligners</div>
        </div>
      </div>

      <div class="analytics-charts-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span>📊</span> 7-Day Revenue Collections Trend</div>
            <span class="badge badge-teal">Live Store Calculations</span>
          </div>

          <!-- Dynamic Bar Chart -->
          <div class="css-bar-chart">
            ${dailyData.map(day => {
              const heightPct = Math.max(15, Math.round((day.amount / maxDaily) * 100));
              const displayAmt = day.amount > 0 ? `$${(day.amount / 1000).toFixed(1)}k` : '$0';
              return `
                <div class="bar-col">
                  <div class="bar-fill" style="height: ${heightPct}%;" title="${day.iso}: $${day.amount}">
                    <span style="position: absolute; top: -20px; font-size: 0.7rem; font-weight: 700;">${displayAmt}</span>
                  </div>
                  <span class="bar-label">${day.dayName}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-title"><span>🥧</span> Dynamic Clinical Procedure Mix</div>
            <span class="badge badge-subtle">${totalProcs} Total Procedures</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                <span>Orthodontics (Braces / Aligners)</span>
                <strong>${orthoPct}% (${procCounts.ortho})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: ${orthoPct}%; height: 100%; background: var(--purple);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                <span>Restorative & Endodontics</span>
                <strong>${restPct}% (${procCounts.restorative})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: ${restPct}%; height: 100%; background: var(--primary-teal);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                <span>Preventive & Hygiene (Evaluations / Prophy)</span>
                <strong>${prevPct}% (${procCounts.preventive})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: ${prevPct}%; height: 100%; background: var(--secondary-blue);"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                <span>Oral Surgery & Periodontics</span>
                <strong>${surgPct}% (${procCounts.surgery})</strong>
              </div>
              <div style="height: 10px; background: #E2E8F0; border-radius: 5px; overflow: hidden;">
                <div style="width: ${surgPct}%; height: 100%; background: var(--warning);"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  exportDailyCollectionsCsv() {
    let rows = [["InvoiceID", "Date", "PatientName", "MRN", "TotalAmount", "PaidAmount", "BalanceDue", "Status"]];
    this.store.patients.forEach(p => {
      (p.billing || []).forEach(b => {
        rows.push([b.id, b.date, `"${p.firstName} ${p.lastName}"`, p.mrn, b.total, b.paid, b.balance, b.status]);
      });
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmileDental_Collections_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    this.showToast("Daily Collections CSV exported successfully!", "success");
  }

  exportPatientRegisterCsv() {
    let rows = [["MRN", "FirstName", "LastName", "Phone", "DOB", "Gender", "BloodGroup", "Allergies", "OrthoActive"]];
    this.store.patients.forEach(p => {
      const allergies = (p.medicalInfo?.allergies || []).map(a => a.name).join("; ");
      const isOrtho = p.orthodonticCase ? "Yes" : "No";
      rows.push([p.mrn, `"${p.firstName}"`, `"${p.lastName}"`, `"${p.phone}"`, p.dob, p.gender, p.bloodGroup, `"${allergies}"`, isOrtho]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SmileDental_Patient_Register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    this.showToast("Patient Register CSV exported successfully!", "success");
  }

  // ==========================================================================
  // Screen 16: Administration & Security
  // ==========================================================================

  renderAdmin(container) {
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700;">System Administration & Security Policies</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Manage staff permissions, clinical fee schedules, and audit compliance</p>
        </div>
        <button class="btn btn-outline" onclick="app.resetDemoData()">
          <span>🔄</span> Reset Prototype Demo Data
        </button>
      </div>

      <div class="card" style="margin-bottom: 20px;">
        <div class="card-header">
          <div class="card-title"><span>👥</span> Staff Directory & Role-Based Access Control (RBAC)</div>
        </div>
        <table class="plan-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>System Role</th>
              <th>License / Credential</th>
              <th>Permissions Assigned</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${STAFF_USERS.map(user => `
              <tr>
                <td><strong>${user.name}</strong><br><span style="font-size: 0.75rem; color: var(--text-muted);">${user.email}</span></td>
                <td><span class="badge" style="background: ${user.color}20; color: ${user.color}; font-weight: 700;">${user.role.toUpperCase()}</span></td>
                <td>${user.license || 'N/A'}</td>
                <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${user.permissions.join(', ')}</span></td>
                <td>
                  <button class="btn btn-sm btn-outline" onclick="app.store.setCurrentUser('${user.id}'); app.setupRoleSwitcher(); app.renderCurrentScreen();">
                    Switch to this User
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>💲</span> Clinical Procedure Catalog & Standard Fee Schedule</div>
        </div>
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
            ${this.store.procedures.slice(0, 10).map(proc => `
              <tr>
                <td><strong>${proc.code}</strong></td>
                <td><span class="badge badge-subtle">${proc.category}</span></td>
                <td>${proc.name}</td>
                <td>${proc.duration} mins</td>
                <td><strong>$${proc.price}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  resetDemoData() {
    if (confirm("Reset all prototype demo records to original baseline?")) {
      this.store.resetToDefaults();
      this.showToast("Prototype records restored to initial demo state.", "info");
      this.navigateTo("dashboard");
    }
  }

  // ==========================================================================
  // Printable Output Handlers
  // ==========================================================================

  printThermalSlip(tokenNum) {
    const item = this.store.queue.find(q => q.token === tokenNum);
    if (!item) return;

    const modal = document.getElementById("print-preview-modal");
    const container = document.getElementById("print-preview-content");
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="thermal-slip">
        <h2>${CLINIC_CONFIG.name}</h2>
        <div style="text-align: center; font-size: 10px;">${CLINIC_CONFIG.address}</div>
        <div style="text-align: center; font-size: 10px;">Tel: ${CLINIC_CONFIG.phone}</div>
        <hr>
        <div style="text-align: center; font-weight: bold;">QUEUING TOKEN TICKET</div>
        <div class="slip-token">${item.token}</div>
        <hr>
        <div>Patient: <strong>${item.patientName}</strong></div>
        <div>MRN: ${item.mrn}</div>
        <div>Service: ${item.service}</div>
        <div>Clinician: ${item.doctorName}</div>
        <div>Issued: ${item.checkInTime} (${new Date().toLocaleDateString()})</div>
        <hr>
        <div style="text-align: center; font-size: 10px; margin: 8px 0;">
          Please proceed to Reception Waiting Lounge.<br>
          Your token will be called on digital monitors.
        </div>
        <div style="text-align: center; font-size: 9px; opacity: 0.8;">Thank you for trusting Smile Dental!</div>
      </div>
    `;

    modal.classList.add("open");
  }

  printPatientIdCard(patientId) {
    const pt = this.store.getPatient(patientId);
    if (!pt) return;

    const modal = document.getElementById("print-preview-modal");
    const container = document.getElementById("print-preview-content");
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="patient-id-card-preview">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.4rem;">🦷</span>
            <div>
              <strong style="font-size: 0.85rem; letter-spacing: 0.5px;">SMILE DENTAL & ORTHO</strong>
              <div style="font-size: 0.65rem; opacity: 0.85;">CLINICAL IDENTITY CARD</div>
            </div>
          </div>
          <span style="background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;">
            ${pt.mrn}
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; margin: 10px 0;">
          <img src="${pt.photoUrl}" style="width: 56px; height: 56px; border-radius: 50%; border: 2px solid #FFF; object-fit: cover;">
          <div>
            <div style="font-size: 1.25rem; font-weight: 800;">${pt.firstName} ${pt.lastName}</div>
            <div style="font-size: 0.78rem; opacity: 0.9;">DOB: ${pt.dob} | Blood: ${pt.bloodGroup}</div>
            <div style="font-size: 0.78rem; opacity: 0.9;">Phone: ${pt.phone}</div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.25); padding-top: 8px;">
          <div style="font-size: 0.7rem; opacity: 0.8;">
            Emergency: ${pt.emergencyContact.phone || CLINIC_CONFIG.emergencyPhone}
          </div>
          <div style="background: #FFF; padding: 4px; border-radius: 6px;">
            <svg width="40" height="40" viewBox="0 0 40 40">
              <rect width="40" height="40" fill="#FFF"/>
              <rect x="4" y="4" width="10" height="10" fill="#000"/>
              <rect x="6" y="6" width="6" height="6" fill="#FFF"/>
              <rect x="7" y="7" width="4" height="4" fill="#000"/>
              <rect x="26" y="4" width="10" height="10" fill="#000"/>
              <rect x="28" y="6" width="6" height="6" fill="#FFF"/>
              <rect x="29" y="7" width="4" height="4" fill="#000"/>
              <rect x="4" y="26" width="10" height="10" fill="#000"/>
              <rect x="6" y="28" width="6" height="6" fill="#FFF"/>
              <rect x="7" y="29" width="4" height="4" fill="#000"/>
              <rect x="18" y="8" width="4" height="4" fill="#000"/>
              <rect x="18" y="18" width="8" height="8" fill="#000"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  printPrescription(rxId) {
    const rx = this.selectedPatient?.prescriptions?.find(r => r.id === rxId);
    if (!rx) return;

    const modal = document.getElementById("print-preview-modal");
    const container = document.getElementById("print-preview-content");
    if (!modal || !container) return;

    container.innerHTML = `
      <div style="background: #FFF; padding: 28px; border: 1px solid #CBD5E1; font-family: var(--font-sans);">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--primary-teal); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="color: var(--primary-teal); font-size: 1.4rem;">${CLINIC_CONFIG.name}</h2>
            <div style="font-size: 0.8rem; color: #475569;">${CLINIC_CONFIG.address} • Tel: ${CLINIC_CONFIG.phone}</div>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 1.1rem; color: var(--text-main);">${rx.doctor}</strong>
            <div style="font-size: 0.8rem; color: #475569;">Senior Dental Surgeon</div>
          </div>
        </div>

        <div style="background: #F8FAFC; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.88rem; display: flex; justify-content: space-between;">
          <div>
            Patient: <strong>${this.selectedPatient.firstName} ${this.selectedPatient.lastName}</strong> (MRN: ${this.selectedPatient.mrn})<br>
            DOB: ${this.selectedPatient.dob} | Phone: ${this.selectedPatient.phone}
          </div>
          <div style="text-align: right;">
            Rx Date: <strong>${rx.date}</strong><br>
            Prescription ID: <strong>#${rx.id}</strong>
          </div>
        </div>

        ${(this.selectedPatient.medicalInfo?.allergies || []).length > 0 ? `
          <div style="background: #FEF2F2; border-left: 4px solid #DC2626; color: #991B1B; padding: 8px 12px; margin-bottom: 16px; font-size: 0.85rem;">
            ⚠️ <strong>PATIENT ALLERGIES:</strong> ${this.selectedPatient.medicalInfo.allergies.map(a => a.name).join(', ')}
          </div>
        ` : ''}

        <div style="font-size: 2rem; font-weight: 900; color: var(--primary-teal); margin-bottom: 8px;">℞</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="border-bottom: 2px solid #E2E8F0; text-align: left; font-size: 0.85rem; color: #475569;">
              <th style="padding: 8px;">Medication & Strength</th>
              <th style="padding: 8px;">Dosage & Route</th>
              <th style="padding: 8px;">Duration</th>
              <th style="padding: 8px; text-align: right;">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${rx.items.map(item => `
              <tr style="border-bottom: 1px solid #E2E8F0; font-size: 0.9rem;">
                <td style="padding: 10px 8px;">
                  <strong>${item.drug} ${item.strength}</strong><br>
                  <span style="font-size: 0.78rem; color: #64748B;">Sig: ${item.instructions}</span>
                </td>
                <td style="padding: 10px 8px;">${item.dose}</td>
                <td style="padding: 10px 8px;">${item.duration}</td>
                <td style="padding: 10px 8px; text-align: right;"><strong>${item.qty}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
          <div style="font-size: 0.75rem; color: #64748B;">
            Official Prescription Slip • Smile Dental Management System<br>
            Dispense as written unless generic substitution permitted.
          </div>
          <div style="text-align: center;">
            <div style="font-family: 'Brush Script MT', cursive; font-size: 1.5rem; color: var(--dark-teal);">${rx.doctor}</div>
            <div style="border-top: 1px solid #000; width: 180px; margin-top: 2px; font-size: 0.75rem;">Authorized Signature</div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  printTreatmentEstimate() {
    const pt = this.selectedPatient;
    const plan = pt?.treatmentPlans?.[0];
    if (!plan) return;

    const modal = document.getElementById("print-preview-modal");
    const container = document.getElementById("print-preview-content");
    if (!modal || !container) return;

    container.innerHTML = `
      <div style="background: #FFF; padding: 28px; border: 1px solid #CBD5E1; font-family: var(--font-sans);">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--primary-teal); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="color: var(--primary-teal); font-size: 1.4rem;">${CLINIC_CONFIG.name}</h2>
            <div style="font-size: 0.8rem; color: #475569;">${CLINIC_CONFIG.address} • Tel: ${CLINIC_CONFIG.phone}</div>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 1.1rem; color: var(--text-main);">TREATMENT PLAN ESTIMATE</strong>
            <div style="font-size: 0.8rem; color: #475569;">Date: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div style="background: #F8FAFC; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.88rem;">
          Patient: <strong>${pt.firstName} ${pt.lastName}</strong> (MRN: ${pt.mrn}) | Phone: ${pt.phone}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #E2E8F0; text-align: left; font-size: 0.85rem; color: #475569;">
              <th style="padding: 8px;">Code</th>
              <th style="padding: 8px;">Tooth</th>
              <th style="padding: 8px;">Procedure Name</th>
              <th style="padding: 8px; text-align: right;">Estimated Fee</th>
            </tr>
          </thead>
          <tbody>
            ${plan.procedures.map(p => `
              <tr style="border-bottom: 1px solid #E2E8F0; font-size: 0.9rem;">
                <td style="padding: 8px;">${p.code}</td>
                <td style="padding: 8px;">Tooth #${p.tooth}</td>
                <td style="padding: 8px;">${p.name}</td>
                <td style="padding: 8px; text-align: right;">$${p.cost}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 30px;">
          <div style="font-size: 1.25rem; font-weight: 800;">Estimated Total: $${plan.estimatedTotal}</div>
          <div style="font-size: 0.8rem; color: #64748B;">*This estimate does not constitute a finalized billing invoice.</div>
        </div>

        <div style="display: flex; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 20px;">
          <div>
            <div style="border-top: 1px solid #000; width: 180px; margin-top: 30px; font-size: 0.75rem;">Patient Approval Signature</div>
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 180px; margin-top: 30px; font-size: 0.75rem;">Treating Dentist Signature</div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  printInvoiceReceipt(invoiceId) {
    let inv = null;
    let pt = this.selectedPatient;

    if (pt) {
      inv = pt.billing?.find(b => b.id === invoiceId);
    }
    if (!inv) {
      // Search all patients
      for (const p of this.store.patients) {
        const found = p.billing?.find(b => b.id === invoiceId);
        if (found) {
          inv = found;
          pt = p;
          break;
        }
      }
    }
    if (!inv || !pt) return;

    const modal = document.getElementById("print-preview-modal");
    const container = document.getElementById("print-preview-content");
    if (!modal || !container) return;

    container.innerHTML = `
      <div style="background: #FFF; padding: 28px; border: 1px solid #CBD5E1; font-family: var(--font-sans);">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--primary-teal); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <h2 style="color: var(--primary-teal); font-size: 1.4rem;">${CLINIC_CONFIG.name}</h2>
            <div style="font-size: 0.8rem; color: #475569;">${CLINIC_CONFIG.address} • Tax ID: ${CLINIC_CONFIG.taxId}</div>
          </div>
          <div style="text-align: right;">
            <strong style="font-size: 1.15rem; color: var(--text-main);">OFFICIAL RECEIPT / INVOICE</strong>
            <div style="font-size: 0.85rem; color: #475569;">#${inv.id} • ${inv.date}</div>
          </div>
        </div>

        <div style="background: #F8FAFC; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 0.88rem; display: flex; justify-content: space-between;">
          <div>
            Billed To: <strong>${pt.firstName} ${pt.lastName}</strong><br>
            MRN: ${pt.mrn} | Phone: ${pt.phone}
          </div>
          <div style="text-align: right;">
            Status: <strong style="color: ${inv.status === 'Paid' ? 'var(--success)' : 'var(--error)'};">${inv.status.toUpperCase()}</strong><br>
            Method: ${inv.method || 'Credit/Cash'}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #E2E8F0; text-align: left; font-size: 0.85rem; color: #475569;">
              <th style="padding: 8px;">Description</th>
              <th style="padding: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(item => `
              <tr style="border-bottom: 1px solid #E2E8F0; font-size: 0.9rem;">
                <td style="padding: 8px;">${item.desc}</td>
                <td style="padding: 8px; text-align: right;">$${item.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-bottom: 30px;">
          <div style="font-size: 0.95rem;">Gross Total: $${inv.total}</div>
          <div style="font-size: 1rem; color: var(--success); font-weight: 700;">Amount Paid: $${inv.paid}</div>
          <div style="font-size: 1.25rem; font-weight: 800; color: ${inv.balance > 0 ? 'var(--error)' : 'var(--success)'};">
            Remaining Balance Due: $${inv.balance}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 0.75rem; color: #64748B;">
          <div>Thank you for choosing Smile Dental & Orthodontics!</div>
          <div style="text-align: center;">
            <div style="border-bottom: 1px solid #94A3B8; width: 140px; margin-bottom: 4px;">Cashier Stamp</div>
            Elena Rostova (Cashier)
          </div>
        </div>
      </div>
    `;

    modal.classList.add("open");
  }

  // ==========================================================================
  // Simulated QR / Barcode Scanner Modal
  // ==========================================================================

  openQrScannerSimulation() {
    const modal = document.getElementById("qr-scanner-modal");
    if (!modal) return;
    modal.classList.add("open");
  }

  simulateScanPatient(mrn) {
    const modal = document.getElementById("qr-scanner-modal");
    if (modal) modal.classList.remove("open");

    const pt = this.store.getPatient(mrn);
    if (pt) {
      this.selectedPatient = pt;
      this.showToast(`Scanned Patient QR: ${pt.firstName} ${pt.lastName} (${pt.mrn})`, "success");
      this.navigateTo("record");
    } else {
      this.showToast(`No patient found for scanned code: ${mrn}`, "error");
    }
  }

  quickIssueQueueToken(patientId) {
    const pt = this.store.getPatient(patientId);
    if (!pt) return;

    const token = this.store.addQueueItem({
      patientId: pt.id,
      patientName: `${pt.firstName} ${pt.lastName}`,
      mrn: pt.mrn,
      type: "Appointment",
      service: "General Dental Evaluation",
      doctorId: "u2",
      doctorName: "Dr. Sarah Chen, DDS",
      chairName: "Chair 1",
      status: "Waiting"
    });

    if (token.alreadyActive) {
      this.showToast(`Notice: Patient already checked in with Token ${token.token} (${token.status})`, "warning");
      this.navigateTo("queue");
      return;
    }

    this.showToast(`Issued Queue Token ${token.token} for ${pt.firstName}!`, "success");
    this.printThermalSlip(token.token);
  }

  // ==========================================================================
  // Remaining Tab Views (Visits, X-rays, Audit)
  // ==========================================================================

  renderVisitsTab(container) {
    const pt = this.selectedPatient;
    const visits = pt.visits || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 1.2rem; font-weight: 700;">Past Clinical Encounters & SOAP Notes</h3>
        <button class="btn btn-primary btn-sm" onclick="app.switchRecordTab('odontogram')">
          <span>✍️</span> Start New Consultation
        </button>
      </div>

      ${visits.length === 0 ? `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-secondary);">No past clinical encounters logged for this patient.</p>
        </div>
      ` : visits.map(v => `
        <div class="card" style="margin-bottom: 16px;">
          <div class="card-header">
            <div>
              <div class="card-title">${v.reason}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">${v.date} at ${v.time} | Provider: ${v.doctor}</div>
            </div>
            <span class="badge badge-green">${v.status}</span>
          </div>

          <div style="background: #F8FAFC; border-radius: var(--radius-md); padding: 14px; font-size: 0.9rem; margin-bottom: 12px;">
            <div style="margin-bottom: 8px;"><strong>Subjective (S):</strong> ${v.soap.s}</div>
            <div style="margin-bottom: 8px;"><strong>Objective (O):</strong> ${v.soap.o}</div>
            <div style="margin-bottom: 8px;"><strong>Assessment (A):</strong> ${v.soap.a}</div>
            <div><strong>Plan (P):</strong> ${v.soap.p}</div>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted); text-align: right; font-style: italic;">
            Digitally Signed By: ${v.signedBy}
          </div>
        </div>
      `).join('')}
    `;
  }

  renderXraysTab(container) {
    const pt = this.selectedPatient;
    if (!pt.xrays || pt.xrays.length === 0) {
      // Initialize sample xrays for demonstration if empty
      pt.xrays = [
        {
          id: "xr-101",
          title: "Full Mouth Panoramic (OPG)",
          type: "Panoramic OPG",
          region: "Full Dentition",
          date: "2026-10-15",
          sensor: "Sirona Orthophos SL",
          notes: "General bone levels stable. Impacted third molars #18, #28.",
          svgType: "opg"
        },
        {
          id: "xr-102",
          title: "Intraoral Periapical (Tooth #16)",
          type: "Periapical PA",
          region: "Tooth #16",
          date: "2026-10-23",
          sensor: "Dexis Titanium Sensor",
          notes: "Extensive occlusal radiolucency invading pulp chamber. Apical radiolucency indicative of acute periapical abscess.",
          svgType: "pa"
        }
      ];
      this.store.savePatient(pt);
    }

    const xrays = pt.xrays || [];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <span>🩻</span> Digital Radiographs & Intraoral Imaging (${xrays.length})
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.openUploadXrayModal()">
            <span>📤</span> Upload DICOM / X-ray
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px;">
          ${xrays.map(xr => `
            <div class="card" style="margin: 0; background: #0F172A; border: 1px solid #1E293B; overflow: hidden; cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;" onclick="app.openXrayViewer('${xr.id}')">
              <div style="height: 200px; background: #020617; display: flex; align-items: center; justify-content: center; position: relative;">
                ${this.renderXrayThumbnail(xr)}
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #38BDF8; font-size: 0.72rem; padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                  🔍 Tap to Inspect
                </div>
              </div>
              <div style="padding: 14px; background: #1E293B; color: #FFF;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <strong style="font-size: 0.95rem; color: #F8FAFC;">${xr.title || xr.type}</strong>
                  <span class="badge badge-teal" style="font-size: 0.75rem;">${xr.type}</span>
                </div>
                <div style="font-size: 0.78rem; color: #94A3B8; margin-bottom: 8px;">
                  Acquired: ${xr.date} • Region: ${xr.region} • Sensor: ${xr.sensor || 'Digital Sensor'}
                </div>
                <p style="font-size: 0.8rem; color: #CBD5E1; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${xr.notes}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderXrayThumbnail(xr) {
    if (xr.imageDataUrl) {
      return `<img src="${xr.imageDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="${xr.title}">`;
    }

    if (xr.svgType === 'opg' || (xr.type && xr.type.toLowerCase().includes('panoramic'))) {
      return `
        <svg viewBox="0 0 300 200" style="width: 100%; height: 100%; background: #020617;">
          <rect width="300" height="200" fill="#020617"/>
          <text x="150" y="25" fill="#64748B" font-size="10" text-anchor="middle" font-weight="bold">PANORAMIC OPG (FULL MOUTH)</text>
          <path d="M40,145 Q150,45 260,145" fill="none" stroke="#475569" stroke-width="7"/>
          <path d="M50,155 Q150,75 250,155" fill="none" stroke="#334155" stroke-width="9"/>
          <!-- Teeth representations -->
          <rect x="140" y="85" width="8" height="16" fill="#CBD5E1" rx="2"/>
          <rect x="152" y="85" width="8" height="16" fill="#CBD5E1" rx="2"/>
          <rect x="128" y="87" width="7" height="15" fill="#CBD5E1" rx="2"/>
          <rect x="165" y="87" width="7" height="15" fill="#CBD5E1" rx="2"/>
          <rect x="115" y="92" width="7" height="14" fill="#94A3B8" rx="2"/>
          <rect x="178" y="92" width="7" height="14" fill="#94A3B8" rx="2"/>
          <rect x="100" y="100" width="8" height="14" fill="#64748B" rx="2"/>
          <rect x="192" y="100" width="8" height="14" fill="#64748B" rx="2"/>
          <!-- Overlays -->
          <circle cx="95" cy="115" r="8" fill="none" stroke="#EF4444" stroke-width="1.5"/>
          <circle cx="205" cy="115" r="8" fill="none" stroke="#EF4444" stroke-width="1.5"/>
        </svg>
      `;
    }

    return `
      <svg viewBox="0 0 300 200" style="width: 100%; height: 100%; background: #020617;">
        <rect width="300" height="200" fill="#020617"/>
        <text x="150" y="25" fill="#64748B" font-size="10" text-anchor="middle" font-weight="bold">PERIAPICAL (PA)</text>
        <path d="M120,65 L180,65 L170,150 L130,150 Z" fill="#475569" stroke="#94A3B8" stroke-width="2"/>
        <circle cx="150" cy="78" r="10" fill="#000" stroke="#EF4444" stroke-width="2"/>
        <circle cx="150" cy="155" r="12" fill="#000" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,2"/>
        <text x="150" y="185" fill="#EF4444" font-size="9" text-anchor="middle">Apical Radiolucency</text>
      </svg>
    `;
  }

  openXrayViewer(xrayId) {
    const pt = this.selectedPatient;
    const xr = (pt?.xrays || []).find(x => x.id === xrayId) || pt?.xrays?.[0];
    if (!xr) return;

    this.currentXray = xr;
    this.xrayZoomLevel = 1.0;
    this.xrayInverted = false;
    this.xrayBrightness = 100;

    const modalTitle = document.getElementById("xray-viewer-title");
    if (modalTitle) modalTitle.textContent = `🩻 ${xr.title || xr.type} — ${xr.region}`;

    const meta = document.getElementById("xray-meta-details");
    if (meta) meta.textContent = `Modality: ${xr.type} • Acquired: ${xr.date} • Sensor: ${xr.sensor || 'Digital Sensor'}`;

    const zoomLbl = document.getElementById("xray-zoom-level");
    if (zoomLbl) zoomLbl.textContent = "Scale: 100%";

    const slider = document.getElementById("xray-brightness-slider");
    if (slider) slider.value = 100;

    const invertBtn = document.getElementById("btn-xray-invert");
    if (invertBtn) invertBtn.style.background = "";

    const mount = document.getElementById("xray-image-mount");
    if (mount) {
      mount.style.transform = "scale(1)";
      mount.style.filter = "brightness(100%)";

      if (xr.imageDataUrl) {
        mount.innerHTML = `<img src="${xr.imageDataUrl}" style="max-width: 90%; max-height: 90%; object-fit: contain;" alt="${xr.title}">`;
      } else if (xr.svgType === 'opg' || (xr.type && xr.type.toLowerCase().includes('panoramic'))) {
        mount.innerHTML = `
          <svg viewBox="0 0 600 350" style="width: 95%; height: 95%; max-height: 360px;">
            <rect width="600" height="350" fill="#020617"/>
            <text x="300" y="28" fill="#64748B" font-size="12" text-anchor="middle" letter-spacing="1">DIGITAL PANORAMIC RADIOGRAPH (OPG) — 1:1 SCALE</text>
            <!-- Mandible arch density -->
            <path d="M70,250 Q300,80 530,250" fill="none" stroke="#334155" stroke-width="24" stroke-linecap="round"/>
            <path d="M85,270 Q300,120 515,270" fill="none" stroke="#1E293B" stroke-width="16"/>
            <!-- Condyles -->
            <ellipse cx="90" cy="115" rx="14" ry="22" fill="#334155"/>
            <ellipse cx="510" cy="115" rx="14" ry="22" fill="#334155"/>
            <!-- Upper Dental Arch -->
            <path d="M120,175 Q300,95 480,175" fill="none" stroke="#94A3B8" stroke-width="18" stroke-dasharray="14,6"/>
            <!-- Lower Dental Arch -->
            <path d="M130,205 Q300,135 470,205" fill="none" stroke="#CBD5E1" stroke-width="18" stroke-dasharray="12,5"/>
            <!-- Pathology Annotations -->
            <rect x="100" y="180" width="16" height="22" fill="#EF4444" rx="3" transform="rotate(45, 100, 180)" opacity="0.85"/>
            <text x="105" y="235" fill="#F87171" font-size="11" font-weight="bold">#18 Impacted</text>
            <rect x="480" y="180" width="16" height="22" fill="#EF4444" rx="3" transform="rotate(-45, 480, 180)" opacity="0.85"/>
            <text x="475" y="235" fill="#F87171" font-size="11" font-weight="bold">#28 Impacted</text>
          </svg>
        `;
      } else {
        mount.innerHTML = `
          <svg viewBox="0 0 450 350" style="width: 95%; height: 95%; max-height: 360px;">
            <rect width="450" height="350" fill="#020617"/>
            <text x="225" y="28" fill="#64748B" font-size="12" text-anchor="middle" letter-spacing="1">HIGH-RES PERIAPICAL DIAGNOSTIC SENSOR (PA)</text>
            <rect x="60" y="50" width="330" height="270" fill="#0F172A" rx="8" stroke="#334155"/>
            <!-- Tooth Crown & Roots -->
            <path d="M180,80 L270,80 L260,170 L290,265 L265,270 L240,185 L210,185 L185,270 L160,265 L190,170 Z" fill="#94A3B8" stroke="#E2E8F0" stroke-width="2"/>
            <!-- Pulp Chambers -->
            <path d="M210,110 L240,110 L235,170 L250,245 L242,245 L230,180 L220,180 L208,245 L200,245 L215,170 Z" fill="#020617"/>
            <!-- Caries Defect -->
            <circle cx="225" cy="85" r="14" fill="#000000" stroke="#EF4444" stroke-width="2"/>
            <text x="225" y="115" fill="#EF4444" font-size="10" text-anchor="middle">Occlusal Caries</text>
            <!-- Apical Lesion -->
            <circle cx="172" cy="270" r="15" fill="#000000" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,2"/>
            <circle cx="278" cy="270" r="15" fill="#000000" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,2"/>
            <text x="225" y="305" fill="#F87171" font-size="11" font-weight="bold" text-anchor="middle">Apical Periodontitis Radiolucency</text>
          </svg>
        `;
      }
    }

    const modal = document.getElementById("xray-viewer-modal");
    if (modal) modal.classList.add("open");
  }

  xrayZoom(factor) {
    this.xrayZoomLevel = Math.max(0.5, Math.min(3.5, this.xrayZoomLevel * factor));
    const mount = document.getElementById("xray-image-mount");
    if (mount) mount.style.transform = `scale(${this.xrayZoomLevel})`;
    const lbl = document.getElementById("xray-zoom-level");
    if (lbl) lbl.textContent = `Scale: ${Math.round(this.xrayZoomLevel * 100)}%`;
  }

  xrayResetZoom() {
    this.xrayZoomLevel = 1.0;
    const mount = document.getElementById("xray-image-mount");
    if (mount) mount.style.transform = "scale(1)";
    const lbl = document.getElementById("xray-zoom-level");
    if (lbl) lbl.textContent = "Scale: 100%";
  }

  toggleXrayInvert() {
    this.xrayInverted = !this.xrayInverted;
    const btn = document.getElementById("btn-xray-invert");
    if (btn) btn.style.background = this.xrayInverted ? "rgba(255,255,255,0.2)" : "";
    this.updateXrayFilter();
  }

  updateXrayFilter() {
    const slider = document.getElementById("xray-brightness-slider");
    this.xrayBrightness = slider ? slider.value : 100;
    const mount = document.getElementById("xray-image-mount");
    if (mount) {
      const inv = this.xrayInverted ? "invert(100%)" : "";
      const bri = `brightness(${this.xrayBrightness}%)`;
      mount.style.filter = `${inv} ${bri}`.trim();
    }
  }

  openUploadXrayModal() {
    this.pendingXrayFileData = null;
    const regInput = document.getElementById("upload-xray-region");
    if (regInput) regInput.value = "";
    const sensorInput = document.getElementById("upload-xray-sensor");
    if (sensorInput) sensorInput.value = "";
    const notesInput = document.getElementById("upload-xray-notes");
    if (notesInput) notesInput.value = "";
    const fn = document.getElementById("upload-xray-filename");
    if (fn) fn.textContent = "";
    const fileInput = document.getElementById("upload-xray-file");
    if (fileInput) fileInput.value = "";

    const modal = document.getElementById("upload-xray-modal");
    if (modal) modal.classList.add("open");
  }

  onXrayFileSelected(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const fn = document.getElementById("upload-xray-filename");
      if (fn) fn.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.pendingXrayFileData = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveUploadedXray() {
    if (!this.selectedPatient) return;
    const modality = document.getElementById("upload-xray-modality").value;
    const region = document.getElementById("upload-xray-region").value.trim();
    const sensor = document.getElementById("upload-xray-sensor").value.trim() || "Dexis Titanium Sensor";
    const notes = document.getElementById("upload-xray-notes").value.trim();

    if (!region) {
      this.showToast("Please specify the anatomical region or tooth number.", "warning");
      return;
    }

    const newXr = {
      id: "xr-" + Date.now(),
      title: `${modality} (${region})`,
      type: modality,
      region: region,
      date: new Date().toISOString().split("T")[0],
      sensor: sensor,
      notes: notes || "Diagnostic digital radiograph acquired. No acute structural defects noted.",
      imageDataUrl: this.pendingXrayFileData || null,
      svgType: modality.toLowerCase().includes("panoramic") ? "opg" : "pa"
    };

    this.selectedPatient.xrays = this.selectedPatient.xrays || [];
    this.selectedPatient.xrays.unshift(newXr);
    this.store.savePatient(this.selectedPatient);

    const modal = document.getElementById("upload-xray-modal");
    if (modal) modal.classList.remove("open");

    this.showToast("Digital radiograph uploaded and attached to patient record.", "success");
    this.renderXraysTab(document.getElementById("patient-tab-content-container"));
  }

  renderAuditTab(container) {
    const pt = this.selectedPatient;
    const logs = pt.auditLogs || [];

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span>🛡️</span> Regulatory & HIPAA Audit History</div>
          <span class="badge badge-teal">Immutable Security Log</span>
        </div>

        <table class="plan-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Staff User</th>
              <th>Action / Event Description</th>
            </tr>
          </thead>
          <tbody>
            ${logs.length === 0 ? `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">No audit entries.</td></tr>` :
              logs.map(log => `
                <tr>
                  <td><code>${log.timestamp}</code></td>
                  <td><strong>${log.user}</strong></td>
                  <td>${log.action}</td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>
    `;
  }
}

// Instantiate global app controller


// Multi-Station OS Controller Methods for Smile Dental & Orthodontics
// To be merged into ClinicApp

const stationMethods = {
  setupWorkstationNav() {
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
  },

  setupNavAutoHide() {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
          const delta = currentScrollY - lastScrollY;

          if (!this.isNavPinned) {
            // Scrolling down past threshold -> hide
            if (currentScrollY > 60 && delta > 6) {
              this.hideWorkstationNav();
            }
            // Scrolling up by noticeable amount or back to top -> show
            else if (delta < -6 || currentScrollY <= 20) {
              this.showWorkstationNav();
            }
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Edge mouse move listener near top of screen (top 14px)
    window.addEventListener('mousemove', (e) => {
      if (e.clientY <= 14) {
        this.showWorkstationNav();
      }
    }, { passive: true });
  },

  showWorkstationNav() {
    document.body.classList.remove("nav-hidden");
    const nav = document.getElementById("workstation-nav-bar");
    if (nav) nav.classList.remove("nav-hidden");
    this.cancelNavAutoHideTimer();
  },

  hideWorkstationNav() {
    if (this.isNavPinned) return;
    document.body.classList.add("nav-hidden");
    const nav = document.getElementById("workstation-nav-bar");
    if (nav) nav.classList.add("nav-hidden");
  },

  toggleNavAutoHide() {
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
  },

  cancelNavAutoHideTimer() {
    if (this.navAutoHideTimer) {
      clearTimeout(this.navAutoHideTimer);
      this.navAutoHideTimer = null;
    }
  },

  scheduleNavAutoHideOnLeave() {
    if (this.isNavPinned) return;
    this.cancelNavAutoHideTimer();
    if (this.currentStation === 'PATIENT_KIOSK' || this.currentStation === 'CABIN_QUEUE_TV') {
      this.navAutoHideTimer = setTimeout(() => {
        this.hideWorkstationNav();
      }, 2500);
    }
  },

  switchStation(stationId) {
    this.currentStation = stationId;

    const tabMap = {
      'PATIENT_KIOSK': 'tab-btn-kiosk',
      'CABIN_QUEUE_TV': 'tab-btn-tv',
      'DOCTOR_CABIN': 'tab-btn-cabin',
      'BILLING_PHARMACY': 'tab-btn-billing',
      'INHOUSE_PHARMACY': 'tab-btn-pharmacy',
      'ADMIN_DASHBOARD': 'tab-btn-admin'
    };

    const sectionMap = {
      'PATIENT_KIOSK': 'station-kiosk',
      'CABIN_QUEUE_TV': 'station-tv',
      'DOCTOR_CABIN': 'station-cabin',
      'BILLING_PHARMACY': 'station-billing',
      'INHOUSE_PHARMACY': 'station-pharmacy',
      'ADMIN_DASHBOARD': 'station-admin'
    };

    Object.keys(tabMap).forEach(key => {
      const btn = document.getElementById(tabMap[key]);
      if (btn) btn.classList.toggle('active', key === stationId);
    });

    Object.keys(sectionMap).forEach(key => {
      const sec = document.getElementById(sectionMap[key]);
      if (sec) sec.classList.toggle('active', key === stationId);
    });

    if (stationId === 'PATIENT_KIOSK') {
      this.renderKioskStation();
      this.scheduleNavAutoHideOnLeave();
    } else if (stationId === 'CABIN_QUEUE_TV') {
      this.renderTvStation();
      this.scheduleNavAutoHideOnLeave();
    } else if (stationId === 'DOCTOR_CABIN') {
      this.showWorkstationNav();
      this.renderCabinStation();
    } else if (stationId === 'BILLING_PHARMACY') {
      this.showWorkstationNav();
      this.renderBillingStation();
    } else if (stationId === 'INHOUSE_PHARMACY') {
      this.showWorkstationNav();
      this.renderPharmacyStation();
    } else if (stationId === 'ADMIN_DASHBOARD') {
      this.showWorkstationNav();
      this.renderCurrentScreen();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleSound() {
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
  },

  openKioskLockModal() {
    const modal = document.getElementById("kiosk-lock-modal");
    if (modal) {
      modal.classList.add("open");
      this.pinInput = '';
      this.updatePinDots();
      const err = document.getElementById("kiosk-pin-error");
      if (err) err.textContent = '';
    }
  },

  closeKioskLockModal() {
    const modal = document.getElementById("kiosk-lock-modal");
    if (modal) modal.classList.remove("open");
  },

  enterPinDigit(digit) {
    if (this.pinInput.length < 4) {
      this.pinInput += digit;
      this.updatePinDots();
      if (this.pinInput.length === 4) {
        setTimeout(() => this.verifyKioskPin(), 180);
      }
    }
  },

  clearPinDigits() {
    this.pinInput = '';
    this.updatePinDots();
    const err = document.getElementById("kiosk-pin-error");
    if (err) err.textContent = '';
  },

  backspacePinDigit() {
    if (this.pinInput.length > 0) {
      this.pinInput = this.pinInput.slice(0, -1);
      this.updatePinDots();
    }
  },

  updatePinDots() {
    const dots = document.querySelectorAll("#kiosk-pin-dots .pin-dot");
    dots.forEach((dot, idx) => {
      if (idx < this.pinInput.length) {
        dot.style.background = "#0D9488";
        dot.style.boxShadow = "0 0 10px rgba(13, 148, 136, 0.7)";
      } else {
        dot.style.background = "#334155";
        dot.style.boxShadow = "none";
      }
    });
  },

  verifyKioskPin() {
    const correctPin = this.store.kioskPin || "1234";
    const err = document.getElementById("kiosk-pin-error");
    if (this.pinInput === correctPin) {
      this.closeKioskLockModal();
      this.showToast("Kiosk terminal unlocked successfully", "success");
      this.switchStation("ADMIN_DASHBOARD");
    } else {
      if (err) err.textContent = "Incorrect PIN. Default is 1234.";
      if (window.clinicAudio) window.clinicAudio.playAlert();
      setTimeout(() => {
        this.clearPinDigits();
      }, 700);
    }
  },

  resetDemoData() {
    if (confirm("Reset all demo data to default clinic state? All newly created tokens, invoices, and mock records will reset.")) {
      localStorage.clear();
      window.clinicStore = new ClinicStore();
      this.store = window.clinicStore;
      this.showToast("All demo data reset to initial clinic state.", "success");
      this.switchStation(this.currentStation);
    }
  },

  /* ==========================================================================
     STATION 1: PATIENT SELF-SERVICE KIOSK CONTROLLER
     ========================================================================== */

  setKioskPathway(pathway) {
    this.kioskState.pathway = pathway;
    this.kioskState.step = pathway === 'WALK_IN' ? 1 : 0;
    this.kioskState.checkinResult = null;
    this.kioskState.checkinPhone = '';
    this.renderKioskStation();
  },

  setKioskStep(step) {
    this.kioskState.step = step;
    this.renderKioskStation();
  },

  toggleKioskSymptom(symptomId) {
    const idx = this.kioskState.selectedSymptoms.indexOf(symptomId);
    if (idx > -1) {
      this.kioskState.selectedSymptoms.splice(idx, 1);
    } else {
      this.kioskState.selectedSymptoms.push(symptomId);
    }
    this.renderKioskStation();
  },

  selectKioskChair(chairId) {
    this.kioskState.selectedChair = chairId;
    this.renderKioskStation();
  },

  setKioskActiveInput(field) {
    this.kioskState.activeInput = field;
    this.renderKioskStation();
  },

  enterKioskNum(num) {
    const active = this.kioskState.activeInput || 'phone';
    if (active === 'phone') {
      if (this.kioskState.phone.length < 15) this.kioskState.phone += num;
    } else if (active === 'age') {
      if (this.kioskState.age.length < 3) this.kioskState.age += num;
    } else if (active === 'checkinPhone') {
      if (this.kioskState.checkinPhone.length < 15) this.kioskState.checkinPhone += num;
    } else if (active === 'emergencyPhone') {
      if (this.kioskState.emergencyPhone.length < 15) this.kioskState.emergencyPhone += num;
    }
    this.renderKioskStation();
  },

  backspaceKioskNum() {
    const active = this.kioskState.activeInput || 'phone';
    if (active === 'phone' && this.kioskState.phone.length > 0) {
      this.kioskState.phone = this.kioskState.phone.slice(0, -1);
    } else if (active === 'age' && this.kioskState.age.length > 0) {
      this.kioskState.age = this.kioskState.age.slice(0, -1);
    } else if (active === 'checkinPhone' && this.kioskState.checkinPhone.length > 0) {
      this.kioskState.checkinPhone = this.kioskState.checkinPhone.slice(0, -1);
    } else if (active === 'emergencyPhone' && this.kioskState.emergencyPhone.length > 0) {
      this.kioskState.emergencyPhone = this.kioskState.emergencyPhone.slice(0, -1);
    }
    this.renderKioskStation();
  },

  clearKioskNum() {
    const active = this.kioskState.activeInput || 'phone';
    if (active === 'phone') this.kioskState.phone = '';
    else if (active === 'age') this.kioskState.age = '';
    else if (active === 'checkinPhone') this.kioskState.checkinPhone = '';
    else if (active === 'emergencyPhone') this.kioskState.emergencyPhone = '';
    this.renderKioskStation();
  },

  setKioskGender(gender) {
    this.kioskState.gender = gender;
    this.renderKioskStation();
  },

  updateKioskPain(val) {
    this.kioskState.painScore = parseInt(val, 10) || 0;
    this.renderKioskStation();
  },

  setKioskPaymentMethod(method) {
    this.kioskState.paymentMethod = method;
    this.renderKioskStation();
  },

  selectEmergencyProcedure(procId) {
    this.kioskState.selectedEmergencyProc = procId;
    this.renderKioskStation();
  },

  submitEmergencyKiosk() {
    const nameInput = document.getElementById("kiosk-emg-name");
    const name = nameInput ? nameInput.value.trim() : (this.kioskState.emergencyName || "Emergency Patient");
    const phone = this.kioskState.emergencyPhone || "555-0911";

    if (!name) {
      this.showToast("Please enter patient name for emergency triage", "error");
      if (nameInput) nameInput.focus();
      return;
    }

    const procId = this.kioskState.selectedEmergencyProc || "emg-1";
    const emergencyRecord = this.store.emergencyRegister(name, phone, procId);

    if (window.clinicAudio) {
      window.clinicAudio.announceToken(emergencyRecord.token.token, emergencyRecord.chair.name, emergencyRecord.chair.doctor);
    }

    this.launchConfetti();

    this.showThermalReceiptModal({
      token: emergencyRecord.token.token,
      name: emergencyRecord.patient.name,
      phone: emergencyRecord.patient.phone,
      chairName: emergencyRecord.chair.name,
      doctor: emergencyRecord.chair.doctor,
      priority: "CRITICAL 1 (EMERGENCY)",
      complaint: emergencyRecord.procedure.name,
      fee: emergencyRecord.procedure.estFee,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    });
  },

  searchAppointmentKiosk() {
    const phone = (this.kioskState.checkinPhone || "").replace(/\D/g, "");
    if (!phone || phone.length < 4) {
      this.showToast("Please enter at least 4 digits of your phone number", "warning");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const match = this.store.appointments.find(apt => {
      const pt = this.store.getPatient(apt.patientId);
      if (!pt) return false;
      const ptDigits = (pt.phone || "").replace(/\D/g, "");
      return ptDigits.includes(phone) && apt.date === todayStr && apt.status !== "Completed" && apt.status !== "Cancelled";
    });

    if (match) {
      const pt = this.store.getPatient(match.patientId);
      this.kioskState.checkinResult = { appointment: match, patient: pt };
    } else {
      this.kioskState.checkinResult = { notFound: true };
    }
    this.renderKioskStation();
  },

  confirmAppointmentCheckin() {
    if (!this.kioskState.checkinResult || !this.kioskState.checkinResult.appointment) return;
    const { appointment, patient } = this.kioskState.checkinResult;

    let chairId = "chair-1";
    if (appointment.doctor.includes("Sarah") || appointment.type.toLowerCase().includes("ortho")) chairId = "chair-2";
    else if (appointment.doctor.includes("Alex") || appointment.type.toLowerCase().includes("surg")) chairId = "chair-3";
    else if (appointment.doctor.includes("Olivia") || appointment.type.toLowerCase().includes("clean")) chairId = "chair-4";

    const tokenItem = this.store.addQueuePatient({
      patientId: patient.id,
      name: patient.name,
      phone: patient.phone,
      chair: chairId,
      chiefComplaint: `Appointment: ${appointment.type}`,
      painScore: 2,
      priority: "Normal"
    });

    appointment.status = "In-Queue";
    this.store.saveAppointments();

    const chairObj = this.store.chairs.find(c => c.id === chairId) || { name: "Chair 1", doctor: appointment.doctor };

    if (window.clinicAudio) {
      window.clinicAudio.announceToken(tokenItem.token, chairObj.name, chairObj.doctor);
    }

    this.launchConfetti();

    this.showThermalReceiptModal({
      token: tokenItem.token,
      name: patient.name,
      phone: patient.phone,
      chairName: chairObj.name,
      doctor: chairObj.doctor,
      priority: "Scheduled Check-In",
      complaint: appointment.type,
      fee: 45,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    });
  },

  issueWalkinToken() {
    const nameInput = document.getElementById("kiosk-walkin-name");
    const name = (nameInput ? nameInput.value.trim() : "") || this.kioskState.name.trim() || "Walk-In Patient";
    const phone = this.kioskState.phone.trim() || "555-0100";
    const age = this.kioskState.age || "30";
    const gender = this.kioskState.gender || "Male";
    const chairId = this.kioskState.selectedChair || "chair-1";
    const painScore = this.kioskState.painScore || 3;

    let patient = this.store.patients.find(p => p.phone === phone || p.name.toLowerCase() === name.toLowerCase());
    if (!patient) {
      patient = {
        id: "pt-" + Date.now(),
        mrn: this.store.getNextMRN(),
        name: name,
        phone: phone,
        age: parseInt(age, 10),
        gender: gender,
        allergies: "None",
        medicalConditions: "None",
        currentMedications: "None",
        balance: 0,
        registrationDate: new Date().toISOString().split("T")[0],
        chartData: {}
      };
      this.store.patients.unshift(patient);
      this.store.savePatients();
    }

    const symptomNames = (this.kioskState.selectedSymptoms || []).map(id => {
      const sym = (window.DENTAL_SYMPTOM_OPTIONS || []).find(s => s.id === id);
      return sym ? sym.name : id;
    });
    const complaintText = symptomNames.length > 0 ? symptomNames.join(", ") : "Walk-in Dental Consultation";

    const tokenItem = this.store.addQueuePatient({
      patientId: patient.id,
      name: patient.name,
      phone: patient.phone,
      chair: chairId,
      chiefComplaint: complaintText,
      painScore: painScore,
      priority: painScore >= 8 ? "Urgent" : "Normal"
    });

    const chairObj = this.store.chairs.find(c => c.id === chairId) || { name: "Operatory Chair", doctor: "On-Duty Dentist" };

    if (window.clinicAudio) {
      window.clinicAudio.announceToken(tokenItem.token, chairObj.name, chairObj.doctor);
    }

    this.launchConfetti();

    let totalEst = 40;
    (this.kioskState.selectedSymptoms || []).forEach(id => {
      const sym = (window.DENTAL_SYMPTOM_OPTIONS || []).find(s => s.id === id);
      if (sym) totalEst = Math.max(totalEst, sym.estFee);
    });

    this.showThermalReceiptModal({
      token: tokenItem.token,
      name: patient.name,
      phone: patient.phone,
      chairName: chairObj.name,
      doctor: chairObj.doctor,
      priority: painScore >= 8 ? "Urgent Priority" : "Standard Walk-In",
      complaint: complaintText,
      fee: totalEst,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    });
  },

  showThermalReceiptModal(data) {
    const container = document.getElementById("thermal-receipt-container");
    const modal = document.getElementById("kiosk-thermal-modal");
    if (!container || !modal) return;

    let countdown = 10;
    container.innerHTML = `
      <div class="thermal-slip-card animate-fade-in">
        <div style="text-align: center; border-bottom: 1px dashed #CBD5E1; padding-bottom: 12px; margin-bottom: 12px;">
          <div style="font-size: 1.8rem; line-height: 1;">🦷</div>
          <h3 style="font-size: 1.15rem; font-weight: 800; margin: 4px 0 2px 0;">SMILE DENTAL & ORTHO</h3>
          <p style="font-size: 0.72rem; color: #64748B; margin: 0;">124 Healthcare Plaza, Suite 400 • (555) 019-2834</p>
          <p style="font-size: 0.7rem; color: #94A3B8; margin: 2px 0 0 0;">PATIENT QUEUE ACCESS TOKEN</p>
        </div>

        <div style="text-align: center; margin: 16px 0; background: #F1F5F9; padding: 14px 10px; border-radius: 6px; border: 1px dashed #94A3B8;">
          <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: #475569; letter-spacing: 1px;">YOUR TOKEN NUMBER</div>
          <div style="font-size: 3.4rem; font-weight: 900; color: #0D9488; font-family: 'JetBrains Mono', monospace; line-height: 1.1; margin: 6px 0;">
            ${data.token}
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; color: #0F172A;">${data.chairName}</div>
          <div style="font-size: 0.75rem; color: #0284C7;">${data.doctor}</div>
        </div>

        <div style="font-size: 0.78rem; line-height: 1.6; border-bottom: 1px dashed #CBD5E1; padding-bottom: 10px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Patient:</span>
            <strong style="color: #0F172A;">${data.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Phone:</span>
            <span>${data.phone}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Priority:</span>
            <span style="font-weight: 700; color: ${data.priority.includes('CRITICAL') || data.priority.includes('Urgent') ? '#DC2626' : '#0D9488'};">${data.priority}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Chief Concern:</span>
            <span style="max-width: 170px; text-align: right; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${data.complaint}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Est. Consultation:</span>
            <strong>${data.fee}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #64748B;">Issued Time:</span>
            <span>${data.time}</span>
          </div>
        </div>

        <div style="text-align: center; margin: 12px 0 8px 0;">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; letter-spacing: 3px; color: #334155;">||| | ||||| || |||| |||||| | |||</div>
          <div style="font-size: 0.68rem; color: #94A3B8; margin-top: 2px;">Please relax in Lounge. Watch Queue TV.</div>
        </div>

        <div style="text-align: center; margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary btn-sm" onclick="window.print()" style="width: 100%;">
            <span>🖨️</span> Print Receipt Slip
          </button>
          <button class="btn btn-outline btn-sm" onclick="app.closeThermalReceiptModal()" style="width: 100%;">
            <span>✓</span> Done (Closing in <span id="slip-countdown">${countdown}</span>s)
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");

    if (this.kioskCountdownTimer) clearInterval(this.kioskCountdownTimer);
    this.kioskCountdownTimer = setInterval(() => {
      countdown--;
      const el = document.getElementById("slip-countdown");
      if (el) el.textContent = countdown;
      if (countdown <= 0) {
        clearInterval(this.kioskCountdownTimer);
        this.closeThermalReceiptModal();
      }
    }, 1000);
  },

  closeThermalReceiptModal() {
    if (this.kioskCountdownTimer) clearInterval(this.kioskCountdownTimer);
    const modal = document.getElementById("kiosk-thermal-modal");
    if (modal) modal.classList.remove("open");

    this.kioskState = {
      pathway: 'WALK_IN',
      step: 0,
      selectedSymptoms: [],
      selectedChair: 'chair-1',
      phone: '',
      name: '',
      age: '',
      gender: 'Male',
      painScore: 3,
      paymentMethod: 'reception',
      activeInput: 'phone',
      selectedEmergencyProc: 'emg-1',
      emergencyName: '',
      emergencyPhone: '',
      checkinPhone: '',
      checkinResult: null,
      lastIssuedToken: null
    };

    if (this.currentStation === 'PATIENT_KIOSK') {
      this.renderKioskStation();
    }
  },

  launchConfetti() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "99999";
    container.style.overflow = "hidden";
    document.body.appendChild(container);

    const colors = ["#0D9488", "#0284C7", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.style.position = "absolute";
      piece.style.width = Math.random() * 12 + 6 + "px";
      piece.style.height = Math.random() * 10 + 6 + "px";
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.top = "-20px";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.opacity = Math.random() + 0.5;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      piece.style.transition = `all ${Math.random() * 2 + 1.5}s ease-out`;
      container.appendChild(piece);

      setTimeout(() => {
        piece.style.top = "105vh";
        piece.style.left = `${parseFloat(piece.style.left) + (Math.random() * 20 - 10)}vw`;
        piece.style.transform = `rotate(${Math.random() * 720}deg)`;
        piece.style.opacity = "0";
      }, 50);
    }

    setTimeout(() => {
      container.remove();
    }, 3500);
  },

  renderKioskStation() {
    const mount = document.getElementById("kiosk-main-mount");
    if (!mount) return;

    const { pathway, step } = this.kioskState;

    // Header HTML
    const headerHtml = `
      <div class="kiosk-header">
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; width: 100%;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="font-size: 2.2rem; background: rgba(13,148,136,0.1); width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">🦷</div>
            <div>
              <h1 style="font-size: 1.5rem; font-weight: 900; color: #0F172A; margin: 0; letter-spacing: -0.5px;">Smile Dental & Orthodontics</h1>
              <p style="font-size: 0.85rem; color: #64748B; margin: 2px 0 0 0;">Touchscreen Patient Intake & Token Terminal</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${(step > 0 || pathway !== 'WALK_IN') ? `
              <button class="btn btn-outline" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(0);" style="font-size: 0.9rem; padding: 10px 18px;">
                <span>🏠</span> Return to Welcome
              </button>
            ` : ''}
            <div style="background: #F1F5F9; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 0.85rem; color: #0F172A; display: flex; align-items: center; gap: 8px;">
              <span>🕒</span> ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        ${pathway === 'WALK_IN' && step > 0 ? `
          <div class="kiosk-progress-steps">
            <div class="kiosk-step ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}">
              <div class="kiosk-step-number">${step > 1 ? '✓' : '1'}</div>
              <div class="kiosk-step-label">Concern</div>
            </div>
            <div class="kiosk-step ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}">
              <div class="kiosk-step-number">${step > 2 ? '✓' : '2'}</div>
              <div class="kiosk-step-label">Chair</div>
            </div>
            <div class="kiosk-step ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}">
              <div class="kiosk-step-number">${step > 3 ? '✓' : '3'}</div>
              <div class="kiosk-step-label">Your Info</div>
            </div>
            <div class="kiosk-step ${step >= 4 ? (step === 4 ? 'active' : 'completed') : ''}">
              <div class="kiosk-step-number">${step > 4 ? '✓' : '4'}</div>
              <div class="kiosk-step-label">Pain Level</div>
            </div>
            <div class="kiosk-step ${step >= 5 ? 'active' : ''}">
              <div class="kiosk-step-number">5</div>
              <div class="kiosk-step-label">Token</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    let bodyHtml = '';

    // ================= STEP 0: WELCOME & 3 PATHWAYS =================
    if (step === 0 && pathway === 'WALK_IN') {
      bodyHtml = `
        <div style="max-width: 1200px; margin: 30px auto; padding: 0 20px;">
          <div style="text-align: center; margin-bottom: 36px;">
            <h2 style="font-size: 2.2rem; font-weight: 900; color: #0F172A; margin-bottom: 8px;">Welcome! Please Touch Your Visit Reason</h2>
            <p style="font-size: 1.1rem; color: #64748B;">Self-service registration, fast-track emergency intake, and appointment check-in</p>
          </div>

          <div class="kiosk-pathways-grid">
            <!-- 1. Emergency Pass -->
            <div class="kiosk-pathway-card emergency" onclick="app.setKioskPathway('EMERGENCY_TRIAGE')">
              <span class="pathway-badge">Fast-Track Priority 1</span>
              <div class="pathway-icon">🚨</div>
              <h3 class="pathway-title">Emergency Dental Triage</h3>
              <p class="pathway-desc">Acute severe toothache, facial swelling/abscess, knocked-out (avulsed) tooth, uncontrollable bleeding, or broken braces wire trauma.</p>
              <div class="pathway-btn-text">Touch for Emergency Triage →</div>
            </div>

            <!-- 2. Walk-In Consultation -->
            <div class="kiosk-pathway-card walkin" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(1);">
              <span class="pathway-badge">Same-Day Walk-In</span>
              <div class="pathway-icon">🦷</div>
              <h3 class="pathway-title">Direct Walk-In Consultation</h3>
              <p class="pathway-desc">Routine dental checkup, cavity filling, dental scaling/cleaning, gum discomfort, new braces consultation, or cosmetic smile assessment.</p>
              <div class="pathway-btn-text">Touch for Walk-In Queue →</div>
            </div>

            <!-- 3. Pre-Booked Appointment -->
            <div class="kiosk-pathway-card checkin" onclick="app.setKioskPathway('CHECKIN_SEARCH')">
              <span class="pathway-badge">Pre-Booked Patient</span>
              <div class="pathway-icon">📅</div>
              <h3 class="pathway-title">Appointment Check-In</h3>
              <p class="pathway-desc">Already scheduled an appointment for today? Enter your mobile phone number on touch keypad to verify and get queue token.</p>
              <div class="pathway-btn-text">Touch to Check-In with Phone →</div>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #64748B; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; gap: 16px;">
            <span>🔊 Voice assistance enabled</span>
            <span>•</span>
            <span>📱 Large touch-screen friendly</span>
            <span>•</span>
            <span>🔒 HIPAA Protected</span>
          </div>
        </div>
      `;
    }
    // ================= EMERGENCY TRIAGE =================
    else if (pathway === 'EMERGENCY_TRIAGE') {
      const selectedProc = this.kioskState.selectedEmergencyProc || 'emg-1';
      bodyHtml = `
        <div style="max-width: 1000px; margin: 20px auto; padding: 0 20px;">
          <div style="background: #FEF2F2; border: 2px solid #F87171; border-radius: var(--radius-xl); padding: 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 16px;">
            <div style="font-size: 3rem;">🚨</div>
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 900; color: #991B1B; margin: 0 0 4px 0;">Urgent Dental Trauma & Emergency Triage</h2>
              <p style="font-size: 0.95rem; color: #B91C1C; margin: 0;">Select your acute condition to bypass standard queue for immediate Operatory Chair assignment:</p>
            </div>
          </div>

          <div class="kiosk-symptoms-grid" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 24px;">
            ${(window.EMERGENCY_DENTAL_PROCEDURES || []).map(proc => `
              <div class="kiosk-symptom-card ${selectedProc === proc.id ? 'selected' : ''}" onclick="app.selectEmergencyProcedure('${proc.id}')" style="${selectedProc === proc.id ? 'border-color: #DC2626; background: #FEF2F2;' : ''}">
                <div class="symptom-icon">${proc.icon}</div>
                <div class="symptom-name" style="color: #991B1B; font-weight: 800;">${proc.name}</div>
                <div style="font-size: 0.8rem; color: #64748B; margin: 6px 0;">Assigned: <strong>${proc.assignedChair}</strong> • Priority: <strong style="color: #DC2626;">Immediate</strong></div>
                <div class="symptom-fee">Est. Triage: ${proc.estFee}</div>
              </div>
            `).join('')}
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: var(--radius-xl); padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #0F172A; margin-bottom: 16px;">Emergency Patient Quick Contact</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; color: #475569; margin-bottom: 6px;">Patient Full Name *</label>
                <input type="text" id="kiosk-emg-name" class="form-control" style="font-size: 1.1rem; padding: 12px 14px;" placeholder="e.g. John Doe" value="${this.kioskState.emergencyName || ''}" oninput="app.kioskState.emergencyName = this.value">
              </div>
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; color: #475569; margin-bottom: 6px;">Mobile Phone Number</label>
                <div class="kiosk-phone-display ${this.kioskState.activeInput === 'emergencyPhone' ? 'active' : ''}" onclick="app.setKioskActiveInput('emergencyPhone')" style="height: 50px; font-size: 1.2rem;">
                  ${this.kioskState.emergencyPhone || '<span style="color:#94A3B8;">Touch to enter phone</span>'}
                </div>
              </div>
            </div>

            <!-- Virtual Numpad for Phone -->
            <div style="max-width: 320px; margin: 0 auto 16px auto;">
              <div class="kiosk-numpad-grid">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="kiosk-num-key" onclick="app.enterKioskNum('${n}')">${n}</button>`).join('')}
                <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
                <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
                <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
              </div>
            </div>

            <div style="text-align: center;">
              <button class="btn btn-danger btn-lg" onclick="app.submitEmergencyKiosk()" style="font-size: 1.2rem; padding: 16px 36px; border-radius: 9999px; box-shadow: 0 10px 25px rgba(220,38,38,0.3);">
                🚨 ISSUE IMMEDIATE EMERGENCY TOKEN (EMG)
              </button>
            </div>
          </div>
        </div>
      `;
    }
    // ================= APPOINTMENT CHECK-IN SEARCH =================
    else if (pathway === 'CHECKIN_SEARCH') {
      const res = this.kioskState.checkinResult;
      bodyHtml = `
        <div style="max-width: 800px; margin: 30px auto; padding: 0 20px;">
          <div style="text-align: center; margin-bottom: 28px;">
            <div style="font-size: 3rem; margin-bottom: 8px;">📅</div>
            <h2 style="font-size: 2rem; font-weight: 900; color: #0F172A; margin-bottom: 6px;">Pre-Booked Appointment Check-In</h2>
            <p style="font-size: 1rem; color: #64748B;">Enter your registered 10-digit mobile phone number using the touch keypad:</p>
          </div>

          <!-- Phone Display -->
          <div class="kiosk-phone-display active" onclick="app.setKioskActiveInput('checkinPhone')" style="margin-bottom: 20px;">
            ${this.kioskState.checkinPhone || '<span style="color:#94A3B8;">_ _ _ - _ _ _ - _ _ _ _</span>'}
          </div>

          <!-- Touch Numpad -->
          <div style="max-width: 320px; margin: 0 auto 24px auto;">
            <div class="kiosk-numpad-grid">
              ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="kiosk-num-key" onclick="app.enterKioskNum('${n}')">${n}</button>`).join('')}
              <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
              <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
              <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
            </div>
          </div>

          <div style="text-align: center; margin-bottom: 28px;">
            <button class="btn btn-primary btn-lg" onclick="app.searchAppointmentKiosk()" style="font-size: 1.1rem; padding: 14px 40px; border-radius: 9999px;">
              🔍 Search My Appointment
            </button>
          </div>

          <!-- Search Results Area -->
          ${res ? (
            res.appointment ? `
              <div class="card animate-fade-in" style="background: #F0FDF4; border: 2px solid #22C55E; padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                  <div>
                    <span class="badge badge-teal" style="font-size: 0.8rem;">Appointment Found</span>
                    <h3 style="font-size: 1.4rem; font-weight: 800; color: #166534; margin: 4px 0 0 0;">${res.patient.name}</h3>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.5rem; font-weight: 900; color: #15803D;">🕒 ${res.appointment.time}</div>
                    <div style="font-size: 0.85rem; color: #166534;">Today</div>
                  </div>
                </div>

                <div style="background: #FFFFFF; border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 20px; font-size: 0.95rem; line-height: 1.6;">
                  <div><strong>Doctor / Specialist:</strong> ${res.appointment.doctor}</div>
                  <div><strong>Procedure / Reason:</strong> ${res.appointment.type}</div>
                  <div><strong>Patient Mobile:</strong> ${res.patient.phone}</div>
                </div>

                <div style="text-align: center;">
                  <button class="btn btn-primary btn-lg" onclick="app.confirmAppointmentCheckin()" style="font-size: 1.2rem; padding: 16px 36px; border-radius: 9999px; width: 100%; box-shadow: 0 10px 20px rgba(13,148,136,0.25);">
                    🎫 Confirm Arrival & Print Queue Token
                  </button>
                </div>
              </div>
            ` : `
              <div class="card animate-fade-in" style="background: #FFFBEB; border: 2px solid #F59E0B; text-align: center; padding: 28px;">
                <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #92400E; margin-bottom: 6px;">No Appointment Found Today</h3>
                <p style="font-size: 0.95rem; color: #B45309; margin-bottom: 20px;">We couldn't find a scheduled appointment matching this phone number for today.</p>
                <button class="btn btn-amber" onclick="app.setKioskPathway('WALK_IN'); app.setKioskStep(1);" style="font-size: 1rem; padding: 12px 28px; border-radius: 9999px;">
                  Join as Walk-In Patient Instead →
                </button>
              </div>
            `
          ) : ''}
        </div>
      `;
    }
    // ================= WALK-IN FLOW =================
    else if (pathway === 'WALK_IN') {
      // Step 1: Dental Chief Complaint / Symptoms
      if (step === 1) {
        bodyHtml = `
          <div style="max-width: 1200px; margin: 24px auto; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <h2 style="font-size: 1.9rem; font-weight: 900; color: #0F172A; margin-bottom: 6px;">What is Your Primary Dental Concern Today?</h2>
              <p style="font-size: 1.05rem; color: #64748B;">Touch one or more cards to describe your symptoms or requested service:</p>
            </div>

            <div class="kiosk-symptoms-grid">
              ${(window.DENTAL_SYMPTOM_OPTIONS || []).map(sym => {
                const isSelected = (this.kioskState.selectedSymptoms || []).includes(sym.id);
                return `
                  <div class="kiosk-symptom-card ${isSelected ? 'selected' : ''}" onclick="app.toggleKioskSymptom('${sym.id}')">
                    <div class="symptom-icon">${sym.icon}</div>
                    <div class="symptom-name">${sym.name}</div>
                    <div class="symptom-dept">${sym.dept}</div>
                    <div class="symptom-fee">Est. From ${sym.estFee}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="kiosk-actions-bar">
              <button class="btn btn-outline btn-lg" onclick="app.setKioskStep(0)">
                ← Back to Welcome
              </button>
              <button class="btn btn-primary btn-lg" onclick="app.setKioskStep(2)">
                Next: Select Operatory Chair & Doctor (${this.kioskState.selectedSymptoms.length} selected) →
              </button>
            </div>
          </div>
        `;
      }
      // Step 2: Chair & Doctor Selection
      else if (step === 2) {
        const chairs = [
          { id: 'chair-1', name: 'Chair 1 — General Operatory', doc: 'Dr. Marcus Vance, DDS', spec: 'General & Restorative Dentistry', icon: '🩺', wait: '3 waiting (~15m)' },
          { id: 'chair-2', name: 'Chair 2 — Ortho Suite', doc: 'Dr. Sarah Jenkins, BDS, M.S.', spec: 'Orthodontics, Braces & Aligners', icon: '✨', wait: '1 waiting (~5m)' },
          { id: 'chair-3', name: 'Chair 3 — Surgical Bay', doc: 'Dr. Alex Chen, DMD, FICOI', spec: 'Oral Surgery, Extractions & Implants', icon: '🔬', wait: '2 waiting (~10m)' },
          { id: 'chair-4', name: 'Chair 4 — Hygiene Station', doc: 'Dr. Olivia Taylor, RDH', spec: 'Dental Scaling, Prophylaxis & Whitening', icon: '🪥', wait: '0 waiting (Immediate)' }
        ];

        bodyHtml = `
          <div style="max-width: 1200px; margin: 24px auto; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <h2 style="font-size: 1.9rem; font-weight: 900; color: #0F172A; margin-bottom: 6px;">Select Operatory Chair & Specialist</h2>
              <p style="font-size: 1.05rem; color: #64748B;">Choose your preferred dental specialist and operatory suite:</p>
            </div>

            <div class="kiosk-chairs-grid">
              ${chairs.map(c => `
                <div class="kiosk-chair-card ${this.kioskState.selectedChair === c.id ? 'selected' : ''}" onclick="app.selectKioskChair('${c.id}')">
                  <div class="chair-icon">${c.icon}</div>
                  <div class="chair-name">${c.name}</div>
                  <div class="chair-doc">${c.doc}</div>
                  <div class="chair-spec">${c.spec}</div>
                  <div class="chair-wait">🕒 ${c.wait}</div>
                </div>
              `).join('')}
            </div>

            <div class="kiosk-actions-bar">
              <button class="btn btn-outline btn-lg" onclick="app.setKioskStep(1)">
                ← Back to Symptoms
              </button>
              <button class="btn btn-primary btn-lg" onclick="app.setKioskStep(3)">
                Next: Enter Patient Details →
              </button>
            </div>
          </div>
        `;
      }
      // Step 3: Patient Intake Details with Touch Numpad
      else if (step === 3) {
        bodyHtml = `
          <div style="max-width: 1000px; margin: 24px auto; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="font-size: 1.9rem; font-weight: 900; color: #0F172A; margin-bottom: 6px;">Enter Patient Contact Information</h2>
              <p style="font-size: 1.05rem; color: #64748B;">Touch fields and use virtual on-screen keypad to enter numbers easily:</p>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: start;">
              <!-- Left Form -->
              <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: var(--radius-xl); padding: 28px; box-shadow: var(--shadow-sm);">
                <!-- Full Name -->
                <div style="margin-bottom: 20px;">
                  <label style="display: block; font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 6px;">Patient Full Name *</label>
                  <input type="text" id="kiosk-walkin-name" class="form-control" style="font-size: 1.15rem; padding: 14px 16px;" placeholder="e.g. Sarah Connor" value="${this.kioskState.name}" oninput="app.kioskState.name = this.value">
                </div>

                <!-- Mobile Phone -->
                <div style="margin-bottom: 20px;">
                  <label style="display: block; font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 6px;">Mobile Phone Number *</label>
                  <div class="kiosk-phone-display ${this.kioskState.activeInput === 'phone' ? 'active' : ''}" onclick="app.setKioskActiveInput('phone')">
                    ${this.kioskState.phone || '<span style="color:#94A3B8;">Touch keypad on right to enter phone</span>'}
                  </div>
                </div>

                <!-- Age & Gender -->
                <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 16px;">
                  <div>
                    <label style="display: block; font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 6px;">Age</label>
                    <div class="kiosk-phone-display ${this.kioskState.activeInput === 'age' ? 'active' : ''}" onclick="app.setKioskActiveInput('age')" style="font-size: 1.3rem;">
                      ${this.kioskState.age || '<span style="color:#94A3B8;">Age</span>'}
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 6px;">Gender</label>
                    <div style="display: flex; gap: 8px;">
                      ${['Male', 'Female', 'Child'].map(g => `
                        <button type="button" class="btn ${this.kioskState.gender === g ? 'btn-primary' : 'btn-outline'}" onclick="app.setKioskGender('${g}')" style="flex: 1; padding: 12px 6px; font-size: 0.9rem;">
                          ${g}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Virtual Numpad -->
              <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: var(--radius-xl); padding: 24px; text-align: center; box-shadow: var(--shadow-sm);">
                <div style="font-size: 0.85rem; font-weight: 700; color: #64748B; margin-bottom: 12px; text-transform: uppercase;">
                  Touch Keypad (${this.kioskState.activeInput === 'age' ? 'Entering Age' : 'Entering Phone'})
                </div>
                <div class="kiosk-numpad-grid">
                  ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="kiosk-num-key" onclick="app.enterKioskNum('${n}')">${n}</button>`).join('')}
                  <button class="kiosk-num-key action-clear" onclick="app.clearKioskNum()">Clear</button>
                  <button class="kiosk-num-key" onclick="app.enterKioskNum('0')">0</button>
                  <button class="kiosk-num-key action-backspace" onclick="app.backspaceKioskNum()">⌫</button>
                </div>
              </div>
            </div>

            <div class="kiosk-actions-bar">
              <button class="btn btn-outline btn-lg" onclick="app.setKioskStep(2)">
                ← Back to Chair
              </button>
              <button class="btn btn-primary btn-lg" onclick="app.setKioskStep(4)">
                Next: Pain & Comfort Rating →
              </button>
            </div>
          </div>
        `;
      }
      // Step 4: Pain & Discomfort Rating
      else if (step === 4) {
        const score = this.kioskState.painScore || 0;
        let face = '😃';
        let desc = 'Mild Discomfort / None (Score 0-2)';
        let color = '#10B981';

        if (score >= 8) {
          face = '😭';
          desc = 'Unbearable / Acute Emergency Pain (Score 8-10)';
          color = '#DC2626';
        } else if (score >= 6) {
          face = '😣';
          desc = 'Severe / Throbbing Pain (Score 6-7)';
          color = '#F59E0B';
        } else if (score >= 3) {
          face = '😐';
          desc = 'Moderate Dull Ache (Score 3-5)';
          color = '#0284C7';
        }

        bodyHtml = `
          <div style="max-width: 800px; margin: 30px auto; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <h2 style="font-size: 2rem; font-weight: 900; color: #0F172A; margin-bottom: 6px;">How Would You Rate Your Dental Pain?</h2>
              <p style="font-size: 1.05rem; color: #64748B;">This helps our dental team prepare anesthetic and prioritize care:</p>
            </div>

            <div class="kiosk-pain-box">
              <div class="pain-face-display">${face}</div>
              <div class="pain-score-display" style="color: ${color};">${score} / 10</div>
              <div class="pain-description-label" style="color: ${color};">${desc}</div>

              <!-- Interactive Touch Slider -->
              <input type="range" class="pain-range-slider" min="0" max="10" step="1" value="${score}" oninput="app.updateKioskPain(this.value)">

              <!-- Quick Score Pills -->
              <div style="display: flex; justify-content: space-between; margin-top: 20px; gap: 6px;">
                ${[0,1,2,3,4,5,6,7,8,9,10].map(s => `
                  <button type="button" class="btn ${s === score ? 'btn-primary' : 'btn-outline'}" onclick="app.updateKioskPain(${s})" style="flex: 1; padding: 10px 0; font-size: 0.95rem; font-weight: 700;">
                    ${s}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="kiosk-actions-bar">
              <button class="btn btn-outline btn-lg" onclick="app.setKioskStep(3)">
                ← Back to Details
              </button>
              <button class="btn btn-primary btn-lg" onclick="app.setKioskStep(5)">
                Next: Review & Issue Token →
              </button>
            </div>
          </div>
        `;
      }
      // Step 5: Review & Issue Token
      else if (step === 5) {
        const chairObj = this.store.chairs.find(c => c.id === this.kioskState.selectedChair) || { name: 'Operatory Chair', doctor: 'On-Duty Specialist' };
        
        let estFee = 40;
        const complaintItems = (this.kioskState.selectedSymptoms || []).map(id => {
          const s = (window.DENTAL_SYMPTOM_OPTIONS || []).find(x => x.id === id);
          if (s) {
            estFee = Math.max(estFee, s.estFee);
            return s.name;
          }
          return id;
        });

        bodyHtml = `
          <div style="max-width: 800px; margin: 30px auto; padding: 0 20px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <h2 style="font-size: 2rem; font-weight: 900; color: #0F172A; margin-bottom: 6px;">Review & Issue Your Queue Token</h2>
              <p style="font-size: 1.05rem; color: #64748B;">Please confirm your check-in summary before entering queue:</p>
            </div>

            <div class="card" style="padding: 28px; margin-bottom: 24px; border: 2px solid #0D9488; box-shadow: var(--shadow-md);">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 1rem; line-height: 1.7;">
                <div>
                  <div style="color: #64748B; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Patient Name</div>
                  <div style="font-size: 1.25rem; font-weight: 800; color: #0F172A;">${this.kioskState.name || 'Walk-In Patient'}</div>
                  <div style="color: #475569; font-size: 0.9rem;">${this.kioskState.phone || 'Phone not provided'} • ${this.kioskState.age} yrs (${this.kioskState.gender})</div>
                </div>
                <div>
                  <div style="color: #64748B; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Assigned Operatory</div>
                  <div style="font-size: 1.25rem; font-weight: 800; color: #0284C7;">${chairObj.name}</div>
                  <div style="color: #475569; font-size: 0.9rem;">${chairObj.doctor}</div>
                </div>
                <div>
                  <div style="color: #64748B; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Chief Concern</div>
                  <div style="font-weight: 700; color: #0F172A;">${complaintItems.join(', ') || 'General Consultation'}</div>
                </div>
                <div>
                  <div style="color: #64748B; font-size: 0.85rem; font-weight: 700; text-transform: uppercase;">Pain Score / Triage</div>
                  <div>
                    <span class="badge ${this.kioskState.painScore >= 8 ? 'badge-red' : 'badge-teal'}" style="font-size: 0.9rem; padding: 4px 10px;">
                      Pain: ${this.kioskState.painScore} / 10 • ${this.kioskState.painScore >= 8 ? 'Urgent Priority' : 'Normal Queue'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Payment Preference -->
              <div style="border-top: 1px solid #E2E8F0; margin-top: 20px; padding-top: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 10px;">Payment Preference:</div>
                <div style="display: flex; gap: 12px;">
                  <button type="button" class="btn ${this.kioskState.paymentMethod === 'reception' ? 'btn-primary' : 'btn-outline'}" onclick="app.setKioskPaymentMethod('reception')" style="flex: 1; padding: 12px; font-size: 0.95rem;">
                    <span>🧾</span> Pay at Cashier Desk (Cash/Card)
                  </button>
                  <button type="button" class="btn ${this.kioskState.paymentMethod === 'kiosk' ? 'btn-primary' : 'btn-outline'}" onclick="app.setKioskPaymentMethod('kiosk')" style="flex: 1; padding: 12px; font-size: 0.95rem;">
                    <span>💳</span> Prepay via Kiosk Card Reader
                  </button>
                </div>
              </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px;">
              <button class="btn btn-primary btn-lg" onclick="app.issueWalkinToken()" style="font-size: 1.3rem; padding: 18px 48px; border-radius: 9999px; box-shadow: 0 12px 28px rgba(13,148,136,0.35);">
                🎫 PRINT TOKEN & ENTER QUEUE
              </button>
            </div>

            <div class="kiosk-actions-bar" style="margin-top: 0;">
              <button class="btn btn-outline" onclick="app.setKioskStep(4)">
                ← Back to Pain Rating
              </button>
            </div>
          </div>
        `;
      }
    }

    mount.innerHTML = headerHtml + bodyHtml;
  },

  /* ==========================================================================
     STATION 2: LOUNGE QUEUE TV DISPLAY CONTROLLER
     ========================================================================== */

  renderTvStation() {
    const mount = document.getElementById("tv-main-mount");
    if (!mount) return;

    // Determine active serving patient and waiting list
    const inConsult = this.store.queue.filter(q => q.status === "in-consultation" || q.status === "called");
    const activeServing = inConsult.length > 0 ? inConsult[0] : (this.store.queue[0] || {
      token: "D-104",
      name: "Robert Miller",
      chair: "chair-2",
      chiefComplaint: "Orthodontics",
      status: "in-consultation"
    });

    const waitingQueue = this.store.queue.filter(q => q.status === "waiting");

    const chairNames = {
      'chair-1': 'Chair 1 — General Operatory',
      'chair-2': 'Chair 2 — Orthodontics Suite',
      'chair-3': 'Chair 3 — Surgical Bay',
      'chair-4': 'Chair 4 — Hygiene Station'
    };

    const docNames = {
      'chair-1': 'Dr. Marcus Vance, DDS',
      'chair-2': 'Dr. Sarah Jenkins, BDS, M.S.',
      'chair-3': 'Dr. Alex Chen, DMD, FICOI',
      'chair-4': 'Dr. Olivia Taylor, RDH'
    };

    mount.innerHTML = `
      <div class="tv-container">
        <!-- TV Top Bar -->
        <div class="tv-header-bar">
          <div class="tv-brand">
            <div class="tv-brand-icon">🦷</div>
            <div>
              <h1>Smile Dental & Orthodontics</h1>
              <p>PATIENT LOUNGE LIVE QUEUE DISPLAY & AUDIO CHIME</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: #0F172A; border: 1px solid #1E293B; border-radius: 9999px; padding: 8px 18px; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: #38BDF8;">
              🕒 ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <button class="btn btn-outline btn-sm" onclick="app.tvRecallNextToken()" style="color: #38BDF8; border-color: #0284C7;">
              <span>📢</span> Re-Announce
            </button>
            <button class="btn btn-outline btn-sm" onclick="app.toggleTvFullscreen()" style="color: #94A3B8; border-color: #334155;">
              <span>⛶</span> Fullscreen
            </button>
          </div>
        </div>

        <!-- TV Main 2-Column Content -->
        <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 24px; align-items: start;">
          <!-- Left Column: Spotlight Hero -->
          <div>
            <div class="tv-now-serving-hero">
              <div class="tv-serving-label">● NOW SERVING</div>
              <div class="tv-serving-token">${activeServing.token}</div>
              <div class="tv-serving-destination" style="color: #38BDF8; font-size: 2rem; margin-bottom: 6px;">
                ${activeServing.name}
              </div>
              <div style="font-size: 1.4rem; font-weight: 800; color: #FFFFFF; margin-bottom: 4px;">
                ${chairNames[activeServing.chair] || 'Operatory Chair'}
              </div>
              <div style="font-size: 1.1rem; color: #94A3B8;">
                ${docNames[activeServing.chair] || 'Attending Dentist'}
              </div>

              <!-- Animated Voice Wave Bar -->
              <div style="display: flex; justify-content: center; align-items: flex-end; gap: 6px; height: 32px; margin-top: 24px;">
                <div style="width: 6px; height: 18px; background: #2DD4BF; border-radius: 4px; animation: pulse 1s infinite alternate;"></div>
                <div style="width: 6px; height: 28px; background: #2DD4BF; border-radius: 4px; animation: pulse 0.7s infinite alternate;"></div>
                <div style="width: 6px; height: 12px; background: #2DD4BF; border-radius: 4px; animation: pulse 1.2s infinite alternate;"></div>
                <div style="width: 6px; height: 32px; background: #2DD4BF; border-radius: 4px; animation: pulse 0.8s infinite alternate;"></div>
                <div style="width: 6px; height: 20px; background: #2DD4BF; border-radius: 4px; animation: pulse 1.1s infinite alternate;"></div>
              </div>
            </div>

            <!-- Call Simulator Toolbar -->
            <div style="background: #0F172A; border: 1px solid #1E293B; border-radius: var(--radius-lg); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 0.95rem; color: #94A3B8;">Staff Quick Callout Control:</span>
              <button class="btn btn-primary" onclick="app.tvRecallNextToken()" style="font-size: 0.95rem;">
                <span>📢</span> Announce & Call Next Waiting Patient
              </button>
            </div>
          </div>

          <!-- Right Column: 4-Chair Matrix & Waiting List -->
          <div>
            <!-- 4 Chairs Matrix -->
            <div class="tv-chairs-grid" style="grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px;">
              ${[
                { id: 'chair-1', name: 'Chair 1', doc: 'Dr. Marcus Vance' },
                { id: 'chair-2', name: 'Chair 2', doc: 'Dr. Sarah Jenkins' },
                { id: 'chair-3', name: 'Chair 3', doc: 'Dr. Alex Chen' },
                { id: 'chair-4', name: 'Chair 4', doc: 'Dr. Olivia Taylor' }
              ].map(c => {
                const chairPatient = this.store.queue.find(q => q.chair === c.id && (q.status === 'in-consultation' || q.status === 'called'));
                return `
                  <div class="tv-chair-card">
                    <div class="tv-chair-header">
                      <div class="tv-chair-title">${c.name}</div>
                      <span class="tv-chair-status ${chairPatient ? 'badge-teal' : 'badge-outline'}" style="color: ${chairPatient ? '#2DD4BF' : '#94A3B8'};">
                        ${chairPatient ? 'In Consultation' : 'Available'}
                      </span>
                    </div>
                    <div class="tv-chair-token">${chairPatient ? chairPatient.token : '—'}</div>
                    <div class="tv-chair-patient">${chairPatient ? chairPatient.name : 'Waiting for assignment'}</div>
                    <div style="font-size: 0.75rem; color: #64748B; margin-top: 4px;">${c.doc}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Waiting Queue Table -->
            <div style="background: #0B0F19; border: 1px solid #1E293B; border-radius: var(--radius-lg); overflow: hidden;">
              <div style="padding: 14px 18px; border-bottom: 1px solid #1E293B; font-weight: 800; font-size: 0.95rem; color: #38BDF8; display: flex; justify-content: space-between;">
                <span>NEXT IN LINE TO BE CALLED</span>
                <span>${waitingQueue.length} WAITING</span>
              </div>
              <table class="tv-waiting-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Destination</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  ${waitingQueue.length === 0 ? `
                    <tr><td colspan="4" style="text-align: center; color: #64748B; padding: 20px;">No patients currently in waiting lounge.</td></tr>
                  ` : waitingQueue.slice(0, 5).map(w => `
                    <tr>
                      <td style="font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #38BDF8;">${w.token}</td>
                      <td>${w.name}</td>
                      <td>${w.chair ? w.chair.replace('-', ' ').toUpperCase() : 'General'}</td>
                      <td><span class="badge ${w.priority === 'Urgent' || (w.token && w.token.startsWith('EMG')) ? 'badge-red' : 'badge-outline'}">${w.priority || 'Normal'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  tvRecallNextToken() {
    const nextWaiting = this.store.queue.find(q => q.status === "waiting");
    if (!nextWaiting) {
      this.showToast("No waiting patients in queue to call.", "info");
      return;
    }

    nextWaiting.status = "in-consultation";
    this.store.saveQueue();

    const chairObj = this.store.chairs.find(c => c.id === nextWaiting.chair) || { name: "Chair 1", doctor: "On-Duty Dentist" };

    if (window.clinicAudio) {
      window.clinicAudio.announceToken(nextWaiting.token, chairObj.name, chairObj.doctor);
    }

    this.showToast(`Called token ${nextWaiting.token} (${nextWaiting.name}) to ${chairObj.name}`, "success");
    this.renderTvStation();
  },

  toggleTvFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  },

  /* ==========================================================================
     STATION 3: DENTIST OPERATORY CABIN CONTROLLER
     ========================================================================== */

  renderCabinStation() {
    const mount = document.getElementById("cabin-main-mount");
    if (!mount) return;

    const chairId = this.selectedCabinChair || 'chair-1';
    const chairObj = this.store.chairs.find(c => c.id === chairId) || { id: 'chair-1', name: 'Chair 1 — General Operatory', doctor: 'Dr. Marcus Vance, DDS' };

    // Find active patient in this chair
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    const fullPt = currentPt ? this.store.getPatient(currentPt.patientId) : null;

    mount.innerHTML = `
      <div style="max-width: 1200px; margin: 24px auto; padding: 0 20px;">
        <!-- Header with Chair Tabs -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <h2 style="font-size: 1.8rem; font-weight: 900; color: #0F172A; margin: 0;">Dentist Operatory Station</h2>
            <p style="font-size: 0.9rem; color: #64748B; margin: 2px 0 0 0;">Chairside Clinical Workspace & Instant Charting Shortcut</p>
          </div>
          <!-- Chair Selector Tabs -->
          <div style="display: flex; gap: 8px;">
            ${[
              { id: 'chair-1', label: 'Chair 1: General' },
              { id: 'chair-2', label: 'Chair 2: Ortho' },
              { id: 'chair-3', label: 'Chair 3: Surgery' },
              { id: 'chair-4', label: 'Chair 4: Hygiene' }
            ].map(c => `
              <button class="btn ${chairId === c.id ? 'btn-primary' : 'btn-outline'}" onclick="app.selectCabinChair('${c.id}')" style="font-size: 0.85rem; padding: 8px 14px;">
                ${c.label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Operatory Hero Banner -->
        <div class="card" style="padding: 24px; margin-bottom: 24px; border-left: 5px solid #0D9488; background: #FFFFFF;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span class="badge badge-teal" style="font-size: 0.8rem;">Active Operatory</span>
              <h3 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin: 4px 0 2px 0;">${chairObj.name}</h3>
              <p style="font-size: 0.95rem; color: #0284C7; margin: 0; font-weight: 600;">Dentist: ${chairObj.doctor}</p>
            </div>
            <div>
              <button class="btn btn-outline" onclick="app.cabinCallNextPatient()">
                <span>📢</span> Call Next Patient for ${chairObj.name}
              </button>
            </div>
          </div>
        </div>

        ${currentPt && fullPt ? `
          <!-- Active Patient In Chair -->
          <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-bottom: 24px;">
            <div class="card" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <div>
                  <span class="badge badge-amber">Currently in Chair</span>
                  <h3 style="font-size: 1.5rem; font-weight: 900; color: #0F172A; margin: 4px 0 0 0;">${fullPt.name}</h3>
                  <div style="font-size: 0.85rem; color: #64748B;">MRN: <code>${fullPt.mrn}</code> • ${fullPt.age} yrs (${fullPt.gender}) • Tel: ${fullPt.phone}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 2.2rem; font-weight: 900; color: #0D9488; font-family: 'JetBrains Mono', monospace;">${currentPt.token}</div>
                  <div style="font-size: 0.8rem; color: #64748B;">Token Issued: ${currentPt.checkinTime}</div>
                </div>
              </div>

              <div style="background: #F8FAFC; border-radius: var(--radius-md); padding: 14px 16px; margin-bottom: 16px; font-size: 0.95rem; line-height: 1.6;">
                <div><strong>Chief Complaint:</strong> ${currentPt.chiefComplaint || 'Consultation'}</div>
                <div><strong>Pain Rating:</strong> <span class="badge ${currentPt.painScore >= 8 ? 'badge-red' : 'badge-teal'}">${currentPt.painScore || 0} / 10</span></div>
                <div><strong>Medical Alerts / Allergies:</strong> <span style="color: #DC2626; font-weight: 700;">${fullPt.allergies || 'None'}</span></div>
              </div>

              <!-- Action buttons -->
              <div style="display: flex; gap: 12px; margin-top: 20px;">
                <button class="btn btn-primary" onclick="app.openPatientInOdontogram('${fullPt.id}')" style="flex: 1;">
                  <span>🦷</span> Open Interactive Odontogram & Records
                </button>
                <button class="btn btn-success" onclick="app.cabinCompleteConsultation()" style="flex: 1;">
                  <span>🏁</span> Complete & Send to Billing Desk
                </button>
              </div>
            </div>

            <!-- Quick 1-Tap Dental Rx Chips -->
            <div class="card" style="padding: 24px;">
              <h4 style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 6px;">1-Tap Quick Dental Rx Prescriptions</h4>
              <p style="font-size: 0.85rem; color: #64748B; margin-bottom: 16px;">Touch any chip to immediately prescribe and route to Dispensary:</p>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                <button class="btn btn-outline" onclick="app.cabinAddRxChip('Amoxicillin', '500mg tid x 5 days', 'Take 1 capsule every 8 hours with water after food')" style="justify-content: flex-start; text-align: left; padding: 10px 14px;">
                  <span>💊</span> <strong>Amoxicillin 500mg</strong> &nbsp;— tid x 5d (Dental Infection)
                </button>
                <button class="btn btn-outline" onclick="app.cabinAddRxChip('Augmentin (Amoxicillin/Clavulanate)', '625mg bid x 5 days', 'Take 1 tablet every 12 hours with meals')" style="justify-content: flex-start; text-align: left; padding: 10px 14px;">
                  <span>💊</span> <strong>Augmentin 625mg</strong> &nbsp;— bid x 5d (Severe Abscess)
                </button>
                <button class="btn btn-outline" onclick="app.cabinAddRxChip('Ibuprofen', '400mg tid prn pain', 'Take 1 tablet after meals when pain occurs')" style="justify-content: flex-start; text-align: left; padding: 10px 14px;">
                  <span>💊</span> <strong>Ibuprofen 400mg</strong> &nbsp;— tid prn (Anti-inflammatory)
                </button>
                <button class="btn btn-outline" onclick="app.cabinAddRxChip('Chlorhexidine Gluconate 0.2%', '10ml oral rinse bid x 7 days', 'Swish 10ml in mouth for 60 seconds after brushing')" style="justify-content: flex-start; text-align: left; padding: 10px 14px;">
                  <span>🧴</span> <strong>Chlorhexidine 0.2% Rinse</strong> &nbsp;— bid x 7d (Gingivitis)
                </button>
                <button class="btn btn-outline" onclick="app.cabinAddRxChip('Metronidazole', '400mg tid x 5 days', 'Take 1 tablet every 8 hours. Strictly no alcohol.')" style="justify-content: flex-start; text-align: left; padding: 10px 14px;">
                  <span>💊</span> <strong>Metronidazole 400mg</strong> &nbsp;— tid x 5d (Periodontal/Anaerobic)
                </button>
              </div>
            </div>
          </div>
        ` : `
          <!-- No Patient in Chair -->
          <div class="card" style="padding: 48px; text-align: center;">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">💺</div>
            <h3 style="font-size: 1.4rem; font-weight: 800; color: #0F172A; margin-bottom: 6px;">No Patient Currently in ${chairObj.name}</h3>
            <p style="font-size: 0.95rem; color: #64748B; margin-bottom: 24px;">The operatory chair is sanitized and ready for the next patient.</p>
            <button class="btn btn-primary btn-lg" onclick="app.cabinCallNextPatient()" style="font-size: 1.1rem; padding: 14px 32px; border-radius: 9999px;">
              <span>📢</span> Call Next Waiting Patient from Queue
            </button>
          </div>
        `}
      </div>
    `;
  },

  selectCabinChair(chairId) {
    this.selectedCabinChair = chairId;
    this.renderCabinStation();
  },

  cabinCallNextPatient() {
    const chairId = this.selectedCabinChair || 'chair-1';
    const chairObj = this.store.chairs.find(c => c.id === chairId) || { name: 'Operatory Chair', doctor: 'On-Duty Dentist' };

    // Find next waiting patient for this chair or general
    const nextPt = this.store.queue.find(q => q.status === 'waiting' && (q.chair === chairId || !q.chair));
    if (!nextPt) {
      this.showToast(`No patients currently waiting for ${chairObj.name}.`, 'info');
      return;
    }

    nextPt.status = 'in-consultation';
    nextPt.chair = chairId;
    this.store.saveQueue();

    if (window.clinicAudio) {
      window.clinicAudio.announceToken(nextPt.token, chairObj.name, chairObj.doctor);
    }

    this.showToast(`Calling token ${nextPt.token} (${nextPt.name}) to ${chairObj.name}`, 'success');
    this.renderCabinStation();
  },

  cabinAddRxChip(medName, dosage, instructions) {
    const chairId = this.selectedCabinChair || 'chair-1';
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    if (!currentPt) {
      this.showToast("No active patient in chair to prescribe for.", "warning");
      return;
    }

    const patient = this.store.getPatient(currentPt.patientId);
    if (!patient) return;

    patient.prescriptions = patient.prescriptions || [];
    patient.prescriptions.unshift({
      id: "rx-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
      medication: medName,
      dosage: dosage,
      instructions: instructions,
      status: "Active",
      prescribedBy: this.store.currentUser ? this.store.currentUser.name : "Dr. Marcus Vance, DDS"
    });

    this.store.savePatient(patient);
    this.showToast(`Prescription for ${medName} added & routed to Dental Dispensary.`, "success");
  },

  cabinCompleteConsultation() {
    const chairId = this.selectedCabinChair || 'chair-1';
    const currentPt = this.store.queue.find(q => q.chair === chairId && (q.status === 'in-consultation' || q.status === 'called'));
    if (!currentPt) return;

    currentPt.status = 'completed';
    this.store.saveQueue();

    this.showToast(`Encounter completed for ${currentPt.name}. Patient transferred to Billing Desk POS.`, "success");
    this.renderCabinStation();
  },

  openPatientInOdontogram(patientId) {
    this.switchStation('ADMIN_DASHBOARD');
    this.navigateTo('record', { patientId: patientId });
  },

  /* ==========================================================================
     STATION 4: BILLING & CASHIER POS CONTROLLER
     ========================================================================== */

  renderBillingStation() {
    const mount = document.getElementById("billing-main-mount");
    if (!mount) return;

    // Pick ready for billing patient
    let patientId = this.selectedBillingPatientId;
    if (!patientId && this.store.patients.length > 0) {
      patientId = this.store.patients[0].id;
      this.selectedBillingPatientId = patientId;
    }

    const patient = this.store.getPatient(patientId) || this.store.patients[0];
    const discountPct = this.billingDiscountPercent || 0;
    const tendered = this.billingAmountTendered || 0;

    // Standard billing procedures
    const procedures = [
      { id: 'bp-1', name: 'Comprehensive Dental Examination', fee: 50 },
      { id: 'bp-2', name: 'Composite Resin Restoration (Filling)', fee: 120 },
      { id: 'bp-3', name: 'Full Mouth Scaling & Root Planing', fee: 80 },
      { id: 'bp-4', name: 'Orthodontic Archwire Adjustment', fee: 95 }
    ];

    if (!this.billingSelectedProcedures || this.billingSelectedProcedures.length === 0) {
      this.billingSelectedProcedures = ['bp-1', 'bp-2'];
    }

    let subtotal = 0;
    procedures.forEach(p => {
      if (this.billingSelectedProcedures.includes(p.id)) {
        subtotal += p.fee;
      }
    });

    const discountAmount = Math.round((subtotal * discountPct) / 100);
    const taxAmount = Math.round((subtotal - discountAmount) * 0.05);
    const netTotal = (subtotal - discountAmount) + taxAmount;
    const changeDue = Math.max(0, tendered - netTotal);

    mount.innerHTML = `
      <div style="max-width: 1200px; margin: 24px auto; padding: 0 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h2 style="font-size: 1.8rem; font-weight: 900; color: #0F172A; margin: 0;">Cashier & Billing Desk POS</h2>
            <p style="font-size: 0.9rem; color: #64748B; margin: 2px 0 0 0;">Cash Counter, Selective Invoicing & Instant Thermal Receipts</p>
          </div>
          <button class="btn btn-outline" onclick="app.switchStation('ADMIN_DASHBOARD'); app.navigateTo('billing');">
            <span>📊</span> Open Detailed Financial Ledger
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 0.8fr 1.2fr; gap: 24px; align-items: start;">
          <!-- Left: Patients Waiting for Billing -->
          <div class="card" style="padding: 20px;">
            <h3 style="font-size: 1.1rem; font-weight: 800; color: #0F172A; margin-bottom: 14px;">Select Patient to Bill</h3>
            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 520px; overflow-y: auto;">
              ${this.store.patients.slice(0, 8).map(pt => `
                <div onclick="app.selectBillingPatient('${pt.id}')" style="padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid ${patient && patient.id === pt.id ? '#0D9488' : '#E2E8F0'}; background: ${patient && patient.id === pt.id ? 'rgba(13,148,136,0.06)' : '#FFFFFF'}; cursor: pointer;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: #0F172A; font-size: 0.95rem;">${pt.name}</strong>
                    <span class="badge ${pt.balance > 0 ? 'badge-amber' : 'badge-teal'}" style="font-size: 0.75rem;">${pt.balance || 0} due</span>
                  </div>
                  <div style="font-size: 0.8rem; color: #64748B; margin-top: 2px;">MRN: ${pt.mrn} • Tel: ${pt.phone}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Interactive Bill Generator -->
          ${patient ? `
            <div class="card" style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid #E2E8F0; margin-bottom: 16px;">
                <div>
                  <h3 style="font-size: 1.35rem; font-weight: 800; color: #0F172A; margin: 0;">${patient.name}</h3>
                  <div style="font-size: 0.85rem; color: #64748B; margin-top: 2px;">MRN: <code>${patient.mrn}</code> • Phone: ${patient.phone}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.8rem; color: #64748B; text-transform: uppercase; font-weight: 700;">Date & Time</div>
                  <div style="font-weight: 700; color: #0F172A;">${new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <!-- Procedures Checklist -->
              <div style="margin-bottom: 20px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 10px;">Select Procedures / Items to Invoice:</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${procedures.map(p => {
                    const isChecked = this.billingSelectedProcedures.includes(p.id);
                    return `
                      <label style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid #E2E8F0; border-radius: var(--radius-md); cursor: pointer; background: ${isChecked ? '#F8FAFC' : '#FFFFFF'};">
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="app.toggleBillingProcedure('${p.id}')">
                          <span style="font-weight: 600; font-size: 0.95rem; color: #0F172A;">${p.name}</span>
                        </div>
                        <strong style="color: #0D9488;">${p.fee}</strong>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Discount & Financial Summary -->
              <div style="background: #F8FAFC; border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 20px; font-size: 0.95rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #64748B;">Procedures Subtotal:</span>
                  <strong>${subtotal}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="color: #64748B;">Discount (${discountPct}%):</span>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="range" min="0" max="30" step="5" value="${discountPct}" oninput="app.updateBillingDiscount(this.value)" style="width: 100px;">
                    <span style="color: #10B981; font-weight: 700;">-${discountAmount}</span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #64748B;">Sales Tax (5%):</span>
                  <span>+${taxAmount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: 900; color: #0F172A; border-top: 1px solid #E2E8F0; padding-top: 10px;">
                  <span>Net Amount Due:</span>
                  <span style="color: #0D9488;">${netTotal}</span>
                </div>
              </div>

              <!-- Payment Method & Tendered -->
              <div style="margin-bottom: 24px;">
                <div style="font-weight: 700; font-size: 0.9rem; color: #334155; margin-bottom: 8px;">Cash Received & Change Calculator:</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                  <div>
                    <label style="display: block; font-size: 0.8rem; color: #64748B; margin-bottom: 4px;">Amount Tendered ($)</label>
                    <input type="number" class="form-control" placeholder="0" value="${tendered || ''}" oninput="app.updateBillingTendered(this.value)">
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.8rem; color: #64748B; margin-bottom: 4px;">Change Due ($)</label>
                    <div style="height: 42px; display: flex; align-items: center; padding: 0 14px; background: #F1F5F9; border-radius: var(--radius-md); font-weight: 800; font-size: 1.1rem; color: #10B981;">
                      ${changeDue}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="app.processBillingPayment('Cash')" style="flex: 1.5; font-size: 1rem; padding: 12px;">
                  <span>💳</span> Process Payment (${netTotal})
                </button>
                <button class="btn btn-outline" onclick="window.print()" style="flex: 1;">
                  <span>🖨️</span> Thermal Receipt
                </button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  selectBillingPatient(patientId) {
    this.selectedBillingPatientId = patientId;
    this.renderBillingStation();
  },

  toggleBillingProcedure(procId) {
    this.billingSelectedProcedures = this.billingSelectedProcedures || [];
    const idx = this.billingSelectedProcedures.indexOf(procId);
    if (idx > -1) {
      this.billingSelectedProcedures.splice(idx, 1);
    } else {
      this.billingSelectedProcedures.push(procId);
    }
    this.renderBillingStation();
  },

  updateBillingDiscount(val) {
    this.billingDiscountPercent = parseInt(val, 10) || 0;
    this.renderBillingStation();
  },

  updateBillingTendered(val) {
    this.billingAmountTendered = parseFloat(val) || 0;
    this.renderBillingStation();
  },

  processBillingPayment(method) {
    const ptId = this.selectedBillingPatientId;
    const pt = this.store.getPatient(ptId);
    if (!pt) return;

    this.showToast(`Payment received via ${method} for ${pt.name}. Receipt printed.`, "success");
    if (window.clinicAudio) window.clinicAudio.playChime();
    this.renderBillingStation();
  },

  /* ==========================================================================
     STATION 5: DENTAL DISPENSARY CONTROLLER
     ========================================================================== */

  renderPharmacyStation() {
    const mount = document.getElementById("pharmacy-main-mount");
    if (!mount) return;

    const inventory = window.DENTAL_PHARMACY_INVENTORY || [];

    mount.innerHTML = `
      <div style="max-width: 1200px; margin: 24px auto; padding: 0 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <div>
            <h2 style="font-size: 1.8rem; font-weight: 900; color: #0F172A; margin: 0;">Dental Dispensary & In-House Pharmacy</h2>
            <p style="font-size: 0.9rem; color: #64748B; margin: 2px 0 0 0;">Fulfill Electronic Rx, Dispense Oral Care & Track Material Stocks</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-outline" onclick="app.showToast('Pharmacy barcode scanner connected', 'success')">
              <span>📷</span> Barcode Scanner
            </button>
          </div>
        </div>

        <!-- Electronic Rx Fulfillment Queue -->
        <div class="card" style="padding: 24px; margin-bottom: 28px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin: 0;">Pending Electronic Prescriptions from Operatories</h3>
            <span class="badge badge-teal">Live Fulfillment Queue</span>
          </div>

          <table class="plan-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Prescribed Medication</th>
                <th>Dosage & Instructions</th>
                <th>Prescribed By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Emma Watson</strong><div style="font-size: 0.75rem; color: #64748B;">MRN: SDO-2026-0002</div></td>
                <td><strong style="color: #0D9488;">Amoxicillin 500mg</strong></td>
                <td>1 cap tid x 5 days (After meals)</td>
                <td>Dr. Marcus Vance</td>
                <td><button class="btn btn-primary btn-sm" onclick="app.dispensePharmacyItem('med-1')">Dispense</button></td>
              </tr>
              <tr>
                <td><strong>Robert Miller</strong><div style="font-size: 0.75rem; color: #64748B;">MRN: SDO-2026-0004</div></td>
                <td><strong style="color: #0284C7;">Orthodontic Relief Wax</strong></td>
                <td>Apply to brackets prn wire irritation</td>
                <td>Dr. Sarah Jenkins</td>
                <td><button class="btn btn-primary btn-sm" onclick="app.dispensePharmacyItem('med-5')">Dispense</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- In-House Stock Inventory -->
        <div class="card" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0F172A; margin-bottom: 16px;">Dental Dispensary Stock Levels</h3>
          <table class="plan-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${inventory.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td><span class="badge badge-outline">${item.category}</span></td>
                  <td><strong>${item.stock}</strong> units</td>
                  <td><span class="badge ${item.stock < 15 ? 'badge-amber' : 'badge-teal'}">${item.stock < 15 ? 'Low Stock' : 'In Stock'}</span></td>
                  <td>${item.price}</td>
                  <td>
                    <button class="btn btn-outline btn-sm" onclick="app.dispensePharmacyItem('${item.id}')" style="margin-right: 6px;">
                      Dispense 1
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="app.restockPharmacyItem('${item.id}')">
                      Restock +50
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  dispensePharmacyItem(itemId) {
    if (this.store && this.store.dispenseItem) {
      const res = this.store.dispenseItem(itemId, 1);
      if (res && res.success) {
        this.showToast(`Dispensed 1 unit of ${res.item.name}. Remaining stock: ${res.item.stock}`, "success");
        if (window.clinicAudio) window.clinicAudio.playChime();
        this.renderPharmacyStation();
      } else {
        this.showToast("Item out of stock or not found", "error");
      }
    }
  },

  restockPharmacyItem(itemId) {
    const item = (window.DENTAL_PHARMACY_INVENTORY || []).find(i => i.id === itemId);
    if (item) {
      item.stock += 50;
      this.showToast(`Restocked 50 units of ${item.name}. New stock: ${item.stock}`, "success");
      this.renderPharmacyStation();
    }
  }
};

Object.assign(ClinicApp.prototype, stationMethods);

window.app = new ClinicApp();
