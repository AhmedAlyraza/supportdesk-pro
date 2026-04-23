// =========================
// LOGIN CHECK (TOP LEVEL)
// =========================
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser) {
  window.location.href = "login.html";
}

import {
  initSidebarEvents,
  initModalEvents,
  initTicketEvents,
  initDetailEvents,
  initStatusEvents,
  initFilterEvents,
  initSortEvents,
  initSearchEvents,
  initDeleteEvents,
  initPaginationEvents,
  initDashboardCardEvents,
  initSettingsEvents,
  initCategoryFilterEvents,
  initAssigneeFilterEvents,
  initReportFilterEvents,
  initKanbanEvents
} from "./events.js";

import {
  renderTickets,
  renderTicketDetail,
  renderDashboardStats,
  renderActivity,
  renderReports,
  renderSettingsStats,
  renderKanban
} from "./ui.js";

import {
  detailPanel,
  layout
} from "./dom.js";

import {
  tickets,
  setTickets,
  setActivityLogs,
  setSelectedTicket
} from "./state.js";

import {
  loadTicketsFromStorage,
  loadActivityFromStorage,
  loadThemeFromStorage
} from "./storage.js";

import { initSyncListener } from "./sync.js";


if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("SW error:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     USER login DISPLAY
  ========================= */
  const currentUserNameEl = document.getElementById("current-user-name");

  if (currentUserNameEl && currentUser) {
    currentUserNameEl.textContent = `${currentUser.name} (${currentUser.role})`;
  }

  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });

  if (currentUser?.role === "Support") {
    const settingsNav = document.querySelector('[data-view="settings"]');
    if (settingsNav) {
      settingsNav.style.display = "none";
    }
  }

  // =============================
  // REAL-TIME SYNC 
  // =============================
  initSyncListener((incomingTickets) => {
    setTickets(incomingTickets);

    renderTickets();
    renderDashboardStats(tickets);
  });

  // =========================
  // THEME
  // =========================
  const savedTheme = loadThemeFromStorage();

  document.body.classList.remove("dark", "light");
  document.body.classList.add(savedTheme === "light" ? "light" : "dark");

  // =========================
  // STORAGE LOAD
  // =========================
  const storedTickets = loadTicketsFromStorage();
  const storedActivity = loadActivityFromStorage();

  setTickets(storedTickets);
  setActivityLogs(storedActivity);

  // =========================
  // INITIAL RENDER
  // =========================
  renderTickets();
  renderDashboardStats(tickets);
  renderActivity();
  renderReports(tickets);
  renderSettingsStats();
  renderKanban(tickets);

  // =========================
  // INIT EVENTS
  // =========================
  initSidebarEvents();
  initModalEvents();
  initTicketEvents();
  initDetailEvents();
  initStatusEvents();
  initFilterEvents();
  initSortEvents();
  initSearchEvents();
  initDeleteEvents();
  initPaginationEvents();
  initDashboardCardEvents();
  initSettingsEvents();
  initCategoryFilterEvents();
  initAssigneeFilterEvents();
  initReportFilterEvents();
  initKanbanEvents();

  // =========================
  // DETAIL PANEL DEFAULT
  // =========================
  if (detailPanel && layout) {
    detailPanel.classList.add("hidden");
    layout.classList.add("no-detail");
  }

  if (tickets.length > 0) {
    setSelectedTicket(tickets[0]);
    renderTicketDetail(tickets[0]);
  } else {
    renderTicketDetail(null);
  }

  const topbar = document.querySelector(".topbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      topbar.classList.add("topbar-scrolled");
    } else {
      topbar.classList.remove("topbar-scrolled");
    }
  });
});