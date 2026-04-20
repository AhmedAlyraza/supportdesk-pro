import {
  tickets,
  selectedTicket,
  currentFilter,
  currentSort,
  searchQuery
} from "./state.js";


// ================= SIDEBAR =================
export function setActiveSidebar(item) {
  const sidebarItems = document.querySelectorAll(".sidebar_item");

  sidebarItems.forEach((el) => {
    el.classList.remove("sidebar_item-active");
  });

  item.classList.add("sidebar_item-active");
}


// ================= VIEW SWITCH =================
export function switchView(viewName) {
  const views = document.querySelectorAll(".view");

  views.forEach(v => v.classList.remove("active"));

  const target = document.getElementById(`view-${viewName}`);

  if (target) {
    target.classList.add("active");
  }
}


// ================= MODAL =================
export function openModal(modal) {
  modal.classList.remove("hidden");
}

export function closeModal(modal) {
  modal.classList.add("hidden");
}


// ================= MAIN RENDER =================
export function renderTickets() {
  const list = document.querySelector(".open-requests__list");
  if (!list) return;

  list.innerHTML = "";

  // ================= 1. FILTER =================
  let filteredTickets = currentFilter === "All"
    ? [...tickets]
    : tickets.filter(t => t.status === currentFilter);

  // ================= 2. SEARCH =================
  if (searchQuery) {
    filteredTickets = filteredTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchQuery) ||
      ticket.user.toLowerCase().includes(searchQuery) ||
      ticket.department.toLowerCase().includes(searchQuery)
    );
  }

  // ================= 3. SORT =================
  if (currentSort === "Latest") {
    filteredTickets.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    filteredTickets.sort((a, b) => a.createdAt - b.createdAt);
  }

  // ================= 4. RENDER =================
  filteredTickets.forEach(ticket => {
    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = ticket.id;

    if (selectedTicket && selectedTicket.id === ticket.id) {
      item.classList.add("active");
    }

    item.innerHTML = `
      <div class="ticket-item__top">
        <span>${ticket.id}</span>
        <span class="badge">${ticket.status}</span>
      </div>

      <h3 class="ticket-title">${ticket.title}</h3>
      <p class="ticket-meta">${ticket.user} • ${ticket.department}</p>
    `;

    list.appendChild(item);
  });
}


// ================= DETAIL PANEL =================
export function renderTicketDetail(ticket) {
  if (!ticket) return;

  const detailId = document.getElementById("detail-id");
  const detailTitle = document.getElementById("detail-title");
  const detailMeta = document.getElementById("detail-meta");
  const detailStatus = document.getElementById("detail-status");
  const detailActivity = document.getElementById("detail-activity");

  if (detailId) detailId.textContent = ticket.id;
  if (detailTitle) detailTitle.textContent = ticket.title;
  if (detailMeta) detailMeta.textContent = `${ticket.user} • ${ticket.department}`;
  if (detailStatus) detailStatus.value = ticket.status;

  if (detailActivity) {
    detailActivity.innerHTML = "";

    const activities = ticket.activity && ticket.activity.length
      ? ticket.activity
      : ["Ticket created"];

    activities.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      detailActivity.appendChild(li);
    });
  }
}