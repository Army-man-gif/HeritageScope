import { toggleStatusOverlay } from './siteStatusOverlay.js';

globalThis.handleStatusToggle = function() {
    const map = globalThis.hsMap;
    if (map) toggleStatusOverlay(map);
};