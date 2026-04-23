import {
  sidebarNav,
  modal,
  openBtn,
  closeBtn,
  cancelBtn,
  form,
  ticketList,
  closeDetailBtn,
  detailPanel,
  layout,
  deleteTicketBtn,
  editTicketBtn,
  searchForm,
  searchInput,
  sortSelect,
  categoryFilterSelect,
  assigneeFilterSelect,
  statusFilterButtons,
  prevPageBtn,
  nextPageBtn,
  clearBtn,
  exportBtn,
  importFileInput,
  defaultStatusSelect,
  themeToggleBtn,
  reportFilter,
  kanbanBoard
} from "./dom.js";

import {
  tickets,
  activityLogs,
  selectedTicket,
  editingTicketId,
  draggedTicketId,
  defaultStatus,
  setTickets,
  setActivityLogs,
  addTicket,
  setSelectedTicket,
  getTicketById,
  deleteTicket,
  setEditingTicket,
  setDraggedTicketId,
  setFilter,
  setSort,
  setSearchQuery,
  setPage,
  generateTicketId,
  setDefaultStatus,
  setCategoryFilter,
  setAssigneeFilter,
  addGlobalActivity
} from "./state.js";

import {
  saveTicketsToStorage,
  saveActivityToStorage,
  saveThemeToStorage
} from "./storage.js";

import {
  switchView,
  setActiveSidebar,
  openModal,
  closeModal,
  renderTickets,
  renderTicketDetail,
  renderDashboardStats,
  renderActivity,
  renderReports,
  renderSettingsStats,
  renderKanban,
  setActiveFilterButton
} from "./ui.js";

import { broadcastUpdate } from "./sync.js";
import { showToast } from "./helpers.js";
// =========================
// HELPERS
// =========================
function persistAll() {
  saveTicketsToStorage(tickets);
  saveActivityToStorage(activityLogs);
  broadcastUpdate({
    type: "SYNC_TICKETS",
    payload: tickets
  });
}

function addTicketActivity(ticket, entry) {
  if (!ticket.activity) ticket.activity = [];
  ticket.activity.push(entry);

  addGlobalActivity({
    ...entry,
    ticketId: ticket.id,
    ticketTitle: ticket.title
  });
}

function refreshAllViews() {
  renderTickets();
  renderDashboardStats(tickets);
  renderActivity();
  renderReports(tickets);
  renderSettingsStats();
  renderKanban(tickets);
}

function resetModalToCreateMode() {
  setEditingTicket(null);

  form.reset();

  const statusField = document.getElementById("ticket-status");
  if (statusField) {
    statusField.value = defaultStatus;
  }

  const titleEl = document.querySelector(".modal-header h2");
  const submitBtn = document.querySelector('#ticket-form button[type="submit"]');

  if (titleEl) titleEl.textContent = "Create New Ticket";
  if (submitBtn) submitBtn.textContent = "Create Ticket";
}

function openDetailPanel() {
  if (detailPanel) detailPanel.classList.remove("hidden");
  if (layout) layout.classList.remove("no-detail");
}

function closeDetailPanel() {
  if (detailPanel) detailPanel.classList.add("hidden");
  if (layout) layout.classList.add("no-detail");
}

// =========================
// SIDEBAR
// =========================
export function initSidebarEvents() {
  if (!sidebarNav) return;

  sidebarNav.addEventListener("click", (e) => {
    const item = e.target.closest(".sidebar_item");
    if (!item) return;

    e.preventDefault();

    const view = item.dataset.view;

    setActiveSidebar(item);
    switchView(view);
  });
}

