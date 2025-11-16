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
            mostrarMensagem("Você precisa estar logado!", "danger");
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

        if (!nameInput || !typeInput || !cnpjInput || !cepInput || !numeroInput || !enderecoInput) {
            mostrarMensagem("Preencha todos os campos obrigatórios!", "danger");
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

        const response = await makeRequest("Company", novaEmpresa, token, "POST");

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
