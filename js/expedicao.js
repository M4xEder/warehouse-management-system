// ==================================
// EXPEDICAO.JS — SAÍDA DE LOTES
// ==================================

window.expedirLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return alert('Lote não encontrado');

  if (lote.usados === 0) {
    return alert('Nenhuma gaylord alocada neste lote');
  }

  if (!confirm(`Expedir lote "${lote.nome}"?`)) return;

  const removidos = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (pos.ocupada && pos.lote === lote.nome) {
          removidos.push({
            rz: pos.rz,
            volume: pos.volume || '-',
            area: area.nome,
            rua: rua.nome,
            posicao: index + 1
          });

          pos.ocupada = false;
          pos.lote = null;
          pos.rz = null;
          pos.volume = null;
        }
      });
    });
  });

  if (removidos.length === 0) {
    return alert('Nenhuma posição encontrada para expedição');
  }

  // HISTÓRICO
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: lote.nome,
    expedidos: removidos.length,
    totalOriginal: lote.total,
    observacao:
      removidos.length < lote.total
        ? `Expedido parcialmente (${removidos.length})`
        : 'Expedido completo',
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes: removidos
  });

  // ATUALIZA LOTE
  lote.total -= removidos.length;
  lote.usados = 0;

  if (lote.total <= 0) {
    state.lotes = state.lotes.filter(l => l.id !== loteId);
  }

  saveState();
  renderMapa();
};
