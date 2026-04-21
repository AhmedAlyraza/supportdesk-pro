import {
  tickets,
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


//  Dashboard Stats Renderer
export function renderDashboardStats(tickets) {

  const totalEl = document.getElementById("total-count");
  const openEl = document.getElementById("open-count");
  const progressEl = document.getElementById("progress-count");
  const resolvedEl = document.getElementById("resolved-count");

  // 🔥 SAFETY CHECK (VERY IMPORTANT)
  if (!totalEl || !openEl || !progressEl || !resolvedEl) {
    return; // dashboard not visible → skip
  }

  const total = tickets.length;
  const open = tickets.filter(t => t.status === "New").length;
  const progress = tickets.filter(t => t.status === "In Progress").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  totalEl.textContent = total;
  openEl.textContent = open;
  progressEl.textContent = progress;
  resolvedEl.textContent = resolved;
}


// ================= SIDEBAR ================= //
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

  // 🔥 FIX: render dashboard ONLY when visible
  if (viewName === "dashboard") {
    renderDashboardStats(tickets);
  }

  if (viewName === "activity") {
    renderActivity(tickets);
  }

  if (viewName === "reports") {
    renderReports(tickets);
  }

  if (viewName === "settings") {
    renderSettingsStats();
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
  const pageInfo = document.getElementById("page-info");

  if (!list) return;

  list.innerHTML = "";

  // ================= 1. FILTER =================
  let filteredTickets = currentFilter === "All"
    ? [...tickets]
    : tickets.filter(t => t.status === currentFilter);
  if (currentPriorityFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      t => t.priority === currentPriorityFilter
    );
  }
  if (currentCategoryFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      t => t.category === currentCategoryFilter
    );
  }

  if (currentAssigneeFilter !== "All") {
    filteredTickets = filteredTickets.filter(
      t => t.assignee === currentAssigneeFilter
    );
  }
  // ================= 2. SEARCH =================
  if (searchQuery) {
    filteredTickets = filteredTickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchQuery) ||
      ticket.user.toLowerCase().includes(searchQuery) ||
      ticket.department.toLowerCase().includes(searchQuery)
    );
  }

  // ================= 3. SORT =================
  const priorityOrder = {
    "Urgent": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1
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

  // ================= 4. EMPTY STATE (FIXED POSITION) =================
  if (filteredTickets.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>No tickets found</p>
      </div>
    `;
    return;
  }

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const nextBtn = document.getElementById("next-page");
  const prevBtn = document.getElementById("prev-page");

  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  if (prevBtn) prevBtn.disabled = currentPage <= 1;

  // ================= 5. PAGINATION =================
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const paginatedTickets = filteredTickets.slice(start, end);

  // ================= 6. RENDER =================
  const pagination = document.querySelector(".pagination");

  if (filteredTickets.length <= itemsPerPage) {
    pagination?.classList.add("hidden");
  } else {
    pagination?.classList.remove("hidden");
  }
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
  <p class="ticket-extra">
    ${ticket.category || "General"} • ${ticket.assignee || "Unassigned"}
   </p> 

  <div class="ticket-item__bottom">
    <span class="priority ${ticket.priority ? ticket.priority.toLowerCase() : "low"}">
      ${ticket.priority || "Low"}
    </span>
  </div>
`;

    list.appendChild(item);
  });

  // ================= 7. PAGE INFO =================
  if (pageInfo) {
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
}


// ================= DETAIL PANEL =================
export function renderTicketDetail(ticket) {
  const editBtn = document.getElementById("edit-ticket-btn");
  if (editBtn) editBtn.dataset.id = ticket.id;
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

export function setActiveFilterButton(filter) {
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(btn => {
    btn.classList.remove("active");

    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    }
  });
}





export function renderActivity(tickets) {
  const container = document.getElementById("activity-list");
  if (!container) return;

  container.innerHTML = "";

  let logs = [];

  tickets.forEach(ticket => {
    if (ticket.activity) {
      ticket.activity.forEach(entry => {
        logs.push({
          ...entry,
          ticketId: ticket.id,
          ticketTitle: ticket.title
        });
      });
    }
  });

  // 🔥 SORT latest first
  logs.sort((a, b) => b.time - a.time);

  logs.forEach(log => {
    const div = document.createElement("div");
    div.className = `activity-item activity-${log.type}`;

    const date = log.time ? new Date(log.time) : null;

    const formatted = date
      ? date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
      : "Unknown time";

    // 🔥 SMART MESSAGE BUILDER
    let messageHTML = "";

    if (log.type === "status") {
      messageHTML = `
        <p class="activity-title">${log.ticketTitle}</p>
        <p class="activity-text">
          Status changed 
          <span class="status-badge old">${log.from}</span>
          →
          <span class="status-badge new">${log.to}</span>
        </p>
      `;
    }
    else if (log.type === "create") {
      messageHTML = `
        <p class="activity-title">${log.ticketTitle}</p>
        <p class="activity-text">
          Ticket created with status 
          <span class="status-badge new">${log.to}</span>
        </p>
      `;
    }
    else if (log.type === "update") {
      messageHTML = `
        <p class="activity-title">${log.ticketTitle}</p>
        <p class="activity-text">Ticket details updated</p>
      `;
    }
    else if (log.type === "delete") {
      messageHTML = `
        <p class="activity-title">${log.ticketTitle}</p>
        <p class="activity-text danger">Ticket deleted</p>
      `;
    }

    div.innerHTML = `
      <div class="activity-dot"></div>

      <div class="activity-content">
        ${messageHTML}

        <div class="activity-footer">
          <span>${log.ticketId}</span>
          <span>${formatted}</span>
        </div>
      </div>
    `;

    container.appendChild(div);
  });
}

