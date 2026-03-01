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

//======================================================
// alterar quantidade lote 
//======================================================
window.alterarQuantidade = async function (loteId) {

  console.log("ID recebido:", loteId);

  let lote = state.lotes.find(l =>
    String(l.id) === String(loteId)
  );

  // 🔥 Se não encontrar no state, busca direto no banco
  if (!lote) {
    console.warn("Não encontrado no state. Buscando no banco...");

    const { data, error } = await window.supabaseClient
      .from("lotes")
      .select("*")
      .eq("id", loteId)
      .single();

    if (error || !data) {
      alert("Lote não encontrado.");
      return;
    }

    lote = data;
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

  try {

    const { data, error } = await window.supabaseClient
      .from("lotes")
      .update({ quantidade: quantidadeNumero })
      .eq("id", lote.id)
      .select()
      .single();

    if (error) {
      alert("Erro no banco: " + error.message);
      return;
    }

    // 🔥 Atualiza state corretamente
    const index = state.lotes.findIndex(l =>
      String(l.id) === String(lote.id)
    );

    if (index !== -1) {
      state.lotes[index] = data;
    }

    renderDashboard();

    alert("Quantidade atualizada com sucesso!");

  } catch (err) {
    console.error(err);
    alert("Erro inesperado.");
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
