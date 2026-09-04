// ENVISION Local Telemetry & AI Risk Simulation Engine

class SimulationEngine {
  constructor() {
    this.sensors = JSON.parse(JSON.stringify(initialSensors));
    this.listeners = [];
    this.kpis = {
      activeSensors: 1284,
      criticalAlerts: 1,
      highRiskZones: 2,
      networkHealth: 98.4
    };
    this.liveTelemetry = {
      sensorsOnline: 1272,
      sensorsOffline: 12,
      messagesProcessed: 2410850,
      detectionLatency: 1.6
    };
    this.riskSummary = {
      flood: { risk: 28, status: 'NORMAL', trend: '→' },
      fire: { risk: 18, status: 'NORMAL', trend: '→' },
      airPollution: { risk: 34, status: 'NORMAL', trend: '→' },
      extremeHeat: { risk: 22, status: 'NORMAL', trend: '→' },
      landslide: { risk: 25, status: 'NORMAL', trend: '→' }
    };
    this.alerts = [];
    this.lastUpdated = new Date();
    this.timer = null;
    
    // Generate initial risk evaluation & alerts
    this.sensors.forEach(s => this.calculateSensorRisk(s));
    this.updateCategoryRiskSummaries();
    this.updateKPIs();
    this.updateAlerts();
  }

