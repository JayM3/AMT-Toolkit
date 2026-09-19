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
      <iframe id="amt-sidebar-iframe" src="${APP_URL}" allow="clipboard-read; clipboard-write"></iframe>
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

  // Reload iframe
  btnRefresh.addEventListener('click', () => {
    if (spinner) {
      spinner.style.display = 'flex';
      spinner.style.opacity = '1';
    }
    iframe.src = APP_URL;
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
      localStorage.setItem(STORAGE_KEY_WIDTH, currentWidth.toString());
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

  // 1. Scrape Pricing Page (/marketing/pricing/{lineId}) & /network/showline/{lineId}
  async function handleImportRequest() {
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
      // Find route name if available
      let routeName = '';
      const allText = document.body.innerText || document.body.textContent || '';
      const routeMatch = allText.match(/Route\s+([A-Z]{3})\s*[-–/].*?([A-Z]{3})\s*[-–/]/i);
      if (routeMatch) {
        routeName = `${routeMatch[1]} / ${routeMatch[2]}`;
      } else {
        const iataMatches = Array.from(allText.matchAll(/\b([A-Z]{3})\b/g)).map(m => m[1]);
        if (iataMatches.length >= 2) {
          routeName = `${iataMatches[0]} / ${iataMatches[1]}`;
        }
      }

      // Scrape LAST AUDIT section
      let pAudit = { eco: null, bus: null, first: null, cargo: null };
      let dAudit = { eco: null, bus: null, first: null, cargo: null };

      const allElements = Array.from(document.querySelectorAll('div, table, section, td'));
      const lastAuditBlock = allElements.find(el => {
        const text = (el.textContent || '').trim();
        return (text.includes('LAST AUDIT') || text.includes('DERNIER AUDIT')) &&
               (text.includes('Ideal ticket price') || text.includes('Prix idéal') || text.includes('Ideal price/Tonne'));
      });

      const scope = lastAuditBlock || document.body;

      // Extract by Class Column
      const classConfigs = [
        { key: 'eco', names: ['Economy class', 'Classe économique', 'Economy'] },
        { key: 'bus', names: ['Business class', 'Classe affaires', 'Business'] },
        { key: 'first', names: ['First class', 'Première classe', 'First'] },
        { key: 'cargo', names: ['Cargo'] }
      ];

      const scopeElements = Array.from(scope.querySelectorAll('*'));

      classConfigs.forEach(({ key, names }) => {
        const headerEl = scopeElements.find(e => 
          names.some(n => e.textContent && e.textContent.trim().toLowerCase() === n.toLowerCase())
        );

        if (headerEl) {
          let container = headerEl.closest('td, th, [class*="col"], div');
          if (!container || !/(?:Ideal|Prix)/i.test(container.innerText || '')) {
            container = headerEl.parentElement;
          }

          if (container) {
            const blockText = container.innerText || container.textContent || '';
            const priceMatch = blockText.match(/(?:Ideal ticket price|Ideal price\/Tonne|Prix idéal|Prix idéal\/Tonne)\s*:\s*\$?([\d\s,]+)/i);
            const demandMatch = blockText.match(/(?:Demand|Demande)\s*:\s*([\d\s,]+)\s*(?:Pax|T)?/i);
            if (priceMatch) pAudit[key] = parseNumber(priceMatch[1]);
            if (demandMatch) dAudit[key] = parseNumber(demandMatch[1]);
          }
        }
      });

      // Regex fallback if needed
      const scopeText = scope.innerText || scope.textContent || '';
      if (!pAudit.eco || !dAudit.eco) {
        const prices = Array.from(scopeText.matchAll(/(?:Ideal ticket price|Ideal price\/Tonne|Prix idéal|Prix idéal\/Tonne)\s*:\s*\$?([\d\s,]+)/gi));
        const demands = Array.from(scopeText.matchAll(/(?:Demand|Demande)\s*:\s*([\d\s,]+)\s*(?:Pax|T)?/gi));
        if (prices.length >= 4) {
          pAudit.eco = pAudit.eco ?? parseNumber(prices[0][1]);
          pAudit.bus = pAudit.bus ?? parseNumber(prices[1][1]);
          pAudit.first = pAudit.first ?? parseNumber(prices[2][1]);
          pAudit.cargo = pAudit.cargo ?? parseNumber(prices[3][1]);
        }
        if (demands.length >= 4) {
          dAudit.eco = dAudit.eco ?? parseNumber(demands[0][1]);
          dAudit.bus = dAudit.bus ?? parseNumber(demands[1][1]);
          dAudit.first = dAudit.first ?? parseNumber(demands[2][1]);
          dAudit.cargo = dAudit.cargo ?? parseNumber(demands[3][1]);
        }
      }

      if (!pAudit.eco || !dAudit.eco) {
        sendToIframe({
          type: 'AMT_IMPORT_ERROR',
          message: 'Could not locate Last Audit values. Please make sure an internal audit exists for this route.'
        });
        return;
      }

      // Fetch scheduled Offer from /network/showline/{lineId}
      let offers = { eco: null, bus: null, first: null, cargo: null };

      try {
        const showlineUrl = `${window.location.origin}/network/showline/${lineId}`;
        console.log('[AMT Extension] Fetching showline statistics:', showlineUrl);
        const resp = await fetch(showlineUrl, { credentials: 'include' });
        if (resp.ok) {
          const html = await resp.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          
          const rows = Array.from(doc.querySelectorAll('tr'));
          const offerRow = rows.find(r => {
            const firstCell = r.querySelector('th, td');
            return firstCell && /Offer|Offre/i.test(firstCell.textContent || '');
          });

          if (offerRow) {
            const cells = Array.from(offerRow.querySelectorAll('td'));
            if (cells.length >= 4) {
              offers.eco = parseNumber(cells[0].textContent);
              offers.bus = parseNumber(cells[1].textContent);
              offers.first = parseNumber(cells[2].textContent);
              offers.cargo = parseNumber(cells[3].textContent);
            }
          }
        }
      } catch (fetchErr) {
        console.warn('[AMT Extension] Fetch /network/showline failed, trying page fallback:', fetchErr);
      }

      // Fallback for Offer: compute from INFORMATION ABOUT THE ROUTE (Current Demand - Remaining Demand)
      if (offers.eco === null) {
        const routeInfoBlock = allElements.find(el => {
          const text = (el.textContent || '').trim();
          return (text.includes('INFORMATION ABOUT THE ROUTE') || text.includes('INFORMATIONS SUR LA LIGNE')) &&
                 (text.includes('Remaining demand') || text.includes('Demande restante'));
        });

        if (routeInfoBlock) {
          const infoText = routeInfoBlock.innerText || routeInfoBlock.textContent || '';
          const curDemands = Array.from(infoText.matchAll(/(?:Demand|Demande)\s*:\s*([\d\s,]+)\s*(?:Pax|T)?/gi));
          const remDemands = Array.from(infoText.matchAll(/(?:Remaining demand|Demande restante)\s*:\s*([\d\s,]+)\s*(?:Pax|T)?/gi));

          if (curDemands.length >= 4 && remDemands.length >= 4) {
            offers.eco = parseNumber(curDemands[0][1]) - parseNumber(remDemands[0][1]);
            offers.bus = parseNumber(curDemands[1][1]) - parseNumber(remDemands[1][1]);
            offers.first = parseNumber(curDemands[2][1]) - parseNumber(remDemands[2][1]);
            offers.cargo = parseNumber(curDemands[3][1]) - parseNumber(remDemands[3][1]);
          }
        }
      }

      if (offers.eco === null) {
        sendToIframe({
          type: 'AMT_IMPORT_ERROR',
          message: 'Found audit data, but could not retrieve scheduled Offer. Please check network connection.'
        });
        return;
      }

      // Compute Remain = dSim (Audit Demand) - Offer
      const importedData = {
        lineId,
        routeName: routeName || `Route #${lineId}`,
        eco: {
          pAudit: pAudit.eco,
          dSim: dAudit.eco,
          offer: offers.eco,
          r: dAudit.eco - offers.eco
        },
        bus: {
          pAudit: pAudit.bus,
          dSim: dAudit.bus,
          offer: offers.bus,
          r: dAudit.bus - offers.bus
        },
        first: {
          pAudit: pAudit.first,
          dSim: dAudit.first,
          offer: offers.first,
          r: dAudit.first - offers.first
        },
        cargo: {
          pAudit: pAudit.cargo,
          dSim: dAudit.cargo,
          offer: offers.cargo,
          r: dAudit.cargo - offers.cargo
        }
      };

      console.log('[AMT Extension] Import successful:', importedData);

      sendToIframe({
        type: 'AMT_IMPORT_SUCCESS',
        data: importedData
      });

    } catch (err) {
      console.error('[AMT Extension] Error importing values:', err);
      sendToIframe({
        type: 'AMT_IMPORT_ERROR',
        message: 'An error occurred while importing: ' + err.message
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

  // Listen for messages from iframe
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'AMT_IMPORT_REQUEST') {
      handleImportRequest();
    } else if (e.data.type === 'AMT_EXPORT_PRICES_REQUEST') {
      handleExportPrices(e.data.prices);
    }
  });

})();

