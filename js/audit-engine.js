// ============================================================
// CallIQ — AI Audit Engine
// Uses OpenAI API to analyse call transcripts
// ============================================================

const SYSTEM_PROMPT = `You are an expert pre-sales call auditor for a MARA-registered Australian migration consultancy.

Your sole purpose is to audit pre-sales discovery calls and determine WHY a consultation booking did or did not occur. You are NOT assessing visa eligibility. You are assessing agent performance and lead quality.

CONTEXT:
- The call goal is ONLY to: qualify the lead, build trust, position the paid consultation, and book it.
- The agent must NEVER give free migration advice, full eligibility assessment, or visa strategy.
- All output must be in the exact JSON format specified.

MARA COMPLIANCE RULES (flag if violated):
- Agent must NOT guarantee visa outcomes
- Agent must NOT give legal conclusions without consultation
- Agent must NOT misrepresent visa process timelines or success rates

OUTPUT FORMAT: You must return ONLY a valid JSON object. No extra text. No markdown. Just JSON.`;

function buildUserPrompt(data) {
  return `Audit the following pre-sales discovery call transcript.

--- CALL METADATA ---
Contact Name: ${data.contact_name}
Agent Name: ${data.agent_name}
Visa Interest / Service: ${data.visa_type}
Lead Source: ${data.lead_source || 'Not specified'}
Call Duration: ${data.call_duration_minutes} minutes
Call Date: ${data.call_date}

--- TRANSCRIPT ---
${data.transcript}

--- YOUR TASK ---
Score each of the 10 factors below (0 or 1 point each). Then complete all output fields.

SCORING FACTORS:
1. Lead identity & context captured — Did agent ask who the lead is, their situation, country, and goal?
2. Call agenda & control — Did agent set an agenda and maintain control of the conversation?
3. Qualification depth — Did agent qualify visa type, timeline, family situation WITHOUT doing a full assessment?
4. Lead fit acknowledgement — Did agent confirm whether this lead is a fit for their services?
5. No free advice leakage — Did agent avoid giving specific visa strategies, eligibility conclusions, or document advice?
6. Paid consultation value positioning — Did agent clearly explain what the paid consultation delivers and why it's worth it?
7. Authority & trust signal — Did agent mention MARA registration, success stories, or credentials?
8. Urgency creation — Did agent create a genuine reason to book NOW (policy changes, processing times, limited spots)?
9. Clear booking transition — Did agent make a clear, confident ask to book the consultation?
10. Objection handling — Did agent handle any "I'll think about it" or price/value objections effectively?

Return this exact JSON structure:

{
  "call_score": <integer 0-10>,
  "booking_probability": <integer 0-100>,
  "lead_quality": "<High Value | Medium Value | Low Value | Not Qualified>",
  "booking_intent_level": "<High | Medium | Low>",
  "booking_outcome_detected": "<Booked | Not Booked | Unknown>",
  "primary_failure_reason": "<top conversion blocker as a single sentence, or null if booked>",
  "revenue_leak_alert": "<2-3 sentence explanation, or null if no leak detected>",
  "free_advice_leakage": {
    "detected": <true | false>,
    "location": "<specific quote or timestamp description of where it happened, or null>"
  },
  "compliance_flags": ["<description of MARA risk>"],
  "trust_authority_insight": "<1-2 sentence assessment of agent credibility>",
  "score_breakdown": {
    "lead_identity_context": <0 or 1>,
    "call_agenda_control": <0 or 1>,
    "qualification_depth": <0 or 1>,
    "lead_fit_acknowledgement": <0 or 1>,
    "no_free_advice": <0 or 1>,
    "consultation_value_positioning": <0 or 1>,
    "authority_trust_signal": <0 or 1>,
    "urgency_creation": <0 or 1>,
    "clear_booking_transition": <0 or 1>,
    "objection_handling": <0 or 1>
  },
  "coaching_recommendations": [
    "<specific behaviour-based improvement #1 — reference exact moment in call>",
    "<specific behaviour-based improvement #2 — reference exact moment in call>",
    "<specific behaviour-based improvement #3 — reference exact moment in call>"
  ],
  "ideal_next_action": "<Immediate manual follow-up | Send priority booking link | Nurture sequence | Disqualify>",
  "buying_signals_detected": ["<list each buying signal the lead expressed>"]
}`;
}