// =========================
// MODAL / CREATE / EDIT
// =========================
export function initModalEvents() {
  if (!openBtn || !modal || !form) return;

  openBtn.addEventListener("click", () => {
    resetModalToCreateMode();
    openModal(modal);
  });

  closeBtn?.addEventListener("click", () => {
    closeModal(modal);
    resetModalToCreateMode();
  });

  cancelBtn?.addEventListener("click", () => {
    closeModal(modal);
    resetModalToCreateMode();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("ticket-title")?.value || "";
    const user = document.getElementById("ticket-user")?.value || "";
    const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
    const assignee = document.getElementById("ticket-assignee")?.value || loggedInUser?.role || "Support";
    const priority = document.getElementById("ticket-priority")?.value || "Low";
    const category = document.getElementById("ticket-category")?.value || "General";
    const department = document.getElementById("ticket-department")?.value || "General";
    const status = document.getElementById("ticket-status")?.value || "New";
    const description = document.getElementById("ticket-description")?.value || "";

    // ================= EDIT MODE =================
    if (editingTicketId) {

      const ticket = getTicketById(editingTicketId);
      if (!ticket) return;

      const oldStatus = ticket.status;

      // update fields
      ticket.title = title;
      ticket.user = user;
      ticket.assignee = assignee;
      ticket.priority = priority;
      ticket.category = category;
      ticket.department = department;
      ticket.status = status;
      ticket.description = description;

      addTicketActivity(ticket, {
        type: "update",
        message: "Ticket updated",
        time: Date.now()
      });
      showToast("Ticket updated");
      if (oldStatus !== status) {
        addTicketActivity(ticket, {
          type: "status",
          message: "Status changed",
          from: oldStatus,
          to: status,
          time: Date.now()
        });
      }

    } else {

      // ================= CREATE MODE =================
      const newTicket = {
        id: generateTicketId(),
        title,
        user,
        assignee,
        priority,
        category,
        department,
        status,
        description,
        createdAt: Date.now(),
        activity: []
      };

      addTicketActivity(newTicket, {
        type: "create",
        message: "Ticket created",
        to: status,
        time: Date.now()
      });

      addTicket(newTicket);
      showToast("Ticket created");
    }

    // ================= RESET =================
    resetModalToCreateMode();

    persistAll();
    refreshAllViews();

    closeModal(modal);
  });
}

function openEditModal(ticketId) {
  const ticket = getTicketById(ticketId);
  if (!ticket) return;

  setEditingTicket(ticketId);

  document.getElementById("ticket-title").value = ticket.title;
  document.getElementById("ticket-user").value = ticket.user;
  document.getElementById("ticket-assignee").value = ticket.assignee || "";
  document.getElementById("ticket-priority").value = ticket.priority || "Low";
  document.getElementById("ticket-category").value = ticket.category || "General";
  document.getElementById("ticket-department").value = ticket.department;
  document.getElementById("ticket-status").value = ticket.status;
  document.getElementById("ticket-description").value = ticket.description || "";

  const titleEl = document.querySelector(".modal-header h2");
  const submitBtn = document.querySelector('#ticket-form button[type="submit"]');

  if (titleEl) titleEl.textContent = "Edit Ticket";
  if (submitBtn) submitBtn.textContent = "Update Ticket";

  openModal(modal);
}

// =========================
// DETAIL PANEL
// =========================
export function initDetailEvents() {
  closeDetailBtn?.addEventListener("click", () => {
    setSelectedTicket(null);
    closeDetailPanel();
    renderTicketDetail(null);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDetailPanel();
    }
  });

  editTicketBtn?.addEventListener("click", () => {
    const ticketId = editTicketBtn.dataset.id;
    if (!ticketId) return;
    openEditModal(ticketId);
  });
}

// =========================
// TICKET CLICK
// =========================
export function initTicketEvents() {
  if (!ticketList) return;

  ticketList.addEventListener("click", (e) => {

    if (e.target.classList.contains("empty-create-btn")) {
      openBtn.click();
      return;
    }

    const item = e.target.closest(".ticket-item");
    if (!item) return;

    const ticket = getTicketById(item.dataset.id);
    if (!ticket) return;

    setSelectedTicket(ticket);
    renderTickets();
    renderTicketDetail(ticket);
    openDetailPanel();
  });
}

