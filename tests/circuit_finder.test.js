'use strict';

// Run with: node --test tests/circuit_finder.test.js
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
const databaseContext = vm.createContext({});
vm.runInContext(read('data/aircraft.min.js'), databaseContext);
const aircraft = vm.runInContext('AIRCRAFT_DATABASE', databaseContext);
const boeing767 = aircraft.find(ac => ac.id === '767-200er');

function airport(iata, cat, lon = 38) {
  return {
    iata, cat, lat: 0, lon, name: iata, city: iata, country: 'Norway',
    economy: 30, business: 30, first: 30, cargo: 10
  };
}

const fixtureAirports = [
  airport('HUB', 10, 0),
  airport('LOW', 2),
  airport('BAD', 3),
  airport('MIN', 4),
  airport('MID', 6),
  airport('MAX', 10)
];

function element(value = '') {
  const classes = new Set();
  const listeners = new Map();
  const attributes = new Map();
  return {
    value, checked: false, disabled: false, innerHTML: '', textContent: '',
    style: {}, dataset: {}, children: [], hidden: false, focusCalls: 0,
    options: ['any', '2', '3', '4', '5', '6', '7', '8', '9'].map(value => ({ value })),
    classList: {
      add(...names) { names.forEach(name => classes.add(name)); },
      remove(...names) { names.forEach(name => classes.delete(name)); },
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      },
      contains(name) { return classes.has(name); }
    },
    get firstElementChild() { return this.innerHTML ? {} : null; },
    querySelectorAll() { return []; },
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(listener);
    },
    dispatchEvent(event) {
      event.target ||= this;
      event.preventDefault ||= () => { event.defaultPrevented = true; };
      (listeners.get(event.type) || []).forEach(listener => listener(event));
      return !event.defaultPrevented;
    },
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name) ?? null; },
    focus() { this.focusCalls++; },
    select() { this.selected = true; },
    appendChild(child) { this.children.push(child); child.parentElement = this; },
    remove() {
      if (this.parentElement) {
        this.parentElement.children = this.parentElement.children.filter(child => child !== this);
      }
    },
    contains(target) { return target === this || this.children.includes(target); },
    closest() { return null; }
  };
}

function runtime({ airports = fixtureAirports, saved = {} } = {}) {
  const controls = new Map(Object.entries({
    cf_circuit_hub: element('HUB'),
    cf_aircraft_select: element(boeing767.id),
    cf_target_duration_select: element('24'),
    cf_route_count_select: element('2'),
    cf_slack_tolerance_select: element('0'),
    cf_star_filter_select: element('0'),
    cf_continent_filter_select: element('all'),
    cf_class_strategy_select: element('tri_class'),
    cf_airport_category_rule: element(),
    cf_min_leg_dur: element('1.5'),
    cf_max_leg_dur: element('48'),
    // Simulate the legacy unchecked setting, even after its UI is removed.
    cf_cat_filter_check: element()
  }));
  const savedState = {
    hubIata: 'HUB', aircraftId: boeing767.id, targetDuration: '24',
    routeCount: '2', routeType: 'mix', minStarRating: '0', catMatchOnly: false,
    ...saved
  };
  const storage = new Map([['amt_circuit_finder_state_v1', JSON.stringify(savedState)]]);
  const toasts = [];
  const clipboardWrites = [];
  const fallbackWrites = [];
  const timers = new Map();
  let nextTimer = 0;
  const document = {
    getElementById(id) { return controls.get(id) || null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return element(); },
    body: element(),
    activeElement: null,
    execCommand(command) {
      assert.equal(command, 'copy');
      const textarea = this.body.children.find(child => child.selected);
      assert.ok(textarea, 'Fallback textarea was selected');
      fallbackWrites.push(textarea.value);
      return true;
    }
  };
  const context = vm.createContext({
    AIRPORTS_DATABASE: airports,
    AIRCRAFT_DATABASE: aircraft,
    document, console, performance,
    setTimeout(callback, delay) {
      const id = ++nextTimer;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    navigator: { clipboard: { async writeText(text) { clipboardWrites.push(text); } } },
    URLSearchParams,
    location: { search: '', hash: '' },
    showToast(message, type) { toasts.push({ message, type }); },
    localStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, value); },
      removeItem(key) { storage.delete(key); }
    }
  });
  context.window = context;
  vm.runInContext(read('js/circuit_finder.js'), context, { filename: 'circuit_finder.js' });
  vm.runInContext(read('js/circuit_finder_compact.js'), context, { filename: 'circuit_finder_compact.js' });
  assert.equal(context.cf_restoreStateFromLocalStorage(), true, 'Desktop state restored');
  Object.assign(context.cf_c_state, {
    hub: savedState.hubIata, aircraftId: savedState.aircraftId,
    targetHours: 24, routeCount: '2', routeType: 'mix', minStars: 0,
    requireCatMatch: false
  });
  function runTimers(delay) {
    for (const [id, timer] of [...timers]) {
      if (timer.delay !== delay) continue;
      timers.delete(id);
      timer.callback();
    }
  }
  return { context, controls, storage, toasts, clipboardWrites, fallbackWrites, runTimers };
}

