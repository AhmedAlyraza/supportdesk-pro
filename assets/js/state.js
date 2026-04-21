export let tickets = [];
export let selectedTicket = null;
export let editingTicketId = null;

export let currentFilter = "All";
export let currentSort = "Latest";
export let searchQuery = "";

export let currentPage = 1;
export const itemsPerPage = 5;
export let currentPriorityFilter = "All";
export let currentCategoryFilter = "All";
export let currentAssigneeFilter = "All";

export let defaultStatus = localStorage.getItem("defaultStatus") || "New";
export function setDefaultStatus(status) {
  defaultStatus = status;
  localStorage.setItem("defaultStatus", status);
}

export function setTickets(loadedTickets) {
  tickets = loadedTickets;
}

export function addTicket(ticket) {
  tickets.push(ticket);
}

export function setSelectedTicket(ticket) {
  selectedTicket = ticket;
}

export function getTicketById(id) {
  return tickets.find(ticket => ticket.id === id);
}

// Update ticket status in state
export function updateTicketStatus(id, newStatus) {
  const ticket = tickets.find(t => t.id === id);

  if (ticket) {

    // ❗ Prevent duplicate logs
    if (ticket.status === newStatus) return;

    ticket.status = newStatus;

    if (!ticket.activity) ticket.activity = [];

    ticket.activity.push(`Status changed to ${newStatus}`);

    if (ticket.activity.length > 10) {
      ticket.activity.shift(); // remove oldest entry
    }
  }
}


// set filter
export function setFilter(filter) {
  currentFilter = filter;
}


export function setSort(sort) {
  currentSort = sort;
}

export function setSearchQuery(query) {
  searchQuery = query.toLowerCase();
}

export function deleteTicket(id) {
  tickets = tickets.filter(t => t.id !== id);
}

export function setPage(page) {
  currentPage = page;
}

export function setEditingTicket(id) {
  editingTicketId = id;
}


export function generateTicketId() {
  if (tickets.length === 0) return "#SD-1001";

  const numbers = tickets.map(t =>
    parseInt(t.id.replace("#SD-", ""), 10)
  );

  const max = Math.max(...numbers);

  return "#SD-" + (max + 1);
}


export function setPriorityFilter(val) {
  currentPriorityFilter = val;
}

export function setCategoryFilter(val) {
  currentCategoryFilter = val;
}

export function setAssigneeFilter(val) {
  currentAssigneeFilter = val;
}
