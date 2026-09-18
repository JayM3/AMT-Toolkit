/**
 * AMT Circuit Finder Engine (circuit_finder.js)
 * High-performance combinatorial circuit generator, multi-hub optimizer,
 * class ratio interpreter, and schedule rotation solver for Airlines Manager Tycoon.
 */
'use strict';

(function(window, document) {

  // Continent lookup map
  const CF_CONTINENT_MAP = {
    'Algeria': 'Africa', 'Angola': 'Africa', 'Benin': 'Africa', 'Botswana': 'Africa', 'Burkina Faso': 'Africa',
    'Burundi': 'Africa', 'Cameroon': 'Africa', 'Cape Verde': 'Africa', 'Central African Republic': 'Africa',
    'Chad': 'Africa', 'Comoros': 'Africa', 'Congo': 'Africa', 'Democratic Republic of the Congo': 'Africa',
    'Djibouti': 'Africa', 'Egypt': 'Africa', 'Equatorial Guinea': 'Africa', 'Eritrea': 'Africa', 'Ethiopia': 'Africa',
    'Gabon': 'Africa', 'Gambia': 'Africa', 'Ghana': 'Africa', 'Guinea': 'Africa', 'Guinea-Bissau': 'Africa',
    'Ivory Coast': 'Africa', 'Kenya': 'Africa', 'Lesotho': 'Africa', 'Liberia': 'Africa', 'Libya': 'Africa',
    'Madagascar': 'Africa', 'Malawi': 'Africa', 'Mali': 'Africa', 'Mauritania': 'Africa', 'Mauritius': 'Africa',
    'Morocco': 'Africa', 'Mozambique': 'Africa', 'Namibia': 'Africa', 'Niger': 'Africa', 'Nigeria': 'Africa',
    'Rwanda': 'Africa', 'Sao Tome and Principe': 'Africa', 'Senegal': 'Africa', 'Seychelles': 'Africa',
    'Sierra Leone': 'Africa', 'Somalia': 'Africa', 'South Africa': 'Africa', 'South Sudan': 'Africa', 'Sudan': 'Africa',
    'Swaziland': 'Africa', 'Tanzania': 'Africa', 'Togo': 'Africa', 'Tunisia': 'Africa', 'Uganda': 'Africa',
    'Zambia': 'Africa', 'Zimbabwe': 'Africa',
    'Afghanistan': 'Asia', 'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Bahrain': 'Asia', 'Bangladesh': 'Asia',
    'Bhutan': 'Asia', 'Brunei': 'Asia', 'Cambodia': 'Asia', 'China': 'Asia', 'Cyprus': 'Asia', 'Georgia': 'Asia',
    'India': 'Asia', 'Indonesia': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Israel': 'Asia', 'Japan': 'Asia',
    'Jordan': 'Asia', 'Kazakhstan': 'Asia', 'Kuwait': 'Asia', 'Kyrgyzstan': 'Asia', 'Laos': 'Asia', 'Lebanon': 'Asia',
    'Malaysia': 'Asia', 'Maldives': 'Asia', 'Mongolia': 'Asia', 'Myanmar': 'Asia', 'Nepal': 'Asia', 'North Korea': 'Asia',
    'Oman': 'Asia', 'Pakistan': 'Asia', 'Palestine': 'Asia', 'Philippines': 'Asia', 'Qatar': 'Asia', 'Russia': 'Europe',
    'Saudi Arabia': 'Asia', 'Singapore': 'Asia', 'South Korea': 'Asia', 'Sri Lanka': 'Asia', 'Syria': 'Asia',
    'Taiwan': 'Asia', 'Tajikistan': 'Asia', 'Thailand': 'Asia', 'Timor-Leste': 'Asia', 'Turkey': 'Europe',
    'Turkmenistan': 'Asia', 'United Arab Emirates': 'Asia', 'Uzbekistan': 'Asia', 'Vietnam': 'Asia', 'Yemen': 'Asia',
    'Albania': 'Europe', 'Andorra': 'Europe', 'Austria': 'Europe', 'Belarus': 'Europe', 'Belgium': 'Europe',
    'Bosnia and Herzegovina': 'Europe', 'Bulgaria': 'Europe', 'Croatia': 'Europe', 'Czech Republic': 'Europe',
    'Denmark': 'Europe', 'Estonia': 'Europe', 'Finland': 'Europe', 'France': 'Europe', 'Germany': 'Europe',
    'Greece': 'Europe', 'Hungary': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Italy': 'Europe',
    'Kosovo': 'Europe', 'Latvia': 'Europe', 'Liechtenstein': 'Europe', 'Lithuania': 'Europe', 'Luxembourg': 'Europe',
    'Macedonia': 'Europe', 'Malta': 'Europe', 'Moldova': 'Europe', 'Monaco': 'Europe', 'Montenegro': 'Europe',
    'Netherlands': 'Europe', 'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe', 'Romania': 'Europe',
    'San Marino': 'Europe', 'Serbia': 'Europe', 'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Spain': 'Europe',
    'Sweden': 'Europe', 'Switzerland': 'Europe', 'Ukraine': 'Europe', 'United Kingdom': 'Europe', 'Vatican City': 'Europe',
    'Antigua and Barbuda': 'North America', 'Bahamas': 'North America', 'Barbados': 'North America', 'Belize': 'North America',
    'Canada': 'North America', 'Costa Rica': 'North America', 'Cuba': 'North America', 'Dominica': 'North America',
    'Dominican Republic': 'North America', 'El Salvador': 'North America', 'Grenada': 'North America', 'Guatemala': 'North America',
    'Haiti': 'North America', 'Honduras': 'North America', 'Jamaica': 'North America', 'Mexico': 'North America',
    'Nicaragua': 'North America', 'Panama': 'North America', 'Saint Kitts and Nevis': 'North America', 'Saint Lucia': 'North America',
    'Saint Vincent and the Grenadines': 'North America', 'Trinidad and Tobago': 'North America', 'United States': 'North America',
    'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America', 'Chile': 'South America',
    'Colombia': 'South America', 'Ecuador': 'South America', 'Guyana': 'South America', 'Paraguay': 'South America',
    'Peru': 'South America', 'Suriname': 'South America', 'Uruguay': 'South America', 'Venezuela': 'South America',
    'Australia': 'Oceania', 'Fiji': 'Oceania', 'Kiribati': 'Oceania', 'Marshall Islands': 'Oceania', 'Micronesia': 'Oceania',
    'Nauru': 'Oceania', 'New Zealand': 'Oceania', 'Palau': 'Oceania', 'Papua New Guinea': 'Oceania', 'Samoa': 'Oceania',
    'Solomon Islands': 'Oceania', 'Tonga': 'Oceania', 'Tuvalu': 'Oceania', 'Vanuatu': 'Oceania'
  };

  // Preset Class Weighting Strategies
  const CF_STRATEGY_PRESETS = {
    'tri_class': { eco: 0.60, bus: 0.25, first: 0.15, cargo: 0.00, label: 'Balanced Tri-Class (60/25/15)' },
    'eco':       { eco: 1.00, bus: 0.00, first: 0.00, cargo: 0.00, label: '100% Economy Focus' },
    'premium':   { eco: 0.25, bus: 0.45, first: 0.30, cargo: 0.00, label: 'Premium Luxury (25/45/30)' },
    'cargo':     { eco: 0.40, bus: 0.20, first: 0.10, cargo: 0.30, label: 'Cargo Hybrid (40/20/10/30)' }
  };

  // Leg visual palette
  const CF_CIRCUIT_COLORS = [
    { bg: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-950 text-cyan-300 border-cyan-800' },
    { bg: 'bg-blue-500', text: 'text-blue-400', badge: 'bg-blue-950 text-blue-300 border-blue-800' },
    { bg: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    { bg: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-950 text-amber-300 border-amber-800' },
    { bg: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-950 text-purple-300 border-purple-800' },
    { bg: 'bg-rose-500', text: 'text-rose-400', badge: 'bg-rose-950 text-rose-300 border-rose-800' },
    { bg: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
    { bg: 'bg-teal-500', text: 'text-teal-400', badge: 'bg-teal-950 text-teal-300 border-teal-800' }
  ];

  // Storage Keys
  const CF_OWNED_HUBS_KEY = 'amt_circuit_finder_owned_hubs_v1';
  const CF_SHARED_SAVED_CIRCUITS_KEY = 'am_saved_circuits_v1';

  // State Engine
  let cf_ownedHubs = [];
  let cf_activeHubIata = '';
  let cf_activeAircraftId = 'a380-800';
  let cf_isMultiHubSearch = false;
  let cf_quickResultsFilter = 'all'; // 'all', 'exact', 'high_harmony'
  let cf_discoveredCircuits = [];
  let cf_searchDebounceTimer = null;
  let cf_expandedCircuitIdx = 0;

  // Combobox haul filter
  let cf_cbHaul = 'all';

  // Route type & Network targeting
  let cf_activeRouteType = 'lh'; // 'mix', 'sh', 'mh', 'lh'
  let cf_includedAirports = [];
  let cf_excludedAirports = [];
  let cf_isMaxDistLimitEnabled = false;

  // Route swap state
  let cf_swapTargetCircuitIdx = null;
  let cf_swapTargetLegIdx = null;

  let cf_isInitialized = false;

  // =========================================================================
  // UTILITY & DATABASE HELPERS
  // =========================================================================
  function cf_getAirport(iata) {
    if (!iata || typeof AIRPORTS_DATABASE === 'undefined') return null;
    return AIRPORTS_DATABASE.find(a => a.iata.toUpperCase() === iata.toUpperCase()) || null;
  }

  function cf_getAircraft(id) {
    if (!id || typeof AIRCRAFT_DATABASE === 'undefined') return null;
    return AIRCRAFT_DATABASE.find(a => a.id === id) || null;
  }

  function cf_haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  function cf_calculateFlightTimeHours(distanceKm, speedKmh) {
    if (!speedKmh || speedKmh <= 0) return 0;
    const rawHours = (distanceKm / speedKmh) * 2;
    return Math.round(rawHours * 4) / 4;
  }

  function cf_formatHoursMinutes(hours) {
    if (isNaN(hours) || hours <= 0) return '0h 00m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m < 10 ? '0' : ''}${m}m`;
  }

  function cf_formatAircraftPriceShort(num) {
    if (!num) return '$0';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    return `$${num.toLocaleString()}`;
  }

  function cf_parseIataString(raw) {
    if (!raw || typeof raw !== 'string') return [];
    return Array.from(new Set(
      raw.toUpperCase()
         .replace(/[^A-Z]/g, ' ')
         .split(/\s+/)
         .filter(s => s.length === 3 && cf_getAirport(s))
    ));
  }

  function cf_getStarRating(avg) {
    if (avg >= 30) return { stars: 5, starsText: '★★★★★', label: 'Global Mega-Hub' };
    if (avg >= 22) return { stars: 4, starsText: '★★★★', label: 'Major International' };
    if (avg >= 15) return { stars: 3, starsText: '★★★', label: 'Strong Regional' };
    if (avg >= 8)  return { stars: 2, starsText: '★★', label: 'Moderate' };
    return { stars: 1, starsText: '★', label: 'Light' };
  }

  function cf_computeAirportDemandStats(ap) {
    if (!ap) return { avg: 0, avgFormatted: '0.0', stars: 1, starsText: '★', rawEco: 0, rawBus: 0, rawFirst: 0, rawCargo: 0, label: 'Unknown' };
    const rawEco = ap.economy ?? ap.eco ?? ap.demand_eco ?? 0;
    const rawBus = ap.business ?? ap.bus ?? ap.demand_bus ?? 0;
    const rawFirst = ap.first ?? ap.demand_first ?? 0;
    const rawCargo = ap.cargo ?? 0;
    const avg = (rawEco + rawBus + rawFirst) / 3;
    const rating = cf_getStarRating(avg);
    return {
      avg,
      avgFormatted: avg.toFixed(1),
      stars: rating.stars,
      starsText: rating.starsText,
      label: rating.label,
      rawEco,
      rawBus,
      rawFirst,
      rawCargo
    };
  }

  function cf_getStrategyWeights() {
    const strat = document.getElementById('cf_class_strategy_select')?.value || 'tri_class';
    if (strat === 'custom') {
      const eco = (parseInt(document.getElementById('cf_weight_eco')?.value) || 0) / 100;
      const bus = (parseInt(document.getElementById('cf_weight_bus')?.value) || 0) / 100;
      const first = (parseInt(document.getElementById('cf_weight_first')?.value) || 0) / 100;
      const cargo = (parseInt(document.getElementById('cf_weight_cargo')?.value) || 0) / 100;
      const total = (eco + bus + first + cargo) || 1;
      return { eco: eco/total, bus: bus/total, first: first/total, cargo: cargo/total };
    }
    return CF_STRATEGY_PRESETS[strat] || CF_STRATEGY_PRESETS['tri_class'];
  }

  function cf_showToast(msg, type = 'info') {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    }
  }

  // =========================================================================
  // OWNED HUBS MANAGEMENT & COLLAPSIBLE DRAWER
  // =========================================================================
  function cf_loadOwnedHubs() {
    try {
      const raw = localStorage.getItem(CF_OWNED_HUBS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          cf_ownedHubs = parsed.filter(code => cf_getAirport(code));
        }
      }
    } catch (e) {}
    cf_activeHubIata = '';
    const hubInput = document.getElementById('cf_circuit_hub');
    if (hubInput) hubInput.value = '';
    cf_updateOwnedHubsBadge();
  }

  function cf_saveOwnedHubs() {
    try {
      localStorage.setItem(CF_OWNED_HUBS_KEY, JSON.stringify(cf_ownedHubs));
    } catch (e) {}
    cf_updateOwnedHubsBadge();
    cf_renderOwnedHubs();
  }

  function cf_updateOwnedHubsBadge() {
    const count = cf_ownedHubs.length;
    const badge = document.getElementById('cf_owned_hubs_count_badge');
    if (badge) badge.textContent = `${count} Hub${count === 1 ? '' : 's'}`;
    const countText = document.getElementById('cf_hub_count_text');
    if (countText) countText.textContent = count;
  }

  function cf_toggleOwnedHubsDropdown() {
    const details = document.getElementById('cf_owned_hubs_dropdown');
    if (!details) return;
    details.open = !details.open;
    if (details.open) {
      details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function cf_onExcludeOwnedHubsToggle(checked) {
    const cb1 = document.getElementById('cf_toggle_exclude_owned_hubs');
    const cb2 = document.getElementById('cf_toggle_exclude_owned_hubs_tier3');
    if (cb1) cb1.checked = checked;
    if (cb2) cb2.checked = checked;
    cf_debouncedFindCircuits();
  }

  function cf_renderOwnedHubs() {
    const container = document.getElementById('cf_owned_hubs_container');
    if (!container) return;

    cf_updateOwnedHubsBadge();

    if (cf_ownedHubs.length === 0) {
      container.innerHTML = `<span class="text-xs text-slate-500 italic">No owned hubs added yet. Type an IATA code and click "+ Add Hub".</span>`;
      return;
    }

    container.innerHTML = cf_ownedHubs.map(iata => {
      const ap = cf_getAirport(iata);
      const name = ap ? ap.city : iata;
      const isActive = (iata === cf_activeHubIata) && !cf_isMultiHubSearch;
      return `
        <div class="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition text-xs font-semibold ${
          isActive 
            ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-900/30 ring-1 ring-cyan-500/40' 
            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700/80 hover:border-slate-600'
        }">
          <button type="button" onclick="cf_setActiveHub('${iata}')" class="flex items-center gap-1 font-mono">
            <span>${iata}</span>
            <span class="text-[10px] font-normal text-slate-400 font-sans hidden sm:inline">(${name})</span>
          </button>
          <span class="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">Cat ${ap?.cat || 10}</span>
          <button type="button" onclick="cf_removeOwnedHub('${iata}')" class="text-slate-500 hover:text-rose-400 font-bold ml-0.5 text-xs transition" title="Remove Hub">×</button>
        </div>
      `;
    }).join('');
  }

  function cf_setActiveHub(iata) {
    cf_activeHubIata = iata;
    cf_isMultiHubSearch = false;
    const multiCheck = document.getElementById('cf_toggle_multi_hub_search');
    if (multiCheck) multiCheck.checked = false;
    const hubInput = document.getElementById('cf_circuit_hub');
    if (hubInput) hubInput.value = iata;
    cf_updateHubInfoDisplay();
    cf_renderOwnedHubs();
    cf_updateHeaderContext();
    cf_updateRouteTypeCounter();
    cf_renderIncludeAirportsChips();
    cf_debouncedFindCircuits();
    cf_showToast(`Switched active hub to ${iata}`, 'info');
  }

  function cf_addOwnedHubFromInput() {
    const input = document.getElementById('cf_add_hub_input');
    const code = (input?.value || '').trim().toUpperCase();
    if (!code) return;
    const ap = cf_getAirport(code);
    if (!ap) {
      cf_showToast(`Airport code "${code}" not found in database`, 'warning');
      return;
    }
    if (cf_ownedHubs.includes(code)) {
      cf_showToast(`${code} is already in your owned hubs`, 'info');
      return;
    }
    cf_ownedHubs.push(code);
    cf_saveOwnedHubs();
    input.value = '';
    cf_showToast(`Added ${code} (${ap.city}) to your owned hubs!`, 'success');
    cf_setActiveHub(code);
  }

  function cf_removeOwnedHub(iata) {
    cf_ownedHubs = cf_ownedHubs.filter(h => h !== iata);
    cf_saveOwnedHubs();
    if (cf_activeHubIata === iata) {
      if (cf_ownedHubs.length > 0) {
        cf_setActiveHub(cf_ownedHubs[0]);
      } else {
        cf_activeHubIata = '';
        const hubInput = document.getElementById('cf_circuit_hub');
        if (hubInput) hubInput.value = '';
        cf_updateHubInfoDisplay();
        cf_renderOwnedHubs();
        cf_updateHeaderContext();
        cf_updateRouteTypeCounter();
        cf_debouncedFindCircuits();
      }
    }
    cf_showToast(`Removed ${iata} from owned hubs`, 'info');
  }

  function cf_onMultiHubToggle() {
    cf_isMultiHubSearch = document.getElementById('cf_toggle_multi_hub_search')?.checked || false;
    if (cf_isMultiHubSearch && cf_ownedHubs.length === 0) {
      cf_showToast('Add at least one hub to your owned hubs list to search across them', 'warning');
    }
    cf_renderOwnedHubs();
    cf_updateHeaderContext();
    cf_debouncedFindCircuits();
    if (cf_isMultiHubSearch && cf_ownedHubs.length > 0) {
      cf_showToast('Empire Mode Active: Evaluating circuits across all owned hubs', 'info');
    } else if (!cf_isMultiHubSearch) {
      cf_showToast(`Single Hub Mode: Evaluating circuits from ${cf_activeHubIata || 'selected hub'}`, 'info');
    }
  }

  function cf_onCircuitHubChange() {
    const input = document.getElementById('cf_circuit_hub');
    const iata = (input?.value || '').trim().toUpperCase();
    const ap = cf_getAirport(iata);
    if (ap) {
      cf_activeHubIata = iata;
      cf_isMultiHubSearch = false;
      const multiCheck = document.getElementById('cf_toggle_multi_hub_search');
      if (multiCheck) multiCheck.checked = false;
    } else {
      cf_activeHubIata = '';
    }
    cf_updateHubInfoDisplay();
    cf_renderOwnedHubs();
    cf_updateHeaderContext();
    cf_updateRouteTypeCounter();
    cf_renderIncludeAirportsChips();
    cf_debouncedFindCircuits();
  }

  function cf_updateHubInfoDisplay() {
    const input = document.getElementById('cf_circuit_hub');
    const info = document.getElementById('cf_hub_info');
    const iata = (input?.value || '').trim().toUpperCase();
    const ap = cf_getAirport(iata);

    if (ap) {
      if (info) {
        info.textContent = `${ap.name || ap.city}, ${ap.country} (Cat. ${ap.cat})`;
        info.className = 'text-[11px] text-cyan-400 truncate';
      }
      cf_activeHubIata = iata;
    } else if (!iata) {
      if (info) {
        info.textContent = 'Please enter circuit hub';
        info.className = 'text-[11px] text-slate-400 truncate';
      }
      cf_activeHubIata = '';
    } else {
      if (info) {
        info.textContent = 'Enter a valid 3-letter IATA code (e.g. MPM, OSL, CDG)';
        info.className = 'text-[11px] text-amber-400 truncate';
      }
      cf_activeHubIata = '';
    }
  }

  // =========================================================================
  // AIRCRAFT COMBOBOX (Seat Config Continuity)
  // =========================================================================
  function cf_initAircraftCombobox() {
    const select = document.getElementById('cf_aircraft_select');
    if (select && typeof AIRCRAFT_DATABASE !== 'undefined') {
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
          html += `<option value="${ac.id}" ${ac.id === cf_activeAircraftId ? 'selected' : ''}>${ac.name} (${ac.seats} seats · ${ac.speed_kmh} km/h · Cat ${ac.category})</option>`;
        });
        html += `</optgroup>`;
      }
      select.innerHTML = html;
    }
    cf_renderAircraftComboboxList();
    cf_updateAircraftDisplay();
  }

  function cf_toggleAircraftCombobox() {
    const popover = document.getElementById('cf_combobox_popover');
    if (!popover) return;
    if (popover.classList.contains('hidden')) {
      cf_openAircraftCombobox();
    } else {
      cf_closeAircraftCombobox();
    }
  }

  function cf_openAircraftCombobox() {
    const popover = document.getElementById('cf_combobox_popover');
    const chevron = document.getElementById('cf_combobox_chevron');
    if (!popover) return;
    popover.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    const search = document.getElementById('cf_combobox_search');
    if (search) {
      search.value = '';
      cf_renderAircraftComboboxList();
      setTimeout(() => search.focus(), 50);
    }
  }

  function cf_closeAircraftCombobox() {
    const popover = document.getElementById('cf_combobox_popover');
    const chevron = document.getElementById('cf_combobox_chevron');
    if (!popover) return;
    popover.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }

  function cf_clearAircraftComboboxSearch() {
    const search = document.getElementById('cf_combobox_search');
    if (search) {
      search.value = '';
      search.focus();
    }
    const clearBtn = document.getElementById('cf_combobox_clear_btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    cf_renderAircraftComboboxList();
  }

  function cf_setComboboxHaul(val) {
    cf_cbHaul = val;
    document.querySelectorAll('.cf-cb-haul-btn').forEach(btn => {
      const btnVal = btn.getAttribute('data-val');
      if (btnVal === val) {
        btn.className = 'cf-cb-haul-btn px-2 py-0.5 rounded bg-cyan-600 text-white font-medium';
      } else {
        btn.className = 'cf-cb-haul-btn px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium';
      }
    });
    cf_renderAircraftComboboxList();
  }

  function cf_selectAircraftFromCombobox(acId) {
    cf_activeAircraftId = acId;
    const select = document.getElementById('cf_aircraft_select');
    if (select) select.value = acId;
    cf_updateAircraftDisplay();
    cf_closeAircraftCombobox();
    cf_updateHeaderContext();
    cf_updateRouteTypeCounter();
    cf_renderIncludeAirportsChips();
    cf_debouncedFindCircuits();
  }

  function cf_renderAircraftComboboxList() {
    const container = document.getElementById('cf_combobox_list');
    const countEl = document.getElementById('cf_combobox_match_count');
    const clearBtn = document.getElementById('cf_combobox_clear_btn');
    const searchInput = document.getElementById('cf_combobox_search');
    if (!container || typeof AIRCRAFT_DATABASE === 'undefined') return;

    const query = (searchInput?.value || '').toLowerCase().trim();
    if (clearBtn) {
      if (query.length > 0) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }

    const filtered = AIRCRAFT_DATABASE.filter(ac => {
      if (cf_cbHaul !== 'all' && ac.type !== cf_cbHaul) return false;
      if (!query) return true;
      return ac.name.toLowerCase().includes(query) ||
             ac.id.toLowerCase().includes(query) ||
             (ac.manufacturer && ac.manufacturer.toLowerCase().includes(query));
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${AIRCRAFT_DATABASE.length} aircraft`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">No aircraft found matching "${query}"</div>`;
      return;
    }

    container.innerHTML = filtered.map(ac => {
      const isSelected = ac.id === cf_activeAircraftId;
      return `
        <div onclick="cf_selectAircraftFromCombobox('${ac.id}')" class="p-2 sm:px-3 sm:py-2 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-500' : ''}">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-xs ${isSelected ? 'text-cyan-300' : 'text-white'}">${ac.name}</span>
              <span class="text-[10px] text-slate-400">· ${ac.manufacturer}</span>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              <span>${ac.seats} seats</span> &bull; 
              <span>${ac.speed_kmh} km/h</span> &bull; 
              <span>${ac.range_km.toLocaleString()} km</span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">Cat ${ac.category}</span>
            <div class="text-[10px] font-mono text-emerald-400 mt-0.5">${cf_formatAircraftPriceShort(ac.price)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function cf_updateAircraftDisplay() {
    const ac = cf_getAircraft(cf_activeAircraftId);
    if (!ac) return;

    const planeName = document.getElementById('cf_trigger_plane_name');
    const planeDetails = document.getElementById('cf_trigger_plane_details');
    const typeBadge = document.getElementById('cf_aircraft_type_badge');
    const priceBadge = document.getElementById('cf_aircraft_price_badge');
    const catBadge = document.getElementById('cf_aircraft_category_badge');
    const specsSummary = document.getElementById('cf_aircraft_specs_summary');

    if (planeName) planeName.textContent = ac.name;
    if (planeDetails) planeDetails.textContent = `(${ac.seats} seats • ${ac.speed_kmh} km/h • ${ac.range_km.toLocaleString()} km)`;
    if (typeBadge) typeBadge.textContent = ac.type || 'Commercial';
    if (priceBadge) priceBadge.textContent = cf_formatAircraftPriceShort(ac.price);
    if (catBadge) catBadge.textContent = `Cat. ${ac.category}`;
    if (specsSummary) {
      specsSummary.textContent = `Speed: ${ac.speed_kmh} km/h | Range: ${ac.range_km.toLocaleString()} km | Seats: ${ac.seats} | Payload: ${(ac.payload_ton || 0).toFixed(1)}T`;
    }

    const distLimitInput = document.getElementById('cf_max_route_dist_input');
    if (distLimitInput) {
      distLimitInput.placeholder = ac.range_km.toString();
      if (!cf_isMaxDistLimitEnabled) {
        distLimitInput.value = ac.range_km.toString();
      }
    }
  }

  function cf_updateHeaderContext() {
    const hub = cf_getAirport(cf_activeHubIata);
    const ac = cf_getAircraft(cf_activeAircraftId);
    const headerHub = document.getElementById('cf_header_active_hub');
    const headerAc = document.getElementById('cf_header_active_ac');

    if (cf_isMultiHubSearch) {
      if (headerHub) headerHub.textContent = `All ${cf_ownedHubs.length} Hubs`;
    } else {
      if (headerHub) headerHub.textContent = hub ? `${hub.iata} (Cat ${hub.cat})` : (cf_activeHubIata || 'None');
    }

    if (headerAc && ac) {
      headerAc.textContent = ac.name;
    }
  }

  // =========================================================================
  // DURATION, ROUTE TYPE & TARGETING CONTROLS
  // =========================================================================
  function cf_onTargetDurationChange(val) {
    const subtext = document.getElementById('cf_target_dur_subtext');
    const utilBadge = document.getElementById('cf_target_util_badge');
    const targetHours = parseFloat(val) || 168;

    if (targetHours === 168) {
      if (subtext) subtext.innerHTML = `Requires a fleet of <strong class="text-cyan-300">7 identical aircraft</strong>`;
      if (utilBadge) utilBadge.textContent = '100% Target';
    } else if (targetHours === 24) {
      if (subtext) subtext.innerHTML = `Single plane <strong class="text-cyan-300">daily 24h cycle</strong>`;
      if (utilBadge) utilBadge.textContent = '24h Daily';
    } else {
      const planeCount = Math.round(targetHours / 24);
      if (subtext) subtext.innerHTML = `Rotation across <strong class="text-cyan-300">${planeCount || 1} aircraft</strong>`;
      if (utilBadge) utilBadge.textContent = `${targetHours}h Rotation`;
    }

    cf_updateRouteCountOptions(targetHours);
    cf_applyRouteTypeBounds();
    cf_debouncedFindCircuits();
  }

  function cf_updateRouteCountOptions(targetHours) {
    const select = document.getElementById('cf_route_count_select');
    const subtext = document.getElementById('cf_route_count_subtext');
    if (!select) return;

    const curVal = select.value;
    let html = '';

    if (targetHours === 168) {
      html = `
        <option value="any">Any Length (4 to 9 routes)</option>
        <option value="5">5 Routes (~33h 36m avg / leg)</option>
        <option value="6">6 Routes (~28h 00m avg / leg)</option>
        <option value="7">7 Routes (~24h 00m avg / leg) · Classic</option>
        <option value="8">8 Routes (~21h 00m avg / leg)</option>
        <option value="9">9 Routes (~18h 40m avg / leg)</option>
      `;
      if (subtext) subtext.textContent = '7 routes averages 1 flight per calendar day';
    } else if (targetHours <= 24) {
      html = `
        <option value="any">Any Length (2 to 6 routes)</option>
        <option value="2">2 Routes (~12h 00m avg / leg)</option>
        <option value="3">3 Routes (~8h 00m avg / leg)</option>
        <option value="4">4 Routes (~6h 00m avg / leg)</option>
        <option value="5">5 Routes (~4h 48m avg / leg)</option>
        <option value="6">6 Routes (~4h 00m avg / leg)</option>
      `;
      if (subtext) subtext.textContent = 'Shorter legs maximize frequency & daytime utilization';
    } else if (targetHours <= 48) {
      html = `
        <option value="any">Any Length (2 to 7 routes)</option>
        <option value="2">2 Routes (~24h 00m avg / leg)</option>
        <option value="3">3 Routes (~16h 00m avg / leg)</option>
        <option value="4">4 Routes (~12h 00m avg / leg)</option>
        <option value="5">5 Routes (~9h 36m avg / leg)</option>
        <option value="6">6 Routes (~8h 00m avg / leg)</option>
      `;
      if (subtext) subtext.textContent = 'Balanced 48-hour two-day schedule';
    } else {
      html = `
        <option value="any">Any Length (3 to 8 routes)</option>
        <option value="3">3 Routes</option>
        <option value="4">4 Routes</option>
        <option value="5">5 Routes</option>
        <option value="6">6 Routes</option>
        <option value="7">7 Routes</option>
        <option value="8">8 Routes</option>
      `;
      if (subtext) subtext.textContent = `Fits ${targetHours}h rotation`;
    }

    select.innerHTML = html;
    if (Array.from(select.options).some(opt => opt.value === curVal)) {
      select.value = curVal;
    } else {
      select.value = 'any';
    }
  }

  function cf_setRouteType(type, triggerSearch = true) {
    cf_activeRouteType = type;
    const btnMix = document.getElementById('cf_rt_btn_mix');
    const btnSh = document.getElementById('cf_rt_btn_sh');
    const btnMh = document.getElementById('cf_rt_btn_mh');
    const btnLh = document.getElementById('cf_rt_btn_lh');
    const desc = document.getElementById('cf_route_type_desc');

    const inactiveClass = 'cf-rt-type-btn py-1.5 px-1 rounded-md text-center font-medium text-slate-400 hover:text-white hover:bg-slate-850 transition truncate';
    const activeClass = 'cf-rt-type-btn py-1.5 px-1 rounded-md text-center font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 shadow-sm ring-1 ring-cyan-400/50 transition truncate';

    if (btnMix) btnMix.className = type === 'mix' ? activeClass : inactiveClass;
    if (btnSh)  btnSh.className  = type === 'sh'  ? activeClass : inactiveClass;
    if (btnMh)  btnMh.className  = type === 'mh'  ? activeClass : inactiveClass;
    if (btnLh)  btnLh.className  = type === 'lh'  ? activeClass : inactiveClass;

    const hubName = cf_activeHubIata || 'hub';
    if (desc) {
      if (type === 'mix') {
        desc.textContent = 'Mix / All: Legs of any flight time compatible with target circuit';
      } else if (type === 'sh') {
        desc.textContent = `Short-Haul: Forces all legs ≤ 8.0h round-trip from ${hubName}`;
      } else if (type === 'mh') {
        desc.textContent = `Medium-Haul: Forces all legs between 8.0h and 16.0h from ${hubName}`;
      } else if (type === 'lh') {
        desc.textContent = `Long-Haul: Forces all legs ≥ 16.0h round-trip from ${hubName}`;
      }
    }

    cf_applyRouteTypeBounds();
    cf_updateRouteTypeCounter();

    if (triggerSearch) {
      cf_debouncedFindCircuits();
    }
  }

  function cf_applyRouteTypeBounds() {
    const minInput = document.getElementById('cf_min_leg_dur');
    const maxInput = document.getElementById('cf_max_leg_dur');
    const targetHours = parseFloat(document.getElementById('cf_target_duration_select')?.value) || 168;

    if (!minInput || !maxInput) return;

    if (cf_activeRouteType === 'sh') {
      minInput.value = '1.5';
      maxInput.value = Math.min(8.0, targetHours / 2).toString();
    } else if (cf_activeRouteType === 'mh') {
      minInput.value = '8.0';
      maxInput.value = Math.min(16.0, targetHours / 2).toString();
    } else if (cf_activeRouteType === 'lh') {
      minInput.value = '16.0';
      maxInput.value = Math.min(36.0, targetHours / 2).toString();
    } else { // 'mix'
      minInput.value = '1.5';
      if (targetHours <= 24) maxInput.value = '14.0';
      else if (targetHours <= 48) maxInput.value = '24.0';
      else maxInput.value = '36.0';
    }
  }

  function cf_updateRouteTypeCounter() {
    const counterEl = document.getElementById('cf_route_type_counter_text');
    if (!counterEl) return;

    const hub = cf_getAirport(cf_activeHubIata);
    const ac = cf_getAircraft(cf_activeAircraftId);
    if (!hub || !ac || typeof AIRPORTS_DATABASE === 'undefined') {
      counterEl.textContent = 'Enter hub to count';
      return;
    }

    const minDur = parseFloat(document.getElementById('cf_min_leg_dur')?.value) || 1.5;
    const maxDur = parseFloat(document.getElementById('cf_max_leg_dur')?.value) || 36.0;

    let matchCount = 0;
    for (const dst of AIRPORTS_DATABASE) {
      if (dst.iata === hub.iata) continue;
      if (dst.cat < ac.category) continue;
      if (isNaN(dst.lat) || isNaN(dst.lon)) continue;

      const dist = cf_haversineDistance(hub.lat, hub.lon, dst.lat, dst.lon);
      if (dist <= 0 || dist > ac.range_km) continue;

      const dur = cf_calculateFlightTimeHours(dist, ac.speed_kmh);
      if (dur >= minDur && dur <= maxDur) {
        matchCount++;
      }
    }

    const typeLabel = cf_activeRouteType.toUpperCase();
    counterEl.textContent = `${matchCount} ${typeLabel} Airports`;
  }

  // =========================================================================
  // AIRPORT INCLUDE / EXCLUDE CONTROLS
  // =========================================================================
  function cf_onIncludeAirportsInputChange() {
    const input = document.getElementById('cf_include_airports_input');
    cf_includedAirports = cf_parseIataString(input?.value || '');
    cf_renderIncludeAirportsChips();
    cf_debouncedFindCircuits();
  }

  function cf_renderIncludeAirportsChips() {
    const container = document.getElementById('cf_include_airports_chips');
    const statusLine = document.getElementById('cf_include_airports_status');
    if (!container) return;

    if (cf_includedAirports.length === 0) {
      container.innerHTML = '';
      if (statusLine) statusLine.textContent = '';
      return;
    }

    const hub = cf_getAirport(cf_activeHubIata);
    const ac = cf_getAircraft(cf_activeAircraftId);
    const issues = [];
    let reachableCount = 0;

    container.innerHTML = cf_includedAirports.map(code => {
      const ap = cf_getAirport(code);
      if (!ap) return '';
      const stats = cf_computeAirportDemandStats(ap);
      let isReachable = true;
      let reason = '';
      let dist = 0;
      let dur = 0;

      if (hub && ac) {
        dist = cf_haversineDistance(hub.lat, hub.lon, ap.lat, ap.lon);
        dur = cf_calculateFlightTimeHours(dist, ac.speed_kmh);
        if (dist > ac.range_km) {
          isReachable = false; reason = `Exceeds plane range (${dist.toLocaleString()} > ${ac.range_km.toLocaleString()} km)`;
        } else if (ap.cat < ac.category) {
          isReachable = false; reason = `Cat ${ap.cat} < Plane Cat ${ac.category}`;
        }
      } else if (!hub) {
        isReachable = false; reason = 'No hub set';
      }

      if (isReachable) reachableCount++;
      else issues.push(`${code}: ${reason}`);

      return `
        <span class="badge-pill ${isReachable ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700' : 'bg-amber-950/90 text-amber-300 border-amber-700'} font-mono shadow-sm" title="${ap.name || ap.city} · ${dist.toLocaleString()} km · ${cf_formatHoursMinutes(dur)} · ${stats.starsText}">
          <span>${code}</span>
          <span class="font-sans font-normal text-[10px] text-slate-300 hidden sm:inline">(${ap.city}, ${cf_formatHoursMinutes(dur)})</span>
          <span class="text-amber-400 font-sans tracking-tighter">${stats.starsText}</span>
          ${!isReachable ? `<span class="text-rose-400 font-bold ml-0.5" title="${reason}">⚠</span>` : ''}
          <button type="button" onclick="cf_removeIncludeAirport('${code}')" class="text-slate-400 hover:text-white font-bold ml-1 transition">×</button>
        </span>
      `;
    }).join('');

    if (statusLine) {
      if (issues.length > 0) {
        statusLine.innerHTML = `<span class="text-amber-400 font-semibold">⚠ Attention:</span> ${issues.join(' · ')}`;
      } else {
        statusLine.innerHTML = `<span class="text-emerald-400 font-semibold">✓ Ready:</span> All ${reachableCount} required destination(s) are valid and reachable from ${hub?.iata || 'hub'}.`;
      }
    }
  }

  function cf_removeIncludeAirport(code) {
    cf_includedAirports = cf_includedAirports.filter(c => c !== code);
    const input = document.getElementById('cf_include_airports_input');
    if (input) input.value = cf_includedAirports.join(' ');
    cf_renderIncludeAirportsChips();
    cf_debouncedFindCircuits();
  }

  function cf_onExcludeAirportsInputChange() {
    const input = document.getElementById('cf_exclude_airports_input');
    cf_excludedAirports = cf_parseIataString(input?.value || '');
    cf_renderExcludeAirportsChips();
    cf_debouncedFindCircuits();
  }

  function cf_renderExcludeAirportsChips() {
    const container = document.getElementById('cf_exclude_airports_chips');
    const statusLine = document.getElementById('cf_exclude_airports_status');
    if (!container) return;

    if (cf_excludedAirports.length === 0) {
      container.innerHTML = '';
      if (statusLine) statusLine.textContent = '';
      return;
    }

    container.innerHTML = cf_excludedAirports.map(code => {
      const ap = cf_getAirport(code);
      const name = ap ? ap.city : 'Unknown';
      return `
        <span class="badge-pill bg-rose-950/80 text-rose-300 border-rose-800 font-mono shadow-sm" title="${ap ? ap.name : code}">
          <span>${code}</span>
          <span class="font-sans font-normal text-[10px] text-slate-400 hidden sm:inline">(${name})</span>
          <button type="button" onclick="cf_removeExcludeAirport('${code}')" class="text-rose-400 hover:text-white font-bold ml-1 transition">×</button>
        </span>
      `;
    }).join('');

    if (statusLine) {
      statusLine.innerHTML = `<span class="text-slate-400">Excluding ${cf_excludedAirports.length} destination(s) from circuit generation.</span>`;
    }
  }

  function cf_removeExcludeAirport(code) {
    cf_excludedAirports = cf_excludedAirports.filter(c => c !== code);
    const input = document.getElementById('cf_exclude_airports_input');
    if (input) input.value = cf_excludedAirports.join(' ');
    cf_renderExcludeAirportsChips();
    cf_debouncedFindCircuits();
  }

  function cf_clearExcludedAirports() {
    cf_excludedAirports = [];
    const input = document.getElementById('cf_exclude_airports_input');
    if (input) input.value = '';
    cf_renderExcludeAirportsChips();
    cf_debouncedFindCircuits();
    cf_showToast('Cleared excluded airports list', 'info');
  }

  function cf_onToggleMaxDistLimit() {
    const checkbox = document.getElementById('cf_toggle_max_dist_limit');
    const input = document.getElementById('cf_max_route_dist_input');
    const ac = cf_getAircraft(cf_activeAircraftId);
    cf_isMaxDistLimitEnabled = checkbox ? checkbox.checked : false;

    if (input) {
      input.disabled = !cf_isMaxDistLimitEnabled;
      if (cf_isMaxDistLimitEnabled) {
        if (!input.value && ac) input.value = ac.range_km;
        input.focus();
      }
    }
    cf_debouncedFindCircuits();
  }

  function cf_onClassStrategyChange(val) {
    const weights = cf_getStrategyWeights();
    const display = document.getElementById('cf_class_weights_display');
    if (display) {
      display.textContent = `Y: ${Math.round(weights.eco*100)}% · J: ${Math.round(weights.bus*100)}% · F: ${Math.round(weights.first*100)}%`;
    }
    const drawer = document.getElementById('cf_custom_weights_drawer');
    if (drawer) {
      if (val === 'custom') drawer.classList.remove('hidden');
      else drawer.classList.add('hidden');
    }
    cf_debouncedFindCircuits();
  }

  function cf_toggleCustomSliders() {
    const drawer = document.getElementById('cf_custom_weights_drawer');
    if (!drawer) return;
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
      const select = document.getElementById('cf_class_strategy_select');
      if (select) select.value = 'custom';
    }
  }

  function cf_onCustomSliderChange() {
    const eco = parseInt(document.getElementById('cf_weight_eco')?.value) || 0;
    const bus = parseInt(document.getElementById('cf_weight_bus')?.value) || 0;
    const first = parseInt(document.getElementById('cf_weight_first')?.value) || 0;
    const cargo = parseInt(document.getElementById('cf_weight_cargo')?.value) || 0;

    const lEco = document.getElementById('cf_label_weight_eco');
    const lBus = document.getElementById('cf_label_weight_bus');
    const lFirst = document.getElementById('cf_label_weight_first');
    const lCargo = document.getElementById('cf_label_weight_cargo');

    if (lEco) lEco.textContent = `${eco}%`;
    if (lBus) lBus.textContent = `${bus}%`;
    if (lFirst) lFirst.textContent = `${first}%`;
    if (lCargo) lCargo.textContent = `${cargo}%`;

    const display = document.getElementById('cf_class_weights_display');
    if (display) display.textContent = `Y: ${eco}% · J: ${bus}% · F: ${first}% · C: ${cargo}%`;

    cf_debouncedFindCircuits();
  }

  function cf_debouncedFindCircuits() {
    clearTimeout(cf_searchDebounceTimer);
    cf_searchDebounceTimer = setTimeout(() => {
      cf_executeCircuitSearch();
    }, 120);
  }

  // =========================================================================
  // CORE COMBINATORIAL CIRCUIT SOLVER (< 15ms)
  // =========================================================================
  function cf_executeCircuitSearch() {
    const startBenchmark = performance.now();
    const aircraft = cf_getAircraft(cf_activeAircraftId);
    if (!aircraft) return;

    if ((!cf_isMultiHubSearch && !cf_activeHubIata) || (cf_isMultiHubSearch && cf_ownedHubs.length === 0)) {
      cf_discoveredCircuits = [];
      cf_renderCircuits();
      return;
    }

    const hubsToSearch = cf_isMultiHubSearch ? cf_ownedHubs : [cf_activeHubIata];
    const targetHours = parseFloat(document.getElementById('cf_target_duration_select')?.value) || 168;
    const maxSlackHours = parseFloat(document.getElementById('cf_slack_tolerance_select')?.value) || 0;
    const routeCountOption = document.getElementById('cf_route_count_select')?.value || 'any';
    const continentFilter = document.getElementById('cf_continent_filter_select')?.value || 'all';
    const requireCatMatch = document.getElementById('cf_cat_filter_check')?.checked !== false;
    const excludeOwned = !!(document.getElementById('cf_toggle_exclude_owned_hubs')?.checked || document.getElementById('cf_toggle_exclude_owned_hubs_tier3')?.checked);
    const minStarFilter = parseInt(document.getElementById('cf_star_filter_select')?.value) || 0;
    const minLegDur = parseFloat(document.getElementById('cf_min_leg_dur')?.value) || 1.5;
    const maxLegDur = parseFloat(document.getElementById('cf_max_leg_dur')?.value) || 48;
    const weights = cf_getStrategyWeights();

    // Max distance cap
    const isDistCapped = document.getElementById('cf_toggle_max_dist_limit')?.checked;
    const userMaxDist = parseFloat(document.getElementById('cf_max_route_dist_input')?.value);
    const effectiveMaxDist = (isDistCapped && userMaxDist > 0) ? Math.min(userMaxDist, aircraft.range_km) : aircraft.range_km;

    // Dynamic Route Count
    let minRoutes = 2;
    let maxRoutes = 8;
    if (targetHours >= 120) {
      minRoutes = 4;
      maxRoutes = 9;
    }
    if (routeCountOption !== 'any') {
      const count = parseInt(routeCountOption);
      if (!isNaN(count)) {
        minRoutes = count;
        maxRoutes = count;
      }
    }

    const excludedSet = new Set([
      ...cf_excludedAirports,
      ...(excludeOwned ? cf_ownedHubs : [])
    ]);
    const includedSet = new Set(cf_includedAirports);

    const allFoundCircuits = [];

    // Run solver for each hub in scope
    for (const hubIata of hubsToSearch) {
      const hub = cf_getAirport(hubIata);
      if (!hub) continue;
      if (requireCatMatch && hub.cat < aircraft.category) continue;

      // 1. Filter candidate destinations
      const candidates = [];
      const candidateByIata = new Map();

      if (typeof AIRPORTS_DATABASE !== 'undefined') {
        for (const dst of AIRPORTS_DATABASE) {
          if (dst.iata === hub.iata) continue;
          if (excludedSet.has(dst.iata) && !includedSet.has(dst.iata)) continue;
          if (requireCatMatch && dst.cat < aircraft.category) continue;
          if (isNaN(dst.lat) || isNaN(dst.lon)) continue;

          const continent = CF_CONTINENT_MAP[dst.country] || 'Other';
          if (continentFilter !== 'all' && continent !== continentFilter) continue;

          const dist = cf_haversineDistance(hub.lat, hub.lon, dst.lat, dst.lon);
          if (dist <= 0 || dist > effectiveMaxDist) continue;

          const dur = cf_calculateFlightTimeHours(dist, aircraft.speed_kmh);
          const isMustInclude = includedSet.has(dst.iata);

          // If not must-include, enforce duration bounds & minStars
          if (!isMustInclude) {
            if (dur < minLegDur || dur > maxLegDur) continue;
          }

          const demand = cf_computeAirportDemandStats(dst);
          if (!isMustInclude && minStarFilter > 0 && demand.stars < minStarFilter) continue;

          // Weighted Score for search ranking
          const score = (demand.rawEco * weights.eco) +
                        (demand.rawBus * 2 * weights.bus) +
                        (demand.rawFirst * 3 * weights.first);

          const cand = {
            hubIata: hub.iata,
            dstIata: dst.iata,
            name: dst.name,
            city: dst.city,
            country: dst.country,
            continent,
            cat: dst.cat,
            dist,
            dur,
            ticks: Math.round(dur * 4),
            demand,
            score
          };

          candidates.push(cand);
          candidateByIata.set(dst.iata, cand);
        }
      }

      if (candidates.length < minRoutes) continue;

      // Check required inclusions validity
      let mustIncludeFailed = false;
      const mustIncludeItems = [];
      for (const reqCode of cf_includedAirports) {
        const item = candidateByIata.get(reqCode);
        if (!item) {
          mustIncludeFailed = true;
          break;
        }
        mustIncludeItems.push(item);
      }
      if (mustIncludeFailed) continue;

      // Group candidates by duration ticks for fast lookup
      const grouped = {};
      candidates.forEach(c => {
        if (!grouped[c.ticks]) grouped[c.ticks] = [];
        grouped[c.ticks].push(c);
      });

      // Sort each duration bucket by weighted demand score descending
      Object.keys(grouped).forEach(k => {
        grouped[k].sort((a, b) => b.score - a.score);
      });

      const distinctDurTicks = Object.keys(grouped).map(Number).sort((a, b) => b - a);
      const targetTicks = Math.round(targetHours * 4);
      const minTicks = Math.round((targetHours - maxSlackHours) * 4);

      // Recursive combinatorial solver with branch-and-bound pruning
      const validTemplates = [];

      function solveTemplates(remTicks, kRoutes, minTickIdx, currentTicks) {
        if (validTemplates.length >= 250) return;

        if (kRoutes === 0) {
          const usedTicks = targetTicks - remTicks;
          if (usedTicks >= minTicks && usedTicks <= targetTicks) {
            validTemplates.push([...currentTicks]);
          }
          return;
        }

        if (remTicks < 0) return;

        const maxPossibleWithK = kRoutes * distinctDurTicks[minTickIdx];
        if (maxPossibleWithK < (minTicks - (targetTicks - remTicks))) return;

        for (let i = minTickIdx; i < distinctDurTicks.length; i++) {
          const t = distinctDurTicks[i];
          if (t * kRoutes < (minTicks - (targetTicks - remTicks))) break;
          if (t > remTicks) continue;

          currentTicks.push(t);
          solveTemplates(remTicks - t, kRoutes - 1, i, currentTicks);
          currentTicks.pop();
        }
      }

      // Pre-seed with must-include legs
      let seedTicksSum = 0;
      const seedTicks = [];
      mustIncludeItems.forEach(mi => {
        seedTicksSum += mi.ticks;
        seedTicks.push(mi.ticks);
      });

      if (seedTicksSum > targetTicks) continue;

      const minK = Math.max(0, minRoutes - seedTicks.length);
      const maxK = Math.max(0, maxRoutes - seedTicks.length);

      for (let k = minK; k <= maxK; k++) {
        if (k === 0 && seedTicks.length >= minRoutes && seedTicks.length <= maxRoutes) {
          if (seedTicksSum >= minTicks && seedTicksSum <= targetTicks) {
            validTemplates.push([...seedTicks]);
          }
        } else if (k > 0) {
          solveTemplates(targetTicks - seedTicksSum, k, 0, [...seedTicks]);
        }
      }

      // Convert templates into concrete circuits without duplicate destinations
      for (const tmpl of validTemplates) {
        const tickCounts = {};
        for (const t of tmpl) {
          tickCounts[t] = (tickCounts[t] || 0) + 1;
        }

        let hasSufficientAirports = true;
        for (const [tStr, count] of Object.entries(tickCounts)) {
          const t = parseInt(tStr);
          if (!grouped[t] || grouped[t].length < count) {
            hasSufficientAirports = false;
            break;
          }
        }
        if (!hasSufficientAirports) continue;

        const chosenDestinations = [];
        const usedIatas = new Set();

        // 1. Assign must-includes first
        for (const mi of mustIncludeItems) {
          chosenDestinations.push(mi);
          usedIatas.add(mi.dstIata);
        }

        // 2. Assign remaining slots greedily from best scoring airports
        const remainingTicksNeeded = [...tmpl];
        for (const mi of mustIncludeItems) {
          const idx = remainingTicksNeeded.indexOf(mi.ticks);
          if (idx !== -1) remainingTicksNeeded.splice(idx, 1);
        }

        let possible = true;
        for (const t of remainingTicksNeeded) {
          const candList = grouped[t] || [];
          const bestAvailable = candList.find(c => !usedIatas.has(c.dstIata));
          if (!bestAvailable) {
            possible = false;
            break;
          }
          chosenDestinations.push(bestAvailable);
          usedIatas.add(bestAvailable.dstIata);
        }

        if (!possible) continue;

        // Compute Circuit Metrics
        const totalDurHours = chosenDestinations.reduce((sum, d) => sum + d.dur, 0);
        const slackHours = Math.max(0, targetHours - totalDurHours);
        const utilizationPct = ((totalDurHours / targetHours) * 100).toFixed(1);
        const weeklyDistanceKm = chosenDestinations.reduce((sum, d) => sum + (d.dist * 2), 0);

        // Overall Star Rating: Average of legs' star ratings
        const starSum = chosenDestinations.reduce((sum, d) => sum + d.demand.avg, 0);
        const avgDemandIndex = starSum / chosenDestinations.length;
        const circuitStarsRating = cf_getStarRating(avgDemandIndex);

        // Cabin Harmony Score (Variance of Y/J/F ratios across circuit)
        let totalEco = 0, totalBus = 0, totalFirst = 0;
        chosenDestinations.forEach(d => {
          totalEco += d.demand.rawEco;
          totalBus += d.demand.rawBus;
          totalFirst += d.demand.rawFirst;
        });
        const sumDem = (totalEco + totalBus + totalFirst) || 1;
        const circEcoR = totalEco / sumDem;
        const circBusR = totalBus / sumDem;
        const circFirstR = totalFirst / sumDem;

        let varianceSum = 0;
        chosenDestinations.forEach(d => {
          const legSum = (d.demand.rawEco + d.demand.rawBus + d.demand.rawFirst) || 1;
          const legEcoR = d.demand.rawEco / legSum;
          const legBusR = d.demand.rawBus / legSum;
          const legFirstR = d.demand.rawFirst / legSum;
          varianceSum += Math.abs(legEcoR - circEcoR) + Math.abs(legBusR - circBusR) + Math.abs(legFirstR - circFirstR);
        });
        const harmonyScore = Math.max(10, Math.round(100 - (varianceSum / chosenDestinations.length * 100)));

        allFoundCircuits.push({
          hubIata: hub.iata,
          hubName: hub.name,
          hubCity: hub.city,
          hubCountry: hub.country,
          aircraftId: aircraft.id,
          aircraftName: aircraft.name,
          aircraftSpeed: aircraft.speed_kmh,
          aircraftCat: aircraft.category,
          targetHours,
          totalDurHours,
          totalDurText: cf_formatHoursMinutes(totalDurHours),
          slackHours,
          slackText: cf_formatHoursMinutes(slackHours),
          utilizationPct,
          weeklyDistanceKm,
          circuitStars: circuitStarsRating.stars,
          circuitStarsText: circuitStarsRating.starsText,
          circuitStarsLabel: circuitStarsRating.label,
          avgDemandIndex: avgDemandIndex.toFixed(1),
          harmonyScore,
          legs: chosenDestinations
        });

        if (allFoundCircuits.length >= 350) break;
      }
    }

    // Sort circuits by user's chosen optimization metric
    const optGoal = document.getElementById('cf_optimization_metric_select')?.value || 'stars_desc';
    allFoundCircuits.sort((a, b) => {
      if (optGoal === 'stars_desc') {
        if (b.circuitStars !== a.circuitStars) return b.circuitStars - a.circuitStars;
        if (b.avgDemandIndex !== a.avgDemandIndex) return b.avgDemandIndex - a.avgDemandIndex;
        return a.slackHours - b.slackHours;
      } else if (optGoal === 'harmony_desc') {
        if (b.harmonyScore !== a.harmonyScore) return b.harmonyScore - a.harmonyScore;
        return a.slackHours - b.slackHours;
      } else if (optGoal === 'distance_desc') {
        return b.weeklyDistanceKm - a.weeklyDistanceKm;
      } else if (optGoal === 'slack_asc') {
        if (a.slackHours !== b.slackHours) return a.slackHours - b.slackHours;
        return b.circuitStars - a.circuitStars;
      } else { // 'demand_desc'
        return b.avgDemandIndex - a.avgDemandIndex;
      }
    });

    cf_discoveredCircuits = allFoundCircuits.slice(0, 200);

    const endBenchmark = performance.now();
    const durationMs = Math.round(endBenchmark - startBenchmark);
    const benchEl = document.getElementById('cf_benchmark_ms');
    if (benchEl) benchEl.textContent = durationMs.toString();

    cf_renderCircuits();
  }

  // =========================================================================
  // RESULTS RENDERING & CARDS
  // =========================================================================
  function cf_renderCircuits() {
    const listContainer = document.getElementById('cf_circuit_results_list');
    const emptyState = document.getElementById('cf_circuits_empty_state');
    const badge = document.getElementById('cf_results_count_badge');
    if (!listContainer || !emptyState) return;

    let displayList = cf_discoveredCircuits;
    if (cf_quickResultsFilter === 'exact') {
      displayList = cf_discoveredCircuits.filter(c => c.slackHours === 0);
    } else if (cf_quickResultsFilter === 'high_harmony') {
      displayList = cf_discoveredCircuits.filter(c => c.harmonyScore >= 90);
    }

    if (badge) {
      badge.textContent = `${displayList.length} found`;
    }

    if (displayList.length === 0) {
      listContainer.innerHTML = '';
      emptyState.classList.remove('hidden');

      const titleEl = document.getElementById('cf_empty_state_title');
      const descEl = document.getElementById('cf_empty_state_desc');
      const relaxBtn = document.getElementById('cf_empty_state_relax_btn');

      if (!cf_isMultiHubSearch && !cf_activeHubIata) {
        if (titleEl) titleEl.textContent = 'Please Enter a Circuit Hub';
        if (descEl) descEl.textContent = 'Enter a departure hub IATA code (e.g. MPM or OSL) or select one of your owned hubs above to discover circuits.';
        if (relaxBtn) relaxBtn.classList.add('hidden');
      } else {
        if (titleEl) titleEl.textContent = 'No Matching Circuits Found';
        if (descEl) descEl.textContent = 'Try loosening your slack tolerance (e.g. up to 1h or 2h), lowering minimum stars, widening route types, or adjusting duration limits.';
        if (relaxBtn) relaxBtn.classList.remove('hidden');
      }
      return;
    }

    emptyState.classList.add('hidden');

    listContainer.innerHTML = displayList.map((circuit, idx) => {
      const isExpanded = (cf_expandedCircuitIdx === idx);
      const harmonyBadgeCol = circuit.harmonyScore >= 90 ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              circuit.harmonyScore >= 75 ? 'bg-blue-950 text-blue-300 border-blue-800' :
                                                          'bg-slate-800 text-slate-300 border-slate-700';

      return `
        <div class="glass-card rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
          isExpanded ? 'border-cyan-500/80 shadow-2xl shadow-cyan-950/40' : 'border-slate-800 hover:border-slate-700/90'
        }">
          
          <!-- Top Row: Card Summary Info & Actions -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            
            <!-- Left: Rank, Hub, Target, Distance/Wk, Star Rating & Harmony -->
            <div class="flex items-center flex-wrap gap-2">
              <span class="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-white">
                #${idx + 1}
              </span>

              <div class="flex items-center gap-1.5 font-bold text-white font-mono text-sm">
                <span>${circuit.hubIata}</span>
                <span class="text-xs text-slate-400 font-normal">(${circuit.hubCity})</span>
              </div>

              <div class="h-4 w-px bg-slate-800"></div>

              <!-- Duration & Utilization -->
              <span class="badge-pill bg-cyan-950 text-cyan-300 border-cyan-800 font-mono">
                ⏱ ${circuit.totalDurText} / ${circuit.targetHours}h (${circuit.utilizationPct}%)
              </span>

              <!-- Slack pill if any -->
              ${circuit.slackHours === 0 
                ? `<span class="badge-pill bg-emerald-950 text-emerald-300 border-emerald-800">✓ 100% Fit</span>` 
                : `<span class="badge-pill bg-amber-950 text-amber-300 border-amber-800">⏳ ${circuit.slackText} slack</span>`
              }

              <!-- Route Count -->
              <span class="badge-pill bg-slate-900 text-slate-300 border-slate-700">
                🗺 ${circuit.legs.length} Routes
              </span>

              <!-- Distance/Wk Prominently Placed in Header as Requested -->
              <span class="badge-pill bg-blue-950 text-blue-300 border-blue-800 font-mono font-semibold" title="Total distance flown weekly across the rotation">
                ✈ ${circuit.weeklyDistanceKm.toLocaleString()} km/wk
              </span>

              <!-- Overall Circuit Star Rating -->
              <span class="badge-pill bg-amber-950 text-amber-300 border-amber-800 font-mono font-bold" title="Average demand rating across all destinations (based on DB Y+J+F ratios)">
                ★ ${circuit.circuitStars} Rating
              </span>

              <!-- Harmony Score -->
              <span class="badge-pill ${harmonyBadgeCol}" title="Cabin Harmony: Measures how uniformly the class demand ratios match across all circuit legs">
                ⚖ ${circuit.harmonyScore}% Harmony
              </span>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center flex-wrap gap-2 shrink-0">
              <!-- Open in Seat Config Button -->
              <button type="button" onclick="cf_transferToSeatConfig(${idx})" class="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm" title="Send this circuit into the Seat Configurator">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                <span>Open in Seat Config</span>
              </button>

              <!-- Save Circuit Button -->
              <button type="button" onclick="cf_saveCircuitToLibrary(${idx})" class="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm" title="Save to Circuit Library">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                <span>Save</span>
              </button>

              <button type="button" onclick="cf_copyCircuitSummary(${idx})" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition" title="Copy text summary">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              </button>

              <button type="button" onclick="cf_toggleCircuitExpand(${idx})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 transition flex items-center gap-1">
                <span>${isExpanded ? 'Collapse' : 'Details &amp; Swap'}</span>
                <svg class="w-3.5 h-3.5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>

          </div>

          <!-- Visual Timeline Bar -->
          <div class="space-y-1 mt-3">
            <div class="h-6 w-full rounded-lg bg-slate-950 border border-slate-800 flex overflow-hidden p-0.5 gap-0.5 shadow-inner">
              ${circuit.legs.map((leg, legIdx) => {
                const pct = (leg.dur / circuit.targetHours) * 100;
                const col = CF_CIRCUIT_COLORS[legIdx % CF_CIRCUIT_COLORS.length];
                return `
                  <div style="width: ${pct}%" class="${col.bg} h-full rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 truncate px-1 transition hover:opacity-90 cursor-default" title="Leg ${legIdx + 1}: ${circuit.hubIata} ↔ ${leg.dstIata} (${leg.city}) · ${cf_formatHoursMinutes(leg.dur)} · ${leg.dist.toLocaleString()} km · ${leg.demand.starsText}">
                    ${leg.dstIata}
                  </div>
                `;
              }).join('')}
              ${circuit.slackHours > 0 ? `
                <div style="width: ${(circuit.slackHours / circuit.targetHours) * 100}%" class="h-full rounded-sm bg-slate-800/80 border border-dashed border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-400 truncate px-0.5" title="Idle Time: ${circuit.slackText}">
                  idle
                </div>
              ` : ''}
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>0h</span>
              <span>Rotation Duration: ${circuit.totalDurText}</span>
              <span>${circuit.targetHours}h Complete</span>
            </div>
          </div>

          <!-- Collapsible Route Breakdown Table & Swap Tool -->
          <div class="${isExpanded ? 'block' : 'hidden'} mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <span>📋 Circuit Flight Legs Breakdown</span>
                <span class="text-[10px] text-slate-400 font-normal">Click "Swap" to swap any destination with an equal flight time alternative</span>
              </span>
            </div>

            <div class="overflow-x-auto rounded-xl border border-slate-800">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-950 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th class="py-2 px-3">Leg</th>
                    <th class="py-2 px-3">Route Pair</th>
                    <th class="py-2 px-3">Flight Time (R/T)</th>
                    <th class="py-2 px-3">Distance</th>
                    <th class="py-2 px-3">Category</th>
                    <th class="py-2 px-3">Demand Star Rating (Y+J+F)/3</th>
                    <th class="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                  ${circuit.legs.map((leg, legIdx) => {
                    const col = CF_CIRCUIT_COLORS[legIdx % CF_CIRCUIT_COLORS.length];
                    return `
                      <tr class="hover:bg-slate-850/60 transition">
                        <td class="py-2.5 px-3">
                          <span class="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${col.badge}">
                            ${legIdx + 1}
                          </span>
                        </td>
                        <td class="py-2.5 px-3">
                          <div class="font-sans">
                            <span class="font-bold text-white font-mono">${circuit.hubIata} &rarr; ${leg.dstIata}</span>
                            <span class="text-slate-400 text-xs ml-1 font-normal">(${leg.city}, ${leg.country})</span>
                          </div>
                        </td>
                        <td class="py-2.5 px-3 text-amber-300 font-semibold">${cf_formatHoursMinutes(leg.dur)}</td>
                        <td class="py-2.5 px-3 text-slate-300">${leg.dist.toLocaleString()} km</td>
                        <td class="py-2.5 px-3">
                          <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Cat ${leg.cat}</span>
                        </td>
                        <td class="py-2.5 px-3 font-sans">
                          <div class="flex items-center gap-1.5">
                            <span class="text-amber-400 font-bold">${leg.demand.starsText}</span>
                            <span class="text-slate-400 text-xs font-mono">(${leg.demand.avgFormatted})</span>
                            <span class="text-[10px] text-slate-500 hidden sm:inline">&bull; ${leg.demand.label}</span>
                          </div>
                        </td>
                        <td class="py-2.5 px-3 text-right">
                          <button type="button" onclick="cf_openRouteSwapModal(${idx}, ${legIdx})" class="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 font-sans font-semibold text-xs border border-slate-700 transition" title="Swap with another route of equal duration">
                            🔄 Swap Route
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      `;
    }).join('');
  }

  function cf_toggleCircuitExpand(idx) {
    if (cf_expandedCircuitIdx === idx) {
      cf_expandedCircuitIdx = null;
    } else {
      cf_expandedCircuitIdx = idx;
    }
    cf_renderCircuits();
  }

  function cf_setQuickResultsFilter(filter) {
    cf_quickResultsFilter = filter;
    const btnAll = document.getElementById('cf_filter_all');
    const btnExact = document.getElementById('cf_filter_exact');
    const btnHarmony = document.getElementById('cf_filter_harmony');

    const inactiveClass = 'px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 font-medium text-xs transition';
    const activeClass = 'px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 font-semibold text-xs transition';

    if (btnAll) btnAll.className = filter === 'all' ? activeClass : inactiveClass;
    if (btnExact) btnExact.className = filter === 'exact' ? activeClass : inactiveClass;
    if (btnHarmony) btnHarmony.className = filter === 'high_harmony' ? activeClass : inactiveClass;

    cf_renderCircuits();
  }

  function cf_relaxCircuitFilters() {
    const slackSel = document.getElementById('cf_slack_tolerance_select');
    if (slackSel) slackSel.value = '2.0';
    const rcSel = document.getElementById('cf_route_count_select');
    if (rcSel) rcSel.value = 'any';
    const starSelect = document.getElementById('cf_star_filter_select');
    if (starSelect) starSelect.value = '0';
    const distLimitCheck = document.getElementById('cf_toggle_max_dist_limit');
    if (distLimitCheck) distLimitCheck.checked = false;
    const maxDistInput = document.getElementById('cf_max_route_dist_input');
    if (maxDistInput) {
      maxDistInput.value = '';
      maxDistInput.disabled = true;
    }
    cf_isMaxDistLimitEnabled = false;

    const minDurInput = document.getElementById('cf_min_leg_dur');
    if (minDurInput) minDurInput.value = '1.5';
    const maxDurInput = document.getElementById('cf_max_leg_dur');
    if (maxDurInput) maxDurInput.value = '42';

    cf_executeCircuitSearch();
    cf_showToast('Relaxed constraints: Slack ≤ 2h, duration bounds widened', 'info');
  }

  function cf_resetCircuitFinderFilters() {
    // 1. Departure Hub
    cf_activeHubIata = '';
    const hubInput = document.getElementById('cf_circuit_hub');
    if (hubInput) hubInput.value = '';
    cf_updateHubInfoDisplay();
    cf_renderOwnedHubs();

    // 2. Aircraft Model to A380-800
    cf_activeAircraftId = 'a380-800';
    const acSelect = document.getElementById('cf_aircraft_select');
    if (acSelect) acSelect.value = 'a380-800';
    cf_updateAircraftDisplay();

    // 3. Duration and Slack
    const targetDurSel = document.getElementById('cf_target_duration_select');
    if (targetDurSel) targetDurSel.value = '168';
    const slackSel = document.getElementById('cf_slack_tolerance_select');
    if (slackSel) slackSel.value = '0';

    // 4. Mission Profile & Multipliers
    const stratSel = document.getElementById('cf_class_strategy_select');
    if (stratSel) stratSel.value = 'tri_class';
    const optSel = document.getElementById('cf_optimization_metric_select');
    if (optSel) optSel.value = 'stars_desc';
    const contSel = document.getElementById('cf_continent_filter_select');
    if (contSel) contSel.value = 'all';
    const catCheck = document.getElementById('cf_cat_filter_check');
    if (catCheck) catCheck.checked = true;

    // Hub Checkboxes
    if (document.getElementById('cf_toggle_exclude_owned_hubs')) document.getElementById('cf_toggle_exclude_owned_hubs').checked = false;
    if (document.getElementById('cf_toggle_exclude_owned_hubs_tier3')) document.getElementById('cf_toggle_exclude_owned_hubs_tier3').checked = false;
    if (document.getElementById('cf_toggle_multi_hub_search')) document.getElementById('cf_toggle_multi_hub_search').checked = false;
    cf_isMultiHubSearch = false;

    // 5. Min Star Demand Rating = 3
    const starSelect = document.getElementById('cf_star_filter_select');
    if (starSelect) starSelect.value = '3';

    // 6. Max Route Distance Limit
    const distLimitCheck = document.getElementById('cf_toggle_max_dist_limit');
    if (distLimitCheck) distLimitCheck.checked = false;
    const maxDistInput = document.getElementById('cf_max_route_dist_input');
    if (maxDistInput) {
      maxDistInput.value = '15556';
      maxDistInput.placeholder = '15556';
      maxDistInput.disabled = true;
    }
    cf_isMaxDistLimitEnabled = false;

    // 7. Clear Include / Exclude Airports
    const incInput = document.getElementById('cf_include_airports_input');
    if (incInput) incInput.value = '';
    cf_includedAirports = [];
    cf_renderIncludeAirportsChips();

    const excInput = document.getElementById('cf_exclude_airports_input');
    if (excInput) excInput.value = '';
    cf_excludedAirports = [];
    cf_renderExcludeAirportsChips();

    // 8. Route Type: LH & Route Count: any
    cf_setRouteType('lh', false);
    cf_updateRouteCountOptions(168);
    const rcSelect = document.getElementById('cf_route_count_select');
    if (rcSelect) rcSelect.value = 'any';

    cf_updateHeaderContext();
    cf_applyRouteTypeBounds();
    cf_updateRouteTypeCounter();
    cf_onClassStrategyChange('tri_class');

    cf_executeCircuitSearch();
    cf_showToast('Filters reset to default configuration', 'info');
  }

  // =========================================================================
  // ACTIONS: COPY, SEAT CONFIG TRANSFER, SAVE TO SHARED LIBRARY
  // =========================================================================
  function cf_copyCircuitSummary(idx) {
    const c = cf_discoveredCircuits[idx];
    if (!c) return;
    const lines = [
      `=== AMT CIRCUIT: ${c.hubIata} (${c.targetHours}h Rotation) ===`,
      `Aircraft: ${c.aircraftName} (Cat ${c.aircraftCat})`,
      `Total Flight Time: ${c.totalDurText} | Slack: ${c.slackText} | Utilization: ${c.utilizationPct}%`,
      `Distance / Week: ${c.weeklyDistanceKm.toLocaleString()} km | Star Rating: ★ ${c.circuitStars} | Harmony: ${c.harmonyScore}%`,
      `Routes (${c.legs.length}):`,
      ...c.legs.map((l, i) => `  ${i + 1}. ${c.hubIata} -> ${l.dstIata} (${l.city}, ${l.country}): ${cf_formatHoursMinutes(l.dur)} · ${l.dist.toLocaleString()} km · ${l.demand.starsText}`),
      `Generated by Airlines Manager Tycoon Toolkit`
    ];
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      cf_showToast('Circuit itinerary copied to clipboard!', 'success');
    });
  }

  /**
   * 1-Click Bridge to Seat Configurator
   * Converts the discovered circuit into the toolkit's standard circuit format
   * and loads it directly into Seat Config via transferRouteFinderCircuitToSeatConfig().
   */
  function cf_transferToSeatConfig(circuitIdx) {
    const c = cf_discoveredCircuits[circuitIdx];
    if (!c) return;

    const circuitData = {
      id: `circuit-${Date.now()}`,
      name: `${c.hubIata} ${c.targetHours}h Circuit (${c.legs.length} Routes)`,
      hub: c.hubIata,
      acId: c.aircraftId,
      acName: c.aircraftName,
      strategy: 'tri_class',
      fulfilledConfigs: {},
      summary: {
        circuitType: `${c.targetHours}h`,
        totalDurationHours: c.totalDurHours,
        totalDurationText: c.totalDurText,
        routeCount: c.legs.length,
        harmonyScore: c.harmonyScore,
        circuitStars: c.circuitStars,
        weeklyDistanceKm: c.weeklyDistanceKm
      },
      legs: c.legs.map((leg, idx) => ({
        id: `leg-${idx + 1}`,
        hub: c.hubIata,
        dst: leg.dstIata,
        distanceKm: leg.dist,
        durationHours: leg.dur,
        durationText: cf_formatHoursMinutes(leg.dur),
        flightsPerDay: 1,
        cargoEnabled: true,
        demand: {
          eco: leg.demand.rawEco,
          bus: leg.demand.rawBus,
          first: leg.demand.rawFirst,
          cargo: 0
        },
        prices: {
          eco: 0,
          bus: 0,
          first: 0,
          cargo: 0
        }
      }))
    };

    if (typeof window.transferRouteFinderCircuitToSeatConfig === 'function') {
      window.transferRouteFinderCircuitToSeatConfig(circuitData);
      cf_showToast(`Loaded ${c.legs.length}-route circuit into Seat Configurator!`, 'success');
    } else if (typeof window.switchTab === 'function') {
      window.switchTab('seat-config');
      if (typeof window.loadSavedCircuit === 'function') {
        window.loadSavedCircuit(circuitData);
      }
    }
  }

  /**
   * Save Circuit to the Shared AMT Circuit Library
   * Stores directly into 'am_saved_circuits_v1' so it is visible in Seat Config & Route Finder modals.
   */
  function cf_saveCircuitToLibrary(circuitIdx) {
    const c = cf_discoveredCircuits[circuitIdx];
    if (!c) return;

    const defaultName = `${c.hubIata} ${c.targetHours}h Tour (${c.legs.length} Routes)`;
    const name = prompt('Enter a name for this saved circuit:', defaultName);
    if (!name) return;

    let savedList = [];
    try {
      const raw = localStorage.getItem(CF_SHARED_SAVED_CIRCUITS_KEY);
      if (raw) savedList = JSON.parse(raw);
      if (!Array.isArray(savedList)) savedList = [];
    } catch (e) {
      savedList = [];
    }

    const savedObj = {
      id: `circuit-${Date.now()}`,
      version: 1,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      hub: c.hubIata,
      hubCountry: c.hubCountry,
      acId: c.aircraftId,
      acName: c.aircraftName,
      strategy: 'tri_class',
      fulfilledConfigs: {},
      summary: {
        circuitType: `${c.targetHours}h`,
        totalDurationHours: c.totalDurHours,
        totalDurationText: c.totalDurText,
        routeCount: c.legs.length,
        harmonyScore: c.harmonyScore,
        circuitStars: c.circuitStars,
        weeklyDistanceKm: c.weeklyDistanceKm
      },
      legs: c.legs.map((l, idx) => ({
        id: `leg-${idx + 1}`,
        dst: l.dstIata,
        city: l.city,
        country: l.country,
        distanceKm: l.dist,
        durationHours: l.dur,
        durationText: cf_formatHoursMinutes(l.dur),
        flightsPerDay: 1,
        cargoEnabled: true,
        demand: {
          eco: l.demand.rawEco,
          bus: l.demand.rawBus,
          first: l.demand.rawFirst,
          cargo: 0
        },
        prices: {
          eco: 0,
          bus: 0,
          first: 0,
          cargo: 0
        }
      }))
    };

    savedList.unshift(savedObj);
    try {
      localStorage.setItem(CF_SHARED_SAVED_CIRCUITS_KEY, JSON.stringify(savedList));
    } catch (e) {}

    if (typeof window.updateSavedCircuitsBadge === 'function') {
      window.updateSavedCircuitsBadge();
    }
    cf_showToast(`Saved "${savedObj.name}" to Circuit Library!`, 'success');
  }

  // =========================================================================
  // INLINE ROUTE SWAP MODAL
  // =========================================================================
  function cf_openRouteSwapModal(circuitIdx, legIdx) {
    cf_swapTargetCircuitIdx = circuitIdx;
    cf_swapTargetLegIdx = legIdx;

    const circuit = cf_discoveredCircuits[circuitIdx];
    if (!circuit) return;
    const currentLeg = circuit.legs[legIdx];
    const aircraft = cf_getAircraft(circuit.aircraftId);

    const durBadge = document.getElementById('cf_swap_modal_dur_badge');
    if (durBadge) durBadge.textContent = cf_formatHoursMinutes(currentLeg.dur);
    const listContainer = document.getElementById('cf_swap_candidates_list');
    if (!listContainer) return;

    // Find other compatible airports in database with matching flight duration
    const hub = cf_getAirport(circuit.hubIata);
    const candidates = [];

    if (typeof AIRPORTS_DATABASE !== 'undefined' && hub && aircraft) {
      for (const dst of AIRPORTS_DATABASE) {
        if (dst.iata === currentLeg.dstIata || dst.iata === hub.iata) continue;
        if (circuit.legs.some(l => l.dstIata === dst.iata)) continue;
        if (dst.cat < aircraft.category) continue;
        if (isNaN(dst.lat) || isNaN(dst.lon)) continue;

        const dist = cf_haversineDistance(hub.lat, hub.lon, dst.lat, dst.lon);
        if (dist > aircraft.range_km) continue;

        const dur = cf_calculateFlightTimeHours(dist, aircraft.speed_kmh);
        if (dur === currentLeg.dur) {
          const demand = cf_computeAirportDemandStats(dst);
          candidates.push({ dst, dist, dur, demand });
        }
      }
    }

    candidates.sort((a, b) => b.demand.avg - a.demand.avg);

    if (candidates.length === 0) {
      listContainer.innerHTML = `
        <div class="p-4 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
          No alternative destinations found with the exact duration of ${cf_formatHoursMinutes(currentLeg.dur)} for this aircraft range.
        </div>
      `;
    } else {
      listContainer.innerHTML = candidates.map(c => {
        return `
          <div class="p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition group">
            <div class="flex items-center gap-3">
              <span class="w-8 h-8 rounded-lg bg-slate-900 text-cyan-300 font-mono font-bold flex items-center justify-center border border-slate-700">
                ${c.dst.iata}
              </span>
              <div>
                <div class="flex items-center gap-1.5 font-bold text-xs text-white">
                  <span>${c.dst.city}, ${c.dst.country}</span>
                  <span class="text-[10px] px-1 rounded bg-slate-800 text-slate-400 font-mono">Cat ${c.dst.cat}</span>
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>${c.dist.toLocaleString()} km</span> &bull; 
                  <span class="text-amber-400">${c.demand.starsText}</span> 
                  <span class="text-slate-400">(${c.demand.avgFormatted})</span>
                </div>
              </div>
            </div>
            <button type="button" onclick="cf_performRouteSwap('${c.dst.iata}')" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-sm">
              Select
            </button>
          </div>
        `;
      }).join('');
    }

    const modal = document.getElementById('cf_route_swap_modal_backdrop');
    if (modal) modal.classList.remove('hidden');
  }

  function cf_closeRouteSwapModal() {
    const modal = document.getElementById('cf_route_swap_modal_backdrop');
    if (modal) modal.classList.add('hidden');
  }

  function cf_performRouteSwap(newDstIata) {
    if (cf_swapTargetCircuitIdx === null || cf_swapTargetLegIdx === null) return;
    const circuit = cf_discoveredCircuits[cf_swapTargetCircuitIdx];
    if (!circuit) return;

    const newAp = cf_getAirport(newDstIata);
    if (!newAp) return;

    const hub = cf_getAirport(circuit.hubIata);
    const aircraft = cf_getAircraft(circuit.aircraftId);
    const dist = cf_haversineDistance(hub.lat, hub.lon, newAp.lat, newAp.lon);
    const dur = cf_calculateFlightTimeHours(dist, aircraft.speed_kmh);
    const demand = cf_computeAirportDemandStats(newAp);

    const newLeg = {
      hubIata: hub.iata,
      dstIata: newAp.iata,
      name: newAp.name,
      city: newAp.city,
      country: newAp.country,
      continent: CF_CONTINENT_MAP[newAp.country] || 'Other',
      cat: newAp.cat,
      dist,
      dur,
      ticks: Math.round(dur * 4),
      demand,
      score: 0
    };

    circuit.legs[cf_swapTargetLegIdx] = newLeg;

    // Recalculate stars and weekly distance
    const starSum = circuit.legs.reduce((sum, d) => sum + d.demand.avg, 0);
    const avgDemandIndex = starSum / circuit.legs.length;
    const circuitStarsRating = cf_getStarRating(avgDemandIndex);
    circuit.circuitStars = circuitStarsRating.stars;
    circuit.circuitStarsText = circuitStarsRating.starsText;
    circuit.circuitStarsLabel = circuitStarsRating.label;
    circuit.avgDemandIndex = avgDemandIndex.toFixed(1);
    circuit.weeklyDistanceKm = circuit.legs.reduce((sum, d) => sum + (d.dist * 2), 0);

    cf_closeRouteSwapModal();
    cf_renderCircuits();
    cf_showToast(`Swapped leg with ${newDstIata} (${newAp.city})!`, 'success');
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================
  function initCircuitFinder() {
    if (cf_isInitialized) return;
    cf_isInitialized = true;

    cf_loadOwnedHubs();
    cf_initAircraftCombobox();
    cf_renderOwnedHubs();
    cf_updateHubInfoDisplay();
    cf_updateAircraftDisplay();
    cf_updateHeaderContext();
    cf_updateRouteCountOptions(168);
    cf_setRouteType('lh', false);

    const rcSelect = document.getElementById('cf_route_count_select');
    if (rcSelect) rcSelect.value = 'any';
    const starSelect = document.getElementById('cf_star_filter_select');
    if (starSelect) starSelect.value = '3';

    cf_renderIncludeAirportsChips();
    cf_renderExcludeAirportsChips();

    // Click outside aircraft combobox popover to close
    document.addEventListener('click', (e) => {
      const root = document.getElementById('cf_aircraft_combobox_root');
      if (root && !root.contains(e.target)) {
        cf_closeAircraftCombobox();
      }
    });

    cf_executeCircuitSearch();
  }

  // Expose public API on window
  window.initCircuitFinder = initCircuitFinder;
  window.cf_setActiveHub = cf_setActiveHub;
  window.cf_addOwnedHubFromInput = cf_addOwnedHubFromInput;
  window.cf_removeOwnedHub = cf_removeOwnedHub;
  window.cf_onMultiHubToggle = cf_onMultiHubToggle;
  window.cf_onExcludeOwnedHubsToggle = cf_onExcludeOwnedHubsToggle;
  window.cf_toggleOwnedHubsDropdown = cf_toggleOwnedHubsDropdown;
  window.cf_onCircuitHubChange = cf_onCircuitHubChange;
  window.cf_toggleAircraftCombobox = cf_toggleAircraftCombobox;
  window.cf_openAircraftCombobox = cf_openAircraftCombobox;
  window.cf_closeAircraftCombobox = cf_closeAircraftCombobox;
  window.cf_clearAircraftComboboxSearch = cf_clearAircraftComboboxSearch;
  window.cf_setComboboxHaul = cf_setComboboxHaul;
  window.cf_selectAircraftFromCombobox = cf_selectAircraftFromCombobox;
  window.cf_renderAircraftComboboxList = cf_renderAircraftComboboxList;
  window.cf_onTargetDurationChange = cf_onTargetDurationChange;
  window.cf_setRouteType = cf_setRouteType;
  window.cf_onClassStrategyChange = cf_onClassStrategyChange;
  window.cf_toggleCustomSliders = cf_toggleCustomSliders;
  window.cf_onCustomSliderChange = cf_onCustomSliderChange;
  window.cf_onIncludeAirportsInputChange = cf_onIncludeAirportsInputChange;
  window.cf_removeIncludeAirport = cf_removeIncludeAirport;
  window.cf_onExcludeAirportsInputChange = cf_onExcludeAirportsInputChange;
  window.cf_removeExcludeAirport = cf_removeExcludeAirport;
  window.cf_clearExcludedAirports = cf_clearExcludedAirports;
  window.cf_onToggleMaxDistLimit = cf_onToggleMaxDistLimit;
  window.cf_debouncedFindCircuits = cf_debouncedFindCircuits;
  window.cf_executeCircuitSearch = cf_executeCircuitSearch;
  window.cf_toggleCircuitExpand = cf_toggleCircuitExpand;
  window.cf_setQuickResultsFilter = cf_setQuickResultsFilter;
  window.cf_relaxCircuitFilters = cf_relaxCircuitFilters;
  window.cf_resetCircuitFinderFilters = cf_resetCircuitFinderFilters;
  window.cf_copyCircuitSummary = cf_copyCircuitSummary;
  window.cf_transferToSeatConfig = cf_transferToSeatConfig;
  window.cf_saveCircuitToLibrary = cf_saveCircuitToLibrary;
  window.cf_openRouteSwapModal = cf_openRouteSwapModal;
  window.cf_closeRouteSwapModal = cf_closeRouteSwapModal;
  window.cf_performRouteSwap = cf_performRouteSwap;

  document.addEventListener('DOMContentLoaded', () => {
    initCircuitFinder();
  });

})(window, document);
