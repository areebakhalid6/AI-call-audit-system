// ============================================================
// CallIQ — Data Layer
// Sample audit records + storage helpers
// ============================================================

const STORAGE_KEY = 'calliq_audits_v2';
const SETTINGS_KEY = 'calliq_settings';

// ─── Sample Audit Data ───
const SAMPLE_AUDITS = [
    {
        id: 'AUD-001',
        call_date: '2026-02-20',
        call_time: '09:14',
        agent_name: 'Abiha',
        contact_name: 'Michael Chen',
        visa_type: 'Skilled Independent (189)',
        lead_source: 'Facebook Ad',
        call_duration_minutes: 18,
        booking_outcome: 'Booked',
        call_score: 8,
        booking_probability: 85,
        lead_quality: 'High Value',
        booking_intent_level: 'High',
        primary_failure_reason: null,
        revenue_leak_alert: null,
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: [],
        trust_authority_insight: 'Agent mentioned MARA registration and cited a recent 189 approval case. Strong credibility established early.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 1, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 1, consultation_value_positioning: 1,
            authority_trust_signal: 1, urgency_creation: 1, clear_booking_transition: 0, objection_handling: 1
        },
        coaching_recommendations: [
            'Transition to booking was slightly abrupt — use a bridge phrase like "Based on everything you\'ve told me, it sounds like a consultation would really map out your pathway. I have a slot Thursday at 2pm — shall I lock that in for you?"',
            'Urgency was mentioned but felt scripted. Reference the specific processing time change from late 2025 to make it feel genuine.',
            'You did well on value positioning. Reinforce by mentioning the written assessment report they receive post-consultation.'
        ],
        ideal_next_action: 'Send priority booking link',
        buying_signals_detected: ['Asked about consultation fee', 'Asked how long the 189 process takes', 'Mentioned starting in 3 months'],
        pipeline_stage: 'appointment booked',
        notes_added_to_crm: true
    },
    {
        id: 'AUD-002',
        call_date: '2026-02-20',
        call_time: '11:30',
        agent_name: 'Ali',
        contact_name: 'Priya Sharma',
        visa_type: 'Partner Visa (820/801)',
        lead_source: 'Google Search',
        call_duration_minutes: 24,
        booking_outcome: 'Not Booked',
        call_score: 4,
        booking_probability: 22,
        lead_quality: 'High Value',
        booking_intent_level: 'High',
        primary_failure_reason: 'Free advice given — lead got what she needed without booking',
        revenue_leak_alert: 'Agent explained the documentation checklist in detail (sponsor requirements, cohabitation evidence) and outlined the typical timeline. This eliminated the perceived need for a paid consultation. High-value lead was fully informed without booking.',
        free_advice_leakage: { detected: true, location: 'At 14:32 — agent listed the 7 required sponsor documents and mentioned the typical 18-month processing time' },
        compliance_flags: [],
        trust_authority_insight: 'Agent mentioned MARA but did not explain what that means for the lead. Missed an opportunity to build authority.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 0, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 0, consultation_value_positioning: 0,
            authority_trust_signal: 0, urgency_creation: 0, clear_booking_transition: 1, objection_handling: 0
        },
        coaching_recommendations: [
            'When the lead asked about documents, redirect with: "That depends on your specific situation, which is exactly what we map out in the Strategy Session. It\'s different for every couple." Do not list documents.',
            'After qualification, say: "Based on what you\'ve told me, you\'re exactly the type of person we can help. The next step is a 45-minute Strategy Session where we build your personalised roadmap." Then stop.',
            'When lead said "I\'ll look into it," you missed the close. Ask: "What would you need to feel confident booking today?" — then handle that specific objection.'
        ],
        ideal_next_action: 'Immediate manual follow-up',
        buying_signals_detected: ['Asked about required documents', 'Asked about processing time', 'Mentioned partner already in Australia'],
        pipeline_stage: 'pre sales2',
        notes_added_to_crm: true
    },
    {
        id: 'AUD-003',
        call_date: '2026-02-21',
        call_time: '14:05',
        agent_name: 'Abiha',
        contact_name: 'David Park',
        visa_type: 'Employer Sponsored (482)',
        lead_source: 'Referral',
        call_duration_minutes: 12,
        booking_outcome: 'Booked',
        call_score: 9,
        booking_probability: 92,
        lead_quality: 'High Value',
        booking_intent_level: 'High',
        primary_failure_reason: null,
        revenue_leak_alert: null,
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: [],
        trust_authority_insight: 'Excellent. Agent referenced a TSS case from the same industry as the lead and highlighted MARA\'s disciplinary protections for the client.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 1, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 1, consultation_value_positioning: 1,
            authority_trust_signal: 1, urgency_creation: 1, clear_booking_transition: 1, objection_handling: 1
        },
        coaching_recommendations: [
            'Call was near-perfect. One opportunity: lead asked if employer needs to do anything — answer could have acknowledged the question without specifics (e.g. "The employer side is one of the key things we walk through in the consultation") but was handled well overall.',
            'Continue using the industry-specific success story approach — it immediately builds trust with professional leads.',
            'Your closing phrase "I\'ll send you the booking link now while we\'re on the call" was very effective. Keep that pattern.'
        ],
        ideal_next_action: 'Send priority booking link',
        buying_signals_detected: ['Asked about employer obligations', 'Asked about cost', 'Wanted to start ASAP', 'Referral lead — pre-qualified trust'],
        pipeline_stage: 'appointment booked',
        notes_added_to_crm: true
    },
    {
        id: 'AUD-004',
        call_date: '2026-02-21',
        call_time: '16:20',
        agent_name: 'Ali',
        contact_name: 'Amara Diallo',
        visa_type: 'Student Visa (500)',
        lead_source: 'Instagram Ad',
        call_duration_minutes: 8,
        booking_outcome: 'Not Booked',
        call_score: 3,
        booking_probability: 15,
        lead_quality: 'Low Value',
        booking_intent_level: 'Low',
        primary_failure_reason: 'Lead not qualified — no clear pathway and no urgency',
        revenue_leak_alert: 'Lead is a year away from their intended start date with no institution selected. Agent spent 8 minutes without establishing fit or creating urgency. No booking attempt was made.',
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: [],
        trust_authority_insight: 'No trust signals were established. MARA was not mentioned. Call felt like an informal chat.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 0, qualification_depth: 0,
            lead_fit_acknowledgement: 0, no_free_advice: 1, consultation_value_positioning: 0,
            authority_trust_signal: 0, urgency_creation: 0, clear_booking_transition: 0, objection_handling: 0
        },
        coaching_recommendations: [
            'By the 3-minute mark, close the qualification loop: "Given you\'re looking at 12 months away, we\'d likely put you into our early planning pathway. Is that something you want to map out now so you\'re not scrambling later?"',
            'For early-stage leads, shift your framing: the consultation is about avoiding costly mistakes early — not just booking a visa.',
            'Even on low-intent calls, always attempt a soft close or future appointment. A "let\'s lock in a 20-min planning call for next month" is better than no action at all.'
        ],
        ideal_next_action: 'Nurture sequence',
        buying_signals_detected: ['No active buying signals'],
        pipeline_stage: 'pre sales1',
        notes_added_to_crm: false
    },
    {
        id: 'AUD-005',
        call_date: '2026-02-22',
        call_time: '10:00',
        agent_name: 'Mahnoor',
        contact_name: 'Raj Patel',
        visa_type: 'Skilled Nominated (190)',
        lead_source: 'Website Organic',
        call_duration_minutes: 21,
        booking_outcome: 'Not Booked',
        call_score: 6,
        booking_probability: 45,
        lead_quality: 'Medium Value',
        booking_intent_level: 'Medium',
        primary_failure_reason: 'Weak consultation positioning — lead unclear on what they\'d get',
        revenue_leak_alert: 'Agent failed to articulate the tangible outcome of the consultation (written eligibility assessment + state nomination strategy). Lead left without understanding the value of what they were buying.',
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: ['Agent said "from what you\'ve told me, you should be fine for 190" — this is a legal conclusion without proper assessment'],
        trust_authority_insight: 'Agent was warm and personable, which built rapport. However, no credentials or MARA status mentioned to back up the eligibility comment.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 1, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 1, consultation_value_positioning: 0,
            authority_trust_signal: 0, urgency_creation: 0, clear_booking_transition: 1, objection_handling: 0
        },
        coaching_recommendations: [
            'When positioning the consultation, be specific: "In the 45-minute session, Maria will review your full work history against the 190 requirements for your target state, and you leave with a written pathway and a step-by-step action plan."',
            'COMPLIANCE ALERT: Avoid saying "you should be fine" or "you look eligible." Replace with "Based on what you\'ve shared, this is definitely worth a proper assessment" — which drives to the consultation.',
            'When lead hesitated on price, you moved on too quickly. Ask: "What would make the investment feel worthwhile?" — then address that directly.'
        ],
        ideal_next_action: 'Immediate manual follow-up',
        buying_signals_detected: ['Asked about state nomination requirements', 'Asked about timeline', 'Asked about consultation cost'],
        pipeline_stage: 'booking link shared',
        notes_added_to_crm: true
    },
    {
        id: 'AUD-006',
        call_date: '2026-02-22',
        call_time: '15:45',
        agent_name: 'Mahnoor',
        contact_name: 'Sophie Laurent',
        visa_type: 'Partner Visa (820/801)',
        lead_source: 'Facebook Ad',
        call_duration_minutes: 19,
        booking_outcome: 'Booked',
        call_score: 7,
        booking_probability: 72,
        lead_quality: 'High Value',
        booking_intent_level: 'High',
        primary_failure_reason: null,
        revenue_leak_alert: null,
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: [],
        trust_authority_insight: 'Agent referenced MARA registration and mentioned client success rate broadly. Could have been more specific.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 1, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 1, consultation_value_positioning: 1,
            authority_trust_signal: 1, urgency_creation: 0, clear_booking_transition: 1, objection_handling: 0
        },
        coaching_recommendations: [
            'Urgency was a missed opportunity — partner visa processing times are currently long. Mention "Partner visa processing has extended to 18–24 months, so starting the assessment now significantly affects your timeline."',
            'When lead asked "can we do it next week?" — the correct response is to offer the next available slot NOW: "My next opening is Wednesday 2pm — shall I lock that in?" Don\'t leave it open-ended.',
            'Close the loop on the objection about "asking her partner first." Offer a solution: "I can even set it as a joint call if that helps — many couples find it easier to go through it together."'
        ],
        ideal_next_action: 'Send priority booking link',
        buying_signals_detected: ['Asked about fees', 'Asked about de facto requirements', 'Mentioned filing as soon as possible'],
        pipeline_stage: 'appointment booked',
        notes_added_to_crm: true
    },
    {
        id: 'AUD-007',
        call_date: '2026-02-23',
        call_time: '08:30',
        agent_name: 'Ali',
        contact_name: 'Thomas Berg',
        visa_type: 'Business Innovation (188)',
        lead_source: 'LinkedIn',
        call_duration_minutes: 28,
        booking_outcome: 'Booked',
        call_score: 7,
        booking_probability: 68,
        lead_quality: 'High Value',
        booking_intent_level: 'High',
        primary_failure_reason: null,
        revenue_leak_alert: null,
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: [],
        trust_authority_insight: 'Agent clearly positioned MARA and highlighted the firm\'s business migration track record. Credibility was strong.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 1, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 1, consultation_value_positioning: 1,
            authority_trust_signal: 1, urgency_creation: 0, clear_booking_transition: 1, objection_handling: 0
        },
        coaching_recommendations: [
            'Business visa leads are often analytical — give them a framework. "The consultation has 3 parts: we check if you meet the financial threshold, we map out the state that\'s the best fit, and we give you a written feasibility report."',
            'Lead mentioned competitors — don\'t avoid this. Use it: "The difference is every client works directly with a MARA agent, not a case officer. That means accountability at every step."',
            'Urgency for business leads: state-based business immigration programs have limited allocations per year. Use this as a real and honest urgency driver.'
        ],
        ideal_next_action: 'Send priority booking link',
        buying_signals_detected: ['Asked about minimum investment', 'Asked about state options', 'Mentioned comparing providers'],
        pipeline_stage: 'appointment booked',
        notes_added_to_crm: true
    },
    {
        id: 'AUD-008',
        call_date: '2026-02-23',
        call_time: '11:15',
        agent_name: 'Maria',
        contact_name: 'Fatima Al-Hassan',
        visa_type: 'Skilled Nominated (190)',
        lead_source: 'Google Search',
        pipeline_stage: 'booking link shared',
        call_duration_minutes: 22,
        booking_outcome: 'Not Booked',
        call_score: 5,
        booking_probability: 38,
        lead_quality: 'High Value',
        booking_intent_level: 'High',
        primary_failure_reason: 'Booking link sent but no verbal commitment secured — lead went cold after the call',
        revenue_leak_alert: 'Lead is at the \u201cbooking link shared\u201d stage — the highest-risk leakage point. Agent sent the link without locking in a specific time or creating a deadline, turning a warm lead into a passive one.',
        free_advice_leakage: { detected: false, location: null },
        compliance_flags: [],
        trust_authority_insight: 'Agent mentioned MARA credentials once but did not reinforce authority at the critical close moment when the lead seemed uncertain.',
        score_breakdown: {
            lead_identity_context: 1, call_agenda_control: 1, qualification_depth: 1,
            lead_fit_acknowledgement: 1, no_free_advice: 1, consultation_value_positioning: 0,
            authority_trust_signal: 0, urgency_creation: 0, clear_booking_transition: 0, objection_handling: 0
        },
        coaching_recommendations: [
            'Never send the booking link without locking in a time: \"I\'m sending the link now — the slot I\'d recommend is Thursday 10am. I\'ll hold it for you while we\'re on the call. Does that work?\"',
            'Add urgency at the link-share moment: \"This slot fills up quickly and I can\'t hold it past today — clicking the link takes less than 2 minutes.\"',
            'When lead says \"I\'ll have a look later\" — respond: \"What time today works for me to follow up and make sure you got it?\" Then book a follow-up call on the spot before hanging up.'
        ],
        ideal_next_action: 'Immediate manual follow-up',
        buying_signals_detected: ['Asked about nomination requirements', 'Asked about points score', 'Agreed to receive booking link'],
        notes_added_to_crm: true
    }
];

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
    }
};

const DEFAULT_SETTINGS = {
    openai_api_key: '',
    openai_model: 'gpt-4o',
    agency_name: 'Your Migration Agency',
    mara_number: '',
    auto_note_ghl: false,
    ghl_api_key: '',
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
