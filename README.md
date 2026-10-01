<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/">
    <img src="icons/icon128.png" alt="AMT Toolkit Logo" width="128" height="128">
  </a>
</p>

<h1 align="center">AMT Toolkit</h1>

<p align="center">
  <strong>Client-Side Planning Tools & Browser Extension for Airlines Manager: Tycoon</strong>
</p>

<p align="center">
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1"><img src="https://img.shields.io/badge/release-v1.0.1-06b6d4?logo=github&style=flat-square" alt="GitHub Release v1.0.1"></a>
  <a href="https://jaym3.github.io/AMT-Toolkit/"><img src="https://img.shields.io/badge/Live%20App-jaym3.github.io%2FAMT--Toolkit-0891b2?logo=googlechrome&logoColor=white&style=flat-square" alt="Live Web App"></a>
  <a href="https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1"><img src="https://img.shields.io/badge/Extension-Manifest%20V3-10b981?logo=googlechrome&logoColor=white&style=flat-square" alt="Chrome Extension MV3"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/Build%20Step-None-blueviolet?style=flat-square" alt="No Build Step">
  <img src="https://img.shields.io/badge/Airports-2%2C649-informational?style=flat-square" alt="2,649 Airports">
  <img src="https://img.shields.io/badge/Aircraft-117%20Models-informational?style=flat-square" alt="117 Aircraft Models">
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
  <a href="#-validation--troubleshooting">Troubleshooting</a> •
  <a href="#-license">License</a>
</p>

---

## ✈️ Overview

**AMT Toolkit** is a client-side airline planning toolkit built specifically for **Airlines Manager: Tycoon**. It combines route auditing, seat layout optimization, worldwide airport discovery, and 168-hour circuit scheduling into a high-performance, privacy-focused tool.

Use it to compare routes, estimate ticket revenue, plan cabin layouts, and build rotations without maintaining a separate spreadsheet. Results depend on the audit data and assumptions you enter; verify plans against the game before purchasing aircraft or routes.

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
- **Cabin & Payload Constraints**: Uses 1 / 1.8 / 4.2 space units and 100 / 125 / 150 kg per Economy / Business / First passenger. Cargo uses the remaining payload, in whole tons.
- **Comprehensive Aircraft Database**: Pre-loaded with **117 aircraft models** with specifications for speed, range, max seats, category, and catalog prices.
- **Multi-Route Circuit Aggregation**: Balances cabin distribution across up to 7+ routes simultaneously to prevent empty seats on weaker legs.
- **Dedicated Compact Workspace**: 4 micro-tabs: **Routes** (price/demand matrix & sequence controls), **Fleet** (configuration counters & expansion), **Schedule** (weekly timeline), and **Financials** (transposed revenue matrix).

---

### 3. 🌍 Global Route Finder
Explore and filter a catalog of **2,649 airports** worldwide with real-world geographical coordinates and in-game attributes.
- **Great-Circle Haversine Distance Engine**: Computes distances in kilometers from the selected hub.
- **Runway Category Filtering**: Filter destinations by airport category (Cat 1 to 10) to match aircraft runway compatibility.
- **Duration & Turnaround Filters**: Query destinations that match specific flight durations (e.g. exactly 8h, 12h, or 24h turnarounds).
- **Demand Multipliers & Regional Filters**: Sort by passenger demand, continent, country, or category.
- **1-Click Circuit Bridge**: Push selected routes directly to the Seat Configurator or Circuit Finder.

---

### 4. 🔄 Circuit Finder (168-Hour Weekly Scheduler)
Search for multi-route rotations targeting 168 hours (7-day cycles) or shorter cycles such as 24h / 48h / 72h, with configurable slack for unused time.
- **Combinatorial Pruning Solver**: Automatically generates valid flight combinations that minimize aircraft idle ground time.
- **Cabin Harmony Scoring**: Evaluates demand proportion consistency across legs to eliminate passenger bottlenecking.
- **Fleet Size Computation**: Calculates the required identical aircraft fleet (e.g., 7 aircraft staggered by 24h for a 168h circuit).
- **Leg Swap Modal**: Easily swap individual destinations with alternative airports having the exact same flight duration.
- **Include / Exclude Constraints**: Lock must-fly destinations or exclude congested hubs.
- **Compact Mode**: Dual autocomplete, KPI statusline strips, and frosted docked action bar.

