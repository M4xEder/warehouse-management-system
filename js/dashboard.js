// =======================================
// DASHBOARD.JS — GESTÃO E VISUALIZAÇÃO DE LOTES
// =======================================

window.contarGaylordsDoLote = function (nomeLote) {
  let total = 0;

  state.areas.forEach(area => {
    area.ruas.forEach(rua => {
      rua.posicoes.forEach(pos => {
        if (pos.lote === nomeLote) total++;
      });
    });
  });

  return total;
};

window.excluirLote = function (nomeLote) {
  const usados = contarGaylordsDoLote(nomeLote);
  if (usados > 0) {
    alert('Não é possível excluir. Existem gaylords alocadas.');
    return;
  }

  if (!confirm(`Excluir lote "${nomeLote}"?`)) return;

  state.lotes = state.lotes.filter(l => l.nome !== nomeLote);

  saveState();
  renderDashboard();
};

window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const usados = contarGaylordsDoLote(lote.nome);
    const perc = lote.total > 0 ? Math.round((usados / lote.total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>
      ${usados} / ${lote.total}

      <div class="progress-bar">
        <div class="progress-fill" style="width:${perc}%; background:${lote.cor}"></div>
      </div>

      <div style="margin-top:6px">
        <button onclick="expedirLote('${lote.nome}')">Expedir</button>
        <button onclick="excluirLote('${lote.nome}')" class="danger">Excluir</button>
      </div>
    `;

    dashboard.appendChild(card);
  });
};
