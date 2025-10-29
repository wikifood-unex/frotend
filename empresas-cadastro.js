async function salvarEmpresa() {
    const token = localStorage.getItem('authToken');
    
    console.log('Token:', token);
    
    if (!token) {
        document.getElementById('msgCadastro').innerHTML = 
            '<div class="alert alert-warning">Você precisa fazer <a href="cadastros.html">login</a> primeiro!</div>';
        return;
    }

    const nome = document.getElementById('nomeEmpresa').value.trim();
    const cepCode = document.getElementById('cep').value.trim();
    const rua = document.getElementById('rua').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const estado = document.getElementById('estado').value;

    if (!nome || !cepCode || !estado) {
        document.getElementById('msgCadastro').innerHTML = 
            '<div class="alert alert-danger">Preencha todos os campos obrigatórios!</div>';
        return;
    }

    const novoRestaurante = {
        name: nome,
        cep: {
            code: cepCode,
            street: rua,
            city: cidade,
            neighborhood: bairro,
            state: estado
        }
    };

    console.log("Enviando:", novoRestaurante);

    const response = await makeRequest("/Restaurant", novoRestaurante, token, "POST");
    
    console.log("Resposta:", response);

    if (response.ok && response.payload) {
        document.getElementById('msgCadastro').innerHTML = 
            '<div class="alert alert-success">Empresa cadastrada!</div>';
        setTimeout(() => window.location.href = 'empresas-listagem.html', 1500);
    } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        document.getElementById('msgCadastro').innerHTML = 
            '<div class="alert alert-danger">Sessão expirada! <a href="cadastros.html">Faça login novamente</a></div>';
    } else {
        document.getElementById('msgCadastro').innerHTML = 
            `<div class="alert alert-danger">Erro: ${JSON.stringify(response.payload)}</div>`;
    }
}
