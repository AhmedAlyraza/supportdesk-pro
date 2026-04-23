import {
  tickets,
  activityLogs,
  selectedTicket,
  currentFilter,
  currentPriorityFilter,
  currentCategoryFilter,
  currentAssigneeFilter,
  currentSort,
  searchQuery,
  currentPage,
  itemsPerPage,
  defaultStatus
} from "./state.js";

// =========================
// SIDEBAR
// =========================
export function setActiveSidebar(item) {
  const sidebarItems = document.querySelectorAll(".sidebar_item");

  sidebarItems.forEach(el => {
    el.classList.remove("sidebar_item-active");
  });

  item.classList.add("sidebar_item-active");
}

// =========================
// VIEW SWITCHING
// =========================
export function switchView(viewName) {
  const views = document.querySelectorAll(".view");

  views.forEach(view => view.classList.remove("active"));

  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add("active");

  if (viewName === "dashboard") {
    renderDashboardStats(tickets);
  }

  if (viewName === "activity") {
    renderActivity();
  }

  if (viewName === "reports") {
    renderReports(tickets);
  }

  if (viewName === "settings") {
    renderSettingsStats();
  }

  if (viewName === "kanban") {
    renderKanban(tickets);
  }
}

// =========================
// MODAL
// =========================
export function openModal(modal) {
  modal.classList.remove("hidden");
}

export function closeModal(modal) {
  modal.classList.add("hidden");
}

document.getElementById("empty-create-btn")?.addEventListener("click", () => {
  openModal(modal);
});

// =========================
// DASHBOARD
// =========================
export function renderDashboardStats(allTickets) {
  const totalEl = document.getElementById("total-count");
  const openEl = document.getElementById("open-count");
  const progressEl = document.getElementById("progress-count");
  const resolvedEl = document.getElementById("resolved-count");

  if (!totalEl || !openEl || !progressEl || !resolvedEl) return;

  const total = allTickets.length;
  const open = allTickets.filter(t => t.status === "New").length;
  const progress = allTickets.filter(t => t.status === "In Progress").length;
  const resolved = allTickets.filter(t => t.status === "Resolved").length;

  totalEl.textContent = total;
  openEl.textContent = open;
  progressEl.textContent = progress;
  resolvedEl.textContent = resolved;
}

