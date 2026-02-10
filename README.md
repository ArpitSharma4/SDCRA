# SDCRA: Space Debris Collision & Risk Analyser

> **A real-time, professional-grade visualization suite for monitoring orbital debris, assessing collision risks, and predicting reentry threats in Low Earth Orbit (LEO).**

![Project Status](https://img.shields.io/badge/Status-Active_Development-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Three.js_|_TypeScript-cyan?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge)

---

## Overview
**SDCRA** (Space Debris Collision & Risk Analyser) moves beyond simple satellite tracking. It is a **Planetary Defense Dashboard** designed to visualize the "Kessler Syndrome"—the cascading threat of orbital collisions.

It serves as a unified interface for tracking the **35,000+ objects** currently orbiting Earth, offering tools for collision assessment, reentry prediction, and global density analysis.

---

## Key Modules

### 1. Orbital Decay Monitor (Reentry Watch)
A tactical dashboard tracking satellites in **Very Low Earth Orbit (VLEO)** that are at risk of burning up in the atmosphere.
- **Features:**
  - Real-time altitude & velocity tracking.
  - **Atmospheric Drag Detection:** Flagging objects below 300km.
  - **Ground Track Map:** Visualizes the predicted path of falling objects over Earth.
  - **Status Logic:** Automatically categorizes threats as `STABLE`, `WARNING`, or `CRITICAL` based on orbital decay rates.

### 2. Kessler Lab (Collision Simulator)
An interactive 3D physics simulation demonstrating the catastrophic effects of an orbital collision.
- **Scenario:** Recreates the dynamics of the **2009 Iridium-33 vs. Cosmos-2251** collision.
- **Visuals:** Particle system simulating the debris cloud expansion (The Kessler Syndrome).
- **Educational Value:** Visually demonstrates why a single impact can render an entire orbit unusable.

### 3. Global Density Map (Heatmap)
A "Mission Control" style 2D visualization of global space traffic density.
- **Data Layers:**
  - **Debris/Rocket Bodies** (High Risk).
  - **Active Satellites** (Assets).
  - **Starlink Constellations** (Mega-constellations).
- **Performance:** Renders 10,000+ objects simultaneously using optimized canvas rendering.

### 4. Orbit Risk Analyser (3D)
A full 3D interactive globe for visualizing specific orbital paths and potential conjunctions.
- **Tech:** Uses SGP4 propagation (satellite.js) to predict real-time positions from TLE data.
- **Visuals:** Realistic Earth shader with atmosphere, day/night cycle, and starfield.

---

## Tech Stack & Engineering
* **Frontend:** React + Vite (TypeScript)
* **3D Engine:** Three.js / React Three Fiber (R3F)
* **Math/Physics:** `satellite.js` (SGP4 TLE propagation)
* **Styling:** Tailwind CSS (Glassmorphism & Industrial UI)
* **Data Source:** CelesTrak API (NORAD TLE Data)
* **Analytics:** Vercel Analytics (Privacy-focused telemetry)

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation
1.  Clone the repository:
    ```bash
    git clone [https://github.com/ArpitSharma4/SDCRA.git](https://github.com/ArpitSharma4/SDCRA.git)
    ```
2.  Install dependencies:
    ```bash
    cd SDCRA
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:8080` to view the Mission Control.

---

## Data Disclaimer
This tool uses public TLE data from CelesTrak. While accurate for general visualization, it should **not** be used for actual launch safety or collision avoidance decisions. Real-time accuracy depends on the freshness of the TLE data.

---

*Built by Arpit Sharma.*