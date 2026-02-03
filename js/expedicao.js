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

  // Percorre todo o mapa para coletar e limpar posições
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === nomeLote) {
          expedidos.push({
            area: area.nome,
            rua: rua.nome,
            posicao: rua.posicoes.indexOf(pos) + 1,
            rz: pos.rz,
            volume: pos.volume || '-'
          });

          // Limpa a posição
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

  // Salva histórico de expedição
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: nomeLote,
    quantidade,
    data: new Date().toLocaleDateString(),
    hora: new Date().toLocaleTimeString(),
    detalhes: expedidos
  });

  // Remove lote do dashboard ativo
  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();

  // Atualiza visualizações
  if (typeof renderMapa === 'function') renderMapa();
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderExpedidos === 'function') renderExpedidos();

  alert(`Lote "${nomeLote}" expedido com sucesso (${quantidade})`);
};

// ===============================
// RENDERIZA EXPEDIDOS
// ===============================
window.renderExpedidos = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (state.historicoExpedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido</p>';
    return;
  }

  state.historicoExpedidos.forEach(h => {
    const card = document.createElement('div');
    card.className = 'historico-item';

    let detalhesHTML = '';
    h.detalhes.forEach(d => {
      detalhesHTML += `<li>${d.area} / ${d.rua} / Posição ${d.posicao} - RZ: ${d.rz} - Volume: ${d.volume}</li>`;
    });

    card.innerHTML = `
      <strong>Lote: ${h.lote}</strong> (${h.quantidade})<br>
      Data: ${h.data} ${h.hora}
      <ul>${detalhesHTML}</ul>
    `;

    container.appendChild(card);
  });
};
