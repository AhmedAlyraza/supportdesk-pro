// =============================
// REAL-TIME SYNC (BroadcastChannel)
// =============================

const channel = new BroadcastChannel("supportdesk_channel");

// Send updates to other tabs
export function broadcastUpdate(data) {
    channel.postMessage(data);
}

// Listen for updates from other tabs
export function initSyncListener(callback) {
    channel.onmessage = (event) => {
        const { type, payload } = event.data;

        if (type === "SYNC_TICKETS") {
            callback(payload);
        }
    };
}