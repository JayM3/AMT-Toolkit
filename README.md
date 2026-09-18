# ✈️ AMT Toolkit — Airlines Manager Tycoon Toolkit

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

A high-performance, client-side web application suite tailored for players of **Airlines Manager: Tycoon**. The toolkit helps airline managers optimize ticket pricing to capture 100% of unsatisfied demand, configure multi-class aircraft cabin layouts, find profitable routes, and schedule 168-hour flight circuits without idle downtime.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
  - [1. Zero-Out Price Calculator](#1-zero-out-price-calculator)
  - [2. Seat Configuration Optimizer](#2-seat-configuration-optimizer)
  - [3. Route Finder & Route Catalog](#3-route-finder--route-catalog)
  - [4. Automated Circuit Finder](#4-automated-circuit-finder)
- [Formulas & Game Mechanics](#-formulas--game-mechanics)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
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

### 3. Route Finder & Route Catalog
*Explore profitable routes and browse global airport intelligence.*

- **Global Airport Database**: 2,650 airports spanning 211 countries, complete with IATA codes, categories (Cat 1–10), coordinates, taxes, and passenger demand indices.
- **Great-Circle Distance**: Accurate distance calculations using the Haversine formula.
- **Advanced Filtering**: Filter routes by hub airport, destination country, continent, category compatibility, distance radius, and demand criteria.
- **Seamless Integration**: Directly push selected routes and aircraft into the Seat Configurator or Zero-Out Calculator.

---

### 4. Automated Circuit Finder
*Discover optimal 168-hour schedules, multi-day rotations, and balanced class circuits in milliseconds.*

- **Ultra-Fast Combinatorial Solver**: Evaluates thousands of destination combinations in < 15ms to assemble complete circuits matching target cycle lengths (168h weekly, 24h daily, 48h, 72h, etc.) with customizable slack tolerance (exact 0h, ≤2h, ≤4h, ≤8h).
- **Class Multiplier Interpretation**: Built-in ratio strategies interpret raw airport database multipliers:
  - **Balanced Tri-Class (60/25/15)**: Default strategy balancing Economy, Business, and First Class.
  - **100% Economy Focus**: Maximizes volume for high-density economy operations.
  - **Premium Luxury (25/45/30)**: Prioritizes lucrative premium cabin demand.
  - **Cargo Hybrid (40/20/10/30)**: Balances passenger demand with heavy freight capability.
  - **Interactive Custom Sliders**: Fine-tune custom class weights and leg duration bounds.
- **Empirical Star Quality Rating**: Ranks destination airports and circuit quality using $(Y + J + F) / 3$:
  - `★★★★★` (5 Stars): Global Mega-Hubs ($AVG \ge 30$, top 99 airports worldwide)
  - `★★★★` (4 Stars): Major International ($AVG \ge 22$, top 200 airports)
  - `★★★` (3 Stars): Strong Regional ($AVG \ge 15$, top 400 airports)
  - `★★` (2 Stars): Moderate Commercial ($AVG \ge 8$, top 1,000 airports)
  - `★` (1 Star): Light / Remote ($AVG < 8$)
- **Aircraft Route Type Overrides**: Force any aircraft model (e.g. long-haul A380-800 or 747-400) to search specific route types:
  - `Mix`: Any compatible flight duration.
  - `Short-Haul`: Forces legs $\le 8.0\text{h}$ round-trip.
  - `Medium-Haul`: Forces legs between $8.0\text{h}$ and $16.0\text{h}$.
  - `Long-Haul`: Forces legs $\ge 16.0\text{h}$.
- **Airline Network & Owned Hubs Drawer**: Expandable dropdown managing your owned hubs, featuring one-click hub switching, multi-hub empire search, and the ability to exclude owned hubs from destination pools.
- **Precision Routing (Include / Exclude Chips)**: Specify must-fly destinations and exclude specific airports with live chip management and error validation.
- **1-Click Bridge to Seat Configurator**: Instantly transfer any discovered circuit into the Seat Configurator to simulate cabin demand, seating layouts, and financial returns.
- **Interactive Route Swap Modal**: Swap any individual leg with alternative airports of matching flight time to maintain schedule harmony.
- **Shared Circuit Library**: Integrated with `am_saved_circuits_v1` so circuits saved in Circuit Finder are immediately accessible across Seat Config and Route Finder.

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
$$\text{Flight Time (Hours)} = \text{round}\left(\frac{\text{Distance (km)}}{\text{Cruising Speed (km/h)}}\right) \times 2$$

### Circuit Optimization Formulas

#### 1. Empirical Airport Star Demand Average
$$AVG = \frac{\text{Economy} + \text{Business} + \text{First}}{3}$$

Thresholds calibrated against global database distribution:
- **5 Stars**: $AVG \ge 30$ (Global Mega-Hubs)
- **4 Stars**: $AVG \ge 22$ (Major International)
- **3 Stars**: $AVG \ge 15$ (Strong Regional)
- **2 Stars**: $AVG \ge 8$ (Moderate Commercial)
- **1 Star**: $AVG < 8$ (Light / Remote)

#### 2. Weighted Class Multiplier Score
$$\text{Score} = (Y \times W_Y) + (2 \times J \times W_J) + (3 \times F \times W_F)$$
Where $W_Y, W_J, W_F$ are the strategy weights (e.g., $0.60, 0.25, 0.15$ for Balanced Tri-Class).

#### 3. Schedule Rotation & Weekly Distance
$$\text{Total Duration} = \sum_{i=1}^{N} \text{Dur}_i \quad (\le T_{\text{target}} - \text{Slack})$$
$$\text{Weekly Distance (km)} = \sum_{i=1}^{N} (\text{Distance}_i \times 2)$$

---

## 📁 Project Structure

```
AMT-Toolkit/
│
├── index.html          # Main single-page web application interface
├── app.js              # Pricing calculations, seat configuration & state engine
├── route_finder.js     # Airport database search, distance math & route catalog
├── circuit_finder.js   # Combinatorial solver, multi-hub optimizer & circuit engine
├── styles.css          # Custom styling, dark mode theme & animations
│
├── data/
│   ├── aircraft.js     # Aircraft specifications database (102 models)
│   └── airports.js     # Global airports dataset with IATA, coordinates & taxes (2,650 airports)
│
├── Drafts/             # Interactive prototypes & preview sandboxes
├── .gitignore          # Git ignore configuration
├── LICENSE             # Apache 2.0 License
└── README.md           # Project documentation
```

---

## ⚡ Quick Start

No build tools, compilers, or server installations are required! The web application runs completely client-side.

1. **Direct Browser Launch**:
   - Double-click `index.html` or open it with any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

2. **Using a Local Static Server (Optional)**:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js npx
   npx serve .
   ```
   Then navigate to `http://localhost:8000` in your browser.

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
- **Data Formats**: Native JavaScript Objects & Arrays.

---

## 📄 License

This project is open source and available under the [Apache License 2.0](LICENSE).
