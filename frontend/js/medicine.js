// medicine.js

const medicineForm = document.getElementById("medicineForm");
const medicineCards = document.getElementById("medicineCards");
const medicineFilter = document.getElementById("medicineFilter");
const reminderList = document.getElementById("reminderList");

// Função para pegar medicamentos do localStorage ou array vazio
function getMedicines() {
  return JSON.parse(localStorage.getItem("medicines") || "[]");
}

// Salvar medicamentos no localStorage
function saveMedicines(medicines) {
  localStorage.setItem("medicines", JSON.stringify(medicines));
}

// Renderiza os medicamentos na tela conforme filtro
function renderMedicines() {
  const filter = medicineFilter.value;
  const medicines = getMedicines();

  medicineCards.innerHTML = "";

  let filteredMedicines = medicines;

  const today = new Date();

  if (filter === "active") {
    filteredMedicines = medicines.filter(med => {
      const endDate = med.endDate ? new Date(med.endDate) : null;
      return !endDate || endDate >= today;
    });
  } else if (filter === "finished") {
    filteredMedicines = medicines.filter(med => {
      const endDate = med.endDate ? new Date(med.endDate) : null;
      return endDate && endDate < today;
    });
  }

  if (filteredMedicines.length === 0) {
    medicineCards.innerHTML = "<p>Nenhum medicamento encontrado.</p>";
    return;
  }

  filteredMedicines.forEach((medicine, i) => {
    const card = document.createElement("div");
    card.classList.add("medicine-card");
    card.innerHTML = `
      <h3>${medicine.name}</h3>
      <p><strong>Dosagem:</strong> ${medicine.dosage}</p>
      <p><strong>Frequência:</strong> ${medicine.frequency}</p>
      <p><strong>Início:</strong> ${medicine.startDate}</p>
      <p><strong>Fim:</strong> ${medicine.endDate || "Indefinido"}</p>
      <p><strong>Horários:</strong> ${medicine.times}</p>
      <p><strong>Observações:</strong> ${medicine.notes || "Nenhuma"}</p>
      <button class="btn-delete" data-index="${i}">Excluir</button>
    `;
    medicineCards.appendChild(card);
  });

  // Evento para deletar medicamento
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      let medicines = getMedicines();
      medicines.splice(index, 1);
      saveMedicines(medicines);
      renderMedicines();
      renderReminders();
    });
  });
}

// Renderiza os lembretes (simplesmente os próximos horários dos medicamentos ativos)
function renderReminders() {
  const medicines = getMedicines();
  const today = new Date();

  reminderList.innerHTML = "";

  const activeMedicines = medicines.filter(med => {
    const endDate = med.endDate ? new Date(med.endDate) : null;
    return !endDate || endDate >= today;
  });

  if (activeMedicines.length === 0) {
    reminderList.innerHTML = "<p>Sem lembretes pendentes.</p>";
    return;
  }

  activeMedicines.forEach(med => {
    const times = med.times.split(",").map(t => t.trim());
    times.forEach(time => {
      const reminderItem = document.createElement("div");
      reminderItem.classList.add("reminder-item");
      reminderItem.innerHTML = `<strong>${med.name}</strong> - Horário: ${time}`;
      reminderList.appendChild(reminderItem);
    });
  });
}

// Evento para salvar medicamento novo
medicineForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newMedicine = {
    name: document.getElementById("medicineName").value.trim(),
    dosage: document.getElementById("medicineDosage").value.trim(),
    frequency: document.getElementById("medicineFrequency").value,
    startDate: document.getElementById("medicineStartDate").value,
    endDate: document.getElementById("medicineEndDate").value,
    times: document.getElementById("medicineTimes").value.trim(),
    notes: document.getElementById("medicineNotes").value.trim(),
  };

  if (!newMedicine.name || !newMedicine.dosage || !newMedicine.frequency || !newMedicine.startDate || !newMedicine.times) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  let medicines = getMedicines();
  medicines.push(newMedicine);
  saveMedicines(medicines);
  medicineForm.reset();
  renderMedicines();
  renderReminders();
});

// Filtro
medicineFilter.addEventListener("change", () => {
  renderMedicines();
  renderReminders();
});

// Render inicial
renderMedicines();
renderReminders();
