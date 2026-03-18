import {initRouting,setRoutingMode,startGPS,getUserLatLng,createRoute,geocode} from './pathrouting.js';

export function init(map){
    const statusEl = document.getElementById('status');
    initRouting(map, (msg) => { statusEl.textContent = msg; });


    globalThis.handleSetMode = function(mode) {
        setRoutingMode(mode);

        document.getElementById('btn-walk').className  = 'mode-btn' + (mode === 'walk'       ? ' active-walk'  : '');
        document.getElementById('btn-wheel').className = 'mode-btn' + (mode === 'wheelchair' ? ' active-wheel' : '');
        document.getElementById('wheelchair-banner').style.display = mode === 'wheelchair' ? 'block' : 'none';
    }


    const gpsBtn = document.getElementById('gps-btn');

    gpsBtn.addEventListener('click', () => {

        statusEl.textContent = '📡 Getting GPS location, please allow location permission...';
        gpsBtn.classList.add('active');

        startGPS(
            // 成功回调
            (latlng, accuracy) => {
                gpsBtn.textContent = '✅ Located';
                statusEl.textContent = `📍 Located! Accuracy ~${accuracy}m — Enter destination and click Go`;
            },
            // 失败回调
            (errorMsg) => {
                gpsBtn.classList.remove('active');
                gpsBtn.textContent = '📍 Locate';
                statusEl.textContent = `❌ ${errorMsg}`;
            }
        );
    });


    const goBtn = document.getElementById('go-btn');

    goBtn.addEventListener('click', async () => {
        const endText = document.getElementById('end-input').value.trim();

        if (!endText) {
        statusEl.textContent = '⚠️ Please enter a destination!';
        return;
        }

        if (!getUserLatLng()) {
        statusEl.textContent = '⚠️ Please click Locate first!';
        return;
        }

        goBtn.disabled = true;
        statusEl.textContent = '🔍 Searching for destination...';

        const endResult = await geocode(endText);

        if (!endResult) {
        statusEl.textContent = `❌ Could not find "${endText}", please try a different description`;
        blindUserHooks.onSearchError(endText);
        goBtn.disabled = false;
        return;
        }

        createRoute(getUserLatLng(), L.latLng(endResult.lat, endResult.lng));
        goBtn.disabled = false;
    });

    // Enter 
    document.getElementById('end-input').addEventListener('keypress', e => {
        if (e.key === 'Enter') goBtn.click();
    });
}
