# Cashflow

A lightweight personal finance dashboard built with plain HTML, CSS, and JavaScript.

## Overview

Cashflow helps you track income and expenses in a clean dashboard interface. It uses `localStorage` so your entries, saved sessions, and progress persist between browser refreshes.

## Features

- Add income and expense entries with description, amount, and category
- View current totals for income, expenses, and net balance
- Track spending by category with a doughnut chart powered by Chart.js
- Browse a transaction history list and delete individual entries
- Save named sessions (periods) to archive previous spending periods
- Clear the current period to start fresh
- Mobile-friendly sidebar navigation and responsive layout

## Files

- `index.html` — app structure, navigation, dashboard, history, and session views
- `style.css` — styling, layout, dark theme design, responsive UI
- `app.js` — main application logic, entry management, chart rendering, session handling, and persistence

## Usage

1. Open `index.html` in a web browser.
2. Add income or expense entries using the form.
3. Watch the totals update instantly.
4. Save a period in the Sessions section to archive the current data.
5. Use the Clear All button to remove all entries in the current period.

## Notes

- The app stores data in the browser's `localStorage`, so it works offline and remembers data on the same device.
- Chart rendering depends on the `Chart.js` CDN included in `index.html`.

## Development

No build step required. Simply open `index.html` or serve the directory with a static file server if preferred.
