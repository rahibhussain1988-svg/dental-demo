const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'js', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');
let lines = content.split('\n');

function replaceMethod(startMethodName, nextMethodName, newMethodCode) {
  const startIdx = lines.findIndex(l => l.trim().startsWith(startMethodName + '('));
  if (startIdx === -1) {
    console.error('Method not found: ' + startMethodName);
    return;
  }
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim().startsWith(nextMethodName + '('));
  if (endIdx === -1) {
    console.error('Next method not found: ' + nextMethodName);
    return;
  }
  lines = lines.slice(0, startIdx).concat(newMethodCode.split('\n')).concat(lines.slice(endIdx));
  console.log('Replaced ' + startMethodName + ' (lines ' + (startIdx + 1) + ' to ' + (endIdx + 1) + ')');
}

// 1. Upgrade renderOdontogramTab
const newOdontoCode = `  renderOdontogramTab(container) {
    const isLocked = Boolean(this.selectedPatient && this.selectedPatient.encounterLocked);
    const canEditOdonto = this.hasPermission("odontogram.edit");

    container.innerHTML = \`
      \${isLocked ? \`
        <div class="medical-alert-banner" style="background: #FEF3C7; border: 1px solid #F59E0B; color: #92400E; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; border-radius: var(--radius-lg); padding: 14px 18px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="color: #D97706;">\${CLINIC_ICONS.lock}</div>
            <div>
              <strong style="font-size: 0.95rem;">Clinical Encounter Finalized & Digitally Signed</strong>
              <div style="font-size: 0.82rem; opacity: 0.95; margin-top: 2px;">
                Attested by \${this.selectedPatient.lockedBy || 'Clinician'} on \${this.selectedPatient.lockedDate || '2026-10-23'}. Modifications require an authorized controlled amendment.
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-primary" onclick="app.openControlledAmendmentModal()">
            \${CLINIC_ICONS.search} Add Controlled Amendment
          </button>
        </div>
      \` : !canEditOdonto ? \`
        <div class="medical-alert-banner" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; margin-bottom: 16px; border-radius: var(--radius-lg); padding: 14px 18px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #64748B;">\${CLINIC_ICONS.alertTriangle}</span>
            <span><strong>View-Only Mode:</strong> Your current role (\${this.store.currentUser.role}) does not have clinical odontogram editing privileges. Switch to Dentist/Admin in the top bar to record findings.</span>
          </div>
        </div>
      \` : ''}

      <div class="odontogram-layout">
        <div>
          <div id="odontogram-svg-mount"></div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 0.82rem; color: var(--text-secondary);">
              <strong>Standard:</strong> FDI World Dental Federation notation (Adult 11-48 / Deciduous 51-85). Touch or click any tooth to inspect surfaces.
            </div>
            <div style="display: flex; gap: 10px;">
              <button class="btn btn-outline btn-sm" onclick="app.saveOdontogramDraft()">
                \${CLINIC_ICONS.report} Save Draft
              </button>
              <button class="btn btn-primary btn-sm" onclick="app.openFinalizeEncounterModal()">
                \${CLINIC_ICONS.lock} Finalize & Sign Encounter
              </button>
            </div>
          </div>
        </div>

        <!-- Tooth Inspector Panel -->
        <div class="tooth-inspector-panel" id="tooth-inspector-mount">
          <div class="inspector-header">
            <div class="inspector-tooth-badge" id="inspector-tooth-number">Select Tooth</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);" id="inspector-tooth-name">Click any tooth on chart to inspect</div>
          </div>

          <div id="inspector-tooth-controls" style="display: none;">
            <label class="form-label" style="font-weight: 700;">5-Surface Anatomical Mapping</label>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-occlusal" onchange="app.toggleSurface('occlusal')"> Occlusal (O)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-mesial" onchange="app.toggleSurface('mesial')"> Mesial (M)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-distal" onchange="app.toggleSurface('distal')"> Distal (D)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-buccal" onchange="app.toggleSurface('buccal')"> Buccal (B)</label>
              <label class="filter-pill" style="cursor: pointer;"><input type="checkbox" id="surf-lingual" onchange="app.toggleSurface('lingual')"> Lingual (L)</label>
            </div>

            <label class="form-label" style="font-weight: 700;">Clinical Diagnosis / Finding</label>
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

            <div class="form-group" style="margin-top: 12px;">
              <label class="form-label">Periodontal Probing Depth (mm)</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <input type="text" class="form-control" id="inspector-perio-buccal" placeholder="Buccal (e.g. 3-2-3)">
                <input type="text" class="form-control" id="inspector-perio-lingual" placeholder="Lingual (e.g. 2-2-3)">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Clinical Diagnosis Note</label>
              <input type="text" class="form-control" id="inspector-diagnosis-input" placeholder="e.g. Deep occlusal dentinal caries extending near pulp">
            </div>

            <div class="form-group">
              <label class="form-label">Recommended Treatment Procedure</label>
              <select class="form-control" id="inspector-planned-select">
                <option value="">-- Select Procedure to Plan --</option>
                <option value="Resin-Based Composite (1 Surface)">Resin-Based Composite (1 Surface) - $180</option>
                <option value="Resin-Based Composite (2 Surfaces)">Resin-Based Composite (2 Surfaces) - $220</option>
                <option value="Root Canal Therapy - Molar">Endodontic Root Canal Therapy (Molar) - $950</option>
                <option value="Porcelain Ceramic Crown">Full Ceramic Porcelain Crown - $1,100</option>
                <option value="Surgical Tooth Extraction">Surgical Tooth Extraction - $250</option>
                <option value="Dental Implant Placement">Endosteal Titanium Dental Implant - $1,800</option>
                <option value="Periodontal Scaling & Root Planing">Periodontal Scaling & Root Planing - $280</option>
              </select>
            </div>

            <button type="button" class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="app.addProcedureFromInspector()">
              \${CLINIC_ICONS.userPlus} Add to Patient Treatment Plan
            </button>
          </div>
        </div>
      </div>
    \`;

    // Instantiate Odontogram Chart
    this.odontogramInstance = new OdontogramChart("odontogram-svg-mount", {
      isPediatric: false,
      readOnly: isLocked || !canEditOdonto,
      onToothSelect: (toothNum, data, surface, toothName) => {
        this.handleToothSelection(toothNum, data, surface, toothName);
      }
    });

    this.odontogramInstance.setChartData(this.selectedPatient.odontogram || {});
  }`;

