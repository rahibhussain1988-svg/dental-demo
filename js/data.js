/**
 * Smile Dental & Orthodontics Clinic Management System
 * Realistic Demonstration Dataset & Mock Persistence Layer
 */

const CLINIC_CONFIG = {
  name: "Smile Dental & Orthodontics Clinic",
  tagline: "Center for Advanced Family Dentistry & Specialized Orthodontics",
  address: "452 Grand Avenue, Suite 300, Metro City, MC 90210",
  phone: "+1 (555) 948-8325",
  emergencyPhone: "+1 (555) 948-HELP",
  email: "reception@smiledentalortho.com",
  website: "www.smiledentalortho.com",
  taxId: "TAX-894-002-SDO",
  operatingHours: "Mon - Sat: 8:00 AM - 7:00 PM | Sun: Emergency Only",
  chairs: [
    { id: "c1", name: "Chair 1 (General Operatory)", doctorId: "u2" },
    { id: "c2", name: "Chair 2 (General & Restorative)", doctorId: "u2" },
    { id: "c3", name: "Chair 3 (Surgical & Implant Suite)", doctorId: "u2" },
    { id: "c4", name: "Chair 4 (Orthodontic Bay)", doctorId: "u3" }
  ]
};

const STAFF_USERS = [
  {
    id: "u1",
    name: "Emma Brooks",
    role: "receptionist",
    title: "Head Receptionist & Patient Care Coordinator",
    email: "emma.b@smiledentalortho.com",
    avatar: "EB",
    color: "#0284C7",
    permissions: ["patients.view", "patients.register", "appointments.manage", "queue.manage", "cards.print"]
  },
  {
    id: "u2",
    name: "Dr. Sarah Chen, DDS",
    role: "dentist",
    title: "Senior Dental Surgeon & Restorative Lead",
    license: "DDS-CA-94812",
    email: "dr.chen@smiledentalortho.com",
    avatar: "SC",
    color: "#0D9488",
    permissions: ["patients.view", "clinical.exam", "odontogram.edit", "treatment.plan", "prescriptions.write", "encounters.finalize", "queue.manage"]
  },
  {
    id: "u3",
    name: "Dr. Marcus Vance, Ortho Specialist",
    role: "orthodontist",
    title: "Chief Orthodontist & Dentofacial Orthopedist",
    license: "ORTHO-98214",
    email: "dr.vance@smiledentalortho.com",
    avatar: "MV",
    color: "#7C3AED",
    permissions: ["patients.view", "clinical.exam", "odontogram.edit", "orthodontics.manage", "treatment.plan", "prescriptions.write", "encounters.finalize", "queue.manage"]
  },
  {
    id: "u4",
    name: "Liam Vance, RDA",
    role: "assistant",
    title: "Registered Dental Assistant & Infection Control Lead",
    email: "liam.v@smiledentalortho.com",
    avatar: "LV",
    color: "#E11D48",
    permissions: ["patients.view", "queue.manage", "appointments.manage", "clinical.view"]
  },
  {
    id: "u5",
    name: "Elena Rostova",
    role: "cashier",
    title: "Senior Financial Counselor & Billing Lead",
    email: "elena.r@smiledentalortho.com",
    avatar: "ER",
    color: "#D97706",
    permissions: ["patients.view", "billing.manage", "invoices.create", "payments.record", "reports.view"]
  },
  {
    id: "u6",
    name: "Dr. Sarah Chen (Admin)",
    role: "admin",
    title: "Clinic Medical Director & System Administrator",
    license: "DDS-CA-94812",
    email: "director@smiledentalortho.com",
    avatar: "CA",
    color: "#0F766E",
    permissions: ["*"] // All permissions
  }
];

const PROCEDURE_CATALOG = [
  { code: "D0120", name: "Periodic Oral Evaluation - Established Patient", category: "Diagnostic", price: 65, duration: 20 },
  { code: "D0150", name: "Comprehensive Oral Evaluation - New Patient", category: "Diagnostic", price: 110, duration: 30 },
  { code: "D0210", name: "Full Mouth Intraoral Radiographs (Complete Series)", category: "Radiology", price: 145, duration: 25 },
  { code: "D0220", name: "Intraoral Periapical Single Radiograph", category: "Radiology", price: 35, duration: 10 },
  { code: "D0330", name: "Panoramic Radiograph (OPG)", category: "Radiology", price: 125, duration: 15 },
  { code: "D1110", name: "Prophylaxis (Dental Cleaning) - Adult", category: "Preventive", price: 95, duration: 40 },
  { code: "D1120", name: "Prophylaxis - Child", category: "Preventive", price: 70, duration: 30 },
  { code: "D1206", name: "Topical Application of Fluoride Varnish", category: "Preventive", price: 40, duration: 10 },
  { code: "D1351", name: "Pit and Fissure Sealant - Per Tooth", category: "Preventive", price: 50, duration: 15 },
  { code: "D2140", name: "Amalgam Restoration - One Surface, Primary/Permanent", category: "Restorative", price: 140, duration: 30 },
  { code: "D2391", name: "Resin-Based Composite - One Surface, Posterior", category: "Restorative", price: 175, duration: 35 },
  { code: "D2392", name: "Resin-Based Composite - Two Surfaces, Posterior", category: "Restorative", price: 235, duration: 45 },
  { code: "D2393", name: "Resin-Based Composite - Three Surfaces, Posterior", category: "Restorative", price: 295, duration: 50 },
  { code: "D2330", name: "Resin-Based Composite - One Surface, Anterior", category: "Restorative", price: 160, duration: 35 },
  { code: "D2740", name: "Crown - Porcelain/Ceramic Substrate", category: "Prosthodontics", price: 980, duration: 60 },
  { code: "D2950", name: "Core Buildup, Including Any Pins", category: "Restorative", price: 240, duration: 30 },
  { code: "D3310", name: "Endodontic Therapy - Anterior Tooth (Excluding Final Restoration)", category: "Endodontics", price: 650, duration: 60 },
  { code: "D3320", name: "Endodontic Therapy - Bicuspid / Premolar", category: "Endodontics", price: 780, duration: 75 },
  { code: "D3330", name: "Endodontic Therapy - Molar Tooth", category: "Endodontics", price: 980, duration: 90 },
  { code: "D4341", name: "Periodontal Scaling and Root Planing - Per Quadrant", category: "Periodontics", price: 220, duration: 45 },
  { code: "D7140", name: "Extraction, Erupted Tooth or Exposed Root", category: "Oral Surgery", price: 185, duration: 30 },
  { code: "D7210", name: "Surgical Extraction of Erupted Tooth Requiring Bone Removal", category: "Oral Surgery", price: 320, duration: 45 },
  { code: "D8080", name: "Comprehensive Orthodontic Treatment of the Adolescent", category: "Orthodontics", price: 4200, duration: 60 },
  { code: "D8090", name: "Comprehensive Orthodontic Treatment of the Adult", category: "Orthodontics", price: 4800, duration: 60 },
  { code: "D8670", name: "Periodic Orthodontic Treatment Visit (Monthly Adjustment)", category: "Orthodontics", price: 160, duration: 30 },
  { code: "D9972", name: "External Bleaching (In-Office Teeth Whitening Session)", category: "Cosmetic", price: 395, duration: 60 }
];

const MEDICATION_FORMULARY = [
  {
    id: "med1",
    name: "Amoxicillin",
    strengths: ["500 mg"],
    forms: ["Capsule"],
    standardDose: "1 capsule 3 times daily (every 8 hours) with food",
    standardDuration: "5 to 7 days",
    contraindicationAllergies: ["Penicillin", "Amoxicillin", "Beta-lactams"],
    instructions: "Finish the complete course even if feeling better."
  },
  {
    id: "med2",
    name: "Augmentin (Amoxicillin + Clavulanic Acid)",
    strengths: ["625 mg (500/125)"],
    forms: ["Tablet"],
    standardDose: "1 tablet twice daily with meals",
    standardDuration: "5 to 7 days",
    contraindicationAllergies: ["Penicillin", "Amoxicillin", "Beta-lactams"],
    instructions: "Take at the start of a meal to prevent stomach upset."
  },
  {
    id: "med3",
    name: "Clindamycin HCl",
    strengths: ["300 mg"],
    forms: ["Capsule"],
    standardDose: "1 capsule 4 times daily (every 6 hours) with a full glass of water",
    standardDuration: "5 to 7 days",
    contraindicationAllergies: ["Clindamycin", "Lincomycin"],
    instructions: "First-line alternative for patients with severe penicillin allergy. Drink plenty of fluids."
  },
  {
    id: "med4",
    name: "Metronidazole",
    strengths: ["400 mg"],
    forms: ["Tablet"],
    standardDose: "1 tablet 3 times daily",
    standardDuration: "5 days",
    contraindicationAllergies: ["Metronidazole"],
    instructions: "STRICTLY AVOID ALCOHOL during treatment and for 48 hours after completion."
  },
  {
    id: "med5",
    name: "Ibuprofen",
    strengths: ["400 mg", "600 mg"],
    forms: ["Tablet"],
    standardDose: "1 tablet every 6 to 8 hours as needed for dental pain or swelling",
    standardDuration: "3 to 5 days",
    contraindicationAllergies: ["NSAIDs", "Aspirin", "Ibuprofen"],
    instructions: "Always take with food or milk to protect stomach."
  },
  {
    id: "med6",
    name: "Paracetamol (Acetaminophen)",
    strengths: ["500 mg", "1000 mg"],
    forms: ["Tablet"],
    standardDose: "1 to 2 tablets every 6 hours PRN (Max 4000mg/day)",
    standardDuration: "3 to 5 days",
    contraindicationAllergies: ["Paracetamol", "Acetaminophen"],
    instructions: "Do not exceed 4 grams in 24 hours. Safe for gastric ulcer and asthma patients."
  },
  {
    id: "med7",
    name: "Chlorhexidine Gluconate 0.2%",
    strengths: ["0.2% Oral Rinse"],
    forms: ["Solution (300ml bottle)"],
    standardDose: "Rinse with 10 mL undiluted for 60 seconds twice daily after brushing",
    standardDuration: "7 to 10 days",
    contraindicationAllergies: ["Chlorhexidine"],
    instructions: "Do not swallow. Avoid eating or drinking for 30 minutes after rinsing."
  },
  {
    id: "med8",
    name: "Tranexamic Acid",
    strengths: ["500 mg"],
    forms: ["Tablet"],
    standardDose: "1 tablet dissolved in 10 mL water as a mouthwash 3 times daily",
    standardDuration: "2 to 3 days",
    contraindicationAllergies: ["Tranexamic Acid"],
    instructions: "For post-surgical extraction bleeding control. Gently hold rinse in mouth for 2 minutes."
  }
];