// =========================
// STATUS CHANGE
// =========================
export function initStatusEvents() {
  const statusSelect = document.getElementById("detail-status");
  if (!statusSelect) return;

  statusSelect.addEventListener("change", (e) => {
    if (!selectedTicket) return;

    const newStatus = e.target.value;
    const ticket = getTicketById(selectedTicket.id);
    if (!ticket) return;

    const oldStatus = ticket.status;
    if (oldStatus === newStatus) return;

    ticket.status = newStatus;

    addTicketActivity(ticket, {
      type: "status",
      message: "Status changed",
      from: oldStatus,
      to: newStatus,
      time: Date.now()
    });
    showToast("Ticket updated");

    setSelectedTicket(ticket);
    persistAll();
    refreshAllViews();
    renderTicketDetail(ticket);
  });
}

// =========================
// STATUS FILTER BUTTONS
// =========================
export function initFilterEvents() {
  statusFilterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      setFilter(btn.dataset.filter);
      setActiveFilterButton(btn.dataset.filter);
      renderTickets();
    });
  });
}

// =========================
// SORT
// =========================
export function initSortEvents() {
  sortSelect?.addEventListener("change", (e) => {
    setSort(e.target.value);
    renderTickets();
  });
}

// =========================
// SEARCH
// =========================
export function initSearchEvents() {
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    setSearchQuery(e.target.value);

    if (e.target.value.trim() !== "") {
      switchView("tickets");
      const nav = document.querySelector('[data-view="tickets"]');
      if (nav) setActiveSidebar(nav);
    }

    renderTickets();
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.value);
    renderTickets();
  });
}

// =========================
// DELETE
// =========================
export function initDeleteEvents() {
  deleteTicketBtn?.addEventListener("click", () => {
    const ticketId = deleteTicketBtn.dataset.id;
    if (!ticketId) return;

    const ticket = getTicketById(ticketId);
    if (!ticket) return;

    addGlobalActivity({
      type: "delete",
      message: "Ticket deleted",
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      time: Date.now()
    });

    deleteTicket(ticketId);
    showToast("Ticket deleted", "error");

    persistAll();
    refreshAllViews();

    setSelectedTicket(null);
    renderTicketDetail(null);
    closeDetailPanel();
  });
}

// =========================
// PAGINATION
// =========================
export function initPaginationEvents() {
  prevPageBtn?.addEventListener("click", () => {
    if (prevPageBtn.disabled) return;
    setPage(Math.max(1, Number(prevPageBtn.dataset.page || 0) || 1));
    renderTickets();
  });

  nextPageBtn?.addEventListener("click", () => {
    if (nextPageBtn.disabled) return;
    setPage((Number(nextPageBtn.dataset.page || 1) || 1) + 1);
    renderTickets();
  });

  // We will update these dataset values after each render manually below
  const syncPaginationState = () => {
    const current = document.getElementById("page-info")?.textContent || "";
    const match = current.match(/Page\s+(\d+)/i);
    const currentValue = match ? parseInt(match[1], 10) : 1;

    if (prevPageBtn) prevPageBtn.dataset.page = String(currentValue - 1);
    if (nextPageBtn) nextPageBtn.dataset.page = String(currentValue);
  };

  const observer = new MutationObserver(syncPaginationState);
  const pageInfo = document.getElementById("page-info");
  if (pageInfo) observer.observe(pageInfo, { childList: true, subtree: true });
}

// =========================
// DASHBOARD CARDS
// =========================
export function initDashboardCardEvents() {
  const cards = document.querySelectorAll(".dashboard-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const filter = card.dataset.filter;

      switchView("tickets");
      setFilter(filter);
      setActiveFilterButton(filter);
      renderTickets();

      const nav = document.querySelector('[data-view="tickets"]');
      if (nav) setActiveSidebar(nav);
    });
  });
}

