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
        if (pos.lote === nomeLote) {
          expedidos.push({
            area: area.nome,
            rua: rua.nome,
            posicao: index + 1,
            rz: pos.rz,
            volume: pos.volume || '-'
          });

          // limpa posição
          pos.lote = '';
          pos.rz = '';
          pos.volume = '';

          quantidade++;
        }
      });
    });
  });

  if (quantidade === 0) {
    alert('Nenhum gaylord encontrado para este lote');
    return;
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

  // Re-render
  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert(`Lote "${nomeLote}" expedido com sucesso (${quantidade})`);
};