const DENTAL_SYMPTOM_OPTIONS = [
  {
    id: "sym-toothache",
    label: "Toothache & Cavity Pain",
    icon: "tooth",
    dept: "General Dentistry",
    chairId: "c1",
    chairName: "Chair 1 (General Operatory)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 65,
    description: "Throbbing pain, sensitivity to hot/cold, visible hole or dark cavity",
    urgency: "Medium"
  },
  {
    id: "sym-braces",
    label: "Braces & Aligners Review",
    icon: "brackets",
    dept: "Orthodontics",
    chairId: "c4",
    chairName: "Chair 4 (Orthodontic Bay)",
    doctorName: "Dr. Marcus Vance, Ortho Specialist",
    fee: 85,
    description: "Crooked teeth, wire adjustment, loose bracket, clear aligner fitting",
    urgency: "Normal"
  },
  {
    id: "sym-bleeding-gums",
    label: "Bleeding Gums & Cleaning",
    icon: "shield",
    dept: "Periodontics & Hygiene",
    chairId: "c2",
    chairName: "Chair 2 (General & Restorative)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 95,
    description: "Bleeding during brushing, heavy tartar, bad breath, puffy inflamed gums",
    urgency: "Normal"
  },
  {
    id: "sym-broken-tooth",
    label: "Broken or Chipped Tooth",
    icon: "alertTriangle",
    dept: "Restorative Dentistry",
    chairId: "c2",
    chairName: "Chair 2 (General & Restorative)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 75,
    description: "Sharp edge, fractured cusp, lost old filling, trauma while eating",
    urgency: "High"
  },
  {
    id: "sym-wisdom-tooth",
    label: "Wisdom Tooth & Swelling",
    icon: "alertTriangle",
    dept: "Oral Surgery",
    chairId: "c3",
    chairName: "Chair 3 (Surgical & Implant Suite)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 110,
    description: "Back jaw pain, difficulty opening mouth, gum flap inflammation (Pericoronitis)",
    urgency: "High"
  },
  {
    id: "sym-root-canal",
    label: "Root Canal (RCT) Consultation",
    icon: "tooth",
    dept: "Endodontics",
    chairId: "c3",
    chairName: "Chair 3 (Surgical & Implant Suite)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 120,
    description: "Severe nocturnal throbbing, persistent abscess, nerve infection",
    urgency: "High"
  },
  {
    id: "sym-implants",
    label: "Dental Implants & Missing Teeth",
    icon: "chair",
    dept: "Implantology",
    chairId: "c3",
    chairName: "Chair 3 (Surgical & Implant Suite)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 150,
    description: "Permanent replacement for missing teeth, titanium post & ceramic crown",
    urgency: "Normal"
  },
  {
    id: "sym-pediatric",
    label: "Kids Dental & Checkup",
    icon: "userPlus",
    dept: "Pediatric Dentistry",
    chairId: "c1",
    chairName: "Chair 1 (General Operatory)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 70,
    description: "Milk teeth cavities, gentle exam, fluoride polish, sealants",
    urgency: "Normal"
  },
  {
    id: "sym-whitening",
    label: "Teeth Whitening & Smile Design",
    icon: "chart",
    dept: "Cosmetic Dentistry",
    chairId: "c4",
    chairName: "Chair 4 (Orthodontic Bay)",
    doctorName: "Dr. Marcus Vance, Ortho Specialist",
    fee: 120,
    description: "Laser teeth whitening, porcelain veneers, aesthetic smile contouring",
    urgency: "Normal"
  }
];

const EMERGENCY_DENTAL_PROCEDURES = [
  {
    id: "emg-1",
    name: "Acute Odontogenic Abscess & Severe Pain",
    code: "EMG-ABSCESS",
    chairId: "c3",
    chairName: "Chair 3 (Surgical & Implant Suite)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 120,
    description: "Immediate incision & drainage, pulp debridement, antibiotic therapy",
    icon: "emergency"
  },
  {
    id: "emg-2",
    name: "Knocked-Out Permanent Tooth (Dental Avulsion)",
    code: "EMG-AVULSION",
    chairId: "c3",
    chairName: "Chair 3 (Surgical & Implant Suite)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 150,
    description: "Re-implantation, flexible splinting, tetanus & antibiotic coverage",
    icon: "tooth"
  },
  {
    id: "emg-3",
    name: "Uncontrolled Post-Extraction Bleeding",
    code: "EMG-HEMORRHAGE",
    chairId: "c3",
    chairName: "Chair 3 (Surgical & Implant Suite)",
    doctorName: "Dr. Sarah Chen, DDS",
    fee: 90,
    description: "Socket debridement, gelatin sponge (Gelfoam), compression sutures",
    icon: "alertTriangle"
  },
  {
    id: "emg-4",
    name: "Orthodontic Trauma / Piercing Archwire",
    code: "EMG-ORTHO",
    chairId: "c4",
    chairName: "Chair 4 (Orthodontic Bay)",
    doctorName: "Dr. Marcus Vance, Ortho Specialist",
    fee: 60,
    description: "Archwire trimming, bracket relief wax, mucosal laceration repair",
    icon: "brackets"
  }
];

const DENTAL_PHARMACY_INVENTORY = [
  { id: "ph-1", name: "Amoxicillin 500mg Capsules", category: "Antibiotics", stock: 140, unit: "Caps", price: 18.50, batch: "AMX-2026-9", expiry: "2027-11" },
  { id: "ph-2", name: "Augmentin 625mg (Amox+Clav)", category: "Antibiotics", stock: 85, unit: "Tabs", price: 32.00, batch: "AUG-2026-4", expiry: "2027-08" },
  { id: "ph-3", name: "Ibuprofen 400mg NSAID", category: "Analgesics", stock: 220, unit: "Tabs", price: 12.00, batch: "IBU-2026-1", expiry: "2028-03" },
  { id: "ph-4", name: "Chlorhexidine 0.2% Oral Rinse (300ml)", category: "Antiseptic", stock: 45, unit: "Bottles", price: 16.00, batch: "CHX-2026-8", expiry: "2027-05" },
  { id: "ph-5", name: "Metronidazole 400mg Tablets", category: "Antibiotics", stock: 95, unit: "Tabs", price: 14.50, batch: "MTZ-2026-2", expiry: "2027-12" },
  { id: "ph-6", name: "Orthodontic Relief Wax Packs", category: "Orthodontic", stock: 110, unit: "Packs", price: 8.00, batch: "WAX-2026-7", expiry: "2029-01" },
  { id: "ph-7", name: "Fluoride Protection Toothpaste 1450ppm", category: "Hygiene", stock: 60, unit: "Tubes", price: 12.50, batch: "FLU-2026-0", expiry: "2028-06" }
];