// =========================
// CATEGORY FILTER
// =========================
export function initCategoryFilterEvents() {
  categoryFilterSelect?.addEventListener("change", (e) => {
    setCategoryFilter(e.target.value);
    renderTickets();
  });
}

// =========================
// ASSIGNEE FILTER
// =========================
export function initAssigneeFilterEvents() {
  assigneeFilterSelect?.addEventListener("change", (e) => {
    setAssigneeFilter(e.target.value);
    renderTickets();
  });
}

// =========================
// SETTINGS
// =========================
export function initSettingsEvents() {
  const clearBtn = document.getElementById("clear-btn");
  const lightBtn = document.getElementById("theme-light");
  const darkBtn = document.getElementById("theme-dark");

  // ================= CLEAR DATA =================
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem("supportdesk_tickets");
      location.reload();
    });
  }

  // ================= THEME =================
  const savedTheme = localStorage.getItem("theme") || "dark";

  applyTheme(savedTheme);

  if (lightBtn) {
    lightBtn.addEventListener("click", () => {
      applyTheme("light");
    });
  }

  if (darkBtn) {
    darkBtn.addEventListener("click", () => {
      applyTheme("dark");
    });
  }
}

function applyTheme(mode) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(mode);

  localStorage.setItem("theme", mode);

  // update UI buttons
  const lightBtn = document.getElementById("theme-light");
  const darkBtn = document.getElementById("theme-dark");

  lightBtn?.classList.remove("active");
  darkBtn?.classList.remove("active");

  if (mode === "light") {
    lightBtn?.classList.add("active");
  } else {
    darkBtn?.classList.add("active");
  }
}
// =========================
// REPORT FILTER
// =========================
export function initReportFilterEvents() {
  reportFilter?.addEventListener("change", (e) => {
    const value = e.target.value;

    let filtered = [...tickets];

    if (value !== "all") {
      const days = parseInt(value, 10);
      const now = Date.now();

      filtered = filtered.filter(ticket => {
        return ticket.createdAt && (now - ticket.createdAt) <= days * 24 * 60 * 60 * 1000;
      });
    }

    renderReports(filtered);
  });
}

// =========================
// KANBAN
// =========================
export function initKanbanEvents() {
  if (!kanbanBoard) return;

  kanbanBoard.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".kanban-card");
    if (!card) return;

    setDraggedTicketId(card.dataset.id);
    card.classList.add("dragging");
  });

  kanbanBoard.addEventListener("dragend", (e) => {
    const card = e.target.closest(".kanban-card");
    if (!card) return;

    card.classList.remove("dragging");

    document.querySelectorAll(".kanban-list").forEach(list => {
      list.classList.remove("drag-over");
    });

    setDraggedTicketId(null);
  });

  kanbanBoard.addEventListener("dragover", (e) => {
    const list = e.target.closest(".kanban-list");
    if (!list) return;

    e.preventDefault();

    document.querySelectorAll(".kanban-list").forEach(col => {
      col.classList.remove("drag-over");
    });

    list.classList.add("drag-over");
  });

  kanbanBoard.addEventListener("drop", (e) => {
    const list = e.target.closest(".kanban-list");
    if (!list || !draggedTicketId) return;

    e.preventDefault();

    let newStatus = "";
    if (list.id === "kanban-new") newStatus = "New";
    if (list.id === "kanban-progress") newStatus = "In Progress";
    if (list.id === "kanban-waiting") newStatus = "Waiting";
    if (list.id === "kanban-resolved") newStatus = "Resolved";

    if (!newStatus) return;

    const ticket = getTicketById(draggedTicketId);
    if (!ticket) return;

    const oldStatus = ticket.status;
    if (oldStatus === newStatus) return;

    ticket.status = newStatus;

    addTicketActivity(ticket, {
      type: "status",
      message: "Status changed",
      from: oldStatus,
      to: newStatus,
      time: Date.now()
    });
    showToast("Status updated");

    setSelectedTicket(ticket);
    persistAll();
    refreshAllViews();
    renderTicketDetail(ticket);
  });
}