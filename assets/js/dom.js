// =========================
// CORE LAYOUT
// =========================
export const sidebarNav = document.querySelector(".sidebar_nav");
export const detailPanel = document.getElementById("ticket-detail");
export const layout = document.querySelector(".dashboard-layout");

// =========================
// MODAL
// =========================
export const modal = document.getElementById("ticket-modal");
export const openBtn = document.getElementById("new-ticket-btn");
export const closeBtn = document.querySelector(".modal-close");
export const cancelBtn = document.getElementById("cancel-btn");
export const form = document.getElementById("ticket-form");
// =========================
// TICKET LIST / DETAIL
// =========================
export const ticketList = document.getElementById("ticket-list");
export const closeDetailBtn = document.querySelector(".ticket-detail__close");
export const deleteTicketBtn = document.getElementById("delete-ticket-btn");
export const editTicketBtn = document.getElementById("edit-ticket-btn");

// =========================
// FILTERS / SORT / SEARCH
// =========================
export const searchForm = document.getElementById("search-form");
export const searchInput = document.querySelector(".search-input-topbar");
export const sortSelect = document.getElementById("sort-select");
export const categoryFilterSelect = document.getElementById("category-filter");
export const assigneeFilterSelect = document.getElementById("assignee-filter");
export const statusFilterButtons = document.querySelectorAll(".filter-btn");

// =========================
// PAGINATION
// =========================
export const prevPageBtn = document.getElementById("prev-page");
export const nextPageBtn = document.getElementById("next-page");
export const pageInfo = document.getElementById("page-info");

// =========================
// SETTINGS
// =========================
export const clearBtn = document.getElementById("clear-btn");
export const exportBtn = document.getElementById("export-btn");
export const importFileInput = document.getElementById("import-file");
export const defaultStatusSelect = document.getElementById("default-status");
export const themeToggleBtn = document.getElementById("theme-toggle");

// =========================
// REPORTS
// =========================
export const reportFilter = document.getElementById("report-filter");

// =========================
// KANBAN
// =========================
export const kanbanBoard = document.querySelector(".kanban-board");