// ===============================
// UTILS.JS — FUNÇÕES AUXILIARES
// ===============================

// -------------------------------
// CONTAR GAYLORDS ALOCADAS NO MAPA
// -------------------------------
window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.ocupada && pos.lote === nomeLote) {
          total++;
        }
      });
    });
  });

  return total;
};

// -------------------------------
// TOTAL EXPEDIDO DO LOTE
// -------------------------------
window.totalExpedidoDoLote = function (nomeLote) {
  if (!Array.isArray(state.historicoExpedidos)) return 0;

  return state.historicoExpedidos
    .filter(h => h.lote === nomeLote)
    .reduce((soma, h) => soma + h.detalhes.length, 0);
};
