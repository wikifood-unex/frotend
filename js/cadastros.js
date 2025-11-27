// cadastros.js - Versão corrigida (Bug de Logout + Upload Imagens)

const API_BASE_URL = 'https://wikifood.gustavoanjos.com/api';
const msg = document.getElementById('message');

function debugLog(...args) {
  if (window && window.console) console.log('[wiki-debug]', ...args);
}

// Funções de UI
function showMessage(text, type = 'error') {
  if (!msg) return;
  msg.className = 'msg ' + (type === 'success' ? 'success' : 'error');
  msg.textContent = text;
}

function showRegister() {
  // Limpa as outras telas para evitar sobreposição
  document.getElementById('login-form')?.classList.remove('active');
  document.getElementById('recipe-section')?.classList.remove('active');
  
  document.getElementById('register-form')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Cadastro - WikiFood';
  msg.textContent = '';
}

function showLogin() {
  // CORREÇÃO AQUI: Garante que a tela de receitas também suma
  document.getElementById('register-form')?.classList.remove('active');
  document.getElementById('recipe-section')?.classList.remove('active');
  
  document.getElementById('login-form')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Login - WikiFood';
  msg.textContent = '';
}

function showRecipeSection() {
  // Limpa as outras telas
  document.getElementById('login-form')?.classList.remove('active');
  document.getElementById('register-form')?.classList.remove('active');
  
  document.getElementById('recipe-section')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Cadastrar Receita';
  msg.textContent = '';
}

// Requisição HTTP genérica
async function makeRequest(endpoint, data, token = null, isFormData = false) {
  const headers = {};
  
  if (token) {
    headers['Authorization'] = 'Bearer ' + token; 
  }

  // IMPORTANTE:
  // Se for FormData (upload), NÃO definimos 'Content-Type'.
  // O navegador definirá automaticamente como 'multipart/form-data; boundary=...'
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  debugLog('makeRequest', endpoint, { isFormData, tokenPresent: !!token });

  try {
    const res = await fetch(API_BASE_URL + endpoint, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data) 
    });

    const contentType = res.headers.get('content-type') || '';
    // A resposta pode ser JSON ou texto dependendo do erro/sucesso
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();
    
    return { ok: res.ok, status: res.status, payload };
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { ok: false, status: 500, payload: { message: 'Erro de conexão' } };
  }
}

function registerEventListeners() {
  // --- LOGIN ---
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) return showMessage('Preencha e-mail e senha');

      showMessage('Entrando...', 'success');
      const result = await makeRequest('/Auth/login', { email, password });
      
      if (result.ok) {
        localStorage.setItem('authToken', result.payload.token);
        localStorage.setItem('user', JSON.stringify({ name: result.payload.name, email: result.payload.email }));
        showMessage(`Bem-vindo(a)!`, 'success');
        setTimeout(showRecipeSection, 500);
      } else {
        showMessage(result.payload?.message || 'Erro no login');
      }
    });
  }

  // --- CADASTRO DE USUÁRIO ---
  const btnRegister = document.getElementById('btn-register');
  if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      
      if (!name || !email || !password) return showMessage('Preencha todos os campos');
      if (password.length < 6) return showMessage('Senha mínima 6 caracteres');

      showMessage('Cadastrando...', 'success');
      const result = await makeRequest('/Auth/register', { name, email, password });
      
      if (result.ok) {
        showMessage('Cadastro realizado! Faça login.', 'success');
        setTimeout(showLogin, 1000);
      } else {
        showMessage(result.payload?.message || 'Erro no cadastro');
      }
    });
  }

  // --- CADASTRO DE RECEITA (UPLOAD) ---
  const btnAddRecipe = document.getElementById('btn-add-recipe');
  if (btnAddRecipe) {
    btnAddRecipe.addEventListener('click', async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return showMessage('Você precisa estar logado!');

      // Coletando dados do HTML
      const title = document.getElementById('recipe-title').value.trim();
      const lore = document.getElementById('recipe-lore').value.trim(); // "História / Preparo"
      const ingredients = document.getElementById('recipe-ingredients').value.trim(); 
      const imageFile = document.getElementById('recipe-file')?.files?.[0];

      if (!title || !lore) return showMessage('Título e História são obrigatórios!');

      // 1. Criando o FormData
      const formData = new FormData();
      
      // Adicionando campos de texto conforme esperado pela API
      formData.append('title', title);
      formData.append('lore', lore);
      
      // O PDF pede 'description'. Vamos usar o campo de Ingredientes para isso.
      formData.append('description', ingredients || 'Sem descrição');

      // 2. Adicionando o arquivo no campo 'image'
      if (imageFile) {
        formData.append('image', imageFile);
      }

      showMessage('Enviando receita e imagem...', 'success');

      // 3. Enviando para o Endpoint /Receipt 
      const result = await makeRequest('/Receipt', formData, token, true); // true indica upload

      if (result.ok) {
        console.log('Receita criada:', result.payload); 
        showMessage('Receita cadastrada com sucesso!', 'success');
        
        // Limpar form
        document.getElementById('recipe-title').value = '';
        document.getElementById('recipe-lore').value = '';
        document.getElementById('recipe-ingredients').value = '';
        document.getElementById('recipe-file').value = '';
      } else {
        showMessage(result.payload?.message || 'Erro ao cadastrar receita', 'error');
      }
    });
  }

  // LOGOUT & NAVEGAÇÃO
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showLogin(); // Agora chama a versão corrigida que limpa a tela de receitas
  });
  document.getElementById('link-register')?.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
  document.getElementById('link-login')?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
  document.getElementById('btn-skip')?.addEventListener('click', () => { window.location.href = 'index.html'; });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  registerEventListeners();
  if (localStorage.getItem('authToken')) showRecipeSection();
});
