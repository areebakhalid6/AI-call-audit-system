// ============================================================
// CallIQ — Data Layer
// Sample audit records + storage helpers
// ============================================================

const STORAGE_KEY = 'calliq_audits_v3_real';
const SETTINGS_KEY = 'calliq_settings';

// ─── Sample Audit Data ───
const SAMPLE_AUDITS = [];

// ─── Storage Helpers ───
const DB = {
    getAudits() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [...SAMPLE_AUDITS];
            const parsed = JSON.parse(raw);
            return parsed.length ? parsed : [...SAMPLE_AUDITS];
        } catch { return [...SAMPLE_AUDITS]; }
    },

    saveAudits(audits) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
    },

    addAudit(audit) {
        const audits = this.getAudits();
        audits.unshift(audit);
        this.saveAudits(audits);
        return audit;
    },

    getSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
        } catch { return DEFAULT_SETTINGS; }
    },

    saveSettings(settings) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },

    clearData() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
};

const DEBUG = {
    getLogs() {
        try {
            return JSON.parse(localStorage.getItem('calliq_debug_logs') || '[]');
        } catch { return []; }
    },
    log(message, type = 'info', details = null) {
        const logs = this.getLogs();
        logs.unshift({
            timestamp: new Date().toISOString(),
            message,
            type,
            details
        });
        localStorage.setItem('calliq_debug_logs', JSON.stringify(logs.slice(0, 20)));
        console.log(`[${type.toUpperCase()}] ${message}`, details);
    },
    clear() {
        localStorage.removeItem('calliq_debug_logs');
    }
};

