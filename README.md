<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/">
    <img src="icons/icon128.png" alt="AMT Toolkit Logo" width="128" height="128">
  </a>
</p>

<h1 align="center">AMT Toolkit</h1>

<p align="center">
  <strong>The Ultimate Client-Side Airline Management Suite & Browser Extension for Airlines Manager: Tycoon</strong>
</p>

<p align="center">
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1"><img src="https://img.shields.io/badge/release-v1.0.1-06b6d4?logo=github&style=flat-square" alt="GitHub Release v1.0.1"></a>
  <a href="https://jaym3.github.io/AMT-Toolkit/"><img src="https://img.shields.io/badge/Live%20App-jaym3.github.io%2FAMT--Toolkit-0891b2?logo=googlechrome&logoColor=white&style=flat-square" alt="Live Web App"></a>
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1"><img src="https://img.shields.io/badge/Extension-Manifest%20V3-10b981?logo=googlechrome&logoColor=white&style=flat-square" alt="Chrome Extension MV3"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla)-blueviolet?style=flat-square" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/Airports-2%2C650-informational?style=flat-square" alt="2,650 Airports">
  <img src="https://img.shields.io/badge/Aircraft-102%20Models-informational?style=flat-square" alt="102 Aircraft Models">
</p>

<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/"><strong>Explore the Live Web App »</strong></a> •
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1"><strong>Download Extension (v1.0.1) »</strong></a>
  <br />
  <br />
  <a href="#-features--core-tools">Core Tools</a> •
  <a href="#-browser-extension--in-game-sidebar">Browser Extension</a> •
  <a href="#-mathematical-formulas">Formulas</a> •
  <a href="#-quick-start--installation">Quick Start</a> •
  <a href="#-extension-icons">Icons</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-license">License</a>
</p>

---

## ✈️ Overview

**AMT Toolkit** is an all-in-one, zero-dependency airline management suite built specifically for **Airlines Manager: Tycoon**. It combines route auditing, seat layout optimization, worldwide airport discovery, and 168-hour circuit scheduling into a high-performance, privacy-focused tool.

Whether you run a regional turboprop feeder or an expansive global A380 empire, AMT Toolkit eliminates manual spreadsheet calculations and maximizes ticket revenues and passenger satisfaction.

Available as both a **standalone web application** on GitHub Pages and a **Manifest V3 browser extension** with a docked in-game sidebar and native Chrome Side Panel.

---

## 🛠️ Features & Core Tools

### 1. 🎯 Zero-Out Price Calculator
Calculate the exact ticket price adjustments needed to capture 100% of unsatisfied passenger and cargo demand after an audit.
- **Audit-Accurate Elasticity**: Uses the authentic Airlines Manager demand curve formula ($P_{\text{target}} = P_{\text{audit}} \times (1 + \frac{R}{3 \times D_{\text{sim}}})$).
- **Multi-Class Support**: Optimizes Economy ($Y$), Business ($J$), First Class ($F$), and Cargo ($C$) independently.
- **Single & Multi-Route Fleet Auditing**: Process individual routes or batch-evaluate whole airline networks.
- **Instant Data Export & Presets**: Pre-loaded with demo circuits (e.g., JFK hub benchmark), CSV import/export, and one-click clipboard copying.
- **Compact Matrix Layout**: Dense micro-matrix tailored for sidebars and small screens.

---

### 2. 💺 Seat Configuration Optimizer
Determine the highest-revenue multi-class cabin layout for any aircraft and route demand profile.
- **Payload & Space Constraint Solver**: Respects aircraft category, maximum seats, cargo volume, and maximum takeoff payload limits.
- **Realistic Space Coefficients**: Enforces game ratios (Economy: 1 space, Business: 2 spaces, First: 4 spaces, Cargo: 1 space per 1,000 kg).
- **Comprehensive Aircraft Database**: Pre-loaded with **102 aircraft models** with specifications for speed, range, max seats, category, and catalog prices.
- **Multi-Route Circuit Aggregation**: Balances cabin distribution across up to 7+ routes simultaneously to prevent empty seats on weaker legs.
- **Dedicated Compact Workspace**: 4 micro-tabs: **Routes** (price/demand matrix & sequence controls), **Fleet** (configuration counters & expansion), **Schedule** (weekly timeline), and **Financials** (transposed revenue matrix).

---

### 3. 🌍 Global Route Finder
Explore and filter a catalog of **2,650 airports** worldwide with real-world geographical coordinates and in-game attributes.
- **Great-Circle Haversine Distance Engine**: Instantly computes nautical and metric distances from any chosen hub.
- **Runway Category Filtering**: Filter destinations by airport category (Cat 1 to 10) to match aircraft runway compatibility.
- **Duration & Turnaround Filters**: Query destinations that match specific flight durations (e.g. exactly 8h, 12h, or 24h turnarounds).
- **Demand Multipliers & Regional Filters**: Sort by passenger demand, continent, country, or category.
- **1-Click Circuit Bridge**: Push selected routes directly to the Seat Configurator or Circuit Finder.

