// =======================================
// DASHBOARD.JS
// Controle correto de lotes ativos
// =======================================

window.totalExpedidoDoLote = function (nomeLote) {
  return state.historicoExpedidos
    .filter(e => e.lote === nomeLote)
    .reduce((acc, e) => acc + e.quantidadeExpedida, 0);
};

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
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  state.lotes.forEach(lote => {
    const expedido = totalExpedidoDoLote(lote.nome);
    const alocado = contarGaylordsDoLote(lote.nome);
    const total = lote.total;

    const percentual =
      total > 0 ? Math.round((expedido / total) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>
      Expedidos: ${expedido} / ${total}<br>
      Alocados: ${alocado}

      <div class="progress-bar">
        <div class="progress-fill"
             style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <div style="margin-top:6px">
        <button onclick="abrirModalExpedicao('${lote.nome}')">
          Expedir
        </button>
      </div>
    `;

    dashboard.appendChild(card);
  });
};