function searchDesktop(context) {
  context.cf_executeCircuitSearch();
  return context.cf_getDiscoveredCircuits();
}

function assertCompatible(circuits) {
  assert.ok(circuits.length > 0, 'Compatible circuits are still available');
  for (const circuit of circuits) {
    assert.ok(fixtureAirports.find(ap => ap.iata === circuit.hubIata).cat >= boeing767.category, 'Hub meets aircraft category');
    for (const leg of circuit.legs) {
      assert.ok(leg.cat >= boeing767.category, `${leg.dstIata}: Cat ${leg.cat} is below Cat ${boeing767.category}`);
    }
  }
  assert.ok(circuits.some(c => c.legs.some(l => l.cat === boeing767.category)), 'Exact minimum category remains eligible');
  assert.ok(circuits.some(c => c.legs.some(l => l.cat > boeing767.category)), 'Higher categories remain eligible');
}

test('767-200ER has category 4 in the shipped aircraft database', () => {
  assert.equal(boeing767.category, 4);
});

test('desktop search enforces category with legacy catMatchOnly disabled', () => {
  const { context } = runtime();
  assertCompatible(searchDesktop(context));
});

test('compact search enforces category even with the old optional flag disabled', () => {
  const { context } = runtime();
  assertCompatible(context.cf_c_engine.findCircuits());
});

test('desktop search rejects an incompatible hub', () => {
  const { context } = runtime({ airports: fixtureAirports.map(ap => ap.iata === 'HUB' ? { ...ap, cat: 3 } : ap) });
  assert.equal(searchDesktop(context).length, 0);
});

test('compact search rejects an incompatible hub and clears previous results', () => {
  const { context } = runtime({ airports: fixtureAirports.map(ap => ap.iata === 'HUB' ? { ...ap, cat: 3 } : ap) });
  context.cf_c_state.discoveredCircuits = [{ id: 'previous-results' }];
  assert.equal(context.cf_c_engine.findCircuits().length, 0);
  assert.equal(context.cf_c_state.discoveredCircuits.length, 0);
});

test('required desktop airport inclusions cannot override aircraft category', () => {
  const { context } = runtime({ saved: { includedAirports: ['LOW'] } });
  assert.equal(searchDesktop(context).length, 0, 'An impossible required airport must yield no circuit');
});

test('compact swap suggestions do not include lower-category airports', () => {
  const { context } = runtime();
  const engine = context.cf_c_engine;
  engine.state.requireCatMatch = true;
  assertCompatible(engine.findCircuits());
  engine.state.requireCatMatch = false;
  const suggestions = engine.getSwapCandidates(0, 0);
  assert.ok(suggestions.length > 0, 'Compatible same-duration alternatives remain available');
  for (const leg of suggestions) {
    assert.ok(leg.cat >= boeing767.category, `${leg.dstIata}: incompatible swap suggestion`);
  }
});

test('compact swaps reject incompatible airports without changing the circuit', () => {
  const { context } = runtime();
  const engine = context.cf_c_engine;
  engine.state.requireCatMatch = true;
  engine.findCircuits();
  const before = JSON.stringify(engine.state.discoveredCircuits[0]);
  assert.equal(engine.swapLeg(0, 0, 'LOW'), false);
  assert.equal(JSON.stringify(engine.state.discoveredCircuits[0]), before);
});


