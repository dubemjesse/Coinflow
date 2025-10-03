# CoinFlow — Personal Expense & Reports Tracker

Modern, responsive web application to track expenses, visualize trends, and monitor budgets. Created by Jesse Odoh.

## Overview

CoinFlow is organized into four primary pages:

- `Dashboard (index.html)`: Add expenses, view summary cards, spending overview chart, recent transactions, and budget progress.
- `Transactions (transactions.html)`: Browse the full transaction list and categories.
- `Reports (reports.html)`: Analyze spending with filters and a dynamic spending trend chart (daily/weekly/monthly), category breakdowns, and totals.
- `Reminders (reminders.html)`: Manage simple financial reminders.

## Key Features

- Expense management: Add, categorize, and persist transactions.
- Budget tracking: Visual progress bars for core categories.
- Reports filters: Date range, categories, and on-demand report generation.
- Spending trend chart: Canvas-based line chart with daily, weekly, and monthly aggregation.
- Category breakdowns and totals: Quick view for how you spend.
- Unified header styling: Consistent section headers with icons across pages.
- Data persistence: Transactions and reminders saved in the browser.
- CSV export: Export transactions from the Dashboard.

## Project Structure

```
CoinFlow/
├── index.html              # Dashboard
├── transactions.html       # Transactions page
├── reports.html            # Reports & analytics
├── reminders.html          # Reminders
├── css/
│   └── styles.css          # Global styles
├── js/
│   ├── app.js              # Dashboard logic, budgets, chart, export
│   ├── transactions.js     # Transactions page logic
│   ├── reports.js          # Reports filters, aggregation, chart drawing
│   └── reminders.js        # Reminders logic
├── assets/
│   ├── icons/
│   │   └── favicon.svg
│   └── images/
│       └── logo.svg
└── README.md               # Documentation
```

## Technologies

- HTML5: Semantic structure
- CSS3: Flexbox, Grid, custom properties, responsive design
- JavaScript (ES6+): State handling, DOM updates, localStorage
- Canvas API: Spending trend chart rendering
- Font Awesome: Icons

Note: `reports.html` includes Chart.js, but the current trend chart uses custom Canvas rendering.

## Data Persistence

- Transactions: `localStorage` key `coinflow-transactions`
- Reminders: `localStorage` key `coinflow-reminders`

If no saved data exists, pages seed initial demo content.

## Usage

### Dashboard
- Add an expense: Title, Amount, Category, Date (defaults to today).
- Spending Overview: Switch between Week/Month/Year.
- Recent Transactions: Shows latest entries.
- Budget Progress: Visualize spend vs. budget for Food, Transportation, Shopping, Bills.
- Export CSV: Quick action on the Dashboard.

### Transactions Page
- Browse all transactions and categories with icons.

### Reports Page
- Filters: Date range (includes “All time”), Custom range, and Categories.
- Generate Report: Applies filters across totals, breakdown, and chart.
- Spending Trend chart: Period buttons (Daily/Weekly/Monthly) to re-aggregate data.
- Section Titles: Unified style for headers (icons + H2).

### Reminders Page
- Add and manage simple reminders (persisted in localStorage).

## Configuration

- Budgets: Edit defaults in `js/app.js` within `loadBudgets()`.
  - Example: `transport: 100000` (Transportation limit set to ₦100,000)
- Categories display names and colors:
  - `getCategoryDisplayName()` and `getCategoryColor()` in `js/app.js`.
- Reports defaults:
  - Date range defaults to `all` and includes “All time” option.

## Development Notes

- Header style: Use `.section-title` with icon + `<h2>` for consistency.
- Chart sizing: Reports chart canvas is sized to its container for layout consistency.
- Aggregation: Reports chart aggregates by day, week (Mon–Sun), and month.
- Current-month budgets: Budget progress computes spend for the current month.

## Running Locally

1. Ensure you have a modern browser.
2. From the project root, start a simple web server:
   - Python: `python -m http.server 8000`
   - Node (optional): `npx live-server --port=5500`
3. Open:
   - Dashboard: `http://localhost:8000/index.html`
   - Reports: `http://localhost:8000/reports.html`
   - Transactions: `http://localhost:8000/transactions.html`
   - Reminders: `http://localhost:8000/reminders.html`

## Known Limitations

- Budgets are defaults only; not persisted between sessions.
- Seeded demo dates may fall outside the current month; budget progress reflects current-month spend only.
- Reports chart is custom Canvas; no tooltips or zoom by default.
- No backend; all data stored in localStorage.

## Author

Created by Jesse Odoh.

## Support

For questions or support, please contact the author or open an issue.

—

CoinFlow — Track. Analyze. Save.