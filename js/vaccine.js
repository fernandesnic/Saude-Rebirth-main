// vaccine.js - Versão Melhorada

// Constantes
const vaccineForm = document.getElementById("vaccineForm");
const vaccineCards = document.getElementById("vaccineCards");
const vaccineFilter = document.getElementById("vaccineFilter");
const pendingVaccinesList = document.getElementById("pendingVaccinesList");

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se veio de outra página com parâmetro
    checkUrlForPendingVaccine();
    
    // Renderiza as vacinas
    renderVaccines();
    
    // Configura eventos
    setupEventListeners();
});

// Funções principais
function checkUrlForPendingVaccine() {
    const urlParams = new URLSearchParams(window.location.search);
    const vaccineName = urlParams.get('vaccine');
    
    if (vaccineName) {
        addPendingVaccine(decodeURIComponent(vaccineName));
    }
}

function addPendingVaccine(vaccineName) {
    const vaccines = getVaccines();
    
    // Verifica se já existe
    const exists = vaccines.some(v => v.name === vaccineName && v.nextDose !== "");
    
    if (!exists) {
        const newVaccine = {
            name: vaccineName,
            date: "",
            nextDose: "Pendente",
            location: "",
            notes: "Adicionada automaticamente"
        };
        
        vaccines.push(newVaccine);
        saveVaccines(vaccines);
    }
}

function getVaccines() {
    return JSON.parse(localStorage.getItem("vaccines") || "[]");
}

function saveVaccines(vaccines) {
    localStorage.setItem("vaccines", JSON.stringify(vaccines));
}

function renderVaccines() {
    const filter = vaccineFilter.value;
    const vaccines = getVaccines();

    vaccineCards.innerHTML = "";

    let filteredVaccines = vaccines;

    if (filter === "taken") {
        filteredVaccines = vaccines.filter(v => !v.nextDose || v.nextDose === "Nenhuma");
    } else if (filter === "pending") {
        filteredVaccines = vaccines.filter(v => v.nextDose && v.nextDose !== "Nenhuma");
    }

    if (filteredVaccines.length === 0) {
        vaccineCards.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-syringe"></i>
                <p>Nenhuma vacina encontrada</p>
            </div>
        `;
        return;
    }

     filteredVaccines.forEach((vaccine, i) => {
        const card = document.createElement("div");
        card.classList.add("vaccine-card");
        if (vaccine.nextDose && vaccine.nextDose !== "Nenhuma") {
            card.classList.add("pending");
        }
        
        card.innerHTML = `
            <div class="card-header">
                <h3>${vaccine.name}</h3>
                <span class="vaccine-status ${vaccine.nextDose && vaccine.nextDose !== "Nenhuma" ? 'pending' : 'completed'}">
                    ${vaccine.nextDose && vaccine.nextDose !== "Nenhuma" ? 'Pendente' : 'Completa'}
                </span>
            </div>
            <div class="card-body">
                ${vaccine.date ? `<p><i class="fas fa-calendar-alt"></i> <strong>Data:</strong> ${formatDate(vaccine.date)}</p>` : ''}
                ${vaccine.nextDose ? `<p><i class="fas fa-clock"></i> <strong>Próxima Dose:</strong> ${vaccine.nextDose === "Pendente" ? vaccine.nextDose : formatDate(vaccine.nextDose)}</p>` : ''}
                ${vaccine.location ? `<p><i class="fas fa-map-marker-alt"></i> <strong>Local:</strong> ${vaccine.location}</p>` : ''}
                ${vaccine.notes ? `<p><i class="fas fa-comment"></i> <strong>Observações:</strong> ${vaccine.notes}</p>` : ''}
            </div>
            <div class="card-actions">
                ${vaccine.nextDose && vaccine.nextDose !== "Nenhuma" ? `
                <button class="btn btn-complete" data-index="${i}">
                    <i class="fas fa-check-circle"></i>  
                </button>
                ` : ''}
                <button class="btn btn-edit" data-index="${i}">
                    <i class="fas fa-edit"></i> 
                </button>
                <button class="btn btn-delete" data-index="${i}">
                    <i class="fas fa-trash-alt"></i> 
                </button>
            </div>
        `;
        vaccineCards.appendChild(card);
    });
    // Atualiza contador
    updateVaccineCounters();
}
function markAsTaken(index) {
    let vaccines = getVaccines();
    if (index >= 0 && index < vaccines.length) {
        vaccines[index].nextDose = "Nenhuma";
        saveVaccines(vaccines);
        renderVaccines();
        showAlert("Vacina marcada como tomada com sucesso!", "success");
    }
}

function setupEventListeners() {
    // Filtro
    vaccineFilter.addEventListener("change", renderVaccines);
    
    // Formulário
    if (vaccineForm) {
        vaccineForm.addEventListener("submit", (e) => {
            e.preventDefault();
            saveNewVaccine();
        });
    }
    
    // Delegation para botões dinâmicos
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            deleteVaccine(e.target.dataset.index);
        }
        if (e.target.classList.contains('btn-edit')) {
            editVaccine(e.target.dataset.index);
        }
        if (e.target.classList.contains('btn-complete')) {
            markAsTaken(e.target.dataset.index);
        }
    });
}

function saveNewVaccine() {
    const newVaccine = {
        name: document.getElementById("vaccineName").value.trim(),
        date: document.getElementById("vaccineDate").value,
        nextDose: document.getElementById("vaccineNextDose").value || "Nenhuma",
        location: document.getElementById("vaccineLocation").value.trim(),
        notes: document.getElementById("vaccineNotes").value.trim(),
    };

    if (!newVaccine.name) {
        showAlert("Preencha o nome da vacina", "error");
        return;
    }

    let vaccines = getVaccines();
    vaccines.push(newVaccine);
    saveVaccines(vaccines);
    
    vaccineForm.reset();
    renderVaccines();
    showAlert("Vacina salva com sucesso!", "success");
}

function deleteVaccine(index) {
    if (confirm("Tem certeza que deseja excluir esta vacina?")) {
        let vaccines = getVaccines();
        vaccines.splice(index, 1);
        saveVaccines(vaccines);
        renderVaccines();
        showAlert("Vacina excluída com sucesso", "success");
    }
}

function editVaccine(index) {
    const vaccines = getVaccines();
    const vaccine = vaccines[index];
    
    // Preenche o formulário
    document.getElementById("vaccineName").value = vaccine.name;
    document.getElementById("vaccineDate").value = vaccine.date;
    document.getElementById("vaccineNextDose").value = vaccine.nextDose === "Nenhuma" ? "" : vaccine.nextDose;
    document.getElementById("vaccineLocation").value = vaccine.location;
    document.getElementById("vaccineNotes").value = vaccine.notes;
    
    // Remove a vacina da lista
    vaccines.splice(index, 1);
    saveVaccines(vaccines);
    
    // Rola para o formulário
    document.getElementById("vaccineForm").scrollIntoView({ behavior: 'smooth' });
}

// Funções auxiliares
function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function updateVaccineCounters() {
    const vaccines = getVaccines();
    const total = vaccines.length;
    const pending = vaccines.filter(v => v.nextDose && v.nextDose !== "Nenhuma").length;
    
    document.querySelectorAll('.counter-total').forEach(el => el.textContent = total);
    document.querySelectorAll('.counter-pending').forEach(el => el.textContent = pending);
}

function showAlert(message, type) {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <p>${message}</p>
        <button class="btn-close-alert"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('show');
    }, 10);
    
    // Fecha o alerta
    alert.querySelector('.btn-close-alert').addEventListener('click', () => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 300);
    });
    
    // Fecha automaticamente após 5s
    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
}