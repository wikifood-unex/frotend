let empresaAtual = null;
const LOGOPADRAO = "logo-padrao.jpg";

const DIAS_PT = {
    sunday: 'Domingo',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado'
};

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
        await carregarCardapio();
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

    let horariosHtml = '';
    if (empresa.openingHours) {
        horariosHtml = `
            <h5 class="mt-3"><i class="fa fa-clock"></i> Horário de Funcionamento</h5>
            <ul class="list-group mb-3">
                ${Object.keys(DIAS_PT).map(dia =>
                    `<li class="list-group-item d-flex justify-content-between">
                        <span>${DIAS_PT[dia]}</span>
                        <span>${empresa.openingHours[dia] ? (empresa.openingHours[dia].isOpen ? (empresa.openingHours[dia].openTime + ' às ' + empresa.openingHours[dia].closeTime) : 'Fechado') : 'Não informado'}</span>
                    </li>`
                ).join('')}
            </ul>
        `;
    }

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
                ${horariosHtml}
            </div>
        </div>
    `;
}

async function carregarCardapio() {
    if (!empresaAtual || !empresaAtual.id) return;
    const token = localStorage.getItem('authToken');
    const response = await makeRequest(
        `Company/${empresaAtual.id}/menu`,
        {},
        token,
        "GET"
    );
    const cardapio = (response.ok && Array.isArray(response.payload)) ? response.payload : [];
    exibirCardapio(cardapio);
}

function exibirCardapio(itens) {
    const container = document.getElementById("menuContainer");
    if (!itens.length) {
        container.innerHTML = "<div>Nenhum item no cardápio.</div>";
        return;
    }
    container.innerHTML = itens.map((item) => `
        <div class="menu-item mb-3 border-bottom pb-2">
            <h5>${item.name}</h5>
            <p>${item.description || ""}</p>
            <p><strong>R$ ${item.price}</strong></p>
        </div>
    `).join('');
}


async function adicionarItemCardapio(e) {
    e.preventDefault();
    const nome = document.getElementById('nomeItem').value.trim();
    const descricao = document.getElementById('ingredientesItem').value.trim();
    const valor = document.getElementById('valorItem').value.trim();

    if (!empresaAtual || !empresaAtual.id) {
        mostrarMsg("ID da empresa não encontrado!", "danger");
        return;
    }
    if (!nome || !valor) {
        mostrarMsg("Preencha nome e valor!", "danger");
        return;
    }
    const token = localStorage.getItem('authToken');
    const novoItem = {
        name: nome,
        price: Number(valor),
        description: descricao
        // ingredients: [] // se quiser implementar, envie um array de strings aqui!
    };
    const response = await makeRequest(
        `Company/${empresaAtual.id}/menu`,
        novoItem,
        token,
        "POST"
    );
    if (response.ok) {
        mostrarMsg("Item adicionado!", "success");
        document.getElementById('cardapioForm').reset();
        await carregarCardapio();
    } else {
        mostrarMsg("Erro ao adicionar item!", "danger");
    }
}


// Funções extras, caso queira editar/remover itens futuramente:
async function removerItemCardapio(itemId) {
    const token = localStorage.getItem('authToken');
    const response = await makeRequest(
        `Company/${empresaAtual.id}/menu/${itemId}`,
        {},
        token,
        "DELETE"
    );
    if (response.ok) {
        mostrarMsg("Item removido!", "success");
        await carregarCardapio();
    } else {
        mostrarMsg("Erro ao remover item!", "danger");
    }
}

// Mostra mensagens do cardápio
function mostrarMsg(msg, tipo) {
    const div = document.getElementById('cardapioMsg');
    div.className = `alert alert-${tipo}`;
    div.textContent = msg;
    setTimeout(() => div.textContent = '', 2000);
}

function voltarParaListagem() {
    window.location.href = "empresas-listagem.html";
}