replaceMethod('renderOdontogramTab', 'handleToothSelection', newOdontoCode);

// 2. Upgrade renderTreatmentPlansTab
const newTreatmentCode = `  renderTreatmentPlansTab(container) {
    const pt = this.selectedPatient;
    const plans = pt.treatmentPlans || [];

    container.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.chart}
            <span>Phased Dental Treatment Plans</span>
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Phased restorative sequencing • ADA/CDT fee schedule • Insurance copay calculation
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" onclick="app.printTreatmentEstimate()">
            \${CLINIC_ICONS.printer} Print Patient Estimate
          </button>
          <button class="btn btn-primary btn-sm" onclick="app.openSelectiveBillingModal()">
            \${CLINIC_ICONS.creditCard} Generate Billable Invoice →
          </button>
        </div>
      </div>

      \${plans.length === 0 ? \`
        <div class="card" style="text-align: center; padding: 48px 20px; border-radius: var(--radius-xl);">
          <div style="color: var(--primary-teal); margin-bottom: 12px; display: flex; justify-content: center;">
            \${CLINIC_ICONS.tooth}
          </div>
          <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">No Active Treatment Plans</h4>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">This patient has no recorded restorative or orthodontic treatment plans.</p>
          <button class="btn btn-primary" onclick="app.switchRecordTab('odontogram')">Create Plan from Odontogram</button>
        </div>
      \` : plans.map((plan, idx) => \`
        <div class="treatment-plan-card" style="margin-bottom: 24px; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(15,23,42,0.04);">
          <div class="card-header" style="background: #F8FAFC; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color);">
            <div>
              <div class="card-title" style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">\${plan.title}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                Plan ID: \${plan.id} • Created on \${plan.createdAt} • Attending: Dr. Sarah Chen, DDS
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge \${plan.status === 'Approved' ? 'badge-green' : plan.status === 'In Progress' ? 'badge-purple' : 'badge-amber'}" style="font-size: 0.82rem; padding: 4px 10px;">
                \${plan.status}
              </span>
            </div>
          </div>

          <div class="table-responsive">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>CDT Code</th>
                  <th>Tooth / Site</th>
                  <th>Procedure Description</th>
                  <th>Standard Fee</th>
                  <th>Est. Insurance</th>
                  <th>Patient Copay</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                \${plan.procedures.map((p, pIdx) => {
                  const estInsurance = Math.round(p.cost * 0.8);
                  const patientCopay = p.cost - estInsurance;
                  return \`
                    <tr style="\${p.status === 'Cancelled' ? 'opacity: 0.5; text-decoration: line-through;' : ''}">
                      <td><strong style="font-family: 'JetBrains Mono', monospace; color: var(--text-main);">\${p.code}</strong></td>
                      <td><span class="badge badge-teal">Tooth #\${p.tooth}</span></td>
                      <td>
                        <strong>\${p.name}</strong>
                        \${p.surface ? \`<span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Surfaces: \${p.surface.toUpperCase()}</span>\` : ''}
                      </td>
                      <td><strong style="color: var(--text-main); font-size: 0.95rem;">$\${p.cost}</strong></td>
                      <td style="color: var(--secondary-blue); font-weight: 600;">$\${estInsurance}</td>
                      <td style="color: var(--success); font-weight: 700;">$\${patientCopay}</td>
                      <td style="text-decoration: none;">
                        <select class="form-control" style="padding: 4px 8px; min-height: 32px; font-size: 0.82rem; border-radius: var(--radius-sm);" onchange="app.updateProcedureStatus(\${idx}, \${pIdx}, this.value)">
                          <option value="Proposed" \${p.status === 'Proposed' ? 'selected' : ''}>Proposed</option>
                          <option value="Awaiting Patient Approval" \${p.status === 'Awaiting Patient Approval' ? 'selected' : ''}>Awaiting Approval</option>
                          <option value="Approved" \${p.status === 'Approved' ? 'selected' : ''}>Approved by Patient</option>
                          <option value="In Progress" \${p.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                          <option value="Completed" \${p.status === 'Completed' ? 'selected' : ''}>Completed</option>
                          <option value="Deferred" \${p.status === 'Deferred' ? 'selected' : ''}>Deferred</option>
                          <option value="Cancelled" \${p.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                      </td>
                      <td style="text-decoration: none;">
                        <button class="btn btn-sm btn-outline" style="color: var(--error);" title="Remove Procedure" onclick="app.removePlanProcedure(\${idx}, \${pIdx})">✕</button>
                      </td>
                    </tr>
                  \`;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Plan Financial Summary Footer -->
          <div style="background: #F8FAFC; padding: 16px 22px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm btn-outline" onclick="app.addProcedureDirectlyToPlan(\${idx})">
                \${CLINIC_ICONS.userPlus} Add Procedure Item
              </button>
            </div>
            <div style="display: flex; align-items: center; gap: 18px;">
              <div style="font-size: 0.88rem; color: var(--text-secondary);">
                Active Procedures Total: <strong style="color: var(--primary-teal); font-size: 1.15rem;">$\${plan.procedures.filter(p => p.status !== 'Cancelled').reduce((sum, p) => sum + p.cost, 0)}</strong>
              </div>
              <button class="btn btn-sm btn-primary" onclick="app.generateInvoiceFromPlan(\${idx})">
                \${CLINIC_ICONS.creditCard} Invoice Active Total
              </button>
            </div>
          </div>
        </div>
      \`).join('')}
    \`;
  }`;

