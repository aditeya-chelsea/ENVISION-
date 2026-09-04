class MapManager {
  constructor(mapId) {
    this.mapId = mapId;
    this.map = null;
    this.markers = {};
    this.overlayLayers = {
      sensorNodes: null,
      floodRisk: null,
      fireRisk: null,
      airPollution: null,
      extremeHeat: null,
      landslideRisk: null,
      rainfall: null
    };

    this.activeLayers = {
      sensorNodes: true,
      floodRisk: false,
      fireRisk: false,
      airPollution: false,
      extremeHeat: false,
      landslideRisk: false,
      rainfall: false
    };

    this.selectedSensorId = null;

    // Free Open Basemap Tile Providers (Zero API Key required)
    this.tileProviders = {
      'carto-dark': {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }
      },
      'carto-light': {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }
      },
      'carto-voyager': {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }
      },
      'osm': {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: 'abc',
          maxZoom: 19
        }
      }
    };

    this.currentTheme = 'dark';
    this.selectedBasemapKey = 'auto';
    this.currentTileLayer = null;
    this.isFallbackActive = false;
  }

  init() {
    if (!document.getElementById(this.mapId)) return;

    // Initialize Leaflet Map centered on India
    this.map = L.map(this.mapId, {
      center: [21.5, 79.5],
      zoom: 5,
      minZoom: 4,
      maxZoom: 10,
      zoomControl: false
    });

    // Add Zoom Control to Top Right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Add Basemap Tile Layer
    this.updateTileLayer();

    // Create Layer Groups
    this.overlayLayers.sensorNodes = L.layerGroup().addTo(this.map);
    this.overlayLayers.floodRisk = L.layerGroup();
    this.overlayLayers.fireRisk = L.layerGroup();
    this.overlayLayers.airPollution = L.layerGroup();
    this.overlayLayers.extremeHeat = L.layerGroup();
    this.overlayLayers.landslideRisk = L.layerGroup();
    this.overlayLayers.rainfall = L.layerGroup();

    // Build Spatial Hazard Layers
    this.buildSpatialOverlays();
  }

  setBasemap(providerKey) {
    if (this.selectedBasemapKey === providerKey) return;
    this.selectedBasemapKey = providerKey;
    this.updateTileLayer();
  }

  setTheme(themeName) {
    const isThemeChanged = this.currentTheme !== themeName;
    this.currentTheme = themeName;
    if (isThemeChanged && this.selectedBasemapKey === 'auto') {
      this.updateTileLayer();
    }
  }

  updateTileLayer() {
    if (!this.map) return;

    let targetKey = this.selectedBasemapKey;
    if (targetKey === 'auto') {
      targetKey = this.currentTheme === 'light' ? 'carto-light' : 'carto-dark';
    }

    const provider = this.tileProviders[targetKey] || this.tileProviders['carto-dark'];

    // Prevent redundant layer teardown if same tile URL is already active
    if (this.currentTileLayer && this.currentProviderUrl === provider.url) {
      return;
    }

    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }

    this.currentProviderUrl = provider.url;
    this.currentTileLayer = L.tileLayer(provider.url, provider.options);
    this.currentTileLayer.addTo(this.map);
    this.updateStatusBadge(targetKey, false);
  }

  updateStatusBadge(providerName, isFallback = false) {
    const statusTextEl = document.getElementById('basemap-status-text');
    const statusDotEl = document.querySelector('.tile-status-dot');
    
    if (statusTextEl) {
      statusTextEl.textContent = isFallback 
        ? 'Tiles: Open Access (Fallback)' 
        : `Tiles: Active (${providerName.toUpperCase()})`;
    }
    
    if (statusDotEl) {
      if (isFallback) {
        statusDotEl.classList.add('warning');
      } else {
        statusDotEl.classList.remove('warning');
      }
    }
  }

  buildSpatialOverlays() {
    // 1. Flood Risk Overlays (Blue circles / polygons)
    const floodZones = [
      { coords: [26.1445, 91.7362], radius: 120000, name: "Brahmaputra Basin (Assam)" },
      { coords: [25.5941, 85.1376], radius: 100000, name: "Ganges Basin (Bihar)" },
      { coords: [19.0760, 72.8777], radius: 60000, name: "Coastal Surge (Mumbai)" },
      { coords: [10.8505, 76.2711], radius: 70000, name: "Periyar Catchment (Kerala)" }
    ];

    floodZones.forEach(fz => {
      L.circle(fz.coords, {
        color: '#0284C7',
        fillColor: '#38BDF8',
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '5, 5'
      }).bindTooltip(`<b>Flood Risk Zone</b><br>${fz.name}`, { className: 'env-tooltip' })
        .addTo(this.overlayLayers.floodRisk);
    });

    // 2. Fire Risk Overlays (Amber/Red circles)
    const fireZones = [
      { coords: [30.3165, 78.0322], radius: 85000, name: "Pine Forests (Uttarakhand)" },
      { coords: [31.1048, 77.1734], radius: 75000, name: "Shimla Hills (Himachal Pradesh)" },
      { coords: [26.3, 92.2], radius: 65000, name: "Kaziranga Buffer (Assam)" }
    ];

    fireZones.forEach(fz => {
      L.circle(fz.coords, {
        color: '#EA580C',
        fillColor: '#F97316',
        fillOpacity: 0.3,
        weight: 2
      }).bindTooltip(`<b>Fire Hotspot Risk</b><br>${fz.name}`, { className: 'env-tooltip' })
        .addTo(this.overlayLayers.fireRisk);
    });

    // 3. Air Pollution Heatmap Circles (Purple/Violet)
    const pollutionZones = [
      { coords: [28.6139, 77.2090], radius: 130000, name: "NCR Severe Haze Belt" },
      { coords: [22.5726, 88.3639], radius: 90000, name: "Kolkata Urban Plume" },
      { coords: [19.0760, 72.8777], radius: 70000, name: "Mumbai Industrial Corridor" }
    ];

    pollutionZones.forEach(pz => {
      L.circle(pz.coords, {
        color: '#7C3AED',
        fillColor: '#A78BFA',
        fillOpacity: 0.32,
        weight: 2
      }).bindTooltip(`<b>Severe Pollution Plume</b><br>${pz.name}`, { className: 'env-tooltip' })
        .addTo(this.overlayLayers.airPollution);
    });

    // 4. Extreme Heat Zones (Red/Orange)
    const heatZones = [
      { coords: [17.3850, 78.4867], radius: 140000, name: "Deccan Thermal Corridor (Telangana/Hyd)" },
      { coords: [26.9124, 75.7873], radius: 160000, name: "Thar Fringe Thermal Zone (Rajasthan)" },
      { coords: [13.0827, 80.2707], radius: 95000, name: "Coromandel Coastal Heat (Chennai)" }
    ];

    heatZones.forEach(hz => {
      L.circle(hz.coords, {
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.28,
        weight: 2
      }).bindTooltip(`<b>Extreme Heatwave Zone</b><br>${hz.name}`, { className: 'env-tooltip' })
        .addTo(this.overlayLayers.extremeHeat);
    });

    // 5. Landslide Risk Zones (Brown/Yellow)
    const landslideZones = [
      { coords: [10.8505, 76.2711], radius: 80000, name: "Western Ghats Slopes (Wayanad/Kerala)" },
      { coords: [30.3165, 78.0322], radius: 90000, name: "Garhwal Himalayas (Uttarakhand)" },
      { coords: [31.1048, 77.1734], radius: 75000, name: "Mandi-Shimla Terrain (Himachal)" }
    ];

    landslideZones.forEach(lz => {
      L.circle(lz.coords, {
        color: '#D97706',
        fillColor: '#FBBF24',
        fillOpacity: 0.3,
        weight: 2,
        dashArray: '3, 4'
      }).bindTooltip(`<b>Landslide Hazard Zone</b><br>${lz.name}`, { className: 'env-tooltip' })
        .addTo(this.overlayLayers.landslideRisk);
    });

    // 6. Rainfall Radar Overlays (Teal/Cyan)
    const rainZones = [
      { coords: [26.1445, 91.7362], radius: 140000, name: "Heavy Precipitation Cell (Assam)" },
      { coords: [10.8505, 76.2711], radius: 110000, name: "Monsoon Surge Cell (Kerala)" },
      { coords: [19.0760, 72.8777], radius: 80000, name: "Konkan Coastal Cloud Cell (Mumbai)" }
    ];

    rainZones.forEach(rz => {
      L.circle(rz.coords, {
        color: '#0D9488',
        fillColor: '#2DD4BF',
        fillOpacity: 0.28,
        weight: 2
      }).bindTooltip(`<b>Heavy Rainfall Cell</b><br>${rz.name}`, { className: 'env-tooltip' })
        .addTo(this.overlayLayers.rainfall);
    });
  }

  getStatusColor(status) {
    switch (status) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH RISK': return '#F97316';
      case 'WARNING': return '#F59E0B';
      case 'NORMAL': return '#10B981';
      case 'OFFLINE': return '#6B7280';
      default: return '#10B981';
    }
  }

  updateSensors(sensors) {
    if (!this.map) return;

    sensors.forEach(sensor => {
      const color = this.getStatusColor(sensor.status);
      const isCritical = sensor.status === 'CRITICAL';
      const isHigh = sensor.status === 'HIGH RISK';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="pin-wrapper">
            <div class="pin-pulse" style="background-color: ${color}; animation-duration: ${isCritical ? '1s' : '2s'}"></div>
            <div class="pin-core" style="background-color: ${color};">
              <span class="pin-id">${sensor.id.split('-')[1]}</span>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      if (this.markers[sensor.id]) {
        // Update existing marker
        const marker = this.markers[sensor.id];
        marker.setIcon(customIcon);
        marker.setLatLng([sensor.lat, sensor.lng]);
        
        // Update popup content if popup is open
        if (marker.getPopup() && marker.isPopupOpen()) {
          marker.getPopup().setContent(this.createPopupHTML(sensor));
        }
      } else {
        // Create new marker
        const marker = L.marker([sensor.lat, sensor.lng], { icon: customIcon })
          .bindPopup(() => this.createPopupHTML(sensor), { className: 'env-popup-card', maxWidth: 320 })
          .on('click', () => {
            this.selectedSensorId = sensor.id;
          });

        this.markers[sensor.id] = marker;
        this.overlayLayers.sensorNodes.addLayer(marker);
      }
    });
  }

  createPopupHTML(s) {
    const statusColor = this.getStatusColor(s.status);
    
    return `
      <div class="popup-container">
        <div class="popup-header" style="border-left: 4px solid ${statusColor};">
          <div class="popup-title">
            <h4>${s.id}</h4>
            <span class="popup-loc">${s.location}, ${s.region}</span>
          </div>
          <span class="popup-status-badge" style="background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44;">
            ${s.status}
          </span>
        </div>

        <div class="popup-grid">
          <div class="popup-item">
            <span class="lbl">Temperature</span>
            <span class="val">${s.temperature} °C</span>
          </div>
          <div class="popup-item">
            <span class="lbl">Humidity</span>
            <span class="val">${s.humidity} %</span>
          </div>
          <div class="popup-item">
            <span class="lbl">PM2.5 / PM10</span>
            <span class="val">${s.pm25} / ${s.pm10}</span>
          </div>
          <div class="popup-item">
            <span class="lbl">Rainfall</span>
            <span class="val">${s.rainfall} mm/h</span>
          </div>
          <div class="popup-item">
            <span class="lbl">Water Level</span>
            <span class="val">${s.waterLevel} %</span>
          </div>
          <div class="popup-item">
            <span class="lbl">Soil Moisture</span>
            <span class="val">${s.soilMoisture} %</span>
          </div>
          <div class="popup-item">
            <span class="lbl">Smoke Level</span>
            <span class="val">${s.smoke} %</span>
          </div>
          <div class="popup-item">
            <span class="lbl">Battery</span>
            <span class="val">${s.battery} %</span>
          </div>
        </div>

        <div class="popup-footer">
          <div class="risk-bar-header">
            <span>AI RISK ESTIMATE (${s.riskType})</span>
            <span class="risk-score" style="color: ${statusColor}">${s.risk}%</span>
          </div>
          <div class="risk-track">
            <div class="risk-fill" style="width: ${s.risk}%; background: ${statusColor}"></div>
          </div>
        </div>
      </div>
    `;
  }

  toggleLayer(layerKey, isEnabled) {
    this.activeLayers[layerKey] = isEnabled;

    if (this.overlayLayers[layerKey]) {
      if (isEnabled) {
        this.map.addLayer(this.overlayLayers[layerKey]);
      } else {
        this.map.removeLayer(this.overlayLayers[layerKey]);
      }
    }
  }

  showAllLayers() {
    Object.keys(this.activeLayers).forEach(key => {
      this.toggleLayer(key, true);
    });
  }

  hideAllLayers() {
    Object.keys(this.activeLayers).forEach(key => {
      // Keep sensorNodes visible by default if preferred, or hide everything
      this.toggleLayer(key, false);
    });
  }

  focusSensor(lat, lng) {
    if (this.map) {
      this.map.flyTo([lat, lng], 8, { duration: 1.2 });
    }
  }
}

window.mapManager = new MapManager('map');
