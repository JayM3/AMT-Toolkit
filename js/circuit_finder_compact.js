/**
 * AMT Circuit Finder · Compact View Engine & UI Component (circuit_finder_compact.js)
 * Implements Option 1 Tabbed Workflow layout for Extension Sidebar & docked side panel.
 * Seamlessly pairs with Seat Config, Route Finder, and Zero-Out compact modes.
 */
(() => {
  'use strict';

  // ---- CONTINENT MAP ----
  const CF_C_CONTINENT_MAP = {
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
    'Nigeria': 'Africa', 'Rwanda': 'Africa', 'Réunion': 'Africa', 'Senegal': 'Africa',
    'Seychelles': 'Africa', 'Sierra Leone': 'Africa', 'Somalia': 'Africa', 'South Africa': 'Africa',
    'South Sudan': 'Africa', 'Sudan': 'Africa', 'Tanzania': 'Africa', 'Togo': 'Africa',
    'Tunisia': 'Africa', 'Uganda': 'Africa', 'Zambia': 'Africa', 'Zimbabwe': 'Africa',
    'Canada': 'North America', 'United States': 'North America', 'Mexico': 'North America',
    'Bahamas': 'North America', 'Barbados': 'North America', 'Costa Rica': 'North America',
    'Cuba': 'North America', 'Dominican Republic': 'North America', 'Guatemala': 'North America',
    'Haiti': 'North America', 'Honduras': 'North America', 'Jamaica': 'North America',
    'Panama': 'North America', 'Trinidad and Tobago': 'North America',
    'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
    'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
    'Paraguay': 'South America', 'Peru': 'South America', 'Uruguay': 'South America',
    'Venezuela': 'South America',
    'Australia': 'Oceania', 'Fiji': 'Oceania', 'New Zealand': 'Oceania', 'Papua New Guinea': 'Oceania'
  };

  const CF_C_LEG_COLORS = ['#22d3ee', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f43f5e', '#6366f1', '#14b8a6'];
  const SAVED_CIRCUITS_KEY = 'amt_toolkit_saved_circuits_v1';

  // Strategy Presets
  const STRATEGY_PRESETS = {
    'tri_class': { eco: 0.60, bus: 0.25, first: 0.15, cargo: 0.05, label: 'Balanced Tri-Class (60/25/15)' },
    'eco':       { eco: 1.00, bus: 0.00, first: 0.00, cargo: 0.00, label: '100% Economy Focus' },
    'premium':   { eco: 0.25, bus: 0.45, first: 0.30, cargo: 0.00, label: 'Premium Luxury (25/45/30)' },
    'cargo':     { eco: 0.40, bus: 0.20, first: 0.10, cargo: 0.30, label: 'Cargo Hybrid (40/20/10/30)' }
  };

  // State
  const state = {
    hub: 'OSL',
    aircraftId: 'a380-800',
    targetHours: 168,
    slackHours: 0,
    routeCount: 'any',
    routeType: 'lh', // 'mix', 'sh', 'mh', 'lh'
    strategy: 'tri_class',
    weights: { eco: 0.60, bus: 0.25, first: 0.15, cargo: 0.05 },
    sortMetric: 'stars_desc',
    minStars: 3,
    continent: 'all',
    maxDistLimit: null,
    requireCatMatch: true,
    includeMode: 'ap', // 'ap' or 'ct'
    excludeMode: 'ap', // 'ap' or 'ct'
    includedAirports: [],
    includedCountries: [],
    excludedAirports: [],
    excludedCountries: [],
    discoveredCircuits: [],
    savedCircuits: [],
    activeTab: 'criteria',
    quickFilter: 'all', // 'all', 'exact', 'high_harmony'
    benchmarkMs: 0,
    activeSwapCoord: { circuitIdx: null, legIdx: null },
    acPopoverOpen: false,
    currentHaulFilter: 'all',
    isMounted: false
  };

  function isCompactMode() {
    return document.body.classList.contains('amt-compact-mode') || 
           (window.isSidebarMode && window.isSidebarMode());
  }

  // Data helpers
  function getAirports() {
    if (typeof AIRPORTS_DATABASE !== 'undefined' && Array.isArray(AIRPORTS_DATABASE)) {
      return AIRPORTS_DATABASE;
    }
    if (typeof window !== 'undefined' && typeof window.AIRPORTS_DATABASE !== 'undefined' && Array.isArray(window.AIRPORTS_DATABASE)) {
      return window.AIRPORTS_DATABASE;
    }
    return [];
  }

  function getAirport(iata) {
    if (!iata) return null;
    const code = iata.toUpperCase().trim();
    return getAirports().find(a => a.iata === code) || null;
  }

  function getAircraftList() {
    if (typeof AIRCRAFT_DATABASE !== 'undefined' && Array.isArray(AIRCRAFT_DATABASE)) {
      return AIRCRAFT_DATABASE;
    }
    if (typeof window !== 'undefined' && typeof window.AIRCRAFT_DATABASE !== 'undefined' && Array.isArray(window.AIRCRAFT_DATABASE)) {
      return window.AIRCRAFT_DATABASE;
    }
    return [];
  }

  function getAircraft(id) {
    if (!id) return null;
    const list = getAircraftList();
    return list.find(a => a.id === id) || list[0] || null;
  }

  let cachedCountries = null;
  function getCountries() {
    if (cachedCountries && cachedCountries.length > 0) return cachedCountries;
    const airports = getAirports();
    const cMap = {};
    airports.forEach(a => {
      if (!a.country) return;
      if (!cMap[a.country]) {
        cMap[a.country] = {
          name: a.country,
          continent: CF_C_CONTINENT_MAP[a.country] || 'Other',
          count: 0
        };
      }
      cMap[a.country].count++;
    });
    cachedCountries = Object.values(cMap).sort((a, b) => a.name.localeCompare(b.name));
    return cachedCountries;
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  function calculateFlightTimeHours(distKm, speedKmh) {
    if (!speedKmh || speedKmh <= 0) speedKmh = 850;
    const rawFlight = (distKm / speedKmh) * 2; // Round-trip
    const totalFlightHours = rawFlight + 2; // + 2h standard turnaround
    return Math.round(totalFlightHours * 4) / 4; // Round to nearest 15 mins (0.25h)
  }

  function formatHoursMinutes(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }

  function formatPriceShort(price) {
    if (!price) return '$0M';
    if (price >= 1e9) return `$${(price / 1e9).toFixed(2)}B`;
    if (price >= 1e6) return `$${Math.round(price / 1e6)}M`;
    return `$${price.toLocaleString()}`;
  }

  function computeAirportDemandStats(ap) {
    if (!ap) return { avg: 0, avgFormatted: '0.0', stars: 1, starsText: '★', rawEco: 0, rawBus: 0, rawFirst: 0, rawCargo: 0, label: 'Unknown' };
    const rawEco = ap.economy ?? ap.eco ?? ap.demand_eco ?? ap.eco_demand ?? 10;
    const rawBus = ap.business ?? ap.bus ?? ap.demand_bus ?? ap.bus_demand ?? 3;
    const rawFirst = ap.first ?? ap.demand_first ?? ap.first_demand ?? 1;
    const rawCargo = ap.cargo ?? ap.cargo_demand ?? 2;
    const avg = (rawEco + rawBus + rawFirst) / 3;

    let stars = 1;
    let label = 'Light';
    if (avg >= 30 || rawEco >= 3400) { stars = 5; label = 'Global Mega-Hub'; }
    else if (avg >= 22 || rawEco >= 2800) { stars = 4; label = 'Major International'; }
    else if (avg >= 15 || rawEco >= 2200) { stars = 3; label = 'Strong Regional'; }
    else if (avg >= 8 || rawEco >= 1600) { stars = 2; label = 'Moderate'; }

    return {
      avg,
      avgFormatted: avg.toFixed(1),
      rawEco,
      rawBus,
      rawFirst,
      rawCargo,
      stars,
      starsText: '★'.repeat(stars),
      label
    };
  }

  function loadPersistedData() {
    try {
      const saved = localStorage.getItem(SAVED_CIRCUITS_KEY);
      if (saved) state.savedCircuits = JSON.parse(saved);
    } catch (e) {}
  }

  function saveCircuitsLibrary() {
    try {
      localStorage.setItem(SAVED_CIRCUITS_KEY, JSON.stringify(state.savedCircuits));
    } catch (e) {}
  }

  function detectMultiIata(str) {
    if (!str) return null;
    const tokens = str.toUpperCase().match(/[A-Z]{3}/g);
    if (tokens && tokens.length > 1) return tokens;
    return null;
  }

  function toast(msg, type = 'info') {
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(msg, type);
      return;
    }
    if (typeof document === 'undefined' || !document.getElementById) {
      return;
    }
    let el = document.getElementById('cf_toast_msg');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cf_toast_msg';
      el.className = 'cf-toast';
      document.body.appendChild(el);
    }
    const icon = type === 'success' ? '✓' : type === 'warn' ? '⚠' : 'ℹ';
    el.innerHTML = `<span style="color: var(--sc-${type === 'success' ? 'good' : type === 'warn' ? 'warn' : 'cyan'}); font-weight: bold;">${icon}</span> <span>${msg}</span>`;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  // =========================================================================
  // CORE SOLVER (MATCHES OPTION 1 LOGIC)
  // =========================================================================
  function findCircuits() {
    const startBenchmark = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const hub = getAirport(state.hub);
    const ac = getAircraft(state.aircraftId);

    if (!hub) {
      toast(`Hub airport ${state.hub} not found`, 'warn');
      return [];
    }
    if (!ac) {
      toast(`Aircraft ${state.aircraftId} not found`, 'warn');
      return [];
    }

    const airports = getAirports();
    const candidateLegs = [];

    for (const ap of airports) {
      if (ap.iata === hub.iata) continue;
      if (state.requireCatMatch && ap.cat < ac.category) continue;

      const continent = CF_C_CONTINENT_MAP[ap.country] || 'Other';
      if (state.continent !== 'all' && continent !== state.continent) continue;

      if (state.excludedAirports.includes(ap.iata)) continue;
      if (state.excludedCountries.includes(ap.country)) continue;

      const dist = haversineDistance(hub.lat, hub.lon, ap.lat, ap.lon);
      if (dist > ac.range_km) continue;
      if (state.maxDistLimit && dist > state.maxDistLimit) continue;

      const dur = calculateFlightTimeHours(dist, ac.speed_kmh);
      if (state.routeType === 'sh' && dur > 8) continue;
      if (state.routeType === 'mh' && (dur <= 8 || dur > 16)) continue;
      if (state.routeType === 'lh' && dur <= 16) continue;

      const demand = computeAirportDemandStats(ap);
      if (demand.stars < state.minStars) continue;

      const w = state.weights;
      const score = (demand.rawEco * w.eco) + (demand.rawBus * w.bus * 1.5) + (demand.rawFirst * w.first * 2.2) + (demand.rawCargo * (w.cargo || 0) * 0.5);

      candidateLegs.push({
        hubIata: hub.iata,
        dstIata: ap.iata,
        name: ap.name,
        city: ap.city,
        country: ap.country,
        cat: ap.cat,
        dist,
        dur,
        flightDurText: formatHoursMinutes(dur),
        ticks: Math.round(dur * 4),
        demand,
        score
      });
    }

    if (candidateLegs.length === 0) {
      state.discoveredCircuits = [];
      state.benchmarkMs = Math.round(performance.now() - startBenchmark);
      return [];
    }

    candidateLegs.sort((a, b) => b.score - a.score);

    const targetHours = state.targetHours;
    const targetTicks = Math.round(targetHours * 4);
    const slackTicks = Math.round(state.slackHours * 4);
    const minTicks = targetTicks - slackTicks;
    const maxTicks = targetTicks;

    let targetLegCount = null;
    if (state.routeCount !== 'any') targetLegCount = parseInt(state.routeCount, 10);

    const mustFlyIatas = new Set([
      ...state.includedAirports,
      ...candidateLegs.filter(l => state.includedCountries.includes(l.country)).map(l => l.dstIata)
    ]);

    const mustFlyLegs = candidateLegs.filter(l => mustFlyIatas.has(l.dstIata));
    const pool = candidateLegs.slice(0, 75);

    const allCircuits = [];
    const seenSignatures = new Set();

    function backtrack(startIndex, currentLegs, currentTicks) {
      if (allCircuits.length >= 60) return;

      if (currentTicks >= minTicks && currentTicks <= maxTicks) {
        if (!targetLegCount || currentLegs.length === targetLegCount) {
          let hasAllMust = true;
          for (const m of mustFlyLegs) {
            if (!currentLegs.some(l => l.dstIata === m.dstIata)) {
              hasAllMust = false;
              break;
            }
          }

          if (hasAllMust) {
            const sig = [...currentLegs].map(l => l.dstIata).sort().join('-');
            if (!seenSignatures.has(sig)) {
              seenSignatures.add(sig);
              allCircuits.push([...currentLegs]);
            }
          }
        }
      }

      if (currentTicks >= maxTicks) return;
      if (targetLegCount && currentLegs.length >= targetLegCount) return;

      for (let i = startIndex; i < pool.length; i++) {
        const nextLeg = pool[i];
        if (currentTicks + nextLeg.ticks > maxTicks) continue;
        if (currentLegs.some(l => l.dstIata === nextLeg.dstIata)) continue;

        currentLegs.push(nextLeg);
        backtrack(i + 1, currentLegs, currentTicks + nextLeg.ticks);
        currentLegs.pop();

        if (allCircuits.length >= 60) break;
      }
    }

    const initLegs = [...mustFlyLegs];
    const initTicks = initLegs.reduce((sum, l) => sum + l.ticks, 0);
    if (initTicks <= maxTicks) {
      backtrack(0, initLegs, initTicks);
    }

    // Heuristic randomized greedy generation if backtracking found few
    if (allCircuits.length < 15 && pool.length >= 4) {
      for (let attempt = 0; attempt < 800 && allCircuits.length < 40; attempt++) {
        const chosen = [...mustFlyLegs];
        let ticks = initTicks;
        const shuffled = [...pool].sort(() => Math.random() - 0.45);

        for (const leg of shuffled) {
          if (chosen.some(l => l.dstIata === leg.dstIata)) continue;
          if (ticks + leg.ticks <= maxTicks) {
            chosen.push(leg);
            ticks += leg.ticks;
            if (targetLegCount && chosen.length === targetLegCount && ticks >= minTicks) break;
          }
          if (ticks >= minTicks && (!targetLegCount || chosen.length === targetLegCount)) break;
        }

        if (ticks >= minTicks && ticks <= maxTicks && (!targetLegCount || chosen.length === targetLegCount)) {
          const sig = chosen.map(l => l.dstIata).sort().join('-');
          if (!seenSignatures.has(sig)) {
            seenSignatures.add(sig);
            allCircuits.push(chosen);
          }
        }
      }
    }

    // Format circuits
    const formattedCircuits = allCircuits.map((chosenLegs, idx) => {
      const totalDurHours = chosenLegs.reduce((sum, l) => sum + l.dur, 0);
      const totalSlackHours = Math.max(0, targetHours - totalDurHours);
      const utilizationPct = (totalDurHours / targetHours) * 100;
      const totalDistance = chosenLegs.reduce((sum, l) => sum + l.dist * 2, 0);

      const totalEco = chosenLegs.reduce((sum, l) => sum + l.demand.rawEco, 0);
      const totalBus = chosenLegs.reduce((sum, l) => sum + l.demand.rawBus, 0);
      const totalFirst = chosenLegs.reduce((sum, l) => sum + l.demand.rawFirst, 0);
      const totalCargo = chosenLegs.reduce((sum, l) => sum + l.demand.rawCargo, 0);
      const avgStars = chosenLegs.reduce((sum, l) => sum + l.demand.stars, 0) / chosenLegs.length;

      let harmonySum = 0;
      for (const l of chosenLegs) {
        const rEco = l.demand.rawEco / (totalEco || 1);
        const rBus = l.demand.rawBus / (totalBus || 1);
        const diff = Math.abs(rEco - rBus);
        harmonySum += Math.max(0, 1 - (diff * 2));
      }
      const harmonyScore = Math.min(100, Math.round((harmonySum / chosenLegs.length) * 100));
      const fleetSize = (targetHours === 168) ? 7 : (targetHours === 24) ? 1 : Math.max(1, Math.round(targetHours / 24));

      return {
        id: `circuit-${hub.iata}-${Date.now()}-${idx}`,
        name: `${hub.iata} ${targetHours}h · ${chosenLegs.length} Routes (${ac.name})`,
        hubIata: hub.iata,
        hubCat: hub.cat,
        aircraftId: ac.id,
        aircraftName: ac.name,
        aircraftCat: ac.category,
        targetHours,
        totalDurHours,
        totalDurText: formatHoursMinutes(totalDurHours),
        slackHours: totalSlackHours,
        slackText: formatHoursMinutes(totalSlackHours),
        utilizationPct: utilizationPct.toFixed(1),
        weeklyDistanceKm: totalDistance,
        fleetSize,
        circuitStars: avgStars.toFixed(1),
        starsText: '★'.repeat(Math.round(avgStars)),
        harmonyScore,
        legs: chosenLegs,
        demandTotals: { eco: totalEco, bus: totalBus, first: totalFirst, cargo: totalCargo }
      };
    });

    // Sort by chosen goal
    formattedCircuits.sort((a, b) => {
      if (state.sortMetric === 'demand_desc') {
        const da = a.demandTotals.eco + a.demandTotals.bus * 2 + a.demandTotals.first * 3;
        const db = b.demandTotals.eco + b.demandTotals.bus * 2 + b.demandTotals.first * 3;
        return db - da;
      }
      if (state.sortMetric === 'harmony_desc') return b.harmonyScore - a.harmonyScore;
      if (state.sortMetric === 'distance_desc') return b.weeklyDistanceKm - a.weeklyDistanceKm;
      if (state.sortMetric === 'slack_asc') return a.slackHours - b.slackHours;
      return parseFloat(b.circuitStars) - parseFloat(a.circuitStars) || b.harmonyScore - a.harmonyScore;
    });

    state.discoveredCircuits = formattedCircuits;
    state.benchmarkMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - startBenchmark);
    return formattedCircuits;
  }

  // =========================================================================
  // ROUTE SWAP LOGIC
  // =========================================================================
  function getSwapCandidates(circuitIdx, legIdx) {
    const circuit = state.discoveredCircuits[circuitIdx];
    if (!circuit || !circuit.legs[legIdx]) return [];

    const targetLeg = circuit.legs[legIdx];
    const targetTicks = targetLeg.ticks;
    const ac = getAircraft(circuit.aircraftId);
    if (!ac) return [];

    const hub = getAirport(circuit.hubIata);
    if (!hub) return [];

    const currentIatas = new Set(circuit.legs.map(l => l.dstIata));
    const airports = getAirports();
    const candidates = [];

    for (const dst of airports) {
      if (dst.iata === hub.iata) continue;
      if (currentIatas.has(dst.iata)) continue;
      if (state.requireCatMatch && dst.cat < ac.category) continue;

      const dist = haversineDistance(hub.lat, hub.lon, dst.lat, dst.lon);
      if (dist > ac.range_km) continue;

      const dur = calculateFlightTimeHours(dist, ac.speed_kmh);
      const ticks = Math.round(dur * 4);

      if (ticks === targetTicks) {
        const demand = computeAirportDemandStats(dst);
        candidates.push({
          hubIata: hub.iata,
          dstIata: dst.iata,
          name: dst.name,
          city: dst.city,
          country: dst.country,
          cat: dst.cat,
          dist,
          dur,
          flightDurText: formatHoursMinutes(dur),
          ticks,
          demand
        });
      }
    }

    candidates.sort((a, b) => b.demand.rawEco - a.demand.rawEco);
    return candidates;
  }

  function swapLeg(circuitIdx, legIdx, newDstIata) {
    const circuit = state.discoveredCircuits[circuitIdx];
    if (!circuit || !circuit.legs[legIdx]) return false;

    const newDst = getAirport(newDstIata);
    if (!newDst) return false;

    const ac = getAircraft(circuit.aircraftId);
    const hub = getAirport(circuit.hubIata);
    const dist = haversineDistance(hub.lat, hub.lon, newDst.lat, newDst.lon);
    const dur = calculateFlightTimeHours(dist, ac.speed_kmh);
    const demand = computeAirportDemandStats(newDst);

    circuit.legs[legIdx] = {
      hubIata: hub.iata,
      dstIata: newDst.iata,
      name: newDst.name,
      city: newDst.city,
      country: newDst.country,
      cat: newDst.cat,
      dist,
      dur,
      flightDurText: formatHoursMinutes(dur),
      ticks: Math.round(dur * 4),
      demand,
      score: (demand.rawEco * 0.6) + (demand.rawBus * 0.5) + (demand.rawFirst * 0.45)
    };

    circuit.demandTotals.eco = circuit.legs.reduce((s, l) => s + l.demand.rawEco, 0);
    circuit.demandTotals.bus = circuit.legs.reduce((s, l) => s + l.demand.rawBus, 0);
    circuit.demandTotals.first = circuit.legs.reduce((s, l) => s + l.demand.rawFirst, 0);
    circuit.demandTotals.cargo = circuit.legs.reduce((s, l) => s + l.demand.rawCargo, 0);
    const avgStars = circuit.legs.reduce((s, l) => s + l.demand.stars, 0) / circuit.legs.length;
    circuit.circuitStars = avgStars.toFixed(1);
    circuit.starsText = '★'.repeat(Math.round(avgStars));

    toast(`Swapped leg ${legIdx + 1} to ${newDst.iata} (${newDst.city})`, 'success');
    return true;
  }

  // =========================================================================
  // SEAT CONFIG BRIDGE & PERSISTENCE
  // =========================================================================
  function transferToSeatConfig(circuitIdx) {
    const c = state.discoveredCircuits[circuitIdx];
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
        durationText: formatHoursMinutes(leg.dur),
        flightsPerDay: 1,
        cargoEnabled: true,
        demand: {
          eco: leg.demand.rawEco,
          bus: leg.demand.rawBus,
          first: leg.demand.rawFirst,
          cargo: leg.demand.rawCargo || 0
        },
        prices: { eco: 0, bus: 0, first: 0, cargo: 0 }
      }))
    };

    try {
      localStorage.setItem('amt_active_circuit_transfer', JSON.stringify(circuitData));
      localStorage.setItem('sc_imported_circuit', JSON.stringify(circuitData));
    } catch (e) {}

    if (typeof window.transferRouteFinderCircuitToSeatConfig === 'function') {
      window.transferRouteFinderCircuitToSeatConfig(circuitData);
    } else if (typeof window.switchTab === 'function') {
      window.switchTab('seat-config');
      if (typeof window.loadSavedCircuit === 'function') {
        window.loadSavedCircuit(circuitData);
      }
    }

    toast(`Loaded ${c.hubIata} ${c.targetHours}h Circuit into Seat Configurator!`, 'success');
  }

  function saveCircuit(circuitIdx) {
    const c = state.discoveredCircuits[circuitIdx];
    if (!c) return false;

    const entry = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${c.hubIata} ${c.targetHours}h (${c.legs.length} Routes) · ${c.aircraftName}`,
      savedAt: new Date().toISOString(),
      hub: c.hubIata,
      targetHours: c.targetHours,
      aircraftId: c.aircraftId,
      aircraftName: c.aircraftName,
      totalDurText: c.totalDurText,
      slackText: c.slackText,
      utilizationPct: c.utilizationPct,
      weeklyDistanceKm: c.weeklyDistanceKm,
      harmonyScore: c.harmonyScore,
      circuitStars: c.circuitStars,
      fleetSize: c.fleetSize,
      legs: c.legs
    };

    state.savedCircuits.unshift(entry);
    saveCircuitsLibrary();
    updateSavedBadges();
    renderSavedLibrary();
    toast(`Saved circuit "${entry.name}"`, 'success');
    return true;
  }

  function deleteSavedCircuit(id) {
    state.savedCircuits = state.savedCircuits.filter(item => item.id !== id);
    saveCircuitsLibrary();
    updateSavedBadges();
    renderSavedLibrary();
    toast('Circuit removed from library', 'info');
  }

  function exportCircuitsJson() {
    if (state.savedCircuits.length === 0) {
      toast('No saved circuits to export', 'warn');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.savedCircuits, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `amt_circuits_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast('Exported circuits JSON file', 'success');
  }

  function copyCircuitSummary(circuitIdx) {
    const c = state.discoveredCircuits[circuitIdx];
    if (!c) return;

    const lines = [
      `=== AMT CIRCUIT: ${c.hubIata} (${c.targetHours}h Rotation) ===`,
      `Aircraft: ${c.aircraftName} (Cat ${c.aircraftCat}) | Fleet: ${c.fleetSize} planes`,
      `Total Flight Time: ${c.totalDurText} | Slack: ${c.slackText} | Utilization: ${c.utilizationPct}%`,
      `Distance / Week: ${c.weeklyDistanceKm.toLocaleString()} km | Stars: ${c.starsText} | Harmony: ${c.harmonyScore}%`,
      `Routes (${c.legs.length}):`,
      ...c.legs.map((l, i) => `  ${i + 1}. ${c.hubIata} ✈ ${l.dstIata} (${l.city}, ${l.country}): ${formatHoursMinutes(l.dur)} • ${l.dist.toLocaleString()} km • Cat ${l.cat}`),
      `Generated by Airlines Manager Tycoon Toolkit`
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      toast('Circuit itinerary copied to clipboard!', 'success');
    }).catch(() => {
      toast('Copied itinerary!', 'success');
    });
  }

  // =========================================================================
  // DOM RENDERING & TAB WORKFLOW
  // =========================================================================
  function renderShell() {
    const cont = document.getElementById('circuit_finder_compact_container');
    if (!cont) return;

    cont.innerHTML = `
      <div class="cf-compact-container">
        <!-- Chrome Header -->
        <div class="cf-chrome-header">
          <div class="cf-chrome-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #22d3ee;">
              <circle cx="5" cy="5" r="2"></circle>
              <circle cx="19" cy="19" r="2"></circle>
              <path d="M7 5h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h5m0-3 3 3-3 3"></path>
            </svg>
            <span>Circuit Finder</span>
            <span class="cf-chrome-badge">COMPACT TABS</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span id="cf_c_header_status_pill" class="badge-pill cyan">168h · 7 Planes</span>
          </div>
        </div>

        <!-- Clean Topline: Hub Input + Aircraft Combobox -->
        <div class="sc-topline" id="cf_c_topline">
          <!-- Hub Input -->
          <input type="text" id="cf_c_hub_input" maxlength="3" value="${state.hub}" placeholder="HUB" title="Circuit Departure Hub (e.g. OSL, MPM, DWC)" style="width: 48px; min-width: 48px; text-align: center; font-weight: 700; text-transform: uppercase;">

          <!-- Aircraft Combobox Root -->
          <div class="sc-combobox-root" id="cf_c_ac_combobox_root" style="flex: 1; min-width: 0;">
            <button type="button" class="sc-combobox-trigger" id="cf_c_ac_trigger" title="Select aircraft model">
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" id="cf_c_ac_trigger_label">A380-800</span>
              <span class="sc-tag" id="cf_c_ac_cat_badge" style="color: var(--sc-cyan); border-color: rgba(34, 211, 238, 0.3);">Cat 9</span>
            </button>

            <!-- Searchable Aircraft Popover -->
            <div class="sc-combobox-popover" id="cf_c_ac_popover" style="display: none;">
              <div class="sc-combobox-header">
                <input type="text" id="cf_c_ac_search" placeholder="Search aircraft (e.g. 747, A350, neo)…">
                <div style="display: flex; align-items: center; gap: 3px;" id="cf_c_ac_haul_chips">
                  <button type="button" class="sc-chip active" data-haul="all">All</button>
                  <button type="button" class="sc-chip" data-haul="Long-Haul">Long</button>
                  <button type="button" class="sc-chip" data-haul="Medium-Haul">Med</button>
                  <button type="button" class="sc-chip" data-haul="Short-Haul">Short</button>
                  <span id="cf_c_ac_count_label" style="margin-left: auto; font-size: 8px; color: var(--sc-text-muted); font-family: ui-monospace, monospace;"></span>
                </div>
              </div>
              <div class="sc-combobox-list" id="cf_c_ac_list"></div>
            </div>
          </div>
        </div>

        <!-- Statusline Strip -->
        <div class="sc-statusline" id="cf_c_statusline">
          <span id="cf_c_status_hub_tag" class="sc-route-tag">OSL · Cat 8</span>
          <span><b id="cf_c_status_rotation">168h Rotation</b> · <span id="cf_c_status_fleet">7 Planes</span></span>
          <span id="cf_c_status_results_count"><b>0</b> circuits found</span>
          <span class="sc-good" id="cf_c_status_util">100.0% util</span>
        </div>

        <!-- Workspace Tabs: 1. Criteria · 2. Circuits · 3. Saved -->
        <div class="sc_layout_tabs" style="grid-template-columns: repeat(3, 1fr);" role="tablist" aria-label="Circuit Finder workspace tabs">
          <button type="button" role="tab" id="cf_c_tab_criteria" class="active" aria-selected="true" data-tab="criteria">
            Criteria &amp; Scope
          </button>
          <button type="button" role="tab" id="cf_c_tab_circuits" aria-selected="false" data-tab="circuits">
            Circuits <span class="sc-tab-badge" id="cf_c_tab_badge_circuits">0</span>
          </button>
          <button type="button" role="tab" id="cf_c_tab_saved" aria-selected="false" data-tab="saved">
            Saved <span class="sc-tab-badge" id="cf_c_tab_badge_saved">0</span>
          </button>
        </div>

        <!-- ==================== TAB 1: CRITERIA & TARGETING ==================== -->
        <div class="tab-pane" id="cf_c_pane_criteria">
          <!-- Card 1: Rotation & Timing Bounds -->
          <div class="sc-card">
            <div class="sc-section-title">
              <strong>⏱ Rotation &amp; Timing Bounds</strong>
              <span class="sc-muted">AMT Standard 168h / 24h</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">TARGET DURATION</label>
                <select id="cf_c_target_dur" class="sc-input">
                  <option value="168" selected>168h · 7-Day (7 Planes)</option>
                  <option value="24">24h · Daily Single Plane</option>
                  <option value="48">48h · 2-Day Rotation</option>
                  <option value="72">72h · 3-Day Rotation</option>
                  <option value="84">84h · 3.5-Day (2x/wk)</option>
                  <option value="120">120h · 5-Day Rotation</option>
                  <option value="144">144h · 6-Day Rotation</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">MAX SLACK (TOLERANCE)</label>
                <select id="cf_c_slack" class="sc-input">
                  <option value="0" selected>0h 00m (100% Exact Fit)</option>
                  <option value="0.5">≤ 0h 30m Slack (99.7%)</option>
                  <option value="1.0">≤ 1h 00m Slack (99.4%)</option>
                  <option value="2.0">≤ 2h 00m Slack (98.8%)</option>
                </select>
              </div>
            </div>

            <!-- Haul Type Profile Chips -->
            <div>
              <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">ROUTE TYPE (FLIGHT LENGTH)</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;" id="cf_c_haul_chips_group">
                <button type="button" class="sc-chip" data-type="mix">Mix / Any</button>
                <button type="button" class="sc-chip" data-type="sh">⚡ Short (≤8h)</button>
                <button type="button" class="sc-chip" data-type="mh">✈ Med (8-16h)</button>
                <button type="button" class="sc-chip active" data-type="lh">🌍 Long (≥16h)</button>
              </div>
            </div>

            <!-- Route Count & Optimization Goal -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">CIRCUIT ROUTE COUNT</label>
                <select id="cf_c_route_count" class="sc-input">
                  <option value="any" selected>Any (4 to 9 legs)</option>
                  <option value="5">5 Routes (~33h avg)</option>
                  <option value="6">6 Routes (~28h avg)</option>
                  <option value="7">7 Routes (~24h avg) · Classic</option>
                  <option value="8">8 Routes (~21h avg)</option>
                  <option value="9">9 Routes (~18h avg)</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">OPTIMIZATION GOAL</label>
                <select id="cf_c_sort_metric" class="sc-input">
                  <option value="stars_desc" selected>Demand Star Rating</option>
                  <option value="demand_desc">Total Demand Volume</option>
                  <option value="harmony_desc">Cabin Harmony %</option>
                  <option value="distance_desc">Weekly Distance</option>
                  <option value="slack_asc">Shortest Slack</option>
                </select>
              </div>
            </div>

            <!-- Class Multiplier Strategy -->
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
                <label style="font-size: 8px; color: var(--sc-text-muted);">CLASS MULTIPLIER STRATEGY</label>
                <span id="cf_c_weights_label" style="font-size: 8px; font-family: ui-monospace, monospace; color: var(--sc-cyan);">Y: 60% · J: 25% · F: 15%</span>
              </div>
              <select id="cf_c_strategy" class="sc-input">
                <option value="tri_class" selected>Balanced Tri-Class (60/25/15)</option>
                <option value="eco">100% Economy Focus</option>
                <option value="premium">Premium Luxury (25/45/30)</option>
                <option value="cargo">Cargo Hybrid (40/20/10/30)</option>
                <option value="custom">Custom Sliders…</option>
              </select>
            </div>

            <!-- Collapsible Custom Sliders -->
            <div id="cf_c_custom_sliders_box" style="display: none; padding: 4px 6px; background: #060c18; border: 1px solid var(--sc-border-input); border-radius: 5px; gap: 4px; flex-direction: column;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
                <div>
                  <span style="font-size: 8px; color: var(--sc-eco);">Y: <span id="cf_c_val_weight_eco">60</span>%</span>
                  <input type="range" id="cf_c_slider_weight_eco" min="0" max="100" value="60" style="width: 100%;">
                </div>
                <div>
                  <span style="font-size: 8px; color: var(--sc-bus);">J: <span id="cf_c_val_weight_bus">25</span>%</span>
                  <input type="range" id="cf_c_slider_weight_bus" min="0" max="100" value="25" style="width: 100%;">
                </div>
                <div>
                  <span style="font-size: 8px; color: var(--sc-first);">F: <span id="cf_c_val_weight_first">15</span>%</span>
                  <input type="range" id="cf_c_slider_weight_first" min="0" max="100" value="15" style="width: 100%;">
                </div>
                <div>
                  <span style="font-size: 8px; color: var(--sc-cargo);">C: <span id="cf_c_val_weight_cargo">5</span>%</span>
                  <input type="range" id="cf_c_slider_weight_cargo" min="0" max="100" value="5" style="width: 100%;">
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: Network Targeting & Scope -->
          <div class="sc-card">
            <div class="sc-section-title">
              <strong>🎯 Network Targeting &amp; Scope</strong>
              <label style="display: flex; align-items: center; gap: 4px; font-size: 9px; cursor: pointer;">
                <input type="checkbox" id="cf_c_check_cat_match" checked style="width: 12px; height: 12px;">
                <span>Cat Match Only</span>
              </label>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <div>
                <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">MIN DEMAND STARS</label>
                <select id="cf_c_min_stars" class="sc-input">
                  <option value="0">★ Any Star Rating</option>
                  <option value="2">★★ ≥ 2 Stars (Moderate)</option>
                  <option value="3" selected>★★★ ≥ 3 Stars (Strong)</option>
                  <option value="4">★★★★ ≥ 4 Stars (Major)</option>
                  <option value="5">★★★★★ 5 Stars Only (Mega)</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-size: 8px; color: var(--sc-text-muted); margin-bottom: 2px;">CONTINENT SCOPE</label>
                <select id="cf_c_continent" class="sc-input">
                  <option value="all" selected>Worldwide (All)</option>
                  <option value="Africa">Africa</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>
            </div>

            <!-- Distance Capping -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
              <label style="display: flex; align-items: center; gap: 4px; font-size: 9px; cursor: pointer; color: var(--sc-text-muted);">
                <input type="checkbox" id="cf_c_check_dist_cap" style="width: 12px; height: 12px;">
                <span>Cap Leg Distance:</span>
              </label>
              <div style="display: flex; align-items: center; gap: 3px;">
                <input type="number" id="cf_c_dist_cap_input" disabled value="15000" style="width: 80px; padding: 2px 4px; font-size: 10px; font-family: ui-monospace, monospace; background: var(--sc-bg-input); border: 1px solid var(--sc-border-input); border-radius: 4px; color: #fff;">
                <span style="font-size: 8px; color: var(--sc-text-muted); font-family: ui-monospace, monospace;">km</span>
              </div>
            </div>

            <!-- Must Include Box -->
            <div id="cf_c_inc_box_wrapper" style="padding: 5px 6px; background: #060c18; border: 1px solid var(--sc-border-input); border-radius: 5px; display: flex; flex-direction: column; gap: 4px; position: relative;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 9px; font-weight: 700; color: #6ee7b7;">✈ Must-Include Routes (Must-Fly)</span>
                <div style="display: flex; gap: 2px;">
                  <button type="button" class="sc-chip active" id="cf_c_btn_inc_ap">Airports</button>
                  <button type="button" class="sc-chip" id="cf_c_btn_inc_ct">Country</button>
                </div>
              </div>
              <div style="position: relative; display: flex; gap: 4px;">
                <input type="text" id="cf_c_inc_input" placeholder="Search airport (e.g. CPH, BKK, Tokyo) or paste IATAs..." autocomplete="off" style="flex: 1; padding: 3px 5px; font-size: 9px; background: var(--sc-bg-input); border: 1px solid var(--sc-border-input); border-radius: 4px; color: #fff;">
                <button type="button" id="cf_c_btn_add_inc" style="padding: 2px 6px; font-size: 9px; background: #064e3b; border: 1px solid #059669; color: #a7f3d0; border-radius: 4px; cursor: pointer; white-space: nowrap;">+ Add</button>
                <div id="cf_c_inc_dropdown" class="cf-autocomplete-dropdown" style="display: none;"></div>
              </div>
              <div id="cf_c_inc_chips" style="display: flex; flex-wrap: wrap; gap: 3px; min-height: 16px;"></div>
            </div>

            <!-- Avoid / Exclude Box -->
            <div id="cf_c_exc_box_wrapper" style="padding: 5px 6px; background: #060c18; border: 1px solid var(--sc-border-input); border-radius: 5px; display: flex; flex-direction: column; gap: 4px; position: relative;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 9px; font-weight: 700; color: #fca5a5;">🚫 Avoid / Exclude</span>
                <div style="display: flex; gap: 2px;">
                  <button type="button" class="sc-chip active" id="cf_c_btn_exc_ap">Airports</button>
                  <button type="button" class="sc-chip" id="cf_c_btn_exc_ct">Country</button>
                </div>
              </div>
              <div style="position: relative; display: flex; gap: 4px;">
                <input type="text" id="cf_c_exc_input" placeholder="Search airport to avoid (e.g. BAX, OVB, Moscow)..." autocomplete="off" style="flex: 1; padding: 3px 5px; font-size: 9px; background: var(--sc-bg-input); border: 1px solid var(--sc-border-input); border-radius: 4px; color: #fff;">
                <button type="button" id="cf_c_btn_add_exc" style="padding: 2px 6px; font-size: 9px; background: #7f1d1d; border: 1px solid #b91c1c; color: #fecaca; border-radius: 4px; cursor: pointer; white-space: nowrap;">+ Add</button>
                <div id="cf_c_exc_dropdown" class="cf-autocomplete-dropdown" style="display: none;"></div>
              </div>
              <div id="cf_c_exc_chips" style="display: flex; flex-wrap: wrap; gap: 3px; min-height: 16px;"></div>
            </div>
          </div>
        </div>

        <!-- ==================== TAB 2: CIRCUITS (RESULTS) ==================== -->
        <div class="tab-pane" id="cf_c_pane_circuits" hidden>
          <!-- Quick View Filter Bar -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 4px; font-size: 9px;">
            <span style="color: var(--sc-text-muted);">
              Found <b id="cf_c_results_count_num" style="color: var(--sc-cyan);">0</b> circuits (<span id="cf_c_results_benchmark">0</span>ms)
            </span>
            <div style="display: flex; gap: 3px;">
              <button type="button" class="sc-chip active" id="cf_c_filter_all">All</button>
              <button type="button" class="sc-chip" id="cf_c_filter_exact">Exact Fit</button>
              <button type="button" class="sc-chip" id="cf_c_filter_harmony">≥95% Harmony</button>
            </div>
          </div>

          <!-- Circuits Results List -->
          <div id="cf_c_circuits_list" style="display: flex; flex-direction: column; gap: 5px;"></div>

          <!-- Empty State -->
          <div id="cf_c_empty_state" class="sc-card" style="text-align: center; padding: 18px 10px;">
            <div style="font-size: 18px; margin-bottom: 4px;">📍</div>
            <strong style="color: #fff; font-size: 11px;">Ready to Discover Circuits</strong>
            <p style="font-size: 9px; color: var(--sc-text-muted); margin: 3px 0 8px;">
              Click "Find Circuits" below to compute optimal rotations for <span id="cf_c_empty_state_hub" style="color: var(--sc-cyan); font-weight: 700;">OSL</span>.
            </p>
            <button type="button" id="cf_c_btn_empty_find" style="align-self: center; padding: 4px 10px; background: #082d25; border: 1px solid #135546; color: #a7f3d0; border-radius: 5px; font-weight: 700; font-size: 10px; cursor: pointer;">
              ⚡ Find Circuits Now
            </button>
          </div>
        </div>

        <!-- ==================== TAB 3: SAVED LIBRARY ==================== -->
        <div class="tab-pane" id="cf_c_pane_saved" hidden>
          <div class="sc-card">
            <div class="sc-section-title">
              <strong>💾 Saved Circuits Library</strong>
              <button type="button" id="cf_c_btn_export_json" class="sc-muted" style="background: none; border: none; cursor: pointer; color: var(--sc-cyan); font-weight: 600;">Export JSON ↗</button>
            </div>
            <input type="text" id="cf_c_library_search" placeholder="Search saved circuits by name, hub, or IATA…" class="sc-input">
            <div id="cf_c_saved_list" style="display: flex; flex-direction: column; gap: 4px; max-height: 380px; overflow-y: auto;"></div>
          </div>
        </div>
      </div>

      <!-- Docked Bottom Action Toolbar -->
      <div class="sc_layout_toolbar" id="cf_c_toolbar">
        <button type="button" class="primary" id="cf_c_btn_find_circuits">
          ⚡ Find Circuits
        </button>
        <button type="button" id="cf_c_btn_toolbar_saved">
          💾 Saved (<span id="cf_c_tb_saved_count">0</span>)
        </button>
        <button type="button" id="cf_c_btn_reset_all" style="color: var(--sc-rose);">
          🧹 Reset
        </button>
      </div>

      <!-- ROUTE SWAP MODAL -->
      <div id="cf_c_swap_modal_backdrop" class="cf-modal-backdrop" hidden>
        <div class="cf-modal-dialog">
          <div class="cf-modal-header">
            <div class="cf-modal-title">
              <span>🔄 Swap Circuit Route</span>
              <span id="cf_c_swap_modal_dur" class="badge-pill cyan">24h 00m</span>
            </div>
            <button type="button" class="cf-modal-close" id="cf_c_btn_close_swap">✕</button>
          </div>
          <div class="cf-modal-body">
            <p style="font-size: 9px; color: var(--sc-text-muted); margin-bottom: 2px;">
              Choose an alternative destination with the <b style="color: #fff;">exact same flight time</b> to maintain schedule integrity.
            </p>
            <div id="cf_c_swap_candidates_container" style="display: flex; flex-direction: column; gap: 3px; max-height: 280px; overflow-y: auto;"></div>
          </div>
          <div class="cf-modal-footer">
            <span>Preserves rotation timing 100%</span>
            <button type="button" class="sc-chip" id="cf_c_btn_cancel_swap">Cancel</button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
    state.isMounted = true;
  }

  // =========================================================================
  // EVENT BINDINGS
  // =========================================================================
  function bindEvents() {
    // Tab switching
    const tabBtns = [
      document.getElementById('cf_c_tab_criteria'),
      document.getElementById('cf_c_tab_circuits'),
      document.getElementById('cf_c_tab_saved')
    ].filter(Boolean);

    const tabPanes = {
      criteria: document.getElementById('cf_c_pane_criteria'),
      circuits: document.getElementById('cf_c_pane_circuits'),
      saved: document.getElementById('cf_c_pane_saved')
    };

    function switchTab(tabId) {
      state.activeTab = tabId;
      tabBtns.forEach(b => {
        const match = b.dataset.tab === tabId;
        b.classList.toggle('active', match);
        b.setAttribute('aria-selected', match ? 'true' : 'false');
      });
      Object.keys(tabPanes).forEach(k => {
        if (tabPanes[k]) tabPanes[k].hidden = (k !== tabId);
      });
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Hub Input
    const hubInput = document.getElementById('cf_c_hub_input');
    if (hubInput) {
      hubInput.addEventListener('input', () => {
        hubInput.value = hubInput.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      });
      hubInput.addEventListener('change', () => {
        const val = hubInput.value.trim().toUpperCase() || 'OSL';
        state.hub = val;
        hubInput.value = val;
        window.CIRCUIT_HUB = val;
        const desktopHub = document.getElementById('cf_circuit_hub');
        if (desktopHub) desktopHub.value = val;
        updateStatusline();
      });
    }

    // Aircraft Combobox
    const acTrigger = document.getElementById('cf_c_ac_trigger');
    const acPopover = document.getElementById('cf_c_ac_popover');
    const acSearch = document.getElementById('cf_c_ac_search');

    if (acTrigger && acPopover) {
      acTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        state.acPopoverOpen = !state.acPopoverOpen;
        acPopover.style.display = state.acPopoverOpen ? 'flex' : 'none';
        if (state.acPopoverOpen) {
          if (acSearch) {
            acSearch.value = '';
            acSearch.focus();
          }
          renderAircraftList();
        }
      });

      document.addEventListener('click', (e) => {
        const root = document.getElementById('cf_c_ac_combobox_root');
        if (root && !root.contains(e.target)) {
          state.acPopoverOpen = false;
          acPopover.style.display = 'none';
        }
      });
    }

    if (acSearch) {
      acSearch.addEventListener('input', renderAircraftList);
    }

    document.querySelectorAll('#cf_c_ac_haul_chips .sc-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#cf_c_ac_haul_chips .sc-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentHaulFilter = chip.dataset.haul;
        renderAircraftList();
      });
    });

    // Criteria Inputs
    const targetDurSelect = document.getElementById('cf_c_target_dur');
    if (targetDurSelect) {
      targetDurSelect.addEventListener('change', () => {
        state.targetHours = parseFloat(targetDurSelect.value);
        updateStatusline();
      });
    }

    const slackSelect = document.getElementById('cf_c_slack');
    if (slackSelect) {
      slackSelect.addEventListener('change', () => {
        state.slackHours = parseFloat(slackSelect.value);
      });
    }

    const routeCountSelect = document.getElementById('cf_c_route_count');
    if (routeCountSelect) {
      routeCountSelect.addEventListener('change', () => {
        state.routeCount = routeCountSelect.value;
      });
    }

    const sortMetricSelect = document.getElementById('cf_c_sort_metric');
    if (sortMetricSelect) {
      sortMetricSelect.addEventListener('change', () => {
        state.sortMetric = sortMetricSelect.value;
      });
    }

    document.querySelectorAll('#cf_c_haul_chips_group .sc-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#cf_c_haul_chips_group .sc-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.routeType = btn.dataset.type;
      });
    });

    // Strategy & Custom Sliders
    const stratSelect = document.getElementById('cf_c_strategy');
    const slidersBox = document.getElementById('cf_c_custom_sliders_box');
    if (stratSelect) {
      stratSelect.addEventListener('change', () => {
        const val = stratSelect.value;
        state.strategy = val;
        if (val === 'custom') {
          if (slidersBox) slidersBox.style.display = 'flex';
        } else {
          if (slidersBox) slidersBox.style.display = 'none';
          const p = STRATEGY_PRESETS[val];
          if (p) state.weights = { eco: p.eco, bus: p.bus, first: p.first, cargo: p.cargo };
        }
        updateStrategyLabel();
      });
    }

    ['eco', 'bus', 'first', 'cargo'].forEach(c => {
      const slider = document.getElementById(`cf_c_slider_weight_${c}`);
      const valSpan = document.getElementById(`cf_c_val_weight_${c}`);
      if (slider) {
        slider.addEventListener('input', () => {
          if (valSpan) valSpan.textContent = slider.value;
          state.weights[c] = parseFloat(slider.value) / 100;
          updateStrategyLabel();
        });
      }
    });

    // Network Targeting
    const minStarsSelect = document.getElementById('cf_c_min_stars');
    if (minStarsSelect) {
      minStarsSelect.addEventListener('change', (e) => {
        state.minStars = parseInt(e.target.value, 10);
      });
    }

    const continentSelect = document.getElementById('cf_c_continent');
    if (continentSelect) {
      continentSelect.addEventListener('change', (e) => {
        state.continent = e.target.value;
      });
    }

    const catMatchCheck = document.getElementById('cf_c_check_cat_match');
    if (catMatchCheck) {
      catMatchCheck.addEventListener('change', (e) => {
        state.requireCatMatch = e.target.checked;
      });
    }

    const distCapCheck = document.getElementById('cf_c_check_dist_cap');
    const distCapInput = document.getElementById('cf_c_dist_cap_input');
    if (distCapCheck && distCapInput) {
      distCapCheck.addEventListener('change', () => {
        distCapInput.disabled = !distCapCheck.checked;
        state.maxDistLimit = distCapCheck.checked ? parseFloat(distCapInput.value) : null;
      });
      distCapInput.addEventListener('change', () => {
        state.maxDistLimit = distCapCheck.checked ? parseFloat(distCapInput.value) : null;
      });
    }

    // Must-Include Controls (Airport / Country Toggle + Autocomplete)
    const btnIncAp = document.getElementById('cf_c_btn_inc_ap');
    const btnIncCt = document.getElementById('cf_c_btn_inc_ct');
    const incInput = document.getElementById('cf_c_inc_input');
    const incDropdown = document.getElementById('cf_c_inc_dropdown');
    const btnAddInc = document.getElementById('cf_c_btn_add_inc');

    if (btnIncAp && btnIncCt && incInput) {
      btnIncAp.addEventListener('click', () => {
        state.includeMode = 'ap';
        btnIncAp.classList.add('active');
        btnIncCt.classList.remove('active');
        incInput.placeholder = 'Search airport (e.g. CPH, BKK, Tokyo) or paste IATAs...';
        incInput.focus();
        renderIncludeDropdown(incInput.value);
      });
      btnIncCt.addEventListener('click', () => {
        state.includeMode = 'ct';
        btnIncCt.classList.add('active');
        btnIncAp.classList.remove('active');
        incInput.placeholder = 'Search country to include... (e.g. Japan, Thailand)';
        incInput.focus();
        renderIncludeDropdown(incInput.value);
      });

      incInput.addEventListener('focus', () => renderIncludeDropdown(incInput.value));
      incInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const multi = detectMultiIata(val);
        if (multi && state.includeMode === 'ap') {
          multi.forEach(code => {
            if (getAirport(code)) addIncludeAirport(code);
          });
          return;
        }
        renderIncludeDropdown(val);
      });

      incInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddInc();
        } else if (e.key === 'Escape') {
          if (incDropdown) incDropdown.style.display = 'none';
        }
      });

      if (btnAddInc) {
        btnAddInc.addEventListener('click', handleAddInc);
      }
    }

    function handleAddInc() {
      if (!incInput) return;
      const val = incInput.value.trim();
      if (!val) return;

      if (state.includeMode === 'ap') {
        const multi = detectMultiIata(val);
        if (multi) {
          multi.forEach(code => { if (getAirport(code)) addIncludeAirport(code); });
          return;
        }
        const match = getAirports().find(a => a.iata.toLowerCase() === val.toLowerCase() || (a.city && a.city.toLowerCase() === val.toLowerCase()));
        if (match) addIncludeAirport(match.iata);
        else if (val.length === 3) addIncludeAirport(val.toUpperCase());
      } else {
        const match = getCountries().find(c => c.name.toLowerCase() === val.toLowerCase() || c.name.toLowerCase().startsWith(val.toLowerCase()));
        if (match) addIncludeCountry(match.name);
      }
    }

    // Avoid / Exclude Controls (Airport / Country Toggle + Autocomplete)
    const btnExcAp = document.getElementById('cf_c_btn_exc_ap');
    const btnExcCt = document.getElementById('cf_c_btn_exc_ct');
    const excInput = document.getElementById('cf_c_exc_input');
    const excDropdown = document.getElementById('cf_c_exc_dropdown');
    const btnAddExc = document.getElementById('cf_c_btn_add_exc');

    if (btnExcAp && btnExcCt && excInput) {
      btnExcAp.addEventListener('click', () => {
        state.excludeMode = 'ap';
        btnExcAp.classList.add('active');
        btnExcCt.classList.remove('active');
        excInput.placeholder = 'Search airport to avoid (e.g. BAX, OVB, Moscow)...';
        excInput.focus();
        renderExcludeDropdown(excInput.value);
      });
      btnExcCt.addEventListener('click', () => {
        state.excludeMode = 'ct';
        btnExcCt.classList.add('active');
        btnExcAp.classList.remove('active');
        excInput.placeholder = 'Search country to exclude... (e.g. Russia, Belarus)';
        excInput.focus();
        renderExcludeDropdown(excInput.value);
      });

      excInput.addEventListener('focus', () => renderExcludeDropdown(excInput.value));
      excInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const multi = detectMultiIata(val);
        if (multi && state.excludeMode === 'ap') {
          multi.forEach(code => {
            if (getAirport(code)) addExcludeAirport(code);
          });
          return;
        }
        renderExcludeDropdown(val);
      });

      excInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddExc();
        } else if (e.key === 'Escape') {
          if (excDropdown) excDropdown.style.display = 'none';
        }
      });

      if (btnAddExc) {
        btnAddExc.addEventListener('click', handleAddExc);
      }
    }

    function handleAddExc() {
      if (!excInput) return;
      const val = excInput.value.trim();
      if (!val) return;

      if (state.excludeMode === 'ap') {
        const multi = detectMultiIata(val);
        if (multi) {
          multi.forEach(code => { if (getAirport(code)) addExcludeAirport(code); });
          return;
        }
        const match = getAirports().find(a => a.iata.toLowerCase() === val.toLowerCase() || (a.city && a.city.toLowerCase() === val.toLowerCase()));
        if (match) addExcludeAirport(match.iata);
        else if (val.length === 3) addExcludeAirport(val.toUpperCase());
      } else {
        const match = getCountries().find(c => c.name.toLowerCase() === val.toLowerCase() || c.name.toLowerCase().startsWith(val.toLowerCase()));
        if (match) addExcludeCountry(match.name);
      }
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      const incBox = document.getElementById('cf_c_inc_box_wrapper');
      const excBox = document.getElementById('cf_c_exc_box_wrapper');
      if (incBox && !incBox.contains(e.target)) {
        const dd = document.getElementById('cf_c_inc_dropdown');
        if (dd) dd.style.display = 'none';
      }
      if (excBox && !excBox.contains(e.target)) {
        const dd = document.getElementById('cf_c_exc_dropdown');
        if (dd) dd.style.display = 'none';
      }
    });

    // Quick Results Filter Chips
    ['all', 'exact', 'harmony'].forEach(f => {
      const el = document.getElementById(`cf_c_filter_${f}`);
      if (el) {
        el.addEventListener('click', () => {
          document.querySelectorAll('#cf_c_pane_circuits .sc-chip').forEach(c => c.classList.remove('active'));
          el.classList.add('active');
          state.quickFilter = f === 'harmony' ? 'high_harmony' : f;
          renderCircuitsList();
        });
      }
    });

    // Action Toolbar Buttons
    const btnFind = document.getElementById('cf_c_btn_find_circuits');
    const btnEmptyFind = document.getElementById('cf_c_btn_empty_find');
    const btnToolbarSaved = document.getElementById('cf_c_btn_toolbar_saved');
    const btnResetAll = document.getElementById('cf_c_btn_reset_all');

    if (btnFind) btnFind.addEventListener('click', executeFindCircuits);
    if (btnEmptyFind) btnEmptyFind.addEventListener('click', executeFindCircuits);

    if (btnToolbarSaved) {
      btnToolbarSaved.addEventListener('click', () => {
        switchTab('saved');
        renderSavedLibrary();
      });
    }

    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        state.targetHours = 168;
        state.slackHours = 0;
        state.routeCount = 'any';
        state.routeType = 'lh';
        state.strategy = 'tri_class';
        state.weights = { eco: 0.60, bus: 0.25, first: 0.15, cargo: 0.05 };
        state.minStars = 3;
        state.continent = 'all';
        state.maxDistLimit = null;
        state.includedAirports = [];
        state.includedCountries = [];
        state.excludedAirports = [];
        state.excludedCountries = [];

        if (targetDurSelect) targetDurSelect.value = '168';
        if (slackSelect) slackSelect.value = '0';
        if (routeCountSelect) routeCountSelect.value = 'any';
        if (stratSelect) stratSelect.value = 'tri_class';
        if (slidersBox) slidersBox.style.display = 'none';
        if (minStarsSelect) minStarsSelect.value = '3';
        if (continentSelect) continentSelect.value = 'all';
        if (distCapCheck) { distCapCheck.checked = false; }
        if (distCapInput) { distCapInput.disabled = true; distCapInput.value = '15000'; }

        document.querySelectorAll('#cf_c_haul_chips_group .sc-chip').forEach(b => {
          b.classList.toggle('active', b.dataset.type === 'lh');
        });

        renderIncludeChips();
        renderExcludeChips();
        updateStatusline();
        updateStrategyLabel();
        toast('Reset circuit finder to defaults', 'info');
      });
    }

    // Library search & Export
    const libSearch = document.getElementById('cf_c_library_search');
    if (libSearch) libSearch.addEventListener('input', renderSavedLibrary);

    const btnExportJson = document.getElementById('cf_c_btn_export_json');
    if (btnExportJson) btnExportJson.addEventListener('click', exportCircuitsJson);

    // Swap modal close buttons
    const btnCloseSwap = document.getElementById('cf_c_btn_close_swap');
    const btnCancelSwap = document.getElementById('cf_c_btn_cancel_swap');
    if (btnCloseSwap) btnCloseSwap.addEventListener('click', closeSwapModal);
    if (btnCancelSwap) btnCancelSwap.addEventListener('click', closeSwapModal);
  }

  // =========================================================================
  // DROPDOWN AUTOCOMPLETE RENDERERS
  // =========================================================================
  function renderIncludeDropdown(query) {
    const incDropdown = document.getElementById('cf_c_inc_dropdown');
    if (!incDropdown) return;
    const excDropdown = document.getElementById('cf_c_exc_dropdown');
    if (excDropdown) excDropdown.style.display = 'none';

    const q = (query || '').trim().toLowerCase();
    const hub = getAirport(state.hub);
    const ac = getAircraft(state.aircraftId);

    if (state.includeMode === 'ap') {
      const airports = getAirports();
      const matches = airports.filter(ap => {
        if (ap.iata === state.hub) return false;
        if (state.includedAirports.includes(ap.iata)) return false;
        if (!q) return true;
        return ap.iata.toLowerCase().includes(q) ||
               (ap.city && ap.city.toLowerCase().includes(q)) ||
               (ap.name && ap.name.toLowerCase().includes(q)) ||
               (ap.country && ap.country.toLowerCase().includes(q));
      }).slice(0, 15);

      if (matches.length === 0) {
        incDropdown.innerHTML = `<div class="cf-autocomplete-empty">No airports matching "${query}"</div>`;
      } else {
        incDropdown.innerHTML = matches.map(ap => {
          let dist = 0, dur = 0, reachable = true;
          if (hub && ac) {
            dist = haversineDistance(hub.lat, hub.lon, ap.lat, ap.lon);
            dur = calculateFlightTimeHours(dist, ac.speed_kmh);
            if (dist > ac.range_km || (state.requireCatMatch && ap.cat < ac.category)) reachable = false;
          }
          const stats = computeAirportDemandStats(ap);
          const durText = formatHoursMinutes(dur);
          return `
            <div class="cf-autocomplete-item inc" data-val="${ap.iata}">
              <div style="display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden;">
                <span style="font-family: ui-monospace, monospace; font-weight: 700; color: #34d399; background: #061c18; border: 1px solid #065f46; padding: 1px 3px; border-radius: 3px; font-size: 8.5px;">${ap.iata}</span>
                <span style="color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ap.city || ap.name}</span>
                <span style="color: var(--sc-text-muted); font-size: 8px; white-space: nowrap;">(${ap.country}) · Cat ${ap.cat} · ${stats.starsText}</span>
              </div>
              <div style="text-align: right; flex-shrink: 0; display: flex; align-items: center; gap: 2px;">
                <span style="font-family: ui-monospace, monospace; font-size: 8.5px; color: ${reachable ? '#67e8f9' : '#f87171'};">${durText}</span>
                ${!reachable ? '<span title="Exceeds aircraft range or runway cat" style="font-size: 8px; color: #f87171;">⚠️</span>' : ''}
              </div>
            </div>
          `;
        }).join('');

        incDropdown.querySelectorAll('.cf-autocomplete-item').forEach(item => {
          item.addEventListener('click', () => addIncludeAirport(item.dataset.val));
        });
      }
    } else {
      // Country mode
      const countries = getCountries();
      const matches = countries.filter(c => {
        if (state.includedCountries.includes(c.name)) return false;
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || (c.continent && c.continent.toLowerCase().includes(q));
      }).slice(0, 15);

      if (matches.length === 0) {
        incDropdown.innerHTML = `<div class="cf-autocomplete-empty">No countries matching "${query}"</div>`;
      } else {
        incDropdown.innerHTML = matches.map(c => `
          <div class="cf-autocomplete-item inc" data-val="${c.name}">
            <div style="display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden;">
              <span style="font-size: 10px;">🏳</span>
              <span style="color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.name}</span>
              <span style="color: var(--sc-text-muted); font-size: 8px; white-space: nowrap;">(${c.continent})</span>
            </div>
            <span style="font-family: ui-monospace, monospace; font-size: 8px; color: #a7f3d0; flex-shrink: 0;">${c.count} airports</span>
          </div>
        `).join('');

        incDropdown.querySelectorAll('.cf-autocomplete-item').forEach(item => {
          item.addEventListener('click', () => addIncludeCountry(item.dataset.val));
        });
      }
    }

    incDropdown.style.display = 'flex';
  }

  function renderExcludeDropdown(query) {
    const excDropdown = document.getElementById('cf_c_exc_dropdown');
    if (!excDropdown) return;
    const incDropdown = document.getElementById('cf_c_inc_dropdown');
    if (incDropdown) incDropdown.style.display = 'none';

    const q = (query || '').trim().toLowerCase();

    if (state.excludeMode === 'ap') {
      const airports = getAirports();
      const matches = airports.filter(ap => {
        if (ap.iata === state.hub) return false;
        if (state.excludedAirports.includes(ap.iata)) return false;
        if (!q) return true;
        return ap.iata.toLowerCase().includes(q) ||
               (ap.city && ap.city.toLowerCase().includes(q)) ||
               (ap.name && ap.name.toLowerCase().includes(q)) ||
               (ap.country && ap.country.toLowerCase().includes(q));
      }).slice(0, 15);

      if (matches.length === 0) {
        excDropdown.innerHTML = `<div class="cf-autocomplete-empty">No airports matching "${query}"</div>`;
      } else {
        excDropdown.innerHTML = matches.map(ap => `
          <div class="cf-autocomplete-item exc" data-val="${ap.iata}">
            <div style="display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden;">
              <span style="font-family: ui-monospace, monospace; font-weight: 700; color: #f87171; background: #261118; border: 1px solid #7f1d1d; padding: 1px 3px; border-radius: 3px; font-size: 8.5px;">${ap.iata}</span>
              <span style="color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ap.city || ap.name}</span>
              <span style="color: var(--sc-text-muted); font-size: 8px; white-space: nowrap;">(${ap.country}) · Cat ${ap.cat}</span>
            </div>
            <span style="font-size: 8px; font-weight: 700; color: #fca5a5; flex-shrink: 0;">Avoid</span>
          </div>
        `).join('');

        excDropdown.querySelectorAll('.cf-autocomplete-item').forEach(item => {
          item.addEventListener('click', () => addExcludeAirport(item.dataset.val));
        });
      }
    } else {
      // Country mode
      const countries = getCountries();
      const matches = countries.filter(c => {
        if (state.excludedCountries.includes(c.name)) return false;
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || (c.continent && c.continent.toLowerCase().includes(q));
      }).slice(0, 15);

      if (matches.length === 0) {
        excDropdown.innerHTML = `<div class="cf-autocomplete-empty">No countries matching "${query}"</div>`;
      } else {
        excDropdown.innerHTML = matches.map(c => `
          <div class="cf-autocomplete-item exc" data-val="${c.name}">
            <div style="display: flex; align-items: center; gap: 4px; min-width: 0; overflow: hidden;">
              <span style="font-size: 10px;">🚫</span>
              <span style="color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.name}</span>
              <span style="color: var(--sc-text-muted); font-size: 8px; white-space: nowrap;">(${c.continent})</span>
            </div>
            <span style="font-family: ui-monospace, monospace; font-size: 8px; color: #fca5a5; flex-shrink: 0;">${c.count} airports</span>
          </div>
        `).join('');

        excDropdown.querySelectorAll('.cf-autocomplete-item').forEach(item => {
          item.addEventListener('click', () => addExcludeCountry(item.dataset.val));
        });
      }
    }

    excDropdown.style.display = 'flex';
  }

  function addIncludeAirport(code) {
    const iata = (code || '').toUpperCase().trim();
    if (iata && !state.includedAirports.includes(iata)) {
      state.includedAirports.push(iata);
      state.excludedAirports = state.excludedAirports.filter(x => x !== iata);
      toast(`Added ${iata} to Must-Fly`, 'success');
    }
    const inp = document.getElementById('cf_c_inc_input');
    if (inp) inp.value = '';
    const dd = document.getElementById('cf_c_inc_dropdown');
    if (dd) dd.style.display = 'none';
    renderIncludeChips();
  }

  function addIncludeCountry(country) {
    const c = (country || '').trim();
    if (c && !state.includedCountries.includes(c)) {
      state.includedCountries.push(c);
      state.excludedCountries = state.excludedCountries.filter(x => x !== c);
      toast(`Added ${c} to Must-Fly Countries`, 'success');
    }
    const inp = document.getElementById('cf_c_inc_input');
    if (inp) inp.value = '';
    const dd = document.getElementById('cf_c_inc_dropdown');
    if (dd) dd.style.display = 'none';
    renderIncludeChips();
  }

  function addExcludeAirport(code) {
    const iata = (code || '').toUpperCase().trim();
    if (iata && !state.excludedAirports.includes(iata)) {
      state.excludedAirports.push(iata);
      state.includedAirports = state.includedAirports.filter(x => x !== iata);
      toast(`Added ${iata} to Avoid list`, 'info');
    }
    const inp = document.getElementById('cf_c_exc_input');
    if (inp) inp.value = '';
    const dd = document.getElementById('cf_c_exc_dropdown');
    if (dd) dd.style.display = 'none';
    renderExcludeChips();
  }

  function addExcludeCountry(country) {
    const c = (country || '').trim();
    if (c && !state.excludedCountries.includes(c)) {
      state.excludedCountries.push(c);
      state.includedCountries = state.includedCountries.filter(x => x !== c);
      toast(`Excluded ${c}`, 'info');
    }
    const inp = document.getElementById('cf_c_exc_input');
    if (inp) inp.value = '';
    const dd = document.getElementById('cf_c_exc_dropdown');
    if (dd) dd.style.display = 'none';
    renderExcludeChips();
  }

  function renderIncludeChips() {
    const c = document.getElementById('cf_c_inc_chips');
    if (!c) return;
    let html = '';
    state.includedAirports.forEach(code => {
      html += `
        <span class="cf-tag-chip inc">
          <span>✈ ${code}</span>
          <button type="button" data-type="ap" data-val="${code}">&times;</button>
        </span>
      `;
    });
    state.includedCountries.forEach(country => {
      html += `
        <span class="cf-tag-chip inc" style="border-color: #0d9488; background: #042f2e;">
          <span>🏳 ${country}</span>
          <button type="button" data-type="ct" data-val="${country}">&times;</button>
        </span>
      `;
    });
    c.innerHTML = html;
    c.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const { type, val } = btn.dataset;
        if (type === 'ap') {
          state.includedAirports = state.includedAirports.filter(x => x !== val);
        } else {
          state.includedCountries = state.includedCountries.filter(x => x !== val);
        }
        renderIncludeChips();
      });
    });
  }

  function renderExcludeChips() {
    const c = document.getElementById('cf_c_exc_chips');
    if (!c) return;
    let html = '';
    state.excludedAirports.forEach(code => {
      html += `
        <span class="cf-tag-chip exc">
          <span>🚫 ${code}</span>
          <button type="button" data-type="ap" data-val="${code}">&times;</button>
        </span>
      `;
    });
    state.excludedCountries.forEach(country => {
      html += `
        <span class="cf-tag-chip exc" style="border-color: #be123c; background: #4c0519;">
          <span>🏳 ${country}</span>
          <button type="button" data-type="ct" data-val="${country}">&times;</button>
        </span>
      `;
    });
    c.innerHTML = html;
    c.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const { type, val } = btn.dataset;
        if (type === 'ap') {
          state.excludedAirports = state.excludedAirports.filter(x => x !== val);
        } else {
          state.excludedCountries = state.excludedCountries.filter(x => x !== val);
        }
        renderExcludeChips();
      });
    });
  }

  // =========================================================================
  // AIRCRAFT COMBOBOX LIST RENDERER
  // =========================================================================
  function renderAircraftList() {
    const acSearch = document.getElementById('cf_c_ac_search');
    const acList = document.getElementById('cf_c_ac_list');
    const acCountLabel = document.getElementById('cf_c_ac_count_label');
    if (!acList) return;

    const query = (acSearch?.value || '').toLowerCase().trim();
    const all = getAircraftList();
    const filtered = all.filter(ac => {
      if (state.currentHaulFilter !== 'all' && ac.type !== state.currentHaulFilter) return false;
      if (!query) return true;
      return ac.name.toLowerCase().includes(query) || ac.id.toLowerCase().includes(query);
    });

    if (acCountLabel) acCountLabel.textContent = `${filtered.length}/${all.length}`;
    acList.innerHTML = filtered.map(ac => `
      <div class="sc-combobox-item ${ac.id === state.aircraftId ? 'active' : ''}" data-acid="${ac.id}">
        <div>
          <div style="font-weight: 700; color: #fff;">${ac.name} <span style="font-size: 8px; color: var(--sc-text-muted);">${ac.type}</span></div>
          <div style="font-size: 8px; color: var(--sc-text-muted);">${ac.seats} seats · ${ac.speed_kmh} km/h · ${ac.range_km.toLocaleString()} km</div>
        </div>
        <div style="text-align: right;">
          <span class="sc-tag">Cat ${ac.category}</span>
          <div style="font-size: 8px; color: #6ee7b7; font-family: ui-monospace, monospace;">${formatPriceShort(ac.price)}</div>
        </div>
      </div>
    `).join('');

    acList.querySelectorAll('.sc-combobox-item').forEach(item => {
      item.addEventListener('click', () => {
        state.aircraftId = item.dataset.acid;
        const desktopAcSelect = document.getElementById('cf_aircraft_select');
        if (desktopAcSelect) desktopAcSelect.value = state.aircraftId;
        window.cf_activeAircraftId = state.aircraftId;
        updateAircraftUI();
        const pop = document.getElementById('cf_c_ac_popover');
        if (pop) pop.style.display = 'none';
        state.acPopoverOpen = false;
      });
    });
  }

  function updateAircraftUI() {
    const ac = getAircraft(state.aircraftId);
    if (!ac) return;
    const triggerLabel = document.getElementById('cf_c_ac_trigger_label');
    const catBadge = document.getElementById('cf_c_ac_cat_badge');
    if (triggerLabel) triggerLabel.textContent = ac.name;
    if (catBadge) catBadge.textContent = `Cat ${ac.category}`;
  }

  function updateStatusline() {
    const hub = getAirport(state.hub);
    const hubCat = hub ? hub.cat : 8;
    const hubTag = document.getElementById('cf_c_status_hub_tag');
    if (hubTag) hubTag.textContent = `${state.hub} · Cat ${hubCat}`;

    const rotEl = document.getElementById('cf_c_status_rotation');
    if (rotEl) rotEl.textContent = `${state.targetHours}h Rotation`;

    const fleet = state.targetHours === 168 ? 7 : state.targetHours === 24 ? 1 : Math.round(state.targetHours / 24);
    const fleetEl = document.getElementById('cf_c_status_fleet');
    if (fleetEl) fleetEl.textContent = `${fleet} Planes`;

    const pill = document.getElementById('cf_c_header_status_pill');
    if (pill) pill.textContent = `${state.targetHours}h · ${fleet} Planes`;

    const emptyHub = document.getElementById('cf_c_empty_state_hub');
    if (emptyHub) emptyHub.textContent = state.hub;
  }

  function updateStrategyLabel() {
    const w = state.weights;
    const label = document.getElementById('cf_c_weights_label');
    if (label) {
      label.textContent = `Y: ${Math.round(w.eco*100)}% · J: ${Math.round(w.bus*100)}% · F: ${Math.round(w.first*100)}%`;
    }
  }

  function updateSavedBadges() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    const badge = document.getElementById('cf_c_tab_badge_saved');
    if (badge) badge.textContent = state.savedCircuits.length;
    const tbCount = document.getElementById('cf_c_tb_saved_count');
    if (tbCount) tbCount.textContent = state.savedCircuits.length;
  }

  // =========================================================================
  // CIRCUITS RESULTS RENDERER
  // =========================================================================
  function renderCircuitsList() {
    const container = document.getElementById('cf_c_circuits_list');
    const emptyState = document.getElementById('cf_c_empty_state');
    const countBadge = document.getElementById('cf_c_tab_badge_circuits');
    const resultsCountNum = document.getElementById('cf_c_results_count_num');
    const benchmarkEl = document.getElementById('cf_c_results_benchmark');
    if (!container) return;

    let circuits = state.discoveredCircuits;
    if (state.quickFilter === 'exact') {
      circuits = circuits.filter(c => c.slackHours === 0);
    } else if (state.quickFilter === 'high_harmony') {
      circuits = circuits.filter(c => c.harmonyScore >= 95);
    }

    if (countBadge) countBadge.textContent = circuits.length;
    if (resultsCountNum) resultsCountNum.textContent = circuits.length;
    if (benchmarkEl) benchmarkEl.textContent = state.benchmarkMs;
    const statusResultsCount = document.getElementById('cf_c_status_results_count');
    if (statusResultsCount) statusResultsCount.innerHTML = `<b>${circuits.length}</b> circuits found`;

    if (circuits.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = circuits.map((c, cIdx) => {
      const totalTicks = Math.round(c.targetHours * 4);

      const ribbonHtml = c.legs.map((l, lIdx) => {
        const pct = (l.ticks / totalTicks) * 100;
        const col = CF_C_LEG_COLORS[lIdx % CF_C_LEG_COLORS.length];
        return `<div class="cf-timeline-slice" style="width: ${pct}%; background: ${col};" title="${l.dstIata}: ${formatHoursMinutes(l.dur)}"></div>`;
      }).join('') + (c.slackHours > 0 ? `<div class="cf-timeline-slice" style="width: ${(c.slackHours / c.targetHours) * 100}%; background: #261118;" title="Slack: ${c.slackText}"></div>` : '');

      const legsHtml = c.legs.map((leg, legIdx) => {
        const col = CF_C_LEG_COLORS[legIdx % CF_C_LEG_COLORS.length];
        const maxDemand = Math.max(leg.demand.rawEco, leg.demand.rawBus, leg.demand.rawFirst, 1);
        const yBar = (leg.demand.rawEco / maxDemand) * 100;
        const jBar = (leg.demand.rawBus / maxDemand) * 100;
        const fBar = (leg.demand.rawFirst / maxDemand) * 100;

        return `
          <div class="cf-leg-row">
            <span class="cf-leg-num">${legIdx + 1}</span>
            <span class="cf-leg-route" style="color: ${col};">${c.hubIata} ✈ ${leg.dstIata}</span>
            <span class="cf-leg-dur">${formatHoursMinutes(leg.dur)}</span>
            <span class="cf-leg-dist">${leg.dist.toLocaleString()}km</span>
            <div class="cf-leg-demand-bars" title="Y: ${leg.demand.rawEco} · J: ${leg.demand.rawBus} · F: ${leg.demand.rawFirst}">
              <div style="width: ${yBar}%; background: var(--sc-eco); height: 100%;"></div>
              <div style="width: ${jBar}%; background: var(--sc-bus); height: 100%;"></div>
              <div style="width: ${fBar}%; background: var(--sc-first); height: 100%;"></div>
            </div>
            <button type="button" class="cf-leg-swap-btn" data-cidx="${cIdx}" data-lidx="${legIdx}">Swap</button>
          </div>
        `;
      }).join('');

      return `
        <div class="cf-circuit-card">
          <div class="cf-card-header">
            <div class="cf-circuit-title">
              <span style="color: var(--sc-cyan);">${c.hubIata}</span>
              <span style="color: var(--sc-text-muted);">·</span>
              <span>${c.targetHours}h (${c.legs.length} Routes)</span>
              <span class="badge-pill good" style="font-size: 8px;">${c.fleetSize} Planes</span>
            </div>
            <div class="cf-card-meta">
              <span class="badge-pill ${c.slackHours === 0 ? 'good' : 'warn'}">${c.slackHours === 0 ? 'Exact Fit' : c.slackText + ' slack'}</span>
              <span class="badge-pill cyan">${c.harmonyScore}% Harmony</span>
              <span style="color: #fcd34d; font-size: 9px;">${c.starsText}</span>
            </div>
          </div>

          <!-- Visual Rotation Ribbon -->
          <div class="cf-timeline-ribbon">${ribbonHtml}</div>

          <!-- Legs Table -->
          <div class="cf-legs-container">${legsHtml}</div>

          <!-- Actions Strip -->
          <div class="cf-card-actions">
            <button type="button" class="cf-btn-seatconfig" data-cidx="${cIdx}" title="Configure aircraft fleet seating for this circuit">
              ✈ Load in Seat Config
            </button>
            <div style="display: flex; gap: 4px;">
              <button type="button" class="cf-btn-save" data-cidx="${cIdx}">💾 Save</button>
              <button type="button" class="cf-btn-copy" data-cidx="${cIdx}">📋 Copy</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.cf-btn-seatconfig').forEach(btn => {
      btn.addEventListener('click', () => transferToSeatConfig(parseInt(btn.dataset.cidx, 10)));
    });
    container.querySelectorAll('.cf-btn-save').forEach(btn => {
      btn.addEventListener('click', () => saveCircuit(parseInt(btn.dataset.cidx, 10)));
    });
    container.querySelectorAll('.cf-btn-copy').forEach(btn => {
      btn.addEventListener('click', () => copyCircuitSummary(parseInt(btn.dataset.cidx, 10)));
    });
    container.querySelectorAll('.cf-leg-swap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openSwapModal(parseInt(btn.dataset.cidx, 10), parseInt(btn.dataset.lidx, 10));
      });
    });
  }

  // =========================================================================
  // SWAP MODAL
  // =========================================================================
  function openSwapModal(circuitIdx, legIdx) {
    state.activeSwapCoord = { circuitIdx, legIdx };
    const circuit = state.discoveredCircuits[circuitIdx];
    const leg = circuit.legs[legIdx];
    const durEl = document.getElementById('cf_c_swap_modal_dur');
    if (durEl) durEl.textContent = formatHoursMinutes(leg.dur);

    const candidates = getSwapCandidates(circuitIdx, legIdx);
    const container = document.getElementById('cf_c_swap_candidates_container');
    const modal = document.getElementById('cf_c_swap_modal_backdrop');

    if (!container || !modal) return;

    if (candidates.length === 0) {
      container.innerHTML = `<div style="padding: 10px; text-align: center; color: var(--sc-text-muted); font-size: 9px;">No alternative destinations found with the exact duration ${formatHoursMinutes(leg.dur)}.</div>`;
    } else {
      container.innerHTML = candidates.map(cand => `
        <div class="sc-card" style="padding: 4px 6px; cursor: pointer; flex-direction: row; align-items: center; justify-content: space-between;" data-dst="${cand.dstIata}">
          <div>
            <b style="color: var(--sc-cyan); font-family: ui-monospace, monospace;">${circuit.hubIata} ✈ ${cand.dstIata}</b>
            <span style="color: var(--sc-text-muted); font-size: 8px;">${cand.city}, ${cand.country}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 8px; font-family: ui-monospace, monospace; color: var(--sc-text-secondary);">${cand.dist.toLocaleString()} km</span>
            <span class="sc-tag">Cat ${cand.cat}</span>
            <span style="color: #fcd34d; font-size: 8px;">${cand.demand.starsText}</span>
          </div>
        </div>
      `).join('');

      container.querySelectorAll('.sc-card').forEach(card => {
        card.addEventListener('click', () => {
          swapLeg(state.activeSwapCoord.circuitIdx, state.activeSwapCoord.legIdx, card.dataset.dst);
          closeSwapModal();
          renderCircuitsList();
        });
      });
    }

    modal.hidden = false;
  }

  function closeSwapModal() {
    const modal = document.getElementById('cf_c_swap_modal_backdrop');
    if (modal) modal.hidden = true;
  }

  // =========================================================================
  // SAVED LIBRARY RENDERER
  // =========================================================================
  function renderSavedLibrary() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    const container = document.getElementById('cf_c_saved_list');
    const searchInput = document.getElementById('cf_c_library_search');
    if (!container) return;

    const query = (searchInput?.value || '').toLowerCase();
    const list = state.savedCircuits.filter(s => {
      if (!query) return true;
      return s.name.toLowerCase().includes(query) || s.hub.toLowerCase().includes(query);
    });

    updateSavedBadges();

    if (list.length === 0) {
      container.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--sc-text-muted); font-size: 9px;">No saved circuits found. Save any discovered circuit from the results tab!</div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="sc-card" style="padding: 6px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <b style="color: #fff; font-size: 10px;">${item.name}</b>
          <span class="badge-pill cyan">${item.totalDurText}</span>
        </div>
        <div style="font-size: 8px; color: var(--sc-text-muted); margin-top: 2px;">
          <span>Hub: <b style="color: var(--sc-cyan);">${item.hub}</b></span> · 
          <span>${item.legs.length} Routes</span> · 
          <span>${item.weeklyDistanceKm.toLocaleString()} km</span> · 
          <span style="color: #6ee7b7;">${item.fleetSize} Planes</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; padding-top: 4px; border-top: 1px solid #142236;">
          <button type="button" class="cf-btn-seatconfig load-saved-btn" data-id="${item.id}" style="font-size: 8px; padding: 2px 6px;">
            ✈ Load in Seat Config
          </button>
          <button type="button" class="sc-chip delete-saved-btn" data-id="${item.id}" style="color: var(--sc-rose);">
            Delete
          </button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.load-saved-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const found = state.savedCircuits.find(s => s.id === btn.dataset.id);
        if (found) {
          state.discoveredCircuits = [found];
          transferToSeatConfig(0);
        }
      });
    });

    container.querySelectorAll('.delete-saved-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteSavedCircuit(btn.dataset.id));
    });
  }

  function executeFindCircuits() {
    const tabCircuits = document.getElementById('cf_c_tab_circuits');
    if (tabCircuits) tabCircuits.click();

    const circuits = findCircuits();
    renderCircuitsList();
    if (circuits.length > 0) {
      toast(`Found ${circuits.length} circuits in ${state.benchmarkMs}ms!`, 'success');
    } else {
      toast('No circuits matched constraints. Try relaxing filters.', 'warn');
    }
  }

  // =========================================================================
  // MAIN COMPACT ENTRY POINT (WINDOW.CF_RENDERCOMPACT)
  // =========================================================================
  function cf_renderCompact() {
    const cont = document.getElementById('circuit_finder_compact_container');
    const view = document.getElementById('view_circuit_finder');
    if (!cont) return;

    if (!isCompactMode()) {
      if (view) view.classList.remove('cf-compact');
      cont.hidden = true;
      cont.innerHTML = '';
      state.isMounted = false;
      return;
    }

    if (view) view.classList.add('cf-compact');
    cont.hidden = false;

    // Sync state from desktop view if available
    const desktopHub = document.getElementById('cf_circuit_hub');
    if (desktopHub && desktopHub.value) {
      state.hub = desktopHub.value.toUpperCase().trim();
    } else if (window.CIRCUIT_HUB) {
      state.hub = window.CIRCUIT_HUB.toUpperCase().trim();
    }

    if (window.cf_activeAircraftId) {
      state.aircraftId = window.cf_activeAircraftId;
    }

    loadPersistedData();

    if (!state.isMounted || !cont.firstElementChild) {
      renderShell();
    }

    updateAircraftUI();
    updateStatusline();
    updateStrategyLabel();
    renderIncludeChips();
    renderExcludeChips();
    renderSavedLibrary();

    if (state.discoveredCircuits.length > 0) {
      renderCircuitsList();
    }
  }

  // Expose on window
  window.cf_renderCompact = cf_renderCompact;
  window.cf_c_state = state;
  window.cf_c_engine = {
    state,
    findCircuits,
    getSwapCandidates,
    swapLeg,
    transferToSeatConfig,
    saveCircuit,
    deleteSavedCircuit,
    exportCircuitsJson,
    copyCircuitSummary,
    getAirports,
    getAirport,
    getAircraftList,
    getAircraft,
    getCountries,
    computeAirportDemandStats,
    haversineDistance,
    calculateFlightTimeHours,
    formatHoursMinutes
  };

  document.addEventListener('DOMContentLoaded', () => {
    loadPersistedData();
    if (isCompactMode()) {
      cf_renderCompact();
    }
  });

})();