test('desktop state ignores and stops saving the obsolete category override', () => {
  const { context, controls, storage } = runtime();
  assert.equal(controls.get('cf_airport_category_rule').textContent, 'Cat 4+ airports only');
  context.cf_saveStateToLocalStorage(true);
  const saved = JSON.parse(storage.get('amt_circuit_finder_state_v1'));
  assert.equal(Object.hasOwn(saved, 'catMatchOnly'), false);
  assert.equal(saved.aircraftId, boeing767.id);
  assert.equal(saved.hubIata, 'HUB');
});

test('compact hub compatibility is enforced with the old flag enabled too', () => {
  const { context } = runtime({ airports: fixtureAirports.map(ap => ap.iata === 'HUB' ? { ...ap, cat: 3 } : ap) });
  context.cf_c_state.requireCatMatch = true;
  assert.equal(context.cf_c_engine.findCircuits().length, 0);
});

test('required compact airport inclusions cannot bypass category or be silently dropped', () => {
  const { context } = runtime();
  context.cf_c_state.includedAirports = ['LOW'];
  assert.equal(context.cf_c_engine.findCircuits().length, 0);
  assert.equal(context.cf_c_state.discoveredCircuits.length, 0);
});

test('desktop swaps reject incompatible airports without changing the circuit', () => {
  const { context } = runtime();
  const circuits = searchDesktop(context);
  assert.ok(circuits.length > 0);
  const before = JSON.stringify(circuits[0]);
  context.cf_openRouteSwapModal(0, 0);
  context.cf_performRouteSwap('LOW');
  assert.equal(JSON.stringify(circuits[0]), before);
});

test('desktop swaps still allow compatible alternatives', () => {
  const { context } = runtime();
  const circuit = searchDesktop(context)[0];
  const alternative = fixtureAirports.find(ap => ap.iata !== 'HUB' && ap.cat >= boeing767.category && !circuit.legs.some(leg => leg.dstIata === ap.iata));
  assert.ok(alternative);
  context.cf_openRouteSwapModal(0, 0);
  context.cf_performRouteSwap(alternative.iata);
  assert.equal(circuit.legs[0].dstIata, alternative.iata);
  assert.equal(circuit.legs[0].cat, alternative.cat);
});

test('compact swaps still allow compatible alternatives', () => {
  const { context } = runtime();
  const engine = context.cf_c_engine;
  assertCompatible(engine.findCircuits());
  const alternative = engine.getSwapCandidates(0, 0)[0];
  assert.ok(alternative);
  assert.equal(engine.swapLeg(0, 0, alternative.dstIata), true);
  assert.equal(engine.state.discoveredCircuits[0].legs[0].dstIata, alternative.dstIata);
});


for (const aircraftId of ['dc-3', 'a380-800']) {
  const selectedAircraft = aircraft.find(ac => ac.id === aircraftId);
  // Every destination has a 12h round trip, within this aircraft's range.
  const lon = selectedAircraft.speed_kmh * 4.95 / (6371 * Math.PI / 180);
  const airports = [
    airport('HUB', 10, 0),
    ...Array.from({ length: 10 }, (_, index) => airport(`AA${String.fromCharCode(65 + index)}`, index + 1, lon))
  ];

  for (const mode of ['desktop', 'compact']) {
    test(`${mode} uses the selected ${selectedAircraft.name} category, not a fixed minimum`, () => {
      const { context } = runtime({ airports, saved: { aircraftId } });
      const circuits = mode === 'desktop' ? searchDesktop(context) : context.cf_c_engine.findCircuits();
      assert.ok(circuits.length > 0);
      for (const circuit of circuits) {
        for (const leg of circuit.legs) {
          assert.ok(leg.cat >= selectedAircraft.category, `${leg.dstIata} is incompatible with ${selectedAircraft.name}`);
        }
      }
      assert.ok(circuits.some(c => c.legs.some(l => l.cat === selectedAircraft.category)), 'Minimum compatible category is included');
    });
  }
}

const geographicAirports = [
  ...fixtureAirports,
  { ...airport('CPH', 6), country: 'Denmark' },
  { ...airport('NRT', 6), country: 'Japan' },
  { ...airport('BKK', 6), country: 'Thailand' },
  { ...airport('JFK', 6), country: 'United States' },
  { ...airport('KIN', 6), country: 'Jamaica' }
];
const filterKeys = [
  'includedAirports', 'includedCountries', 'includedContinents',
  'excludedAirports', 'excludedCountries', 'excludedContinents'
];
const plain = value => JSON.parse(JSON.stringify(value));
const precisionFilters = source => Object.fromEntries(filterKeys.map(key => [key, [...source[key]]]));
const emptyFilters = () => Object.fromEntries(filterKeys.map(key => [key, []]));

