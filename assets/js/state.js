import {
  loadDefaultStatusFromStorage
} from "./storage.js";

// =========================
// APP STATE
// =========================
export let tickets = [];
export let activityLogs = [];

export let selectedTicket = null;
export let editingTicketId = null;
export let draggedTicketId = null;

export let currentFilter = "All";
export let currentPriorityFilter = "All";
export let currentCategoryFilter = "All";
export let currentAssigneeFilter = "All";
export let currentSort = "Latest";
export let searchQuery = "";

export let currentPage = 1;
export const itemsPerPage = 5;

export let defaultStatus = loadDefaultStatusFromStorage();

// =========================
// BASIC STATE SETTERS
// =========================
export function setTickets(loadedTickets) {
  tickets = Array.isArray(loadedTickets) ? loadedTickets : [];
}

export function setActivityLogs(logs) {
  activityLogs = Array.isArray(logs) ? logs : [];
}

export function addTicket(ticket) {
  tickets.push(ticket);
}

export function setSelectedTicket(ticket) {
  selectedTicket = ticket;
}

export function setEditingTicket(id) {
  editingTicketId = id;
}

export function setDraggedTicketId(id) {
  draggedTicketId = id;
}

export function setFilter(filter) {
  currentFilter = filter;
  currentPage = 1;
}

export function setPriorityFilter(value) {
  currentPriorityFilter = value;
  currentPage = 1;
}

export function setCategoryFilter(value) {
  currentCategoryFilter = value;
  currentPage = 1;
}

export function setAssigneeFilter(value) {
  currentAssigneeFilter = value;
  currentPage = 1;
}

export function setSort(sort) {
  currentSort = sort;
}

export function setSearchQuery(query) {
  searchQuery = String(query || "").toLowerCase();
  currentPage = 1;
}

export function setPage(page) {
  currentPage = page;
}

export function setDefaultStatus(status) {
  defaultStatus = status;
}

// =========================
// TICKET HELPERS
// =========================
export function getTicketById(id) {
  return tickets.find(ticket => ticket.id === id);
}

export function deleteTicket(id) {
  const index = tickets.findIndex(ticket => ticket.id === id);

  if (index === -1) return null;

  const [deletedTicket] = tickets.splice(index, 1);
  return deletedTicket;
}

export function generateTicketId() {
  if (tickets.length === 0) return "#SD-1001";

  const numbers = tickets
    .map(ticket => parseInt(String(ticket.id).replace("#SD-", ""), 10))
    .filter(num => !Number.isNaN(num));

  const max = numbers.length ? Math.max(...numbers) : 1000;
  return `#SD-${max + 1}`;
}

// =========================
// GLOBAL ACTIVITY
// =========================
export function addGlobalActivity(log) {
  activityLogs.unshift(log);
}