class ClinicAudio {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }
  getAudioContext() {
    if (!this.audioCtx && (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext)) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioCtx;
  }
  playChime() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);
      // Tone 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.22);
      gain2.gain.setValueAtTime(0.2, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.85);
    } catch (e) {}
  }
  playEmergencyAlarm() {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      [0, 0.18, 0.36].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now + offset);
        gain.gain.setValueAtTime(0.22, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.16);
      });
    } catch (e) {}
  }
  speak(text) {
    if (!this.soundEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
  announceToken(token, chairName, doctorName) {
    this.playChime();
    setTimeout(() => {
      const text = `Token ${token}. Please proceed to ${chairName || 'Operatory Chair 1'}, with ${doctorName || 'the dentist'}.`;
      this.speak(text);
    }, 700);
  }
}

if (typeof window !== 'undefined') {
  window.clinicAudio = new ClinicAudio();
}

const INITIAL_PATIENTS = [
  {
    id: "p1",
    mrn: "SDO-2026-0101",
    firstName: "John",
    lastName: "Miller",
    phone: "+1 (555) 234-8901",
    email: "john.miller@example.com",
    dob: "1988-04-15",
    gender: "Male",
    bloodGroup: "O+",
    address: "742 Evergreen Terrace, Metro City",
    emergencyContact: { name: "Sarah Miller (Wife)", phone: "+1 (555) 234-8902" },
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [
        { name: "Penicillin", severity: "Severe (Anaphylaxis)" }
      ],
      conditions: ["Mild Essential Hypertension"],
      medications: ["Lisinopril 10mg PO Daily"],
      medicalNotes: "Documented emergency room visit in 2021 after amoxicillin. Use Clindamycin or Macrolides only.",
      previousDental: "Extensive composite restorations in 2023. Missing lower left first molar (#36) extracted due to caries 2019.",
      dentalAnxiety: "Moderate"
    },
    dentalChart: {
      "16": { status: "caries", surfaces: { occlusal: true, mesial: true, distal: false, buccal: false, lingual: false }, findings: ["Deep dentinal caries", "Cold sensitivity"], diagnosis: "Irreversible Pulpitis #16", planned: ["D3330", "D2740"], completed: [] },
      "21": { status: "restoration", surfaces: { occlusal: false, mesial: true, distal: false, buccal: true, lingual: false }, findings: ["Intact Class IV composite restoration placed 2023"], diagnosis: "Restored - Good Margin", planned: [], completed: ["D2330"] },
      "36": { status: "missing", surfaces: {}, findings: ["Missing tooth, healed edentulous ridge"], diagnosis: "Edentulous space #36", planned: ["D6010 Implant eval"], completed: ["D7140"] },
      "46": { status: "crown", surfaces: {}, findings: ["Porcelain fused to zirconia crown, asymptomatic"], diagnosis: "Prosthetic Crown intact", planned: [], completed: ["D2740"] }
    },
    visits: [
      {
        id: "v1",
        date: "2026-10-23",
        time: "09:00 AM",
        doctor: "Dr. Sarah Chen, DDS",
        reason: "Severe throbbing ache in upper right back tooth (#16)",
        soap: {
          s: "Patient presents with spontaneous, lingering throbbing pain on upper right molar for 4 days. Pain awakens him at night.",
          o: "Tooth #16 tender to percussion (++). Electric pulp test shows delayed heightened lingering response (>30s). Periapical radiograph shows radiolucency approaching pulp chamber.",
          a: "Symptomatic Irreversible Pulpitis with Symptomatic Apical Periodontitis tooth #16.",
          p: "Discussed treatment options: Root Canal Therapy + Core Buildup + Ceramic Crown vs Extraction. Patient consented to RCT."
        },
        status: "Finalized",
        signedBy: "Dr. Sarah Chen, DDS (License: DDS-CA-94812)"
      }
    ],
    treatmentPlans: [
      {
        id: "tp1",
        title: "Tooth #16 Endodontic & Restorative Rehabilitation",
        createdAt: "2026-10-23",
        status: "Approved",
        procedures: [
          { code: "D3330", tooth: "16", name: "Molar Endodontic Therapy", cost: 980, status: "Approved" },
          { code: "D2950", tooth: "16", name: "Core Buildup with Composite", cost: 240, status: "Approved" },
          { code: "D2740", tooth: "16", name: "Zirconia / Porcelain Crown", cost: 980, status: "Proposed" }
        ],
        estimatedTotal: 2200,
        approvedTotal: 1220,
        patientSigned: true
      }
    ],
    orthodonticCase: null,
    prescriptions: [
      {
        id: "rx1",
        date: "2026-10-23",
        doctor: "Dr. Sarah Chen, DDS",
        items: [
          { drug: "Clindamycin HCl", strength: "300 mg", form: "Capsule", dose: "1 cap Q6H", duration: "5 days", qty: 20, instructions: "Take with large glass of water. PENICILLIN ALLERGY COMPLIANT." },
          { drug: "Ibuprofen", strength: "600 mg", form: "Tablet", dose: "1 tab Q8H PRN", duration: "4 days", qty: 12, instructions: "Take with food for dental pain." }
        ]
      }
    ],
    xrays: [
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
        sensor: "Dexis Titanium Digital Sensor",
        notes: "Deep disto-occlusal radiolucency approaching pulp chamber.",
        svgType: "periapical_caries"
      }
    ],
    billing: [
      {
        id: "inv-101",
        date: "2026-10-23",
        items: [
          { desc: "Emergency Dental Consultation & Exam (D0140)", amount: 85 },
          { desc: "Periapical Radiograph (D0220)", amount: 35 }
        ],
        subtotal: 120,
        discount: 0,
        total: 120,
        paid: 120,
        balance: 0,
        status: "Paid",
        method: "Credit Card (Visa ending in 4112)"
      }
    ],
    auditLogs: [
      { timestamp: "2026-10-23 08:50:12", user: "Emma Brooks", action: "Check-in & Token Generated (#T-101)" },
      { timestamp: "2026-10-23 09:15:40", user: "Dr. Sarah Chen, DDS", action: "Encounter Finalized & Signed" },
      { timestamp: "2026-10-23 09:28:11", user: "Elena Rostova", action: "Payment of $120 Recorded (Receipt #RCP-4081)" }
    ]
  },
  {
    id: "p2",
    mrn: "SDO-2026-0102",
    firstName: "Emily",
    lastName: "Zhang",
    phone: "+1 (555) 876-5432",
    email: "emily.zhang@example.com",
    dob: "2000-08-21",
    gender: "Female",
    bloodGroup: "A+",
    address: "128 Silicon Way, Apt 4B, Metro City",
    emergencyContact: { name: "David Zhang (Father)", phone: "+1 (555) 876-5430" },
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "No known systemic illness or allergies. Excellent general health.",
      previousDental: "Orthodontic treatment initiated November 2025.",
      dentalAnxiety: "Low"
    },
    dentalChart: {
      "14": { status: "missing", surfaces: {}, findings: ["Extracted for orthodontic space creation"], diagnosis: "Therapeutic extraction", planned: [], completed: ["D7140"] },
      "24": { status: "missing", surfaces: {}, findings: ["Extracted for orthodontic space creation"], diagnosis: "Therapeutic extraction", planned: [], completed: ["D7140"] },
      "34": { status: "missing", surfaces: {}, findings: ["Extracted for orthodontic space creation"], diagnosis: "Therapeutic extraction", planned: [], completed: ["D7140"] },
      "44": { status: "missing", surfaces: {}, findings: ["Extracted for orthodontic space creation"], diagnosis: "Therapeutic extraction", planned: [], completed: ["D7140"] }
    },
    visits: [
      {
        id: "v201",
        date: "2026-09-18",
        time: "10:30 AM",
        doctor: "Dr. Marcus Vance, Ortho Specialist",
        reason: "Monthly orthodontic adjustment & archwire progression",
        soap: {
          s: "Patient reports mild discomfort for 48 hours after last visit. Wearing Class II elastics faithfully 20 hours/day.",
          o: "Ceramic Damon brackets intact on all units. Extraction spaces closing well: 1.5mm residual gap upper right, 1.0mm lower right. No bracket debonds.",
          a: "Class II Division 1 malocclusion undergoing active space closure (Stage 3).",
          p: "Placed upper 0.019x0.025 SS with posted hooks. Powerchain #13 to #16 and #23 to #26. Reinforced oral hygiene around lower molar tubes."
        },
        status: "Finalized",
        signedBy: "Dr. Marcus Vance (License: ORTHO-98214)"
      }
    ],
    treatmentPlans: [
      {
        id: "tp2",
        title: "Comprehensive Orthodontics - Damon Ceramic",
        createdAt: "2025-11-10",
        status: "In Progress",
        procedures: [
          { code: "D8090", tooth: "Full Mouth", name: "Comprehensive Orthodontic Treatment - Adult", cost: 4800, status: "In Progress" },
          { code: "D8670", tooth: "Full Mouth", name: "Periodic Orthodontic Adjustment (Monthly)", cost: 0, status: "In Progress" }
        ],
        estimatedTotal: 4800,
        approvedTotal: 4800,
        patientSigned: true
      }
    ],
    orthodonticCase: {
      applianceType: "Ceramic Damon Self-Ligating Brackets",
      classification: "Angle Class II Div 1 (Severe Crowding with 5.5mm Overjet)",
      startDate: "2025-11-10",
      expectedDurationMonths: 20,
      currentStage: "Stage 3 — Space Closure & Arch Coordination",
      upperArchwire: "0.019 x 0.025 Stainless Steel (Posted)",
      lowerArchwire: "0.019 x 0.025 Stainless Steel",
      elastics: "Class II 3/16\" 4.5 oz bilateral (22 hrs/day)",
      compliance: "Excellent",
      progressPercent: 65,
      nextFollowUpDate: "2026-11-20",
      adjustments: [
        { date: "2025-11-10", notes: "Bonded full upper and lower ceramic brackets. Initial 0.014 CuNiTi wires placed." },
        { date: "2026-02-14", notes: "Progressed to 0.018 CuNiTi wires. Leveling and alignment progressing rapidly." },
        { date: "2026-06-10", notes: "Placed 0.019x0.025 TMA rectangular archwires. Initiated lacebacks." },
        { date: "2026-09-18", notes: "Placed 0.019x0.025 SS wires with active powerchain. Commenced Class II elastics." }
      ],
      photos: [
        { date: "2025-11-10", label: "Initial Presentation", stage: "Pre-Treatment", notes: "Crowded anterior, deep overbite 65%" },
        { date: "2026-06-10", label: "Month 7 Progress", stage: "Mid-Treatment", notes: "Arch leveled, canine retraction underway" },
        { date: "2026-10-23", label: "Current Visit", stage: "Space Closure", notes: "Overjet reduced to 2.5mm, spaces closing" }
      ]
    },
    prescriptions: [],
    billing: [
      {
        id: "inv-102",
        date: "2025-11-10",
        items: [
          { desc: "Comprehensive Orthodontic Package (Ceramic Damon)", amount: 4800 }
        ],
        subtotal: 4800,
        discount: 300,
        total: 4500,
        paid: 3000,
        balance: 1500,
        status: "Partial",
        method: "Installment Plan ($500/month)"
      }
    ],
    auditLogs: [
      { timestamp: "2026-10-23 09:45:00", user: "Emma Brooks", action: "Checked in for Orthodontic Adjustment (#T-102)" }
    ]
  },
  {
    id: "p3",
    mrn: "SDO-2026-0103",
    firstName: "Marcus",
    lastName: "Rodriguez",
    phone: "+1 (555) 345-6789",
    email: "marcus.r@example.com",
    dob: "1981-11-03",
    gender: "Male",
    bloodGroup: "B+",
    address: "512 Pinecrest Blvd, Metro City",
    emergencyContact: { name: "Elena Rodriguez (Sister)", phone: "+1 (555) 345-6790" },
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [
        { name: "Latex", severity: "Moderate (Contact dermatitis)" },
        { name: "Sulfa Drugs", severity: "Moderate (Urticaria/Rash)" }
      ],
      conditions: ["Type 2 Diabetes Mellitus (HbA1c 7.1%)", "Hyperlipidemia"],
      medications: ["Metformin 850mg PO BD", "Atorvastatin 20mg PO QPM"],
      medicalNotes: "NON-LATEX GLOVES & RUBBER DAM MANDATORY. Morning appointments preferred due to diabetes schedule.",
      previousDental: "Generalized subgingival calculus, bleeding on probing, chronic generalized periodontitis.",
      dentalAnxiety: "Moderate"
    },
    dentalChart: {
      "17": { status: "caries", surfaces: { occlusal: true, mesial: false, distal: false, buccal: true, lingual: false }, findings: ["Occlusal enamel caries", "Pocket depth 5mm"], diagnosis: "Caries & Localized Periodontitis", planned: ["D2391", "D4341"], completed: [] },
      "26": { status: "restoration", surfaces: { occlusal: true, mesial: true, distal: true, buccal: false, lingual: false }, findings: ["Old MOD amalgam with marginal staining"], diagnosis: "Defective Amalgam Margin", planned: ["D2393"], completed: [] },
      "31": { status: "healthy", surfaces: {}, findings: ["Grade 1 mobility, 4mm pocket depth"], diagnosis: "Periodontitis stage II", planned: ["D4341"], completed: [] },
      "41": { status: "healthy", surfaces: {}, findings: ["Grade 1 mobility, 4mm pocket depth"], diagnosis: "Periodontitis stage II", planned: ["D4341"], completed: [] }
    },
    visits: [
      {
        id: "v301",
        date: "2026-10-15",
        time: "11:00 AM",
        doctor: "Dr. Sarah Chen, DDS",
        reason: "Gums bleeding while brushing, foul taste",
        soap: {
          s: "Patient notices bleeding when brushing and floss catches on upper back teeth.",
          o: "Full mouth periodontal charting: Probing depths 4-6mm in posterior quadrants with 45% bleeding on probing. Subgingival calculus heavy.",
          a: "Generalized Periodontitis Stage II, Grade B (modified by diabetes).",
          p: "Recommended 4-quadrant Scaling & Root Planing with local anesthesia + Chlorhexidine oral rinse."
        },
        status: "Finalized",
        signedBy: "Dr. Sarah Chen, DDS"
      }
    ],
    treatmentPlans: [
      {
        id: "tp3",
        title: "Full Mouth Periodontal Therapy & Restorations",
        createdAt: "2026-10-15",
        status: "Approved",
        procedures: [
          { code: "D4341", tooth: "Quad 1", name: "Scaling & Root Planing - UR Quad", cost: 220, status: "Approved" },
          { code: "D4341", tooth: "Quad 2", name: "Scaling & Root Planing - UL Quad", cost: 220, status: "Approved" },
          { code: "D4341", tooth: "Quad 3", name: "Scaling & Root Planing - LL Quad", cost: 220, status: "Approved" },
          { code: "D4341", tooth: "Quad 4", name: "Scaling & Root Planing - LR Quad", cost: 220, status: "Approved" },
          { code: "D2391", tooth: "17", name: "Resin Composite 2-surf Posterior", cost: 235, status: "Proposed" }
        ],
        estimatedTotal: 1115,
        approvedTotal: 880,
        patientSigned: true
      }
    ],
    orthodonticCase: null,
    prescriptions: [
      {
        id: "rx3",
        date: "2026-10-15",
        doctor: "Dr. Sarah Chen, DDS",
        items: [
          { drug: "Chlorhexidine Gluconate 0.2%", strength: "0.2%", form: "Mouthwash", dose: "10ml BD rinse", duration: "10 days", qty: 1, instructions: "Rinse 60 secs morning and night after brushing." }
        ]
      }
    ],
    billing: [
      {
        id: "inv-103",
        date: "2026-10-15",
        items: [
          { desc: "Comprehensive Periodontal Evaluation (D0150)", amount: 110 },
          { desc: "Full Mouth Radiographs (D0210)", amount: 145 }
        ],
        subtotal: 255,
        discount: 25,
        total: 230,
        paid: 230,
        balance: 0,
        status: "Paid",
        method: "Debit Card"
      }
    ],
    auditLogs: [
      { timestamp: "2026-10-15 11:45:00", user: "Dr. Sarah Chen, DDS", action: "Perio Charting Completed" }
    ]
  },
  {
    id: "p4",
    mrn: "SDO-2026-0104",
    firstName: "Chloe",
    lastName: "Bennett",
    phone: "+1 (555) 456-7890",
    email: "chloe.b@example.com",
    dob: "2009-03-12",
    gender: "Female",
    bloodGroup: "O-",
    address: "89 Meadow Lane, Oakwood Hills",
    emergencyContact: { name: "Rebecca Bennett (Mother)", phone: "+1 (555) 456-7899" },
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: ["Mild Asthma (exercise-induced)"],
      medications: ["Albuterol Inhaler 90mcg PRN"],
      medicalNotes: "Patient carries inhaler to all appointments.",
      previousDental: "Routine preventive care, no permanent restorations.",
      dentalAnxiety: "Low"
    },
    dentalChart: {
      "12": { status: "healthy", surfaces: {}, findings: ["Palatally displaced lateral incisor, now aligned"], diagnosis: "Corrected crossbite", planned: [], completed: [] },
      "22": { status: "healthy", surfaces: {}, findings: ["Rotated lateral incisor, rotation corrected"], diagnosis: "Rotated tooth resolved", planned: [], completed: [] }
    },
    visits: [
      {
        id: "v401",
        date: "2026-09-20",
        time: "03:30 PM",
        doctor: "Dr. Marcus Vance, Ortho Specialist",
        reason: "Adolescent braces review & detailing",
        soap: {
          s: "Chloe and mom pleased with smile transformation. No poking wires or bracket issues.",
          o: "Overjet reduced from 6mm to 2mm. Anterior open bite completely closed. Finishing archwires active.",
          a: "Class II Div 1 malocclusion in final detailing stage (Stage 4).",
          p: "Coordinated archforms. Plan debonding in 8-10 weeks. Prepare impression for vacuum-formed retainers next visit."
        },
        status: "Finalized",
        signedBy: "Dr. Marcus Vance"
      }
    ],
    treatmentPlans: [
      {
        id: "tp4",
        title: "Adolescent Comprehensive Orthodontics (Metallic)",
        createdAt: "2024-08-15",
        status: "In Progress",
        procedures: [
          { code: "D8080", tooth: "Full Mouth", name: "Comprehensive Orthodontics - Adolescent", cost: 4200, status: "In Progress" },
          { code: "D8680", tooth: "Full Mouth", name: "Orthodontic Retention (Maxillary & Mandibular)", cost: 450, status: "Proposed" }
        ],
        estimatedTotal: 4650,
        approvedTotal: 4200,
        patientSigned: true
      }
    ],
    orthodonticCase: {
      applianceType: "Mini Twin Metal Brackets (0.022 Slot)",
      classification: "Angle Class II Div 1 with Anterior Open Bite",
      startDate: "2024-08-15",
      expectedDurationMonths: 24,
      currentStage: "Stage 4 — Final Detailing & Root Torquing",
      upperArchwire: "0.019 x 0.025 Braided Steel Finishing Wire",
      lowerArchwire: "0.019 x 0.025 Braided Steel Finishing Wire",
      elastics: "Box elastics #13-#14 to #43-#44 (night wear only)",
      compliance: "Excellent",
      progressPercent: 90,
      nextFollowUpDate: "2026-10-12",
      adjustments: [
        { date: "2024-08-15", notes: "Bonded upper & lower metal brackets. 0.014 NiTi wires placed." },
        { date: "2025-03-10", notes: "Progression to 0.018 SS archwire. Placed intermaxillary elastics." },
        { date: "2026-01-20", notes: "0.019x0.025 SS finishing archwire placed. Root parallelism confirmed on OPG." },
        { date: "2026-09-20", notes: "Final detailing bends placed. Debonding anticipated November 2026." }
      ],
      photos: [
        { date: "2024-08-15", label: "Initial Smile", stage: "Pre-Treatment", notes: "Anterior open bite 3mm, severe flared upper incisors" },
        { date: "2025-08-10", label: "Year 1 Review", stage: "Mid-Treatment", notes: "Open bite closed, arch coordinated" },
        { date: "2026-09-20", label: "Finishing Stage", stage: "Near Debond", notes: "Ideal occlusion, solid class I canine & molar relationship" }
      ]
    },
    prescriptions: [],
    billing: [
      {
        id: "inv-104",
        date: "2024-08-15",
        items: [{ desc: "Adolescent Orthodontic Full Package", amount: 4200 }],
        subtotal: 4200,
        discount: 200,
        total: 4000,
        paid: 3500,
        balance: 500,
        status: "Partial",
        method: "Payment Plan"
      }
    ],
    auditLogs: []
  },
  {
    id: "p5",
    mrn: "SDO-2026-0105",
    firstName: "David",
    lastName: "Kim",
    phone: "+1 (555) 567-8901",
    email: "david.kim@example.com",
    dob: "1993-06-29",
    gender: "Male",
    bloodGroup: "A-",
    address: "244 Broadway Ave, Apt 12, Metro City",
    emergencyContact: { name: "Jennifer Kim (Sister)", phone: "+1 (555) 567-8905" },
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "No medical contraindications.",
      previousDental: "Clear aligner therapy commenced February 2026.",
      dentalAnxiety: "Low"
    },
    dentalChart: {},
    visits: [
      {
        id: "v501",
        date: "2026-08-10",
        time: "02:00 PM",
        doctor: "Dr. Marcus Vance, Ortho Specialist",
        reason: "Clear Aligner stage check - Tray 14 review",
        soap: {
          s: "Wearing trays 22 hours/day. Switching every 10 days.",
          o: "Composite attachments intact on #13, 14, 23, 24, 33, 43. Tracking verified against 3D digital model.",
          a: "Adult anterior crowding in active clear aligner correction.",
          p: "Delivered aligner trays 15 through 20. Scheduled check for tray 21."
        },
        status: "Finalized",
        signedBy: "Dr. Marcus Vance"
      }
    ],
    treatmentPlans: [
      {
        id: "tp5",
        title: "Clear Aligner Therapy (Comprehensive 24 Stages)",
        createdAt: "2026-02-05",
        status: "In Progress",
        procedures: [
          { code: "D8090", tooth: "Full Mouth", name: "Comprehensive Clear Aligner Therapy", cost: 5200, status: "In Progress" }
        ],
        estimatedTotal: 5200,
        approvedTotal: 5200,
        patientSigned: true
      }
    ],
    orthodonticCase: {
      applianceType: "Clear Aligners (SmartTrack Polymer)",
      classification: "Class I Malocclusion with Moderate Anterior Crowding",
      startDate: "2026-02-05",
      expectedDurationMonths: 12,
      currentStage: "Aligner Tray 14 of 24 (60% Progress)",
      upperArchwire: "N/A (Clear Aligners)",
      lowerArchwire: "N/A (Clear Aligners)",
      elastics: "None currently",
      compliance: "Excellent (Wear timer log: 21.8 hrs/day avg)",
      progressPercent: 58,
      nextFollowUpDate: "2026-11-05",
      adjustments: [
        { date: "2026-02-05", notes: "Placed composite attachments and delivered Trays 1-4." },
        { date: "2026-04-12", notes: "Interproximal reduction (IPR) 0.3mm mesial of #32, 31, 41, 42. Trays 5-10 delivered." },
        { date: "2026-08-10", notes: "Delivered Trays 15-20. Excellent tracking." }
      ],
      photos: [
        { date: "2026-02-05", label: "Initial Digital Scan", stage: "Pre-Treatment", notes: "Severe lower anterior imbrication" },
        { date: "2026-08-10", label: "Tray 14 Progress", stage: "Mid-Treatment", notes: "Incisors unwound, arch form expanding" }
      ]
    },
    prescriptions: [],
    billing: [
      {
        id: "inv-105",
        date: "2026-02-05",
        items: [{ desc: "Clear Aligner Therapy Package", amount: 5200 }],
        subtotal: 5200,
        discount: 0,
        total: 5200,
        paid: 4350,
        balance: 850,
        status: "Partial",
        method: "Credit Card"
      }
    ],
    auditLogs: []
  },
  {
    id: "p6",
    mrn: "SDO-2026-0106",
    firstName: "Sarah",
    lastName: "Jenkins",
    phone: "+1 (555) 678-9012",
    email: "sarah.j@example.com",
    dob: "1997-01-14",
    gender: "Female",
    bloodGroup: "O+",
    address: "331 Maple Court, Metro City",
    emergencyContact: { name: "Michael Jenkins (Husband)", phone: "+1 (555) 678-9015" },
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [
        { name: "Codeine", severity: "Moderate (Severe nausea/vomiting)" }
      ],
      conditions: [],
      medications: ["Oral Contraceptives"],
      medicalNotes: "Avoid codeine/opioid analgesics. Prescribe NSAIDs/Acetaminophen.",
      previousDental: "Sports trauma yesterday: chipped upper right central incisor (#11).",
      dentalAnxiety: "High"
    },
    dentalChart: {
      "11": { status: "fracture", surfaces: { occlusal: true, mesial: true, distal: false, buccal: true, lingual: false }, findings: ["Ellis Class II coronal fracture involving enamel and dentin", "Pulp not exposed"], diagnosis: "Coronal Fracture #11", planned: ["D2330"], completed: [] }
    },
    visits: [],
    treatmentPlans: [
      {
        id: "tp6",
        title: "Emergency Cosmetic Restoration #11",
        createdAt: "2026-10-23",
        status: "Proposed",
        procedures: [
          { code: "D2330", tooth: "11", name: "Anterior Composite Resin Restoration (Class IV Angle Build-up)", cost: 260, status: "Proposed" },
          { code: "D0220", tooth: "11", name: "Intraoral Periapical Radiograph", cost: 35, status: "Proposed" }
        ],
        estimatedTotal: 295,
        approvedTotal: 0,
        patientSigned: false
      }
    ],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p7",
    mrn: "SDO-2026-0107",
    firstName: "Robert",
    lastName: "Taylor",
    phone: "+1 (555) 789-0123",
    email: "robert.taylor@example.com",
    dob: "1964-07-19",
    gender: "Male",
    bloodGroup: "AB+",
    address: "1028 Elmwood Drive, Metro City",
    emergencyContact: { name: "Patricia Taylor (Wife)", phone: "+1 (555) 789-0128" },
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: ["Coronary Artery Disease (Stent placed 2022)", "Hypercholesterolemia"],
      medications: ["Aspirin 81mg PO Daily", "Clopidogrel 75mg PO Daily", "Rosuvastatin 20mg PO QPM"],
      medicalNotes: "PATIENT ON DUAL ANTIPLATELET THERAPY (Aspirin + Plavix). Do not stop antiplatelets for minor oral surgery without cardiologist clearance. Local hemostatic measures (Surgicel / Tranexamic Acid) required.",
      previousDental: "Multiple posterior extractions over past 15 years. Wears partial lower denture.",
      dentalAnxiety: "Low"
    },
    dentalChart: {
      "35": { status: "missing", surfaces: {}, findings: ["Missing"], diagnosis: "Edentulous", planned: [], completed: [] },
      "36": { status: "missing", surfaces: {}, findings: ["Missing"], diagnosis: "Edentulous", planned: [], completed: [] },
      "37": { status: "missing", surfaces: {}, findings: ["Missing"], diagnosis: "Edentulous", planned: [], completed: [] },
      "45": { status: "missing", surfaces: {}, findings: ["Missing"], diagnosis: "Edentulous", planned: [], completed: [] },
      "46": { status: "missing", surfaces: {}, findings: ["Missing"], diagnosis: "Edentulous", planned: [], completed: [] },
      "47": { status: "missing", surfaces: {}, findings: ["Missing"], diagnosis: "Edentulous", planned: [], completed: [] }
    },
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p8",
    mrn: "SDO-2026-0108",
    firstName: "Amina",
    lastName: "Al-Mansoor",
    phone: "+1 (555) 890-1234",
    email: "amina.m@example.com",
    dob: "2002-12-05",
    gender: "Female",
    bloodGroup: "O+",
    address: "67 Beacon Hill Road, Metro City",
    emergencyContact: { name: "Zaid Al-Mansoor (Brother)", phone: "+1 (555) 890-1239" },
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "No medical warnings. Good oral health.",
      previousDental: "Periodic cleanings, no caries.",
      dentalAnxiety: "Low"
    },
    dentalChart: {},
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p9",
    mrn: "SDO-2026-0109",
    firstName: "Liam",
    lastName: "O'Connor",
    phone: "+1 (555) 901-2345",
    email: "oconnor.family@example.com",
    dob: "2017-05-18",
    gender: "Male",
    bloodGroup: "A+",
    address: "414 Willow Creek Way, Metro City",
    emergencyContact: { name: "Fiona O'Connor (Mother)", phone: "+1 (555) 901-2349" },
    photoUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [
        { name: "Peanuts (Food Allergy)", severity: "Severe" }
      ],
      conditions: ["Mixed Dentition (Pediatric Patient)"],
      medications: ["EpiPen carried by mother"],
      medicalNotes: "Pediatric mixed dentition. Behavior management: very cooperative with praise.",
      previousDental: "Fluoride applications and sealants on primary molars.",
      dentalAnxiety: "Low"
    },
    dentalChart: {
      "55": { status: "healthy", surfaces: {}, findings: ["Primary second molar sound"], diagnosis: "Healthy primary", planned: [], completed: [] },
      "65": { status: "caries", surfaces: { occlusal: true, mesial: false, distal: false, buccal: false, lingual: false }, findings: ["Pit caries primary molar #65"], diagnosis: "Primary molar caries", planned: ["D2391"], completed: [] }
    },
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p10",
    mrn: "SDO-2026-0110",
    firstName: "Jessica",
    lastName: "Patel",
    phone: "+1 (555) 012-3456",
    email: "jessica.patel@example.com",
    dob: "1991-09-14",
    gender: "Female",
    bloodGroup: "B-",
    address: "710 Horizon Terrace, Metro City",
    emergencyContact: { name: "Anand Patel (Spouse)", phone: "+1 (555) 012-3459" },
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: ["Hypothyroidism"],
      medications: ["Levothyroxine 75mcg PO QAM"],
      medicalNotes: "Thyroid function well controlled.",
      previousDental: "Interested in adult clear aligners for upper anterior crowding.",
      dentalAnxiety: "Low"
    },
    dentalChart: {},
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p11",
    mrn: "SDO-2026-0111",
    firstName: "Carlos",
    lastName: "Gomez",
    phone: "+1 (555) 123-4567",
    email: "carlos.g@example.com",
    dob: "1975-02-28",
    gender: "Male",
    bloodGroup: "O+",
    address: "982 Sunset Ridge, Metro City",
    emergencyContact: { name: "Maria Gomez (Wife)", phone: "+1 (555) 123-4560" },
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: ["Gastroesophageal Reflux Disease (GERD)"],
      medications: ["Omeprazole 20mg PO Daily"],
      medicalNotes: "Acid erosion observed on palatal surfaces of upper anterior teeth.",
      previousDental: "Multiple amalgam restorations placed in 2010.",
      dentalAnxiety: "Moderate"
    },
    dentalChart: {},
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p12",
    mrn: "SDO-2026-0112",
    firstName: "Hannah",
    lastName: "Scott",
    phone: "+1 (555) 234-5678",
    email: "hannah.scott@example.com",
    dob: "1985-10-10",
    gender: "Female",
    bloodGroup: "A+",
    address: "15 Laurel Glen, Metro City",
    emergencyContact: { name: "Tyler Scott (Husband)", phone: "+1 (555) 234-5670" },
    photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "Routine hygiene patient. Regular attendee.",
      previousDental: "Routine scale and polish.",
      dentalAnxiety: "Low"
    },
    dentalChart: {},
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p13",
    mrn: "SDO-2026-0113",
    firstName: "Noah",
    lastName: "Williams",
    phone: "+1 (555) 345-6780",
    email: "williams.noah@example.com",
    dob: "2011-04-03",
    gender: "Male",
    bloodGroup: "O+",
    address: "410 Birch Wood Dr, Metro City",
    emergencyContact: { name: "Karen Williams (Mother)", phone: "+1 (555) 345-6781" },
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "In active braces treatment. Next wire step planned.",
      previousDental: "Orthodontic metal brackets placed 8 months ago.",
      dentalAnxiety: "Low"
    },
    dentalChart: {},
    visits: [],
    treatmentPlans: [],
    orthodonticCase: {
      applianceType: "Metal Twin Brackets",
      classification: "Class I Crowding",
      startDate: "2026-02-10",
      expectedDurationMonths: 18,
      currentStage: "Stage 2 — Leveling & Alignment",
      upperArchwire: "0.016 NiTi",
      lowerArchwire: "0.016 NiTi",
      elastics: "None",
      compliance: "Good",
      progressPercent: 45,
      nextFollowUpDate: "2026-10-08",
      adjustments: [
        { date: "2026-02-10", notes: "Bonded full mouth. Initial 0.014 NiTi wires." },
        { date: "2026-05-15", notes: "Progression to 0.016 NiTi wires." }
      ],
      photos: []
    },
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p14",
    mrn: "SDO-2026-0114",
    firstName: "Sophia",
    lastName: "Anderson",
    phone: "+1 (555) 456-7891",
    email: "sophia.anderson@example.com",
    dob: "1993-12-18",
    gender: "Female",
    bloodGroup: "AB-",
    address: "88 University Crescent, Metro City",
    emergencyContact: { name: "Lucas Anderson (Brother)", phone: "+1 (555) 456-7895" },
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "Seeking cosmetic veneer consultation.",
      previousDental: "Conservative fillings on molars.",
      dentalAnxiety: "Low"
    },
    dentalChart: {},
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  },
  {
    id: "p15",
    mrn: "SDO-2026-0115",
    firstName: "Daniel",
    lastName: "Washington",
    phone: "+1 (555) 567-8902",
    email: "daniel.w@example.com",
    dob: "1968-08-30",
    gender: "Male",
    bloodGroup: "B+",
    address: "623 Riverbank Way, Metro City",
    emergencyContact: { name: "Gloria Washington (Wife)", phone: "+1 (555) 567-8909" },
    photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: ["Controlled Type 2 Diabetes"],
      medications: ["Metformin 500mg"],
      medicalNotes: "Crown delivery visit scheduled.",
      previousDental: "Root canal therapy completed on #26 last week.",
      dentalAnxiety: "Low"
    },
    dentalChart: {
      "26": { status: "crown", surfaces: {}, findings: ["Prepared for ceramic crown, temporary crown in place"], diagnosis: "Pending permanent cementation", planned: ["D2740"], completed: ["D3330"] }
    },
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [
      {
        id: "inv-115",
        date: "2026-10-16",
        items: [{ desc: "Zirconia Crown Preparation & Impression (D2740)", amount: 980 }],
        subtotal: 980,
        discount: 0,
        total: 980,
        paid: 560,
        balance: 420,
        status: "Partial",
        method: "Credit Card"
      }
    ],
    auditLogs: []
  },
  {
    id: "p16",
    mrn: "SDO-2026-0116",
    firstName: "Olivia",
    lastName: "Martinez",
    phone: "+1 (555) 678-9013",
    email: "olivia.martinez@example.com",
    dob: "1999-05-22",
    gender: "Female",
    bloodGroup: "O+",
    address: "210 Park Vista Suite 5, Metro City",
    emergencyContact: { name: "Rosa Martinez (Mother)", phone: "+1 (555) 678-9018" },
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    medicalInfo: {
      allergies: [],
      conditions: [],
      medications: [],
      medicalNotes: "Walk-in patient today: Wisdom tooth evaluation #38, #48.",
      previousDental: "Recurrent pericoronitis around lower third molars.",
      dentalAnxiety: "Moderate"
    },
    dentalChart: {
      "38": { status: "caries", surfaces: { occlusal: true }, findings: ["Partially impacted with operculum inflammation"], diagnosis: "Pericoronitis & Impaction #38", planned: ["D7210"], completed: [] },
      "48": { status: "caries", surfaces: { occlusal: true }, findings: ["Horizontally impacted against #47 root"], diagnosis: "Mesioangular Impaction #48", planned: ["D7210"], completed: [] }
    },
    visits: [],
    treatmentPlans: [],
    orthodonticCase: null,
    prescriptions: [],
    billing: [],
    auditLogs: []
  }
];

