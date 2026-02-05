# 🛰️ SDCRA: Space Debris Collision & Risk Analyser

> **A real-time, 3D/2D visualization suite for monitoring orbital debris and assessing collision risks in Low Earth Orbit (LEO).**

![Project Status](https://img.shields.io/badge/Status-Under_Development-amber?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_Three.js_|_TypeScript-cyan?style=for-the-badge)

---

## 🚧 Project Status: Active Development
**This project is currently in Alpha.**
Core visualization engines (3D & 2D) and the SGP4 propagation logic are functional, but UI refinements, mobile optimization, and constellation tracking features are still being implemented.
*Expect occasional breaking changes or API rate limits (CelesTrak).*

---

## 🌍 Overview
**SDCRA** (Space Debris Collision & Risk Analyser) is designed to visualize the "Kessler Syndrome" — the growing threat of orbital debris cascading into a collision chain reaction. It moves beyond simple tracking lists, offering a **"Planetary MRI"** of space traffic.

### 🎮 Key Modules (Implemented)

#### 1. 🔭 The Command Terminal (Home)
A cinematic, data-driven entry point featuring a typewriter-style briefing on the state of orbital overcrowding.
- **Aesthetic:** NASA/Sci-Fi Terminal with Monospace typography.
- **Visuals:** Real-time rotating Earth asset with atmospheric shaders.

#### 2. 💥 Orbit Risk Analyser (3D)
An interactive 3D simulation to visualize specific collision scenarios between two objects.
- **Features:** - Real-time SGP4 Propagation (predicting satellite positions).
    - **"Tactical HUD"** Overlay: Displays Altitude, Velocity, and Target tracking.
    - **Offline Mode:** Fallback to local datasets when API limits are reached.
    - **Visuals:** Custom starfield, accurate day/night cycle, and color-coded orbit paths.

#### 3. 🌡️ Global Density Map (Heatmap)
A "Mission Control" style 2D visualization of global debris density.
- **View:** Mercator Projection "Wall Map".
- **Data Layers:** - 🔴 **Debris/Rocket Bodies** (The Danger Zones).
    - 🔵 **Active Satellites** (Assets).
    - 💠 **Starlink Constellations** (Mega-constellations).
- **Tech:** High-performance HTML5 Canvas rendering (10,000+ objects at 60 FPS).

---

## 🛠️ Tech Stack
* **Frontend Framework:** React + Vite
* **Language:** TypeScript
* **3D Engine:** Three.js / React Three Fiber (R3F)
* **Styling:** Tailwind CSS (Glassmorphism & Neon UI)
* **Math/Physics:** `satellite.js` (SGP4 TLE propagation)
* **Data Source:** CelesTrak API

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn

### Installation
1.  Clone the repo:
    ```bash
    git clone [https://github.com/ArpitSharma4/SDCRA.git](https://github.com/ArpitSharma4/SDCRA.git)
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` (or your local port) to view the Mission Control.

---

## 📅 Roadmap / Upcoming Features
- [ ] **Constellation Tracker:** Dedicated view for Starlink/OneWeb trains.
- [ ] **Collision Probability:** Mathematical risk assessment (Pc) calculator.
- [ ] **Mobile Optimization:** Responsive layout for tablets/phones.
- [ ] **Historical Data:** "Time Machine" slider to view debris growth (1957-2025).

---

## ⚠️ API Note
This application relies on **CelesTrak** for TLE data. If you see an "Offline Mode" badge, it means the IP rate limit was reached. The app will automatically switch to cached sample data to ensure the visualization never breaks.

---

*Built with 💻 and ☕ by Arpit Sharma.*