// ─── Run AI Audit ───
async function runAIAudit(formData) {
  const settings = DB.getSettings();
  const apiKey = settings.openai_api_key;

  if (!apiKey) {
    throw new Error('No OpenAI API key configured. Please add your API key in Settings.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: settings.openai_model || 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(formData) }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from AI');

  return JSON.parse(content);
}

// ─── Render Audit Form Page ───
function renderAuditPage() {
  const el = document.getElementById('page-audit');
  const settings = DB.getSettings();

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Run AI Audit</h1>
        <p class="page-subtitle">Paste a call transcript to generate an instant AI-powered audit report</p>
      </div>
    </div>

    <div class="content-grid" style="max-width:820px">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Call Details</div>
        <div class="card-subtitle">Fill in the metadata from GHL, then paste the transcript</div>
        </div>
        <div class="card-body">
          <div id="ghl-fetch-wrap" style="margin-bottom:24px;padding-bottom:20px;border-bottom:1px border-dashed var(--border-color)">
            <div class="flex flex-between" style="margin-bottom:12px">
              <div style="font-weight:600;font-size:14px">Pull from GoHighLevel</div>
              <button type="button" class="btn btn-sm btn-secondary" onclick="handleFetchGHLCalls()" id="ghl-fetch-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Fetch Recent Calls
              </button>
            </div>
            <div id="ghl-calls-list" class="ghl-calls-list">
              <p class="text-xs text-muted">Click fetch to see calls from the last 7 days</p>
            </div>
          </div>

          <form class="audit-form" id="audit-form" onsubmit="handleAuditSubmit(event)">

            <div class="form-row">
              <div class="form-group">
                <label for="f-contact">Contact Name *</label>
                <input type="text" id="f-contact" placeholder="e.g. John Smith" required />
              </div>
              <div class="form-group">
                <label for="f-agent">Agent Name *</label>
                <input type="text" id="f-agent" placeholder="e.g. Sarah Mitchell" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="f-visa">Visa Type / Service Interest *</label>
                <select id="f-visa" required>
                  <option value="">Select visa type…</option>
                  <optgroup label="Skilled Migration">
                    <option>Skilled Independent (189)</option>
                    <option>Skilled Nominated (190)</option>
                    <option>Skilled Work Regional (491)</option>
                    <option>Global Talent (858)</option>
                  </optgroup>
                  <optgroup label="Employer Sponsored">
                    <option>Employer Sponsored (482)</option>
                    <option>Employer Nominated (186)</option>
                    <option>Regional Sponsored (187)</option>
                  </optgroup>
                  <optgroup label="Family">
                    <option>Partner Visa (820/801)</option>
                    <option>Partner Visa (309/100)</option>
                    <option>Parent Visa</option>
                    <option>Child Visa</option>
                  </optgroup>
                  <optgroup label="Business & Investment">
                    <option>Business Innovation (188)</option>
                    <option>Business Talent (132)</option>
                    <option>Investor (188C)</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option>Student Visa (500)</option>
                    <option>Graduate Visa (485)</option>
                    <option>Tourist/Visitor</option>
                    <option>Other / General Enquiry</option>
                  </optgroup>
                </select>
              </div>
              <div class="form-group">
                <label for="f-source">Lead Source</label>
                <select id="f-source">
                  <option value="">Unknown</option>
                  <option>Facebook Ad</option>
                  <option>Google Search</option>
                  <option>Instagram Ad</option>
                  <option>LinkedIn</option>
                  <option>Website Organic</option>
                  <option>Referral</option>
                  <option>TikTok Ad</option>
                  <option>YouTube</option>
                  <option>Email Campaign</option>
                  <option>Walk-in</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="f-date">Call Date *</label>
                <input type="date" id="f-date" value="${new Date().toISOString().split('T')[0]}" required />
              </div>
              <div class="form-group">
                <label for="f-duration">Call Duration (minutes) *</label>
                <input type="number" id="f-duration" placeholder="e.g. 18" min="1" max="120" required />
              </div>
            </div>

            <div id="ghl-recording-wrap" style="display:none;margin-bottom:20px;padding:12px;background:var(--indigo-lightest);border:1px solid var(--indigo-light);border-radius:8px">
              <div class="flex flex-between" style="margin-bottom:8px">
                <div style="font-weight:600;font-size:13px;color:var(--indigo-dark)">Call Recording</div>
                <a id="f-recording-link" href="#" target="_blank" class="text-xs indigo" style="text-decoration:underline">Open in GHL</a>
              </div>
              <audio id="f-audio-player" controls style="width:100%"></audio>
            </div>

            <div class="form-group">
              <label for="f-transcript">Call Transcript *</label>
              <textarea id="f-transcript" placeholder="Paste the full call transcript here.

For best results, include speaker labels:
Agent: Hello, thanks for calling...
Lead: Hi, I was enquiring about...

Minimum 200 words recommended for accurate scoring." required></textarea>
            </div>

            ${!settings.openai_api_key
      ? `<div class="alert alert-amber">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                  <div>No OpenAI API key configured. <a href="#" onclick="App.navigateTo('settings')" style="color:var(--amber-light);text-decoration:underline">Add your key in Settings</a> to use the live AI engine. You can still use the demo mode below.</div>
                </div>`
      : ''
    }

            <div style="display:grid;grid-template-columns:1fr;gap:12px">
              <button type="submit" class="btn btn-primary btn-lg btn-block" id="audit-submit-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Run AI Audit
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tips Card -->
      <div class="card">
        <div class="card-header"><div class="card-title">💡 Tips for Best Results</div></div>
        <div class="card-body" style="display:grid;gap:10px">
          <div class="alert alert-emerald" style="margin:0">Include speaker labels (Agent:/Lead:) for more precise free-advice detection and timestamping.</div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
            <p><strong>No transcript?</strong> Use GHL's built-in call recording + OpenAI Whisper (via Make.com) to auto-transcribe. See the Implementation Plan for the full setup guide.</p>
            <p style="margin-top:8px"><strong>GHL Auto-Audit:</strong> Once your Make.com workflow is live, audits run automatically after every call — no manual entry needed. This manual form is for testing and individual reviews.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function handleAuditSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('audit-submit-btn');
  const originalHTML = btn.innerHTML;

  const formData = {
    contact_name: document.getElementById('f-contact').value.trim(),
    agent_name: document.getElementById('f-agent').value.trim(),
    visa_type: document.getElementById('f-visa').value,
    lead_source: document.getElementById('f-source').value,
    call_date: document.getElementById('f-date').value,
    call_duration_minutes: parseInt(document.getElementById('f-duration').value) || 0,
    transcript: document.getElementById('f-transcript').value.trim()
  };

  if (!formData.transcript || formData.transcript.length < 50) {
    Toast.show('Please paste a call transcript (min. 50 characters)', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div> Analysing call…`;

  try {
    const settings = DB.getSettings();
    let aiResult;

    if (settings.openai_api_key) {
      aiResult = await runAIAudit(formData);
    } else {
      // Demo mode — generate plausible mock result
      aiResult = generateDemoResult(formData);
      Toast.show('Demo mode: Using simulated AI response. Add your API key in Settings for real analysis.', 'info');
    }

    // Merge metadata with AI result
    const audit = {
      id: Format.generateId(),
      ...formData,
      call_time: new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }),
      booking_outcome: aiResult.booking_outcome_detected || 'Unknown',
      call_score: aiResult.call_score,
      booking_probability: aiResult.booking_probability,
      lead_quality: aiResult.lead_quality,
      booking_intent_level: aiResult.booking_intent_level,
      primary_failure_reason: aiResult.primary_failure_reason,
      revenue_leak_alert: aiResult.revenue_leak_alert,
      free_advice_leakage: aiResult.free_advice_leakage,
      compliance_flags: aiResult.compliance_flags || [],
      trust_authority_insight: aiResult.trust_authority_insight,
      score_breakdown: aiResult.score_breakdown,
      coaching_recommendations: aiResult.coaching_recommendations,
      ideal_next_action: aiResult.ideal_next_action,
      buying_signals_detected: aiResult.buying_signals_detected || [],
      notes_added_to_crm: false
    };

    DB.addAudit(audit);
    Toast.show(`Audit complete — Score: ${audit.call_score}/10`, 'success');

    // Show the result modal instantly
    App.showAuditModal(audit.id);

    // Clear form
    document.getElementById('audit-form').reset();
    document.getElementById('f-date').value = new Date().toISOString().split('T')[0];

  } catch (err) {
    Toast.show(`Audit failed: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

// ─── Demo Mode Result Generator ───
function generateDemoResult(data) {
  const score = Math.floor(Math.random() * 5) + 4; // 4-8
  const hasLeak = Math.random() > 0.6;
  const booked = score >= 7 && !hasLeak;

  return {
    call_score: score,
    booking_probability: booked ? Math.floor(Math.random() * 25) + 65 : Math.floor(Math.random() * 35) + 15,
    lead_quality: ['High Value', 'High Value', 'Medium Value', 'Low Value'][Math.floor(Math.random() * 4)],
    booking_intent_level: ['High', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
    booking_outcome_detected: booked ? 'Booked' : 'Not Booked',
    primary_failure_reason: booked ? null : 'Weak consultation value positioning — lead unclear on what the paid session delivers',
    revenue_leak_alert: hasLeak ? 'Agent provided specific information about document requirements and eligibility, reducing the perceived need for a paid consultation. This is a pattern that results in informed but unbooked leads.' : null,
    free_advice_leakage: { detected: hasLeak, location: hasLeak ? 'Mid-call — when lead asked about their options' : null },
    compliance_flags: [],
    trust_authority_insight: 'Agent built reasonable rapport but did not reference MARA registration or firm credentials. An opportunity to establish authority early in the call was missed.',
    score_breakdown: {
      lead_identity_context: 1,
      call_agenda_control: score >= 5 ? 1 : 0,
      qualification_depth: 1,
      lead_fit_acknowledgement: score >= 6 ? 1 : 0,
      no_free_advice: hasLeak ? 0 : 1,
      consultation_value_positioning: score >= 7 ? 1 : 0,
      authority_trust_signal: score >= 8 ? 1 : 0,
      urgency_creation: score >= 7 ? 1 : 0,
      clear_booking_transition: booked ? 1 : 0,
      objection_handling: booked ? 1 : 0
    },
    coaching_recommendations: [
      `When the lead asked about ${data.visa_type}, redirect with: "That's exactly what we unpack in the strategy session — I'd rather make sure you get accurate advice tailored to your situation rather than give you generic information."`,
      'Set the agenda at the start of every call: "I have about 15 minutes for you today — what I want to do is understand your situation, check if we can help, and walk you through what working with us looks like. Sound good?"',
      'Create urgency using real data: mention current processing times or upcoming policy changes to make acting now feel necessary and genuinely in the lead\'s interest.'
    ],
    ideal_next_action: booked ? 'Send priority booking link' : 'Immediate manual follow-up',
    buying_signals_detected: [`Asked about ${data.visa_type} requirements`, 'Asked about timeline', 'Enquired about fees']
  };
}

// ─── Demo Transcript ───
function loadDemoTranscript() {
  document.getElementById('f-contact').value = 'Nguyen Van An';
  document.getElementById('f-agent').value = 'Abiha';
  document.getElementById('f-visa').value = 'Skilled Nominated (190)';
  document.getElementById('f-source').value = 'Facebook Ad';
  document.getElementById('f-duration').value = '17';
  document.getElementById('f-transcript').value = `Agent: Hi An, thanks for calling. My name is Abiha, I'm one of the migration consultants here. How are you today?

Lead: I'm good thanks. I saw your Facebook ad about the 190 visa and wanted to find out more.

Agent: Perfect, great that you reached out. So before I take you through everything, can I quickly understand your situation? What country are you currently in, and what's your occupation?

Lead: I'm in Vietnam right now. I'm a software engineer with about 6 years of experience.

Agent: Great, and what's bringing you to consider Australia? Are you looking to work, or is there more to it?

Lead: Mainly work. I have a job offer from a company in Melbourne actually. They mentioned sponsoring me but I'm not sure if that's the best route or if the 190 is better.

Agent: That's actually a really important question and it's exactly the kind of thing that depends heavily on your specific situation — your skills assessment status, your points, the state nomination requirements. It's not something I'd want to give you a quick answer on without looking at everything properly.

What I can tell you is — we work with a lot of software engineers and Melbourne is one of the more active states for 190 nominations in your occupation. But whether the 190 or the employer-sponsored route is right for you, that really comes down to a proper assessment.

Lead: Right, that makes sense. So what does that involve?

Agent: So what we offer is what we call a Strategy Session — it's a 45-minute paid consultation where one of our MARA-registered agents sits down with you and your full background, and at the end of it you walk away with a written pathway report. It maps out which visa is actually the right fit, what your timeline looks like, and the exact steps you need to take.

Lead: How much does that cost?

Agent: The session is $250. A lot of our clients actually say it's the best $250 they spent because it stops them from wasting months going down the wrong path. And if you do decide to engage us further, that fee comes off your service agreement.

Lead: Okay. And how long would the 190 process take if I went that route?

Agent: That's one of the things that varies a lot by state and occupation — which is exactly why the strategy session is worth doing before you start lodging anything. I wouldn't want to give you a number that turns out to be wrong for your state.

Lead: Fair enough. Can I think about it and call back?

Agent: Of course, but I will say — my next available Strategy Session slots are filling up for this week and I'd hate for you to miss out and then have a longer wait. You clearly have a solid profile with 6 years of experience and an employer already interested in you — that puts you in a strong position and timing actually matters when it comes to state nomination cycles.

Can I ask — what's making you want to think about it? Is it the cost, or is it something else I can help clarify?

Lead: I guess I just want to compare a few providers first.

Agent: Totally fair. One thing I'd suggest — ask every provider whether their consultants are MARA-registered. We are, which means you're protected by a professional code of conduct and a complaints process if anything goes wrong. A lot of agencies operate without that accountability. That's one of the reasons clients come back to us.

If you do want to lock in a slot while you're doing your research, I can hold one for you — you'd only pay when we confirm. Would that work?

Lead: Maybe, yes. Can you send me the link?

Agent: Absolutely, I'll send it through to you right now while we're on the call. What's your email?`;

  Toast.show('Demo transcript loaded — click Run AI Audit', 'info');
}

// ─── GHL Integration Logic ───
async function handleFetchGHLCalls() {
  const btn = document.getElementById('ghl-fetch-btn');
  const listEl = document.getElementById('ghl-calls-list');
  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner spinner-sm"></div> Fetching…`;
  listEl.innerHTML = `<div class="flex justify-center py-4"><div class="spinner"></div></div>`;

  try {
    const calls = await GHL.fetchCalls(7);

    if (calls.length === 0) {
      listEl.innerHTML = `<p class="text-xs text-muted" style="text-align:center;padding:12px">No recent calls found in this GHL location.</p>`;
      return;
    }

    listEl.innerHTML = `
      <div style="display:grid;gap:8px;max-height:220px;overflow-y:auto;padding-right:4px">
        ${calls.map(c => {
      const date = new Date(c.startTime);
      const duration = Math.round((new Date(c.endTime) - date) / 60000);
      const contactName = c.contactName || 'Unknown Contact';
      const direction = c.direction === 'inbound' ? '↓ In' : '↑ Out';

      return `
            <div class="action-item" style="padding:10px;cursor:pointer" onclick="importGHLCall(${JSON.stringify(c).replace(/"/g, '&quot;')})">
              <div class="action-item-left">
                <div class="stat-icon indigo" style="width:28px;height:28px;font-size:10px">${direction}</div>
                <div>
                  <div class="action-item-name" style="font-size:13px">${contactName}</div>
                  <div class="action-item-meta" style="font-size:11px">${Format.date(c.startTime.split('T')[0])} · ${duration}m</div>
                </div>
              </div>
              <button type="button" class="btn btn-xs btn-primary">Import</button>
            </div>
          `;
    }).join('')}
      </div>
    `;

  } catch (err) {
    listEl.innerHTML = `<p class="text-xs rose-light" style="text-align:center;padding:12px">Failed to fetch: ${err.message}</p>`;
    Toast.show(`GHL Error: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

async function importGHLCall(call) {
  // Map GHL fields to form
  document.getElementById('f-contact').value = call.contactName || '';
  document.getElementById('f-agent').value = call.userName || '';
  document.getElementById('f-date').value = call.startTime.split('T')[0];

  const duration = Math.round((new Date(call.endTime) - new Date(call.startTime)) / 60000);
  document.getElementById('f-duration').value = duration || 0;

  // Handle recording
  const recordingWrap = document.getElementById('ghl-recording-wrap');
  const audioPlayer = document.getElementById('f-audio-player');
  const recordingLink = document.getElementById('f-recording-link');

  if (call.recordingUrl) {
    recordingWrap.style.display = 'block';
    audioPlayer.src = call.recordingUrl;
    recordingLink.href = call.recordingUrl;
  } else {
    recordingWrap.style.display = 'none';
    audioPlayer.src = '';
  }

  // Try to fetch transcript if messageId is present
  const transcriptArea = document.getElementById('f-transcript');
  transcriptArea.value = '';

  if (call.messageId) {
    Toast.show('Fetching transcript from GHL...', 'info');
    const transcript = await GHL.fetchTranscript(call.messageId);
    if (transcript) {
      transcriptArea.value = transcript;
      Toast.show(`Imported ${call.contactName || 'call'} and transcript successfully.`, 'success');
      return;
    }
  }

  Toast.show(`Imported call details. No transcript found — please paste it manually.`, 'info');
}
