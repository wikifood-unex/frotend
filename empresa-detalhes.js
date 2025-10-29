// URL da imagem padrão (logo genérica - substitua pela sua do Imgur)
const LOGO_PADRAO = 'https://imgur.com/a/X19yIs7';

async function carregarEmpresa() {
    const token = localStorage.getItem('authToken');
    
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = urlParams.get('id');
    
    if (!empresaId) {
        alert('ID da empresa não encontrado!');
        voltarParaListagem();
        return;
    }

    console.log('Carregando empresa ID:', empresaId);

    const response = await makeRequest(`/Restaurant/${empresaId}`, {}, token, "GET");
    
    console.log('Resposta da API:', response);

    if (response.ok && response.payload) {
        exibirDadosEmpresa(response.payload);
    } else {
        alert('Empresa não encontrada!');
        voltarParaListagem();
    }
}

function exibirDadosEmpresa(empresa) {
    const header = document.getElementById('companyHeader');
    header.innerHTML = `
        <div class="company-status status-active">Ativo</div>
        <div class="row align-items-center">
            <div class="col-md-3 text-center">
                <img src="${LOGO_PADRAO}" alt="${empresa.name}" class="company-logo"
                     style="width: 120px; height: 120px; object-fit: cover; border-radius: 10px;">
            </div>
            <div class="col-md-9">
                <span class="company-category">${empresa.cep?.state || ""}</span>
                <h1 class="h2 fw-bold mb-3">${empresa.name}</h1>
                <p class="text-muted mb-3">${empresa.cep?.city || ""} - ${empresa.cep?.neighborhood || ""}</p>
                <div class="contact-info">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i> 
                                <span>CEP: ${empresa.cep?.code || "N/A"}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="contact-item">
                                <i class="fas fa-road"></i> 
                                <span>${empresa.cep?.street || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('menuLoadingSpinner').style.display = 'none';
    document.getElementById('emptyMenu').style.display = 'block';
}

function voltarParaListagem() {
    window.location.href = 'empresas-listagem.html';
}

function editarEmpresa() {
    alert('Função ainda não disponível');
}

function adicionarItemCardapio() {
    alert('Função ainda não disponível');
}

function salvarItemCardapio() {
    alert('Função ainda não disponível');
}

document.addEventListener('DOMContentLoaded', carregarEmpresa);
