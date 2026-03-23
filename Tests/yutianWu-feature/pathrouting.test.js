/**
 * pathrouting.test.js
 * Unit tests for pathrouting.js
 * Run with: npx jest --testEnvironment node
 */
// NOTE: To run tests locally, change the require below to './pathrouting_test_version'
// This file references pathrouting.js for GitLab CI compatibility

// ================================================================
//  Mock Leaflet (L)
// ================================================================
const mockMarker = {
  addTo: jest.fn().mockReturnThis(),
  bindPopup: jest.fn().mockReturnThis(),
  openPopup: jest.fn().mockReturnThis(),
  setLatLng: jest.fn().mockReturnThis(),
};

const mockPolyline = {
  addTo: jest.fn().mockReturnThis(),
  getBounds: jest.fn().mockReturnValue({}),
};

const mockRoutingControl = {
  addTo: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
};

global.L = {
  latLng: jest.fn((lat, lng) => ({ lat, lng })),
  marker: jest.fn(() => mockMarker),
  polyline: jest.fn(() => mockPolyline),
  divIcon: jest.fn(() => ({})),
  Routing: {
    control: jest.fn(() => mockRoutingControl),
    osrmv1: jest.fn(() => ({})),
  },
};

global.fetch = jest.fn();
global.navigator.geolocation = { watchPosition: jest.fn() };

// Mock AbortController — used in loadAccessibleFacilities
global.AbortController = class {
  constructor() { this.signal = {}; }
  abort() {}
};

const {
  initRouting, setRoutingMode, createRoute,
  geocode, startGPS, getUserLatLng,
  loadAccessibleFacilities, clearFacilityMarkers,
  _getFacilityEmoji, _getFacilityLabel,
} = require('./pathrouting');

// ================================================================
//  Mock map
// ================================================================
const mockMap = {
  removeControl: jest.fn(),
  removeLayer: jest.fn(),
  setView: jest.fn(),
  fitBounds: jest.fn(),
  getCenter: jest.fn().mockReturnValue({ lat: 52.4862, lng: -1.8904 }),
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default fetch: returns valid empty Overpass response
  global.fetch.mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify({ elements: [] }),
  });
  initRouting(mockMap, jest.fn());
});

// ================================================================
//  1. initRouting()
// ================================================================
describe('initRouting()', () => {
  test('initialises without crashing', () => {
    expect(() => initRouting(mockMap, () => {})).not.toThrow();
  });

  test('works without a status callback', () => {
    expect(() => initRouting(mockMap)).not.toThrow();
  });
});

// ================================================================
//  2. setRoutingMode()
// ================================================================
describe('setRoutingMode()', () => {
  test('sets mode to walk without calling loadAccessibleFacilities', () => {
    setRoutingMode('walk');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('wheelchair mode skips loadAccessibleFacilities if GPS not yet available', () => {
    // _userLatLng is null, so fetch should NOT be called
    setRoutingMode('wheelchair');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('wheelchair mode loads facilities if GPS is already available', () => {
    // Give the module a GPS fix first
    navigator.geolocation.watchPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: 52.4862, longitude: -1.8904, accuracy: 10 } });
    });
    startGPS(jest.fn(), jest.fn());

    setRoutingMode('wheelchair');
    expect(global.fetch).toHaveBeenCalled();
  });
});

