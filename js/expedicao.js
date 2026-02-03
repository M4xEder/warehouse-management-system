// =======================================
// EXPEDICAO.JS
// Responsável por expedir lotes
// =======================================

window.expedirLote = function (nomeLote) {
  if (!nomeLote) return;

  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const expedidos = [];
  let quantidade = 0;

  // Percorre todo o mapa
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach((pos, index) => {
        if (pos.ocupada && pos.lote === nomeLote) {

          // Guarda histórico
          expedidos.push({
            area: area.nome,
            rua: rua.nome,
            posicao: index + 1,
            rz: pos.rz || '-',
            volume: pos.volume || '-'
          });

          // Libera posição
          pos.ocupada = false;
          pos.lote = null;
          pos.rz = null;
          pos.volume = null;

          quantidade++;
        }
      });
    });
  });

  if (quantidade === 0) {
    alert('Nenhum gaylord encontrado para este lote');
    return;
  }

  // Garante histórico
  if (!Array.isArray(state.historicoExpedidos)) {
    state.historicoExpedidos = [];
  }

  // Salva histórico
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    quantidade,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes: expedidos
  });

  // Remove lote ativo
  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();

  // Atualiza interface
  renderMapa();
  renderDashboard();
  if (typeof renderExpedidos === 'function') {
    renderExpedidos();
  }

  alert(`Lote "${nomeLote}" expedido com sucesso (${quantidade})`);
};