const INITIAL_APPOINTMENTS = [
  {
    id: "apt-1",
    patientId: "p1",
    doctorId: "u2",
    chairId: "c1",
    date: "2026-10-23",
    time: "09:00 AM",
    duration: 45,
    service: "Emergency Consultation & Endodontic Exam",
    status: "Completed",
    notes: "Patient with severe pain #16. Examination completed.",
    tokenNumber: "T-101"
  },
  {
    id: "apt-2",
    patientId: "p2",
    doctorId: "u3",
    chairId: "c4",
    date: "2026-10-23",
    time: "10:30 AM",
    duration: 30,
    service: "Periodic Orthodontic Treatment Visit (Monthly Adjustment)",
    status: "In Consultation",
    notes: "Ceramic Damon braces space closure stage.",
    tokenNumber: "T-102"
  },
  {
    id: "apt-3",
    patientId: "p3",
    doctorId: "u2",
    chairId: "c2",
    date: "2026-10-23",
    time: "11:00 AM",
    duration: 45,
    service: "Periodontal Scaling and Root Planing (UR/UL)",
    status: "Waiting",
    notes: "Diabetic patient on non-latex protocol. Arrived early.",
    tokenNumber: "T-103"
  },
  {
    id: "apt-4",
    patientId: "p4",
    doctorId: "u3",
    chairId: "c4",
    date: "2026-10-23",
    time: "11:30 AM",
    duration: 30,
    service: "Orthodontic Detailing & Pre-Debonding Assessment",
    status: "Waiting",
    notes: "Check bite and prepare retainers plan.",
    tokenNumber: "T-104"
  },
  {
    id: "apt-5",
    patientId: "p5",
    doctorId: "u3",
    chairId: "c4",
    date: "2026-10-23",
    time: "01:30 PM",
    duration: 30,
    service: "Clear Aligner Stage 15 Delivery",
    status: "Confirmed",
    notes: "Deliver next set of aligners."
  },
  {
    id: "apt-6",
    patientId: "p6",
    doctorId: "u2",
    chairId: "c1",
    date: "2026-10-23",
    time: "02:15 PM",
    duration: 45,
    service: "Cosmetic Composite Restoration #11 (Fracture)",
    status: "Confirmed",
    notes: "Sports injury. Avoid codeine analgesics."
  },
  {
    id: "apt-7",
    patientId: "p7",
    doctorId: "u2",
    chairId: "c3",
    date: "2026-10-23",
    time: "03:00 PM",
    duration: 60,
    service: "Implant Overdenture Consultation",
    status: "Confirmed",
    notes: "Cardiac stent patient on dual antiplatelets. Review panoramic radiograph."
  },
  {
    id: "apt-8",
    patientId: "p8",
    doctorId: "u2",
    chairId: "c2",
    date: "2026-10-23",
    time: "04:15 PM",
    duration: 45,
    service: "Adult Prophylaxis & In-Office Whitening Consultation",
    status: "Confirmed",
    notes: "Routine hygiene."
  },
  {
    id: "apt-9",
    patientId: "p15",
    doctorId: "u2",
    chairId: "c1",
    date: "2026-10-23",
    time: "05:00 PM",
    duration: 30,
    service: "Crown Cementation Permanent (Zirconia #26)",
    status: "Scheduled",
    notes: "Lab returned crown. Verify fit and occlusion."
  },
  {
    id: "apt-10",
    patientId: "p9",
    doctorId: "u2",
    chairId: "c2",
    date: "2026-10-24",
    time: "09:30 AM",
    duration: 30,
    service: "Pediatric Prophylaxis & Topical Fluoride Varnish",
    status: "Confirmed",
    notes: "Severe peanut food allergy. Mixed dentition."
  },
  {
    id: "apt-11",
    patientId: "p10",
    doctorId: "u3",
    chairId: "c4",
    date: "2026-10-24",
    time: "10:30 AM",
    duration: 45,
    service: "Adult Orthodontic Consultation & 3D Intraoral Scan",
    status: "Confirmed",
    notes: "Initial consultation for aligners."
  },
  {
    id: "apt-12",
    patientId: "p11",
    doctorId: "u2",
    chairId: "c1",
    date: "2026-10-24",
    time: "02:00 PM",
    duration: 45,
    service: "Periodic Oral Evaluation & Composite Restoration",
    status: "Scheduled",
    notes: "Check GERD palatal erosion."
  }
];

