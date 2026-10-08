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
  return {
    value, checked: false, disabled: false, innerHTML: '', textContent: '',
    options: ['any', '2', '3', '4', '5', '6', '7', '8', '9'].map(value => ({ value })),
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelectorAll() { return []; },
    addEventListener() {},
    setAttribute() {},
    focus() {}
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
  const document = {
    getElementById(id) { return controls.get(id) || null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return element(); },
    body: element()
  };
  const context = vm.createContext({
    AIRPORTS_DATABASE: airports,
    AIRCRAFT_DATABASE: aircraft,
    document, console, performance,
    setTimeout() { return 0; }, clearTimeout() {},
    location: { search: '', hash: '' },
    showToast() {},
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
  return { context, controls, storage };
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
