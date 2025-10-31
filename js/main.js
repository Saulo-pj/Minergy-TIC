import { initAuth } from './auth.js';
import { initUI } from './ui.js';
import { initCharts } from './charts.js';
import { initMap } from './map.js';
import { initModals } from './utils.js';
import { initDatabase } from './data-service.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initDatabase();
    initAuth();
    initUI();
    initCharts();
    initMap();
    initModals();
});
