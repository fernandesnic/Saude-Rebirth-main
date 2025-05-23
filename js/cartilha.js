 function selectVaccine(vaccineName) {
            // Armazena a vacina selecionada
            const selectedVaccines = JSON.parse(localStorage.getItem('selectedVaccines') || '[]');
            if (!selectedVaccines.includes(vaccineName)) {
                selectedVaccines.push(vaccineName);
                localStorage.setItem('selectedVaccines', JSON.stringify(selectedVaccines));
            }
            
            // Redireciona para a página de vacinas pendentes
            window.location.href = 'vaccine.html?vaccine=' + encodeURIComponent(vaccineName);
        }