function snapshot(scope, overrides = {}) {
  return {
    format: 'amt-circuit-finder-filter', version: 1, scope,
    airports: ['MIN'], countries: ['Japan'], continents: ['Asia'],
    ...overrides
  };
}

function filterRuntime(saved = {}) {
  const result = runtime({ airports: geographicAirports, saved });
  const { context, controls } = result;
  for (const id of [
    'cf_include_airports_input', 'cf_exclude_airports_input',
    'cf_include_airports_chips', 'cf_exclude_airports_chips',
    'cf_include_airports_status', 'cf_exclude_airports_status',
    'cf_inc_badge', 'cf_exc_badge', 'cf_clear_include_btn', 'cf_clear_exclude_btn',
    'cf_copy_include_btn', 'cf_copy_exclude_btn',
    'cf_include_dropdown', 'cf_exclude_dropdown',
    'circuit_finder_compact_container', 'view_circuit_finder'
  ]) controls.set(id, element());
  for (const match of read('js/circuit_finder_compact.js').matchAll(/id="(cf_c_\w+)"/g)) {
    controls.set(match[1], element());
  }
  for (const [id, scope] of [
    ['cf_copy_include_btn', 'include'], ['cf_copy_exclude_btn', 'exclude'],
    ['cf_c_btn_copy_inc', 'include'], ['cf_c_btn_copy_exc', 'exclude']
  ]) {
    const button = controls.get(id);
    const label = `Copy ${scope === 'include' ? 'inclusions' : 'exclusions'}`;
    button.innerHTML = '<svg class="lucide-copy"></svg>';
    button.dataset.cfCopyLabel = label;
    button.dataset.cfCopyTitle = `${label} as JSON`;
    button.setAttribute('aria-label', label);
  }
  context.initCircuitFinder();
  result.mountCompact = () => {
    context.document.body.classList.add('amt-compact-mode');
    context.cf_renderCompact();
  };
  result.mountCompact();
  return result;
}

function pasteFilters(result, view, scope, raw) {
  const { context, controls } = result;
  const id = view === 'desktop'
    ? `cf_${scope}_airports_input`
    : `cf_c_${scope === 'include' ? 'inc' : 'exc'}_input`;
  const input = controls.get(id);
  const event = { type: 'paste', clipboardData: { getData() { return raw; } } };
  input.dispatchEvent(event);
  if (!event.defaultPrevented) {
    input.value = raw;
    if (view === 'desktop') {
      context[scope === 'include' ? 'cf_onIncludeInput' : 'cf_onExcludeInput'](raw);
    } else input.dispatchEvent({ type: 'input' });
  }
  return { input, event };
}

function configureSearch(result, view) {
  const { context, controls } = result;
  if (view === 'compact') {
    Object.assign(context.cf_c_state, {
      hub: 'HUB', aircraftId: boeing767.id, targetHours: 24, slackHours: 0,
      routeCount: '2', routeType: 'mix', minStars: 0
    });
    return;
  }
  context.cf_setActiveHub('HUB');
  context.cf_selectAircraftFromCombobox(boeing767.id);
  controls.get('cf_target_duration_select').value = '24';
  controls.get('cf_slack_tolerance_select').value = '0';
  controls.get('cf_route_count_select').value = '2';
  controls.get('cf_star_filter_select').value = '0';
  controls.get('cf_min_leg_dur').value = '1.5';
  controls.get('cf_max_leg_dur').value = '48';
  context.cf_setRouteType('mix', false);
}

const circuitSignatures = circuits => [...new Set(Array.from(circuits, circuit =>
  Array.from(circuit.legs, leg => leg.dstIata).sort().join('-')
))].sort();

