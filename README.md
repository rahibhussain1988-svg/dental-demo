# Smile Dental & Orthodontics Clinic Management System — Kiosk-Style UI/UX Prototype

A modern, touch-friendly, kiosk-first web application prototype designed for real dental and orthodontic clinic operations. Built with clean HTML5, CSS3, and Vanilla JavaScript, featuring realistic clinical dummy data, interactive SVG-based odontograms, orthodontic case tracking, appointment queue management, and billing workflows.

---

## 1. Quick Start & Execution Instructions

This prototype is **completely self-contained** and requires **zero external build tools, package managers, or server installations**.

### Method A: Direct Browser Launch (Easiest)
1. Navigate to the project folder: `G:\My Drive\Tele-Clinic\`
2. Double-click `index.html` to open it directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).
3. The application will immediately boot with full interactivity, sample patients, active appointments, and live queuing.

### Method B: Local HTTP Server (Optional)
If you prefer running via a local web server (e.g. for tablet/kiosk testing over Wi-Fi):
```bash
# Python 3
python -m http.server 8080

# Or Node npx serve
npx serve .
```
Then visit `http://localhost:8080` or `http://<your-ip>:8080` on your tablet or touchscreen terminal.

---

## 2. Brand Identity & Design System

The visual design is tailored specifically for modern dental and healthcare environments—combining clinical sterility and professionalism with warm, welcoming aesthetics.

| Element | Specification | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary Teal** | `#0D9488` | Primary clinical buttons, active tabs, tooth selection glow |
| **Dark Teal** | `#0F766E` | Brand header, high-contrast badges, cards |
| **Secondary Blue** | `#0284C7` | Informational cards, MRN chips, search filters |
| **Background** | `#F8FAFC` | Soft off-white background to prevent tablet eye strain |
| **Card Background**| `#FFFFFF` | Crisp elevated surfaces with rounded corners (`16px-24px`) |
| **Main Text** | `#0F172A` | Deep slate for accessible readability (WCAG AAA compliant) |
| **Secondary Text** | `#64748B` | Subheadings, metadata, timestamps |
| **Success** | `#16A34A` | Healthy teeth, completed treatments, settled balances |
| **Warning** | `#D97706` | Pending approvals, crown restorations, queue wait > 15m |
| **Error / Alert** | `#DC2626` | Active caries, severe drug allergies, unpaid balances |
| **Borders** | `#E2E8F0` | Subtle clean dividing lines |

### Touch & Kiosk Principles
- **Touch Target Sizing:** Minimum `48 × 48 px` for standard controls; `56 × 56 px` in Kiosk Mode.
- **Kiosk View Toggle:** Click the **"📱 Kiosk View"** button in the header to activate high-contrast enlarged targets, tactile touch cards, and kiosk formatting.
- **Zero Hover-Only Reliance:** All clinical data and options are reachable via direct touch or click.

---

## 3. End-to-End Workflow Guide

### Workflow A — New Patient Registration & Duplicate Prevention
1. From the Dashboard, click the **"1. New Patient"** tile or **"New Patient"** in the sidebar.
2. **Step 1 (Personal Info):** Fill in First Name, Last Name, Phone, and DOB (notice the age auto-calculates).
3. **Step 2 (Medical History):** Tag known drug allergies (e.g. Penicillin) and systemic conditions (Hypertension, Diabetes).
4. **Step 3 (Duplicate Check):** Click **"Run Duplicate Check"**. The prototype checks against phone number and name. If a match is detected (e.g. try phone `555-234-8901`), it presents a warning with the matching patient card, giving staff the option to view the existing chart or continue with household justification.
5. **Step 4 (Generate MRN & Badge):** Click **"Confirm & Generate MRN"**. The system creates a unique identifier (e.g., `SDO-2026-0017`), renders an instant digital patient ID card with an encoded QR code, and allows one-click card printing (`🖨️ Print Patient ID Card`).

