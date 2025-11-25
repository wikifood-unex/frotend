const API_BASE_URL = 'https://wikifood.gustavoanjos.com/api';
const msg = document.getElementById('message');

// Funções de toggle
function showMessage(text, type='error'){
  msg.className = 'msg ' + (type==='success'?'success':'error');
  msg.textContent = text;
}

function showRegister(){
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('register-form').classList.add('active');
  document.getElementById('form-title').textContent='Cadastro - WikiFood';
  msg.textContent='';
}

function showLogin(){
  document.getElementById('register-form').classList.remove('active');
  document.getElementById('login-form').classList.add('active');
  document.getElementById('form-title').textContent='Login - WikiFood';
  msg.textContent='';
}

function showRecipeSection(){
  document.getElementById('login-form').classList.remove('active');
  document.getElementById('register-form').classList.remove('active');
  document.getElementById('recipe-section').classList.add('active');
  document.getElementById('form-title').textContent='Cadastrar Receita';
  msg.textContent='';
}

// Requisição geral
async function makeRequest(endpoint, data, token=null, isFormData=false){
  const headers = token ? { 'Authorization': 'Bearer '+token } : {};
  if(!isFormData) headers['Content-Type']='application/json';

  const res = await fetch(API_BASE_URL + endpoint,{
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data)
  });

  const contentType = res.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await res.json() : await res.text();
  return { ok:res.ok, status:res.status, payload };
}


// LOGIN
document.getElementById('btn-login').addEventListener('click', async ()=>{

  const email=document.getElementById('login-email').value.trim();
  const password=document.getElementById('login-password').value;

  if(!email||!password){ 
    showMessage('Preencha e-mail e senha'); 
    return; 
  }

  showMessage('Entrando...','success');

  const result = await makeRequest('/Auth/login',{email,password});

  if(result.ok){ 
    const token = result.payload.token;
    localStorage.setItem('authToken',token);
    localStorage.setItem('user',JSON.stringify({name:result.payload.name,email:result.payload.email}));
    showMessage(`Bem-vindo(a), ${result.payload.name}`,'success');
    setTimeout(showRecipeSection,500);
  } 
  else showMessage(result.payload?.message || 'Erro no login');
});


// CADASTRO DE USUÁRIO
document.getElementById('btn-register').addEventListener('click', async ()=>{
  const name=document.getElementById('register-name').value.trim();
  const email=document.getElementById('register-email').value.trim();
  const password=document.getElementById('register-password').value;

  if(!name||!email||!password){ 
    showMessage('Preencha todos os campos'); 
    return; 
  }

  if(password.length<6){ 
    showMessage('Senha mínima 6 caracteres'); 
    return; 
  }

  showMessage('Cadastrando...','success');

  const result = await makeRequest('/Auth/register',{name,email,password});

  if(result.ok){ 
    showMessage('Cadastro realizado! Faça login','success'); 
    setTimeout(showLogin,1000); 
  }
  else showMessage(result.payload?.message || 'Erro no cadastro');
});


// CADASTRAR RECEITA (COM ARQUIVO)
document.getElementById('btn-add-recipe').addEventListener('click', async ()=>{

  const token = localStorage.getItem('authToken');
  if (!token) {
    showMessage('Você precisa estar logado para cadastrar receitas!');
    return;
  }

  const title = document.getElementById('recipe-title').value.trim();
  const lore = document.getElementById('recipe-lore').value.trim();
  const description = lore;

  const imageFile = document.getElementById('recipe-file').files[0];

  if (!title || !lore) {
    showMessage('Preencha todos os campos obrigatórios!');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('lore', lore);
  formData.append('description', description);

  if (imageFile) formData.append('image', imageFile);

  showMessage('Enviando receita...', 'success');

  const result = await makeRequest('/Receipt', formData, token, true);

  if (result.ok) {
    showMessage('Receita cadastrada com sucesso!', 'success');
    document.getElementById('recipe-title').value='';
    document.getElementById('recipe-lore').value='';
    document.getElementById('recipe-file').value='';
  } else {
    showMessage(result.payload?.message || 'Erro ao cadastrar receita');
  }
});


// LOGOUT
document.getElementById('btn-logout').addEventListener('click',()=>{
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  showLogin();
});


// LINKS
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('link-register').addEventListener('click', showRegister);
  document.getElementById('link-login').addEventListener('click', showLogin);

  const token = localStorage.getItem('authToken');
  if (token) showRecipeSection();

  document.getElementById('btn-skip').addEventListener('click', ()=>{
    window.location.href = '/index.html';
  });
});
