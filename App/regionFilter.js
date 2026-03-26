let regionOverlay = null;


function ensureOverlay() {
    if (regionOverlay) return regionOverlay;
    if (!globalThis.hsMap) return null;
    regionOverlay = L.layerGroup().addTo(globalThis.hsMap);
    return regionOverlay;
}

function clearOverlay() {
    const overlay = ensureOverlay();
    if (overlay) overlay.clearLayers();
}

function toPoint(latlng) {
    return { x: latlng.lng, y: latlng.lat, latlng };
}

function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(latlngs) {
    const pts = latlngs.map(toPoint).sort((p1, p2) => {
        if (p1.x === p2.x) return p1.y - p2.y;
        return p1.x - p2.x;
    });

    if (pts.length <= 2) return latlngs.slice();

    const lower = [];
    for (const p of pts) {
        while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper = [];
    for (let i = pts.length - 1; i >= 0; i -= 1) {
        const p = pts[i];
        while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper).map((p) => p.latlng);
}

function normalizeCountries(value) {
    if (Array.isArray(value)) {
        return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return [];
}

function markerMatchesRegion(marker, region) {
    if (region === 'ALL') return true;
    const props = marker.feature?.properties;
    return props && props.region === region;
}

function markerMatchesCountry(marker, country) {
    if (country === 'ALL') return true;
    const props = marker.feature?.properties;
    const countries = normalizeCountries(props?.states_names);
    return countries.includes(country);
}

function getCountriesForRegion(originalMarkers,region) {
    const set = new Set();
    originalMarkers.forEach((marker) => {
        if (!markerMatchesRegion(marker, region)) return;
        const props = marker.feature?.properties;
        normalizeCountries(props?.states_names).forEach((c) => set.add(c));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function populateCountries(markers,region) {
    const select = document.getElementById('countrySelect');
    if (!select) return;
    const current = select.value;
    const countries = getCountriesForRegion(markers,region);

    select.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = 'All countries';
    select.appendChild(allOption);

    countries.forEach((country) => {
        const opt = document.createElement('option');
        opt.value = country;
        opt.textContent = country;
        select.appendChild(opt);
    });

    // Use optional chaining
    select.value = countries.includes(current) ? current : 'ALL';
}

function applyRegionFilter(markers,originalMarkers,map,region, country) {
    const all = markers.getLayers().slice();
    if (!all) {
        console.warn('Markers not ready yet.');
        return;
    }

    const filtered = originalMarkers.filter((marker) =>
        markerMatchesRegion(marker, region) && markerMatchesCountry(marker, country)
    );

    markers.clearLayers();
    filtered.forEach((marker) => markers.addLayer(marker));

    clearOverlay();
    const shouldShade = filtered.length > 0 && (region !== 'ALL' || country !== 'ALL');
    if (shouldShade) {
        const overlay = ensureOverlay();
        if (overlay) {
            const latlngs = filtered.map((marker) => marker.getLatLng());
            const style = {
                color: '#2f6ce5',
                weight: 2,
                fillColor: '#8fc2ff',
                fillOpacity: 0.2
            };

            if (latlngs.length === 1) {
                overlay.addLayer(L.circle(latlngs[0], { radius: 500000, ...style }));
            } else if (latlngs.length === 2) {
                const bounds = L.latLngBounds(latlngs).pad(0.3);
                overlay.addLayer(L.rectangle(bounds, style));
            } else {
                const hull = convexHull(latlngs);
                overlay.addLayer(L.polygon(hull, style));
            }
        }
    }

    const countNode = document.getElementById('regionCount');
    if (countNode) {
        countNode.textContent = `Showing ${filtered.length} / ${originalMarkers.length}`;
    }

    if (filtered.length > 0 && map) {
        const bounds = L.featureGroup(filtered).getBounds();
        if (bounds?.isValid()) {
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 });
        }
    }
}

export function initRegionFilter(markers,originalMarkers,map) {
    const toggleButton = document.getElementById('regionFilterToggle');
    const panel = document.getElementById('regionFilterPanel');
    const regionSelect = document.getElementById('regionSelect');
    const countrySelect = document.getElementById('countrySelect');
    const applyButton = document.getElementById('regionApply');
    const clearButton = document.getElementById('regionClear');

    if (!toggleButton || !panel || !regionSelect || !countrySelect || !applyButton || !clearButton) {
        return false;
    }

    toggleButton.addEventListener('click', () => {
        const isHidden = panel.style.display === 'none' || panel.hasAttribute('hidden');
        if (isHidden) {
            panel.style.display = 'inline-flex';
            panel.removeAttribute('hidden');
        } else {
            panel.style.display = 'none';
            panel.setAttribute('hidden', '');
        }
    });

    regionSelect.addEventListener('change', () => {
        populateCountries(originalMarkers,regionSelect.value);
    });

    applyButton.addEventListener('click', () => {
        applyRegionFilter(markers,originalMarkers,map,regionSelect.value, countrySelect.value);
    });

    clearButton.addEventListener('click', () => {
        regionSelect.value = 'ALL';
        populateCountries(originalMarkers,'ALL');
        countrySelect.value = 'ALL';
        applyRegionFilter(markers, originalMarkers, map, 'ALL', 'ALL');
    });

    panel.style.display = 'none';
    panel.setAttribute('hidden', '');
    populateCountries(originalMarkers,'ALL');
    const overlay = ensureOverlay();
    const checkPolygonRendered = () => {
        return overlay && overlay.getLayers().length > 0;
    };
    const waitForPolygon = async () => {
        while (!checkPolygonRendered()) {
            await new Promise(r => setTimeout(r, 20));
        }
    };
    waitForPolygon();
    return true;
}
export { regionOverlay, clearOverlay };