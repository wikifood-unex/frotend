// cadastros.js - versão robusta para evitar problemas com DOMContentLoaded e erros silenciosos
const API_BASE_URL = 'https://wikifood.gustavoanjos.com/api';
const msg = document.getElementById('message');

function debugLog(...args) {
  if (window && window.console) console.log('[wiki-debug]', ...args);
}

// Funções de UI
function showMessage(text, type = 'error') {
  if (!msg) debugLog('Elemento #message não encontrado');
  msg.className = 'msg ' + (type === 'success' ? 'success' : 'error');
  msg.textContent = text;
}

function showRegister() {
  document.getElementById('login-form')?.classList.remove('active');
  document.getElementById('register-form')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Cadastro - WikiFood';
  msg.textContent = '';
}

function showLogin() {
  document.getElementById('register-form')?.classList.remove('active');
  document.getElementById('login-form')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Login - WikiFood';
  msg.textContent = '';
}

function showRecipeSection() {
  document.getElementById('login-form')?.classList.remove('active');
  document.getElementById('register-form')?.classList.remove('active');
  document.getElementById('recipe-section')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Cadastrar Receita';
  msg.textContent = '';
}

// Requisição geral
async function makeRequest(endpoint, data, token = null, isFormData = false) {
  const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
  if (!isFormData) headers['Content-Type'] = 'application/json';

  debugLog('makeRequest', endpoint, { isFormData, tokenPresent: !!token });

  const res = await fetch(API_BASE_URL + endpoint, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data)
  });

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();
  return { ok: res.ok, status: res.status, payload };
}

// Função que registra todos os listeners — pode ser chamada imediatamente
function registerEventListeners() {
  debugLog('Registrando event listeners');

  // LOGIN
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      try {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!email || !password) { showMessage('Preencha e-mail e senha'); return; }
        showMessage('Entrando...', 'success');
        const result = await makeRequest('/Auth/login', { email, password });
        if (result.ok) {
          const token = result.payload.token;
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify({ name: result.payload.name, email: result.payload.email }));
          showMessage(`Bem-vindo(a), ${result.payload.name}`, 'success');
          setTimeout(showRecipeSection, 500);
        } else {
          showMessage(result.payload?.message || 'Erro no login');
        }
      } catch (err) {
        console.error(err);
        showMessage('Erro no login (ver console)');
      }
    });
  } else debugLog('#btn-login não encontrado');

  // CADASTRO
  const btnRegister = document.getElementById('btn-register');
  if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
      try {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        if (!name || !email || !password) { showMessage('Preencha todos os campos'); return; }
        if (password.length < 6) { showMessage('Senha mínima 6 caracteres'); return; }
        showMessage('Cadastrando...', 'success');
        const result = await makeRequest('/Auth/register', { name, email, password });
        if (result.ok) {
          showMessage('Cadastro realizado! Faça login', 'success');
          setTimeout(showLogin, 1000);
        } else showMessage(result.payload?.message || 'Erro no cadastro');
      } catch (err) {
        console.error(err);
        showMessage('Erro no cadastro (ver console)');
      }
    });
  } else debugLog('#btn-register não encontrado');

  // CADASTRO RECEITA
  const btnAddRecipe = document.getElementById('btn-add-recipe');
  if (btnAddRecipe) {
    btnAddRecipe.addEventListener('click', async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { showMessage('Você precisa estar logado para cadastrar receitas!'); return; }

        const title = document.getElementById('recipe-title').value.trim();
        const lore = document.getElementById('recipe-lore').value.trim();
        const imageFile = document.getElementById('recipe-file')?.files?.[0];

        if (!title || !lore) { showMessage('Preencha todos os campos obrigatórios!'); return; }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('lore', lore);
        formData.append('description', lore);
        if (imageFile) formData.append('image', imageFile);

        showMessage('Enviando receita...', 'success');
        const result = await makeRequest('/Receipt', formData, token, true);
        if (result.ok) {
          showMessage('Receita cadastrada com sucesso!', 'success');
          document.getElementById('recipe-title').value = '';
          document.getElementById('recipe-lore').value = '';
          if (document.getElementById('recipe-file')) document.getElementById('recipe-file').value = '';
        } else {
          showMessage(result.payload?.message || 'Erro ao cadastrar receita', 'error');
        }
      } catch (err) {
        console.error(err);
        showMessage('Erro ao enviar receita (ver console)');
      }
    });
  } else debugLog('#btn-add-recipe não encontrado');

  // LOGOUT
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      showLogin();
    });
  }

  // LINKS TROCADORES DE TELA
  const linkRegister = document.getElementById('link-register');
  if (linkRegister) linkRegister.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
  else debugLog('#link-register não encontrado');

  const linkLogin = document.getElementById('link-login');
  if (linkLogin) linkLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
  else debugLog('#link-login não encontrado');

  const btnSkip = document.getElementById('btn-skip');
  if (btnSkip) btnSkip.addEventListener('click', () => { window.location.href = '/index.html'; });
  else debugLog('#btn-skip não encontrado');

  debugLog('Event listeners registrados com sucesso');
}

// Se DOM já estiver pronto, registra agora; senão espera o evento
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOMContentLoaded fired');
    registerEventListeners();
    // show recipe if token exists
    if (localStorage.getItem('authToken')) showRecipeSection();
  });
} else {
  debugLog('Document already ready, registrando listeners agora');
  registerEventListeners();
  if (localStorage.getItem('authToken')) showRecipeSection();
}
