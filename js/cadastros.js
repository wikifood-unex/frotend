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
