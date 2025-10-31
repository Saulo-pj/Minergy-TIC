import { $ } from './utils.js';
import { getPersonnel } from './data-service.js';

export async function initMap() {
    const mapCanvas = $('#mapCanvas');
    if (!mapCanvas) return;

    // Clear existing content (custom zoom controls etc)
    mapCanvas.innerHTML = '';

    // Initialize Leaflet
    // Note: We assume L is available globally via CDN in index.html/dashboard.html
    if (typeof L === 'undefined') {
        mapCanvas.innerHTML = '<p style="padding:20px; text-align:center;">Error: Leaflet library not loaded.</p>';
        return;
    }

    const map = L.map('mapCanvas').setView([-12.0464, -77.0428], 13); // Example coords (Lima) or Mine coords

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add Personnel Markers
    const personnel = await getPersonnel();
    personnel.forEach(p => {
        // Simulate random coords near center for demo
        const lat = -12.0464 + (Math.random() - 0.5) * 0.02;
        const lng = -77.0428 + (Math.random() - 0.5) * 0.02;

        const color = p.status === 'ok' ? 'green' : p.status === 'warn' ? 'orange' : 'red';

        const markerHtml = `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`;

        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: markerHtml,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        L.marker([lat, lng], { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${p.nombre}</b><br>${p.ub}<br>${p.estado}`);
    });
}
