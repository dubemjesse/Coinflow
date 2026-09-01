// Auth gate: every page calls `ensureSession()` before booting. If there is no
// valid session it renders a login/register overlay and resolves once the user
// is authenticated. Also runs the one-time migration of transactions from the
// old localStorage client.

import { api, toISO, toMinor } from "./api.js";

const LEGACY_KEY = "coinflow-transactions";
const MIGRATED_FLAG = "coinflow-migrated";

export async function ensureSession() {
  let user = await currentUser();
  if (!user) user = await showAuthOverlay();
  window.__coinflowUser = user;
  await maybeMigrate();
  return user;
}

async function currentUser() {
  try {
    const { user } = await api.auth.me();
    return user;
  } catch {
    return null;
  }
}

async function maybeMigrate() {
  if (localStorage.getItem(MIGRATED_FLAG)) return;
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return;
  }
  let legacy;
  try {
    legacy = JSON.parse(raw);
  } catch {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return;
  }
  if (!Array.isArray(legacy) || legacy.length === 0) {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return;
  }

  const valid = new Set(["food", "transport", "shopping", "bills", "entertainment", "health"]);
  const payload = legacy
    .filter((t) => t && t.title && valid.has(t.category) && Number(t.amount) > 0)
    .map((t) => ({
      title: String(t.title),
      amountMinor: toMinor(t.amount),
      category: t.category,
      occurredAt: toISO(t.date, t.time),
    }));

  if (payload.length === 0) {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return;
  }

  if (!confirm(`Import ${payload.length} transaction(s) from this browser into your account?`)) {
    localStorage.setItem(MIGRATED_FLAG, "1");
    return;
  }

  try {
    const { imported } = await api.transactions.importMany(payload);
    localStorage.setItem(`${LEGACY_KEY}-backup`, raw);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(MIGRATED_FLAG, "1");
    alert(`Imported ${imported} transaction(s).`);
  } catch (err) {
    alert(`Import failed: ${err.message}. Your local data is unchanged.`);
  }
}

function showAuthOverlay() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 2000; display: flex;
      align-items: center; justify-content: center;
      background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(4px);
      font-family: 'Poppins', system-ui, sans-serif;`;

    overlay.innerHTML = `
      <div style="background:#fff; width:360px; max-width:92vw; padding:28px; border-radius:16px; box-shadow:0 20px 50px rgba(0,0,0,.25)">
        <h2 style="margin:0 0 4px; color:#065f46; font-size:1.4rem">CoinFlow</h2>
        <p style="margin:0 0 18px; color:#6b7280; font-size:.9rem" data-el="subtitle">Sign in to continue</p>
        <form data-el="form" style="display:flex; flex-direction:column; gap:12px">
          <label data-el="name-row" style="display:none; flex-direction:column; gap:4px; font-size:.85rem; color:#374151">
            Name
            <input data-el="name" type="text" autocomplete="name" style="padding:10px; border:1px solid #d1d5db; border-radius:8px" />
          </label>
          <label style="display:flex; flex-direction:column; gap:4px; font-size:.85rem; color:#374151">
            Email
            <input data-el="email" type="email" required autocomplete="email" style="padding:10px; border:1px solid #d1d5db; border-radius:8px" />
          </label>
          <label style="display:flex; flex-direction:column; gap:4px; font-size:.85rem; color:#374151">
            Password
            <input data-el="password" type="password" required minlength="8" autocomplete="current-password" style="padding:10px; border:1px solid #d1d5db; border-radius:8px" />
          </label>
          <div data-el="error" style="display:none; color:#dc2626; font-size:.82rem"></div>
          <button data-el="submit" type="submit" style="margin-top:6px; padding:11px; background:#10b981; color:#fff; border:0; border-radius:8px; font-weight:600; cursor:pointer">Sign in</button>
        </form>
        <p style="margin:14px 0 0; text-align:center; font-size:.85rem; color:#6b7280">
          <span data-el="toggle-text">New here?</span>
          <a href="#" data-el="toggle" style="color:#059669; font-weight:600; text-decoration:none">Create an account</a>
        </p>
      </div>`;

    const $ = (name) => overlay.querySelector(`[data-el="${name}"]`);
    let mode = "login";

    $("toggle").addEventListener("click", (e) => {
      e.preventDefault();
      mode = mode === "login" ? "register" : "login";
      const register = mode === "register";
      $("subtitle").textContent = register ? "Create your account" : "Sign in to continue";
      $("name-row").style.display = register ? "flex" : "none";
      $("name").required = register;
      $("submit").textContent = register ? "Create account" : "Sign in";
      $("toggle-text").textContent = register ? "Already have an account?" : "New here?";
      $("toggle").textContent = register ? "Sign in" : "Create an account";
      $("password").autocomplete = register ? "new-password" : "current-password";
      $("error").style.display = "none";
    });

    $("form").addEventListener("submit", async (e) => {
      e.preventDefault();
      $("submit").disabled = true;
      $("error").style.display = "none";
      const payload = {
        email: $("email").value.trim(),
        password: $("password").value,
      };
      try {
        let user;
        if (mode === "register") {
          ({ user } = await api.auth.register({ ...payload, name: $("name").value.trim() }));
        } else {
          ({ user } = await api.auth.login(payload));
        }
        overlay.remove();
        resolve(user);
      } catch (err) {
        $("error").textContent = err.message;
        $("error").style.display = "block";
        $("submit").disabled = false;
      }
    });

    document.body.appendChild(overlay);
    $("email").focus();
  });
}

export async function logout() {
  await api.auth.logout().catch(() => {});
  localStorage.removeItem("coinflow-migrated");
  location.reload();
}
