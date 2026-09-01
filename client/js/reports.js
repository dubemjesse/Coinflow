class ReportsManager {
  constructor() {
    this.transactions = this.loadTransactions();
    this.currentFilters = {
      dateRange: "all",
      startDate: null,
      endDate: null,
      categories: ["all"],
    };
    this.init();
  }

  getCategoryClass(category) {
    const map = {
      bills: "bills",
      shopping: "shopping",
      food: "food",
      transport: "transport",
      health: "health",
    };
    return map[category] || "bills";
  }

  getCategoryLabel(category) {
    const map = {
      bills: "Bills & Utilities",
      shopping: "Shopping",
      food: "Food & Drinks",
      transport: "Transportation",
      health: "Health",
    };
    return map[category] || category;
  }

  getCategoryIconHtml(category) {
    const icons = {
      bills: '<i class="fas fa-mobile-alt"></i>',
      shopping: '<i class="fas fa-shopping-bag"></i>',
      food: '<i class="fas fa-utensils"></i>',
      transport: '<i class="fas fa-bus"></i>',
      health: '<i class="fas fa-pills"></i>',
    };
    return icons[category] || '<i class="fas fa-receipt"></i>';
  }

  init() {
    this.setupEventListeners();
    this.generateReport();
  }

  setupEventListeners() {
    // Date range filter
    const dateRangeSelect = document.getElementById("dateRange");
    if (dateRangeSelect) {
      dateRangeSelect.addEventListener("change", (e) => {
        this.handleDateRangeChange(e.target.value);
      });
    }

    // Custom date range inputs
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    if (startDateInput && endDateInput) {
      // Set default dates for custom range
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      startDateInput.valueAsDate = thirtyDaysAgo;
      endDateInput.valueAsDate = today;

      startDateInput.addEventListener("change", () => this.generateReport());
      endDateInput.addEventListener("change", () => this.generateReport());
    }

    // Category filters
    const categoryCheckboxes = document.querySelectorAll(
      '.category-filters input[type="checkbox"]'
    );
    categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        this.handleCategoryFilter(e.target.value, e.target.checked);
      });
    });

    // Generate report button
    const generateBtn = document.getElementById("generateReport");
    if (generateBtn) {
      generateBtn.addEventListener("click", () => {
        const status = document.getElementById("reportStatus");
        if (status) {
          status.textContent = "Generating report...";
        }
        // Simulate slight delay and generate
        setTimeout(() => {
          this.generateReport();
          if (status) {
            status.textContent = "Report generated successfully.";
          }
        }, 100);
      });
    }

    // Chart controls
    const chartBtns = document.querySelectorAll(".chart-btn");
    chartBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleChartPeriodChange(e.target.dataset.period);
      });
    });
  }

  loadTransactions() {
    // Prefer transactions saved by the main page
    const saved = localStorage.getItem("coinflow-transactions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.warn("Failed to parse saved transactions:", e);
      }
    }

    // Fallback to seeded data if nothing in storage
    return [
      { id: 1, title: "Lunch At Mama Oyinye", amount: 8500, category: "food", date: "2025-09-15", time: "14:30" },
      { id: 2, title: "Airtime Recharge", amount: 5000, category: "bills", date: "2025-09-15", time: "14:30" },
      { id: 3, title: "Chicken from Supermarket", amount: 14000, category: "shopping", date: "2025-09-15", time: "11:45" },
      { id: 4, title: "Fuel for Car", amount: 25000, category: "bills", date: "2025-09-14", time: "18:15" },
      { id: 5, title: "Drugs for Malaria", amount: 2500, category: "health", date: "2025-09-14", time: "15:20" },
      { id: 6, title: "Bus Ride From Nsukka", amount: 2200, category: "transport", date: "2025-09-14", time: "08:00" },
      { id: 7, title: "Electricity Bill", amount: 25000, category: "bills", date: "2025-09-13", time: "16:45" },
      { id: 8, title: "Vee's Supermarket", amount: 35000, category: "shopping", date: "2025-09-13", time: "10:15" },
      { id: 9, title: "Coffee From Enugu City Mall", amount: 3500, category: "food", date: "2025-09-12", time: "14:45" },
    ];
  }

  handleDateRangeChange(value) {
    this.currentFilters.dateRange = value;
    const customDateRange = document.getElementById("customDateRange");

    if (value === "custom") {
      customDateRange.style.display = "flex";
    } else {
      customDateRange.style.display = "none";
      this.generateReport();
    }
  }

  handleCategoryFilter(category, checked) {
    if (category === "all") {
      if (checked) {
        this.currentFilters.categories = ["all"];
        // Check all other checkboxes
        const checkboxes = document.querySelectorAll(
          '.category-filters input[type="checkbox"]'
        );
        checkboxes.forEach((cb) => {
          if (cb.value !== "all") cb.checked = true;
        });
      } else {
        this.currentFilters.categories = [];
        // Uncheck all other checkboxes
        const checkboxes = document.querySelectorAll(
          '.category-filters input[type="checkbox"]'
        );
        checkboxes.forEach((cb) => {
          if (cb.value !== "all") cb.checked = false;
        });
      }
    } else {
      if (checked) {
        if (!this.currentFilters.categories.includes(category)) {
          this.currentFilters.categories.push(category);
        }
        // Remove 'all' if specific categories are selected
        const allIndex = this.currentFilters.categories.indexOf("all");
        if (allIndex > -1) {
          this.currentFilters.categories.splice(allIndex, 1);
          document.querySelector('input[value="all"]').checked = false;
        }
      } else {
        const index = this.currentFilters.categories.indexOf(category);
        if (index > -1) {
          this.currentFilters.categories.splice(index, 1);
        }

        // If no categories selected, check 'all'
        if (this.currentFilters.categories.length === 0) {
          this.currentFilters.categories = ["all"];
          document.querySelector('input[value="all"]').checked = true;
          const checkboxes = document.querySelectorAll(
            '.category-filters input[type="checkbox"]'
          );
          checkboxes.forEach((cb) => {
            if (cb.value !== "all") cb.checked = true;
          });
        }
      }
    }
    this.generateReport();
  }

  handleChartPeriodChange(period) {
    // Update active button
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-period="${period}"]`).classList.add("active");

    // Update chart (placeholder for now)
    this.updateSpendingChart(period);
  }

  getFilteredTransactions() {
    let filtered = [...this.transactions];

    // Filter by date range
    const now = new Date();
    let startDate, endDate;

    if (this.currentFilters.dateRange === "custom") {
      const startInput = document.getElementById("startDate");
      const endInput = document.getElementById("endDate");
      if (startInput.value && endInput.value) {
        startDate = new Date(startInput.value);
        endDate = new Date(endInput.value);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      const days = parseInt(this.currentFilters.dateRange);
      startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      endDate = now;
    }

    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Filter by categories
    if (
      !this.currentFilters.categories.includes("all") &&
      this.currentFilters.categories.length > 0
    ) {
      filtered = filtered.filter((transaction) =>
        this.currentFilters.categories.includes(transaction.category)
      );
    }

    return filtered;
  }

  generateReport() {
    const filteredTransactions = this.getFilteredTransactions();
    this.updateSummaryCards(filteredTransactions);
    this.updateCategoryBreakdown(filteredTransactions);
    this.updateRecentTransactions(filteredTransactions);
    this.updateSpendingChart("daily"); // Default to daily
  }

  updateSummaryCards(transactions) {
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionCount = transactions.length;

    // Calculate actual number of days in the filtered period for average
    let daysInPeriod = 30; // Default to 30 days
    if (this.currentFilters.dateRange === "custom") {
      const startInput = document.getElementById("startDate");
      const endInput = document.getElementById("endDate");
      if (startInput.value && endInput.value) {
        const start = new Date(startInput.value);
        const end = new Date(endInput.value);
        daysInPeriod = Math.max(
          1,
          Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        );
      }
    } else if (this.currentFilters.dateRange !== "30") {
      daysInPeriod = parseInt(this.currentFilters.dateRange);
    }

    const averageDaily =
      transactions.length > 0 ? totalExpenses / daysInPeriod : 0;

    // Update summary cards
    const summaryCards = document.querySelectorAll(".summary-card");
    if (summaryCards.length >= 3) {
      // Total Expenses
      summaryCards[0].querySelector(
        ".summary-amount"
      ).textContent = `₦${totalExpenses.toLocaleString()}`;

      // Average Daily
      summaryCards[1].querySelector(
        ".summary-amount"
      ).textContent = `₦${Math.round(averageDaily).toLocaleString()}`;

      // Total Transactions
      summaryCards[2].querySelector(".summary-amount").textContent =
        transactionCount.toString();
    }
  }

  updateCategoryBreakdown(transactions) {
    const categoryTotals = {};
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    transactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categoryItems = document.querySelectorAll(".category-item");
    const categories = ["bills", "shopping", "food", "transport", "health"];
    const colors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];

    categories.forEach((category, index) => {
      if (categoryItems[index]) {
        const amount = categoryTotals[category] || 0;
        const percentage =
          totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;

        const amountElement =
          categoryItems[index].querySelector(".category-amount");
        const percentageElement = categoryItems[index].querySelector(
          ".category-percentage"
        );
        const progressBar =
          categoryItems[index].querySelector(".category-progress");

        if (amountElement)
          amountElement.textContent = `₦${amount.toLocaleString()}`;
        if (percentageElement) percentageElement.textContent = `${percentage}%`;
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
          progressBar.style.backgroundColor = colors[index];
        }
      }
    });
  }

  updateRecentTransactions(transactions) {
    const listContainer = document.querySelector(".transaction-list");
    if (!listContainer) return;

    // Sort by most recent
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time)
    );

    // Build full list using dashboard markup
    listContainer.innerHTML = sorted
      .map((t) => {
        const categoryClass = this.getCategoryClass(t.category);
        const title = t.title;
        const categoryLabel = this.getCategoryLabel(t.category);
        const datetime = `${this.formatDate(t.date)} • ${t.time}`;
        const amount = `-₦${t.amount.toLocaleString()}`;
        return `
          <div class="transaction-item">
            <div class="transaction-icon ${categoryClass}">
              ${this.getCategoryIconHtml(t.category)}
            </div>
            <div class="transaction-details">
              <div class="transaction-title">${title}</div>
              <div class="transaction-category">${categoryLabel}</div>
              <div class="transaction-datetime">${datetime}</div>
            </div>
            <div class="transaction-amount expense">${amount}</div>
          </div>
        `;
      })
      .join("");
  }

  updateSpendingChart(period) {
    const canvas = document.getElementById("spendingTrendChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Match previous placeholder size
    const container = canvas.parentElement;
    const styles = getComputedStyle(container);
    const containerWidth = container.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
    const containerHeight = container.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    // Fallback to placeholder height (200px) if computed is zero
    canvas.width = Math.max(300, Math.floor(containerWidth));
    canvas.height = Math.max(200, Math.floor(containerHeight));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get filtered transactions
    const transactions = this.getFilteredTransactions();

    // Aggregate by selected period
    const aggregated = this.aggregateTransactions(transactions, period);

    // Prepare chart dimensions
    const padding = 24;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    const originX = padding;
    const originY = canvas.height - padding;

    // Axis
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    // X axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + width, originY);
    ctx.stroke();
    // Y axis
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, originY - height);
    ctx.stroke();

    // Scale values
    const values = aggregated.map((d) => d.total);
    const maxValue = Math.max(1, ...values);
    const xStep = width / Math.max(1, aggregated.length - 1);
    const yScale = height / maxValue;

    // Plot line
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.beginPath();
    aggregated.forEach((d, i) => {
      const x = originX + i * xStep;
      const y = originY - d.total * yScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = "#2ecc71";
    aggregated.forEach((d, i) => {
      const x = originX + i * xStep;
      const y = originY - d.total * yScale;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#666';
    ctx.font = "12px sans-serif";
    aggregated.forEach((d, i) => {
      const x = originX + i * xStep;
      const y = originY + 14;
      ctx.fillText(d.label, x - 12, y);
    });
    // Max value label
    ctx.fillText(`Max ₦${maxValue.toLocaleString()}`, originX + 6, originY - height + 12);
  }

  aggregateTransactions(transactions, period) {
    // Build buckets
    const buckets = new Map();
    const addToBucket = (key, amount) => {
      buckets.set(key, (buckets.get(key) || 0) + amount);
    };

    transactions.forEach((t) => {
      const dateObj = new Date(`${t.date} ${t.time}`);
      const amount = t.amount;
      let key = '';
      if (period === 'daily') {
        key = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
      } else if (period === 'weekly') {
        // Year-Week
        const tmp = new Date(dateObj);
        const dayNum = (dateObj.getDay() + 6) % 7; // Monday=0
        tmp.setDate(dateObj.getDate() - dayNum);
        const year = tmp.getFullYear();
        const onejan = new Date(year, 0, 1);
        const week = Math.ceil(((tmp - onejan) / 86400000 + onejan.getDay() + 1) / 7);
        key = `${year}-W${week}`;
      } else if (period === 'monthly') {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = dateObj.toISOString().slice(0, 10);
      }
      addToBucket(key, amount);
    });

    // Sort keys
    const keys = Array.from(buckets.keys()).sort();
    const result = keys.map((k) => ({ label: this.formatBucketLabel(k, period), total: buckets.get(k) }));
    return result;
  }

  formatBucketLabel(key, period) {
    if (period === 'daily') {
      const d = new Date(key);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (period === 'weekly') {
      return key.replace('W', 'W');
    }
    if (period === 'monthly') {
      const [year, month] = key.split('-');
      return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month,10)-1]} ${year}`;
    }
    return key;
  }

  formatCurrency(amount) {
    return `₦${amount.toLocaleString()}`;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

// Initialize the reports manager when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new ReportsManager();
});