replaceMethod('renderTreatmentPlansTab', 'addProcedureDirectlyToPlan', newTreatmentCode);

// 3. Upgrade renderAppointments
const newAptsCode = `  renderAppointments(container) {
    let apts = this.store.appointments;

    // Filter by time
    if (this.currentAptFilter === "today") {
      apts = apts.filter(a => a.date === "2026-10-23");
    } else if (this.currentAptFilter === "week") {
      apts = apts.filter(a => a.date >= "2026-10-19" && a.date <= "2026-10-25");
    }

    container.innerHTML = \`
      <div class="calendar-view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.calendar}
            <span>Master Appointment Schedule</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Multispecialty operatory matrix • Conflict resolution • 1-click arrival check-in
          </p>
        </div>

        <div class="calendar-filters" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <!-- Time Range Filter -->
          <div style="display: flex; gap: 4px; background: #E2E8F0; padding: 3px; border-radius: var(--radius-md);">
            <button class="btn btn-sm \${this.currentAptFilter === 'today' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentTimeFilter('today')">Today</button>
            <button class="btn btn-sm \${this.currentAptFilter === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentTimeFilter('week')">This Week</button>
            <button class="btn btn-sm \${this.currentAptFilter === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentTimeFilter('all')">All Upcoming</button>
          </div>

          <!-- View Switcher -->
          <div style="display: flex; gap: 4px; background: #E2E8F0; padding: 3px; border-radius: var(--radius-md);">
            <button class="btn btn-sm \${this.currentAptView === 'list' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentView('list')">Agenda List</button>
            <button class="btn btn-sm \${this.currentAptView === 'chairs' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentView('chairs')">Operatory Chairs</button>
            <button class="btn btn-sm \${this.currentAptView === 'week' ? 'btn-primary' : 'btn-outline'}" onclick="app.setAppointmentView('week')">Week Grid</button>
          </div>

          <button class="btn btn-primary btn-sm" onclick="app.openBookAppointmentModal()">
            \${CLINIC_ICONS.userPlus} New Appointment
          </button>
        </div>
      </div>

      \${this.currentAptView === 'chairs' ? this.renderOperatoryChairsView(apts) :
        this.currentAptView === 'week' ? this.renderWeekGridView() :
        this.renderAppointmentsListView(apts)
      }
    \`;
  }`;

