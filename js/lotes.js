// =====================================================
// LOTES.JS — VERSÃO FINAL ESTÁVEL
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

    const { error } = await window.supabaseClient
      .from('lotes')
      .insert([{ nome, quantidade, cor }]);

    if (error) throw error;

    await carregarSistema();

    nomeInput.value = '';
    totalInput.value = '';

    alert("Lote cadastrado com sucesso!");

  } catch (err) {
    console.error('Erro ao cadastrar lote:', err);
    alert('Erro ao cadastrar lote.');
  }
};



// =====================================================
// ALTERAR QUANTIDADE DO LOTE
// =====================================================
window.alterarQuantidade = async function (loteId) {

  if (!window.state || !Array.isArray(state.lotes)) {
    alert("State não carregado.");
    return;
  }

  let lote = state.lotes.find(l =>
    String(l.id) === String(loteId)
  );

  if (!lote) {
    alert("Lote não encontrado.");
    return;
  }

  const novaQuantidade = prompt(
    `Quantidade atual: ${lote.quantidade}\n\nDigite a nova quantidade:`,
    lote.quantidade
  );

  if (novaQuantidade === null) return;

  const quantidadeNumero = parseInt(novaQuantidade);

  if (isNaN(quantidadeNumero) || quantidadeNumero < 0) {
    alert("Quantidade inválida.");
    return;
  }



  // =================================================
  // REGRA 1 — NÃO PODE SER MENOR QUE ALOCADOS
  // =================================================
  const alocados = (state.posicoes || []).filter(p =>
    p.ocupada &&
    String(p.lote_id) === String(lote.id)
  ).length;

  if (quantidadeNumero < alocados) {

    alert(
      `Não pode ser menor que ${alocados} (gaylords já alocados no mapa).`
    );

    return;
  }



  // =================================================
  // REGRA 2 — NÃO PODE SER MENOR QUE EXPEDIDOS
  // =================================================
  const historico = state.historicoExpedidos || [];

  const expedidos = historico.filter(r =>
    String(r.lote_id) === String(lote.id)
  ).length;

  if (quantidadeNumero < expedidos) {

    alert(
      `Não pode ser menor que ${expedidos} (gaylords já expedidos).`
    );

    return;
  }



  try {

    const { error } = await window.supabaseClient
      .from("lotes")
      .update({ quantidade: quantidadeNumero })
      .eq("id", lote.id);

    if (error) {
      alert("Erro no banco: " + error.message);
      return;
    }

    const index = state.lotes.findIndex(l =>
      String(l.id) === String(lote.id)
    );

    if (index !== -1) {
      state.lotes[index].quantidade = quantidadeNumero;
    }

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

    alert("Quantidade atualizada com sucesso!");

  } catch (err) {
    console.error(err);
    alert("Erro inesperado.");
  }
};



// =====================================================
// EXCLUIR LOTE
// =====================================================
window.excluirLote = async function (loteId) {

  const alocados = (state.posicoes || []).filter(p =>
    p.ocupada &&
    String(p.lote_id) === String(loteId)
  ).length;

  const historico = state.historicoExpedidos || [];

  const expedidos = historico.filter(r =>
    String(r.lote_id) === String(loteId)
  ).length;

  if (alocados > 0 || expedidos > 0) {

    alert(
      "Não é possível excluir. Existem gaylords alocados ou expedidos."
    );

    return;
  }

  if (!confirm("Tem certeza que deseja excluir este lote?")) return;

  try {

    const { error } = await window.supabaseClient
      .from("lotes")
      .delete()
      .eq("id", loteId);

    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }

    state.lotes = state.lotes.filter(l =>
      String(l.id) !== String(loteId)
    );

    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }

    alert("Lote excluído com sucesso!");

  } catch (err) {
    console.error(err);
    alert("Erro inesperado.");
  }
};



// =====================================================
// FILTROS DINÂMICOS
// =====================================================


// LOTES ATIVOS
window.getLotesAtivos = function () {

  const historico = state.historicoExpedidos || [];

  return (state.lotes || []).filter(lote => {

    const total = Number(lote.quantidade ?? 0);

    const expedidos = historico.filter(r =>
      String(r.lote_id) === String(lote.id)
    ).length;

    return expedidos < total;
  });

};



// LOTES EXPEDIDOS
window.getLotesExpedidos = function () {

  const historico = state.historicoExpedidos || [];

  return (state.lotes || []).filter(lote => {

    const total = Number(lote.quantidade ?? 0);

    const expedidos = historico.filter(r =>
      String(r.lote_id) === String(lote.id)
    ).length;

    return total > 0 && expedidos >= total;
  });

};