---

## 🧩 Browser Extension & In-Game Sidebar

The **AMT Toolkit Browser Extension (v1.0.1)** integrates directly into [Airlines Manager: Tycoon](https://www.airlines-manager.com/), placing the toolkit alongside the game. The extension embeds the hosted web app; it does not bundle the calculation tools or automatically import game audit data.

### Key Capabilities:
- **Docked In-Page Sidebar**: Injects a resizable, collapsible sidebar directly onto the Airlines Manager game page.
- **Native Chrome Side Panel**: Alternatively, open the toolkit in Chrome's native Side Panel (`chrome.sidePanel`) alongside your browser tabs.
- **Compact / Standard Views**: All four tools have compact layouts for narrow panels. The in-page sidebar starts at 460px and can be resized down to 340px.
  - **Zero-Out Compact**: High-density matrix view with quick-paste inputs and real-time delta badges.
  - **Seat Config Compact**: Tabbed workspace (Routes, Fleet, Schedule, Financials) fitting narrow sidebars without horizontal scrolling.
  - **Route Finder Compact**: Tabbed search, distance criteria, airport filters, and instant hub switching.
  - **Circuit Finder Compact**: Dual autocomplete (Hub + Aircraft), KPI metrics strip, rotation ribbons, and swap modals.
- **Local Persistence**: The app stores data in `localStorage` and listens for storage changes for saved circuits. Sharing between tabs depends on the browser using the same origin and storage partition; use JSON backup/import when data is not shared.
- **Separate Workspace**: Calculations run in an iframe; the content script adds sidebar controls and adjusts the game layout.

The manifest requests `sidePanel` and `storage`, plus access to HTTP/HTTPS pages on `*.airlines-manager.com`. Native Side Panel support varies across Chromium browsers; Chrome is the primary target. Firefox is not supported by this manifest.

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
The current seat solver in `js/app.js` applies separate passenger-space and payload constraints:

$$S_{\text{Eco}} + 1.8 S_{\text{Bus}} + 4.2 S_{\text{First}} \le \text{Aircraft Space Capacity}$$

$$0.100 S_{\text{Eco}} + 0.125 S_{\text{Bus}} + 0.150 S_{\text{First}} + C_{\text{Cargo}} \le \text{Max Payload (Tons)}$$

*Cargo is measured in tons and allocated from remaining payload; it does not consume passenger-space units in this solver. These are implementation assumptions, not a guarantee of in-game profitability.*

---

### 3. Flight Duration & Schedule Quantization
The toolkit estimates flight times using cruising time plus a one-hour buffer per direction:

$$\text{Flight Time (One-Way Hours)} = \frac{\text{Distance (km)}}{\text{Cruising Speed (km/h)}} + 1.0\text{h}$$

$$\text{Round-Trip Duration} = 2 \times \text{Flight Time (One-Way)}$$

$$\text{Rounded Round-Trip Hours} = \frac{\lceil \text{Round-Trip Duration} \times 4 \rceil}{4}$$

An exact 168-hour circuit sums to 168.0 hours after rounding each round trip up to the next 15-minute interval. The Circuit Finder can also allow slack, leaving some time unused.

---

## ⚡ Quick Start & Installation

### Option 1: Live Web Application (Instant)
Access the full suite immediately with no installation required:
👉 **[https://jaym3.github.io/AMT-Toolkit/](https://jaym3.github.io/AMT-Toolkit/)**

---

### Option 2: Browser Extension (Chrome / Compatible Chromium Browsers)

#### Method A: From GitHub Releases (Recommended)
1. Download the extension ZIP for v1.0.1 from [**Releases**](https://github.com/JayM3/AMT-Toolkit/releases/tag/v1.0.1).
2. Unpack the ZIP archive to a folder on your computer.
3. Open your browser extension manager:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`
4. Toggle **Developer mode** on (top-right switch).
5. Click **Load unpacked** and select the directory containing `manifest.json` (usually the `extension/` folder if the archive contains the full project). Keep this folder in place after installation.
6. Navigate to [Airlines Manager](https://www.airlines-manager.com/) to see the docked sidebar, or click the extension icon to launch the Chrome Side Panel!

#### Method B: From Cloned Source
```bash
git clone https://github.com/JayM3/AMT-Toolkit.git
```
Then load the `AMT-Toolkit/extension` folder as an unpacked extension.

---

### Option 3: Local Development Server
The application uses HTML, CSS, and vanilla JavaScript with no build step. It loads Tailwind CSS from a CDN at runtime. Serve the repository root over HTTP rather than opening `index.html` via `file://`.

```bash
git clone https://github.com/JayM3/AMT-Toolkit.git
cd AMT-Toolkit

# Python 3
python -m http.server 8000

# Alternative: Node.js (npx may download the serve package)
# npx serve . -l 8000
```
Then visit `http://localhost:8000` in your web browser. Stop the server with **Ctrl+C**.

For a compact-layout preview, visit `http://localhost:8000/?sidebar=true`. Loading the extension from source still points its panels to GitHub Pages, not your local server. To test local changes inside the extension, change the hosted URLs in `extension/content.js` and `extension/sidepanel.html` to `http://localhost:8000/` (preserving `?sidebar=true`), then reload the extension and game page. The manifest already permits localhost frames.

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
│   ├── aircraft.js                    # 117 aircraft models (specs, range, speed, seats)
│   └── airports.js                    # 2,649 airport records (IATA, category, coords)
├── extension/                         # Chrome Extension (Manifest V3)
│   ├── manifest.json                  # Manifest V3 configuration (v1.0.1)
│   ├── background.js                  # Service worker managing Side Panel API
│   ├── content.js                     # In-game docked sidebar injection script
│   ├── content.css                    # In-game sidebar styling & animations
│   ├── sidepanel.html                 # Native Chrome Side Panel iframe container
│   └── icons/                         # Extension toolbar & store icons
├── js/                                # Application logic & calculation engines
│   ├── app.js                         # Core routing, Zero-Out math & Seat Configurator
│   ├── changelog.js                   # GitHub commit feed with cached/fallback entries
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

- **Client-Side Calculations**: Calculation logic and the airport/aircraft datasets run in the browser; no application backend is required.
- **Network Requests**: The app loads Tailwind from `cdn.tailwindcss.com` and requests recent commits from the GitHub API for the changelog, with cached/fallback entries. The extension loads the app from GitHub Pages. Do not assume full offline operation.
- **Local Storage**: Saved audits, circuits, and preferences use `window.localStorage`. This is browser-local storage, not an encrypted vault or cloud account. Clearing site data can remove saved work.
- **Backup & Transfer**: Export a full JSON backup before clearing browser data or changing browsers/devices. Import the backup in the destination app; there is no automatic cross-device sync. Embedded and standalone views may have separate storage due to browser privacy settings.

---

## 🧪 Validation & Troubleshooting

There is no automated test suite or package-based build configured in this repository. For changes, run the local server and manually check:

- All four tools in standard and compact views, including route transfers between tools.
- Price calculations, cabin payload limits, and circuit duration/slack with known inputs.
- Saving and restoring circuits, JSON backup/import, and browser-console errors.
- Both extension views on the game page after reloading the unpacked extension.

If **Load unpacked** fails, select the folder containing `manifest.json`, not the ZIP or repository root. If the native Side Panel is unavailable, try current Chrome. If a panel is blank or unstyled, check access to GitHub Pages and the Tailwind CDN and inspect the browser console. If saved data appears missing between views, check the origin/storage context and transfer a JSON backup rather than assuming it was deleted.

GitHub Pages deploys on pushes to `main` or manual workflow runs via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow uploads the static repository and injects the commit SHA into JavaScript query strings for cache busting; no compilation is performed.

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