const INITIAL_QUEUE = [
  {
    token: "T-101",
    patientId: "p1",
    patientName: "John Miller",
    mrn: "SDO-2026-0101",
    type: "Appointment",
    service: "Emergency Consultation #16",
    doctorId: "u2",
    doctorName: "Dr. Sarah Chen, DDS",
    chairName: "Chair 1",
    checkInTime: "08:45 AM",
    waitTimeMinutes: 25,
    status: "Completed",
    notes: "Sent to cashier for checkout."
  },
  {
    token: "T-102",
    patientId: "p2",
    patientName: "Emily Zhang",
    mrn: "SDO-2026-0102",
    type: "Appointment",
    service: "Orthodontic Adjustment Visit",
    doctorId: "u3",
    doctorName: "Dr. Marcus Vance",
    chairName: "Chair 4 (Ortho Bay)",
    checkInTime: "10:15 AM",
    waitTimeMinutes: 15,
    status: "In Consultation",
    notes: "Currently in chair 4."
  },
  {
    token: "T-103",
    patientId: "p3",
    patientName: "Marcus Rodriguez",
    mrn: "SDO-2026-0103",
    type: "Appointment",
    service: "Periodontal Scaling (UR/UL)",
    doctorId: "u2",
    doctorName: "Dr. Sarah Chen, DDS",
    chairName: "Chair 2",
    checkInTime: "10:35 AM",
    waitTimeMinutes: 18,
    status: "Waiting",
    notes: "Non-latex setup prepared."
  },
  {
    token: "T-104",
    patientId: "p4",
    patientName: "Chloe Bennett",
    mrn: "SDO-2026-0104",
    type: "Appointment",
    service: "Orthodontic Detailing Assessment",
    doctorId: "u3",
    doctorName: "Dr. Marcus Vance",
    chairName: "Chair 4 (Ortho Bay)",
    checkInTime: "10:50 AM",
    waitTimeMinutes: 10,
    status: "Waiting",
    notes: "Waiting in reception lounge."
  },
  {
    token: "T-105",
    patientId: "p16",
    patientName: "Olivia Martinez",
    mrn: "SDO-2026-0116",
    type: "Walk-In",
    service: "Emergency Wisdom Tooth Pain Evaluation",
    doctorId: "u2",
    doctorName: "Dr. Sarah Chen, DDS",
    chairName: "Chair 1",
    checkInTime: "10:55 AM",
    waitTimeMinutes: 7,
    status: "Waiting",
    notes: "Walk-in triage completed."
  }
];

