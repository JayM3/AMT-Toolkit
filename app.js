/**
 * Airlines Manager Tycoon Toolkit (AMT Toolkit)
 * Zero-Out Price Calculator - Real-time calculation engine & reactive UI management
 */

// Class configurations
const CLASSES = [
  { id: 'eco', name: 'Economy', code: 'Y', color: 'cyan', icon: '💺' },
  { id: 'bus', name: 'Business', code: 'J', color: 'blue', icon: '💼' },
  { id: 'first', name: 'First Class', code: 'F', color: 'amber', icon: '👑' },
  { id: 'cargo', name: 'Cargo', code: 'C', color: 'purple', icon: '📦', isCargo: true }
];

// Sample presets for quick testing
const PRESETS = {
  jfk: {
    label: 'CDG ✈ JFK',
    eco: { dSim: 2450, r: 350, pAudit: 1980 },
    bus: { dSim: 620, r: 80, pAudit: 3450 },
    first: { dSim: 180, r: 25, pAudit: 6890 },
    cargo: { dSim: 85, r: 15, pAudit: 4200 }
  },
  hnd: {
    label: 'LHR ✈ HND',
    eco: { dSim: 3120, r: 480, pAudit: 2410 },
    bus: { dSim: 840, r: 110, pAudit: 4120 },
    first: { dSim: 230, r: 35, pAudit: 8250 },
    cargo: { dSim: 120, r: 20, pAudit: 4980 }
  }
};

// Global state
let state = {
  cargoEnabled: true,
  eco: { dSim: '', r: '', pAudit: '' },
  bus: { dSim: '', r: '', pAudit: '' },
  first: { dSim: '', r: '', pAudit: '' },
  cargo: { dSim: '', r: '', pAudit: '' }
};

// Format numbers with commas
function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '—';
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Format currency
function formatCurrency(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val) || val === '') return '—';
  const prefix = val < 0 ? '-$' : '$';
  return prefix + Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Core Mathematical Calculation:
 * C = D_sim - R
 * P_target = P_audit + (1/3) * P_audit * (1 - C / D_sim)
 * Equivalent to: P_target = P_audit * (1 + R / (3 * D_sim))
 */
function calculateClass(classId) {
  const dSimRaw = document.getElementById(`${classId}_dsim`)?.value;
  const rRaw = document.getElementById(`${classId}_r`)?.value;
  const pAuditRaw = document.getElementById(`${classId}_paudit`)?.value;

  const dSim = parseFloat(dSimRaw);
  const r = parseFloat(rRaw);
  const pAudit = parseFloat(pAuditRaw);

  const hasInputs = !isNaN(dSim) && !isNaN(r) && !isNaN(pAudit);

  if (!hasInputs || dSim <= 0 || pAudit <= 0) {
    return {
      hasData: false,
      dSim: isNaN(dSim) ? 0 : dSim,
      r: isNaN(r) ? 0 : r,
      pAudit: isNaN(pAudit) ? 0 : pAudit,
      c: !isNaN(dSim) && !isNaN(r) ? dSim - r : 0,
      pTarget: null,
      pTargetRounded: null,
      deltaP: null,
      deltaPercent: null,
      currentRevenue: null,
      targetRevenue: null,
      deltaRevenue: null
    };
  }

  // Scheduled Capacity
  const c = dSim - r;

  // Zero-out target price calculation
  // Formula: P_target = P_audit + (1/3) * P_audit * (1 - C / D_sim)
  const ratio = 1 - (c / dSim);
  const pTarget = pAudit + (1 / 3) * pAudit * ratio;

  // In-game mechanics round to nearest integer dollar
  const pTargetRounded = Math.round(pTarget);
  const deltaP = pTargetRounded - pAudit;
  const deltaPercent = pAudit > 0 ? (deltaP / pAudit) * 100 : 0;

  // Revenue computations (Capacity * Price)
  const currentRevenue = c > 0 ? c * pAudit : 0;
  const targetRevenue = c > 0 ? c * pTargetRounded : 0;
  const deltaRevenue = targetRevenue - currentRevenue;

  return {
    hasData: true,
    dSim,
    r,
    pAudit,
    c,
    pTarget,
    pTargetRounded,
    deltaP,
    deltaPercent,
    currentRevenue,
    targetRevenue,
    deltaRevenue
  };
}

// Recalculate and update all displays in real time
function updateAllCalculations() {
  let totalCurrentRev = 0;
  let totalTargetRev = 0;
  let totalCapacity = 0;
  let hasAnyData = false;

  CLASSES.forEach(cls => {
    if (cls.isCargo && !state.cargoEnabled) {
      updateClassUI(cls.id, null, false);
      return;
    }

    const calc = calculateClass(cls.id);
    updateClassUI(cls.id, calc, true);

    if (calc.hasData) {
      hasAnyData = true;
      totalCurrentRev += calc.currentRevenue;
      totalTargetRev += calc.targetRevenue;
      if (calc.c > 0) totalCapacity += calc.c;
    }
  });

  // Update Summary Card & Totals
  const totalDeltaRev = totalTargetRev - totalCurrentRev;
  const totalRevEl = document.getElementById('summary_total_revenue');
  const deltaRevEl = document.getElementById('summary_delta_revenue');
  const totalSeatsEl = document.getElementById('summary_total_capacity');

  if (totalRevEl) {
    totalRevEl.textContent = hasAnyData ? formatCurrency(totalTargetRev) : '$0';
  }
  if (deltaRevEl) {
    if (hasAnyData && totalDeltaRev !== 0) {
      const sign = totalDeltaRev > 0 ? '+' : '';
      deltaRevEl.textContent = `${sign}${formatCurrency(totalDeltaRev)}/day`;
      deltaRevEl.className = totalDeltaRev >= 0 
        ? 'font-mono-num font-semibold text-emerald-400' 
        : 'font-mono-num font-semibold text-rose-400';
    } else {
      deltaRevEl.textContent = '+$0/day';
      deltaRevEl.className = 'font-mono-num font-semibold text-slate-400';
    }
  }
  if (totalSeatsEl) {
    totalSeatsEl.textContent = hasAnyData ? formatNumber(totalCapacity) : '0';
  }

  // Update Compact Daily Gain KPI
  const compactGainEl = document.getElementById('compact_daily_gain');
  if (compactGainEl) {
    if (hasAnyData && totalDeltaRev !== 0) {
      const sign = totalDeltaRev > 0 ? '+' : '';
      compactGainEl.textContent = `${sign}${formatCurrency(totalDeltaRev)}/day`;
      compactGainEl.className = totalDeltaRev >= 0 
        ? 'text-emerald-400 font-bold font-mono-num text-xs' 
        : 'text-rose-400 font-bold font-mono-num text-xs';
    } else {
      compactGainEl.textContent = '+$0/day';
      compactGainEl.className = 'text-slate-400 font-bold font-mono-num text-xs';
    }
  }

  saveToLocalStorage();
}

// Update specific class card and results table row
function updateClassUI(classId, calc, isVisible) {
  const rowEl = document.getElementById(`row_${classId}`);
  const cardEl = document.getElementById(`card_${classId}`);
  const compactRowEl = document.getElementById(`compact_row_${classId}`);

  if (!isVisible) {
    if (rowEl) rowEl.classList.add('hidden');
    if (cardEl) cardEl.classList.add('opacity-40', 'pointer-events-none');
    if (compactRowEl) compactRowEl.classList.add('hidden');
    return;
  } else {
    if (rowEl) rowEl.classList.remove('hidden');
    if (cardEl) cardEl.classList.remove('opacity-40', 'pointer-events-none');
    if (compactRowEl) compactRowEl.classList.remove('hidden');
  }

  // Sync Compact Inputs
  const cPAudit = document.getElementById(`compact_${classId}_paudit`);
  const cDSim = document.getElementById(`compact_${classId}_dsim`);
  const cR = document.getElementById(`compact_${classId}_r`);
  const stdPAudit = document.getElementById(`${classId}_paudit`);
  const stdDSim = document.getElementById(`${classId}_dsim`);
  const stdR = document.getElementById(`${classId}_r`);
  if (cPAudit && stdPAudit && cPAudit.value !== stdPAudit.value) cPAudit.value = stdPAudit.value;
  if (cDSim && stdDSim && cDSim.value !== stdDSim.value) cDSim.value = stdDSim.value;
  if (cR && stdR && cR.value !== stdR.value) cR.value = stdR.value;

  // Update Compact Target Price
  const compactTargetEl = document.getElementById(`compact_${classId}_target`);
  if (compactTargetEl) {
    if (calc && calc.hasData) {
      compactTargetEl.textContent = formatCurrency(calc.pTargetRounded);
    } else {
      compactTargetEl.textContent = '$—';
    }
  }

  // Update card inline calculated capacity C
  const cardCEl = document.getElementById(`${classId}_card_c`);
  if (cardCEl) {
    if (calc && (!isNaN(calc.c) && (calc.dSim > 0 || calc.r > 0))) {
      cardCEl.textContent = formatNumber(calc.c);
    } else {
      cardCEl.textContent = '—';
    }
  }

  // Update card target price badge
  const cardPriceEl = document.getElementById(`${classId}_card_target`);
  if (cardPriceEl) {
    if (calc && calc.hasData) {
      cardPriceEl.textContent = formatCurrency(calc.pTargetRounded);
    } else {
      cardPriceEl.textContent = '$—';
    }
  }

  // Update card inline delta pill
  const cardDeltaEl = document.getElementById(`${classId}_card_deltap`);
  if (cardDeltaEl) {
    if (calc && calc.hasData) {
      const sign = calc.deltaP > 0 ? '+' : '';
      cardDeltaEl.textContent = `${sign}${formatCurrency(calc.deltaP)} (${sign}${calc.deltaPercent.toFixed(1)}%)`;
      cardDeltaEl.className = calc.deltaP > 0 
        ? 'text-[10px] text-emerald-400 font-mono-num font-semibold' 
        : calc.deltaP < 0 
          ? 'text-[10px] text-rose-400 font-mono-num font-semibold' 
          : 'text-[10px] text-slate-400 font-mono-num';
    } else {
      cardDeltaEl.textContent = '—';
      cardDeltaEl.className = 'text-[10px] text-slate-500 font-mono-num';
    }
  }

  // Update Results Table Row
  const tablePAudit = document.getElementById(`table_${classId}_paudit`);
  const tableDSim = document.getElementById(`table_${classId}_dsim`);
  const tableC = document.getElementById(`table_${classId}_c`);
  const tableR = document.getElementById(`table_${classId}_r`);
  const tableTarget = document.getElementById(`table_${classId}_target`);
  const tableExact = document.getElementById(`table_${classId}_exact`);
  const tableDeltaP = document.getElementById(`table_${classId}_delta_p`);
  const tableDeltaRev = document.getElementById(`table_${classId}_delta_rev`);
  const copyBtn = document.getElementById(`copy_btn_${classId}`);

  // Populate Audit Price, Demand, and Remaining in Table
  if (tablePAudit) {
    tablePAudit.textContent = calc && calc.pAudit > 0 ? formatCurrency(calc.pAudit) : '—';
  }
  if (tableDSim) {
    tableDSim.textContent = calc && calc.dSim > 0 ? formatNumber(calc.dSim) : '—';
  }
  if (tableR) {
    const rInput = document.getElementById(`${classId}_r`);
    tableR.textContent = rInput && rInput.value.trim() !== '' && !isNaN(calc.r) ? formatNumber(calc.r) : '—';
  }
  if (tableC) {
    const rInput = document.getElementById(`${classId}_r`);
    tableC.textContent = calc && (!isNaN(calc.c) && (calc.dSim > 0 || calc.r > 0) && rInput && rInput.value.trim() !== '') ? formatNumber(calc.c) : '—';
  }

  if (tableTarget) {
    tableTarget.textContent = calc && calc.hasData ? formatCurrency(calc.pTargetRounded) : '—';
  }

  if (tableExact) {
    tableExact.textContent = calc && calc.hasData ? `(${formatCurrency(calc.pTarget, 2)})` : '';
  }

  if (tableDeltaP) {
    if (calc && calc.hasData) {
      const sign = calc.deltaP > 0 ? '+' : '';
      tableDeltaP.textContent = `${sign}${formatCurrency(calc.deltaP)} (${sign}${calc.deltaPercent.toFixed(1)}%)`;
      tableDeltaP.className = calc.deltaP > 0 
        ? 'font-mono-num text-xs font-semibold text-emerald-400' 
        : calc.deltaP < 0 
          ? 'font-mono-num text-xs font-semibold text-rose-400' 
          : 'font-mono-num text-xs text-slate-400';
    } else {
      tableDeltaP.textContent = '—';
      tableDeltaP.className = 'font-mono-num text-xs text-slate-500';
    }
  }

  if (tableDeltaRev) {
    if (calc && calc.hasData) {
      const sign = calc.deltaRevenue > 0 ? '+' : '';
      tableDeltaRev.textContent = `${sign}${formatCurrency(calc.deltaRevenue)}`;
      tableDeltaRev.className = calc.deltaRevenue >= 0
        ? 'font-mono-num text-sm font-semibold text-emerald-400'
        : 'font-mono-num text-sm font-semibold text-rose-400';
    } else {
      tableDeltaRev.textContent = '—';
      tableDeltaRev.className = 'font-mono-num text-sm text-slate-500';
    }
  }

  if (copyBtn) {
    copyBtn.disabled = !(calc && calc.hasData);
  }
}

// Copy single target price
window.copyTargetPrice = function(classId) {
  const calc = calculateClass(classId);
  if (!calc || !calc.hasData) return;

  const priceVal = calc.pTargetRounded.toString();
  navigator.clipboard.writeText(priceVal).then(() => {
    showToast(`Copied ${classId.toUpperCase()} Target Price: $${priceVal}`);
    
    // Visual button feedback on both standard & compact copy buttons
    const btn = document.getElementById(`copy_btn_${classId}`);
    const compactBtn = document.getElementById(`compact_copy_btn_${classId}`);
    [btn, compactBtn].forEach(b => {
      if (b) {
        const origHtml = b.innerHTML;
        b.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        setTimeout(() => {
          b.innerHTML = origHtml;
        }, 1500);
      }
    });
  });
};

// Copy all target prices formatted
window.copyAllPrices = function() {
  const prices = [];
  CLASSES.forEach(cls => {
    if (cls.isCargo && !state.cargoEnabled) return;
    const calc = calculateClass(cls.id);
    if (calc && calc.hasData) {
      prices.push(`${cls.name}: $${calc.pTargetRounded}`);
    }
  });

  if (prices.length === 0) {
    showToast('No target prices calculated yet.', 'warning');
    return;
  }

  const text = prices.join(' | ');
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied all prices: ${text}`);
    const btn = document.getElementById('btn_compact_copy_all');
    if (btn) {
      const origText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('bg-emerald-600', 'text-white');
      setTimeout(() => {
        btn.textContent = origText;
        btn.classList.remove('bg-emerald-600', 'text-white');
      }, 1500);
    }
  });
};

window.copyAllCompactTargetPrices = function() {
  window.copyAllPrices();
};

// Compact Input Handler (Prototype B)
window.onCompactInput = function(classId, field, value) {
  const stdInput = document.getElementById(`${classId}_${field}`);
  if (stdInput) {
    stdInput.value = value;
  }
  const stateField = field === 'paudit' ? 'pAudit' : (field === 'dsim' ? 'dSim' : 'r');
  if (state[classId]) {
    state[classId][stateField] = value;
  }
  updateAllCalculations();
};

// Clear Table & Reset all inputs
let isClearingZeroOut = false;
window.clearTable = function() {
  isClearingZeroOut = true;
  CLASSES.forEach(cls => {
    const dSim = document.getElementById(`${cls.id}_dsim`);
    const r = document.getElementById(`${cls.id}_r`);
    const pAudit = document.getElementById(`${cls.id}_paudit`);
    if (dSim) dSim.value = '';
    if (r) r.value = '';
    if (pAudit) pAudit.value = '';

    // Clear compact inputs as well
    const cDSim = document.getElementById(`compact_${cls.id}_dsim`);
    const cR = document.getElementById(`compact_${cls.id}_r`);
    const cPAudit = document.getElementById(`compact_${cls.id}_paudit`);
    if (cDSim) cDSim.value = '';
    if (cR) cR.value = '';
    if (cPAudit) cPAudit.value = '';
  });

  window.LAST_ZERO_OUT_DST = null;
  const routeBadge = document.getElementById('zero_out_active_route_badge');
  const compactBadge = document.getElementById('compact_route_badge');
  if (routeBadge) routeBadge.classList.add('hidden');
  if (compactBadge) compactBadge.classList.add('hidden');

  updateAllCalculations();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('am_zero_out_state');
  }
  isClearingZeroOut = false;
  showToast('Table cleared successfully');
};
window.clearAllInputs = window.clearTable;

// UI Mode Toggle (Compact vs Standard)
window.setUIMode = function(mode) {
  const isCompact = mode === 'compact';
  console.log('[AMT App] setUIMode:', mode, 'isCompact:', isCompact);

  if (isCompact) {
    document.body.classList.add('amt-compact-mode');
  } else {
    document.body.classList.remove('amt-compact-mode');
  }

  // Directly set display styles so it never fails due to CSS caching
  const stdCont = document.getElementById('zero_out_standard_container');
  const compCont = document.getElementById('zero_out_compact_container');
  if (stdCont) {
    stdCont.style.setProperty('display', isCompact ? 'none' : 'block', 'important');
  }
  if (compCont) {
    compCont.style.setProperty('display', isCompact ? 'block' : 'none', 'important');
  }

  try {
    localStorage.setItem('amt_ui_mode', mode);
  } catch (e) {}

  // Synchronize inputs across both views
  if (typeof CLASSES !== 'undefined') {
    CLASSES.forEach(cls => {
      const stdPAudit = document.getElementById(`${cls.id}_paudit`);
      const stdDSim = document.getElementById(`${cls.id}_dsim`);
      const stdR = document.getElementById(`${cls.id}_r`);
      const cPAudit = document.getElementById(`compact_${cls.id}_paudit`);
      const cDSim = document.getElementById(`compact_${cls.id}_dsim`);
      const cR = document.getElementById(`compact_${cls.id}_r`);
      if (stdPAudit && cPAudit && stdPAudit.value) cPAudit.value = stdPAudit.value;
      if (stdDSim && cDSim && stdDSim.value) cDSim.value = stdDSim.value;
      if (stdR && cR && stdR.value) cR.value = stdR.value;
    });
  }

  // Sync cargo toggles
  const stdCargo = document.getElementById('toggle_cargo');
  const compCargo = document.getElementById('compact_toggle_cargo');
  if (stdCargo && compCargo) {
    compCargo.checked = stdCargo.checked;
  }
};

// Listen for messages from extension parent window
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'AMT_SET_MODE') {
    console.log('[AMT App] Message received from parent:', e.data);
    window.setUIMode(e.data.mode);
  }
});

// Initialize UI mode
(function initUIMode() {
  const isInsideIframe = window.self !== window.top;
  if (!isInsideIframe) {
    // On the main website, always stay in standard mode
    window.setUIMode('standard');
  } else {
    // Inside the extension sidebar, use saved preference or default to compact
    const savedMode = localStorage.getItem('amt_ui_mode') || 'compact';
    window.setUIMode(savedMode);
  }
})();

// Load Preset Data (e.g. CDG -> JFK)
window.loadPreset = function(presetKey = 'jfk') {
  const preset = PRESETS[presetKey] || PRESETS.jfk;

  CLASSES.forEach(cls => {
    const data = preset[cls.id];
    if (data) {
      const dSim = document.getElementById(`${cls.id}_dsim`);
      const r = document.getElementById(`${cls.id}_r`);
      const pAudit = document.getElementById(`${cls.id}_paudit`);
      if (dSim) dSim.value = data.dSim;
      if (r) r.value = data.r;
      if (pAudit) pAudit.value = data.pAudit;
    }
  });

  updateAllCalculations();
  showToast(`Loaded sample route: ${preset.label}`);
};

// Toggle Cargo visibility & calculation
function toggleCargo() {
  const cargoCheckbox = document.getElementById('toggle_cargo');
  state.cargoEnabled = cargoCheckbox ? cargoCheckbox.checked : true;
  updateAllCalculations();
}
window.toggleCargo = toggleCargo;


// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toast_container');
  if (!container) return;

  const toast = document.createElement('div');
  const borderCol = type === 'warning' ? 'border-amber-500/40 text-amber-300' : 'border-cyan-500/40 text-cyan-300';
  toast.className = `flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/95 border ${borderCol} shadow-xl text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 backdrop-blur-md`;
  
  toast.innerHTML = `
    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// Local Storage auto-save (Zero-Out Price)
function saveToLocalStorage() {
  if (isClearingZeroOut || typeof localStorage === 'undefined') return;

  const data = {
    cargoEnabled: state.cargoEnabled,
    eco: {
      dSim: document.getElementById('eco_dsim')?.value || '',
      r: document.getElementById('eco_r')?.value || '',
      pAudit: document.getElementById('eco_paudit')?.value || ''
    },
    bus: {
      dSim: document.getElementById('bus_dsim')?.value || '',
      r: document.getElementById('bus_r')?.value || '',
      pAudit: document.getElementById('bus_paudit')?.value || ''
    },
    first: {
      dSim: document.getElementById('first_dsim')?.value || '',
      r: document.getElementById('first_r')?.value || '',
      pAudit: document.getElementById('first_paudit')?.value || ''
    },
    cargo: {
      dSim: document.getElementById('cargo_dsim')?.value || '',
      r: document.getElementById('cargo_r')?.value || '',
      pAudit: document.getElementById('cargo_paudit')?.value || ''
    }
  };

  const hasData = CLASSES.some(cls => {
    const d = data[cls.id]?.dSim;
    const r = data[cls.id]?.r;
    const p = data[cls.id]?.pAudit;
    return (d && d.trim() !== '') || (r && r.trim() !== '') || (p && p.trim() !== '');
  });

  if (!hasData) {
    localStorage.removeItem('am_zero_out_state');
    return;
  }

  localStorage.setItem('am_zero_out_state', JSON.stringify(data));
}

// Local Storage restore (Zero-Out Price)
function restoreFromLocalStorage() {
  if (typeof localStorage === 'undefined') return false;
  const saved = localStorage.getItem('am_zero_out_state');
  if (!saved) return false;

  try {
    const data = JSON.parse(saved);

    if (data.cargoEnabled !== undefined) {
      state.cargoEnabled = data.cargoEnabled;
      const cargoCb = document.getElementById('toggle_cargo');
      if (cargoCb) cargoCb.checked = data.cargoEnabled;
    }

    CLASSES.forEach(cls => {
      if (data[cls.id]) {
        const dSim = document.getElementById(`${cls.id}_dsim`);
        const r = document.getElementById(`${cls.id}_r`);
        const pAudit = document.getElementById(`${cls.id}_paudit`);
        if (dSim && data[cls.id].dSim !== undefined) dSim.value = data[cls.id].dSim;
        if (r && data[cls.id].r !== undefined) r.value = data[cls.id].r;
        if (pAudit && data[cls.id].pAudit !== undefined) pAudit.value = data[cls.id].pAudit;
      }
    });

    return true;
  } catch (e) {
    console.error('Failed to restore saved data:', e);
    return false;
  }
}


/* ==========================================================================
   CIRCUIT SEAT CONFIGURATOR & MULTI-ROUTE FLEET ENGINE (V2)
   ========================================================================== */

// Circuit Global State
window.CIRCUIT_HUB = 'OSL';
window.CIRCUIT_LEGS = [];
window.CIRCUIT_STRATEGY = 'max_profit';
window.CIRCUIT_STRATEGY_MANUAL = false;
window.ACTIVE_FLEET_PLAN = null;
window.CIRCUIT_FULFILLED_CONFIGS = {};
window.isScheduleDropdownOpen = true;
window.isFinancialsDropdownOpen = false;
window.isFleetConfigDropdownOpen = true;
let isResettingCircuit = false;

// Country to emoji flag map
const COUNTRY_FLAGS = {
  'Norway': '🇳🇴',
  'United Arab Emirates': '🇦🇪',
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Netherlands': '🇳🇱',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Brazil': '🇧🇷',
  'Australia': '🇦🇺',
  'Canada': '🇨🇦',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Thailand': '🇹🇭',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'India': '🇮🇳',
  'Singapore': '🇸🇬',
  'South Africa': '🇿🇦',
  'Egypt': '🇪🇬',
  'Saudi Arabia': '🇸🇦',
  'Qatar': '🇶🇦',
  'Turkey': '🇹🇷',
  'Switzerland': '🇨🇭',
  'Sweden': '🇸🇪',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Belgium': '🇧🇪',
  'Austria': '🇦🇹',
  'Portugal': '🇵🇹',
  'Greece': '🇬🇷',
  'Ireland': '🇮🇪',
  'Mexico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'New Zealand': '🇳🇿',
  'South Korea': '🇰🇷',
  'Indonesia': '🇮🇩',
  'Malaysia': '🇲🇾',
  'Vietnam': '🇻🇳',
  'Philippines': '🇵🇭'
};

function getCountryFlag(country) {
  if (!country) return '✈️';
  return COUNTRY_FLAGS[country] || '✈️';
}

const CIRCUIT_COLORS = [
  '#d97706', // Amber / Gold
  '#0284c7', // Sky blue
  '#059669', // Emerald
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#ea580c', // Orange
  '#4f46e5', // Indigo
  '#ca8a04', // Dark Gold
  '#0891b2'  // Cyan
];

/**
 * Great-Circle Distance (Haversine Formula) in Kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth mean radius in km
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Lookup airport by IATA code or name
 */
function findAirport(str) {
  if (!str || typeof AIRPORTS_DATABASE === 'undefined') return null;
  const clean = str.trim().toUpperCase();
  const exact = AIRPORTS_DATABASE.find(a => a.iata === clean);
  if (exact) return exact;
  return AIRPORTS_DATABASE.find(a => 
    clean.startsWith(a.iata) || 
    (a.city && a.city.toUpperCase().includes(clean)) || 
    (a.name && a.name.toUpperCase().includes(clean))
  );
}

function getActiveAircraft() {
  const acId = document.getElementById('sc_aircraft_select')?.value;
  if (!acId || typeof AIRCRAFT_DATABASE === 'undefined') return null;
  return AIRCRAFT_DATABASE.find(a => a.id === acId) || AIRCRAFT_DATABASE[0];
}

function getCircuitMaxLegDistance() {
  if (!window.CIRCUIT_LEGS || window.CIRCUIT_LEGS.length === 0) return 0;
  return Math.max(...window.CIRCUIT_LEGS.map(l => l.distanceKm || 0));
}

function getCircuitMinAirportCategory() {
  const hubCode = document.getElementById('sc_circuit_hub')?.value || window.CIRCUIT_HUB || 'OSL';
  const hubAirport = findAirport(hubCode);
  let minCat = hubAirport ? hubAirport.cat : 10;
  if (window.CIRCUIT_LEGS && window.CIRCUIT_LEGS.length > 0) {
    window.CIRCUIT_LEGS.forEach(l => {
      const a = findAirport(l.dst);
      if (a && a.cat && a.cat < minCat) minCat = a.cat;
    });
  }
  return minCat;
}

/**
 * AM Flight Time formula: 2 * (dist / speed + 1.0h ground), rounded to nearest 15 mins
 */
function calculateFlightTimeHours(dist, speed) {
  if (!dist || dist <= 0 || !speed || speed <= 0) return 0;
  const rt = ((dist / speed) + 1.0) * 2;
  return Math.ceil(rt * 4) / 4;
}

function formatHoursMinutes(hrs) {
  if (isNaN(hrs) || hrs <= 0) return '0h 00m';
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
}

/**
 * Dropdown Box Toggles & State Persistence (Schedule, Fleet Config, Financials)
 */
const DROPDOWN_STATE_KEY = 'am_circuit_dropdown_states_v1';

function applyDropdownStateUI(type, isOpen) {
  if (type === 'schedule') {
    window.isScheduleDropdownOpen = isOpen;
    const body = document.getElementById('circuit_schedule_body');
    const btnText = document.getElementById('sched_dropdown_btn_text');
    const chevron = document.getElementById('sched_dropdown_chevron');
    if (body) {
      if (isOpen) {
        body.classList.remove('accordion-collapsed');
        if (btnText) btnText.textContent = 'Collapse';
        if (chevron) chevron.classList.remove('rotate-180');
      } else {
        body.classList.add('accordion-collapsed');
        if (btnText) btnText.textContent = 'Show Schedule';
        if (chevron) chevron.classList.add('rotate-180');
      }
    }
  } else if (type === 'fleetConfig') {
    window.isFleetConfigDropdownOpen = isOpen;
    const body = document.getElementById('circuit_fleet_config_body');
    const btnText = document.getElementById('fleet_config_dropdown_btn_text');
    const chevron = document.getElementById('fleet_config_dropdown_chevron');
    if (body) {
      if (isOpen) {
        body.classList.remove('accordion-collapsed');
        if (btnText) btnText.textContent = 'Collapse';
        if (chevron) chevron.classList.remove('rotate-180');
      } else {
        body.classList.add('accordion-collapsed');
        if (btnText) btnText.textContent = 'Show Configurations';
        if (chevron) chevron.classList.add('rotate-180');
      }
    }
  } else if (type === 'financials') {
    window.isFinancialsDropdownOpen = isOpen;
    const body = document.getElementById('circuit_financials_body');
    const btnText = document.getElementById('financials_dropdown_btn_text');
    const chevron = document.getElementById('financials_dropdown_chevron');
    if (body) {
      if (isOpen) {
        body.classList.remove('accordion-collapsed');
        if (btnText) btnText.textContent = 'Collapse';
        if (chevron) chevron.classList.remove('rotate-180');
      } else {
        body.classList.add('accordion-collapsed');
        if (btnText) btnText.textContent = 'Show Details';
        if (chevron) chevron.classList.add('rotate-180');
      }
    }
  }
}
window.applyDropdownStateUI = applyDropdownStateUI;

function saveDropdownStatesToLocalStorage() {
  if (typeof localStorage === 'undefined') return;
  try {
    const states = {
      schedule: !!window.isScheduleDropdownOpen,
      fleetConfig: !!window.isFleetConfigDropdownOpen,
      financials: !!window.isFinancialsDropdownOpen
    };
    localStorage.setItem(DROPDOWN_STATE_KEY, JSON.stringify(states));
  } catch (e) {
    console.warn('Failed to save dropdown states to localStorage:', e);
  }
}
window.saveDropdownStatesToLocalStorage = saveDropdownStatesToLocalStorage;

function restoreDropdownStatesFromLocalStorage() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(DROPDOWN_STATE_KEY);
    if (!raw) {
      // Default initial states: schedule=open, fleetConfig=open, financials=collapsed
      applyDropdownStateUI('schedule', window.isScheduleDropdownOpen !== undefined ? !!window.isScheduleDropdownOpen : true);
      applyDropdownStateUI('fleetConfig', window.isFleetConfigDropdownOpen !== undefined ? !!window.isFleetConfigDropdownOpen : true);
      applyDropdownStateUI('financials', window.isFinancialsDropdownOpen !== undefined ? !!window.isFinancialsDropdownOpen : false);
      return;
    }
    const states = JSON.parse(raw);
    if (states && typeof states === 'object') {
      if (states.schedule !== undefined) applyDropdownStateUI('schedule', !!states.schedule);
      if (states.fleetConfig !== undefined) applyDropdownStateUI('fleetConfig', !!states.fleetConfig);
      if (states.financials !== undefined) applyDropdownStateUI('financials', !!states.financials);
    }
  } catch (e) {
    console.warn('Failed to restore dropdown states from localStorage:', e);
  }
}
window.restoreDropdownStatesFromLocalStorage = restoreDropdownStatesFromLocalStorage;

// Restore dropdown states immediately if DOM elements are available
if (typeof document !== 'undefined') {
  restoreDropdownStatesFromLocalStorage();
}

function toggleScheduleDropdown() {
  const next = !window.isScheduleDropdownOpen;
  applyDropdownStateUI('schedule', next);
  saveDropdownStatesToLocalStorage();
}
window.toggleScheduleDropdown = toggleScheduleDropdown;

function toggleFinancialsDropdown() {
  const next = !window.isFinancialsDropdownOpen;
  applyDropdownStateUI('financials', next);
  saveDropdownStatesToLocalStorage();
}
window.toggleFinancialsDropdown = toggleFinancialsDropdown;

function toggleFleetConfigDropdown() {
  const next = !window.isFleetConfigDropdownOpen;
  applyDropdownStateUI('fleetConfig', next);
  saveDropdownStatesToLocalStorage();
}
window.toggleFleetConfigDropdown = toggleFleetConfigDropdown;

/**
 * Strategy Selector UI & Handlers
 */
function updateStrategyButtonUI() {
  const strat = window.CIRCUIT_STRATEGY || 'max_profit';
  const btnMax = document.getElementById('sc_strategy_btn_maxprofit');
  const btnZero = document.getElementById('sc_strategy_btn_zeroempty');
  const badge = document.getElementById('circuit_strategy_badge');

  if (strat === 'max_profit') {
    if (btnMax) {
      btnMax.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 bg-emerald-950 text-emerald-300 border border-emerald-700 shadow-sm';
    }
    if (btnZero) {
      btnZero.className = 'px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 text-slate-400 hover:text-slate-200 border border-transparent';
    }
    if (badge) {
      badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold';
      badge.textContent = '💰 Profit Maximized • Balanced Demand';
    }
  } else {
    if (btnMax) {
      btnMax.className = 'px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 text-slate-400 hover:text-slate-200 border border-transparent';
    }
    if (btnZero) {
      btnZero.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm';
    }
    if (badge) {
      badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold';
      badge.textContent = '🛡️ Zero Empty Seats • Strict Bottleneck';
    }
  }

  const activeAc = (typeof getActiveAircraft === 'function') ? getActiveAircraft() : null;
  if (activeAc) {
    const stratName = document.getElementById('sc_strategy_aircraft_name');
    const stratCat = document.getElementById('sc_strategy_aircraft_cat');
    if (stratName) stratName.textContent = activeAc.name;
    if (stratCat) stratCat.textContent = `Cat. ${activeAc.category}`;
  }
}
window.updateStrategyButtonUI = updateStrategyButtonUI;

function setCircuitStrategy(strat) {
  window.CIRCUIT_STRATEGY = strat;
  window.CIRCUIT_STRATEGY_MANUAL = true;
  updateStrategyButtonUI();
  saveSeatConfigToLocalStorage();
  renderCircuitAll();
  const label = strat === 'max_profit' ? 'Maximum Profit (Balanced Demand)' : 'Zero Empty Seats (Strict Bottleneck)';
  showToast(`Switched strategy to: ${label}`);
}
window.setCircuitStrategy = setCircuitStrategy;

/**
 * Auto-populate 24h circuit repetition (Point 1)
 * When routes are added to a 24h circuit, auto-calculate how many times
 * each route can fly within the 24h day to maximize plane utilization.
 */
function autoPopulate24hCircuit() {
  const legs = window.CIRCUIT_LEGS || [];
  if (legs.length === 0) return;

  const aircraft = typeof getActiveAircraft === 'function' ? getActiveAircraft() : null;
  const speed = aircraft?.speed_kmh || 800;

  // Sync leg duration to current active aircraft speed
  legs.forEach(l => {
    if (l.distanceKm && speed) {
      l.durationHours = calculateFlightTimeHours(l.distanceKm, speed);
      l.durationText = formatHoursMinutes(l.durationHours);
    }
  });

  const baseSingleSum = legs.reduce((acc, l) => acc + (l.durationHours || 0), 0);

  // If single leg sum exceeds 28h, it's a 168h circuit; flights per day is 1
  if (baseSingleSum > 28) {
    legs.forEach(l => { l.flightsPerDay = 1; });
    return;
  }

  if (legs.length === 1) {
    // Single route: repeat as many times as can fit in 24h!
    const dur = legs[0].durationHours || 0;
    legs[0].flightsPerDay = dur > 0 ? Math.max(1, Math.floor(24 / dur)) : 1;
    return;
  }

  // Multiple routes in 24h circuit:
  // Base cycles for the combined block
  const blockCycles = Math.max(1, Math.floor(24 / baseSingleSum));
  legs.forEach(l => {
    l.flightsPerDay = blockCycles;
  });

  // Try to fit additional individual flights into the remaining time
  let remTime = 24 - legs.reduce((acc, l) => acc + (l.durationHours * l.flightsPerDay), 0);
  for (let i = 0; i < legs.length; i++) {
    const dur = legs[i].durationHours || 0;
    if (dur <= remTime) {
      legs[i].flightsPerDay += 1;
      remTime -= dur;
    }
  }
}

