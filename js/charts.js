import { $ } from './utils.js';

// Chart Factories
function makeLineChart(ctx, labels, datasets) {
    if (!ctx || !window.Chart) return;
    new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function makeBarChart(ctx, labels, data, color) {
    if (!ctx || !window.Chart) return;
    new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Productividad', data, backgroundColor: color }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

function makeDoughnut(ctx, labels, data, colors) {
    if (!ctx || !window.Chart) return;
    new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors }] },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

export function initCharts() {
    // Dashboard Charts
    const chartGases = $('#chartGases');
    if (chartGases) {
        chartGases.parentElement.style.height = '280px';
        makeLineChart(chartGases, ['00h', '04h', '08h', '12h', '16h', '20h'], [
            { label: 'CO (ppm)', data: [18, 22, 45, 28, 21, 19], borderColor: '#E74C3C', tension: .35 },
            { label: 'CO2 (ppm)', data: [650, 710, 760, 720, 680, 640], borderColor: '#2C3E50', tension: .35 },
            { label: 'CH4 (% vol)', data: [0.8, 1.0, 2.1, 1.3, 0.9, 0.7], borderColor: '#F39C12', tension: .35 }
        ]);
    }

    const chartProd = $('#chartProductividad');
    if (chartProd) {
        chartProd.parentElement.style.height = '280px';
        makeBarChart(chartProd, ['Mañana', 'Tarde', 'Noche'], [82, 76, 88], '#27AE60');
    }

    // Report Charts
    const chartGasesMulti = $('#chartGasesMulti');
    if (chartGasesMulti) {
        chartGasesMulti.parentElement.style.height = '320px';
        makeLineChart(chartGasesMulti, ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], [
            { label: 'CO (ppm)', data: [20, 24, 31, 26, 29, 22, 18], borderColor: '#E74C3C', tension: .35 },
            { label: 'CO2 (ppm)', data: [690, 720, 760, 740, 710, 700, 680], borderColor: '#2C3E50', tension: .35 },
            { label: 'CH4 (% vol)', data: [0.8, 1.2, 1.5, 1.1, 1.3, 0.9, 0.7], borderColor: '#F39C12', tension: .35 }
        ]);
    }

    const chartProdReport = $('#chartProdReport');
    if (chartProdReport) {
        chartProdReport.parentElement.style.height = '260px';
        makeBarChart(chartProdReport, ['Turno A', 'Turno B', 'Turno C'], [78, 85, 74], '#4A90E2');
    }

    const chartInc = $('#chartIncidentes');
    if (chartInc) {
        chartInc.parentElement.style.height = '260px';
        makeDoughnut(chartInc, ['Gas', 'Mecánico', 'Eléctrico', 'Otros'], [12, 6, 4, 3], ['#E74C3C', '#F39C12', '#2C3E50', '#BDC3C7']);
    }
}