export function renderReports(tickets) {

  const total = tickets.length;
  const newCount = tickets.filter(t => t.status === "New").length;
  const progress = tickets.filter(t => t.status === "In Progress").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  // ===== SUMMARY =====
  document.getElementById("report-total").textContent = total;
  document.getElementById("report-new").textContent = newCount;
  document.getElementById("report-progress").textContent = progress;
  document.getElementById("report-resolved").textContent = resolved;

  // ===== BARS =====
  const calc = (value) => total ? (value / total) * 100 : 0;

  document.getElementById("bar-new").style.width = calc(newCount) + "%";
  document.getElementById("bar-progress").style.width = calc(progress) + "%";
  document.getElementById("bar-resolved").style.width = calc(resolved) + "%";

  // ===== DEPARTMENTS =====
  const container = document.getElementById("report-departments");
  container.innerHTML = "";

  const deptMap = {};

  tickets.forEach(t => {
    deptMap[t.department] = (deptMap[t.department] || 0) + 1;
  });

  Object.keys(deptMap).forEach(dept => {
    const div = document.createElement("div");
    div.className = "department-row";

    div.innerHTML = `
      <span>${dept}</span>
      <strong>${deptMap[dept]}</strong>
    `;

    container.appendChild(div);
  });


  // ================= TREND =================
  const trendContainer = document.getElementById("report-trend");
  if (trendContainer) {
    trendContainer.innerHTML = "";

    const trendMap = {};

    tickets.forEach(t => {
      if (!t.createdAt) return;

      const date = new Date(t.createdAt).toLocaleDateString("en-GB");
      trendMap[date] = (trendMap[date] || 0) + 1;
    });

    Object.keys(trendMap).forEach(date => {
      const count = trendMap[date];

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


  // ================= TOP STATUS =================
  const topStatusEl = document.getElementById("top-status");

  if (topStatusEl) {
    let top = "None";
    let max = 0;

    const statusMap = {
      "New": tickets.filter(t => t.status === "New").length,
      "In Progress": tickets.filter(t => t.status === "In Progress").length,
      "Resolved": tickets.filter(t => t.status === "Resolved").length
    };

    Object.keys(statusMap).forEach(s => {
      if (statusMap[s] > max) {
        max = statusMap[s];
        top = s;
      }
    });

    topStatusEl.textContent = `${top} (${max})`;
  }


  // ================= RECENT ACTIVITY =================
  const activityContainer = document.getElementById("report-activity");

  if (activityContainer) {
    activityContainer.innerHTML = "";

    let logs = [];

    tickets.forEach(t => {
      if (t.activity) {
        t.activity.forEach(a => {
          if (a.time && a.message) {
            logs.push({
              ticket: t.id,
              message: a.message,
              time: a.time
            });
          }
        });
      }
    });

    logs.sort((a, b) => b.time - a.time);

    logs.slice(0, 5).forEach(log => {
      const div = document.createElement("div");
      div.className = "department-row";

      div.innerHTML = `
      <span>${log.message}</span>
      <small>${log.ticket}</small>
    `;

      activityContainer.appendChild(div);
    });
  }


  const ctx = document.getElementById("statusChart");

  if (ctx) {

    const newCount = tickets.filter(t => t.status === "New").length;
    const progress = tickets.filter(t => t.status === "In Progress").length;
    const resolved = tickets.filter(t => t.status === "Resolved").length;

    // destroy old chart (IMPORTANT)
    if (window.statusChartInstance) {
      window.statusChartInstance.destroy();
    }

    window.statusChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["New", "In Progress", "Resolved"],
        datasets: [{
          data: [newCount, progress, resolved],
          backgroundColor: [
            "#3b82f6",
            "#f59e0b",
            "#22c55e"
          ]
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: "#fff"
            }
          }
        }
      }
    });
  }
}

export function renderSettingsStats() {
  const el = document.getElementById("settings-total");
  if (el) el.textContent = tickets.length;
}

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("default-status");

  if (dropdown) {
    dropdown.value = defaultStatus;
  }
});
