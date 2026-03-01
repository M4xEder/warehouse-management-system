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


// ===============================
// ALTERAR QUANTIDADE — ENTERPRISE DEFINITIVO
// ===============================
window.alterarQuantidade = async function (loteId) {

  const lote = state.lotes.find(l =>
    idEquals(l.id, loteId)
  );

  if (!lote) {
    alert("Lote não encontrado no state.");
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

  try {

    console.log("🔄 Atualizando lote UUID:", lote.id);

    const { data, error } = await window.supabaseClient
      .from("lotes")
      .update({ quantidade: quantidadeNumero })
      .eq("id", lote.id) // 🔥 UUID STRING
      .select(); // 🔥 força retorno

    console.log("Resposta Supabase:", data);
    console.log("Erro Supabase:", error);

    if (error) {
      alert("Erro ao atualizar no banco: " + error.message);
      return;
    }

    if (!data || data.length === 0) {
      alert("Nenhum registro foi atualizado. Verifique RLS ou UUID.");
      return;
    }

    // 🔥 Recarrega sistema completo (melhor prática)
    if (typeof carregarSistema === "function") {
      await carregarSistema();
    } else {
      lote.quantidade = quantidadeNumero;
      renderDashboard();
    }

    alert("Quantidade atualizada com sucesso!");

  } catch (err) {
    console.error("Erro inesperado:", err);
    alert("Erro inesperado ao atualizar.");
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
