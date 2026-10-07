<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/">
    <img src="icons/icon128.png" alt="AMT Toolkit Logo" width="128" height="128">
  </a>
</p>

<h1 align="center">AMT Toolkit</h1>

<p align="center">
  <strong>Fast, client-side route planning and fleet optimization for Airlines Manager: Tycoon</strong>
</p>

<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/"><img src="https://img.shields.io/badge/Live%20App-jaym3.github.io%2FAMT--Toolkit-0891b2?logo=googlechrome&logoColor=white&style=flat-square" alt="Live Web App"></a>
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/latest"><img src="https://img.shields.io/badge/release-v1.0.1-06b6d4?logo=github&style=flat-square" alt="GitHub Release"></a>
  <a href="https://ko-fi.com/jaym3"><img src="https://img.shields.io/badge/Ko--fi-Support%20Project-F16061?logo=ko-fi&logoColor=white&style=flat-square" alt="Support on Ko-fi"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/"><strong>Launch Web App »</strong></a> •
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/latest"><strong>Download Extension »</strong></a> •
  <a href="https://ko-fi.com/jaym3"><strong>Support on Ko-fi ☕</strong></a>
</p>

---

## ✈️ Overview

**AMT Toolkit** is an all-in-one planning assistant built for **Airlines Manager: Tycoon**. It replaces tedious manual spreadsheets with fast client-side tools to audit routes, balance multi-class cabin layouts, search global airport pairs, and assemble 168-hour flight rotations.

Available as a **standalone web app** and as a **Chrome Extension (Manifest V3)** that docks directly beside your game.

---

## 🛠️ Features

### 1. 🎯 Zero-Out Price Calculator
Adjust ticket prices to capture 100% of remaining passenger and cargo demand after an audit.
- Uses authentic game elasticity curves ($P_{\text{target}} = P_{\text{audit}} \times (1 + \frac{R}{3 \times D_{\text{sim}}})$).
- Optimizes Economy, Business, First, and Cargo independently.
- Quick copy-paste workflows and CSV import/export.

### 2. 💺 Seat Configuration Optimizer
Determine the most profitable cabin configuration for any aircraft and route demand profile.
- Built-in database of **117 aircraft models** with speed, range, category, and pricing specs.
- Enforces passenger space units (1 / 1.8 / 4.2) and payload limits.
- Balances multi-route schedules to eliminate wasted empty seats.

### 3. 🌍 Global Route Finder
Search and filter **2,649 worldwide airports** with real coordinates and in-game categories.
- Instant great-circle distance and flight duration calculations.
- Filter by category (Cat 1–10), flight time (e.g. 8h, 12h, 24h), continent, or passenger demand.
- One-click transfer to Seat Configurator or Circuit Finder.

### 4. 🔄 Circuit Finder (168-Hour Weekly Scheduler)
Construct optimal multi-route rotations that maximize aircraft utilization.
- Targets 168h (7-day) cycles or custom durations (24h, 48h, 72h).
- Combinatorial solver minimizes ground idle time.
- Swap destinations with matching flight times in one click.

---

## 🧩 Browser Extension

The Chrome extension embeds AMT Toolkit right inside [Airlines Manager](https://www.airlines-manager.com/):
- **In-Game Sidebar**: Collapsible, resizable panel docked next to the game.
- **Native Chrome Side Panel**: Accessible anytime from your browser toolbar.
- **Compact UI**: High-density layouts designed to fit sidebars without horizontal scrolling.
- **Local Storage**: Your plans stay on your machine.

---

## ⚡ Quick Start

### 1. Live Web App (No install required)
Visit 👉 **[jaym3.github.io/AMT-Toolkit](https://jaym3.github.io/AMT-Toolkit/)**

### 2. Chrome Extension
1. Download `amt-toolkit-extension-v1.0.1.zip` from [Releases](https://github.com/JayM3/AMT-Toolkit/releases/latest).
2. Unzip to a local folder.
3. Open `chrome://extensions` and enable **Developer mode** (top right).
4. Click **Load unpacked** and select the extension folder containing `manifest.json`.

### 3. Run Locally
AMT Toolkit uses vanilla HTML, CSS, and JavaScript with no build steps:
```bash
git clone https://github.com/JayM3/AMT-Toolkit.git
cd AMT-Toolkit
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.

---

## ☕ Support the Project

If AMT Toolkit saves you time or boosts your airline's profits, consider buying me a coffee to support continued development and updates!

<p align="center">
  <a href="https://ko-fi.com/jaym3">
    <img src="https://storage.ko-fi.com/cdn/brandasset/kofi_button_stroke.png" alt="Support me on Ko-fi" height="42">
  </a>
</p>

<p align="center">
  👉 <strong><a href="https://ko-fi.com/jaym3">Support JayM3 on Ko-fi</a></strong>
</p>

---

## 🤝 Contributing

Contributions, bug reports, and database additions (airports/aircraft) are welcome!
1. Fork the repository.
2. Create your branch (`git checkout -b feat/my-feature`).
3. Commit changes (`git commit -m 'feat: add my feature'`).
4. Push to branch (`git push origin feat/my-feature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
