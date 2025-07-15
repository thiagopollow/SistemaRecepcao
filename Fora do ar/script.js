document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('patient-form');
    const cpfInput = document.getElementById('cpf');
    const telefoneInput = document.getElementById('telefone');
    const patientListDiv = document.getElementById('patient-list');

    // --- MÁSCARAS DE INPUT ---
    cpfInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value;
    });

    telefoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value;
    });

    // --- LÓGICA PRINCIPAL ---
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário
        
        // 1. Gera data e hora do salvamento
        const now = new Date();
        const dataHora = now.toLocaleString('pt-BR');

        // 2. Coleta todos os dados do formulário em um objeto
        const formData = new FormData(form);
        const patientData = Object.fromEntries(formData.entries());
        patientData.dataHora = dataHora; // Adiciona data e hora ao objeto

        // 3. Salva no LocalStorage
        savePatient(patientData);

        // 4. Prepara e aciona a impressão
        prepareAndPrint(patientData);

        // 5. Atualiza a lista de pacientes na tela
        loadPatients();

        // 6. Limpa o formulário para o próximo cadastro
        form.reset();
    });

    function getSavedPatients() {
        const patients = localStorage.getItem('contingencyPatients');
        return patients ? JSON.parse(patients) : [];
    }

    function savePatient(patientData) {
        const patients = getSavedPatients();
        patients.push(patientData);
        localStorage.setItem('contingencyPatients', JSON.stringify(patients));
        alert('Paciente salvo com sucesso!');
    }

    function loadPatients() {
        const patients = getSavedPatients();
        patientListDiv.innerHTML = ''; // Limpa a lista atual

        if (patients.length === 0) {
            patientListDiv.innerHTML = '<p>Nenhum paciente salvo ainda.</p>';
            return;
        }

        const ul = document.createElement('ul');
        patients.forEach((patient, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span><strong>${patient.nomeMae}</strong> (Salvo em: ${patient.dataHora})</span>
                <div>
                    <button onclick="reprintPatient(${index})">Reimprimir</button>
                    <button onclick="deletePatient(${index})">Excluir</button>
                </div>
            `;
            ul.appendChild(li);
        });
        patientListDiv.appendChild(ul);
    }
    
    function prepareAndPrint(data) {
        const printArea = document.getElementById('print-area');
        
        // Função para formatar data 'YYYY-MM-DD' para 'DD/MM/YYYY'
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        };

        const viaContent = `
            <div class="print-via">
                <h3>Ficha de Atendimento de Urgência(Sistema Fora do Ar)</h3>
                <p><strong>Data/Hora Atend.:</strong> ${data.dataHora}</p>
                <p><strong>Recepcionista:</strong> ${data.recepcionista || 'N/A'}</p>
                <hr>
                <p><strong>Nome da Mãe:</strong> ${data.nomeMae}</p>
                <p><strong>Nome do Pai:</strong> ${data.nomePai || 'N/A'}</p>
                <p><strong>Data Nasc.:</strong> ${formatDate(data.dataNascimento)}</p>
                <p><strong>Sexo:</strong> ${data.sexo || 'N/A'}</p>
                <p><strong>Estado Civil:</strong> ${data.estadoCivil || 'N/A'}</p>
                <p><strong>Cor/Raça:</strong> ${data.cor || 'N/A'}</p>
                <p><strong>Matrícula:</strong> ${data.matricula || 'N/A'}</p>
                <hr>
                <p><strong>CPF:</strong> ${data.cpf || 'N/A'}</p>
                <p><strong>Identidade:</strong> ${data.identidade || 'N/A'} - <strong>Órgão:</strong> ${data.orgaoEmissor || 'N/A'}</p>
                <p><strong>CNS:</strong> ${data.cns || 'N/A'}</p>
                <hr>
                <p><strong>Endereço:</strong> ${data.endereco}, Nº ${data.numeroCasa || 'S/N'}</p>
                <p><strong>Bairro:</strong> ${data.bairro}</p>
                <p><strong>Cidade:</strong> ${data.cidade}</p>
                <p><strong>Telefone:</strong> ${data.telefone}</p>
                <hr>
                <p><strong>Médico(a):</strong> ${data.medico}</p>
                <p><strong>Procedência:</strong> ${data.procedencia}</p>
                <p><strong>Observação:</strong> ${data.observacao || 'Nenhuma.'}</p>
                <br>
                <p>_________________________________________</p>
                <p style="text-align:center;">Assinatura do Paciente / Responsável</p>
            </div>
        `;
        
        // Duplica o conteúdo para as duas vias
        printArea.innerHTML = `<div class="print-container">${viaContent}${viaContent}</div>`;

        window.print(); // Abre a janela de impressão do navegador
    }

    // Funções auxiliares acessíveis globalmente
    window.reprintPatient = (index) => {
        const patients = getSavedPatients();
        const patientData = patients[index];
        if (patientData) {
            prepareAndPrint(patientData);
        }
    };

    window.deletePatient = (index) => {
        if (confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
            const patients = getSavedPatients();
            patients.splice(index, 1); // Remove o paciente do array
            localStorage.setItem('contingencyPatients', JSON.stringify(patients));
            loadPatients(); // Recarrega a lista
        }
    };

    // Carrega os pacientes salvos ao iniciar a página
    loadPatients();
});