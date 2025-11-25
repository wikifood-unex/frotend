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

async function makeRequest(endpoint, data, token=null, isFormData=false){
  const headers = {
    'Accept': 'application/json'
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }

  const options = {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data)
  };


  const res = await fetch(API_BASE_URL + endpoint, options);

  let payload;
  try {
    payload = await res.json();
  } catch {
    payload = await res.text();
  }

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
    showMessage(Bem-vindo(a), ${result.payload.name},'success');
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


// CADASTRAR RECEITA (USANDO imageUrl LEGADO)
document.getElementById('btn-add-recipe').addEventListener('click', async ()=>{

  const token = localStorage.getItem('authToken');
  if (!token) {
    showMessage('Você precisa estar logado para cadastrar receitas!');
    return;
  }

  const title = document.getElementById('recipe-title').value.trim();
  const lore = document.getElementById('recipe-lore').value.trim();
  const description = document.getElementById('recipe-ingredients').value.trim();

  // ⬇ CAMPO DE ARQUIVO (input type="file")
  const imageFile = document.getElementById('recipe-image').files[0];

  // ⬇ CAMPO LEGADO (URL opcional)
  const imageUrl = document.getElementById('recipe-url').value.trim();

  if (!title || !lore || !description) {
    showMessage('Preencha todos os campos obrigatórios!');
    return;
  }

  // Criando FormData conforme o PDF
  const form = new FormData();
  form.append('title', title);
  form.append('lore', lore);
  form.append('description', description);

  // Se tiver arquivo → usa novo sistema
  if (imageFile) {
    form.append('image', imageFile);
  }

  // Se tiver URL → usa o modo legado
  if (imageUrl) {
    form.append('imageUrl', imageUrl);
  }

  showMessage('Enviando receita...', 'success');

  const res = await fetch(`${API_BASE_URL}/Receipt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
      // ⚠ NÃO adicionar Content-Type!
    },
    body: form
  });

  const data = await res.json().catch(() => null);

  if (res.ok) {
    showMessage('Receita cadastrada com sucesso!', 'success');
    console.log('Receita criada:', data);
  } else {
    showMessage(data?.message || 'Erro ao cadastrar receita');
    console.error(data);
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