// ================================================================
//  3. createRoute()
// ================================================================
describe('createRoute()', () => {
  const start = { lat: 52.4862, lng: -1.8904 };
  const end   = { lat: 52.4796, lng: -1.9026 };

  test('creates a walking route using LRM in walk mode', () => {
    setRoutingMode('walk');
    createRoute(start, end);
    expect(L.Routing.control).toHaveBeenCalled();
    expect(mockRoutingControl.addTo).toHaveBeenCalledWith(mockMap);
  });

  test('calls ORS wheelchair endpoint with correct coordinates', async () => {
    setRoutingMode('walk'); // stay in walk so no Overpass call interferes
    // Manually fire the wheelchair fetch to test it in isolation
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        features: [{
          geometry: { coordinates: [[-1.8904, 52.4862], [-1.9026, 52.4796]] },
          properties: { summary: { distance: 1200, duration: 900 } }
        }]
      })
    });

    setRoutingMode('wheelchair');
    createRoute(start, end);
    await new Promise(r => setTimeout(r, 50));

    // Find the ORS call specifically (not the Overpass call)
    const orsCalls = global.fetch.mock.calls.filter(c => c[0].includes('openrouteservice'));
    expect(orsCalls.length).toBeGreaterThan(0);

    const body = JSON.parse(orsCalls[0][1].body);
    expect(body.coordinates[0]).toEqual([start.lng, start.lat]);
    expect(body.coordinates[1]).toEqual([end.lng, end.lat]);
  });

  test('clears previous walking route before creating a new one', () => {
    setRoutingMode('walk');
    createRoute(start, end);
    createRoute(start, end);
    expect(mockMap.removeControl).toHaveBeenCalled();
  });

  test('sends correct ORS request body format for wheelchair route', async () => {
    // Verify the fetch call contains the right structure
    // (createRoute does not return a promise so we test the request, not the result)
    setRoutingMode('wheelchair');
    createRoute(start, end);
    await new Promise(r => setTimeout(r, 50));

    const orsCalls = global.fetch.mock.calls.filter(c => c[0].includes('openrouteservice'));
    expect(orsCalls.length).toBe(1);

    const options = orsCalls[0][1];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(options.headers['Authorization']).toBeTruthy();
  });
});

// ================================================================
//  4. geocode()
// ================================================================
describe('geocode()', () => {
  test('returns lat/lng/displayName when place is found', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ([{
        lat: '52.4862',
        lon: '-1.8904',
        display_name: 'Birmingham Museum, Birmingham, UK'
      }])
    });

    const result = await geocode('Birmingham Museum');
    expect(result).not.toBeNull();
    expect(result.lat).toBeCloseTo(52.4862);
    expect(result.lng).toBeCloseTo(-1.8904);
    expect(result.displayName).toBe('Birmingham Museum, Birmingham, UK');
  });

  test('returns null when place is not found', async () => {
    global.fetch.mockResolvedValueOnce({ json: async () => ([]) });
    const result = await geocode('xyznonexistentplace123');
    expect(result).toBeNull();
  });

  test('restricts search to Birmingham (countrycodes + viewbox + bounded)', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ([{ lat: '52.4862', lon: '-1.8904', display_name: 'Test' }])
    });
    await geocode('Test Place');
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('countrycodes=gb');
    expect(url).toContain('viewbox=-2.1,52.6,-1.7,52.3');
    expect(url).toContain('bounded=1');
  });

  test('returns numeric types for lat and lng', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ([{ lat: '52.4862', lon: '-1.8904', display_name: 'Test' }])
    });
    const result = await geocode('Test');
    expect(typeof result.lat).toBe('number');
    expect(typeof result.lng).toBe('number');
  });
});

