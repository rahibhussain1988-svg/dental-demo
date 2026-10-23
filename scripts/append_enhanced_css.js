const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const enhancedCss = `

/* ==========================================================================
   COMMERCIAL HEALTHCARE SAAS ELEVATIONS & EXECUTIVE CLINIC COMPONENTS
   ========================================================================== */

/* 1. Command Center Hero Banner */
.dashboard-hero-banner {
  background: linear-gradient(135deg, #042F2E 0%, #0F766E 50%, #0D9488 100%);
  border-radius: var(--radius-xl);
  padding: 26px 32px;
  color: #FFFFFF;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: 0 10px 25px -5px rgba(13, 148, 136, 0.25), 0 8px 10px -6px rgba(13, 148, 136, 0.2);
  position: relative;
  overflow: hidden;
}

.dashboard-hero-banner::after {
  content: "";
  position: absolute;
  right: -40px;
  top: -40px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-clinic-info h2 {
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-clinic-info p {
  font-size: 0.92rem;
  color: #CCFBF1;
  margin-bottom: 12px;
  max-width: 650px;
  line-height: 1.45;
}

.hero-live-badges {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-live-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pulse-dot-green {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ADE80;
  box-shadow: 0 0 8px #4ADE80;
  animation: pulseDot 2s infinite;
}

.pulse-dot-amber {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #FBBF24;
  box-shadow: 0 0 8px #FBBF24;
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.hero-action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-hero-primary {
  background: #FFFFFF;
  color: #0F766E;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-hero-primary:hover {
  background: #F0FDFA;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-hero-glass {
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  font-weight: 700;
  padding: 10px 18px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
  transition: var(--transition);
}

.btn-hero-glass:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

/* 2. Executive KPI Cards */
.executive-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.executive-kpi-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.executive-kpi-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-teal);
  box-shadow: var(--shadow-lg);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.kpi-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.kpi-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  font-size: 0.72rem;
}

.trend-up {
  background: #DCFCE7;
  color: #15803D;
}

.trend-neutral {
  background: #F1F5F9;
  color: #475569;
}

.kpi-progress-bar {
  width: 100%;
  height: 6px;
  background: #E2E8F0;
  border-radius: var(--radius-pill);
  margin-top: 10px;
  overflow: hidden;
}

.kpi-progress-fill {
  height: 100%;
  border-radius: var(--radius-pill);
  transition: width 0.5s ease;
}

/* 3. Operatory Chair Floorplan Matrix */
.floorplan-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.floorplan-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.operatory-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.operatory-card:hover {
  border-color: #94A3B8;
  box-shadow: var(--shadow-md);
}

.operatory-card.occupied {
  border-left: 4px solid var(--primary-teal);
}

.operatory-card.turnover {
  border-left: 4px solid var(--secondary-blue);
}

.operatory-card.available {
  border-left: 4px solid #10B981;
}

.operatory-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.operatory-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
}

.operatory-suite {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.operatory-status-pill {
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-occupied {
  background: #CCFBF1;
  color: #0F766E;
}

.status-turnover {
  background: #E0F2FE;
  color: #0369A1;
}

.status-available {
  background: #DCFCE7;
  color: #15803D;
}

.operatory-body {
  margin-bottom: 14px;
}

.chair-patient-box {
  background: #F8FAFC;
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #EDF2F7;
}

.chair-patient-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chair-elapsed-time {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-teal);
  background: #F0FDFA;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
}

.chair-procedure {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.chair-doctor {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 5px;
}

.operatory-actions {
  display: flex;
  gap: 6px;
}

/* 4. Operations Hub Split (Schedule Timeline vs Live Queue) */
.operations-hub-split {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.timeline-schedule-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.schedule-slot-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #F1F5F9;
  transition: var(--transition);
}

.schedule-slot-item:last-child {
  border-bottom: none;
}

.slot-time-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  font-weight: 700;
  background: #F1F5F9;
  color: #334155;
  padding: 5px 10px;
  border-radius: var(--radius-md);
  white-space: nowrap;
  min-width: 82px;
  text-align: center;
}

.slot-patient-info {
  flex: 1;
}

.slot-patient-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-meta {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.queue-snapshot-card {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.queue-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #F8FAFC;
  border: 1px solid #EDF2F7;
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  transition: var(--transition);
}

.queue-row-item:hover {
  background: #FFFFFF;
  border-color: var(--primary-teal);
  box-shadow: var(--shadow-sm);
}

.queue-row-token {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--primary-teal);
  background: #CCFBF1;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.queue-sla-green {
  color: #15803D;
  background: #DCFCE7;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
}

.queue-sla-amber {
  color: #B45309;
  background: #FEF3C7;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
}

.queue-sla-red {
  color: #B91C1C;
  background: #FEE2E2;
  padding: 2px 7px;
  border-radius: var(--radius-pill);
  font-size: 0.72rem;
  font-weight: 700;
}

/* 5. Clinical Patient Header Banner */
.patient-clinical-banner {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 22px 26px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.patient-bio-section {
  display: flex;
  align-items: center;
  gap: 18px;
}

.patient-avatar-frame {
  position: relative;
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.patient-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #F1F5F9;
  box-shadow: var(--shadow-sm);
}

.patient-avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #10B981;
  border: 2px solid #FFFFFF;
}

.patient-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.patient-full-name {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.patient-mrn-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 700;
  background: #F1F5F9;
  color: #334155;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  border: 1px solid #E2E8F0;
}

.patient-meta-row {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.patient-alerts-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.alert-chip-red {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FCA5A5;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.alert-chip-amber {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FCD34D;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 800;
}

.alert-chip-blue {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #E0F2FE;
  color: #0369A1;
  border: 1px solid #BAE6FD;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-size: 0.75rem;
  font-weight: 800;
}

.patient-insurance-box {
  background: #F8FAFC;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  min-width: 260px;
}

.insurance-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.insurance-carrier {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text-main);
}

.insurance-coverage-details {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* 6. Photo Compare Slider (Orthodontics Before/After) */
.photo-compare-container {
  position: relative;
  width: 100%;
  max-width: 680px;
  height: 380px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
  margin: 0 auto 16px;
  user-select: none;
}

.compare-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.compare-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
}

.compare-slider-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #FFFFFF;
  cursor: ew-resize;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.compare-circle-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: #0D9488;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid #FFFFFF;
}

/* 7. Phased Treatment Plans Tree */
.treatment-phase-block {
  background: #FFFFFF;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 18px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.phase-header {
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.phase-1-header {
  background: #FEF2F2;
  border-bottom-color: #FECACA;
}

.phase-2-header {
  background: #F0FDFA;
  border-bottom-color: #CCFBF1;
}

.phase-3-header {
  background: #FAF5FF;
  border-bottom-color: #F3E8FF;
}

.phase-badge {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
}

/* 8. Responsive Adjustments */
@media (max-width: 1200px) {
  .executive-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .floorplan-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .operations-hub-split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .executive-kpi-grid {
    grid-template-columns: 1fr;
  }
  .floorplan-grid {
    grid-template-columns: 1fr;
  }
  .kiosk-tiles-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-hero-banner {
    padding: 20px;
  }
  .patient-clinical-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
`;

cssContent += enhancedCss;
fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('Successfully appended enhanced commercial healthcare SaaS CSS!');