replaceMethod('renderAppointments', 'renderAppointmentsListView', newAptsCode);

// 4. Upgrade renderQueueBoard
const newQueueCode = `  renderQueueBoard(container) {
    const waiting = this.store.queue.filter(q => q.status === "Waiting");
    const inConsult = this.store.queue.filter(q => q.status === "In Consultation");
    const completed = this.store.queue.filter(q => q.status === "Completed" || q.status === "No-Show");

    container.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
            \${CLINIC_ICONS.users}
            <span>Live Reception Queue Board</span>
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">
            Smart triage Kanban • Acoustic hospital chimes • Thermal token printer integration
          </p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" onclick="app.openQuickTokenModal()">
            \${CLINIC_ICONS.userPlus} Issue Walk-In Token
          </button>
          <button class="btn btn-secondary" onclick="app.callNextPatient()">
            \${CLINIC_ICONS.sound} Call Next Patient
          </button>
        </div>
      </div>

      <div class="queue-board-columns">
        <!-- Column 1: Waiting Lounge -->
        <div class="queue-column">
          <div class="queue-column-header">
            <h4>Waiting in Lounge (\${waiting.length})</h4>
            <span class="badge badge-amber">Reception</span>
          </div>
          <div class="queue-cards-list">
            \${waiting.length === 0 ? \`<p style="text-align: center; color: var(--text-muted); padding: 40px 10px;">No patients waiting in reception.</p>\` :
              waiting.map(item => \`
                <div class="token-card">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="token-number-badge">\${item.token}</div>
                    <span class="badge \${item.waitTimeMinutes > 20 ? 'badge-red' : 'badge-subtle'}">Wait ~\${item.waitTimeMinutes}m</span>
                  </div>
                  <strong style="font-size: 1.05rem; display: block; margin: 8px 0 2px; color: var(--text-main);">\${item.patientName}</strong>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">\${item.service}</div>
                  <div style="font-size: 0.78rem; color: var(--primary-teal); margin-top: 4px; font-weight: 600;">Assigned: \${item.doctorName}</div>

                  <div style="display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-primary" style="flex: 1;" onclick="app.startConsultation('\${item.token}')">
                      Call In →
                    </button>
                    <button class="btn btn-sm btn-outline" title="Transfer Clinician / Chair" onclick="app.openTransferModal('\${item.token}')">
                      \${CLINIC_ICONS.refresh}
                    </button>
                    <button class="btn btn-sm btn-outline" style="color: var(--warning);" title="Mark No-Show" onclick="app.markQueueNoShow('\${item.token}')">
                      \${CLINIC_ICONS.alertTriangle}
                    </button>
                    <button class="btn btn-sm btn-outline" title="Print Slip" onclick="app.printThermalSlip('\${item.token}')">
                      \${CLINIC_ICONS.printer}
                    </button>
                  </div>
                </div>
              \`).join('')
            }
          </div>
        </div>

        <!-- Column 2: In Consultation -->
        <div class="queue-column">
          <div class="queue-column-header">
            <h4>In Consultation (\${inConsult.length})</h4>
            <span class="badge badge-purple">In Dental Chair</span>
          </div>
          <div class="queue-cards-list">
            \${inConsult.length === 0 ? \`<p style="text-align: center; color: var(--text-muted); padding: 40px 10px;">All dental chairs ready for next patient.</p>\` :
              inConsult.map(item => \`
                <div class="token-card" style="border-left: 4px solid var(--purple);">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="token-number-badge" style="background: #F3E8FF; color: var(--purple);">\${item.token}</div>
                    <span class="badge badge-purple">\${item.chair || 'Chair 1'}</span>
                  </div>
                  <strong style="font-size: 1.05rem; display: block; margin: 8px 0 2px; color: var(--text-main);">\${item.patientName}</strong>
                  <div style="font-size: 0.82rem; color: var(--text-secondary);">\${item.service}</div>
                  <div style="font-size: 0.78rem; color: var(--purple); margin-top: 4px; font-weight: 600;">Treating: \${item.doctorName}</div>

                  <div style="display: flex; gap: 6px; margin-top: 12px;">
                    <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="app.openPatientRecordByMrn('\${item.mrn}')">
                      Open Chart
                    </button>
                    <button class="btn btn-sm btn-success" style="flex: 1;" onclick="app.completeConsultation('\${item.token}')">
                      Complete ✓
                    </button>
                  </div>
                </div>
              \`).join('')
            }
          </div>
        </div>

        <!-- Column 3: Completed Today -->
        <div class="queue-column">
          <div class="queue-column-header">
            <h4>Completed Today (\${completed.length})</h4>
            <span class="badge badge-green">Ready for Billing</span>
          </div>
          <div class="queue-cards-list">
            \${completed.length === 0 ? \`<p style="text-align: center; color: var(--text-muted); padding: 40px 10px;">No encounters completed yet today.</p>\` :
              completed.map(item => \`
                <div class="token-card" style="opacity: 0.9;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="token-number-badge" style="background: #DCFCE7; color: var(--success);">\${item.token}</div>
                    <span class="badge \${item.status === 'No-Show' ? 'badge-red' : 'badge-green'}">\${item.status}</span>
                  </div>
                  <strong style="font-size: 1rem; display: block; margin: 6px 0 2px;">\${item.patientName}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-secondary);">\${item.service}</div>

                  <div style="display: flex; gap: 6px; margin-top: 10px;">
                    <button class="btn btn-sm btn-outline" style="flex: 1;" onclick="app.openPatientRecordByMrn('\${item.mrn}')">Chart</button>
                    \${item.status === 'No-Show' ? \`
                      <button class="btn btn-sm btn-primary" onclick="app.requeueItem('\${item.token}')">Requeue</button>
                    \` : \`
                      <button class="btn btn-sm btn-primary" onclick="app.navigateTo('billing')">Bill POS</button>
                    \`}
                  </div>
                </div>
              \`).join('')
            }
          </div>
        </div>
      </div>
    \`;
  }`;

replaceMethod('renderQueueBoard', 'callNextPatient', newQueueCode);

// Write updated content
fs.writeFileSync(appJsPath, lines.join('\n'), 'utf8');
console.log('Successfully elevated Odontogram, Treatment Plans, Appointments, and Queue modules!');