test('filter snapshots serialize all rule types and normalize duplicate airports', () => {
  const { context } = filterRuntime();
  const source = { airports: [' cph ', 'CPH', 'NRT'], countries: ['Japan', 'Japan'], continents: ['Asia', 'Europe'] };
  const before = JSON.stringify(source);
  assert.deepEqual(plain(context.cf_buildFilterClipboardPayload('include', source)), snapshot('include', {
    airports: ['CPH', 'NRT'], continents: ['Asia', 'Europe']
  }));
  assert.equal(JSON.stringify(source), before, 'Serialization does not change the source');
});

for (const view of ['desktop', 'compact']) {
  for (const scope of ['include', 'exclude']) {
    test(`${view} ${scope} copy-reset-paste restores rules, chips, storage, and search`, async () => {
      const payload = scope === 'include' ? snapshot(scope) : snapshot(scope, {
        airports: ['MID'], continents: ['North America']
      });
      const result = filterRuntime();
      const { context, controls, clipboardWrites, storage, runTimers } = result;
      pasteFilters(result, view, scope, JSON.stringify(payload));
      const before = plain(context.cf_getPrecisionFilters());
      const search = () => view === 'desktop' ? searchDesktop(context) : context.cf_c_engine.findCircuits();
      const signatures = circuitSignatures(search());
      assert.ok(signatures.length > 0, 'The snapshot allows valid circuits');
      const copied = view === 'desktop'
        ? await context[scope === 'include' ? 'cf_copyIncludedFilters' : 'cf_copyExcludedFilters']()
        : await context.cf_c_engine.copyFilterSnapshot(scope);
      assert.equal(copied, true);
      assert.deepEqual(JSON.parse(clipboardWrites[0]), payload);

      if (view === 'desktop') context.cf_resetCircuitFinderFilters();
      else controls.get('cf_c_btn_reset_all').dispatchEvent({ type: 'click' });
      assert.deepEqual(plain(context.cf_getPrecisionFilters()), emptyFilters());
      configureSearch(result, view);
      if (view === 'desktop') context[scope === 'include' ? 'cf_setIncludeMode' : 'cf_setExcludeMode']('cn');
      else controls.get(`cf_c_btn_${scope === 'include' ? 'inc' : 'exc'}_ct`).dispatchEvent({ type: 'click' });
      const { input, event } = pasteFilters(result, view, scope, clipboardWrites[0]);
      assert.equal(event.defaultPrevented, true, 'Snapshot is handled before plain-text paste');
      assert.equal(input.value, '');
      assert.deepEqual(plain(context.cf_getPrecisionFilters()), before);
      if (view === 'desktop') runTimers(120);
      const restoredResults = view === 'desktop' ? context.cf_getDiscoveredCircuits() : context.cf_c_state.discoveredCircuits;
      assert.deepEqual(circuitSignatures(restoredResults), signatures, 'Search results refresh after paste');
      const chips = controls.get(view === 'desktop' ? `cf_${scope}_airports_chips` : `cf_c_${scope === 'include' ? 'inc' : 'exc'}_chips`);
      for (const item of [...payload.airports, ...payload.countries, ...payload.continents]) assert.ok(chips.innerHTML.includes(item));
      const persisted = JSON.parse(storage.get('amt_circuit_finder_state_v1'));
      assert.deepEqual(precisionFilters(persisted), before);
      const badge = controls.get(view === 'desktop' ? `cf_${scope === 'include' ? 'inc' : 'exc'}_badge` : `cf_c_${scope === 'include' ? 'inc' : 'exc'}_badge`);
      assert.equal(Number(badge.textContent), 3);
    });
  }

  test(`${view} snapshots merge idempotently and remove matching opposite rules`, () => {
    const result = filterRuntime({
      includedAirports: ['CPH'], includedCountries: ['Norway'], includedContinents: ['Europe'],
      excludedAirports: ['MIN', 'MAX'], excludedCountries: ['Japan', 'Denmark'], excludedContinents: ['Asia', 'Africa']
    });
    const { context } = result;
    const payload = snapshot('include', { airports: ['min', 'MIN'], countries: ['Japan', 'Japan'], continents: ['Asia', 'Asia'] });
    pasteFilters(result, view, 'include', JSON.stringify(payload));
    const expected = {
      includedAirports: ['CPH', 'MIN'], includedCountries: ['Norway', 'Japan'], includedContinents: ['Europe', 'Asia'],
      excludedAirports: ['MAX'], excludedCountries: ['Denmark'], excludedContinents: ['Africa']
    };
    assert.deepEqual(plain(context.cf_getPrecisionFilters()), expected);
    pasteFilters(result, view, 'include', JSON.stringify(payload));
    assert.deepEqual(plain(context.cf_getPrecisionFilters()), expected);
    pasteFilters(result, view, 'exclude', JSON.stringify(snapshot('exclude')));
    assert.deepEqual(plain(context.cf_getPrecisionFilters()), {
      includedAirports: ['CPH'], includedCountries: ['Norway'], includedContinents: ['Europe'],
      excludedAirports: ['MAX', 'MIN'], excludedCountries: ['Denmark', 'Japan'], excludedContinents: ['Africa', 'Asia']
    });
  });

  test(`${view} rejects invalid or wrong-scope JSON without changing filters or persistence`, () => {
    const result = filterRuntime({ includedAirports: ['CPH'], excludedAirports: ['MAX'] });
    const { context, storage, toasts } = result;
    context.cf_saveStateToLocalStorage(true);
    const before = JSON.stringify(context.cf_getPrecisionFilters());
    const saved = storage.get('amt_circuit_finder_state_v1');
    const invalid = [
      '{"format": "amt-circuit-finder-filter", "airports": ["NRT",}',
      '[]', '{}',
      ...[
        { format: 'other-format' }, { version: 2 }, { version: '1' },
        { scope: 'invalid' }, { scope: 'exclude' }, { airports: 'NRT' },
        { airports: ['NRT', 1] }, { airports: ['NR1'] }, { countries: null },
        { countries: [''] }, { countries: ['Unknown Country'] },
        { continents: ['Atlantis'] }, { continents: undefined }
      ].map(overrides => JSON.stringify(snapshot('include', overrides)))
    ];
    for (const raw of invalid) {
      const toastCount = toasts.length;
      const { input } = pasteFilters(result, view, 'include', raw);
      assert.equal(JSON.stringify(context.cf_getPrecisionFilters()), before, raw);
      assert.equal(storage.get('amt_circuit_finder_state_v1'), saved, raw);
      assert.equal(input.value, raw, 'Invalid text remains available for correction');
      assert.equal(toasts.length, toastCount + 1, 'Invalid snapshot reports an error');
    }
    const wrongField = pasteFilters(result, view, 'exclude', JSON.stringify(snapshot('include')));
    assert.equal(wrongField.input.value, JSON.stringify(snapshot('include')));
    assert.equal(JSON.stringify(context.cf_getPrecisionFilters()), before);
  });

  for (const raw of ['MIN,MID;MAX\nCPH', 'MIN MID MAX CPH', 'min,MIN;mid\nMAX,cph']) {
    test(`${view} retains plain-text airport batch paste: ${JSON.stringify(raw)}`, () => {
      const result = filterRuntime();
      for (const scope of ['include', 'exclude']) {
        const { event } = pasteFilters(result, view, scope, raw);
        assert.equal(Boolean(event.defaultPrevented), false);
        assert.deepEqual(plain(result.context.cf_getPrecisionFilters()[scope === 'include' ? 'includedAirports' : 'excludedAirports']), ['MIN', 'MID', 'MAX', 'CPH']);
      }
      assert.deepEqual(plain(result.context.cf_getIncludedAirports()), [], 'Exclusion batch resolves airport conflicts');
    });
  }

  test(`${view} retains country and continent batch parsing`, () => {
    const result = filterRuntime();
    const { context, controls } = result;
    for (const [mode, raw, key, expected] of [
      ['ct', 'Japan;Denmark\nNorway', 'includedCountries', ['Japan', 'Denmark', 'Norway']],
      ['cn', 'Asia;North America\nEurope', 'includedContinents', ['Asia', 'North America', 'Europe']]
    ]) {
      if (view === 'desktop') context.cf_setIncludeMode(mode);
      else controls.get(`cf_c_btn_inc_${mode}`).dispatchEvent({ type: 'click' });
      pasteFilters(result, view, 'include', raw);
      assert.deepEqual(plain(context.cf_getPrecisionFilters()[key]), expected);
    }
  });
}

