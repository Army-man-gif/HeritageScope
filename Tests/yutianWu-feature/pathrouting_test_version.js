/*
 * path-routing.js
 * 
 * Responsible: Esther
 * Functionality: Path Routing — Walking & Wheelchair Accessible Routes
 *
 * Usage:
 *   1. Include Leaflet, Leaflet Routing Machine, and this file in your HTML
 *   2. Initialize with initRouting(map), passing in a pre-created Leaflet map object
 *   3. Call createRoute(startLatLng, endLatLng) when drawing a route
 *  
 *
 * Dependencies:
 *   - Leaflet.js
 *   - Leaflet Routing Machine
 */


//  ORS API Key — address：https://openrouteservice.org/sign-up/
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjI2M2M0YzNhYzk3ZjRiOGVhYzlkNzg4ZmJjMGJiMjk0IiwiaCI6Im11cm11cjY0In0=';


// Internal State Variables

let _map               = null;   // Leaflet map object
let _currentMode       = 'walk'; // current routing mode: 'walk' or 'wheelchair'
let _routingControl    = null;   // Walking Route LRM Control
let _wheelchairPolyline = null;  // Wheelchair Route Polyline
let _facilityMarkers   = [];     // Accessible Facilities Markers
let _userLatLng        = null;   // User's Current GPS Coordinates
let _userMarker        = null;   // Blue GPS Circle on the Map
let _onStatusUpdate    = null;   // Status Update Callback (passed from outside)
let _destinationMarker = null;
//  Initialization function
//
//  @param {L.Map}   map            - Pre-created Leaflet map object
//  @param {Function} onStatusUpdate - Optional, status text update callback
//                                   
function initRouting(map, onStatusUpdate) {
  _map = map;
  _onStatusUpdate = onStatusUpdate || function() {};
}


//  @param {'walk' | 'wheelchair'} mode

function setRoutingMode(mode) {
  _currentMode = mode;

  if (mode === 'wheelchair') {
    setStatus('♿Accessibility Mode  — Loading nearby accessible facilities...');
    if(_userLatLng){
      loadAccessibleFacilities(_userLatLng);
    }
  } else {
    clearFacilityMarkers();
    setStatus('🚶Walking Mode');
  }
}

//  Generate Route — Core Function
//  Use OSRM for walking mode, ORS for wheelchair mode.
//
//  @param {L.LatLng} startLatLng
//  @param {L.LatLng} endLatLng

function createRoute(startLatLng, endLatLng) {
  // Clear the previous route
  if (_routingControl)     { _map.removeControl(_routingControl); _routingControl = null; }
  if (_wheelchairPolyline) { _map.removeLayer(_wheelchairPolyline); _wheelchairPolyline = null; }
  if (_destinationMarker)  { _map.removeLayer(_destinationMarker); _destinationMarker = null; }
  if (_currentMode === 'wheelchair') {
    createWheelchairRoute(startLatLng, endLatLng);
  } else {
    createWalkingRoute(startLatLng, endLatLng);
  }
}

//Walking Route
function createWalkingRoute(startLatLng, endLatLng) {
  _routingControl = L.Routing.control({
    waypoints: [startLatLng, endLatLng],
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'walking'
    }),
    routeWhileDragging: false,
    lineOptions: {
      styles: [{ color: '#4E90F5', weight: 5, opacity: 0.85 }]
    },
    fitSelectedRoutes: true,
    show: true
  }).addTo(_map);

  _routingControl.on('routesfound', function(e) {
    const summary = e.routes[0].summary;
    const distKm  = (summary.totalDistance / 1000).toFixed(2);
    const timeMin = Math.round(summary.totalTime / 60);
    setStatus(`✅ Walking route generated | 🚶 ${distKm}km, approximately ${timeMin} minutes`);

    const steps = e.routes[0].instructions.map(i => i.text);
    
  });

  _routingControl.on('routingerror', function() {
    setStatus('❌ Walking route planning failed, please try a different destination');
  });
}


//  Wheelchair Route (ORS)

async function createWheelchairRoute(startLatLng, endLatLng) {
  setStatus('♿ Loading wheelchair route, please wait...');

  try {
    const res = await fetch(
      'https://api.openrouteservice.org/v2/directions/wheelchair/geojson',
      {
        method: 'POST',
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Note: ORS format is [longitude, latitude], opposite of Leaflet's [latitude, longitude]
          coordinates: [
            [startLatLng.lng, startLatLng.lat],
            [endLatLng.lng,   endLatLng.lat]
          ]
        })
      }
    );

    const data = await res.json();

    if (data.error) {
      setStatus(`❌ Wheelchair route failed: ${data.error.message || 'Please try a different destination'}`);
      return;
    }

    const feature = data.features[0];
    const summary = feature.properties.summary;
    const distKm  = (summary.distance / 1000).toFixed(2);
    const timeMin = Math.round(summary.duration / 60);

    // ORS returns [longitude, latitude], converted to Leaflet's [latitude, longitude]
    const latLngs = feature.geometry.coordinates.map(c => L.latLng(c[1], c[0]));
    // draw wheelchair route polyline
    _wheelchairPolyline = L.polyline(latLngs, {
      color: '#94C000',
      weight: 5,
      opacity: 0.85
    }).addTo(_map);

    // add destination marker
    _destinationMarker = L.marker([endLatLng.lat, endLatLng.lng])
      .addTo(_map)
      .bindPopup('Destination')
      .openPopup();

    _map.fitBounds(_wheelchairPolyline.getBounds());
    setStatus(`✅ Wheelchair route generated | ♿ ${distKm}km, approximately ${timeMin} minutes`);

    

  } catch (err) {
    setStatus('❌ Wheelchair route request failed, please check your network connection');
    console.error('ORS fetch error:', err);
  }
}


