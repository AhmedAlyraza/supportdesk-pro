const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const role = document.getElementById("role")?.value;

    if (!username || !role) return;

    const currentUser = {
      name: username,
      role: role
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    window.location.href = "index.html";
  });
}