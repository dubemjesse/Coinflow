// Enhanced Dashboard Functionality
class DashboardManager {
  constructor() {
    this.transactions = this.loadTransactions();
    this.budgets = this.loadBudgets();
    this.currentChartPeriod = "month";
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDashboard();
    this.setDefaultDate();
  }

  setupEventListeners() {
    // Chart period buttons
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleChartPeriodChange(e.target.textContent.toLowerCase());
      });
    });

    // Add expense button
    document.querySelector(".btn-primary").addEventListener("click", () => {
      this.addExpense();
    });

    // Quick action buttons
    document.querySelectorAll(".action-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.currentTarget.querySelector("span").textContent;
        this.handleQuickAction(action);
      });
    });
  }

  loadTransactions() {
    // Load from localStorage or use default data
    const saved = localStorage.getItem("coinflow-transactions");
    if (saved) {
      return JSON.parse(saved);
    }

    // Default transaction data from index.html
    return [
      {
        id: 1,
        title: "Lunch At Mama Oyinye",
        amount: 8500,
        category: "food",
        date: "2025-09-15",
        time: "14:30",
      },
      {
        id: 2,
        title: "Airtime Recharge",
        amount: 5000,
        category: "bills",
        date: "2025-09-15",
        time: "14:30",
      },
      {
        id: 3,
        title: "Chicken from Supermarket",
        amount: 14000,
        category: "shopping",
        date: "2025-09-15",
        time: "11:45",
      },
      {
        id: 4,
        title: "Fuel for Car",
        amount: 25000,
        category: "bills",
        date: "2025-09-14",
        time: "18:15",
      },
      {
        id: 5,
        title: "Drugs for Malaria",
        amount: 2500,
        category: "health",
        date: "2025-09-14",
        time: "15:20",
      },
      {
        id: 6,
        title: "Bus Ride From Nsukka",
        amount: 2200,
        category: "transport",
        date: "2025-09-14",
        time: "08:00",
      },
      {
        id: 7,
        title: "Electricity Bill",
        amount: 25000,
        category: "bills",
        date: "2025-09-13",
        time: "16:45",
      },
      {
        id: 8,
        title: "Vee's Supermarket",
        amount: 35000,
        category: "shopping",
        date: "2025-09-13",
        time: "10:15",
      },
      {
        id: 9,
        title: "Coffee From Enugu City Mall",
        amount: 3500,
        category: "food",
        date: "2025-09-12",
        time: "14:45",
      },
    ];
  }

  loadBudgets() {
    return {
      food: 85000,
      transport: 100000,
      shopping: 100000,
      bills: 90000,
      health: 30000,
      entertainment: 20000,
    };
  }

  setDefaultDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("expense-date").value = today;
  }

  handleChartPeriodChange(period) {
    // Update active button
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelectorAll(".chart-btn").forEach((btn) => {
      if (btn.textContent.toLowerCase() === period) {
        btn.classList.add("active");
      }
    });

    this.currentChartPeriod = period;
    // Refresh summary and chart based on the selected period
    this.updateSummaryCards();
    this.updateChart();
  }

  addExpense() {
    const title = document.getElementById("expense-title").value.trim();
    const amount = document.getElementById("expense-amount").value.trim();
    const category = document.getElementById("expense-category").value;
    const date = document.getElementById("expense-date").value;

    // Validate all required fields
    if (!title) {
      this.showAlert("Please enter an expense title", "error");
      document.getElementById("expense-title").focus();
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      this.showAlert("Please enter a valid amount greater than 0", "error");
      document.getElementById("expense-amount").focus();
      return;
    }

    if (!category) {
      this.showAlert("Please select a category", "error");
      document.getElementById("expense-category").focus();
      return;
    }

    if (!date) {
      this.showAlert("Please select a date", "error");
      document.getElementById("expense-date").focus();
      return;
    }

    // Check if date is not in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      this.showAlert("Date cannot be in the future", "error");
      document.getElementById("expense-date").focus();
      return;
    }

    // All validation passed, proceed with adding expense
    const addBtn = document.querySelector(".btn-primary");
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    addBtn.disabled = true;

    setTimeout(() => {
      // Create new expense object
      const newExpense = {
        id: Date.now(),
        title: title,
        amount: parseFloat(amount),
        category: category,
        date: date,
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add to transactions array
      this.transactions.unshift(newExpense);
      this.saveTransactions();

      // Update dashboard
      this.updateDashboard();

      // Reset form
      document.getElementById("expense-title").value = "";
      document.getElementById("expense-amount").value = "";
      document.getElementById("expense-category").selectedIndex = 0;
      this.setDefaultDate();

      addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Expense';
      addBtn.disabled = false;

      this.showAlert(
        `Expense "${title}" of ₦${parseFloat(
          amount
        ).toLocaleString()} added successfully!`,
        "success"
      );
    }, 1000);
  }

  handleQuickAction(action) {
    switch (action.toLowerCase()) {
      case "reports":
        window.location.href = "reports.html";
        break;
      case "reminders":
        window.location.href = "reminders.html";
        break;
      case "add receipt":
        this.showAlert(
          "Receipt upload feature would be implemented here",
          "info"
        );
        break;
      case "export":
        this.exportCSV();
        break;
      case "export csv":
        this.exportCSV();
        break;
    }
  }

  updateDashboard() {
    this.updateSummaryCards();
    this.updateChart();
    this.updateRecentTransactions();
    this.updateBudgetProgress();
  }

  updateSummaryCards() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter transactions for current month
    const monthlyTransactions = this.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    // Ensure amounts are treated as numbers to avoid string concatenation
    const totalExpenses = monthlyTransactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
    const monthlyIncome = 512000; // Fixed monthly income
    const savings = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    // Update summary cards
    const summaryCards = document.querySelectorAll(".summary-card");

    // Total Balance
    summaryCards[0].querySelector(".amount").textContent = `₦${(
      monthlyIncome - totalExpenses
    ).toLocaleString()}`;

    // Monthly Income
    summaryCards[1].querySelector(
      ".amount"
    ).textContent = `₦${monthlyIncome.toLocaleString()}`;

    // Monthly Expenses
    summaryCards[2].querySelector(
      ".amount"
    ).textContent = `₦${totalExpenses.toLocaleString()}`;

    // Savings Rate
    summaryCards[3].querySelector(".amount").textContent = `${Math.round(
      savingsRate
    )}%`;

    // Update trends (simplified - in real app, compare with previous period)
    const trendPositive = savingsRate >= 20;
    summaryCards[3].querySelector(".trend").className = `trend ${
      trendPositive ? "positive" : "negative"
    }`;
    summaryCards[3].querySelector(
      ".trend"
    ).innerHTML = `<i class="fas fa-arrow-${
      trendPositive ? "up" : "down"
    }"></i> ${trendPositive ? "Good" : "Needs improvement"}`;
  }

  updateChart() {
    const canvas = document.getElementById("spendingChart");
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");

    // Guard: Chart library must be available
    if (typeof Chart === "undefined") {
      return;
    }

    // Destroy existing chart if it exists
    if (
      window.spendingChart &&
      typeof window.spendingChart.destroy === "function"
    ) {
      window.spendingChart.destroy();
    }

    // Calculate category totals based on current period
    const categoryTotals = this.calculateCategoryTotals();
    const totalAmount = Object.values(categoryTotals).reduce(
      (sum, amount) => sum + amount,
      0
    );

    // Prepare chart data
    const categories = [
      "food",
      "transport",
      "shopping",
      "bills",
      "entertainment",
      "health",
    ];
    const labels = [
      "Food & Dining",
      "Transportation",
      "Shopping",
      "Bills & Utilities",
      "Entertainment",
      "Health",
    ];
    const data = categories.map((category) => categoryTotals[category] || 0);
    const percentages = data.map((amount) =>
      totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
    );

    // Create chart
    window.spendingChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "#F59E0B", // Food - Amber
              "#3B82F6", // Transport - Blue
              "#EC4899", // Shopping - Pink
              "#10B981", // Bills - Emerald
              "#8B5CF6", // Entertainment - Purple
              "#EF4444", // Health - Red
            ],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 15,
              font: {
                size: 11,
              },
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const percentage = percentages[i];

                    return {
                      text: `${label} - ₦${value.toLocaleString()} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].backgroundColor[i],
                      lineWidth: 0,
                      hidden: false,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed;
                const percentage = percentages[context.dataIndex];
                return `${label}: ₦${value.toLocaleString()} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    });
  }

  calculateCategoryTotals() {
    const now = new Date();
    let startDate, endDate;

    // Calculate date range based on current period
    switch (this.currentChartPeriod) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    // Filter transactions by date range
    const filteredTransactions = this.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Calculate category totals
    const categoryTotals = {};
    filteredTransactions.forEach((transaction) => {
      categoryTotals[transaction.category] =
        (categoryTotals[transaction.category] || 0) + transaction.amount;
    });

    return categoryTotals;
  }

  updateRecentTransactions() {
    const transactionList = document.querySelector(".transaction-list");
    // Sort by date and time descending, then take top 8
    const recentTransactions = this.transactions
      .slice()
      .sort((a, b) => {
        const aDate = new Date(`${a.date} ${a.time || "00:00"}`);
        const bDate = new Date(`${b.date} ${b.time || "00:00"}`);
        return bDate - aDate;
      })
      .slice(0, 12);

    transactionList.innerHTML = recentTransactions
      .map((transaction) => {
        const categoryNames = {
          food: "Food & Drinks",
          transport: "Transportation",
          shopping: "Shopping",
          bills: "Bills & Utilities",
          entertainment: "Entertainment",
          health: "Health",
        };

        const categoryIcons = {
          food: "fas fa-utensils",
          transport: "fas fa-bus",
          shopping: "fas fa-shopping-bag",
          bills: "fas fa-bolt",
          entertainment: "fas fa-film",
          health: "fas fa-pills",
        };

        const formattedDate = new Date(transaction.date).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        );

        return `
                <div class="transaction-item">
                    <div class="transaction-icon ${transaction.category}">
                        <i class="${categoryIcons[transaction.category]}"></i>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-title">${
                          transaction.title
                        }</div>
                        <div class="transaction-category">${
                          categoryNames[transaction.category]
                        }</div>
                        <div class="transaction-datetime">${formattedDate} • ${
          transaction.time
        }</div>
                    </div>
                    <div class="transaction-amount expense">-₦${transaction.amount.toLocaleString()}</div>
                </div>
            `;
      })
      .join("");
  }

  updateBudgetProgress() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate spent amounts for current month
    const spentAmounts = {};
    this.transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      if (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      ) {
        spentAmounts[transaction.category] =
          (spentAmounts[transaction.category] || 0) + transaction.amount;
      }
    });

    // Update progress bars
    const budgetItems = document.querySelectorAll(".progress-item");
    const categories = ["food", "transport", "shopping", "bills"];

    categories.forEach((category, index) => {
      if (budgetItems[index]) {
        const spent = spentAmounts[category] || 0;
        const budget = this.budgets[category];
        const percentage =
          budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

        // Update progress header
        const progressHeader =
          budgetItems[index].querySelector(".progress-header");
        progressHeader.innerHTML = `
                    <span>${this.getCategoryDisplayName(category)}</span>
                    <span>₦${spent.toLocaleString()} / ₦${budget.toLocaleString()}</span>
                `;

        // Update progress bar
        const progressFill = budgetItems[index].querySelector(".progress-fill");
        progressFill.style.width = `${percentage}%`;

        // Change color based on percentage
        if (percentage >= 90) {
          progressFill.style.background = "#EF4444"; // Red
        } else if (percentage >= 75) {
          progressFill.style.background = "#F59E0B"; // Amber
        } else {
          progressFill.style.background = this.getCategoryColor(category);
        }
      }
    });
  }

  getCategoryDisplayName(category) {
    const names = {
      food: "Food & Drinks",
      transport: "Transportation",
      shopping: "Shopping",
      bills: "Bills & Utilities",
      health: "Health",
      entertainment: "Entertainment",
    };
    return names[category] || category;
  }

  getCategoryColor(category) {
    const colors = {
      food: "#F59E0B",
      transport: "#3B82F6",
      shopping: "#EC4899",
      bills: "#10B981",
      health: "#EF4444",
      entertainment: "#8B5CF6",
    };
    return colors[category] || "#6B7280";
  }

  exportCSV() {
    const headers = ["id", "title", "amount", "category", "date", "time"];

    const csvEscape = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // Escape double quotes and wrap field in quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = this.transactions.map((t) => [
      t.id,
      t.title,
      Number(t.amount || 0),
      t.category,
      t.date,
      t.time || "",
    ]);

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((r) => r.map(csvEscape).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coinflow-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showAlert("Transactions exported as CSV successfully!", "success");
  }

  saveTransactions() {
    localStorage.setItem(
      "coinflow-transactions",
      JSON.stringify(this.transactions)
    );
  }

  showAlert(message, type = "info") {
    // Create alert element
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            <i class="fas fa-${
              type === "success"
                ? "check-circle"
                : type === "error"
                ? "exclamation-circle"
                : "info-circle"
            }"></i>
            ${message}
        `;

    // Add styles
    alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${
              type === "success"
                ? "#d1fae5"
                : type === "error"
                ? "#fef2f2"
                : "#e0f2fe"
            };
            color: ${
              type === "success"
                ? "#047857"
                : type === "error"
                ? "#dc2626"
                : "#0369a1"
            };
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

    document.body.appendChild(alert);

    // Animate in
    setTimeout(() => {
      alert.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      alert.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(alert)) {
          document.body.removeChild(alert);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DashboardManager();
});
