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
// ALTERAR QUANTIDADE (VERSÃO CORRIGIDA)
// =====================================================
window.alterarQuantidadeLote = async function (loteId) {

  // 🔥 Garante que o ID seja número
  const id = Number(loteId);

  const lote = state.lotes.find(l => Number(l.id) === id);

  if (!lote) {
    alert('Lote não encontrado.');
    return;
  }

  const novoTotalStr = prompt(
    `Quantidade atual: ${lote.quantidade}\n\nNova quantidade total:`,
    lote.quantidade
  );

  if (novoTotalStr === null) return;

  const novoTotal = Number(novoTotalStr);

  if (isNaN(novoTotal) || novoTotal <= 0) {
    alert('Quantidade inválida.');
    return;
  }

  try {

    const { error } = await window.supabaseClient
      .from('lotes')
      .update({ quantidade: novoTotal })
      .eq('id', id);

    if (error) throw error;

    // 🔄 Recarrega sistema completo
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
