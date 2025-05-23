// login.js
document.addEventListener("DOMContentLoaded", () => {
  const loggedUser = localStorage.getItem("loggedUser");
  if (loggedUser) {
    showDashboard(loggedUser);
  }
});

// Elementos
const loginScreen = document.getElementById("loginScreen");
const dashboardScreen = document.getElementById("dashboardScreen");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

// Função para simular autenticação (pode substituir pela real)
function authenticate(username, password) {
  // Aqui você pode validar usuário com backend ou localStorage
  return username === "admin" && password === "123";
}

// Evento submit do login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = loginForm.username.value.trim();
  const password = loginForm.password.value.trim();

  if (authenticate(username, password)) {
    // Exibir dashboard
    loginScreen.style.display = "none";
    dashboardScreen.style.display = "block";

    // Atualizar saudação usuário
    const userInfoSpan = document.querySelector(".user-info span");
    userInfoSpan.textContent = `Olá, ${username}`;
  } else {
    alert("Usuário ou senha incorretos!");
  }

  if (authenticate(username, password)) {
    localStorage.setItem("loggedUser", username); // salva o usuário logado
    showDashboard(username);
  } else {
    alert("Usuário ou senha incorretos!");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("loggedUser");
  dashboardScreen.style.display = "none";
  loginScreen.style.display = "block";
  loginForm.reset();
});

function showDashboard(username) {
  loginScreen.style.display = "none";
  dashboardScreen.style.display = "block";

  // Atualizar saudação do usuário
  const userInfoSpan = document.querySelector(".user-info span");
  userInfoSpan.textContent = `Olá, ${username}`;
}
