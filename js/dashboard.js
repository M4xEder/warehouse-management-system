// =======================================
// DASHBOARD.JS — VISÃO COMPLETA DO LOTE
// =======================================

// ---------------------------------------
// CONTAR GAYLORDS ALOCADAS (MAPA = VERDADE)
// ---------------------------------------
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

// ---------------------------------------
// CONTAR GAYLORDS EXPEDIDAS (HISTÓRICO)
// ---------------------------------------
window.contarGaylordsExpedidas = function (nomeLote) {
  let total = 0;

  state.historicoExpedidos.forEach(exp => {
    if (exp.lote === nomeLote) {
      total += exp.quantidadeExpedida;
    }
  });

  return total;
};

// ---------------------------------------
// RENDER DASHBOARD
// ---------------------------------------
window.renderDashboard = function () {
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.innerHTML = '';

  if (!state.lotes || state.lotes.length === 0) {
    dashboard.innerHTML = '<p>Nenhum lote ativo</p>';
    return;
  }

  let exibiuAlgum = false;

  state.lotes.forEach(lote => {
    const alocadas = contarGaylordsDoLote(lote.nome);
    const expedidas = contarGaylordsExpedidas(lote.nome);
    const saldo = lote.total - alocadas - expedidas;

    // 🔒 LOTE FINALIZADO → NÃO MOSTRA COMO ATIVO
    if (saldo <= 0) return;

    exibiuAlgum = true;

    const percentual =
      lote.total > 0
        ? Math.round((alocadas / lote.total) * 100)
        : 0;

    const card = document.createElement('div');
    card.className = 'lote-card';

    card.innerHTML = `
      <strong>${lote.nome}</strong><br>

      <small>
        Total: <strong>${lote.total}</strong> |
        Alocadas: <strong>${alocadas}</strong> |
        Expedidas: <strong>${expedidas}</strong> |
        Saldo: <strong>${saldo}</strong>
      </small>

      <div class="progress-bar" style="margin-top:6px">
        <div class="progress-fill"
             style="width:${percentual}%; background:${lote.cor}">
        </div>
      </div>

      <div style="margin-top:8px">
        <button onclick="expedirLote('${lote.nome}')">
          Expedir
        </button>

        <button onclick="alterarQuantidadeLote('${lote.nome}')">
          Alterar quantidade
        </button>

        <button class="danger"
          onclick="excluirLote('${lote.nome}')">
          Excluir
        </button>
      </div>
    `;

    dashboard.appendChild(card);
  });

  if (!exibiuAlgum) {
    dashboard.innerHTML =
      '<p>Nenhum lote ativo (todos finalizados)</p>';
  }
};
