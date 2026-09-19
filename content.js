/**
 * AMT Toolkit - Airlines Manager In-Page Docked Sidebar
 * Injects a resizable, collapsible sidebar into airlines-manager.com.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (document.getElementById('amt-sidebar-container')) return;

  const DEFAULT_WIDTH = 460;
  const MIN_WIDTH = 340;
  const STORAGE_KEY_OPEN = 'amt_sidebar_open';
  const STORAGE_KEY_WIDTH = 'amt_sidebar_width';
  const STORAGE_KEY_MODE = 'amt_ui_mode';
  const APP_URL = 'https://jaym3.github.io/AMT-Toolkit/';
  const APP_IFRAME_URL = 'https://jaym3.github.io/AMT-Toolkit/?sidebar=true';

  // Load saved state
  let isOpen = localStorage.getItem(STORAGE_KEY_OPEN) !== 'false'; // default to open
  let currentWidth = parseInt(localStorage.getItem(STORAGE_KEY_WIDTH), 10) || DEFAULT_WIDTH;
  let currentMode = localStorage.getItem(STORAGE_KEY_MODE) || 'compact';
  currentWidth = Math.max(MIN_WIDTH, Math.min(currentWidth, window.innerWidth - 200));

  // 1. Create Toggle Tab (visible when sidebar is closed)
  const toggleTab = document.createElement('div');
  toggleTab.id = 'amt-toggle-tab';
  toggleTab.title = 'Open AMT Toolkit (Alt+A)';
  toggleTab.innerHTML = `
    <span class="amt-tab-icon">✈</span>
    <span class="amt-tab-text">AMT</span>
  `;
  if (isOpen) toggleTab.style.display = 'none';

  // 2. Create Sidebar Container
  const sidebarContainer = document.createElement('div');
  sidebarContainer.id = 'amt-sidebar-container';
  sidebarContainer.className = isOpen ? 'amt-open' : 'amt-closed';
  sidebarContainer.style.width = `${currentWidth}px`;

  // 3. Assemble Sidebar Content
  sidebarContainer.innerHTML = `
    <div id="amt-sidebar-resizer" title="Drag to resize"></div>
    <div class="amt-sidebar-header">
      <div class="amt-header-title">
        <span>✈ AMT Toolkit</span>
        <span class="amt-badge">SIDEBAR</span>
      </div>
      
      <!-- Compact / Standard Mode Toggle Slider -->
      <div class="amt-mode-toggle" id="amt-mode-toggle" title="Toggle Compact / Standard View">
        <button type="button" class="amt-mode-btn ${currentMode === 'compact' ? 'active' : ''}" id="amt-btn-compact" data-mode="compact">Compact</button>
        <button type="button" class="amt-mode-btn ${currentMode === 'standard' ? 'active' : ''}" id="amt-btn-standard" data-mode="standard">Standard</button>
      </div>

      <div class="amt-header-actions">
        <button type="button" class="amt-btn-icon" id="amt-btn-refresh" title="Reload Calculator">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
        <a href="${APP_URL}" target="_blank" rel="noopener noreferrer" class="amt-btn-icon" title="Open Full Screen in New Tab">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
        <button type="button" class="amt-btn-icon amt-btn-close" id="amt-btn-close" title="Collapse Sidebar (Alt+A)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
    <div class="amt-sidebar-body">
      <div class="amt-loading-spinner" id="amt-loading-spinner">
        <div class="amt-spinner"></div>
        <span>Loading AMT Toolkit...</span>
      </div>
      <iframe id="amt-sidebar-iframe" src="${APP_IFRAME_URL}" allow="clipboard-read; clipboard-write"></iframe>
    </div>
  `;

  // 4. Inject into DOM
  document.body.appendChild(toggleTab);
  document.body.appendChild(sidebarContainer);

  const iframe = document.getElementById('amt-sidebar-iframe');
  const spinner = document.getElementById('amt-loading-spinner');
  const resizer = document.getElementById('amt-sidebar-resizer');
  const btnClose = document.getElementById('amt-btn-close');
  const btnRefresh = document.getElementById('amt-btn-refresh');
  const btnCompact = document.getElementById('amt-btn-compact');
  const btnStandard = document.getElementById('amt-btn-standard');

  function sendModeToIframe(mode) {
    try {
      if (iframe && iframe.contentWindow) {
        console.log('[AMT Extension] Posting message to iframe:', mode);
        iframe.contentWindow.postMessage({ type: 'AMT_SET_MODE', mode: mode }, '*');
      }
    } catch (e) {
      console.warn('[AMT Extension] Error posting message to iframe:', e);
    }
  }

  function setMode(mode) {
    currentMode = mode;
    localStorage.setItem(STORAGE_KEY_MODE, mode);
    btnCompact.className = `amt-mode-btn ${mode === 'compact' ? 'active' : ''}`;
    btnStandard.className = `amt-mode-btn ${mode === 'standard' ? 'active' : ''}`;
    sendModeToIframe(mode);
  }

  btnCompact.addEventListener('click', () => setMode('compact'));
  btnStandard.addEventListener('click', () => setMode('standard'));

  const EXPANDED_TABS = ['seat-config', 'route-finder', 'circuit-finder'];
  let lastZeroOutWidth = currentWidth;
  let savedModeBeforeAutoExpand = currentMode;
  let isAutoExpanded = false;

  function getExpandedWidth() {
    const computed = Math.round(window.innerWidth * 0.58);
    const minExpanded = 860;
    const maxAllowed = Math.floor(window.innerWidth * 0.75);
    return Math.min(Math.max(computed, minExpanded), maxAllowed);
  }

  function handleTabChange(tabId) {
    const modeToggle = document.getElementById('amt-mode-toggle');

    if (EXPANDED_TABS.includes(tabId)) {
      if (!isAutoExpanded) {
        lastZeroOutWidth = currentWidth;
        savedModeBeforeAutoExpand = currentMode;
        isAutoExpanded = true;
      }

      // Drag/expand sidebar out smoothly to ~58% width
      const targetWidth = getExpandedWidth();
      sidebarContainer.style.transition = 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      sidebarContainer.style.width = `${targetWidth}px`;
      currentWidth = targetWidth;
      setTimeout(() => {
        sidebarContainer.style.transition = '';
      }, 380);

      // Force standard mode and disable mode toggle with "Coming soon"
      setMode('standard');
      if (modeToggle) {
        modeToggle.classList.add('amt-mode-toggle-disabled');
        modeToggle.title = 'Coming soon';
      }
      btnCompact.disabled = true;
      btnStandard.disabled = true;
      btnCompact.title = 'Coming soon';
      btnStandard.title = 'Coming soon';

    } else if (tabId === 'zero-out' || tabId === 'home') {
      if (isAutoExpanded) {
        isAutoExpanded = false;

        // Revert sidebar back to original zero-out width
        const revertWidth = Math.max(MIN_WIDTH, lastZeroOutWidth || DEFAULT_WIDTH);
        sidebarContainer.style.transition = 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        sidebarContainer.style.width = `${revertWidth}px`;
        currentWidth = revertWidth;
        localStorage.setItem(STORAGE_KEY_WIDTH, revertWidth.toString());
        setTimeout(() => {
          sidebarContainer.style.transition = '';
        }, 380);

        // Re-enable mode toggle and restore previous mode
        if (modeToggle) {
          modeToggle.classList.remove('amt-mode-toggle-disabled');
          modeToggle.title = 'Toggle Compact / Standard View';
        }
        btnCompact.disabled = false;
        btnStandard.disabled = false;
        btnCompact.title = '';
        btnStandard.title = '';

        setMode(savedModeBeforeAutoExpand || 'compact');
      }
    }
  }

  // Hide spinner once iframe is loaded and send current mode
  iframe.addEventListener('load', () => {
    if (spinner) {
      spinner.style.opacity = '0';
      setTimeout(() => { spinner.style.display = 'none'; }, 300);
    }
    // Delay slightly to ensure app.js is fully loaded and listener is registered
    setTimeout(() => sendModeToIframe(currentMode), 200);
    setTimeout(() => sendModeToIframe(currentMode), 800);
  });

  // Toggle Functionality
  function openSidebar() {
    isOpen = true;
    sidebarContainer.className = 'amt-open';
    toggleTab.style.display = 'none';
    localStorage.setItem(STORAGE_KEY_OPEN, 'true');
  }

  function closeSidebar() {
    isOpen = false;
    sidebarContainer.className = 'amt-closed';
    toggleTab.style.display = 'flex';
    localStorage.setItem(STORAGE_KEY_OPEN, 'false');
  }

  function toggleSidebar() {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  toggleTab.addEventListener('click', openSidebar);
  btnClose.addEventListener('click', closeSidebar);

  // Sync state on bfcache restore
  window.addEventListener('pageshow', () => {
    try {
      const savedOpen = localStorage.getItem(STORAGE_KEY_OPEN) !== 'false';
      if (savedOpen !== isOpen) {
        if (savedOpen) openSidebar();
        else closeSidebar();
      }
    } catch (e) {}
  });

  // Reload iframe
  btnRefresh.addEventListener('click', () => {
    if (spinner) {
      spinner.style.display = 'flex';
      spinner.style.opacity = '1';
    }
    iframe.src = APP_IFRAME_URL;
  });

  // Keyboard shortcut: Alt + A
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Resizing logic
  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizer.classList.add('amt-resizing');
    document.body.style.userSelect = 'none';
    // Disable pointer events on iframe while dragging so mousemove isn't captured by the iframe
    iframe.style.pointerEvents = 'none';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const maxAllowedWidth = Math.floor(window.innerWidth * 0.75);
    const newWidth = Math.max(MIN_WIDTH, Math.min(window.innerWidth - e.clientX, maxAllowedWidth));
    currentWidth = newWidth;
    sidebarContainer.style.width = `${newWidth}px`;
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('amt-resizing');
      document.body.style.userSelect = '';
      iframe.style.pointerEvents = 'auto';
      if (!isAutoExpanded) {
        lastZeroOutWidth = currentWidth;
        localStorage.setItem(STORAGE_KEY_WIDTH, currentWidth.toString());
      }
    }
  });

  // =========================================================================
  // AIRLINES MANAGER GAME SCRAPING & PRICE EXPORT INTEGRATION
  // =========================================================================

  function parseNumber(str) {
    if (!str) return null;
    const clean = str.replace(/[^\d.-]/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? null : num;
  }

  function sendToIframe(msg) {
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(msg, '*');
      }
    } catch (e) {
      console.warn('[AMT Extension] Failed to send message to iframe:', e);
    }
  }

  // 1. Scrape Pricing Page (/marketing/pricing/{lineId})
  function handleImportRequest() {
    console.log('[AMT Extension] handleImportRequest triggered on:', window.location.href);
    const pathname = window.location.pathname;
    const pricingMatch = pathname.match(/\/marketing\/pricing\/(\d+)/);

    if (!pricingMatch) {
      sendToIframe({
        type: 'AMT_IMPORT_ERROR',
        message: 'Please navigate to a Route Pricing page (marketing/pricing/...) to import values.'
      });
      return;
    }

    const lineId = pricingMatch[1];

    try {
      const pageText = document.body.innerText || document.body.textContent || '';

      // Extract Route Hub and Destination (e.g. DWC / BUD)
      let hub = '';
      let dst = '';
      let routeName = '';

      // 1. Primary: Match the Route line: e.g. "Route DWC - Dubai - Al Maktoum Airport BUD Budapest - Budapest Ferenc Liszt Airport /"
      const routeLineMatch = pageText.match(/(?:Route|Ligne)\s+([A-Z]{3})[\s\S]*?(?=(?:Internal audit|Audit interne|Ideal ticket price|Prix idéal|Economy class|Classe économique|\n\n|$))/);
      if (routeLineMatch) {
        const lineText = routeLineMatch[0];
        // Match only ALL-CAPS 3-letter IATA codes (case-sensitive, avoiding city names like Dubai/Budapest)
        const iataMatches = Array.from(lineText.matchAll(/\b([A-Z]{3})\b/g)).map(m => m[1]);
        if (iataMatches.length >= 2) {
          hub = iataMatches[0];
          dst = iataMatches[1];
          routeName = `${hub} / ${dst}`;
        } else if (iataMatches.length === 1) {
          hub = iataMatches[0];
          routeName = hub;
        }
      }

      // 2. Secondary: Check DOM element around the Route button link (/network/showline/{lineId})
      if (!dst) {
        const showlineLink = document.querySelector('a[href*="/network/showline/"]');
        if (showlineLink) {
          const parentText = showlineLink.parentElement ? (showlineLink.parentElement.innerText || '') : '';
          const iataMatches = Array.from(parentText.matchAll(/\b([A-Z]{3})\b/g)).map(m => m[1]);
          if (iataMatches.length >= 2) {
            hub = iataMatches[0];
            dst = iataMatches[1];
            routeName = `${hub} / ${dst}`;
          }
        }
      }

      // 3. Fallback: Check document title or breadcrumbs
      if (!dst) {
        const titleMatch = document.title.match(/\b([A-Z]{3})\s*[-/]\s*([A-Z]{3})\b/);
        if (titleMatch) {
          hub = titleMatch[1];
          dst = titleMatch[2];
          routeName = `${hub} / ${dst}`;
        }
      }

      // Split page into sections: LAST AUDIT, INFORMATION ABOUT THE ROUTE, CHANGE YOUR PRICES
      const auditSplit = pageText.split(/INFORMATION ABOUT THE ROUTE|INFORMATIONS SUR LA LIGNE/i);
      const auditText = auditSplit[0] || '';

      // Check Audit Reliability: must be "Reliable" / "Fiable"
      const relMatch = auditText.match(/(?:Reliability|Fiabilité)\s*:\s*([^\n\r]+)/i);
      const relStatus = relMatch ? relMatch[1].trim() : 'Unknown';
      const isReliable = /^(?:Reliable|Fiable)$/i.test(relStatus);
      if (!isReliable) {
        sendToIframe({
          type: 'AMT_IMPORT_ERROR',
          message: `Last audit is not Reliable (found: "${relStatus}"). Please perform an internal audit on this route first.`
        });
        return;
      }

      // Extract Audit Prices: Eco, Bus, First, Cargo
      const auditPriceMatches = Array.from(auditText.matchAll(/(?:Ideal ticket price|Ideal price\/Tonne|Prix idéal|Prix idéal\/Tonne)\s*:\s*\$?(-?[0-9\s,]+)/gi));
      const pAudit = auditPriceMatches.map(m => parseNumber(m[1]));

      // Extract Audit Demands: Eco, Bus, First, Cargo
      const auditDemandMatches = Array.from(auditText.matchAll(/(?:^|[^\w])Demand\s*:\s*(-?[0-9\s,]+)\s*(?:Pax|T)/gi));
      const dAudit = auditDemandMatches.map(m => parseNumber(m[1]));

      if (pAudit.length < 4 || dAudit.length < 4) {
        sendToIframe({
          type: 'AMT_IMPORT_ERROR',
          message: 'Could not locate Last Audit values. Please make sure an internal audit has been performed on this route.'
        });
        return;
      }

      // Extract Remaining Demands specifically from the SIMULATE DEMAND section (NOT from INFORMATION ABOUT THE ROUTE)
      const simSplit = pageText.split(/(?:SIMULATE DEMAND|SIMULER LA DEMANDE)/i);
      if (simSplit.length < 2) {
        sendToIframe({
          type: 'AMT_IMPORT_ERROR',
          message: 'Simulation section not found. Please click "Perform a simulation" on this route page first.'
        });
        return;
      }

      const simSection = simSplit[1].split(/(?:The SUPER Simulation|La SUPER Simulation|Perform a SUPER Simulation|Effectuer une SUPER Simulation|CHANGE YOUR PRICES|MODIFIER VOS PRIX|$)/i)[0];
      const remDemandMatches = Array.from(simSection.matchAll(/(?:Remaining demand|Demande restante)\s*:\s*(-?[0-9\s,]+)\s*(?:Pax|T)/gi));
      const rDemand = remDemandMatches.map(m => parseNumber(m[1]));

      if (rDemand.length < 4 || rDemand.some(r => r === null || isNaN(r))) {
        sendToIframe({
          type: 'AMT_IMPORT_ERROR',
          message: 'No simulation results found. Please click "Perform a simulation" on this route page before importing.'
        });
        return;
      }

      // Check if "Change your price" fields match the last audit "Ideal ticket price" fields
      let simPriceMismatch = false;

      const changeHeader = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, legend, th, td')).find(el => 
        /CHANGE YOUR PRICES|MODIFIER VOS PRIX/i.test(el.textContent || '')
      );
      let changeInputs = [];
      if (changeHeader) {
        const container = changeHeader.closest('.box, form, section, div');
        if (container) {
          changeInputs = Array.from(container.querySelectorAll('input[type="text"], input[type="number"]'));
        }
      }
      if (changeInputs.length < 4) {
        const namedEco = document.querySelector('input[name*="priceEco"], input[name*="PriceEco"], input[id*="priceEco"]');
        const namedBus = document.querySelector('input[name*="priceBus"], input[name*="PriceBus"], input[id*="priceBus"]');
        const namedFirst = document.querySelector('input[name*="priceFirst"], input[name*="PriceFirst"], input[id*="priceFirst"]');
        const namedCargo = document.querySelector('input[name*="priceCargo"], input[name*="PriceCargo"], input[id*="priceCargo"]');
        if (namedEco && namedBus && namedFirst && namedCargo) {
          changeInputs = [namedEco, namedBus, namedFirst, namedCargo];
        }
      }

      if (changeInputs.length >= 4) {
        for (let i = 0; i < 4; i++) {
          const val = parseNumber(changeInputs[i].value);
          if (val && pAudit[i] && Math.abs(val - pAudit[i]) > 0.01) {
            simPriceMismatch = true;
            break;
          }
        }
      } else {
        // Fallback: Check derived prices from Turnover / Simulated Demand in simSection
        const simDemands = Array.from(simSection.matchAll(/(?:Simulated demand|Demande simulée)\s*:\s*([0-9\s,]+)\s*(?:Pax|T)/gi))
          .map(m => parseNumber(m[1]));
        const turnovers = Array.from(simSection.matchAll(/(?:Turnover|Chiffre d'affaires)\s*:\s*([0-9\s,]+)\s*\$/gi))
          .map(m => parseNumber(m[1]));

        if (simDemands.length >= 4 && turnovers.length >= 4) {
          for (let i = 0; i < 4; i++) {
            if (simDemands[i] > 0 && turnovers[i] > 0 && pAudit[i] > 0) {
              const derivedPrice = Math.round(turnovers[i] / simDemands[i]);
              if (Math.abs(derivedPrice - pAudit[i]) > 1) {
                simPriceMismatch = true;
                break;
              }
            }
          }
        }
      }

      // Build import payload
      const importedData = {
        lineId,
        hub,
        dst,
        routeName: routeName || (hub && dst ? `${hub} / ${dst}` : `Route #${lineId}`),
        hasRemainingDemand: true,
        simPriceMismatch: Boolean(simPriceMismatch),
        eco: {
          pAudit: pAudit[0],
          dSim: dAudit[0],
          r: rDemand[0]
        },
        bus: {
          pAudit: pAudit[1],
          dSim: dAudit[1],
          r: rDemand[1]
        },
        first: {
          pAudit: pAudit[2],
          dSim: dAudit[2],
          r: rDemand[2]
        },
        cargo: {
          pAudit: pAudit[3],
          dSim: dAudit[3],
          r: rDemand[3]
        }
      };

      console.log('[AMT Extension] Sending imported data to iframe:', importedData);

      sendToIframe({
        type: 'AMT_IMPORT_SUCCESS',
        data: importedData
      });

    } catch (err) {
      console.error('[AMT Extension] Error importing values:', err);
      sendToIframe({
        type: 'AMT_IMPORT_ERROR',
        message: 'Error importing values: ' + err.message
      });
    }
  }

  // 2. Export Target Prices into "CHANGE YOUR PRICES"
  function handleExportPrices(prices) {
    if (!prices) return;

    try {
      const allHeaders = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, span'));
      const changeHeader = allHeaders.find(h => 
        /CHANGE YOUR PRICES|MODIFIER VOS PRIX/i.test(h.textContent || '')
      );

      let inputs = [];
      if (changeHeader) {
        const container = changeHeader.closest('.box, form, section, div');
        if (container) {
          inputs = Array.from(container.querySelectorAll('input[type="text"], input[type="number"]'));
        }
      }

      if (inputs.length < 4) {
        const namedEco = document.querySelector('input[name*="priceEco"], input[name*="PriceEco"], input[id*="priceEco"]');
        const namedBus = document.querySelector('input[name*="priceBus"], input[name*="PriceBus"], input[id*="priceBus"]');
        const namedFirst = document.querySelector('input[name*="priceFirst"], input[name*="PriceFirst"], input[id*="priceFirst"]');
        const namedCargo = document.querySelector('input[name*="priceCargo"], input[name*="PriceCargo"], input[id*="priceCargo"]');
        if (namedEco && namedBus && namedFirst && namedCargo) {
          inputs = [namedEco, namedBus, namedFirst, namedCargo];
        }
      }

      if (inputs.length < 4) {
        sendToIframe({
          type: 'AMT_EXPORT_ERROR',
          message: 'Could not find the price input fields on this page. Make sure "CHANGE YOUR PRICES" is visible.'
        });
        return;
      }

      const priceList = [prices.eco, prices.bus, prices.first, prices.cargo];
      inputs.slice(0, 4).forEach((input, idx) => {
        const p = priceList[idx];
        if (p !== null && p !== undefined && !isNaN(p)) {
          input.value = p;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Visual highlight
          const origTransition = input.style.transition;
          const origBorder = input.style.border;
          const origBoxShadow = input.style.boxShadow;
          input.style.transition = 'all 0.2s ease';
          input.style.border = '2px solid #10b981';
          input.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.7)';
          setTimeout(() => {
            input.style.border = origBorder;
            input.style.boxShadow = origBoxShadow;
            input.style.transition = origTransition;
          }, 2200);
        }
      });

      sendToIframe({
        type: 'AMT_EXPORT_SUCCESS',
        prices: prices
      });

    } catch (err) {
      console.error('[AMT Extension] Error exporting prices:', err);
      sendToIframe({
        type: 'AMT_EXPORT_ERROR',
        message: 'Failed to export prices: ' + err.message
      });
    }
  }

  // 3. Copy Audit Price to Change Price
  function handleCopyAuditToChange() {
    console.log('[AMT Extension] handleCopyAuditToChange triggered');
    const pathname = window.location.pathname;
    const pricingMatch = pathname.match(/\/marketing\/pricing\/(\d+)/);
    if (!pricingMatch) {
      sendToIframe({
        type: 'AMT_COPY_AUDIT_ERROR',
        message: 'Please navigate to a Route Pricing page (marketing/pricing/...) to copy audit prices.'
      });
      return;
    }

    try {
      const pageText = document.body.innerText || document.body.textContent || '';
      const auditSplit = pageText.split(/INFORMATION ABOUT THE ROUTE|INFORMATIONS SUR LA LIGNE/i);
      const auditText = auditSplit[0] || '';

      // Check Audit Reliability: must be "Reliable" / "Fiable"
      const relMatch = auditText.match(/(?:Reliability|Fiabilité)\s*:\s*([^\n\r]+)/i);
      const relStatus = relMatch ? relMatch[1].trim() : 'Unknown';
      const isReliable = /^(?:Reliable|Fiable)$/i.test(relStatus);
      if (!isReliable) {
        sendToIframe({
          type: 'AMT_COPY_AUDIT_ERROR',
          message: `Last audit is not Reliable (found: "${relStatus}"). Please perform an internal audit first.`
        });
        return;
      }

      // Extract Audit Prices: Eco, Bus, First, Cargo
      const auditPriceMatches = Array.from(auditText.matchAll(/(?:Ideal ticket price|Ideal price\/Tonne|Prix idéal|Prix idéal\/Tonne)\s*:\s*\$?(-?[0-9\s,]+)/gi));
      const pAudit = auditPriceMatches.map(m => parseNumber(m[1]));

      if (pAudit.length < 4 || pAudit.some(p => p === null || isNaN(p) || p <= 0)) {
        sendToIframe({
          type: 'AMT_COPY_AUDIT_ERROR',
          message: 'Could not find 4 valid ideal ticket prices from the audit.'
        });
        return;
      }

      // Find inputs under "CHANGE YOUR PRICES"
      let inputs = [];
      const changeHeader = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, legend, th, td')).find(el => 
        /CHANGE YOUR PRICES|MODIFIER VOS PRIX/i.test(el.textContent || '')
      );
      if (changeHeader) {
        const container = changeHeader.closest('.box, form, section, div');
        if (container) {
          inputs = Array.from(container.querySelectorAll('input[type="text"], input[type="number"]'));
        }
      }
      if (inputs.length < 4) {
        const namedEco = document.querySelector('input[name*="priceEco"], input[name*="PriceEco"], input[id*="priceEco"]');
        const namedBus = document.querySelector('input[name*="priceBus"], input[name*="PriceBus"], input[id*="priceBus"]');
        const namedFirst = document.querySelector('input[name*="priceFirst"], input[name*="PriceFirst"], input[id*="priceFirst"]');
        const namedCargo = document.querySelector('input[name*="priceCargo"], input[name*="PriceCargo"], input[id*="priceCargo"]');
        if (namedEco && namedBus && namedFirst && namedCargo) {
          inputs = [namedEco, namedBus, namedFirst, namedCargo];
        }
      }

      if (inputs.length < 4) {
        sendToIframe({
          type: 'AMT_COPY_AUDIT_ERROR',
          message: 'Could not find price inputs under "CHANGE YOUR PRICES".'
        });
        return;
      }

      // Fill inputs with pAudit
      inputs.slice(0, 4).forEach((input, idx) => {
        input.value = pAudit[idx];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Highlight in indigo
        const origTransition = input.style.transition;
        const origBorder = input.style.border;
        const origBoxShadow = input.style.boxShadow;
        input.style.transition = 'all 0.2s ease';
        input.style.border = '2px solid #6366f1';
        input.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.7)';
        setTimeout(() => {
          input.style.border = origBorder;
          input.style.boxShadow = origBoxShadow;
          input.style.transition = origTransition;
        }, 2200);
      });

      sendToIframe({
        type: 'AMT_COPY_AUDIT_SUCCESS',
        prices: {
          eco: pAudit[0],
          bus: pAudit[1],
          first: pAudit[2],
          cargo: pAudit[3]
        }
      });

    } catch (err) {
      console.error('[AMT Extension] Error in handleCopyAuditToChange:', err);
      sendToIframe({
        type: 'AMT_COPY_AUDIT_ERROR',
        message: 'Failed to copy audit prices: ' + err.message
      });
    }
  }

  // Listen for messages from iframe
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'AMT_IMPORT_REQUEST') {
      handleImportRequest();
    } else if (e.data.type === 'AMT_EXPORT_PRICES_REQUEST') {
      handleExportPrices(e.data.prices);
    } else if (e.data.type === 'AMT_COPY_AUDIT_TO_CHANGE_REQUEST') {
      handleCopyAuditToChange();
    } else if (e.data.type === 'AMT_TAB_CHANGED') {
      handleTabChange(e.data.tabId);
    }
  });

})();

