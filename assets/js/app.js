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
  initPaginationEvents
} from "./events.js";

import {
  renderTickets,
  renderTicketDetail
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
  const storedTickets = loadTicketsFromStorage();
  setTickets(storedTickets);
  // Init all event systems
  initSidebarEvents();
  initModalEvents();
  initTicketEvents();
  initDetailEvents();

  initStatusEvents();
  initFilterEvents();

  initSortEvents();
  initSearchEvents();

  // Initial render
  renderTickets();

  initDeleteEvents();
  initPaginationEvents();

  // ✅ IMPORTANT FIX (default state)
  if (detailPanel && layout) {
    detailPanel.classList.add("hidden");
    layout.classList.add("no-detail");
  }

});