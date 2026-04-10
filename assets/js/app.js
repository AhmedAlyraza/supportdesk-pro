import { initSidebarEvents } from "./events.js";
import { initModalEvents } from "./events.js";
import { renderTickets } from "./ui.js";

initSidebarEvents();
initModalEvents();


document.addEventListener("DOMContentLoaded", () => {
  renderTickets();
});