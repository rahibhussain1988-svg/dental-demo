/**
 * Smile Dental & Orthodontics Clinic Management System
 * Interactive Odontogram Component (FDI Standard, SVG-Based, Touch-Optimized)
 */

class OdontogramChart {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = Object.assign({
      isPediatric: false,
      readOnly: false,
      onToothSelect: null,
      onSurfaceSelect: null
    }, options);

    this.selectedTooth = null;
    this.selectedSurface = null;
    this.chartData = {}; // Tooth map { "16": { status, surfaces: {}, findings: [], diagnosis, planned, completed } }
    this.isPediatric = this.options.isPediatric;

    this.adultTeeth = {
      upperRight: ["18", "17", "16", "15", "14", "13", "12", "11"],
      upperLeft:  ["21", "22", "23", "24", "25", "26", "27", "28"],
      lowerRight: ["48", "47", "46", "45", "44", "43", "42", "41"],
      lowerLeft:  ["31", "32", "33", "34", "35", "36", "37", "38"]
    };

    this.pediatricTeeth = {
      upperRight: ["55", "54", "53", "52", "51"],
      upperLeft:  ["61", "62", "63", "64", "65"],
      lowerRight: ["85", "84", "83", "82", "81"],
      lowerLeft:  ["71", "72", "73", "74", "75"]
    };

    this.toothNames = {
      "18": "Maxillary Right 3rd Molar (Wisdom)", "17": "Maxillary Right 2nd Molar", "16": "Maxillary Right 1st Molar",
      "15": "Maxillary Right 2nd Premolar", "14": "Maxillary Right 1st Premolar", "13": "Maxillary Right Canine",
      "12": "Maxillary Right Lateral Incisor", "11": "Maxillary Right Central Incisor",
      "21": "Maxillary Left Central Incisor", "22": "Maxillary Left Lateral Incisor", "23": "Maxillary Left Canine",
      "24": "Maxillary Left 1st Premolar", "25": "Maxillary Left 2nd Premolar", "26": "Maxillary Left 1st Molar",
      "27": "Maxillary Left 2nd Molar", "28": "Maxillary Left 3rd Molar (Wisdom)",
      "48": "Mandibular Right 3rd Molar (Wisdom)", "47": "Mandibular Right 2nd Molar", "46": "Mandibular Right 1st Molar",
      "45": "Mandibular Right 2nd Premolar", "44": "Mandibular Right 1st Premolar", "43": "Mandibular Right Canine",
      "42": "Mandibular Right Lateral Incisor", "41": "Mandibular Right Central Incisor",
      "31": "Mandibular Left Central Incisor", "32": "Mandibular Left Lateral Incisor", "33": "Mandibular Left Canine",
      "34": "Mandibular Left 1st Premolar", "35": "Mandibular Left 2nd Premolar", "36": "Mandibular Left 1st Molar",
      "37": "Mandibular Left 2nd Molar", "38": "Mandibular Left 3rd Molar (Wisdom)",
      // Pediatric
      "55": "Primary Maxillary Right 2nd Molar", "54": "Primary Maxillary Right 1st Molar", "53": "Primary Maxillary Right Canine",
      "52": "Primary Maxillary Right Lateral Incisor", "51": "Primary Maxillary Right Central Incisor",
      "61": "Primary Maxillary Left Central Incisor", "62": "Primary Maxillary Left Lateral Incisor", "63": "Primary Maxillary Left Canine",
      "64": "Primary Maxillary Left 1st Molar", "65": "Primary Maxillary Left 2nd Molar",
      "85": "Primary Mandibular Right 2nd Molar", "84": "Primary Mandibular Right 1st Molar", "83": "Primary Mandibular Right Canine",
      "82": "Primary Mandibular Right Lateral Incisor", "81": "Primary Mandibular Right Central Incisor",
      "71": "Primary Mandibular Left Central Incisor", "72": "Primary Mandibular Left Lateral Incisor", "73": "Primary Mandibular Left Canine",
      "74": "Primary Mandibular Left 1st Molar", "75": "Primary Mandibular Left 2nd Molar"
    };

