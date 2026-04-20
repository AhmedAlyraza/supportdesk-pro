// storage.js

const TICKETS_KEY = "supportdesk_tickets";

/**
 * Save tickets array to localStorage
 * @param {Array} tickets
 */
export function saveTicketsToStorage(tickets) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

/**
 * Load tickets array from localStorage
 * @returns {Array}
 */
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