### Workflow B — Patient Live Search & QR Scanner
1. Click **"2. Find Patient"** on the Dashboard or in the sidebar.
2. In the search box, start typing any name, partial phone digits, or MRN (e.g. `John`, `555`, `Emily`, or `SDO-2026`). Results update live via a 250ms debouncer.
3. Test filter chips: **"Currently in Queue"**, **"Orthodontics"**, **"Outstanding Balance"**, or **"Medical Alerts / Allergies"**.
4. **Camera / QR Scanner Simulation:** Click **"📷 Scan QR / Barcode"**. An animated laser viewfinder will appear. Click any sample badge to instantly simulate a barcode scan and load that patient's record.

### Workflow C — Dental Consultation, Odontogram & Treatment Planning
1. Go to **"Patient Queue"** or **"Dentist Workspace"**.
2. Notice patient **John Miller** (`SDO-2026-0101`) or click **"Check In"** on any scheduled appointment.
3. Click **"Open Record"** -> Click the **"4. Odontogram"** tab.
4. **Interactive Dental Chart:**
   - Permanent Adult Dentition (11-48 FDI) or switch to Primary Deciduous (51-85 FDI).
   - Click on **Tooth #16** (Maxillary Right 1st Molar). The tooth lights up with a teal highlight and the **Tooth Clinical Inspector** appears on the right.
   - Click the surfaces: **Occlusal (O)** and **Mesial (M)**.
   - Choose a finding: **"Active Caries"**, **"Composite"**, **"Crown"**, or **"Root Canal"**. The tooth SVG updates in real time with anatomically accurate red caries fills, gold crown borders, or orange root canal markers.
   - Under *Plan Procedure for this Tooth*, select `D3330: Endodontic Therapy - Molar Tooth ($980)` and click **"➕ Add to Treatment Plan"**.
5. Switch to the **"6. Treatment Plans"** tab: Tooth #16 now appears in the active plan with fees automatically totaled.
6. Click **"Save Draft"** or **"✍️ Finalize & Sign Encounter"** to demonstrate digital locking with clinician PIN.

### Workflow D — Orthodontic Follow-up (Braces & Clear Aligners)
1. In Patient Search, select **Emily Zhang** (`SDO-2026-0102`) or **Chloe Bennett** (`SDO-2026-0104`).
2. Switch to the **"7. Orthodontics"** tab.
3. View the active appliance summary: *Ceramic Damon Self-Ligating Brackets*, *Angle Class II Div 1*, current archwires, and compliance rating.
4. **Photographic Progress Comparison:** Compare the high-resolution intraoral arch progress diagrams (Initial vs Month 7 vs Current alignment).
5. Click **"➕ Record Adjustment Visit"**: Enter stage, wire changes (e.g. Upper `0.019x0.025 SS`), and notes. Click **Save** to append to the chronological treatment timeline.

### Workflow E — Billing, Invoicing & Receipts
1. Open any patient record with planned treatments (e.g. **John Miller** or **David Kim**).
2. On the **Treatment Plans** tab, click **"💳 Generate Billable Invoice"**.
3. The invoice is generated with itemized procedures and balances.
4. On the **Billing** tab, click **"💵 Collect Payment"**:
   - Choose payment amount (preset full balance or custom partial amount).
   - Select method (Credit Card, Cash, Bank Transfer, Insurance Copay).
   - Submit payment: balances recalculate instantly and status changes to `Paid` or `Partial`.
5. Click **"🖨️ Print Receipt"** to open a print-ready official tax receipt with clinic header and cashier stamp.

### Workflow F — Appointment Scheduling & Reception Check-in
1. Click **"3. Appointments"** in the sidebar.
2. View the calendar appointments list.
3. Click **"➕ New Appointment"**:
   - Pick patient, clinician (Dr. Sarah Chen / Dr. Marcus Vance), and operatory chair.
   - Select date and time.
   - **Conflict Detection:** If the chair or clinician is already occupied at that slot, a conflict warning dialog appears!
   - Save appointment.
4. On the appointment row, click **"🎟️ Check In"**:
   - An arrival token (e.g. `T-106`) is issued automatically.
   - The patient is routed into the live waiting room queue.
   - A simulated 80mm thermal receipt printer slip preview opens with waiting instructions.

