import { sidebarNav, modal, openBtn, closeBtn, form, ticketList, closeDetailBtn, detailPanel, layout } from "./dom.js";
import { switchView, setActiveSidebar, openModal, closeModal } from "./ui.js";
import { addTicket, setSelectedTicket, getTicketById } from "./state.js";
import { renderTickets, renderTicketDetail, setActiveFilterButton} from "./ui.js";
import { updateTicketStatus } from "./state.js";
import { setFilter, setSort, setSearchQuery, deleteTicket, tickets } from "./state.js";
import { saveTicketsToStorage } from "./storage.js";
import { currentPage, setPage } from "./state.js";


// ================= SIDEBAR =================
export function initSidebarEvents() {
  if (!sidebarNav) return;

  sidebarNav.addEventListener("click", (e) => {

    const item = e.target.closest(".sidebar_item");
    if (!item) return;

    e.preventDefault();

    const view = item.dataset.view;

    // ✅ highlight sidebar
    setActiveSidebar(item);

    // ✅ switch screen
    switchView(view);

    // 🔥 RESET SEARCH (THIS IS YOUR CODE)
    setSearchQuery("");

    const searchInput = document.querySelector(".search-input");
    if (searchInput) {
      searchInput.value = "";
    }

    // 🔥 re-render tickets clean
    renderTickets();

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
     
    renderDashboardStats(tickets);

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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      detailPanel.classList.add("hidden");
      layout.classList.add("no-detail");
    }
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

    renderTickets();

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

    renderDashboardStats(tickets);

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

  // 🔥 LIVE SEARCH
  searchInput.addEventListener("input", (e) => {

    const value = e.target.value;

    setSearchQuery(value);

    // 🔥 AUTO SWITCH TO TICKETS VIEW
    if (value.trim() !== "") {
      switchView("tickets");

      const ticketNav = document.querySelector('[data-view="tickets"]');
      if (ticketNav) {
        setActiveSidebar(ticketNav);
      }
    }

    renderTickets();
  });

  // 🔥 ENTER KEY SUPPORT
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const value = searchInput.value;

      setSearchQuery(value);

      // 🔥 ALSO SWITCH VIEW ON ENTER
      if (value.trim() !== "") {
        switchView("tickets");

        const ticketNav = document.querySelector('[data-view="tickets"]');
        if (ticketNav) {
          setActiveSidebar(ticketNav);
        }
      }

      renderTickets();
    });
  }

}



export function initDeleteEvents() {

  const deleteBtn = document.getElementById("delete-ticket-btn");

  if (!deleteBtn) {
    console.error("Delete button not found");
    return;
  }

  deleteBtn.addEventListener("click", () => {

    const activeItem = document.querySelector(".ticket-item.active");

    if (!activeItem) {
      console.warn("No active ticket selected");
      return;
    }

    const id = activeItem.dataset.id;

    // remove from state
    deleteTicket(id);

    // save
    saveTicketsToStorage(tickets);

    // re-render list
    renderTickets();

     renderDashboardStats(tickets);

    // handle selection
    if (tickets.length > 0) {
      setSelectedTicket(tickets[0]);
      renderTicketDetail(tickets[0]);
    } else {
      setSelectedTicket(null);
      document.querySelector(".ticket-detail").classList.add("hidden");
    }

  });
}

export function initPaginationEvents() {

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (!prevBtn || !nextBtn) {
    console.error("Pagination buttons NOT found");
    return;
  }

  console.log("Pagination initialized"); // 🔥 DEBUG

  prevBtn.addEventListener("click", () => {
    console.log("Prev clicked");

    if (currentPage > 1) {
      setPage(currentPage - 1);
      renderTickets();
    }
  });

  nextBtn.addEventListener("click", () => {
    console.log("Next clicked");

    setPage(currentPage + 1);
    renderTickets();
  });

}

export function initDashboardCardEvents() {
  const cards = document.querySelectorAll(".dashboard-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {

      const filter = card.dataset.filter;

      // switch page
      switchView("tickets");

      // set filter
      setFilter(filter);

      // 🔥 UPDATE UI BUTTON
      setActiveFilterButton(filter);

      // render
      renderTickets();

    });
  });
}