test('compact and desktop snapshots are identical and clears do not resurrect on remount', async () => {
  const result = filterRuntime({
    includedAirports: ['CPH'], includedCountries: ['Japan'], includedContinents: ['Asia'],
    excludedAirports: ['MAX'], excludedCountries: ['Norway'], excludedContinents: ['Africa']
  });
  const { context, clipboardWrites } = result;
  assert.deepEqual(plain(precisionFilters(context.cf_c_state)), plain(context.cf_getPrecisionFilters()));
  await context.cf_copyIncludedFilters();
  await context.cf_c_engine.copyFilterSnapshot('include');
  await context.cf_copyExcludedFilters();
  await context.cf_c_engine.copyFilterSnapshot('exclude');
  assert.equal(clipboardWrites[0], clipboardWrites[1]);
  assert.equal(clipboardWrites[2], clipboardWrites[3]);
  context.cf_c_engine.clearInclude();
  context.cf_clearExcludedAirports();
  result.mountCompact();
  assert.deepEqual(plain(precisionFilters(context.cf_c_state)), emptyFilters());
  pasteFilters(result, 'compact', 'include', clipboardWrites[0]);
  await context.cf_copyIncludedFilters();
  assert.equal(clipboardWrites[4], clipboardWrites[0], 'Compact restore can be copied from desktop');
  context.cf_resetCircuitFinderFilters();
  result.mountCompact();
  assert.deepEqual(plain(precisionFilters(context.cf_c_state)), emptyFilters());
  pasteFilters(result, 'desktop', 'exclude', clipboardWrites[3]);
  result.mountCompact();
  await context.cf_c_engine.copyFilterSnapshot('exclude');
  assert.equal(clipboardWrites[5], clipboardWrites[3], 'Desktop restore can be copied from compact');
});