---

### 4. 🔄 Circuit Finder (168-Hour Weekly Scheduler)
Construct optimal multi-route flight rotations totaling 168 hours (7-day cycles) or 24h / 48h / 72h cycles for maximum fleet utilization.
- **Combinatorial Pruning Solver**: Automatically generates valid flight combinations that minimize aircraft idle ground time.
- **Cabin Harmony Scoring**: Evaluates demand proportion consistency across legs to eliminate passenger bottlenecking.
- **Fleet Size Computation**: Calculates the required identical aircraft fleet (e.g., 7 aircraft staggered by 24h for a 168h circuit).
- **Leg Swap Modal**: Easily swap individual destinations with alternative airports having the exact same flight duration.
- **Include / Exclude Constraints**: Lock must-fly destinations or exclude congested hubs.
- **Compact Mode**: Dual autocomplete, KPI statusline strips, and frosted docked action bar.

---

## 🧩 Browser Extension & In-Game Sidebar

The **AMT Toolkit Browser Extension (v1.0.1)** integrates directly into [Airlines Manager: Tycoon](https://www.airlines-manager.com/), eliminating tab-switching and manual note-taking.

### Key Capabilities:
- **Docked In-Page Sidebar**: Injects a sleek, draggable, collapsible sidebar directly onto the Airlines Manager game page.
- **Native Chrome Side Panel**: Alternatively, open the toolkit in Chrome's native Side Panel (`chrome.sidePanel`) alongside your browser tabs.
- **Automated Compact Mode**: All 4 tools automatically adapt into micro-dense compact layouts optimized for 360px–440px widths.
  - **Zero-Out Compact**: High-density matrix view with quick-paste inputs and real-time delta badges.
  - **Seat Config Compact**: Tabbed workspace (Routes, Fleet, Schedule, Financials) fitting narrow sidebars without horizontal scrolling.
  - **Route Finder Compact**: Tabbed search, distance criteria, airport filters, and instant hub switching.
  - **Circuit Finder Compact**: Dual autocomplete (Hub + Aircraft), KPI metrics strip, rotation ribbons, and swap modals.
- **Cross-Tab Synchronization**: Real-time communication via `BroadcastChannel` and `chrome.storage.local`.
- **Zero In-Game Intrusiveness**: Lightweight CSS isolation ensures zero conflict with game styles.

---

## 📐 Mathematical Formulas

### 1. Zero-Out Ticket Price Formula
Airlines Manager models passenger demand elasticity linearly around the audit price. The target price required to clear remaining demand ($R$) is:

$$P_{\text{target}} = P_{\text{audit}} \times \left(1 + \frac{R}{3 \times D_{\text{sim}}}\right)$$

Where:
- $P_{\text{audit}}$: Internal audit ticket price
- $D_{\text{sim}}$: Total simulated passenger demand for the cabin class
- $R$: Unsatisfied remaining demand ($D_{\text{sim}} - \text{Offered Seats}$)
- $P_{\text{target}}$: Calculated target price to bring unsatisfied demand to exactly 0

---

### 2. Cabin Layout Space & Payload Limits
Aircraft interior capacity is bounded by both spatial volume and maximum payload weight:

$$\text{Space}_{\text{Total}} = S_{\text{Eco}} \times 1 + S_{\text{Bus}} \times 2 + S_{\text{First}} \times 4 + C_{\text{Cargo}} \times 1 \le \text{Aircraft Space Capacity}$$

$$\text{Weight}_{\text{Total}} = \left(S_{\text{Eco}} + S_{\text{Bus}} + S_{\text{First}}\right) \times 0.1\text{T} + C_{\text{Cargo}} \le \text{Max Payload (Tons)}$$

*Note: Each passenger is estimated at 100 kg (0.1 ton) including baggage, and 1 ton of cargo consumes 1 space unit.*

---

### 3. Flight Duration & Schedule Quantization
Flight times in Airlines Manager include cruising time plus a standard ground turnaround and taxiing buffer:

$$\text{Flight Time (One-Way Hours)} = \frac{\text{Distance (km)}}{\text{Cruising Speed (km/h)}} + 1.0\text{h}$$

$$\text{Round-Trip Duration} = 2 \times \text{Flight Time (One-Way)}$$

$$\text{Schedule Ticks (15-min Intervals)} = \frac{\lceil \text{Round-Trip Duration} \times 4 \rceil}{4}$$

A 168-hour circuit requires the sum of all round-trip leg durations to equal exactly 168.0 hours for zero aircraft downtime.

---

## ⚡ Quick Start & Installation

### Option 1: Live Web Application (Instant)
Access the full suite immediately with no installation required:
👉 **[https://jaym3.github.io/AMT-Toolkit/](https://jaym3.github.io/AMT-Toolkit/)**

---

### Option 2: Browser Extension (Chrome, Brave, Edge, Opera)

#### Method A: From GitHub Releases (Recommended)
1. Download the latest `amt-toolkit-v1.0.1.zip` from [**Releases**](https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1).
2. Unpack the ZIP archive to a folder on your computer.
3. Open your browser extension manager:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`
4. Toggle **Developer mode** on (top-right switch).
5. Click **Load unpacked** and select the unzipped directory (or the `extension/` folder).
6. Navigate to [Airlines Manager](https://www.airlines-manager.com/) to see the docked sidebar, or click the extension icon to launch the Chrome Side Panel!

#### Method B: From Cloned Source
```bash
git clone https://github.com/JayM3/AMT-Toolkit.git
```
Then load the `AMT-Toolkit/extension` folder as an unpacked extension.

---

### Option 3: Local Development Server
The application is 100% vanilla client-side code and requires no build step or node package installations.

```bash
# Python
python -m http.server 8000

# or Node.js
npx serve .
```
Then visit `http://localhost:8000` in your web browser.

---

## 🎨 Extension Icons

The extension assets in [`icons/`](icons/) and [`extension/icons/`](extension/icons/) provide high-clarity assets across standard display resolutions:

| Resolution | Preview | Usage |
| :---: | :---: | :--- |
| **16 × 16** | <img src="icons/icon16.png" alt="icon16" width="16" height="16"> | Browser action toolbar & favicon |
| **32 × 32** | <img src="icons/icon32.png" alt="icon32" width="32" height="32"> | High-DPI / Retina toolbar & Windows display |
| **48 × 48** | <img src="icons/icon48.png" alt="icon48" width="48" height="48"> | Extension management page (`chrome://extensions`) |
| **128 × 128** | <img src="icons/icon128.png" alt="icon128" width="64" height="64"> | Chrome Web Store showcase & main application icon |

---

## 📂 Project Structure

```
AMT-Toolkit/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Pages continuous deployment
├── css/                               # Application stylesheets
│   ├── circuit_finder_compact.css     # Circuit Finder compact mode styling
│   ├── homepage.css                   # Landing page components & carousel styles
│   ├── route_finder_compact.css       # Route Finder compact mode styling
│   ├── seat_config_compact.css        # Seat Configurator compact mode styling
│   ├── styles.css                     # Core dark theme & responsive foundation
│   └── zero_out_compact.css           # Zero-Out compact matrix styling
├── data/                              # Static databases
│   ├── aircraft.js                    # 102 aircraft models (specs, range, speed, seats)
│   ├── airports.js                    # 2,650 airport records (IATA, category, coords)
│   └── airports.json                  # Raw airport catalog dataset
├── extension/                         # Chrome Extension (Manifest V3)
│   ├── manifest.json                  # Manifest V3 configuration (v1.0.1)
│   ├── background.js                  # Service worker managing Side Panel API
│   ├── content.js                     # In-game docked sidebar injection script
│   ├── content.css                    # In-game sidebar styling & animations
│   ├── sidepanel.html                 # Native Chrome Side Panel iframe container
│   └── icons/                         # Extension toolbar & store icons
├── js/                                # Application logic & calculation engines
│   ├── app.js                         # Core routing, Zero-Out math & Seat Configurator
│   ├── circuit_finder.js              # 168h combinatorial circuit solver
│   ├── circuit_finder_compact.js      # Compact Circuit Finder controller & UI
│   ├── route_finder.js                # Haversine distance engine & airport search
│   └── seat_config_compact.js         # Compact Seat Config tab controllers
├── icons/                             # Web app favicons & visual icons
├── index.html                         # Primary single-page web application
├── LICENSE                            # MIT License
└── README.md                          # Documentation
```

---

## 🔒 Privacy & Architecture

- **100% Client-Side**: All calculations occur entirely in your local browser sandbox.
- **Zero Telemetry**: No third-party analytics, tracking pixels, or data collection.
- **Local Persistence**: Airline data and circuits are stored securely in `window.localStorage`.
- **Sync & Backup**: Integrated backup tool allows full JSON data export and import for seamless multi-device play.

---

## 🤝 Contributing

Contributions, feature requests, and airport/aircraft corrections are warmly welcomed!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feat/AmazingFeature`).
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`).
4. Push to the Branch (`git push origin feat/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<p align="center">
  Built with ❤️ for the <strong>Airlines Manager: Tycoon</strong> community.
  <br />
  <a href="https://jaym3.github.io/AMT-Toolkit/"><strong>Launch AMT Toolkit</strong></a> •
  <a href="https://github.com/JayM3/AMT-Toolkit/issues"><strong>Report a Bug</strong></a>
</p>