function updateLegFlights(idx, delta) {
  const legs = window.CIRCUIT_LEGS || [];
  if (!legs[idx]) return;
  legs[idx].flightsPerDay = Math.max(1, (legs[idx].flightsPerDay || 1) + delta);
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.updateLegFlights = updateLegFlights;

function setLegFlights(idx, val) {
  const legs = window.CIRCUIT_LEGS || [];
  if (!legs[idx]) return;
  const parsed = parseInt(val) || 1;
  legs[idx].flightsPerDay = Math.max(1, parsed);
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.setLegFlights = setLegFlights;

/**
 * Detect Circuit Type (24h vs 168h) & calculate rotation metrics
 */
function detectCircuitStats() {
  const legs = window.CIRCUIT_LEGS || [];
  const aircraft = getActiveAircraft();
  const speed = aircraft?.speed_kmh || 800;
  const range = aircraft?.range_km || 15000;
  const acCat = aircraft?.category || 7;

  // Sync leg duration to current active aircraft speed
  legs.forEach(l => {
    if (l.distanceKm && speed) {
      l.durationHours = calculateFlightTimeHours(l.distanceKm, speed);
      l.durationText = formatHoursMinutes(l.durationHours);
    }
  });

  const baseSingleSum = legs.reduce((acc, l) => acc + (l.durationHours || 0), 0);

  let type = 'empty';
  let targetHours = 24;
  let totalHours = 0;

  if (legs.length > 0) {
    if (baseSingleSum <= 28) {
      type = '24h';
      targetHours = 24;
      // In 24h single route: ensure flightsPerDay does not exceed what fits in 24h
      if (legs.length === 1 && legs[0].durationHours > 0) {
        const maxFit = Math.max(1, Math.floor(24 / legs[0].durationHours));
        if (!legs[0].flightsPerDay || legs[0].flightsPerDay > maxFit) {
          legs[0].flightsPerDay = maxFit;
        }
      }
      // In 24h: sum of duration * flightsPerDay
      totalHours = legs.reduce((acc, l) => acc + (l.durationHours * (l.flightsPerDay || 1)), 0);
    } else {
      type = '168h';
      targetHours = 168;
      totalHours = baseSingleSum;
    }
  }

  window.CURRENT_CIRCUIT_TYPE = type;

  const maxLegDist = getCircuitMaxLegDistance();
  const minAirportCat = getCircuitMinAirportCategory();

  const isOverTime = totalHours > targetHours;
  const freeHours = Math.max(0, targetHours - totalHours);
  const utilizationPct = targetHours > 0 ? ((totalHours / targetHours) * 100).toFixed(1) : '0.0';

  return {
    legsCount: legs.length,
    totalHours,
    totalHoursFormatted: formatHoursMinutes(totalHours),
    type,
    targetHours,
    maxLegDist,
    minAirportCat,
    isOverTime,
    freeHours,
    freeHoursFormatted: formatHoursMinutes(freeHours),
    utilizationPct,
    rangeWarning: aircraft ? maxLegDist > range : false,
    categoryWarning: aircraft ? acCat > minAirportCat : false
  };
}
window.detectCircuitStats = detectCircuitStats;

/**
 * Sync the network globe's hub code and coordinates with the active hub
 */
function updateGlobeHubDisplay() {
  const hubEl = document.getElementById('globe-hub');
  const coordsEl = document.getElementById('globe_hub_coords');
  const currentHub = window.CIRCUIT_HUB || 'OSL';
  if (hubEl) {
    hubEl.textContent = currentHub;
  }
  if (coordsEl && typeof findAirport === 'function') {
    const apt = findAirport(currentHub);
    if (apt && apt.lat != null && apt.lon != null) {
      const latStr = `${Math.abs(apt.lat).toFixed(2)}° ${apt.lat >= 0 ? 'N' : 'S'}`;
      const lonStr = `${Math.abs(apt.lon).toFixed(2)}° ${apt.lon >= 0 ? 'E' : 'W'}`;
      coordsEl.innerHTML = `${latStr} &nbsp; ${lonStr}`;
    }
  }
}
window.updateGlobeHubDisplay = updateGlobeHubDisplay;

/**
 * Switch top navigation tabs
 */
function switchTab(tabId) {
  const navHome = document.getElementById('nav_home');
  const navZeroOut = document.getElementById('nav_zero_out');
  const navSeatConfig = document.getElementById('nav_seat_config');
  const navRouteFinder = document.getElementById('nav_route_finder');
  const navCircuitFinder = document.getElementById('nav_circuit_finder');
  const viewHome = document.getElementById('view_home');
  const viewZeroOut = document.getElementById('view_zero_out');
  const viewSeatConfig = document.getElementById('view_seat_config');
  const viewRouteFinder = document.getElementById('view_route_finder');
  const viewCircuitFinder = document.getElementById('view_circuit_finder');

  if (!navZeroOut || !navSeatConfig || !viewZeroOut || !viewSeatConfig) return;

  const pulseHome = navHome ? navHome.querySelector('.pulse-dot') : null;
  const pulseZero = navZeroOut.querySelector('.pulse-dot');
  const pulseSeat = navSeatConfig.querySelector('.pulse-dot');
  const pulseRoute = navRouteFinder ? navRouteFinder.querySelector('.pulse-dot') : null;
  const pulseCircuit = navCircuitFinder ? navCircuitFinder.querySelector('.pulse-dot') : null;

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('am_active_tab', tabId);
    } catch (e) {}
  }

  // Deactivate all first
  if (navHome) {
    navHome.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tab-btn-inactive border transition shadow-sm';
    if (pulseHome) pulseHome.classList.add('hidden');
  }
  if (viewHome) {
    viewHome.classList.add('hidden');
  }

  navZeroOut.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tab-btn-inactive border transition shadow-sm';
  if (pulseZero) pulseZero.classList.add('hidden');
  viewZeroOut.classList.add('hidden');

  navSeatConfig.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tab-btn-inactive border transition shadow-sm';
  if (pulseSeat) pulseSeat.classList.add('hidden');
  viewSeatConfig.classList.add('hidden');

  if (navRouteFinder) {
    navRouteFinder.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tab-btn-inactive border transition shadow-sm';
    if (pulseRoute) pulseRoute.classList.add('hidden');
  }
  if (viewRouteFinder) {
    viewRouteFinder.classList.add('hidden');
  }

  if (navCircuitFinder) {
    navCircuitFinder.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tab-btn-inactive border transition shadow-sm';
    if (pulseCircuit) pulseCircuit.classList.add('hidden');
  }
  if (viewCircuitFinder) {
    viewCircuitFinder.classList.add('hidden');
  }

  if (tabId === 'home') {
    if (navHome) {
      navHome.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tab-btn-active border transition shadow-sm';
      if (pulseHome) pulseHome.classList.remove('hidden');
    }
    if (viewHome) viewHome.classList.remove('hidden');
    if (window.location && window.location.hash !== '#home') {
      window.location.hash = '#home';
    }
    updateGlobeHubDisplay();
  } else if (tabId === 'circuit-finder') {
    if (navCircuitFinder) {
      navCircuitFinder.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tab-btn-active border transition shadow-sm';
      if (pulseCircuit) pulseCircuit.classList.remove('hidden');
    }
    if (viewCircuitFinder) viewCircuitFinder.classList.remove('hidden');
    if (window.location && window.location.hash !== '#circuit-finder') {
      window.location.hash = '#circuit-finder';
    }
    if (typeof window.initCircuitFinder === 'function') {
      window.initCircuitFinder();
    }
  } else if (tabId === 'route-finder') {
    if (navRouteFinder) {
      navRouteFinder.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tab-btn-active border transition shadow-sm';
      if (pulseRoute) pulseRoute.classList.remove('hidden');
    }
    if (viewRouteFinder) viewRouteFinder.classList.remove('hidden');
    if (window.location && window.location.hash !== '#route-finder') {
      window.location.hash = '#route-finder';
    }
    if (typeof window.initRouteFinder === 'function') {
      window.initRouteFinder();
    }
  } else if (tabId === 'seat-config') {
    navSeatConfig.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tab-btn-active border transition shadow-sm';
    if (pulseSeat) pulseSeat.classList.remove('hidden');
    viewSeatConfig.classList.remove('hidden');
    if (window.location && window.location.hash !== '#seat-config') {
      window.location.hash = '#seat-config';
    }
    renderCircuitAll();
  } else {
    navZeroOut.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tab-btn-active border transition shadow-sm';
    if (pulseZero) pulseZero.classList.remove('hidden');
    viewZeroOut.classList.remove('hidden');
    if (window.location && window.location.hash !== '#zero-out') {
      window.location.hash = '#zero-out';
    }
    if (typeof updateAllCalculations === 'function') {
      updateAllCalculations();
    }
  }
}
window.switchTab = switchTab;

/**
 * Transfer a circuit generated in Route Finder directly into the Seat Configurator
 */
function transferRouteFinderCircuitToSeatConfig(circuitData) {
  if (!circuitData) return;
  switchTab('seat-config');
  if (typeof loadSavedCircuit === 'function') {
    loadSavedCircuit(circuitData);
  }
}
window.transferRouteFinderCircuitToSeatConfig = transferRouteFinderCircuitToSeatConfig;

/**
 * Initialize Circuit Seat Configurator
 */
function initSeatConfigurator() {
  const datalist = document.getElementById('airports_datalist');
  if (datalist && typeof AIRPORTS_DATABASE !== 'undefined') {
    datalist.innerHTML = AIRPORTS_DATABASE.map(a => 
      `<option value="${a.iata}">${a.iata} — ${a.name}, ${a.city} (${a.country})</option>`
    ).join('');
  }

  const aircraftSelect = document.getElementById('sc_aircraft_select');
  if (aircraftSelect && typeof AIRCRAFT_DATABASE !== 'undefined') {
    const byMfr = {};
    AIRCRAFT_DATABASE.forEach(ac => {
      const m = ac.manufacturer || 'Other';
      if (!byMfr[m]) byMfr[m] = [];
      byMfr[m].push(ac);
    });

    let html = '';
    for (const [mfr, list] of Object.entries(byMfr)) {
      html += `<optgroup label="${mfr}">`;
      list.sort((a, b) => b.seats - a.seats).forEach(ac => {
        html += `<option value="${ac.id}">${ac.name} (${ac.seats} seats &bull; ${ac.speed_kmh} km/h &bull; ${ac.range_km.toLocaleString()} km &bull; Cat. ${ac.category})</option>`;
      });
      html += `</optgroup>`;
    }
    aircraftSelect.innerHTML = html;

    const defaultAc = AIRCRAFT_DATABASE.find(a => a.id === 'a320-200') || AIRCRAFT_DATABASE[0];
    if (defaultAc) aircraftSelect.value = defaultAc.id;

    initAircraftModal();
  }

  // Restore saved state or initialize default (starts empty if no saved circuit)
  const restored = restoreSeatConfigFromLocalStorage();
  restoreDropdownStatesFromLocalStorage();
  onCircuitHubChange();
  renderCircuitAll();

  if (typeof updateSavedCircuitsBadge === 'function') updateSavedCircuitsBadge();
  if (typeof updateActiveCircuitIndicator === 'function') updateActiveCircuitIndicator();
}
window.initSeatConfigurator = initSeatConfigurator;

// Attach event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (typeof restoreFromLocalStorage === 'function') {
    restoreFromLocalStorage();
  }
  if (typeof updateAllCalculations === 'function') {
    updateAllCalculations();
  }

  const zeroOutInputs = document.querySelectorAll('#view_zero_out input');
  zeroOutInputs.forEach(input => {
    input.addEventListener('input', () => {
      if (typeof updateAllCalculations === 'function') {
        updateAllCalculations();
      }
    });
  });

  const cargoToggle = document.getElementById('toggle_cargo');
  if (cargoToggle && typeof toggleCargo === 'function') {
    cargoToggle.addEventListener('change', toggleCargo);
  }

  initSeatConfigurator();
  if (typeof updateAuditsBadges === 'function') {
    updateAuditsBadges();
  }

  const savedTab = (typeof localStorage !== 'undefined') ? localStorage.getItem('am_active_tab') : null;
  const hash = window.location.hash;
  const initialTab = hash === '#circuit-finder'
    ? 'circuit-finder'
    : (hash === '#route-finder'
      ? 'route-finder'
      : (hash === '#seat-config'
        ? 'seat-config'
        : (hash === '#zero-out'
          ? 'zero-out'
          : (hash === '#home' ? 'home' : (savedTab || 'home')))));
  switchTab(initialTab);

  window.addEventListener('hashchange', () => {
    const rawHash = (window.location.hash || '').replace('#', '');
    if (['home', 'zero-out', 'seat-config', 'route-finder', 'circuit-finder'].includes(rawHash)) {
      switchTab(rawHash);
    }
  });
});

