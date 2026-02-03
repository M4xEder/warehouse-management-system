// =======================================
// EXPEDICAO.JS — EXPEDIÇÃO DE LOTES
// =======================================

window.expedirLote = function (nomeLote) {
  if (!nomeLote) return alert('Nenhum lote selecionado');

  const lote = state.lotes.find(l => l.nome === nomeLote);
  if (!lote) return alert('Lote não encontrado');

  const expedidos = [];
  let quantidade = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === nomeLote) {
          expedidos.push({
            area: area.nome,
            rua: rua.nome,
            rz: pos.rz,
            volume: pos.volume || '-'
          });

          pos.ocupada = false;
          pos.lote = null;
          pos.rz = null;
          pos.volume = null;

          quantidade++;
        }
      });
    });
  });

  if (quantidade === 0) return alert('Nenhum gaylord encontrado para este lote');

  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    quantidade,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes: expedidos
  });

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderMapa();
  renderDashboard();
  renderExpedidos();

  alert(`Lote "${nomeLote}" expedido com sucesso (${quantidade})`);
};

// FUNÇÃO PARA RENDERIZAR HISTÓRICO
window.renderExpedidos = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (state.historicoExpedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido</p>';
    return;
  }

  state.historicoExpedidos.forEach(h => {
    const div = document.createElement('div');
    div.className = 'historico-item';

    div.innerHTML = `
      <strong>Lote: ${h.lote}</strong> (${h.quantidade})
      <br>Data: ${h.data} ${h.hora}
      <br>Detalhes: ${h.detalhes.map(d => `Área: ${d.area}, Rua: ${d.rua}, RZ: ${d.rz}, Volume: ${d.volume}`).join('<br>')}
    `;

    container.appendChild(div);
  });
};
