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
  initDashboardCardEvents
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
  setSelectedTicket
} from "./state.js";

import { loadTicketsFromStorage } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
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