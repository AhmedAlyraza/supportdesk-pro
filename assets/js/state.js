export let tickets = [];
export let selectedTicket = null;

export let currentFilter = "All";
export let currentSort = "Latest";

export let searchQuery = "";

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