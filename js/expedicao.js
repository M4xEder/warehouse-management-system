// ==================================
// EXPEDICAO.JS
// ==================================

window.expedirLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) return alert('Lote não encontrado');

  // coletar todas as posições desse lote
  const removidos = [];

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes = rua.posicoes.filter(pos => {
        if (pos.loteId === loteId) {
          removidos.push({
            area: area.nome,
            rua: rua.nome,
            posicao: pos.id,
            rz: pos.rz || '',
            volume: pos.volume || ''
          });
          return false;
        }
        return true;
      });
    });
  });

  if (removidos.length === 0) {
    return alert('Nenhum gaylord encontrado para este lote');
  }

  // atualiza lote
  lote.expedidos += removidos.length;

  // cria histórico
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: lote.nome,
    quantidade: removidos.length,
    data: new Date().toLocaleString(),
    detalhes: removidos
  });

  saveState();

  // re-render
  renderMapa();
  renderDashboard();
  renderExpedicao();

  alert(`Lote ${lote.nome} expedido (${removidos.length} volumes)`);
};

// ==================================
// RENDER EXPEDIÇÃO
// ==================================

window.renderExpedicao = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (state.historicoExpedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  state.historicoExpedidos.forEach(item => {
    const div = document.createElement('div');
    div.className = 'lote-card';

    div.innerHTML = `
      <strong>Lote:</strong> ${item.lote}<br>
      <strong>Quantidade:</strong> ${item.quantidade}<br>
      <strong>Data:</strong> ${item.data}
      <details>
        <summary>Detalhes</summary>
        ${item.detalhes.map(d => `
          <div class="historico-item">
            Área: ${d.area} | Rua: ${d.rua} | Pos: ${d.posicao}<br>
            RZ: ${d.rz || '-'} | Vol: ${d.volume || '-'}
          </div>
        `).join('')}
      </details>
    `;

    container.appendChild(div);
  });
};