// In-Memory & LocalStorage Persistence Manager
class ClinicStore {
  constructor() {
    this.STORAGE_KEY = "SMILE_DENTAL_CLINIC_STATE_v1";
    this.currentUser = STAFF_USERS[0]; // Default receptionist
    this.isKioskMode = false;
    this.currentStation = "PATIENT_KIOSK"; // Default active workstation
    this.kioskPin = "1234";
    this.isKioskLocked = false;
    this.pharmacyInventory = JSON.parse(JSON.stringify(DENTAL_PHARMACY_INVENTORY));
    this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.patients = parsed.patients || INITIAL_PATIENTS;
        this.appointments = parsed.appointments || INITIAL_APPOINTMENTS;
        this.queue = parsed.queue || INITIAL_QUEUE;
        this.procedures = parsed.procedures || PROCEDURE_CATALOG;
        this.pharmacyInventory = parsed.pharmacyInventory || DENTAL_PHARMACY_INVENTORY;
        this.currentUserId = parsed.currentUserId || "u1";
        this.currentUser = STAFF_USERS.find(u => u.id === this.currentUserId) || STAFF_USERS[0];
        return;
      }
    } catch (e) {
      console.warn("Could not load from localStorage, falling back to initial data:", e);
    }
    this.resetToDefaults();
  }

  saveState() {
    try {
      const state = {
        patients: this.patients,
        appointments: this.appointments,
        queue: this.queue,
        procedures: this.procedures,
        pharmacyInventory: this.pharmacyInventory,
        currentUserId: this.currentUser.id
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }

  resetToDefaults() {
    this.patients = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
    this.appointments = JSON.parse(JSON.stringify(INITIAL_APPOINTMENTS));
    this.queue = JSON.parse(JSON.stringify(INITIAL_QUEUE));
    this.procedures = JSON.parse(JSON.stringify(PROCEDURE_CATALOG));
    this.pharmacyInventory = JSON.parse(JSON.stringify(DENTAL_PHARMACY_INVENTORY));
    this.currentUser = STAFF_USERS[0];
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    this.saveState();
  }

  dispenseItem(itemId, qty = 1) {
    this.pharmacyInventory = this.pharmacyInventory || (typeof DENTAL_PHARMACY_INVENTORY !== 'undefined' ? DENTAL_PHARMACY_INVENTORY : (window.DENTAL_PHARMACY_INVENTORY || []));
    const item = this.pharmacyInventory.find(i => i.id === itemId);
    if (!item || item.stock < qty) return { success: false, item: null };
    item.stock -= qty;
    this.saveState();
    return { success: true, item: item };
  }

  emergencyRegister(dataOrName, phoneArg, procIdArg) {
    let data = {};
    if (typeof dataOrName === "object" && dataOrName !== null) {
      data = dataOrName;
    } else {
      const fullName = (dataOrName || "").trim();
      const parts = fullName.split(" ");
      const firstName = parts[0] || "Emergency";
      const lastName = parts.slice(1).join(" ") || "Patient";
      const proc = (window.EMERGENCY_DENTAL_PROCEDURES || []).find(p => p.id === procIdArg) || { name: procIdArg || "Acute Dental Trauma", assignedChair: "Chair 3 (Surgical & Implant Suite)", estFee: 120 };
      data = {
        firstName,
        lastName,
        name: fullName || `${firstName} ${lastName}`,
        phone: phoneArg || "N/A",
        procedureName: proc.name,
        chairName: proc.assignedChair,
        procedure: proc,
        painScore: 9
      };
    }

    const emgCount = this.queue.filter(q => q.token && q.token.startsWith('EMG')).length + 1;
    const emgToken = `EMG-${String(emgCount).padStart(2, '0')}`;
    const fullName = data.name || `${data.firstName || 'Emergency'} ${data.lastName || 'Patient'}`.trim();
    const newPt = {
      id: "p" + (this.patients.length + 1),
      mrn: this.generateMRN(),
      name: fullName,
      firstName: data.firstName || "Emergency",
      lastName: data.lastName || "Patient",
      phone: data.phone || "N/A",
      dob: data.dob || "1990-01-01",
      age: 35,
      gender: data.gender || "Unknown",
      bloodGroup: "Unknown",
      allergies: "Acute Dental Trauma",
      emergencyContact: { name: "Immediate Triage", phone: data.phone || "N/A" },
      medicalInfo: {
        allergies: [],
        conditions: ["Acute Dental Trauma / Severe Pain"],
        medications: [],
        medicalNotes: data.notes || "Fast-track emergency intake via Patient Kiosk",
        previousDental: "",
        dentalAnxiety: "Severe"
      },
      dentalChart: {},
      treatmentPlans: [],
      prescriptions: [],
      billing: [],
      auditLogs: [{
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        user: "KIOSK-01 (Emergency Triage)",
        action: `FAST-TRACK EMERGENCY ADMISSION: ${data.procedureName || 'Acute Trauma'}`
      }]
    };
    this.savePatient(newPt);

    const queueItem = {
      id: "q-" + Date.now(),
      token: emgToken,
      patientId: newPt.id,
      patientName: fullName,
      serviceType: `EMERGENCY: ${data.procedureName || 'Acute Dental Triage'}`,
      chair: "chair-3",
      chairName: data.chairName || "Chair 3 (Surgical & Implant Suite)",
      doctorId: "u2",
      doctorName: "Dr. Alex Chen, DMD, FICOI",
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitTimeMinutes: 0,
      priority: "Urgent",
      status: "Waiting",
      painScore: data.painScore || 9
    };
    this.queue.unshift(queueItem);
    this.saveState();
    return {
      patient: newPt,
      queueItem,
      token: queueItem,
      chair: { id: "chair-3", name: queueItem.chairName, doctor: queueItem.doctorName },
      procedure: data.procedure || { name: data.procedureName || "Acute Dental Trauma", estFee: 120 }
    };
  }

  setCurrentUser(userId) {
    const user = STAFF_USERS.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.saveState();
    }
  }

  getPatient(idOrMrn) {
    return this.patients.find(p => p.id === idOrMrn || p.mrn === idOrMrn);
  }

  generateMRN() {
    const seq = String(this.patients.length + 1).padStart(4, "0");
    return `SDO-2026-${seq}`;
  }

  savePatient(patientData) {
    if (!patientData.id) {
      patientData.id = "p" + (this.patients.length + 1);
    }
    if (!patientData.mrn) {
      patientData.mrn = this.generateMRN();
    }
    const idx = this.patients.findIndex(p => p.id === patientData.id || p.mrn === patientData.mrn);
    if (idx >= 0) {
      this.patients[idx] = patientData;
    } else {
      this.patients.unshift(patientData);
    }
    this.saveState();
    return patientData;
  }

  checkDuplicate(phone, name, dob) {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    const trimmedName = (name || "").trim().toLowerCase();
    if (cleanPhone.length < 7 && trimmedName.length < 2 && !dob) {
      return [];
    }
    return this.patients.filter(p => {
      const pClean = (p.phone || "").replace(/\D/g, "");
      const phoneMatch = cleanPhone.length >= 7 && pClean.includes(cleanPhone);
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
      const nameMatch = trimmedName.length >= 2 && fullName.includes(trimmedName);
      const dobMatch = Boolean(dob && p.dob && p.dob === dob && (cleanPhone.length >= 7 || trimmedName.length >= 2));
      return phoneMatch || nameMatch || dobMatch;
    });
  }

  nextQueueToken() {
    const maxNum = this.queue.reduce((max, item) => {
      const m = item.token ? item.token.match(/\d+/) : null;
      const num = m ? parseInt(m[0], 10) : 100;
      return num > max ? num : max;
    }, 100);
    return `T-${maxNum + 1}`;
  }

  addQueueItem(item) {
    if (item.patientId) {
      const activeItem = this.queue.find(q => q.patientId === item.patientId && (q.status === "Waiting" || q.status === "In Consultation" || q.status === "Checked In"));
      if (activeItem) {
        return { ...activeItem, alreadyActive: true };
      }
    }
    if (!item.token) item.token = this.nextQueueToken();
    if (!item.checkInTime) {
      const now = new Date();
      item.checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    item.waitTimeMinutes = item.waitTimeMinutes || 0;
    this.queue.push(item);
    this.saveState();
    return item;
  }

  rescheduleAppointment(aptId, newDate, newTime, newChair, notes) {
    const apt = this.appointments.find(a => a.id === aptId);
    if (!apt) return null;
    apt.date = newDate;
    apt.time = newTime;
    if (newChair) apt.chairId = newChair;
    if (notes) apt.notes = (apt.notes ? apt.notes + " | " : "") + notes;
    apt.status = "Rescheduled";
    this.saveState();
    return apt;
  }

  cancelAppointment(aptId, reason) {
    const apt = this.appointments.find(a => a.id === aptId);
    if (!apt) return null;
    apt.status = "Cancelled";
    if (reason) apt.cancellationReason = reason;
    this.saveState();
    return apt;
  }

  markAppointmentNoShow(aptId) {
    const apt = this.appointments.find(a => a.id === aptId);
    if (!apt) return null;
    apt.status = "No-Show";
    this.saveState();
    return apt;
  }

  transferQueueItem(token, newDoctorId, newChairName) {
    const item = this.queue.find(q => q.token === token);
    if (!item) return null;
    if (newDoctorId) {
      item.doctorId = newDoctorId;
      const doc = STAFF_USERS.find(u => u.id === newDoctorId);
      if (doc) item.doctorName = doc.name;
    }
    if (newChairName) item.chairName = newChairName;
    this.saveState();
    return item;
  }

  markQueueNoShow(token) {
    const item = this.queue.find(q => q.token === token);
    if (!item) return null;
    item.status = "No-Show";
    this.saveState();
    return item;
  }

  requeueItem(token) {
    const item = this.queue.find(q => q.token === token);
    if (!item) return null;
    item.status = "Waiting";
    const now = new Date();
    item.checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.saveState();
    return item;
  }

  recordRefund(patientId, invoiceId, amount, reason) {
    const pt = this.getPatient(patientId);
    if (!pt || !pt.billing) return null;
    const inv = pt.billing.find(b => b.id === invoiceId);
    if (!inv) return null;
    const refundAmt = Math.min(amount, inv.paid || 0);
    inv.paid = Math.max(0, (inv.paid || 0) - refundAmt);
    inv.balance = Math.max(0, (inv.total || 0) - inv.paid);
    inv.status = inv.balance === 0 ? "Paid" : (inv.paid > 0 ? "Partial" : "Unpaid");
    inv.refunds = inv.refunds || [];
    inv.refunds.push({
      date: new Date().toISOString().split("T")[0],
      amount: refundAmt,
      reason: reason || "Patient refund requested",
      processedBy: this.currentUser.name
    });
    this.savePatient(pt);
    return inv;
  }
}

// Global store instance
window.clinicStore = new ClinicStore();
window.DENTAL_SYMPTOM_OPTIONS = DENTAL_SYMPTOM_OPTIONS;
window.EMERGENCY_DENTAL_PROCEDURES = EMERGENCY_DENTAL_PROCEDURES;
window.DENTAL_PHARMACY_INVENTORY = DENTAL_PHARMACY_INVENTORY;
