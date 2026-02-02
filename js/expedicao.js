// ========================================
// EXPEDICAO.JS
// Responsável apenas por:
// - Expedir lote
// - Registrar histórico
// - Renderizar área de expedição
// ========================================

// ----------------------------------------
// EXPEDIR LOTE
// ----------------------------------------
window.expedirLote = function (loteId) {
  const lote = state.lotes.find(l => l.id === loteId);
  if (!lote) {
    alert('Lote não encontrado');
    return;
  }

  const removidos = [];

  // percorre mapa
  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes = rua.posicoes.filter(pos => {
        //  comparação correta pelo NOME do lote
        if (pos.lote === lote.nome) {
          removidos.push({
            area: area.nome,
            rua: rua.nome,
            posicao: pos.id,
            rz: pos.rz || '',
            volume: pos.volume || ''
          });
          return false; // remove do mapa
        }
        return true;
      });
    });
  });

  if (removidos.length === 0) {
    alert('Nenhum gaylord encontrado para este lote');
    return;
  }

  // atualiza lote
  lote.expedidos += removidos.length;

  // registra histórico
  state.historicoExpedidos.push({
    id: crypto.randomUUID(),
    lote: lote.nome,
    quantidade: removidos.length,
    data: new Date().toLocaleString('pt-BR'),
    detalhes: removidos
  });

  saveState();

  // re-render geral
  renderMapa();
  renderDashboard();
  renderExpedicao();

  alert(`Lote "${lote.nome}" expedido (${removidos.length} volumes)`);
};

// ----------------------------------------
// RENDER EXPEDIÇÃO
// ----------------------------------------
window.renderExpedicao = function () {
  const container = document.getElementById('lotesExpedidos');
  if (!container) return;

  container.innerHTML = '';

  if (!state.historicoExpedidos || state.historicoExpedidos.length === 0) {
    container.innerHTML = '<p>Nenhum lote expedido.</p>';
    return;
  }

  state.historicoExpedidos.forEach(item => {
    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>Lote:</strong> ${item.lote}<br>
      <strong>Quantidade:</strong> ${item.quantidade}<br>
      <strong>Data:</strong> ${item.data}
      <details style="margin-top:6px;">
        <summary>Ver detalhes</summary>
        ${item.detalhes.map(d => `
          <div class="historico-item">
            Área: ${d.area} | Rua: ${d.rua} | Posição: ${d.posicao}<br>
            RZ: ${d.rz || '-'} | Volume: ${d.volume || '-'}
          </div>
        `).join('')}
      </details>
    `;

    container.appendChild(card);
  });
};