test('compact continent scope selects candidates instead of requiring every airport', () => {
  const result = filterRuntime();
  const { context } = result;
  pasteFilters(result, 'compact', 'include', JSON.stringify(snapshot('include', {
    airports: [], countries: [], continents: ['Europe', 'Asia']
  })));
  const circuits = context.cf_c_state.discoveredCircuits;
  assert.ok(circuits.length > 0, 'Many airports in the selected continents still allow two-route circuits');
  assert.ok(circuits.every(circuit => circuit.legs.every(leg => ['Europe', 'Asia'].includes(leg.continent))));
  pasteFilters(result, 'compact', 'exclude', JSON.stringify(snapshot('exclude', {
    airports: [], countries: [], continents: ['Europe']
  })));
  assert.ok(context.cf_c_state.discoveredCircuits.length > 0);
  assert.ok(context.cf_c_state.discoveredCircuits.every(circuit => circuit.legs.every(leg => leg.continent === 'Asia')));
});

test('compact add, remove, batch conflicts, and reset persist all filter types', () => {
  const result = filterRuntime();
  const { context, controls, storage } = result;
  context.cf_c_engine.addIncludeContinent('Asia');
  assert.deepEqual(plain(context.cf_getIncludedContinents()), ['Asia']);
  context.cf_c_engine.removeIncludeContinent('Asia');
  assert.deepEqual(plain(context.cf_getIncludedContinents()), []);
  context.cf_c_engine.addExcludeContinent('Africa');
  context.cf_c_engine.removeExcludeContinent('Africa');
  assert.deepEqual(plain(context.cf_getExcludedContinents()), []);
  pasteFilters(result, 'compact', 'exclude', 'MIN,MID');
  pasteFilters(result, 'compact', 'include', 'MIN,MID');
  assert.equal(controls.get('cf_c_exc_chips').innerHTML, '', 'Batch conflicts refresh opposite chips');
  context.cf_c_engine.excludeSingleRoute('MIN');
  assert.deepEqual(plain(context.cf_getIncludedAirports()), ['MID']);
  assert.deepEqual(plain(context.cf_getExcludedAirports()), ['MIN']);
  controls.get('cf_c_btn_reset_all').dispatchEvent({ type: 'click' });
  assert.deepEqual(precisionFilters(JSON.parse(storage.get('amt_circuit_finder_state_v1'))), emptyFilters());
  assert.deepEqual(plain(context.cf_getPrecisionFilters()), emptyFilters());
  result.mountCompact();
  assert.deepEqual(plain(precisionFilters(context.cf_c_state)), emptyFilters());
});

