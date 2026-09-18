# ✈️ AMT Toolkit — Airlines Manager Tycoon Toolkit

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-APACHE-blue.svg)](LICENSE)

A comprehensive, client-side web suite and companion desktop database editor tailored for players of **Airlines Manager: Tycoon**. The toolkit helps airline managers optimize ticket pricing to capture 100% of unsatisfied demand, configure multi-class aircraft cabin layouts, find profitable routes, and schedule 168-hour flight circuits without idle downtime.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [1. Zero-Out Price Calculator](#1-zero-out-price-calculator)
  - [2. Seat Configuration Optimizer](#2-seat-configuration-optimizer)
  - [3. Route Finder & Circuit Builder](#3-route-finder--circuit-builder)
  - [4. Desktop Database Editor](#4-desktop-database-editor)
- [Formulas & Game Mechanics](#-formulas--game-mechanics)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
  - [Running the Web Application](#running-the-web-application)
  - [Running the Database Editor](#running-the-database-editor)
  - [Building the Executable](#building-the-executable)
- [Data Customization](#-data-customization)
- [Tech Stack](#-tech-stack)
- [License](#-license)

---

## 🚀 Key Features

### 1. Zero-Out Price Calculator
*Eliminate remaining demand by calculating the exact higher ticket fares passengers are willing to pay.*

- **Multi-Class Support**: Independently calculates fares for **Economy (Y)**, **Business (J)**, **First Class (F)**, and optional **Cargo (C)**.
- **Real-Time Financial Projections**:
  - Target ticket price ($P_{\text{target}}$) rounded to whole game dollars.
  - Price delta ($\Delta P$) and percentage increase ($\Delta\%$).
  - Current turnover vs. target turnover and net revenue gain.
- **Route Presets**: One-click quick presets (e.g., `CDG ✈ JFK`, `LHR ✈ HND`) for testing.
- **Route Audits Library**: Save configured routes to local browser storage, edit parameters, copy fares, and import/export audit portfolios as JSON.

---

### 2. Seat Configuration Optimizer
*Maximize revenue and payload capacity on any route.*

- **Aircraft Library**: Built-in specifications for dozens of aircraft across short-haul, medium-haul, and long-haul categories.
- **Space & Weight Balancing**:
  - Automatically factors in seat space conversions ($1\text{ Business} = 2\text{ Economy}$, $1\text{ First} = 3\text{ or } 4\text{ Economy}$).
  - Enforces maximum payload weight limits ($0.1\text{ ton per passenger} + \text{cargo tons}$).
- **Visual Capacity Gauges**: Real-time progress bars indicating seat capacity and payload utilization, warning before exceeding aircraft limits.
- **Flight Frequency & Turnarounds**: Computes flight duration based on aircraft cruising speed and turnaround times, calculating daily and weekly flight frequencies.

---

### 3. Route Finder & Circuit Builder
*Discover profitable routes and build 168-hour weekly schedules.*

- **Global Airport Database**: Hundreds of airports spanning 211 countries, complete with IATA codes, categories (Cat 1–10), coordinates, taxes, and passenger demand indices.
- **Great-Circle Distance**: Accurate distance calculations using the Haversine formula.
- **Advanced Filtering**: Filter routes by hub airport, destination country, continent, category compatibility, distance radius, and demand criteria.
- **168h Circuit Planner**: Chain multiple routes together into 168-hour (7-day) or 24-hour schedules to ensure your aircraft operate with 100% schedule utilization.
- **Seamless Integration**: Directly push selected routes and aircraft into the Seat Configurator or Zero-Out Calculator.

---

### 4. Desktop Database Editor
*A companion desktop tool for managing your fleet and airport dataset.*

- **Python Tkinter GUI**: Standalone desktop app (`db_editor.py`) to easily view, search, add, edit, or remove aircraft and airport records.
- **Direct JS Integration**: Directly reads and modifies `data/aircraft.js` and `data/airports.js` while maintaining JSON structure and file headers.
- **Portable Binary**: Includes `build_editor.bat` to package the editor into a single-file executable (`AMT_Database_Editor.exe`) via PyInstaller.

---

## 🧮 Formulas & Game Mechanics

### Zero-Out Price Formula
In *Airlines Manager: Tycoon*, ticket price and demand follow a linear elasticity relationship. The target zero-out price ($P_{\text{target}}$) required to satisfy scheduled capacity ($C = D_{\text{sim}} - R$) is calculated as:

$$P_{\text{target}} = P_{\text{audit}} \times \left(1 + \frac{R}{3 \times D_{\text{sim}}}\right)$$

Equivalently:

$$P_{\text{target}} = P_{\text{audit}} + \frac{1}{3} P_{\text{audit}} \left(1 - \frac{C}{D_{\text{sim}}}\right)$$

Where:
- $D_{\text{sim}}$: Total simulated passenger demand from route audit.
- $R$: Remaining unsatisfied passenger demand on the route.
- $P_{\text{audit}}$: Recommended audit ticket fare.
- $C$: Actual scheduled flight capacity ($D_{\text{sim}} - R$).

### Flight Duration
$$\text{Flight Time} = \text{round}\left(\frac{\text{Distance (km)}}{\text{Cruising Speed (km/h)}}\right) \times 2 + \text{Turnaround Time}$$

---

## 📁 Project Structure

```
HTML/
│
├── index.html               # Main single-page web application interface
├── app.js                   # Application state, zero-out pricing & seat config engine
├── route_finder.js          # Route search, great-circle distance & circuit builder
├── styles.css               # Custom styling, dark mode accents & animations
│
├── data/
│   ├── aircraft.js          # Aircraft specifications database (JS module)
│   ├── airports.js          # Global airports dataset with IATA, coordinates, taxes
│   └── airports.json        # Raw JSON format of global airports data
│
├── Drafts/                  # UI prototypes, feature previews, and design drafts
│   ├── aircraft_picker_preview.html
│   ├── circuit_save_load_preview.html
│   ├── planning_tools_integrated_preview.html
│   ├── planning_tools_preview.html
│   └── route_finder_preview.html
│
├── db_editor.py             # Desktop GUI editor for aircraft & airport databases
├── build_editor.bat         # Batch script to compile db_editor.py with PyInstaller
├── .gitignore               # Git ignore rules for builds, caches, and system files
└── README.md                # Project documentation
```

---

## ⚡ Quick Start

### Running the Web Application
No build steps or package installations are required! The web app runs completely client-side.

1. **Direct Browser Launch**:
   - Double-click `index.html` or open it with any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

2. **Using a Local Development Server (Optional)**:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js npx
   npx serve .
   ```
   Then navigate to `http://localhost:8000` in your browser.

---

### Running the Database Editor
To customize aircraft models, costs, categories, or airport fees:

1. Ensure Python 3.8+ is installed.
2. Run the script directly:
   ```bash
   python db_editor.py
   ```

---

### Building the Executable
To package the Database Editor into a standalone `.exe`:

1. Install PyInstaller:
   ```bash
   pip install pyinstaller
   ```
2. Run the build script:
   ```cmd
   build_editor.bat
   ```
3. The standalone `AMT_Database_Editor.exe` will be generated in the root directory.

---

## 💾 Data Customization

### Aircraft Schema (`data/aircraft.js`)
```javascript
{
  "id": "a380-800",
  "name": "A380-800",
  "manufacturer": "Airbus",
  "type": "Long-Haul",
  "category": 8,
  "seats": 853,
  "payload_ton": 89.2,
  "range_km": 15556,
  "speed_kmh": 907,
  "price": 403900000,
  "fuel_consumption": "2.9",
  "wear_rate": "1.8",
  "rd_unlock": ""
}
```

### Airport Schema (`data/airports.js`)
```javascript
{
  "iata": "JFK",
  "name": "John F. Kennedy International Airport",
  "city": "New York",
  "country": "United States",
  "lat": 40.639801,
  "lon": -73.7789,
  "cat": 9,
  "flightTax": 45,
  "grossPrice": 350000000,
  "economy": 1.2,
  "business": 1.5,
  "first": 1.8,
  "cargo": 1.1
}
```

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, [Tailwind CSS](https://tailwindcss.com/) (v3 CDN), Vanilla JavaScript (ES6+).
- **Desktop Utility**: Python 3, Tkinter GUI library.
- **Packaging**: [PyInstaller](https://pyinstaller.org/).
- **Data Formats**: Native JavaScript Objects & JSON.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
