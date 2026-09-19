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
        iframe.contentWindow.postMessage({ type: 'AMT_SET_MODE', mode: mode }, '*');
      }
    } catch (e) {}
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
    // Delay slightly to ensure app.js is initialized
    setTimeout(() => sendModeToIframe(currentMode), 250);
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

})();
