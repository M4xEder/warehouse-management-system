// ===============================
// AREAS.JS — SUPABASE COMPLETO
// ===============================


// ===============================
// CARREGAR ÁREAS DO BANCO
// ===============================
window.carregarAreasDoBanco = async function () {

  const { data, error } = await window.supabaseClient
    .from('areas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar áreas:', error);
    alert('Erro ao carregar áreas.');
    return;
  }

  // Mantém compatibilidade com sistema atual
  state.areas = data || [];
};



// ===============================
// BUSCAR ÁREA POR ID
// ===============================
window.buscarAreaPorId = function (areaId) {
  return state.areas.find(a => a.id === areaId);
};



// ===============================
// CRIAR ÁREA
// ===============================
window.criarArea = async function () {

  const nomeInput = document.getElementById('areaNome');
  if (!nomeInput) return;

  const nome = nomeInput.value.trim();

  if (!nome) {
    alert('Informe o nome da área.');
    return;
  }

  // 🔎 Verifica duplicidade (forma segura)
  const { data: existentes, error: erroBusca } = await window.supabaseClient
    .from('areas')
    .select('id')
    .eq('nome', nome);

  if (erroBusca) {
    console.error(erroBusca);
    alert('Erro ao validar área.');
    return;
  }

  if (existentes && existentes.length > 0) {
    alert('Já existe uma área com esse nome.');
    return;
  }

  // ➕ Inserir área
  const { error } = await window.supabaseClient
    .from('areas')
    .insert([{ nome }]);

  if (error) {
    console.error(error);
    alert('Erro ao criar área.');
    return;
  }

  nomeInput.value = '';

  await carregarAreasDoBanco();

  if (typeof renderMapa === 'function') {
    renderMapa();
  }
};



// ===============================
// EXCLUIR ÁREA
// ===============================
window.excluirArea = async function (areaId) {

  if (!areaId) return;

  const area = buscarAreaPorId(areaId);

  if (!area) {
    alert('Área não encontrada.');
    return;
  }

  if (!confirm(`Deseja realmente excluir a área "${area.nome}"?`)) {
    return;
  }

  const { error } = await window.supabaseClient
    .from('areas')
    .delete()
    .eq('id', areaId);

  if (error) {
    console.error(error);
    alert('Erro ao excluir área.');
    return;
  }

  await carregarAreasDoBanco();

  if (typeof renderMapa === 'function') {
    renderMapa();
  }

  alert('Área excluída com sucesso.');
};



// ===============================
// ATUALIZAR NOME DA ÁREA
// ===============================
window.editarArea = async function (areaId) {

  const area = buscarAreaPorId(areaId);
  if (!area) return;

  const novoNome = prompt('Novo nome da área:', area.nome);

  if (!novoNome || !novoNome.trim()) return;

  const { error } = await window.supabaseClient
    .from('areas')
    .update({ nome: novoNome.trim() })
    .eq('id', areaId);

  if (error) {
    console.error(error);
    alert('Erro ao atualizar área.');
    return;
  }

  await carregarAreasDoBanco();

  if (typeof renderMapa === 'function') {
    renderMapa();
  }
};