// =========================
// TICKETS LIST
// =========================
export function renderTickets() {
  const list = document.getElementById("ticket-list");
  const pageInfo = document.getElementById("page-info");
  const pagination = document.querySelector(".pagination");

  if (!list) return;

  list.innerHTML = "";

  let filteredTickets = currentFilter === "All"
    ? [...tickets]
    : tickets.filter(ticket => ticket.status === currentFilter);

  if (currentPriorityFilter !== "All") {
    filteredTickets = filteredTickets.filter(ticket => ticket.priority === currentPriorityFilter);
  }

  if (currentCategoryFilter !== "All") {
    filteredTickets = filteredTickets.filter(ticket => ticket.category === currentCategoryFilter);
  }

  if (currentAssigneeFilter !== "All") {
    filteredTickets = filteredTickets.filter(ticket => ticket.assignee === currentAssigneeFilter);
  }

  if (searchQuery) {
    filteredTickets = filteredTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchQuery) ||
      ticket.user.toLowerCase().includes(searchQuery) ||
      ticket.department.toLowerCase().includes(searchQuery) ||
      ticket.id.toLowerCase().includes(searchQuery) ||
      (ticket.assignee || "").toLowerCase().includes(searchQuery) ||
      (ticket.category || "").toLowerCase().includes(searchQuery)
    );
  }

  const priorityOrder = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  if (currentSort === "Latest") {
    filteredTickets.sort((a, b) => b.createdAt - a.createdAt);
  } else if (currentSort === "Oldest") {
    filteredTickets.sort((a, b) => a.createdAt - b.createdAt);
  } else if (currentSort === "Priority") {
    filteredTickets.sort(
      (a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    );
  }

  if (filteredTickets.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>No tickets found</h3>
        <p class="page-subtitle">Try changing your filters or create a new ticket.</p>
        <button class="btn--primary empty-create-btn">Create Ticket</button>
      </div>
    `;

    if (pagination) pagination.classList.add("hidden");
    return;
  }

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedTickets = filteredTickets.slice(start, end);

  if (pagination) {
    if (filteredTickets.length <= itemsPerPage) {
      pagination.classList.add("hidden");
    } else {
      pagination.classList.remove("hidden");
    }
  }

  const nextBtn = document.getElementById("next-page");
  const prevBtn = document.getElementById("prev-page");

  if (nextBtn) nextBtn.disabled = safePage >= totalPages;
  if (prevBtn) prevBtn.disabled = safePage <= 1;

  paginatedTickets.forEach(ticket => {
    const item = document.createElement("div");
    item.className = "ticket-item";
    item.dataset.id = ticket.id;

    if (selectedTicket && selectedTicket.id === ticket.id) {
      item.classList.add("active");
    }

    item.innerHTML = `
      <div class="ticket-item__top">
        <span>${ticket.id}</span>
        <span class="badge ${ticket.status.replace(" ", "-").toLowerCase()}">
          ${ticket.status}
        </span>
      </div>

      <h3 class="ticket-title">${ticket.title}</h3>
      <p class="ticket-meta">${ticket.user} • ${ticket.department}</p>
      <p class="ticket-extra">${ticket.category || "General"} • ${ticket.assignee || "Unassigned"}</p>

      <div class="ticket-item__bottom">
        <span class="priority ${(ticket.priority || "Low").toLowerCase()}">
          ${ticket.priority || "Low"}
        </span>
      </div>
    `;

    list.appendChild(item);
  });

  if (pageInfo) {
    pageInfo.textContent = `Page ${safePage} of ${totalPages}`;
  }
}

// =========================
// DETAIL PANEL
// =========================
export function renderTicketDetail(ticket) {
  const detailId = document.getElementById("detail-id");
  const detailTitle = document.getElementById("detail-title");
  const detailMeta = document.getElementById("detail-meta");
  const detailStatus = document.getElementById("detail-status");
  const detailActivity = document.getElementById("detail-activity");
  const editBtn = document.getElementById("edit-ticket-btn");
  const deleteBtn = document.getElementById("delete-ticket-btn");

  if (!detailId || !detailTitle || !detailMeta || !detailStatus || !detailActivity) return;

  if (!ticket) {
    detailId.textContent = "";
    detailTitle.textContent = "No ticket selected";
    detailMeta.textContent = "";
    detailActivity.innerHTML = "";
    if (editBtn) delete editBtn.dataset.id;
    if (deleteBtn) delete deleteBtn.dataset.id;
    return;
  }

  detailId.textContent = ticket.id;
  detailTitle.textContent = ticket.title;
  detailMeta.textContent = `${ticket.user} • ${ticket.department} • ${ticket.category || "General"} • ${ticket.assignee || "Unassigned"}`;

  detailStatus.innerHTML = `
    <option value="New">New</option>
    <option value="In Progress">In Progress</option>
    <option value="Waiting">Waiting</option>
    <option value="Resolved">Resolved</option>
  `;
  detailStatus.value = ticket.status;

  detailActivity.innerHTML = "";

  if (!ticket.activity || ticket.activity.length === 0) {
    detailActivity.innerHTML = `<li>No activity yet</li>`;
  } else {

    ticket.activity.slice().reverse().forEach(entry => {

      let text = "";

      if (entry.type === "create") {
        text = `Created with status ${entry.to}`;
      }

      else if (entry.type === "status") {
        text = `Status changed from ${entry.from} to ${entry.to}`;
      }

      else if (entry.type === "update") {
        text = `Ticket updated`;
      }

      const li = document.createElement("li");
      li.textContent = text;

      detailActivity.appendChild(li);
    });
  }

  if (editBtn) editBtn.dataset.id = ticket.id;
  if (deleteBtn) deleteBtn.dataset.id = ticket.id;
}

function buildTicketActivityText(entry) {
  if (!entry || typeof entry !== "object") return "Unknown activity";

  if (entry.type === "create") {
    return `Ticket created with status ${entry.to}`;
  }

  if (entry.type === "status") {
    return `Status changed from ${entry.from} to ${entry.to}`;
  }

  if (entry.type === "update") {
    return "Ticket details updated";
  }

  if (entry.type === "delete") {
    return "Ticket deleted";
  }

  return entry.message || "Activity updated";
}

// =========================
// FILTER BUTTONS
// =========================
export function setActiveFilterButton(filter) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(btn => {
    btn.classList.remove("active");

    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    }
  });
}

// =========================
// ACTIVITY PAGE
// =========================
export function renderActivity() {
  const container = document.getElementById("activity-list");
  if (!container) return;

  container.innerHTML = "";

  if (!activityLogs.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No activity yet</h3>
        <p>All ticket actions will appear here</p>
      </div>
    `;
    return;
  }

  activityLogs.forEach(log => {

    const date = new Date(log.time);

    const formatted = date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    let content = "";

    // ================= TYPE HANDLING =================
    if (log.type === "create") {
      content = `
        <strong>${log.ticketTitle}</strong>
        <p>Created with status <span class="status new">${log.to}</span></p>
      `;
    }

    else if (log.type === "status") {
      content = `
        <strong>${log.ticketTitle}</strong>
        <p>
          Status changed 
          <span class="status old">${log.from}</span> → 
          <span class="status new">${log.to}</span>
        </p>
      `;
    }

    else if (log.type === "update") {
      content = `
        <strong>${log.ticketTitle}</strong>
        <p>Details updated</p>
      `;
    }

    else if (log.type === "delete") {
      content = `
        <strong>${log.ticketTitle}</strong>
        <p class="danger">Ticket deleted</p>
      `;
    }

    const div = document.createElement("div");
    div.className = `activity-item ${log.type}`;

    div.innerHTML = `
      <div class="activity-left">
        <div class="activity-dot"></div>
      </div>

      <div class="activity-right">
        ${content}

        <div class="activity-footer">
          <span>${log.ticketId || ""}</span>
          <span>${formatted}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

// =========================
// REPORTS
// =========================
export function renderReports(allTickets) {
  const total = allTickets.length;
  const newCount = allTickets.filter(t => t.status === "New").length;
  const progress = allTickets.filter(t => t.status === "In Progress").length;
  const resolved = allTickets.filter(t => t.status === "Resolved").length;

  const totalEl = document.getElementById("report-total");
  const newEl = document.getElementById("report-new");
  const progressEl = document.getElementById("report-progress");
  const resolvedEl = document.getElementById("report-resolved");

  if (totalEl) totalEl.textContent = total;
  if (newEl) newEl.textContent = newCount;
  if (progressEl) progressEl.textContent = progress;
  if (resolvedEl) resolvedEl.textContent = resolved;

  const calc = value => total ? (value / total) * 100 : 0;

  const barNew = document.getElementById("bar-new");
  const barProgress = document.getElementById("bar-progress");
  const barResolved = document.getElementById("bar-resolved");

  if (barNew) barNew.style.width = `${calc(newCount)}%`;
  if (barProgress) barProgress.style.width = `${calc(progress)}%`;
  if (barResolved) barResolved.style.width = `${calc(resolved)}%`;

  const departmentContainer = document.getElementById("report-departments");
  if (departmentContainer) {
    departmentContainer.innerHTML = "";

    const deptMap = {};
    allTickets.forEach(ticket => {
      deptMap[ticket.department] = (deptMap[ticket.department] || 0) + 1;
    });

    Object.entries(deptMap).forEach(([dept, count]) => {
      const div = document.createElement("div");
      div.className = "department-row";
      div.innerHTML = `<span>${dept}</span><strong>${count}</strong>`;
      departmentContainer.appendChild(div);
    });
  }

  const trendContainer = document.getElementById("report-trend");
  if (trendContainer) {
    trendContainer.innerHTML = "";

    const trendMap = {};

    allTickets.forEach(ticket => {
      if (!ticket.createdAt) return;

      const date = new Date(ticket.createdAt).toLocaleDateString("en-GB");
      trendMap[date] = (trendMap[date] || 0) + 1;
    });

    Object.entries(trendMap).forEach(([date, count]) => {
      const div = document.createElement("div");
      div.className = "trend-row";
      div.innerHTML = `
        <span>${date}</span>
        <div style="width:60%">
          <div class="trend-bar" style="width:${count * 20}px"></div>
        </div>
        <strong>${count}</strong>
      `;
      trendContainer.appendChild(div);
    });
  }

  const topStatusEl = document.getElementById("top-status");
  if (topStatusEl) {
    let top = "None";
    let max = 0;

    const statusMap = {
      New: newCount,
      "In Progress": progress,
      Resolved: resolved
    };

    Object.entries(statusMap).forEach(([status, count]) => {
      if (count > max) {
        max = count;
        top = status;
      }
    });

    topStatusEl.textContent = `${top} (${max})`;
  }

  const activityContainer = document.getElementById("report-activity");
  if (activityContainer) {
    activityContainer.innerHTML = "";

    activityLogs.slice(0, 5).forEach(log => {
      const div = document.createElement("div");
      div.className = "department-row";
      div.innerHTML = `
        <span>${log.message || log.type}</span>
        <small>${log.ticketId || ""}</small>
      `;
      activityContainer.appendChild(div);
    });
  }

  const ctx = document.getElementById("statusChart");
  if (ctx && window.Chart) {
    if (window.statusChartInstance) {
      window.statusChartInstance.destroy();
    }

    window.statusChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["New", "In Progress", "Resolved"],
        datasets: [{
          data: [newCount, progress, resolved],
          backgroundColor: ["#3b82f6", "#f59e0b", "#22c55e"]
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "#ffffff"
            }
          }
        }
      }
    });
  }
}

// =========================
// SETTINGS
// =========================
export function renderSettingsStats() {
  const el = document.getElementById("settings-total");
  const dropdown = document.getElementById("default-status");

  if (el) el.textContent = tickets.length;
  if (dropdown) dropdown.value = defaultStatus;
}

// =========================
// KANBAN
// =========================
export function renderKanban(allTickets) {
  const columns = {
    New: document.getElementById("kanban-new"),
    "In Progress": document.getElementById("kanban-progress"),
    Waiting: document.getElementById("kanban-waiting"),
    Resolved: document.getElementById("kanban-resolved")
  };

  Object.values(columns).forEach(col => {
    if (col) col.innerHTML = "";
  });

  allTickets.forEach(ticket => {
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.draggable = true;
    card.dataset.id = ticket.id;

    card.innerHTML = `
      <div class="kanban-card-header">
        <strong>${ticket.title}</strong>
        <span class="status-dot ${ticket.status.replace(" ", "-").toLowerCase()}"></span>
      </div>
      <p>${ticket.user}</p>
    `;

    const column = columns[ticket.status];
    if (column) column.appendChild(card);
  });
}