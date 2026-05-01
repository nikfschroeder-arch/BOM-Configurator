# BOM Configurator Prototype

This repository contains a lightweight front-end prototype for configuring Bills of Materials (BOMs) in a manufacturing workflow.

## What the app does

The app supports a full flow from item exploration to BOM composition:

1. **Start screen / product choice**
   - Prompts: **"What are you building?"**
   - Shows Product Category options based on dummy data.
   - Before selecting a product category, all item numbers float in a pseudo-3D "atom-like" cloud.
2. **Category focus**
   - After selecting a Product Category, unrelated items disappear.
   - The selected category is pinned in the top-right badge (`Building: <Category>`).
3. **Purchasing filters**
   - Toggle Purchasing Categories to show/hide available items.
4. **BOM builder**
   - Drag visible item numbers into the BOM drop zone.
   - Edit quantities directly in the BOM table.
   - Remove items from the BOM as needed.
5. **Drawing mapper**
   - Upload a finished-good drawing image.
   - Select a BOM item from the dropdown.
   - Click on drawing areas to map the selected item to image coordinates.

---

## How to run the app

Because this is a static HTML/CSS/JS app, you can run it in any browser.

### Option 1: Open directly

1. Clone or download this repository.
2. Open `index.html` in your web browser.

### Option 2: Run a local web server (recommended)

From the repo root, run:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000`

---

## How to use the app

1. **Select what you are building**
   - Click one Product Category button.
2. **Refine available items**
   - Use Purchasing Category checkboxes to control which item numbers are shown.
3. **Build the BOM**
   - Drag item numbers from the item cloud into the BOM drop zone.
   - Set quantity per row in the Qty field.
   - Remove rows with the **Remove** button.
4. **Map BOM items to drawing**
   - Upload a drawing image (`.png`, `.jpg`, etc.).
   - Pick an item in the "Select BOM item to map" dropdown.
   - Click locations on the drawing to add mapping pins.

---

## Data source and customization

Current data is in `app.js` as `dummyData`:

- `itemNo`
- `description`
- `productCategory`
- `purchasingCategory`

To change sample data, edit the `dummyData` array in `app.js` and refresh the browser.

---

## Current limitations

This is a prototype and currently:

- Has no backend/API.
- Does not persist BOMs or mappings after refresh.
- Uses in-memory dummy data only.
- Has no authentication/authorization.

---

## Suggested next steps

- Add CSV/Excel upload for item master data.
- Add save/load for BOM configurations.
- Add export (CSV/PDF) for finalized BOMs.
- Add backend storage and user accounts.
