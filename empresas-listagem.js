const LOGOPADRAO = "logo-padrao.jpg";
let empresasGlobal = [];

window.addEventListener("DOMContentLoaded", carregarEmpresas);

if(document.getElementById('searchInput')) document.getElementById('searchInput').addEventListener('input', filtrarEmpresas);

async function carregarEmpresas() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert("Você precisa estar logado!");
        window.location.href = "login.html";
        return;
    }
    document.getElementById('loadingSpinner').style.display = "block";
    const response = await makeRequest("Company", {}, token, "GET");
    document.getElementById('loadingSpinner').style.display = "none";
    empresasGlobal = response.ok && Array.isArray(response.payload) ? response.payload : [];
    exibirEmpresas(empresasGlobal);
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
    container.innerHTML = empresasParaExibir.map(empresa => `
        <div class="company-card" onclick="verDetalhes('${empresa.id}')">
            <img src="${empresa.logoUrl || LOGOPADRAO}" alt="Logo ${empresa.name}" class="company-logo">
            <div>
                <h5>${empresa.name}</h5>
                <span class="badge bg-primary">${empresa.type || ""}</span>
                <p>
                    CEP: ${empresa.cep}<br>
                    Nº: ${empresa.addressNumber || 'SN'}<br>
                    Endereço: ${empresa.addressComplement || ""}
                </p>
            </div>
        </div>
    `).join('');
}

function verDetalhes(empresaId) {
    window.location.href = `empresa-detalhes.html?id=${empresaId}`;
}

function filtrarEmpresas() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const empresasFiltradas = empresasGlobal.filter(empresa => {
        const nome = empresa.name.toLowerCase();
        return nome.includes(searchTerm);
    });
    exibirEmpresas(empresasFiltradas);
}
