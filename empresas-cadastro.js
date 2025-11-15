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
    const token = localStorage.getItem('authToken');
    if (!token) {
        mostrarMensagem("Você precisa estar logado para cadastrar uma empresa.", "danger");
        return;
    }

    const novaEmpresa = {
        name: document.getElementById('nomeEmpresa').value.trim(),
        type: document.getElementById('tipoEmpresa').value.trim(),
        cnpj: document.getElementById('cnpj').value.trim(),
        cep: document.getElementById('cep').value.trim(),
        addressNumber: document.getElementById('numero').value.trim(),
        addressComplement: document.getElementById('endereco').value.trim(), // campo "endereço" (era complemento)
        phone: document.getElementById('telefone').value.trim(),
        email: document.getElementById('email').value.trim()
    };

    const response = await makeRequest("Company", novaEmpresa, token, "POST");
    if (response.ok && response.payload && response.payload.id) {
        window.location.href = `empresa-detalhes.html?id=${response.payload.id}`;
    } else {
        mostrarMensagem("Erro ao cadastrar empresa: " + (response.payload?.message || JSON.stringify(response.payload)), "danger");
    }
}