    this.init();
  }

  setChartData(data) {
    this.chartData = data || {};
    this.render();
  }

  setPediatricMode(isPediatric) {
    this.isPediatric = isPediatric;
    this.render();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  isAnterior(tooth) {
    const t = parseInt(tooth, 10);
    // 11-13, 21-23, 31-33, 41-43 or 51-53, 61-63, 71-73, 81-83
    const unit = t % 10;
    return unit <= 3;
  }

  isUpper(tooth) {
    const quad = Math.floor(parseInt(tooth, 10) / 10);
    return quad === 1 || quad === 2 || quad === 5 || quad === 6;
  }

  isRightSide(tooth) {
    const quad = Math.floor(parseInt(tooth, 10) / 10);
    return quad === 1 || quad === 4 || quad === 5 || quad === 8;
  }

  render() {
    if (!this.container) return;

    const teethGroups = this.isPediatric ? this.pediatricTeeth : this.adultTeeth;

    let html = `
      <div class="odontogram-wrapper">
        <div class="odontogram-header-controls">
          <div class="dentition-toggle">
            <button type="button" class="btn btn-sm ${!this.isPediatric ? 'btn-primary' : 'btn-outline'}" id="btn-adult-dentition">
              <i class="icon-dentition"></i> Permanent Dentition (FDI Adult 11-48)
            </button>
            <button type="button" class="btn btn-sm ${this.isPediatric ? 'btn-primary' : 'btn-outline'}" id="btn-pediatric-dentition">
              <i class="icon-baby"></i> Deciduous / Primary (FDI Child 51-85)
            </button>
          </div>
          <div class="odontogram-quadrant-indicators">
            <span class="badge badge-subtle">Upper Jaw (Maxillary)</span>
            <span class="badge badge-subtle">Lower Jaw (Mandibular)</span>
          </div>
        </div>

        <!-- Arch Visualizer -->
        <div class="odontogram-arch-container">
          <!-- Maxillary Arch (Upper) -->
          <div class="odontogram-arch arch-upper">
            <div class="arch-quadrant quadrant-ur">
              <div class="quadrant-label">Quadrant 1 (Upper Right)</div>
              <div class="teeth-row">
                ${teethGroups.upperRight.map(t => this.renderToothSvg(t)).join('')}
              </div>
            </div>
            <div class="arch-divider-v">
              <span class="midline-tag">MIDLINE</span>
            </div>
            <div class="arch-quadrant quadrant-ul">
              <div class="quadrant-label">Quadrant 2 (Upper Left)</div>
              <div class="teeth-row">
                ${teethGroups.upperLeft.map(t => this.renderToothSvg(t)).join('')}
              </div>
            </div>
          </div>

          <div class="arch-divider-h">
            <span>OCCLUSAL PLANE</span>
          </div>

          <!-- Mandibular Arch (Lower) -->
          <div class="odontogram-arch arch-lower">
            <div class="arch-quadrant quadrant-lr">
              <div class="quadrant-label">Quadrant 4 (Lower Right)</div>
              <div class="teeth-row">
                ${teethGroups.lowerRight.map(t => this.renderToothSvg(t)).join('')}
              </div>
            </div>
            <div class="arch-divider-v">
              <span class="midline-tag">MIDLINE</span>
            </div>
            <div class="arch-quadrant quadrant-ll">
              <div class="quadrant-label">Quadrant 3 (Lower Left)</div>
              <div class="teeth-row">
                ${teethGroups.lowerLeft.map(t => this.renderToothSvg(t)).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Condition Legend -->
        <div class="odontogram-legend">
          <div class="legend-item"><span class="legend-swatch swatch-healthy"></span> Sound / Healthy</div>
          <div class="legend-item"><span class="legend-swatch swatch-caries"></span> Active Caries / Decay</div>
          <div class="legend-item"><span class="legend-swatch swatch-composite"></span> Composite Resin</div>
          <div class="legend-item"><span class="legend-swatch swatch-amalgam"></span> Amalgam Restoration</div>
          <div class="legend-item"><span class="legend-swatch swatch-crown"></span> Ceramic Crown / Cap</div>
          <div class="legend-item"><span class="legend-swatch swatch-rct"></span> Root Canal Treated (RCT)</div>
          <div class="legend-item"><span class="legend-swatch swatch-missing"></span> Missing / Extracted</div>
          <div class="legend-item"><span class="legend-swatch swatch-planned-ext"></span> Extraction Planned</div>
          <div class="legend-item"><span class="legend-swatch swatch-fracture"></span> Fractured / Chipped</div>
          <div class="legend-item"><span class="legend-swatch swatch-implant"></span> Dental Implant</div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.attachEvents();
  }

  getSurfaceColor(val, status) {
    if (!val || val === "sound") return "#FFFFFF";
    if (typeof val === "string") {
      if (val === "caries") return "#EF4444";
      if (val === "restoration" || val === "composite") return "#0284C7";
      if (val === "amalgam") return "#475569";
      if (val === "fracture") return "#DC2626";
      return "#0284C7";
    }
    if (status === "caries") return "#EF4444";
    if (status === "restoration" || status === "composite") return "#0284C7";
    if (status === "amalgam") return "#475569";
    if (status === "fracture") return "#DC2626";
    return "#0284C7";
  }

  renderToothSvg(toothNum) {
    const isUpper = this.isUpper(toothNum);
    const isAnterior = this.isAnterior(toothNum);
    const isRight = this.isRightSide(toothNum);
    const data = this.chartData[toothNum] || { status: "healthy", surfaces: {} };
    const isSelected = this.selectedTooth === toothNum;

    const status = data.status || "healthy";
    const surfaces = data.surfaces || {};

    // Determine surface names based on quadrant orientation:
    // Outer surface = Buccal (or Labial for anterior)
    // Inner surface = Lingual (or Palatal for upper)
    // Mesial = towards midline
    // Distal = away from midline
    const outerSurfaceName = "buccal";
    const innerSurfaceName = "lingual";
    const mesialSurfaceName = "mesial";
    const distalSurfaceName = "distal";
    const centerSurfaceName = "occlusal";

    // Surface colors
    const getSurfaceColor = (surfName) => this.getSurfaceColor(surfaces[surfName], status);

    // Tooth classes
    let toothClasses = [`tooth-item`];
    if (isSelected) toothClasses.push("tooth-selected");
    if (status) toothClasses.push(`status-${status}`);

    // SVG geometry: 64x100 box
    // Upper teeth: Roots at top (y: 2 to 34), Crown at bottom (y: 36 to 92)
    // Lower teeth: Crown at top (y: 8 to 64), Roots at bottom (y: 66 to 98)
    const crownCenterY = isUpper ? 66 : 36;
    const crownCenterX = 32;

    // Root paths
    let rootSvg = "";
    if (isUpper) {
      // 3 roots for molars (16,17,18,26,27,28), 2 for premolars, 1 for anterior
      const unit = parseInt(toothNum, 10) % 10;
      if (unit >= 6) {
        // Triple root molar
        rootSvg = `
          <path class="tooth-root" d="M18,36 C16,22 14,8 20,4 C24,8 25,22 26,36" />
          <path class="tooth-root" d="M28,36 C30,20 32,5 34,5 C36,20 37,36 38,36" />
          <path class="tooth-root" d="M40,36 C42,22 46,8 50,4 C52,10 49,24 46,36" />
        `;
      } else if (unit >= 4) {
        // Double root premolar
        rootSvg = `
          <path class="tooth-root" d="M22,36 C19,20 20,8 26,6 C29,14 29,26 30,36" />
          <path class="tooth-root" d="M34,36 C35,26 35,14 38,6 C44,8 45,20 42,36" />
        `;
      } else {
        // Single root anterior
        rootSvg = `
          <path class="tooth-root" d="M24,36 C27,18 29,5 32,4 C35,5 37,18 40,36 Z" />
        `;
      }
    } else {
      // Lower teeth roots pointing downwards
      const unit = parseInt(toothNum, 10) % 10;
      if (unit >= 6) {
        // Bifurcated molar roots
        rootSvg = `
          <path class="tooth-root" d="M19,64 C17,76 15,92 22,96 C26,90 27,78 28,64" />
          <path class="tooth-root" d="M36,64 C37,78 38,90 42,96 C49,92 47,76 45,64" />
        `;
      } else {
        // Single lower root
        rootSvg = `
          <path class="tooth-root" d="M25,64 C28,80 30,95 32,96 C34,95 36,80 39,64 Z" />
        `;
      }
    }

    // RCT Marker
    let rctOverlay = "";
    if (status === "rct") {
      rctOverlay = `
        <line x1="32" y1="${isUpper ? 6 : 64}" x2="32" y2="${isUpper ? 66 : 94}" class="rct-line" stroke="#EA580C" stroke-width="3" stroke-linecap="round" />
        <circle cx="32" cy="${isUpper ? 6 : 94}" r="3" fill="#EA580C" />
      `;
    }

    // Crown overlay
    let crownOverlay = "";
    if (status === "crown") {
      crownOverlay = `
        <rect x="10" y="${isUpper ? 38 : 8}" width="44" height="44" rx="8" class="crown-rect" fill="none" stroke="#D97706" stroke-width="2.5" stroke-dasharray="3,2" />
        <path d="M24,${isUpper ? 42 : 12} L28,${isUpper ? 48 : 18} L32,${isUpper ? 42 : 12} L36,${isUpper ? 48 : 18} L40,${isUpper ? 42 : 12}" fill="none" stroke="#D97706" stroke-width="1.5" />
      `;
    }

    // Missing / Extracted overlay
    let missingOverlay = "";
    if (status === "missing" || status === "extraction_completed") {
      missingOverlay = `
        <line x1="8" y1="${isUpper ? 36 : 6}" x2="56" y2="${isUpper ? 84 : 54}" stroke="#64748B" stroke-width="3" stroke-linecap="round" />
        <line x1="56" y1="${isUpper ? 36 : 6}" x2="8" y2="${isUpper ? 84 : 54}" stroke="#64748B" stroke-width="3" stroke-linecap="round" />
      `;
    }

    // Extraction planned overlay
    let extPlannedOverlay = "";
    if (status === "extraction_planned") {
      extPlannedOverlay = `
        <line x1="12" y1="${isUpper ? 40 : 10}" x2="52" y2="${isUpper ? 80 : 50}" stroke="#0284C7" stroke-width="3" stroke-dasharray="4,3" stroke-linecap="round" />
        <line x1="52" y1="${isUpper ? 40 : 10}" x2="12" y2="${isUpper ? 80 : 50}" stroke="#0284C7" stroke-width="3" stroke-dasharray="4,3" stroke-linecap="round" />
      `;
    }

    // Fracture overlay
    let fractureOverlay = "";
    if (status === "fracture") {
      fractureOverlay = `
        <path d="M18,${crownCenterY - 14} L28,${crownCenterY - 4} L24,${crownCenterY + 2} L36,${crownCenterY + 12}" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      `;
    }

    // Implant overlay
    let implantOverlay = "";
    if (status === "implant") {
      implantOverlay = `
        <line x1="32" y1="${isUpper ? 8 : 45}" x2="32" y2="${isUpper ? 35 : 85}" stroke="#475569" stroke-width="4" />
        <line x1="26" y1="${isUpper ? 14 : 55}" x2="38" y2="${isUpper ? 14 : 55}" stroke="#475569" stroke-width="2" />
        <line x1="26" y1="${isUpper ? 20 : 65}" x2="38" y2="${isUpper ? 20 : 65}" stroke="#475569" stroke-width="2" />
        <line x1="26" y1="${isUpper ? 26 : 75}" x2="38" y2="${isUpper ? 26 : 75}" stroke="#475569" stroke-width="2" />
      `;
    }

    // 5 Anatomical Surface Polygons for Crown:
    // Center: Occlusal (or Incisal)
    // Outer / Inner / Left / Right
    const cy = crownCenterY;
    const cx = crownCenterX;

    // Crown surfaces layout
    // Coordinates relative to center (cx=32, cy=crownCenterY):
    // Outer perimeter: (12, cy-18) to (52, cy+18)
    // Inner center box: (24, cy-6) to (40, cy+6)
    const topOuter = isUpper ? outerSurfaceName : innerSurfaceName;
    const bottomOuter = isUpper ? innerSurfaceName : outerSurfaceName;
    const leftOuter = isRight ? distalSurfaceName : mesialSurfaceName;
    const rightOuter = isRight ? mesialSurfaceName : distalSurfaceName;

    const surfaceSvg = `
      <g class="tooth-crown-surfaces">
        <!-- Center: Occlusal / Incisal -->
        <polygon
          class="tooth-surface surface-center"
          data-tooth="${toothNum}"
          data-surface="${centerSurfaceName}"
          points="${cx-7},${cy-7} ${cx+7},${cy-7} ${cx+7},${cy+7} ${cx-7},${cy+7}"
          fill="${getSurfaceColor(centerSurfaceName)}"
          stroke="#94A3B8" stroke-width="1"
        />

        <!-- Top Surface (Buccal/Palatal) -->
        <polygon
          class="tooth-surface surface-top"
          data-tooth="${toothNum}"
          data-surface="${topOuter}"
          points="${cx-18},${cy-18} ${cx+18},${cy-18} ${cx+7},${cy-7} ${cx-7},${cy-7}"
          fill="${getSurfaceColor(topOuter)}"
          stroke="#94A3B8" stroke-width="1"
        />

        <!-- Bottom Surface (Palatal/Lingual) -->
        <polygon
          class="tooth-surface surface-bottom"
          data-tooth="${toothNum}"
          data-surface="${bottomOuter}"
          points="${cx-7},${cy+7} ${cx+7},${cy+7} ${cx+18},${cy+18} ${cx-18},${cy+18}"
          fill="${getSurfaceColor(bottomOuter)}"
          stroke="#94A3B8" stroke-width="1"
        />

        <!-- Left Surface -->
        <polygon
          class="tooth-surface surface-left"
          data-tooth="${toothNum}"
          data-surface="${leftOuter}"
          points="${cx-18},${cy-18} ${cx-7},${cy-7} ${cx-7},${cy+7} ${cx-18},${cy+18}"
          fill="${getSurfaceColor(leftOuter)}"
          stroke="#94A3B8" stroke-width="1"
        />

        <!-- Right Surface -->
        <polygon
          class="tooth-surface surface-right"
          data-tooth="${toothNum}"
          data-surface="${rightOuter}"
          points="${cx+7},${cy-7} ${cx+18},${cy-18} ${cx+18},${cy+18} ${cx+7},${cy+7}"
          fill="${getSurfaceColor(rightOuter)}"
          stroke="#94A3B8" stroke-width="1"
        />
      </g>
    `;

    return `
      <div class="${toothClasses.join(' ')}" data-tooth="${toothNum}" id="tooth-cell-${toothNum}">
        <div class="tooth-number-tag">${toothNum}</div>
        <div class="tooth-svg-box">
          <svg viewBox="0 0 64 100" class="tooth-svg" width="60" height="92" data-tooth="${toothNum}">
            <g class="tooth-anatomy">
              ${rootSvg}
              ${surfaceSvg}
              ${rctOverlay}
              ${crownOverlay}
              ${missingOverlay}
              ${extPlannedOverlay}
              ${fractureOverlay}
              ${implantOverlay}
            </g>
          </svg>
        </div>
        <div class="tooth-status-dot dot-${status}" title="Status: ${status}"></div>
      </div>
    `;
  }

  attachEvents() {
    // Dentition switcher buttons
    const btnAdult = document.getElementById("btn-adult-dentition");
    const btnPediatric = document.getElementById("btn-pediatric-dentition");

    if (btnAdult) {
      btnAdult.onclick = () => this.setPediatricMode(false);
    }
    if (btnPediatric) {
      btnPediatric.onclick = () => this.setPediatricMode(true);
    }

    // Tooth item selection clicks
    const toothCells = this.container.querySelectorAll(".tooth-item");
    toothCells.forEach(cell => {
      cell.addEventListener("click", (e) => {
        // If clicking on specific surface polygon
        const surfaceEl = e.target.closest(".tooth-surface");
        const toothNum = cell.getAttribute("data-tooth");
        const surf = surfaceEl ? surfaceEl.getAttribute("data-surface") : null;

        this.selectTooth(toothNum, surf);
      });
    });
  }

  selectTooth(toothNum, surface = null) {
    this.selectedTooth = toothNum;
    this.selectedSurface = surface;

    // Update active highlight class
    this.container.querySelectorAll(".tooth-item").forEach(c => c.classList.remove("tooth-selected"));
    const activeCell = this.container.querySelector(`#tooth-cell-${toothNum}`);
    if (activeCell) {
      activeCell.classList.add("tooth-selected");
    }

    if (this.options.onToothSelect) {
      const toothData = this.chartData[toothNum] || {
        status: "healthy",
        surfaces: {},
        findings: [],
        diagnosis: "",
        planned: [],
        completed: []
      };
      this.options.onToothSelect(toothNum, toothData, surface, this.toothNames[toothNum] || `Tooth #${toothNum}`);
    }
  }

  updateToothData(toothNum, data) {
    this.chartData[toothNum] = Object.assign(this.chartData[toothNum] || {}, data);
    this.render();
    // Keep selection
    if (this.selectedTooth === toothNum) {
      const activeCell = this.container.querySelector(`#tooth-cell-${toothNum}`);
      if (activeCell) activeCell.classList.add("tooth-selected");
    }
  }
}

// Global reference
window.OdontogramChart = OdontogramChart;
