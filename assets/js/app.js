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
  initPriorityFilterEvents
} from "./events.js";

import {
  renderTickets,
  renderTicketDetail,
  renderDashboardStats
} from "./ui.js";

import {
  detailPanel,
  layout
} from "./dom.js";

import {
  tickets,
  setTickets,
  setSelectedTicket,
  currentPriorityFilter,
  currentCategoryFilter,
  currentAssigneeFilter,
} from "./state.js";

import { loadTicketsFromStorage } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {

  const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}
  // Load saved tickets first
  const storedTickets = loadTicketsFromStorage() || [];
  setTickets(storedTickets);

  // Initial render
  renderTickets();
  renderDashboardStats(tickets);
  // Init all event systems
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
  initPriorityFilterEvents();
  initCategoryFilterEvents();
  initAssigneeFilterEvents();
  initSettingsEvents();
  if (tickets.length > 0) {
    setSelectedTicket(tickets[0]);
    renderTicketDetail(tickets[0]);
  }

  // ✅ IMPORTANT FIX (default state)
  if (detailPanel && layout) {
    detailPanel.classList.add("hidden");
    layout.classList.add("no-detail");
  }

});