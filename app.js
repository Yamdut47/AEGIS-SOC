// =====================================================
// AEGIS-SOC | js/app.js (v2 — DB aware)
// Auth guard + sidebar/topbar injection + live notif badge
// =====================================================

const PAGE_TITLES = {
  dashboard: { t: "Dashboard", i: "fa-gauge-high" },
  map: { t: "Attack Map", i: "fa-earth-americas" },
  monitoring: { t: "Live Monitoring", i: "fa-satellite-dish" },
  logs: { t: "Logs", i: "fa-database" },
  alerts: { t: "Alerts", i: "fa-bell" },
  incidents: { t: "Incidents", i: "fa-fire" },
  "ai-analysis": { t: "AI Analysis", i: "fa-brain" },
  mitre: { t: "MITRE ATT&CK", i: "fa-diagram-project" },
  "threat-intel": { t: "Threat Intel", i: "fa-virus" },
  risk: { t: "Risk Analysis", i: "fa-chart-pie" },
  assets: { t: "Assets", i: "fa-server" },
  response: { t: "Response (SOAR)", i: "fa-bolt" },
  reports: { t: "Reports", i: "fa-file-lines" },
  notifications: { t: "Notifications", i: "fa-envelope" },
  admin: { t: "Admin", i: "fa-gear" }
};

function buildSidebar(active) {
  const item = (key, icon, label) => `
    <a class="nav-item ${key === active ? "active" : ""}" href="${key}.html">
      <i class="fas ${icon}"></i> ${label}
    </a>`;

  return `
  <div class="sidebar">
    <div class="sidebar-logo"><i class="fas fa-shield-halved"></i> AEGIS-SOC</div>
    <div class="sidebar-nav">
      ${item("dashboard", "fa-gauge-high", "Dashboard")}
      ${item("map", "fa-earth-americas", "Attack Map")}
      ${item("monitoring", "fa-satellite-dish", "Live Monitoring")}
      ${item("logs", "fa-database", "Logs")}

      <div class="nav-divider">Threat Analysis</div>
      ${item("alerts", "fa-bell", "Alerts")}
      ${item("incidents", "fa-fire", "Incidents")}
      ${item("ai-analysis", "fa-brain", "AI Analysis")}
      ${item("mitre", "fa-diagram-project", "MITRE ATT&CK")}
      ${item("threat-intel", "fa-virus", "Threat Intel")}
      ${item("risk", "fa-chart-pie", "Risk Analysis")}

      <div class="nav-divider">Management</div>
      ${item("assets", "fa-server", "Assets")}
      ${item("response", "fa-bolt", "Response (SOAR)")}
      ${item("reports", "fa-file-lines", "Reports")}
      ${item("notifications", "fa-envelope", "Notifications")}
      ${item("admin", "fa-gear", "Admin")}
    </div>
    <div class="sidebar-footer" id="logout-btn">
      <i class="fas fa-right-from-bracket"></i> Logout
    </div>
  </div>`;
}

function buildTopbar(info) {
  return `
  <div class="topbar">
    <div class="topbar-title" id="page-title">
      <i class="fas ${info.i} blue" style="font-size:14px"></i> ${info.t}
    </div>
    <div class="topbar-actions">
      <i class="fas fa-expand" onclick="document.documentElement.requestFullscreen()"></i>
      <i class="fas fa-circle-question"></i>
      <div class="notif-badge" id="notif-badge" data-count="0"><i class="fas fa-bell"></i></div>
      <div class="avatar" id="user-avatar">A</div>
    </div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const pageKey = document.body.dataset.page;
  const info = PAGE_TITLES[pageKey] || { t: "Aegis-SOC", i: "fa-shield-halved" };
  document.title = `Aegis-SOC | ${info.t}`;

  // ================= AUTH GUARD =================
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.replace("index.html");
      return;
    }

    // Inject layout (old pages with inline topbar keep theirs)
    const sSlot = document.getElementById("sidebar-slot");
    if (sSlot) sSlot.outerHTML = buildSidebar(pageKey);

    const tSlot = document.getElementById("topbar-slot");
    if (tSlot) tSlot.outerHTML = buildTopbar(info);

    const avatar = document.getElementById("user-avatar");
    if (avatar) avatar.textContent = (user.email || "U").charAt(0).toUpperCase();

    const app = document.getElementById("app");
    if (app) app.style.display = "flex";

    const loader = document.getElementById("page-loader");
    if (loader) loader.remove();

    // ===== LIVE unread-notification badge (Firebase RTDB) =====
    if (db) {
      db.ref("notifications").on("value", (snap) => {
        const badgeEl = document.getElementById("notif-badge");
        if (!badgeEl) return;
        const val = snap.val() || {};
        const unread = Object.values(val).filter((n) => n && !n.read).length;
        badgeEl.dataset.count = unread;
      }, () => {});
    }

    window.dispatchEvent(new Event("aegis-ready"));
  });
});

// Logout (delegated)
document.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest("#logout-btn")) {
    auth.signOut().then(() => window.location.replace("index.html"));
  }
});