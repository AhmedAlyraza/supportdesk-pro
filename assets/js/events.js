import { sidebarNav, modal, openBtn, closeBtn, form, ticketList, closeDetailBtn, detailPanel, layout } from "./dom.js";
import { switchView, setActiveSidebar, openModal, closeModal } from "./ui.js";
import { addTicket, setSelectedTicket, getTicketById } from "./state.js";
import { renderTickets, renderTicketDetail, setActiveFilterButton } from "./ui.js";
import { updateTicketStatus } from "./state.js";
import { setFilter, setSort, setSearchQuery, deleteTicket, tickets } from "./state.js";
import { saveTicketsToStorage } from "./storage.js";
import { currentPage, setPage, setTickets } from "./state.js";
import { renderDashboardStats } from "./ui.js";
import { setEditingTicket, editingTicketId, generateTicketId, setDefaultStatus, defaultStatus, setPriorityFilter } from "./state.js";
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

  openBtn.addEventListener("click", () => {

    // 🔥 Apply default status to form
    const statusField = document.getElementById("ticket-status");
    if (statusField) {
      statusField.value = defaultStatus;
    }

    openModal(modal);
  });

  closeBtn.addEventListener("click", () => closeModal(modal));

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("ticket-title").value.trim();
    const user = document.getElementById("ticket-user").value.trim();
    const priority = document.getElementById("ticket-priority").value;
    const category = document.getElementById("ticket-category").value;
    const assignee = document.getElementById("ticket-assignee").value;
    const department = document.getElementById("ticket-department").value;
    const status = document.getElementById("ticket-status").value || defaultStatus;
    const description = document.getElementById("ticket-description").value.trim();

    // 🔥 1. VALIDATION (IMPORTANT)
    if (!title || !user) {
      alert("Title and User are required");
      return;
    }

    let activeTicket = null;

    // 🔥 2. EDIT MODE
    if (editingTicketId) {
      const ticket = getTicketById(editingTicketId);
      const oldStatus = ticket.status;
      if (ticket) {
        ticket.title = title;
        ticket.user = user;
        ticket.assignee = assignee;
        ticket.category = category;
        ticket.priority = priority;
        ticket.department = department;
        ticket.status = status;
        ticket.description = description;

        if (!ticket.activity) ticket.activity = [];
        // ✔ General update log
        ticket.activity.push({
          type: "update",
          message: "Ticket updated",
          time: Date.now()
        });

        // ✔ Status change log (only if changed)
        if (oldStatus !== status) {
          ticket.activity.push({
            type: "status",
            message: "Status changed",
            from: oldStatus,
            to: status,
            time: Date.now()
          });
        }
        activeTicket = ticket;
      }

    } else {
      // 🔥 3. CREATE MODE
      const newTicket = {
        id: generateTicketId(), title,
        title,
        user,
        assignee,
        category,
        priority,
        department,
        status,
        description,
        createdAt: Date.now(),
        activity: [
          {
            type: "create",
            message: "Ticket created",
            from: null,
            to: status,
            time: Date.now()
          }
        ]
      };

      addTicket(newTicket);
      activeTicket = newTicket;
    }

    // 🔥 4. RESET EDIT STATE
    setEditingTicket(null);

    // 🔥 5. SAVE TO LOCAL STORAGE (VERY IMPORTANT)
    saveTicketsToStorage(tickets);

    // 🔥 6. UPDATE UI
    setSelectedTicket(activeTicket);

    renderTickets();
    renderTicketDetail(activeTicket);
    renderDashboardStats(tickets);

    // 🔥 7. SHOW DETAIL PANEL
    detailPanel.classList.remove("hidden");
    layout.classList.remove("no-detail");

    // 🔥 8. REDIRECT TO TICKETS VIEW
    switchView("tickets");

    // 🔥 9. RESET FORM UI
    document.querySelector(".modal-header h2").textContent = "Create New Ticket";
    document.querySelector("#ticket-form button[type='submit']").textContent = "Create Ticket";

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

    const ticket = getTicketById(id);

    if (ticket) {
      ticket.activity.push({
        type: "delete",
        message: "Ticket deleted",
        time: Date.now()
      });
    }
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


function openEditModal(ticketId) {
  const ticket = getTicketById(ticketId);
  if (!ticket) return;

  setEditingTicket(ticketId);

  // 🔥 Prefill form
  document.getElementById("ticket-title").value = ticket.title;
  document.getElementById("ticket-user").value = ticket.user;
  document.getElementById("ticket-department").value = ticket.department;
  document.getElementById("ticket-status").value = ticket.status;
  document.getElementById("ticket-description").value = ticket.description || "";

  // 🔥 Change UI text
  document.querySelector(".modal-header h2").textContent = "Edit Ticket";
  document.querySelector("#ticket-form button[type='submit']").textContent = "Update Ticket";

  openModal(modal);
}


document.addEventListener("click", (e) => {

  const editBtn = document.getElementById("edit-ticket-btn");

  if (e.target.id === "edit-ticket-btn") {
    const ticketId = e.target.dataset.id;
    openEditModal(ticketId);
  }

});

export function initSettingsEvents() {

  const btn = document.getElementById("clear-data-btn");

  if (!btn) return;

  btn.addEventListener("click", () => {

    if (!confirm("Are you sure you want to delete all tickets?")) return;

    setTickets([]);
    saveTicketsToStorage([]);

    renderTickets();

    alert("All tickets cleared");
  });
}


document.getElementById("clear-btn")?.addEventListener("click", () => {

  const confirmDelete = confirm(
    "This will permanently delete ALL tickets.\n\nThis cannot be undone."
  );

  if (!confirmDelete) return;

  localStorage.removeItem("tickets");
  location.reload();
});
document.getElementById("export-btn")?.addEventListener("click", () => {

  if (!tickets.length) {
    alert("No tickets to export");
    return;
  }

  const blob = new Blob([JSON.stringify(tickets, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `tickets-${Date.now()}.json`;
  a.click();

});
document.getElementById("import-file")?.addEventListener("change", (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const imported = JSON.parse(event.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid file format");
        return;
      }

      setTickets(imported);
      saveTicketsToStorage(imported);

      renderTickets();
      renderDashboardStats(imported);

      alert("Import successful");

    } catch (err) {
      alert("Invalid JSON file");
    }
  };

  reader.readAsText(file);
});
document.getElementById("default-status")?.addEventListener("change", (e) => {
  setDefaultStatus(e.target.value);
});
document.getElementById("report-filter")?.addEventListener("change", (e) => {

  const value = e.target.value;

  let filtered = tickets;

  if (value !== "all") {
    const days = parseInt(value);
    const now = Date.now();

    filtered = tickets.filter(t => {
      return t.createdAt && (now - t.createdAt) <= days * 24 * 60 * 60 * 1000;
    });
  }

  renderReports(filtered);
});

const priority = document.getElementById("ticket-priority").value;

export function initPriorityFilterEvents() {
  const priorityButtons = document.querySelectorAll(".priority-filter-btn");

  priorityButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      priorityButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      setPriorityFilter(btn.dataset.priority);
      renderTickets();
    });
  });
}

document.querySelectorAll("[data-category]").forEach(btn => {
  btn.addEventListener("click", () => {
    setCategoryFilter(btn.dataset.category);
    renderTickets();
  });
});

document.querySelectorAll("[data-assignee]").forEach(btn => {
  btn.addEventListener("click", () => {
    setAssigneeFilter(btn.dataset.assignee);
    renderTickets();
  });
});


const themeBtn = document.getElementById("theme-toggle");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }

  });
}