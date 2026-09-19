<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/">
    <img src="icons/icon128.png" alt="AMT Toolkit Logo" width="128" height="128">
  </a>
</p>

<h1 align="center">AMT Toolkit</h1>

<p align="center">
  A client-side web toolkit and browser extension for <strong>Airlines Manager: Tycoon</strong>.
</p>

<p align="center">
  <a href="https://jaym3.github.io/AMT-Toolkit/"><strong>Explore the Live Web App »</strong></a>
  <br />
  <br />
  <a href="#-tools">Tools</a> •
  <a href="#-formulas">Formulas</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-extension-icons">Icons</a> •
  <a href="#-project-structure">Project Structure</a>
</p>

---

## 🛠️ Tools

- **Zero-Out Price Calculator**: Calculates the exact ticket prices needed to capture 100% of remaining passenger and cargo demand after an audit.
- **Seat Configuration Optimizer**: Configures multi-class cabin layouts (Economy, Business, First, Cargo) to maximize revenue within aircraft space and payload limits.
- **Route Finder**: Searches and filters a database of 2,650 airports by runway category, distance, and demand multipliers.
- **Circuit Finder**: Assembles 168-hour weekly schedules (or 24h / 48h / 72h cycles) for selected aircraft and hubs with customizable class focus.

---

## 📐 Formulas

### Zero-Out Price
$$P_{\text{target}} = P_{\text{audit}} \times \left(1 + \frac{R}{3 \times D_{\text{sim}}}\right)$$

- $P_{\text{audit}}$: Audit ticket price
- $D_{\text{sim}}$: Total simulated passenger demand
- $R$: Remaining unsatisfied demand
- $P_{\text{target}}$: Target ticket price to zero out remaining demand

### Flight Duration
$$\text{Flight Time (Hours)} = \text{round}\left(\frac{\text{Distance (km)}}{\text{Cruising Speed (km/h)}}\right) \times 2$$

---

## ⚡ Quick Start

The app runs entirely in the browser with no build step or dependencies.

- **Online**: Visit [https://jaym3.github.io/AMT-Toolkit/](https://jaym3.github.io/AMT-Toolkit/)
- **Chrome / Brave Extension**:
  1. Open `chrome://extensions` (or `brave://extensions`) in your browser.
  2. Toggle **Developer mode** on (top-right corner).
  3. Click **Load unpacked** and select this directory (`AMT-Toolkit`).
  4. Visit [Airlines Manager](https://www.airlines-manager.com/) to see the docked sidebar, or click the extension icon (<img src="icons/icon16.png" alt="AMT Icon" width="16" height="16" style="vertical-align: middle;">) to open the native side panel!

Optional local server:
```bash
python -m http.server 8000
# or
npx serve .
```

---

## 🎨 Extension Icons

The extension assets in [`icons/`](icons/) provide icons across multiple display resolutions:

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
├── manifest.json       # Chrome extension manifest (MV3)
├── background.js       # Extension service worker (Side Panel API)
├── content.js          # In-page docked sidebar script for Airlines Manager
├── content.css         # Docked sidebar styling and animations
├── sidepanel.html      # Native Chrome Side Panel page
├── icons/              # Extension icons
│   ├── icon16.png      # 16×16 toolbar icon
│   ├── icon32.png      # 32×32 high-DPI icon
│   ├── icon48.png      # 48×48 extension management icon
│   └── icon128.png     # 128×128 main logo & Web Store icon
├── index.html          # Main single-page application
├── app.js              # Pricing and seat configuration logic
├── route_finder.js     # Airport search and route catalog
├── circuit_finder.js   # Circuit solver and scheduler
├── styles.css          # Core styles and theme
├── homepage.css        # Homepage styles
├── data/
│   ├── aircraft.js     # Aircraft specifications (102 models)
│   └── airports.js     # Airport database (2,650 airports)
└── LICENSE             # MIT License
```

---

## 📄 License

[MIT](LICENSE)
