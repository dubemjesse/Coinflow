import { api, toLegacyTransaction, toMinor } from "./api.js";
import { ensureSession } from "./session.js";

class TransactionsManager {
  constructor(transactions) {
    this.transactions = transactions;
    this.editMode = false;
    this.init();
  }

  async reload() {
    const { items } = await api.transactions.list({ limit: 500 });
    this.transactions = items.map(toLegacyTransaction);
    this.renderList();
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

    const search = (document.getElementById("filter-search")?.value || "").toLowerCase();
    const cat = document.getElementById("filter-category")?.value || "all";
    const start = document.getElementById("filter-start")?.value || "";
    const end = document.getElementById("filter-end")?.value || "";

    const filtered = this.transactions.filter((t) => {
      const matchesSearch = search ? (t.title || "").toLowerCase().includes(search) : true;
      const matchesCat = cat === "all" ? true : t.category === cat;
      const tDate = new Date(`${t.date}T${t.time || "00:00"}`);
      const afterStart = start ? tDate >= new Date(`${start}T00:00`) : true;
      const beforeEnd = end ? tDate <= new Date(`${end}T23:59`) : true;
      return matchesSearch && matchesCat && afterStart && beforeEnd;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}`);
      const bDate = new Date(`${b.date}T${b.time || "00:00"}`);
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

    if (sorted.length === 0) {
      container.innerHTML = `<p style="color:var(--gray); padding:12px 0">No transactions match your filters.</p>`;
      return;
    }

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

    if (this.editMode) {
      container.querySelectorAll(".btn-save").forEach((btn) => {
        btn.addEventListener("click", (e) => this.handleSave(e));
      });
    }
    container.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleDelete(e));
    });
  }

  async handleSave(e) {
    const item = e.target.closest(".transaction-item");
    const id = item.dataset.id;
    const title = item.querySelector(".tx-title").value.trim();
    const amount = Number(item.querySelector(".tx-amount").value);

    if (!title || isNaN(amount) || amount <= 0) {
      alert("Please provide a valid title and a positive amount.");
      return;
    }

    try {
      await api.transactions.update(id, { title, amountMinor: toMinor(amount) });
      await this.reload();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  }

  async handleDelete(e) {
    const item = e.target.closest(".transaction-item");
    const id = item.dataset.id;
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.transactions.remove(id);
      this.transactions = this.transactions.filter((t) => t.id !== id);
      this.renderList();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }
}

async function bootstrap() {
  await ensureSession();
  const { items } = await api.transactions.list({ limit: 500 });
  new TransactionsManager(items.map(toLegacyTransaction));
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((err) => {
    console.error(err);
    alert(`Failed to load transactions: ${err.message}`);
  });
});
