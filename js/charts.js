// ============================================================
// CallIQ — Chart Utilities
// ============================================================

const ChartRegistry = {};

function destroyChart(id) {
    if (ChartRegistry[id]) {
        ChartRegistry[id].destroy();
        delete ChartRegistry[id];
    }
}

function registerChart(id, chart) {
    destroyChart(id);
    ChartRegistry[id] = chart;
}

const CHART_DEFAULTS = {
    plugins: {
        legend: {
            labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 16 }
        },
        tooltip: {
            backgroundColor: '#111827',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' }
        }
    },
    scales: {
        x: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
        },
        y: {
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
            ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
        }
    }
};

// ─── Booking Rate Over Time ───
function renderBookingTrendChart(canvasId, audits) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const byDate = {};
    audits.forEach(a => {
        const d = a.call_date;
        if (!byDate[d]) byDate[d] = { total: 0, booked: 0 };
        byDate[d].total++;
        if (a.booking_outcome === 'Booked') byDate[d].booked++;
    });

    const labels = Object.keys(byDate).sort();
    const rates = labels.map(d => Math.round((byDate[d].booked / byDate[d].total) * 100));
    const scores = labels.map(d => {
        const dayAudits = audits.filter(a => a.call_date === d);
        return Math.round(dayAudits.reduce((s, a) => s + a.call_score, 0) / dayAudits.length * 10) / 10;
    });

    const formatted = labels.map(d => Format.date(d));

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formatted,
            datasets: [
                {
                    label: 'Booking Rate %',
                    data: rates,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6366f1',
                    pointRadius: 4
                },
                {
                    label: 'Avg Score ×10',
                    data: scores.map(s => s * 10),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16,185,129,0.05)',
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointRadius: 4,
                    borderDash: [4, 3]
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            ...CHART_DEFAULTS,
            scales: {
                ...CHART_DEFAULTS.scales,
                y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 }
            }
        }
    });
    registerChart(canvasId, chart);
}

// ─── Lead Quality Doughnut ───
function renderLeadQualityChart(canvasId, audits) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const counts = { 'High Value': 0, 'Medium Value': 0, 'Low Value': 0, 'Not Qualified': 0 };
    audits.forEach(a => { if (counts[a.lead_quality] !== undefined) counts[a.lead_quality]++; });

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(244,63,94,0.8)', 'rgba(71,85,105,0.8)'],
                borderColor: ['#10b981', '#f59e0b', '#f43f5e', '#475569'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '68%',
            plugins: { ...CHART_DEFAULTS.plugins }
        }
    });
    registerChart(canvasId, chart);
}

// ─── Agent Score Bar Chart ───
function renderAgentScoreChart(canvasId, agentStats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: agentStats.map(a => a.name.split(' ')[0]),
            datasets: [
                {
                    label: 'Avg Call Score',
                    data: agentStats.map(a => a.avgScore),
                    backgroundColor: 'rgba(99,102,241,0.7)',
                    borderColor: '#6366f1',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Booking Rate %',
                    data: agentStats.map(a => a.bookingRate),
                    backgroundColor: 'rgba(16,185,129,0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            ...CHART_DEFAULTS,
            scales: {
                ...CHART_DEFAULTS.scales,
                y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 }
            }
        }
    });
    registerChart(canvasId, chart);
}

// ─── Booking Intent Distribution ───
function renderIntentChart(canvasId, audits) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const intents = { High: { booked: 0, total: 0 }, Medium: { booked: 0, total: 0 }, Low: { booked: 0, total: 0 } };
    audits.forEach(a => {
        const k = a.booking_intent_level;
        if (!intents[k]) return;
        intents[k].total++;
        if (a.booking_outcome === 'Booked') intents[k].booked++;
    });

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High Intent', 'Medium Intent', 'Low Intent'],
            datasets: [
                {
                    label: 'Booked',
                    data: ['High', 'Medium', 'Low'].map(k => intents[k].booked),
                    backgroundColor: 'rgba(16,185,129,0.75)',
                    borderRadius: 6
                },
                {
                    label: 'Not Booked',
                    data: ['High', 'Medium', 'Low'].map(k => intents[k].total - intents[k].booked),
                    backgroundColor: 'rgba(244,63,94,0.6)',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            ...CHART_DEFAULTS,
            plugins: { ...CHART_DEFAULTS.plugins },
            scales: {
                ...CHART_DEFAULTS.scales,
                x: { ...CHART_DEFAULTS.scales.x, stacked: true },
                y: { ...CHART_DEFAULTS.scales.y, stacked: true }
            }
        }
    });
    registerChart(canvasId, chart);
}

// ─── Score Factor Radar ───
function renderScoreFactorChart(canvasId, audits) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const factors = [
        'lead_identity_context', 'call_agenda_control', 'qualification_depth',
        'lead_fit_acknowledgement', 'no_free_advice', 'consultation_value_positioning',
        'authority_trust_signal', 'urgency_creation', 'clear_booking_transition', 'objection_handling'
    ];
    const labels = [
        'Lead Identity', 'Agenda Control', 'Qualification',
        'Lead Fit', 'No Free Advice', 'Consult Value',
        'Authority', 'Urgency', 'Booking Transition', 'Objection Handling'
    ];

    const avgs = factors.map(f => {
        const vals = audits.map(a => (a.score_breakdown && a.score_breakdown[f] !== undefined) ? a.score_breakdown[f] : 0);
        return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100);
    });

    const chart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [{
                label: 'Team Average %',
                data: avgs,
                fill: true,
                backgroundColor: 'rgba(99,102,241,0.15)',
                borderColor: '#6366f1',
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { ...CHART_DEFAULTS.plugins },
            scales: {
                r: {
                    min: 0, max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    pointLabels: { color: '#64748b', font: { family: 'Inter', size: 10 } },
                    ticks: { display: false }
                }
            }
        }
    });
    registerChart(canvasId, chart);
}

// ─── Lead Source Bar ───
function renderLeadSourceChart(canvasId, sourceStats) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sourceStats.map(s => s.name),
            datasets: [
                {
                    label: 'Total Calls',
                    data: sourceStats.map(s => s.total),
                    backgroundColor: 'rgba(99,102,241,0.6)',
                    borderRadius: 6
                },
                {
                    label: 'Booked',
                    data: sourceStats.map(s => s.booked),
                    backgroundColor: 'rgba(16,185,129,0.7)',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            indexAxis: 'y',
            ...CHART_DEFAULTS
        }
    });
    registerChart(canvasId, chart);
}