// Hub change handler
function onCircuitHubChange() {
  const hubInput = document.getElementById('sc_circuit_hub');
  const hubCode = hubInput?.value?.trim().toUpperCase() || 'OSL';
  window.CIRCUIT_HUB = hubCode;

  const airport = findAirport(hubCode);
  const infoEl = document.getElementById('sc_hub_info');
  const badgeEl = document.getElementById('sc_form_hub_badge');

  if (airport && infoEl) {
    infoEl.textContent = `${airport.name}, ${airport.country} (Cat. ${airport.cat})`;
    infoEl.className = 'text-[11px] text-cyan-400 truncate';
  } else if (infoEl) {
    infoEl.textContent = 'Unknown airport code';
    infoEl.className = 'text-[11px] text-rose-400 truncate';
  }

  if (badgeEl) badgeEl.textContent = `From ${hubCode}`;

  if (typeof updateGlobeHubDisplay === 'function') {
    updateGlobeHubDisplay();
  }

  onLegDestinationChange();
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.onCircuitHubChange = onCircuitHubChange;

// Aircraft change handler
function onAircraftSelectChange() {
  const aircraft = getActiveAircraft();
  updateAircraftBadges(aircraft);

  // Recalculate legs duration and 24h flights for the newly selected aircraft
  if (aircraft && aircraft.speed_kmh && window.CIRCUIT_LEGS && window.CIRCUIT_LEGS.length > 0) {
    window.CIRCUIT_LEGS.forEach(leg => {
      if (leg.distanceKm) {
        leg.durationHours = calculateFlightTimeHours(leg.distanceKm, aircraft.speed_kmh);
        leg.durationText = formatHoursMinutes(leg.durationHours);
      }
    });
    autoPopulate24hCircuit();
  }

  onLegDestinationChange();
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.onAircraftSelectChange = onAircraftSelectChange;

function updateAircraftBadges(aircraft) {
  if (!aircraft) return;
  const priceShort = formatAircraftPriceShort(aircraft.price);
  const priceFull = formatCurrency(aircraft.price);

  const catBadge = document.getElementById('sc_aircraft_category_badge');
  const typeBadge = document.getElementById('sc_aircraft_type_badge');
  const priceBadge = document.getElementById('sc_aircraft_price_badge');
  const triggerName = document.getElementById('sc_trigger_plane_name');
  const triggerDetails = document.getElementById('sc_trigger_plane_details');
  const specsSummary = document.getElementById('sc_aircraft_specs_summary');
  const badgeSeats = document.getElementById('sc_badge_seats');
  const badgePayload = document.getElementById('sc_badge_payload');
  const badgePrice = document.getElementById('sc_badge_price');
  const legSpeedRef = document.getElementById('sc_leg_speed_ref');
  const stratName = document.getElementById('sc_strategy_aircraft_name');
  const stratCat = document.getElementById('sc_strategy_aircraft_cat');

  if (catBadge) catBadge.textContent = `Cat. ${aircraft.category}`;
  if (typeBadge) typeBadge.textContent = aircraft.type;
  if (priceBadge) priceBadge.textContent = priceShort;
  if (triggerName) triggerName.textContent = aircraft.name;
  if (triggerDetails) {
    triggerDetails.textContent = `(${aircraft.seats} seats • ${aircraft.speed_kmh} km/h • ${aircraft.range_km.toLocaleString()} km)`;
  }
  if (specsSummary) {
    specsSummary.textContent = `Speed: ${aircraft.speed_kmh} km/h | Range: ${aircraft.range_km.toLocaleString()} km | Seats: ${aircraft.seats} | Payload: ${aircraft.payload_ton}T | Price: ${priceShort} (${priceFull})`;
  }
  if (badgeSeats) badgeSeats.textContent = `${aircraft.seats} seats`;
  if (badgePayload) badgePayload.textContent = `${aircraft.payload_ton} T`;
  if (badgePrice) badgePrice.textContent = priceShort;
  if (legSpeedRef) legSpeedRef.textContent = `@ ${aircraft.speed_kmh} km/h`;
  if (stratName) stratName.textContent = aircraft.name;
  if (stratCat) stratCat.textContent = `Cat. ${aircraft.category}`;
}

// Leg Destination Input Change (Enhanced with Saved Route Audits Auto-fill)
function onLegDestinationChange() {
  const hubCode = document.getElementById('sc_circuit_hub')?.value || window.CIRCUIT_HUB || 'OSL';
  const dstCode = (document.getElementById('sc_leg_dst')?.value || '').trim().toUpperCase();

  const hubAirport = findAirport(hubCode);
  const dstAirport = findAirport(dstCode);

  const infoEl = document.getElementById('sc_leg_dst_info');
  const distInput = document.getElementById('sc_leg_dist_km');
  const manualOverride = document.getElementById('sc_leg_dist_override')?.checked || false;

  // Check for saved route audit for this destination
  let auditMatch = null;
  if (typeof getSavedAudits === 'function' && dstCode) {
    const audits = getSavedAudits();
    auditMatch = audits.find(x => x.dst === dstCode);
  }

  const mode = window.CURRENT_LEG_AUDIT_MODE || 'audited';

  // Toggle group element in Seat Configurator
  const toggleGroup = document.getElementById('sc_audit_basis_toggle_group');
  const btnAudited = document.getElementById('sc_basis_btn_audited');
  const btnRemaining = document.getElementById('sc_basis_btn_remaining');

  if (auditMatch && toggleGroup) {
    toggleGroup.classList.remove('hidden');
    toggleGroup.classList.add('inline-flex');
    if (mode === 'remaining') {
      btnRemaining?.classList.add('bg-amber-600', 'text-white');
      btnRemaining?.classList.remove('text-slate-400');
      btnAudited?.classList.remove('bg-cyan-600', 'text-white');
      btnAudited?.classList.add('text-slate-400');
    } else {
      btnAudited?.classList.add('bg-cyan-600', 'text-white');
      btnAudited?.classList.remove('text-slate-400');
      btnRemaining?.classList.remove('bg-amber-600', 'text-white');
      btnRemaining?.classList.add('text-slate-400');
    }
  } else if (toggleGroup) {
    toggleGroup.classList.add('hidden');
    toggleGroup.classList.remove('inline-flex');
  }

  if (dstAirport && infoEl) {
    if (auditMatch) {
      const tagText = mode === 'remaining' ? '⚡ Remaining (R) Applied' : '⚡ Audited (D) Applied';
      const tagClass = mode === 'remaining' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800';
      infoEl.innerHTML = `${dstAirport.name}, ${dstAirport.country} (Cat. ${dstAirport.cat}) <span class="ml-1.5 px-1.5 py-0.5 rounded ${tagClass} border font-semibold text-[10px]">${tagText}</span>`;
    } else {
      infoEl.textContent = `${dstAirport.name}, ${dstAirport.country} (Cat. ${dstAirport.cat})`;
      infoEl.className = 'text-[11px] text-cyan-400 truncate';
    }
  } else if (infoEl) {
    infoEl.textContent = dstCode ? 'Unknown airport' : 'Select destination airport';
    infoEl.className = 'text-[11px] text-slate-400 truncate';
  }

  if (!manualOverride) {
    if (hubAirport && dstAirport && hubAirport.iata !== dstAirport.iata) {
      const dist = calculateHaversineDistance(hubAirport.lat, hubAirport.lon, dstAirport.lat, dstAirport.lon);
      if (distInput) distInput.value = dist;
    } else {
      if (distInput) distInput.value = '';
    }
  }

  // Auto-populate demands and prices if audit found
  if (auditMatch) {
    const pEco = document.getElementById('sc_leg_price_eco');
    const dEco = document.getElementById('sc_leg_demand_eco');
    const pBus = document.getElementById('sc_leg_price_bus');
    const dBus = document.getElementById('sc_leg_demand_bus');
    const pFirst = document.getElementById('sc_leg_price_first');
    const dFirst = document.getElementById('sc_leg_demand_first');
    const pCargo = document.getElementById('sc_leg_price_cargo');
    const dCargo = document.getElementById('sc_leg_demand_cargo');

    if (pEco && auditMatch.eco) pEco.value = auditMatch.eco.price ?? auditMatch.eco.pAudit ?? '';
    if (pBus && auditMatch.bus) pBus.value = auditMatch.bus.price ?? auditMatch.bus.pAudit ?? '';
    if (pFirst && auditMatch.first) pFirst.value = auditMatch.first.price ?? auditMatch.first.pAudit ?? '';
    if (pCargo && auditMatch.cargo) pCargo.value = auditMatch.cargo.price ?? auditMatch.cargo.pAudit ?? '';

    if (mode === 'remaining') {
      if (dEco && auditMatch.eco) dEco.value = auditMatch.eco.remaining ?? auditMatch.eco.r ?? 0;
      if (dBus && auditMatch.bus) dBus.value = auditMatch.bus.remaining ?? auditMatch.bus.r ?? 0;
      if (dFirst && auditMatch.first) dFirst.value = auditMatch.first.remaining ?? auditMatch.first.r ?? 0;
      if (dCargo && auditMatch.cargo) dCargo.value = auditMatch.cargo.remaining ?? auditMatch.cargo.r ?? 0;
    } else {
      if (dEco && auditMatch.eco) dEco.value = auditMatch.eco.demand ?? auditMatch.eco.dSim ?? '';
      if (dBus && auditMatch.bus) dBus.value = auditMatch.bus.demand ?? auditMatch.bus.dSim ?? '';
      if (dFirst && auditMatch.first) dFirst.value = auditMatch.first.demand ?? auditMatch.first.dSim ?? '';
      if (dCargo && auditMatch.cargo) dCargo.value = auditMatch.cargo.demand ?? auditMatch.cargo.dSim ?? '';
    }
  }

  onLegDistanceChange();
}
window.onLegDestinationChange = onLegDestinationChange;

function setLegDemandBasis(mode) {
  window.CURRENT_LEG_AUDIT_MODE = mode;
  onLegDestinationChange();
  if (typeof showToast === 'function') {
    const label = mode === 'remaining' ? 'Remaining Demand (R)' : 'Audited Demand (D)';
    showToast(`Switched route demands to ${label}`, 'info');
  }
}
window.setLegDemandBasis = setLegDemandBasis;

function toggleLegDistanceOverride() {
  const isOverride = document.getElementById('sc_leg_dist_override')?.checked || false;
  const distInput = document.getElementById('sc_leg_dist_km');
  if (distInput) {
    distInput.readOnly = !isOverride;
    if (isOverride) {
      distInput.focus();
    } else {
      onLegDestinationChange();
    }
  }
}
window.toggleLegDistanceOverride = toggleLegDistanceOverride;

function onLegDistanceChange() {
  const dist = parseFloat(document.getElementById('sc_leg_dist_km')?.value) || 0;
  const aircraft = getActiveAircraft();
  const speed = aircraft?.speed_kmh || 800;
  const rangeStatus = document.getElementById('sc_leg_range_status');

  if (aircraft && dist > 0) {
    if (dist > aircraft.range_km) {
      if (rangeStatus) {
        rangeStatus.textContent = `⚠️ Exceeds Aircraft Range (${dist.toLocaleString()} > ${aircraft.range_km.toLocaleString()} km)`;
        rangeStatus.className = 'text-[11px] text-amber-400 font-semibold truncate';
      }
    } else {
      const pct = ((dist / aircraft.range_km) * 100).toFixed(0);
      if (rangeStatus) {
        rangeStatus.textContent = `Range OK (${pct}% of capacity)`;
        rangeStatus.className = 'text-[11px] text-emerald-400 truncate';
      }
    }
  } else if (rangeStatus) {
    rangeStatus.textContent = 'Enter route destination';
    rangeStatus.className = 'text-[11px] text-slate-400 truncate';
  }

  const editingLegId = document.getElementById('sc_editing_leg_id')?.value;
  if (!editingLegId) {
    const flightHours = calculateFlightTimeHours(dist, speed);
    const h = Math.floor(flightHours);
    const m = Math.round((flightHours - h) * 60);
    const hInput = document.getElementById('sc_leg_dur_hours');
    const mInput = document.getElementById('sc_leg_dur_mins');
    if (hInput) hInput.value = dist > 0 ? h : '';
    if (mInput) mInput.value = dist > 0 ? m : '';
  }
}
window.onLegDistanceChange = onLegDistanceChange;

function onLegDurationManualChange() {}
window.onLegDurationManualChange = onLegDurationManualChange;

function toggleLegCargo() {
  const enabled = document.getElementById('sc_leg_cargo_enabled')?.checked !== false;
  const container = document.getElementById('sc_leg_cargo_container');
  if (container) {
    if (enabled) container.classList.remove('opacity-40', 'pointer-events-none');
    else container.classList.add('opacity-40', 'pointer-events-none');
  }
}
window.toggleLegCargo = toggleLegCargo;

/**
 * Add or Update Leg in Circuit
 */
function addOrUpdateLeg() {
  const hubCode = document.getElementById('sc_circuit_hub')?.value?.trim().toUpperCase() || window.CIRCUIT_HUB || 'OSL';
  const dstCode = document.getElementById('sc_leg_dst')?.value?.trim().toUpperCase() || '';

  if (!dstCode) {
    showToast('Please enter a destination airport code');
    document.getElementById('sc_leg_dst')?.focus();
    return;
  }
  if (dstCode === hubCode) {
    showToast('Destination airport cannot be the same as the Hub airport');
    return;
  }

  const dstAirport = findAirport(dstCode);
  const distanceKm = parseFloat(document.getElementById('sc_leg_dist_km')?.value) || 0;

  const h = parseInt(document.getElementById('sc_leg_dur_hours')?.value) || 0;
  const m = parseInt(document.getElementById('sc_leg_dur_mins')?.value) || 0;
  let durationHours = h + (m / 60);
  if (durationHours <= 0) {
    const aircraft = getActiveAircraft();
    durationHours = calculateFlightTimeHours(distanceKm, aircraft?.speed_kmh || 800);
  }

  const cargoEnabled = document.getElementById('sc_leg_cargo_enabled')?.checked !== false;

  const dEco = parseFloat(document.getElementById('sc_leg_demand_eco')?.value) || 0;
  const pEco = parseFloat(document.getElementById('sc_leg_price_eco')?.value) || 0;
  const dBus = parseFloat(document.getElementById('sc_leg_demand_bus')?.value) || 0;
  const pBus = parseFloat(document.getElementById('sc_leg_price_bus')?.value) || 0;
  const dFirst = parseFloat(document.getElementById('sc_leg_demand_first')?.value) || 0;
  const pFirst = parseFloat(document.getElementById('sc_leg_price_first')?.value) || 0;
  const dCargo = cargoEnabled ? (parseFloat(document.getElementById('sc_leg_demand_cargo')?.value) || 0) : 0;
  const pCargo = cargoEnabled ? (parseFloat(document.getElementById('sc_leg_price_cargo')?.value) || 0) : 0;

  const editingLegId = document.getElementById('sc_editing_leg_id')?.value;

  if (editingLegId) {
    const leg = window.CIRCUIT_LEGS.find(l => l.id === editingLegId);
    if (leg) {
      leg.dst = dstCode;
      leg.dstAirport = dstAirport;
      leg.distanceKm = distanceKm;
      leg.durationHours = durationHours;
      leg.durationText = formatHoursMinutes(durationHours);
      leg.cargoEnabled = cargoEnabled;
      leg.demand = { eco: dEco, bus: dBus, first: dFirst, cargo: dCargo };
      leg.prices = { eco: pEco, bus: pBus, first: pFirst, cargo: pCargo };
    }
    cancelLegEdit();
    autoPopulate24hCircuit();
    showToast(`Updated route ${hubCode} ✈ ${dstCode}`);
  } else {
    const colorIdx = window.CIRCUIT_LEGS.length % CIRCUIT_COLORS.length;
    const newLeg = {
      id: 'leg-' + Math.random().toString(36).substr(2, 9),
      hub: hubCode,
      dst: dstCode,
      dstAirport: dstAirport,
      distanceKm: distanceKm,
      durationHours: durationHours,
      durationText: formatHoursMinutes(durationHours),
      flightsPerDay: 1, // Will be auto-populated for 24h
      cargoEnabled: cargoEnabled,
      demand: { eco: dEco, bus: dBus, first: dFirst, cargo: dCargo },
      prices: { eco: pEco, bus: pBus, first: pFirst, cargo: pCargo },
      demandBasis: window.CURRENT_LEG_AUDIT_MODE || 'audited',
      color: CIRCUIT_COLORS[colorIdx]
    };
    window.CIRCUIT_LEGS.push(newLeg);

    // Auto-populate repetition for 24h circuits (Point 1)
    autoPopulate24hCircuit();

    showToast(`Added ${hubCode} ✈ ${dstCode} (${newLeg.durationText}) to circuit`);

    document.getElementById('sc_leg_dst').value = '';
    document.getElementById('sc_leg_dist_km').value = '';
    document.getElementById('sc_leg_dur_hours').value = '';
    document.getElementById('sc_leg_dur_mins').value = '';
    document.getElementById('sc_leg_demand_eco').value = '';
    document.getElementById('sc_leg_price_eco').value = '';
    document.getElementById('sc_leg_demand_bus').value = '';
    document.getElementById('sc_leg_price_bus').value = '';
    document.getElementById('sc_leg_demand_first').value = '';
    document.getElementById('sc_leg_price_first').value = '';
    document.getElementById('sc_leg_demand_cargo').value = '';
    document.getElementById('sc_leg_price_cargo').value = '';
    window.CURRENT_LEG_AUDIT_MODE = 'audited';
    onLegDestinationChange();
  }

  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.addOrUpdateLeg = addOrUpdateLeg;

function editLeg(id) {
  const leg = window.CIRCUIT_LEGS.find(l => l.id === id);
  if (!leg) return;

  document.getElementById('sc_editing_leg_id').value = leg.id;
  document.getElementById('sc_leg_form_title').textContent = `✏️ Edit Route: ${leg.hub} ✈ ${leg.dst}`;
  document.getElementById('sc_add_leg_btn_label').textContent = 'Update Route in Circuit';
  document.getElementById('sc_cancel_edit_btn')?.classList.remove('hidden');

  document.getElementById('sc_leg_dst').value = leg.dst;
  document.getElementById('sc_leg_dist_km').value = leg.distanceKm;

  const h = Math.floor(leg.durationHours);
  const m = Math.round((leg.durationHours - h) * 60);
  document.getElementById('sc_leg_dur_hours').value = h;
  document.getElementById('sc_leg_dur_mins').value = m;

  const cargoToggle = document.getElementById('sc_leg_cargo_enabled');
  if (cargoToggle) cargoToggle.checked = leg.cargoEnabled !== false;
  toggleLegCargo();

  document.getElementById('sc_leg_demand_eco').value = leg.demand.eco || '';
  document.getElementById('sc_leg_price_eco').value = leg.prices.eco || '';
  document.getElementById('sc_leg_demand_bus').value = leg.demand.bus || '';
  document.getElementById('sc_leg_price_bus').value = leg.prices.bus || '';
  document.getElementById('sc_leg_demand_first').value = leg.demand.first || '';
  document.getElementById('sc_leg_price_first').value = leg.prices.first || '';
  document.getElementById('sc_leg_demand_cargo').value = leg.demand.cargo || '';
  document.getElementById('sc_leg_price_cargo').value = leg.prices.cargo || '';

  onLegDestinationChange();
  document.getElementById('sc_leg_form_title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
window.editLeg = editLeg;

function cancelLegEdit() {
  document.getElementById('sc_editing_leg_id').value = '';
  document.getElementById('sc_leg_form_title').textContent = '➕ Add Route to Circuit';
  document.getElementById('sc_add_leg_btn_label').textContent = 'Add Route to Circuit';
  document.getElementById('sc_cancel_edit_btn')?.classList.add('hidden');

  document.getElementById('sc_leg_dst').value = '';
  document.getElementById('sc_leg_dist_km').value = '';
  document.getElementById('sc_leg_dur_hours').value = '';
  document.getElementById('sc_leg_dur_mins').value = '';
  document.getElementById('sc_leg_demand_eco').value = '';
  document.getElementById('sc_leg_price_eco').value = '';
  document.getElementById('sc_leg_demand_bus').value = '';
  document.getElementById('sc_leg_price_bus').value = '';
  document.getElementById('sc_leg_demand_first').value = '';
  document.getElementById('sc_leg_price_first').value = '';
  document.getElementById('sc_leg_demand_cargo').value = '';
  document.getElementById('sc_leg_price_cargo').value = '';
  onLegDestinationChange();
}
window.cancelLegEdit = cancelLegEdit;

function clearLegForm() {
  cancelLegEdit();
  window.CURRENT_LEG_AUDIT_MODE = 'audited';
  const distOverride = document.getElementById('sc_leg_dist_override');
  if (distOverride && distOverride.checked) {
    distOverride.checked = false;
    if (typeof toggleLegDistanceOverride === 'function') toggleLegDistanceOverride();
  }
  const dstInput = document.getElementById('sc_leg_dst');
  if (dstInput) dstInput.focus();
  if (typeof showToast === 'function') {
    showToast('Route form fields cleared', 'info');
  }
}
window.clearLegForm = clearLegForm;

function deleteLeg(id) {
  const idx = window.CIRCUIT_LEGS.findIndex(l => l.id === id);
  if (idx !== -1) {
    const removed = window.CIRCUIT_LEGS.splice(idx, 1)[0];
    showToast(`Removed ${removed.hub} ✈ ${removed.dst}`);
    window.CIRCUIT_LEGS.forEach((l, i) => {
      l.color = CIRCUIT_COLORS[i % CIRCUIT_COLORS.length];
    });
    autoPopulate24hCircuit();
    renderCircuitAll();
    saveSeatConfigToLocalStorage();
  }
}
window.deleteLeg = deleteLeg;

function clearAllLegs() {
  if (!window.CIRCUIT_LEGS || window.CIRCUIT_LEGS.length === 0) {
    showToast('Circuit is already empty', 'info');
    return;
  }
  window.CIRCUIT_LEGS = [];
  window.CURRENT_SAVED_CIRCUIT_ID = null;
  window.CURRENT_SAVED_CIRCUIT_NAME = null;
  cancelLegEdit();
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
  showToast('Circuit cleared', 'info');
}
window.clearAllLegs = clearAllLegs;

function moveLegUp(idx) {
  if (idx <= 0 || idx >= window.CIRCUIT_LEGS.length) return;
  const temp = window.CIRCUIT_LEGS[idx];
  window.CIRCUIT_LEGS[idx] = window.CIRCUIT_LEGS[idx - 1];
  window.CIRCUIT_LEGS[idx - 1] = temp;
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.moveLegUp = moveLegUp;

function moveLegDown(idx) {
  if (idx < 0 || idx >= window.CIRCUIT_LEGS.length - 1) return;
  const temp = window.CIRCUIT_LEGS[idx];
  window.CIRCUIT_LEGS[idx] = window.CIRCUIT_LEGS[idx + 1];
  window.CIRCUIT_LEGS[idx + 1] = temp;
  renderCircuitAll();
  saveSeatConfigToLocalStorage();
}
window.moveLegDown = moveLegDown;

// --- HTML5 Drag and Drop Handlers ---
window.draggedLegIndex = null;

function handleLegDragStart(e, idx) {
  window.draggedLegIndex = idx;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', idx);
  const target = e.currentTarget;
  setTimeout(() => target.classList.add('dragging'), 10);
}
window.handleLegDragStart = handleLegDragStart;

function handleLegDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const item = e.currentTarget.closest('.circuit-leg-item');
  if (item && !item.classList.contains('drag-over')) {
    document.querySelectorAll('.circuit-leg-item').forEach(el => el.classList.remove('drag-over'));
    item.classList.add('drag-over');
  }
}
window.handleLegDragOver = handleLegDragOver;

function handleLegDrop(e, targetIdx) {
  e.preventDefault();
  const sourceIdx = window.draggedLegIndex;
  document.querySelectorAll('.circuit-leg-item').forEach(el => {
    el.classList.remove('dragging');
    el.classList.remove('drag-over');
  });

  if (sourceIdx === null || sourceIdx === undefined || sourceIdx === targetIdx) return;

  const moved = window.CIRCUIT_LEGS.splice(sourceIdx, 1)[0];
  window.CIRCUIT_LEGS.splice(targetIdx, 0, moved);
  window.draggedLegIndex = null;

  renderCircuitAll();
  saveSeatConfigToLocalStorage();
  showToast('Reordered circuit rotation sequence');
}
window.handleLegDrop = handleLegDrop;

function handleLegDragEnd(e) {
  window.draggedLegIndex = null;
  document.querySelectorAll('.circuit-leg-item').forEach(el => {
    el.classList.remove('dragging');
    el.classList.remove('drag-over');
  });
}
window.handleLegDragEnd = handleLegDragEnd;

/**
 * Render Circuit Legs Table (with Point 1: Flights per Day for 24h circuits)
 */
function renderCircuitTable() {
  const container = document.getElementById('sc_circuit_table_container');
  const countBadge = document.getElementById('circuit_legs_count_badge');
  const legs = window.CIRCUIT_LEGS || [];
  const stats = detectCircuitStats();

  if (countBadge) countBadge.textContent = `${legs.length} ${legs.length === 1 ? 'route' : 'routes'}`;

  if (!container) return;

  if (legs.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-6 rounded-xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
        <div class="text-2xl">🗺️</div>
        <div class="font-bold text-white">No routes added to circuit yet</div>
        <p>Enter a destination airport above and click <strong class="text-cyan-400">Add Route to Circuit</strong>, or load an example below.</p>
      </div>
    `;
    return;
  }

  let html = `<div class="space-y-2">`;
  legs.forEach((leg, idx) => {
    const dstAp = leg.dstAirport || findAirport(leg.dst);
    const flag = getCountryFlag(dstAp?.country);
    const cat = dstAp ? `Cat. ${dstAp.cat}` : 'Cat. —';
    const city = dstAp ? `${dstAp.city}, ${dstAp.country}` : leg.dst;
    const flights = leg.flightsPerDay || 1;
    const totalLegTime = formatHoursMinutes(leg.durationHours * flights);

    html += `
      <div class="circuit-leg-item glass-card p-3 rounded-xl border border-slate-800 hover:border-slate-700/80 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
           draggable="true"
           ondragstart="handleLegDragStart(event, ${idx})"
           ondragover="handleLegDragOver(event)"
           ondrop="handleLegDrop(event, ${idx})"
           ondragend="handleLegDragEnd(event)">
        
        <!-- Left: Grip Handle & Route Info -->
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="cursor-grab hover:text-cyan-400 text-slate-500 font-mono text-base px-1 shrink-0" title="Drag to reorder rotation sequence">
            ⋮⋮
          </div>
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono-num text-white shrink-0 shadow"
                style="background-color: ${leg.color};">
            ${idx + 1}
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>${leg.hub}</span>
                <span class="text-cyan-400 text-xs">✈</span>
                <span>${leg.dst}</span>
                <span class="text-sm">${flag}</span>
              </span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">${cat}</span>
              <span class="text-[11px] text-cyan-300 font-mono font-bold">${leg.durationText} RT</span>
              <span class="text-[11px] text-slate-400 font-mono">(${leg.distanceKm.toLocaleString()} km)</span>
            </div>
            <div class="text-[10px] text-slate-400 truncate">
              ${city}
            </div>
          </div>
        </div>

        <!-- Middle: 24h Repetition Flights Control (Point 1) & Demand Pills -->
        ${stats.type === '24h' ? `
          <div class="flex flex-col items-start gap-1.5 text-[11px] font-mono-num">
            <!-- Top: Flights/Day Chooser -->
            <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300">
              <span class="text-[10px] text-slate-400 font-sans font-medium">Flights/Day:</span>
              <button type="button" onclick="updateLegFlights(${idx}, -1)" class="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold" title="Decrease flights per day">-</button>
              <span class="font-bold text-white px-1">${flights}×</span>
              <button type="button" onclick="updateLegFlights(${idx}, 1)" class="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs font-bold" title="Increase flights per day">+</button>
              <span class="text-[10px] text-cyan-400 ml-1">(${totalLegTime})</span>
            </div>

            <!-- Bottom: Demand & Price of Seats & Cargo -->
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300" title="Daily Demand: ${leg.demand.eco} @ $${leg.prices.eco}">
                💺 ${leg.demand.eco} <span class="opacity-60">($${leg.prices.eco})</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300" title="Daily Demand: ${leg.demand.bus} @ $${leg.prices.bus}">
                💼 ${leg.demand.bus} <span class="opacity-60">($${leg.prices.bus})</span>
              </span>
              <span class="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300" title="Daily Demand: ${leg.demand.first} @ $${leg.prices.first}">
                👑 ${leg.demand.first} <span class="opacity-60">($${leg.prices.first})</span>
              </span>
              ${leg.cargoEnabled ? `
                <span class="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300" title="Daily Demand: ${leg.demand.cargo}T @ $${leg.prices.cargo}/T">
                  📦 ${leg.demand.cargo}T <span class="opacity-60">($${leg.prices.cargo})</span>
                </span>
              ` : '<span class="text-[10px] text-slate-500 font-sans px-1">No Cargo</span>'}
            </div>
          </div>
        ` : `
          <div class="flex flex-wrap items-center gap-1.5 text-[11px] font-mono-num">
            <span class="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300" title="Daily Demand: ${leg.demand.eco} @ $${leg.prices.eco}">
              💺 ${leg.demand.eco} <span class="opacity-60">($${leg.prices.eco})</span>
            </span>
            <span class="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300" title="Daily Demand: ${leg.demand.bus} @ $${leg.prices.bus}">
              💼 ${leg.demand.bus} <span class="opacity-60">($${leg.prices.bus})</span>
            </span>
            <span class="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300" title="Daily Demand: ${leg.demand.first} @ $${leg.prices.first}">
              👑 ${leg.demand.first} <span class="opacity-60">($${leg.prices.first})</span>
            </span>
            ${leg.cargoEnabled ? `
              <span class="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300" title="Daily Demand: ${leg.demand.cargo}T @ $${leg.prices.cargo}/T">
                📦 ${leg.demand.cargo}T <span class="opacity-60">($${leg.prices.cargo})</span>
              </span>
            ` : '<span class="text-[10px] text-slate-500 font-sans px-1">No Cargo</span>'}
          </div>
        `}

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button onclick="moveLegUp(${idx})" type="button" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs disabled:opacity-30" ${idx === 0 ? 'disabled' : ''} title="Move Up in Rotation">
            ▲
          </button>
          <button onclick="moveLegDown(${idx})" type="button" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs disabled:opacity-30" ${idx === legs.length - 1 ? 'disabled' : ''} title="Move Down in Rotation">
            ▼
          </button>
          <button onclick="editLeg('${leg.id}')" type="button" class="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1" title="Edit Route Demand & Distance">
            <span>✏️</span>
            <span class="hidden sm:inline">Edit</span>
          </button>
          <button onclick="deleteLeg('${leg.id}')" type="button" class="p-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-xs border border-slate-700" title="Remove Route from Circuit">
            🗑️
          </button>
        </div>

      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

/**
 * Render In-Game Style Visual Timeline Schedule (with Point 1: Repeated Flights for 24h)
 */
function renderCircuitSchedule() {
  const stats = detectCircuitStats();
  const legs = window.CIRCUIT_LEGS || [];
  const aircraft = getActiveAircraft();
  const activePlan = window.ACTIVE_FLEET_PLAN;

  const headerTypeBadge = document.getElementById('sched_header_type_badge');
  const timeUsedEl = document.getElementById('sched_time_used');
  const timeTargetEl = document.getElementById('sched_time_target');
  const remainingEl = document.getElementById('sched_header_remaining');

  if (headerTypeBadge) {
    if (stats.type === '24h') {
      headerTypeBadge.textContent = '⚡ 24h Circuit';
      headerTypeBadge.className = 'px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold';
    } else if (stats.type === '168h') {
      headerTypeBadge.textContent = '🌐 168h Circuit (7-Day Rotation)';
      headerTypeBadge.className = 'px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold';
    } else {
      headerTypeBadge.textContent = 'No Routes';
      headerTypeBadge.className = 'px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 text-[10px]';
    }
  }

  if (timeUsedEl) timeUsedEl.textContent = stats.totalHoursFormatted;
  if (timeTargetEl) timeTargetEl.textContent = `${stats.targetHours}h`;
  if (remainingEl) {
    if (stats.isOverTime) {
      remainingEl.textContent = `⚠️ Over: +${formatHoursMinutes(stats.totalHours - stats.targetHours)}`;
      remainingEl.className = 'text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold';
    } else {
      remainingEl.textContent = `Free: ${stats.freeHoursFormatted}`;
      remainingEl.className = 'text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700';
    }
  }

  const daysContainer = document.getElementById('circuit_timeline_days_container');
  if (!daysContainer) return;

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let daysHtml = '';

  dayNames.forEach((dayName, dayIdx) => {
    let guideLinesHtml = '';
    for (let h = 1; h < 24; h++) {
      guideLinesHtml += `<div class="timeline-hour-guide" style="left: ${(h / 24) * 100}%"></div>`;
    }

    let flightBlocksHtml = '';

    if (legs.length > 0) {
      if (stats.type === '24h') {
        // Build repeated flights schedule for 24h circuit (Point 1)
        // Expand flights based on leg.flightsPerDay
        const dailySchedule = [];
        // Sequential cycle interleaving
        let maxFlights = Math.max(...legs.map(l => l.flightsPerDay || 1));
        for (let f = 0; f < maxFlights; f++) {
          legs.forEach(leg => {
            if (f < (leg.flightsPerDay || 1)) {
              dailySchedule.push(leg);
            }
          });
        }

        let curTime = 0;
        dailySchedule.forEach(leg => {
          const dur = leg.durationHours || 0;
          const start = curTime;
          const end = curTime + dur;
          curTime = end;

          const leftPct = (start / 24) * 100;
          const widthPct = Math.min(100 - leftPct, (dur / 24) * 100);

          if (widthPct > 0) {
            const flag = getCountryFlag(leg.dstAirport?.country);
            flightBlocksHtml += `
              <div class="timeline-flight-block"
                   style="left: ${leftPct}%; width: ${widthPct}%; background-color: ${leg.color};"
                   title="${leg.hub} ✈ ${leg.dst} (${leg.durationText})">
                <span class="truncate">${leg.hub}/${leg.dst}</span>
                <span class="text-[10px] hidden sm:inline">${flag}</span>
                ${widthPct >= 14 ? `<span class="text-[9px] opacity-80 font-mono hidden md:inline">${leg.durationText}</span>` : ''}
              </div>
            `;
          }
        });

      } else {
        // 168h circuit: continuous weekly rotation across all 7 days
        const dayStart = 24 * dayIdx;
        const dayEnd = 24 * (dayIdx + 1);

        let curTime = 0;
        legs.forEach(leg => {
          const dur = leg.durationHours || 0;
          const routeStart = curTime;
          const routeEnd = curTime + dur;
          curTime = routeEnd;

          const segStart = Math.max(dayStart, routeStart);
          const segEnd = Math.min(dayEnd, routeEnd);

          if (segStart < segEnd) {
            const leftPct = ((segStart - dayStart) / 24) * 100;
            const widthPct = ((segEnd - segStart) / 24) * 100;
            const flag = getCountryFlag(leg.dstAirport?.country);
            const isContinuation = routeStart < dayStart;
            const willContinue = routeEnd > dayEnd;

            flightBlocksHtml += `
              <div class="timeline-flight-block"
                   style="left: ${leftPct}%; width: ${widthPct}%; background-color: ${leg.color};"
                   title="${leg.hub} ✈ ${leg.dst} (${leg.durationText} total RT)">
                ${isContinuation ? '<span class="text-[9px] opacity-70">&larr;</span>' : ''}
                <span class="truncate">${leg.hub}/${leg.dst}</span>
                <span class="text-[10px] hidden sm:inline">${flag}</span>
                ${widthPct >= 18 ? `<span class="text-[9px] opacity-80 font-mono hidden md:inline">${leg.durationText}</span>` : ''}
                ${willContinue ? '<span class="text-[9px] opacity-70">&rarr;</span>' : ''}
              </div>
            `;
          }
        });
      }
    }

    daysHtml += `
      <div class="grid grid-cols-25 gap-0 items-center">
        <div class="text-xs font-mono font-bold text-slate-400 text-center">${dayName}</div>
        <div class="col-span-24 timeline-day-track">
          ${guideLinesHtml}
          ${flightBlocksHtml}
        </div>
      </div>
    `;
  });

  daysContainer.innerHTML = daysHtml;

  const legendRoutesEl = document.getElementById('circuit_legend_routes');
  if (legendRoutesEl) {
    if (legs.length === 0) {
      legendRoutesEl.innerHTML = '<span class="text-slate-500 italic">No routes in schedule</span>';
    } else {
      legendRoutesEl.innerHTML = legs.map((leg, i) => `
        <div class="flex items-center gap-1.5 font-mono-num text-slate-300">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${leg.color};"></span>
          <strong class="text-white">${leg.hub}/${leg.dst}</strong>
          <span class="text-[10px] text-slate-400">${leg.durationText}${stats.type === '24h' ? ` (${leg.flightsPerDay || 1}×)` : ''}</span>
        </div>
      `).join('');
    }
  }
}

/**
 * Render Circuit Summary Header Status
 */
function renderCircuitStatus() {
  const stats = detectCircuitStats();
  const activePlan = window.ACTIVE_FLEET_PLAN;

  const typeEl = document.getElementById('circuit_stat_type');
  const durEl = document.getElementById('circuit_stat_duration');
  const fleetEl = document.getElementById('circuit_stat_fleet_size');
  const warnEl = document.getElementById('circuit_range_warning');
  const headerBadge = document.getElementById('circuit_type_header_badge');

  if (typeEl) {
    if (stats.type === '24h') typeEl.textContent = '24h Circuit';
    else if (stats.type === '168h') typeEl.textContent = '168h Circuit';
    else typeEl.textContent = 'Empty';
  }

  if (durEl) {
    durEl.textContent = stats.totalHoursFormatted;
  }

  if (fleetEl) {
    const totalPlanes = activePlan ? activePlan.totalPlanes : 0;
    fleetEl.textContent = `${totalPlanes} ${totalPlanes === 1 ? 'plane' : 'planes'}`;
  }

  if (headerBadge) {
    if (stats.type === '24h') {
      headerBadge.textContent = '⚡ 24h Circuit';
      headerBadge.className = 'text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold';
    } else if (stats.type === '168h') {
      headerBadge.textContent = '🌐 168h Circuit';
      headerBadge.className = 'text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold';
    } else {
      headerBadge.textContent = 'Multi-Route Circuit';
      headerBadge.className = 'text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    }
  }

  if (warnEl) {
    const aircraft = getActiveAircraft();
    if (stats.legsCount === 0) {
      warnEl.textContent = 'Add routes from this hub to form a circuit';
      warnEl.className = 'text-[11px] text-slate-400 truncate';
    } else if (stats.rangeWarning) {
      warnEl.textContent = `⚠️ Exceeds Range: Longest leg (${stats.maxLegDist.toLocaleString()} km) > ${aircraft.name} range (${aircraft.range_km.toLocaleString()} km)`;
      warnEl.className = 'text-[11px] text-amber-400 font-semibold truncate';
    } else if (stats.categoryWarning) {
      warnEl.textContent = `⚠️ Category Limit: Aircraft (${aircraft.name}, Cat. ${aircraft.category}) exceeds airport runway limit (Cat. ${stats.minAirportCat})`;
      warnEl.className = 'text-[11px] text-amber-400 font-semibold truncate';
    } else if (stats.isOverTime) {
      warnEl.textContent = `⚠️ Exceeds Target: Duration (${stats.totalHoursFormatted}) > ${stats.targetHours}h`;
      warnEl.className = 'text-[11px] text-rose-400 font-semibold truncate';
    } else {
      warnEl.textContent = `✓ Circuit Valid • ${stats.freeHoursFormatted} free turnaround • ${aircraft ? aircraft.name : ''}`;
      warnEl.className = 'text-[11px] text-emerald-400 truncate';
    }
  }
}

/**
 * Full Circuit Render
 */
function renderCircuitAll() {
  recalculateCircuitConfigurations();
  renderCircuitStatus();
  renderCircuitTable();
  renderCircuitSchedule();
  renderActivePlanDetails();
  renderFinancialOverview();
  if (typeof sc_comparatorOpen !== 'undefined' && sc_comparatorOpen) {
    renderSeatConfigComparator();
  }
}

/**
 * Unified Fleet Sizing & Stacking Engine
 * Evaluates optimal cabin seating, fleet sizing, and circuit financials.
 * Strategy selection rule:
 * - If 1 Route and 24h circuit -> use estimation from Zero Empty Seats mode (strict bottleneck capping).
 * - If multi route and 24h or 168h circuit -> use Maximum Profit estimation (balanced knapsack yield).
 */
function calculateFleetPlanForAircraft(aircraft, legs, strategyOverride = null) {
  if (!aircraft || !legs || legs.length === 0) {
    return {
      aircraft,
      strategy: 'max_profit',
      is168h: false,
      planesPerUnit: 1,
      totalUnits: 0,
      totalPlanes: 0,
      reqFleet: 0,
      totalFleetCost: 0,
      fleetCost: 0,
      fleetDailyRev: 0,
      dailyRev: 0,
      fleetWeeklyRev: 0,
      fleetMaxDailyRev: 0,
      fleetMaxWeeklyRev: 0,
      fleetDailyPaxUnmetLoss: 0,
      fleetDailyCargoUnmetLoss: 0,
      fleetDailyTotalUnmetLoss: 0,
      fleetDailyPaxEmptyLoss: 0,
      fleetDailyCargoEmptyLoss: 0,
      fleetDailyTotalEmptyLoss: 0,
      totalDurHours: 0,
      targetHours: 24,
      fitsSchedule: true,
      freeHours: 24,
      overHours: 0,
      costPerSeat: aircraft ? Math.round((aircraft.price || 0) / (aircraft.seats || 1)) : 0,
      meetsRange: true,
      meetsRunways: true,
      meetsHubCat: true,
      isCompatible: true,
      configuredUnits: [],
      stackedGroups: [],
      routeResults: [],
      paxFillRate: '100.0',
      cargoFillRate: '100.0',
      circuitLoadFactor: '100.0',
      overallCoveragePct: '100.0',
      paybackDays: 0
    };
  }

  const hubAirport = typeof findAirport === 'function' ? findAirport(window.CIRCUIT_HUB || 'OSL') : null;
  const hubCat = hubAirport ? hubAirport.cat : 10;

  let baseSingleSum = 0;
  let maxLegDist = 0;
  let meetsRunways = true;

  legs.forEach(l => {
    const dist = l.distanceKm || (hubAirport && l.dstAirport ? calculateHaversineDistance(hubAirport.lat, hubAirport.lon, l.dstAirport.lat, l.dstAirport.lon) : 0);
    if (dist > maxLegDist) maxLegDist = dist;
    const dur = calculateFlightTimeHours(dist, aircraft.speed_kmh || 800);
    baseSingleSum += dur;

    const dstAp = l.dstAirport || (typeof findAirport === 'function' ? findAirport(l.dst) : null);
    if (dstAp && dstAp.cat < (aircraft.category || 1)) {
      meetsRunways = false;
    }
  });

  const is168h = baseSingleSum > 28;
  const targetHours = is168h ? 168 : 24;
  const planesPerUnit = is168h ? 7 : 1;

  const getEffectiveLegFlights = (l, dur) => {
    if (is168h) return 1;
    if (legs.length === 1) {
      const maxFit = dur > 0 ? Math.max(1, Math.floor(24 / dur)) : 1;
      if (l.flightsPerDay && l.flightsPerDay <= maxFit) {
        return l.flightsPerDay;
      }
      return maxFit;
    }
    return l.flightsPerDay || 1;
  };

  let totalDurHours = 0;
  legs.forEach(l => {
    const dist = l.distanceKm || (hubAirport && l.dstAirport ? calculateHaversineDistance(hubAirport.lat, hubAirport.lon, l.dstAirport.lat, l.dstAirport.lon) : 0);
    const dur = calculateFlightTimeHours(dist, aircraft.speed_kmh || 800);
    const flights = getEffectiveLegFlights(l, dur);
    totalDurHours += (dur * flights);
  });

  const meetsRange = maxLegDist <= (aircraft.range_km || 15000);
  const meetsHubCat = hubCat >= (aircraft.category || 1);
  const isCompatible = meetsRange && meetsRunways && meetsHubCat;
  const fitsSchedule = totalDurHours <= (targetHours + 0.01);
  const freeHours = Math.max(0, targetHours - totalDurHours);
  const overHours = Math.max(0, totalDurHours - targetHours);
  const costPerSeat = Math.round((aircraft.price || 0) / (aircraft.seats || 1));

  // Determine effective strategy by user rule:
  // If 1 Route and 24h circuit use estimation from Zero Empty Seats mode.
  // If multi route and 24h or 168h circuit, then use max profit estimation.
  const effectiveStrategy = strategyOverride || ((legs.length === 1 && !is168h) ? 'zero_empty' : 'max_profit');

  const maxSeats = aircraft.seats || 0;
  const maxPayload = aircraft.payload_ton || (maxSeats * 0.1);

  const remDemand = legs.map(l => {
    const dist = l.distanceKm || (hubAirport && l.dstAirport ? calculateHaversineDistance(hubAirport.lat, hubAirport.lon, l.dstAirport.lat, l.dstAirport.lon) : 0);
    const dur = calculateFlightTimeHours(dist, aircraft.speed_kmh || 800);
    const flights = getEffectiveLegFlights(l, dur);
    return {
      leg: l,
      flights,
      remY: l.demand?.eco || 0,
      remJ: l.demand?.bus || 0,
      remF: l.demand?.first || 0,
      remC: l.cargoEnabled ? (l.demand?.cargo || 0) : 0
    };
  });

  const configuredUnits = [];
  const maxIterations = 50;
  let iter = 0;

  if (effectiveStrategy === 'zero_empty') {
    while (iter < maxIterations) {
      iter++;
      let availY = Infinity, availJ = Infinity, availF = Infinity;
      remDemand.forEach(rd => {
        const numRT = rd.flights;
        availY = Math.min(availY, Math.floor(rd.remY / (2 * numRT)));
        availJ = Math.min(availJ, Math.floor(rd.remJ / (2 * numRT)));
        availF = Math.min(availF, Math.floor(rd.remF / (2 * numRT)));
      });

      if (availY <= 0 && availJ <= 0 && availF <= 0) break;

      let spaceUnitsLeft = Math.round(maxSeats * 10);
      let weightLeftKg = Math.round(maxPayload * 1000);

      const firstSeats = Math.max(0, Math.min(availF, Math.floor(spaceUnitsLeft / 42), Math.floor(weightLeftKg / 150)));
      spaceUnitsLeft -= (firstSeats * 42);
      weightLeftKg -= (firstSeats * 150);

      const busSeats = Math.max(0, Math.min(availJ, Math.floor(spaceUnitsLeft / 18), Math.floor(weightLeftKg / 125)));
      spaceUnitsLeft -= (busSeats * 18);
      weightLeftKg -= (busSeats * 125);

      const ecoSeats = Math.max(0, Math.min(availY, Math.floor(spaceUnitsLeft / 10), Math.floor(weightLeftKg / 100)));
      spaceUnitsLeft -= (ecoSeats * 10);
      weightLeftKg -= (ecoSeats * 100);

      if (firstSeats === 0 && busSeats === 0 && ecoSeats === 0) break;

      const cargoTons = Math.max(0, Math.floor(weightLeftKg / 1000));
      const spaceUsedVal = Number(((firstSeats * 4.2) + (busSeats * 1.8) + (ecoSeats * 1.0)).toFixed(1));
      const weightUsedVal = Number(((ecoSeats * 0.10) + (busSeats * 0.125) + (firstSeats * 0.15) + (cargoTons * 1.0)).toFixed(2));

      configuredUnits.push({
        eco: ecoSeats,
        bus: busSeats,
        first: firstSeats,
        cargo: cargoTons,
        spaceUsed: spaceUsedVal,
        maxSeats,
        spacePct: ((spaceUsedVal / maxSeats) * 100).toFixed(1),
        weightUsed: weightUsedVal,
        maxPayload,
        weightPct: ((weightUsedVal / maxPayload) * 100).toFixed(1)
      });

      remDemand.forEach(rd => {
        const numRT = rd.flights;
        rd.remY = Math.max(0, rd.remY - (2 * ecoSeats * numRT));
        rd.remJ = Math.max(0, rd.remJ - (2 * busSeats * numRT));
        rd.remF = Math.max(0, rd.remF - (2 * firstSeats * numRT));
        rd.remC = Math.max(0, rd.remC - (2 * cargoTons * numRT));
      });
    }
  } else {
    // max_profit
    const minLoadFactorThreshold = 0.30;
    while (iter < maxIterations) {
      iter++;
      let y = 0, j = 0, f = 0;
      let spaceUnitsLeft = Math.round(maxSeats * 10);
      let weightLeftKg = Math.round(maxPayload * 1000);

      while (spaceUnitsLeft >= 10 && weightLeftKg >= 100) {
        let bestClass = null;
        let bestYield = 0;

        if (spaceUnitsLeft >= 42 && weightLeftKg >= 150) {
          let marginalRevF = 0;
          remDemand.forEach(rd => {
            const flights = rd.flights;
            const curSold = Math.min(rd.remF, 2 * f * flights);
            const nextSold = Math.min(rd.remF, 2 * (f + 1) * flights);
            marginalRevF += (nextSold - curSold) * (rd.leg.prices?.first || 0);
          });
          const yieldF = marginalRevF / 4.2;
          if (yieldF > bestYield) {
            bestYield = yieldF;
            bestClass = 'F';
          }
        }

        if (spaceUnitsLeft >= 18 && weightLeftKg >= 125) {
          let marginalRevJ = 0;
          remDemand.forEach(rd => {
            const flights = rd.flights;
            const curSold = Math.min(rd.remJ, 2 * j * flights);
            const nextSold = Math.min(rd.remJ, 2 * (j + 1) * flights);
            marginalRevJ += (nextSold - curSold) * (rd.leg.prices?.bus || 0);
          });
          const yieldJ = marginalRevJ / 1.8;
          if (yieldJ > bestYield) {
            bestYield = yieldJ;
            bestClass = 'J';
          }
        }

        if (spaceUnitsLeft >= 10 && weightLeftKg >= 100) {
          let marginalRevY = 0;
          remDemand.forEach(rd => {
            const flights = rd.flights;
            const curSold = Math.min(rd.remY, 2 * y * flights);
            const nextSold = Math.min(rd.remY, 2 * (y + 1) * flights);
            marginalRevY += (nextSold - curSold) * (rd.leg.prices?.eco || 0);
          });
          const yieldY = marginalRevY / 1.0;
          if (yieldY > bestYield) {
            bestYield = yieldY;
            bestClass = 'Y';
          }
        }

        if (bestYield <= 0 || !bestClass) break;

        if (bestClass === 'F') { f++; spaceUnitsLeft -= 42; weightLeftKg -= 150; }
        else if (bestClass === 'J') { j++; spaceUnitsLeft -= 18; weightLeftKg -= 125; }
        else if (bestClass === 'Y') { y++; spaceUnitsLeft -= 10; weightLeftKg -= 100; }
      }

      // Convert leftover cabin space to Economy if weight permits
      while (spaceUnitsLeft >= 10 && weightLeftKg >= 100) {
        y++;
        spaceUnitsLeft -= 10;
        weightLeftKg -= 100;
      }

      const c = Math.max(0, Math.floor(weightLeftKg / 1000));

      let unitSoldPax = 0;
      let unitOfferedPax = 0;
      let unitDailyRev = 0;

      remDemand.forEach(rd => {
        const flights = rd.flights;
        const offerY = 2 * y * flights;
        const offerJ = 2 * j * flights;
        const offerF = 2 * f * flights;
        const offerC = 2 * c * flights;

        const soldY = Math.min(rd.remY, offerY);
        const soldJ = Math.min(rd.remJ, offerJ);
        const soldF = Math.min(rd.remF, offerF);
        const soldC = Math.min(rd.remC, offerC);

        unitSoldPax += (soldY + soldJ + soldF);
        unitOfferedPax += (offerY + offerJ + offerF);
        unitDailyRev += (soldY * (rd.leg.prices?.eco || 0)) +
                        (soldJ * (rd.leg.prices?.bus || 0)) +
                        (soldF * (rd.leg.prices?.first || 0)) +
                        (soldC * (rd.leg.prices?.cargo || 0));
      });

      const unitLoadFactor = unitOfferedPax > 0 ? (unitSoldPax / unitOfferedPax) : 0;

      if (configuredUnits.length > 0) {
        if (unitLoadFactor < minLoadFactorThreshold || unitDailyRev <= 0 || unitSoldPax <= 0) break;
      } else {
        if (unitDailyRev <= 0 && (y + j + f) === 0) break;
      }

      const spaceUsedVal = Number(((y * 1.0) + (j * 1.8) + (f * 4.2)).toFixed(1));
      const weightUsedVal = Number(((y * 0.10) + (j * 0.125) + (f * 0.15) + (c * 1.0)).toFixed(2));

      configuredUnits.push({
        eco: y,
        bus: j,
        first: f,
        cargo: c,
        spaceUsed: spaceUsedVal,
        maxSeats,
        spacePct: ((spaceUsedVal / maxSeats) * 100).toFixed(1),
        weightUsed: weightUsedVal,
        maxPayload,
        weightPct: ((weightUsedVal / maxPayload) * 100).toFixed(1)
      });

      remDemand.forEach(rd => {
        const flights = rd.flights;
        rd.remY = Math.max(0, rd.remY - (2 * y * flights));
        rd.remJ = Math.max(0, rd.remJ - (2 * j * flights));
        rd.remF = Math.max(0, rd.remF - (2 * f * flights));
        rd.remC = Math.max(0, rd.remC - (2 * c * flights));
      });
    }
  }

  // Fallback if 0 units generated
  if (configuredUnits.length === 0) {
    const fallbackEco = Math.min(maxSeats, Math.floor(maxPayload / 0.1));
    const fallbackCargo = Math.max(0, Math.floor(maxPayload - (fallbackEco * 0.1)));
    const fallbackWeight = Number(((fallbackEco * 0.1) + (fallbackCargo * 1.0)).toFixed(2));
    configuredUnits.push({
      eco: fallbackEco,
      bus: 0,
      first: 0,
      cargo: fallbackCargo,
      spaceUsed: fallbackEco,
      maxSeats,
      spacePct: ((fallbackEco / maxSeats) * 100).toFixed(1),
      weightUsed: fallbackWeight,
      maxPayload,
      weightPct: ((fallbackWeight / maxPayload) * 100).toFixed(1)
    });
  }

  // Stack identical configurations together
  const stackedGroups = [];
  configuredUnits.forEach((unit, uIdx) => {
    const prevGroup = stackedGroups[stackedGroups.length - 1];
    if (prevGroup && 
        prevGroup.cabin.eco === unit.eco &&
        prevGroup.cabin.bus === unit.bus &&
        prevGroup.cabin.first === unit.first &&
        prevGroup.cabin.cargo === unit.cargo) {
      prevGroup.count += 1;
      prevGroup.endUnitIndex = uIdx + 1;
    } else {
      stackedGroups.push({
        count: 1,
        startUnitIndex: uIdx + 1,
        endUnitIndex: uIdx + 1,
        cabin: unit
      });
    }
  });

  const totalUnits = configuredUnits.length;
  const totalPlanes = totalUnits * planesPerUnit;
  const totalFleetCost = totalPlanes * (aircraft.price || 0);

  let fleetDailyRev = 0;
  let fleetMaxDailyRev = 0;
  let fleetDailyPaxUnmetLoss = 0;
  let fleetDailyCargoUnmetLoss = 0;
  let fleetDailyPaxEmptyLoss = 0;
  let fleetDailyCargoEmptyLoss = 0;

  let totalDailyPaxDem = 0;
  let totalDailyPaxOffer = 0;
  let totalDailyPaxSold = 0;
  let totalDailyPaxUnmet = 0;
  let totalDailyPaxEmpty = 0;

  let totalDailyCargoDem = 0;
  let totalDailyCargoOffer = 0;
  let totalDailyCargoSold = 0;
  let totalDailyCargoUnmet = 0;
  let totalDailyCargoEmpty = 0;

  const routeResults = legs.map(leg => {
    const dist = leg.distanceKm || (hubAirport && leg.dstAirport ? calculateHaversineDistance(hubAirport.lat, hubAirport.lon, leg.dstAirport.lat, leg.dstAirport.lon) : 0);
    const dur = calculateFlightTimeHours(dist, aircraft.speed_kmh || 800);
    const f = getEffectiveLegFlights(leg, dur);
    const pY = leg.prices?.eco || 0;
    const pJ = leg.prices?.bus || 0;
    const pF = leg.prices?.first || 0;
    const pC = leg.cargoEnabled ? (leg.prices?.cargo || 0) : 0;

    const dY = leg.demand?.eco || 0;
    const dJ = leg.demand?.bus || 0;
    const dF = leg.demand?.first || 0;
    const dC = leg.cargoEnabled ? (leg.demand?.cargo || 0) : 0;

    let offerY = 0, offerJ = 0, offerF = 0, offerC = 0;
    configuredUnits.forEach(u => {
      offerY += (2 * u.eco * f);
      offerJ += (2 * u.bus * f);
      offerF += (2 * u.first * f);
      offerC += (2 * u.cargo * f);
    });

    const soldY = Math.min(dY, offerY);
    const soldJ = Math.min(dJ, offerJ);
    const soldF = Math.min(dF, offerF);
    const soldC = Math.min(dC, offerC);

    const emptyY = Math.max(0, offerY - soldY);
    const emptyJ = Math.max(0, offerJ - soldJ);
    const emptyF = Math.max(0, offerF - soldF);
    const emptyC = Math.max(0, offerC - soldC);

    const unmetY = Math.max(0, dY - offerY);
    const unmetJ = Math.max(0, dJ - offerJ);
    const unmetF = Math.max(0, dF - offerF);
    const unmetC = Math.max(0, dC - offerC);

    const routeRev = (soldY * pY) + (soldJ * pJ) + (soldF * pF) + (soldC * pC);
    fleetDailyRev += routeRev;

    const maxRevY = dY * pY;
    const maxRevJ = dJ * pJ;
    const maxRevF = dF * pF;
    const maxRevC = dC * pC;
    const maxDailyRev = maxRevY + maxRevJ + maxRevF + maxRevC;
    fleetMaxDailyRev += maxDailyRev;

    const unmetLossY = unmetY * pY;
    const unmetLossJ = unmetJ * pJ;
    const unmetLossF = unmetF * pF;
    const unmetLossC = unmetC * pC;
    const paxUnmetLoss = unmetLossY + unmetLossJ + unmetLossF;
    const totalUnmetLoss = paxUnmetLoss + unmetLossC;
    fleetDailyPaxUnmetLoss += paxUnmetLoss;
    fleetDailyCargoUnmetLoss += unmetLossC;

    const emptyLossY = emptyY * pY;
    const emptyLossJ = emptyJ * pJ;
    const emptyLossF = emptyF * pF;
    const emptyLossC = emptyC * pC;
    const paxEmptyLoss = emptyLossY + emptyLossJ + emptyLossF;
    const totalEmptyLoss = paxEmptyLoss + emptyLossC;
    fleetDailyPaxEmptyLoss += paxEmptyLoss;
    fleetDailyCargoEmptyLoss += emptyLossC;

    const routePaxDem = dY + dJ + dF;
    const routePaxOffer = offerY + offerJ + offerF;
    const routePaxSold = soldY + soldJ + soldF;
    const routePaxUnmet = unmetY + unmetJ + unmetF;
    const routePaxEmpty = emptyY + emptyJ + emptyF;
    const paxCoverage = routePaxDem > 0 ? ((routePaxSold / routePaxDem) * 100).toFixed(1) : '100.0';
    const routeLoadFactor = routePaxOffer > 0 ? ((routePaxSold / routePaxOffer) * 100).toFixed(1) : '100.0';

    totalDailyPaxDem += routePaxDem;
    totalDailyPaxOffer += routePaxOffer;
    totalDailyPaxSold += routePaxSold;
    totalDailyPaxUnmet += routePaxUnmet;
    totalDailyPaxEmpty += routePaxEmpty;

    totalDailyCargoDem += dC;
    totalDailyCargoOffer += offerC;
    totalDailyCargoSold += soldC;
    totalDailyCargoUnmet += unmetC;
    totalDailyCargoEmpty += emptyC;

    return {
      leg,
      flights: f,
      demand: { eco: dY, bus: dJ, first: dF, cargo: dC },
      offer: { eco: offerY, bus: offerJ, first: offerF, cargo: offerC },
      sold: { eco: soldY, bus: soldJ, first: soldF, cargo: soldC },
      empty: { eco: emptyY, bus: emptyJ, first: emptyF, cargo: emptyC },
      unmet: { eco: unmetY, bus: unmetJ, first: unmetF, cargo: unmetC },
      prices: { eco: pY, bus: pJ, first: pF, cargo: pC },
      maxRev: { eco: maxRevY, bus: maxRevJ, first: maxRevF, cargo: maxRevC, total: maxDailyRev },
      unmetLoss: { eco: unmetLossY, bus: unmetLossJ, first: unmetLossF, cargo: unmetLossC, pax: paxUnmetLoss, total: totalUnmetLoss },
      emptyLoss: { eco: emptyLossY, bus: emptyLossJ, first: emptyLossF, cargo: emptyLossC, pax: paxEmptyLoss, total: totalEmptyLoss },
      dailyRev: routeRev,
      maxDailyRev,
      paxUnmetLoss,
      cargoUnmetLoss: unmetLossC,
      totalUnmetLoss,
      paxEmptyLoss,
      cargoEmptyLoss: emptyLossC,
      totalEmptyLoss,
      paxCoverage,
      routeLoadFactor,
      isFull: unmetY === 0 && unmetJ === 0 && unmetF === 0 && unmetC === 0
    };
  });

  const fleetDailyTotalUnmetLoss = fleetDailyPaxUnmetLoss + fleetDailyCargoUnmetLoss;
  const fleetDailyTotalEmptyLoss = fleetDailyPaxEmptyLoss + fleetDailyCargoEmptyLoss;
  const overallCoveragePct = fleetMaxDailyRev > 0 ? ((fleetDailyRev / fleetMaxDailyRev) * 100).toFixed(1) : '100.0';
  const paxFillRate = totalDailyPaxDem > 0 ? ((totalDailyPaxSold / totalDailyPaxDem) * 100).toFixed(1) : '100.0';
  const cargoFillRate = totalDailyCargoDem > 0 ? ((totalDailyCargoSold / totalDailyCargoDem) * 100).toFixed(1) : '100.0';
  const circuitLoadFactor = totalDailyPaxOffer > 0 ? ((totalDailyPaxSold / totalDailyPaxOffer) * 100).toFixed(1) : '100.0';

  return {
    aircraft,
    strategy: effectiveStrategy,
    is168h,
    planesPerUnit,
    totalUnits,
    totalPlanes,
    reqFleet: totalPlanes,
    totalFleetCost,
    fleetCost: totalFleetCost,
    fleetDailyRev,
    dailyRev: fleetDailyRev,
    fleetWeeklyRev: fleetDailyRev * 7,
    fleetMaxDailyRev,
    fleetMaxWeeklyRev: fleetMaxDailyRev * 7,
    fleetDailyPaxUnmetLoss,
    fleetDailyCargoUnmetLoss,
    fleetDailyTotalUnmetLoss,
    fleetDailyPaxEmptyLoss,
    fleetDailyCargoEmptyLoss,
    fleetDailyTotalEmptyLoss,
    totalDurHours,
    targetHours,
    fitsSchedule,
    freeHours,
    overHours,
    costPerSeat,
    meetsRange,
    meetsRunways,
    meetsHubCat,
    isCompatible,
    configuredUnits,
    stackedGroups,
    routeResults,
    totalDailyPaxDem,
    totalDailyPaxOffer,
    totalDailyPaxSold,
    totalDailyPaxUnmet,
    totalDailyPaxEmpty,
    totalDailyCargoDem,
    totalDailyCargoOffer,
    totalDailyCargoSold,
    totalDailyCargoUnmet,
    totalDailyCargoEmpty,
    totalUnmetPax: totalDailyPaxUnmet,
    totalUnmetCargo: totalDailyCargoUnmet,
    totalEmptyPax: totalDailyPaxEmpty,
    totalEmptyCargo: totalDailyCargoEmpty,
    paxFillRate,
    cargoFillRate,
    circuitLoadFactor,
    overallCoveragePct,
    paybackDays: fleetDailyRev > 0 ? Math.round(totalFleetCost / fleetDailyRev) : 0
  };
}
window.calculateFleetPlanForAircraft = calculateFleetPlanForAircraft;

function recalculateCircuitConfigurations() {
  const aircraft = getActiveAircraft();
  const legs = window.CIRCUIT_LEGS || [];

  if (!aircraft || legs.length === 0) {
    window.ACTIVE_FLEET_PLAN = null;
    return;
  }

  const baseSingleSum = legs.reduce((acc, l) => acc + (l.durationHours || 0), 0);
  const is168h = baseSingleSum > 28;

  // Rule:
  // If 1 Route and 24h circuit use estimation from Zero Empty Seats mode.
  // If multi route and 24h or 168h circuit, then use max profit estimation.
  const autoStrategy = (legs.length === 1 && !is168h) ? 'zero_empty' : 'max_profit';
  const strategy = window.CIRCUIT_STRATEGY_MANUAL ? (window.CIRCUIT_STRATEGY || autoStrategy) : autoStrategy;
  window.CIRCUIT_STRATEGY = strategy;
  if (typeof updateStrategyButtonUI === 'function') updateStrategyButtonUI();

  const plan = calculateFleetPlanForAircraft(aircraft, legs, strategy);
  window.ACTIVE_FLEET_PLAN = plan;
}
window.recalculateCircuitConfigurations = recalculateCircuitConfigurations;
window.renderCircuitAll = renderCircuitAll;

/**
 * Render the Stacked Aircraft Cards (Point 4 - Redesigned Accordion View)
 */
function renderActivePlanDetails() {
  const planContainer = document.getElementById('sc_active_plan_card');
  const plan = window.ACTIVE_FLEET_PLAN;

  if (!planContainer) return;

  if (!plan || !plan.stackedGroups || plan.stackedGroups.length === 0) {
    planContainer.innerHTML = `
      <div class="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
        Add routes to your circuit above to calculate optimal fleet configurations.
      </div>
    `;
    return;
  }

  // Compute fleet-average prices per class across all routes (weighted by flights)
  let totalFlights = 0;
  let avgEco = 0, avgBus = 0, avgFirst = 0, avgCargo = 0;
  if (plan.routeResults && plan.routeResults.length > 0) {
    plan.routeResults.forEach(r => {
      const f = r.flights || 1;
      totalFlights += f;
      avgEco   += (r.prices.eco   || 0) * f;
      avgBus   += (r.prices.bus   || 0) * f;
      avgFirst += (r.prices.first || 0) * f;
      avgCargo += (r.prices.cargo || 0) * f;
    });
    if (totalFlights > 0) {
      avgEco   /= totalFlights;
      avgBus   /= totalFlights;
      avgFirst /= totalFlights;
      avgCargo /= totalFlights;
    }
  }

  // Calculate detailed per-stack and single-aircraft economics
  plan.stackedGroups.forEach(group => {
    const p = group.cabin;
    const totalGroupPlanes = group.count * plan.planesPerUnit;

    let unitEcoRev = 0;
    let unitBusRev = 0;
    let unitFirstRev = 0;
    let unitCargoRev = 0;

    if (plan.routeResults && plan.routeResults.length > 0) {
      plan.routeResults.forEach(r => {
        const f = r.flights || 1;
        const ratioY = (r.offer && r.offer.eco > 0) ? (r.sold.eco / r.offer.eco) : 1;
        const ratioJ = (r.offer && r.offer.bus > 0) ? (r.sold.bus / r.offer.bus) : 1;
        const ratioF = (r.offer && r.offer.first > 0) ? (r.sold.first / r.offer.first) : 1;
        const ratioC = (r.offer && r.offer.cargo > 0) ? (r.sold.cargo / r.offer.cargo) : 1;

        const offerY = 2 * p.eco * f;
        const offerJ = 2 * p.bus * f;
        const offerF = 2 * p.first * f;
        const offerC = 2 * p.cargo * f;

        unitEcoRev   += offerY * (r.prices.eco || 0) * ratioY;
        unitBusRev   += offerJ * (r.prices.bus || 0) * ratioJ;
        unitFirstRev += offerF * (r.prices.first || 0) * ratioF;
        unitCargoRev += offerC * (r.prices.cargo || 0) * ratioC;
      });
    }

    // In 168h circuits, 1 unit is a 7-aircraft wave, so 1 aircraft = unit / 7
    const aircraftDailyRev = plan.is168h ? ((unitEcoRev + unitBusRev + unitFirstRev + unitCargoRev) / 7) : (unitEcoRev + unitBusRev + unitFirstRev + unitCargoRev);
    const aircraftEcoRev   = plan.is168h ? (unitEcoRev / 7) : unitEcoRev;
    const aircraftBusRev   = plan.is168h ? (unitBusRev / 7) : unitBusRev;
    const aircraftFirstRev = plan.is168h ? (unitFirstRev / 7) : unitFirstRev;
    const aircraftCargoRev = plan.is168h ? (unitCargoRev / 7) : unitCargoRev;

    const stackDailyRev = aircraftDailyRev * totalGroupPlanes;
    const stackWeeklyRev = stackDailyRev * 7;

    const totRtFlights = (plan.routeResults || []).reduce((acc, r) => acc + (r.flights || 1), 0);
    const aircraftRtRev = totRtFlights > 0 ? (aircraftDailyRev / (totRtFlights / (plan.is168h ? 7 : 1))) : (aircraftDailyRev / 2);

    const acPrice = plan.aircraft?.price || 0;
    const paybackDays = (acPrice > 0 && aircraftDailyRev > 0) ? Math.round(acPrice / aircraftDailyRev) : 0;

    group.financials = {
      unitDailyRev: Math.round(aircraftDailyRev),
      unitRtRev: Math.round(aircraftRtRev),
      unitEcoRev: Math.round(aircraftEcoRev),
      unitBusRev: Math.round(aircraftBusRev),
      unitFirstRev: Math.round(aircraftFirstRev),
      unitCargoRev: Math.round(aircraftCargoRev),
      stackDailyRev: Math.round(stackDailyRev),
      stackWeeklyRev: Math.round(stackWeeklyRev),
      paybackDays
    };
  });

  // Sort groups: highest estimated daily revenue first, then count
  const sortedGroups = [...plan.stackedGroups].sort((a, b) => {
    const revA = (a.financials?.stackDailyRev) || (a.cabin.eco * avgEco + a.cabin.bus * avgBus + a.cabin.first * avgFirst + a.cabin.cargo * avgCargo);
    const revB = (b.financials?.stackDailyRev) || (b.cabin.eco * avgEco + b.cabin.bus * avgBus + b.cabin.first * avgFirst + b.cabin.cargo * avgCargo);
    if (revB !== revA) return revB - revA;
    return b.count - a.count;
  });

  window.CIRCUIT_ACCORDION_EXPANDED = window.CIRCUIT_ACCORDION_EXPANDED || {};

  let stacksHtml = '';
  let totalFleetFulfilled = 0;
  const totalFleetPlanes = plan.totalPlanes;

  sortedGroups.forEach((group, gIdx) => {
    const p = group.cabin;
    const totalGroupPlanes = group.count * plan.planesPerUnit;

    const configKey = `${group.startUnitIndex}-${group.endUnitIndex}_${p.eco}-${p.bus}-${p.first}-${p.cargo}`;
    const altKey = `${group.startUnitIndex}-${group.endUnitIndex}`;

    // Read fulfilled count with backward compatibility
    let fulfilledCount = 0;
    if (window.CIRCUIT_FULFILLED_CONFIGS && typeof window.CIRCUIT_FULFILLED_CONFIGS === 'object') {
      const val = window.CIRCUIT_FULFILLED_CONFIGS[configKey] ?? window.CIRCUIT_FULFILLED_CONFIGS[altKey];
      if (val === true) {
        fulfilledCount = totalGroupPlanes;
      } else if (typeof val === 'number') {
        fulfilledCount = Math.max(0, Math.min(totalGroupPlanes, val));
      }
    }
    totalFleetFulfilled += fulfilledCount;

    const isComplete = (fulfilledCount === totalGroupPlanes && totalGroupPlanes > 0);
    const hasSome = (fulfilledCount > 0 && !isComplete);
    const pct = Math.round((fulfilledCount / totalGroupPlanes) * 100);
    const isExpanded = !!window.CIRCUIT_ACCORDION_EXPANDED[configKey];

    const ecoW = ((p.eco * 1.0) / p.maxSeats) * 100;
    const busW = ((p.bus * 1.8) / p.maxSeats) * 100;
    const firstW = ((p.first * 4.2) / p.maxSeats) * 100;

    const paxWeight = Number(((p.eco * 0.10) + (p.bus * 0.125) + (p.first * 0.15)).toFixed(2));
    const cargoWeight = Number((p.cargo * 1.0).toFixed(2));
    const paxWeightPct = ((paxWeight / p.maxPayload) * 100).toFixed(1);
    const cargoWeightPct = ((cargoWeight / p.maxPayload) * 100).toFixed(1);

    const hasEco = p.eco > 0;
    const hasBus = p.bus > 0;
    const hasFirst = p.first > 0;
    const hasCargo = p.cargo > 0;

    stacksHtml += `
      <div class="glass-card ${isComplete ? 'glass-card-fulfilled' : ''} rounded-xl border ${isComplete ? 'border-emerald-500/60 bg-slate-900/90' : 'border-slate-800 bg-slate-900/70'} overflow-hidden transition-all duration-200 shadow-sm">
        
        <!-- Accordion Clickable Header Area -->
        <div onclick="toggleConfigAccordion('${configKey}')" class="p-3 sm:p-3.5 bg-slate-900/80 hover:bg-slate-800/60 cursor-pointer select-none transition space-y-2.5">
          
          <!-- Header Row 1: Stepper + Standalone Stack Badge (Left) & Metrics + Financial Button + Chevron (Right) -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            <!-- Left: Stepper + Standalone Stack Amount -->
            <div class="flex items-center gap-2.5">
              
              <!-- Stepper Control -->
              <div class="flex items-center gap-1.5 select-none shrink-0" onclick="event.stopPropagation()">
                <div class="flex items-center p-0.5 rounded-lg border ${
                  isComplete
                    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/80 shadow-sm ring-1 ring-emerald-500/30'
                    : hasSome
                      ? 'bg-slate-900 text-cyan-300 border-cyan-700/70 shadow-sm'
                      : 'bg-slate-950/90 text-slate-400 border-slate-700/80'
                } font-mono-num text-xs">
                  <button type="button" onclick="event.stopPropagation(); stepConfigFulfilled('${configKey}', -1, ${totalGroupPlanes})" class="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold leading-none transition" title="Decrease configured aircraft">-</button>
                  
                  <div class="px-2.5 py-0.5 text-center cursor-pointer hover:underline text-[11px] font-bold" onclick="event.stopPropagation(); setExactConfigFulfilled('${configKey}', ${isComplete ? 0 : totalGroupPlanes}, ${totalGroupPlanes})" title="Click to ${isComplete ? 'reset to 0' : 'fill all'}">
                    <span>${fulfilledCount}/${totalGroupPlanes}</span>
                    <span class="text-[9px] font-normal opacity-85 ml-0.5">${isComplete ? '✓' : `${pct}%`}</span>
                  </div>

                  <button type="button" onclick="event.stopPropagation(); stepConfigFulfilled('${configKey}', 1, ${totalGroupPlanes})" class="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold leading-none transition" title="Increase configured aircraft">+</button>
                </div>
              </div>

              <!-- Standalone Stack Badge (No #1, #2 IDs) -->
              <span class="px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                isComplete
                  ? 'bg-emerald-950 text-emerald-200 border border-emerald-700/80'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              } flex items-center gap-1.5 shadow-sm">
                ${isComplete ? '<span class="text-emerald-400 font-black">✓</span>' : ''}
                <span>${totalGroupPlanes}× Aircraft</span>
              </span>

            </div>

            <!-- Right: Capacity Summary + Daily Turnover + Financials Button + Chevron -->
            <div class="flex items-center gap-3 self-end sm:self-center shrink-0 font-mono-num text-xs">
              
              <!-- Capacity & Round-Trip text -->
              <div class="text-right hidden sm:block text-[11px] text-slate-300">
                <span><strong>${p.eco + p.bus + p.first} PAX</strong></span>
                <span class="text-slate-500">(${ (p.eco + p.bus + p.first)*2 }/RT)</span>
                <span class="text-slate-600 mx-1">•</span>
                <span class="text-slate-400">${p.weightUsed}T (${p.weightPct}%)</span>
              </div>

              <!-- Daily Turnover -->
              <div class="text-right font-bold text-emerald-400">
                ${formatCurrency(group.financials?.stackDailyRev || 0)}<span class="text-[10px] text-emerald-500/80 font-normal">/day</span>
              </div>

              <!-- Financial Summary Popover Trigger Button -->
              <button type="button" onclick="openConfigFinancialPopover(event, '${configKey}')" class="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 hover:border-emerald-500 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm" title="Open financial breakdown popover">
                <span>💰</span>
                <span class="text-[11px]">Financials</span>
              </button>

              <!-- Chevron -->
              <div class="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-white">
                <svg class="w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180 text-cyan-400' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

            </div>
          </div>

          <!-- Header Row 2: Uniform Emoji Configuration Boxes (Always 4 uniform boxes, perfectly aligned across cards) -->
          <div class="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-800/40">
            <div class="flex items-center gap-1.5 select-none font-mono-num text-xs">
              <!-- Economy Box -->
              <div class="w-[66px] sm:w-[74px] py-1 px-1.5 rounded-lg border flex items-center justify-center gap-1 transition ${
                hasEco 
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm' 
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
              }" title="Economy: ${p.eco} seats (${p.eco * 2} / Round-Trip)">
                <span class="text-[13px] leading-none">💺</span>
                <span class="font-bold text-[11px] sm:text-xs">${p.eco}</span>
              </div>

              <!-- Business Box -->
              <div class="w-[66px] sm:w-[74px] py-1 px-1.5 rounded-lg border flex items-center justify-center gap-1 transition ${
                hasBus 
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300 shadow-sm' 
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
              }" title="Business: ${p.bus} seats (${p.bus * 2} / Round-Trip)">
                <span class="text-[13px] leading-none">💼</span>
                <span class="font-bold text-[11px] sm:text-xs">${p.bus}</span>
              </div>

              <!-- First Class Box -->
              <div class="w-[66px] sm:w-[74px] py-1 px-1.5 rounded-lg border flex items-center justify-center gap-1 transition ${
                hasFirst 
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-sm' 
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
              }" title="First Class: ${p.first} seats (${p.first * 2} / Round-Trip)">
                <span class="text-[13px] leading-none">👑</span>
                <span class="font-bold text-[11px] sm:text-xs">${p.first}</span>
              </div>

              <!-- Belly Cargo Box -->
              <div class="w-[66px] sm:w-[74px] py-1 px-1.5 rounded-lg border flex items-center justify-center gap-1 transition ${
                hasCargo 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm' 
                  : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
              }" title="Belly Cargo: ${p.cargo}T (${p.cargo * 2}T / Round-Trip)">
                <span class="text-[13px] leading-none">📦</span>
                <span class="font-bold text-[11px] sm:text-xs">${p.cargo}T</span>
              </div>
            </div>

            <div class="text-[10px] text-slate-500 font-mono-num hidden sm:block">
              Offers ${(p.eco + p.bus + p.first) * 2} PAX &amp; ${p.cargo * 2}T Cargo per Round-Trip
            </div>
          </div>

        </div>

        <!-- Expanded Body (Progressive Disclosure) -->
        ${isExpanded ? `
          <div class="p-3.5 sm:p-4 border-t border-slate-800/80 bg-slate-950/70 space-y-3">
            
            <!-- Capacity & Payload Details Row -->
            <div class="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-num text-slate-300">
              <div>
                <span class="text-slate-400">Cabin Space Allocation: </span>
                <strong class="text-white">${p.eco + p.bus + p.first} PAX</strong>
                <span class="text-slate-500">(${Number(p.spaceUsed.toFixed(1))}/${p.maxSeats} spaces used)</span>
              </div>
              <div class="flex items-center gap-3">
                <div>
                  <span class="text-slate-400">Total Weight: </span>
                  <strong class="${p.weightPct >= 95 ? 'text-emerald-400' : 'text-white'}">${p.weightUsed}T</strong> / ${p.maxPayload}T
                  <span class="text-slate-500">(${p.weightPct}%)</span>
                </div>
              </div>
            </div>

            <!-- Visual Cabin Space Bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-slate-400 font-mono-num">
                <span>Cabin Distribution</span>
                <span>Economy (${ecoW.toFixed(0)}%) • Business (${busW.toFixed(0)}%) • First (${firstW.toFixed(0)}%)</span>
              </div>
              <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
                ${ecoW > 0 ? `<div style="width: ${ecoW}%" class="h-full seat-bar-eco rounded-sm" title="Economy: ${p.eco} seats (${ecoW.toFixed(1)}%)"></div>` : ''}
                ${busW > 0 ? `<div style="width: ${busW}%" class="h-full seat-bar-bus rounded-sm" title="Business: ${p.bus} seats (${busW.toFixed(1)}%)"></div>` : ''}
                ${firstW > 0 ? `<div style="width: ${firstW}%" class="h-full seat-bar-first rounded-sm" title="First Class: ${p.first} seats (${firstW.toFixed(1)}%)"></div>` : ''}
              </div>
            </div>

            <!-- Visual Payload Weight Bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] text-slate-400 font-mono-num">
                <span>Payload Weight Breakdown</span>
                <span>Passengers: ${paxWeight}T • Belly Cargo: ${cargoWeight}T</span>
              </div>
              <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
                ${paxWeightPct > 0 ? `<div style="width: ${paxWeightPct}%" class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-sm" title="Passengers: ${paxWeight}T"></div>` : ''}
                ${cargoWeightPct > 0 ? `<div style="width: ${cargoWeightPct}%" class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-sm" title="Belly Cargo: ${cargoWeight}T"></div>` : ''}
              </div>
            </div>

          </div>
        ` : ''}

      </div>
    `;
  });

  const totalConfigs = sortedGroups.length;
  const allFleetFulfilled = (totalFleetFulfilled === totalFleetPlanes && totalFleetPlanes > 0);

  planContainer.innerHTML = `
    <div class="glass-panel p-5 rounded-2xl border border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-xl space-y-4">
      
      <!-- Top Fleet Summary Row -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-1 rounded-lg text-xs ${plan.strategy === 'max_profit' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'} font-bold flex items-center gap-1.5">
            <span>${plan.strategy === 'max_profit' ? '💰' : '🛡️'}</span>
            <span>${plan.strategy === 'max_profit' ? 'Max Profit Solution' : 'Zero Empty Seats Solution'}</span>
          </span>
          <span class="text-xs px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono-num font-bold">
            ✈️ ${plan.totalPlanes} Total Aircraft Required ${plan.is168h ? `(${plan.totalUnits} Wave${plan.totalUnits > 1 ? 's' : ''} of 7)` : ''}
          </span>
          <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-mono-num">
            💰 Capital: ${formatCurrency(plan.totalFleetCost)}
          </span>
          <span class="text-xs px-2.5 py-1 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/80 font-mono-num font-semibold">
            📈 ${plan.circuitLoadFactor}% Load Factor
          </span>
          <span class="text-xs px-2.5 py-1 rounded-lg ${allFleetFulfilled ? 'bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold shadow-sm' : (totalFleetFulfilled > 0 ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-semibold' : 'bg-slate-800 text-slate-400 border border-slate-700')} font-mono-num flex items-center gap-1.5" title="${totalFleetFulfilled} of ${totalFleetPlanes} aircraft configured">
            <span>${allFleetFulfilled ? '✓' : '📋'}</span>
            <span>${totalFleetFulfilled} / ${totalFleetPlanes} Aircraft Configured (${totalFleetPlanes > 0 ? Math.round((totalFleetFulfilled/totalFleetPlanes)*100) : 0}%)</span>
            ${totalFleetPlanes > 0 ? `
              <span class="text-slate-600">|</span>
              ${allFleetFulfilled 
                ? `<button type="button" onclick="setAllConfigsFulfilled(false)" class="text-[10px] text-slate-400 hover:text-amber-300 underline font-normal">Reset all</button>`
                : `<button type="button" onclick="setAllConfigsFulfilled(true)" class="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-normal">Mark all</button>`}
            ` : ''}
          </span>
        </div>
        <div class="flex items-baseline gap-4 sm:text-right shrink-0 flex-wrap">
          <div>
            <div class="text-[10px] uppercase text-slate-400 font-medium">Daily Realized Rev</div>
            <div class="text-base sm:text-lg font-bold text-emerald-400 font-mono-num">${formatCurrency(plan.fleetDailyRev)}</div>
          </div>
          <div>
            <div class="text-[10px] uppercase text-slate-400 font-medium">Max Potential Rev</div>
            <div class="text-base sm:text-lg font-bold text-cyan-300 font-mono-num">${formatCurrency(plan.fleetMaxDailyRev)}</div>
          </div>
          ${plan.fleetDailyTotalUnmetLoss > 0 ? `
            <div>
              <div class="text-[10px] uppercase text-slate-400 font-medium">Unmet Loss</div>
              <div class="text-base sm:text-lg font-bold text-amber-400 font-mono-num">-${formatCurrency(plan.fleetDailyTotalUnmetLoss)}</div>
            </div>
          ` : ''}
          <div>
            <div class="text-[10px] uppercase text-slate-400 font-medium">Weekly Turnover</div>
            <div class="text-base sm:text-lg font-bold text-slate-300 font-mono-num">${formatCurrency(plan.fleetWeeklyRev)}</div>
          </div>
        </div>
      </div>

      <!-- Toolbar: Expand / Collapse All -->
      <div class="flex items-center justify-between pt-0.5 text-xs text-slate-400">
        <div class="text-[11px]">
          Showing <strong class="text-white">${totalConfigs} Configuration Stack${totalConfigs > 1 ? 's' : ''}</strong> (${totalFleetPlanes} Aircraft total). Click any row to expand seat &amp; payload charts.
        </div>
        <div class="flex items-center gap-2 font-medium">
          <button type="button" onclick="toggleAllConfigAccordions(true)" class="text-cyan-400 hover:text-cyan-300 hover:underline">Expand All</button>
          <span class="text-slate-600">•</span>
          <button type="button" onclick="toggleAllConfigAccordions(false)" class="text-slate-400 hover:text-white hover:underline">Collapse All</button>
        </div>
      </div>

      <!-- Stacked Aircraft Accordion List -->
      <div class="space-y-2.5">
        ${stacksHtml}
      </div>

    </div>
  `;
}

/**
 * Stepper fulfillment changes for a specific aircraft configuration group
 */
function stepConfigFulfilled(configKey, delta, maxPlanes) {
  if (!window.CIRCUIT_FULFILLED_CONFIGS || typeof window.CIRCUIT_FULFILLED_CONFIGS !== 'object') {
    window.CIRCUIT_FULFILLED_CONFIGS = {};
  }
  let current = 0;
  const val = window.CIRCUIT_FULFILLED_CONFIGS[configKey];
  if (val === true) {
    current = maxPlanes;
  } else if (typeof val === 'number') {
    current = Math.max(0, Math.min(maxPlanes, val));
  }

  const next = Math.max(0, Math.min(maxPlanes, current + delta));
  if (next <= 0) {
    delete window.CIRCUIT_FULFILLED_CONFIGS[configKey];
  } else {
    window.CIRCUIT_FULFILLED_CONFIGS[configKey] = next;
  }

  // Clean legacy altKey if present
  const dashIdx = configKey.indexOf('_');
  if (dashIdx !== -1) {
    const altKey = configKey.substring(0, dashIdx);
    delete window.CIRCUIT_FULFILLED_CONFIGS[altKey];
  }

  saveConfigFulfillmentState();
  renderActivePlanDetails();
}
window.stepConfigFulfilled = stepConfigFulfilled;

/**
 * Set exact fulfillment count for a specific configuration group
 */
function setExactConfigFulfilled(configKey, count, maxPlanes) {
  if (!window.CIRCUIT_FULFILLED_CONFIGS || typeof window.CIRCUIT_FULFILLED_CONFIGS !== 'object') {
    window.CIRCUIT_FULFILLED_CONFIGS = {};
  }
  const next = Math.max(0, Math.min(maxPlanes, count));
  if (next <= 0) {
    delete window.CIRCUIT_FULFILLED_CONFIGS[configKey];
  } else {
    window.CIRCUIT_FULFILLED_CONFIGS[configKey] = next;
  }

  // Clean legacy altKey if present
  const dashIdx = configKey.indexOf('_');
  if (dashIdx !== -1) {
    const altKey = configKey.substring(0, dashIdx);
    delete window.CIRCUIT_FULFILLED_CONFIGS[altKey];
  }

  saveConfigFulfillmentState();
  renderActivePlanDetails();
}
window.setExactConfigFulfilled = setExactConfigFulfilled;

/**
 * Toggle fulfilled state (backward compatibility)
 */
function toggleConfigFulfilled(configKey) {
  if (!window.CIRCUIT_FULFILLED_CONFIGS || typeof window.CIRCUIT_FULFILLED_CONFIGS !== 'object') {
    window.CIRCUIT_FULFILLED_CONFIGS = {};
  }
  const plan = window.ACTIVE_FLEET_PLAN;
  let maxPlanes = 1;
  if (plan && plan.stackedGroups) {
    const g = plan.stackedGroups.find(grp => {
      const p = grp.cabin;
      return `${grp.startUnitIndex}-${grp.endUnitIndex}_${p.eco}-${p.bus}-${p.first}-${p.cargo}` === configKey;
    });
    if (g) maxPlanes = g.count * plan.planesPerUnit;
  }

  let current = 0;
  const val = window.CIRCUIT_FULFILLED_CONFIGS[configKey];
  if (val === true) current = maxPlanes;
  else if (typeof val === 'number') current = val;

  if (current === maxPlanes) {
    delete window.CIRCUIT_FULFILLED_CONFIGS[configKey];
  } else {
    window.CIRCUIT_FULFILLED_CONFIGS[configKey] = maxPlanes;
  }

  saveConfigFulfillmentState();
  renderActivePlanDetails();
}
window.toggleConfigFulfilled = toggleConfigFulfilled;

/**
 * Persist fulfillment state to localStorage and saved circuits library
 */
function saveConfigFulfillmentState() {
  if (typeof saveSeatConfigToLocalStorage === 'function') {
    saveSeatConfigToLocalStorage();
  }
  if (window.CURRENT_SAVED_CIRCUIT_ID && typeof getSavedCircuits === 'function') {
    const list = getSavedCircuits();
    const idx = list.findIndex(c => c.id === window.CURRENT_SAVED_CIRCUIT_ID);
    if (idx !== -1) {
      list[idx].fulfilledConfigs = { ...window.CIRCUIT_FULFILLED_CONFIGS };
      saveSavedCircuits(list);
    }
  }
}

/**
 * Quick batch toggle for all aircraft configurations in active plan
 */
function setAllConfigsFulfilled(state) {
  if (!window.CIRCUIT_FULFILLED_CONFIGS || typeof window.CIRCUIT_FULFILLED_CONFIGS !== 'object') {
    window.CIRCUIT_FULFILLED_CONFIGS = {};
  }

  const plan = window.ACTIVE_FLEET_PLAN;
  if (!plan || !plan.stackedGroups) return;

  plan.stackedGroups.forEach(group => {
    const p = group.cabin;
    const configKey = `${group.startUnitIndex}-${group.endUnitIndex}_${p.eco}-${p.bus}-${p.first}-${p.cargo}`;
    const altKey = `${group.startUnitIndex}-${group.endUnitIndex}`;
    const totalGroupPlanes = group.count * plan.planesPerUnit;

    if (state) {
      window.CIRCUIT_FULFILLED_CONFIGS[configKey] = totalGroupPlanes;
    } else {
      delete window.CIRCUIT_FULFILLED_CONFIGS[configKey];
      delete window.CIRCUIT_FULFILLED_CONFIGS[altKey];
    }
  });

  saveConfigFulfillmentState();
  renderActivePlanDetails();
}
window.setAllConfigsFulfilled = setAllConfigsFulfilled;

/**
 * Toggle individual configuration accordion state
 */
function toggleConfigAccordion(configKey) {
  window.CIRCUIT_ACCORDION_EXPANDED = window.CIRCUIT_ACCORDION_EXPANDED || {};
  window.CIRCUIT_ACCORDION_EXPANDED[configKey] = !window.CIRCUIT_ACCORDION_EXPANDED[configKey];
  renderActivePlanDetails();
}
window.toggleConfigAccordion = toggleConfigAccordion;

/**
 * Expand or collapse all configuration accordions
 */
function toggleAllConfigAccordions(expand) {
  const plan = window.ACTIVE_FLEET_PLAN;
  if (!plan || !plan.stackedGroups) return;
  window.CIRCUIT_ACCORDION_EXPANDED = {};
  if (expand) {
    plan.stackedGroups.forEach(group => {
      const p = group.cabin;
      const configKey = `${group.startUnitIndex}-${group.endUnitIndex}_${p.eco}-${p.bus}-${p.first}-${p.cargo}`;
      window.CIRCUIT_ACCORDION_EXPANDED[configKey] = true;
    });
  }
  renderActivePlanDetails();
}
window.toggleAllConfigAccordions = toggleAllConfigAccordions;

/**
 * Open Floating Financial Summary Popover for a specific configuration
 */
function openConfigFinancialPopover(event, configKey) {
  if (event) event.stopPropagation();
  const popover = document.getElementById('circuit_config_financial_popover');
  if (!popover) return;

  // Toggle close if clicking the same trigger
  if (!popover.classList.contains('hidden') && popover.getAttribute('data-config-key') === configKey) {
    closeConfigFinancialPopover();
    return;
  }

  const plan = window.ACTIVE_FLEET_PLAN;
  if (!plan || !plan.stackedGroups) return;

  const group = plan.stackedGroups.find(grp => {
    const p = grp.cabin;
    const k = `${grp.startUnitIndex}-${grp.endUnitIndex}_${p.eco}-${p.bus}-${p.first}-${p.cargo}`;
    return k === configKey;
  });
  if (!group || !group.financials) return;

  const p = group.cabin;
  const f = group.financials;
  const totalGroupPlanes = group.count * plan.planesPerUnit;

  const tot = f.unitDailyRev || 1;
  const pctY = Math.round((f.unitEcoRev / tot) * 100);
  const pctJ = Math.round((f.unitBusRev / tot) * 100);
  const pctF = Math.round((f.unitFirstRev / tot) * 100);
  const pctC = Math.round((f.unitCargoRev / tot) * 100);

  popover.setAttribute('data-config-key', configKey);
  popover.innerHTML = `
    <div class="flex items-center justify-between pb-2 border-b border-slate-800">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-lg bg-emerald-950/90 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-800/60">💰</span>
        <div>
          <h4 class="text-xs font-bold text-white tracking-tight">Cabin Financial Summary</h4>
          <div class="text-[10px] text-slate-400 font-mono-num">${totalGroupPlanes}× Aircraft Stack • 💺 ${p.eco} • 💼 ${p.bus} • 👑 ${p.first} • 📦 ${p.cargo}T</div>
        </div>
      </div>
      <button type="button" onclick="closeConfigFinancialPopover()" class="text-slate-400 hover:text-white text-base leading-none p-1 rounded hover:bg-slate-800 transition">&times;</button>
    </div>

    <!-- Financial Metrics Grid -->
    <div class="grid grid-cols-2 gap-2 text-xs font-mono-num">
      <div class="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
        <div class="text-[9px] uppercase text-slate-400 font-medium">Single Aircraft / Day</div>
        <div class="text-sm font-bold text-emerald-400 mt-0.5">${formatCurrency(f.unitDailyRev)}</div>
        <div class="text-[9px] text-slate-500">${formatCurrency(f.unitRtRev)} / Round-Trip</div>
      </div>
      <div class="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
        <div class="text-[9px] uppercase text-slate-400 font-medium">${totalGroupPlanes}× Stack / Day</div>
        <div class="text-sm font-bold text-cyan-300 mt-0.5">${formatCurrency(f.stackDailyRev)}</div>
        <div class="text-[9px] text-slate-500">${formatCurrency(f.stackWeeklyRev)} / week</div>
      </div>
    </div>

    <!-- Class Revenue Shares with Visual Color Indicators -->
    <div class="space-y-1.5 pt-1">
      <div class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
        <span>Revenue Contribution</span>
        <span class="text-slate-500">Per Day (% Share)</span>
      </div>
      <div class="space-y-1 text-xs font-mono-num">
        <div class="flex items-center justify-between text-cyan-300">
          <span>💺 Economy:</span>
          <span>${formatCurrency(f.unitEcoRev)} <span class="text-slate-500 text-[10px]">(${pctY}%)</span></span>
        </div>
        <div class="flex items-center justify-between text-blue-300">
          <span>💼 Business:</span>
          <span>${formatCurrency(f.unitBusRev)} <span class="text-slate-500 text-[10px]">(${pctJ}%)</span></span>
        </div>
        <div class="flex items-center justify-between text-amber-300">
          <span>👑 First Class:</span>
          <span>${formatCurrency(f.unitFirstRev)} <span class="text-slate-500 text-[10px]">(${pctF}%)</span></span>
        </div>
        <div class="flex items-center justify-between text-emerald-300">
          <span>📦 Belly Cargo:</span>
          <span>${formatCurrency(f.unitCargoRev)} <span class="text-slate-500 text-[10px]">(${pctC}%)</span></span>
        </div>
      </div>
    </div>

    <!-- ROI / Payback Period -->
    ${f.paybackDays > 0 ? `
      <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between font-mono-num">
        <span>Estimated Aircraft Payback (ROI):</span>
        <strong class="text-amber-400 font-bold">${f.paybackDays} Days</strong>
      </div>
    ` : ''}
  `;

  popover.classList.remove('hidden');

  // Positioning
  const rect = event.currentTarget.getBoundingClientRect();
  const popWidth = 320;
  let left = rect.right - popWidth;
  if (left < 10) left = 10;
  let top = rect.bottom + 8;
  if (top + 310 > window.innerHeight) {
    top = rect.top - 320;
  }
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}
window.openConfigFinancialPopover = openConfigFinancialPopover;

/**
 * Close Floating Financial Summary Popover
 */
function closeConfigFinancialPopover() {
  const popover = document.getElementById('circuit_config_financial_popover');
  if (popover) {
    popover.classList.add('hidden');
    popover.removeAttribute('data-config-key');
  }
}
window.closeConfigFinancialPopover = closeConfigFinancialPopover;

/**
 * Toggle Floating Aircraft Details Popover in Seat Config
 */
function toggleAircraftDetailsPopover(event) {
  if (event) event.stopPropagation();
  const popover = document.getElementById('sc_aircraft_details_popover');
  if (!popover) return;

  if (!popover.classList.contains('hidden')) {
    closeAircraftDetailsPopover();
    return;
  }

  // Close financial popover if open
  closeConfigFinancialPopover();

  const aircraft = (typeof getActiveAircraft === 'function') ? getActiveAircraft() : null;
  if (!aircraft) {
    if (typeof showToast === 'function') showToast('No aircraft currently selected', 'warning');
    return;
  }

  const priceShort = typeof formatAircraftPriceShort === 'function' ? formatAircraftPriceShort(aircraft.price) : `$${(aircraft.price / 1e6).toFixed(1)}M`;
  const priceFull = typeof formatCurrency === 'function' ? formatCurrency(aircraft.price) : `$${aircraft.price?.toLocaleString()}`;

  popover.innerHTML = `
    <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center text-sm font-bold border border-cyan-800/80 shadow-inner shrink-0">✈️</span>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-xs font-bold text-white tracking-tight truncate">${aircraft.name}</h4>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-mono">Cat. ${aircraft.category}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">${aircraft.type || 'Passenger'}</span>
          </div>
          <div class="text-[10px] text-slate-400 truncate">${aircraft.manufacturer || 'Aircraft Manufacturer'}</div>
        </div>
      </div>
      <button type="button" onclick="closeAircraftDetailsPopover()" class="text-slate-400 hover:text-white text-base leading-none p-1 rounded hover:bg-slate-800 transition shrink-0">&times;</button>
    </div>

    <!-- Specs Grid -->
    <div class="grid grid-cols-2 gap-2 text-xs font-mono-num">
      <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90">
        <div class="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Passenger Seats</div>
        <div class="text-sm font-bold text-white mt-0.5">${aircraft.seats} seats</div>
        <div class="text-[9px] text-slate-500">Max single class</div>
      </div>
      <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90">
        <div class="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Max Payload</div>
        <div class="text-sm font-bold text-cyan-300 mt-0.5">${aircraft.payload_ton} T</div>
        <div class="text-[9px] text-slate-500">${Math.round(aircraft.payload_ton * 1000).toLocaleString()} kg</div>
      </div>
      <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90">
        <div class="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Catalog Price</div>
        <div class="text-sm font-bold text-emerald-400 mt-0.5">${priceShort}</div>
        <div class="text-[9px] text-slate-500 truncate" title="${priceFull}">${priceFull}</div>
      </div>
      <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90">
        <div class="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Cruising Speed</div>
        <div class="text-sm font-bold text-slate-200 mt-0.5">${aircraft.speed_kmh} km/h</div>
        <div class="text-[9px] text-slate-500">${Math.round(aircraft.speed_kmh * 0.621371)} mph</div>
      </div>
      <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90">
        <div class="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Flight Range</div>
        <div class="text-sm font-bold text-blue-300 mt-0.5">${aircraft.range_km.toLocaleString()} km</div>
        <div class="text-[9px] text-slate-500">${Math.round(aircraft.range_km * 0.539957).toLocaleString()} NM</div>
      </div>
      <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/90">
        <div class="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Fuel &amp; Wear</div>
        <div class="text-xs font-semibold text-slate-300 mt-1 truncate" title="Fuel: ${aircraft.fuel_consumption || 'N/A'}">${aircraft.fuel_consumption ? `${aircraft.fuel_consumption}/seat` : 'Standard'}</div>
        <div class="text-[9px] text-slate-500">Wear: ${aircraft.wear_rate ? `${aircraft.wear_rate}/100h` : 'Standard'}</div>
      </div>
    </div>

    <!-- Quick Footer Actions -->
    <div class="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
      <button type="button" onclick="closeAircraftDetailsPopover(); openAircraftModal();" class="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-1 text-[11px]">
        <span>Full Catalog &rarr;</span>
      </button>
      <button type="button" onclick="closeAircraftDetailsPopover(); toggleAircraftCombobox();" class="text-slate-400 hover:text-white font-medium hover:underline text-[11px]">
        Change Aircraft
      </button>
    </div>
  `;

  popover.classList.remove('hidden');

  // Positioning
  const btn = event.currentTarget || document.getElementById('sc_aircraft_details_btn');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    const popWidth = Math.min(360, window.innerWidth - 20);
    let left = rect.left;
    if (left + popWidth > window.innerWidth - 10) {
      left = window.innerWidth - popWidth - 10;
    }
    if (left < 10) left = 10;

    let top = rect.bottom + 8;
    const estimatedHeight = 310;
    if (top + estimatedHeight > window.innerHeight && rect.top - estimatedHeight - 8 > 10) {
      top = rect.top - estimatedHeight - 8;
    }
    popover.style.left = `${left}px`;
    popover.style.top = `${top}px`;
  }
}
window.toggleAircraftDetailsPopover = toggleAircraftDetailsPopover;

function closeAircraftDetailsPopover() {
  const popover = document.getElementById('sc_aircraft_details_popover');
  if (popover) {
    popover.classList.add('hidden');
  }
}
window.closeAircraftDetailsPopover = closeAircraftDetailsPopover;

// Global listeners for popover dismissal
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const pop = document.getElementById('circuit_config_financial_popover');
    if (pop && !pop.classList.contains('hidden') && !pop.contains(e.target)) {
      closeConfigFinancialPopover();
    }
    const popAc = document.getElementById('sc_aircraft_details_popover');
    if (popAc && !popAc.classList.contains('hidden') && !popAc.contains(e.target)) {
      const btn = document.getElementById('sc_aircraft_details_btn');
      if (!btn || !btn.contains(e.target)) {
        closeAircraftDetailsPopover();
      }
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeConfigFinancialPopover();
      closeAircraftDetailsPopover();
    }
  });
}

/**
 * Render Detailed Financial Overview (Point 5 - in Collapsible Dropdown Box)
 */
function renderFinancialOverview() {
  const container = document.getElementById('circuit_financials_body');
  const headerSummary = document.getElementById('sc_financials_header_summary');
  const plan = window.ACTIVE_FLEET_PLAN;

  if (!container) return;

  if (!plan) {
    container.innerHTML = `
      <div class="text-center text-slate-400 text-xs py-4">
        Add routes to view detailed financial breakdown.
      </div>
    `;
    if (headerSummary) headerSummary.innerHTML = '';
    return;
  }

  // Header quick pills
  if (headerSummary) {
    headerSummary.innerHTML = `
      <span>Realized: <strong class="text-emerald-400">${formatCurrency(plan.fleetDailyRev)}</strong>/day</span> &bull;
      <span>Max: <strong class="text-cyan-300">${formatCurrency(plan.fleetMaxDailyRev)}</strong>/day</span> &bull;
      <span>Unmet: <strong class="${plan.fleetDailyTotalUnmetLoss > 0 ? 'text-amber-400' : 'text-slate-400'}">${plan.fleetDailyTotalUnmetLoss > 0 ? `-${formatCurrency(plan.fleetDailyTotalUnmetLoss)}` : '$0'}</strong></span>
    `;
  }

  // Class yield aggregations
  let totalEcoRev = 0, totalBusRev = 0, totalFirstRev = 0, totalCargoRev = 0;
  let totalEcoMaxRev = 0, totalBusMaxRev = 0, totalFirstMaxRev = 0, totalCargoMaxRev = 0;
  let totalEcoUnmetLoss = 0, totalBusUnmetLoss = 0, totalFirstUnmetLoss = 0, totalCargoUnmetLoss = 0;
  let totalEcoEmptyLoss = 0, totalBusEmptyLoss = 0, totalFirstEmptyLoss = 0, totalCargoEmptyLoss = 0;
  let totalEcoSold = 0, totalBusSold = 0, totalFirstSold = 0, totalCargoSold = 0;
  let totalEcoDem = 0, totalBusDem = 0, totalFirstDem = 0, totalCargoDem = 0;
  let totalEcoUnmet = 0, totalBusUnmet = 0, totalFirstUnmet = 0, totalCargoUnmet = 0;
  let totalEcoEmpty = 0, totalBusEmpty = 0, totalFirstEmpty = 0, totalCargoEmpty = 0;

  plan.routeResults.forEach(r => {
    totalEcoRev += (r.sold.eco * r.prices.eco);
    totalBusRev += (r.sold.bus * r.prices.bus);
    totalFirstRev += (r.sold.first * r.prices.first);
    totalCargoRev += (r.sold.cargo * r.prices.cargo);

    totalEcoMaxRev += (r.demand.eco * r.prices.eco);
    totalBusMaxRev += (r.demand.bus * r.prices.bus);
    totalFirstMaxRev += (r.demand.first * r.prices.first);
    totalCargoMaxRev += (r.demand.cargo * r.prices.cargo);

    totalEcoUnmetLoss += (r.unmet.eco * r.prices.eco);
    totalBusUnmetLoss += (r.unmet.bus * r.prices.bus);
    totalFirstUnmetLoss += (r.unmet.first * r.prices.first);
    totalCargoUnmetLoss += (r.unmet.cargo * r.prices.cargo);

    totalEcoEmptyLoss += (r.empty.eco * r.prices.eco);
    totalBusEmptyLoss += (r.empty.bus * r.prices.bus);
    totalFirstEmptyLoss += (r.empty.first * r.prices.first);
    totalCargoEmptyLoss += (r.empty.cargo * r.prices.cargo);

    totalEcoSold += r.sold.eco;
    totalBusSold += r.sold.bus;
    totalFirstSold += r.sold.first;
    totalCargoSold += r.sold.cargo;

    totalEcoDem += r.demand.eco;
    totalBusDem += r.demand.bus;
    totalFirstDem += r.demand.first;
    totalCargoDem += r.demand.cargo;

    totalEcoUnmet += r.unmet.eco;
    totalBusUnmet += r.unmet.bus;
    totalFirstUnmet += r.unmet.first;
    totalCargoUnmet += r.unmet.cargo;

    totalEcoEmpty += r.empty.eco;
    totalBusEmpty += r.empty.bus;
    totalFirstEmpty += r.empty.first;
    totalCargoEmpty += r.empty.cargo;
  });

  const ecoCoverage = totalEcoDem > 0 ? ((totalEcoSold / totalEcoDem) * 100).toFixed(1) : '100.0';
  const busCoverage = totalBusDem > 0 ? ((totalBusSold / totalBusDem) * 100).toFixed(1) : '100.0';
  const firstCoverage = totalFirstDem > 0 ? ((totalFirstSold / totalFirstDem) * 100).toFixed(1) : '100.0';
  const cargoCoverage = totalCargoDem > 0 ? ((totalCargoSold / totalCargoDem) * 100).toFixed(1) : '100.0';

  // Per-Route Breakdown Table Rows
  let routesTableHtml = '';
  plan.routeResults.forEach(r => {
    const flag = getCountryFlag(r.leg.dstAirport?.country);
    const legStatus = r.isFull
      ? '<span class="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">✓ 100% Demand Covered</span>'
      : (r.paxCoverage >= 99.5
        ? `<span class="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">✓ ${r.paxCoverage}% PAX Covered<br><span class="text-[9px] text-slate-400">${r.unmet.eco + r.unmet.bus + r.unmet.first} PAX unmet</span></span>`
        : (r.totalEmptyLoss > 0
          ? `<span class="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-medium">Balanced Route<br><span class="text-[9px] text-slate-400">${r.routeLoadFactor}% PAX Load</span></span>`
          : `<span class="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-medium">Unmet Demand<br><span class="text-[9px] text-amber-400">-${formatCurrency(r.totalUnmetLoss)} missed</span></span>`));

    const pctOfTotal = plan.fleetDailyRev > 0 ? ((r.dailyRev / plan.fleetDailyRev) * 100).toFixed(1) : '0';

    routesTableHtml += `
      <tr class="hover:bg-slate-900/40">
        <td class="py-2.5 px-3 font-bold text-white font-sans flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full" style="background-color: ${r.leg.color};"></span>
          <span>${r.leg.hub} ✈ ${r.leg.dst}</span>
          <span class="text-xs">${flag}</span>
        </td>
        <td class="py-2.5 px-3 text-slate-300 font-mono text-center">
          ${r.leg.durationText}${plan.is168h ? '' : ` (${r.flights}×/day)`}
        </td>
        <td class="py-2.5 px-3 text-slate-300 font-mono">
          <div class="text-[11px] text-cyan-300 font-bold">${r.sold.eco} sold <span class="text-slate-500 font-normal">/ ${r.demand.eco}</span></div>
          <div class="text-[10px] text-slate-400">
            Offer: <span class="text-white">${r.offer.eco}</span>
            ${r.unmet.eco > 0 ? `<span class="text-amber-400">• ${r.unmet.eco} unmet (-${formatCurrency(r.unmetLoss.eco)})</span>` : ''}
            ${r.empty.eco > 0 ? `<span class="text-rose-400">• ${r.empty.eco} empty (-${formatCurrency(r.emptyLoss.eco)})</span>` : (r.unmet.eco === 0 ? '<span class="text-emerald-400">(0 empty)</span>' : '')}
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-300 font-mono">
          <div class="text-[11px] text-blue-300 font-bold">${r.sold.bus} sold <span class="text-slate-500 font-normal">/ ${r.demand.bus}</span></div>
          <div class="text-[10px] text-slate-400">
            Offer: <span class="text-white">${r.offer.bus}</span>
            ${r.unmet.bus > 0 ? `<span class="text-amber-400">• ${r.unmet.bus} unmet (-${formatCurrency(r.unmetLoss.bus)})</span>` : ''}
            ${r.empty.bus > 0 ? `<span class="text-rose-400">• ${r.empty.bus} empty (-${formatCurrency(r.emptyLoss.bus)})</span>` : (r.unmet.bus === 0 ? '<span class="text-emerald-400">(0 empty)</span>' : '')}
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-300 font-mono">
          <div class="text-[11px] text-amber-300 font-bold">${r.sold.first} sold <span class="text-slate-500 font-normal">/ ${r.demand.first}</span></div>
          <div class="text-[10px] text-slate-400">
            Offer: <span class="text-white">${r.offer.first}</span>
            ${r.unmet.first > 0 ? `<span class="text-amber-400">• ${r.unmet.first} unmet (-${formatCurrency(r.unmetLoss.first)})</span>` : ''}
            ${r.empty.first > 0 ? `<span class="text-rose-400">• ${r.empty.first} empty (-${formatCurrency(r.emptyLoss.first)})</span>` : (r.unmet.first === 0 ? '<span class="text-emerald-400">(0 empty)</span>' : '')}
          </div>
        </td>
        <td class="py-2.5 px-3 text-slate-300 font-mono">
          ${r.leg.cargoEnabled ? `
            <div class="text-[11px] text-emerald-300 font-bold">${r.sold.cargo}T sold <span class="text-slate-500 font-normal">/ ${r.demand.cargo}T</span></div>
            <div class="text-[10px] text-slate-400">
              Offer: <span class="text-white">${r.offer.cargo}T</span>
              ${r.unmet.cargo > 0 ? `<span class="text-amber-400">• ${r.unmet.cargo}T unmet (-${formatCurrency(r.unmetLoss.cargo)})</span>` : ''}
              ${r.empty.cargo > 0 ? `<span class="text-rose-400">• ${r.empty.cargo}T empty (-${formatCurrency(r.emptyLoss.cargo)})</span>` : (r.unmet.cargo === 0 ? '<span class="text-emerald-400">(0 empty)</span>' : '')}
            </div>
          ` : '<span class="text-[10px] text-slate-500">None</span>'}
        </td>
        <td class="py-2.5 px-3 font-mono text-right">
          <div class="font-bold text-emerald-400">${formatCurrency(r.dailyRev)}/day</div>
          <div class="text-[10px] text-slate-400">Max: <span class="text-cyan-300">${formatCurrency(r.maxDailyRev)}</span> (${pctOfTotal}%)</div>
        </td>
        <td class="py-2.5 px-3 font-mono text-right">
          <div class="text-xs ${r.totalUnmetLoss > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}">
            ${r.totalUnmetLoss > 0 ? `-${formatCurrency(r.totalUnmetLoss)}` : '$0'}
          </div>
          <div class="text-[10px] ${r.totalEmptyLoss > 0 ? 'text-rose-400' : 'text-emerald-500'}">
            Empty: ${r.totalEmptyLoss > 0 ? `-${formatCurrency(r.totalEmptyLoss)}` : '$0'}
          </div>
        </td>
        <td class="py-2.5 px-3 text-center">
          ${legStatus}
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="space-y-4">
      
      <!-- Financial KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-left font-mono-num">
        <!-- Card 1: Daily Realized Turnover -->
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="text-[10px] text-slate-400 uppercase font-medium">Daily Realized Turnover</div>
          <div class="text-base sm:text-lg font-bold text-emerald-400">${formatCurrency(plan.fleetDailyRev)}</div>
          <div class="text-[10px] text-slate-400 flex items-center justify-between">
            <span>${formatCurrency(plan.fleetWeeklyRev)} / week</span>
            <span class="text-emerald-400 font-semibold">${plan.overallCoveragePct}% of Max</span>
          </div>
        </div>

        <!-- Card 2: Max Potential Revenue -->
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="text-[10px] text-slate-400 uppercase font-medium">Max Potential Revenue</div>
          <div class="text-base sm:text-lg font-bold text-cyan-300">${formatCurrency(plan.fleetMaxDailyRev)}</div>
          <div class="text-[10px] text-slate-400 flex items-center justify-between">
            <span>${formatCurrency(plan.fleetMaxWeeklyRev)} / week</span>
            <span class="text-cyan-400">100% Demand Ceiling</span>
          </div>
        </div>

        <!-- Card 3: Unmet Demand Revenue Loss (Missed Potential) -->
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="text-[10px] text-slate-400 uppercase font-medium">Unmet Demand Loss (Missed)</div>
          <div class="text-base sm:text-lg font-bold ${plan.fleetDailyTotalUnmetLoss > 0 ? 'text-amber-400' : 'text-emerald-400'}">
            ${plan.fleetDailyTotalUnmetLoss > 0 ? `-${formatCurrency(plan.fleetDailyTotalUnmetLoss)}` : '$0'} <span class="text-xs font-normal text-slate-400">/ day</span>
          </div>
          <div class="text-[10px] text-slate-400 flex items-center justify-between gap-1 flex-wrap">
            <span>PAX: <strong class="${plan.fleetDailyPaxUnmetLoss > 0 ? 'text-amber-300' : 'text-emerald-400'}">${plan.fleetDailyPaxUnmetLoss > 0 ? `-${formatCurrency(plan.fleetDailyPaxUnmetLoss)}` : '$0'}</strong> (${plan.totalUnmetPax} PAX)</span>
            <span>Cargo: <strong class="${plan.fleetDailyCargoUnmetLoss > 0 ? 'text-amber-300' : 'text-emerald-400'}">${plan.fleetDailyCargoUnmetLoss > 0 ? `-${formatCurrency(plan.fleetDailyCargoUnmetLoss)}` : '$0'}</strong> (${plan.totalUnmetCargo}T)</span>
          </div>
        </div>

        <!-- Card 4: Empty Capacity Loss (Wasted Seats & Cargo) -->
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div class="text-[10px] text-slate-400 uppercase font-medium">Empty Capacity Loss (Wasted)</div>
          <div class="text-base sm:text-lg font-bold ${plan.fleetDailyTotalEmptyLoss > 0 ? 'text-rose-400' : 'text-emerald-400'}">
            ${plan.fleetDailyTotalEmptyLoss > 0 ? `-${formatCurrency(plan.fleetDailyTotalEmptyLoss)}` : '$0'} <span class="text-xs font-normal text-slate-400">/ day</span>
          </div>
          <div class="text-[10px] text-slate-400 flex items-center justify-between gap-1 flex-wrap">
            <span>PAX: <strong class="${plan.fleetDailyPaxEmptyLoss > 0 ? 'text-rose-400' : 'text-emerald-400'}">${plan.fleetDailyPaxEmptyLoss > 0 ? `-${formatCurrency(plan.fleetDailyPaxEmptyLoss)}` : '$0'}</strong> ${plan.totalEmptyPax > 0 ? `(${plan.totalEmptyPax.toLocaleString()} empty)` : '(0 empty)'}</span>
            <span>Cargo: <strong class="${plan.fleetDailyCargoEmptyLoss > 0 ? 'text-rose-400' : 'text-emerald-400'}">${plan.fleetDailyCargoEmptyLoss > 0 ? `-${formatCurrency(plan.fleetDailyCargoEmptyLoss)}` : '$0'}</strong> ${plan.totalEmptyCargo > 0 ? `(${plan.totalEmptyCargo.toLocaleString()}T empty)` : '(0T empty)'}</span>
          </div>
        </div>
      </div>

      <!-- Fleet Investment & Demand Overview Strip -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono-num">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-slate-400">Total Fleet Capital:</span>
          <strong class="text-white">${formatCurrency(plan.totalFleetCost)}</strong>
          <span class="text-slate-500">(${plan.totalPlanes} aircraft @ ${formatAircraftPriceShort(plan.aircraft.price)})</span>
        </div>
        <div class="flex items-center gap-3 flex-wrap text-slate-300">
          <div><span class="text-slate-500 font-sans">PAX Coverage:</span> <strong class="${plan.paxFillRate >= 99 ? 'text-emerald-400' : 'text-cyan-300'}">${plan.paxFillRate}%</strong> <span class="text-slate-500">(${plan.totalDailyPaxSold.toLocaleString()}/${plan.totalDailyPaxDem.toLocaleString()} PAX)</span></div>
          <div><span class="text-slate-500 font-sans">Cargo Coverage:</span> <strong class="text-emerald-400">${plan.cargoFillRate}%</strong> <span class="text-slate-500">(${plan.totalDailyCargoSold.toLocaleString()}T/${plan.totalDailyCargoDem.toLocaleString()}T Cargo)</span></div>
          <div><span class="text-slate-500 font-sans">Circuit Load Factor:</span> <strong class="text-emerald-400">${plan.circuitLoadFactor}%</strong></div>
          <div><span class="text-slate-500 font-sans">Payback:</span> <strong class="text-cyan-300">~${plan.paybackDays} Days</strong></div>
        </div>
      </div>

      <!-- Class Breakdown Table -->
      <div class="overflow-x-auto border border-slate-800 rounded-xl">
        <table class="w-full text-xs text-left text-slate-300">
          <thead class="text-[10px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800 font-mono">
            <tr>
              <th class="py-2.5 px-3">Cabin Class</th>
              <th class="py-2.5 px-3">Daily Sold / Demand</th>
              <th class="py-2.5 px-3 text-center">Demand Coverage</th>
              <th class="py-2.5 px-3 text-right">Daily Realized Rev</th>
              <th class="py-2.5 px-3 text-right">Max Potential Rev</th>
              <th class="py-2.5 px-3 text-right">Unmet Demand Loss</th>
              <th class="py-2.5 px-3 text-right">Empty Capacity Loss</th>
              <th class="py-2.5 px-3 text-right">Weekly Revenue</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono-num text-xs">
            <tr>
              <td class="py-2.5 px-3 font-semibold text-cyan-400">💺 Economy Class</td>
              <td class="py-2.5 px-3">${totalEcoSold.toLocaleString()} / ${totalEcoDem.toLocaleString()}</td>
              <td class="py-2.5 px-3 text-center ${ecoCoverage >= 99 ? 'text-emerald-400' : 'text-cyan-300'} font-bold">${ecoCoverage}%</td>
              <td class="py-2.5 px-3 text-right font-bold text-emerald-400">${formatCurrency(totalEcoRev)}</td>
              <td class="py-2.5 px-3 text-right font-bold text-cyan-300">${formatCurrency(totalEcoMaxRev)}</td>
              <td class="py-2.5 px-3 text-right ${totalEcoUnmetLoss > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}">
                ${totalEcoUnmetLoss > 0 ? `-${formatCurrency(totalEcoUnmetLoss)} <span class="text-[10px] text-slate-500">(${totalEcoUnmet.toLocaleString()} unmet)</span>` : '$0'}
              </td>
              <td class="py-2.5 px-3 text-right ${totalEcoEmptyLoss > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'}">
                ${totalEcoEmptyLoss > 0 ? `-${formatCurrency(totalEcoEmptyLoss)} <span class="text-[10px] text-slate-500">(${totalEcoEmpty.toLocaleString()} empty)</span>` : '$0 <span class="text-[10px] text-slate-500">(0 empty)</span>'}
              </td>
              <td class="py-2.5 px-3 text-right text-slate-300">${formatCurrency(totalEcoRev * 7)}</td>
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-semibold text-blue-400">💼 Business Class</td>
              <td class="py-2.5 px-3">${totalBusSold.toLocaleString()} / ${totalBusDem.toLocaleString()}</td>
              <td class="py-2.5 px-3 text-center ${busCoverage >= 99 ? 'text-emerald-400' : 'text-cyan-300'} font-bold">${busCoverage}%</td>
              <td class="py-2.5 px-3 text-right font-bold text-emerald-400">${formatCurrency(totalBusRev)}</td>
              <td class="py-2.5 px-3 text-right font-bold text-cyan-300">${formatCurrency(totalBusMaxRev)}</td>
              <td class="py-2.5 px-3 text-right ${totalBusUnmetLoss > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}">
                ${totalBusUnmetLoss > 0 ? `-${formatCurrency(totalBusUnmetLoss)} <span class="text-[10px] text-slate-500">(${totalBusUnmet.toLocaleString()} unmet)</span>` : '$0'}
              </td>
              <td class="py-2.5 px-3 text-right ${totalBusEmptyLoss > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'}">
                ${totalBusEmptyLoss > 0 ? `-${formatCurrency(totalBusEmptyLoss)} <span class="text-[10px] text-slate-500">(${totalBusEmpty.toLocaleString()} empty)</span>` : '$0 <span class="text-[10px] text-slate-500">(0 empty)</span>'}
              </td>
              <td class="py-2.5 px-3 text-right text-slate-300">${formatCurrency(totalBusRev * 7)}</td>
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-semibold text-amber-400">👑 First Class</td>
              <td class="py-2.5 px-3">${totalFirstSold.toLocaleString()} / ${totalFirstDem.toLocaleString()}</td>
              <td class="py-2.5 px-3 text-center ${firstCoverage >= 99 ? 'text-emerald-400' : 'text-cyan-300'} font-bold">${firstCoverage}%</td>
              <td class="py-2.5 px-3 text-right font-bold text-emerald-400">${formatCurrency(totalFirstRev)}</td>
              <td class="py-2.5 px-3 text-right font-bold text-cyan-300">${formatCurrency(totalFirstMaxRev)}</td>
              <td class="py-2.5 px-3 text-right ${totalFirstUnmetLoss > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}">
                ${totalFirstUnmetLoss > 0 ? `-${formatCurrency(totalFirstUnmetLoss)} <span class="text-[10px] text-slate-500">(${totalFirstUnmet.toLocaleString()} unmet)</span>` : '$0'}
              </td>
              <td class="py-2.5 px-3 text-right ${totalFirstEmptyLoss > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'}">
                ${totalFirstEmptyLoss > 0 ? `-${formatCurrency(totalFirstEmptyLoss)} <span class="text-[10px] text-slate-500">(${totalFirstEmpty.toLocaleString()} empty)</span>` : '$0 <span class="text-[10px] text-slate-500">(0 empty)</span>'}
              </td>
              <td class="py-2.5 px-3 text-right text-slate-300">${formatCurrency(totalFirstRev * 7)}</td>
            </tr>
            <tr>
              <td class="py-2.5 px-3 font-semibold text-emerald-400">📦 Belly Cargo</td>
              <td class="py-2.5 px-3">${totalCargoSold.toLocaleString()}T / ${totalCargoDem.toLocaleString()}T</td>
              <td class="py-2.5 px-3 text-center text-cyan-300 font-bold">${cargoCoverage}%</td>
              <td class="py-2.5 px-3 text-right font-bold text-emerald-400">${formatCurrency(totalCargoRev)}</td>
              <td class="py-2.5 px-3 text-right font-bold text-cyan-300">${formatCurrency(totalCargoMaxRev)}</td>
              <td class="py-2.5 px-3 text-right ${totalCargoUnmetLoss > 0 ? 'text-amber-400 font-semibold' : 'text-slate-500'}">
                ${totalCargoUnmetLoss > 0 ? `-${formatCurrency(totalCargoUnmetLoss)} <span class="text-[10px] text-slate-500">(${totalCargoUnmet.toLocaleString()}T unmet)</span>` : '$0'}
              </td>
              <td class="py-2.5 px-3 text-right ${totalCargoEmptyLoss > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'}">
                ${totalCargoEmptyLoss > 0 ? `-${formatCurrency(totalCargoEmptyLoss)} <span class="text-[10px] text-slate-500">(${totalCargoEmpty.toLocaleString()}T empty)</span>` : '$0 <span class="text-[10px] text-slate-500">(0T empty)</span>'}
              </td>
              <td class="py-2.5 px-3 text-right text-slate-300">${formatCurrency(totalCargoRev * 7)}</td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-950/90 border-t-2 border-slate-700 font-mono-num text-xs font-bold text-white">
            <tr>
              <td class="py-3 px-3 uppercase tracking-wider text-slate-200">
                📊 Circuit Total
              </td>
              <td class="py-3 px-3 text-white">
                <div>${(plan.totalDailyPaxSold).toLocaleString()} / ${(plan.totalDailyPaxDem).toLocaleString()} PAX</div>
                <div class="text-[10px] text-slate-400 font-normal">${(plan.totalDailyCargoSold).toLocaleString()}T / ${(plan.totalDailyCargoDem).toLocaleString()}T Cargo</div>
              </td>
              <td class="py-3 px-3 text-center text-emerald-400">
                <div>${plan.paxFillRate}% PAX Coverage</div>
                <div class="text-[10px] text-cyan-300 font-normal">${plan.circuitLoadFactor}% Circuit Load Factor</div>
              </td>
              <td class="py-3 px-3 text-right text-emerald-400 text-sm">
                ${formatCurrency(plan.fleetDailyRev)}
              </td>
              <td class="py-3 px-3 text-right text-cyan-300 text-sm">
                ${formatCurrency(plan.fleetMaxDailyRev)}
              </td>
              <td class="py-3 px-3 text-right ${plan.fleetDailyTotalUnmetLoss > 0 ? 'text-amber-400' : 'text-emerald-400'}">
                ${plan.fleetDailyTotalUnmetLoss > 0 ? `-${formatCurrency(plan.fleetDailyTotalUnmetLoss)}` : '$0'}
                <div class="text-[10px] text-slate-400 font-normal">PAX: -${formatCurrency(plan.fleetDailyPaxUnmetLoss)}</div>
              </td>
              <td class="py-3 px-3 text-right ${plan.fleetDailyTotalEmptyLoss > 0 ? 'text-rose-400' : 'text-emerald-400'}">
                ${plan.fleetDailyTotalEmptyLoss > 0 ? `-${formatCurrency(plan.fleetDailyTotalEmptyLoss)}` : '$0'}
                <div class="text-[10px] text-slate-400 font-normal">PAX: ${plan.fleetDailyPaxEmptyLoss > 0 ? `-${formatCurrency(plan.fleetDailyPaxEmptyLoss)}` : '$0'}</div>
              </td>
              <td class="py-3 px-3 text-right text-cyan-300">
                ${formatCurrency(plan.fleetWeeklyRev)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Per-Route Breakdown Table -->
      <div class="space-y-2 pt-1">
        <div class="flex items-center justify-between">
          <h5 class="text-xs font-bold uppercase tracking-wider text-slate-300">
            Per-Route Circuit Financial Breakdown
          </h5>
          <span class="text-[11px] text-slate-400 font-mono-num">${plan.routeResults.length} Routes • ${plan.totalPlanes} Aircraft</span>
        </div>

        <div class="overflow-x-auto border border-slate-800 rounded-xl">
          <table class="w-full text-xs text-left text-slate-300">
            <thead class="text-[10px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
              <tr>
                <th class="py-2.5 px-3">Route</th>
                <th class="py-2.5 px-3 text-center">RT Flight</th>
                <th class="py-2.5 px-3">Economy (Sold / Dem)</th>
                <th class="py-2.5 px-3">Business (Sold / Dem)</th>
                <th class="py-2.5 px-3">First (Sold / Dem)</th>
                <th class="py-2.5 px-3">Cargo (Sold / Dem)</th>
                <th class="py-2.5 px-3 text-right">Turnover (Realized / Max)</th>
                <th class="py-2.5 px-3 text-right">Loss (Unmet / Empty)</th>
                <th class="py-2.5 px-3 text-center">Route Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono-num">
              ${routesTableHtml}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

/**
 * Example Circuits
 */
function loadExample24hCircuit() {
  const hubInput = document.getElementById('sc_circuit_hub');
  if (hubInput) hubInput.value = 'OSL';
  window.CIRCUIT_HUB = 'OSL';

  const acSelect = document.getElementById('sc_aircraft_select');
  if (acSelect) acSelect.value = 'a320-200';

  window.CIRCUIT_LEGS = [
    {
      id: 'leg-1',
      hub: 'OSL',
      dst: 'AMS',
      dstAirport: findAirport('AMS'),
      distanceKm: 958,
      durationHours: 4.25,
      durationText: '4h 15m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 1400, bus: 360, first: 75, cargo: 20 },
      prices: { eco: 280, bus: 620, first: 1150, cargo: 3500 },
      color: CIRCUIT_COLORS[0]
    },
    {
      id: 'leg-2',
      hub: 'OSL',
      dst: 'LHR',
      dstAirport: findAirport('LHR'),
      distanceKm: 1206,
      durationHours: 4.75,
      durationText: '4h 45m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 1650, bus: 420, first: 90, cargo: 25 },
      prices: { eco: 320, bus: 710, first: 1320, cargo: 3900 },
      color: CIRCUIT_COLORS[1]
    },
    {
      id: 'leg-3',
      hub: 'OSL',
      dst: 'TOS',
      dstAirport: findAirport('TOS'),
      distanceKm: 1114,
      durationHours: 4.5,
      durationText: '4h 30m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 1100, bus: 240, first: 50, cargo: 15 },
      prices: { eco: 290, bus: 650, first: 1200, cargo: 3600 },
      color: CIRCUIT_COLORS[2]
    },
    {
      id: 'leg-4',
      hub: 'OSL',
      dst: 'CDG',
      dstAirport: findAirport('CDG'),
      distanceKm: 1356,
      durationHours: 5.25,
      durationText: '5h 15m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 1520, bus: 380, first: 85, cargo: 22 },
      prices: { eco: 340, bus: 750, first: 1400, cargo: 4100 },
      color: CIRCUIT_COLORS[3]
    },
    {
      id: 'leg-5',
      hub: 'OSL',
      dst: 'FRA',
      dstAirport: findAirport('FRA'),
      distanceKm: 1142,
      durationHours: 4.75,
      durationText: '4h 45m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 1380, bus: 350, first: 70, cargo: 18 },
      prices: { eco: 310, bus: 680, first: 1260, cargo: 3800 },
      color: CIRCUIT_COLORS[4]
    }
  ];

  autoPopulate24hCircuit();
  cancelLegEdit();
  onCircuitHubChange();
  window.CURRENT_SAVED_CIRCUIT_ID = null;
  window.CURRENT_SAVED_CIRCUIT_NAME = 'OSL 24h Regional Tour (Example)';
  window.CIRCUIT_FULFILLED_CONFIGS = {};
  if (typeof updateActiveCircuitIndicator === 'function') updateActiveCircuitIndicator();
  showToast('Loaded OSL 24-hour regional circuit (A320-200 • 23h 30m)');
}
window.loadExample24hCircuit = loadExample24hCircuit;

function loadExample168hCircuit() {
  const hubInput = document.getElementById('sc_circuit_hub');
  if (hubInput) hubInput.value = 'DWC';
  window.CIRCUIT_HUB = 'DWC';

  const acSelect = document.getElementById('sc_aircraft_select');
  if (acSelect) acSelect.value = '747-200b';

  window.CIRCUIT_LEGS = [
    {
      id: 'leg-1',
      hub: 'DWC',
      dst: 'GRU',
      dstAirport: findAirport('GRU'),
      distanceKm: 12150,
      durationHours: 39.75,
      durationText: '39h 45m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 2800, bus: 580, first: 140, cargo: 35 },
      prices: { eco: 2450, bus: 4200, first: 7500, cargo: 14000 },
      color: CIRCUIT_COLORS[0]
    },
    {
      id: 'leg-2',
      hub: 'DWC',
      dst: 'ORD',
      dstAirport: findAirport('ORD'),
      distanceKm: 11620,
      durationHours: 28.0,
      durationText: '28h 00m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 3200, bus: 680, first: 160, cargo: 40 },
      prices: { eco: 2380, bus: 4100, first: 7200, cargo: 13500 },
      color: CIRCUIT_COLORS[1]
    },
    {
      id: 'leg-3',
      hub: 'DWC',
      dst: 'MEL',
      dstAirport: findAirport('MEL'),
      distanceKm: 11650,
      durationHours: 28.0,
      durationText: '28h 00m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 2600, bus: 540, first: 120, cargo: 30 },
      prices: { eco: 2420, bus: 4150, first: 7350, cargo: 13800 },
      color: CIRCUIT_COLORS[2]
    },
    {
      id: 'leg-4',
      hub: 'DWC',
      dst: 'YYZ',
      dstAirport: findAirport('YYZ'),
      distanceKm: 11100,
      durationHours: 27.25,
      durationText: '27h 15m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 2950, bus: 610, first: 135, cargo: 32 },
      prices: { eco: 2320, bus: 3980, first: 6900, cargo: 13200 },
      color: CIRCUIT_COLORS[3]
    },
    {
      id: 'leg-5',
      hub: 'DWC',
      dst: 'GIG',
      dstAirport: findAirport('GIG'),
      distanceKm: 11900,
      durationHours: 22.0,
      durationText: '22h 00m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 2400, bus: 480, first: 110, cargo: 28 },
      prices: { eco: 2400, bus: 4100, first: 7300, cargo: 13600 },
      color: CIRCUIT_COLORS[4]
    },
    {
      id: 'leg-6',
      hub: 'DWC',
      dst: 'SYD',
      dstAirport: findAirport('SYD'),
      distanceKm: 12040,
      durationHours: 22.0,
      durationText: '22h 00m',
      flightsPerDay: 1,
      cargoEnabled: true,
      demand: { eco: 2750, bus: 560, first: 130, cargo: 34 },
      prices: { eco: 2460, bus: 4250, first: 7600, cargo: 14200 },
      color: CIRCUIT_COLORS[5]
    }
  ];

  cancelLegEdit();
  onCircuitHubChange();
  window.CURRENT_SAVED_CIRCUIT_ID = null;
  window.CURRENT_SAVED_CIRCUIT_NAME = 'DWC 168h Long-Haul Wave (Example)';
  window.CIRCUIT_FULFILLED_CONFIGS = {};
  if (typeof updateActiveCircuitIndicator === 'function') updateActiveCircuitIndicator();
  showToast('Loaded DWC 168-hour circuit (747-200B • 167h 00m • 7-Aircraft Wave)');
}
window.loadExample168hCircuit = loadExample168hCircuit;

function resetCircuitConfig() {
  isResettingCircuit = true;
  window.CIRCUIT_LEGS = [];
  window.CIRCUIT_FULFILLED_CONFIGS = {};
  window.CIRCUIT_STRATEGY_MANUAL = false;
  window.CIRCUIT_STRATEGY = 'max_profit';
  const hubInput = document.getElementById('sc_circuit_hub');
  if (hubInput) hubInput.value = 'OSL';
  window.CIRCUIT_HUB = 'OSL';

  cancelLegEdit();

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('am_circuit_state');
  }

  window.CURRENT_SAVED_CIRCUIT_ID = null;
  window.CURRENT_SAVED_CIRCUIT_NAME = null;
  if (typeof updateActiveCircuitIndicator === 'function') updateActiveCircuitIndicator();

  onCircuitHubChange();
  isResettingCircuit = false;
  showToast('Circuit reset to empty');
}
window.resetCircuitConfig = resetCircuitConfig;

/**
 * LocalStorage Save & Restore
 */
function saveSeatConfigToLocalStorage() {
  if (isResettingCircuit || typeof localStorage === 'undefined') return;

  const data = {
    hub: document.getElementById('sc_circuit_hub')?.value || window.CIRCUIT_HUB || 'OSL',
    acSelect: document.getElementById('sc_aircraft_select')?.value || '',
    strategy: window.CIRCUIT_STRATEGY || 'max_profit',
    strategyManual: !!window.CIRCUIT_STRATEGY_MANUAL,
    legs: window.CIRCUIT_LEGS || [],
    currentSavedCircuitId: window.CURRENT_SAVED_CIRCUIT_ID || null,
    currentSavedCircuitName: window.CURRENT_SAVED_CIRCUIT_NAME || null,
    fulfilledConfigs: window.CIRCUIT_FULFILLED_CONFIGS || {},
    dropdownStates: {
      schedule: !!window.isScheduleDropdownOpen,
      fleetConfig: !!window.isFleetConfigDropdownOpen,
      financials: !!window.isFinancialsDropdownOpen
    }
  };

  try {
    localStorage.setItem('am_circuit_state', JSON.stringify(data));
  } catch (e) {}
}
window.saveSeatConfigToLocalStorage = saveSeatConfigToLocalStorage;

function restoreSeatConfigFromLocalStorage() {
  if (typeof localStorage === 'undefined') return false;
  const saved = localStorage.getItem('am_circuit_state');
  if (!saved) return false;

  try {
    const data = JSON.parse(saved);
    if (data.hub) {
      window.CIRCUIT_HUB = data.hub;
      const hubInput = document.getElementById('sc_circuit_hub');
      if (hubInput) hubInput.value = data.hub;
    }
    if (data.acSelect) {
      const acSelect = document.getElementById('sc_aircraft_select');
      if (acSelect) acSelect.value = data.acSelect;
    }
    if (data.strategy) {
      window.CIRCUIT_STRATEGY = data.strategy;
      window.CIRCUIT_STRATEGY_MANUAL = (data.strategyManual !== undefined) ? !!data.strategyManual : true;
    }
    if (Array.isArray(data.legs)) {
      window.CIRCUIT_LEGS = data.legs;
    }
    if (data.fulfilledConfigs && typeof data.fulfilledConfigs === 'object') {
      window.CIRCUIT_FULFILLED_CONFIGS = { ...data.fulfilledConfigs };
    } else {
      window.CIRCUIT_FULFILLED_CONFIGS = {};
    }
    if (data.currentSavedCircuitId) {
      window.CURRENT_SAVED_CIRCUIT_ID = data.currentSavedCircuitId;
      window.CURRENT_SAVED_CIRCUIT_NAME = data.currentSavedCircuitName || null;
      if (typeof updateActiveCircuitIndicator === 'function') updateActiveCircuitIndicator();
    }
    if (data.dropdownStates && typeof data.dropdownStates === 'object') {
      if (typeof applyDropdownStateUI === 'function') {
        if (data.dropdownStates.schedule !== undefined) applyDropdownStateUI('schedule', !!data.dropdownStates.schedule);
        if (data.dropdownStates.fleetConfig !== undefined) applyDropdownStateUI('fleetConfig', !!data.dropdownStates.fleetConfig);
        if (data.dropdownStates.financials !== undefined) applyDropdownStateUI('financials', !!data.dropdownStates.financials);
      }
    }

    const aircraft = getActiveAircraft();
    if (aircraft && aircraft.speed_kmh && window.CIRCUIT_LEGS && window.CIRCUIT_LEGS.length > 0) {
      window.CIRCUIT_LEGS.forEach(leg => {
        if (leg.distanceKm) {
          leg.durationHours = calculateFlightTimeHours(leg.distanceKm, aircraft.speed_kmh);
          leg.durationText = formatHoursMinutes(leg.durationHours);
        }
      });
      const baseSingleSum = window.CIRCUIT_LEGS.reduce((acc, l) => acc + (l.durationHours || 0), 0);
      if (baseSingleSum <= 28 && window.CIRCUIT_LEGS.length === 1) {
        const maxFit = Math.max(1, Math.floor(24 / (window.CIRCUIT_LEGS[0].durationHours || 1)));
        if (!window.CIRCUIT_LEGS[0].flightsPerDay || window.CIRCUIT_LEGS[0].flightsPerDay > maxFit) {
          window.CIRCUIT_LEGS[0].flightsPerDay = maxFit;
        }
      }
    }
    updateAircraftBadges(aircraft);
    updateStrategyButtonUI();

    return true;
  } catch (e) {
    console.error('Failed to restore circuit data:', e);
    return false;
  }
}
window.restoreSeatConfigFromLocalStorage = restoreSeatConfigFromLocalStorage;

// =========================================================================
// AIRCRAFT SELECTOR HYBRID: SEARCHABLE COMBOBOX & MODAL CATALOG
// =========================================================================

function formatAircraftPriceShort(price, showSign = false) {
  if (price === 0) return showSign ? '+0' : '$0';
  if (price === null || price === undefined || isNaN(price)) return '—';

  const isNeg = price < 0;
  const abs = Math.abs(price);
  const sign = isNeg ? '-' : (showSign ? '+' : '');

  let formatted = '';
  if (abs >= 1e9) {
    formatted = `${parseFloat((abs / 1e9).toFixed(1))}B`;
  } else if (abs >= 1e6) {
    formatted = `${parseFloat((abs / 1e6).toFixed(1))}M`;
  } else if (abs >= 1e3) {
    formatted = `${parseFloat((abs / 1e3).toFixed(1))}k`;
  } else {
    formatted = `${Math.round(abs)}`;
  }
  return `${sign}$${formatted}`;
}
window.formatAircraftPriceShort = formatAircraftPriceShort;

// --- Searchable Combobox State & Functions (Solution #1) ---
let cbHaul = 'all';

function positionAircraftCombobox() {
  const popover = document.getElementById('sc_combobox_popover');
  if (!popover) return;
  // Always drop down as requested
  popover.classList.remove('bottom-full', 'mb-1.5');
  popover.classList.add('top-full', 'mt-1.5');
}

function toggleAircraftCombobox() {
  const popover = document.getElementById('sc_combobox_popover');
  const chevron = document.getElementById('sc_combobox_chevron');
  if (!popover) return;

  if (popover.classList.contains('hidden')) {
    positionAircraftCombobox();
    popover.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    renderAircraftComboboxList();
    setTimeout(() => {
      const searchInput = document.getElementById('sc_combobox_search');
      if (searchInput) searchInput.focus();

      // Check if popover bottom extends past viewport bottom and scroll into view
      const rect = popover.getBoundingClientRect();
      const padding = 16;
      if (rect.bottom > window.innerHeight) {
        window.scrollBy({
          top: rect.bottom - window.innerHeight + padding,
          behavior: 'smooth'
        });
      }
    }, 40);
  } else {
    closeAircraftCombobox();
  }
}
window.toggleAircraftCombobox = toggleAircraftCombobox;

function closeAircraftCombobox() {
  const popover = document.getElementById('sc_combobox_popover');
  const chevron = document.getElementById('sc_combobox_chevron');
  if (popover) popover.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}
window.closeAircraftCombobox = closeAircraftCombobox;

function clearAircraftComboboxSearch() {
  const searchInput = document.getElementById('sc_combobox_search');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  const clearBtn = document.getElementById('sc_combobox_clear_btn');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderAircraftComboboxList();
}
window.clearAircraftComboboxSearch = clearAircraftComboboxSearch;

function setComboboxHaul(haul) {
  cbHaul = haul;
  document.querySelectorAll('.cb-haul-btn').forEach(b => {
    if (b.dataset.val === haul) {
      b.className = 'cb-haul-btn px-2 py-0.5 rounded bg-cyan-600 text-white font-medium';
    } else {
      b.className = 'cb-haul-btn px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium';
    }
  });
  renderAircraftComboboxList();
}
window.setComboboxHaul = setComboboxHaul;

function selectAircraftFromCombobox(id) {
  const acSelect = document.getElementById('sc_aircraft_select');
  if (acSelect) {
    acSelect.value = id;
  }
  const plane = (typeof AIRCRAFT_DATABASE !== 'undefined') ? AIRCRAFT_DATABASE.find(a => a.id === id) : null;
  onAircraftSelectChange();
  closeAircraftCombobox();

  if (plane && typeof showToast === 'function') {
    showToast(`Selected ${plane.name} (${formatAircraftPriceShort(plane.price)})`);
  }
}
window.selectAircraftFromCombobox = selectAircraftFromCombobox;

function renderAircraftComboboxList() {
  if (typeof AIRCRAFT_DATABASE === 'undefined') return;

  const searchInput = document.getElementById('sc_combobox_search');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const clearBtn = document.getElementById('sc_combobox_clear_btn');
  if (clearBtn) {
    if (query) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const rangeOnly = document.getElementById('sc_combobox_range_only')?.checked || false;
  const dist = (typeof getCircuitMaxLegDistance === 'function') ? getCircuitMaxLegDistance() : 0;
  const activeAcId = document.getElementById('sc_aircraft_select')?.value;

  // Determine limiting airport category for category compatibility check
  const cbMinAirportCat = (typeof getCircuitMinAirportCategory === 'function') ? getCircuitMinAirportCategory() : null;

  const container = document.getElementById('sc_combobox_list');
  if (!container) return;

  const filtered = AIRCRAFT_DATABASE.filter(ac => {
    if (query) {
      const matchName = (ac.name || '').toLowerCase().includes(query);
      const matchMfr = (ac.manufacturer || '').toLowerCase().includes(query);
      const matchCat = `cat ${ac.category}`.includes(query) || `cat. ${ac.category}`.includes(query);
      const matchType = (ac.type || '').toLowerCase().includes(query);
      if (!matchName && !matchMfr && !matchCat && !matchType) return false;
    }
    if (cbHaul !== 'all' && ac.type !== cbHaul) return false;
    if (rangeOnly && dist > 0 && ac.range_km < dist) return false;
    return true;
  });

  const countBadge = document.getElementById('sc_combobox_match_count');
  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} of ${AIRCRAFT_DATABASE.length} aircraft`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-5 text-center text-xs text-slate-500">No aircraft matching "${query}"</div>`;
    return;
  }

  // Group by Manufacturer
  const groups = {};
  filtered.forEach(ac => {
    const m = ac.manufacturer || 'Other';
    if (!groups[m]) groups[m] = [];
    groups[m].push(ac);
  });

  let html = '';
  for (const [mfr, list] of Object.entries(groups)) {
    html += `<div class="px-3 py-0.5 bg-slate-950/95 text-[9px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur z-10 border-y border-slate-800/40">${mfr} (${list.length})</div>`;
    list.sort((a, b) => b.seats - a.seats).forEach(ac => {
      const isSelected = activeAcId === ac.id;
      const isInRange = dist <= 0 || ac.range_km >= dist;
      const isCatOk = cbMinAirportCat === null || ac.category <= cbMinAirportCat;
      const priceShort = formatAircraftPriceShort(ac.price);

      html += `
        <div onclick="selectAircraftFromCombobox('${ac.id}')" class="px-3 py-1.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-cyan-950/50 border-l-2 border-cyan-400' : ''}">
          <div class="space-y-0.5 min-w-0 pr-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-semibold text-xs text-white truncate">${ac.name}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">${ac.type}</span>
              ${!isInRange ? `<span class="text-[9px] px-1 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono">Short</span>` : ''}
              ${!isCatOk ? `<span class="text-[9px] px-1 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono" title="Aircraft Cat. ${ac.category} exceeds airport limit (Cat. ${cbMinAirportCat})">Cat!</span>` : ''}
            </div>
            <div class="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>${ac.seats} seats</span>
              <span>•</span>
              <span>${ac.speed_kmh} km/h</span>
              <span>•</span>
              <span>${ac.range_km.toLocaleString()} km</span>
            </div>
          </div>
          <div class="text-right shrink-0 flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-emerald-400" title="${formatCurrency(ac.price)}">${priceShort}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">Cat. ${ac.category}</span>
          </div>
        </div>
      `;
    });
  }


  container.innerHTML = html;
}
window.renderAircraftComboboxList = renderAircraftComboboxList;

// --- Modal State & Functions (Solution #2) ---
let acModalHaul = 'all';
let acModalView = 'grid';
let isAcModalInitialized = false;

function initAircraftModal() {
  if (isAcModalInitialized) return;
  isAcModalInitialized = true;

  // Populate manufacturers dropdown if not yet populated
  const mfrSelect = document.getElementById('ac_modal_mfr_filter');
  if (mfrSelect && typeof AIRCRAFT_DATABASE !== 'undefined') {
    const mfrs = [...new Set(AIRCRAFT_DATABASE.map(a => a.manufacturer || 'Other'))].sort();
    mfrSelect.innerHTML = `<option value="all">All Manufacturers (${mfrs.length})</option>` +
      mfrs.map(m => `<option value="${m}">${m}</option>`).join('');
  }

  // Click outside to close combobox popover
  document.addEventListener('click', (e) => {
    const root = document.getElementById('sc_aircraft_combobox_root');
    if (root && !root.contains(e.target)) {
      closeAircraftCombobox();
    }
  });

  // Keyboard shortcut: Escape to close modal and combobox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const popover = document.getElementById('sc_combobox_popover');
      if (popover && !popover.classList.contains('hidden')) {
        closeAircraftCombobox();
      }
      const backdrop = document.getElementById('ac_modal_backdrop');
      if (backdrop && !backdrop.classList.contains('hidden')) {
        closeAircraftModal();
      }
    }
  });
}
window.initAircraftModal = initAircraftModal;

function openAircraftModal() {
  const backdrop = document.getElementById('ac_modal_backdrop');
  if (!backdrop) return;

  initAircraftModal();

  // Update route distance reference in modal
  const dist = (typeof getCircuitMaxLegDistance === 'function') ? getCircuitMaxLegDistance() : 0;
  const distTextEl = document.getElementById('ac_modal_route_dist_text');
  if (distTextEl) {
    distTextEl.textContent = dist > 0 ? `${dist.toLocaleString()} km` : '0 km';
  }

  backdrop.classList.remove('hidden');
  renderAircraftModalContent();

  // Focus search input automatically
  setTimeout(() => {
    const searchInput = document.getElementById('ac_modal_search');
    if (searchInput) searchInput.focus();
  }, 60);
}
window.openAircraftModal = openAircraftModal;

function closeAircraftModal() {
  const backdrop = document.getElementById('ac_modal_backdrop');
  if (backdrop) backdrop.classList.add('hidden');
}
window.closeAircraftModal = closeAircraftModal;

function handleAircraftModalBackdropClick(event) {
  if (event.target && event.target.id === 'ac_modal_backdrop') {
    closeAircraftModal();
  }
}
window.handleAircraftModalBackdropClick = handleAircraftModalBackdropClick;

function clearAircraftModalSearch() {
  const searchInput = document.getElementById('ac_modal_search');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  const clearBtn = document.getElementById('ac_modal_clear_btn');
  if (clearBtn) clearBtn.classList.add('hidden');
  renderAircraftModalContent();
}
window.clearAircraftModalSearch = clearAircraftModalSearch;

function setAircraftModalHaul(haul) {
  acModalHaul = haul;
  document.querySelectorAll('.ac-modal-haul-btn').forEach(b => {
    if (b.dataset.val === haul) {
      b.className = 'ac-modal-haul-btn px-2 py-0.5 rounded bg-cyan-600 text-white font-medium text-[11px]';
    } else {
      b.className = 'ac-modal-haul-btn px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium text-[11px]';
    }
  });
  renderAircraftModalContent();
}
window.setAircraftModalHaul = setAircraftModalHaul;

function setAircraftModalView(view) {
  acModalView = view;
  const gridBtn = document.getElementById('ac_modal_view_grid');
  const tableBtn = document.getElementById('ac_modal_view_table');
  if (gridBtn && tableBtn) {
    if (view === 'grid') {
      gridBtn.className = 'p-1.5 rounded-lg bg-cyan-600 text-white shadow';
      tableBtn.className = 'p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white';
    } else {
      tableBtn.className = 'p-1.5 rounded-lg bg-cyan-600 text-white shadow';
      gridBtn.className = 'p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white';
    }
  }
  renderAircraftModalContent();
}
window.setAircraftModalView = setAircraftModalView;

function selectAircraftFromModal(id) {
  const acSelect = document.getElementById('sc_aircraft_select');
  if (acSelect) {
    acSelect.value = id;
  }
  const plane = (typeof AIRCRAFT_DATABASE !== 'undefined') ? AIRCRAFT_DATABASE.find(a => a.id === id) : null;
  onAircraftSelectChange();
  closeAircraftModal();

  if (plane && typeof showToast === 'function') {
    showToast(`Selected ${plane.name} (${formatAircraftPriceShort(plane.price)})`);
  }
}
window.selectAircraftFromModal = selectAircraftFromModal;

function renderAircraftModalContent() {
  if (typeof AIRCRAFT_DATABASE === 'undefined') return;

  const searchInput = document.getElementById('ac_modal_search');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const clearBtn = document.getElementById('ac_modal_clear_btn');
  if (clearBtn) {
    if (query) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }

  const sortVal = document.getElementById('ac_modal_sort')?.value || 'seats_desc';
  const mfrVal = document.getElementById('ac_modal_mfr_filter')?.value || 'all';
  const rangeOnly = document.getElementById('ac_modal_range_only')?.checked || false;

  const dist = (typeof getCircuitMaxLegDistance === 'function') ? getCircuitMaxLegDistance() : 0;
  const activeAcId = document.getElementById('sc_aircraft_select')?.value;
  const activePlane = AIRCRAFT_DATABASE.find(a => a.id === activeAcId);

  // Update Footer Active Plane
  const footerActiveEl = document.getElementById('ac_modal_footer_active');
  const footerPriceEl = document.getElementById('ac_modal_footer_price');
  if (footerActiveEl) footerActiveEl.textContent = activePlane ? activePlane.name : '—';
  if (footerPriceEl) footerPriceEl.textContent = activePlane ? `• ${formatAircraftPriceShort(activePlane.price)} (${formatCurrency(activePlane.price)})` : '';

  // Filter
  let list = AIRCRAFT_DATABASE.filter(ac => {
    if (query) {
      const matchName = (ac.name || '').toLowerCase().includes(query);
      const matchMfr = (ac.manufacturer || '').toLowerCase().includes(query);
      const matchCat = `cat ${ac.category}`.includes(query) || `cat. ${ac.category}`.includes(query);
      const matchHaul = (ac.type || '').toLowerCase().includes(query);
      if (!matchName && !matchMfr && !matchCat && !matchHaul) return false;
    }
    if (acModalHaul !== 'all' && ac.type !== acModalHaul) return false;
    if (mfrVal !== 'all' && ac.manufacturer !== mfrVal) return false;
    if (rangeOnly && dist > 0 && ac.range_km < dist) return false;
    return true;
  });

  // Sort
  list.sort((a, b) => {
    if (sortVal === 'seats_desc') return b.seats - a.seats;
    if (sortVal === 'range_desc') return b.range_km - a.range_km;
    if (sortVal === 'speed_desc') return b.speed_kmh - a.speed_kmh;
    if (sortVal === 'price_asc') return (a.price || 0) - (b.price || 0);
    if (sortVal === 'price_desc') return (b.price || 0) - (a.price || 0);
    if (sortVal === 'cat_asc') return a.category - b.category;
    if (sortVal === 'cat_desc') return b.category - a.category;
    if (sortVal === 'name_asc') return a.name.localeCompare(b.name);
    return 0;
  });

  // Count
  const countBadge = document.getElementById('ac_modal_match_count');
  if (countBadge) countBadge.textContent = `${list.length} Models`;

  const container = document.getElementById('ac_modal_content');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-slate-500 space-y-2">
        <div class="text-3xl">✈️</div>
        <div class="text-sm font-semibold text-slate-400">No aircraft match your current filters</div>
        <p class="text-xs">Try loosening search keywords or clearing the range filter</p>
      </div>
    `;
    return;
  }

  if (acModalView === 'table') {
    let html = `
      <div class="overflow-x-auto border border-slate-800 rounded-xl">
        <table class="w-full text-xs text-left text-slate-300">
          <thead class="text-[10px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
            <tr>
              <th class="px-3 py-2.5">Model</th>
              <th class="px-3 py-2.5">Manufacturer</th>
              <th class="px-3 py-2.5">Category</th>
              <th class="px-3 py-2.5">Haul</th>
              <th class="px-3 py-2.5 text-right">Max Seats</th>
              <th class="px-3 py-2.5 text-right">Speed</th>
              <th class="px-3 py-2.5 text-right">Range</th>
              <th class="px-3 py-2.5 text-right font-bold text-emerald-400">Airplane Price</th>
              <th class="px-3 py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
    `;
    list.forEach(ac => {
      const isSelected = activeAcId === ac.id;
      const isInRange = dist <= 0 || ac.range_km >= dist;
      const priceShort = formatAircraftPriceShort(ac.price);
      html += `
        <tr class="hover:bg-slate-800/40 cursor-pointer transition ${isSelected ? 'bg-cyan-950/30 font-semibold' : ''}" onclick="selectAircraftFromModal('${ac.id}')">
          <td class="px-3 py-2.5 font-bold text-white flex items-center gap-1.5">
            ${isSelected ? '<span class="text-cyan-400">✓</span>' : ''}
            <span>${ac.name}</span>
          </td>
          <td class="px-3 py-2.5 text-slate-400">${ac.manufacturer || 'Other'}</td>
          <td class="px-3 py-2.5"><span class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">Cat. ${ac.category}</span></td>
          <td class="px-3 py-2.5 text-slate-400">${ac.type}</td>
          <td class="px-3 py-2.5 text-right font-mono font-bold text-white">${ac.seats}</td>
          <td class="px-3 py-2.5 text-right font-mono text-cyan-300">${ac.speed_kmh} km/h</td>
          <td class="px-3 py-2.5 text-right font-mono ${isInRange ? 'text-emerald-400' : 'text-rose-400'}">${ac.range_km.toLocaleString()} km</td>
          <td class="px-3 py-2.5 text-right font-mono font-bold text-emerald-400" title="${formatCurrency(ac.price)}">${priceShort}</td>
          <td class="px-3 py-2.5 text-center" onclick="event.stopPropagation()">
            <button type="button" onclick="selectAircraftFromModal('${ac.id}')" class="px-2.5 py-1 rounded text-xs font-semibold ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 hover:bg-cyan-600 text-white'} transition">
              ${isSelected ? 'Selected' : 'Select'}
            </button>
          </td>
        </tr>
      `;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
  } else {
    // Grid Cards View
    let html = `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">`;
    list.forEach(ac => {
      const isSelected = activeAcId === ac.id;
      const isInRange = dist <= 0 || ac.range_km >= dist;
      const priceShort = formatAircraftPriceShort(ac.price);
      const priceFull = formatCurrency(ac.price);
      const rangePct = Math.min(100, Math.round((ac.range_km / 16000) * 100));

      html += `
        <div onclick="selectAircraftFromModal('${ac.id}')" class="p-3.5 rounded-xl bg-slate-950/80 border ${isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/50 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700'} flex flex-col justify-between space-y-3 cursor-pointer transition group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] uppercase font-semibold text-slate-400 tracking-wider truncate">${ac.manufacturer || 'Other'}</span>
              <div class="flex items-center gap-1 shrink-0">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">Cat. ${ac.category}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">${ac.type}</span>
              </div>
            </div>
            <div class="flex items-baseline justify-between gap-2">
              <h4 class="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">${ac.name}</h4>
              <span class="text-xs font-mono font-bold text-emerald-400 shrink-0" title="${priceFull}">${priceShort}</span>
            </div>
          </div>

          <!-- Specs Grid -->
          <div class="grid grid-cols-4 gap-1 py-1.5 border-y border-slate-800/80 text-center font-mono">
            <div class="bg-slate-900/60 p-1 rounded">
              <div class="text-[9px] text-slate-400 uppercase">Seats</div>
              <div class="text-xs font-bold text-white">${ac.seats}</div>
            </div>
            <div class="bg-slate-900/60 p-1 rounded">
              <div class="text-[9px] text-slate-400 uppercase">Speed</div>
              <div class="text-xs font-bold text-cyan-300">${ac.speed_kmh}</div>
            </div>
            <div class="bg-slate-900/60 p-1 rounded">
              <div class="text-[9px] text-slate-400 uppercase">Range</div>
              <div class="text-xs font-bold ${isInRange ? 'text-emerald-400' : 'text-rose-400'}">${(ac.range_km/1000).toFixed(1)}k</div>
            </div>
            <div class="bg-slate-900/60 p-1 rounded">
              <div class="text-[9px] text-slate-400 uppercase">Payload</div>
              <div class="text-xs font-bold text-slate-300">${ac.payload_ton || '—'}T</div>
            </div>
          </div>

          <!-- Range Bar -->
          <div class="space-y-1 text-[10px]">
            <div class="flex justify-between text-slate-400">
              <span>Range: ${ac.range_km.toLocaleString()} km</span>
              ${dist > 0 ? (isInRange 
                ? `<span class="text-emerald-400 font-medium">+${(ac.range_km - dist).toLocaleString()} km reserve</span>` 
                : `<span class="text-rose-400 font-medium">${(dist - ac.range_km).toLocaleString()} km short</span>`
              ) : '<span class="text-slate-500">Max 16k km</span>'}
            </div>
            <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div class="h-1.5 rounded-full ${isInRange ? 'bg-emerald-500' : 'bg-rose-500'}" style="width: ${rangePct}%"></div>
            </div>
          </div>

          <!-- Select Button -->
          <div onclick="event.stopPropagation()">
            <button type="button" onclick="selectAircraftFromModal('${ac.id}')" class="w-full py-1.5 rounded-lg text-xs font-semibold ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 hover:bg-cyan-600 hover:text-white border border-slate-700'} transition shadow">
              ${isSelected ? '✓ Current Selection' : 'Select Aircraft'}
            </button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }
}
window.renderAircraftModalContent = renderAircraftModalContent;

/* ==========================================================================
   CIRCUIT PERSISTENCE, SAVED CIRCUITS LIBRARY & IMPORT/EXPORT ENGINE
   ========================================================================== */

window.CURRENT_SAVED_CIRCUIT_ID = null;
window.CURRENT_SAVED_CIRCUIT_NAME = null;
let expandedSavedCircuitIds = new Set();
let pendingImportCircuitData = null;

const STARTER_CIRCUITS = [];

function getSavedCircuits() {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem('am_saved_circuits_v1');
  if (!raw) {
    return [];
  }
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}
window.getSavedCircuits = getSavedCircuits;

function saveSavedCircuits(circuits) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem('am_saved_circuits_v1', JSON.stringify(circuits));
  } catch (e) {}
  updateSavedCircuitsBadge();
}

function updateSavedCircuitsBadge() {
  const circuits = getSavedCircuits();
  const count = circuits.length;
  const countBadge = document.getElementById('saved_circuits_count_badge');
  const rfFloatingBadge = document.getElementById('rf_floating_saved_circuits_count');
  const rfHeaderBadge = document.getElementById('header_saved_circuits_count');
  const modalCountBadge = document.getElementById('modal_circuits_count_badge');
  const modalStorageUsage = document.getElementById('modal_storage_usage');

  if (countBadge) countBadge.textContent = count;
  if (rfFloatingBadge) rfFloatingBadge.textContent = count;
  if (rfHeaderBadge) rfHeaderBadge.textContent = count;
  document.querySelectorAll('.floating_circuits_badge').forEach(el => {
    el.textContent = count;
  });
  if (modalCountBadge) modalCountBadge.textContent = `${count} ${count === 1 ? 'Circuit' : 'Circuits'} Saved`;
  if (modalStorageUsage) modalStorageUsage.textContent = `${count} ${count === 1 ? 'circuit' : 'circuits'}`;
}
window.updateSavedCircuitsBadge = updateSavedCircuitsBadge;

function updateActiveCircuitIndicator() {
  const ind = document.getElementById('active_circuit_indicator');
  const nameEl = document.getElementById('active_circuit_name');
  if (!ind || !nameEl) return;

  if (window.CURRENT_SAVED_CIRCUIT_NAME) {
    nameEl.textContent = window.CURRENT_SAVED_CIRCUIT_NAME;
    ind.classList.remove('hidden');
    ind.classList.add('inline-flex');
  } else if (window.CIRCUIT_LEGS && window.CIRCUIT_LEGS.length > 0) {
    nameEl.textContent = 'Custom Circuit';
    ind.classList.remove('hidden');
    ind.classList.add('inline-flex');
  } else {
    ind.classList.remove('inline-flex');
    ind.classList.add('hidden');
  }
}
window.updateActiveCircuitIndicator = updateActiveCircuitIndicator;

// --- Save Circuit Dialog ---

function openSaveCircuitModal() {
  if (!window.CIRCUIT_LEGS || window.CIRCUIT_LEGS.length === 0) {
    showToast('Add at least one route to your circuit before saving.', 'warning');
    return;
  }

  const modal = document.getElementById('save_prompt_modal_backdrop');
  if (!modal) return;

  const hub = document.getElementById('sc_circuit_hub')?.value.trim().toUpperCase() || window.CIRCUIT_HUB || 'OSL';
  const aircraft = getActiveAircraft();
  const legs = window.CIRCUIT_LEGS || [];
  const singleCycleSum = legs.reduce((acc, l) => acc + (l.durationHours || 0), 0);

  const nameInput = document.getElementById('save_circuit_name_input');
  if (nameInput) {
    if (window.CURRENT_SAVED_CIRCUIT_NAME && !window.CURRENT_SAVED_CIRCUIT_NAME.includes('(Example)')) {
      nameInput.value = window.CURRENT_SAVED_CIRCUIT_NAME;
    } else {
      const typeLabel = singleCycleSum > 24 ? '168h' : '24h';
      nameInput.value = `${hub} ${typeLabel} Circuit (${legs.length} Routes)`;
    }
  }

  const hubDisplay = document.getElementById('save_summary_hub');
  if (hubDisplay) hubDisplay.textContent = hub;

  const acDisplay = document.getElementById('save_summary_ac');
  if (acDisplay) acDisplay.textContent = aircraft ? aircraft.name : 'Selected Aircraft';

  const durDisplay = document.getElementById('save_summary_dur');
  if (durDisplay) durDisplay.textContent = `${formatHoursMinutes(singleCycleSum)} (${legs.length} Routes)`;

  const overwriteBox = document.getElementById('save_overwrite_container');
  const overwriteName = document.getElementById('save_overwrite_target_name');
  const overwriteCb = document.getElementById('save_overwrite_checkbox');

  const savedList = getSavedCircuits();
  if (window.CURRENT_SAVED_CIRCUIT_ID && savedList.some(c => c.id === window.CURRENT_SAVED_CIRCUIT_ID)) {
    if (overwriteBox) overwriteBox.classList.remove('hidden');
    if (overwriteName) overwriteName.textContent = window.CURRENT_SAVED_CIRCUIT_NAME || 'Active Circuit';
    if (overwriteCb) overwriteCb.checked = true;
  } else {
    if (overwriteBox) overwriteBox.classList.add('hidden');
    if (overwriteCb) overwriteCb.checked = false;
  }

  modal.classList.remove('hidden');
  setTimeout(() => {
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }, 60);
}
window.openSaveCircuitModal = openSaveCircuitModal;

function closeSaveCircuitModal() {
  const modal = document.getElementById('save_prompt_modal_backdrop');
  if (modal) modal.classList.add('hidden');
}
window.closeSaveCircuitModal = closeSaveCircuitModal;

function executeSaveCircuit() {
  const nameInput = document.getElementById('save_circuit_name_input');
  const rawName = nameInput?.value.trim();
  const hub = document.getElementById('sc_circuit_hub')?.value.trim().toUpperCase() || window.CIRCUIT_HUB || 'OSL';
  const legs = window.CIRCUIT_LEGS || [];

  if (legs.length === 0) {
    showToast('Circuit has no routes to save.', 'warning');
    closeSaveCircuitModal();
    return;
  }

  const name = rawName || `${hub} Circuit (${legs.length} Routes)`;
  const isOverwrite = document.getElementById('save_overwrite_checkbox')?.checked;
  const aircraft = getActiveAircraft();
  const singleCycleSum = legs.reduce((acc, l) => acc + (l.durationHours || 0), 0);
  const is168 = singleCycleSum > 24;

  const cleanCircuit = {
    version: 1,
    name: name,
    hub: hub,
    acId: document.getElementById('sc_aircraft_select')?.value || (aircraft ? aircraft.id : ''),
    acName: aircraft ? aircraft.name : 'Selected Aircraft',
    strategy: window.CIRCUIT_STRATEGY || 'max_profit',
    fulfilledConfigs: { ...(window.CIRCUIT_FULFILLED_CONFIGS || {}) },
    summary: {
      circuitType: is168 ? '168h' : '24h',
      totalDurationHours: Math.round(singleCycleSum * 100) / 100,
      totalDurationText: formatHoursMinutes(singleCycleSum),
      routeCount: legs.length
    },
    legs: legs.map(l => ({
      dst: l.dst,
      distanceKm: l.distanceKm || 0,
      durationHours: l.durationHours || 0,
      durationText: l.durationText || formatHoursMinutes(l.durationHours || 0),
      flightsPerDay: l.flightsPerDay || 1,
      cargoEnabled: l.cargoEnabled !== false,
      demand: {
        eco: parseInt(l.demand?.eco) || 0,
        bus: parseInt(l.demand?.bus) || 0,
        first: parseInt(l.demand?.first) || 0,
        cargo: parseInt(l.demand?.cargo) || 0
      },
      prices: {
        eco: parseFloat(l.prices?.eco) || 0,
        bus: parseFloat(l.prices?.bus) || 0,
        first: parseFloat(l.prices?.first) || 0,
        cargo: parseFloat(l.prices?.cargo) || 0
      },
      color: l.color
    }))
  };

  let savedList = getSavedCircuits();

  if (isOverwrite && window.CURRENT_SAVED_CIRCUIT_ID) {
    const idx = savedList.findIndex(c => c.id === window.CURRENT_SAVED_CIRCUIT_ID);
    if (idx !== -1) {
      savedList[idx] = {
        ...cleanCircuit,
        id: window.CURRENT_SAVED_CIRCUIT_ID,
        createdAt: savedList[idx].createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      window.CURRENT_SAVED_CIRCUIT_NAME = name;
      showToast(`Updated circuit: "${name}"`, 'success');
    } else {
      const newId = 'circuit-' + Date.now();
      cleanCircuit.id = newId;
      cleanCircuit.createdAt = new Date().toISOString();
      savedList.unshift(cleanCircuit);
      window.CURRENT_SAVED_CIRCUIT_ID = newId;
      window.CURRENT_SAVED_CIRCUIT_NAME = name;
      showToast(`Saved new circuit: "${name}"`, 'success');
    }
  } else {
    const newId = 'circuit-' + Date.now();
    cleanCircuit.id = newId;
    cleanCircuit.createdAt = new Date().toISOString();
    savedList.unshift(cleanCircuit);
    window.CURRENT_SAVED_CIRCUIT_ID = newId;
    window.CURRENT_SAVED_CIRCUIT_NAME = name;
    showToast(`Saved circuit: "${name}"`, 'success');
  }

  saveSavedCircuits(savedList);
  updateActiveCircuitIndicator();
  closeSaveCircuitModal();
}
window.executeSaveCircuit = executeSaveCircuit;

// --- Load Circuit Action ---

function loadSavedCircuit(id) {
  const list = getSavedCircuits();
  const circuit = (typeof id === 'object' && id !== null) ? id : list.find(c => c.id === id);
  if (!circuit) {
    showToast('Circuit not found in library.', 'warning');
    return;
  }

  // Restore Fulfilled Configs
  window.CIRCUIT_FULFILLED_CONFIGS = (circuit.fulfilledConfigs && typeof circuit.fulfilledConfigs === 'object')
    ? { ...circuit.fulfilledConfigs }
    : {};

  // Restore Hub
  window.CIRCUIT_HUB = circuit.hub || 'OSL';
  const hubInput = document.getElementById('sc_circuit_hub');
  if (hubInput) hubInput.value = window.CIRCUIT_HUB;

  // Restore Aircraft
  const acSelect = document.getElementById('sc_aircraft_select');
  if (acSelect && circuit.acId) {
    acSelect.value = circuit.acId;
  }

  // Restore Strategy
  if (circuit.strategy) {
    window.CIRCUIT_STRATEGY = circuit.strategy;
    window.CIRCUIT_STRATEGY_MANUAL = true;
    updateStrategyButtonUI();
  }

  // Restore Legs with airport lookup
  window.CIRCUIT_LEGS = (circuit.legs || []).map((l, idx) => ({
    id: l.id || `leg-${idx + 1}`,
    hub: window.CIRCUIT_HUB,
    dst: l.dst,
    dstAirport: findAirport(l.dst),
    distanceKm: l.distanceKm || 0,
    durationHours: l.durationHours || 0,
    durationText: l.durationText || formatHoursMinutes(l.durationHours || 0),
    flightsPerDay: l.flightsPerDay || 1,
    cargoEnabled: l.cargoEnabled !== false,
    demand: {
      eco: parseInt(l.demand?.eco) || 0,
      bus: parseInt(l.demand?.bus) || 0,
      first: parseInt(l.demand?.first) || 0,
      cargo: parseInt(l.demand?.cargo) || 0
    },
    prices: {
      eco: parseFloat(l.prices?.eco) || 0,
      bus: parseFloat(l.prices?.bus) || 0,
      first: parseFloat(l.prices?.first) || 0,
      cargo: parseFloat(l.prices?.cargo) || 0
    },
    color: l.color || CIRCUIT_COLORS[idx % CIRCUIT_COLORS.length]
  }));

  window.CURRENT_SAVED_CIRCUIT_ID = circuit.id;
  window.CURRENT_SAVED_CIRCUIT_NAME = circuit.name;
  updateActiveCircuitIndicator();

  cancelLegEdit();
  onCircuitHubChange();
  onAircraftSelectChange();
  renderCircuitAll();
  saveSeatConfigToLocalStorage();

  closeSavedCircuitsModal();
  showToast(`Loaded circuit: "${circuit.name}" (${window.CIRCUIT_LEGS.length} routes restored)`, 'success');
}
window.loadSavedCircuit = loadSavedCircuit;

// --- Saved Circuits Manager Modal & Card Rendering ---

function openSavedCircuitsModal() {
  const modal = document.getElementById('saved_circuits_modal_backdrop');
  if (!modal) return;

  renderSavedCircuitsList();
  switchCircuitModalTab('my_circuits');
  modal.classList.remove('hidden');

  setTimeout(() => {
    const search = document.getElementById('saved_circuits_search');
    if (search) search.focus();
  }, 60);
}
window.openSavedCircuitsModal = openSavedCircuitsModal;

function closeSavedCircuitsModal() {
  const modal = document.getElementById('saved_circuits_modal_backdrop');
  if (modal) modal.classList.add('hidden');
}
window.closeSavedCircuitsModal = closeSavedCircuitsModal;

function switchCircuitModalTab(tab) {
  const tabMy = document.getElementById('circuit_tab_btn_my');
  const tabImp = document.getElementById('circuit_tab_btn_import');
  const viewMy = document.getElementById('circuit_tab_view_my');
  const viewImp = document.getElementById('circuit_tab_view_import');

  if (tab === 'my_circuits') {
    if (tabMy) tabMy.className = 'py-3 px-3 border-b-2 border-cyan-500 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition';
    if (tabImp) tabImp.className = 'py-3 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition';
    if (viewMy) viewMy.classList.remove('hidden');
    if (viewImp) viewImp.classList.add('hidden');
  } else {
    if (tabImp) tabImp.className = 'py-3 px-3 border-b-2 border-cyan-500 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition';
    if (tabMy) tabMy.className = 'py-3 px-3 border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition';
    if (viewImp) viewImp.classList.remove('hidden');
    if (viewMy) viewMy.classList.add('hidden');
  }
}
window.switchCircuitModalTab = switchCircuitModalTab;

function toggleSavedCircuitDetails(id) {
  if (expandedSavedCircuitIds.has(id)) {
    expandedSavedCircuitIds.delete(id);
  } else {
    expandedSavedCircuitIds.add(id);
  }
  renderSavedCircuitsList();
}
window.toggleSavedCircuitDetails = toggleSavedCircuitDetails;

function renderSavedCircuitsList() {
  const container = document.getElementById('saved_circuits_cards_container');
  if (!container) return;

  const search = (document.getElementById('saved_circuits_search')?.value || '').toLowerCase().trim();
  const sort = document.getElementById('saved_circuits_sort')?.value || 'date_desc';

  let list = getSavedCircuits();

  if (search) {
    list = list.filter(c => 
      c.name.toLowerCase().includes(search) ||
      c.hub.toLowerCase().includes(search) ||
      (c.acName && c.acName.toLowerCase().includes(search)) ||
      (c.legs && c.legs.some(l => l.dst.toLowerCase().includes(search)))
    );
  }

  if (sort === 'name_asc') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'routes_desc') {
    list.sort((a, b) => (b.legs?.length || 0) - (a.legs?.length || 0));
  } else if (sort === 'duration_desc') {
    list.sort((a, b) => (b.summary?.totalDurationHours || 0) - (a.summary?.totalDurationHours || 0));
  }

  updateSavedCircuitsBadge();

  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
        <div class="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <div class="text-xs font-semibold text-slate-300">No circuits found</div>
        <div class="text-[11px] text-slate-500 mt-1">Configure routes in the configurator and click "Save Circuit" to add one.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(c => {
    const isCurrentlyActive = (c.id === window.CURRENT_SAVED_CIRCUIT_ID);
    const isExpanded = expandedSavedCircuitIds.has(c.id);
    const hubAirport = findAirport(c.hub);
    const hubFlag = hubAirport ? getCountryFlag(hubAirport.country) : '✈️';

    const routeChips = (c.legs || []).map(l => `
      <span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 font-semibold" title="${l.dst} • ${l.durationText} • Eco: ${l.demand?.eco || 0}">
        ${l.dst}
      </span>
    `).join('');

    const stratBadge = c.strategy === 'max_profit'
      ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">💰 Max Profit</span>'
      : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">🛡️ Zero Empty</span>';

    const detailsTableHtml = `
      <div class="${isExpanded ? 'block' : 'hidden'} mt-3 pt-3 border-t border-slate-800 bg-slate-950/60 rounded-xl p-3 space-y-2">
        <div class="text-[11px] font-bold text-slate-300 flex items-center justify-between">
          <span>Detailed Route Demand & Audit Prices:</span>
          <span class="text-slate-500 font-normal text-[10px]">Restores all passenger and cargo demand and prices directly</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[11px] text-slate-300">
            <thead>
              <tr class="text-slate-500 border-b border-slate-800 text-[10px] uppercase">
                <th class="py-1 px-2">#</th>
                <th class="py-1 px-2">Route</th>
                <th class="py-1 px-2">Duration</th>
                <th class="py-1 px-2">Distance</th>
                <th class="py-1 px-2 text-cyan-400">Eco Dem.</th>
                <th class="py-1 px-2 text-cyan-400">Eco Price</th>
                <th class="py-1 px-2 text-blue-400">Bus Dem.</th>
                <th class="py-1 px-2 text-blue-400">Bus Price</th>
                <th class="py-1 px-2 text-purple-400">1st Dem.</th>
                <th class="py-1 px-2 text-purple-400">1st Price</th>
                <th class="py-1 px-2 text-amber-400">Cargo Dem.</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono-num text-[10px]">
              ${(c.legs || []).map((leg, lIdx) => {
                const dstAp = findAirport(leg.dst);
                const dstCity = dstAp ? dstAp.city : leg.dst;
                return `
                  <tr class="hover:bg-slate-900/50">
                    <td class="py-1.5 px-2 text-slate-500">${lIdx + 1}</td>
                    <td class="py-1.5 px-2 font-bold text-white font-mono">${c.hub} &rarr; ${leg.dst} <span class="text-slate-400 font-normal font-sans">(${dstCity})</span></td>
                    <td class="py-1.5 px-2 text-amber-300">${leg.durationText}</td>
                    <td class="py-1.5 px-2 text-slate-400">${leg.distanceKm?.toLocaleString()} km</td>
                    <td class="py-1.5 px-2 text-cyan-300 font-bold">${leg.demand?.eco?.toLocaleString() || 0}</td>
                    <td class="py-1.5 px-2 text-cyan-400">$${leg.prices?.eco || 0}</td>
                    <td class="py-1.5 px-2 text-blue-300 font-bold">${leg.demand?.bus?.toLocaleString() || 0}</td>
                    <td class="py-1.5 px-2 text-blue-400">$${leg.prices?.bus || 0}</td>
                    <td class="py-1.5 px-2 text-purple-300 font-bold">${leg.demand?.first?.toLocaleString() || 0}</td>
                    <td class="py-1.5 px-2 text-purple-400">$${leg.prices?.first || 0}</td>
                    <td class="py-1.5 px-2 text-amber-300 font-bold">${leg.demand?.cargo || 0}T</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return `
      <div class="p-3.5 rounded-xl border ${isCurrentlyActive ? 'border-cyan-500/70 bg-slate-950/70' : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'} transition flex flex-col gap-2.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm font-bold text-white flex items-center gap-1.5">
              <span>${c.name}</span>
              ${isCurrentlyActive ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500 text-slate-950 font-bold uppercase">Active</span>' : ''}
            </span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono font-bold" title="Hub Airport">
              ${hubFlag} ${c.hub}
            </span>
            <span class="text-xs text-cyan-300 font-medium px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60" title="Selected Aircraft for this Circuit">
              ✈️ ${c.acName || 'Aircraft'}
            </span>
            ${stratBadge}
            ${(c.fulfilledConfigs && Object.keys(c.fulfilledConfigs).length > 0)
              ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1" title="${Object.keys(c.fulfilledConfigs).length} aircraft configuration(s) marked fulfilled">
                   <span>✓</span>
                   <span>${Object.keys(c.fulfilledConfigs).length} Fulfilled</span>
                 </span>`
              : ''}
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" onclick="loadSavedCircuit('${c.id}')" class="px-3 py-1.5 rounded-lg ${isCurrentlyActive ? 'bg-cyan-600 text-white' : 'bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white'} text-xs font-semibold transition flex items-center gap-1 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>
              <span>${isCurrentlyActive ? 'Reload' : 'Load'}</span>
            </button>

            <button type="button" onclick="toggleSavedCircuitDetails('${c.id}')" class="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center gap-1" title="View Demand and Prices for all routes">
              <span>${isExpanded ? 'Hide Demands' : 'View Demands'}</span>
              <svg class="w-3 h-3 transform ${isExpanded ? 'rotate-180' : ''} transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            <button type="button" onclick="exportSingleCircuit('${c.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition" title="Export as .json file">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </button>

            <button type="button" onclick="copySingleCircuit('${c.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition" title="Copy JSON code to clipboard">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            </button>

            <button type="button" onclick="deleteSavedCircuit('${c.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 border border-slate-700 transition" title="Delete circuit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <!-- Route Sequence & Stats Summary -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-slate-400 text-[11px]">Routes:</span>
            <span class="font-mono text-cyan-400 font-semibold">${c.hub}</span>
            <span class="text-slate-600">&rarr;</span>
            ${routeChips}
          </div>
          <div class="flex items-center gap-3 text-slate-400 text-[11px] font-mono-num shrink-0">
            <span>⏱️ Total Time: <strong class="text-amber-400">${c.summary?.totalDurationText || '—'}</strong></span>
            <span>🛣️ <strong class="text-cyan-400">${c.legs?.length || 0} Routes</strong></span>
          </div>
        </div>

        <!-- Expandable Details Table -->
        ${detailsTableHtml}
      </div>
    `;
  }).join('');
}
window.renderSavedCircuitsList = renderSavedCircuitsList;

function deleteSavedCircuit(id) {
  const list = getSavedCircuits();
  const target = list.find(c => c.id === id);
  if (!target) return;

  if (confirm(`Are you sure you want to delete "${target.name}"?`)) {
    const updated = list.filter(c => c.id !== id);
    saveSavedCircuits(updated);

    if (window.CURRENT_SAVED_CIRCUIT_ID === id) {
      window.CURRENT_SAVED_CIRCUIT_ID = null;
      updateActiveCircuitIndicator();
    }

    renderSavedCircuitsList();
    showToast(`Deleted circuit: "${target.name}"`, 'warning');
  }
}
window.deleteSavedCircuit = deleteSavedCircuit;

// --- Export & Copy Functions ---

function exportSingleCircuit(id) {
  const list = getSavedCircuits();
  const circuit = list.find(c => c.id === id);
  if (!circuit) {
    showToast('Circuit not found', 'warning');
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(circuit, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `${circuit.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_AMT_Circuit.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Exported "${filename}"`, 'success');
}
window.exportSingleCircuit = exportSingleCircuit;

function copySingleCircuit(id) {
  const list = getSavedCircuits();
  const circuit = list.find(c => c.id === id);
  if (!circuit) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(JSON.stringify(circuit, null, 2)).then(() => {
      showToast(`Copied "${circuit.name}" JSON to clipboard!`, 'success');
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'warning');
    });
  } else {
    showToast('Clipboard access unavailable in this browser', 'warning');
  }
}
window.copySingleCircuit = copySingleCircuit;

function exportAllCircuitsBackup() {
  const list = getSavedCircuits();
  const backupData = {
    app: 'AMT Toolkit',
    type: 'circuits_backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    circuits: list
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `AMT_Circuits_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Exported full backup (${list.length} circuits)`, 'success');
}
window.exportAllCircuitsBackup = exportAllCircuitsBackup;

// --- Import & Share Code Handlers ---

function validatePastedCircuitJson() {
  const textarea = document.getElementById('import_circuit_json_textarea');
  const text = textarea?.value.trim() || '';
  const msgEl = document.getElementById('import_circuit_validation_msg');
  const previewCard = document.getElementById('import_circuit_preview_card');

  if (!text) {
    if (msgEl) msgEl.innerHTML = `<span class="text-slate-400">Ready for JSON input</span>`;
    if (previewCard) previewCard.classList.add('hidden');
    pendingImportCircuitData = null;
    return;
  }

  try {
    const parsed = JSON.parse(text);

    if (parsed.hub && Array.isArray(parsed.legs)) {
      pendingImportCircuitData = parsed;
      if (msgEl) msgEl.innerHTML = `<span class="text-emerald-400">✓ Valid Single Circuit JSON detected</span>`;
      if (previewCard) {
        previewCard.classList.remove('hidden');
        const nameEl = document.getElementById('import_circuit_preview_name');
        const detailsEl = document.getElementById('import_circuit_preview_details');
        if (nameEl) nameEl.textContent = parsed.name || 'Untitled Circuit';
        if (detailsEl) detailsEl.textContent = `${parsed.hub} • ${parsed.legs.length} Routes with Demands & Prices • ${parsed.acName || 'Aircraft'}`;
      }
    } else if (parsed.type === 'circuits_backup' && Array.isArray(parsed.circuits)) {
      pendingImportCircuitData = parsed;
      if (msgEl) msgEl.innerHTML = `<span class="text-emerald-400">✓ Valid Full Backup detected (${parsed.circuits.length} circuits)</span>`;
      if (previewCard) {
        previewCard.classList.remove('hidden');
        const nameEl = document.getElementById('import_circuit_preview_name');
        const detailsEl = document.getElementById('import_circuit_preview_details');
        if (nameEl) nameEl.textContent = 'Full AMT Circuits Backup';
        if (detailsEl) detailsEl.textContent = `${parsed.circuits.length} Circuits Ready to Restore`;
      }
    } else {
      throw new Error('JSON format is missing required circuit properties (hub, legs array)');
    }
  } catch (err) {
    if (msgEl) msgEl.innerHTML = `<span class="text-rose-400">✕ Invalid circuit JSON: ${err.message}</span>`;
    if (previewCard) previewCard.classList.add('hidden');
    pendingImportCircuitData = null;
  }
}
window.validatePastedCircuitJson = validatePastedCircuitJson;

function handleCircuitFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const textarea = document.getElementById('import_circuit_json_textarea');
    if (textarea) {
      textarea.value = e.target.result;
      validatePastedCircuitJson();
      showToast(`Loaded "${file.name}" for preview`);
    }
  };
  reader.readAsText(file);
}
window.handleCircuitFileUpload = handleCircuitFileUpload;

function confirmImportCircuit(loadNow = false) {
  if (!pendingImportCircuitData) {
    showToast('No valid circuit data to import.', 'warning');
    return;
  }

  let savedList = getSavedCircuits();

  if (pendingImportCircuitData.type === 'circuits_backup' && Array.isArray(pendingImportCircuitData.circuits)) {
    savedList = [...pendingImportCircuitData.circuits];
    saveSavedCircuits(savedList);
    showToast(`Successfully restored ${savedList.length} circuits from backup!`, 'success');
  } else {
    const newId = 'circuit-imported-' + Date.now();
    const newCircuit = {
      ...pendingImportCircuitData,
      id: newId,
      name: pendingImportCircuitData.name || `Imported ${pendingImportCircuitData.hub} Circuit`,
      createdAt: new Date().toISOString()
    };
    savedList.unshift(newCircuit);
    saveSavedCircuits(savedList);

    if (loadNow) {
      loadSavedCircuit(newId);
      return;
    } else {
      showToast(`Added "${newCircuit.name}" to your library!`, 'success');
    }
  }

  renderSavedCircuitsList();
  switchCircuitModalTab('my_circuits');
  const textarea = document.getElementById('import_circuit_json_textarea');
  if (textarea) textarea.value = '';
  validatePastedCircuitJson();
}
window.confirmImportCircuit = confirmImportCircuit;

// Universal modal backdrop click handler
function handleModalBackdropClick(event, backdropId) {
  if (event.target && event.target.id === backdropId) {
    if (backdropId === 'save_prompt_modal_backdrop') {
      closeSaveCircuitModal();
    } else if (backdropId === 'saved_circuits_modal_backdrop') {
      closeSavedCircuitsModal();
    } else {
      const el = document.getElementById(backdropId);
      if (el) el.classList.add('hidden');
    }
  }
}
window.handleModalBackdropClick = handleModalBackdropClick;

// Global Escape Key listener for all modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSaveCircuitModal();
    closeSavedCircuitsModal();
    if (typeof closeAircraftModal === 'function') closeAircraftModal();
    if (typeof closeSavedAuditsModal === 'function') closeSavedAuditsModal();
    if (typeof closeAuditEditorModal === 'function') closeAuditEditorModal();
  }
});


