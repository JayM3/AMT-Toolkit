# ✈️ AMT Toolkit

A client-side web toolkit for **Airlines Manager: Tycoon**.

🔗 **Live App**: [https://jaym3.github.io/AMT-Toolkit/](https://jaym3.github.io/AMT-Toolkit/)

---

## Tools

- **Zero-Out Price Calculator**: Calculates the exact ticket prices needed to capture 100% of remaining passenger and cargo demand after an audit.
- **Seat Configuration Optimizer**: Configures multi-class cabin layouts (Economy, Business, First, Cargo) to maximize revenue within aircraft space and payload limits.
- **Route Finder**: Searches and filters a database of 2,650 airports by runway category, distance, and demand multipliers.
- **Circuit Finder**: Assembles 168-hour weekly schedules (or 24h / 48h / 72h cycles) for selected aircraft and hubs with customizable class focus.

---

## Formulas

### Zero-Out Price
$$P_{\text{target}} = P_{\text{audit}} \times \left(1 + \frac{R}{3 \times D_{\text{sim}}}\right)$$

- $P_{\text{audit}}$: Audit ticket price
- $D_{\text{sim}}$: Total simulated passenger demand
- $R$: Remaining unsatisfied demand
- $P_{\text{target}}$: Target ticket price to zero out remaining demand

### Flight Duration
$$\text{Flight Time (Hours)} = \text{round}\left(\frac{\text{Distance (km)}}{\text{Cruising Speed (km/h)}}\right) \times 2$$

---

## Quick Start

The app runs entirely in the browser with no build step or dependencies.

- **Online**: Visit [https://jaym3.github.io/AMT-Toolkit/](https://jaym3.github.io/AMT-Toolkit/)
- **Chrome / Brave Extension**:
  1. Open `chrome://extensions` (or `brave://extensions`) in your browser.
  2. Toggle **Developer mode** on (top-right corner).
  3. Click **Load unpacked** and select this directory (`AMT-Toolkit`).
  4. Visit [Airlines Manager](https://www.airlines-manager.com/) to see the docked sidebar, or click the extension icon to open the native side panel!

Optional local server:
```bash
python -m http.server 8000
# or
npx serve .
```

---

## Project Structure

```
AMT-Toolkit/
├── manifest.json       # Chrome extension manifest (MV3)
├── background.js       # Extension service worker (Side Panel API)
├── content.js          # In-page docked sidebar script for Airlines Manager
├── content.css         # Docked sidebar styling and animations
├── sidepanel.html      # Native Chrome Side Panel page
├── icons/              # Extension icons (16px, 48px, 128px)
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

## License

[MIT](LICENSE)