// ================================================================
//  5. startGPS()
// ================================================================
describe('startGPS()', () => {
  test('calls onError if geolocation is not supported', () => {
    const original = global.navigator.geolocation;
    delete global.navigator.geolocation;

    const onError = jest.fn();
    startGPS(null, onError);
    expect(onError).toHaveBeenCalledWith('Your browser does not support GPS positioning.');

    global.navigator.geolocation = original;
  });

  test('calls watchPosition with high accuracy enabled', () => {
    startGPS(jest.fn(), jest.fn());
    expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ enableHighAccuracy: true })
    );
  });

  test('calls onSuccess with latlng and accuracy on position update', () => {
    const onSuccess = jest.fn();
    navigator.geolocation.watchPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: 52.4862, longitude: -1.8904, accuracy: 10 } });
    });
    startGPS(onSuccess, jest.fn());
    expect(onSuccess).toHaveBeenCalled();
    expect(L.latLng).toHaveBeenCalledWith(52.4862, -1.8904);
  });

  test('shows correct error when permission is denied (code 1)', () => {
    const onError = jest.fn();
    navigator.geolocation.watchPosition.mockImplementationOnce((_, error) => error({ code: 1 }));
    startGPS(jest.fn(), onError);
    expect(onError).toHaveBeenCalledWith('Location permission denied, please enable it in browser settings');
  });

  test('shows correct error when GPS is unavailable (code 2)', () => {
    const onError = jest.fn();
    navigator.geolocation.watchPosition.mockImplementationOnce((_, error) => error({ code: 2 }));
    startGPS(jest.fn(), onError);
    expect(onError).toHaveBeenCalledWith('Unable to retrieve location, please check if GPS is enabled');
  });

  test('shows correct error on timeout (code 3)', () => {
    const onError = jest.fn();
    navigator.geolocation.watchPosition.mockImplementationOnce((_, error) => error({ code: 3 }));
    startGPS(jest.fn(), onError);
    expect(onError).toHaveBeenCalledWith('Location timeout, please try again');
  });

  test('shows fallback message for unknown error code', () => {
    const onError = jest.fn();
    navigator.geolocation.watchPosition.mockImplementationOnce((_, error) => error({ code: 99 }));
    startGPS(jest.fn(), onError);
    expect(onError).toHaveBeenCalledWith('Failed to locate');
  });
});

// ================================================================
//  6. getUserLatLng()
// ================================================================
describe('getUserLatLng()', () => {
  test('does not crash when called before GPS starts', () => {
    expect(() => getUserLatLng()).not.toThrow();
  });

  test('returns latlng after GPS position is received', () => {
    navigator.geolocation.watchPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: 52.4862, longitude: -1.8904, accuracy: 10 } });
    });
    startGPS(jest.fn(), jest.fn());
    expect(getUserLatLng()).not.toBeNull();
  });
});

// ================================================================
//  7. loadAccessibleFacilities()
//  Uses res.text() + JSON.parse() + AbortController timeout
// ================================================================
describe('loadAccessibleFacilities()', () => {
  const center = { lat: 52.4862, lng: -1.8904 };

  test('adds a marker for each facility returned', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({
        elements: [
          { lat: 52.486, lon: -1.890, tags: { highway: 'elevator' } },
          { lat: 52.487, lon: -1.891, tags: { ramp: 'yes' } },
        ]
      })
    });

    await loadAccessibleFacilities(center);
    expect(L.marker).toHaveBeenCalledTimes(2);
  });

  test('handles empty results without crashing', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ elements: [] })
    });
    await expect(loadAccessibleFacilities(center)).resolves.not.toThrow();
  });

  test('handles network error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(loadAccessibleFacilities(center)).resolves.not.toThrow();
  });

  test('handles non-ok HTTP response (e.g. 504) gracefully', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 504 });
    await expect(loadAccessibleFacilities(center)).resolves.not.toThrow();
  });
});

// ================================================================
//  8. _getFacilityEmoji()
// ================================================================
describe('_getFacilityEmoji()', () => {
  test('returns 🛗 for elevator',          () => expect(_getFacilityEmoji({ highway: 'elevator' })).toBe('🛗'));
  test('returns ♿ for ramp',              () => expect(_getFacilityEmoji({ ramp: 'yes' })).toBe('♿'));
  test('returns 🔽 for lowered kerb',     () => expect(_getFacilityEmoji({ kerb: 'lowered' })).toBe('🔽'));
  test('returns ✅ for generic facility', () => expect(_getFacilityEmoji({ wheelchair: 'yes' })).toBe('✅'));
});

// ================================================================
//  9. _getFacilityLabel()
// ================================================================
describe('_getFacilityLabel()', () => {
  test('returns Elevator',                       () => expect(_getFacilityLabel({ highway: 'elevator' })).toBe('Elevator'));
  test('returns Ramp',                           () => expect(_getFacilityLabel({ ramp: 'yes' })).toBe('Ramp'));
  test('returns Lowered Kerb',                   () => expect(_getFacilityLabel({ kerb: 'lowered' })).toBe('Lowered Kerb'));
  test('returns Accessible Facility as default', () => expect(_getFacilityLabel({})).toBe('Accessible Facility'));
});