// =============================================================================
// SAVED ROUTE AUDITS LIBRARY (4 CLASSES: Y, J, F, CARGO + REMAINING DEMAND)
// =============================================================================

const DEFAULT_ROUTE_AUDITS = [];

function getAuditAgeDays(dateStr) {
  if (!dateStr) return 999;
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getSavedAudits() {
  try {
    const raw = localStorage.getItem('am_route_audits_v1');
    if (raw === null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
window.getSavedAudits = getSavedAudits;

function saveSavedAudits(audits) {
  try {
    localStorage.setItem('am_route_audits_v1', JSON.stringify(audits));
  } catch (e) {
    console.error('Failed to save route audits to localStorage', e);
  }
  updateAuditsBadges();
}
window.saveSavedAudits = saveSavedAudits;

function updateAuditsBadges() {
  const audits = getSavedAudits();
  const count = audits.length;

  const navBadge = document.getElementById('nav_audits_badge');
  if (navBadge) navBadge.textContent = count;

  document.querySelectorAll('.floating_audits_badge').forEach(el => {
    el.textContent = count;
  });

  const modalBadge = document.getElementById('modal_audits_count_badge');
  if (modalBadge) modalBadge.textContent = `${count} Audits`;

  const kpiAudits = document.getElementById('modal_kpi_audits');
  if (kpiAudits) kpiAudits.textContent = count;

  // Calculate total pax demand
  let totalPax = 0;
  let totalSurplus = 0;
  let freshCount = 0;

  audits.forEach(a => {
    const ecoD = a.eco ? (a.eco.demand ?? a.eco.dSim ?? 0) : 0;
    const busD = a.bus ? (a.bus.demand ?? a.bus.dSim ?? 0) : 0;
    const firstD = a.first ? (a.first.demand ?? a.first.dSim ?? 0) : 0;
    totalPax += (ecoD + busD + firstD);

    const ecoR = a.eco ? (a.eco.remaining ?? a.eco.r ?? 0) : 0;
    const busR = a.bus ? (a.bus.remaining ?? a.bus.r ?? 0) : 0;
    const firstR = a.first ? (a.first.remaining ?? a.first.r ?? 0) : 0;
    totalSurplus += (ecoR + busR + firstR);

    if (getAuditAgeDays(a.date) <= 7) freshCount++;
  });

  const kpiPax = document.getElementById('modal_kpi_pax');
  if (kpiPax) kpiPax.textContent = totalPax.toLocaleString();

  const kpiSurplus = document.getElementById('modal_kpi_surplus');
  if (kpiSurplus) kpiSurplus.textContent = totalSurplus.toLocaleString();

  const kpiFresh = document.getElementById('modal_kpi_fresh');
  if (kpiFresh) kpiFresh.textContent = `${freshCount} / ${count}`;
}
window.updateAuditsBadges = updateAuditsBadges;

function openSavedAuditsModal() {
  const modal = document.getElementById('saved_audits_modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  updateAuditsBadges();
  renderSavedAuditsTable();
}
window.openSavedAuditsModal = openSavedAuditsModal;

function closeSavedAuditsModal() {
  if (typeof closeCircuitDemandMenu === 'function') closeCircuitDemandMenu();
  const modal = document.getElementById('saved_audits_modal');
  if (modal) modal.classList.add('hidden');
}
window.closeSavedAuditsModal = closeSavedAuditsModal;

function handleSavedAuditsBackdropClick(event) {
  if (event.target && event.target.id === 'saved_audits_modal') {
    closeSavedAuditsModal();
  }
}
window.handleSavedAuditsBackdropClick = handleSavedAuditsBackdropClick;

function renderSavedAuditsTable() {
  const tbody = document.getElementById('modal_audits_table_body');
  if (!tbody) return;

  const audits = getSavedAudits();
  const query = (document.getElementById('modal_audit_search_input')?.value || '').trim().toLowerCase();
  const ageFilter = document.getElementById('modal_audit_filter_age')?.value || 'all';

  const filtered = audits.filter(a => {
    const age = getAuditAgeDays(a.date);
    if (ageFilter === 'fresh' && age > 7) return false;
    if (ageFilter === 'recent' && age > 30) return false;
    if (ageFilter === 'old' && age <= 30) return false;
    if (ageFilter === 'surplus') {
      const hasSurplus = ((a.eco?.remaining || 0) > 0) || ((a.bus?.remaining || 0) > 0) || ((a.first?.remaining || 0) > 0) || ((a.cargo?.remaining || 0) > 0);
      if (!hasSurplus) return false;
    }

    if (query) {
      const ap = typeof findAirport === 'function' ? findAirport(a.dst) : null;
      const matchIata = a.dst.toLowerCase().includes(query);
      const matchCity = ap?.city?.toLowerCase().includes(query);
      const matchName = ap?.name?.toLowerCase().includes(query);
      const matchHub = (a.hub || '').toLowerCase().includes(query);
      if (!matchIata && !matchCity && !matchName && !matchHub) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    const allAudits = getSavedAudits();
    if (allAudits.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-400 text-xs space-y-3">
            <div class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div class="text-white font-semibold">Your Route Audits Library is Empty</div>
            <p class="text-[11px] text-slate-500 max-w-sm mx-auto">
              You currently have no saved route audits. You can record new audits manually or save them from the Zero-Out tool.
            </p>
            <div class="flex items-center justify-center gap-2 pt-2">
              <button type="button" onclick="openAuditEditorModal()" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-sm">
                ➕ Add New Audit
              </button>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-500 text-xs">
            No route audits match your filter or search query.
          </td>
        </tr>
      `;
    }
    return;
  }

  tbody.innerHTML = filtered.map(a => {
    const ap = typeof findAirport === 'function' ? findAirport(a.dst) : null;
    const apName = ap ? ap.name : a.dst;
    const cat = ap ? ap.cat : 4;
    const age = getAuditAgeDays(a.date);
    const ageTag = age <= 7
      ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Fresh</span>'
      : (age <= 30
        ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">Recent</span>'
        : `<span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">${age}d old</span>`);

    const ecoD = a.eco ? (a.eco.demand ?? a.eco.dSim ?? 0) : 0;
    const ecoR = a.eco ? (a.eco.remaining ?? a.eco.r ?? 0) : 0;
    const ecoP = a.eco ? (a.eco.price ?? a.eco.pAudit ?? 0) : 0;
    const ecoC = Math.max(0, ecoD - ecoR);

    const busD = a.bus ? (a.bus.demand ?? a.bus.dSim ?? 0) : 0;
    const busR = a.bus ? (a.bus.remaining ?? a.bus.r ?? 0) : 0;
    const busP = a.bus ? (a.bus.price ?? a.bus.pAudit ?? 0) : 0;
    const busC = Math.max(0, busD - busR);

    const fstD = a.first ? (a.first.demand ?? a.first.dSim ?? 0) : 0;
    const fstR = a.first ? (a.first.remaining ?? a.first.r ?? 0) : 0;
    const fstP = a.first ? (a.first.price ?? a.first.pAudit ?? 0) : 0;
    const fstC = Math.max(0, fstD - fstR);

    const crgD = a.cargo ? (a.cargo.demand ?? a.cargo.dSim ?? 0) : 0;
    const crgR = a.cargo ? (a.cargo.remaining ?? a.cargo.r ?? 0) : 0;
    const crgP = a.cargo ? (a.cargo.price ?? a.cargo.pAudit ?? 0) : 0;
    const crgC = Math.max(0, crgD - crgR);

    return `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-xs">${a.hub || 'OSL'} ✈ ${a.dst}</span>
            <div class="min-w-0">
              <div class="text-[11px] text-slate-200 font-semibold truncate">${apName}</div>
              <div class="text-[10px] text-slate-400">Cat. ${cat} &bull; ${ap ? ap.country : ''}</div>
            </div>
          </div>
        </td>
        <td class="py-2.5 px-3">
          <div class="space-y-0.5 text-[11px]">
            <div><span class="text-cyan-400 font-semibold">Y:</span> ${ecoD.toLocaleString()}</div>
            <div><span class="text-blue-400 font-semibold">J:</span> ${busD.toLocaleString()}</div>
            <div><span class="text-amber-400 font-semibold">F:</span> ${fstD.toLocaleString()}</div>
            <div><span class="text-purple-400 font-semibold">C:</span> ${crgD} T</div>
          </div>
        </td>
        <td class="py-2.5 px-3">
          <div class="space-y-0.5 text-[11px]">
            <div><span class="text-slate-400">Y:</span> <span class="${ecoR > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'}">${ecoR.toLocaleString()}</span></div>
            <div><span class="text-slate-400">J:</span> <span class="${busR > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'}">${busR.toLocaleString()}</span></div>
            <div><span class="text-slate-400">F:</span> <span class="${fstR > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'}">${fstR.toLocaleString()}</span></div>
            <div><span class="text-slate-400">C:</span> <span class="${crgR > 0 ? 'text-purple-300 font-semibold' : 'text-slate-500'}">${crgR} T</span></div>
          </div>
        </td>
        <td class="py-2.5 px-3">
          <div class="space-y-0.5 text-[11px] text-slate-300">
            <div><span class="text-slate-500">Y:</span> ${ecoC.toLocaleString()}</div>
            <div><span class="text-slate-500">J:</span> ${busC.toLocaleString()}</div>
            <div><span class="text-slate-500">F:</span> ${fstC.toLocaleString()}</div>
            <div><span class="text-slate-500">C:</span> ${crgC.toFixed(1)} T</div>
          </div>
        </td>
        <td class="py-2.5 px-3">
          <div class="space-y-0.5 text-[11px]">
            <div><span class="text-slate-400">Y:</span> <span class="text-emerald-300 font-semibold">$${ecoP.toLocaleString()}</span></div>
            <div><span class="text-slate-400">J:</span> <span class="text-emerald-300 font-semibold">$${busP.toLocaleString()}</span></div>
            <div><span class="text-slate-400">F:</span> <span class="text-emerald-300 font-semibold">$${fstP.toLocaleString()}</span></div>
            <div><span class="text-slate-400">C:</span> <span class="text-purple-300 font-semibold">$${crgP.toLocaleString()}/T</span></div>
          </div>
        </td>
        <td class="py-2.5 px-2 text-center text-[10px]">
          <div>${a.date || '—'}</div>
          <div class="mt-1">${ageTag}</div>
        </td>
        <td class="py-2.5 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5 flex-wrap">
            <button type="button" onclick="sendAuditToZeroOut('${a.dst}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition" title="Send 4 classes directly to Zero-Out Price Calculator">
              🎯 Zero-Out
            </button>
            <button type="button" onclick="openCircuitDemandMenu(event, '${a.dst}')" class="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-800 text-[11px] font-semibold transition flex items-center gap-1" title="Choose Audited (D) or Remaining (R) demand to add to circuit">
              <span>💺 Add to Circuit</span>
              <svg class="w-2.5 h-2.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <button type="button" onclick="openAuditEditorModal('${a.dst}', '${a.hub || 'OSL'}')" class="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px]" title="Edit audit">
              ✏️
            </button>
            <button type="button" onclick="deleteAudit('${a.dst}')" class="px-1.5 py-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-[11px]" title="Delete audit">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
window.renderSavedAuditsTable = renderSavedAuditsTable;

window.LAST_ZERO_OUT_DST = null;

function sendAuditToZeroOut(dst) {
  const audits = getSavedAudits();
  const a = audits.find(x => x.dst === dst);
  if (!a) return;

  window.LAST_ZERO_OUT_DST = dst;

  const classes = [
    { id: 'eco', data: a.eco },
    { id: 'bus', data: a.bus },
    { id: 'first', data: a.first },
    { id: 'cargo', data: a.cargo }
  ];

  classes.forEach(c => {
    if (c.data) {
      const dSim = document.getElementById(`${c.id}_dsim`);
      const r = document.getElementById(`${c.id}_r`);
      const pAudit = document.getElementById(`${c.id}_paudit`);
      if (dSim) dSim.value = c.data.demand ?? c.data.dSim ?? '';
      if (r) r.value = c.data.remaining ?? c.data.r ?? '';
      if (pAudit) pAudit.value = c.data.price ?? c.data.pAudit ?? '';
    }
  });

  const routeBadge = document.getElementById('zero_out_active_route_badge');
  if (routeBadge) {
    routeBadge.textContent = `${a.hub || 'OSL'} ✈ ${dst}`;
    routeBadge.classList.remove('hidden');
  }

  if (typeof updateAllCalculations === 'function') {
    updateAllCalculations();
  }

  if (typeof switchTab === 'function') {
    switchTab('zero-out');
  }

  closeSavedAuditsModal();
  if (typeof showToast === 'function') {
    showToast(`Transferred ${a.hub || 'OSL'} ✈ ${a.dst} audit to Zero-Out Calculator!`, 'success');
  }
}
window.sendAuditToZeroOut = sendAuditToZeroOut;

function onEditorAuditHubInput() {
  const hubInput = document.getElementById('editor_audit_hub');
  const infoEl = document.getElementById('editor_audit_hub_info');
  if (!hubInput || !infoEl) return;
  const iata = hubInput.value.trim().toUpperCase();
  const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
  if (ap) {
    infoEl.textContent = `${ap.name}, ${ap.country} (Cat. ${ap.cat})`;
    infoEl.className = 'text-[10px] text-emerald-400 mt-1 truncate font-semibold';
  } else {
    infoEl.textContent = iata ? 'Unknown airport code' : 'Departure hub airport';
    infoEl.className = 'text-[10px] text-slate-400 mt-1 truncate';
  }
}
window.onEditorAuditHubInput = onEditorAuditHubInput;

function saveZeroOutToAudit() {
  const getRaw = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };

  const ecoD_raw = getRaw('eco_dsim');
  const ecoR_raw = getRaw('eco_r');
  const ecoP_raw = getRaw('eco_paudit');

  const busD_raw = getRaw('bus_dsim');
  const busR_raw = getRaw('bus_r');
  const busP_raw = getRaw('bus_paudit');

  const fstD_raw = getRaw('first_dsim');
  const fstR_raw = getRaw('first_r');
  const fstP_raw = getRaw('first_paudit');

  const crgD_raw = getRaw('cargo_dsim');
  const crgR_raw = getRaw('cargo_r');
  const crgP_raw = getRaw('cargo_paudit');

  const hasAnyData = [ecoD_raw, ecoP_raw, busD_raw, busP_raw, fstD_raw, fstP_raw, crgD_raw, crgP_raw].some(v => v !== '');
  if (!hasAnyData) {
    if (typeof showToast === 'function') {
      showToast('Please enter demand and audit fares before saving as an audit.', 'warning');
    }
    return;
  }

  // Open the audit editor modal pre-filled with the Zero-Out values
  const modal = document.getElementById('audit_editor_modal');
  if (!modal) return;

  const currentHub = document.getElementById('sc_circuit_hub')?.value || window.CIRCUIT_HUB || 'OSL';
  const titleEl = document.getElementById('audit_editor_modal_title');
  const hubInput = document.getElementById('editor_audit_hub');
  const dstInput = document.getElementById('editor_audit_dst');
  const dateInput = document.getElementById('editor_audit_date');
  const origHubInput = document.getElementById('editor_original_hub');
  const origDstInput = document.getElementById('editor_original_dst');

  if (origHubInput) origHubInput.value = '';
  if (origDstInput) origDstInput.value = '';

  if (titleEl) titleEl.textContent = '💾 Save Zero-Out Data as Route Audit';
  if (hubInput) {
    hubInput.value = currentHub;
    hubInput.readOnly = false;
  }
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  if (dstInput) {
    dstInput.value = window.LAST_ZERO_OUT_DST || '';
    dstInput.readOnly = false;
  }

  // Populate form fields preserving 0 values accurately
  const setVal = (id, raw) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (raw === '' || raw === null || raw === undefined) {
      el.value = '';
    } else {
      const num = parseFloat(raw);
      el.value = !isNaN(num) ? num : '';
    }
  };

  setVal('editor_eco_d', ecoD_raw);
  setVal('editor_eco_r', ecoR_raw);
  setVal('editor_eco_p', ecoP_raw);

  setVal('editor_bus_d', busD_raw);
  setVal('editor_bus_r', busR_raw);
  setVal('editor_bus_p', busP_raw);

  setVal('editor_first_d', fstD_raw);
  setVal('editor_first_r', fstR_raw);
  setVal('editor_first_p', fstP_raw);

  setVal('editor_cargo_d', crgD_raw);
  setVal('editor_cargo_r', crgR_raw);
  setVal('editor_cargo_p', crgP_raw);

  if (typeof onEditorAuditHubInput === 'function') onEditorAuditHubInput();
  if (typeof onEditorAuditDstInput === 'function') onEditorAuditDstInput();
  if (typeof recalcEditorFormCapacity === 'function') recalcEditorFormCapacity();

  modal.classList.remove('hidden');
  if (dstInput && !dstInput.value) {
    dstInput.focus();
  }
}
window.saveZeroOutToAudit = saveZeroOutToAudit;

function openCircuitDemandMenu(event, dst) {
  if (event) event.stopPropagation();
  const popover = document.getElementById('circuit_demand_popover');
  if (!popover) {
    addAuditToSeatConfig(dst, 'audited');
    return;
  }

  // If already open for this dst, toggle close it
  if (!popover.classList.contains('hidden') && popover.getAttribute('data-dst') === dst) {
    closeCircuitDemandMenu();
    return;
  }

  const audits = getSavedAudits();
  const a = audits.find(x => x.dst === dst);
  if (!a) return;

  const ap = typeof findAirport === 'function' ? findAirport(a.dst) : null;
  const apName = ap ? ap.name : a.dst;

  const ecoD = a.eco ? (a.eco.demand ?? a.eco.dSim ?? 0) : 0;
  const ecoR = a.eco ? (a.eco.remaining ?? a.eco.r ?? 0) : 0;
  const busD = a.bus ? (a.bus.demand ?? a.bus.dSim ?? 0) : 0;
  const busR = a.bus ? (a.bus.remaining ?? a.bus.r ?? 0) : 0;
  const fstD = a.first ? (a.first.demand ?? a.first.dSim ?? 0) : 0;
  const fstR = a.first ? (a.first.remaining ?? a.first.r ?? 0) : 0;
  const crgD = a.cargo ? (a.cargo.demand ?? a.cargo.dSim ?? 0) : 0;
  const crgR = a.cargo ? (a.cargo.remaining ?? a.cargo.r ?? 0) : 0;

  const totalAuditedPax = ecoD + busD + fstD;
  const totalRemainingPax = ecoR + busR + fstR;

  popover.setAttribute('data-dst', dst);
  popover.innerHTML = `
    <div class="p-3 space-y-2 text-left w-80 max-w-[90vw]">
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="font-bold text-white font-mono text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 shrink-0">${a.hub || 'OSL'} ✈ ${a.dst}</span>
          <span class="text-[11px] text-slate-300 font-semibold truncate" title="${apName}">${apName}</span>
        </div>
        <button type="button" onclick="closeCircuitDemandMenu()" class="text-slate-400 hover:text-white text-base leading-none px-1.5 py-0.5 rounded hover:bg-slate-800 transition">&times;</button>
      </div>

      <div class="text-[10px] text-slate-400 font-medium">Choose demand basis to load into Seat Configurator:</div>

      <!-- Option 1: Audited Demand (D) -->
      <button type="button" onclick="addAuditToSeatConfig('${a.dst}', 'audited')" class="w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/70 border border-slate-700/80 hover:border-cyan-500/80 transition group cursor-pointer shadow-sm">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
            📊 Audited Demand (D)
          </span>
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono-num font-semibold">Total: ${totalAuditedPax.toLocaleString()} pax</span>
        </div>
        <div class="grid grid-cols-4 gap-1 text-[10px] text-slate-400 font-mono-num bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
          <div><span class="text-cyan-400 font-semibold">Y:</span> ${ecoD.toLocaleString()}</div>
          <div><span class="text-blue-400 font-semibold">J:</span> ${busD.toLocaleString()}</div>
          <div><span class="text-amber-400 font-semibold">F:</span> ${fstD.toLocaleString()}</div>
          <div><span class="text-purple-400 font-semibold">C:</span> ${crgD}T</div>
        </div>
        <div class="text-[9px] text-slate-400 mt-1.5 flex items-center justify-between">
          <span>Full surveyed route demand</span>
          <span class="text-cyan-400 font-medium group-hover:underline flex items-center gap-0.5">Apply Full &rarr;</span>
        </div>
      </button>

      <!-- Option 2: Remaining Demand (R) -->
      <button type="button" onclick="addAuditToSeatConfig('${a.dst}', 'remaining')" class="w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/70 border border-slate-700/80 hover:border-amber-500/80 transition group cursor-pointer shadow-sm">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
            🎯 Remaining Demand (R)
          </span>
          <span class="text-[9px] px-1.5 py-0.5 rounded ${totalRemainingPax > 0 ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-500 border border-slate-800'} font-mono-num font-semibold">Surplus: ${totalRemainingPax.toLocaleString()} pax</span>
        </div>
        <div class="grid grid-cols-4 gap-1 text-[10px] text-slate-400 font-mono-num bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
          <div><span class="text-slate-400">Y:</span> <span class="${ecoR > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'}">${ecoR.toLocaleString()}</span></div>
          <div><span class="text-slate-400">J:</span> <span class="${busR > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'}">${busR.toLocaleString()}</span></div>
          <div><span class="text-slate-400">F:</span> <span class="${fstR > 0 ? 'text-amber-300 font-semibold' : 'text-slate-500'}">${fstR.toLocaleString()}</span></div>
          <div><span class="text-slate-400">C:</span> <span class="${crgR > 0 ? 'text-purple-300 font-semibold' : 'text-slate-500'}">${crgR}T</span></div>
        </div>
        <div class="text-[9px] text-slate-400 mt-1.5 flex items-center justify-between">
          <span>Unserved leftover demand</span>
          <span class="text-amber-400 font-medium group-hover:underline flex items-center gap-0.5">Apply Surplus &rarr;</span>
        </div>
      </button>
    </div>
  `;

  // Position popover relative to button
  const rect = event.currentTarget.getBoundingClientRect();
  const popoverWidth = 320;
  const popoverHeight = 225;

  let left = rect.right - popoverWidth;
  if (left < 10) left = 10;
  if (left + popoverWidth > window.innerWidth - 10) {
    left = window.innerWidth - popoverWidth - 10;
  }

  let top = rect.bottom + 6;
  if (top + popoverHeight > window.innerHeight - 10) {
    top = Math.max(10, rect.top - popoverHeight - 6);
  }

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
  popover.classList.remove('hidden');
}
window.openCircuitDemandMenu = openCircuitDemandMenu;

function closeCircuitDemandMenu() {
  const popover = document.getElementById('circuit_demand_popover');
  if (popover) {
    popover.classList.add('hidden');
    popover.removeAttribute('data-dst');
  }
}
window.closeCircuitDemandMenu = closeCircuitDemandMenu;

function addAuditToSeatConfig(dst, mode = 'audited') {
  const audits = getSavedAudits();
  const a = audits.find(x => x.dst === dst);
  if (!a) return;

  closeCircuitDemandMenu();
  closeSavedAuditsModal();

  window.CURRENT_LEG_AUDIT_MODE = mode;

  if (typeof switchTab === 'function') {
    switchTab('seat-config');
  }

  const dstInput = document.getElementById('sc_leg_dst');
  if (dstInput) {
    dstInput.value = dst;
    if (typeof onLegDestinationChange === 'function') {
      onLegDestinationChange();
    }
    dstInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const modeLabel = mode === 'remaining' ? 'Remaining Demand (R)' : 'Audited Demand (D)';
  if (typeof showToast === 'function') {
    showToast(`Applied ${a.hub || 'OSL'} ✈ ${a.dst} with ${modeLabel} to Seat Config Route Form!`, 'success');
  }
}
window.addAuditToSeatConfig = addAuditToSeatConfig;

// Global listeners to dismiss popover when clicking outside or pressing Escape
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    const popover = document.getElementById('circuit_demand_popover');
    if (popover && !popover.classList.contains('hidden')) {
      if (!popover.contains(e.target) && !e.target.closest('button[onclick*="openCircuitDemandMenu"]')) {
        closeCircuitDemandMenu();
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCircuitDemandMenu();
    }
  });
}

function openAuditEditorModal(dst = null, hub = null) {
  const modal = document.getElementById('audit_editor_modal');
  if (!modal) return;

  const audits = getSavedAudits();
  const existing = dst ? audits.find(x => x.dst === dst && (!hub || (x.hub || 'OSL') === hub)) : null;
  const currentHub = hub || document.getElementById('sc_circuit_hub')?.value || window.CIRCUIT_HUB || 'OSL';

  const titleEl = document.getElementById('audit_editor_modal_title');
  const hubInput = document.getElementById('editor_audit_hub');
  const dstInput = document.getElementById('editor_audit_dst');
  const dateInput = document.getElementById('editor_audit_date');
  const origHubInput = document.getElementById('editor_original_hub');
  const origDstInput = document.getElementById('editor_original_dst');

  if (origHubInput) origHubInput.value = existing ? (existing.hub || currentHub) : '';
  if (origDstInput) origDstInput.value = existing ? existing.dst : '';

  if (hubInput) {
    hubInput.value = existing ? (existing.hub || currentHub) : currentHub;
    hubInput.readOnly = false;
  }
  if (dateInput) {
    dateInput.value = existing ? existing.date : new Date().toISOString().split('T')[0];
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = (val !== null && val !== undefined && val !== '' && !isNaN(val)) ? val : '';
    }
  };

  if (existing) {
    if (titleEl) titleEl.textContent = `✏️ Edit Route Audit: ${existing.hub || 'OSL'} ✈ ${existing.dst}`;
    if (dstInput) {
      dstInput.value = existing.dst;
      dstInput.readOnly = false;
    }

    // Eco
    setVal('editor_eco_d', existing.eco ? (existing.eco.demand ?? existing.eco.dSim) : '');
    setVal('editor_eco_r', existing.eco ? (existing.eco.remaining ?? existing.eco.r) : '');
    setVal('editor_eco_p', existing.eco ? (existing.eco.price ?? existing.eco.pAudit) : '');

    // Bus
    setVal('editor_bus_d', existing.bus ? (existing.bus.demand ?? existing.bus.dSim) : '');
    setVal('editor_bus_r', existing.bus ? (existing.bus.remaining ?? existing.bus.r) : '');
    setVal('editor_bus_p', existing.bus ? (existing.bus.price ?? existing.bus.pAudit) : '');

    // First
    setVal('editor_first_d', existing.first ? (existing.first.demand ?? existing.first.dSim) : '');
    setVal('editor_first_r', existing.first ? (existing.first.remaining ?? existing.first.r) : '');
    setVal('editor_first_p', existing.first ? (existing.first.price ?? existing.first.pAudit) : '');

    // Cargo
    setVal('editor_cargo_d', existing.cargo ? (existing.cargo.demand ?? existing.cargo.dSim) : '');
    setVal('editor_cargo_r', existing.cargo ? (existing.cargo.remaining ?? existing.cargo.r) : '');
    setVal('editor_cargo_p', existing.cargo ? (existing.cargo.price ?? existing.cargo.pAudit) : '');
  } else {
    if (titleEl) titleEl.textContent = '➕ Add Route Audit (4 Classes + Cargo)';
    if (dstInput) {
      dstInput.value = '';
      dstInput.readOnly = false;
    }
    ['eco_d', 'eco_r', 'eco_p', 'bus_d', 'bus_r', 'bus_p', 'first_d', 'first_r', 'first_p', 'cargo_d', 'cargo_r', 'cargo_p'].forEach(id => {
      const el = document.getElementById(`editor_${id}`);
      if (el) el.value = '';
    });
  }

  onEditorAuditHubInput();
  onEditorAuditDstInput();
  recalcEditorFormCapacity();
  modal.classList.remove('hidden');
}
window.openAuditEditorModal = openAuditEditorModal;

function closeAuditEditorModal() {
  const modal = document.getElementById('audit_editor_modal');
  if (modal) modal.classList.add('hidden');
}
window.closeAuditEditorModal = closeAuditEditorModal;

function onEditorAuditDstInput() {
  const dstInput = document.getElementById('editor_audit_dst');
  const infoEl = document.getElementById('editor_audit_dst_info');
  if (!dstInput || !infoEl) return;
  const iata = dstInput.value.trim().toUpperCase();
  const ap = typeof findAirport === 'function' ? findAirport(iata) : null;
  if (ap) {
    infoEl.textContent = `${ap.name}, ${ap.country} (Cat. ${ap.cat})`;
    infoEl.className = 'text-[10px] text-emerald-400 mt-1 truncate font-semibold';
  } else {
    infoEl.textContent = iata ? 'Unknown airport code' : 'Type 3-letter IATA code';
    infoEl.className = 'text-[10px] text-slate-400 mt-1 truncate';
  }
}
window.onEditorAuditDstInput = onEditorAuditDstInput;

function recalcEditorFormCapacity() {
  const classes = [
    { id: 'eco', dId: 'editor_eco_d', rId: 'editor_eco_r', outId: 'editor_calc_c_eco', unit: 'pax' },
    { id: 'bus', dId: 'editor_bus_d', rId: 'editor_bus_r', outId: 'editor_calc_c_bus', unit: 'pax' },
    { id: 'first', dId: 'editor_first_d', rId: 'editor_first_r', outId: 'editor_calc_c_first', unit: 'pax' },
    { id: 'cargo', dId: 'editor_cargo_d', rId: 'editor_cargo_r', outId: 'editor_calc_c_cargo', unit: 'T' }
  ];

  classes.forEach(c => {
    const d = parseFloat(document.getElementById(c.dId)?.value) || 0;
    const r = parseFloat(document.getElementById(c.rId)?.value) || 0;
    const offer = Math.max(0, d - r);
    const outEl = document.getElementById(c.outId);
    if (outEl) {
      outEl.textContent = `Scheduled Offer: ${c.id === 'cargo' ? offer.toFixed(1) : offer.toLocaleString()} ${c.unit}`;
    }
  });
}
window.recalcEditorFormCapacity = recalcEditorFormCapacity;

function submitAuditEditorForm(event) {
  event.preventDefault();
  const dst = (document.getElementById('editor_audit_dst')?.value || '').trim().toUpperCase();
  const hub = (document.getElementById('editor_audit_hub')?.value || '').trim().toUpperCase() || 'OSL';
  const date = document.getElementById('editor_audit_date')?.value || new Date().toISOString().split('T')[0];
  const origHub = (document.getElementById('editor_original_hub')?.value || '').trim().toUpperCase();
  const origDst = (document.getElementById('editor_original_dst')?.value || '').trim().toUpperCase();

  if (!dst || dst.length < 3) {
    if (typeof showToast === 'function') showToast('Please enter a valid 3-letter destination airport code.', 'warning');
    return;
  }
  if (!hub || hub.length < 3) {
    if (typeof showToast === 'function') showToast('Please enter a valid 3-letter departure hub code.', 'warning');
    return;
  }
  if (hub === dst) {
    if (typeof showToast === 'function') showToast('Departure hub and destination cannot be the same airport.', 'warning');
    return;
  }

  const getNum = (id) => {
    const val = document.getElementById(id)?.value;
    if (val === '' || val === null || val === undefined) return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  const ecoD = getNum('editor_eco_d');
  const ecoR = getNum('editor_eco_r');
  const ecoP = getNum('editor_eco_p');

  const busD = getNum('editor_bus_d');
  const busR = getNum('editor_bus_r');
  const busP = getNum('editor_bus_p');

  const fstD = getNum('editor_first_d');
  const fstR = getNum('editor_first_r');
  const fstP = getNum('editor_first_p');

  const crgD = getNum('editor_cargo_d');
  const crgR = getNum('editor_cargo_r');
  const crgP = getNum('editor_cargo_p');

  const newAudit = {
    hub,
    dst,
    date,
    eco: { demand: ecoD, remaining: ecoR, price: ecoP },
    bus: { demand: busD, remaining: busR, price: busP },
    first: { demand: fstD, remaining: fstR, price: fstP },
    cargo: { demand: crgD, remaining: crgR, price: crgP }
  };

  const audits = getSavedAudits();
  let existingIdx = -1;
  if (origDst) {
    existingIdx = audits.findIndex(x => x.dst === origDst && (!origHub || (x.hub || 'OSL') === origHub));
  }
  if (existingIdx < 0) {
    existingIdx = audits.findIndex(x => x.dst === dst && (x.hub || 'OSL') === hub);
  }

  if (existingIdx >= 0) {
    audits[existingIdx] = newAudit;
  } else {
    audits.unshift(newAudit);
  }

  saveSavedAudits(audits);
  closeAuditEditorModal();
  renderSavedAuditsTable();
  if (typeof showToast === 'function') {
    showToast(`Saved route audit for ${hub} ✈ ${dst}!`, 'success');
  }
}
window.submitAuditEditorForm = submitAuditEditorForm;

function deleteAudit(dst) {
  if (!confirm(`Are you sure you want to delete the saved audit for ${dst}?`)) return;
  let audits = getSavedAudits();
  audits = audits.filter(x => x.dst !== dst);
  saveSavedAudits(audits);
  renderSavedAuditsTable();
  if (typeof showToast === 'function') {
    showToast(`Deleted route audit for ${dst}.`, 'info');
  }
}
window.deleteAudit = deleteAudit;

function clearAllAudits() {
  const current = getSavedAudits();
  if (current.length === 0) return;
  if (!confirm('Are you sure you want to delete all saved route audits?')) return;
  saveSavedAudits([]);
  renderSavedAuditsTable();
  if (typeof showToast === 'function') {
    showToast('Cleared all route audits from library.', 'info');
  }
}
window.clearAllAudits = clearAllAudits;

function exportAuditsJsonFile() {
  const audits = getSavedAudits();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(audits, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `amt_route_audits_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
window.exportAuditsJsonFile = exportAuditsJsonFile;

function handleAuditsImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        throw new Error('File does not contain a valid audits array');
      }

      let countAdded = 0;
      const current = getSavedAudits();
      imported.forEach(item => {
        if (item && item.dst) {
          const idx = current.findIndex(x => x.dst === item.dst);
          if (idx >= 0) {
            current[idx] = item;
          } else {
            current.unshift(item);
          }
          countAdded++;
        }
      });

      saveSavedAudits(current);
      renderSavedAuditsTable();
      if (typeof showToast === 'function') {
        showToast(`Successfully imported ${countAdded} route audits!`, 'success');
      }
    } catch (err) {
      alert('Invalid JSON file format: ' + err.message);
    }
  };
  reader.readAsText(file);
}
window.handleAuditsImportFile = handleAuditsImportFile;


// =============================================================================
// SEAT CONFIG AIRCRAFT COMPARATOR (SIDE-BY-SIDE ON ACTIVE CIRCUIT)
// =============================================================================

let sc_comparatorOpen = false;
let sc_comparatorSlots = ['a320-200', '737-800', 'a220-300'];

function toggleSeatConfigComparator() {
  const panel = document.getElementById('sc_aircraft_comparator_panel');
  const btnLabel = document.getElementById('sc_compare_btn_label');
  const btn = document.getElementById('sc_btn_compare_aircraft');
  if (!panel) return;

  sc_comparatorOpen = !sc_comparatorOpen;
  if (sc_comparatorOpen) {
    panel.classList.remove('hidden');
    if (btnLabel) btnLabel.textContent = 'Hide Compare';
    if (btn) {
      btn.className = 'px-2.5 py-2 rounded-lg bg-cyan-600 text-white border border-cyan-400 text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-md shadow-cyan-500/20';
    }
    renderSeatConfigComparator();
  } else {
    panel.classList.add('hidden');
    if (btnLabel) btnLabel.textContent = 'Compare';
    if (btn) {
      btn.className = 'px-2.5 py-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 hover:border-cyan-400 text-cyan-300 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 shrink-0 whitespace-nowrap shadow-sm';
    }
  }
}
window.toggleSeatConfigComparator = toggleSeatConfigComparator;

function changeComparatorSlotAircraft(slotIdx, acId) {
  if (sc_comparatorSlots[slotIdx] !== undefined) {
    sc_comparatorSlots[slotIdx] = acId;
    renderSeatConfigComparator();
  }
}
window.changeComparatorSlotAircraft = changeComparatorSlotAircraft;

function applyComparatorAircraft(acId) {
  const acSelect = document.getElementById('sc_aircraft_select');
  if (acSelect) {
    acSelect.value = acId;
    if (typeof onAircraftSelectChange === 'function') {
      onAircraftSelectChange();
    }
  }
  const ac = typeof findAircraft === 'function' ? findAircraft(acId) : null;
  if (typeof showToast === 'function') {
    showToast(`Applied ${ac ? ac.name : acId} to circuit!`, 'success');
  }
}
window.applyComparatorAircraft = applyComparatorAircraft;

function calculateComparatorPlan(ac, legs, strategy = null) {
  if (!ac || !legs || legs.length === 0) {
    return {
      totalDurHours: 0,
      targetHours: 24,
      fitsSchedule: true,
      freeHours: 24,
      overHours: 0,
      reqFleet: 0,
      totalPlanes: 0,
      fleetCost: 0,
      totalFleetCost: 0,
      dailyRev: 0,
      fleetDailyRev: 0,
      costPerSeat: ac ? Math.round((ac.price || 0) / (ac.seats || 1)) : 0,
      meetsRange: true,
      meetsRunways: true,
      meetsHubCat: true,
      isCompatible: true
    };
  }

  const baseSingleSum = legs.reduce((acc, l) => {
    const dist = l.distanceKm || 0;
    return acc + calculateFlightTimeHours(dist, ac.speed_kmh || 800);
  }, 0);
  const is168h = baseSingleSum > 28;
  const effectiveStrategy = strategy || ((legs.length === 1 && !is168h) ? 'zero_empty' : 'max_profit');

  // If this is the active aircraft and active plan matches effective strategy and doesn't exceed 24h for 1 route, reuse it
  const activeAc = typeof getActiveAircraft === 'function' ? getActiveAircraft() : null;
  if (activeAc && activeAc.id === ac.id && window.ACTIVE_FLEET_PLAN && window.ACTIVE_FLEET_PLAN.strategy === effectiveStrategy) {
    if (!(!is168h && legs.length === 1 && window.ACTIVE_FLEET_PLAN.totalDurHours > 24.01)) {
      return window.ACTIVE_FLEET_PLAN;
    }
  }

  // Create candidate-specific legs with flight duration and repetition tailored for aircraft ac
  const candidateLegs = legs.map(l => {
    const dist = l.distanceKm || 0;
    const dur = calculateFlightTimeHours(dist, ac.speed_kmh || 800);
    return {
      ...l,
      durationHours: dur,
      durationText: formatHoursMinutes(dur)
    };
  });

  if (!is168h) {
    if (candidateLegs.length === 1) {
      const dur = candidateLegs[0].durationHours;
      candidateLegs[0].flightsPerDay = dur > 0 ? Math.max(1, Math.floor(24 / dur)) : 1;
    } else {
      const sumDur = candidateLegs.reduce((acc, l) => acc + l.durationHours, 0);
      if (sumDur <= 28) {
        const blockCycles = Math.max(1, Math.floor(24 / sumDur)) || 1;
        candidateLegs.forEach(l => { l.flightsPerDay = blockCycles; });
        let remTime = 24 - (sumDur * blockCycles);
        for (let i = 0; i < candidateLegs.length; i++) {
          if (candidateLegs[i].durationHours <= remTime) {
            candidateLegs[i].flightsPerDay += 1;
            remTime -= candidateLegs[i].durationHours;
          }
        }
      } else {
        candidateLegs.forEach(l => { l.flightsPerDay = 1; });
      }
    }
  } else {
    candidateLegs.forEach(l => { l.flightsPerDay = 1; });
  }

  return calculateFleetPlanForAircraft(ac, candidateLegs, effectiveStrategy);
}
window.calculateComparatorPlan = calculateComparatorPlan;

function findBestAlternativeAircraft(activeAcId, legs, strategy = null) {
  if (!legs || legs.length === 0 || typeof AIRCRAFT_DATABASE === 'undefined') return [];

  const hubAirport = typeof findAirport === 'function' ? findAirport(window.CIRCUIT_HUB || 'OSL') : null;
  const hubCat = hubAirport ? hubAirport.cat : 10;
  const maxLegDist = Math.max(0, ...legs.map(l => l.distanceKm || 0));
  const minDstCat = Math.min(...legs.map(l => (l.dstAirport?.cat || (typeof findAirport === 'function' ? findAirport(l.dst)?.cat : 10) || 10)));

  const activeAc = (typeof findAircraft === 'function' ? findAircraft(activeAcId) : null) || AIRCRAFT_DATABASE.find(a => a.id === activeAcId);
  const activeSeats = activeAc ? activeAc.seats : 180;
  const activeSpeed = activeAc?.speed_kmh || 800;

  const baseSingleSum = legs.reduce((acc, l) => acc + calculateFlightTimeHours(l.distanceKm || 0, activeSpeed), 0);
  const is168h = baseSingleSum > 28;
  const targetHours = is168h ? 168 : 24;

  // Filter all compatible aircraft excluding active plane
  const candidates = AIRCRAFT_DATABASE.filter(ac => {
    if (ac.id === activeAcId) return false;
    if (!ac.seats || ac.seats <= 0) return false;
    if (!ac.speed_kmh || ac.speed_kmh <= 0) return false;
    if (ac.range_km < maxLegDist) return false;
    if (ac.category > hubCat) return false;
    if (ac.category > minDstCat) return false;
    return true;
  });

  const effectiveStrategy = strategy || ((legs.length === 1 && !is168h) ? 'zero_empty' : 'max_profit');

  const scored = candidates.map(ac => {
    const plan = calculateComparatorPlan(ac, legs, effectiveStrategy);

    // Scoring components:
    // 1. Schedule fit
    let score = 0;
    if (plan.fitsSchedule) {
      score += 1000 - (plan.freeHours * 25);
    } else {
      score -= (plan.overHours * 150);
    }

    // 2. Revenue & Profitability
    score += (plan.dailyRev / 8000);

    // 3. Capital Efficiency (Daily Rev / Fleet Cost)
    if (plan.fleetCost > 0) {
      score += ((plan.dailyRev / plan.fleetCost) * 15000);
    }

    // 4. Capacity Alignment with active plane category
    score += Math.max(0, 200 - Math.abs(ac.seats - activeSeats) * 0.8);

    // 5. Speed bonus
    score += (ac.speed_kmh / 5);

    return {
      ac,
      plan,
      score
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}
window.findBestAlternativeAircraft = findBestAlternativeAircraft;

function renderSeatConfigComparator() {
  const container = document.getElementById('sc_comparator_cards_grid');
  if (!container || !sc_comparatorOpen) return;

  const legs = window.CIRCUIT_LEGS || [];
  const activeAc = typeof getActiveAircraft === 'function' ? getActiveAircraft() : null;
  const activeAcId = activeAc ? activeAc.id : (document.getElementById('sc_aircraft_select')?.value || 'a320-200');

  const baseSingleSum = legs.reduce((acc, l) => acc + (l.durationHours || 0), 0);
  const is168h = baseSingleSum > 28;
  const currentStrategy = window.CIRCUIT_STRATEGY_MANUAL 
    ? (window.CIRCUIT_STRATEGY || ((legs.length === 1 && !is168h) ? 'zero_empty' : 'max_profit'))
    : ((legs.length === 1 && !is168h) ? 'zero_empty' : 'max_profit');

  if (legs.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center border-2 border-dashed border-slate-800 rounded-xl space-y-2">
        <div class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">⚖️</div>
        <h4 class="text-xs font-bold text-white">Circuit is Currently Empty</h4>
        <p class="text-[11px] text-slate-400 max-w-md mx-auto">
          Add flight routes to your circuit above to automatically discover and compare the <strong>top 3 best alternative aircraft</strong> against your current choice (${activeAc?.name || 'A320-200'}).
        </p>
      </div>
    `;
    return;
  }

  // 1. Calculate active aircraft baseline
  const activePlan = calculateComparatorPlan(activeAc, legs, currentStrategy);

  // 2. Automatically find top 3 alternative aircraft
  const topAlternatives = findBestAlternativeAircraft(activeAcId, legs, currentStrategy);

  if (topAlternatives.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center border border-slate-800 rounded-xl space-y-1 text-slate-400 text-xs">
        <p>No other compatible alternative aircraft found in database for these runway categories and range.</p>
      </div>
    `;
    return;
  }

  // Badges for the 3 recommendations
  const rankBadges = [
    { label: '🏆 #1 Top Recommendation', color: 'bg-amber-950 text-amber-300 border-amber-800' },
    { label: '⚡ #2 Alternative', color: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    { label: '💎 #3 Alternative', color: 'bg-blue-950 text-blue-300 border-blue-800' }
  ];

  container.innerHTML = `
    <!-- Active Aircraft Comparison Baseline Bar -->
    <div class="p-3 rounded-xl bg-slate-950/80 border border-cyan-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">Active Choice</span>
        <div class="min-w-0 truncate">
          <strong class="text-sm font-bold text-white">${activeAc.name}</strong>
          <span class="text-[11px] text-slate-400 ml-1.5 font-mono">(${activeAc.seats} seats &bull; ${activeAc.speed_kmh} km/h &bull; ${activeAc.range_km.toLocaleString()} km &bull; Cat. ${activeAc.category} &bull; ${formatAircraftPriceShort(activeAc.price)})</span>
        </div>
      </div>
      <div class="flex items-center gap-4 text-xs font-mono-num shrink-0 text-slate-300 flex-wrap">
        <div>Rotation: <strong class="text-white font-bold">${formatHoursMinutes(activePlan.totalDurHours)}</strong></div>
        <div>Fleet: <strong class="text-slate-200 font-semibold">${activePlan.reqFleet} planes</strong></div>
        <div>Cost: <strong class="text-emerald-400 font-bold">${formatAircraftPriceShort(activePlan.fleetCost)}</strong></div>
        <div>Daily Rev: <strong class="text-white font-bold">${formatAircraftPriceShort(activePlan.dailyRev)} / day</strong></div>
      </div>
    </div>

    <!-- 3 Best Alternative Aircraft Cards (No Dropdowns!) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      ${topAlternatives.map((alt, idx) => {
        const ac = alt.ac;
        const plan = alt.plan;
        const badge = rankBadges[idx] || rankBadges[1];

        // Delta comparisons vs active aircraft
        const deltaPlanes = plan.reqFleet - activePlan.reqFleet;
        const deltaCost = plan.fleetCost - activePlan.fleetCost;
        const deltaRev = plan.dailyRev - activePlan.dailyRev;
        const deltaDur = plan.totalDurHours - activePlan.totalDurHours;

        return `
          <div class="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 space-y-3 relative transition flex flex-col justify-between">
            <div class="space-y-2.5">
              <!-- Top Rank Badge & Type -->
              <div class="flex items-center justify-between">
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${badge.color} border">
                  ${badge.label}
                </span>
                <span class="text-[10px] font-mono text-slate-400">Cat. ${ac.category} &bull; ${ac.type}</span>
              </div>

              <!-- Aircraft Name (Displayed Prominently, NO dropdown!) -->
              <div>
                <h4 class="text-sm font-bold text-white tracking-tight">${ac.name}</h4>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  ${ac.manufacturer} &bull; ${ac.seats} seats &bull; ${ac.speed_kmh} km/h &bull; ${formatAircraftPriceShort(ac.price)}
                </div>
              </div>

              <!-- Schedule Performance -->
              <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px] font-mono-num">
                <div class="flex justify-between items-center">
                  <span class="text-slate-400">Rotation Flight Time:</span>
                  <div class="flex items-center gap-1.5">
                    <strong class="text-white font-bold">${formatHoursMinutes(plan.totalDurHours)}</strong>
                    <span class="text-[10px] ${deltaDur < 0 ? 'text-emerald-400' : (deltaDur > 0 ? 'text-amber-400' : 'text-slate-500')}">
                      (${deltaDur < 0 ? '-' : '+'}${formatHoursMinutes(Math.abs(deltaDur))})
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400">${plan.targetHours}h Schedule Fit:</span>
                  <span class="${plan.fitsSchedule ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-bold'}">
                    ${plan.fitsSchedule ? '✓ Fits (' + formatHoursMinutes(plan.freeHours) + ' free)' : '⚠ Over by ' + formatHoursMinutes(plan.overHours)}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400">Runway &amp; Range:</span>
                  <span class="${plan.isCompatible ? 'text-emerald-400' : 'text-amber-400'}">
                    ${plan.isCompatible ? '✓ 100% Compatible' : (plan.meetsRange ? '⚠ Runway Issue' : '⚠ Range Exceeded')}
                  </span>
                </div>
              </div>

              <!-- Fleet Sizing & Capital Financials -->
              <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px] font-mono-num">
                <div class="flex justify-between items-center">
                  <span class="text-slate-400">Recommended Fleet:</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-200 font-semibold text-xs">${plan.reqFleet} planes</span>
                    <span class="text-[10px] text-slate-400">
                      (${deltaPlanes >= 0 ? '+' : ''}${deltaPlanes})
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400">Total Purchase Cost:</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-emerald-400 font-bold text-xs">${formatAircraftPriceShort(plan.fleetCost)}</span>
                    <span class="text-[10px] font-semibold ${deltaCost <= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                      (${formatAircraftPriceShort(deltaCost, true)})
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400">Est. Daily Revenue:</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-white font-bold">${formatAircraftPriceShort(plan.dailyRev)} / day</span>
                    <span class="text-[10px] font-semibold ${deltaRev >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                      (${formatAircraftPriceShort(deltaRev, true)})
                    </span>
                  </div>
                </div>
                <div class="flex justify-between items-center text-[10px]">
                  <span class="text-slate-500">Unit Cost / Seat:</span>
                  <span class="text-slate-400">${formatAircraftPriceShort(plan.costPerSeat)} / seat</span>
                </div>
              </div>
            </div>

            <!-- 1-Click Apply Button -->
            <button type="button" onclick="applyComparatorAircraft('${ac.id}')" class="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span>Apply ${ac.name} to Circuit &rarr;</span>
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
window.renderSeatConfigComparator = renderSeatConfigComparator;
