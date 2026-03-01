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
