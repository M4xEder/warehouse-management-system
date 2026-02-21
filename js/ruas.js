// ===============================
// RUAS.JS — SUPABASE (ENDEREÇAMENTO PROFISSIONAL)
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
// CRIAR RUA + POSIÇÕES AUTOMÁTICAS
// ===============================
window.criarRua = async function (areaId) {

  const nome = prompt('Nome da rua');
  if (!nome) return;

  const quantidade = Number(prompt('Quantas posições essa rua terá?'));
  if (!quantidade || quantidade <= 0) {
    alert('Quantidade inválida.');
    return;
  }

  try {

    // 🔹 1️⃣ Criar rua
    const { data: novaRua, error: erroRua } =
      await window.supabaseClient
        .from('ruas')
        .insert([{
          nome,
          area_id: areaId,
          quantidade_posicoes: quantidade
        }])
        .select()
        .single();

    if (erroRua) throw erroRua;

    // 🔹 2️⃣ Criar posições vinculadas
    const posicoes = [];

    for (let i = 1; i <= quantidade; i++) {
      posicoes.push({
        rua_id: novaRua.id,
        numero: i,
        ocupada: false
      });
    }

    const { error: erroPosicoes } =
      await window.supabaseClient
        .from('posicoes')
        .insert(posicoes);

    if (erroPosicoes) throw erroPosicoes;

    alert('Rua criada com sucesso!');

    await carregarRuasDoBanco();
    renderMapa();

  } catch (err) {
    console.error('Erro ao criar rua:', err);
    alert('Erro ao criar rua.');
  }
};



// ===============================
// EXCLUIR RUA (CASCADE NAS POSIÇÕES)
// ===============================
window.excluirRua = async function (ruaId) {

  if (!confirm('Excluir rua? Isso removerá todas as posições dela.')) return;

  try {

    const { error } = await window.supabaseClient
      .from('ruas')
      .delete()
      .eq('id', ruaId);

    if (error) throw error;

    await carregarRuasDoBanco();
    renderMapa();

  } catch (err) {
    console.error('Erro ao excluir rua:', err);
    alert('Erro ao excluir rua.');
  }
};
