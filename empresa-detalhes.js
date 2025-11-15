let empresaAtual = null;
const LOGOPADRAO = "logo-padrao.jpg";

window.addEventListener("DOMContentLoaded", async () => {
    await carregarEmpresa();
    document.getElementById('cardapioForm')?.addEventListener('submit', adicionarItemCardapio);
});

async function carregarEmpresa() {
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = urlParams.get("id");
    const token = localStorage.getItem('authToken');
    if (!empresaId) {
        alert("ID da empresa não encontrado!");
        voltarParaListagem();
        return;
    }
    const response = await makeRequest(`Company/${empresaId}`, {}, token, "GET");
    if (response.ok && response.payload) {
        empresaAtual = response.payload;
        exibirDadosEmpresa(empresaAtual);
        carregarCardapio();
    } else {
        alert("Empresa não encontrada!");
        voltarParaListagem();
    }
}

function exibirDadosEmpresa(empresa) {
    const header = document.getElementById("companyHeader");
    header.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${empresa.logoUrl || LOGOPADRAO}" alt="Logo" class="company-logo">
            <div>
                <h2 class="mb-2">${empresa.name}</h2>
                <span class="badge bg-primary">${empresa.type || ""}</span>
                <p class="text-muted mb-1">CEP: ${empresa.cep}, Nº: ${empresa.addressNumber || "SN"}</p>
                <p class="text-muted mb-1">Endereço: ${empresa.addressComplement || ""}</p>
            </div>
        </div>
    `;

    const infoSection = document.getElementById("companyInfo");
    infoSection.innerHTML = `
        <h4 class="section-title"><i class="fas fa-building"></i> Dados da Empresa</h4>
        <div class="row mb-3">
            <div class="col-md-6">
                <p><strong>Nome:</strong> ${empresa.name}</p>
                <p><strong>CNPJ:</strong> ${empresa.cnpj}</p>
                <p><strong>Tipo:</strong> ${empresa.type}</p>
                <p><strong>Telefone:</strong> ${empresa.phone || ""}</p>
                <p><strong>Email:</strong> ${empresa.email || ""}</p>
            </div>
            <div class="col-md-6">
                <p><strong>CEP:</strong> ${empresa.cep}</p>
                    <p><strong>Endereço:</strong> ${empresa.addressComplement || ""}</p>
                <p><strong>Número:</strong> ${empresa.addressNumber}</p>
            
            </div>
        </div>
    `;
}

function carregarCardapio() {
    if (!empresaAtual || !empresaAtual.id) return;
    const cardapio = JSON.parse(localStorage.getItem(`cardapio_${empresaAtual.id}`)) || [];
    exibirCardapio(cardapio);
}

function exibirCardapio(itens) {
    const container = document.getElementById("menuContainer");
    if (!itens.length) {
        container.innerHTML = "<div>Nenhum item no cardápio.</div>";
        return;
    }
    container.innerHTML = itens.map((item, idx) => `
        <div class="menu-item">
            <h5>${item.nome}</h5>
            <p>${item.ingredientes}</p>
            <p><strong>R$ ${item.valor}</strong></p>
        </div>
    `).join('');
}

function adicionarItemCardapio(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeItem').value.trim();
    const ingredientes = document.getElementById('ingredientesItem').value.trim();
    const valor = document.getElementById('valorItem').value.trim();

    if (!empresaAtual || !empresaAtual.id) {
        mostrarMsg("ID da empresa não encontrado!", "danger");
        return;
    }

    if (!nome || !ingredientes || !valor) {
        mostrarMsg("Preencha todos os campos!", "danger");
        return;
    }

    let cardapio = JSON.parse(localStorage.getItem(`cardapio_${empresaAtual.id}`)) || [];
    cardapio.push({ nome, ingredientes, valor });
    localStorage.setItem(`cardapio_${empresaAtual.id}`, JSON.stringify(cardapio));
    mostrarMsg("Item adicionado!", "success");

    document.getElementById('cardapioForm').reset();
    carregarCardapio();
}

function mostrarMsg(msg, tipo) {
    const div = document.getElementById('cardapioMsg');
    div.className = `alert alert-${tipo}`;
    div.textContent = msg;
    setTimeout(() => div.textContent = '', 2000);
}

function voltarParaListagem() {
    window.location.href = "empresas-listagem.html";
}
