// ===============================
// RUAS.JS — SUPABASE
// ===============================


// ===============================
// CARREGAR RUAS
// ===============================
window.carregarRuasDoBanco = async function () {

  const { data, error } = await window.supabaseClient
    .from('ruas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar ruas:', error);
    return;
  }

  state.ruas = data || [];
};



// ===============================
// CRIAR RUA
// ===============================
window.criarRua = async function (areaId) {

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const { error } = await window.supabaseClient
    .from('ruas')
    .insert([{ nome, area_id: areaId }]);

  if (error) {
    console.error(error);
    alert('Erro ao criar rua');
    return;
  }

  await carregarRuasDoBanco();
  renderMapa();
};



// ===============================
// EXCLUIR RUA
// ===============================
window.excluirRua = async function (ruaId) {

  if (!confirm('Excluir rua?')) return;

  const { error } = await window.supabaseClient
    .from('ruas')
    .delete()
    .eq('id', ruaId);

  if (error) {
    console.error(error);
    alert('Erro ao excluir rua');
    return;
  }

  await carregarRuasDoBanco();
  renderMapa();
};
