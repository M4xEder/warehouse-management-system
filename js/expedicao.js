// =======================================
// EXPEDICAO.JS — CONTROLE DEFINITIVO
// =======================================

// -------------------------------
// TOTAL JÁ EXPEDIDO DO LOTE
// -------------------------------
function totalExpedidoDoLote(nomeLote) {
  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((soma, e) => soma + e.quantidadeExpedida, 0);
}

// -------------------------------
// SALDO DISPONÍVEL PARA EXPEDIÇÃO
// (SEMPRE DINÂMICO)
// -------------------------------
function saldoParaExpedicao(nomeLote) {
  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return 0;

  const totalExpedido = totalExpedidoDoLote(nomeLote);
  return lote.total - totalExpedido;
}

// -------------------------------
// EXPEDIR LOTE
// -------------------------------
window.expedirLote = function (nomeLote, quantidade) {
  const lote = state.lotes.find(l => l.nome === nomeLote);

  if (!lote) {
    alert('Lote não encontrado');
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
      `Quantidade maior que o saldo disponível.\n\n` +
      `Lote: ${nomeLote}\n` +
      `Total do lote: ${lote.total}\n` +
      `Já expedido: ${totalExpedido}\n` +
      `Saldo disponível: ${saldoDisponivel}`
    );
    return;
  }

  // -------------------------------
  // REGISTRA EXPEDIÇÃO
  // -------------------------------
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    quantidadeExpedida: quantidade,
    data: new Date().toISOString()
  });

  saveState();

  // Atualizações visuais
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderLotesExpedidos === 'function') renderLotesExpedidos();
};

// -------------------------------
// VERIFICA SE LOTE AINDA PODE EXPEDIR
// (USADO EM MODAIS / SELECTS)
// -------------------------------
window.loteDisponivelParaExpedicao = function (nomeLote) {
  return saldoParaExpedicao(nomeLote) > 0;
};
