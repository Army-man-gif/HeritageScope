const RISK_COLOURS = {
    RED:   { color: '#cc0000', fillColor: '#ff4444', fillOpacity: 0.7 },
    AMBER: { color: '#cc7700', fillColor: '#ffaa00', fillOpacity: 0.5 },
    GREEN: { color: '#007700', fillColor: '#44cc44', fillOpacity: 0.4 }
};

let statusCircles = [];
let overlayVisible = false;

export async function toggleStatusOverlay(map) {
    if (overlayVisible) {
        statusCircles.forEach(c => map.removeLayer(c));
        statusCircles = [];
        overlayVisible = false;
        document.getElementById('status-btn').textContent = 'Show At-Risk Sites';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/status');
        const sites = await response.json();

        sites.forEach(site => {
            const style = RISK_COLOURS[site.riskLevel] || RISK_COLOURS.GREEN;
            const circle = L.circle([site.latitude, site.longitude], {
                radius: 300,
                ...style
            }).bindPopup(`
                <b>${site.siteName}</b><br>
                Risk: <b style="color:${style.color}">${site.riskLevel}</b><br>
                Visitors: ${site.visitorPressure}<br>
                Weather: ${site.weatherCondition}
            `);
            circle.addTo(map);
            statusCircles.push(circle);
        });
        const bounds = statusCircles[0].getBounds();
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
        }
        overlayVisible = true;
        document.getElementById('status-btn').textContent = 'Hide At-Risk Sites';
    } catch (error) {
        console.error('Failed to fetch site status:', error);
        alert('Cant connect to backend..');
    }
}