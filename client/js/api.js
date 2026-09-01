// Thin fetch wrapper for the CoinFlow API.
// In dev, requests hit `/api/...` and Vite proxies them to the server (see
// vite.config.js). In production, set VITE_API_BASE_URL to the API origin.

const BASE = import.meta.env.VITE_API_BASE_URL || "";

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || res.statusText, data.details);
  }
  return data;
}

export const api = {
  auth: {
    register: (payload) => request("POST", "/auth/register", payload),
    login: (payload) => request("POST", "/auth/login", payload),
    logout: () => request("POST", "/auth/logout"),
    me: () => request("GET", "/auth/me"),
  },
  transactions: {
    list: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null),
      ).toString();
      return request("GET", `/transactions${qs ? `?${qs}` : ""}`);
    },
    create: (payload) => request("POST", "/transactions", payload),
    update: (id, payload) => request("PATCH", `/transactions/${id}`, payload),
    remove: (id) => request("DELETE", `/transactions/${id}`),
    importMany: (transactions) => request("POST", "/transactions/import", { transactions }),
  },
};

// --- helpers shared by the pages -------------------------------------------

// UI works in whole Naira; the API stores integer minor units (kobo).
export const toMinor = (naira) => Math.round(Number(naira) * 100);
export const toMajor = (minor) => Number(minor) / 100;

// Combine the old separate date (yyyy-mm-dd) + time (HH:MM or "h:MM AM") into ISO.
export function toISO(date, time) {
  if (!date) return new Date().toISOString();
  let hhmm = "00:00";
  if (time) {
    const m = String(time).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = m[2];
      const ap = m[3]?.toUpperCase();
      if (ap === "PM" && h < 12) h += 12;
      if (ap === "AM" && h === 12) h = 0;
      hhmm = `${String(h).padStart(2, "0")}:${min}`;
    }
  }
  return new Date(`${date}T${hhmm}:00`).toISOString();
}

// API DTO -> the { id, title, amount, category, date, time } shape the existing
// page code expects.
export function toLegacyTransaction(dto) {
  const d = new Date(dto.occurredAt);
  return {
    id: dto.id,
    title: dto.title,
    amount: toMajor(dto.amountMinor),
    category: dto.category,
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
}
