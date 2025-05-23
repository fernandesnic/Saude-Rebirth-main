// vaccine.js

const vaccineForm = document.getElementById("vaccineForm");
const vaccineCards = document.getElementById("vaccineCards");
const vaccineFilter = document.getElementById("vaccineFilter");

// Função para pegar vacina do localStorage ou array vazio
function getVaccines() {
  return JSON.parse(localStorage.getItem("vaccines") || "[]");
}

// Salvar vacinas no localStorage
function saveVaccines(vaccines) {
  localStorage.setItem("vaccines", JSON.stringify(vaccines));
}

// Renderiza as vacinas na tela conforme filtro
function renderVaccines() {
  const filter = vaccineFilter.value;
  const vaccines = getVaccines();

  vaccineCards.innerHTML = "";

  let filteredVaccines = vaccines;

  if (filter === "taken") {
    filteredVaccines = vaccines.filter(v => v.nextDose === "");
  } else if (filter === "pending") {
    filteredVaccines = vaccines.filter(v => v.nextDose !== "");
  }

  if (filteredVaccines.length === 0) {
    vaccineCards.innerHTML = "<p>Nenhuma vacina encontrada.</p>";
    return;
  }

  filteredVaccines.forEach((vaccine, i) => {
    const card = document.createElement("div");
    card.classList.add("vaccine-card");
    card.innerHTML = `
      <h3>${vaccine.name}</h3>
      <p><strong>Data da Aplicação:</strong> ${vaccine.date}</p>
      <p><strong>Próxima Dose:</strong> ${vaccine.nextDose || "Nenhuma"}</p>
      <p><strong>Local:</strong> ${vaccine.location || "Não informado"}</p>
      <p><strong>Observações:</strong> ${vaccine.notes || "Nenhuma"}</p>
      <button class="btn-delete" data-index="${i}">Excluir</button>
    `;
    vaccineCards.appendChild(card);
  });

  // Evento para deletar vacina
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      let vaccines = getVaccines();
      vaccines.splice(index, 1);
      saveVaccines(vaccines);
      renderVaccines();
    });
  });
}

// Evento para salvar vacina nova
vaccineForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newVaccine = {
    name: document.getElementById("vaccineName").value.trim(),
    date: document.getElementById("vaccineDate").value,
    nextDose: document.getElementById("vaccineNextDose").value,
    location: document.getElementById("vaccineLocation").value.trim(),
    notes: document.getElementById("vaccineNotes").value.trim(),
  };

  if (!newVaccine.name || !newVaccine.date) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  let vaccines = getVaccines();
  vaccines.push(newVaccine);
  saveVaccines(vaccines);
  vaccineForm.reset();
  renderVaccines();
});

// Filtro
vaccineFilter.addEventListener("change", renderVaccines);

// Render inicial
renderVaccines();
