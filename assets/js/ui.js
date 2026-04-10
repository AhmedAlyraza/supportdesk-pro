import { tickets } from "./state.js";

export function setActiveSidebar(item) {
  const sidebarItems = document.querySelectorAll(".sidebar_item");

  sidebarItems.forEach((el) => {
    el.classList.remove("sidebar_item-active");
  });

  item.classList.add("sidebar_item-active");
}


export function switchView(viewName) {

  const views = document.querySelectorAll(".view");

  views.forEach(v => v.classList.remove("active"));

  const target = document.getElementById(`view-${viewName}`);

  if (target) {
    target.classList.add("active");
  }

}

export function openModal(modal) {
  modal.classList.remove("hidden");
}

export function closeModal(modal) {
  modal.classList.add("hidden");
}

export function renderTickets() {

  const list = document.querySelector(".open-requests__list");

  // clear old UI
  list.innerHTML = "";

  // loop through tickets
  tickets.forEach(ticket => {

    const item = document.createElement("div");
    item.classList.add("ticket-item");

    item.innerHTML = `
      <div class="ticket-item__top">
        <span>${ticket.id}</span>
        <span class="badge">${ticket.status}</span>
      </div>

      <h3 class="ticket-title">${ticket.title}</h3>

      <p class="ticket-meta">
        ${ticket.user} • ${ticket.department}
      </p>
    `;

    list.appendChild(item);

  });

}