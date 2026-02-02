// ==================================
// DASHBOARD.JS — LOTES ATIVOS
// ==================================

window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote cadastrado</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const usado = lote.usados || 0;
    const total = lote.total || 0;
    const perc = total > 0 ? Math.round((usado / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>
      ${usado} / ${total}
      <div class="progress-bar">
        <div class="progress-fill" 
             style="width:${perc}%; background:${lote.cor}">
        </div>
      </div>

      <button onclick="alterarQuantidadeLote('${lote.id}')">
        Alterar Quantidade
      </button>

      <button class="danger" onclick="excluirLote('${lote.id}')">
        Excluir Lote
      </button>

      <button onclick="expedirLote('${lote.id}')">
        Expedir
      </button>
    `;

    dashboard.appendChild(card);
  });
};
