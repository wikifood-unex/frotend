document.getElementById('formCadastro').addEventListener('submit', async function(e) {
    e.preventDefault();
    await salvarEmpresa();
});

function mostrarMensagem(mensagem, tipo) {
    const msgDiv = document.getElementById('msgCadastro');
    msgDiv.className = `alert alert-${tipo}`;
    msgDiv.textContent = mensagem;
    msgDiv.style.display = 'block';
    if (tipo === 'success') setTimeout(() => { msgDiv.style.display = 'none'; }, 3000);
}

async function salvarEmpresa() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            mostrarMensagem('Você precisa estar logado!', 'danger');
            return;
        }

        const nameInput = document.getElementById('nomeEmpresa').value.trim();
        const typeInput = document.getElementById('tipoEmpresa').value.trim();
        const cnpjInput = document.getElementById('cnpj').value.trim();
        const cepInput = document.getElementById('cep').value.trim();
        const numeroInput = document.getElementById('numero').value.trim();
        const enderecoInput = document.getElementById('endereco').value.trim();
        const telefoneInput = document.getElementById('telefone').value.trim();
        const emailInput = document.getElementById('email').value.trim();

        // Validação CNPJ (14 dígitos, permite formatação)
        const cleanCnpj = cnpjInput.replace(/\D/g, '');
        if (!cleanCnpj || cleanCnpj.length !== 14) {
            mostrarMensagem('CNPJ deve ter 14 dígitos (00.000.000/0001-00)', 'danger');
            document.getElementById('cnpj').focus();
            return;
        }

        // Validação Telefone (11 dígitos, permite formatação como (73) 99999-9999)
        const cleanTelefone = telefoneInput.replace(/\D/g, '');
        if (!cleanTelefone || cleanTelefone.length !== 11) {
            mostrarMensagem('Telefone deve ter 11 dígitos (73) 99999-9999)', 'danger');
            document.getElementById('telefone').focus();
            return;
        }

        // Validação CEP (8 dígitos, permite formatação como 45600-000)
        const cleanCep = cepInput.replace(/\D/g, '');
        if (!cleanCep || cleanCep.length !== 8) {
            mostrarMensagem('CEP deve ter 8 dígitos (45600-000)', 'danger');
            document.getElementById('cep').focus();
            return;
        }

        if (!nameInput || !typeInput || !numeroInput || !enderecoInput || !emailInput) {
            mostrarMensagem('Preencha todos os campos obrigatórios!', 'danger');
            return;
        }

        const novaEmpresa = {
            Name: nameInput,
            Type: typeInput,
            Cnpj: cnpjInput,
            Cep: cepInput,
            AddressNumber: numeroInput,
            AddressComplement: enderecoInput,
            Phone: telefoneInput,
            Email: emailInput
        };

        const response = await makeRequest('/Company', novaEmpresa, token, 'POST');

        if (response.ok && response.payload && response.payload.id) {
            mostrarMensagem("Empresa cadastrada com sucesso!", "success");
            setTimeout(() => {
                window.location.href = `empresa-detalhes.html?id=${response.payload.id}`;
            }, 1500);
        } else {
            let erro = "Erro ao cadastrar empresa";
            if (response.payload?.message) {
                erro = response.payload.message;
            } else if (response.payload?.errors) {
                erro = JSON.stringify(response.payload.errors);
            }
            mostrarMensagem(erro, "danger");
        }
    } catch (error) {
        console.error("Erro:", error);
        mostrarMensagem("Erro inesperado: " + error.message, "danger");
    }
}
