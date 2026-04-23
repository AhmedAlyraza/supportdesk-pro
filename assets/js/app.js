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

document.addEventListener("DOMContentLoaded", () => {
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
});