  start(intervalMs = 2500) {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  getState() {
    return {
      sensors: this.sensors,
      kpis: this.kpis,
      liveTelemetry: this.liveTelemetry,
      riskSummary: this.riskSummary,
      alerts: this.alerts,
      lastUpdated: this.lastUpdated
    };
  }

  // Smooth random walk bounded within [min, max]
  smoothDrift(val, maxChange, min, max, precision = 1) {
    const delta = (Math.random() * 2 - 1) * maxChange;
    let newVal = val + delta;
    newVal = Math.max(min, Math.min(max, newVal));
    return parseFloat(newVal.toFixed(precision));
  }

  tick() {
    this.lastUpdated = new Date();

    // 1. Occasional targeted Anomaly trigger (8% chance per tick on 1 sensor)
    const triggerAnomaly = Math.random() < 0.08;
    const anomalyTargetIndex = Math.floor(Math.random() * this.sensors.length);

    // 2. Update individual sensor values smoothly
    this.sensors.forEach((s, idx) => {
      let isAnomaly = triggerAnomaly && idx === anomalyTargetIndex;

      s.temperature = this.smoothDrift(s.temperature, isAnomaly ? 2.0 : 0.3, 20, 42, 1);
      s.humidity = this.smoothDrift(s.humidity, isAnomaly ? 3.0 : 1.0, 35, 95, 0);
      s.pm25 = this.smoothDrift(s.pm25, isAnomaly ? 15.0 : 2.5, 10, 220, 0);
      s.pm10 = this.smoothDrift(s.pm10, isAnomaly ? 20.0 : 4.0, 20, 350, 0);
      s.rainfall = this.smoothDrift(s.rainfall, isAnomaly ? 10.0 : 1.5, 0, 100, 1);
      s.waterLevel = this.smoothDrift(s.waterLevel, isAnomaly ? 6.0 : 1.0, 10, 95, 0);
      s.soilMoisture = this.smoothDrift(s.soilMoisture, isAnomaly ? 5.0 : 1.0, 10, 90, 0);
      s.smoke = this.smoothDrift(s.smoke, isAnomaly ? 8.0 : 0.8, 0, 60, 0);
      s.vibration = this.smoothDrift(s.vibration, isAnomaly ? 10.0 : 1.0, 0, 80, 0);
      s.battery = this.smoothDrift(s.battery, 0.1, 10, 100, 0);

      // Recalculate AI Risk Score for this sensor node
      this.calculateSensorRisk(s);
    });

    // 3. Update Overall Risk Summaries based on network values
    this.updateCategoryRiskSummaries();

    // 4. Update Dynamic KPI Cards
    this.updateKPIs();

    // 5. Update Dynamic Alerts
    this.updateAlerts();

    // 6. Update Live System Telemetry
    this.updateTelemetry();

    // Broadcast updated state to all UI components
    this.notify();
  }

  calculateSensorRisk(s) {
    // Calibrated AI Risk Estimate heuristic calculation

    // 1. Flood Risk: Needs high water level AND high rainfall
    let waterScore = s.waterLevel > 50 ? (s.waterLevel - 50) * 1.5 : s.waterLevel * 0.15;
    let rainScore = s.rainfall > 25 ? (s.rainfall - 25) * 0.9 : s.rainfall * 0.1;
    let floodRisk = Math.min(99, Math.max(5, waterScore + rainScore));

    // 2. Fire Risk: Needs smoke anomaly AND elevated temp
    let smokeScore = s.smoke > 15 ? (s.smoke - 15) * 1.8 : s.smoke * 0.3;
    let tempBonus = s.temperature > 34 ? (s.temperature - 34) * 4 : 0;
    let fireRisk = Math.min(99, Math.max(5, smokeScore + tempBonus));

    // 3. Air Pollution: High PM2.5 & PM10
    let pm25Score = (s.pm25 / 220) * 70;
    let pm10Score = (s.pm10 / 350) * 30;
    let pollutionRisk = Math.min(99, Math.max(5, pm25Score + pm10Score));

    // 4. Landslide Risk: High soil moisture AND vibration
    let moistureScore = s.soilMoisture > 60 ? (s.soilMoisture - 60) * 1.6 : s.soilMoisture * 0.15;
    let vibrationScore = s.vibration > 25 ? (s.vibration - 25) * 1.8 : s.vibration * 0.2;
    let landslideRisk = Math.min(99, Math.max(5, moistureScore + vibrationScore));

    // 5. Extreme Heat: High temp (>35°C) AND low humidity (<40%)
    let heatBase = s.temperature > 35 ? (s.temperature - 35) * 8 : 0;
    let drynessBonus = s.humidity < 40 ? (40 - s.humidity) * 0.8 : 0;
    let heatRisk = Math.min(99, Math.max(5, heatBase + drynessBonus));

    const riskMap = [
      { type: "Flood Risk", score: floodRisk },
      { type: "Fire Risk", score: fireRisk },
      { type: "Air Pollution", score: pollutionRisk },
      { type: "Landslide Risk", score: landslideRisk },
      { type: "Extreme Heat", score: heatRisk }
    ];

    riskMap.sort((a, b) => b.score - a.score);
    let topRisk = riskMap[0];

    s.risk = Math.round(topRisk.score);
    s.riskType = s.risk >= 40 ? topRisk.type : "None";

    // Calibrated Status Badges
    if (s.risk >= 82) {
      s.status = "CRITICAL";
    } else if (s.risk >= 65) {
      s.status = "HIGH RISK";
    } else if (s.risk >= 40) {
      s.status = "WARNING";
    } else {
      s.status = "NORMAL";
    }
  }

  updateCategoryRiskSummaries() {
    const categories = [
      { key: 'flood', type: 'Flood Risk' },
      { key: 'fire', type: 'Fire Risk' },
      { key: 'airPollution', type: 'Air Pollution' },
      { key: 'extremeHeat', type: 'Extreme Heat' },
      { key: 'landslide', type: 'Landslide Risk' }
    ];

    categories.forEach(cat => {
      const matchingSensors = this.sensors.filter(s => s.riskType === cat.type);
      let avgRisk = 0;
      if (matchingSensors.length > 0) {
        avgRisk = Math.round(matchingSensors.reduce((acc, s) => acc + s.risk, 0) / matchingSensors.length);
      } else {
        avgRisk = Math.round(this.sensors.reduce((acc, s) => acc + s.risk, 0) / this.sensors.length * 0.6);
      }

      const prevRisk = this.riskSummary[cat.key] ? this.riskSummary[cat.key].risk : avgRisk;
      let trend = '→';
      if (avgRisk > prevRisk) trend = '↑';
      else if (avgRisk < prevRisk) trend = '↓';

      let status = 'NORMAL';
      if (avgRisk >= 75) status = 'CRITICAL';
      else if (avgRisk >= 55) status = 'HIGH RISK';
      else if (avgRisk >= 40) status = 'WARNING';

      this.riskSummary[cat.key] = {
        risk: avgRisk,
        status: status,
        trend: trend
      };
    });
  }

  updateKPIs() {
    // Active Sensors: 1270 to 1295
    this.kpis.activeSensors = Math.floor(1270 + Math.random() * 25);

    // Critical Alerts count (actual count of sensors with status == CRITICAL)
    const criticalCount = this.sensors.filter(s => s.status === 'CRITICAL').length;
    this.kpis.criticalAlerts = criticalCount;

    // High Risk Zones (actual count of sensors with status HIGH RISK or CRITICAL)
    const highRiskCount = this.sensors.filter(s => s.status === 'HIGH RISK' || s.status === 'CRITICAL').length;
    this.kpis.highRiskZones = highRiskCount;

    // Network Health %
    this.kpis.networkHealth = parseFloat((97.5 + (Math.random() * 2.3)).toFixed(1));
  }

  updateAlerts() {
    const alertList = [];

    this.sensors.forEach(s => {
      if (s.status === 'CRITICAL') {
        alertList.push({
          id: `ALT-${s.id}-C`,
          severity: 'CRITICAL',
          type: s.riskType,
          location: s.location,
          region: s.region,
          message: this.getAlertMessage('CRITICAL', s),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          risk: s.risk
        });
      } else if (s.status === 'HIGH RISK') {
        alertList.push({
          id: `ALT-${s.id}-H`,
          severity: 'HIGH',
          type: s.riskType,
          location: s.location,
          region: s.region,
          message: this.getAlertMessage('HIGH', s),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          risk: s.risk
        });
      } else if (s.status === 'WARNING') {
        alertList.push({
          id: `ALT-${s.id}-W`,
          severity: 'WARNING',
          type: s.riskType,
          location: s.location,
          region: s.region,
          message: this.getAlertMessage('WARNING', s),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          risk: s.risk
        });
      }
    });

    // Sort by highest risk score
    alertList.sort((a, b) => b.risk - a.risk);
    this.alerts = alertList;
  }

  getAlertMessage(severity, s) {
    switch (s.riskType) {
      case 'Flood Risk':
        return `Water level rising (${s.waterLevel}%) with active rainfall (${s.rainfall} mm/hr)`;
      case 'Air Pollution':
        return `Air quality threshold elevated (PM2.5: ${s.pm25} µg/m³, PM10: ${s.pm10} µg/m³)`;
      case 'Fire Risk':
        return `Smoke level anomaly (${s.smoke}%) with ambient temperature ${s.temperature}°C`;
      case 'Landslide Risk':
        return `Soil moisture saturation (${s.soilMoisture}%) & ground vibration (${s.vibration})`;
      case 'Extreme Heat':
        return `Elevated thermal zone warning (${s.temperature}°C, humidity ${s.humidity}%)`;
      default:
        return `Environmental telemetry update`;
    }
  }

  updateTelemetry() {
    this.liveTelemetry.sensorsOnline = 1270 + Math.floor(Math.random() * 15);
    this.liveTelemetry.sensorsOffline = 1284 - this.liveTelemetry.sensorsOnline;
    this.liveTelemetry.messagesProcessed += Math.floor(180 + Math.random() * 320);
    this.liveTelemetry.detectionLatency = parseFloat((1.4 + Math.random() * 0.4).toFixed(1));
  }
}

// Instantiate global simulation instance
window.envEngine = new SimulationEngine();
