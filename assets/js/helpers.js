export function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `toast ${type}`;
    div.textContent = message;

    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}