test('raw snapshot application validates before mutating either view', () => {
  const { context } = filterRuntime();
  assert.equal(context.cf_applyFilterClipboardPayload(snapshot('include', { continents: 42 })), false);
  assert.equal(context.cf_c_engine.applyFilterSnapshot(snapshot('exclude', { version: 2 })), false);
  assert.deepEqual(plain(context.cf_getPrecisionFilters()), emptyFilters());
  assert.deepEqual(plain(precisionFilters(context.cf_c_state)), emptyFilters());
});

test('copy controls remain hidden and disabled until any type of rule is present', async () => {
  const result = filterRuntime();
  const { context, controls, clipboardWrites } = result;
  for (const id of ['cf_copy_include_btn', 'cf_copy_exclude_btn', 'cf_c_btn_copy_inc', 'cf_c_btn_copy_exc']) {
    assert.equal(controls.get(id).disabled, true);
    assert.ok(controls.get(id).classList.contains('hidden') || controls.get(id).style.display === 'none');
  }
  assert.equal(await context.cf_copyIncludedFilters(), false);
  assert.equal(await context.cf_c_engine.copyFilterSnapshot('exclude'), false);
  assert.equal(clipboardWrites.length, 0);
  context.cf_c_engine.addIncludeContinent('Asia');
  context.cf_c_engine.addExcludeContinent('Africa');
  for (const id of ['cf_copy_include_btn', 'cf_copy_exclude_btn', 'cf_c_btn_copy_inc', 'cf_c_btn_copy_exc']) assert.equal(controls.get(id).disabled, false);
});

test('clipboard success reports success and temporarily changes the icon and accessible label', async () => {
  const result = filterRuntime({ includedContinents: ['Asia'] });
  const { context, controls, toasts, clipboardWrites, fallbackWrites, runTimers } = result;
  const button = controls.get('cf_copy_include_btn');
  const original = button.innerHTML;
  assert.equal(await context.cf_copyIncludedFilters(), true);
  assert.deepEqual(JSON.parse(clipboardWrites[0]), snapshot('include', { airports: [], countries: [] }));
  assert.equal(fallbackWrites.length, 0);
  assert.equal(button.getAttribute('aria-label'), 'Copied');
  assert.ok(button.innerHTML.includes('lucide-check'));
  assert.equal(toasts.at(-1).type, 'success');
  runTimers(1400);
  assert.equal(button.innerHTML, original);
  assert.equal(button.getAttribute('aria-label'), 'Copy inclusions');
});

for (const native of ['absent', 'rejected']) {
  test(`clipboard fallback copies snapshots when the native API is ${native}`, async () => {
    const result = filterRuntime({ excludedContinents: ['Africa'] });
    const { context, controls, fallbackWrites, toasts } = result;
    context.navigator = native === 'absent' ? {} : { clipboard: { async writeText() { throw new Error('Denied'); } } };
    const previousFocus = controls.get('cf_c_exc_input');
    context.document.activeElement = previousFocus;
    assert.equal(await context.cf_c_engine.copyFilterSnapshot('exclude'), true);
    assert.deepEqual(JSON.parse(fallbackWrites[0]), snapshot('exclude', { airports: [], countries: [], continents: ['Africa'] }));
    assert.equal(context.document.body.children.length, 0, 'Temporary textarea removed');
    assert.equal(previousFocus.focusCalls, 1, 'Previous focus restored');
    assert.equal(toasts.at(-1).type, 'success');
  });
}

for (const failure of ['false', 'throws', 'unavailable']) {
  test(`clipboard failure (${failure}) reports failure and leaves filters and button unchanged`, async () => {
    const result = filterRuntime({ includedAirports: ['MIN'] });
    const { context, controls, toasts } = result;
    context.navigator = {};
    context.document.execCommand = failure === 'unavailable' ? undefined : () => {
      if (failure === 'throws') throw new Error('Copy failed');
      return false;
    };
    const button = controls.get('cf_copy_include_btn');
    const icon = button.innerHTML;
    const before = JSON.stringify(context.cf_getPrecisionFilters());
    assert.equal(await context.cf_copyIncludedFilters(), false);
    assert.equal(button.innerHTML, icon);
    assert.equal(button.getAttribute('aria-label'), 'Copy inclusions');
    assert.equal(context.document.body.children.length, 0);
    assert.equal(JSON.stringify(context.cf_getPrecisionFilters()), before);
    assert.equal(toasts.at(-1).type, 'warning');
  });
}
