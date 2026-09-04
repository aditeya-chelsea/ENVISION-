// ENVISION Application Main Controller & UI Handlers

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Manager Initialization
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeToggleText = document.getElementById('theme-toggle-text');
  
  const savedTheme = localStorage.getItem('envision_theme') || 'dark';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('envision_theme', theme);

    if (themeToggleText) {
      themeToggleText.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }

    if (window.mapManager) {
      mapManager.setTheme(theme);
    }
  }

  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  // 2. Initialize Leaflet Map
  mapManager.init();

  // 2. State & Filtering
  let activeTab = 'dashboard';
  let alertSeverityFilter = 'ALL';
  let alertSearchQuery = '';
  let sensorSearchQuery = '';

  // 3. UI Element References
  const clockEl = document.getElementById('clock-display');
  const kpiActiveSensorsEl = document.getElementById('kpi-active-sensors');
  const kpiCriticalAlertsEl = document.getElementById('kpi-critical-alerts');
  const kpiHighRiskZonesEl = document.getElementById('kpi-high-risk-zones');
  const kpiNetworkHealthEl = document.getElementById('kpi-network-health');

  const telemetryOnlineEl = document.getElementById('telemetry-online');
  const telemetryOfflineEl = document.getElementById('telemetry-offline');
  const telemetryMessagesEl = document.getElementById('telemetry-messages');
  const telemetryLatencyEl = document.getElementById('telemetry-latency');

  const riskSummaryContainer = document.getElementById('risk-summary-container');
  const quickAlertsContainer = document.getElementById('quick-alerts-container');
  const fullAlertsContainer = document.getElementById('full-alerts-container');
  const fullSensorsContainer = document.getElementById('full-sensors-container');

  // 4. Subscribe UI to Simulation Engine Updates
  envEngine.subscribe((state) => {
    updateUI(state);
  });

  // Start Simulation Ticker (2.5 second updates)
  envEngine.start(2500);

  // Trigger initial UI render
  updateUI(envEngine.getState());

  // 5. Main UI Render Function
  function updateUI(state) {
    // A. Header Clock
    if (clockEl) {
      clockEl.textContent = state.lastUpdated.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }

    // B. KPI Cards
    if (kpiActiveSensorsEl) kpiActiveSensorsEl.textContent = state.kpis.activeSensors.toLocaleString();
    if (kpiCriticalAlertsEl) kpiCriticalAlertsEl.textContent = state.kpis.criticalAlerts;
    if (kpiHighRiskZonesEl) kpiHighRiskZonesEl.textContent = state.kpis.highRiskZones;
    if (kpiNetworkHealthEl) kpiNetworkHealthEl.textContent = `${state.kpis.networkHealth}%`;

    // C. Map Pins Update
    mapManager.updateSensors(state.sensors);

    // D. Risk Summary List
    renderRiskSummary(state.riskSummary);

    // E. Dashboard Quick Alerts
    renderQuickAlerts(state.alerts);

    // F. Telemetry Footer
    if (telemetryOnlineEl) telemetryOnlineEl.textContent = state.liveTelemetry.sensorsOnline;
    if (telemetryOfflineEl) telemetryOfflineEl.textContent = state.liveTelemetry.sensorsOffline;
    if (telemetryMessagesEl) telemetryMessagesEl.textContent = `${(state.liveTelemetry.messagesProcessed / 1000000).toFixed(2)}M`;
    if (telemetryLatencyEl) telemetryLatencyEl.textContent = `${state.liveTelemetry.detectionLatency}s`;

    // G. Render Tab specific full views if active
    if (activeTab === 'alerts') {
      renderFullAlerts(state.alerts);
    } else if (activeTab === 'sensors') {
      renderFullSensors(state.sensors);
    }
  }

  // 6. Render Risk Summaries
  function renderRiskSummary(summaryMap) {
    if (!riskSummaryContainer) return;

    const categories = [
      { key: 'flood', label: 'Flood Risk' },
      { key: 'fire', label: 'Fire Risk' },
      { key: 'airPollution', label: 'Air Pollution' },
      { key: 'extremeHeat', label: 'Extreme Heat' },
      { key: 'landslide', label: 'Landslide Risk' }
    ];

    riskSummaryContainer.innerHTML = categories.map(cat => {
      const data = summaryMap[cat.key];
      const statusClass = getStatusCSSClass(data.status);
      const trendColor = data.trend === '↑' ? 'var(--accent-red)' : (data.trend === '↓' ? 'var(--accent-emerald)' : 'var(--text-muted)');

      return `
        <div class="risk-summary-item">
          <div class="risk-summary-info">
            <span class="risk-summary-name">${cat.label}</span>
            <span class="risk-summary-val">Index: ${data.risk}%</span>
          </div>
          <div class="risk-badge-group">
            <span class="status-tag ${statusClass}">${data.status}</span>
            <span class="trend-arrow" style="color: ${trendColor}">${data.trend}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 7. Render Quick Alerts Feed (Dashboard Sidebar)
  function renderQuickAlerts(alerts) {
    if (!quickAlertsContainer) return;

    if (alerts.length === 0) {
      quickAlertsContainer.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-muted); padding: 8px;">No active environmental anomalies</div>`;
      return;
    }

    quickAlertsContainer.innerHTML = alerts.slice(0, 4).map(alt => {
      const severityClass = alt.severity.toLowerCase();
      return `
        <div class="alert-item-mini ${severityClass}">
          <div class="alert-header-mini">
            <span class="alert-loc">${alt.location} • ${alt.type}</span>
            <span class="alert-time">${alt.time}</span>
          </div>
          <div class="alert-msg">${alt.message}</div>
        </div>
      `;
    }).join('');
  }

  // 8. Render Full Alerts Page
  function renderFullAlerts(alerts) {
    if (!fullAlertsContainer) return;

    let filtered = alerts;
    if (alertSeverityFilter !== 'ALL') {
      filtered = filtered.filter(a => a.severity === alertSeverityFilter);
    }
    if (alertSearchQuery.trim() !== '') {
      const q = alertSearchQuery.toLowerCase();
      filtered = filtered.filter(a => a.location.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.message.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      fullAlertsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 30px;">No alerts matching current filters</div>`;
      return;
    }

    fullAlertsContainer.innerHTML = filtered.map(alt => {
      const severityClass = alt.severity.toLowerCase();
      const statusColor = mapManager.getStatusColor(alt.severity === 'CRITICAL' ? 'CRITICAL' : (alt.severity === 'HIGH' ? 'HIGH RISK' : 'WARNING'));
      
      return `
        <div class="alert-card-full ${severityClass}">
          <div class="alert-main-info">
            <h4>
              <span>${alt.location}, ${alt.region}</span>
              <span class="status-tag ${severityClass}">${alt.severity}</span>
            </h4>
            <p>${alt.message}</p>
          </div>
          <div class="alert-meta">
            <span class="alert-risk-score" style="color: ${statusColor}">Risk: ${alt.risk}%</span>
            <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">${alt.time}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 9. Render Full Sensors Page
  function renderFullSensors(sensors) {
    if (!fullSensorsContainer) return;

    let filtered = sensors;
    if (sensorSearchQuery.trim() !== '') {
      const q = sensorSearchQuery.toLowerCase();
      filtered = filtered.filter(s => s.id.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.region.toLowerCase().includes(q) || s.riskType.toLowerCase().includes(q));
    }

    fullSensorsContainer.innerHTML = filtered.map(s => {
      const statusColor = mapManager.getStatusColor(s.status);
      const statusClass = getStatusCSSClass(s.status);

      return `
        <div class="sensor-card">
          <div class="sensor-card-header">
            <div>
              <h3>${s.id}</h3>
              <span>${s.location}, ${s.region}</span>
            </div>
            <span class="status-tag ${statusClass}">${s.status}</span>
          </div>

          <div class="sensor-card-metrics">
            <div class="metric-cell">
              <span class="label">Temp</span>
              <span class="value">${s.temperature}°C</span>
            </div>
            <div class="metric-cell">
              <span class="label">Humidity</span>
              <span class="value">${s.humidity}%</span>
            </div>
            <div class="metric-cell">
              <span class="label">PM2.5</span>
              <span class="value">${s.pm25}</span>
            </div>
            <div class="metric-cell">
              <span class="label">Rainfall</span>
              <span class="value">${s.rainfall}</span>
            </div>
            <div class="metric-cell">
              <span class="label">Water Lv</span>
              <span class="value">${s.waterLevel}%</span>
            </div>
            <div class="metric-cell">
              <span class="label">Battery</span>
              <span class="value">${s.battery}%</span>
            </div>
          </div>

          <button class="locate-btn" onclick="focusOnSensor('${s.id}', ${s.lat}, ${s.lng})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Locate Sensor on Map
          </button>
        </div>
      `;
    }).join('');
  }

  function getStatusCSSClass(status) {
    switch (status) {
      case 'CRITICAL': return 'critical';
      case 'HIGH RISK': return 'high';
      case 'WARNING': return 'warning';
      case 'NORMAL': return 'normal';
      default: return 'normal';
    }
  }

  // 10. Tab Navigation Handler
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      activeTab = targetTab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');

      const mapSection = document.querySelector('.map-section');
      if (targetTab === 'map-view') {
        const mapViewContainer = document.getElementById('map-view-container');
        if (mapSection && mapViewContainer) {
          mapViewContainer.appendChild(mapSection);
        }
      } else if (targetTab === 'dashboard') {
        const dashboardContent = document.querySelector('.dashboard-content');
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (mapSection && dashboardContent) {
          dashboardContent.insertBefore(mapSection, sidebar);
        }
      }

      if (targetTab === 'dashboard' || targetTab === 'map-view') {
        setTimeout(() => {
          if (mapManager.map) mapManager.map.invalidateSize();
        }, 100);
      }

      // Re-trigger update for full views
      updateUI(envEngine.getState());
    });
  });

  // 11. Map Layer Toggles Handlers
  const layerCheckboxes = document.querySelectorAll('.layer-checkbox input[type="checkbox"]');
  layerCheckboxes.forEach(chk => {
    chk.addEventListener('change', (e) => {
      const layerKey = e.target.getAttribute('data-layer');
      mapManager.toggleLayer(layerKey, e.target.checked);
    });
  });

  const btnShowAll = document.getElementById('btn-show-all-layers');
  if (btnShowAll) {
    btnShowAll.addEventListener('click', () => {
      layerCheckboxes.forEach(chk => chk.checked = true);
      mapManager.showAllLayers();
    });
  }

  const btnHideAll = document.getElementById('btn-hide-all-layers');
  if (btnHideAll) {
    btnHideAll.addEventListener('click', () => {
      layerCheckboxes.forEach(chk => chk.checked = false);
      mapManager.hideAllLayers();
    });
  }

  // 11b. Basemap Select Handler
  const basemapSelect = document.getElementById('basemap-select');
  if (basemapSelect) {
    basemapSelect.addEventListener('change', (e) => {
      mapManager.setBasemap(e.target.value);
    });
  }

  // 12. Alert Filter & Search Handlers
  const alertFilterBtns = document.querySelectorAll('.alert-filter-btn');
  alertFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      alertFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      alertSeverityFilter = btn.getAttribute('data-severity');
      renderFullAlerts(envEngine.getState().alerts);
    });
  });

  const alertSearchInput = document.getElementById('alert-search-input');
  if (alertSearchInput) {
    alertSearchInput.addEventListener('input', (e) => {
      alertSearchQuery = e.target.value;
      renderFullAlerts(envEngine.getState().alerts);
    });
  }

  const sensorSearchInput = document.getElementById('sensor-search-input');
  if (sensorSearchInput) {
    sensorSearchInput.addEventListener('input', (e) => {
      sensorSearchQuery = e.target.value;
      renderFullSensors(envEngine.getState().sensors);
    });
  }

  // Global helper to switch to map tab and zoom into sensor
  window.focusOnSensor = function(id, lat, lng) {
    const dashboardTabBtn = document.querySelector('.tab-btn[data-tab="dashboard"]');
    if (dashboardTabBtn) dashboardTabBtn.click();
    mapManager.focusSensor(lat, lng);
    
    setTimeout(() => {
      if (mapManager.markers[id]) {
        mapManager.markers[id].openPopup();
      }
    }, 1200);
  };
});
