// =====================================================
// LOTES.JS — VERSÃO PROFISSIONAL FINAL BLINDADA
// =====================================================



// =====================================================
// CADASTRAR LOTE
// =====================================================
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
        .ilike('nome', nome);

    if (erroBusca) throw erroBusca;

    if (existente.length > 0) {
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

    const { data, error } = await window.supabaseClient
      .from('lotes')
      .insert([{
        nome,
        quantidade,
        cor,
        status: 'ATIVO'
      }])
      .select()
      .single();

    if (error) throw error;

    // 🔄 Recarrega sistema completo
    if (typeof carregarSistema === 'function') {
      await carregarSistema();
    }

    nomeInput.value = '';
    totalInput.value = '';

  } catch (err) {
    console.error('Erro ao cadastrar lote:', err);
    alert('Erro ao cadastrar lote.');
  }
};



// =====================================================
// ALTERAR QUANTIDADE
// =====================================================
window.alterarQuantidadeLote = async function (loteId) {

  const lote = state.lotes.find(l => l.id === loteId);

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

    if (error) throw error;

    if (typeof carregarSistema === 'function') {
      await carregarSistema();
    }

    alert('Quantidade atualizada com sucesso.');

  } catch (err) {
    console.error('Erro ao atualizar lote:', err);
    alert('Erro ao atualizar lote.');
  }
};



// =====================================================
// EXCLUIR LOTE (BLINDADO)
// =====================================================
window.excluirLote = async function (loteId) {

  const lote = state.lotes.find(l => l.id === loteId);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  // 🔒 Verifica se ainda existem posições vinculadas
  const { count, error: erroCount } =
    await window.supabaseClient
      .from('posicoes')
      .select('*', { count: 'exact', head: true })
      .eq('lote_id', lote.id);

  if (erroCount) {
    console.error(erroCount);
    alert('Erro ao validar posições do lote.');
    return;
  }

  if (count > 0) {
    alert('Não é possível excluir lote com posições vinculadas.');
    return;
  }

  if (!confirm(`Deseja realmente excluir o lote "${lote.nome}"?`)) {
    return;
  }

  try {

    const { error } = await window.supabaseClient
      .from('lotes')
      .delete()
      .eq('id', lote.id);

    if (error) throw error;

    if (typeof carregarSistema === 'function') {
      await carregarSistema();
    }

    alert('Lote excluído com sucesso.');

  } catch (err) {
    console.error('Erro ao excluir lote:', err);
    alert('Erro ao excluir lote.');
  }
};



// =====================================================
// UTILITÁRIOS DE FILTRO
// =====================================================

// Lotes Ativos (ATIVO + PARCIAL)
window.getLotesAtivos = function () {
  return state.lotes.filter(l =>
    l.status === 'ATIVO' || l.status === 'PARCIAL'
  );
};

// Lotes Expedidos
window.getLotesExpedidos = function () {
  return state.lotes.filter(l =>
    l.status === 'EXPEDIDO'
  );
};
