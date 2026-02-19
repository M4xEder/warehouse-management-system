// ===============================
// LOTES.JS — SUPABASE INTEGRADO
// ===============================


// ===============================
// CARREGAR LOTES DO BANCO
// ===============================
window.carregarLotesDoBanco = async function () {

  try {

    if (!window.supabaseClient) {
      console.error('❌ supabaseClient não inicializado');
      return;
    }

    const { data, error } = await window.supabaseClient
      .from('lotes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar lotes:', error);
      return;
    }

    state.lotes = data || [];

  } catch (err) {
    console.error('❌ Erro geral carregarLotesDoBanco:', err);
  }
};



// ===============================
// CADASTRAR LOTE
// ===============================
window.cadastrarLote = async function () {

  const nomeInput = document.getElementById('loteNome');
  const totalInput = document.getElementById('loteTotal');

  if (!nomeInput || !totalInput) return;

  const nome = nomeInput.value.trim();
  const quantidade = Number(totalInput.value);

  if (!nome || quantidade <= 0) {
    alert('Informe nome e quantidade válida.');
    return;
  }

  try {

    // 🔎 Verificar duplicidade
    const { data: existente, error: erroBusca } =
      await window.supabaseClient
        .from('lotes')
        .select('id')
        .eq('nome', nome);

    if (erroBusca) {
      console.error(erroBusca);
      alert('Erro ao validar lote.');
      return;
    }

    if (existente && existente.length > 0) {
      alert('Já existe um lote com esse nome.');
      return;
    }

    const cores = [
      '#f59e0b',
      '#3b82f6',
      '#10b981',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#14b8a6',
      '#f97316'
    ];

    const cor = cores[Math.floor(Math.random() * cores.length)];

    const { error } = await window.supabaseClient
      .from('lotes')
      .insert([
        {
          nome,
          quantidade,
          cor,
          status: 'ativo'
        }
      ]);

    if (error) {
      console.error(error);
      alert('Erro ao cadastrar lote.');
      return;
    }

    nomeInput.value = '';
    totalInput.value = '';

    await carregarLotesDoBanco();

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

  } catch (err) {
    console.error('❌ Erro geral cadastrarLote:', err);
  }
};



// ===============================
// ALTERAR QUANTIDADE
// ===============================
window.alterarQuantidadeLote = async function (nomeLote) {

  const lote = state.lotes.find(l => l.nome === nomeLote);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  const novoTotal = Number(
    prompt('Nova quantidade total do lote:', lote.quantidade)
  );

  if (!novoTotal || novoTotal <= 0) {
    alert('Quantidade inválida.');
    return;
  }

  try {

    const { error } = await window.supabaseClient
      .from('lotes')
      .update({ quantidade: novoTotal })
      .eq('id', lote.id);

    if (error) {
      console.error(error);
      alert('Erro ao atualizar lote.');
      return;
    }

    await carregarLotesDoBanco();

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

    alert('Quantidade atualizada com sucesso.');

  } catch (err) {
    console.error('❌ Erro geral alterarQuantidadeLote:', err);
  }
};



// ===============================
// EXCLUIR LOTE
// ===============================
window.excluirLote = async function (nomeLote) {

  const lote = state.lotes.find(l => l.nome === nomeLote);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  if (!confirm(`Deseja realmente excluir o lote "${nomeLote}"?`)) {
    return;
  }

  try {

    const { error } = await window.supabaseClient
      .from('lotes')
      .delete()
      .eq('id', lote.id);

    if (error) {
      console.error(error);
      alert('Erro ao excluir lote.');
      return;
    }

    await carregarLotesDoBanco();

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

    alert('Lote excluído com sucesso.');

  } catch (err) {
    console.error('❌ Erro geral excluirLote:', err);
  }
};
