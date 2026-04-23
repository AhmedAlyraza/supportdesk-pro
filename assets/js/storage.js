// =========================
// STORAGE KEYS
// =========================
const TICKETS_KEY = "supportdesk_tickets";
const ACTIVITY_KEY = "supportdesk_activity";
const THEME_KEY = "supportdesk_theme";
const DEFAULT_STATUS_KEY = "default_ticket_status";

// =========================
// TICKETS
// =========================
export function saveTicketsToStorage(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

export function loadTicketsFromStorage() {
  const raw = localStorage.getItem(TICKETS_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse tickets from localStorage:", error);
    return [];
  }
}

// =========================
// GLOBAL ACTIVITY
// =========================
export function saveActivityToStorage(activityLogs) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activityLogs));
}

export function loadActivityFromStorage() {
  const raw = localStorage.getItem(ACTIVITY_KEY);

  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse activity logs from localStorage:", error);
    return [];
  }
}

// =========================
// THEME
// =========================
export function saveThemeToStorage(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadThemeFromStorage() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

// =========================
// DEFAULT STATUS
// =========================
export function saveDefaultStatusToStorage(status) {
  localStorage.setItem(DEFAULT_STATUS_KEY, status);
}

export function loadDefaultStatusFromStorage() {
  return localStorage.getItem(DEFAULT_STATUS_KEY) || "New";
}