let empresasOriginais = [];

async function carregarEmpresas() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            document.getElementById('listaEmpresas').innerHTML = '<p class="alert alert-danger">Você precisa estar logado!</p>';
            return;
        }

        const response = await makeRequest('Company', null, token, 'GET');
        
        if (response.ok && Array.isArray(response.payload)) {
            empresasOriginais = response.payload;
            exibirEmpresas(empresasOriginais);
        } else {
            document.getElementById('listaEmpresas').innerHTML = '<p class="alert alert-warning">Nenhuma empresa encontrada.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('listaEmpresas').innerHTML = '<p class="alert alert-danger">Erro ao carregar empresas.</p>';
    }
}

function exibirEmpresas(empresas) {
    const container = document.getElementById('listaEmpresas');
    
    if (!empresas || empresas.length === 0) {
        container.innerHTML = '<p class="alert alert-info">Nenhuma empresa encontrada.</p>';
        return;
    }

    container.innerHTML = empresas.map(empresa => `
        <div class="company-card" onclick="verDetalhes('${empresa.id}')">
            <div class="d-flex">
                <img src="${empresa.logoUrl || 'logo-padrao.jpg'}" alt="Logo" class="company-logo">
                <div class="flex-grow-1">
                    <h5>${empresa.name || 'Sem nome'}</h5>
                    <span class="badge bg-primary">${empresa.type || 'N/A'}</span>
                    <p class="mb-0 mt-2"><strong>CNPJ:</strong> ${empresa.cnpj || 'N/A'}</p>
                    <p class="mb-0"><strong>Endereço:</strong> ${empresa.addressComplement || ''} nº ${empresa.addressNumber || 'SN'}</p>
                    <p class="mb-0"><strong>CEP:</strong> ${empresa.cep || 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function verDetalhes(empresaId) {
    window.location.href = `empresa-detalhes.html?id=${empresaId}`;
}

function filtrarEmpresas() {
    const nome = document.getElementById('filtroNome').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;

    const empresasFiltradas = empresasOriginais.filter(empresa => {
        const nomeMatch = !nome || (empresa.name && empresa.name.toLowerCase().includes(nome));
        const tipoMatch = !tipo || empresa.type === tipo;
        return nomeMatch && tipoMatch;
    });

    exibirEmpresas(empresasFiltradas);
}

function limparFiltros() {
    document.getElementById('filtroNome').value = '';
    document.getElementById('filtroTipo').value = '';
    exibirEmpresas(empresasOriginais);
}

// Event Listeners
document.getElementById('btnFiltrar').addEventListener('click', filtrarEmpresas);
document.getElementById('btnLimpar').addEventListener('click', limparFiltros);
document.getElementById('filtroNome').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filtrarEmpresas();
});

// Carregar ao abrir
window.addEventListener('load', carregarEmpresas);
