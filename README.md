ENVISION — Environmental Intelligence Network

A real-time environmental intelligence dashboard for monitoring, visualizing, and assessing environmental risks across India.

PROJECT DESCRIPTION

ENVISION is an environmental intelligence platform designed to provide a unified view of environmental conditions and emerging hazards across India. It combines an interactive map, simulated sensor telemetry, dynamic risk indicators, and an AI-inspired risk estimation engine to demonstrate how environmental monitoring systems can support faster decision-making.

The prototype simulates a network of environmental sensors across major Indian regions, continuously updates their telemetry, and visualizes potential hazards such as floods, fires, air pollution, extreme heat, and landslides. Users can explore sensor locations, inspect live readings, monitor alerts, and understand how environmental conditions translate into risk estimates.

Built as a hackathon prototype, ENVISION focuses on real-time visualization, environmental awareness, and decision-support capabilities through a lightweight, locally runnable web dashboard.

KEY FEATURES

- Real-time control-room dashboard with dynamic KPI cards and system status.
- Interactive Leaflet map of India with 13 simulated environmental sensor nodes.
- Environmental risk layers for floods, fires, air pollution, extreme heat, landslides, and rainfall.
- Live telemetry simulation across 11 environmental parameters.
- AI-inspired risk estimation engine that generates dynamic hazard percentages.
- Interactive sensor popups with detailed telemetry and risk indicators.
- Live alerts panel with severity filters and search.
- Sensor inventory with real-time metric updates and map navigation.
- Responsive dark-theme interface designed for control-room monitoring.

HOW IT WORKS

Environmental Sensor Data
        |
        v
Telemetry Processing
        |
        v
AI Risk Estimation
        |
        v
Interactive Map and KPI Dashboard
        |
        v
Alerts and Decision Support

The prototype uses simulated data to demonstrate the complete monitoring workflow. Sensor values continuously drift within realistic ranges, while occasional anomalies generate higher-risk conditions and alerts.

TECHNOLOGY STACK

- HTML, CSS, and JavaScript: Core web application
- Leaflet.js: Interactive map
- CartoDB Dark Matter: Dark map tiles
- Local simulation engines: Dynamic telemetry and KPI updates
- AI-inspired risk engine: Environmental risk estimation
- Local server: Prototype hosting and testing

SIMULATED SENSOR NETWORK

The prototype includes 13 simulated sensor nodes across India:

Mumbai, Pune, Nashik, Delhi, Assam, Bihar, Kerala, Uttarakhand, Himachal Pradesh, Kolkata, Chennai, Bengaluru, and Hyderabad.

Each node provides live telemetry for:

- Temperature
- Humidity
- PM2.5
- PM10
- Rainfall
- Water Level
- Soil Moisture
- Smoke Level
- Vibration
- Battery
- AI Risk Estimate

RISK CLASSIFICATION

- Normal: Risk below 35%
- Warning: Risk between 35% and 59%
- High Risk: Risk between 60% and 79%
- Critical: Risk of 80% or higher
- Offline: No active telemetry

PROJECT STATUS

Prototype completed and verified.

The dashboard has been tested for:

- Dynamic KPI fluctuations
- Live sensor telemetry updates
- Interactive marker popups
- Map layer toggling
- SHOW ALL and HIDE ALL controls
- Navigation between all dashboard views
- Sensor inventory interactions

RUN LOCALLY

Start the local server using:

python -m http.server 8000

Then open the following address in a browser:

http://localhost:8000

FUTURE SCOPE

- Integration with real IoT sensor networks
- Live weather and satellite data
- Advanced machine-learning risk prediction
- Historical environmental trend analysis
- Automated emergency notifications
- Integration with government disaster-management systems
- Mobile application for field responders

PROJECT DETAILS

Project: ENVISION
Category: Environmental Intelligence / Climate Technology
Type: Hackathon Prototype
Status: Working Demonstration
Team Name : ResQTech

SHORT HACKATHON DESCRIPTION

ENVISION is a real-time environmental intelligence dashboard that unifies simulated sensor telemetry, interactive geospatial mapping, and AI-inspired risk estimation to monitor environmental hazards across India. The platform visualizes flood, fire, pollution, heat, landslide, and rainfall risks while providing live alerts and sensor-level insights through a control-room interface.

ONE-LINE PITCH

ENVISION turns environmental data into actionable intelligence.
