import { sidebarNav, modal, openBtn, closeBtn, form, ticketList, closeDetailBtn, detailPanel, layout } from "./dom.js";
import { switchView, setActiveSidebar, openModal, closeModal } from "./ui.js";
import { addTicket, setSelectedTicket, getTicketById } from "./state.js";
import { renderTickets, renderTicketDetail } from "./ui.js";

import { updateTicketStatus } from "./state.js";
import { setFilter, setSort, setSearchQuery, tickets } from "./state.js";

import { saveTicketsToStorage } from "./storage.js";
// ================= SIDEBAR =================
export function initSidebarEvents() {
  if (!sidebarNav) return;

  sidebarNav.addEventListener("click", (e) => {
    const item = e.target.closest(".sidebar_item");
    if (!item) return;

    e.preventDefault();

    setActiveSidebar(item);
    switchView(item.dataset.view);
  });
}



// ================= MODAL =================
export function initModalEvents() {

  if (!openBtn || !modal || !form) return;

  openBtn.addEventListener("click", () => openModal(modal));

  closeBtn.addEventListener("click", () => closeModal(modal));

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newTicket = {
      id: "#SD-" + Math.floor(Math.random() * 10000),
      title: document.getElementById("ticket-title").value,
      user: document.getElementById("ticket-user").value,
      department: document.getElementById("ticket-department").value,
      status: document.getElementById("ticket-status").value,
      activity: ["Ticket created"],

      createdAt: Date.now()
    };

    // Update state
    addTicket(newTicket);
    setSelectedTicket(newTicket);
    saveTicketsToStorage(tickets);

    // Update UI
    renderTickets();
    renderTicketDetail(newTicket);

    // Show detail panel
    detailPanel.classList.remove("hidden");
    layout.classList.remove("no-detail");

    closeModal(modal);
    form.reset();
  });
}



// ================= DETAIL CLOSE =================
export function initDetailEvents() {

  if (!closeDetailBtn) return;

  closeDetailBtn.addEventListener("click", () => {

    setSelectedTicket(null);

    detailPanel.classList.add("hidden");
    layout.classList.add("no-detail");

  });

}


// ================= TICKET CLICK =================
export function initTicketEvents() {

  if (!ticketList) return;

  ticketList.addEventListener("click", (e) => {

    const item = e.target.closest(".ticket-item");
    if (!item) return;

    const ticket = getTicketById(item.dataset.id);
    if (!ticket) return;

    setSelectedTicket(ticket);

    // DO NOT re-render list here
    renderTicketDetail(ticket);

    // Show panel
    detailPanel.classList.remove("hidden");
    layout.classList.remove("no-detail");

  });
}


export function initStatusEvents() {

  const statusSelect = document.getElementById("detail-status");

  if (!statusSelect) return;

  statusSelect.addEventListener("change", (e) => {

    const newStatus = e.target.value;

    // get selected ticket
    const activeItem = document.querySelector(".ticket-item.active");
    if (!activeItem) return;

    const ticketId = activeItem.dataset.id;

    // update state
    updateTicketStatus(ticketId, newStatus);
    saveTicketsToStorage(tickets);
    // update UI
    renderTickets();

    const updatedTicket = getTicketById(ticketId);
    if (updatedTicket) {
      renderTicketDetail(updatedTicket);
      setSelectedTicket(updatedTicket);
    }

  });

}


export function initFilterEvents() {

  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {

      // remove active class
      filterBtns.forEach(b => b.classList.remove("active"));

      // add active to clicked
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      // update state
      setFilter(filter);

      // update UI
      renderTickets();
    });
  });

}

export function initSortEvents() {

  const sortSelect = document.getElementById("sort-select");

  if (!sortSelect) return;

  sortSelect.addEventListener("change", (e) => {

    const value = e.target.value;

    setSort(value);
    renderTickets();

  });

}

export function initSearchEvents() {

  const searchInput = document.querySelector(".search-input");
  const searchForm = document.getElementById("search-form");

  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    setSearchQuery(e.target.value);
    renderTickets();
  });

  // 🔥 ENTER KEY SUPPORT
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault(); // ❗ STOP PAGE RELOAD

      setSearchQuery(searchInput.value);
      renderTickets();
    });
  }

}