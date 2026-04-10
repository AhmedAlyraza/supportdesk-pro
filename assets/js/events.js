import { sidebarNav } from "./dom.js";
import { switchView, setActiveSidebar } from "./ui.js";

import { modal, openBtn, closeBtn, form } from "./dom.js";
import { openModal, closeModal } from "./ui.js";
import { addTicket } from "./state.js";

import { renderTickets } from "./ui.js";

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




export function initModalEvents() {

  openBtn.addEventListener("click", () => {
    openModal(modal);
  });

  closeBtn.addEventListener("click", () => {
    closeModal(modal);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newTicket = {
      id: "#SD-" + Math.floor(Math.random() * 10000),
      title: document.getElementById("ticket-title").value,
      user: document.getElementById("ticket-user").value,
      department: document.getElementById("ticket-department").value,
      status: document.getElementById("ticket-status").value,
    };

    addTicket(newTicket);

    console.log("New Ticket:", newTicket);

    closeModal(modal);
    form.reset();
  });

}


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTicket = {
    id: "#SD-" + Math.floor(Math.random() * 10000),
    title: document.getElementById("ticket-title").value,
    user: document.getElementById("ticket-user").value,
    department: document.getElementById("ticket-department").value,
    status: document.getElementById("ticket-status").value,
  };

  addTicket(newTicket);

  renderTickets(); // 🔥 THIS IS KEY

  closeModal(modal);
  form.reset();
});