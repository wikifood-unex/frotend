// URL da imagem padrão (logo genérica - substitua pela sua do Imgur)
const LOGO_PADRAO = 'https://imgur.com/a/X19yIs7';

async function carregarEmpresas() {
    const token = localStorage.getItem('authToken');
    
    document.getElementById("loadingSpinner").style.display = "block";
    
    const response = await makeRequest("/Restaurant", {}, token, "GET");
    
    document.getElementById("loadingSpinner").style.display = "none";
    
    if (response.ok && response.payload) {
        exibirEmpresas(response.payload);
    } else {
        console.error("Erro ao carregar empresas:", response);
        exibirEmpresas([]);
    }
}

function exibirEmpresas(empresasParaExibir) {
    const container = document.getElementById("companiesContainer");
    const emptyState = document.getElementById("emptyState");
    
    if (!empresasParaExibir || empresasParaExibir.length === 0) {
        container.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }
    
    emptyState.style.display = "none";
    container.innerHTML = empresasParaExibir.map((empresa) => {
        const empresaId = empresa.id?.$oid || empresa.id?.timestamp || empresa.id;
        return `
        <div class="company-card my-3 position-relative p-4">
            <div class="company-status status-active">Ativo</div>
            <div class="company-actions">
                <button class="action-btn view-btn" onclick="visualizarEmpresa('${empresaId}')" title="Visualizar">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            <div class="d-flex gap-3 align-items-center mb-3">
                <img src="${LOGO_PADRAO}" alt="${empresa.name}" class="company-logo me-3" 
                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div>
                    <span class="company-category">${empresa.cep?.state || ""}</span>
                    <h5 class="fw-bold mb-1">${empresa.name || ""}</h5>
                </div>
            </div>
            <div class="contact-info mt-2">
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i> 
                    <span>${empresa.cep?.city || ""}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-city"></i> 
                    <span>${empresa.cep?.neighborhood || ""}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function buscarEmpresas(termo) {
    const token = localStorage.getItem('authToken');
    const response = await makeRequest("/Restaurant", {}, token, "GET");
    
    if (!response.ok || !response.payload) {
        console.error("Erro ao buscar empresas:", response);
        exibirEmpresas([]);
        return;
    }
    
    const empresas = response.payload;
    termo = termo.toLowerCase();
    
    const filtradas = empresas.filter(empresa =>
        (empresa.name || "").toLowerCase().includes(termo) ||
        (empresa.cep?.city || "").toLowerCase().includes(termo) ||
        (empresa.cep?.state || "").toLowerCase().includes(termo)
    );
    
    exibirEmpresas(filtradas);
}

function visualizarEmpresa(id) {
    window.location.href = `empresa-detalhes.html?id=${id}`;
}

document.getElementById("searchInput")?.addEventListener("input", e => buscarEmpresas(e.target.value));
document.addEventListener("DOMContentLoaded", carregarEmpresas);
