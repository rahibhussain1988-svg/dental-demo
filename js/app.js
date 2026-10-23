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
    this.renderCurrentScreen();
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
window.app = new ClinicApp();
