// Variáveis globais
let vaccines = [];
let medicines = [];
let reminders = [];

// Utilitários
document.addEventListener("DOMContentLoaded", () => {
  // Elementos principais
  const loginForm = document.getElementById("loginForm");
  const dashboardScreen = document.getElementById("dashboardScreen");
  const loginScreen = document.getElementById("loginScreen");
  const vaccinePage = document.getElementById("vaccinePage");
  const medicinePage = document.getElementById("medicinePage");
  const vaccineForm = document.getElementById("vaccineForm");
  const medicineForm = document.getElementById("medicineForm");
  const vaccineCards = document.getElementById("vaccineCards");
  const medicineCards = document.getElementById("medicineCards");
  const vaccineFilter = document.getElementById("vaccineFilter");
  const medicineFilter = document.getElementById("medicineFilter");
  const reminderList = document.getElementById("reminderList");

  // Dados de usuários
  const users = [
    { username: "usuario1", password: "senha123", name: "Usuário 1" },
    { username: "usuario2", password: "senha123", name: "Usuário 2" },
  ];

  let currentUser = null;

  function showScreen(screen) {
    document.querySelectorAll("#app > div").forEach((div) => {
      div.style.display = "none";
    });
    if (screen) screen.style.display = "block";
  }

  function formatDate(dateString) {
    if (!dateString) return "Não definido";
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Data inválida"
      : date.toLocaleDateString("pt-BR", options);
  }

  // Login
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      currentUser = user;
      showScreen(dashboardScreen);
      document.querySelector(
        ".user-info span"
      ).textContent = `Olá, ${user.name}`;
      sessionStorage.setItem("loggedIn", "true");
      sessionStorage.setItem("username", user.username);
    } else {
      alert("Usuário ou senha incorretos!");
    }
  });

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    currentUser = null;
    showScreen(loginScreen);
    loginForm.reset();
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("username");
  });

  // Navegação
  document.getElementById("vaccineCard")?.addEventListener("click", () => {
    showScreen(vaccinePage);
    loadVaccines();
  });
  document.getElementById("medicineCard")?.addEventListener("click", () => {
    showScreen(medicinePage);
    loadMedicines();
  });
  document
    .getElementById("backToDashboard1")
    ?.addEventListener("click", () => showScreen(dashboardScreen));
  document
    .getElementById("backToDashboard2")
    ?.addEventListener("click", () => showScreen(dashboardScreen));

  // Sessão
  if (sessionStorage.getItem("loggedIn") === "true") {
    const savedUsername = sessionStorage.getItem("username");
    const user = users.find((u) => u.username === savedUsername);
    if (user) {
      currentUser = user;
      showScreen(dashboardScreen);
      document.querySelector(
        ".user-info span"
      ).textContent = `Olá, ${user.name}`;
    }
  }

  // Vacinas
  function renderVaccines(filter = "all") {
    vaccineCards.innerHTML = "";
    const filtered = vaccines.filter((v) => {
      if (filter === "pending")
        return v.nextDose && new Date(v.nextDose) > new Date();
      return true;
    });

    filtered.forEach((v) => {
      const card = document.createElement("div");
      card.className = `vaccine-card ${
        v.nextDose && new Date(v.nextDose) > new Date() ? "pending" : ""
      }`;
      card.innerHTML = `
        <div class="card-actions">
          <button class="btn-edit" data-id="${
            v.id
          }"><i class="fas fa-edit"></i></button>
          <button class="btn-delete" data-id="${
            v.id
          }"><i class="fas fa-trash"></i></button>
        </div>
        <h3>${v.name}</h3>
        <div class="card-date">Aplicada em: ${formatDate(v.date)}</div>
        ${
          v.nextDose
            ? `<div class="card-next">Próxima dose: ${formatDate(
                v.nextDose
              )}</div>`
            : ""
        }
        ${v.location ? `<div class="card-location">${v.location}</div>` : ""}
        ${v.notes ? `<div class="card-notes">${v.notes}</div>` : ""}`;
      vaccineCards.appendChild(card);
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        deleteVaccine(id);
      });
    });
  }

  function addVaccine(vaccine) {
    vaccines.push(vaccine);
    saveVaccines();
    renderVaccines(vaccineFilter.value);
  }

  function deleteVaccine(id) {
    if (confirm("Deseja excluir esta vacina?")) {
      vaccines = vaccines.filter((v) => v.id !== id);
      saveVaccines();
      renderVaccines(vaccineFilter.value);
    }
  }

  function saveVaccines() {
    localStorage.setItem("vaccines", JSON.stringify(vaccines));
  }

  function loadVaccines() {
    const saved = localStorage.getItem("vaccines");
    if (saved) vaccines = JSON.parse(saved);
    renderVaccines();
  }

  vaccineForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newVaccine = {
      id: Date.now().toString(),
      name: document.getElementById("vaccineName").value,
      date: document.getElementById("vaccineDate").value,
      nextDose: document.getElementById("vaccineNextDose").value || null,
      location: document.getElementById("vaccineLocation").value || null,
      notes: document.getElementById("vaccineNotes").value || null,
    };
    addVaccine(newVaccine);
    vaccineForm.reset();
  });

  vaccineFilter.addEventListener("change", () =>
    renderVaccines(vaccineFilter.value)
  );

  // Medicamentos
  function renderMedicines(filter = "all") {
    medicineCards.innerHTML = "";
    const filtered = medicines.filter((m) => {
      if (filter === "active")
        return !m.endDate || new Date(m.endDate) > new Date();
      if (filter === "finished")
        return m.endDate && new Date(m.endDate) <= new Date();
      return true;
    });

    filtered.forEach((m) => {
      const card = document.createElement("div");
      card.className = `medicine-card ${
        m.endDate && new Date(m.endDate) <= new Date() ? "finished" : ""
      }`;
      card.innerHTML = `
        <h3>${m.name} <span>${m.dosage}</span></h3>
        <div>${formatDate(m.startDate)} - ${
        m.endDate ? formatDate(m.endDate) : "Sem data final"
      }</div>
        <div>${m.frequency} - ${m.times
        .split(",")
        .map((t) => `<span>${t.trim()}</span>`)
        .join(" ")}</div>
        ${m.notes ? `<div>${m.notes}</div>` : ""}`;
      medicineCards.appendChild(card);
    });

    updateReminders();
  }

  function addMedicine(med) {
    medicines.push(med);
    saveMedicines();
    renderMedicines(medicineFilter.value);
    scheduleNotifications();
  }

  function saveMedicines() {
    localStorage.setItem("medicines", JSON.stringify(medicines));
  }

  function loadMedicines() {
    const saved = localStorage.getItem("medicines");
    if (saved) medicines = JSON.parse(saved);
    renderMedicines();
  }

  medicineForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newMed = {
      id: Date.now().toString(),
      name: document.getElementById("medicineName").value,
      dosage: document.getElementById("medicineDosage").value,
      frequency: document.getElementById("medicineFrequency").value,
      startDate: document.getElementById("medicineStartDate").value,
      endDate: document.getElementById("medicineEndDate").value || null,
      times: document.getElementById("medicineTimes").value,
      notes: document.getElementById("medicineNotes").value || null,
    };
    addMedicine(newMed);
    medicineForm.reset();
  });

  medicineFilter.addEventListener("change", () =>
    renderMedicines(medicineFilter.value)
  );

  function updateReminders() {
    reminderList.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];
    const activeMeds = medicines.filter(
      (med) => !med.endDate || new Date(med.endDate) >= new Date(today)
    );

    activeMeds.forEach((med) => {
      med.times.split(",").forEach((time) => {
        const reminderTime = time.trim();
        const now = new Date();
        const [hours, minutes] = reminderTime.split(":").map(Number);
        const reminderDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes
        );

        // Se o horário já passou hoje, não exibir
        if (reminderDate <= now) return;

        const reminderCard = document.createElement("div");
        reminderCard.className = "reminder-card";
        reminderCard.innerHTML = `
        <div>
          <div class="reminder-time">${reminderTime}</div>
          <div class="reminder-name">${med.name}</div>
          <div class="reminder-dosage">${med.dosage}</div>
        </div>
        <button class="btn-taken">Tomado</button>
      `;

        reminderCard
          .querySelector(".btn-taken")
          .addEventListener("click", () => {
            reminderCard.remove();
            // Aqui você poderia registrar no localStorage que foi tomado
          });

        reminderList.appendChild(reminderCard);
      });
    });
  }

  function showNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(title, { body });
      });
    }
  }

  function scheduleNotifications() {
    console.log("Agendando notificações:");
    medicines.forEach((m) => {
      m.times.split(",").forEach((time) => {
        console.log(`${m.name} - ${time.trim()}`);
      });
    });
  }

  function checkReminders() {
    medicines.forEach((m) => {
      m.times.split(",").forEach((time) => {
        const now = new Date();
        const [h, min] = time.trim().split(":").map(Number);
        const reminderTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          h,
          min
        );

        if (
          now >= reminderTime &&
          now < new Date(reminderTime.getTime() + 60000)
        ) {
          showNotification(
            `Hora de ${m.name}`,
            `Dosagem: ${m.dosage} \nHorário: ${time.trim()}`
          );
        }
      });
    });
  }

  Notification.requestPermission();
  setInterval(checkReminders, 60000);
});

// Botão para alternar tema
const themeToggle = document.getElementById("toggleTheme");
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// Aplica o tema salvo
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}