const GHL = {
    async fetchCalls(days = 7) {
        const settings = DB.getSettings();
        if (!settings.ghl_api_key || !settings.ghl_location_id) {
            DEBUG.log('GHL Fetch rejected: Missing API Key or Location ID', 'error');
            throw new Error('GHL API Key or Location ID missing in Settings.');
        }

        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);

        DEBUG.log(`Fetching GHL calls for last ${days} days...`, 'info', { start: start.toISOString(), end: end.toISOString() });

        try {
            let url = `https://services.leadconnectorhq.com/calls?locationId=${settings.ghl_location_id}&startDate=${start.getTime()}&endDate=${end.getTime()}&limit=20`;

            if (settings.ghl_use_proxy) {
                url = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                DEBUG.log('Using CORS Proxy (corsproxy.io)', 'info');
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${settings.ghl_api_key}`,
                    'Accept': 'application/json',
                    'Version': '2021-04-15'
                }
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                DEBUG.log(`GHL API Error: ${response.status}`, 'error', { status: response.status, body: errBody });
                throw new Error(errBody.message || `GHL API Error: ${response.status}`);
            }

            const data = await response.json();
            const keys = Object.keys(data);
            const callsList = data.calls || data.callLogs || data.data || [];

            DEBUG.log(`Fetched data keys: ${keys.join(', ')}`, 'info');
            DEBUG.log(`Successfully fetched ${callsList.length} calls`, 'success');
            return callsList;
        } catch (e) {
            if (e.message === 'Failed to fetch' || e.name === 'TypeError') {
                DEBUG.log('CORS Error detected: Browser blocked the request.', 'error', {
                    advice: 'Enable "Use CORS Proxy" in Settings OR use a CORS browser extension.'
                });
                throw new Error('CORS Error: Please ensure "Use CORS Proxy" is turned ON in Settings.');
            }
            DEBUG.log('Fetch operation failed', 'error', { error: e.message });
            throw e;
        }
    },

    async fetchTranscript(messageId) {
        const settings = DB.getSettings();
        if (!settings.ghl_api_key || !settings.ghl_location_id) return null;

        DEBUG.log(`Fetching transcript for message: ${messageId}`, 'info');

        try {
            let url = `https://services.leadconnectorhq.com/conversations/${settings.ghl_location_id}/messages/${messageId}/transcription`;

            if (settings.ghl_use_proxy) {
                url = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${settings.ghl_api_key}`,
                    'Accept': 'application/json',
                    'Version': '2021-04-15'
                }
            });

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}));
                DEBUG.log(`Transcript API Error: ${response.status}`, 'warning', { status: response.status, body: errBody });
                return null;
            }

            const data = await response.json();
            const text = typeof data === 'string' ? data : (data.transcription || null);

            if (text) DEBUG.log('Transcript retrieved successfully', 'success');
            else DEBUG.log('No transcript content found in response', 'info');

            return text;
        } catch (e) {
            DEBUG.log('Transcript fetch failed', 'error', { error: e.message });
            return null;
        }
    }
};

const DEFAULT_SETTINGS = {
    openai_api_key: '',
    openai_model: 'gpt-4o',
    agency_name: 'Your Migration Agency',
    mara_number: '',
    auto_note_ghl: false,
    ghl_api_key: 'pit-0ca0568a-d707-46f3-a018-95a9c1a00c3f',
    ghl_location_id: 'Cy61ZIoB1Q68krX0lSZA',
    ghl_use_proxy: false,
    compliance_alerts: true,
    email_reports: false,
    report_email: ''
};

// ─── Analytics Helpers ───
const Analytics = {
    getStats(audits) {
        if (!audits.length) return {};
        const booked = audits.filter(a => a.booking_outcome === 'Booked');
        const bookingRate = Math.round((booked.length / audits.length) * 100);
        const avgScore = Math.round(audits.reduce((s, a) => s + a.call_score, 0) / audits.length * 10) / 10;
        const highIntent = audits.filter(a => a.booking_intent_level === 'High');
        const highIntentBooked = highIntent.filter(a => a.booking_outcome === 'Booked');
        const highIntentRate = highIntent.length ? Math.round((highIntentBooked.length / highIntent.length) * 100) : 0;
        const leakCount = audits.filter(a => a.revenue_leak_alert).length;
        const complianceFlags = audits.filter(a => a.compliance_flags && a.compliance_flags.length > 0).length;

        return {
            bookingRate, avgScore, highIntentRate, leakCount, complianceFlags,
            totalCalls: audits.length, bookedCount: booked.length
        };
    },

    getAgentStats(audits) {
        const agents = {};
        audits.forEach(a => {
            if (!agents[a.agent_name]) {
                agents[a.agent_name] = { name: a.agent_name, calls: [], scores: [], booked: 0, highIntent: 0, highIntentBooked: 0 };
            }
            const ag = agents[a.agent_name];
            ag.calls.push(a);
            ag.scores.push(a.call_score);
            if (a.booking_outcome === 'Booked') ag.booked++;
            if (a.booking_intent_level === 'High') { ag.highIntent++; if (a.booking_outcome === 'Booked') ag.highIntentBooked++; }
        });
        return Object.values(agents).map(ag => ({
            ...ag,
            avgScore: Math.round(ag.scores.reduce((s, v) => s + v, 0) / ag.scores.length * 10) / 10,
            bookingRate: Math.round((ag.booked / ag.calls.length) * 100),
            hiRate: ag.highIntent ? Math.round((ag.highIntentBooked / ag.highIntent) * 100) : 0
        })).sort((a, b) => b.avgScore - a.avgScore);
    },

    getLeadSourceStats(audits) {
        const sources = {};
        audits.forEach(a => {
            const src = a.lead_source || 'Unknown';
            if (!sources[src]) sources[src] = { total: 0, booked: 0, high: 0, medium: 0, low: 0, unqualified: 0 };
            const s = sources[src];
            s.total++;
            if (a.booking_outcome === 'Booked') s.booked++;
            if (a.lead_quality === 'High Value') s.high++;
            else if (a.lead_quality === 'Medium Value') s.medium++;
            else if (a.lead_quality === 'Low Value') s.low++;
            else s.unqualified++;
        });
        return Object.entries(sources).map(([name, s]) => ({
            name, ...s,
            bookingRate: Math.round((s.booked / s.total) * 100)
        })).sort((a, b) => b.total - a.total);
    }
};

// ─── Formatting ───
const Format = {
    date(d) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    scoreColor(s) {
        if (s >= 8) return 'var(--emerald)';
        if (s >= 6) return 'var(--amber)';
        return 'var(--rose)';
    },
    scoreBadge(s) {
        if (s >= 8) return 'emerald';
        if (s >= 6) return 'amber';
        return 'rose';
    },
    leadQualityBadge(q) {
        if (q === 'High Value') return 'emerald';
        if (q === 'Medium Value') return 'amber';
        if (q === 'Low Value') return 'rose';
        return 'slate';
    },
    intentBadge(i) {
        if (i === 'High') return 'emerald';
        if (i === 'Medium') return 'amber';
        return 'rose';
    },
    outcomeBadge(o) {
        if (o === 'Booked') return 'emerald';
        if (o === 'Not Booked') return 'rose';
        return 'slate';
    },
    nextActionBadge(a) {
        if (!a) return 'slate';
        if (a.includes('follow-up')) return 'rose';
        if (a.includes('priority')) return 'indigo';
        if (a.includes('Nurture')) return 'amber';
        if (a.includes('Disqualify')) return 'slate';
        return 'slate';
    },
    generateId() {
        const audits = DB.getAudits();
        return `AUD-${String(audits.length + 1).padStart(3, '0')}`;
    }
};