---

## 4. Role-Based Access Control (RBAC) Simulation

Use the **Profile Dropdown** in the top navigation bar to switch between 6 staff roles:

1. **Emma Brooks (Receptionist):** Front-desk workflows, patient registration, calendar scheduling, queue token generation, patient ID printing.
2. **Dr. Sarah Chen, DDS (Dentist):** Full clinical exam, odontogram charting, treatment planning, prescription authority, digital encounter sign-off.
3. **Dr. Marcus Vance (Orthodontist):** Specialized orthodontic bay access, braces adjustment logs, photography comparison, cephalometric reviews.
4. **Liam Vance, RDA (Dental Assistant):** Queue monitoring, appointment viewing, assisting charting.
5. **Elena Rostova (Cashier):** Invoicing, payment posting, partial payment tracking, receipt generation, daily collection CSV exports.
6. **Dr. Sarah Chen (Clinic Admin):** Unrestricted access, staff directory, procedure fee catalog management, audit history.

---

## 5. Summary of Printable Document Templates

The prototype includes five print-ready formats (with simulated on-screen modal preview + standard `@media print` CSS):
1. **80mm Thermal Queue Token Ticket:** Clinic header, large token number, patient name, service, timestamp, barcode, waiting lounge instructions.
2. **Plastic Patient ID Card (85.6mm × 54mm):** Clinic crest, patient photo, MRN, DOB, blood group, emergency contact, encrypted 2D QR code.
3. **Official Dental Prescription (Rx):** Letterhead, doctor license #, patient allergy alert banner, drug table (strength, dosage, duration, quantity, instructions), doctor electronic signature line.
4. **Treatment Plan Estimate:** Itemized procedures, tooth numbers, estimated costs, disclaimer, patient acceptance signature block.
5. **Tax Invoice & Payment Receipt:** Itemized billing items, amounts paid, outstanding balance, payment method, tax registration #, cashier stamp.

---

## 6. Simulated Features vs. Production Integration Roadmap

While this prototype is 100% interactive on the client side, the following highlights what is currently simulated and what should be connected for an enterprise production release:

| Module | Prototype Implementation | Production Integration Needed |
| :--- | :--- | :--- |
| **Authentication** | Role dropdown switcher with predefined staff accounts. | OAuth2 / SAML SSO with multi-factor authentication (MFA) and biometric login. |
| **Data Persistence** | In-memory store backed by browser `LocalStorage`. | PostgreSQL / Cloud SQL database with ACID transactions, encrypted at rest (AES-256). |
| **QR & Barcode Scanning**| Software camera viewfinder simulation with click-to-scan buttons. | Native HTML5 `getUserMedia` camera feed with WebAssembly ZXing barcode decoder or USB HID 2D barcode gun. |
| **Radiographs / DICOM** | High-definition SVG representations of OPG panoramic and periapical x-rays. | CornerstoneJS / OHIF DICOM Web Viewer connected to a dental PACS (Picture Archiving and Communication System). |
| **Hardware Printing** | Modal previews and native browser `window.print()` targeting thermal 80mm and A4 paper. | ESC/POS direct network printing service for Epson/Star thermal receipt printers without browser dialogs. |
| **SMS / Notifications** | In-app toast notification alert system and audio chime simulator. | Twilio / AWS SNS integration for automated SMS appointment reminders and WhatsApp token notifications. |
| **Audit Compliance** | Dynamic in-memory HIPAA audit event trail. | Append-only immutable audit log stored in write-once-read-many (WORM) storage for regulatory compliance. |

---

## 7. File Manifest

```
Tele-Clinic/
├── index.html         # Master application container, kiosk layout & modals
├── css/
│   └── styles.css     # Complete design system, kiosk mode variables & print CSS
├── js/
│   ├── data.js        # Realistic clinic dataset (16 patients, appointments, catalog)
│   ├── odontogram.js  # Interactive SVG tooth chart & surface polygon engine
│   └── app.js         # Core application controller, state management & workflows
└── README.md          # Comprehensive user manual & architecture specification
```
