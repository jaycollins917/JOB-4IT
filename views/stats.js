document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Graphique Camembert (Secteurs IT) ---
    const canvasSector = document.getElementById('sectorChart');
    if (canvasSector) {
        const sectorStats = JSON.parse(canvasSector.getAttribute('data-stats'));
        const ctxSector = canvasSector.getContext('2d');

        new Chart(ctxSector, {
            type: 'pie',
            data: {
                labels: ['DevWeb', 'Cyber', 'Admin Réseau IT', 'Technicien Info', 'Data', 'Management'],
                datasets: [{
                    data: [
                        sectorStats.DevWeb || 0,
                        sectorStats.Cyber || 0,
                        sectorStats.AdminReseau || 0,
                        sectorStats.Technicien || 0,
                        sectorStats.Data || 0,
                        sectorStats.Management || 0
                    ],
                    backgroundColor: [
                        '#ff6384', // DevWeb
                        '#36a2eb', // Cyber
                        '#cc65fe', // Admin Réseau
                        '#ffce56', // Technicien
                        '#4bc051ff', // Data
                        '#999999'  // Management
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    datalabels: {
                        color: '#ffffff',
                        font: { weight: 'bold', size: 13 },
                        formatter: (value, context) => {
                            const total = context.dataset.data.reduce((acc, d) => acc + d, 0);
                            if (total === 0) return '';
                            const pct = ((value / total) * 100).toFixed(1);
                            return pct > 0 ? pct + '%' : '';
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    // --- 2. Histogramme Mensuel (Annonces IT) ---
    const canvasMonthly = document.getElementById('monthlyChart');
    if (canvasMonthly) {
        const monthlyStats = JSON.parse(canvasMonthly.getAttribute('data-monthly'));
        const ctxMonthly = canvasMonthly.getContext('2d');
        
        // Récupère la plus grande valeur des données (ou 0 si le tableau est vide)
        const maxDataValue = Math.max(...monthlyStats.data, 0);
        
        new Chart(ctxMonthly, {
            type: 'bar',
            data: {
                labels: monthlyStats.labels, // Ex: ["2026-08", "2026-09", "2026-10"]
                datasets: [{
                    label: "Nombre d'annonces IT",
                    data: monthlyStats.data,
                    backgroundColor: '#36a2eb',
                    borderColor: '#1d80c4',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#333333',
                        font: { weight: 'bold', size: 12 },
                        formatter: (val) => val > 0 ? val : ''
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        max: maxDataValue + 2
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
});