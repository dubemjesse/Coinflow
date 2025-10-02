# CoinFlow - Personal Expense Tracker

A modern, responsive web application for tracking personal expenses with an intuitive dashboard interface.

## Features

- **Dashboard Overview**: Visual summary of your spending with interactive charts
- **Expense Management**: Add, categorize, and track your daily expenses
- **Budget Tracking**: Monitor your spending against set budgets
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Form validation to ensure data integrity
- **Interactive Charts**: Visual representation of spending patterns using Chart.js

## Project Structure

```
CoinFlow/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── app.js          # JavaScript functionality
├── assets/
│   ├── images/
│   │   └── logo.svg    # Application logo
│   └── icons/
│       └── favicon.svg # Favicon
└── README.md           # Project documentation
```

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Interactive functionality
- **Chart.js**: Data visualization library
- **Font Awesome**: Icon library
- **Google Fonts**: Poppins font family

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local development server) or any HTTP server

### Installation

1. Clone or download the project files
2. Navigate to the project directory
3. Start a local server:

   **Using Python:**
   ```bash
   python -m http.server 8000
   ```

   **Using Node.js (if you have it installed):**
   ```bash
   npx serve .
   ```

4. Open your browser and navigate to `http://localhost:8000`

## Usage

### Adding Expenses

1. Fill in the expense form in the sidebar:
   - **Title**: Description of the expense
   - **Amount**: Expense amount (must be positive)
   - **Category**: Select from predefined categories
   - **Date**: Date of expense (defaults to today, cannot be future date)

2. Click "Add Expense" to save the entry

### Viewing Data

- **Summary Cards**: Quick overview of total balance, income, and expenses
- **Spending Chart**: Interactive doughnut chart showing expense distribution by category
- **Recent Transactions**: List of recent expense entries
- **Budget Progress**: Visual progress bars for different spending categories

### Chart Interactions

- Click on chart time period buttons (Week, Month, Year) to filter data
- Legend items show spending categories with color coding

## Customization

### Styling

The application uses CSS custom properties (variables) for easy theming:

```css
:root {
    --primary-color: #008751;
    --secondary-color: #00A86B;
    --accent-color: #F59E0B;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --background: #F9FAFB;
    --surface: #FFFFFF;
    --border: #E5E7EB;
}
```

### Categories

To modify expense categories, update the select options in `index.html` and corresponding chart data in `js/app.js`.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the project
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Enhancements

- [ ] Data persistence with localStorage or backend integration
- [ ] Export functionality (CSV, PDF)
- [ ] Multiple currency support
- [ ] Advanced filtering and search
- [ ] Budget alerts and notifications
- [ ] Dark mode theme
- [ ] Mobile app version

## Support

For support or questions, please open an issue in the project repository.

---

**CoinFlow** - Take control of your finances with style! 💰