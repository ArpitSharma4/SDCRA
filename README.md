# SDCRA: Space Debris Collision & Risk Analyser

> **A professional-grade orbital surveillance suite designed to monitor space traffic, predict reentry threats, and visualize the growing risk of the Kessler Syndrome.**

![Project Status](https://img.shields.io/badge/Status-Active_Development-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Three.js_|_TypeScript-cyan?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge)

---

## Overview
**SDCRA** is a planetary defense dashboard that transforms raw orbital data into actionable intelligence. Unlike standard trackers, it focuses on **risk assessment**—monitoring orbital decay in VLEO (Very Low Earth Orbit), visualizing global debris density, and predicting local overpasses.

The interface is built with a "Classified System" aesthetic, prioritizing data density and telemetry over gamified visuals.

---

## Active Subsystems

### 1. Orbital Decay Monitor (Reentry Watch)
A tactical dashboard for tracking satellites at risk of atmospheric reentry.
- **VLEO Monitoring:** Filters for objects with high Mean Motion (>15.5 revs/day) and low altitude (<300km).
- **Drag Analysis:** Real-time flagging of "High Drag" corridors where orbital lifetime is critical.
- **Ground Track:** Visualizes the predicted reentry path over the Earth's surface to assess ground safety.
- **Status Logic:** Automatically categorizes threats:
  - **STABLE:** > 300 km
  - **WARNING:** 180 km - 300 km (High Drag)
  - **CRITICAL:** < 180 km (Reentry Imminent)

### 2. Sky Watch (Local Tracking)
A real-time topocentric radar that answers: *"What is flying over my location right now?"*
- **Radar Display:** A polar plot visualization showing Azimuth and Elevation of objects relative to the user's GPS position.
- **Pass Predictions:** Calculates upcoming flyovers for major assets (ISS, Hubble, Starlink) with precise countdowns and visibility ratings.
- **Visual Filters:** Toggle between Active Satellites, Debris, and Constellations to reduce signal noise.

### 3. Global Density Heatmap
A strategic "Situation Room" map visualizing the distribution of orbital traffic.
- **Data Layers:** Color-coded visualization distinguishing between debris fields (Red), active payloads (Blue), and mega-constellations (Starlink).
- **Night Side Visualization:** Uses a dark-mode projection to highlight illumination states and orbital density clusters.

### 4. Orbit Risk Core
The central physics engine driving the SDCRA platform.
- **SGP4 Propagation:** Performs real-time math in the browser to predict satellite positions from NORAD TLE data.
- **Collision Risk Assessment:** Models potential conjunctions and orbital intersections.

---

## Tech Stack
* **Frontend:** React 18 + Vite
* **Language:** TypeScript
* **Visualization:** Three.js / React Three Fiber / HTML5 Canvas
* **Math:** `satellite.js` (SGP4 implementation)
* **Styling:** Tailwind CSS (Custom "Industrial" Theme)
* **Data Source:** CelesTrak (Space-Track.org mirror)

---

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/ArpitSharma4/SDCRA.git](https://github.com/ArpitSharma4/SDCRA.git)
    cd SDCRA
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## Disclaimer
This tool is for educational and visualization purposes. While it uses real-world TLE data, it is not certified for launch safety operations or official collision avoidance maneuvers.

---

*System Status: ONLINE // SDCRA Project*