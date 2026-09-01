class TransactionsManager {
  constructor() {
    this.transactions = this.loadTransactions();
    this.editMode = false;
    this.init();
  }

  loadTransactions() {
    const saved = localStorage.getItem("coinflow-transactions");
    return saved ? JSON.parse(saved) : [];
  }

  saveTransactions() {
    localStorage.setItem("coinflow-transactions", JSON.stringify(this.transactions));
  }

  init() {
    this.renderList();
    const search = document.getElementById("filter-search");
    const cat = document.getElementById("filter-category");
    const start = document.getElementById("filter-start");
    const end = document.getElementById("filter-end");
    const reset = document.getElementById("filter-reset");
    const toggleEdit = document.getElementById("toggle-edit");

    [search, cat, start, end].forEach((el) => el && el.addEventListener("input", () => this.renderList()));
    reset && reset.addEventListener("click", () => {
      if (search) search.value = "";
      if (cat) cat.value = "all";
      if (start) start.value = "";
      if (end) end.value = "";
      this.renderList();
    });
    toggleEdit && toggleEdit.addEventListener("click", () => {
      this.editMode = !this.editMode;
      toggleEdit.querySelector("span").textContent = this.editMode ? "View Mode" : "Edit Mode";
      this.renderList();
    });
  }

  formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  renderList() {
    const container = document.getElementById("transactions-list");
    if (!container) return;

    // Apply filters
    const search = (document.getElementById("filter-search")?.value || "").toLowerCase();
    const cat = document.getElementById("filter-category")?.value || "all";
    const start = document.getElementById("filter-start")?.value || "";
    const end = document.getElementById("filter-end")?.value || "";

    const filtered = this.transactions.filter((t) => {
      const matchesSearch = search ? (t.title || "").toLowerCase().includes(search) : true;
      const matchesCat = cat === "all" ? true : t.category === cat;
      const tDate = new Date(`${t.date} ${t.time || "00:00"}`);
      const afterStart = start ? tDate >= new Date(`${start} 00:00`) : true;
      const beforeEnd = end ? tDate <= new Date(`${end} 23:59`) : true;
      return matchesSearch && matchesCat && afterStart && beforeEnd;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aDate = new Date(`${a.date} ${a.time || "00:00"}`);
      const bDate = new Date(`${b.date} ${b.time || "00:00"}`);
      return bDate - aDate;
    });

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

    container.innerHTML = sorted
      .map((t) => {
        const formattedDate = new Date(t.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        if (!this.editMode) {
          return `
            <div class="transaction-item" data-id="${t.id}">
              <div class="transaction-icon ${t.category}">
                <i class="${categoryIcons[t.category]}"></i>
              </div>
              <div class="transaction-details">
                <div class="transaction-title">${t.title}</div>
                <div class="transaction-category">${categoryNames[t.category]}</div>
                <div class="transaction-datetime">${formattedDate} • ${t.time || "00:00"}</div>
              </div>
              <div class="transaction-amount expense">-₦${Number(t.amount).toLocaleString()}</div>
              <div style="display:flex; gap:8px; align-items:center; margin-left:10px;">
                <button class="btn-delete">Delete</button>
              </div>
            </div>
          `;
        }
        return `
          <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-icon ${t.category}">
              <i class="${categoryIcons[t.category]}"></i>
            </div>
            <div class="transaction-details">
              <div class="transaction-title">
                <input class="tx-title" value="${t.title}" />
              </div>
              <div class="transaction-category">${categoryNames[t.category]}</div>
              <div class="transaction-datetime">${formattedDate} • ${t.time || "00:00"}</div>
            </div>
            <div class="transaction-amount expense">
              -₦<input type="number" class="tx-amount" value="${t.amount}" style="width:100px" />
            </div>
            <div style="display:flex; gap:8px; align-items:center; margin-left:10px;">
              <button class="btn-save">Save</button>
              <button class="btn-delete">Delete</button>
            </div>
          </div>
        `;
      })
      .join("");

    // Wire buttons
    if (this.editMode) {
      container.querySelectorAll(".btn-save").forEach((btn) => {
        btn.addEventListener("click", (e) => this.handleSave(e));
      });
    }
    container.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleDelete(e));
    });
  }

  handleSave(e) {
    const item = e.target.closest(".transaction-item");
    const id = Number(item.dataset.id);
    const title = item.querySelector(".tx-title").value.trim();
    // Category is shown as text; keep original
    const old = this.transactions.find((t) => t.id === id);
    const category = old ? old.category : "food";
    const date = item.querySelector(".tx-date").value;
    const time = item.querySelector(".tx-time").value;
    const amount = Number(item.querySelector(".tx-amount").value);

    // Basic validation
    if (!title || !category || !date || isNaN(amount) || amount <= 0) {
      alert("Please provide valid title, category, date and positive amount.");
      return;
    }

    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.transactions[idx] = { ...this.transactions[idx], title, category, date, time, amount };
      this.saveTransactions();
      this.renderList();
    }
  }

  handleDelete(e) {
    const item = e.target.closest(".transaction-item");
    const id = Number(item.dataset.id);
    if (!confirm("Delete this transaction?")) return;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.saveTransactions();
    this.renderList();
  }
}

document.addEventListener("DOMContentLoaded", () => new TransactionsManager());