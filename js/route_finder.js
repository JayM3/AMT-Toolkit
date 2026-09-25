/* =========================================================================
 * AMT Toolkit - Route Finder & Circuit Builder Module
 * ========================================================================= */
(function() {
// Country to Continent Map for all 211 countries in airports.json
    const CONTINENT_MAP = {
      // Europe (42)
      'Albania': 'Europe', 'Austria': 'Europe', 'Belarus': 'Europe', 'Belgium': 'Europe',
      'Bosnia and Herzegovina': 'Europe', 'Bulgaria': 'Europe', 'Croatia': 'Europe', 'Cyprus': 'Europe',
      'Czech Republic': 'Europe', 'Denmark': 'Europe', 'Estonia': 'Europe', 'Finland': 'Europe',
      'France': 'Europe', 'Germany': 'Europe', 'Gibraltar': 'Europe', 'Greece': 'Europe',
      'Hungary': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Italy': 'Europe',
      'Kosovo': 'Europe', 'Latvia': 'Europe', 'Lithuania': 'Europe', 'Luxembourg': 'Europe',
      'Malta': 'Europe', 'Moldova': 'Europe', 'Montenegro': 'Europe', 'Netherlands': 'Europe',
      'North Macedonia': 'Europe', 'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe',
      'Romania': 'Europe', 'Russia': 'Europe', 'Serbia': 'Europe', 'Slovakia': 'Europe',
      'Slovenia': 'Europe', 'Spain': 'Europe', 'Sweden': 'Europe', 'Switzerland': 'Europe',
      'Ukraine': 'Europe', 'United Kingdom': 'Europe',

      // Asia (46)
      'Afghanistan': 'Asia', 'Armenia': 'Asia', 'Azerbaijan': 'Asia', 'Bahrain': 'Asia',
      'Bangladesh': 'Asia', 'Bhutan': 'Asia', 'Brunei': 'Asia', 'Cambodia': 'Asia',
      'China': 'Asia', 'East Timor': 'Asia', 'Georgia': 'Asia', 'India': 'Asia',
      'Indonesia': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Israel': 'Asia',
      'Japan': 'Asia', 'Jordan': 'Asia', 'Kazakhstan': 'Asia', 'Kuwait': 'Asia',
      'Kyrgyzstan': 'Asia', 'Laos': 'Asia', 'Lebanon': 'Asia', 'Malaysia': 'Asia',
      'Maldives': 'Asia', 'Mongolia': 'Asia', 'Myanmar [Burma]': 'Asia', 'Nepal': 'Asia',
      'North Korea': 'Asia', 'Oman': 'Asia', 'Pakistan': 'Asia', 'Philippines': 'Asia',
      'Qatar': 'Asia', 'Saudi Arabia': 'Asia', 'Singapore': 'Asia', 'South Korea': 'Asia',
      'Sri Lanka': 'Asia', 'Syria': 'Asia', 'Taiwan': 'Asia', 'Tajikistan': 'Asia',
      'Thailand': 'Asia', 'Turkey': 'Asia', 'Turkmenistan': 'Asia', 'United Arab Emirates': 'Asia',
      'Uzbekistan': 'Asia', 'Vietnam': 'Asia', 'Yemen': 'Asia',

      // Africa (54)
      'Algeria': 'Africa', 'Angola': 'Africa', 'Benin': 'Africa', 'Botswana': 'Africa',
      'Burkina Faso': 'Africa', 'Burundi': 'Africa', 'Cameroon': 'Africa', 'Cape Verde': 'Africa',
      'Central African Republic': 'Africa', 'Chad': 'Africa', 'Comoros': 'Africa',
      'Congo - Brazzaville': 'Africa', 'Congo - Kinshasa': 'Africa', 'Djibouti': 'Africa',
      'Egypt': 'Africa', 'Equatorial Guinea': 'Africa', 'Eswatini': 'Africa', 'Ethiopia': 'Africa',
      'Gabon': 'Africa', 'Gambia': 'Africa', 'Ghana': 'Africa', 'Guinea': 'Africa',
      'Guinea-Bissau': 'Africa', 'Ivory Coast': 'Africa', 'Kenya': 'Africa', 'Lesotho': 'Africa',
      'Liberia': 'Africa', 'Libya': 'Africa', 'Madagascar': 'Africa', 'Malawi': 'Africa',
      'Mali': 'Africa', 'Mauritania': 'Africa', 'Mauritius': 'Africa', 'Mayotte': 'Africa',
      'Morocco': 'Africa', 'Mozambique': 'Africa', 'Namibia': 'Africa', 'Niger': 'Africa',
      'Nigeria': 'Africa', 'Rwanda': 'Africa', 'Réunion': 'Africa',
      'Saint Helena, Ascension and Tristan da Cunha': 'Africa', 'Senegal': 'Africa',
      'Seychelles': 'Africa', 'Sierra Leone': 'Africa', 'Somalia': 'Africa', 'South Africa': 'Africa',
      'Sudan': 'Africa', 'Tanzania': 'Africa', 'Togo': 'Africa', 'Tunisia': 'Africa',
      'Uganda': 'Africa', 'Zambia': 'Africa', 'Zimbabwe': 'Africa',

      // North America (31)
      'Anguilla': 'North America', 'Antigua and Barbuda': 'North America', 'Aruba': 'North America',
      'Barbados': 'North America', 'Belize': 'North America', 'Bermuda': 'North America',
      'Canada': 'North America', 'Costa Rica': 'North America', 'Cuba': 'North America',
      'Dominica': 'North America', 'Dominican Republic': 'North America', 'El Salvador': 'North America',
      'Greenland': 'North America', 'Grenada': 'North America', 'Guadeloupe': 'North America',
      'Guatemala': 'North America', 'Haiti': 'North America', 'Honduras': 'North America',
      'Jamaica': 'North America', 'Martinique': 'North America', 'Mexico': 'North America',
      'Netherlands Antilles': 'North America', 'Nicaragua': 'North America', 'Panama': 'North America',
      'Puerto Rico': 'North America', 'Saint Kitts and Nevis': 'North America',
      'Saint Lucia': 'North America', 'Saint Pierre and Miquelon': 'North America',
      'Saint Vincent and the Grenadines': 'North America', 'The Bahamas': 'North America',
      'Trinidad and Tobago': 'North America', 'Turks and Caicos Islands': 'North America',
      'United States': 'North America',

      // South America (13)
      'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
      'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
      'French Guiana': 'South America', 'Guyana': 'South America', 'Paraguay': 'South America',
      'Peru': 'South America', 'Suriname': 'South America', 'Uruguay': 'South America',
      'Venezuela': 'South America',

      // Oceania (25)
      'American Samoa': 'Oceania', 'Australia': 'Oceania', 'Cocos [Keeling] Islands': 'Oceania',
      'Cook Islands': 'Oceania', 'Fiji': 'Oceania', 'French Polynesia': 'Oceania',
      'Guam': 'Oceania', 'Kiribati': 'Oceania', 'Micronesia': 'Oceania', 'Nauru': 'Oceania',
      'New Caledonia': 'Oceania', 'New Zealand': 'Oceania', 'Niue': 'Oceania',
      'Norfolk Island': 'Oceania', 'Northern Mariana Islands': 'Oceania',
      'Papua New Guinea': 'Oceania', 'Samoa': 'Oceania', 'Solomon Islands': 'Oceania',
      'Tonga': 'Oceania', 'Tuvalu': 'Oceania', 'Vanuatu': 'Oceania', 'Wallis and Futuna': 'Oceania'
    };

    // Global State
    let currentHub = null;
    let currentAircraft = null;
    let candidatePool = [];      // All compatible routes for hub & aircraft
    let filteredCandidates = []; // Routes after criteria & text filters
    let currentCircuitLegs = []; // [{ dstIata, name, country, category, distanceKm, durationHours, durationText, flightsPerDay, color }]
    let currentPage = 1;
    let pageSize = 50;
    let viewMode = 'table';
    let currentSort = 'dist_asc';
    let currentDurationPreset = 'any';
    let isShowingAcDetails = false;
    let isComboboxOpen = false;
    let comboboxHaulFilter = 'all';
    let tableSearchQuery = '';
    let isRestoringRouteFinderState = false;
    let rf_timelineViewMode = 'week';

    // Distinct Circuit Colors Palette
    const CIRCUIT_PALETTE = [
      { bg: 'from-cyan-600 to-blue-600', badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-700', borderCol: 'border-cyan-500' },
      { bg: 'from-emerald-600 to-teal-600', badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700', borderCol: 'border-emerald-500' },
      { bg: 'from-purple-600 to-indigo-600', badgeBg: 'bg-purple-950 text-purple-300 border-purple-700', borderCol: 'border-purple-500' },
      { bg: 'from-amber-600 to-orange-600', badgeBg: 'bg-amber-950 text-amber-300 border-amber-700', borderCol: 'border-amber-500' },
      { bg: 'from-rose-600 to-pink-600', badgeBg: 'bg-rose-950 text-rose-300 border-rose-700', borderCol: 'border-rose-500' },
      { bg: 'from-indigo-600 to-blue-700', badgeBg: 'bg-indigo-950 text-indigo-300 border-indigo-700', borderCol: 'border-indigo-500' },
    ];

    // Toast Notification System
    function showToast(msg, type = 'info') {
      const container = document.getElementById('toast_container');
      if (!container) return;
      const toast = document.createElement('div');
      const borderCol = type === 'success' ? 'border-emerald-500/60 bg-emerald-950/90 text-emerald-200' :
                        type === 'warning' ? 'border-amber-500/60 bg-amber-950/90 text-amber-200' :
                        type === 'danger'  ? 'border-rose-500/60 bg-rose-950/90 text-rose-200' :
                                             'border-cyan-500/60 bg-slate-900/95 text-cyan-200';
      toast.className = `px-4 py-2.5 rounded-xl border ${borderCol} shadow-2xl text-xs font-semibold backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center gap-2`;
      toast.innerHTML = `<span>${msg}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // Mathematical Helpers
    function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const toRad = deg => (deg * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    }

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

    // Demand Star Rating System (consistent with Circuit Finder)
    function rf_getStarRating(avg) {
      if (avg >= 30) return { stars: 5, starsText: '★★★★★', label: 'Global Mega-Hub' };
      if (avg >= 22) return { stars: 4, starsText: '★★★★', label: 'Major International' };
      if (avg >= 15) return { stars: 3, starsText: '★★★', label: 'Strong Regional' };
      if (avg >= 8)  return { stars: 2, starsText: '★★', label: 'Moderate' };
      return { stars: 1, starsText: '★', label: 'Light' };
    }

    function rf_computeAirportDemandStats(ap) {
      if (!ap) return { avg: 0, avgFormatted: '0.0', stars: 1, starsText: '★', rawEco: 0, rawBus: 0, rawFirst: 0, rawCargo: 0, label: 'Unknown' };
      const rawEco = ap.economy ?? ap.eco ?? ap.demand_eco ?? 0;
      const rawBus = ap.business ?? ap.bus ?? ap.demand_bus ?? 0;
      const rawFirst = ap.first ?? ap.demand_first ?? 0;
      const rawCargo = ap.cargo ?? 0;
      const avg = (rawEco + rawBus + rawFirst) / 3;
      const rating = rf_getStarRating(avg);
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

    function findAirport(query) {
      if (!query || typeof AIRPORTS_DATABASE === 'undefined') return null;
      const clean = query.trim().toUpperCase();
      const exact = AIRPORTS_DATABASE.find(a => a.iata === clean);
      if (exact) return exact;
      return AIRPORTS_DATABASE.find(a => 
        (a.city && a.city.toUpperCase() === clean) ||
        (a.name && a.name.toUpperCase().includes(clean))
      );
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    // LOCALSTORAGE PERSISTENCE ENGINE (am_route_finder_state_v1)
    // =========================================================================
    function rf_saveStateToLocalStorage() {
      if (isRestoringRouteFinderState || typeof localStorage === 'undefined') return;

      try {
        const hubIata = currentHub ? currentHub.iata : '';
        const aircraftId = currentAircraft ? currentAircraft.id : 'a380-800';

        const catMin = document.getElementById('rf_cat_min')?.value || '8';
        const catMax = document.getElementById('rf_cat_max')?.value || '10';

        const durMinHh = document.getElementById('rf_dur_min_hh')?.value || '2';
        const durMinMm = document.getElementById('rf_dur_min_mm')?.value || '0';
        const durMaxHh = document.getElementById('rf_dur_max_hh')?.value || '';
        const durMaxMm = document.getElementById('rf_dur_max_mm')?.value || '';

        const continent = document.getElementById('rf_continent_filter')?.value || 'ALL';
        const country = document.getElementById('rf_country_filter')?.value || 'ALL';

        const hubMode = document.getElementById('hub_entry_search_container')?.classList.contains('hidden') ? 'quick' : 'search';
        const hubCountry = document.getElementById('rf_hub_country_select')?.value || '';
        const hubAirport = document.getElementById('rf_hub_airport_select')?.value || '';

        const circuitLegs = currentCircuitLegs.map(l => ({
          dstIata: l.dstIata,
          flightsPerDay: l.flightsPerDay || 1
        }));

        const data = {
          hubIata,
          hubMode,
          hubCountry,
          hubAirport,
          aircraftId,
          catMin,
          catMax,
          durMinHh,
          durMinMm,
          durMaxHh,
          durMaxMm,
          durationPreset: currentDurationPreset || 'any',
          continent,
          country,
          searchQuery: tableSearchQuery || '',
          currentSort: currentSort || 'dist_asc',
          viewMode: viewMode || 'table',
          pageSize: pageSize || 50,
          timelineViewMode: rf_timelineViewMode || 'week',
          circuitLegs
        };

        localStorage.setItem('am_route_finder_state_v1', JSON.stringify(data));
      } catch (err) {
        console.warn('Could not save Route Finder state to localStorage:', err);
      }
    }

    function rf_restoreStateFromLocalStorage() {
      if (typeof localStorage === 'undefined') return false;
      const raw = localStorage.getItem('am_route_finder_state_v1');
      if (!raw) return false;

      isRestoringRouteFinderState = true;
      try {
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') {
          isRestoringRouteFinderState = false;
          return false;
        }

        // 1. Restore Aircraft (without auto-resetting duration to default max)
        if (data.aircraftId) {
          rf_setAircraftById(data.aircraftId, false);
        } else {
          rf_setAircraftById('a380-800', false);
        }

        // 2. Restore Category Limits
        if (data.catMin !== undefined) {
          const minEl = document.getElementById('rf_cat_min');
          if (minEl) minEl.value = String(data.catMin);
        }
        if (data.catMax !== undefined) {
          const maxEl = document.getElementById('rf_cat_max');
          if (maxEl) maxEl.value = String(data.catMax);
        }
        if (currentAircraft) {
          const catHint = document.getElementById('cat_filter_hint');
          if (catHint) catHint.textContent = `Min Cat ${currentAircraft.category} (${currentAircraft.name})`;
        }

        // 3. Restore Duration Limits & Preset
        if (data.durMinHh !== undefined) {
          const el = document.getElementById('rf_dur_min_hh');
          if (el) el.value = String(data.durMinHh);
        }
        if (data.durMinMm !== undefined) {
          const el = document.getElementById('rf_dur_min_mm');
          if (el) el.value = String(data.durMinMm);
        }
        if (data.durMaxHh !== undefined) {
          const el = document.getElementById('rf_dur_max_hh');
          if (el) el.value = String(data.durMaxHh);
        }
        if (data.durMaxMm !== undefined) {
          const el = document.getElementById('rf_dur_max_mm');
          if (el) el.value = String(data.durMaxMm);
        }
        if (data.durationPreset) {
          currentDurationPreset = data.durationPreset;
          const buttons = ['any', '24h_divisors', 'short', 'medium', 'long'];
          buttons.forEach(b => {
            const el = document.getElementById(`dur_preset_${b === '24h_divisors' ? '24h' : b === 'medium' ? 'med' : b}`);
            if (!el) return;
            if (b === currentDurationPreset) {
              el.className = 'px-2 py-0.5 rounded text-[10px] font-semibold transition bg-cyan-950 text-cyan-300 border border-cyan-700';
            } else {
              el.className = 'px-2 py-0.5 rounded text-[10px] font-semibold transition bg-slate-800 text-slate-300 hover:text-white border border-slate-700';
            }
          });
        }

        // 4. Restore Geographic Filters
        if (data.continent) {
          const contEl = document.getElementById('rf_continent_filter');
          if (contEl) contEl.value = data.continent;
          const hintEl = document.getElementById('rf_continent_hint');
          if (hintEl) hintEl.textContent = data.continent === 'ALL' ? 'All' : data.continent;
          rf_initCountryFilter(data.continent);
        }
        if (data.country) {
          const countryEl = document.getElementById('rf_country_filter');
          if (countryEl) countryEl.value = data.country;
        }

        // 5. Restore Table Search
        if (data.searchQuery !== undefined) {
          tableSearchQuery = data.searchQuery;
          const searchEl = document.getElementById('rf_table_search');
          if (searchEl) searchEl.value = data.searchQuery;
          const clearBtn = document.getElementById('rf_clear_table_search_btn');
          if (clearBtn) {
            if (data.searchQuery) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');
          }
        }

        // 6. Restore View Mode & Page Size & Timeline View Mode
        if (data.viewMode) {
          rf_setViewMode(data.viewMode);
        }
        if (data.pageSize) {
          pageSize = Number(data.pageSize) || 50;
          const psEl = document.getElementById('rf_page_size');
          if (psEl) psEl.value = String(pageSize);
        }
        if (data.timelineViewMode) {
          rf_timelineViewMode = data.timelineViewMode;
        }

        // 7. Restore Sort
        if (data.currentSort) {
          currentSort = data.currentSort;
          const sortSelect = document.getElementById('rf_sort_select');
          if (sortSelect) sortSelect.value = currentSort;
          const found = sortOptionItems.find(i => i.value === currentSort);
          const sortLabel = document.getElementById('rf_sort_label');
          if (sortLabel && found) sortLabel.textContent = found.label;
        }
        rf_updateTableHeaderSortIndicators();

        // 8. Restore Hub
        if (data.hubIata) {
          rf_setHubByIata(data.hubIata);
          if (data.hubMode === 'search') {
            rf_setHubEntryMode('search');
            if (data.hubCountry) {
              const cEl = document.getElementById('rf_hub_country_select');
              if (cEl) cEl.value = data.hubCountry;
              rf_populateHubAirportsForCountry(data.hubCountry);
            }
            if (data.hubAirport) {
              const aEl = document.getElementById('rf_hub_airport_select');
              if (aEl) aEl.value = data.hubAirport;
            }
          } else {
            rf_setHubEntryMode('quick');
          }
        } else {
          rf_clearHub();
        }

        // 9. Restore Active Circuit Legs
        if (Array.isArray(data.circuitLegs) && data.circuitLegs.length > 0) {
          currentCircuitLegs = [];
          data.circuitLegs.forEach((savedLeg, idx) => {
            const airport = findAirport(savedLeg.dstIata);
            if (!airport) return;
            const colorIdx = idx % CIRCUIT_PALETTE.length;
            const dist = currentHub ? calculateHaversineDistance(currentHub.lat, currentHub.lon, airport.lat, airport.lon) : 0;
            const speed = currentAircraft ? currentAircraft.speed_kmh : 900;
            const durHours = dist > 0 ? calculateFlightTimeHours(dist, speed) : 0;
            currentCircuitLegs.push({
              dstIata: airport.iata,
              name: airport.name,
              city: airport.city,
              country: airport.country,
              category: airport.cat,
              distanceKm: dist,
              durationHours: durHours,
              durationText: formatHoursMinutes(durHours),
              flightsPerDay: savedLeg.flightsPerDay || 1,
              color: CIRCUIT_PALETTE[colorIdx]
            });
          });
          rf_updateCircuitUI();
        }

        // 10. Refresh results
        rf_refreshAll();

        isRestoringRouteFinderState = false;
        return true;
      } catch (err) {
        console.error('Failed to restore Route Finder state from localStorage:', err);
        isRestoringRouteFinderState = false;
        return false;
      }
    }

    let rfInitialized = false;
function initRouteFinder() {
  if (rfInitialized) return;
  rfInitialized = true;
  rf_initDurationDropdowns();
  rf_initHubSelector();
  rf_initCountryFilter();
  rf_updateSavedCircuitsCount();

  // Click outside combobox or sort dropdown to close
  document.addEventListener('click', (e) => {
    const root = document.getElementById('rf_combobox_root');
    if (root && !root.contains(e.target)) {
      rf_closeAircraftCombobox();
    }
    const sortContainer = document.getElementById('rf_sort_container');
    if (sortContainer && !sortContainer.contains(e.target)) {
      rf_closeSortDropdown();
    }
    // Compact popovers close when clicking anywhere outside them.
    const compactRoot = document.getElementById('route_finder_compact_container');
    if (compactRoot && (rfCompact.acOpen || rfCompact.sortOpen)) {
      const target = e.target;
      const insideCompact = target && typeof target.closest === 'function' &&
        (target.closest('#rf_c_ac_root') || target.closest('#rf_c_sort_root'));
      if (!insideCompact) {
        rfCompact.acOpen = false;
        rfCompact.sortOpen = false;
        rfCompact.acSearch = '';
        rf_renderCompact();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (rfCompact.acOpen || rfCompact.sortOpen || rfCompact.gapOpen) {
      rfCompact.acOpen = false;
      rfCompact.sortOpen = false;
      rfCompact.gapOpen = false;
      rf_renderCompact();
    }
  });

  const restored = rf_restoreStateFromLocalStorage();
  if (!restored) {
    // Default: A380-800 aircraft and prompt user to enter hub (no default hub)
    rf_setAircraftById('a380-800');
    rf_clearHub();
    rf_updateTableHeaderSortIndicators();
    rf_refreshAll();
  }

  // Reactive auto-save listeners for all Route Finder inputs & selects
  const rfInputs = document.querySelectorAll('#view_route_finder input, #view_route_finder select');
  rfInputs.forEach(input => {
    input.addEventListener('input', () => {
      rf_saveStateToLocalStorage();
    });
    input.addEventListener('change', () => {
      rf_saveStateToLocalStorage();
    });
  });

  // Draw the compact (sidebar) layout, and keep its default pane sensible.
  if (!currentHub) rfCompact.tab = 'criteria';
  rf_renderCompact();
}
window.initRouteFinder = initRouteFinder;
document.addEventListener('DOMContentLoaded', () => {
  initRouteFinder();
});

    function rf_updateDurationLimitsForAircraft(ac, resetToDefaultMax = true) {
      if (!ac || !ac.range_km || !ac.speed_kmh) return;

      const maxDurHours = calculateFlightTimeHours(ac.range_km, ac.speed_kmh);
      const maxHours = Math.floor(maxDurHours);
      const maxMinutes = Math.round((maxDurHours - maxHours) * 60);

      const minHhSelect = document.getElementById('rf_dur_min_hh');
      const minMmSelect = document.getElementById('rf_dur_min_mm');
      const maxHhSelect = document.getElementById('rf_dur_max_hh');
      const maxMmSelect = document.getElementById('rf_dur_max_mm');
      const hintEl = document.getElementById('rf_dur_max_hint');

      if (hintEl) {
        hintEl.textContent = `Max: ${formatHoursMinutes(maxDurHours)}`;
        hintEl.title = `Theoretical max round-trip flight duration for ${ac.name} (${Number(ac.range_km).toLocaleString()} km @ ${ac.speed_kmh} km/h)`;
      }

      if (!minHhSelect || !maxHhSelect) return;

      const prevMinHh = minHhSelect.value !== '' ? parseInt(minHhSelect.value, 10) : 2;
      const prevMinMm = minMmSelect?.value !== '' ? parseInt(minMmSelect.value, 10) : 0;
      const prevMinTotal = prevMinHh + (prevMinMm / 60);

      const prevMaxHh = maxHhSelect.value !== '' ? parseInt(maxHhSelect.value, 10) : null;
      const prevMaxMm = maxMmSelect?.value !== '' ? parseInt(maxMmSelect.value, 10) : 0;

      // Populate HH options dynamically from 0 up to maxHours
      minHhSelect.innerHTML = '';
      maxHhSelect.innerHTML = '';

      for (let i = 0; i <= maxHours; i++) {
        const val = i.toString().padStart(2, '0');
        minHhSelect.innerHTML += `<option value="${i}">${val}</option>`;
        maxHhSelect.innerHTML += `<option value="${i}">${val}</option>`;
      }

      // Default or preserve max duration
      if (resetToDefaultMax || prevMaxHh === null || prevMaxHh > maxHours) {
        maxHhSelect.value = String(maxHours);
        if (maxMmSelect) maxMmSelect.value = String(maxMinutes);
      } else {
        maxHhSelect.value = String(prevMaxHh);
        if (maxMmSelect) maxMmSelect.value = String(prevMaxMm);
      }

      // Preserve or clamp min duration
      if (prevMinTotal <= maxDurHours && prevMinHh <= maxHours) {
        minHhSelect.value = String(prevMinHh);
        if (minMmSelect) minMmSelect.value = String(prevMinMm);
      } else {
        minHhSelect.value = '0';
        if (minMmSelect) minMmSelect.value = '0';
      }
    }

    function rf_initDurationDropdowns() {
      if (currentAircraft) {
        rf_updateDurationLimitsForAircraft(currentAircraft, true);
      } else {
        const minHh = document.getElementById('rf_dur_min_hh');
        const maxHh = document.getElementById('rf_dur_max_hh');
        if (!minHh || !maxHh) return;
        minHh.innerHTML = '';
        maxHh.innerHTML = '';

        for (let i = 0; i <= 50; i++) {
          const val = i.toString().padStart(2, '0');
          minHh.innerHTML += `<option value="${i}" ${i === 2 ? 'selected' : ''}>${val}</option>`;
          maxHh.innerHTML += `<option value="${i}" ${i === 50 ? 'selected' : ''}>${val}</option>`;
        }
      }
    }

    // =========================================================================
    // AIRCRAFT SELECTION ENGINE (Combobox + Full Catalog Modal)
    // =========================================================================
    function rf_setAircraftById(id, resetDuration = true) {
      currentAircraft = AIRCRAFT_DATABASE.find(a => a.id === id) || AIRCRAFT_DATABASE[0];

      document.getElementById('rf_trigger_ac_name').textContent = currentAircraft.name;
      document.getElementById('rf_trigger_ac_details').textContent = `(${currentAircraft.seats} seats • ${currentAircraft.speed_kmh} km/h • ${Number(currentAircraft.range_km).toLocaleString()} km)`;
      document.getElementById('rf_ac_header_cat_badge').textContent = `Cat ${currentAircraft.category}`;

      document.getElementById('rf_ac_spec_range').textContent = `${Number(currentAircraft.range_km).toLocaleString()} km`;
      document.getElementById('rf_ac_spec_speed').textContent = `${currentAircraft.speed_kmh} km/h`;
      document.getElementById('rf_ac_spec_cat').textContent = `Cat ${currentAircraft.category}`;
      document.getElementById('rf_ac_spec_seats').textContent = `${currentAircraft.seats} seats`;

      const acBadge = document.getElementById('header_ac_badge');
      if (acBadge) acBadge.textContent = `${currentAircraft.name} (${Number(currentAircraft.range_km).toLocaleString()} km)`;

      document.getElementById('rf_ac_det_make').textContent = currentAircraft.manufacturer || '—';
      document.getElementById('rf_ac_det_payload').textContent = `${currentAircraft.payload_ton || 0} T`;
      document.getElementById('rf_ac_det_price').textContent = `$${Number(currentAircraft.price || 0).toLocaleString()}`;
      document.getElementById('rf_ac_det_fuel').textContent = `${currentAircraft.fuel_consumption || '—'} L/100km`;
      document.getElementById('rf_ac_det_wear').textContent = `${currentAircraft.wear_rate || '—'}% / 100h`;

      const minCatSelect = document.getElementById('rf_cat_min');
      minCatSelect.value = Math.max(1, currentAircraft.category);
      document.getElementById('cat_filter_hint').textContent = `Min Cat ${currentAircraft.category} (${currentAircraft.name})`;

      // Dynamically update round-trip duration limits and default to max for chosen aircraft
      rf_updateDurationLimitsForAircraft(currentAircraft, resetDuration);

      rf_validateHubRunwayCompatibility();

      if (currentCircuitLegs.length > 0) {
        currentCircuitLegs.forEach(leg => {
          leg.durationHours = calculateFlightTimeHours(leg.distanceKm, currentAircraft.speed_kmh);
          leg.durationText = formatHoursMinutes(leg.durationHours);
        });
        rf_updateCircuitUI();
      }

      rf_saveStateToLocalStorage();
    }

    function rf_toggleAircraftCombobox() {
      if (isComboboxOpen) rf_closeAircraftCombobox();
      else rf_openAircraftCombobox();
    }

    function rf_openAircraftCombobox() {
      isComboboxOpen = true;
      document.getElementById('rf_combobox_popover').classList.remove('hidden');
      document.getElementById('rf_combobox_chevron').classList.add('rotate-180');
      rf_renderAircraftComboboxList();
      setTimeout(() => {
        document.getElementById('rf_combobox_search')?.focus();
      }, 50);
    }

    function rf_closeAircraftCombobox() {
      isComboboxOpen = false;
      document.getElementById('rf_combobox_popover').classList.add('hidden');
      document.getElementById('rf_combobox_chevron').classList.remove('rotate-180');
    }

    function rf_setComboboxHaul(haul) {
      comboboxHaulFilter = haul;
      document.querySelectorAll('.cb-haul-btn').forEach(btn => {
        if (btn.getAttribute('data-val') === haul) {
          btn.className = 'cb-haul-btn px-2 py-0.5 rounded bg-cyan-600 text-white font-medium';
        } else {
          btn.className = 'cb-haul-btn px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium';
        }
      });
      rf_renderAircraftComboboxList();
    }

    function rf_clearAircraftComboboxSearch() {
      const searchInput = document.getElementById('rf_combobox_search');
      if (searchInput) searchInput.value = '';
      document.getElementById('rf_combobox_clear_btn')?.classList.add('hidden');
      rf_renderAircraftComboboxList();
    }

    function rf_renderAircraftComboboxList() {
      if (typeof AIRCRAFT_DATABASE === 'undefined') return;
      const searchVal = document.getElementById('rf_combobox_search')?.value.trim().toLowerCase() || '';
      const clearBtn = document.getElementById('rf_combobox_clear_btn');
      if (searchVal) clearBtn?.classList.remove('hidden');
      else clearBtn?.classList.add('hidden');

      const filtered = AIRCRAFT_DATABASE.filter(a => {
        if (comboboxHaulFilter !== 'all' && a.type !== comboboxHaulFilter) return false;
        if (searchVal) {
          const match = a.name.toLowerCase().includes(searchVal) ||
                        a.manufacturer.toLowerCase().includes(searchVal) ||
                        a.id.toLowerCase().includes(searchVal);
          if (!match) return false;
        }
        return true;
      });

      document.getElementById('rf_combobox_match_count').textContent = `${filtered.length} aircraft`;

      const listEl = document.getElementById('rf_combobox_list');
      if (filtered.length === 0) {
        listEl.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">No aircraft match your search</div>`;
        return;
      }

      listEl.innerHTML = filtered.map(a => {
        const isSelected = currentAircraft && currentAircraft.id === a.id;
        return `
          <div onclick="rf_selectAircraftFromCombobox('${a.id}')" class="px-3 py-2 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between text-xs ${isSelected ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-200'}">
            <div class="min-w-0 pr-2">
              <div class="font-bold flex items-center gap-1.5 truncate">
                <span>${a.name}</span>
                <span class="text-[10px] text-slate-400 font-normal">(${a.manufacturer})</span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono-num truncate">
                ${a.seats} seats &bull; ${a.speed_kmh} km/h &bull; ${Number(a.range_km).toLocaleString()} km
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">Cat ${a.category}</span>
              ${isSelected ? `<span class="text-cyan-400 font-bold">&check;</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    function rf_selectAircraftFromCombobox(id) {
      rf_setAircraftById(id);
      rf_closeAircraftCombobox();
      rf_refreshAll();
      showToast(`Selected ${currentAircraft.name}`, 'success');
    }

    function rf_toggleAcDetails() {
      isShowingAcDetails = !isShowingAcDetails;
      const detailsEl = document.getElementById('rf_ac_full_details');
      const btn = document.getElementById('ac_details_toggle_btn');
      if (isShowingAcDetails) {
        detailsEl.classList.remove('hidden');
        btn.textContent = 'Hide Details';
      } else {
        detailsEl.classList.add('hidden');
        btn.textContent = 'Show Details';
      }
    }

    function rf_openAircraftModal() {
      document.getElementById('rf_ac_modal_backdrop').classList.remove('hidden');
      rf_renderAircraftModalContent();
      setTimeout(() => {
        document.getElementById('rf_ac_modal_search')?.focus();
      }, 60);
    }

    function rf_closeAircraftModal() {
      document.getElementById('rf_ac_modal_backdrop').classList.add('hidden');
    }

    function rf_handleAircraftModalBackdropClick(e) {
      if (e.target.id === 'rf_ac_modal_backdrop') rf_closeAircraftModal();
    }

    function rf_renderAircraftModalContent() {
      if (typeof AIRCRAFT_DATABASE === 'undefined') return;
      const searchVal = document.getElementById('rf_ac_modal_search')?.value.trim().toLowerCase() || '';
      const haulVal = document.getElementById('rf_ac_modal_haul')?.value || 'all';
      const sortVal = document.getElementById('rf_ac_modal_sort')?.value || 'range_desc';

      let list = AIRCRAFT_DATABASE.filter(a => {
        if (haulVal !== 'all' && a.type !== haulVal) return false;
        if (searchVal) {
          const match = a.name.toLowerCase().includes(searchVal) ||
                        a.manufacturer.toLowerCase().includes(searchVal) ||
                        a.id.toLowerCase().includes(searchVal);
          if (!match) return false;
        }
        return true;
      });

      list.sort((a, b) => {
        switch (sortVal) {
          case 'range_desc': return b.range_km - a.range_km;
          case 'range_asc': return a.range_km - b.range_km;
          case 'seats_desc': return b.seats - a.seats;
          case 'speed_desc': return b.speed_kmh - a.speed_kmh;
          case 'price_asc': return (a.price || 0) - (b.price || 0);
          case 'name_asc': return a.name.localeCompare(b.name);
          default: return b.range_km - a.range_km;
        }
      });

      document.getElementById('rf_ac_modal_count_badge').textContent = `${list.length} Aircraft`;

      const gridEl = document.getElementById('ac_modal_grid');
      if (list.length === 0) {
        gridEl.innerHTML = `<div class="col-span-full py-12 text-center text-xs text-slate-500">No aircraft match your filters</div>`;
        return;
      }

      gridEl.innerHTML = list.map(a => {
        const isSelected = currentAircraft && currentAircraft.id === a.id;
        return `
          <div onclick="rf_selectAircraftFromModal('${a.id}')" class="p-3 rounded-xl border ${isSelected ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'} transition cursor-pointer flex flex-col justify-between space-y-2.5">
            <div class="flex items-start justify-between gap-1">
              <div>
                <span class="text-xs font-bold text-white block">${a.name}</span>
                <span class="text-[10px] text-slate-400">${a.manufacturer} &bull; ${a.type}</span>
              </div>
              <span class="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono text-[10px] font-bold">Cat ${a.category}</span>
            </div>

            <div class="grid grid-cols-3 gap-1 text-[10px] bg-slate-950/60 p-2 rounded-lg font-mono-num">
              <div><span class="text-slate-500 block">Range</span><span class="font-bold text-white">${Number(a.range_km).toLocaleString()} km</span></div>
              <div><span class="text-slate-500 block">Speed</span><span class="font-bold text-white">${a.speed_kmh} km/h</span></div>
              <div><span class="text-slate-500 block">Seats</span><span class="font-bold text-cyan-300">${a.seats}</span></div>
            </div>

            <button type="button" class="w-full py-1 rounded-lg text-xs font-semibold ${isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} transition">
              ${isSelected ? 'Current Active Plane' : 'Select Aircraft'}
            </button>
          </div>
        `;
      }).join('');
    }

    function rf_selectAircraftFromModal(id) {
      rf_setAircraftById(id);
      rf_closeAircraftModal();
      rf_refreshAll();
      showToast(`Selected ${currentAircraft.name}`, 'success');
    }

    // =========================================================================
    // DEPARTURE HUB SELECTION ENGINE
    // =========================================================================
    function rf_initHubSelector() {
      if (typeof AIRPORTS_DATABASE === 'undefined') return;
      const countries = Array.from(new Set(AIRPORTS_DATABASE.map(a => a.country).filter(Boolean))).sort();
      const countrySelect = document.getElementById('rf_hub_country_select');
      countrySelect.innerHTML = `<option value="" disabled selected>Select Country...</option>` +
        countries.map(c => `<option value="${c}">${c}</option>`).join('');

      const airportSelect = document.getElementById('rf_hub_airport_select');
      if (airportSelect) {
        airportSelect.innerHTML = `<option value="" disabled selected>Select Airport...</option>`;
      }
    }

    function rf_populateHubAirportsForCountry(country) {
      const airportSelect = document.getElementById('rf_hub_airport_select');
      if (!country) {
        airportSelect.innerHTML = `<option value="" disabled selected>Select Airport...</option>`;
        return;
      }
      const airports = AIRPORTS_DATABASE.filter(a => a.country === country).sort((a,b) => a.name.localeCompare(b.name));
      airportSelect.innerHTML = `<option value="" disabled selected>Select Airport...</option>` +
        airports.map(a => `<option value="${a.iata}">${a.iata} - ${a.name} (Cat ${a.cat})</option>`).join('');
    }

    function rf_onHubCountryChange() {
      const country = document.getElementById('rf_hub_country_select').value;
      if (!country) return;
      rf_populateHubAirportsForCountry(country);
    }

    function rf_onHubAirportSelectChange() {
      const iata = document.getElementById('rf_hub_airport_select').value;
      if (iata) {
        rf_setHubByIata(iata);
        rf_refreshAll();
      }
    }

    function rf_onHubIataInput() {
      const input = document.getElementById('rf_hub_iata_input');
      const val = input.value.trim().toUpperCase();
      if (val.length === 0) {
        rf_clearHub();
        return;
      }
      if (val.length === 3) {
        const found = findAirport(val);
        if (found) {
          rf_setHubByIata(val);
          rf_refreshAll();
        } else {
          document.getElementById('rf_hub_valid_icon').innerHTML = `<span class="text-rose-400 font-bold">&times;</span>`;
          document.getElementById('rf_hub_display_name').textContent = 'Airport not found';
          document.getElementById('rf_hub_display_cat').textContent = 'Cat —';
          document.getElementById('rf_hub_display_location').textContent = 'Check spelling or enter a valid 3-letter IATA code';
          document.getElementById('rf_hub_display_tax').textContent = '—';
        }
      } else {
        document.getElementById('rf_hub_valid_icon').innerHTML = '';
      }
    }

    function rf_setQuickHub(iata) {
      rf_setHubByIata(iata);
      rf_refreshAll();
    }

    function rf_clearHub() {
      currentHub = null;
      candidatePool = [];
      filteredCandidates = [];

      const input = document.getElementById('rf_hub_iata_input');
      if (input) {
        input.value = '';
        input.placeholder = 'Please enter hub';
      }

      const validIcon = document.getElementById('rf_hub_valid_icon');
      if (validIcon) {
        validIcon.innerHTML = '';
      }

      const hubBadge = document.getElementById('header_hub_badge');
      if (hubBadge) {
        hubBadge.textContent = 'Please enter hub';
        hubBadge.className = 'font-bold text-slate-400 font-mono';
      }

      const nameEl = document.getElementById('rf_hub_display_name');
      if (nameEl) nameEl.textContent = 'Please enter hub';

      const catEl = document.getElementById('rf_hub_display_cat');
      if (catEl) catEl.textContent = 'Cat —';

      const locEl = document.getElementById('rf_hub_display_location');
      if (locEl) locEl.textContent = 'Enter an IATA code or pick a Quick Hub below';

      const taxEl = document.getElementById('rf_hub_display_tax');
      if (taxEl) taxEl.textContent = '—';

      const countrySelect = document.getElementById('rf_hub_country_select');
      if (countrySelect) countrySelect.value = '';
      const airportSelect = document.getElementById('rf_hub_airport_select');
      if (airportSelect) airportSelect.innerHTML = `<option value="" disabled selected>Select Airport...</option>`;

      const warningBanner = document.getElementById('hub_cat_warning_banner');
      if (warningBanner) warningBanner.classList.add('hidden');

      const summaryEl = document.getElementById('results_summary_text');
      if (summaryEl) summaryEl.textContent = 'Please enter a departure hub to view matching routes';

      document.querySelectorAll('#view_route_finder button[onclick^="rf_setQuickHub"]').forEach(btn => {
        btn.className = 'px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700';
      });

      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_setHubByIata(iata) {
      const found = findAirport(iata);
      if (!found) return;
      currentHub = found;

      document.getElementById('rf_hub_iata_input').value = found.iata;
      document.getElementById('rf_hub_valid_icon').innerHTML = `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;

      const hubBadge = document.getElementById('header_hub_badge');
      if (hubBadge) {
        hubBadge.textContent = `${found.iata} (Cat ${found.cat})`;
        hubBadge.className = 'font-bold text-cyan-400 font-mono';
      }
      document.getElementById('rf_hub_display_name').textContent = `${found.name} (${found.city})`;
      document.getElementById('rf_hub_display_cat').textContent = `Cat ${found.cat}`;
      document.getElementById('rf_hub_display_location').textContent = `${found.country} • ${found.lat.toFixed(2)}°, ${found.lon.toFixed(2)}°`;
      const hubDemand = rf_computeAirportDemandStats(found);
      const taxEl = document.getElementById('rf_hub_display_tax');
      if (taxEl) {
        taxEl.innerHTML = `<span class="text-amber-400 font-bold tracking-tight">${hubDemand.starsText}</span> <span class="text-slate-400 font-mono text-[10px]">(${hubDemand.avgFormatted})</span>`;
        taxEl.title = `Demand Index: ${hubDemand.avgFormatted} · ${hubDemand.label} (Eco: ${hubDemand.rawEco} · Bus: ${hubDemand.rawBus} · First: ${hubDemand.rawFirst})`;
      }

      const summaryEl = document.getElementById('results_summary_text');
      if (summaryEl) summaryEl.textContent = `Routes departing from ${found.iata} within range & runway category`;

      // Highlight active quick hub button
      document.querySelectorAll('#view_route_finder button[onclick^="rf_setQuickHub"]').forEach(btn => {
        const btnHub = btn.textContent.trim();
        if (btnHub === found.iata) {
          btn.className = 'px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[11px] border border-cyan-700 font-bold';
        } else {
          btn.className = 'px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] border border-slate-700';
        }
      });

      const countrySelect = document.getElementById('rf_hub_country_select');
      if (countrySelect && countrySelect.value !== found.country) {
        countrySelect.value = found.country;
        rf_populateHubAirportsForCountry(found.country);
      }
      const apSelect = document.getElementById('rf_hub_airport_select');
      if (apSelect) apSelect.value = found.iata;

      rf_validateHubRunwayCompatibility();

      if (currentCircuitLegs.length > 0) {
        currentCircuitLegs.forEach(leg => {
          const dstAirport = findAirport(leg.dstIata);
          if (dstAirport) {
            leg.distanceKm = calculateHaversineDistance(currentHub.lat, currentHub.lon, dstAirport.lat, dstAirport.lon);
            leg.durationHours = calculateFlightTimeHours(leg.distanceKm, currentAircraft.speed_kmh);
            leg.durationText = formatHoursMinutes(leg.durationHours);
          }
        });
        rf_updateCircuitUI();
      }

      rf_saveStateToLocalStorage();
    }

    function rf_setHubEntryMode(mode) {
      const quickContainer = document.getElementById('hub_entry_quick_container');
      const searchContainer = document.getElementById('hub_entry_search_container');
      const quickBtn = document.getElementById('hub_mode_quick_btn');
      const searchBtn = document.getElementById('hub_mode_search_btn');

      if (mode === 'quick') {
        quickContainer.classList.remove('hidden');
        searchContainer.classList.add('hidden');
        quickBtn.className = 'text-[10px] px-2 py-0.5 rounded font-semibold transition bg-cyan-950 text-cyan-400 border border-cyan-800';
        searchBtn.className = 'text-[10px] px-2 py-0.5 rounded font-semibold transition text-slate-400 hover:text-slate-200 border border-transparent';
      } else {
        quickContainer.classList.add('hidden');
        searchContainer.classList.remove('hidden');
        searchBtn.className = 'text-[10px] px-2 py-0.5 rounded font-semibold transition bg-cyan-950 text-cyan-400 border border-cyan-800';
        quickBtn.className = 'text-[10px] px-2 py-0.5 rounded font-semibold transition text-slate-400 hover:text-slate-200 border border-transparent';
      }
    }

    function rf_validateHubRunwayCompatibility() {
      const banner = document.getElementById('hub_cat_warning_banner');
      const text = document.getElementById('hub_cat_warning_text');
      if (!currentHub || !currentAircraft) return;

      if (currentHub.cat < currentAircraft.category) {
        text.textContent = `Hub ${currentHub.iata} has runway Category ${currentHub.cat}, but ${currentAircraft.name} requires Category ${currentAircraft.category}! This aircraft cannot operate from this hub.`;
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    // =========================================================================
    // CONTINENT & COUNTRY FILTER ENGINE (Added Continent filter!)
    // =========================================================================
    function rf_initCountryFilter(selectedContinent = 'ALL') {
      if (typeof AIRPORTS_DATABASE === 'undefined') return;
      const countrySelect = document.getElementById('rf_country_filter');
      const allCountries = Array.from(new Set(AIRPORTS_DATABASE.map(a => a.country).filter(Boolean))).sort();

      let eligibleCountries = allCountries;
      if (selectedContinent !== 'ALL') {
        eligibleCountries = allCountries.filter(c => CONTINENT_MAP[c] === selectedContinent);
      }

      document.getElementById('rf_country_count_badge').textContent = eligibleCountries.length;
      countrySelect.innerHTML = `<option value="ALL">All Countries (${eligibleCountries.length})</option>` +
        eligibleCountries.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    function rf_onContinentChange() {
      const selectedContinent = document.getElementById('rf_continent_filter').value;
      document.getElementById('rf_continent_hint').textContent = selectedContinent === 'ALL' ? 'All' : selectedContinent;
      rf_initCountryFilter(selectedContinent);
      rf_applyFilters();
    }

    // =========================================================================
    // MAIN SEARCH & FILTER COMPUTE ENGINE
    // =========================================================================
    function rf_refreshAll() {
      if (!currentHub) {
        candidatePool = [];
        filteredCandidates = [];
        rf_renderResults();
        return;
      }
      if (!currentAircraft || typeof AIRPORTS_DATABASE === 'undefined') return;

      const hubLat = currentHub.lat;
      const hubLon = currentHub.lon;
      const acRange = currentAircraft.range_km;
      const acSpeed = currentAircraft.speed_kmh;
      const acCat = currentAircraft.category;

      candidatePool = [];

      for (let i = 0; i < AIRPORTS_DATABASE.length; i++) {
        const dst = AIRPORTS_DATABASE[i];
        if (dst.iata === currentHub.iata) continue;
        if (dst.cat < acCat) continue;
        if (isNaN(dst.lat) || isNaN(dst.lon)) continue;

        const distanceKm = calculateHaversineDistance(hubLat, hubLon, dst.lat, dst.lon);
        if (distanceKm <= 0 || distanceKm > acRange) continue;

        const durationHours = calculateFlightTimeHours(distanceKm, acSpeed);
        const durationText = formatHoursMinutes(durationHours);
        const rangePercent = Math.min(100, Math.round((distanceKm / acRange) * 100));

        const fits24h = Math.abs(24 % durationHours) < 0.001 || [3, 4, 6, 8, 12, 24].includes(durationHours);
        const fits168h = Math.abs(168 % durationHours) < 0.001;
        const continent = CONTINENT_MAP[dst.country] || 'Other';
        const demand = rf_computeAirportDemandStats(dst);

        candidatePool.push({
          hubIata: currentHub.iata,
          dstIata: dst.iata,
          name: dst.name,
          city: dst.city,
          country: dst.country,
          continent: continent,
          category: dst.cat,
          demand,
          flightTax: dst.flightTax,
          distanceKm,
          durationHours,
          durationText,
          rangePercent,
          fits24h,
          fits168h,
          airport: dst
        });
      }

      rf_applyFilters();
    }

    function rf_applyFilters() {
      if (!candidatePool) return;

      const catMin = parseInt(document.getElementById('rf_cat_min')?.value) || 1;
      const catMax = parseInt(document.getElementById('rf_cat_max')?.value) || 10;

      const durMinHhEl = document.getElementById('rf_dur_min_hh');
      const durMinMmEl = document.getElementById('rf_dur_min_mm');
      const durMinHh = durMinHhEl && durMinHhEl.value !== '' ? parseInt(durMinHhEl.value, 10) : 0;
      const durMinMm = durMinMmEl && durMinMmEl.value !== '' ? parseInt(durMinMmEl.value, 10) : 0;
      const durMin = durMinHh + (durMinMm / 60);

      const durMaxHhEl = document.getElementById('rf_dur_max_hh');
      const durMaxMmEl = document.getElementById('rf_dur_max_mm');
      const durMaxHh = durMaxHhEl && durMaxHhEl.value !== '' ? parseInt(durMaxHhEl.value, 10) : 50;
      const durMaxMm = durMaxMmEl && durMaxMmEl.value !== '' ? parseInt(durMaxMmEl.value, 10) : 0;
      const durMax = durMaxHh + (durMaxMm / 60);

      const selectedContinent = document.getElementById('rf_continent_filter')?.value || 'ALL';
      const selectedCountry = document.getElementById('rf_country_filter')?.value || 'ALL';
      const query = tableSearchQuery.trim().toUpperCase();

      filteredCandidates = candidatePool.filter(c => {
        if (c.category < catMin || c.category > catMax) return false;
        if (c.durationHours < durMin - 0.0001 || c.durationHours > durMax + 0.0001) return false;

        if (currentDurationPreset === '24h_divisors' && !c.fits24h) return false;
        if (currentDurationPreset === 'short' && c.durationHours > 8) return false;
        if (currentDurationPreset === 'medium' && (c.durationHours <= 8 || c.durationHours > 16)) return false;
        if (currentDurationPreset === 'long' && (c.durationHours <= 16 || c.durationHours > 24)) return false;

        // Continent Filter
        if (selectedContinent !== 'ALL' && c.continent !== selectedContinent) return false;

        // Country Filter
        if (selectedCountry !== 'ALL' && c.country !== selectedCountry) return false;

        // Table Search Query (Search through table as requested!)
        if (query) {
          const match = c.dstIata.includes(query) ||
                        (c.city && c.city.toUpperCase().includes(query)) ||
                        (c.name && c.name.toUpperCase().includes(query)) ||
                        (c.country && c.country.toUpperCase().includes(query));
          if (!match) return false;
        }

        return true;
      });

      rf_sortCandidates();
      currentPage = 1;
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    // Table Search Input Handler (Prominent search right on table header!)
    function rf_onTableSearchInput(val) {
      tableSearchQuery = val;
      const clearBtn = document.getElementById('rf_clear_table_search_btn');
      if (val) clearBtn?.classList.remove('hidden');
      else clearBtn?.classList.add('hidden');
      rf_applyFilters();
    }

    function rf_clearTableSearch() {
      tableSearchQuery = '';
      const input = document.getElementById('rf_table_search');
      if (input) input.value = '';
      document.getElementById('rf_clear_table_search_btn')?.classList.add('hidden');
      rf_applyFilters();
      rf_saveStateToLocalStorage();
    }

    function rf_setDurationPreset(preset) {
      currentDurationPreset = preset;
      const buttons = ['any', '24h_divisors', 'short', 'medium', 'long'];
      buttons.forEach(b => {
        const el = document.getElementById(`dur_preset_${b === '24h_divisors' ? '24h' : b === 'medium' ? 'med' : b}`);
        if (!el) return;
        if (b === preset) {
          el.className = 'px-2 py-0.5 rounded text-[10px] font-semibold transition bg-cyan-950 text-cyan-300 border border-cyan-700';
        } else {
          el.className = 'px-2 py-0.5 rounded text-[10px] font-semibold transition bg-slate-800 text-slate-300 hover:text-white border border-slate-700';
        }
      });
      rf_applyFilters();
    }

    const sortOptionItems = [
      { value: 'dist_asc', label: 'Distance: Low to High' },
      { value: 'dist_desc', label: 'Distance: High to Low' },
      { value: 'dur_asc', label: 'Duration: Shortest First' },
      { value: 'dur_desc', label: 'Duration: Longest First' },
      { value: 'cat_desc', label: 'Category: High to Low' },
      { value: 'cat_asc', label: 'Category: Low to High' },
      { value: 'stars_desc', label: 'Demand Rating: High to Low' },
      { value: 'stars_asc', label: 'Demand Rating: Low to High' },
      { value: 'name_asc', label: 'Destination: A to Z' },
      { value: 'name_desc', label: 'Destination: Z to A' },
      { value: 'country_asc', label: 'Country: A to Z' },
      { value: 'country_desc', label: 'Country: Z to A' },
      { value: 'fit_desc', label: 'Circuit Fit: Best First' },
      { value: 'fit_asc', label: 'Circuit Fit: Least First' },
      { value: 'iata_asc', label: 'IATA Code: A to Z' }
    ];

    function rf_toggleSortDropdown(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      const menu = document.getElementById('rf_sort_menu');
      const chevron = document.getElementById('rf_sort_chevron');
      if (!menu) return;
      const isHidden = menu.classList.contains('hidden');
      if (isHidden) {
        rf_renderSortMenuItems();
        menu.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
      } else {
        rf_closeSortDropdown();
      }
    }

    function rf_closeSortDropdown() {
      const menu = document.getElementById('rf_sort_menu');
      const chevron = document.getElementById('rf_sort_chevron');
      if (menu) menu.classList.add('hidden');
      if (chevron) chevron.classList.remove('rotate-180');
    }

    function rf_renderSortMenuItems() {
      const container = document.getElementById('rf_sort_options_list');
      if (!container) return;
      container.innerHTML = sortOptionItems.map(item => {
        const isSelected = item.value === currentSort;
        return `
          <button type="button" onclick="rf_selectSortOption('${item.value}', '${item.label}')" class="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
            isSelected
              ? 'bg-cyan-950/80 text-cyan-300 font-semibold border border-cyan-800/60 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
          }">
            <span>${item.label}</span>
            ${isSelected ? `<svg class="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>` : ''}
          </button>
        `;
      }).join('');
    }

    function rf_selectSortOption(val, label) {
      currentSort = val;
      const select = document.getElementById('rf_sort_select');
      if (select) select.value = val;
      const labelEl = document.getElementById('rf_sort_label');
      if (labelEl) labelEl.textContent = label;
      rf_closeSortDropdown();
      rf_updateTableHeaderSortIndicators();
      rf_sortCandidates();
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_onSortChange() {
      currentSort = document.getElementById('rf_sort_select').value;
      const found = sortOptionItems.find(i => i.value === currentSort);
      const labelEl = document.getElementById('rf_sort_label');
      if (labelEl && found) labelEl.textContent = found.label;
      rf_updateTableHeaderSortIndicators();
      rf_sortCandidates();
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_sortByColumn(columnKey) {
      let nextSort = '';
      switch (columnKey) {
        case 'destination':
          nextSort = (currentSort === 'name_asc') ? 'name_desc' : 'name_asc';
          break;
        case 'country':
          nextSort = (currentSort === 'country_asc') ? 'country_desc' : 'country_asc';
          break;
        case 'category':
          nextSort = (currentSort === 'cat_desc') ? 'cat_asc' : 'cat_desc';
          break;
        case 'distance':
          nextSort = (currentSort === 'dist_asc') ? 'dist_desc' : 'dist_asc';
          break;
        case 'duration':
          nextSort = (currentSort === 'dur_asc') ? 'dur_desc' : 'dur_asc';
          break;
        case 'fit':
          nextSort = (currentSort === 'fit_desc') ? 'fit_asc' : 'fit_desc';
          break;
        case 'demand':
          nextSort = (currentSort === 'stars_desc') ? 'stars_asc' : 'stars_desc';
          break;
        default:
          return;
      }

      currentSort = nextSort;
      const select = document.getElementById('rf_sort_select');
      if (select) select.value = currentSort;
      const found = sortOptionItems.find(i => i.value === currentSort);
      const labelEl = document.getElementById('rf_sort_label');
      if (labelEl && found) labelEl.textContent = found.label;

      rf_updateTableHeaderSortIndicators();
      rf_sortCandidates();
      currentPage = 1;
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_updateTableHeaderSortIndicators() {
      const columnConfigs = [
        { key: 'destination', ascKey: 'name_asc', descKey: 'name_desc', altKeys: ['iata_asc'] },
        { key: 'country', ascKey: 'country_asc', descKey: 'country_desc' },
        { key: 'category', ascKey: 'cat_asc', descKey: 'cat_desc' },
        { key: 'distance', ascKey: 'dist_asc', descKey: 'dist_desc' },
        { key: 'duration', ascKey: 'dur_asc', descKey: 'dur_desc' },
        { key: 'fit', ascKey: 'fit_asc', descKey: 'fit_desc' },
        { key: 'demand', ascKey: 'stars_asc', descKey: 'stars_desc' }
      ];

      columnConfigs.forEach(col => {
        const th = document.getElementById(`rf_th_${col.key}`);
        const icon = document.getElementById(`rf_th_icon_${col.key}`);
        if (!th || !icon) return;

        const isAsc = currentSort === col.ascKey || (col.altKeys && col.altKeys.includes(currentSort));
        const isDesc = currentSort === col.descKey;
        const isActive = isAsc || isDesc;

        if (isActive) {
          th.classList.add('text-cyan-300', 'font-bold');
          th.classList.remove('text-slate-400');
          th.setAttribute('aria-sort', isAsc ? 'ascending' : 'descending');
          icon.className = 'text-[11px] text-cyan-400 font-bold ml-1 inline-block';
          icon.textContent = isAsc ? '▲' : '▼';
        } else {
          th.classList.remove('text-cyan-300', 'font-bold');
          th.classList.add('text-slate-400');
          th.setAttribute('aria-sort', 'none');
          icon.className = 'text-[10px] text-slate-600 group-hover:text-slate-300 font-mono ml-1 inline-block transition-colors';
          icon.textContent = '↕';
        }
      });
    }

    function rf_sortCandidates() {
      filteredCandidates.sort((a, b) => {
        switch (currentSort) {
          case 'dist_asc': return a.distanceKm - b.distanceKm;
          case 'dist_desc': return b.distanceKm - a.distanceKm;
          case 'dur_asc': return a.durationHours - b.durationHours || a.distanceKm - b.distanceKm;
          case 'dur_desc': return b.durationHours - a.durationHours || b.distanceKm - a.distanceKm;
          case 'cat_desc': return b.category - a.category || a.distanceKm - b.distanceKm;
          case 'cat_asc': return a.category - b.category || a.distanceKm - b.distanceKm;
          case 'stars_desc': return (b.demand?.avg || 0) - (a.demand?.avg || 0) || b.distanceKm - a.distanceKm;
          case 'stars_asc': return (a.demand?.avg || 0) - (b.demand?.avg || 0) || a.distanceKm - b.distanceKm;
          case 'name_asc': return (a.name || a.dstIata).localeCompare(b.name || b.dstIata) || a.dstIata.localeCompare(b.dstIata);
          case 'name_desc': return (b.name || b.dstIata).localeCompare(a.name || a.dstIata) || b.dstIata.localeCompare(a.dstIata);
          case 'country_asc': return (a.country || '').localeCompare(b.country || '') || (a.continent || '').localeCompare(b.continent || '') || a.dstIata.localeCompare(b.dstIata);
          case 'country_desc': return (b.country || '').localeCompare(a.country || '') || (b.continent || '').localeCompare(a.continent || '') || b.dstIata.localeCompare(a.dstIata);
          case 'fit_desc': {
            const scoreA = a.fits24h ? 2 : (a.fits168h ? 1 : 0);
            const scoreB = b.fits24h ? 2 : (b.fits168h ? 1 : 0);
            return scoreB - scoreA || a.distanceKm - b.distanceKm;
          }
          case 'fit_asc': {
            const scoreA = a.fits24h ? 2 : (a.fits168h ? 1 : 0);
            const scoreB = b.fits24h ? 2 : (b.fits168h ? 1 : 0);
            return scoreA - scoreB || a.distanceKm - b.distanceKm;
          }
          case 'iata_asc': return a.dstIata.localeCompare(b.dstIata);
          case 'tax_asc': return (a.flightTax || 0) - (b.flightTax || 0);
          default: return a.distanceKm - b.distanceKm;
        }
      });
    }

    function rf_setViewMode(mode) {
      viewMode = mode;
      const tableBtn = document.getElementById('view_table_btn');
      const gridBtn = document.getElementById('view_grid_btn');
      const tableContainer = document.getElementById('results_table_container');
      const gridContainer = document.getElementById('results_grid_container');

      if (mode === 'table') {
        tableContainer.classList.remove('hidden');
        gridContainer.classList.add('hidden');
        tableBtn.className = 'px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950 text-cyan-300 transition flex items-center gap-1';
        gridBtn.className = 'px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 transition flex items-center gap-1';
      } else {
        tableContainer.classList.add('hidden');
        gridContainer.classList.remove('hidden');
        gridBtn.className = 'px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-950 text-cyan-300 transition flex items-center gap-1';
        tableBtn.className = 'px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 transition flex items-center gap-1';
      }
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_onPageSizeChange() {
      pageSize = parseInt(document.getElementById('rf_page_size').value) || 50;
      currentPage = 1;
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_changePage(delta) {
      const maxPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
      currentPage = Math.min(maxPages, Math.max(1, currentPage + delta));
      rf_renderResults();
    }

    function rf_resetAllFilters() {
      // 1. Reset aircraft to default A380-800
      rf_setAircraftById('a380-800');

      // 2. Reset departure hub to "Please enter hub"
      rf_clearHub();

      // 3. Reset category filters for A380-800 (Cat 8 - 10)
      document.getElementById('rf_cat_min').value = currentAircraft ? Math.max(1, currentAircraft.category) : 8;
      document.getElementById('rf_cat_max').value = '10';
      const catHint = document.getElementById('cat_filter_hint');
      if (catHint && currentAircraft) {
        catHint.textContent = `Min Cat ${currentAircraft.category} (${currentAircraft.name})`;
      }

      // 4. Reset duration filters: min to 02:00, max dynamically kept from aircraft
      const minHhEl = document.getElementById('rf_dur_min_hh');
      const minMmEl = document.getElementById('rf_dur_min_mm');
      if (minHhEl) minHhEl.value = '2';
      if (minMmEl) minMmEl.value = '0';

      // 5. Reset geography filters
      document.getElementById('rf_continent_filter').value = 'ALL';
      document.getElementById('rf_continent_hint').textContent = 'All';
      rf_initCountryFilter('ALL');

      // 6. Reset search & presets
      rf_clearTableSearch();
      currentDurationPreset = 'any';
      currentSort = 'dist_asc';
      document.getElementById('rf_sort_select').value = 'dist_asc';
      const sortLabel = document.getElementById('rf_sort_label');
      if (sortLabel) sortLabel.textContent = 'Distance: Low to High';
      rf_setDurationPreset('any');
      rf_updateTableHeaderSortIndicators();

      rf_saveStateToLocalStorage();
      showToast('Filters reset (A380-800 default, please enter hub)', 'info');
    }

    // =========================================================================
    // BUILT-IN ACTIVE CIRCUIT VIEWER & TIMELINE ENGINE
    // =========================================================================
    function rf_addRouteToCircuit(iata) {
      const cand = candidatePool.find(c => c.dstIata === iata);
      if (!cand) return;

      const existingIdx = currentCircuitLegs.findIndex(l => l.dstIata === iata);
      if (existingIdx >= 0) {
        // Increment existing leg runs, but NEVER exceed target circuit hours (24h or 168h)
        const leg = currentCircuitLegs[existingIdx];
        const baseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
        const is24hCircuit = baseSingleSum <= 24;
        const targetHours = is24hCircuit ? 24 : 168;

        const otherScheduledHours = currentCircuitLegs
          .filter((_, idx) => idx !== existingIdx)
          .reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);

        const maxAllowed = Math.floor((targetHours - otherScheduledHours + 0.0001) / leg.durationHours);

        if (leg.flightsPerDay >= maxAllowed) {
          showToast(`Cannot add more runs for ${iata}: Circuit is capped at ${targetHours}h 00m (${leg.flightsPerDay}x max)`, 'warning');
          return;
        }

        leg.flightsPerDay += 1;
        showToast(`Incremented ${iata} to ${leg.flightsPerDay}x daily flights`, 'info');
      } else {
        const colorIdx = currentCircuitLegs.length % CIRCUIT_PALETTE.length;
        const newLeg = {
          dstIata: cand.dstIata,
          name: cand.name,
          city: cand.city,
          country: cand.country,
          category: cand.category,
          distanceKm: cand.distanceKm,
          durationHours: cand.durationHours,
          durationText: cand.durationText,
          flightsPerDay: 1,
          color: CIRCUIT_PALETTE[colorIdx]
        };

        if (currentCircuitLegs.length === 0) {
          // First route: auto-fill up to 24h if it fits in 24h
          if (newLeg.durationHours <= 24) {
            const maxFit = Math.max(1, Math.floor(24 / newLeg.durationHours));
            newLeg.flightsPerDay = maxFit;
            currentCircuitLegs.push(newLeg);
            showToast(`Added ${newLeg.dstIata} and populated daily timetable (${maxFit}x daily flights)`, 'success');
          } else {
            currentCircuitLegs.push(newLeg);
            showToast(`Added ${newLeg.dstIata} to circuit`, 'success');
          }
        } else {
          // Additional route being added
          const currentBaseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
          const wouldBe24h = (currentBaseSingleSum + newLeg.durationHours) <= 24;
          const targetHours = wouldBe24h ? 24 : 168;

          // If previously auto-filled (e.g. 1 route with multi-runs) and adding this new route would exceed targetHours,
          // reset existing legs down to 1x so both routes fit within the 24h schedule
          let currentTotalSched = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);
          if (currentTotalSched + newLeg.durationHours > targetHours) {
            if (currentBaseSingleSum + newLeg.durationHours <= targetHours) {
              currentCircuitLegs.forEach(l => { l.flightsPerDay = 1; });
              currentTotalSched = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);
            }
          }

          if (currentTotalSched + newLeg.durationHours > targetHours) {
            const freeHours = Math.max(0, targetHours - currentTotalSched);
            showToast(`Cannot add ${newLeg.dstIata} (${newLeg.durationText}): Only ${formatHoursMinutes(freeHours)} free in circuit.`, 'warning');
            return;
          }

          currentCircuitLegs.push(newLeg);
          showToast(`Added ${newLeg.dstIata} to circuit`, 'success');
        }
      }

      rf_updateCircuitUI();
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_removeRouteFromCircuit(iata) {
      currentCircuitLegs = currentCircuitLegs.filter(l => l.dstIata !== iata);
      currentCircuitLegs.forEach((l, idx) => {
        l.color = CIRCUIT_PALETTE[idx % CIRCUIT_PALETTE.length];
      });
      showToast(`Removed ${iata} from circuit`, 'info');
      rf_updateCircuitUI();
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_setLegFrequency(iata, count) {
      const leg = currentCircuitLegs.find(l => l.dstIata === iata);
      if (!leg) return;

      const baseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24hCircuit = baseSingleSum <= 24;
      const targetHours = is24hCircuit ? 24 : 168;

      const otherScheduledHours = currentCircuitLegs
        .filter(l => l.dstIata !== iata)
        .reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);

      const maxAllowed = Math.max(1, Math.floor((targetHours - otherScheduledHours + 0.0001) / leg.durationHours));
      leg.flightsPerDay = Math.max(1, Math.min(count, maxAllowed));
      rf_updateCircuitUI();
      rf_saveStateToLocalStorage();
    }

    function rf_changeLegFrequency(iata, delta) {
      const leg = currentCircuitLegs.find(l => l.dstIata === iata);
      if (!leg) return;

      const baseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24hCircuit = baseSingleSum <= 24;
      const targetHours = is24hCircuit ? 24 : 168;

      const otherScheduledHours = currentCircuitLegs
        .filter(l => l.dstIata !== iata)
        .reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);

      const maxAllowed = Math.floor((targetHours - otherScheduledHours + 0.0001) / leg.durationHours);

      if (delta > 0) {
        if (leg.flightsPerDay >= maxAllowed) {
          showToast(`Cannot exceed ${targetHours}h schedule (${maxAllowed}x is maximum for ${iata})`, 'warning');
          return;
        }
        leg.flightsPerDay = Math.min(maxAllowed, leg.flightsPerDay + delta);
      } else {
        leg.flightsPerDay = Math.max(1, leg.flightsPerDay + delta);
      }

      rf_updateCircuitUI();
      rf_saveStateToLocalStorage();
    }

    function rf_clearCurrentCircuit() {
      if (currentCircuitLegs.length === 0) return;
      currentCircuitLegs = [];
      rf_updateCircuitUI();
      rf_renderResults();
      rf_saveStateToLocalStorage();
      showToast('Cleared circuit timetable', 'info');
    }

    // Timeline View Mode: 'week' (7-Day Schedule) or 'bar' (Daily/Summary Bar)
    function rf_setTimelineViewMode(mode) {
      rf_timelineViewMode = mode;
      rf_updateCircuitUI();
      rf_saveStateToLocalStorage();
    }

    // Full-page circuit renderer + compact mirror (the compact layer reads the same state,
    // so both views are redrawn from the single update cycle).
    function rf_updateCircuitUI() {
      rf_updateCircuitUIStandard();
      rf_renderCompact();
    }

    function rf_updateCircuitUIStandard() {
      const legCount = currentCircuitLegs.length;
      const circuitBadge = document.getElementById('header_circuit_count');
      if (circuitBadge) circuitBadge.textContent = `${legCount} routes`;
      document.getElementById('circuit_leg_count_badge').textContent = `${legCount} routes`;

      const emptyPrompt = document.getElementById('circuit_empty_prompt');
      const legsContainer = document.getElementById('circuit_legs_container');
      const timelineBar = document.getElementById('circuit_visual_timeline_bar');
      const weeklyContainer = document.getElementById('circuit_weekly_timeline_container');
      const barContainer = document.getElementById('circuit_bar_timeline_container');
      const weekRows = document.getElementById('circuit_timeline_week_rows');
      const btnWeek = document.getElementById('rf_btn_view_week');
      const btnBar = document.getElementById('rf_btn_view_bar');

      if (legCount === 0) {
        emptyPrompt.classList.remove('hidden');
        legsContainer.innerHTML = '';
        if (weeklyContainer) weeklyContainer.classList.add('hidden');
        if (barContainer) barContainer.classList.remove('hidden');
        timelineBar.innerHTML = `<div class="w-full h-full timeline-striped rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-mono">No flights scheduled &bull; 24h 00m free time</div>`;

        const btnFillGap = document.getElementById('btn_rf_fill_gap');
        const drawer = document.getElementById('rf_gap_drawer');
        if (btnFillGap) btnFillGap.classList.add('hidden');
        if (drawer) drawer.classList.add('hidden');
        
        const ticksEl = document.getElementById('circuit_bar_ticks');
        if (ticksEl) {
          ticksEl.className = 'grid grid-cols-6 text-[9px] font-mono text-slate-500 px-1 pt-0.5';
          ticksEl.innerHTML = `
            <div>00:00</div>
            <div class="text-center">04:00</div>
            <div class="text-center">08:00</div>
            <div class="text-center">12:00</div>
            <div class="text-center">16:00</div>
            <div class="text-right">24:00</div>
          `;
        }

        document.getElementById('circuit_type_badge').textContent = '24h Circuit';
        document.getElementById('circuit_type_badge').className = 'px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold font-mono uppercase';
        document.getElementById('circuit_stat_used_time').textContent = '0h 00m';
        document.getElementById('circuit_stat_target_time').textContent = '24h 00m';
        document.getElementById('circuit_stat_free_time').textContent = '24h 00m';
        document.getElementById('circuit_utilization_badge').textContent = '0% Utilized';
        document.getElementById('circuit_utilization_badge').className = 'px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono';
        return;
      }

      emptyPrompt.classList.add('hidden');

      const baseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24hCircuit = baseSingleSum <= 24;
      const targetHours = is24hCircuit ? 24 : 168;

      let totalScheduledHours = 0;
      currentCircuitLegs.forEach(l => {
        totalScheduledHours += l.durationHours * l.flightsPerDay;
      });

      const freeHours = Math.max(0, targetHours - totalScheduledHours);
      const utilizationPercent = Math.min(100, Math.round((totalScheduledHours / targetHours) * 100));

      const typeBadge = document.getElementById('circuit_type_badge');
      if (is24hCircuit) {
        typeBadge.textContent = '24h Daily Circuit';
        typeBadge.className = 'px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold font-mono uppercase';
        document.getElementById('circuit_stat_target_time').textContent = '24h 00m';
        document.getElementById('circuit_timeline_scale_text').textContent = '00:00 → 24:00 (15m granularity)';
      } else {
        typeBadge.textContent = '168h Weekly Circuit';
        typeBadge.className = 'px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold font-mono uppercase';
        document.getElementById('circuit_stat_target_time').textContent = '168h 00m';
        document.getElementById('circuit_timeline_scale_text').textContent = 'Mon 00:00 → Sun 24:00 (168h Week)';
      }

      document.getElementById('circuit_stat_used_time').textContent = formatHoursMinutes(totalScheduledHours);
      document.getElementById('circuit_stat_free_time').textContent = formatHoursMinutes(freeHours);
      
      const utilBadge = document.getElementById('circuit_utilization_badge');
      utilBadge.textContent = `${utilizationPercent}% Utilized`;
      if (utilizationPercent >= 90) {
        utilBadge.className = 'px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold';
      } else if (utilizationPercent >= 50) {
        utilBadge.className = 'px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold';
      } else {
        utilBadge.className = 'px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold';
      }

      // Manage Fill Remaining Gap Button & Drawer Sync
      const btnFillGap = document.getElementById('btn_rf_fill_gap');
      const btnFillGapText = document.getElementById('btn_rf_fill_gap_text');
      const drawer = document.getElementById('rf_gap_drawer');

      if (freeHours > 0.25) {
        if (btnFillGap) {
          btnFillGap.classList.remove('hidden');
          if (btnFillGapText) {
            btnFillGapText.textContent = `⚡ Fill Remaining (${formatHoursMinutes(freeHours)})`;
          }
        }
        if (drawer && !drawer.classList.contains('hidden')) {
          rf_renderGapSuggestions();
        }
      } else {
        if (btnFillGap) btnFillGap.classList.add('hidden');
        if (drawer) drawer.classList.add('hidden');
      }

      // Determine active timeline visualization view:
      // For 168h: default to 'week' (shows the full 7-day week)
      // For 24h: default to 'bar' (single 24h day bar)
      const activeView = rf_timelineViewMode || (is24hCircuit ? 'bar' : 'week');

      // Update View Switcher Buttons
      if (btnBar) {
        btnBar.textContent = is24hCircuit ? '⏱️ Daily Bar' : '▬ Summary Bar';
      }
      if (btnWeek && btnBar) {
        if (activeView === 'week') {
          btnWeek.className = 'px-2 py-0.5 rounded transition font-bold bg-cyan-950 text-cyan-300 border border-cyan-800';
          btnBar.className = 'px-2 py-0.5 rounded transition text-slate-400 hover:text-white border border-transparent';
        } else {
          btnWeek.className = 'px-2 py-0.5 rounded transition text-slate-400 hover:text-white border border-transparent';
          btnBar.className = 'px-2 py-0.5 rounded transition font-bold bg-cyan-950 text-cyan-300 border border-cyan-800';
        }
      }

      // Safety clamp: ensure no leg exceeds targetHours
      currentCircuitLegs.forEach((leg, idx) => {
        const otherHours = currentCircuitLegs
          .filter((_, lIdx) => lIdx !== idx)
          .reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);
        const maxFitForLeg = Math.max(1, Math.floor((targetHours - otherHours + 0.0001) / leg.durationHours));
        if (leg.flightsPerDay > maxFitForLeg) {
          leg.flightsPerDay = maxFitForLeg;
        }
      });

      // Recalculate totalScheduledHours after safety clamp
      totalScheduledHours = 0;
      currentCircuitLegs.forEach(l => {
        totalScheduledHours += l.durationHours * l.flightsPerDay;
      });
      const finalFreeHours = Math.max(0, targetHours - totalScheduledHours);

      document.getElementById('circuit_stat_used_time').textContent = formatHoursMinutes(totalScheduledHours);
      document.getElementById('circuit_stat_free_time').textContent = formatHoursMinutes(finalFreeHours);

      // Render Route Cards
      const activeHubIata = currentHub ? currentHub.iata : 'HUB';
      legsContainer.innerHTML = currentCircuitLegs.map((leg, idx) => {
        const totalLegHours = leg.durationHours * leg.flightsPerDay;
        const isOnlyRouteIn24h = legCount === 1 && is24hCircuit;
        const otherScheduledHours = currentCircuitLegs
          .filter((_, lIdx) => lIdx !== idx)
          .reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);
        const maxFit = Math.max(1, Math.floor((targetHours - otherScheduledHours + 0.0001) / leg.durationHours));
        const canIncrement = leg.flightsPerDay < maxFit;
        const canDecrement = leg.flightsPerDay > 1;

        let quickFrequencyButtonsHtml = '';
        if (isOnlyRouteIn24h && maxFit > 1) {
          const quickOptions = [];
          for (let f = 1; f <= Math.min(6, maxFit); f++) {
            quickOptions.push(f);
          }
          quickFrequencyButtonsHtml = `
            <div class="flex items-center gap-1 mt-1 flex-wrap">
              <span class="text-[10px] text-slate-400 mr-1">Quick Select Daily Runs:</span>
              ${quickOptions.map(f => `
                <button type="button" onclick="rf_setLegFrequency('${leg.dstIata}', ${f})" class="px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${leg.flightsPerDay === f ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}">
                  ${f}x (${formatHoursMinutes(leg.durationHours * f)})
                </button>
              `).join('')}
              ${maxFit > 1 && !quickOptions.includes(maxFit) ? `
                <button type="button" onclick="rf_setLegFrequency('${leg.dstIata}', ${maxFit})" class="px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${leg.flightsPerDay === maxFit ? 'bg-cyan-600 text-white' : 'bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900'}">
                  Fill Day (${maxFit}x)
                </button>
              ` : ''}
            </div>
          `;
        }

        return `
          <div class="p-3 rounded-xl bg-slate-900/80 border ${leg.color.borderCol} shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br ${leg.color.bg} text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm shrink-0">
                ${idx + 1}
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-white font-mono text-sm">${activeHubIata} ✈ ${leg.dstIata}</span>
                  <span class="text-xs text-slate-300 font-medium">${leg.name}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">Cat ${leg.category}</span>
                  <span class="text-[10px] text-slate-400 font-mono">(${Number(leg.distanceKm).toLocaleString()} km)</span>
                </div>
                <div class="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Single Round-Trip: <strong class="text-cyan-300 font-mono">${leg.durationText}</strong></span>
                  <span>&bull;</span>
                  <span>Total Scheduled: <strong class="text-white font-mono">${formatHoursMinutes(totalLegHours)}</strong></span>
                </div>
                ${quickFrequencyButtonsHtml}
              </div>
            </div>

            <div class="flex items-center gap-3 self-end md:self-center shrink-0">
              <div class="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                <button type="button" onclick="rf_changeLegFrequency('${leg.dstIata}', -1)" ${!canDecrement ? 'disabled' : ''} class="w-6 h-6 rounded flex items-center justify-center ${!canDecrement ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'} font-bold transition" title="${!canDecrement ? 'Minimum 1 run' : 'Decrease daily runs'}">&minus;</button>
                <span class="px-2 font-mono font-bold text-cyan-300 text-xs">${leg.flightsPerDay}x</span>
                <button type="button" onclick="rf_changeLegFrequency('${leg.dstIata}', 1)" ${!canIncrement ? 'disabled' : ''} class="w-6 h-6 rounded flex items-center justify-center ${!canIncrement ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white hover:bg-slate-800'} font-bold transition" title="${!canIncrement ? `Maximum ${maxFit}x runs reached (${targetHours}h schedule limit)` : 'Add daily run'}">&plus;</button>
              </div>

              <button type="button" onclick="rf_removeRouteFromCircuit('${leg.dstIata}')" class="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 border border-transparent hover:border-rose-900 transition" title="Remove route">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // =========================================================================
      // TIMELINE VISUALIZATION RENDERING
      // =========================================================================
      if (activeView === 'week') {
        if (weeklyContainer) weeklyContainer.classList.remove('hidden');
        if (barContainer) barContainer.classList.add('hidden');

        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let weekHtml = '';

        dayNames.forEach((dayName, dayIdx) => {
          let guideLinesHtml = '';
          for (let h = 1; h < 24; h++) {
            guideLinesHtml += `<div class="timeline-hour-guide" style="left: ${(h / 24) * 100}%"></div>`;
          }

          let flightBlocksHtml = '';

          if (is24hCircuit) {
            // For 24h circuit: repeat the daily timetable across every day
            const dailySchedule = [];
            const maxFlights = Math.max(...currentCircuitLegs.map(l => l.flightsPerDay || 1));
            for (let f = 0; f < maxFlights; f++) {
              currentCircuitLegs.forEach(leg => {
                if (f < (leg.flightsPerDay || 1)) dailySchedule.push(leg);
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
                const flag = (typeof getCountryFlag === 'function') ? getCountryFlag(leg.country) : '✈️';
                const startH = Math.floor(start);
                const startM = Math.round((start % 1) * 60);
                const endH = Math.floor(end);
                const endM = Math.round((end % 1) * 60);
                const timeLabel = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                const bgGrad = leg.color?.bg ? `bg-gradient-to-r ${leg.color.bg}` : 'bg-cyan-700';
                const borderCol = leg.color?.borderCol ? `border ${leg.color.borderCol}` : 'border border-cyan-500';

                flightBlocksHtml += `
                  <div class="timeline-flight-block ${bgGrad} ${borderCol}"
                       style="left: ${leftPct}%; width: ${widthPct}%;"
                       title="${activeHubIata} ➔ ${leg.dstIata} (${leg.name || ''}) | ${dayName} ${timeLabel} (${leg.durationText})">
                    <span class="truncate font-mono">${activeHubIata} ✈ ${leg.dstIata}</span>
                    <span class="text-[10px] hidden sm:inline">${flag}</span>
                    ${widthPct >= 14 ? `<span class="text-[9px] opacity-80 font-mono hidden md:inline">${leg.durationText}</span>` : ''}
                  </div>
                `;
              }
            });
          } else {
            // For 168h circuit: continuous sequential rotation across the whole 168h week
            const dayStart = 24 * dayIdx;
            const dayEnd = 24 * (dayIdx + 1);

            let curTime = 0;
            currentCircuitLegs.forEach(leg => {
              const reps = leg.flightsPerDay || 1;
              for (let rep = 0; rep < reps; rep++) {
                const dur = leg.durationHours || 0;
                const routeStart = curTime;
                const routeEnd = curTime + dur;
                curTime = routeEnd;

                const segStart = Math.max(dayStart, routeStart);
                const segEnd = Math.min(dayEnd, routeEnd);

                if (segStart < segEnd) {
                  const leftPct = ((segStart - dayStart) / 24) * 100;
                  const widthPct = ((segEnd - segStart) / 24) * 100;
                  const flag = (typeof getCountryFlag === 'function') ? getCountryFlag(leg.country) : '✈️';
                  const isContinuation = routeStart < dayStart;
                  const willContinue = routeEnd > dayEnd;

                  const segStartH = Math.floor(segStart - dayStart);
                  const segStartM = Math.round(((segStart - dayStart) % 1) * 60);
                  const segEndH = Math.floor(segEnd - dayStart);
                  const segEndM = Math.round(((segEnd - dayStart) % 1) * 60);
                  const startClock = `${String(segStartH).padStart(2, '0')}:${String(segStartM).padStart(2, '0')}`;
                  const endClock = (segEnd === dayEnd && willContinue) ? '24:00' : `${String(segEndH).padStart(2, '0')}:${String(segEndM).padStart(2, '0')}`;
                  const segDurText = formatHoursMinutes(segEnd - segStart);

                  const bgGrad = leg.color?.bg ? `bg-gradient-to-r ${leg.color.bg}` : 'bg-cyan-700';
                  const borderCol = leg.color?.borderCol ? `border ${leg.color.borderCol}` : 'border border-cyan-500';

                  const prevDayName = dayNames[(dayIdx + 6) % 7];
                  const nextDayName = dayNames[(dayIdx + 1) % 7];
                  const contNote = isContinuation ? ` [Continued from ${prevDayName}]` : '';
                  const willContNote = willContinue ? ` [Continues into ${nextDayName}]` : '';
                  const title = `${activeHubIata} ➔ ${leg.dstIata} (${leg.name || leg.city || ''}) | Total RT: ${leg.durationText} | ${dayName} ${startClock} - ${endClock} (${segDurText})${contNote}${willContNote}`;

                  flightBlocksHtml += `
                    <div class="timeline-flight-block ${bgGrad} ${borderCol}"
                         style="left: ${leftPct}%; width: ${widthPct}%;"
                         title="${title}">
                      ${isContinuation ? '<span class="text-[9px] opacity-75 font-mono">&larr;</span>' : ''}
                      <span class="truncate font-mono">${activeHubIata} ✈ ${leg.dstIata}</span>
                      <span class="text-[10px] hidden sm:inline">${flag}</span>
                      ${widthPct >= 14 ? `<span class="text-[9px] opacity-80 font-mono hidden md:inline">${leg.durationText}</span>` : ''}
                      ${willContinue ? '<span class="text-[9px] opacity-75 font-mono">&rarr;</span>' : ''}
                    </div>
                  `;
                }
              }
            });
          }

          weekHtml += `
            <div class="grid grid-cols-25 gap-0 items-center">
              <div class="text-xs font-mono font-bold text-slate-400 text-center">${dayName}</div>
              <div class="col-span-24 timeline-day-track">
                ${guideLinesHtml}
                ${flightBlocksHtml}
              </div>
            </div>
          `;
        });

        if (weekRows) weekRows.innerHTML = weekHtml;

      } else {
        // Bar View (Daily Bar for 24h or Summary Bar for 168h)
        if (barContainer) barContainer.classList.remove('hidden');
        if (weeklyContainer) weeklyContainer.classList.add('hidden');

        let timelineBlocks = [];
        let currentClockMinutes = 0;

        currentCircuitLegs.forEach((leg, legIdx) => {
          for (let rep = 0; rep < leg.flightsPerDay; rep++) {
            const legMinutes = leg.durationHours * 60;
            const startHours = Math.floor(currentClockMinutes / 60);
            const startMins = Math.round(currentClockMinutes % 60);
            const endTotalMins = currentClockMinutes + legMinutes;
            const endHours = Math.floor(endTotalMins / 60);
            const endMins = Math.round(endTotalMins % 60);

            const timeLabel = `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')} - ${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
            const widthPct = Math.min(100, (leg.durationHours / targetHours) * 100);

            timelineBlocks.push(`
              <div style="width: ${widthPct}%" class="h-full rounded-lg bg-gradient-to-r ${leg.color.bg} border ${leg.color.borderCol} p-1 text-white shadow-sm flex flex-col justify-center overflow-hidden transition-all group" title="${activeHubIata} ➔ ${leg.dstIata} (${leg.durationText}) | ${timeLabel}">
                <div class="font-mono font-bold text-[10px] leading-none truncate">${activeHubIata} ✈ ${leg.dstIata}</div>
                <div class="text-[9px] text-cyan-100 font-mono leading-none truncate mt-0.5 opacity-90">${leg.durationText}</div>
              </div>
            `);

            currentClockMinutes += legMinutes;
          }
        });

        if (freeHours > 0) {
          const freeWidthPct = Math.min(100, (freeHours / targetHours) * 100);
          timelineBlocks.push(`
            <div style="width: ${freeWidthPct}%" class="h-full rounded-lg timeline-striped border border-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-mono px-2 truncate" title="Free unallocated rotation time: ${formatHoursMinutes(freeHours)}">
              <span class="truncate">Free: ${formatHoursMinutes(freeHours)}</span>
            </div>
          `);
        }

        timelineBar.innerHTML = timelineBlocks.join('');

        // Dynamic tick ruler for bar view
        const ticksEl = document.getElementById('circuit_bar_ticks');
        if (ticksEl) {
          if (is24hCircuit) {
            ticksEl.className = 'grid grid-cols-6 text-[9px] font-mono text-slate-500 px-1 pt-0.5';
            ticksEl.innerHTML = `
              <div>00:00</div>
              <div class="text-center">04:00</div>
              <div class="text-center">08:00</div>
              <div class="text-center">12:00</div>
              <div class="text-center">16:00</div>
              <div class="text-right">24:00</div>
            `;
          } else {
            ticksEl.className = 'grid grid-cols-7 text-[9px] font-mono text-slate-400 px-1 pt-0.5';
            ticksEl.innerHTML = `
              <div>Mon 00:00</div>
              <div class="text-center">Tue</div>
              <div class="text-center">Wed</div>
              <div class="text-center">Thu</div>
              <div class="text-center">Fri</div>
              <div class="text-center">Sat</div>
              <div class="text-right">Sun 24:00</div>
            `;
          }
        }
      }
    }

    // =========================================================================
    // RENDERING ENGINE (Destination Results Table & Cards)
    // =========================================================================
    function rf_renderResults() {
      rf_renderResultsStandard();
      rf_renderCompact();
    }

    function rf_renderResultsStandard() {
      const total = filteredCandidates.length;
      document.getElementById('results_count_badge').textContent = `${Number(total).toLocaleString()} routes`;
      document.getElementById('page_total_text').textContent = Number(total).toLocaleString();

      const noMatchContainer = document.getElementById('no_matches_container');
      const tableContainer = document.getElementById('results_table_container');
      const gridContainer = document.getElementById('results_grid_container');
      const paginationContainer = document.getElementById('pagination_container');

      const titleEl = document.getElementById('no_matches_title');
      const resetBtn = document.getElementById('no_matches_reset_btn');

      if (!currentHub) {
        noMatchContainer.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        gridContainer.classList.add('hidden');
        paginationContainer.classList.add('hidden');

        if (titleEl) titleEl.textContent = 'Please Enter a Departure Hub';
        const diagEl = document.getElementById('no_matches_diagnostic_text');
        if (diagEl) {
          diagEl.textContent = `Enter an airport IATA code above (e.g. MPM, DXB, LHR, JFK) or pick a Quick Hub to discover compatible routes for the ${currentAircraft ? currentAircraft.name : 'aircraft'}.`;
        }
        if (resetBtn) resetBtn.classList.add('hidden');
        return;
      }

      if (resetBtn) resetBtn.classList.remove('hidden');
      if (titleEl) titleEl.textContent = 'No Matching Routes Found';

      if (total === 0) {
        noMatchContainer.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        gridContainer.classList.add('hidden');
        paginationContainer.classList.add('hidden');
        rf_updateNoMatchDiagnostic();
        return;
      }

      noMatchContainer.classList.add('hidden');
      paginationContainer.classList.remove('hidden');
      if (viewMode === 'table') tableContainer.classList.remove('hidden');
      else gridContainer.classList.remove('hidden');

      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = Math.min(total, startIdx + pageSize);
      const visibleCandidates = filteredCandidates.slice(startIdx, endIdx);

      document.getElementById('page_range_text').textContent = `${startIdx + 1} - ${endIdx}`;
      const totalPages = Math.ceil(total / pageSize) || 1;
      document.getElementById('page_current_pill').textContent = `${currentPage} / ${totalPages}`;
      document.getElementById('btn_prev_page').disabled = currentPage <= 1;
      document.getElementById('btn_next_page').disabled = currentPage >= totalPages;

      // Table View
      const tableBody = document.getElementById('results_table_body');
      tableBody.innerHTML = visibleCandidates.map(c => {
        const inCircuit = currentCircuitLegs.find(l => l.dstIata === c.dstIata);
        const circuitFitBadge = c.fits24h ? 
          `<span class="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">24h Fit</span>` :
          c.fits168h ?
          `<span class="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-semibold">168h Fit</span>` :
          `<span class="text-slate-500 text-[10px]">—</span>`;

        return `
          <tr class="hover:bg-slate-800/40 transition-colors ${inCircuit ? 'bg-cyan-950/20' : ''}">
            <td class="p-3">
              <div class="font-bold text-white flex items-center gap-1.5 font-mono">
                <span>${c.dstIata}</span>
                <span class="font-normal text-slate-300 text-xs truncate max-w-[180px]">${c.name}</span>
              </div>
              <div class="text-[10px] text-slate-400 font-sans truncate max-w-[220px]">${c.city || '—'}</div>
            </td>
            <td class="p-3">
              <div class="text-slate-300 truncate max-w-[140px] font-sans font-medium">${c.country}</div>
              <div class="text-[10px] text-slate-500 font-sans">${c.continent}</div>
            </td>
            <td class="p-3 text-center">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${c.category >= 8 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                Cat ${c.category}
              </span>
            </td>
            <td class="p-3 text-right">
              <div class="font-bold text-white font-mono">${Number(c.distanceKm).toLocaleString()} km</div>
              <div class="w-16 h-1 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                <div class="h-full bg-cyan-500 rounded-full" style="width: ${c.rangePercent}%"></div>
              </div>
            </td>
            <td class="p-3 text-right font-bold text-cyan-300 font-mono">${c.durationText}</td>
            <td class="p-3 text-center">${circuitFitBadge}</td>
            <td class="p-3 text-center font-sans">
              <div class="inline-flex items-center justify-center gap-1.5" title="Demand Index: ${c.demand.avgFormatted} · ${c.demand.label} (Eco: ${c.demand.rawEco} · Bus: ${c.demand.rawBus} · First: ${c.demand.rawFirst})">
                <span class="text-amber-400 font-bold tracking-tight text-xs">${c.demand.starsText}</span>
                <span class="text-slate-400 font-mono text-[11px]">(${c.demand.avgFormatted})</span>
                <span class="text-[10px] text-slate-500 hidden xl:inline">&bull; ${c.demand.label}</span>
              </div>
            </td>
            <td class="p-3 text-center">
              <button onclick="rf_addRouteToCircuit('${c.dstIata}')" class="px-3 py-1 rounded ${inCircuit ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800'} text-[11px] font-semibold transition flex items-center gap-1 mx-auto shadow-sm">
                ${inCircuit ? `
                  <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <span>In Circuit (${inCircuit.flightsPerDay}x)</span>
                ` : `
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  <span>Add to Circuit</span>
                `}
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Grid View
      const gridBody = document.getElementById('results_grid_container');
      gridBody.innerHTML = visibleCandidates.map(c => {
        const inCircuit = currentCircuitLegs.find(l => l.dstIata === c.dstIata);
        return `
          <div class="glass-card rounded-xl p-3.5 border ${inCircuit ? 'border-emerald-500/70 bg-emerald-950/20' : 'border-slate-800/80'} shadow-lg space-y-3 transition hover:border-slate-700">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-sm font-bold text-white font-mono">${c.dstIata}</span>
                <span class="text-xs text-slate-400 block truncate max-w-[160px]">${c.name}</span>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono ${c.category >= 8 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                Cat ${c.category}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
              <div>
                <span class="text-[9px] text-slate-400 block uppercase">Distance</span>
                <span class="font-bold text-white font-mono">${Number(c.distanceKm).toLocaleString()} km</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 block uppercase">Round-Trip Duration</span>
                <span class="font-bold text-cyan-300 font-mono">${c.durationText}</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 block uppercase">Country</span>
                <span class="text-slate-300 truncate block">${c.country} (${c.continent})</span>
              </div>
              <div>
                <span class="text-[9px] text-slate-400 block uppercase">Demand Rating</span>
                <div class="flex items-center gap-1 mt-0.5" title="Demand Index: ${c.demand.avgFormatted} · ${c.demand.label} (Eco: ${c.demand.rawEco} · Bus: ${c.demand.rawBus} · First: ${c.demand.rawFirst})">
                  <span class="text-amber-400 font-bold tracking-tight text-xs">${c.demand.starsText}</span>
                  <span class="text-slate-400 font-mono text-[10px]">(${c.demand.avgFormatted})</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1">
              <div>
                ${c.fits24h ? `<span class="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">24h Fit</span>` : ''}
              </div>
              <button onclick="rf_addRouteToCircuit('${c.dstIata}')" class="px-3 py-1 rounded ${inCircuit ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} font-semibold text-xs transition flex items-center gap-1">
                ${inCircuit ? `<span>In Circuit (${inCircuit.flightsPerDay}x)</span>` : `<span>+ Add to Circuit</span>`}
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    function rf_updateNoMatchDiagnostic() {
      const diagEl = document.getElementById('no_matches_diagnostic_text');
      if (!diagEl) return;
      if (!currentHub) {
        diagEl.textContent = `Enter an airport IATA code above (e.g. MPM, DXB, LHR, JFK) or pick a Quick Hub to discover compatible routes for the ${currentAircraft ? currentAircraft.name : 'aircraft'}.`;
        return;
      }
      if (!currentAircraft) return;

      if (currentHub.cat < currentAircraft.category) {
        diagEl.textContent = `Zero routes possible: Departure hub ${currentHub.iata} (Cat ${currentHub.cat}) cannot accommodate ${currentAircraft.name} (requires Cat ${currentAircraft.category}).`;
        return;
      }

      if (candidatePool.length === 0) {
        diagEl.textContent = `No airports within ${currentAircraft.name}'s max range (${Number(currentAircraft.range_km).toLocaleString()} km) meet Category ${currentAircraft.category} requirements.`;
        return;
      }

      diagEl.textContent = `Candidate pool has ${candidatePool.length} compatible routes, but active duration/category/continent/country/search filters narrowed matches to zero.`;
    }

    // =========================================================================
    // SAVE CIRCUIT & SAVED CIRCUITS LIBRARY ENGINE (Seat Config Integration)
    // =========================================================================
    const STORAGE_KEY = 'am_saved_circuits_v1';

    function rf_getSavedCircuitsFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch(e) {
        return [];
      }
    }

    function rf_saveCircuitsToStorage(circuits) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
        rf_updateSavedCircuitsCount();
      } catch(e) {
        console.error('Storage save error:', e);
      }
    }

    function rf_updateSavedCircuitsCount() {
      const circuits = rf_getSavedCircuitsFromStorage();
      const count = circuits.length;
      const countEl = document.getElementById('header_saved_circuits_count');
      if (countEl) countEl.textContent = count;
      const rfFloatEl = document.getElementById('rf_floating_saved_circuits_count');
      if (rfFloatEl) rfFloatEl.textContent = count;
      const scBadge = document.getElementById('saved_circuits_count_badge');
      if (scBadge) scBadge.textContent = count;
      document.querySelectorAll('.floating_circuits_badge').forEach(el => {
        el.textContent = count;
      });
      const modalCountEl = document.getElementById('saved_library_count_badge');
      if (modalCountEl) modalCountEl.textContent = `${count} Circuits`;
    }

    function rf_openSaveCircuitModal() {
      if (!currentHub) {
        showToast('Please select a departure hub first', 'warning');
        return;
      }
      if (currentCircuitLegs.length === 0) {
        showToast('Add at least one route to the circuit before saving', 'warning');
        return;
      }

      const baseSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24h = baseSum <= 24;
      const typeLabel = is24h ? '24h' : '168h';

      let totalSchedHours = 0;
      currentCircuitLegs.forEach(l => { totalSchedHours += l.durationHours * l.flightsPerDay; });

      const nameInput = document.getElementById('rf_save_circuit_name_input');
      nameInput.value = `${currentHub.iata} ${typeLabel} Circuit (${currentCircuitLegs.length} ${currentCircuitLegs.length === 1 ? 'Route' : 'Routes'})`;

      document.getElementById('rf_save_summary_hub').textContent = `${currentHub.iata} (${currentHub.name})`;
      document.getElementById('rf_save_summary_ac').textContent = `${currentAircraft.name}`;
      document.getElementById('rf_save_summary_dur').textContent = `${formatHoursMinutes(totalSchedHours)} (${is24h ? '24h Circuit' : '168h Circuit'})`;
      document.getElementById('rf_save_summary_routes').textContent = `${currentCircuitLegs.length} destinations (${currentCircuitLegs.reduce((s, l) => s + l.flightsPerDay, 0)} total flights)`;

      const chipsEl = document.getElementById('save_summary_chips');
      chipsEl.innerHTML = currentCircuitLegs.map(l => `
        <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[10px] text-cyan-300">
          ${l.dstIata} (${l.flightsPerDay}x)
        </span>
      `).join('');

      document.getElementById('rf_save_circuit_modal').classList.remove('hidden');
      setTimeout(() => nameInput.focus(), 60);
    }

    function rf_closeSaveCircuitModal() {
      document.getElementById('rf_save_circuit_modal').classList.add('hidden');
    }

    function rf_handleSaveModalBackdropClick(e) {
      if (e.target.id === 'rf_save_circuit_modal') rf_closeSaveCircuitModal();
    }

    function rf_executeSaveCircuit() {
      const name = document.getElementById('rf_save_circuit_name_input').value.trim() || `${currentHub.iata} Circuit`;
      const baseSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24h = baseSum <= 24;
      let totalSchedHours = 0;
      currentCircuitLegs.forEach(l => { totalSchedHours += l.durationHours * l.flightsPerDay; });

      const newCircuit = {
        id: 'circuit-' + Date.now(),
        name: name,
        createdDate: new Date().toISOString(),
        hub: currentHub.iata,
        hubCountry: currentHub.country,
        acId: currentAircraft.id,
        acName: currentAircraft.name,
        strategy: 'max_profit',
        fulfilledConfigs: {},
        summary: {
          totalDurationHours: totalSchedHours,
          totalDurationText: formatHoursMinutes(totalSchedHours),
          circuitType: is24h ? '24h' : '168h',
          routeCount: currentCircuitLegs.length
        },
        legs: currentCircuitLegs.map(l => ({
          dst: l.dstIata,
          name: l.name,
          city: l.city,
          country: l.country,
          distanceKm: l.distanceKm,
          durationHours: l.durationHours,
          flightsPerDay: l.flightsPerDay,
          demand: { eco: 2000, bus: 500, first: 100, cargo: 50 },
          prices: { eco: 2000, bus: 3500, first: 6500, cargo: 4000 }
        }))
      };

      const saved = rf_getSavedCircuitsFromStorage();
      saved.unshift(newCircuit);
      rf_saveCircuitsToStorage(saved);

      rf_closeSaveCircuitModal();
      showToast(`Saved circuit "${name}" successfully!`, 'success');
    }

    // Saved Circuits Library Modal
    function rf_openSavedCircuitsModal() {
      document.getElementById('saved_circuits_modal').classList.remove('hidden');
      rf_renderSavedCircuitsList();
      setTimeout(() => document.getElementById('rf_library_search_input')?.focus(), 60);
    }

    function rf_closeSavedCircuitsModal() {
      document.getElementById('saved_circuits_modal').classList.add('hidden');
    }

    function rf_handleSavedCircuitsBackdropClick(e) {
      if (e.target.id === 'saved_circuits_modal') rf_closeSavedCircuitsModal();
    }

    function rf_renderSavedCircuitsList() {
      const query = document.getElementById('rf_library_search_input')?.value.trim().toLowerCase() || '';
      const sort = document.getElementById('rf_library_sort_select')?.value || 'date_desc';

      let list = rf_getSavedCircuitsFromStorage();

      if (query) {
        list = list.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.hub.toLowerCase().includes(query) ||
          c.acName.toLowerCase().includes(query) ||
          c.legs.some(l => l.dst.toLowerCase().includes(query) || (l.name && l.name.toLowerCase().includes(query)))
        );
      }

      list.sort((a, b) => {
        switch (sort) {
          case 'name_asc': return a.name.localeCompare(b.name);
          case 'routes_desc': return b.legs.length - a.legs.length;
          case 'duration_desc': return (b.summary?.totalDurationHours || 0) - (a.summary?.totalDurationHours || 0);
          default: return new Date(b.createdDate || 0) - new Date(a.createdDate || 0);
        }
      });

      const container = document.getElementById('saved_circuits_container');
      if (list.length === 0) {
        container.innerHTML = `
          <div class="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl space-y-1">
            <div class="w-10 h-10 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-500 mb-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div class="text-xs font-semibold text-slate-300">No Saved Circuits Found</div>
            <div class="text-[11px] text-slate-500">Build a circuit and click "Save Circuit" to save it here.</div>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(c => {
        const routeChips = c.legs.map(l => `<span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">${l.dst} (${l.flightsPerDay || 1}x)</span>`).join(' ');
        const is24h = c.summary?.circuitType === '24h';

        return `
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-2.5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-white text-xs">${c.name}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded ${is24h ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-blue-950 text-blue-300 border border-blue-800'} font-mono">${is24h ? '24h' : '168h'}</span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Hub: <strong class="text-cyan-400 font-mono">${c.hub}</strong></span>
                  <span>&bull;</span>
                  <span>Plane: <strong class="text-emerald-400 font-mono">${c.acName}</strong></span>
                  <span>&bull;</span>
                  <span>Duration: <strong class="text-white font-mono">${c.summary?.totalDurationText || '—'}</strong></span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="rf_loadSavedCircuit('${c.id}')" class="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-sm">
                  <span>Load</span>
                </button>
                <button onclick="rf_copySingleCircuitJson('${c.id}')" class="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition" title="Copy JSON">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                </button>
                <button onclick="rf_deleteSavedCircuit('${c.id}')" class="p-1 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 transition" title="Delete">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <!-- Routes row -->
            <div class="flex items-center gap-1.5 flex-wrap text-xs pt-1 border-t border-slate-800/80">
              <span class="text-slate-400 text-[10px]">Routes:</span>
              ${routeChips}
            </div>
          </div>
        `;
      }).join('');
    }

    function rf_loadSavedCircuit(id) {
      const saved = rf_getSavedCircuitsFromStorage();
      const found = saved.find(c => c.id === id);
      if (!found) return;

      // 1. Set Hub
      rf_setHubByIata(found.hub);

      // 2. Set Aircraft
      if (found.acId) rf_setAircraftById(found.acId);

      // 3. Load Legs
      currentCircuitLegs = found.legs.map((l, idx) => {
        const dstAirport = findAirport(l.dst);
        const dist = l.distanceKm || (dstAirport ? calculateHaversineDistance(currentHub.lat, currentHub.lon, dstAirport.lat, dstAirport.lon) : 1000);
        const dur = l.durationHours || calculateFlightTimeHours(dist, currentAircraft.speed_kmh);
        return {
          dstIata: l.dst,
          name: l.name || dstAirport?.name || l.dst,
          city: l.city || dstAirport?.city || '',
          country: l.country || dstAirport?.country || '',
          category: dstAirport?.cat || 5,
          distanceKm: dist,
          durationHours: dur,
          durationText: formatHoursMinutes(dur),
          flightsPerDay: l.flightsPerDay || 1,
          color: CIRCUIT_PALETTE[idx % CIRCUIT_PALETTE.length]
        };
      });

      rf_timelineViewMode = null;
      rf_updateCircuitUI();
      rf_refreshAll();
      rf_closeSavedCircuitsModal();
      showToast(`Loaded circuit "${found.name}" into timetable!`, 'success');
    }

    function rf_deleteSavedCircuit(id) {
      let saved = rf_getSavedCircuitsFromStorage();
      saved = saved.filter(c => c.id !== id);
      rf_saveCircuitsToStorage(saved);
      rf_renderSavedCircuitsList();
      showToast('Deleted circuit from library', 'info');
    }

    function rf_copySingleCircuitJson(id) {
      const saved = rf_getSavedCircuitsFromStorage();
      const found = saved.find(c => c.id === id);
      if (!found) return;
      navigator.clipboard.writeText(JSON.stringify(found, null, 2));
      showToast('Circuit JSON copied to clipboard', 'success');
    }

    function rf_exportAllCircuitsJson() {
      const saved = rf_getSavedCircuitsFromStorage();
      navigator.clipboard.writeText(JSON.stringify(saved, null, 2));
      showToast('All saved circuits exported to clipboard (JSON)', 'success');
    }

function rf_openInSeatConfigurator() {
  if (!currentHub) {
    if (typeof showToast === 'function') {
      showToast('Please select a departure hub first', 'warning');
    }
    return;
  }
  if (!currentCircuitLegs || currentCircuitLegs.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Please add at least one route before opening in Seat Configurator', 'warning');
    }
    return;
  }
  const is24h = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0) <= 24;
  const circuitData = {
    name: `${currentHub.iata} ${is24h ? '24h' : '168h'} Circuit (${currentCircuitLegs.length} Routes)`,
    hub: currentHub.iata,
    acId: currentAircraft.id,
    acName: currentAircraft.name,
    legs: currentCircuitLegs.map((leg, idx) => ({
      id: `leg-${idx + 1}`,
      hub: currentHub.iata,
      dst: leg.dstIata,
      distanceKm: leg.distanceKm,
      durationHours: leg.durationHours,
      flightsPerDay: leg.flightsPerDay || 1
    }))
  };
  if (typeof window.transferRouteFinderCircuitToSeatConfig === 'function') {
    window.transferRouteFinderCircuitToSeatConfig(circuitData);
  } else if (typeof window.switchTab === 'function') {
    window.switchTab('seat-config');
  }
}
window.rf_openInSeatConfigurator = rf_openInSeatConfigurator;


// Expose Route Finder API on window
window.rf_initDurationDropdowns = rf_initDurationDropdowns;
window.rf_setAircraftById = rf_setAircraftById;
window.rf_toggleAircraftCombobox = rf_toggleAircraftCombobox;
window.rf_openAircraftCombobox = rf_openAircraftCombobox;
window.rf_closeAircraftCombobox = rf_closeAircraftCombobox;
window.rf_setComboboxHaul = rf_setComboboxHaul;
window.rf_clearAircraftComboboxSearch = rf_clearAircraftComboboxSearch;
window.rf_renderAircraftComboboxList = rf_renderAircraftComboboxList;
window.rf_selectAircraftFromCombobox = rf_selectAircraftFromCombobox;
window.rf_toggleAcDetails = rf_toggleAcDetails;
window.rf_openAircraftModal = rf_openAircraftModal;
window.rf_closeAircraftModal = rf_closeAircraftModal;
window.rf_handleAircraftModalBackdropClick = rf_handleAircraftModalBackdropClick;
window.rf_renderAircraftModalContent = rf_renderAircraftModalContent;
window.rf_selectAircraftFromModal = rf_selectAircraftFromModal;
window.rf_initHubSelector = rf_initHubSelector;
window.rf_populateHubAirportsForCountry = rf_populateHubAirportsForCountry;
window.rf_onHubCountryChange = rf_onHubCountryChange;
window.rf_onHubAirportSelectChange = rf_onHubAirportSelectChange;
window.rf_onHubIataInput = rf_onHubIataInput;
window.rf_setQuickHub = rf_setQuickHub;
window.rf_setHubByIata = rf_setHubByIata;
window.rf_clearHub = rf_clearHub;
window.rf_setHubEntryMode = rf_setHubEntryMode;
window.rf_validateHubRunwayCompatibility = rf_validateHubRunwayCompatibility;
window.rf_initCountryFilter = rf_initCountryFilter;
window.rf_onContinentChange = rf_onContinentChange;
window.rf_refreshAll = rf_refreshAll;
window.rf_applyFilters = rf_applyFilters;
window.rf_onTableSearchInput = rf_onTableSearchInput;
window.rf_clearTableSearch = rf_clearTableSearch;
window.rf_setDurationPreset = rf_setDurationPreset;
window.rf_toggleSortDropdown = rf_toggleSortDropdown;
window.rf_closeSortDropdown = rf_closeSortDropdown;
window.rf_renderSortMenuItems = rf_renderSortMenuItems;
window.rf_selectSortOption = rf_selectSortOption;
window.rf_onSortChange = rf_onSortChange;
window.rf_sortCandidates = rf_sortCandidates;
window.rf_setViewMode = rf_setViewMode;
window.rf_onPageSizeChange = rf_onPageSizeChange;
window.rf_changePage = rf_changePage;
window.rf_resetAllFilters = rf_resetAllFilters;
window.rf_addRouteToCircuit = rf_addRouteToCircuit;
window.rf_removeRouteFromCircuit = rf_removeRouteFromCircuit;
window.rf_setLegFrequency = rf_setLegFrequency;
window.rf_changeLegFrequency = rf_changeLegFrequency;
window.rf_clearCurrentCircuit = rf_clearCurrentCircuit;
window.rf_updateCircuitUI = rf_updateCircuitUI;
window.rf_setTimelineViewMode = rf_setTimelineViewMode;
window.rf_renderResults = rf_renderResults;
window.rf_updateNoMatchDiagnostic = rf_updateNoMatchDiagnostic;
window.rf_getSavedCircuitsFromStorage = rf_getSavedCircuitsFromStorage;
window.rf_saveCircuitsToStorage = rf_saveCircuitsToStorage;
window.rf_updateSavedCircuitsCount = rf_updateSavedCircuitsCount;
window.rf_openSaveCircuitModal = rf_openSaveCircuitModal;
window.rf_closeSaveCircuitModal = rf_closeSaveCircuitModal;
window.rf_handleSaveModalBackdropClick = rf_handleSaveModalBackdropClick;
window.rf_executeSaveCircuit = rf_executeSaveCircuit;
window.rf_openSavedCircuitsModal = rf_openSavedCircuitsModal;
window.rf_closeSavedCircuitsModal = rf_closeSavedCircuitsModal;
window.rf_handleSavedCircuitsBackdropClick = rf_handleSavedCircuitsBackdropClick;
window.rf_renderSavedCircuitsList = rf_renderSavedCircuitsList;
window.rf_loadSavedCircuit = rf_loadSavedCircuit;
window.rf_deleteSavedCircuit = rf_deleteSavedCircuit;
window.rf_copySingleCircuitJson = rf_copySingleCircuitJson;
window.rf_exportAllCircuitsJson = rf_exportAllCircuitsJson;

    // =========================================================================
    // GAP FILLER ASSISTANT & SUGGESTIONS ENGINE
    // =========================================================================
    function rf_toggleGapDrawer() {
      const drawer = document.getElementById('rf_gap_drawer');
      if (!drawer) return;
      const isHidden = drawer.classList.contains('hidden');
      if (isHidden) {
        drawer.classList.remove('hidden');
        rf_renderGapSuggestions();
      } else {
        drawer.classList.add('hidden');
      }
    }

    // Shared circuit maths — used by the full page, the gap filler and the compact sidebar view.
    function rf_circuitMath() {
      const baseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24hCircuit = baseSingleSum <= 24;
      const targetHours = is24hCircuit ? 24 : 168;

      let totalScheduledHours = 0;
      currentCircuitLegs.forEach(l => {
        totalScheduledHours += l.durationHours * l.flightsPerDay;
      });

      return {
        count: currentCircuitLegs.length,
        is24hCircuit,
        isWeekly: !is24hCircuit,
        target: targetHours,
        used: totalScheduledHours,
        free: Math.max(0, targetHours - totalScheduledHours),
        util: Math.min(100, Math.round((totalScheduledHours / targetHours) * 100))
      };
    }

    // Gap filler candidates — extracted so the compact view offers the exact same picks.
    function rf_computeGapSuggestions() {
      const math = rf_circuitMath();
      const freeHours = math.free;
      const existingIatas = new Set(currentCircuitLegs.map(l => l.dstIata));
      const candidates = [];

      if (freeHours > 0.25 && candidatePool && candidatePool.length) {
        candidatePool.forEach(c => {
          if (existingIatas.has(c.dstIata)) return;
          if (c.durationHours <= freeHours + 0.001) {
            candidates.push({
              cand: c,
              durHours: c.durationHours,
              remainingAfter: Math.max(0, freeHours - c.durationHours),
              isExactFit: Math.abs(freeHours - c.durationHours) < 0.01
            });
          }
        });

        candidates.sort((a, b) => {
          const starsA = a.cand.demand?.stars || 1;
          const starsB = b.cand.demand?.stars || 1;
          if (starsA !== starsB) return starsB - starsA;
          if (a.isExactFit && !b.isExactFit) return -1;
          if (!a.isExactFit && b.isExactFit) return 1;
          const avgA = a.cand.demand?.avg || 0;
          const avgB = b.cand.demand?.avg || 0;
          if (Math.abs(avgA - avgB) > 0.001) return avgB - avgA;
          if (a.remainingAfter !== b.remainingAfter) return a.remainingAfter - b.remainingAfter;
          return b.cand.category - a.cand.category;
        });
      }

      return { freeHours, targetHours: math.target, suggestions: candidates };
    }

    function rf_renderGapSuggestions() {
      const grid = document.getElementById('rf_gap_suggestions_grid');
      if (!grid) return;

      const { freeHours, targetHours, suggestions } = rf_computeGapSuggestions();

      if (freeHours <= 0.25) {
        grid.innerHTML = `
          <div class="col-span-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400">
            Circuit schedule is 100% full (${targetHours}h). No remaining free gap to fill!
          </div>
        `;
        return;
      }

      if (!candidatePool || candidatePool.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400">
            No destinations loaded yet. Please select a hub and aircraft.
          </div>
        `;
        return;
      }

      const topSuggestions = suggestions.slice(0, 3);

      if (topSuggestions.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <p>No single destination in database fits within the remaining <strong>${formatHoursMinutes(freeHours)}</strong>.</p>
            <button type="button" onclick="rf_syncDurationFilterToRemaining()" class="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition">
              Filter Destinations Table &rarr;
            </button>
          </div>
        `;
        return;
      }

      grid.innerHTML = topSuggestions.map(s => {
        const c = s.cand;
        const demand = c.demand || rf_computeAirportDemandStats(c.airport);
        const starsText = demand?.starsText || '★';
        const avgFormatted = demand?.avgFormatted || '0.0';
        const demandLabel = demand?.label || '';
        return `
          <div class="glass-panel p-3.5 rounded-xl border ${s.isExactFit ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-slate-800'} space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold font-mono text-xs shrink-0">
                  ${c.dstIata}
                </span>
                <div class="min-w-0">
                  <h5 class="text-xs font-bold text-white truncate">${c.city || c.name}</h5>
                  <p class="text-[10px] text-slate-400 truncate">${c.country} (Cat. ${c.category})</p>
                </div>
              </div>
              <div class="flex flex-col items-end shrink-0">
                <div class="flex items-center gap-1" title="Demand Index: ${avgFormatted}${demandLabel ? ' · ' + demandLabel : ''}">
                  <span class="text-amber-400 font-bold tracking-tight text-xs">${starsText}</span>
                  <span class="text-slate-400 font-mono text-[10px]">(${avgFormatted})</span>
                </div>
                ${s.isExactFit ? '<span class="mt-0.5 px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold font-mono">⚡ EXACT FIT</span>' : ''}
              </div>
            </div>

            <div class="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] font-mono-num space-y-1">
              <div class="flex justify-between">
                <span class="text-slate-400">Flight Time:</span>
                <strong class="text-white font-bold">${c.durationText}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Distance:</span>
                <span class="text-slate-300">${c.distanceKm.toLocaleString()} km</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">After Adding:</span>
                <span class="${s.isExactFit ? 'text-emerald-400 font-bold' : 'text-amber-300'}">
                  ${s.isExactFit ? '0h 00m free (100% full)' : formatHoursMinutes(s.remainingAfter) + ' free'}
                </span>
              </div>
            </div>

            <button type="button" onclick="rf_addRouteToCircuit('${c.dstIata}')" class="w-full py-1.5 rounded-lg ${s.isExactFit ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'} font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
              <span>+ Add to Circuit</span>
            </button>
          </div>
        `;
      }).join('');
    }

    function rf_syncDurationFilterToRemaining() {
      const baseSingleSum = currentCircuitLegs.reduce((acc, l) => acc + l.durationHours, 0);
      const is24hCircuit = baseSingleSum <= 24;
      const targetHours = is24hCircuit ? 24 : 168;

      let totalScheduledHours = 0;
      currentCircuitLegs.forEach(l => {
        totalScheduledHours += l.durationHours * l.flightsPerDay;
      });
      const freeHours = Math.max(0, targetHours - totalScheduledHours);

      if (freeHours <= 0.25) {
        showToast('Circuit schedule is already full!', 'warning');
        return;
      }

      const maxHh = Math.floor(freeHours);
      const maxMm = Math.round((freeHours - maxHh) * 60);

      const minHhInput = document.getElementById('rf_dur_min_hh');
      const minMmInput = document.getElementById('rf_dur_min_mm');
      const maxHhInput = document.getElementById('rf_dur_max_hh');
      const maxMmInput = document.getElementById('rf_dur_max_mm');

      if (minHhInput) minHhInput.value = '0';
      if (minMmInput) minMmInput.value = '15';
      if (maxHhInput) maxHhInput.value = maxHh;
      if (maxMmInput) maxMmInput.value = maxMm;

      rf_setDurationPreset('any');

      const tableHeader = document.getElementById('results_count_badge') || document.getElementById('results_summary_text');
      if (tableHeader) {
        tableHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      showToast(`Filtered destinations to ≤ ${formatHoursMinutes(freeHours)} flight time!`, 'info');
    }

    window.rf_toggleGapDrawer = rf_toggleGapDrawer;
    window.rf_renderGapSuggestions = rf_renderGapSuggestions;
    window.rf_syncDurationFilterToRemaining = rf_syncDurationFilterToRemaining;

    // Compact (sidebar) layout
    window.rf_renderCompact = rf_renderCompact;
    window.rf_isCompactMode = rf_isCompactMode;
    window.rf_compactSetTab = rf_compactSetTab;
    window.rf_compactToggleAircraft = rf_compactToggleAircraft;
    window.rf_compactSetAcSearch = rf_compactSetAcSearch;
    window.rf_compactSetHaul = rf_compactSetHaul;
    window.rf_compactPickAircraft = rf_compactPickAircraft;
    window.rf_compactSetHubInput = rf_compactSetHubInput;
    window.rf_compactSetHubCountry = rf_compactSetHubCountry;
    window.rf_compactSetHubAirport = rf_compactSetHubAirport;
    window.rf_compactSetCat = rf_compactSetCat;
    window.rf_compactSetDur = rf_compactSetDur;
    window.rf_compactSetContinent = rf_compactSetContinent;
    window.rf_compactSetCountry = rf_compactSetCountry;
    window.rf_compactSetPreset = rf_compactSetPreset;
    window.rf_compactToggleDiv24 = rf_compactToggleDiv24;
    window.rf_compactResetFilters = rf_compactResetFilters;
    window.rf_compactSetSearch = rf_compactSetSearch;
    window.rf_compactToggleSort = rf_compactToggleSort;
    window.rf_compactPickSort = rf_compactPickSort;
    window.rf_compactFlipSort = rf_compactFlipSort;
    window.rf_compactSetPageSize = rf_compactSetPageSize;
    window.rf_compactToggleGap = rf_compactToggleGap;
    window.rf_compactLoad24h = rf_compactLoad24h;
    window.rf_compactLoad168h = rf_compactLoad168h;
    window.rf_getStarRating = rf_getStarRating;
    window.rf_computeAirportDemandStats = rf_computeAirportDemandStats;
    window.rf_updateDurationLimitsForAircraft = rf_updateDurationLimitsForAircraft;
    window.rf_sortByColumn = rf_sortByColumn;
    window.rf_updateTableHeaderSortIndicators = rf_updateTableHeaderSortIndicators;
    window.rf_saveStateToLocalStorage = rf_saveStateToLocalStorage;
    window.rf_restoreStateFromLocalStorage = rf_restoreStateFromLocalStorage;

    /* =====================================================================
       COMPACT (SIDEBAR) LAYOUT
       ---------------------------------------------------------------------
       Rendered into #route_finder_compact_container and only ever visible
       while body.amt-compact-mode is set — app.js applies that class from
       initUIMode() only when window.isSidebarMode() is true, exactly like the
       Zero-Out compact calculator. On the public site the mode is forced to
       standard, so this markup never shows up outside the extension sidebar.

       It shares every piece of state with the full page (currentAircraft,
       currentHub, filteredCandidates, currentCircuitLegs, currentSort,
       currentDurationPreset…) and only calls the existing rf_* actions, so
       the two layouts can never drift apart.
       ===================================================================== */
    // UI-only state for the compact layer (open popovers, active pane).
    const rfCompact = {
      tab: 'criteria',   // criteria | routes | circuit | info
      acOpen: false,     // aircraft combobox popover
      acSearch: '',
      sortOpen: false,
      gapOpen: true
    };

    const RF_SORT_FLIP = {
      dist_asc: 'dist_desc', dist_desc: 'dist_asc',
      dur_asc: 'dur_desc', dur_desc: 'dur_asc',
      cat_asc: 'cat_desc', cat_desc: 'cat_asc',
      stars_asc: 'stars_desc', stars_desc: 'stars_asc',
      name_asc: 'name_desc', name_desc: 'name_asc',
      country_asc: 'country_desc', country_desc: 'country_asc',
      fit_asc: 'fit_desc', fit_desc: 'fit_asc'
    };

    function rf_isCompactMode() {
      return !!(document.body && document.body.classList.contains('amt-compact-mode'));
    }

    // Compact selects mirror the standard ones, so the option lists (aircraft-specific
    // duration limits, country lists…) stay identical without a second source of truth.
    function rf_compactSelectHTML(sourceId, onchange, extraClass) {
      const src = document.getElementById(sourceId);
      if (!src) return '';
      const opts = Array.from(src.options)
        .map(o => `<option value="${o.value}"${o.selected ? ' selected' : ''}>${o.textContent}</option>`)
        .join('');
      return `<select onchange="${onchange}" class="${extraClass || 'sc-input'}">${opts}</select>`;
    }

    function rf_compactMaxFit(leg) {
      const math = rf_circuitMath();
      const others = currentCircuitLegs
        .filter(l => l.dstIata !== leg.dstIata)
        .reduce((acc, l) => acc + l.durationHours * l.flightsPerDay, 0);
      return Math.max(1, Math.floor((math.target - others + 0.0001) / leg.durationHours));
    }

    function rf_compactAircraftPopoverHTML() {
      const q = rfCompact.acSearch.trim().toLowerCase();
      const list = (typeof AIRCRAFT_DATABASE !== 'undefined' ? AIRCRAFT_DATABASE : []).filter(a => {
        if (comboboxHaulFilter !== 'all' && a.type !== comboboxHaulFilter) return false;
        if (!q) return true;
        return a.name.toLowerCase().includes(q) || a.manufacturer.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
      });
      const haulChip = (val, label) => `
        <button type="button" onclick="rf_compactSetHaul('${val}')" class="sc-chip ${comboboxHaulFilter === val ? 'active' : ''}">${label}</button>`;
      const rows = list.slice(0, 60);

      return `
        <div class="sc-combobox-popover" id="rf_c_ac_popover">
          <div class="sc-combobox-header">
            <input type="text" id="rf_c_ac_search" value="${rfCompact.acSearch.replace(/"/g, '&quot;')}" oninput="rf_compactSetAcSearch(this.value)" placeholder="Search aircraft (e.g. 777, A350, neo)…" class="sc-input">
            <div style="display: flex; align-items: center; gap: 3px;">
              ${haulChip('all', 'All')}
              ${haulChip('Long-Haul', 'Long')}
              ${haulChip('Medium-Haul', 'Med')}
              ${haulChip('Short-Haul', 'Short')}
              <span style="margin-left: auto; font-size: 8px; color: var(--sc-text-muted); font-family: ui-monospace, monospace;">${list.length} planes</span>
            </div>
          </div>
          <div class="sc-combobox-list" id="rf_c_ac_list">
            ${rows.length ? rows.map(a => {
              const sel = currentAircraft && currentAircraft.id === a.id;
              return `
                <button type="button" class="sc-combobox-item ${sel ? 'selected' : ''}" onclick="rf_compactPickAircraft('${a.id}')">
                  <div style="min-width: 0;">
                    <div style="font-weight: 700; font-size: 10px; color: ${sel ? 'var(--sc-cyan)' : 'var(--sc-text-bright)'};">
                      ${a.name} <span style="font-size: 8px; font-weight: normal; color: var(--sc-text-muted);">(${a.manufacturer})</span>
                    </div>
                    <div style="font-size: 8px; font-family: ui-monospace, monospace; color: var(--sc-text-muted);">
                      ${Number(a.seats).toLocaleString()} seats · ${a.speed_kmh} km/h · ${Number(a.range_km).toLocaleString()} km
                    </div>
                  </div>
                  <span class="sc-tag" style="margin-left: auto;">Cat ${a.category}</span>
                </button>`;
            }).join('') : `<div class="sc-empty">No aircraft match search</div>`}
          </div>
        </div>`;
    }

    // ---- header -----------------------------------------------------------
    function rf_compactHeaderHTML() {
      const math = rf_circuitMath();
      const total = filteredCandidates.length;
      const hub = currentHub;
      const ac = currentAircraft;
      const mismatch = hub && ac && hub.cat < ac.category;

      return `
        <!-- Topline: Hub Input + Aircraft Combobox (Quick hubs & info button removed) -->
        <div class="sc-topline" id="rf_c_topline">
          <input type="text" id="rf_c_hub_input" maxlength="3" value="${hub ? hub.iata : ''}" oninput="rf_compactSetHubInput(this.value)" placeholder="HUB" title="Departure Hub (3-letter IATA code, e.g. DXB, LHR, JFK)" style="width: 48px; min-width: 48px; text-align: center; font-weight: 700; font-family: ui-monospace, monospace; text-transform: uppercase;">

          <div class="sc-combobox-root" id="rf_c_ac_root" style="flex: 1; min-width: 0;">
            <button type="button" class="sc-combobox-trigger" onclick="rf_compactToggleAircraft()" id="rf_c_ac_trigger" title="Select aircraft model">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ac ? ac.name : 'Select Plane'}</span>
              <span class="sc-tag" style="color: var(--sc-cyan); border-color: rgba(34, 211, 238, 0.3);">${ac ? 'Cat ' + ac.category : 'Cat —'}</span>
            </button>

            ${rfCompact.acOpen ? rf_compactAircraftPopoverHTML() : ''}
          </div>
        </div>

        <!-- Statusline Strip (Matches Seat Config .sc-statusline) -->
        <div class="sc-statusline" id="rf_c_statusline">
          <span>${math.isWeekly ? '168h weekly rotation' : '24h daily rotation'}</span>
          <span><b>${formatHoursMinutes(math.used)}</b> / ${math.target}h</span>
          <span><b>${total}</b> routes</span>
          <span class="${math.free <= 0.25 ? 'sc-good' : 'sc-warn'}">${formatHoursMinutes(math.free)} free</span>
        </div>
        ${mismatch ? `<div class="sc-warning">⚠ Hub runway Cat ${hub.cat} is below ${ac.name}'s Cat ${ac.category} requirement.</div>` : ''}

        <!-- Workspace Tabs: Criteria - Routes - Circuit - Info -->
        <div class="sc_layout_tabs" role="tablist" aria-label="Route Finder workspace tabs">
          <button type="button" role="tab" onclick="rf_compactSetTab('criteria')" class="${rfCompact.tab === 'criteria' ? 'active' : ''}" aria-selected="${rfCompact.tab === 'criteria'}">
            Criteria
          </button>
          <button type="button" role="tab" onclick="rf_compactSetTab('routes')" class="${rfCompact.tab === 'routes' ? 'active' : ''}" aria-selected="${rfCompact.tab === 'routes'}">
            Routes <span class="sc-tab-badge">${total}</span>
          </button>
          <button type="button" role="tab" onclick="rf_compactSetTab('circuit')" class="${rfCompact.tab === 'circuit' ? 'active' : ''}" aria-selected="${rfCompact.tab === 'circuit'}">
            Circuit <span class="sc-tab-badge">${math.count}</span>
          </button>
          <button type="button" role="tab" onclick="rf_compactSetTab('info')" class="${rfCompact.tab === 'info' ? 'active' : ''}" aria-selected="${rfCompact.tab === 'info'}">
            Info
          </button>
        </div>`;
    }

    // ---- tab: criteria ----------------------------------------------------
    function rf_compactCriteriaHTML() {
      const total = filteredCandidates.length;
      return `
        <div class="sc-card">
          <div class="sc-section-title">
            <strong>Runway &amp; Duration Constraints</strong>
            <button type="button" onclick="rf_compactResetFilters()" class="sc-muted" style="background: none; border: none; cursor: pointer; color: var(--sc-rose);">Reset</button>
          </div>

          <!-- Runway Category Min / Max -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">RUNWAY CAT MIN</label>
              ${rf_compactSelectHTML('rf_cat_min', "rf_compactSetCat('min', this.value)", 'sc-input')}
            </div>
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">RUNWAY CAT MAX</label>
              ${rf_compactSelectHTML('rf_cat_max', "rf_compactSetCat('max', this.value)", 'sc-input')}
            </div>
          </div>

          <!-- Round-Trip Duration Range -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">MIN RT DURATION</label>
              <div style="display: flex; align-items: center; gap: 2px;">
                ${rf_compactSelectHTML('rf_dur_min_hh', "rf_compactSetDur('min', 'hh', this.value)", 'sc-input font-mono text-center')}
                <span style="color: var(--sc-text-muted); font-size: 10px;">:</span>
                ${rf_compactSelectHTML('rf_dur_min_mm', "rf_compactSetDur('min', 'mm', this.value)", 'sc-input font-mono text-center')}
              </div>
            </div>
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">MAX RT DURATION</label>
              <div style="display: flex; align-items: center; gap: 2px;">
                ${rf_compactSelectHTML('rf_dur_max_hh', "rf_compactSetDur('max', 'hh', this.value)", 'sc-input font-mono text-center')}
                <span style="color: var(--sc-text-muted); font-size: 10px;">:</span>
                ${rf_compactSelectHTML('rf_dur_max_mm', "rf_compactSetDur('max', 'mm', this.value)", 'sc-input font-mono text-center')}
              </div>
            </div>
          </div>

          <!-- Duration Quick Presets -->
          <div>
            <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 3px;">DURATION PRESETS</label>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              <button type="button" onclick="rf_compactSetPreset('any')" class="sc-chip ${currentDurationPreset === 'any' ? 'active' : ''}">Any RT</button>
              <button type="button" onclick="rf_compactSetPreset('24h_divisors')" class="sc-chip ${currentDurationPreset === '24h_divisors' ? 'active' : ''}">÷24h Divisors</button>
              <button type="button" onclick="rf_compactSetPreset('short')" class="sc-chip ${currentDurationPreset === 'short' ? 'active' : ''}">Short (&lt;6h)</button>
              <button type="button" onclick="rf_compactSetPreset('medium')" class="sc-chip ${currentDurationPreset === 'medium' ? 'active' : ''}">Med (6–12h)</button>
              <button type="button" onclick="rf_compactSetPreset('long')" class="sc-chip ${currentDurationPreset === 'long' ? 'active' : ''}">Long (12h+)</button>
            </div>
          </div>

          <!-- Geographical Region Filters -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">CONTINENT</label>
              ${rf_compactSelectHTML('rf_continent_filter', "rf_compactSetContinent(this.value)", 'sc-input')}
            </div>
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">COUNTRY</label>
              ${rf_compactSelectHTML('rf_country_filter', "rf_compactSetCountry(this.value)", 'sc-input')}
            </div>
          </div>

          <!-- Jump to Routes Action -->
          <button type="button" onclick="rf_compactSetTab('routes')" class="sc-pill-btn" style="width: 100%; height: 26px; margin-top: 4px; background: #0e303e; border-color: #16566d; color: #a5f3fc; font-weight: 600;">
            View Routes (${total}) →
          </button>
        </div>`;
    }

    // ---- tab: routes ------------------------------------------------------
    function rf_compactFitBadgeHTML(c) {
      if (c.fits24h) {
        return `<span class="sc-tag sc-tag-fit" title="Divides 24h exactly → fills the day">24h fit</span>`;
      }
      if (c.fits168h) {
        return `<span class="sc-tag sc-tag-fit-week" title="Divides 168h exactly → fills the week">168h fit</span>`;
      }
      return '';
    }

    function rf_compactRouteRowHTML(c) {
      const leg = currentCircuitLegs.find(l => l.dstIata === c.dstIata);
      const demand = c.demand || rf_computeAirportDemandStats(c);
      return `
        <div class="sc-route ${leg ? 'in-circuit' : ''}">
          <div class="sc-route-top">
            <span class="sc-route-code">${c.dstIata}</span>
            <span class="sc-route-name" title="${c.name} · ${c.city}">${c.name}</span>
            <span class="sc-route-stars" title="Demand ${demand.avgFormatted}">${demand.starsText}</span>
            <button type="button" class="sc-btn-add ${leg ? 'in-circuit' : ''}" onclick="rf_addRouteToCircuit('${c.dstIata}')" title="${leg ? `In circuit at ${leg.flightsPerDay}x — tap to add another run` : `Add ${c.dstIata} to circuit`}">
              ${leg ? '✓ ' + leg.flightsPerDay + '×' : '＋'}
            </button>
          </div>
          <div class="sc-route-bottom">
            <span class="sc-tag" title="${c.country}">${c.country}</span>
            <span class="sc-tag">Cat ${c.category}</span>
            <span style="color: var(--sc-text-secondary);">${Number(c.distanceKm).toLocaleString()} km</span>
            <span style="color: var(--sc-cyan); font-weight: 600;">${c.durationText}</span>
            ${rf_compactFitBadgeHTML(c)}
          </div>
        </div>`;
    }

    function rf_compactSortHTML() {
      const active = sortOptionItems.find(i => i.value === currentSort) || sortOptionItems[0];
      const canFlip = !!RF_SORT_FLIP[currentSort];
      const shortLabel = active.label.split(':')[0];
      const arrow = (active.label.includes('High to Low') || active.label.includes('Longest') || active.label.includes('Best') || active.label.includes('Z to A') || currentSort.endsWith('_desc')) ? ' ↓' : ' ↑';

      return `
        <div class="sc-sort-group" style="position: relative;" id="rf_c_sort_root">
          <button type="button" class="sc-sort-btn" onclick="rf_compactToggleSort()" title="Sort results">
            <span>${shortLabel}${arrow}</span>
            <span style="font-size: 8px;">▾</span>
          </button>
          <button type="button" class="sc-sort-flip" onclick="rf_compactFlipSort()" ${canFlip ? '' : 'disabled'} title="${canFlip ? 'Flip sort direction' : 'Single direction'}">⇅</button>

          ${rfCompact.sortOpen ? `
          <div class="sc-combobox-popover" id="rf_c_sort_popover" style="display: block; width: 190px; right: 0; left: auto;">
            <div style="padding: 4px 6px; font-size: 8px; font-weight: 700; color: var(--sc-text-muted); border-bottom: 1px solid var(--sc-border-subtle); text-transform: uppercase;">Sort Candidates</div>
            <div class="sc-combobox-list" style="max-height: 190px;">
              ${sortOptionItems.map(item => {
                const sel = item.value === currentSort;
                return `
                  <button type="button" class="sc-combobox-item ${sel ? 'selected' : ''}" onclick="rf_compactPickSort('${item.value}')">
                    <span style="font-size: 10px;">${item.label}</span>
                    ${sel ? '<span style="color: var(--sc-cyan); margin-left: auto;">✓</span>' : ''}
                  </button>`;
              }).join('')}
            </div>
          </div>` : ''}
        </div>`;
    }

    function rf_compactRoutesHTML() {
      const total = filteredCandidates.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      if (currentPage > totalPages) currentPage = totalPages;
      const startIdx = (currentPage - 1) * pageSize;
      const visible = filteredCandidates.slice(startIdx, startIdx + pageSize);
      const endIdx = Math.min(total, startIdx + pageSize);
      const divisorOn = currentDurationPreset === '24h_divisors';

      const empty = !currentHub
        ? `<div class="sc-empty">
             <div style="font-size: 11px; font-weight: 700; color: var(--sc-text-bright); margin-bottom: 2px;">Enter a departure hub</div>
             <div style="font-size: 9px; color: var(--sc-text-muted);">Enter an IATA code in the hub input above to discover available routes.</div>
           </div>`
        : `<div class="sc-empty">
             <div style="font-size: 11px; font-weight: 700; color: var(--sc-text-bright); margin-bottom: 2px;">No matching destinations found</div>
             <div style="font-size: 9px; color: var(--sc-text-muted); margin-bottom: 5px;">Try loosening category, duration or region filters in Criteria.</div>
             <button type="button" onclick="rf_compactResetFilters()" class="sc-pill-btn" style="background: #0e303e; border-color: #16566d; color: #a5f3fc;">Reset filters</button>
           </div>`;

      return `
        <div class="sc-card" style="padding: 5px 6px; gap: 4px;">
          <div class="sc-search-bar">
            <div class="sc-search-input-wrap">
              <span class="sc-search-icon">🔍</span>
              <input type="text" id="rf_c_search" value="${tableSearchQuery.replace(/"/g, '&quot;')}" oninput="rf_compactSetSearch(this.value)" placeholder="Search IATA, city, airport, country…" class="sc-input">
            </div>
            ${tableSearchQuery ? `<button type="button" onclick="rf_compactSetSearch('')" class="sc-pill-btn" style="padding: 0 5px;" title="Clear search">✕</button>` : ''}
            <button type="button" onclick="rf_compactToggleDiv24()" class="sc-pill-btn ${divisorOn ? 'active' : ''}" title="24h divisors only (e.g. 3h, 4h, 6h, 8h)">÷24h</button>
            ${rf_compactSortHTML()}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 8px; color: var(--sc-text-muted); padding: 0 2px;">
            <span>${divisorOn ? 'Filtered to 24h exact divisors' : 'All available range routes'}${currentHub ? ' · ' + currentHub.iata : ''}</span>
            <span>${total > 0 ? `${startIdx + 1}–${endIdx} of ${total}` : '0 of 0'}</span>
          </div>
        </div>

        ${total === 0 ? empty : `
          <div style="display: flex; flex-direction: column; gap: 3px;">
            ${visible.map(rf_compactRouteRowHTML).join('')}
          </div>

          <div class="sc-pagination">
            <button type="button" onclick="rf_changePage(-1)" ${currentPage <= 1 ? 'disabled' : ''}>‹</button>
            <span class="sc-page-info">${currentPage} / ${totalPages}</span>
            <button type="button" onclick="rf_changePage(1)" ${currentPage >= totalPages ? 'disabled' : ''}>›</button>
            <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 8px; color: var(--sc-text-muted);">Per page:</span>
              <select onchange="rf_compactSetPageSize(this.value)" class="sc-input" style="width: 58px; height: 22px; padding: 2px 4px; font-size: 9px;">
                ${[25, 50, 100, 250].map(n => `<option value="${n}"${pageSize === n ? ' selected' : ''}>${n}</option>`).join('')}
              </select>
            </div>
          </div>
        `}`;
    }

    // ---- tab: circuit -----------------------------------------------------
    function rf_compactTimelineBlocks() {
      const math = rf_circuitMath();
      const blocks = [];
      let t = 0;
      if (!math.count) return blocks;

      if (math.is24hCircuit) {
        const maxRuns = Math.max(1, ...currentCircuitLegs.map(l => l.flightsPerDay || 1));
        for (let run = 0; run < maxRuns; run++) {
          currentCircuitLegs.forEach(leg => {
            if (run < (leg.flightsPerDay || 1)) {
              blocks.push({ leg, start: t, end: t + leg.durationHours });
              t += leg.durationHours;
            }
          });
        }
      } else {
        currentCircuitLegs.forEach(leg => {
          for (let rep = 0; rep < (leg.flightsPerDay || 1); rep++) {
            blocks.push({ leg, start: t, end: t + leg.durationHours });
            t += leg.durationHours;
          }
        });
      }
      return blocks;
    }

    function rf_compactBarHTML() {
      const math = rf_circuitMath();
      const hubIata = currentHub ? currentHub.iata : 'HUB';
      const blocks = [];
      let clockMinutes = 0;

      currentCircuitLegs.forEach(leg => {
        for (let rep = 0; rep < (leg.flightsPerDay || 1); rep++) {
          const startLabel = rf_compactClock(clockMinutes);
          clockMinutes += leg.durationHours * 60;
          const widthPct = Math.min(100, (leg.durationHours / math.target) * 100);
          blocks.push(`
            <div class="sc-timeline-seg" style="width:${widthPct.toFixed(2)}%; background:${rf_compactLegColor(leg)};"
              title="${hubIata} ➔ ${leg.dstIata} (${leg.durationText}) | ${startLabel} - ${rf_compactClock(clockMinutes)}">
              ${widthPct > 6 ? leg.dstIata : ''}
            </div>`);
        }
      });

      if (math.free > 0) {
        const freePct = Math.min(100, (math.free / math.target) * 100);
        blocks.push(`
          <div class="sc-timeline-free" style="width:${freePct.toFixed(2)}%;" title="Free unallocated rotation time: ${formatHoursMinutes(math.free)}">
            ${freePct > 12 ? formatHoursMinutes(math.free) + ' free' : ''}
          </div>`);
      }

      return `
        <div class="sc-timeline-bar-wrap">
          <div class="sc-timeline-bar">
            ${blocks.length ? blocks.join('') : '<div class="sc-timeline-free" style="width: 100%;">Empty circuit</div>'}
          </div>
          <div class="sc-timeline-axis">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>`;
    }

    function rf_compactClock(totalMinutes) {
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = Math.round(totalMinutes % 60);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function rf_compactWeekHTML() {
      const blocks = rf_compactTimelineBlocks();
      const hubIata = currentHub ? currentHub.iata : 'HUB';
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const rows = days.map((day, i) => {
        const dayStart = i * 24;
        const dayEnd = dayStart + 24;
        const segs = blocks
          .map(b => ({ ...b, s: Math.max(b.start, dayStart), e: Math.min(b.end, dayEnd) }))
          .filter(b => b.s < b.e);
        return `
          <div class="sc-day">
            <span>${day}</span>
            <div class="sc-day-track">
              ${segs.map(s => `<span style="left:${((s.s - dayStart) / 24 * 100).toFixed(2)}%;width:${((s.e - s.s) / 24 * 100).toFixed(2)}%;background:${rf_compactLegColor(s.leg)};"
                title="${day} ${formatHoursMinutes(s.s - dayStart)}–${formatHoursMinutes(s.e - dayStart)} · ${hubIata} → ${s.leg.dstIata}">${s.leg.dstIata}</span>`).join('')}
            </div>
          </div>`;
      }).join('');

      return `
        <div class="sc-week">${rows}</div>
        <div style="display: flex; justify-content: space-between; font-size: 8px; font-family: ui-monospace, monospace; color: var(--sc-text-muted); padding-left: 29px;">
          <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
        </div>`;
    }

    function rf_compactLegColor(leg) {
      const solids = ['#06b6d4', '#10b981', '#a855f7', '#f59e0b', '#f43f5e', '#4f46e5'];
      const idx = currentCircuitLegs.findIndex(l => l.dstIata === leg.dstIata);
      return solids[(idx < 0 ? 0 : idx) % solids.length];
    }

    function rf_compactLegRowHTML(leg) {
      const math = rf_circuitMath();
      const maxFit = rf_compactMaxFit(leg);
      const canUp = leg.flightsPerDay < maxFit;
      const canDown = leg.flightsPerDay > 1;
      const totalLegHours = leg.durationHours * leg.flightsPerDay;
      const isOnlyRouteIn24h = currentCircuitLegs.length === 1 && math.is24hCircuit;

      let quickChips = '';
      if (isOnlyRouteIn24h && maxFit > 1) {
        const options = [];
        for (let f = 1; f <= Math.min(4, maxFit); f++) options.push(f);
        quickChips = `
          <div style="display: flex; align-items: center; gap: 3px; flex-wrap: wrap; padding-top: 3px; border-top: 1px solid var(--sc-border-subtle); margin-top: 2px;">
            <span style="font-size: 8px; text-transform: uppercase; font-weight: 600; color: var(--sc-text-muted);">Runs/day</span>
            ${options.map(f => `<button type="button" onclick="rf_setLegFrequency('${leg.dstIata}', ${f})" class="sc-chip ${leg.flightsPerDay === f ? 'active' : ''}">${f}x (${formatHoursMinutes(leg.durationHours * f)})</button>`).join('')}
            ${options.includes(maxFit) ? '' : `<button type="button" onclick="rf_setLegFrequency('${leg.dstIata}', ${maxFit})" class="sc-chip ${leg.flightsPerDay === maxFit ? 'active' : ''}">Fill ${maxFit}x (${formatHoursMinutes(leg.durationHours * maxFit)})</button>`}
          </div>`;
      }

      return `
        <div class="sc-route" style="border-left: 3px solid ${rf_compactLegColor(leg)};">
          <div class="sc-route-top">
            <span class="sc-route-code" style="border-left: none; padding-left: 0;">${leg.dstIata}</span>
            <span class="sc-route-name">${leg.name || leg.dstIata}</span>
            <span class="sc-tag" style="margin-left: auto;">Cat ${leg.category || 1}</span>
            <div class="sc-route-actions">
              <div class="sc-stepper">
                <button type="button" onclick="rf_changeLegFrequency('${leg.dstIata}', -1)" ${canDown ? '' : 'disabled'}>−</button>
                <b>${leg.flightsPerDay}×</b>
                <button type="button" onclick="rf_changeLegFrequency('${leg.dstIata}', 1)" ${canUp ? '' : 'disabled'} title="Max ${maxFit}x runs">+</button>
              </div>
              <button type="button" onclick="rf_removeRouteFromCircuit('${leg.dstIata}')" title="Remove leg" style="background: none; border: none; color: var(--sc-rose); cursor: pointer; font-size: 11px; padding: 0 3px;">×</button>
            </div>
          </div>
          <div class="sc-route-bottom">
            <span>RT <b style="color: var(--sc-cyan);">${leg.durationText}</b></span>
            <span>Scheduled: <b style="color: #fff;">${formatHoursMinutes(totalLegHours)}</b></span>
            <span style="margin-left: auto; color: var(--sc-text-faint);">${Number(leg.distanceKm).toLocaleString()} km</span>
          </div>
          ${quickChips}
        </div>`;
    }

    function rf_compactGapHTML() {
      const math = rf_circuitMath();
      const { freeHours, suggestions } = rf_computeGapSuggestions();

      if (freeHours <= 0.25) {
        return `
          <div class="sc-gap-box">
            <div style="font-size: 9px; color: var(--sc-good); padding: 2px;">✓ Rotation schedule is completely filled!</div>
          </div>`;
      }

      const picks = suggestions.slice(0, 3);
      if (!picks.length) {
        return `
          <div class="sc-gap-box">
            <div style="font-size: 8px; color: var(--sc-text-muted); display: flex; align-items: center; justify-content: space-between;">
              <span>No single route fits the ${formatHoursMinutes(freeHours)} gap.</span>
              <button type="button" onclick="rf_syncDurationFilterToRemaining(); rf_compactSetTab('routes');" class="sc-pill-btn" style="height: 18px; padding: 0 4px; font-size: 8px;">Filter table ↘</button>
            </div>
          </div>`;
      }

      return `
        <div class="sc-gap-box">
          <div class="sc-gap-title">
            <span>⚡ Gap Fit Suggestions</span>
            <span style="color: var(--sc-cyan); font-family: ui-monospace, monospace;">${formatHoursMinutes(freeHours)} free</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 3px;">
            ${picks.map(s => `
              <div class="sc-gap-row ${s.isExactFit ? 'exact' : ''}">
                <strong style="color: #fff; font-family: ui-monospace, monospace;">${s.cand.dstIata}</strong>
                <span style="color: var(--sc-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">${s.cand.city || s.cand.name}</span>
                <span style="color: var(--sc-cyan); font-family: ui-monospace, monospace;">${s.cand.durationText}</span>
                <span style="font-size: 8px; font-family: ui-monospace, monospace; color: ${s.isExactFit ? 'var(--sc-good)' : 'var(--sc-text-muted)'};">
                  ${s.isExactFit ? '⚡ Fills day' : `${formatHoursMinutes(s.remainingAfter)} left`}
                </span>
                <button type="button" class="sc-btn-add" onclick="rf_addRouteToCircuit('${s.cand.dstIata}')" style="height: 18px; min-width: 20px; font-size: 8px;">＋</button>
              </div>`).join('')}
          </div>
        </div>`;
    }

    function rf_compactCircuitHTML() {
      const math = rf_circuitMath();
      const activeView = rf_timelineViewMode || (math.is24hCircuit ? 'bar' : 'week');

      return `
        <!-- KPI Stats Grid (Matches .sc-kpis) -->
        <div class="sc-kpis">
          <div>
            <small>Scheduled</small>
            <strong>${formatHoursMinutes(math.used)}</strong>
          </div>
          <div>
            <small>Free Time</small>
            <strong class="${math.free <= 0.25 ? 'sc-good' : 'sc-warn'}">${formatHoursMinutes(math.free)}</strong>
          </div>
          <div>
            <small>Utilized</small>
            <strong>${math.util}%</strong>
          </div>
          <div>
            <small>Target Cycle</small>
            <strong>${math.target}h</strong>
          </div>
        </div>

        <!-- Schedule Timeline Card -->
        <div class="sc-card">
          <div class="sc-section-title">
            <strong>${math.isWeekly ? '168h Weekly' : '24h Daily'} Rotation Timeline</strong>
            <div style="margin-left: auto; display: flex; gap: 2px;">
              <button type="button" class="sc-pill-btn ${activeView === 'bar' ? 'active' : ''}" onclick="rf_setTimelineViewMode('bar')" style="height: 18px; padding: 0 5px; font-size: 8px;">24h Bar</button>
              <button type="button" class="sc-pill-btn ${activeView === 'week' ? 'active' : ''}" onclick="rf_setTimelineViewMode('week')" style="height: 18px; padding: 0 5px; font-size: 8px;">7-Day</button>
            </div>
          </div>

          ${activeView === 'week' ? rf_compactWeekHTML() : rf_compactBarHTML()}
        </div>

        <!-- Gap Fit Suggestions -->
        ${rf_compactGapHTML()}

        <!-- Scheduled Circuit Legs -->
        <div class="sc-card" style="padding-top: 5px;">
          <div class="sc-section-title">
            <strong>Scheduled Circuit Legs</strong>
            <span class="sc-muted">${math.count} leg${math.count === 1 ? '' : 's'}</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 3px;">
            ${math.count ? currentCircuitLegs.map(rf_compactLegRowHTML).join('') : `
              <div class="sc-empty">
                No legs added to this rotation.<br>
                <button type="button" onclick="rf_compactSetTab('routes')" class="sc-pill-btn" style="margin-top: 5px; background: #0e303e; border-color: #16566d; color: #a5f3fc;">Browse Routes</button>
              </div>`}
          </div>
        </div>`;
    }

    // ---- tab: info --------------------------------------------------------
    function rf_compactInfoHTML() {
      const ac = currentAircraft;
      const hub = currentHub;
      const demand = hub ? rf_computeAirportDemandStats(hub) : null;

      return `
        <!-- Active Aircraft Specifications Card -->
        <div class="sc-card">
          <div class="sc-section-title">
            <strong>Active Aircraft Specifications</strong>
            <span class="sc-muted">${ac ? ac.type : '—'}</span>
          </div>
          <div class="sc-kpis">
            <div>
              <small>Range</small>
              <strong>${ac ? Number(ac.range_km).toLocaleString() + ' km' : '—'}</strong>
            </div>
            <div>
              <small>Cruise</small>
              <strong>${ac ? ac.speed_kmh + ' km/h' : '—'}</strong>
            </div>
            <div>
              <small>Runway Req</small>
              <strong>${ac ? 'Cat ' + ac.category : '—'}</strong>
            </div>
            <div>
              <small>Seats</small>
              <strong>${ac ? Number(ac.seats).toLocaleString() : '—'}</strong>
            </div>
          </div>
          <div style="font-size: 9px; color: var(--sc-text-muted); display: flex; justify-content: space-between;">
            <span>${ac ? `${ac.manufacturer} · ${ac.type}` : 'No aircraft selected'}</span>
            <span>${ac ? `Payload: ${ac.payload_ton} T` : ''}</span>
          </div>
        </div>

        <!-- Departure Hub Details Card -->
        <div class="sc-card">
          <div class="sc-section-title">
            <strong>Departure Hub Details</strong>
            <span class="sc-muted" style="color: var(--sc-warn);">${demand ? demand.starsText : ''}</span>
          </div>
          ${hub ? `
            <div style="background: var(--sc-bg-subpanel); border: 1px solid var(--sc-border-subtle); border-radius: 6px; padding: 6px; display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 11px; font-weight: 700; color: var(--sc-text-bright);">${hub.iata} · ${hub.city}</span>
                <span class="sc-tag" style="color: var(--sc-cyan);">Cat ${hub.cat}</span>
              </div>
              <div style="font-size: 9px; color: var(--sc-text-secondary);">${hub.name} · ${hub.country}</div>
              <div style="font-size: 8px; color: var(--sc-text-muted); display: flex; justify-content: space-between;">
                <span>${Number(hub.lat).toFixed(2)}°, ${Number(hub.lon).toFixed(2)}°</span>
                <span>Demand Index: ${demand.avgFormatted} (${demand.label})</span>
              </div>
            </div>` : `
            <div class="sc-empty">
              No departure hub selected.<br>
              <span style="font-size: 9px; color: var(--sc-text-muted);">Enter an IATA code in the hub field in the topline.</span>
            </div>`}
        </div>`;
    }

    // ---- sticky action toolbar --------------------------------------------
    function rf_compactActionsHTML() {
      return `
        <div class="sc_layout_toolbar">
          <button type="button" class="sc-btn-primary" onclick="rf_openSaveCircuitModal()" title="Save current circuit to storage">
            💾 Save
          </button>
          <button type="button" onclick="rf_openInSeatConfigurator()" title="Send current circuit to Seat Configurator">
            ➤ Seat
          </button>
          <button type="button" class="sc-btn-clear" onclick="rf_clearCurrentCircuit()" title="Clear all circuit legs">
            🗑
          </button>
          <div class="sc_layout_examples">
            <button type="button" onclick="rf_compactLoad24h()" title="Load standard 24h circuit example">24h</button>
            <button type="button" onclick="rf_compactLoad168h()" title="Load standard 168h circuit example">168h</button>
          </div>
        </div>`;
    }

    function rf_renderCompact() {
      const cont = document.getElementById('route_finder_compact_container');
      if (!cont) return;
      if (!rf_isCompactMode()) {
        cont.innerHTML = '';
        return;
      }

      const active = document.activeElement;
      const focusId = active && active.id ? active.id : null;
      const selStart = (focusId && active.selectionStart != null) ? active.selectionStart : null;
      const scrollY = window.scrollY;

      const paneHTML = rfCompact.tab === 'criteria' ? rf_compactCriteriaHTML()
        : rfCompact.tab === 'routes' ? rf_compactRoutesHTML()
        : rfCompact.tab === 'circuit' ? rf_compactCircuitHTML()
        : rf_compactInfoHTML();

      cont.innerHTML = `
        ${rf_compactHeaderHTML()}
        ${paneHTML}
        ${rf_compactActionsHTML()}`;

      if (focusId) {
        const el = document.getElementById(focusId);
        if (el && el.focus) {
          el.focus();
          if (selStart != null && el.setSelectionRange) {
            try { el.setSelectionRange(selStart, selStart); } catch (e) {}
          }
        }
      }
      if (window.scrollY !== scrollY) window.scrollTo(0, scrollY);
    }

    // ---- compact actions (thin wrappers over the full-page handlers) -------
    function rf_compactSetTab(tab) {
      rfCompact.tab = tab;
      rfCompact.acOpen = false;
      rfCompact.sortOpen = false;
      rf_renderCompact();
    }

    function rf_compactToggleAircraft() {
      rfCompact.acOpen = !rfCompact.acOpen;
      rfCompact.sortOpen = false;
      rf_renderCompact();
      if (rfCompact.acOpen) {
        setTimeout(() => {
          const el = document.getElementById('rf_c_ac_search');
          if (el) el.focus();
        }, 50);
      }
    }

    function rf_compactSetAcSearch(value) {
      rfCompact.acSearch = value;
      rf_renderCompact();
    }

    function rf_compactSetHaul(haul) {
      rf_setComboboxHaul(haul);
      rf_renderCompact();
    }

    function rf_compactPickAircraft(id) {
      rfCompact.acOpen = false;
      rfCompact.acSearch = '';
      rf_setAircraftById(id);
      rf_refreshAll();
      showToast(`Selected ${currentAircraft ? currentAircraft.name : id}`, 'success');
    }

    function rf_compactSetHubInput(value) {
      const input = document.getElementById('rf_hub_iata_input');
      if (input) input.value = (value || '').toUpperCase().replace(/[^A-Za-z]/g, '').slice(0, 3);
      rf_onHubIataInput();
      rf_renderCompact();
    }

    function rf_compactSetHubCountry(country) {
      const el = document.getElementById('rf_hub_country_select');
      if (el) el.value = country;
      rf_onHubCountryChange();
      rf_renderCompact();
    }

    function rf_compactSetHubAirport(iata) {
      const el = document.getElementById('rf_hub_airport_select');
      if (el) el.value = iata;
      rf_onHubAirportSelectChange();
      rf_renderCompact();
    }

    function rf_compactSetCat(which, value) {
      const el = document.getElementById(which === 'min' ? 'rf_cat_min' : 'rf_cat_max');
      if (el) el.value = value;
      rf_applyFilters();
    }

    function rf_compactSetDur(bound, part, value) {
      const el = document.getElementById(`rf_dur_${bound}_${part}`);
      if (el) el.value = value;
      rf_applyFilters();
    }

    function rf_compactSetContinent(value) {
      const el = document.getElementById('rf_continent_filter');
      if (el) el.value = value;
      rf_onContinentChange();
    }

    function rf_compactSetCountry(value) {
      const el = document.getElementById('rf_country_filter');
      if (el) el.value = value;
      rf_applyFilters();
    }

    function rf_compactSetPreset(key) {
      rf_setDurationPreset(key);
    }

    // The full page's "24h Divisors" preset, surfaced as the sidebar toggle.
    function rf_compactToggleDiv24() {
      const wasOn = currentDurationPreset === '24h_divisors';
      rf_setDurationPreset(wasOn ? 'any' : '24h_divisors');
      showToast(wasOn
        ? 'Showing all matching routes again'
        : '24h divisors only — round trips that fill the day exactly', wasOn ? 'info' : 'success');
    }

    // Criteria only — keeps the aircraft and hub the user picked.
    function rf_compactResetFilters() {
      if (currentAircraft) {
        const catMin = document.getElementById('rf_cat_min');
        const catMax = document.getElementById('rf_cat_max');
        if (catMin) catMin.value = Math.max(1, currentAircraft.category);
        if (catMax) catMax.value = '10';
        rf_updateDurationLimitsForAircraft(currentAircraft, true);
      }
      const minHh = document.getElementById('rf_dur_min_hh');
      const minMm = document.getElementById('rf_dur_min_mm');
      if (minHh) minHh.value = '0';
      if (minMm) minMm.value = '0';
      const cont = document.getElementById('rf_continent_filter');
      if (cont) cont.value = 'ALL';
      rf_initCountryFilter('ALL');
      rf_clearTableSearch();
      currentSort = 'dist_asc';
      const sortSelect = document.getElementById('rf_sort_select');
      if (sortSelect) sortSelect.value = 'dist_asc';
      rf_setDurationPreset('any');
      rf_applyFilters();
      showToast('Criteria filters reset', 'info');
    }

    function rf_compactSetSearch(value) {
      rf_onTableSearchInput(value);
    }

    function rf_compactToggleSort() {
      rfCompact.sortOpen = !rfCompact.sortOpen;
      rfCompact.acOpen = false;
      rf_renderCompact();
    }

    function rf_compactPickSort(value) {
      const item = sortOptionItems.find(i => i.value === value);
      rfCompact.sortOpen = false;
      rf_selectSortOption(value, item ? item.label : value);
    }

    function rf_compactFlipSort() {
      const next = RF_SORT_FLIP[currentSort];
      if (!next) { showToast('IATA order has a single direction', 'info'); return; }
      const item = sortOptionItems.find(i => i.value === next);
      rfCompact.sortOpen = false;
      rf_selectSortOption(next, item ? item.label : next);
    }

    function rf_compactSetPageSize(value) {
      const el = document.getElementById('rf_page_size');
      if (el) el.value = value;
      pageSize = parseInt(value, 10) || 25;
      currentPage = 1;
      rf_renderResults();
      rf_saveStateToLocalStorage();
    }

    function rf_compactToggleGap() {
      rfCompact.gapOpen = !rfCompact.gapOpen;
      rf_renderCompact();
      if (rfCompact.gapOpen) {
        const math = rf_circuitMath();
        if (math.free <= 0.25) showToast(`Circuit schedule is 100% full (${math.target}h)`, 'warning');
      }
    }

    function rf_compactLoad24h() {
      rf_setAircraftById('a380-800');
      rf_setHubByIata('DXB');
      currentCircuitLegs = [];
      rf_updateCircuitUI();
      setTimeout(() => {
        rf_addRouteToCircuit('LHR');
        showToast('Loaded 24h Daily Rotation Example (A380 · DXB)', 'success');
        rf_renderCompact();
      }, 50);
    }

    function rf_compactLoad168h() {
      rf_setAircraftById('b777-300er');
      rf_setHubByIata('JFK');
      currentCircuitLegs = [];
      rf_updateCircuitUI();
      setTimeout(() => {
        rf_addRouteToCircuit('LHR');
        rf_addRouteToCircuit('CDG');
        rf_addRouteToCircuit('FRA');
        showToast('Loaded 168h Weekly Rotation Example (777-300ER · JFK)', 'success');
        rf_renderCompact();
      }, 50);
    }

})();

