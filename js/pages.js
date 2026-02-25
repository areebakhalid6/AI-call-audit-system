// ============================================================
// CallIQ — Page Renderers
// ============================================================

// ─── Dashboard Page ───
function renderDashboardPage() {
  const audits = DB.getAudits();

  // Real Data Guard: If we are in real-data mode and audits are empty, don't show stats
  if (audits.length === 0) {
    renderEmptyDashboard();
    return;
  }

  const stats = Analytics.getStats(audits);
  const agentStats = Analytics.getAgentStats(audits);
  const recentUnbooked = audits.filter(a => a.booking_outcome !== 'Booked' && a.booking_intent_level === 'High').slice(0, 4);

  const el = document.getElementById('page-dashboard');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard <span style="font-size:10px;font-weight:400;color:var(--text-muted);background:var(--bg-secondary);padding:2px 6px;border-radius:4px;vertical-align:middle;margin-left:8px">v1.2.9</span></h1>
        <p class="page-subtitle">Pre-sales call performance at a glance · Last 30 days</p>
      </div>
      <button class="btn btn-primary" onclick="App.navigateTo('audit')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Audit
      </button>
    </div>

    <div class="content-grid">
      <!-- KPI Row -->
      <div class="stats-row">
        <div class="stat-card indigo">
          <div class="stat-icon indigo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
          <div class="stat-label">Total Calls Audited</div>
          <div class="stat-value">${stats.totalCalls}</div>
          <div class="stat-change neutral">${stats.bookedCount} consultations booked</div>
        </div>
        <div class="stat-card emerald">
          <div class="stat-icon emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div class="stat-label">Booking Rate</div>
          <div class="stat-value">${stats.bookingRate}%</div>
          <div class="stat-change ${stats.bookingRate >= 50 ? 'up' : 'down'}">
            ${stats.bookingRate >= 50 ? '▲ Above target' : '▼ Below 50% target'}
          </div>
        </div>
        <div class="stat-card amber">
          <div class="stat-icon amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div class="stat-label">Avg Call Score</div>
          <div class="stat-value">${stats.avgScore}<span style="font-size:14px;color:var(--text-muted)">/10</span></div>
          <div class="stat-change ${stats.avgScore >= 7 ? 'up' : 'down'}">
            ${stats.avgScore >= 7 ? '▲ Strong performance' : '▼ Needs improvement'}
          </div>
        </div>
        <div class="stat-card rose">
          <div class="stat-icon rose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-label">Revenue Leaks</div>
          <div class="stat-value">${stats.leakCount}</div>
          <div class="stat-change ${stats.leakCount === 0 ? 'up' : 'down'}">
            ${stats.leakCount === 0 ? '✓ No leaks detected' : `▼ Across ${stats.leakCount} calls`}
          </div>
        </div>
        <div class="stat-card" style="--accent: var(--violet)">
          <div class="stat-icon violet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="stat-label">Compliance Flags</div>
          <div class="stat-value">${stats.complianceFlags}</div>
          <div class="stat-change ${stats.complianceFlags === 0 ? 'up' : 'down'}">
            ${stats.complianceFlags === 0 ? '✓ All clear' : '⚠ Review required'}
          </div>
        </div>
        <div class="stat-card cyan">
          <div class="stat-icon cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div class="stat-label">High-Intent Conv. Rate</div>
          <div class="stat-value">${stats.highIntentRate}%</div>
          <div class="stat-change neutral">Of high-intent leads booked</div>
        </div>
      </div>

      <!-- Charts Row 1 -->
      <div class="content-grid two-col" style="padding:0;gap:16px">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Booking Rate & Score Trend</div>
              <div class="card-subtitle">Daily average over last period</div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrap chart-wrap-tall">
              <canvas id="chart-trend"></canvas>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Lead Quality Distribution</div>
              <div class="card-subtitle">Across all audited calls</div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrap chart-wrap-tall">
              <canvas id="chart-quality"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="content-grid two-col" style="padding:0;gap:16px">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Booking Intent Conversion</div>
              <div class="card-subtitle">Booked vs not booked by intent level</div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrap">
              <canvas id="chart-intent"></canvas>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Score Factor Heatmap</div>
              <div class="card-subtitle">Team average per scoring criterion</div>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-wrap">
              <canvas id="chart-radar"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Queue -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🚨 Priority Action Queue</div>
            <div class="card-subtitle">High-intent leads that did not book — follow up now</div>
          </div>
          <span class="badge badge-rose">${recentUnbooked.length} pending</span>
        </div>
        <div class="card-body">
          ${recentUnbooked.length === 0
      ? `<div class="empty-state"><div class="empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div><div class="empty-title">All clear!</div><div class="empty-desc">No high-intent unbooked leads</div></div>`
      : recentUnbooked.map(a => `
              <div class="action-item">
                <div class="action-item-left">
                  <div class="stat-icon rose" style="width:34px;height:34px;flex-shrink:0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72z"></path></svg>
                  </div>
                  <div>
                    <div class="action-item-name">${a.contact_name}</div>
                    <div class="action-item-meta">${a.visa_type} · ${a.agent_name} · ${Format.date(a.call_date)}</div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <span class="badge badge-rose">${a.booking_intent_level} Intent</span>
                  <span class="badge badge-${Format.scoreBadge(a.call_score)}">${a.call_score}/10</span>
                  <button class="btn btn-sm btn-secondary" onclick="App.showAuditModal('${a.id}')">View Audit</button>
                </div>
              </div>
            `).join('')
    }
        </div>
      </div>

      <!-- Agent Leaderboard mini -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Agent Performance Snapshot</div>
            <div class="card-subtitle">Current period</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="App.navigateTo('agents')">View All</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Calls</th>
                <th>Avg Score</th>
                <th>Booking Rate</th>
                <th>Hi-Intent Rate</th>
              </tr>
            </thead>
            <tbody>
              ${agentStats.map((ag, i) => `
                <tr>
                  <td>
                    <div class="flex gap-2">
                      <div class="stat-icon ${['indigo', 'emerald', 'amber'][i % 3]}" style="width:30px;height:30px;flex-shrink:0;font-size:11px;font-weight:700">
                        ${ag.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style="font-weight:600">${ag.name}</span>
                    </div>
                  </td>
                  <td>${ag.calls.length}</td>
                  <td><span class="badge badge-${Format.scoreBadge(ag.avgScore)}">${ag.avgScore}/10</span></td>
                  <td><span style="font-weight:700;color:${ag.bookingRate >= 50 ? 'var(--emerald-light)' : 'var(--rose-light)'}">${ag.bookingRate}%</span></td>
                  <td>${ag.hiRate}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Render charts after DOM is ready
  setTimeout(() => {
    renderBookingTrendChart('chart-trend', audits);
    renderLeadQualityChart('chart-quality', audits);
    renderIntentChart('chart-intent', audits);
    renderScoreFactorChart('chart-radar', audits);
  }, 50);
}

// ─── Call Audits Page ───
function renderCallsPage() {
  const el = document.getElementById('page-calls');
  const audits = DB.getAudits();

  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Call Audits</h1>
        <p class="page-subtitle">${audits.length} calls audited · Click any row to view full report</p>
      </div>
      <button class="btn btn-primary" onclick="App.navigateTo('audit')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Audit
      </button>
    </div>

    <div class="filters-bar">
      <input type="text" class="search-input" placeholder="Search by name, agent, visa..." id="call-search" oninput="filterCallsTable()" />
      <select class="filter-select" id="filter-outcome" onchange="filterCallsTable()">
        <option value="">All Outcomes</option>
        <option value="Booked">Booked</option>
        <option value="Not Booked">Not Booked</option>
      </select>
      <select class="filter-select" id="filter-quality" onchange="filterCallsTable()">
        <option value="">All Quality</option>
        <option value="High Value">High Value</option>
        <option value="Medium Value">Medium Value</option>
        <option value="Low Value">Low Value</option>
        <option value="Not Qualified">Not Qualified</option>
      </select>
      <select class="filter-select" id="filter-agent" onchange="filterCallsTable()">
        <option value="">All Agents</option>
        ${[...new Set(audits.map(a => a.agent_name))].map(n => `<option value="${n}">${n}</option>`).join('')}
      </select>
      <select class="filter-select" id="filter-stage" onchange="filterCallsTable()">
        <option value="">All Stages</option>
        <option value="new lead">New Lead</option>
        <option value="qualifier">Qualifier</option>
        <option value="pre sales1">Pre Sales 1</option>
        <option value="pre sales2">Pre Sales 2</option>
        <option value="booking link shared">Booking Link Shared</option>
        <option value="appointment booked">Appointment Booked</option>
      </select>
    </div>

    <div style="padding: 0 32px 40px">
      <div class="card">
        <div class="table-wrap">
          <table id="calls-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Date</th>
                <th>Agent</th>
                <th>Visa</th>
                <th>Pipeline Stage</th>
                <th>Score</th>
                <th>Lead Quality</th>
                <th>Intent</th>
                <th>Outcome</th>
                <th>Next Action</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="calls-tbody">
              ${renderCallRows(audits)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderCallRows(audits) {
  if (!audits.length) {
    return `<tr><td colspan="11"><div class="empty-state"><div class="empty-title">No calls found</div><div class="empty-desc">Try adjusting your filters or run a new audit</div></div></td></tr>`;
  }
  return audits.map(a => `
  <tr style="cursor:pointer" onclick="App.showAuditModal('${a.id}')">
    <td><span style="font-weight:600">${a.contact_name}</span><div class="text-muted text-sm">${a.lead_source || '—'}</div></td>
    <td>${Format.date(a.call_date)}<div class="text-muted text-sm">${a.call_time || ''}</div></td>
    <td>${a.agent_name}</td>
    <td><span style="font-size:12.5px">${a.visa_type}</span></td>
    <td>${a.pipeline_stage ? `<span class="badge badge-${a.pipeline_stage === 'appointment booked' ? 'emerald' : a.pipeline_stage === 'booking link shared' ? 'amber' : 'slate'}" style="font-size:10px;text-transform:capitalize">${a.pipeline_stage}</span>` : `<span style="color:var(--text-muted)">${a.call_duration_minutes}m</span>`}</td>
    <td>
      <div class="flex gap-2">
        <span class="badge badge-${Format.scoreBadge(a.call_score)}">${a.call_score}/10</span>
        ${a.compliance_flags && a.compliance_flags.length ? '<span title="Compliance flag" style="color:var(--amber)">⚠</span>' : ''}
      </div>
    </td>
    <td><span class="badge badge-${Format.leadQualityBadge(a.lead_quality)}">${a.lead_quality}</span></td>
    <td><span class="badge badge-${Format.intentBadge(a.booking_intent_level)}">${a.booking_intent_level}</span></td>
    <td><span class="badge badge-${Format.outcomeBadge(a.booking_outcome)}">${a.booking_outcome}</span></td>
    <td><span class="badge badge-${Format.nextActionBadge(a.ideal_next_action)}" style="font-size:10.5px">${a.ideal_next_action || '—'}</span></td>
    <td><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();App.showAuditModal('${a.id}')">View</button></td>
  </tr>
  `).join('');
}

function filterCallsTable() {
  const search = (document.getElementById('call-search')?.value || '').toLowerCase();
  const outcome = document.getElementById('filter-outcome')?.value || '';
  const quality = document.getElementById('filter-quality')?.value || '';
  const agent = document.getElementById('filter-agent')?.value || '';

  let audits = DB.getAudits();
  const stage = document.getElementById('filter-stage')?.value || '';
  if (search) audits = audits.filter(a =>
    a.contact_name.toLowerCase().includes(search) ||
    a.agent_name.toLowerCase().includes(search) ||
    a.visa_type.toLowerCase().includes(search) ||
    (a.lead_source || '').toLowerCase().includes(search)
  );
  if (outcome) audits = audits.filter(a => a.booking_outcome === outcome);
  if (quality) audits = audits.filter(a => a.lead_quality === quality);
  if (agent) audits = audits.filter(a => a.agent_name === agent);
  if (stage) audits = audits.filter(a => a.pipeline_stage === stage);

  const tbody = document.getElementById('calls-tbody');
  if (tbody) tbody.innerHTML = renderCallRows(audits);
}

// ─── Agent Performance Page ───
function renderAgentsPage() {
  const audits = DB.getAudits();
  const agentStats = Analytics.getAgentStats(audits);
  const el = document.getElementById('page-agents');

  el.innerHTML = `
    < div class="page-header" >
      <div>
        <h1 class="page-title">Agent Performance</h1>
        <p class="page-subtitle">Individual agent metrics and coaching insights</p>
      </div>
    </div >

    <div class="content-grid">
      <!-- Agent Score Chart -->
      <div class="card">
        <div class="card-header"><div class="card-title">Agent Score & Booking Rate Comparison</div></div>
        <div class="card-body">
          <div class="chart-wrap chart-wrap-tall">
            <canvas id="chart-agents"></canvas>
          </div>
        </div>
      </div>

      <!-- Agent Detail Cards -->
      <div class="stats-row">
        ${agentStats.map((ag, i) => {
    const colors = ['indigo', 'emerald', 'amber', 'violet', 'cyan'];
    const c = colors[i % colors.length];
    return `
          <div class="stat-card ${c}">
            <div class="flex flex-between" style="margin-bottom:14px">
              <div class="stat-icon ${c}" style="font-size:13px;font-weight:800">
                ${ag.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span class="badge badge-${Format.scoreBadge(ag.avgScore)}">${ag.avgScore}/10</span>
            </div>
            <div style="font-size:15px;font-weight:700;margin-bottom:12px">${ag.name}</div>
            <div style="display:grid;gap:8px">
              ${renderProgressBar('Booking Rate', ag.bookingRate, 100, ag.bookingRate >= 50 ? 'var(--emerald)' : 'var(--rose)')}
              ${renderProgressBar('Hi-Intent Rate', ag.hiRate, 100, 'var(--indigo)')}
              ${renderProgressBar('Avg Score', ag.avgScore * 10, 100, 'var(--amber)')}
            </div>
            <div style="margin-top:14px;display:flex;gap:8px;font-size:12px;color:var(--text-muted)">
              <span>${ag.calls.length} calls</span>·
              <span>${ag.booked} booked</span>·
              <span>${ag.highIntent} high-intent</span>
            </div>
          </div>
        `}).join('')}
      </div>

      <!-- Factor breakdown per agent -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Scoring Factor Breakdown by Agent</div>
          <div class="card-subtitle">Average score per criterion (0=Fail, 1=Pass)</div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Factor</th>
                ${agentStats.map(a => `<th>${a.name.split(' ')[0]}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${[
      ['lead_identity_context', 'Lead Identity'],
      ['call_agenda_control', 'Agenda Control'],
      ['qualification_depth', 'Qualification'],
      ['lead_fit_acknowledgement', 'Lead Fit'],
      ['no_free_advice', 'No Free Advice'],
      ['consultation_value_positioning', 'Consult Value'],
      ['authority_trust_signal', 'Authority'],
      ['urgency_creation', 'Urgency'],
      ['clear_booking_transition', 'Booking Transition'],
      ['objection_handling', 'Objection Handling']
    ].map(([key, label]) => `
                <tr>
                  <td style="font-weight:500">${label}</td>
                  ${agentStats.map(ag => {
      const vals = ag.calls.map(c => (c.score_breakdown && c.score_breakdown[key] !== undefined) ? c.score_breakdown[key] : 0);
      const pct = Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100);
      return `<td><span class="badge badge-${pct >= 70 ? 'emerald' : pct >= 40 ? 'amber' : 'rose'}">${pct}%</span></td>`;
    }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => { renderAgentScoreChart('chart-agents', agentStats); }, 50);
}

function renderProgressBar(label, value, max, color) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return `
    < div class="progress-bar-wrap" >
      <div class="progress-bar-label"><span>${label}</span><span>${value}${label.includes('Rate') || label.includes('Score') ? (label.includes('Score') ? '/10' : '%') : ''}</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
    </div >
    `;
}

// ─── Lead Sources Page ───
function renderLeadsPage() {
  const audits = DB.getAudits();
  const sourceStats = Analytics.getLeadSourceStats(audits);
  const el = document.getElementById('page-leads');

  el.innerHTML = `
    < div class="page-header" >
      <div>
        <h1 class="page-title">Lead Sources</h1>
        <p class="page-subtitle">Lead quality and booking rate by acquisition channel</p>
      </div>
    </div >

    <div class="content-grid">
      <div class="content-grid two-col" style="padding:0;gap:16px">
        <div class="card">
          <div class="card-header"><div class="card-title">Calls & Bookings by Source</div></div>
          <div class="card-body">
            <div class="chart-wrap chart-wrap-tall">
              <canvas id="chart-sources"></canvas>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Source Summary</div></div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Source</th><th>Calls</th><th>Booked</th><th>Rate</th><th>High Value</th></tr>
              </thead>
              <tbody>
                ${sourceStats.map(s => `
                  <tr>
                    <td style="font-weight:600">${s.name}</td>
                    <td>${s.total}</td>
                    <td>${s.booked}</td>
                    <td><span style="font-weight:700;color:${s.bookingRate >= 50 ? 'var(--emerald-light)' : 'var(--rose-light)'}">${s.bookingRate}%</span></td>
                    <td><span class="badge badge-emerald">${s.high}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title">Lead Quality per Source</div></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Source</th><th>High Value</th><th>Medium Value</th><th>Low Value</th><th>Not Qualified</th><th>Booking Rate</th></tr>
            </thead>
            <tbody>
              ${sourceStats.map(s => `
                <tr>
                  <td style="font-weight:600">${s.name}</td>
                  <td><span class="badge badge-emerald">${s.high}</span></td>
                  <td><span class="badge badge-amber">${s.medium}</span></td>
                  <td><span class="badge badge-rose">${s.low}</span></td>
                  <td><span class="badge badge-slate">${s.unqualified}</span></td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="progress-bar" style="width:80px"><div class="progress-fill" style="width:${s.bookingRate}%;background:${s.bookingRate >= 50 ? 'var(--emerald)' : 'var(--rose)'}"></div></div>
                      <span style="font-weight:700;font-size:12px">${s.bookingRate}%</span>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => { renderLeadSourceChart('chart-sources', sourceStats); }, 50);
}

// ─── Compliance Log ───
function renderCompliancePage() {
  const audits = DB.getAudits();
  const flagged = audits.filter(a => a.compliance_flags && a.compliance_flags.length > 0);
  const freeAdvice = audits.filter(a => a.free_advice_leakage && a.free_advice_leakage.detected);
  const el = document.getElementById('page-compliance');

  el.innerHTML = `
    < div class="page-header" >
      <div>
        <h1 class="page-title">Compliance Log</h1>
        <p class="page-subtitle">MARA compliance monitoring & free advice leakage alerts</p>
      </div>
    </div >

    <div class="content-grid">
      <div class="stats-row">
        <div class="stat-card ${flagged.length === 0 ? 'emerald' : 'rose'}">
          <div class="stat-icon ${flagged.length === 0 ? 'emerald' : 'rose'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          </div>
          <div class="stat-label">MARA Compliance Flags</div>
          <div class="stat-value">${flagged.length}</div>
          <div class="stat-change ${flagged.length === 0 ? 'up' : 'down'}">${flagged.length === 0 ? '✓ All clear' : '⚠ Review required'}</div>
        </div>
        <div class="stat-card ${freeAdvice.length === 0 ? 'emerald' : 'amber'}">
          <div class="stat-icon ${freeAdvice.length === 0 ? 'emerald' : 'amber'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-label">Free Advice Leakage</div>
          <div class="stat-value">${freeAdvice.length}</div>
          <div class="stat-change ${freeAdvice.length === 0 ? 'up' : 'down'}">${freeAdvice.length === 0 ? '✓ No leakage' : '⚠ Revenue at risk'}</div>
        </div>
      </div>

      ${flagged.length === 0 && freeAdvice.length === 0
      ? `<div class="card"><div class="card-body"><div class="empty-state">
            <div class="empty-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <div class="empty-title">No compliance issues detected</div>
            <div class="empty-desc">All audited calls are clear of MARA compliance flags and free advice leakage</div>
          </div></div></div>`
      : ''
    }

      ${flagged.length > 0 ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="color:var(--rose-light)">⚠ MARA Compliance Flags</div>
            <span class="badge badge-rose">${flagged.length} call${flagged.length > 1 ? 's' : ''}</span>
          </div>
          <div class="card-body" style="display:grid;gap:12px">
            ${flagged.map(a => `
              <div class="audit-section" style="border-color:rgba(244,63,94,0.2)">
                <div class="flex flex-between" style="margin-bottom:10px">
                  <div>
                    <span style="font-weight:700">${a.contact_name}</span>
                    <span class="text-muted text-sm" style="margin-left:8px">${Format.date(a.call_date)} · ${a.agent_name}</span>
                  </div>
                  <button class="btn btn-sm btn-secondary" onclick="App.showAuditModal('${a.id}')">View Audit</button>
                </div>
                ${a.compliance_flags.map(f => `<div class="compliance-flag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>${f}</div>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${freeAdvice.length > 0 ? `
        <div class="card">
          <div class="card-header">
            <div class="card-title" style="color:var(--amber-light)">💸 Free Advice Leakage Detected</div>
            <span class="badge badge-amber">${freeAdvice.length} call${freeAdvice.length > 1 ? 's' : ''}</span>
          </div>
          <div class="card-body" style="display:grid;gap:12px">
            ${freeAdvice.map(a => `
              <div class="audit-section" style="border-color:rgba(245,158,11,0.2)">
                <div class="flex flex-between" style="margin-bottom:10px">
                  <div>
                    <span style="font-weight:700">${a.contact_name}</span>
                    <span class="text-muted text-sm" style="margin-left:8px">${Format.date(a.call_date)} · ${a.agent_name} · ${a.visa_type}</span>
                  </div>
                  <button class="btn btn-sm btn-secondary" onclick="App.showAuditModal('${a.id}')">View Audit</button>
                </div>
                <div class="alert alert-amber">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                  <div><strong>Where it happened:</strong> ${a.free_advice_leakage.location || 'See full audit'}</div>
                </div>
                ${a.revenue_leak_alert ? `<p style="font-size:13px;color:var(--text-secondary);margin-top:10px">${a.revenue_leak_alert}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// ─── Settings Page ───
function renderSettingsPage() {
  const s = DB.getSettings();
  const el = document.getElementById('page-settings');

  el.innerHTML = `
    < div class="page-header" >
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your API keys, agency details, and preferences</p>
      </div>
    </div >

    <div class="content-grid" style="max-width:700px">
      <div class="card">
        <div class="card-body">
          <div class="setting-section">
            <div class="setting-section-title">Agency Profile</div>
            <div class="form-group" style="margin-bottom:14px">
              <label for="s-agency">Agency Name</label>
              <input type="text" id="s-agency" value="${s.agency_name}" placeholder="Your Migration Agency" />
            </div>
            <div class="form-group">
              <label for="s-mara">MARA Registration Number</label>
              <input type="text" id="s-mara" value="${s.mara_number}" placeholder="e.g. 2012345" />
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-section-title">AI Configuration</div>
            <div class="form-group" style="margin-bottom:14px">
              <label for="s-key">OpenAI API Key</label>
              <input type="password" id="s-key" value="${s.openai_api_key}" placeholder="sk-..." />
              <small style="color:var(--text-muted);font-size:11.5px">Required to use the AI audit engine. Stored locally only.</small>
            </div>
            <div class="form-group">
              <label for="s-model">AI Model</label>
              <select id="s-model">
                <option value="gpt-4o" ${s.openai_model === 'gpt-4o' ? 'selected' : ''}>GPT-4o (Recommended)</option>
                <option value="gpt-4-turbo" ${s.openai_model === 'gpt-4-turbo' ? 'selected' : ''}>GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo" ${s.openai_model === 'gpt-3.5-turbo' ? 'selected' : ''}>GPT-3.5 Turbo (Budget)</option>
              </select>
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-section-title">GoHighLevel Integration</div>
            <div class="setting-row">
              <div>
                <div class="setting-label">Auto-post note to GHL</div>
                <div class="setting-desc">Automatically add audit report as a GHL contact note after each audit</div>
              </div>
              <label class="toggle"><input type="checkbox" id="s-ghl-auto" ${s.auto_note_ghl ? 'checked' : ''}><div class="toggle-slider"></div></label>
            </div>
            <div class="form-group" style="margin-top:12px">
              <label for="s-ghl-key">GHL API Key (V2 / pit-key)</label>
              <input type="password" id="s-ghl-key" value="${s.ghl_api_key}" placeholder="GHL API Key" />
            </div>
            <div class="form-group" style="margin-top:12px">
              <label for="s-ghl-loc">GHL Location ID</label>
              <input type="text" id="s-ghl-loc" value="${s.ghl_location_id}" placeholder="e.g. Cy61ZIoB1Q68krX0lSZA" />
            </div>
            <div class="setting-row" style="margin-top:12px">
              <div>
                <div class="setting-label">Use CORS Proxy</div>
                <div class="setting-desc">Fixes "Failed to fetch" errors. Recommended if NOT using a CORS extension.</div>
              </div>
              <label class="toggle"><input type="checkbox" id="s-ghl-proxy" ${s.ghl_use_proxy ? 'checked' : ''}><div class="toggle-slider"></div></label>
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-section-title">Notifications</div>
            <div class="setting-row">
              <div>
                <div class="setting-label">Compliance Alerts</div>
                <div class="setting-desc">Flag MARA compliance risks automatically</div>
              </div>
              <label class="toggle"><input type="checkbox" id="s-compliance" ${s.compliance_alerts ? 'checked' : ''}><div class="toggle-slider"></div></label>
            </div>
          </div>

          <div class="setting-section">
            <div class="setting-section-title">Data Management</div>
            <div class="setting-row">
              <div>
                <div class="setting-label">Clear All Audit Data</div>
                <div class="setting-desc">Delete all stored audit records and reset to sample data</div>
              </div>
              <button class="btn btn-danger btn-sm" onclick="clearAllData()">Clear Data</button>
            </div>
          </div>

          <button class="btn btn-primary btn-block" onclick="saveSettings()" style="margin-bottom:24px">Save Settings</button>

          <div class="setting-section">
            <div class="setting-section-title">System Logs & Debugging</div>
            <div id="debug-logs-container" style="max-height:300px;overflow-y:auto;background:var(--bg-secondary);padding:12px;border-radius:8px;font-family:monospace;font-size:11px;border:1px solid var(--border-color)">
              ${renderDebugLogs()}
            </div>
            <div class="flex flex-between" style="margin-top:12px">
              <button class="btn btn-secondary btn-sm" onclick="App.refreshSettings()">Refresh Logs</button>
              <button class="btn btn-secondary btn-sm" onclick="clearLogs()">Clear Logs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDebugLogs() {
  const logs = DEBUG.getLogs();
  if (logs.length === 0) return '<div class="text-muted">No logs recorded yet.</div>';
  return logs.map(l => `
    <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div class="flex flex-between">
        <span class="${l.type === 'error' ? 'rose-light' : l.type === 'success' ? 'emerald-light' : 'indigo'}">[${l.type.toUpperCase()}]</span>
        <span class="text-muted">${l.timestamp.split('T')[1].split('.')[0]}</span>
      </div>
      <div style="margin-top:2px">${l.message}</div>
      ${l.details ? `<pre style="margin-top:4px;color:var(--text-muted);font-size:10px">${JSON.stringify(l.details, null, 2)}</pre>` : ''}
    </div>
  `).join('');
}

function saveSettings() {
  const settings = {
    agency_name: document.getElementById('s-agency')?.value || '',
    mara_number: document.getElementById('s-mara')?.value || '',
    openai_api_key: document.getElementById('s-key')?.value || '',
    openai_model: document.getElementById('s-model')?.value || 'gpt-4o',
    auto_note_ghl: document.getElementById('s-ghl-auto')?.checked || false,
    ghl_api_key: document.getElementById('s-ghl-key')?.value || '',
    ghl_location_id: document.getElementById('s-ghl-loc')?.value || '',
    ghl_use_proxy: document.getElementById('s-ghl-proxy')?.checked || false,
    compliance_alerts: document.getElementById('s-compliance')?.checked || true,
  };
  DB.saveSettings(settings);
  Toast.show('Settings saved successfully', 'success');
}

function clearAllData() {
  if (confirm('This will permanently delete all audit records from this browser. Are you sure?')) {
    DB.clearData();
    Toast.show('All audit data has been cleared.', 'info');
  }
}

function clearLogs() {
  DEBUG.clear();
  App.refreshSettings();
  Toast.show('Debug logs cleared.', 'info');
}

// ─── Audit Result Modal ───
function renderAuditModal(audit) {
  const scoreColor = Format.scoreColor(audit.call_score);
  const breakdown = audit.score_breakdown || {};
  const FACTOR_LABELS = {
    lead_identity_context: 'Lead Identity & Context',
    call_agenda_control: 'Call Agenda & Control',
    qualification_depth: 'Qualification Depth',
    lead_fit_acknowledgement: 'Lead Fit Acknowledgement',
    no_free_advice: 'No Free Advice Given',
    consultation_value_positioning: 'Consultation Value Positioning',
    authority_trust_signal: 'Authority & Trust Signal',
    urgency_creation: 'Urgency Creation',
    clear_booking_transition: 'Clear Booking Transition',
    objection_handling: 'Objection Handling'
  };

  document.getElementById('modal-call-meta').textContent =
    `${audit.contact_name} · ${audit.agent_name} · ${Format.date(audit.call_date)} · ${audit.visa_type} `;

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (audit.call_score / 10) * circumference;

  document.getElementById('modal-body').innerHTML = `
    < !--Score Header-- >
    <div class="audit-score-header">
      <div class="score-ring-wrap" style="padding:0">
        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="${scoreColor}" stroke-width="10"
              stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
              stroke-linecap="round" style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div class="score-ring-text">
            <div class="score-number" style="color:${scoreColor}">${audit.call_score}</div>
            <div class="score-denom">/10</div>
          </div>
        </div>
      </div>
      <div class="audit-meta-grid">
        <div class="audit-meta-item">
          <div class="audit-meta-label">Booking Outcome</div>
          <div class="audit-meta-value"><span class="badge badge-${Format.outcomeBadge(audit.booking_outcome)}">${audit.booking_outcome}</span></div>
        </div>
        <div class="audit-meta-item">
          <div class="audit-meta-label">Booking Probability</div>
          <div class="audit-meta-value" style="color:${Format.scoreColor(audit.booking_probability / 10)}">${audit.booking_probability}%</div>
        </div>
        <div class="audit-meta-item">
          <div class="audit-meta-label">Lead Quality</div>
          <div class="audit-meta-value"><span class="badge badge-${Format.leadQualityBadge(audit.lead_quality)}">${audit.lead_quality}</span></div>
        </div>
        <div class="audit-meta-item">
          <div class="audit-meta-label">Booking Intent</div>
          <div class="audit-meta-value"><span class="badge badge-${Format.intentBadge(audit.booking_intent_level)}">${audit.booking_intent_level}</span></div>
        </div>
        <div class="audit-meta-item">
          <div class="audit-meta-label">GHL Pipeline Stage</div>
          <div class="audit-meta-value"><span class="badge badge-${audit.pipeline_stage === 'appointment booked' ? 'emerald' : audit.pipeline_stage === 'booking link shared' ? 'amber' : 'slate'}" style="text-transform:capitalize;font-size:10px">${audit.pipeline_stage || 'Unknown'}</span></div>
        </div>
        <div class="audit-meta-item">
          <div class="audit-meta-label">Duration</div>
          <div class="audit-meta-value">${audit.call_duration_minutes} min</div>
        </div>
        <div class="audit-meta-item">
          <div class="audit-meta-label">Ideal Next Action</div>
          <div class="audit-meta-value"><span class="badge badge-${Format.nextActionBadge(audit.ideal_next_action)}">${audit.ideal_next_action}</span></div>
        </div>
      </div>
    </div>

    <!--Failure Reason-- >
    ${audit.primary_failure_reason ? `
      <div class="alert alert-rose">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        <div><strong>Primary Failure Reason:</strong> ${audit.primary_failure_reason}</div>
      </div>
    ` : '<div class="alert alert-emerald"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><polyline points="20 6 9 17 4 12"></polyline></svg><div><strong>Consultation successfully booked!</strong></div></div>'
    }

    < !--Revenue Leak-- >
    ${audit.revenue_leak_alert ? `
      <div class="audit-section">
        <div class="audit-section-title">💸 Revenue Leak Alert</div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.7">${audit.revenue_leak_alert}</p>
      </div>
    ` : ''
    }

    < !--Free Advice-- >
    ${audit.free_advice_leakage?.detected ? `
      <div class="audit-section" style="border-color:rgba(245,158,11,0.2)">
        <div class="audit-section-title">🆓 Free Advice Leakage — <span style="color:var(--amber-light)">DETECTED</span></div>
        <div class="alert alert-amber" style="margin-top:0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
          ${audit.free_advice_leakage.location}
        </div>
      </div>
    ` : `
      <div class="audit-section">
        <div class="audit-section-title">🆓 Free Advice Leakage — <span style="color:var(--emerald-light)">CLEAR</span></div>
        <p style="font-size:13px;color:var(--text-muted)">No free migration advice or eligibility conclusions were detected in this call.</p>
      </div>
    `}

    < !--Compliance -->
    ${audit.compliance_flags && audit.compliance_flags.length > 0 ? `
      <div class="audit-section" style="border-color:rgba(244,63,94,0.2)">
        <div class="audit-section-title" style="color:var(--rose-light)">⚠ MARA Compliance Flags</div>
        ${audit.compliance_flags.map(f => `<div class="compliance-flag" style="margin-top:6px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          ${f}
        </div>`).join('')}
      </div>
    ` : ''
    }

    < !--Scoring Breakdown-- >
    <div class="audit-section">
      <div class="audit-section-title">📊 10-Point Score Breakdown</div>
      <div class="audit-scoring-grid">
        ${Object.entries(FACTOR_LABELS).map(([key, label]) => {
      const val = breakdown[key];
      return `
            <div class="audit-score-item">
              <span class="audit-score-item-label">${label}</span>
              <div class="score-dot ${val === 1 ? 'pass' : 'fail'}">${val === 1 ? '✓' : '✗'}</div>
            </div>
          `;
    }).join('')}
      </div>
    </div>

    <!--Trust Insight-- >
    <div class="audit-section">
      <div class="audit-section-title">🏆 Trust & Authority Insight</div>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.7">${audit.trust_authority_insight || '—'}</p>
    </div>

    <!--Buying Signals-- >
    ${audit.buying_signals_detected?.length ? `
      <div class="audit-section">
        <div class="audit-section-title">🔥 Buying Signals Detected</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
          ${audit.buying_signals_detected.map(s => `<span class="badge badge-indigo">${s}</span>`).join('')}
        </div>
      </div>
    ` : ''
    }

    < !--Coaching -->
    <div class="audit-section">
      <div class="audit-section-title">📚 Coaching Recommendations for ${audit.agent_name.split(' ')[0]}</div>
      <ul class="coaching-list">
        ${(audit.coaching_recommendations || []).map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderEmptyDashboard() {
  const el = document.getElementById('page-dashboard');
  el.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard <span style="font-size:10px;font-weight:400;color:var(--text-muted);background:var(--bg-secondary);padding:2px 6px;border-radius:4px;vertical-align:middle;margin-left:8px">v1.2.9</span></h1>
        <p class="page-subtitle">Welcome to CallIQ Audit System</p>
      </div>
      <button class="btn btn-primary" onclick="App.navigateTo('audit')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Audit
      </button>
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;text-align:center;background:var(--bg-secondary);border-radius:12px;border:1px dashed var(--border-color)">
      <div style="width:64px;height:64px;background:var(--indigo-lightest);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px;color:var(--indigo)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </div>
      <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Your dashboard is empty</h2>
      <p style="color:var(--text-muted);max-width:400px;margin:0 auto 24px">Run your first AI call audit to start seeing performance metrics, agent scores, and revenue leak alerts.</p>
      <button class="btn btn-primary" onclick="App.navigateTo('audit')">Get Started</button>
    </div>
  `;
}