//  Restricted to Birmingham, UK, to prevent jumping to other countries.
//  @param  {string} placeName
//  @return {Promise<{lat, lng, displayName} | null>}

async function geocode(placeName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=5&countrycodes=gb&viewbox=-2.1,52.6,-1.7,52.3&bounded=1`;
  const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) return null;
  return {
    lat: Number.parseFloat(data[0].lat),
    lng: Number.parseFloat(data[0].lon),
    displayName: data[0].display_name
  };
}


//  GPS location
//  After activation, a blue dot will automatically appear on the map and continuously track the location.
//
//  @param {Function} onSuccess - Location success callback, passes (latlng, accuracy)
//  @param {Function} onError   - Location failure callback, passes error message string

function startGPS(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError?.('Your browser does not support GPS positioning.');
    return;
  }

  navigator.geolocation.watchPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const acc = Math.round(position.coords.accuracy);

      _userLatLng = L.latLng(lat, lng);

      if (_userMarker) {
        _userMarker.setLatLng(_userLatLng);
      } else {
        const icon = L.divIcon({
          className: '',
          html: '<div style="width:16px;height:16px;background:#4fc3f7;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(79,195,247,0.3)"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        _userMarker = L.marker(_userLatLng, { icon }).addTo(_map);
        _userMarker.bindPopup('you are here').openPopup();
        _map.setView(_userLatLng, 16);

        if (_currentMode === 'wheelchair') {
          loadAccessibleFacilities(_userLatLng);
        }
      }

      onSuccess?.(_userLatLng, acc);
    },
    function(error) {
      const msgs = {
        1: 'Location permission denied, please enable it in browser settings',
        2: 'Unable to retrieve location, please check if GPS is enabled',
        3: 'Location timeout, please try again'
      };
      onError?.(msgs[error.code] || 'Failed to locate');
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
}


//  @return {L.LatLng | null}

function getUserLatLng() {
  return _userLatLng;
}

//  Accessibility Features Labeling（Overpass API）
//  Mark nearby facilities such as elevators, ramps, and lowered curbs on the map.
async function loadAccessibleFacilities(center) {
  const query = `
    [out:json][timeout:10];
    (
      node["highway"="elevator"](around:500,${center.lat},${center.lng});
      node["ramp"="yes"](around:500,${center.lat},${center.lng});
      node["kerb"="lowered"](around:500,${center.lat},${center.lng});
      node["wheelchair"="yes"](around:500,${center.lat},${center.lng});
    );
    out body;
  `;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res  = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: 'data=' + encodeURIComponent(query),
      signal: controller.signal
    });
    if (!res.ok) {
      throw new Error(`Overpass HTTP error ${res.status}`);
    }
    clearTimeout(timeout);
    const text = await res.text();
    const data = JSON.parse(text);
    clearFacilityMarkers();

    data.elements.forEach(el => {
      const emoji = _getFacilityEmoji(el.tags);
      const label = _getFacilityLabel(el.tags);
      const icon  = L.divIcon({
        className: '',
        html: `<div style="font-size:20px;line-height:1" title="${label}">${emoji}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      _facilityMarkers.push(
        L.marker([el.lat, el.lon], { icon })
          .addTo(_map)
          .bindPopup(`<b>${emoji} ${label}</b><br><small>Accessibility facilities</small>`)
      );
    });

    const count = _facilityMarkers.length;
    setStatus(count > 0
      ? `♿ Found ${count} nearby accessibility facilities`
      : '♿ No recorded accessibility facilities nearby');

  } catch (err) {
    setStatus('⚠️ Accessibility features failed to load. Please check your network connection.');
    console.error('Overpass error:', err);
  }
}

function clearFacilityMarkers() {
  _facilityMarkers.forEach(m => _map.removeLayer(m));
  _facilityMarkers = [];
}

function _getFacilityEmoji(tags) {
  if (tags.highway === 'elevator') return '🛗';
  if (tags.ramp    === 'yes')      return '♿';
  if (tags.kerb    === 'lowered')  return '🔽';
  return '✅';
}

function _getFacilityLabel(tags) {
  if (tags.highway === 'elevator') return 'Elevator';
  if (tags.ramp    === 'yes')      return 'Ramp';
  if (tags.kerb    === 'lowered')  return 'Lowered Kerb';
  return 'Accessible Facility';
}

//  Status Update Helper — Calls the external callback to update UI text and also logs to console.
function setStatus(text) {
  _onStatusUpdate(text);
}

// ── CommonJS exports for Jest testing ──
if (typeof module !== 'undefined') {
  module.exports = {
    initRouting, setRoutingMode, createRoute,
    geocode, startGPS, getUserLatLng,
    loadAccessibleFacilities, clearFacilityMarkers,
    _getFacilityEmoji, _getFacilityLabel, setStatus
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    initRouting, setRoutingMode, createRoute,
    geocode, startGPS, getUserLatLng,
    loadAccessibleFacilities, clearFacilityMarkers,
    _getFacilityEmoji, _getFacilityLabel, setStatus
  };
}
