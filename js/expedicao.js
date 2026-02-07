// =======================================
// EXPEDICAO.JS — ESTÁVEL E DEFENSIVO
// =======================================

// -------------------------------
// GARANTIA DE ARRAY
// -------------------------------
function garantirHistorico() {
  if (!Array.isArray(state.historicoExpedidos)) {
    state.historicoExpedidos = [];
    saveState();
  }
}

// -------------------------------
// TOTAL JÁ EXPEDIDO
// -------------------------------
function totalExpedidoDoLote(nomeLote) {
  garantirHistorico();

  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((soma, e) => soma + e.quantidadeExpedida, 0);
}

// -------------------------------
// EXPEDIR LOTE
// -------------------------------
window.expedirLote = function (nomeLote, quantidade) {
  garantirHistorico();

  const lote = state.lotes.find(l => l.nome === nomeLote && l.ativo !== false);

  if (!lote) {
    alert('Lote ativo não encontrado');
    return;
  }

  quantidade = Number(quantidade);

  if (!quantidade || quantidade <= 0) {
    alert('Informe uma quantidade válida');
    return;
  }

  const totalExpedido = totalExpedidoDoLote(nomeLote);
  const saldoDisponivel = lote.total - totalExpedido;

  if (saldoDisponivel <= 0) {
    alert('Este lote já foi totalmente expedido');
    return;
  }

  if (quantidade > saldoDisponivel) {
    alert(
      `Quantidade maior que o saldo disponível\n\n` +
      `Saldo atual: ${saldoDisponivel}`
    );
    return;
  }

  // REGISTRO DA EXPEDIÇÃO
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    quantidadeExpedida: quantidade,
    data: new Date().toISOString()
  });

  saveState();

  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderLotesExpedidos === 'function') renderLotesExpedidos();

  alert('Expedição realizada com sucesso');
};
